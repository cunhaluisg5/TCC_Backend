const MG_STATE_CODE = '31';

function cleanText(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAccessKey(value) {
  return cleanText(value).toUpperCase().replace(/[^0-9A-Z]/g, '');
}

function normalizeDigits(value) {
  return cleanText(value).replace(/\D/g, '');
}

function normalizeInteger(value, fallback = 0) {
  const digits = normalizeDigits(value);
  if (!digits) {
    return String(fallback);
  }

  const numeric = Number.parseInt(digits, 10);
  return Number.isFinite(numeric) ? String(numeric) : String(fallback);
}

function normalizeDecimal(value, fallback = '0.00') {
  const raw = cleanText(value)
    .replace(/^R\$\s*/i, '')
    .replace(/[^\d,.-]/g, '');

  if (!raw) {
    return fallback;
  }

  let normalized = raw;
  if (normalized.includes(',') && normalized.includes('.')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (normalized.includes(',')) {
    normalized = normalized.replace(',', '.');
  }

  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : fallback;
}

function normalizeDateTime(value) {
  const raw = cleanText(value);
  if (!raw) {
    return '';
  }

  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (match) {
    const [, day, month, year, hours = '00', minutes = '00', seconds = '00'] = match;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year} ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  const seconds = String(parsed.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function normalizeItem(item = {}, index = 0) {
  const itemName = cleanText(item.itemName || item.name || `Item ${index + 1}`);
  const itemCode = cleanText(item.itemCode || item.code);
  const qtdItem = normalizeDecimal(item.qtdItem ?? item.quantity ?? '0', '0.00');
  const unItem = cleanText(item.unItem || item.unit);
  const itemValue = normalizeDecimal(item.itemValue ?? item.value);

  return {
    ...item,
    itemName,
    itemCode,
    qtdItem,
    unItem,
    itemValue,
  };
}

function normalizeItems(items = []) {
  return items
    .map((item, index) => normalizeItem(item, index))
    .filter((item) => item.itemName || item.itemCode || Number(item.itemValue) > 0);
}

function normalizeNfcePayload(payload = {}) {
  const source = payload && payload.nfce && typeof payload.nfce === 'object'
    ? payload.nfce
    : payload;

  const rawDetails = source.details || {};
  const rawDetailsNfce = source.detailsNfce || {};
  const items = normalizeItems(source.items || []);

  const totalItems = normalizeInteger(
    rawDetails.totalItems ?? rawDetailsNfce.totalItems ?? items.length,
    items.length
  );
  const totalValue = normalizeDecimal(rawDetails.totalValue ?? rawDetailsNfce.totalValue);
  const paidValue = normalizeDecimal(rawDetails.paidValue ?? rawDetailsNfce.paidValue ?? totalValue, totalValue);
  const accesskey = normalizeAccessKey(rawDetailsNfce.accesskey || rawDetails.accesskey);

  const details = {
    totalItems,
    totalValue,
    paidValue,
    typePayment: cleanText(rawDetails.typePayment ?? rawDetailsNfce.typePayment),
  };

  const detailsNfce = {
    accesskey,
    totalItems,
    totalValue,
    paidValue,
    typePayment: details.typePayment,
    socialName: cleanText(rawDetailsNfce.socialName),
    cnpj: normalizeDigits(rawDetailsNfce.cnpj),
    stateRegistration: cleanText(rawDetailsNfce.stateRegistration),
    uf: cleanText(rawDetailsNfce.uf).toUpperCase(),
    operationDestination: cleanText(rawDetailsNfce.operationDestination),
    finalCostumer: cleanText(rawDetailsNfce.finalCostumer),
    buyerPresence: cleanText(rawDetailsNfce.buyerPresence),
    model: cleanText(rawDetailsNfce.model),
    series: cleanText(rawDetailsNfce.series),
    number: cleanText(rawDetailsNfce.number),
    issuanceDate: normalizeDateTime(rawDetailsNfce.issuanceDate),
    totalValueService: normalizeDecimal(rawDetailsNfce.totalValueService),
    icmsCalculationBasis: normalizeDecimal(rawDetailsNfce.icmsCalculationBasis),
    icmsValue: normalizeDecimal(rawDetailsNfce.icmsValue),
    protocol: cleanText(rawDetailsNfce.protocol),
    url: cleanText(rawDetailsNfce.url),
  };

  return {
    nfce: {
      items,
      details,
      detailsNfce,
    },
  };
}

function normalizePersistedNfce(nfce = {}) {
  const normalized = normalizeNfcePayload({
    nfce: {
      items: nfce.items || [],
      details: nfce,
      detailsNfce: nfce,
    },
  }).nfce;

  return {
    ...nfce,
    ...normalized.details,
    ...normalized.detailsNfce,
    items: normalized.items,
  };
}

function isMgNfce(detailsNfce = {}) {
  const uf = cleanText(detailsNfce.uf).toUpperCase();
  const accesskey = normalizeAccessKey(detailsNfce.accesskey);
  return uf === 'MG' || accesskey.startsWith(MG_STATE_CODE);
}

module.exports = {
  cleanText,
  isMgNfce,
  normalizeAccessKey,
  normalizeDateTime,
  normalizeDecimal,
  normalizeInteger,
  normalizeItem,
  normalizeItems,
  normalizeNfcePayload,
  normalizePersistedNfce,
};
