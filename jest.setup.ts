// jest.setup.ts
// Learn more: https://jestjs.io/docs/setup-files

import '@testing-library/jest-dom';

// Polyfill fetch and related globals for Jest test environment if they don't exist
// This avoids direct import of 'node-fetch' which can cause ES module issues
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      ok: true,
      status: 200,
      headers: new Headers(),
    } as Response)
  );
  global.Headers = jest.fn(() => ({}));
  global.Request = jest.fn();
  global.Response = jest.fn();
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
