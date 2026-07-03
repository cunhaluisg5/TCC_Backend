function normalizeOrigins(value) {
  if (!value) {
    return '*';
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  corsOrigin: normalizeOrigins(process.env.CORS_ORIGIN),
  nodeEnv: process.env.NODE_ENV || 'development',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 10),
  jsonLimit: process.env.JSON_LIMIT || '1mb'
};
