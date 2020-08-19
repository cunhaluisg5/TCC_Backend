const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if(await User.findOne({ email })) {
            return res.status(400).send({ error: 'User already exists' });
        }

        const user = new User(req.body)
        await user.save();
        user.password = undefined;

        return res.status(201).send({ user, token: generateToken({ id: user.id }) });
    } catch (err) {
        return res.status(400).send({ error: 'Registration failed' });
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if(!user) {
        return res.status(400).send({ error: 'User not found' });
    }

    if(!await  bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Invalid password' });
    }

    user.password = undefined;

    const token = jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: 86400
    });

    res.send({ user, token: generateToken({ id: user.id }) });
})

module.exports = router