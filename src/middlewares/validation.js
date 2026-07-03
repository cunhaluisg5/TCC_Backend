const { HttpError } = require('../utils/httpError');

function validateBody(validator) {
  return (req, res, next) => {
    try {
      validator(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

function requireSameUserParam(paramName = 'userId') {
  return (req, res, next) => {
    if (String(req.params[paramName]) !== String(req.userId)) {
      return next(new HttpError(403, 'Acesso negado para este usuario!'));
    }

    return next();
  };
}

module.exports = {
  requireSameUserParam,
  validateBody
};
