import { NextFunction, Request, Response } from 'express'
import { InformationalError } from '../models/interfaces'
import AppError from '../utils/appError'

const devError = (err: AppError, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  } else {
    res.status(err.statusCode).json({
      title: 'Algo deu errado!',
      message: err.message
    })
  }
}

const prodError = (err: AppError, req: Request, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    console.error('ERRO', err)
    res.status(500).json({
      status: 'error',
      message: 'something went wrong!'
    })
  }
}

const handleJWTError = (err: InformationalError) =>
  new AppError('Token inválido. Por favor, faça o login novamente.', 401)


const handleJWTExpired = (err: InformationalError) =>
  new AppError('Seu token expirou. Por favor, faça o login novamente.', 401)


const handleExistingUser = (err: InformationalError) =>
  new AppError('Já existe um usuário com este nome. Por favor, tente novamente.', 401)


const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    devError(err, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    let newErr = { ...err }
    newErr.message = err.message
    if (err.name === 'JsonWebTokenError') newErr = handleJWTError(newErr)
    if (err.name === 'TokenExpiredError') newErr = handleJWTExpired(newErr)
    if (err.constraint === 'users_username_key') newErr = handleExistingUser(newErr)
    prodError(newErr, req, res)
  }
}

export default errorHandler
