
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://bqxxcsnnyeoqsipgrqoz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxeHhjc25ueWVvcXNpcGdycW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTU0NjcsImV4cCI6MjA4MDA3MTQ2N30.hz1zduc2CB8vbf7jeEl2xtIgnExKsd2q39DhleT7Hao";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseConnection() {
  console.log('Attempting to connect to Supabase...');
  try {
    // Attempt to sign up a user, which will validate the API key and URL
    const { data, error } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
    });

    if (error) {
      console.error('Connection failed. Supabase error:', error.message);
      if (error.message.includes('apiKey')) {
        console.error('This confirms the API key is invalid.');
      }
    } else {
      console.log('Successfully connected to Supabase and performed a test sign-up.');
      // IMPORTANT: We should immediately delete the test user
      // This part of the script might not be reached if permissions are strict, but it's good practice
      if (data.user) {
        console.log(`Test user created: ${data.user.email}`);
      }
    }
  } catch (e) {
    console.error('A critical error occurred:', e.message);
  }
}

checkSupabaseConnection();
