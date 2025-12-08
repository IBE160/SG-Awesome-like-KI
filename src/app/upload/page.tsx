import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UploadClientPage from './UploadClientPage';

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch classes on the server
  const { data: classes, error: classesError } = await supabase
    .from("classes")
    .select("id, name")
    .eq("user_id", user.id);

  if (classesError) {
    console.error("Error fetching classes:", classesError);
    return <div className="text-center py-8 text-red-600">Error: Failed to load classes for upload.</div>;
  }

  return <UploadClientPage initialClasses={classes || []} user={user} />;
}