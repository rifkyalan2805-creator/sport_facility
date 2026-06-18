/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  // Menyiapkan extension uuid-ossp + push schema ke DB test sebelum test jalan.
  globalSetup: '<rootDir>/tests/integration/globalSetup.js',
  testTimeout: 30000,
};
