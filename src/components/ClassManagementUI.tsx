"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Class {
  id: string;
  name: string;
  user_id: string;
}

export function ClassManagementUI() {
  const supabase = createClient();
  const [classes, setClasses] = useState<Class[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("classes")
        .select("*")
        .eq("user_id", user.id);

      setClasses(data || []);
    }
    load();
  }, []);

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
    }
  }

  async function deleteClass(id: string) {
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", id);

    if (!error) {
      setClasses(classes.filter((c) => c.id !== id));
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
            <div className="flex justify-between">
              <span>{c.name}</span>

              <div>
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
