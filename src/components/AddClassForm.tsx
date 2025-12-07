"use client";

import { useState } from "react";

interface Props {
  onClassAdded?: () => void;
}

export default function AddClassForm({ onClassAdded }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setName("");
    setLoading(false);

    if (onClassAdded) onClassAdded();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <input
        type="text"
        value={name}
        required
        maxLength={25}
        placeholder="Enter class name"
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        disabled={loading}
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? "Adding..." : "Add Class"}
      </button>
    </form>
  );
}

