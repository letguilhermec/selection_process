import express, { Application, NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import { serialize } from 'cookie'
import userRouter from './routes/userRoutes'
import balanceRouter from './routes/balanceRoutes'
import transactionRouter from './routes/transactionRoutes'
import errorHandler from './controllers/errorController'
import AppError from './utils/appError'
import session from 'express-session'

const corsOptions = {
  origin: ['http://127.0.0.1:3000', 'http://127.0.0.1:3000/account', 'http://127.0.0.1:3000/account/signup', 'http://127.0.0.1:3000/account/signin'],
  credentials: true
}

const app: Application = express()

app.enable('trust proxy')

app.use(cors(corsOptions))

app.options('*', cors(corsOptions))

app.use(session({
  secret: 'tesa09825eafhgjksdlk',
  name: 'sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    domain: 'http://127.0.0.1'
  },
}))

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN! as unknown as number) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false
  }
  res.setHeader('Set-Cookie', serialize('jwt', 'thirdtest', cookieOptions))
  res.json('req')
})

app.get('/get', (req: Request, res: Response) => {
  console.log(req.cookies)
  res.status(200)
})

app.use('/api/v1/users', userRouter)
app.use('/api/v1/balance', balanceRouter)
app.use('/api/v1/transactions', transactionRouter)

app.use(errorHandler)

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Este servidor não tem um endpoint ${req.originalUrl}`, 405))
})


export default app
