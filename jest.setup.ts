// jest.setup.ts
// Learn more: https://jestjs.io/docs/setup-files

import { act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Polyfill for Web Streams API
import { ReadableStream, TransformStream } from 'web-streams-polyfill/dist/ponyfill.js';
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;

// Polyfill TextEncoder and TextDecoder for Jest environment
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Polyfill Blob.prototype.text for Jest environment
if (typeof Blob !== 'undefined' && !Blob.prototype.text) {
  Blob.prototype.text = function() {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsText(this);
    });
  };
}


let mockCookieStore: { [key: string]: { value: string; options?: any } } = {}; // Defined globally now

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) => mockCookieStore[name]),
    set: jest.fn((name: string, value: string, options: any) => {
      mockCookieStore[name] = { value, options };
    }),
    delete: jest.fn((name: string) => {
      delete mockCookieStore[name];
    }),
    _clear: () => {
      mockCookieStore = {}; // Clears the global mockCookieStore
    },
    _getAll: () => mockCookieStore,
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/mock-path'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}));

// Polyfill fetch and related globals for Jest test environment if they don't exist
// This avoids direct import of 'node-fetch' which can cause ES module issues
class mockSimpleHeaders {
  private map: Map<string, string>;

  constructor(init?: HeadersInit) {
    this.map = new Map();
    if (init) {
      if (init instanceof Headers || init instanceof mockSimpleHeaders) {
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

class mockResponseClass implements Response {
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

  private _bodyText: string | null; // Store the body as a string

  constructor(body: BodyInit | null = null, init: ResponseInit = {}) {
    this.headers = new mockSimpleHeaders(init.headers) as unknown as Headers;
    this.ok = init.status ? (init.status >= 200 && init.status < 300) : true;
    this.redirected = false;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.type = 'default';
    this.url = 'mock://response.url';
    this.bodyUsed = false;
    this.trailer = Promise.resolve(new mockSimpleHeaders() as unknown as Headers);

    // If body is not a ReadableStream, assume it's the raw content (string or object)
    if (body instanceof ReadableStream) {
      this.body = body;
      this._bodyText = null; // Will be read on demand if text() or json() is called
    } else if (body !== null && body !== undefined) {
      this._bodyText = String(body);
      this.body = new ReadableStream<Uint8Array>({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(String(body)));
          controller.close();
        }
      });
    } else {
      this.body = null;
      this._bodyText = null;
    }
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const text = await this.text();
    return new TextEncoder().encode(text).buffer;
  }
  blob(): Promise<Blob> { return Promise.resolve(new Blob()); }
  formData(): Promise<FormData> { return Promise.resolve(new FormData()); }
  async json(): Promise<any> {
    if (this._bodyText === null && this.body) {
      this._bodyText = await this.text(); // Read stream if not already read
    }
    if (this._bodyText) {
      try {
        return JSON.parse(this._bodyText);
      } catch (e) {
        throw new Error('Failed to parse JSON body: ' + e.message);
      }
    }
    return Promise.resolve({});
  }
  async text(): Promise<string> {
    if (this._bodyText !== null) {
      return this._bodyText;
    }
    if (this.body) {
      const reader = this.body.getReader();
      let result = '';
      let done;
      let value;
      while (({ done, value } = await reader.read()) && !done) {
        result += new TextDecoder().decode(value);
      }
      this._bodyText = result;
      return result;
    }
    return Promise.resolve('');
  }
  clone(): Response {
    return new mockResponseClass(this._bodyText, {
      headers: this.headers,
      status: this.status,
      statusText: this.statusText,
    }) as unknown as Response;
  }
  // @ts-ignore
  bytes(): Promise<Uint8Array> { return Promise.resolve(new Uint8Array()); }

  static error(): Response { return new mockResponseClass(null, { status: 0, statusText: '' }) as unknown as Response; }
  static json(data: any, init?: ResponseInit): Response { return new mockResponseClass(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' }, ...init }) as unknown as Response; }
  static redirect(url: string | URL, status: number = 302): Response { return new mockResponseClass(null, { status, headers: { Location: url.toString() } }) as unknown as Response; }
}

if (typeof global.fetch === 'undefined') {
  global.Headers = mockSimpleHeaders as unknown as typeof Headers;
  global.Response = mockResponseClass as unknown as typeof Response; // Assign our mock Response
  global.fetch = jest.fn(() =>
    Promise.resolve(new mockResponseClass(null, {
      status: 200,
      statusText: 'OK',
      headers: new mockSimpleHeaders() as unknown as Headers,
    }) as unknown as Response)
  );
  global.Request = jest.fn();
}

// --- Supabase Mocking Setup ---

// In-memory "database" for Supabase mock
let mockSupabaseDb: { [tableName: string]: any[] } = {};
let mockAuthUser: any = null; // Store authenticated user

// Pre-populate with some data for RLS testing
const MOCK_USER_ID = 'test-user-id';
const MOCK_CLASS_ID_1 = 'mock-class-id-1';
const MOCK_CLASS_ID_2 = 'mock-class-id-2';
const MOCK_SECTION_ID_1 = 'mock-section-id-1';
const MOCK_SECTION_ID_2 = 'mock-section-id-2';
const MOCK_STUDY_MATERIAL_ID_1 = 'mock-study-material-id-1';
const MOCK_STUDY_MATERIAL_ID_2 = 'mock-study-material-id-2';
const MOCK_GENERATED_CONTENT_ID_1 = 'mock-generated-content-id-1';
const MOCK_GENERATED_CONTENT_ID_2 = 'mock-generated-content-id-2';

const MOCK_OTHER_USER_ID = 'other-user-id';
const MOCK_OTHER_CLASS_ID = 'other-class-id';

const createMockQueryBuilder = (tableName: string) => {
  let query: any = {};
  let dataStore = mockSupabaseDb[tableName] || [];
  let currentLimit: number | null = null; // Added for limit method

  const filterData = (data: any[]) => {
    let filtered = [...data];
    if (query.eq) {
      filtered = filtered.filter(item => item[query.eq.column] === query.eq.value);
    }
    // Apply RLS - only return items owned by mockAuthUser
    if (mockAuthUser && ['profiles', 'classes', 'class_sections', 'study_materials', 'generated_content'].includes(tableName)) {
      filtered = filtered.filter(item => item.user_id === mockAuthUser.id);
    }

    // Apply limit if set
    if (currentLimit !== null) {
      filtered = filtered.slice(0, currentLimit);
    }
    return filtered;
  };

  const mockQueryBuilder = {
    eq: jest.fn((column, value) => {
      query.eq = { column, value };
      return mockQueryBuilder;
    }),
    limit: jest.fn((count: number) => { // Added limit method
      currentLimit = count;
      return mockQueryBuilder;
    }),
    select: jest.fn((columns = '*') => {
      query.select = columns;
      return {
        ...mockQueryBuilder,
        single: jest.fn(() => {
          const filtered = filterData(dataStore);
          if (filtered.length === 0) {
            return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'Row not found' } });
          }
          if (filtered.length > 1) {
            return Promise.resolve({ data: null, error: { code: 'PGRST117', message: 'Multiple rows found' } });
          }
          return Promise.resolve({ data: filtered[0], error: null });
        }),
        then: (resolve: any, reject: any) => {
          const filtered = filterData(dataStore);
          Promise.resolve(resolve({ data: filtered, error: null }));
        },
      };
    }),
    insert: jest.fn((payload: any) => {
      const newEntry = { id: 'mock-uuid-' + (dataStore.length + 1), ...payload, user_id: mockAuthUser?.id };
      dataStore.push(newEntry);
      mockSupabaseDb[tableName] = dataStore; // Update the "database"
      return {
        ...mockQueryBuilder,
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: newEntry, error: null })),
          then: (resolve: any, reject: any) => resolve({ data: [newEntry], error: null }),
        })),
      };
    }),
    update: jest.fn((payload: any) => {
      let updatedData: any[] = [];
      let error: any = null;
      if (query.eq) {
        dataStore = dataStore.map(item => {
          if (item[query.eq.column] === query.eq.value) {
            // Apply RLS for update as well
            if (item.user_id && item.user_id !== mockAuthUser?.id) {
              error = { message: 'Unauthorized update', status: 401 };
              return item;
            }
            const updatedItem = { ...item, ...payload, updated_at: new Date().toISOString() };
            updatedData.push(updatedItem);
            return updatedItem;
          }
          return item;
        });
        mockSupabaseDb[tableName] = dataStore;
      } else {
        // If no eq filter, update all. This might not be desired in tests.
        error = { message: 'Update without filter not fully supported in mock.' };
      }
      return {
        ...mockQueryBuilder,
        select: jest.fn(() => ({
          single: jest.fn(() => {
            if (updatedData.length === 1) {
              return Promise.resolve({ data: updatedData[0], error: null });
            }
            return Promise.resolve({ data: null, error: error || { message: 'No single row updated or multiple rows matched' } });
          }),
          then: (resolve: any, reject: any) => Promise.resolve(resolve({ data: updatedData, error: error })),
        })),
      };
    }),
    delete: jest.fn(() => {
      let deletedDataCount = 0;
      if (query.eq) {
        const initialLength = dataStore.length;
        dataStore = dataStore.filter(item => {
          // Apply RLS for delete
          if (item[query.eq.column] === query.eq.value && (!item.user_id || item.user_id === mockAuthUser?.id)) {
            return false; // delete this item
          }
          return true;
        });
        deletedDataCount = initialLength - dataStore.length;
        mockSupabaseDb[tableName] = dataStore;
      }
      return {
        ...mockQueryBuilder,
        single: jest.fn(() => Promise.resolve({ data: null, error: null })), // Delete usually returns null data
        then: (resolve: any, reject: any) => Promise.resolve(resolve({ data: [], error: null, count: deletedDataCount })),
      };
    }),
    upsert: jest.fn((payload: any) => {
      // Simple upsert logic: if ID exists, update; otherwise insert
      const idColumn = 'id'; // Assuming 'id' is the primary key for upsert
      const existingIndex = dataStore.findIndex(item => item[idColumn] === payload[idColumn]);
      let resultData;

      if (existingIndex !== -1) {
        // Apply RLS for upsert (update part)
        if (dataStore[existingIndex].user_id && dataStore[existingIndex].user_id !== mockAuthUser?.id) {
          return {
            ...mockQueryBuilder,
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Unauthorized upsert', status: 401 } })),
              then: (resolve: any, reject: any) => Promise.resolve(resolve({ data: [], error: { message: 'Unauthorized upsert', status: 401 } })),
            })),
          };
        }
        dataStore[existingIndex] = { ...dataStore[existingIndex], ...payload, updated_at: new Date().toISOString() };
        resultData = dataStore[existingIndex];
      } else {
        const newEntry = { id: payload[idColumn] || 'mock-uuid-' + (dataStore.length + 1), ...payload, created_at: new Date().toISOString(), user_id: mockAuthUser?.id };
        dataStore.push(newEntry);
        resultData = newEntry;
      }
      mockSupabaseDb[tableName] = dataStore;

      return {
        ...mockQueryBuilder,
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: resultData, error: null })),
          then: (resolve: any, reject: any) => Promise.resolve(resolve({ data: [resultData], error: null })),
        })),
      };
    }),
    // Reset internal query state after execution
    _reset: () => { query = {}; currentLimit = null; }, // Reset limit as well
  };
  return mockQueryBuilder;
};

