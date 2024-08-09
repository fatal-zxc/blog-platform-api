import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { NextFunction, Response } from 'express'

import { MyRequest } from '../types'

dotenv.config()

export default function (req: MyRequest, _: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    next()
  }

  try {
    if (!req.headers.authorization) {
      return next()
    }
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      next()
    }
    const secret = String(process.env.SECRET)
    const decodedToken = jwt.verify(token, secret)
    if (typeof decodedToken === 'string') return next()
    req.user = { id: decodedToken.id }
    next()
  } catch (e) {
    console.log(e)
    next()
  }
}
