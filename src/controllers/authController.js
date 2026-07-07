const authService = require('../services/authService');
const { sendCreated, sendOk } = require('../utils/http');

async function register(req, res) {
  return sendCreated(res, await authService.register(req.body));
}

async function authenticate(req, res) {
  return sendOk(res, await authService.authenticate(req.body));
}

async function forgotPassword(req, res) {
  return sendOk(res, await authService.forgotPassword(req.body));
}

async function validateResetToken(req, res) {
  return sendOk(res, await authService.validateResetToken(req.body));
}

async function resetPassword(req, res) {
  return sendOk(res, await authService.resetPassword(req.body));
}

async function updateProfile(req, res) {
  return sendCreated(res, await authService.updateProfile(req.params.userId, req.body));
}

module.exports = {
  authenticate,
  forgotPassword,
  register,
  resetPassword,
  updateProfile,
  validateResetToken
};
