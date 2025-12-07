'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import AddClassForm from '@/components/AddClassForm';

interface ClassItem {
  id: string;
  name: string;
}

export default function ClassesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadClasses() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const res = await fetch("/api/classes");
    const data = await res.json();

    if (res.ok) {
      setClasses(data.classes);
    } else {
      setError(data.error || "Failed to load classes");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadClasses();
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;

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

        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
        >
          Log out
        </button>
      </div>

      {/* Add class */}
      <AddClassForm onClassAdded={loadClasses} />

      <h2 className="text-xl font-bold mb-4 mt-6">Your Classes</h2>

      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-3">
        {classes.map((c) => (
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
