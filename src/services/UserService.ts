import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

import db from '../db.js'
import FileService from './FileService.js'

const generateAccessToken = (id) => {
  const payload = {id}
  const secret = String(process.env.SECRET)
  return jwt.sign(payload, secret, {expiresIn: '24h'})
}

const validateUsers = (username: string, password: string, email: string) => {
  if (!username) {
    throw new Error('отсутствует имя пользователя')
  }
  if (username.length > 20) {
    throw new Error('имя пользователя больше 20 символов')
  }
  if (username.length < 3) {
    throw new Error('имя пользователя меньше 3 символов')
  }

  if (!password) {
    throw new Error('отсутствует пароль')
  }
  if (password.length > 20) {
    throw new Error('пароль больше 20 символов')
  }
  if (password.length < 6) {
    throw new Error('пароль меньше 6 символов')
  }

  if (!email) {
    throw new Error('отсутствует email')
  }
  if (email.length > 40) {
    throw new Error('email больше 40 символов')
  }
  if (!/^[a-zA-Z0-9_.]+@[a-zA-Z0-9]+\.[a-zA-Z0-9-.]+$/.test(email)) {
    throw new Error('некоректный email')
  }
}

class UserService {
  async create(user, avatar?) {
    const { username, password, email } = user
    const hashPassword = bcryptjs.hashSync(password, 5)
    validateUsers(username, password, email)

    if (!avatar) {
      const createdUser = await db.query(`INSERT INTO users (username, password, email) values ($1, $2, $3) RETURNING *`, [username, hashPassword, email])
      const token = generateAccessToken(createdUser.rows[0].id)
      return {user: createdUser.rows[0], token}
    }

    if (avatar.mimetype.split('/')[0] !== 'image') {
      throw new Error('неверный тип изображения')
    }

    const fileName = await FileService.saveImage(avatar)

    const createdUser = await db.query(`INSERT INTO users (username, password, email, avatar) values ($1, $2, $3, $4) RETURNING *`, [username, hashPassword, email, fileName])
    const token = generateAccessToken(createdUser.rows[0].id)
    return {user: createdUser.rows[0], token}
  }

  async login({email, password}) {
    const user = await db.query(`SELECT * FROM users where email = $1`, [email])
    if (!user.rows[0]) {
      throw new Error('пользователь с таким email не найден')
    }
    const validPassword = bcryptjs.compareSync(password, user.rows[0].password)
    if (!validPassword) {
      throw new Error('неверный пароль')
    }
    const token = generateAccessToken(user.rows[0].id)
    return token
  }

  async getAll() {
    const users = await db.query(`SELECT * FROM users`)
    return users.rows
  }

  async getOne(id) {
    if (!id) {
      throw new Error('не указан id')
    }
    const user = await db.query(`SELECT * FROM users where id = $1`, [id])
    return user.rows[0]
  }

  async getUser(tokenData) {
    const id = tokenData.id
    const user = await db.query(`SELECT * FROM users where id = $1`, [id])
    return user.rows[0]
  }

  async update(user, tokenData, avatar?) {
    const { username, password, email } = user
    const id = tokenData.id
    validateUsers(username, password, email)
    
    const prevUser = await db.query(`SELECT * FROM users where id = $1`, [id])

    let hashPassword
    if (password) hashPassword = bcryptjs.hashSync(password, 5)

    if (!avatar) {
      const updatedUser = await db.query(`UPDATE users set username = $1, password = $2, email = $3 where id = $4 RETURNING *`, [!username ? prevUser.rows[0].username : username, !hashPassword ? prevUser.rows[0].password : hashPassword, !email ? prevUser.rows[0].email : email, id])
      return updatedUser.rows[0]
    }

    if (avatar.mimetype.split('/')[0] !== 'image') {
      throw new Error('неверный тип изображения')
    }

    if (prevUser.rows[0].avatar) FileService.deleteFile(prevUser.rows[0].avatar, 'avatars')
    const fileName = await FileService.saveImage(avatar)

    const updatedUser = await db.query(`UPDATE users set username = $1, password = $2, email = $3, avatar = $4 where id = $5 RETURNING *`, [!username ? prevUser.rows[0].username : username, !hashPassword ? prevUser.rows[0].password : hashPassword, !email ? prevUser.rows[0].email : email, fileName, id])
    return updatedUser.rows[0]
  }

  async delete({id}) {
    const deletedUser = await db.query(`DELETE FROM users where id = $1 RETURNING *`, [id])
    if (deletedUser.rows[0].avatar) FileService.deleteFile(deletedUser.rows[0].avatar, 'avatars')
    return deletedUser.rows[0]
  }
}

export default new UserService()