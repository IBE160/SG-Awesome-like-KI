import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileClientPage from './ProfileClientPage'; // Create this new Client Component

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the profile from the public.profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const initialProfile = {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || '',
  };

  return <ProfileClientPage initialProfile={initialProfile} />;
}

