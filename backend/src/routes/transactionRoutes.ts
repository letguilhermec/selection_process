import { Router } from 'express'
import { protect } from '../controllers/userControler'
import { checkQuery, viewTransactions, checkAccAndBalance, performTransaction } from '../controllers/transactionController'

const router: Router = Router()

router.use(protect)
router.get('/check', checkQuery, viewTransactions)
router.post('/exchange', checkAccAndBalance, performTransaction)

export default router
