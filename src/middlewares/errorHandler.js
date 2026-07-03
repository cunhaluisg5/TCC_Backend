function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || 500;
  const message = error.message || 'Erro interno do servidor!';

  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).send({ error: message });
}

module.exports = {
  errorHandler
};
