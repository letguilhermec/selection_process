import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import promisifiedJwt from 'jwt-promisify'
import { Request, Response, NextFunction } from 'express'
import pool from '../db'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { checkPassword, compare } from '../utils/verifyInput'
import { UserSchema, NewUserSchema } from '../models/interfaces'

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const createAndSendToken = (user: UserSchema, statusCode: number, _req: Request, res: Response) => {
  const token = signToken(user.id)

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN! as unknown as number) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false
  }
  res.cookie('jwt', token, cookieOptions)
  user.password = undefined
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    },
  })
}

export const verifyUsernameAndPassword = (req: Request, _res: Response, next: NextFunction) => {
  const { username, password } = req.body

  if (!username || !password) {
    return next(new AppError('Nome de usuário e senha são obrigatórios.', 400))
  }

  if (username.length < 3) {
    return next(new AppError('O username deve conter, pelo menos, 3 caracteres.', 400))
  }

  if (!checkPassword(password)) {
    return next(new AppError('A senha deve conter mais de oito caracteres e, pelo menos, um número e uma letra maiúscula.', 400))
  }

  req.username = username.toUpperCase()
  req.pass = password!
  return next()
}

export const createUser = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  let newPass = await bcrypt.hash(req.pass!, 12)
  let newUser = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [req.username, newPass])

  if (!newUser) {
    return next(new AppError('Erro. Por favor, tente novamente', 500))
  }

  req.user = newUser.rows[0].id
  return next()
})

export const createAccount = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  let newAccount = await pool.query('INSERT INTO accounts (balance) VALUES (100.00) RETURNING id, balance')
  let updatedUser = await pool.query('UPDATE users SET accountid = $1 WHERE id = $2 RETURNING id, username', [newAccount.rows[0].id, req.user])

  let newUser: NewUserSchema = {
    id: updatedUser.rows[0].id,
    username: updatedUser.rows[0].username,
    accountid: newAccount.rows[0].id,
    balance: newAccount.rows[0].balance
  }

  createAndSendToken(newUser, 201, req, res)
})


export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body

  if (!username || !password) {
    return next(new AppError('Por favor, insira o nome do usuário e a senha.', 401))
  }

  const user = await pool.query('SELECT * FROM users WHERE username = $1', [username.toUpperCase()])

  if (!(user.rows.length > 0) || !(await compare(password, user.rows[0].password))) {
    return next(new AppError('Usuário ou senha inválidos.', 401))
  }

  createAndSendToken(user.rows[0], 200, req, res)
})

export const logout = (_req: Request, res: Response) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  res.status(200).json({
    status: 'success'
  })
}

export const protect = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  let token
  if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(new AppError('Você não está logado. Por favor, faça o login novamente.', 401))
  }

  const payload = await promisifiedJwt.verify(token, process.env.JWT_SECRET as unknown as string)

  const user = await pool.query('SELECT username, accountid FROM users WHERE id = $1', [payload.id])

  if (!(user.rows.length > 0)) {
    return next(new AppError('O usuário não está mais cadastrado.', 401))
  }

  req.user = user.rows[0]
  next()
})

export const verify = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies.jwt) {
    const payload = await promisifiedJwt.verify(req.cookies.jwt, process.env.JWT_SECRET as unknown as string)

    const user = await pool.query('SELECT id, username, accountid FROM users WHERE id = $1', [payload.id])

    if (!(user.rows.length > 0)) {
      return res.status(204).json({
        status: 'fail',
        message: 'Usuário não está logado.'
      })
    }

    const { id, username, accountid } = user.rows[0]

    return res.status(200).json({
      id,
      username,
      accid: accountid
    })

  } else {
    return res.status(204).json({
      status: 'fail',
      message: 'Usuário não está logado.'
    })
  }
})
