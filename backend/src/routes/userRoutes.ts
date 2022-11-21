import { Router } from 'express'
import { verifyUsernameAndPassword, createUser, createAccount, login, logout, verify } from '../controllers/userControler'

const router: Router = Router()

router.post('/signup', verifyUsernameAndPassword, createUser, createAccount)
router.post('/signin', login)
router.get('/signout', logout)
router.get('/verify', verify)

export default router
