import { Response, Request } from 'express'

import UserService from '../services/UserService'
import { MyRequest } from '../types'
import CustomError from '../error'

class UserController {
  async create(req: MyRequest, res: Response) {
    try {
      const { user, token } = await UserService.create(req.body, req.files?.avatar)
      res.status(201).json({ user, token })
    } catch (e: any) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async login(req: Request, res: Response) {
    try {
      const token = await UserService.login(req.body)
      res.json({ token })
    } catch (e: any) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getAll(_: Request, res: Response) {
    try {
      const users = await UserService.getAll()
      return res.json(users)
    } catch (e: any) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const user = await UserService.getOne(Number(req.params.id))
      return res.json(user)
    } catch (e: any) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getUser(req: MyRequest, res: Response) {
    try {
      const user = await UserService.getUser(req.user)
      return res.json(user)
    } catch (e: any) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async update(req: MyRequest, res: Response) {
    try {
      const updatedUser = await UserService.update(req.body, req.user, req.files && req.files.avatar)
      return res.json(updatedUser)
    } catch (e: any) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async delete(req: MyRequest, res: Response) {
    try {
      const deletedUser = await UserService.delete(req.user)
      return res.json(deletedUser)
    } catch (e: any) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
}

export default new UserController()
