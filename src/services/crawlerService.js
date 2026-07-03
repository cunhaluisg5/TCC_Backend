const axios = require('axios');
const cheerio = require('cheerio');

async function crawl(url) {
  const nfce = {};
  const items = [];

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  $('#myTable tr').each(function () {
    const itemText = $(this).find('td').eq(0).text().replace(/\t/g, '').split('\n');
    const itemName = itemText[0];
    const itemCode = (itemText[1] || '').replace('(CÃ³digo: ', '').replace(')', '');
    const qtdItem = $(this).find('td').eq(1).text().replace('Qtde total de Ã­tens: ', '');
    const unItem = $(this).find('td').eq(2).text().replace('UN: ', '');
    const itemValue = $(this).find('td').eq(3).text().replace('Valor total R$: R$ ', '')
      .replace(',', '.');

    items.push({ itemName, itemCode, qtdItem, unItem, itemValue });
  });

  nfce.items = items;

  let counter = 0;
  let totalItems;
  let totalValue;
  let paidValue;
  let typePayment;

  $('.row').each(function () {
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
      case 3: {
        const type = $(this).find('strong').text().replace(/\t/g, '').split('- ');
        typePayment = type[1];
        break;
      }
    }

    counter += 1;
  });

  nfce.details = { totalItems, totalValue, paidValue, typePayment };

  let accesskey;
  $('#collapseTwo').each(function () {
    accesskey = $(this).find('td').eq(0).text();
  });

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

  $('#collapse4').each(function () {
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

  nfce.detailsNfce = {
    accesskey,
    totalItems,
    totalValue,
    paidValue,
    typePayment,
    socialName,
    cnpj,
    stateRegistration,
    uf,
    operationDestination,
    finalCostumer,
    buyerPresence,
    model,
    series,
    number,
    issuanceDate,
    totalValueService,
    icmsCalculationBasis,
    icmsValue,
    protocol,
    url
  };

  return { nfce };
}

module.exports = {
  crawl
};
