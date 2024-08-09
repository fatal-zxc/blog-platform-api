import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { NextFunction, Response } from 'express'

import { MyRequest } from '../types'

dotenv.config()

export default function (req: MyRequest, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    next()
  }

  try {
    if (!req.headers.authorization) {
      return res.status(403).json({ message: 'пользователь не авторизован' })
    }
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      return res.status(403).json({ message: 'пользователь не авторизован' })
    }
    const secret = String(process.env.SECRET)
    const decodedToken = jwt.verify(token, secret)
    if (typeof decodedToken === 'string') return res.status(403).json({ message: 'пользователь не авторизован' })
    if (!decodedToken.id) return res.status(403).json({ message: 'пользователь не авторизован' })
    req.user = { id: decodedToken.id }
    next()
  } catch (e) {
    console.log(e)
    return res.status(403).json({ message: 'пользователь не авторизован' })
  }
}
