"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Class {
  id: string;
  name: string;
}

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Class | null>(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setLoading(true);
    const res = await fetch("/api/classes");

    if (!res.ok) {
      setError("Failed to load classes");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setClasses(data.classes);
    setLoading(false);
  }

  async function renameClass(id: string) {
    const res = await fetch(`/api/classes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    if (!res.ok) {
      alert("Rename failed");
      return;
    }

    setEditing(null);
    setNewName("");
    loadClasses();
  }

  async function deleteClass(id: string) {
    if (!confirm("Delete this class?")) return;

    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    loadClasses();
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/classes")}
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Manage Classes</h1>

      {classes.map((cls) => (
        <div
          key={cls.id}
          className="flex justify-between items-center p-3 border rounded mb-2"
        >
          {editing?.id === cls.id ? (
            <>
              <input
                className="border p-1 mr-2"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                onClick={() => renameClass(cls.id)}
                className="px-3 py-1 bg-green-600 text-white rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span>{cls.name}</span>
              <div>
                <button
                  onClick={() => {
                    setEditing(cls);
                    setNewName(cls.name);
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white rounded mr-2"
                >
                  Rename
                </button>
                <button
                  onClick={() => deleteClass(cls.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
