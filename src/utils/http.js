function sendOk(res, payload = {}) {
  return res.status(200).send(payload);
}

function sendCreated(res, payload = {}) {
  return res.status(201).send(payload);
}

function sendNoContent(res) {
  return res.status(204).send();
}

module.exports = {
  sendOk,
  sendCreated,
  sendNoContent
};
