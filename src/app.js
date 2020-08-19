const express = require('express')
const nfceRouter = require('./routers/nfce')
const userRouter = require('./routers/user')
const authRouter = require('./routers/project');
const port = process.env.PORT
require('./db/db')

const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(authRouter)
app.use(nfceRouter)
app.use(userRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})