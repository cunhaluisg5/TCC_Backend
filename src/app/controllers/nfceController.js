const express = require('express');
const authMiddleware = require('../middlewares/auth');

const Nfce = require('../models/Nfce');
const Item = require('../models/Item');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const nfces = await Nfce.find().populate(['user', 'items']);

        return res.send({ nfces });
    } catch (err) {
        res.status(400).send({ error: 'Error loading nfces' })
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const nfces = await Nfce.find({ "user": req.params.userId }).populate(['user', 'items']);

        return res.send({ nfces });
    } catch (err) {
        res.status(400).send({ error: 'Error loading nfces' })
    }
});

router.get('/:nfceId', async (req, res) => {
    try {
        const nfce = await Nfce.findById(req.params.nfceId).populate(['user', 'items']);

        return res.send({ nfce });
    } catch (err) {
        res.status(400).send({ error: 'Error loading nfce' })
    }
});

router.post('/', async (req, res) => {
    try {
        const { items, details, detailsNfce } = req.body.nfce;
        const { accesskey } = detailsNfce;

        if(await Nfce.findOne({ accesskey, user: req.userId })) {
            console.log('ChEgOu')
            return res.status(400).send({ error: 'Nfce already exists' });
        }

        const nfce = await Nfce.create({ user: req.userId, ...details, ...detailsNfce });

        await Promise.all(items.map(async item => {
            const nfceItem = new Item({ ...item, nfce: nfce._id });
            await nfceItem.save();
            nfce.items.push(nfceItem);
        }));

        await nfce.save();
        return res.status(201).send({ nfce });
    } catch (err) {
        res.status(400).send({ error: 'Error creating new nfce' })
    }
});

router.put('/:nfceId', async (req, res) => {
    try {
        const { items, details, detailsNfce } = req.body.nfce;
        const nfce = await Nfce.findByIdAndUpdate(req.params.nfceId, { ...details, ...detailsNfce }, 
            { new: true });

        nfce.items = [];
        await Item.remove({ nfce: nfce._id });

        await Promise.all(items.map(async item => {
            const nfceItem = new Item({ ...item, nfce: nfce._id });
            await nfceItem.save();
            nfce.items.push(nfceItem);
        }));

        await nfce.save();
        return res.status(201).send({ nfce });
    } catch (err) {
        res.status(400).send({ error: 'Error updating new nfce' })
    }
});

router.delete('/:nfceId', async (req, res) => {
    try {
        await Nfce.findByIdAndRemove(req.params.nfceId);

        return res.send();
    } catch (err) {
        res.status(400).send({ error: 'Error deleting nfce' })
    }
});

module.exports = app => app.use('/nfces', router);