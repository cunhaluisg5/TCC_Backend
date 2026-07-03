const authRoutes = require('./authRoutes');
const crawlerRoutes = require('./crawlerRoutes');
const nfceRoutes = require('./nfceRoutes');

module.exports = (app) => {
  app.use('/auth', authRoutes);
  app.use('/crawler', crawlerRoutes);
  app.use('/nfces', nfceRoutes);
};
