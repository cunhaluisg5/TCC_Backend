const express = require('express')
const nfceRouter = require('./routers/nfce')
const port = process.env.PORT
require('./db/db')

const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(nfceRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})