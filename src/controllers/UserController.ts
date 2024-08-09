import { Response, Request } from 'express'

import UserService from '../services/UserService.js'
import { MyRequest } from '../types'

class UserController {
  async create(req: MyRequest, res: Response) {
    try {
      const { user, token } = await UserService.create(req.body, req.files?.avatar)
      res.json({ user, token })
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async login(req: Request, res: Response) {
    try {
      const token = await UserService.login(req.body)
      res.json({ token })
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async getAll(_: Request, res: Response) {
    try {
      const users = await UserService.getAll()
      return res.json(users)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const user = await UserService.getOne(Number(req.params.id))
      return res.json(user)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async getUser(req: MyRequest, res: Response) {
    try {
      const user = await UserService.getUser(req.user)
      return res.json(user)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async update(req: MyRequest, res: Response) {
    try {
      const updatedUser = await UserService.update(req.body, req.user, req.files && req.files.avatar)
      return res.json(updatedUser)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }

  async delete(req: MyRequest, res: Response) {
    try {
      const deletedUser = await UserService.delete(req.user)
      return res.json(deletedUser)
    } catch (e: any) {
      res.status(500).json(e.message)
    }
  }
}

export default new UserController()
