const express = require('express');
const crawlerController = require('../controllers/crawlerController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(crawlerController.create));

module.exports = router;
