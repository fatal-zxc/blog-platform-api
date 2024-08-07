import { Router } from 'express'

import ArticleController from '../controllers/ArticleController.js'
import requareAuthMiddleware from '../middlewares/requareAuthMiddleware.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const articleRouter = Router()

articleRouter.get('/article/:id', authMiddleware, ArticleController.getOne)
articleRouter.get('/articles', authMiddleware, ArticleController.getAll)
articleRouter.post('/articles', requareAuthMiddleware, ArticleController.create)
articleRouter.post('/articles/:id/favorite', requareAuthMiddleware, ArticleController.favorite)
articleRouter.put('/articles/:id', requareAuthMiddleware, ArticleController.update)
articleRouter.delete('/articles/:id/favorite', requareAuthMiddleware, ArticleController.unfavorite)
articleRouter.delete('/articles/:id', requareAuthMiddleware, ArticleController.delete)

export default articleRouter
