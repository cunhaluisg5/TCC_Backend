const validator = require('validator');
const { ensure } = require('../utils/validation');

function validateRegister(payload = {}) {
  ensure(typeof payload.name === 'string' && payload.name.trim().length >= 3, 'Nome invalido!');
  ensure(typeof payload.email === 'string' && validator.isEmail(payload.email), 'E-mail invalido!');
  ensure(typeof payload.password === 'string' && payload.password.length >= 6, 'Senha invalida!');
}

function validateAuthenticate(payload = {}) {
  ensure(typeof payload.email === 'string' && validator.isEmail(payload.email), 'E-mail invalido!');
  ensure(typeof payload.password === 'string' && payload.password.length >= 6, 'Senha invalida!');
}

function validateForgotPassword(payload = {}) {
  ensure(typeof payload.email === 'string' && validator.isEmail(payload.email), 'E-mail invalido!');
}

function validateResetPasswordToken(payload = {}) {
  ensure(typeof payload.token === 'string' && payload.token.trim().length >= 20, 'Token invalido!');
}

function validateResetPassword(payload = {}) {
  if (payload.email !== undefined) {
    ensure(typeof payload.email === 'string' && validator.isEmail(payload.email), 'E-mail invalido!');
  }

  validateResetPasswordToken(payload);
  ensure(typeof payload.password === 'string' && payload.password.length >= 6, 'Senha invalida!');
}

function validateUpdateProfile(payload = {}) {
  ensure(typeof payload.name === 'string' && payload.name.trim().length >= 3, 'Nome invalido!');
}

module.exports = {
  validateAuthenticate,
  validateForgotPassword,
  validateRegister,
  validateResetPassword,
  validateResetPasswordToken,
  validateUpdateProfile
};
