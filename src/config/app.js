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
  nodeEnv: process.env.NODE_ENV || 'development'
};
