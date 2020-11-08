const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

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
        if(await User.findOne({ email })) {
            return res.status(400).send({ error: 'Usuário já existe!' });
        }

        const user = new User(req.body)
        await user.save();
        user.password = undefined;

        return res.status(201).send({ user, token: generateToken({ id: user.id }) });
    } catch (err) {
        return res.status(400).send({ error: 'Falha ao registrar!' });
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');

    if(!user) {
        return res.status(400).send({ error: 'Usuário não encontrado!' });
    }

    if(!await  bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Senha Inválida!' });
    }

    user.password = undefined;

    res.send({ user, token: generateToken({ id: user.id }) });
})

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try{
        const user = await User.findOne({ email });

        if(!user) {
            return res.status(400).send({ error: 'Usuário não encontrado!' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1)

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });

        mailer.sendMail({
            to: email,
            from: 'Scan NFC-e',
            template: 'auth/forgot_password',
            subject: 'Recuperação de Senha',
            context: { token }
        }, (err) => {
            if(err) {
                return res.status(400).send({ error: 'Não foi possível enviar e-mail!' });
            }
            return res.send();
        })

    } catch(err) {
        res.status(400).send({ error: 'Um erro ocorreu, tente novamente!' });
    }
})

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;

    try{
        const user = await User.findOne({ email })
        .select('+passwordResetToken passwordResetExpires');

        if(!user) {
            return res.status(400).send({ error: 'Usuário não encontrado!' });
        }

        if(token !== user.passwordResetToken) {
            return res.status(400).send({ error: 'Token inválido!' });
        }

        const now = new Date();

        if(now > user.passwordResetExpires) {
            return res.status(400).send({ error: 'Token expirado!' });
        }

        user.password = password;

        await user.save();

        res.send();
    } catch(err) {
        res.status(400).send({ error: 'Não foi possível redefinir a senha, tente novamente!' });
    }
})

router.put('/:userId', async (req, res) => {
    try {
        var { name } = req.body;
        const user = await User.findByIdAndUpdate(req.params.userId, { name }, 
            { new: true });
        return res.status(201).send({ user });
    } catch (err) {
        res.status(400).send({ error: 'Erro ao atualizar usuário!' })
    }
})

module.exports = app => app.use('/auth', router);