const express = require('express')
const nfceRouter = require('./app/controllers/nfce')
const userRouter = require('./app/controllers/user')
const authRouter = require('./app/controllers/project');
const crawlerRouter = require('./app/controllers/crawler');
const port = process.env.PORT
require('./db/db')

const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use('/auth',userRouter)
app.use('/projects', authRouter)
app.use('/nfce', nfceRouter)
app.use('/crawler', crawlerRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})