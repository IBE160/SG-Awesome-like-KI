"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/Logoutbutton";

interface Class {
  id: string;
  name: string;
  user_id: string;
}

export default function ClassesPage() {
  const supabase = createClient();
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassName, setNewClassName] = useState("");

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

  async function addClass(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase
      .from("classes")
      .insert({ name: newClassName })
      .select()
      .single();

    if (!error) {
      setClasses([...classes, data]);
      setNewClassName("");
    }
  }

  return (
    <div className="container mx-auto p-6">

      <div className="flex justify-between mb-6">
        <Link
          href="/classes/manage"
          className="bg-blue-600 px-4 py-2 text-white rounded"
        >
          Manage Classes
        </Link>

        <LogoutButton />
      </div>

      {/* ADD CLASS */}
      <form onSubmit={addClass} className="mb-8">
        <input
          type="text"
          placeholder="New class name"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        />

        <button className="bg-blue-600 text-white w-full p-3 rounded">
          Add Class
        </button>
      </form>

      {/* CLASS LIST */}
      <h2 className="text-2xl font-bold mb-3">Your Classes</h2>

      {classes.map((c) => (
        <div key={c.id} className="p-4 border rounded mb-2 bg-gray-50">
          {c.name}
        </div>
      ))}
    </div>
  );
}
