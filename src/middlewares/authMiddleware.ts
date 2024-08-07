import jwt from "jsonwebtoken"
import dotenv from 'dotenv'

dotenv.config()

export default function(req, _, next) {
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
    req.user = decodedToken
    next()
  } catch (e) {
    console.log(e)
    next()
  }
}