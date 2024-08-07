import ArticleService from "../services/ArticleService.js"

class ArticleController {
  async create(req, res) {
    try {
      const user = await ArticleService.create(req.body, req.user)
      res.json(user)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async getAll(req, res) {
    try {
      const users = await ArticleService.getAll(req.body, req.user)
      return res.json(users)
    } catch (e) {
      res.status(500).json(e)
    }
  }

  async getOne(req, res) {
    try {
      const user = await ArticleService.getOne(req.params.id, req.user)
      return res.json(user)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async update(req, res) {
    try {
      const updatedUser = await ArticleService.update(req.body, req.user, req.params.id)
      return res.json(updatedUser)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async favorite(req, res) {
    try {
      const favoriteArticle = await ArticleService.favorite(req.params.id ,req.user)
      return res.json(favoriteArticle)
    } catch (e:any) {
      res.status(500).json(e.message)
    }
  }

  async unfavorite(req, res) {
    try {
      const unfavoriteArticle = await ArticleService.unfavorite(req.params.id, req.user)
      return res.json(unfavoriteArticle)
    } catch (e:any) {
      res.status(500).json(e.message)
    }
  }

  async delete(req, res) {
    try {
      const deletedUser = await ArticleService.delete(req.params.id, req.user)
      return res.json(deletedUser)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }
}

export default new ArticleController()