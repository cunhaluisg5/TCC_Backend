const express = require('express');
const authMiddleware = require('../middlewares/auth');
const nfceRepository = require('../repositories/nfceRepository');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const nfces = await nfceRepository.listNfces();

        return res.send({ nfces });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao consultar NFC-e!' });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const nfces = await nfceRepository.listNfcesByUser(req.params.userId);

        return res.send({ nfces });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao consultar NFC-e!' });
    }
});

router.get('/:nfceId', async (req, res) => {
    try {
        const nfce = await nfceRepository.findNfceById(req.params.nfceId);

        if (!nfce) {
            return res.status(404).send({ error: 'NFC-e não encontrada!' });
        }

        return res.send({ nfce });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao consultar NFC-e!' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { items, details, detailsNfce } = req.body.nfce;
        const { accesskey } = detailsNfce;

        if (await nfceRepository.findNfceByAccessKeyForUser(accesskey, req.userId)) {
            return res.status(400).send({ error: 'NFC-e já existente!' });
        }

        const nfce = await nfceRepository.createNfce({
            userId: req.userId,
            items,
            details,
            detailsNfce
        });

        return res.status(201).send({ nfce });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao registrar NFC-e!' });
    }
});

router.put('/:nfceId', async (req, res) => {
    try {
        const { items, details, detailsNfce } = req.body.nfce;
        const nfce = await nfceRepository.updateNfce(req.params.nfceId, {
            items,
            details,
            detailsNfce
        });

        if (!nfce) {
            return res.status(404).send({ error: 'NFC-e não encontrada!' });
        }

        return res.status(201).send({ nfce });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao atualizar NFC-e!' });
    }
});

router.delete('/:nfceId', async (req, res) => {
    try {
        await nfceRepository.deleteNfce(req.params.nfceId);

        return res.send();
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao remover NFC-e!' });
    }
});

module.exports = app => app.use('/nfces', router);
