import * as uuid from 'uuid'
import path from 'path'
import fs from 'fs'
import util from 'util'
import { UploadedFile } from 'express-fileupload'

const readFile = util.promisify(fs.readFile)
const deleteFile = util.promisify(fs.rm)

class FileService {
  async saveImage(image: UploadedFile): Promise<string | undefined> {
    try {
      const fileName = uuid.v4() + image.name.slice(image.name.lastIndexOf('.'))
      const filePath = path.resolve('static/avatars', fileName)
      await image.mv(filePath)
      return fileName
    } catch (e) {
      console.log(e)
    }
  }

  saveMD(text: string): string | undefined {
    try {
      const fileName = uuid.v4() + '.md'
      const filePath = path.resolve('static/articles', fileName)
      fs.writeFile(filePath, text, () => {})
      return fileName
    } catch (e) {
      console.log(e)
    }
  }

  async getFile(fileName: string, dir: string): Promise<string | undefined> {
    try {
      const filePath = path.resolve(`static/${dir}`, fileName)
      const file = await readFile(filePath, { encoding: 'utf8' })
      return file
    } catch (e) {
      console.log(e)
    }
  }

  async deleteFile(fileName: string, dir: string): Promise<void> {
    try {
      const filePath = path.resolve(`static/${dir}`, fileName)
      await deleteFile(filePath)
    } catch (e) {
      console.log(e)
    }
  }
}

export default new FileService()
