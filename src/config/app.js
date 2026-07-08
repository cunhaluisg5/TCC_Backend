const DEFAULT_DEVELOPMENT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8081'
];

module.exports = {
  port: Number(process.env.PORT || 3000),
  corsOrigin: normalizeOrigins(process.env.CORS_ORIGIN, process.env.NODE_ENV || 'development'),
  nodeEnv: process.env.NODE_ENV || 'development',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 10),
  jsonLimit: process.env.JSON_LIMIT || '1mb',
  publicBaseUrl: String(process.env.PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '')
};

function normalizeOrigins(value, nodeEnv) {
  const configuredOrigins = value
    ? value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
    : [];

  if (!configuredOrigins.length) {
    return nodeEnv === 'production' ? '*' : DEFAULT_DEVELOPMENT_ORIGINS;
  }

  if (nodeEnv === 'production') {
    return configuredOrigins;
  }

  return Array.from(new Set([
    ...configuredOrigins,
    ...DEFAULT_DEVELOPMENT_ORIGINS,
  ]));
}