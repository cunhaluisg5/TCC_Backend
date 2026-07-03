const express = require('express');
const cors = require('cors');

const { corsOrigin } = require('../config/app');
const { errorHandler } = require('../middlewares/errorHandler');

function createApp() {
  require('../db/firebase');

  const app = express();

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  require('../routes')(app);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
