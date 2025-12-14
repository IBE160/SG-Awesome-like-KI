import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFiles: ['<rootDir>/jest.setup.global-env.ts'], // Add this line
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['next/babel', '@babel/preset-typescript'] }],
    '^.+\\.(js|jsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/', // Ignore E2E tests
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);


