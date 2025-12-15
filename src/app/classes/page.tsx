'use client';

import { useState, useEffect } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // Changed to client-side createClient
import Link from 'next/link';
import AddClassForm from '@/components/AddClassForm';
import { Permanent_Marker } from 'next/font/google';

const permanent_Marker = Permanent_Marker({ subsets: ["latin"], weight: "400" });

interface ClassItem {
  id: string;
  name: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]); // State for fetched classes
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data: { user }, error: userError } = await supabase.auth.getUser(); // Changed to getUser

      if (userError || !user) { // Check user and userError
        redirect('/login'); // Redirect to login if not authenticated
        return;
      }

      const userId = user.id; // Use user.id

      // Fetch classes
      const { data: fetchedClasses, error: classesError }: { data: ClassItem[] | null; error: PostgrestError | null } = await supabase
        .from("classes")
        .select("*")
        .eq("user_id", userId);

      if (classesError) {
        console.error("Error fetching classes:", classesError);
        setError(classesError.message);
      } else {
        setClasses(fetchedClasses || []);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []); // Empty dependency array means this runs once on mount




  return (
    <div className="container mx-auto p-6">

      {loading && <p>Loading content...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <h2 className="text-xl font-bold mb-4 mt-6">Your Classes</h2>

          <AddClassForm />

          <ul className="space-y-3">
            {classes?.map((c) => (
              <li key={c.id} className="p-4 border rounded bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all">
                <Link href={`/classes/${c.id}`} className="block w-full h-full font-semibold text-lg text-gray-800">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}