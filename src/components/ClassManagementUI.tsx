"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Keep for rename/delete actions
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ClassItem { // Renamed from Class to ClassItem for consistency with other files
  id: string;
  name: string;
  user_id: string;
}

interface ClassManagementUIProps {
  initialClasses: ClassItem[];
}

export function ClassManagementUI({ initialClasses }: ClassManagementUIProps) {
  const supabase = createClient();
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [editing, setEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  async function renameClass(id: string) {
    const { error } = await supabase
      .from("classes")
      .update({ name: newName })
      .eq("id", id);

    if (!error) {
      setClasses(classes.map((c) =>
        c.id === id ? { ...c, name: newName } : c
      ));
      setEditing(null);
      router.refresh(); // Revalidate data in the Server Component
    }
  }

  async function deleteClass(id: string) {
    if (!confirm('Are you sure you want to delete this class? All sections and documents within it will be removed.')) {
      return;
    }
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", id);

    if (!error) {
      setClasses(classes.filter((c) => c.id !== id));
      router.refresh(); // Revalidate data in the Server Component
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Classes</h2>

      {classes.map((c) => (
        <div key={c.id} className="border p-4 mb-3 rounded">
          {editing === c.id ? (
            <div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border p-2 rounded mr-3"
              />
              <button
                onClick={() => renameClass(c.id)}
                className="bg-green-600 text-white px-3 py-1 rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="bg-gray-600 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span>{c.name}</span>

              <div>
                <Link href={`/classes/${c.id}/sections`}>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Manage Sections
                  </button>
                </Link>
                <button
                  onClick={() => { setEditing(c.id); setNewName(c.name); }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Rename
                </button>
                <button
                  onClick={() => deleteClass(c.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
