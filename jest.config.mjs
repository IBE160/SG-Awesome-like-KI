import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^app/(.*)$': '<rootDir>/app/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', {
      // Use this if your project needs to support specific features not covered by next/babel
      // or if you have specific babel plugins/presets to apply
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
      // This is crucial for handling ES Modules in node_modules
      // Ensure 'babel-jest' is used for these modules
      plugins: [
        // Add any other babel plugins if necessary
      ]
    }],
  },
  transformIgnorePatterns: [
    // Ensure all node_modules are transformed, except the ones we explicitly want to ignore
    // This effectively makes Jest transform the problematic ES modules like 'node-fetch'
    'node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)
