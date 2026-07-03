const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');
const userRepository = require('../repositories/userRepository');

const authConfig = require('../../config/auth.json');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 2628000000
    });
}

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await userRepository.findByEmail(email)) {
            return res.status(400).send({ error: 'Usuário já existe!' });
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
        return res.status(400).send({ error: 'Usuário não encontrado!' });
    }

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Senha inválida!' });
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
            return res.status(400).send({ error: 'Usuário não encontrado!' });
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
            subject: 'Recuperação de senha',
            context: { token }
        }, (err) => {
            if (err) {
                return res.status(400).send({ error: 'Não foi possível enviar e-mail!' });
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
            return res.status(400).send({ error: 'Usuário não encontrado!' });
        }

        if (token !== user.passwordResetToken) {
            return res.status(400).send({ error: 'Token inválido!' });
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
        return res.status(400).send({ error: 'Não foi possível redefinir a senha, tente novamente!' });
    }
});

router.put('/:userId', async (req, res) => {
    try {
        const { name } = req.body;
        const user = await userRepository.updateUser(req.params.userId, { name });

        if (!user) {
            return res.status(404).send({ error: 'Usuário não encontrado!' });
        }

        return res.status(201).send({ user });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao atualizar usuário!' });
    }
});

module.exports = app => app.use('/auth', router);
