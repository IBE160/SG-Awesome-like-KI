import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Assuming this is set in .env.test or similar

// Create a Supabase client for testing
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY); // Admin client for cleanup

describe('Profile RLS Policies', () => {
  let userA: any;
  let userB: any;
  let supabaseA: any;
  let supabaseB: any;

  beforeAll(async () => {
    // Create User A
    const { data: dataA, error: errorA } = await supabaseAdmin.auth.admin.createUser({
      email: `userA-${randomUUID().split('-')[0]}@test.com`, // Use a valid-looking domain
      password: 'password123',
      email_confirm: true, // Directly confirm email
    });
    if (errorA) {
      console.error('Error creating user A:', errorA.message, errorA);
      throw errorA;
    }
    userA = dataA?.user;
    if (!userA) throw new Error('User A not created');

    // Sign in User A to get a client with their session
    const { data: sessionA, error: signInErrorA } = await supabase.auth.signInWithPassword({
      email: userA.email!, // Use userA.email (non-null assertion)
      password: 'password123',
    });
    if (signInErrorA) console.error('Error signing in user A:', signInErrorA.message);
    supabaseA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${sessionA.session?.access_token}`,
        },
      },
    });

    // Create User B
    const { data: dataB, error: errorB } = await supabaseAdmin.auth.admin.createUser({
      email: `userB-${randomUUID().split('-')[0]}@test.com`,
      password: 'password123',
      email_confirm: true,
    });
    if (errorB) {
      console.error('Error creating user B:', errorB.message, errorB);
      throw errorB;
    }
    userB = dataB?.user;
    if (!userB) throw new Error('User B not created');

    // Sign in User B to get a client with their session
    const { data: sessionB, error: signInErrorB } = await supabase.auth.signInWithPassword({
      email: userB.email!,
      password: 'password123',
    });
    if (signInErrorB) console.error('Error signing in user B:', signInErrorB.message);
    supabaseB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${sessionB.session?.access_token}`,
        },
      },
    });

    // Wait for triggers to create profiles
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, 20000); // Increased timeout for user creation and sign-in

  afterAll(async () => {
    // Clean up User A
    if (userA) {
      await supabaseAdmin.from('profiles').delete().eq('id', userA.id); // Use admin client
      await supabaseAdmin.auth.admin.deleteUser(userA.id); // Use admin client
    }
    // Clean up User B
    if (userB) {
      await supabaseAdmin.from('profiles').delete().eq('id', userB.id); // Use admin client
      await supabaseAdmin.auth.admin.deleteUser(userB.id); // Use admin client
    }
  }, 20000); // Increased timeout for cleanup

  it('User A should be able to view their own profile', async () => {
    const { data, error } = await supabaseA.from('profiles').select('*').eq('id', userA.id).single();
    expect(error).toBeNull();
    expect(data).toHaveProperty('id', userA.id);
    expect(data).toHaveProperty('full_name'); // Expect full_name to exist, can be null initially
  });

  it('User A should NOT be able to view User B\'s profile', async () => {
    const { data, error } = await supabaseA.from('profiles').select('*').eq('id', userB.id).single();
    expect(data).toBeNull();
    expect(error?.code).toBe('PGRST116'); // Correctly expects error code for no rows with .single()
  });

  it('User A should be able to update their own profile', async () => {
    const newName = `Updated Name A - ${randomUUID()}`;
    const { data, error } = await supabaseA.from('profiles').update({ full_name: newName }).eq('id', userA.id).select().single();
    expect(error).toBeNull();
    expect(data).toHaveProperty('full_name', newName);
  });

  it('User A should NOT be able to update User B\'s profile', async () => {
    const newName = `Malicious Update - ${randomUUID()}`;
    const { data, error } = await supabaseA.from('profiles').update({ full_name: newName }).eq('id', userB.id).select().single();
    expect(data).toBeNull();
    expect(error?.code).toBe('PGRST116'); // Correctly expects error code for unauthorized update with .single()
  });

});