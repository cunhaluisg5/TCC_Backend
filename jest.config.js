module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/services/**/*.js',
    'src/middlewares/**/*.js',
    'src/controllers/**/*.js',
    '!src/docs/**/*.js'
  ]
};
