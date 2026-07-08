const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mailer = require('../modules/mailer');
const userRepository = require('../repositories/userRepository');
const { jwtSecret, jwtExpiresIn, resetAppUrl } = require('../config/auth');
const { HttpError } = require('../utils/httpError');
const {
  validateAuthenticate,
  validateForgotPassword,
  validateRegister,
  validateResetPassword,
  validateResetPasswordToken,
  validateUpdateProfile
} = require('../validators/authValidators');

function generateToken(params = {}) {
  return jwt.sign(params, jwtSecret, {
    expiresIn: jwtExpiresIn
  });
}

function getPasswordResetExpiry() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  return expiresAt.toISOString();
}

function ensureTokenIsUsable(user) {
  if (!user) {
    throw new HttpError(400, 'Token inválido!');
  }

  if (!user.passwordResetExpires || new Date() > new Date(user.passwordResetExpires)) {
    throw new HttpError(400, 'Token expirado!');
  }
}

async function findUserByResetToken(token) {
  const user = await userRepository.findByPasswordResetToken(token, { includeSensitive: true });
  ensureTokenIsUsable(user);
  return user;
}

async function register(payload) {
  validateRegister(payload);
  const { email } = payload;

  if (await userRepository.findByEmail(email)) {
    throw new HttpError(400, 'Usuário já existe!');
  }

  const user = await userRepository.createUser(payload);
  return { user, token: generateToken({ id: user.id }) };
}

async function authenticate(payload) {
  validateAuthenticate(payload);
  const { email, password } = payload;
  const user = await userRepository.findByEmail(email, { includeSensitive: true });

  if (!user) {
    throw new HttpError(400, 'Usuário não encontrado!');
  }

  if (!await bcrypt.compare(password, user.password)) {
    throw new HttpError(400, 'Senha inválida!');
  }

  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;

  return { user, token: generateToken({ id: user.id }) };
}

async function forgotPassword(payload) {
  validateForgotPassword(payload);
  const { email } = payload;
  const user = await userRepository.findByEmail(email);

  if (!user) {
    return {
      message: 'Se o e-mail estiver cadastrado, enviaremos as instruções de redefinição.'
    };
  }

  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = getPasswordResetExpiry();

  await userRepository.updateUser(user.id, {
    passwordResetToken: token,
    passwordResetExpires: expiresAt
  });

  await new Promise((resolve, reject) => {
    mailer.sendMail({
      to: email,
      from: 'Scan NFC-e',
      template: 'auth/forgot_password',
      subject: 'Recuperação de senha',
      context: { token, resetUrl: resetAppUrl }
    }, (err) => {
      if (err) {
        reject(new HttpError(400, 'Não foi possível enviar o e-mail!'));
        return;
      }

      resolve();
    });
  });

  return {
    message: 'Se o e-mail estiver cadastrado, enviaremos as instruções de redefinição.',
    expiresAt
  };
}

async function validateResetToken(payload) {
  validateResetPasswordToken(payload);
  const user = await findUserByResetToken(payload.token.trim());

  return {
    token: payload.token.trim(),
    email: user.email,
    name: user.name,
    expiresAt: user.passwordResetExpires
  };
}

async function resetPassword(payload) {
  validateResetPassword(payload);
  const token = payload.token.trim();
  const user = await findUserByResetToken(token);

  if (payload.email && String(payload.email).toLowerCase() !== String(user.email).toLowerCase()) {
    throw new HttpError(400, 'Token inválido para este e-mail!');
  }

  await userRepository.updateUser(user.id, {
    password: payload.password,
    passwordResetToken: null,
    passwordResetExpires: null
  });

  return {
    message: 'Senha redefinida com sucesso.'
  };
}

async function updateProfile(userId, payload) {
  validateUpdateProfile(payload);
  const user = await userRepository.updateUser(userId, { name: payload.name });

  if (!user) {
    throw new HttpError(404, 'Usuário não encontrado!');
  }

  return { user };
}

module.exports = {
  authenticate,
  forgotPassword,
  register,
  resetPassword,
  updateProfile,
  validateResetToken
};

