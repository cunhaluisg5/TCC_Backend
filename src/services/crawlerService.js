const axios = require('axios');
const cheerio = require('cheerio');

const { HttpError } = require('../utils/httpError');
const {
  cleanText,
  isMgNfce,
  normalizeAccessKey,
  normalizeDecimal,
  normalizeNfcePayload,
} = require('../utils/nfceNormalizer');

function extractAccessKey(url, $) {
  const collapseText = cleanText($('#collapseTwo').text());
  if (collapseText) {
    return normalizeAccessKey(collapseText);
  }

  const urlMatch = String(url || '').match(/p=([^&]+)/i);
  if (urlMatch && urlMatch[1]) {
    return normalizeAccessKey(urlMatch[1].split('|')[0]);
  }

  const htmlMatch = $.html().match(/[A-Z0-9-]{10,}/);
  return htmlMatch ? normalizeAccessKey(htmlMatch[0]) : '';
}

function extractItems($) {
  const items = [];

  $('#myTable tr').each((index, row) => {
    const cells = $(row).find('td');
    if (!cells.length) {
      return;
    }

    const firstCellText = cleanText($(cells[0]).text().replace(/\n/g, ' '));
    const itemName = cleanText(firstCellText.replace(/\(C[oó]digo:[^)]+\)/i, ''));
    const itemCodeMatch = firstCellText.match(/C[oó]digo:\s*([^)]+)/i);
    const qtdRaw = cleanText($(cells[1]).text()).replace(/^Qtde total de [ií]tens:\s*/i, '');
    const unitRaw = cleanText($(cells[2]).text()).replace(/^UN:\s*/i, '');
    const valueRaw = cleanText($(cells[3]).text()).replace(/^Valor total R\$:\s*/i, '');

    if (!itemName && !valueRaw) {
      return;
    }

    items.push({
      itemName,
      itemCode: cleanText(itemCodeMatch ? itemCodeMatch[1] : ''),
      qtdItem: qtdRaw,
      unItem: unitRaw,
      itemValue: normalizeDecimal(valueRaw),
    });
  });

  return items;
}

function extractSummary($) {
  const summaryRows = $('.row').map((_, row) => cleanText($(row).text())).get().filter(Boolean);
  const totalItems = summaryRows[0] || '0';
  const totalValue = summaryRows[1] || '0';
  const paidValue = summaryRows[2] || totalValue;
  const paymentRow = summaryRows[3] || '';
  const typePayment = paymentRow.includes('-') ? cleanText(paymentRow.split('-').pop()) : paymentRow;

  return {
    totalItems,
    totalValue,
    paidValue,
    typePayment,
  };
}

function extractDetails($, url) {
  const cells = $('#collapse4 td').map((_, cell) => cleanText($(cell).text())).get();

  return {
    accesskey: extractAccessKey(url, $),
    socialName: cells[0] || '',
    cnpj: cells[1] || '',
    stateRegistration: cells[2] || '',
    uf: cells[3] || '',
    operationDestination: cells[4] || '',
    finalCostumer: cells[5] || '',
    buyerPresence: cells[6] || '',
    model: cells[7] || '',
    series: cells[8] || '',
    number: cells[9] || '',
    issuanceDate: cells[10] || '',
    totalValueService: cells[11] || '',
    icmsCalculationBasis: cells[12] || '',
    icmsValue: cells[13] || '',
    protocol: cells[14] || '',
    url,
  };
}

async function crawl(url) {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 ScanNFCe/2.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);
    const items = extractItems($);
    const details = extractSummary($);
    const detailsNfce = extractDetails($, url);
    const normalized = normalizeNfcePayload({
      nfce: {
        items,
        details,
        detailsNfce,
      },
    });

    if (!normalized.nfce.detailsNfce.accesskey) {
      throw new HttpError(422, 'Nao foi possivel identificar a chave de acesso da NFC-e.');
    }

    if (!isMgNfce(normalized.nfce.detailsNfce)) {
      throw new HttpError(422, 'A leitura nao corresponde a uma NFC-e valida de Minas Gerais.');
    }

    return normalized;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (error.response) {
      throw new HttpError(502, 'O portal da Fazenda retornou uma resposta inesperada.');
    }

    throw new HttpError(503, 'Nao foi possivel consultar o portal da Fazenda no momento.');
  }
}

module.exports = {
  crawl,
};
