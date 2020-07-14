const express = require('express')
const Nfce = require('../models/Nfce')

const router = express.Router()

router.get('/', async(req, res) => {
    const { link } = req.body
    await Nfce.findOne({link})
    .then(async nfce => {
        nfce === null ? res.status(400).send({ }) : res.status(201).send({ nfce });
    })
    .catch((err) => {
        res.status(400).send(err)
    })
})

router.post('/', async (req, res) => {
    const nfce = new Nfce(req.body)
    await nfce.save()
    .then(async () => {
        res.status(201).send({ nfce })
    })
    .catch(err => {
        res.status(400).send(err)
    })
})

router.put('/', async(req, res) => {
    const { link, date } = req.body
    await Nfce.findOne({link})
    .then(async nfce => {
        nfce.date = date;
        await nfce.save();
        res.status(201).send({ nfce })
    })
    .catch((err) => {
        res.status(400).send(err)
    })
})

router.delete('/', async(req, res) => {
    const { link } = req.body
    await Nfce.findOne({link})
    .then(async nfce => {
        await nfce.remove();
        res.status(201).send({ nfce })
    })
    .catch((err) => {
        res.status(400).send(err)
    })
})

module.exports = router