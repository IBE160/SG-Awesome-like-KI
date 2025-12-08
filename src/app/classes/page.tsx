import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import AddClassForm from '@/components/AddClassForm';
import { Permanent_Marker } from 'next/font/google';

const permanent_Marker = Permanent_Marker({ subsets: ["latin"], weight: "400" });

interface ClassItem {
  id: string;
  name: string;
}

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching classes:", error);
    return <p className="p-4 text-red-500">Error: Failed to load classes.</p>;
  }

  return (
    <div className="container mx-auto p-6">

      {/* Top buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Link href="/upload">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Upload Document
            </button>
          </Link>
          <Link href="/classes/manage">
            <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
              Manage Classes
            </button>
          </Link>
          <Link href="/unorganized">
            <button className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800">
              Unorganized Content
            </button>
          </Link>
        </div>

        <form action="/auth/sign-out" method="post">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            type="submit"
          >
            Log out
          </button>
        </form>
      </div>

      {/* Add class */}
      <AddClassForm initialClasses={classes || []} />

      <h2 className="text-xl font-bold mb-4 mt-6">Your Classes</h2>

      {error && <p className="text-red-500">{error.message}</p>}

      <ul className="space-y-3">
        {classes?.map((c) => (
          <li key={c.id} className="p-4 border rounded bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all">
            <Link href={`/classes/${c.id}`} className="block w-full h-full font-semibold text-lg text-gray-800">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
