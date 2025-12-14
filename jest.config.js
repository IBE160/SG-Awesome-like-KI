const nextJest = require('next/jest.js');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFiles: ['<rootDir>/jest.setup.global-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$': ['babel-jest', { presets: ['next/babel', '@babel/preset-typescript'] }],
    '^.+\.(js|jsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(?:.pnpm/)?(@shadcn/ui|@radix-ui|lucide-react|uuid)/)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
};

module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
});
