function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeBaseUrl(value, fallback) {
  return String(value || fallback).replace(/\/+$/, '');
}

module.exports = {
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  resetAppUrl: normalizeBaseUrl(process.env.RESET_APP_URL, 'https://resetscannfce.herokuapp.com')
};
