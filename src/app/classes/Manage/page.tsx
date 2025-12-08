import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClassManagementUI } from '@/components/ClassManagementUI';
import Link from 'next/link';

export default async function ManageClassesPage() {
  const supabase = await createClient();
  let user = null;
  let classes = [];
  let errorMessage: string | null = null;

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Supabase getUser error in ManageClassesPage:", userError);
      throw new Error("Failed to authenticate user.");
    }
    user = userData.user;

    if (!user) {
      redirect('/login');
    }

    const { data: classesData, error: classesError } = await supabase
      .from("classes")
      .select("id, name, user_id")
      .eq("user_id", user.id);

    if (classesError) {
      console.error("Supabase fetch classes error in ManageClassesPage:", classesError);
      throw new Error("Failed to fetch classes.");
    }
    classes = classesData || [];

  } catch (err: any) {
    console.error("Error in ManageClassesPage server component:", err.message);
    errorMessage = err.message || "An unexpected error occurred.";
  }

  if (errorMessage) {
    return <div className="text-center py-8 text-red-600">Error: {errorMessage}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/classes">
          <button className="bg-gray-800 text-white px-4 py-2 rounded">
            &larr; Back to Classes
          </button>
        </Link>
      </div>
      <ClassManagementUI initialClasses={classes} />
    </div>
  );
}