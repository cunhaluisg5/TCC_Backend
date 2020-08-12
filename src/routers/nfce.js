const express = require('express')
const Nfce = require('../models/Nfce')
var request = require('request');
const cheerio = require('cheerio');

const router = express.Router()

router.get('/crawler', function (req, res) {

    url = req.body;

    request(url, function (error, response, html) {

        if (!error) {
            var $ = cheerio.load(html);

            var nfce = {};
            var itens = [];

            $('#myTable tr').each(function (i) {
                const text = $(this).find('td').eq(0).text().replace(/\t/g, '').split('\n');
                const nameProduct = text[0];
                const codeProduct = text[1].replace('(Código: ', '').replace(')', '');
                const qtdeItens = $(this).find('td').eq(1).text().replace('Qtde total de ítens: ', '');
                const unProduct = $(this).find('td').eq(2).text().replace('UN: ', '');
                const valueProduct = $(this).find('td').eq(3).text().replace('Valor total R$: R$ ', '').replace(',', '.');
                
                itens.push({
                    nameProduct: nameProduct,
                    codeProduct: codeProduct,
                    qtdeItens: qtdeItens,
                    unProduct : unProduct,
                    valueProduct: valueProduct
                });
            });
            nfce["itens"] = itens;

            var cont = 0;
            var qtdTotalItens = 0;
            var valueTotal = 0;
            var valuePaid = 0;
            var typePayment;

            $('.row').each(function (i) {
                switch(cont) {
                    case 0:
                        qtdTotalItens = $(this).find('strong').eq(1).text().replace(/\t/g, '');
                        break;
                    case 1:
                        valueTotal = $(this).find('strong').eq(1).text().replace(/\t/g, '');
                        break;
                    case 2:
                        valuePaid = $(this).find('strong').eq(1).text().replace(/\t/g, '');
                        break;
                    case 3:
                        var type = $(this).find('strong').text().replace(/\t/g, '').split("- ");;
                        typePayment = type[1];
                        break;
                }
                cont++;
            });

            nfce["details"] = {
                qtdTotalItens: qtdTotalItens,
                valueTotal: valueTotal,
                valuePaid: valuePaid,
                typePayment : typePayment
            };

            var nameSocial;
            var cnpj;
            var stateRegistration;
            var uf;
            var operationDestination;
            var finalCostumer;
            var buyerPresence;
            var model;
            var series;
            var number;
            var issuanceDate;
            var totalValueService;
            var icmsCalculationBasis;
            var icmsValue;
            var protocol;
            $('#collapse4').each(function (i) {
                nameSocial = $(this).find('td').eq(0).text();
                cnpj = $(this).find('td').eq(1).text();
                stateRegistration = $(this).find('td').eq(2).text();
                uf = $(this).find('td').eq(3).text();
                operationDestination = $(this).find('td').eq(4).text();
                finalCostumer = $(this).find('td').eq(5).text();
                buyerPresence = $(this).find('td').eq(6).text();
                model = $(this).find('td').eq(7).text();
                series = $(this).find('td').eq(8).text();
                number = $(this).find('td').eq(9).text();
                issuanceDate = $(this).find('td').eq(10).text();
                totalValueService = $(this).find('td').eq(11).text();
                icmsCalculationBasis = $(this).find('td').eq(12).text();
                icmsValue = $(this).find('td').eq(13).text();
                protocol = $(this).find('td').eq(14).text();
            });

            nfce["detailsNfce"] = {
                nameSocial: nameSocial,
                cnpj: cnpj,
                stateRegistration: stateRegistration,
                uf: uf,
                operationDestination: operationDestination,
                finalCostumer: finalCostumer,
                buyerPresence: buyerPresence,
                model: model,
                series: series,
                number: number,
                issuanceDate: issuanceDate,
                totalValueService: totalValueService,
                icmsCalculationBasis: icmsCalculationBasis,
                icmsValue: icmsValue,
                protocol: protocol
            };
            
        }

        nfce === null ? res.status(400).send({}) : res.status(201).send({ nfce });
    })
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

router.post('/nfce', async (req, res) => {
    const nfce = new Nfce(req.body)
    await nfce.save()
        .then(async () => {
            res.status(201).send({ nfce })
        })
        .catch(err => {
            res.status(400).send(err)
        })
})

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