import { Router } from 'express'

import ArticleController from '../controllers/ArticleController'
import requareAuthMiddleware from '../middlewares/requareAuthMiddleware'
import authMiddleware from '../middlewares/authMiddleware'
import { MyRequest } from '../types'

const articleRouter = Router()

articleRouter.get(
  '/articles/:id',
  (req, res, next) => authMiddleware(req as MyRequest, res, next),
  (req, res) => ArticleController.getOne(req as MyRequest, res)
)
articleRouter.get(
  '/articles',
  (req, res, next) => authMiddleware(req as MyRequest, res, next),
  (req, res) => ArticleController.getAll(req as MyRequest, res)
)
articleRouter.post(
  '/articles',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => ArticleController.create(req as MyRequest, res)
)
articleRouter.post(
  '/articles/:id/favorite',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => ArticleController.favorite(req as MyRequest, res)
)
articleRouter.put(
  '/articles/:id',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => ArticleController.update(req as MyRequest, res)
)
articleRouter.delete(
  '/articles/:id/favorite',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => ArticleController.unfavorite(req as MyRequest, res)
)
articleRouter.delete(
  '/articles/:id',
  (req, res, next) => requareAuthMiddleware(req as MyRequest, res, next),
  (req, res) => ArticleController.delete(req as MyRequest, res)
)

export default articleRouter
