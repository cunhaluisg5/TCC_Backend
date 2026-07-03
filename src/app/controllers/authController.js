const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');
const userRepository = require('../repositories/userRepository');
const { jwtSecret, jwtExpiresIn, resetAppUrl } = require('../../config/auth');

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, jwtSecret, {
    expiresIn: jwtExpiresIn
  });
}

router.post('/register', async (req, res) => {
  const { email } = req.body;

  try {
    if (await userRepository.findByEmail(email)) {
      return res.status(400).send({ error: 'Usuario ja existe!' });
    }

    const user = await userRepository.createUser(req.body);

    return res.status(201).send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).send({ error: 'Falha ao registrar!' });
  }
});

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  const user = await userRepository.findByEmail(email, { includeSensitive: true });

  if (!user) {
    return res.status(400).send({ error: 'Usuario nao encontrado!' });
  }

  if (!await bcrypt.compare(password, user.password)) {
    return res.status(400).send({ error: 'Senha invalida!' });
  }

  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;

  return res.send({ user, token: generateToken({ id: user.id }) });
});

router.post('/forgot_password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(400).send({ error: 'Usuario nao encontrado!' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await userRepository.updateUser(user.id, {
      passwordResetToken: token,
      passwordResetExpires: now.toISOString()
    });

    mailer.sendMail({
      to: email,
      from: 'Scan NFC-e',
      template: 'auth/forgot_password',
      subject: 'Recuperacao de senha',
      context: { token, resetUrl: resetAppUrl }
    }, (err) => {
      if (err) {
        return res.status(400).send({ error: 'Nao foi possivel enviar e-mail!' });
      }

      return res.send();
    });
  } catch (err) {
    return res.status(400).send({ error: 'Um erro ocorreu, tente novamente!' });
  }
});

router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await userRepository.findByEmail(email, { includeSensitive: true });

    if (!user) {
      return res.status(400).send({ error: 'Usuario nao encontrado!' });
    }

    if (token !== user.passwordResetToken) {
      return res.status(400).send({ error: 'Token invalido!' });
    }

    const now = new Date();

    if (!user.passwordResetExpires || now > new Date(user.passwordResetExpires)) {
      return res.status(400).send({ error: 'Token expirado!' });
    }

    await userRepository.updateUser(user.id, {
      password,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    return res.send();
  } catch (err) {
    return res.status(400).send({ error: 'Nao foi possivel redefinir a senha, tente novamente!' });
  }
});

router.put('/:userId', async (req, res) => {
  try {
    const { name } = req.body;
    const user = await userRepository.updateUser(req.params.userId, { name });

    if (!user) {
      return res.status(404).send({ error: 'Usuario nao encontrado!' });
    }

    return res.status(201).send({ user });
  } catch (err) {
    return res.status(400).send({ error: 'Erro ao atualizar usuario!' });
  }
});

module.exports = app => app.use('/auth', router);
