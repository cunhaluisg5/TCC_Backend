const express = require('express');
const cors = require('cors');

const port = process.env.PORT;
require('./db/db');

const app = express();

app.use(cors());
app.use(express.json());

require('./app/controllers/index')(app);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});