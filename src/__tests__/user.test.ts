import { Response } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bcryptjs from 'bcryptjs'

import UserController from '../controllers/UserController'
import { validateUsersData } from '../services/UserService'
import FileService from '../services/FileService'
import { MyRequest } from '../types'
import db from '../db'
import { mockImage } from '../__mocks__/mockImage'
import { mockUser1, mockUser2 } from '../__mocks__/mockUsers'

dotenv.config()

describe('UserController', () => {
  const mockJson = jest.fn()
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson })
  const mockResponse = { json: mockJson, status: mockStatus } as unknown as Response

  describe('должен корректно обрабатывать входящие данные пользователя', () => {
    it('username validation', () => {
      expect(() => validateUsersData('', '', '', ['password', 'email'])).toThrow('отсутствует имя пользователя')
      expect(() => validateUsersData('ad', '', '', ['password', 'email'])).toThrow('имя пользователя меньше 3 символов')
      expect(() => validateUsersData('123456789012345678901', '', '', ['password', 'email'])).toThrow('имя пользователя больше 20 символов')
      expect(() => validateUsersData('username', '', '', ['password', 'email'])).not.toThrow()
    })
    it('password validation', () => {
      expect(() => validateUsersData('', '', '', ['username', 'email'])).toThrow('отсутствует пароль')
      expect(() => validateUsersData('', '12345', '', ['username', 'email'])).toThrow('пароль меньше 6 символов')
      expect(() => validateUsersData('', '123456789012345678901', '', ['username', 'email'])).toThrow('пароль больше 20 символов')
      expect(() => validateUsersData('', 'newPasw0ord1', '', ['username', 'email'])).not.toThrow()
    })
    it('email validation', () => {
      expect(() => validateUsersData('', '', '', ['username', 'password'])).toThrow('отсутствует email')
      expect(() => validateUsersData('', '', '123456789012345678901123456789012345678901@gmail.com', ['username', 'password'])).toThrow('email больше 40 символов')
      expect(() => validateUsersData('', '', 'avgkwujv829', ['username', 'password'])).toThrow('некоректный email')
      expect(() => validateUsersData('', '', 'test@test.com', ['username', 'password'])).not.toThrow()
    })
  })

  describe('create должен создавать пользователя и возвращать его', () => {
    it('без аватарки', async () => {
      const mockRequest = {
        body: mockUser1,
      } as MyRequest
  
      const jsonCalls: any[] = []
      mockJson.mockImplementation((json: any) => {
        jsonCalls.push(json)
      });
  
      await UserController.create(mockRequest, mockResponse)
    
      const responseBody = jsonCalls[0]
  
      expect(responseBody).toEqual({
        user: expect.objectContaining({
          id: 1,
          username: 'validUser1',
          password: expect.any(String),
          email: 'test_user1@test.com',
          avatar: null,
        }),
        token: expect.any(String)
      })
  
      expect(bcryptjs.compareSync(mockUser1.password, responseBody.user.password)).toEqual(true)
  
      const secret = String(process.env.SECRET)
      const token = jwt.verify(responseBody.token, secret)
      expect(typeof token !== 'string' && token.id).toEqual(mockUser1.id)
    })

    it('с аватаркой', async () => {
      const mockRequest = {
        body: mockUser2,
        files: {
          avatar: mockImage
        }
      } as MyRequest
  
      const jsonCalls: any[] = []
      mockJson.mockImplementation((json: any) => {
        jsonCalls.push(json)
      });
  
      await UserController.create(mockRequest, mockResponse)
    
      const responseBody = jsonCalls[0]
  
      expect(responseBody).toEqual({
        user: expect.objectContaining({
          id: 2,
          username: 'validUser2',
          password: expect.any(String),
          email: 'test_user2@test.com',
          avatar: expect.any(String),
        }),
        token: expect.any(String)
      })
  
      expect(bcryptjs.compareSync(mockUser2.password, responseBody.user.password)).toEqual(true)
  
      const secret = String(process.env.SECRET)
      const token = jwt.verify(responseBody.token, secret)
      expect(typeof token !== 'string' && token.id).toEqual(mockUser2.id)
    })
  })

  describe('delete должен удалять пользователя и возвращать его', () => {
    it('без аватарки', async () => {
      const mockRequest = {
        user: {id: mockUser1.id},
      } as MyRequest

      const jsonCalls: any[] = []
      mockJson.mockImplementation((json: any) => {
        jsonCalls.push(json)
      })
      
      await UserController.delete(mockRequest, mockResponse)

      const responseBody = jsonCalls[0]
  
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: 1,
        username: 'validUser1',
        password: expect.any(String),
        email: 'test_user1@test.com',
        avatar: null
      })

      expect(bcryptjs.compareSync(mockUser2.password, responseBody.password)).toEqual(true)
    })

    it('с аватаркой', async () => {
      const mockRequest = {
        user: {id: mockUser2.id},
      } as MyRequest

      const jsonCalls: any[] = []
      mockJson.mockImplementation((json: any) => {
        jsonCalls.push(json)
      })
      
      await UserController.delete(mockRequest, mockResponse)
  
      const responseBody = jsonCalls[0]
  
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: 2,
        username: 'validUser2',
        password: expect.any(String),
        email: 'test_user2@test.com',
        avatar: expect.any(String)
      })

      expect(bcryptjs.compareSync(mockUser2.password, responseBody.password)).toEqual(true)
      expect(await FileService.getFile(responseBody.avatar, 'avatars')).toBeUndefined()
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