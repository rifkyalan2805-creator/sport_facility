/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // Unit test memock Prisma. Integration test (butuh DB nyata) dikecualikan.
  testPathIgnorePatterns: ['/node_modules/', '/tests/integration/'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  clearMocks: true,
};