export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(() => {
      return Promise.resolve({ data: { user: mockAuthUser }, error: null });
    }),
    signOut: jest.fn(() => {
      mockAuthUser = null;
      return Promise.resolve({ error: null });
    }),
    signInWithPassword: jest.fn(({ email, password }: any) => {
      if (email === 'test@example.com' && password === 'password') {
        mockAuthUser = { id: MOCK_USER_ID, email };
        return Promise.resolve({ data: { user: mockAuthUser, session: { access_token: 'mock-token' } }, error: null });
      }
      return Promise.resolve({ data: { user: null, session: null }, error: { message: 'Invalid credentials' } });
    }),
    signUp: jest.fn(({ email, password }: any) => {
      if (email && password) {
        mockAuthUser = { id: 'mock-user-id-' + Math.random(), email };
        return Promise.resolve({ data: { user: mockAuthUser, session: { access_token: 'mock-token' } }, error: null });
      }
      return Promise.resolve({ data: { user: null, session: null }, error: { message: 'Signup failed' } });
    }),
    getSession: jest.fn(() => Promise.resolve({ data: { session: mockAuthUser ? { access_token: 'mock-token', user: mockAuthUser } : null }, error: null })),
    resetPasswordForEmail: jest.fn((email: string) => {
      if (email === 'test@example.com') {
        return Promise.resolve({ data: { message: 'Password reset email sent.' }, error: null });
      }
      return Promise.resolve({ data: { message: 'User not found' }, error: { message: 'User not found' } });
    }),
    updateUser: jest.fn((attrs: any) => {
      if (mockAuthUser) {
        mockAuthUser = { ...mockAuthUser, ...attrs };
        return Promise.resolve({ data: { user: mockAuthUser }, error: null });
      }
      return Promise.resolve({ data: { user: null }, error: { message: 'No active user session', status: 401 } });
    }),
    onAuthStateChange: jest.fn((callback) => {
      // Simulate initial state
      callback('SIGNED_IN', { user: mockAuthUser, session: { access_token: 'mock-token' } });
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    }),
    admin: {
      createUser: jest.fn(({ email, password }: any) => {
        if (email && password) {
          const newUser = { id: 'mock-admin-user-id-' + Math.random(), email };
          return Promise.resolve({ data: { user: newUser }, error: null });
        }
        return Promise.resolve({ data: { user: null }, error: { message: 'Admin user creation failed' } });
      }),
      deleteUser: jest.fn((userId: string) => {
        if (userId === mockAuthUser?.id) {
          mockAuthUser = null;
        }
        return Promise.resolve({ data: null, error: null });
      }),
    },
    _setMockUser: (user: any) => { mockAuthUser = user; },
    _clearMockUser: () => { mockAuthUser = null; },
  },
  from: jest.fn((tableName: string) => createMockQueryBuilder(tableName)),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ data: { path: 'mock-path/file.txt' }, error: null })),
      remove: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
  // Add other top-level Supabase client properties/methods as needed
  _reset: () => {
    process.env.GEMINI_API_KEY = 'mock-api-key';
    process.env.GEMINI_MODEL_NAME = 'gemini-pro';
    mockSupabaseDb = {
      profiles: [
        { id: MOCK_USER_ID, full_name: 'Test User', user_id: MOCK_USER_ID },
        { id: MOCK_OTHER_USER_ID, full_name: 'Other User', user_id: MOCK_OTHER_USER_ID },
      ],
      classes: [
        { id: MOCK_CLASS_ID_1, name: 'Class 1', user_id: MOCK_USER_ID },
        { id: MOCK_CLASS_ID_2, name: 'Class 2', user_id: MOCK_USER_ID },
        { id: MOCK_OTHER_CLASS_ID, name: 'Other Class', user_id: MOCK_OTHER_USER_ID },
      ],
      class_sections: [
        { id: MOCK_SECTION_ID_1, name: 'Section 1', class_id: MOCK_CLASS_ID_1, user_id: MOCK_USER_ID },
        { id: MOCK_SECTION_ID_2, name: 'Section 2', class_id: MOCK_CLASS_ID_1, user_id: MOCK_USER_ID },
      ],
      study_materials: [
        {
          id: MOCK_STUDY_MATERIAL_ID_1,
          original_name: 'Doc 1',
          file_path: 'path/to/doc1.pdf',
          extracted_text: 'Extracted text from Doc 1',
          user_id: MOCK_USER_ID,
          class_id: MOCK_CLASS_ID_1,
          class_section_id: MOCK_SECTION_ID_1,
          generated_content: [
            { id: MOCK_GENERATED_CONTENT_ID_1, type: 'summary', content: { text: 'Summary of Doc 1' } }
          ],
        },
        {
          id: MOCK_STUDY_MATERIAL_ID_2,
          original_name: 'Doc 2',
          file_path: 'path/to/doc2.txt',
          extracted_text: 'Extracted text from Doc 2',
          user_id: MOCK_USER_ID,
          class_id: MOCK_CLASS_ID_1,
          class_section_id: null,
          generated_content: [],
        },
        {
          id: 'other-study-material-id',
          original_name: 'Other User Doc',
          file_path: 'path/to/other.pdf',
          extracted_text: 'Extracted text from Other User Doc',
          user_id: MOCK_OTHER_USER_ID,
          class_id: MOCK_OTHER_CLASS_ID,
          class_section_id: null,
          generated_content: [],
        }
      ],
      generated_content: [
        { id: MOCK_GENERATED_CONTENT_ID_1, study_material_id: MOCK_STUDY_MATERIAL_ID_1, type: 'summary', content: { text: 'Summary of Doc 1' }, user_id: MOCK_USER_ID },
        { id: MOCK_GENERATED_CONTENT_ID_2, study_material_id: MOCK_STUDY_MATERIAL_ID_1, type: 'quiz', content: { questions: ['Q1?', 'Q2?'] }, user_id: MOCK_USER_ID },
      ],
    };
    mockAuthUser = null;
    mockCookieStore = {};
    // Iterate over all table query builders and call their _reset method
    // Note: createMockQueryBuilder creates a new instance each time, so direct reset is not needed/possible here for old instances
    // Instead, the next call to from() will get a fresh query builder.
  },
};

// Mocking @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mocking @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => mockSupabaseClient),
  createBrowserClient: jest.fn(() => mockSupabaseClient),
}));

// Mocking the local createClient for server components
// jest.mock('@/lib/supabase/server', () => ({
//   createClient: jest.fn(() => mockSupabaseClient),
// }));

globalThis.mockSupabaseClient = mockSupabaseClient;

// Set up a default authenticated user for API routes before each test
beforeEach(() => {
  jest.resetModules(); // Clear module registry to ensure fresh imports
  mockSupabaseClient.auth._setMockUser({ id: MOCK_USER_ID, email: 'test@example.com' });
  // Also clear the database for each test to ensure isolation and re-populate
  mockSupabaseClient._reset();
});

// Clear the authenticated user after each test
afterEach(() => {
  mockSupabaseClient.auth._clearMockUser();
  mockSupabaseClient._reset(); // Reset again after each test
});