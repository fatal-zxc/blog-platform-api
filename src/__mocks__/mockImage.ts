import { UploadedFile } from "express-fileupload"
import fs from 'fs'

const mockImageBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAB0lEQVR42mP8/wcAAwAB/teUq8AAAAABJRU5ErkJggg==',
  'base64'
);

export const mockImage: UploadedFile = {
  name: 'mock.jpg',
  data: mockImageBuffer,
  encoding: '7bit',
  tempFilePath: '',
  truncated: false,
  mimetype: 'image/png',
  mv: function(path: string, callback?: (err: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, mockImage.data, (err) => {
        if (err) {
          if (callback) callback(err);
          reject(err);
        } else {
          if (callback) callback(null);
          resolve();
        }
      })
    })
  },
  size: 12,
  md5: '123'
}