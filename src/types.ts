import { Request } from 'express'
import { UploadedFile } from 'express-fileupload'
import { JwtPayload } from 'jsonwebtoken'

export type User = {
  id: number
  username: string
  password: string
  email: string
  avatar: string | null
}

export type Article = {
  title: string
  description: string
  body: string
  tag_list: number[]
  favorite_list: number[]
  update_time: string
  user_id: number
  id: number
}

export type AuthToken = JwtPayload & {
  id: number
}

export interface MyRequest extends Request {
  user?: AuthToken
  files?: {
    avatar?: UploadedFile
  }
}
