import { Request, Response, NextFunction } from 'express'
import catchAsync from '../utils/catchAsync'
import pool from '../db'


export const checkBalance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const balance = await pool.query('SELECT balance FROM accounts WHERE id = $1', [req.user!.accountid])

  res.status(200).json({
    status: 'success',
    data: {
      balance: balance.rows[0].balance
    }
  })
})
