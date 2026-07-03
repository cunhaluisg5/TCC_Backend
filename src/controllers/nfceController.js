const nfceService = require('../services/nfceService');
const { sendCreated, sendNoContent, sendOk } = require('../utils/http');

async function listAll(req, res) {
  return sendOk(res, await nfceService.listAll());
}

async function listByUser(req, res) {
  return sendOk(res, await nfceService.listByUser(req.userId, req.params.userId));
}

async function findById(req, res) {
  return sendOk(res, await nfceService.findById(req.userId, req.params.nfceId));
}

async function create(req, res) {
  return sendCreated(res, await nfceService.create(req.userId, req.body));
}

async function update(req, res) {
  return sendCreated(res, await nfceService.update(req.userId, req.params.nfceId, req.body));
}

async function remove(req, res) {
  await nfceService.remove(req.userId, req.params.nfceId);
  return sendNoContent(res);
}

module.exports = {
  create,
  findById,
  listAll,
  listByUser,
  remove,
  update
};
