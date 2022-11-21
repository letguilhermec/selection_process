import app from './app'
import dotenv from 'dotenv'
import AppError from './utils/appError'

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

dotenv.config({ path: './config.env' })

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))

process.on('unhandledRejection', (err: AppError) => {
  console.log('UNHANDLED REJECTION! Shutting down...')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})


process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED! Shutting down...')
  server.close(() => {
    console.log('Process terminated.')
  })
})
