// jest.setup.ts
// Learn more: https://jestjs.io/docs/setup-files

import '@testing-library/jest-dom'
import fetch, { Headers, Request, Response } from 'node-fetch'

// Polyfill fetch for Jest test environment
if (!global.fetch) {
  global.fetch = fetch as any
  global.Headers = Headers as any
  global.Request = Request as any
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
