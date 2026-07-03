const { HttpError } = require('../utils/httpError');

function ensure(condition, message) {
  if (!condition) {
    throw new HttpError(400, message);
  }
}

module.exports = {
  ensure
};
