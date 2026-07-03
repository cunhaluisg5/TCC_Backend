const nfceRepository = require('../repositories/nfceRepository');
const { HttpError } = require('../utils/httpError');

async function listAll() {
  return { nfces: await nfceRepository.listNfces() };
}

async function listByUser(userId) {
  return { nfces: await nfceRepository.listNfcesByUser(userId) };
}

async function findById(nfceId) {
  const nfce = await nfceRepository.findNfceById(nfceId);

  if (!nfce) {
    throw new HttpError(404, 'NFC-e nao encontrada!');
  }

  return { nfce };
}

async function create(userId, payload) {
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

async function update(nfceId, payload) {
  const { items, details, detailsNfce } = payload.nfce;
  const nfce = await nfceRepository.updateNfce(nfceId, {
    items,
    details,
    detailsNfce
  });

  if (!nfce) {
    throw new HttpError(404, 'NFC-e nao encontrada!');
  }

  return { nfce };
}

async function remove(nfceId) {
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
