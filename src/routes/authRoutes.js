const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
const { requireSameUserParam } = require('../middlewares/validation');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post('/register', asyncHandler(authController.register));
router.post('/authenticate', asyncHandler(authController.authenticate));
router.post('/forgot_password', asyncHandler(authController.forgotPassword));
router.post('/reset_password', asyncHandler(authController.resetPassword));
router.put('/:userId', authMiddleware, requireSameUserParam('userId'), asyncHandler(authController.updateProfile));

module.exports = router;
