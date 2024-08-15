import { Router } from 'express'

import UserController from '../controllers/UserController'
import requareAuthMiddleware from '../middlewares/requareAuthMiddleware'
import { MyRequest } from '../types'

const userRouter = Router()

userRouter.get('/users/:id', UserController.getOne)
userRouter.get(
  '/user',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => UserController.getUser(req as MyRequest, res)
)
userRouter.get('/users', UserController.getAll)
userRouter.post('/users', (req, res) => UserController.create(req as MyRequest, res))
userRouter.post('/users/login', UserController.login)
userRouter.put(
  '/users',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => UserController.update(req as MyRequest, res)
)
userRouter.delete(
  '/users',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => UserController.delete(req as MyRequest, res)
)

export default userRouter
