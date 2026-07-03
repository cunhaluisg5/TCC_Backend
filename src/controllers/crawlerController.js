const crawlerService = require('../services/crawlerService');
const { sendCreated } = require('../utils/http');
const { validateCrawlerRequest } = require('../validators/nfceValidators');

async function create(req, res) {
  validateCrawlerRequest(req.body);
  return sendCreated(res, await crawlerService.crawl(req.body.url));
}

module.exports = {
  create
};
