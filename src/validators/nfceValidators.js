const validator = require('validator');
const { ensure } = require('../utils/validation');
const { normalizeAccessKey } = require('../utils/nfceNormalizer');

function validateCrawlerRequest(payload = {}) {
  ensure(typeof payload.url === 'string' && validator.isURL(payload.url, { require_protocol: true }), 'URL invalida!');
  ensure(/(portalsped|nfce)\.fazenda\.mg\.gov\.br/i.test(payload.url), 'A leitura nao corresponde a uma NFC-e valida de Minas Gerais.');
}

function validateNfcePayload(payload = {}) {
  ensure(payload && typeof payload === 'object' && payload.nfce && typeof payload.nfce === 'object', 'Payload da NFC-e invalido!');

  const { items, details, detailsNfce } = payload.nfce;

  ensure(Array.isArray(items), 'Itens da NFC-e invalidos!');
  ensure(details && typeof details === 'object', 'Detalhes da NFC-e invalidos!');
  ensure(detailsNfce && typeof detailsNfce === 'object', 'Dados principais da NFC-e invalidos!');
  ensure(normalizeAccessKey(detailsNfce.accesskey).length >= 10, 'Chave de acesso invalida!');

  items.forEach((item, index) => {
    ensure(item && typeof item === 'object', `Item ${index + 1} da NFC-e invalido!`);
  });
}

module.exports = {
  validateCrawlerRequest,
  validateNfcePayload,
};
