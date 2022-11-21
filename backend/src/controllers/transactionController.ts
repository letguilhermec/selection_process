import { Request, Response, NextFunction } from 'express'
import pool from '../db'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { checkDecimals } from '../utils/verifyInput'

export const checkQuery = (req: Request, _res: Response, next: NextFunction) => {
  let { start, end, cashout, cashin } = req.query
  let dateRegex = new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
  if (!start) {
    start = undefined
  }
  if (start !== undefined && !dateRegex.test(start as string)) {
    return next(new AppError('Parâmetro inválido -> start. Por favor, informe a data seguindo o seguinte padrão: AAAA-MM-DD.', 401))
  }

  if (!end) {
    end = 'NOW()'
  }
  if (end !== 'NOW()' && !dateRegex.test(end as string)) {
    return next(new AppError('Parâmetro inválido -> end. Por favor, informe a data seguindo o seguinte padrão: AAAA-MM-DD.', 401))
  }

  if (!cashout) {
    cashout = undefined
  }

  if (!cashin) {
    cashin = undefined
  }

  req.start = start as string | undefined
  req.end = end as string | undefined
  req.cashout = cashout as string | undefined
  req.cashin = cashin as string | undefined

  return next()
}

export const viewTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let cashInOutConfig = 't.creditedaccountid = $1 OR t.debitedaccountid = $1'
  let dateConfig = ''
  let values: string[] = []

  if (req.start || req.cashout || req.cashin || req.end !== 'NOW()') {
    if ((req.cashin && req.cashout) || (!req.cashin && !req.cashout)) {
      cashInOutConfig = 't.creditedaccountid = $1 OR t.debitedaccountid = $1'
    } else if (req.cashin) {
      cashInOutConfig = 't.creditedaccountid = $1'
    } else {
      cashInOutConfig = 't.debitedaccountid = $1'
    }

    if (req.start) {
      dateConfig = 'AND createdat BETWEEN $2 AND $3'
      if (req.end == 'NOW()') {
        values = [req.user!.accountid, req.start, req.end]
      } else {
        values = [req.user!.accountid, req.start, `${req.end} 23:59:59`]
      }
    } else if (!req.start && req.end !== 'NOW()') {
      dateConfig = 'AND createdat < $2'
      values = [req.user!.accountid, `${req.end} 23:59:59`]
    } else {
      values = [req.user!.accountid]
    }

    let masterQuery = `SELECT d as remetente, c as destinatário, value as valor, createdat as horário FROM transactions as t, LATERAL (SELECT username FROM users as u WHERE t.debitedaccountid = u.accountid) as d, LATERAL (SELECT username FROM users as u WHERE t.creditedaccountid = u.accountid) as c WHERE (${cashInOutConfig}) ${dateConfig}`
    let transactions = await pool.query(masterQuery, values)

    if (!transactions || transactions.rowCount == 0) {
      return res.status(200).json({
        status: 'Sucesso',
        data: {
          transactions: []
        }
      })
    }

    return res.status(200).json({
      status: 'Sucesso',
      data: {
        transactions: transactions.rows
      }
    })
  } else {
    const transactions = await pool.query('SELECT d as remetente, c as destinatário, value as valor, createdat as horário FROM transactions as t, LATERAL (SELECT username FROM users as u WHERE t.debitedaccountid = u.accountid) as d, LATERAL (SELECT username FROM users as u WHERE t.creditedaccountid = u.accountid) as c WHERE t.creditedaccountid = $1 OR t.debitedaccountid = $1;', [req.user!.accountid])

    if (!(transactions.rows.length > 0)) {
      return res.status(200).json({
        status: 'Sucesso',
        data: {
          transactions: []
        }
      })
    }

    return res.status(200).json({
      status: 'Sucesso',
      data: {
        transactions: transactions.rows,
      }
    })
  }
})

const checkIfEnoughBalance = async (accid: string, desired: number): Promise<boolean> => {
  const balance = await pool.query('SELECT balance::numeric FROM accounts WHERE id = $1', [accid])

  return (Number(balance.rows[0].balance) * 100 > Number(desired * 100))
}

export const checkAccAndBalance = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const { cashInUser, amount } = req.body

  // Every username is UNIQUE. Checking them against each other should be enought to discard attempted transactions to self.
  if (req.user!.username === cashInUser.toUpperCase()) {
    return next(new AppError('Não é possível realizar uma transferência para a própria conta.', 401))
  }

  if (isNaN(amount) || checkDecimals(amount) > 2) {
    return next(new AppError('O valor informado é inválido. O valor deve conter, no máximo, duas casas decimais e o valor inteiro deve ser separado dos centavos por um ponto. Por favor, tente novamente', 401))
  }

  if (!(await checkIfEnoughBalance(req.user!.accountid, amount))) {
    return next(new AppError('Não há saldo o sufiente para esta transação.', 401))
  }

  let cashInUserAccId = await pool.query('SELECT accountid FROM users WHERE username = $1', [cashInUser.toUpperCase()])

  if (!cashInUserAccId) {
    return next(new AppError('Destinatário inválido. Não encontramos o usuário em nosso banco de dados.', 401))
  }

  req.cashInUserId = cashInUserAccId.rows[0].accountid
  req.amount = amount
  next()
})

export const performTransaction = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  ; (async () => {
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      const reSub = await client.query('UPDATE accounts SET balance = balance::numeric - $1 WHERE id = $2', [req.amount, req.user!.accountid])
      const resAdd = await client.query('UPDATE accounts SET balance = balance::numeric + $1 WHERE id = $2', [req.amount, req.cashInUserId])
      const resAddTransactions = await client.query('INSERT INTO transactions (debitedaccountid, creditedaccountid, value) VALUES ($1, $2, $3)', [req.user!.accountid, req.cashInUserId, req.amount])
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
    } finally {
      client.release()
    }
  })().catch(_err => next(new AppError('Não foi possível realizar a transferência. Por favor, tente novamente.', 500)))

  res.status(201).json({
    status: 'success',
  })
})
