import { formatISO } from 'date-fns'

import db from '../db.js'
import FileService from './FileService.js'
import { Article, AuthToken, User } from '../types'

const validateArticle = (title: string, body: string, description: string): void => {
  if (!title) {
    throw new Error('отсутствует заголовок')
  }
  if (title.length > 40) {
    throw new Error('заголовок больше 40 символов')
  }

  if (!body) {
    throw new Error('отсутствует тело')
  }

  if (!description) {
    throw new Error('отсутствует описание')
  }
  if (description.length > 60) {
    throw new Error('описание больше 60 символов')
  }
}

class ArticleService {
  async create(article: Article, tokenData?: AuthToken) {
    const user_id = tokenData?.id
    const { title, description, body, tag_list } = article
    validateArticle(title, body, description)

    const fileName = FileService.saveMD(body)
    const time = formatISO(new Date(), { format: 'basic' })

    const createdArticle: { rows: Article[] } = await db.query(
      `INSERT INTO articles (title, description, body, tag_list, favorite_list, update_time, user_id) values ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, fileName, tag_list, [], time, user_id]
    )
    return createdArticle.rows[0]
  }

  async getAll(body: { offset?: number; limit?: number }, tokenData?: AuthToken) {
    const { offset, limit } = body
    let authUserId: number = 0
    if (tokenData?.id) authUserId = tokenData.id

    let articles: { rows: Article[] } = await db.query(`SELECT * FROM articles`)
    const articlesCount = articles.rows.length
    if (offset) {
      articles.rows = articles.rows.slice(offset)
    }
    if (limit) {
      articles.rows = articles.rows.slice(0, limit)
    }

    const articlesPlusUsers = await Promise.all(
      articles.rows.map(async ({ user_id, favorite_list, ...articleData }) => {
        const favorited: boolean = favorite_list.includes(authUserId)
        const favoritesCount: number = favorite_list.length
        const userData: { rows: User[] } = await db.query(`SELECT * FROM users where id = $1`, [user_id])
        return { ...articleData, favorited, favoritesCount, author: userData.rows[0] }
      })
    )
    articlesPlusUsers.sort((a, b) => b.id - a.id)

    return { articles: articlesPlusUsers, articlesCount }
  }

  async getOne(id: number, tokenData?: AuthToken) {
    if (!id) {
      throw new Error('не указан id')
    }
    let authUserId: number = 0
    if (tokenData?.id) authUserId = tokenData.id

    const article: { rows: Article[] } = await db.query(`SELECT * FROM articles where id = $1`, [id])
    const { body, user_id, favorite_list } = article.rows[0]

    const file = await FileService.getFile(body, 'articles')
    const author: { rows: User[] } = await db.query(`SELECT * FROM users where id = $1`, [user_id])
    const favorited = favorite_list.includes(authUserId)
    const favoritesCount = favorite_list.length

    return { ...article.rows[0], body: file, favorited, favoritesCount, author: author.rows[0] }
  }

  async update(article: Article, article_id: number, tokenData?: AuthToken) {
    const user_id = tokenData?.id
    const { title, description, tag_list, body } = article
    validateArticle(title, body, description)

    const pretendentArticle: { rows: Article[] } = await db.query(`SELECT * FROM articles where id = $1`, [article_id])
    if (pretendentArticle.rows[0].user_id !== user_id) {
      throw new Error('у вас нет доступа к чужим постам')
    }

    const fileName = FileService.saveMD(body)
    FileService.deleteFile(pretendentArticle.rows[0].body, 'articles')
    const time = formatISO(new Date(), { format: 'basic' })

    const createdArticle: { rows: Article[] } = await db.query(
      `UPDATE articles set title = $1, description = $2, body = $3, tag_list = $4, update_time = $5 where id = $6 RETURNING *`,
      [title, description, fileName, tag_list, time, article_id]
    )
    return createdArticle.rows[0]
  }

  async favorite(id: number, tokenData?: AuthToken) {
    const user_id = tokenData?.id || 0

    const pretendentArticle: { rows: Article[] } = await db.query(`SELECT * FROM articles where id = $1`, [id])
    const { favorite_list } = pretendentArticle.rows[0]
    if (favorite_list.includes(user_id)) {
      throw new Error('пост уже лайкнут')
    }

    const newFavoriteList = [...favorite_list, user_id]
    const favoriteArticle: { rows: Article[] } = await db.query(
      `UPDATE articles set favorite_list = $1 where id = $2 RETURNING *`,
      [newFavoriteList, id]
    )
    return favoriteArticle.rows[0]
  }

  async unfavorite(id: number, tokenData?: AuthToken) {
    const user_id = tokenData?.id || 0

    const pretendentArticle: { rows: Article[] } = await db.query(`SELECT * FROM articles where id = $1`, [id])
    const { favorite_list } = pretendentArticle.rows[0]
    if (!favorite_list.includes(user_id)) {
      throw new Error('пост не лайкнут')
    }

    const newFavoriteList = favorite_list.filter((num) => num !== user_id)
    const unfavoriteArticle: { rows: Article[] } = await db.query(
      `UPDATE articles set favorite_list = $1 where id = $2 RETURNING *`,
      [newFavoriteList, id]
    )
    return unfavoriteArticle.rows[0]
  }

  async delete(id: number, tokenData?: AuthToken) {
    const user_id = tokenData?.id
    if (!id) {
      throw new Error('не указан id')
    }

    const pretendentArticle: { rows: Article[] } = await db.query(`SELECT * FROM articles where id = $1`, [id])
    if (pretendentArticle.rows[0].user_id !== user_id) {
      throw new Error('у вас нет доступа к чужим постам')
    }

    const deletedArticle: { rows: Article[] } = await db.query(`DELETE FROM articles where id = $1 RETURNING *`, [id])
    FileService.deleteFile(deletedArticle.rows[0].body, 'articles')
    return deletedArticle.rows[0]
  }
}

export default new ArticleService()
