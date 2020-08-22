const express = require('express');
const Nfce = require('../models/Nfce');
const Item = require('../models/Item');

const router = express.Router();

router.post('/teste', async (req, res) => {
    try {
        const { items, details, detailsNfce } = req.body.nfce;
        const objNfce = await Nfce.create({ ...details, ...detailsNfce });

        await Promise.all(items.map(async item => {
            const nfceItem = new Item({ ...items, nfce: objNfce._id });
            await nfceItem.save();
            objNfce.items.push(nfceItem);
        }));

        await objNfce.save();
        return res.status(201).send({ objNfce });
    } catch (err) {
        res.status(400).send(err)
    }
})

router.get('/nfce', async (req, res) => {
    const { link } = req.body
    await Nfce.findOne({ link })
        .then(async nfce => {
            nfce === null ? res.status(400).send({}) : res.status(201).send({ nfce });
        })
        .catch((err) => {
            res.status(400).send(err)
        })
})

router.get('/nfces', async (req, res) => {
    await Nfce.find()
        .then(async nfce => {
            nfce === null ? res.status(400).send({}) : res.status(201).send({ nfce });
        })
        .catch((err) => {
            res.status(400).send(err)
        })
})

/*router.post('/nfce', async (req, res) => {
    const nfce = new Nfce(req.body)
    await nfce.save()
        .then(async () => {
            res.status(201).send({ nfce })
        })
        .catch(err => {
            res.status(400).send(err)
        })
})*/

router.put('/nfce', async (req, res) => {
    const { link, date } = req.body
    await Nfce.findOne({ link })
        .then(async nfce => {
            nfce.date = date;
            await nfce.save();
            res.status(201).send({ nfce })
        })
        .catch((err) => {
            res.status(400).send(err)
        })
})

router.delete('/nfce', async (req, res) => {
    const { link } = req.body
    await Nfce.findOne({ link })
        .then(async nfce => {
            await nfce.remove();
            res.status(201).send({ nfce })
        })
        .catch((err) => {
            res.status(400).send(err)
        })
})

module.exports = router