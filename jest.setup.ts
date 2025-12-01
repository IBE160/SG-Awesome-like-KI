// jest.setup.ts
// Learn more: https://jestjs.io/docs/setup-files

import '@testing-library/jest-dom'
import fetch, { Headers, Request, Response } from 'node-fetch'

// Polyfill fetch for Jest test environment
if (!global.fetch) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.fetch = fetch as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Headers = Headers as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Request = Request as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Response = Response as any
}

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));
