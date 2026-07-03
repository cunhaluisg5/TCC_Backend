const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mailer = require('../modules/mailer');
const userRepository = require('../repositories/userRepository');
const { jwtSecret, jwtExpiresIn, resetAppUrl } = require('../config/auth');
const { HttpError } = require('../utils/httpError');

function generateToken(params = {}) {
  return jwt.sign(params, jwtSecret, {
    expiresIn: jwtExpiresIn
  });
}

async function register(payload) {
  const { email } = payload;

  if (await userRepository.findByEmail(email)) {
    throw new HttpError(400, 'Usuario ja existe!');
  }

  const user = await userRepository.createUser(payload);
  return { user, token: generateToken({ id: user.id }) };
}

async function authenticate({ email, password }) {
  const user = await userRepository.findByEmail(email, { includeSensitive: true });

  if (!user) {
    throw new HttpError(400, 'Usuario nao encontrado!');
  }

  if (!await bcrypt.compare(password, user.password)) {
    throw new HttpError(400, 'Senha invalida!');
  }

  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;

  return { user, token: generateToken({ id: user.id }) };
}

async function forgotPassword({ email }) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new HttpError(400, 'Usuario nao encontrado!');
  }

  const token = crypto.randomBytes(20).toString('hex');
  const now = new Date();
  now.setHours(now.getHours() + 1);

  await userRepository.updateUser(user.id, {
    passwordResetToken: token,
    passwordResetExpires: now.toISOString()
  });

  await new Promise((resolve, reject) => {
    mailer.sendMail({
      to: email,
      from: 'Scan NFC-e',
      template: 'auth/forgot_password',
      subject: 'Recuperacao de senha',
      context: { token, resetUrl: resetAppUrl }
    }, (err) => {
      if (err) {
        reject(new HttpError(400, 'Nao foi possivel enviar e-mail!'));
        return;
      }

      resolve();
    });
  });
}

async function resetPassword({ email, token, password }) {
  const user = await userRepository.findByEmail(email, { includeSensitive: true });

  if (!user) {
    throw new HttpError(400, 'Usuario nao encontrado!');
  }

  if (token !== user.passwordResetToken) {
    throw new HttpError(400, 'Token invalido!');
  }

  const now = new Date();

  if (!user.passwordResetExpires || now > new Date(user.passwordResetExpires)) {
    throw new HttpError(400, 'Token expirado!');
  }

  await userRepository.updateUser(user.id, {
    password,
    passwordResetToken: null,
    passwordResetExpires: null
  });
}

async function updateProfile(userId, { name }) {
  const user = await userRepository.updateUser(userId, { name });

  if (!user) {
    throw new HttpError(404, 'Usuario nao encontrado!');
  }

  return { user };
}

module.exports = {
  authenticate,
  forgotPassword,
  register,
  resetPassword,
  updateProfile
};
