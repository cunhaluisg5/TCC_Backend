const express = require('express');
var request = require('request');
const cheerio = require('cheerio');
const Item = require('../models/Item');

const router = express.Router();

router.get('/', function (req, res) {

    url = req.body;

    request(url, function (error, response, html) {

        if (!error) {
            var nfce = {};
            var items = [];

            var $ = cheerio.load(html);

            $('#myTable tr').each(function (i) {
                const itemText = $(this).find('td').eq(0).text().replace(/\t/g, '').split('\n');
                const itemName = itemText[0];
                const itemCode = itemText[1].replace('(Código: ', '').replace(')', '');
                const qtdItem = $(this).find('td').eq(1).text().replace('Qtde total de ítens: ', '');
                const unItem = $(this).find('td').eq(2).text().replace('UN: ', '');
                const itemValue = $(this).find('td').eq(3).text().replace('Valor total R$: R$ ', '').replace(',', '.');

                items.push(new Item({
                    itemName,
                    itemCode,
                    qtdItem,
                    unItem,
                    itemValue
                }));
            });

            nfce["items"] = items;

            let counter = 0;
            let totalItems = 0;
            let totalValue = 0;
            let paidValue = 0;
            let typePayment;

            $('.row').each(function (i) {
                switch (counter) {
                    case 0:
                        totalItems = $(this).find('strong').eq(1).text().replace(/\t/g, '');
                        break;
                    case 1:
                        totalValue = $(this).find('strong').eq(1).text().replace(/\t/g, '');
                        break;
                    case 2:
                        paidValue = $(this).find('strong').eq(1).text().replace(/\t/g, '');
                        break;
                    case 3:
                        var type = $(this).find('strong').text().replace(/\t/g, '').split("- ");;
                        typePayment = type[1];
                        break;
                }
                counter++;
            });

            nfce["details"] = {
                totalItems: totalItems,
                totalValue: totalValue,
                paidValue: paidValue,
                typePayment: typePayment
            };

            let socialName;
            let cnpj;
            let stateRegistration;
            let uf;
            let operationDestination;
            let finalCostumer;
            let buyerPresence;
            let model;
            let series;
            let number;
            let issuanceDate;
            let totalValueService;
            let icmsCalculationBasis;
            let icmsValue;
            let protocol;

            $('#collapse4').each(function (i) {
                socialName = $(this).find('td').eq(0).text();
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
                totalValueService = $(this).find('td').eq(11).text().replace('R$ ', '').replace(',', '.');
                icmsCalculationBasis = $(this).find('td').eq(12).text().replace('R$ ', '').replace(',', '.');
                icmsValue = $(this).find('td').eq(13).text().replace('R$ ', '').replace(',', '.');
                protocol = $(this).find('td').eq(14).text();
            });

            nfce["detailsNfce"] = {
                totalItems: totalItems,
                totalValue: totalValue,
                paidValue: paidValue,
                typePayment: typePayment,
                socialName: socialName,
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

module.exports = router