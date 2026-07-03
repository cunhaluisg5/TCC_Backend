const nfceRepository = require('../repositories/nfceRepository');
const { HttpError } = require('../utils/httpError');
const { validateNfcePayload } = require('../validators/nfceValidators');

async function listAll() {
  return { nfces: await nfceRepository.listNfces() };
}

async function listByUser(currentUserId, userId) {
  if (String(currentUserId) !== String(userId)) {
    throw new HttpError(403, 'Acesso negado para este usuario!');
  }

  return { nfces: await nfceRepository.listNfcesByUser(userId) };
}

async function findById(currentUserId, nfceId) {
  const nfce = await nfceRepository.findNfceById(nfceId);

  if (!nfce) {
    throw new HttpError(404, 'NFC-e nao encontrada!');
  }

  if (!nfce.user || String(nfce.user.id) !== String(currentUserId)) {
    throw new HttpError(403, 'Acesso negado para esta NFC-e!');
  }

  return { nfce };
}

async function create(userId, payload) {
  validateNfcePayload(payload);
  const { items, details, detailsNfce } = payload.nfce;
  const { accesskey } = detailsNfce;

  if (await nfceRepository.findNfceByAccessKeyForUser(accesskey, userId)) {
    throw new HttpError(400, 'NFC-e ja existente!');
  }

  const nfce = await nfceRepository.createNfce({
    userId,
    items,
    details,
    detailsNfce
  });

  return { nfce };
}

async function update(currentUserId, nfceId, payload) {
  validateNfcePayload(payload);
  const current = await nfceRepository.findNfceById(nfceId);

  if (!current) {
    throw new HttpError(404, 'NFC-e nao encontrada!');
  }

  if (!current.user || String(current.user.id) !== String(currentUserId)) {
    throw new HttpError(403, 'Acesso negado para esta NFC-e!');
  }

  const { items, details, detailsNfce } = payload.nfce;
  const nfce = await nfceRepository.updateNfce(nfceId, {
    items,
    details,
    detailsNfce
  });

  return { nfce };
}

async function remove(currentUserId, nfceId) {
  const current = await nfceRepository.findNfceById(nfceId);

  if (!current) {
    throw new HttpError(404, 'NFC-e nao encontrada!');
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
  update
};
