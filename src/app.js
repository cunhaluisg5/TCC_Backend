const express = require('express');

const port = process.env.PORT;
require('./db/db');

const app = express();
app.use(express.json());

require('./app/controllers/index')(app);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});