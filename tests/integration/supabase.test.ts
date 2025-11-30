import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';

// This is now a real integration test.
// It requires a running Supabase instance and network access.
// The credentials should be provided via .env.test
describe('Supabase Client Integration Test', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    // Initialize the client once for all tests
    supabase = createClient();
  });

  it('should initialize the Supabase client without errors', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.auth.getSession).toBe('function');
    expect(typeof supabase.from).toBe('function');
  });

  it('should be able to connect and receive a valid error for a non-existent table', async () => {
    // This query is expected to fail because the table does not exist.
    // A successful failure (i.e., getting a specific error from Supabase)
    // proves that the connection and authentication are working correctly.
    const { data, error } = await supabase
      .from('non_existent_table_for_testing')
      .select('*')
      .limit(1);

    // We expect an error object to be returned, not null
    expect(error).not.toBeNull();
    // The data should be null because of the error
    expect(data).toBeNull();
    // This is the specific PostgREST error for a table not being found.
    if (error) {
      expect(error.message).toContain('Could not find the table \'public.non_existent_table_for_testing\' in the schema cache');
    }
  }, 15000); // 15-second timeout for this integration test
});
