const authService = require('../services/authService');
const { sendCreated, sendNoContent, sendOk } = require('../utils/http');

async function register(req, res) {
  return sendCreated(res, await authService.register(req.body));
}

async function authenticate(req, res) {
  return sendOk(res, await authService.authenticate(req.body));
}

async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body);
  return sendNoContent(res);
}

async function resetPassword(req, res) {
  await authService.resetPassword(req.body);
  return sendNoContent(res);
}

async function updateProfile(req, res) {
  return sendCreated(res, await authService.updateProfile(req.params.userId, req.body));
}

module.exports = {
  authenticate,
  forgotPassword,
  register,
  resetPassword,
  updateProfile
};
