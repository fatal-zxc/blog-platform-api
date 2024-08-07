import { Router } from 'express'

import UserController from '../controllers/UserController.js'
import requareAuthMiddleware from '../middlewares/requareAuthMiddleware.js'

const userRouter = Router()

userRouter.get('/user/:id', UserController.getOne)
userRouter.get('/user', requareAuthMiddleware, UserController.getUser)
userRouter.get('/users', UserController.getAll)
userRouter.post('/user', UserController.create)
userRouter.post('/users/login', UserController.login)
userRouter.put('/user', requareAuthMiddleware, UserController.update)
userRouter.delete('/user', requareAuthMiddleware, UserController.delete)

export default userRouter
