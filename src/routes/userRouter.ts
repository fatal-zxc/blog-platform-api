import { Router } from 'express'

import UserController from '../controllers/UserController.js'
import requareAuthMiddleware from '../middlewares/requareAuthMiddleware.js'
import { MyRequest } from '../types.js'

const userRouter = Router()

userRouter.get('/user/:id', UserController.getOne)
userRouter.get(
  '/user',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => UserController.getUser(req as MyRequest, res)
)
userRouter.get('/users', UserController.getAll)
userRouter.post('/user', (req, res) => UserController.create(req as MyRequest, res))
userRouter.post('/users/login', UserController.login)
userRouter.put(
  '/user',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => UserController.update(req as MyRequest, res)
)
userRouter.delete(
  '/user',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => UserController.delete(req as MyRequest, res)
)

export default userRouter
