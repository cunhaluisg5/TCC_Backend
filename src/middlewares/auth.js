const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const { HttpError } = require('../utils/httpError');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new HttpError(401, 'Nenhum token fornecido!'));
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return next(new HttpError(401, 'Erro no token!'));
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return next(new HttpError(401, 'Token formatado incorretamente!'));
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return next(new HttpError(401, 'Token invalido!'));
    }

    req.userId = decoded.id;
    return next();
  });
};
