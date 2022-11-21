import { Router } from 'express'
import { protect } from '../controllers/userControler'
import { checkBalance } from '../controllers/balanceController'

const router: Router = Router()

router.use(protect)
router.get('/check', checkBalance)

export default router
