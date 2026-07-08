const nfceRepository = require('../repositories/nfceRepository');
const { HttpError } = require('../utils/httpError');
const { normalizeAccessKey, normalizeNfcePayload, normalizePersistedNfce } = require('../utils/nfceNormalizer');
const { validateNfcePayload } = require('../validators/nfceValidators');

async function listAll() {
  const nfces = await nfceRepository.listNfces();
  return { nfces: nfces.map(normalizePersistedNfce) };
}

async function listByUser(currentUserId, userId) {
  if (String(currentUserId) !== String(userId)) {
    throw new HttpError(403, 'Acesso negado para este usuário!');
  }

  const nfces = await nfceRepository.listNfcesByUser(userId);
  return { nfces: nfces.map(normalizePersistedNfce) };
}

async function findById(currentUserId, nfceId) {
  const nfce = await nfceRepository.findNfceById(nfceId);

  if (!nfce) {
    throw new HttpError(404, 'NFC-e não encontrada!');
  }

  if (!nfce.user || String(nfce.user.id) !== String(currentUserId)) {
    throw new HttpError(403, 'Acesso negado para esta NFC-e!');
  }

  return { nfce: normalizePersistedNfce(nfce) };
}

async function create(userId, payload) {
  validateNfcePayload(payload);
  const normalizedPayload = normalizeNfcePayload(payload);
  const { items, details, detailsNfce } = normalizedPayload.nfce;
  const accesskey = normalizeAccessKey(detailsNfce.accesskey);

  if (await nfceRepository.findNfceByAccessKeyForUser(accesskey, userId)) {
    throw new HttpError(400, 'NFC-e já existente!');
  }

  const nfce = await nfceRepository.createNfce({
    userId,
    items,
    details,
    detailsNfce,
  });

  return { nfce: normalizePersistedNfce(nfce) };
}

async function update(currentUserId, nfceId, payload) {
  validateNfcePayload(payload);
  const current = await nfceRepository.findNfceById(nfceId);

  if (!current) {
    throw new HttpError(404, 'NFC-e não encontrada!');
  }

  if (!current.user || String(current.user.id) !== String(currentUserId)) {
    throw new HttpError(403, 'Acesso negado para esta NFC-e!');
  }

  const normalizedPayload = normalizeNfcePayload(payload);
  const { items, details, detailsNfce } = normalizedPayload.nfce;
  const duplicated = await nfceRepository.findNfceByAccessKeyForUser(detailsNfce.accesskey, currentUserId);

  if (duplicated && String(duplicated.id) !== String(nfceId)) {
    throw new HttpError(400, 'NFC-e já existente!');
  }

  const nfce = await nfceRepository.updateNfce(nfceId, {
    items,
    details,
    detailsNfce,
  });

  return { nfce: normalizePersistedNfce(nfce) };
}

async function remove(currentUserId, nfceId) {
  const current = await nfceRepository.findNfceById(nfceId);

  if (!current) {
    throw new HttpError(404, 'NFC-e não encontrada!');
  }

  if (!current.user || String(current.user.id) !== String(currentUserId)) {
    throw new HttpError(403, 'Acesso negado para esta NFC-e!');
  }

  await nfceRepository.deleteNfce(nfceId);
}

module.exports = {
  create,
  findById,
  listAll,
  listByUser,
  remove,
  update,
};

