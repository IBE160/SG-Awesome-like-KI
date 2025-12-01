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

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
    })),
    redirect: jest.fn(),
  },
}));
