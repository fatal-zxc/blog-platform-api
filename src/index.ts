import express from 'express'
import fileUpload from 'express-fileupload'
import cors from 'cors'

import userRouter from './routes/userRouter.js'
import articleRouter from './routes/articleRouter.js'

const PORT = 5000

const app = express()

app.use(express.json())
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
)
app.use(cors())

app.use('', userRouter)
app.use('', articleRouter)
app.use('/avatars', express.static('static/avatars'))

async function start() {
  try {
    app.listen(PORT, () => console.log(`server start on PORT ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}

start()
