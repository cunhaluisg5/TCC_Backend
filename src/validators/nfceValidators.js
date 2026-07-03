const validator = require('validator');
const { ensure } = require('../utils/validation');

function validateCrawlerRequest(payload = {}) {
  ensure(typeof payload.url === 'string' && validator.isURL(payload.url, { require_protocol: true }), 'URL invalida!');
}

function validateNfcePayload(payload = {}) {
  ensure(payload && typeof payload === 'object' && payload.nfce && typeof payload.nfce === 'object', 'Payload da NFC-e invalido!');

  const { items, details, detailsNfce } = payload.nfce;

  ensure(Array.isArray(items), 'Itens da NFC-e invalidos!');
  ensure(details && typeof details === 'object', 'Detalhes da NFC-e invalidos!');
  ensure(detailsNfce && typeof detailsNfce === 'object', 'Dados principais da NFC-e invalidos!');
  ensure(typeof detailsNfce.accesskey === 'string' && detailsNfce.accesskey.trim().length >= 10, 'Chave de acesso invalida!');
}

module.exports = {
  validateCrawlerRequest,
  validateNfcePayload
};
