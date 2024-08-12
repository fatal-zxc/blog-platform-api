import { Response } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import UserController from '../controllers/UserController'
import { MyRequest } from '../types'
import db from '../db'

dotenv.config()

describe('UserController', () => {
  const mockJson = jest.fn()
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson })
  const mockResponse = { json: mockJson, status: mockStatus } as unknown as Response
  const mockUser = {
    id: 1,
    username: 'validUser',
    password: '12345678',
    email: 'test@test.com',
  }

  it('должен создать пользователя и вернуть его', async () => {
    const mockRequest = {
      body: mockUser
    } as MyRequest

    const jsonCalls: any[] = []
    mockJson.mockImplementation((json: any) => {
      jsonCalls.push(json)
    });

    await UserController.create(mockRequest, mockResponse)

    expect(mockJson).toHaveBeenCalled()

    const responseBody = jsonCalls[0]

    expect(responseBody).toEqual({
      user: expect.objectContaining({
        id: 1,
        username: 'validUser',
        password: expect.any(String),
        email: 'test@test.com',
        avatar: null,
      }),
      token: expect.any(String)
    })

    const secret = String(process.env.SECRET)
    const token = jwt.verify(responseBody.token, secret)
    expect(typeof token !== 'string' && token.id).toEqual(mockUser.id)
  });

  it('должен удалить пользователя и вернуть его', async () => {
    const mockRequest = {
      user: {id: mockUser.id},
    } as MyRequest
    
    await UserController.delete(mockRequest, mockResponse)

    expect(mockResponse.json).toHaveBeenCalledWith({
      id: 1,
      username: 'validUser',
      password: expect.any(String),
      email: 'test@test.com',
      avatar: null
    })
  })

  afterAll(async () => {
    await db.query(`DROP TABLE articles;`)
    await db.query(`DROP TABLE users;`)
    await db.query(`
      create TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        avatar VARCHAR(255) UNIQUE
      );`
    )
    await db.query(`
      create TABLE articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        body VARCHAR(255) NOT NULL,
        tag_list TEXT[],
        favorite_list INTEGER[] NOT NULL,
        update_time VARCHAR(255) NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users
      );`
    )
  })
})