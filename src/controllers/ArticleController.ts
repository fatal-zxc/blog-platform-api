import { Response } from 'express'

import ArticleService from '../services/ArticleService.js'
import { MyRequest } from '../types.js'

class ArticleController {
  async create(req: MyRequest, res: Response) {
    try {
      const article = await ArticleService.create(req.body, req.user)
      res.json(article)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async getAll(req: MyRequest, res: Response) {
    try {
      const users = await ArticleService.getAll(req.body, req.user)
      return res.json(users)
    } catch (e: any) {
      res.status(500).json(e)
    }
  }

  async getOne(req: MyRequest, res: Response) {
    try {
      const user = await ArticleService.getOne(Number(req.params.id), req.user)
      return res.json(user)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async update(req: MyRequest, res: Response) {
    try {
      const updatedUser = await ArticleService.update(req.body, Number(req.params.id), req.user)
      return res.json(updatedUser)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async favorite(req: MyRequest, res: Response) {
    try {
      const favoriteArticle = await ArticleService.favorite(Number(req.params.id), req.user)
      return res.json(favoriteArticle)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async unfavorite(req: MyRequest, res: Response) {
    try {
      const unfavoriteArticle = await ArticleService.unfavorite(Number(req.params.id), req.user)
      return res.json(unfavoriteArticle)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async delete(req: MyRequest, res: Response) {
    try {
      const deletedUser = await ArticleService.delete(Number(req.params.id), req.user)
      return res.json(deletedUser)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }
}

export default new ArticleController()
