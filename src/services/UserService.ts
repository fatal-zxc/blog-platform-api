import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { UploadedFile } from 'express-fileupload'

dotenv.config()

import db from '../db'
import FileService from './FileService'
import { User, AuthToken } from '../types'
import CustomError from '../error'

const generateAccessToken = (id: number) => {
  const payload = { id }
  const secret = String(process.env.SECRET)
  return jwt.sign(payload, secret, { expiresIn: '24h' })
}

export const validateUsersData = (username: string, password: string, email: string, exceptions?: string[]): void => {
  if (!exceptions?.includes('username')) {
    if (!username) {
      throw new CustomError('отсутствует имя пользователя', 400)
    }
    if (username.length > 20) {
      throw new CustomError('имя пользователя больше 20 символов', 400)
    }
    if (username.length < 3) {
      throw new CustomError('имя пользователя меньше 3 символов', 400)
    }
  }

  if (!exceptions?.includes('password')) {
    if (!password) {
      throw new CustomError('отсутствует пароль', 400)
    }
    if (password.length > 20) {
      throw new CustomError('пароль больше 20 символов', 400)
    }
    if (password.length < 6) {
      throw new CustomError('пароль меньше 6 символов', 400)
    }
  }

  if (!exceptions?.includes('email')) {
    if (!email) {
      throw new CustomError('отсутствует email', 400)
    }
    if (email.length > 40) {
      throw new CustomError('email больше 40 символов', 400)
    }
    if (!/^[a-zA-Z0-9_.]+@[a-zA-Z0-9]+\.[a-zA-Z0-9-.]+$/.test(email)) {
      throw new CustomError('некоректный email', 400)
    }
  }
}

class UserService {
  async create(user: User, avatar?: UploadedFile) {
    const { username, password, email } = user
    validateUsersData(username, password, email)
    const hashPassword = bcryptjs.hashSync(password, 5)

    if (!avatar) {
      const createdUser: { rows: User[] } = await db.query(
        `INSERT INTO users (username, password, email) values ($1, $2, $3) RETURNING *`,
        [username, hashPassword, email]
      )
      const token = generateAccessToken(createdUser.rows[0].id)
      return { user: createdUser.rows[0], token }
    }

    if (avatar.mimetype.split('/')[0] !== 'image') {
      throw new CustomError('неверный тип изображения', 400)
    }

    const fileName = await FileService.saveImage(avatar)

    const createdUser: { rows: User[] } = await db.query(
      `INSERT INTO users (username, password, email, avatar) values ($1, $2, $3, $4) RETURNING *`,
      [username, hashPassword, email, fileName]
    )
    const token = generateAccessToken(createdUser.rows[0].id)
    return { user: createdUser.rows[0], token }
  }

  async login({ email, password }: User) {
    validateUsersData('', password, email, ['username'])
    const user: { rows: User[] } = await db.query(`SELECT * FROM users where email = $1`, [email])
    if (!user.rows[0]) {
      throw new CustomError('пользователь с таким email не найден', 400)
    }
    const validPassword = bcryptjs.compareSync(password, user.rows[0].password)
    if (!validPassword) {
      throw new CustomError('неверный пароль', 400)
    }
    const token = generateAccessToken(user.rows[0].id)
    return token
  }

  async getAll() {
    const users: { rows: User[] } = await db.query(`SELECT * FROM users`)
    return users.rows
  }

  async getOne(id: number) {
    if (!id) {
      throw new CustomError('не указан id', 400)
    }
    const user: { rows: User[] } = await db.query(`SELECT * FROM users where id = $1`, [id])
    return user.rows[0]
  }

  async getUser(tokenData?: AuthToken) {
    const id = tokenData?.id
    const user: { rows: User[] } = await db.query(`SELECT * FROM users where id = $1`, [id])
    return user.rows[0]
  }

  async update(user: User, tokenData?: AuthToken, avatar?: UploadedFile) {
    const { username, password, email } = user
    const id = tokenData?.id
    validateUsersData(username, password, email)

    const prevUser: { rows: User[] } = await db.query(`SELECT * FROM users where id = $1`, [id])

    let hashPassword: string = ''
    if (password) hashPassword = bcryptjs.hashSync(password, 5)

    if (!avatar) {
      const updatedUser: { rows: User[] } = await db.query(
        `UPDATE users set username = $1, password = $2, email = $3 where id = $4 RETURNING *`,
        [
          !username ? prevUser.rows[0].username : username,
          !hashPassword ? prevUser.rows[0].password : hashPassword,
          !email ? prevUser.rows[0].email : email,
          id,
        ]
      )
      return updatedUser.rows[0]
    }

    if (avatar.mimetype.split('/')[0] !== 'image') {
      throw new CustomError('неверный тип изображения', 400)
    }

    if (prevUser.rows[0].avatar) FileService.deleteFile(prevUser.rows[0].avatar, 'avatars')
    const fileName = await FileService.saveImage(avatar)

    const updatedUser: { rows: User[] } = await db.query(
      `UPDATE users set username = $1, password = $2, email = $3, avatar = $4 where id = $5 RETURNING *`,
      [
        !username ? prevUser.rows[0].username : username,
        !hashPassword ? prevUser.rows[0].password : hashPassword,
        !email ? prevUser.rows[0].email : email,
        fileName,
        id,
      ]
    )
    return updatedUser.rows[0]
  }

  async delete(tokenData?: AuthToken) {
    const deletedUser: { rows: User[] } = await db.query(`DELETE FROM users where id = $1 RETURNING *`, [tokenData?.id])
    if (deletedUser.rows[0].avatar) await FileService.deleteFile(deletedUser.rows[0].avatar, 'avatars')
    return deletedUser.rows[0]
  }
}

export default new UserService()
