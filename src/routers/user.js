const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if(await User.findOne({ email })) {
            return res.status(400).send({ error: 'User already exists' });
        }

        const user = new User(req.body)
        await user.save();
        user.password = undefined;

        return res.status(201).send({ user });
    } catch (err) {
        return res.status(400).send({ error: 'Registration failed' });
    }
})

module.exports = router