require('dotenv').config();

const { port } = require('./config/app');
const { createApp } = require('./http/createApp');

const app = createApp();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
