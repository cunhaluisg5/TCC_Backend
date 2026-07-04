const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../docs/swaggerSpec');
const authRoutes = require('./authRoutes');
const crawlerRoutes = require('./crawlerRoutes');
const nfceRoutes = require('./nfceRoutes');

module.exports = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true
    }
  }));

  app.get('/docs.json', (req, res) => {
    res.send(swaggerSpec);
  });

  app.use('/auth', authRoutes);
  app.use('/crawler', crawlerRoutes);
  app.use('/nfces', nfceRoutes);
};
