require('dotenv').config();

const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 3000;
require('./db/firebase');

const app = express();

app.use(cors());
app.use(express.json());

require('./app/controllers/index')(app);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
