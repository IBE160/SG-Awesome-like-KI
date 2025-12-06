// jest.setup.ts
// Learn more: https://jestjs.io/docs/setup-files

import '@testing-library/jest-dom';

// Polyfill TextEncoder for Jest environment
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

// Polyfill ReadableStream for Jest environment
if (typeof global.ReadableStream === 'undefined') {
  require('web-streams-polyfill'); // Polyfill global ReadableStream
}

// Polyfill TransformStream for Jest environment
if (typeof global.TransformStream === 'undefined') {
  require('web-streams-polyfill'); // Polyfill global TransformStream
}

// Polyfill fetch and related globals for Jest test environment if they don't exist
// This avoids direct import of 'node-fetch' which can cause ES module issues
class SimpleMockHeaders {
  private map: Map<string, string>;

  constructor(init?: HeadersInit) {
    this.map = new Map();
    if (init) {
      if (init instanceof Headers || init instanceof SimpleMockHeaders) {
        init.forEach((value, key) => this.map.set(key, value));
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.map.set(key, value));
      } else {
        for (const key in init) {
          if (Object.prototype.hasOwnProperty.call(init, key)) {
            this.map.set(key, init[key]);
          }
        }
      }
    }
  }

  append(name: string, value: string): void { this.map.set(name.toLowerCase(), value); }
  delete(name: string): void { this.map.delete(name.toLowerCase()); }
  get(name: string): string | null { return this.map.get(name.toLowerCase()) || null; }
  has(name: string): boolean { return this.map.has(name.toLowerCase()); }
  set(name: string, value: string): void { this.map.set(name.toLowerCase(), value); }
  forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void {
    this.map.forEach((value, key) => callbackfn.call(thisArg, value, key, this as unknown as Headers));
  }
  *entries(): IterableIterator<[string, string]> { yield* this.map.entries(); }
  *keys(): IterableIterator<string> { yield* this.map.keys(); }
  *values(): IterableIterator<string> { yield* this.map.values(); }
  getSetCookie(): string[] { return []; }
  [Symbol.iterator](): IterableIterator<[string, string]> { return this.entries(); }
}

class MockResponse implements Response {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  // @ts-ignore
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;
  readonly trailer: Promise<Headers>;

  constructor(body: BodyInit | null = null, init: ResponseInit = {}) {
    this.body = body instanceof ReadableStream
      ? body
      : (body ? new ReadableStream<Uint8Array>({
          start(controller) {
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(String(body));
            const buffer = new ArrayBuffer(encodedData.length);
            new Uint8Array(buffer).set(encodedData);
            controller.enqueue(new Uint8Array(buffer));
            controller.close();
          }
        }) : null);
    this.headers = new SimpleMockHeaders(init.headers) as unknown as Headers;
    this.ok = init.status ? (init.status >= 200 && init.status < 300) : true;
    this.redirected = false;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.type = 'default';
    this.url = 'mock://response.url';
    this.bodyUsed = false;
    this.trailer = Promise.resolve(new SimpleMockHeaders() as unknown as Headers);
  }

  arrayBuffer(): Promise<ArrayBuffer> { return Promise.resolve(new ArrayBuffer(0)); }
  blob(): Promise<Blob> { return Promise.resolve(new Blob()); }
  formData(): Promise<FormData> { return Promise.resolve(new FormData()); }
  json(): Promise<any> { return Promise.resolve({}); }
  text(): Promise<string> { return Promise.resolve(''); }
  clone(): Response {
    return new MockResponse(this.body, {
      headers: this.headers,
      status: this.status,
      statusText: this.statusText,
    }) as unknown as Response;
  }
  // @ts-ignore
  bytes(): Promise<Uint8Array> { return Promise.resolve(new Uint8Array()); }

  static error(): Response { return new MockResponse(null, { status: 0, statusText: '' }) as unknown as Response; }
  static json(data: any, init?: ResponseInit): Response { return new MockResponse(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' }, ...init }) as unknown as Response; }
  static redirect(url: string | URL, status: number = 302): Response { return new MockResponse(null, { status, headers: { Location: url.toString() } }) as unknown as Response; }
}

if (typeof global.fetch === 'undefined') {
  global.Headers = SimpleMockHeaders as unknown as typeof Headers;
  global.Response = MockResponse as unknown as typeof Response; // Assign our mock Response
  global.fetch = jest.fn(() =>
    Promise.resolve(new MockResponse(null, {
      status: 200,
      statusText: 'OK',
      headers: new SimpleMockHeaders() as unknown as Headers,
    }) as unknown as Response)
  );
  global.Request = jest.fn();
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
