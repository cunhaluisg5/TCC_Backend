const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { corsOrigin, jsonLimit } = require('../config/app');
const { errorHandler } = require('../middlewares/errorHandler');
const { authLimiter, defaultLimiter } = require('../middlewares/rateLimit');

function createApp() {
  require('../db/firebase');

  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: jsonLimit }));
  app.use(defaultLimiter);
  app.use('/auth', authLimiter);

  require('../routes')(app);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
