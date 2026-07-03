const crawlerService = require('../services/crawlerService');
const { sendCreated } = require('../utils/http');

async function create(req, res) {
  return sendCreated(res, await crawlerService.crawl(req.body.url));
}

module.exports = {
  create
};
