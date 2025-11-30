import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

describe('Supabase Client Initialization', () => {
  it('should initialize the Supabase client without errors', () => {
    // Mock the cookies function if necessary for a true unit test, or accept Next.js test environment constraints
    const mockCookies = () => ({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    });
    const supabase: SupabaseClient = createClient(mockCookies() as unknown as ReadonlyRequestCookies);
    expect(supabase).toBeDefined();
    expect(typeof supabase.auth.getSession).toBe('function');
    expect(typeof supabase.from).toBe('function');
  });
});
