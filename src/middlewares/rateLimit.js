const rateLimit = require('express-rate-limit');
const {
  authRateLimitMax,
  rateLimitMax,
  rateLimitWindowMs
} = require('../config/app');

const defaultLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  limit: rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisicoes em pouco tempo. Tente novamente mais tarde.' }
});

const authLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  limit: authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de autenticacao. Tente novamente mais tarde.' }
});

module.exports = {
  authLimiter,
  defaultLimiter
};
