const express = require('express');
const authMiddleware = require('../middlewares/auth');
const nfceController = require('../controllers/nfceController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);
router.get('/', asyncHandler(nfceController.listAll));
router.get('/user/:userId', asyncHandler(nfceController.listByUser));
router.get('/:nfceId', asyncHandler(nfceController.findById));
router.post('/', asyncHandler(nfceController.create));
router.put('/:nfceId', asyncHandler(nfceController.update));
router.delete('/:nfceId', asyncHandler(nfceController.remove));

module.exports = router;
