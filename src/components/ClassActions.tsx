"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md'; // Assuming react-icons is installed

interface ClassActionsProps {
  classId: string;
  initialClassName: string;
}

export function ClassActions({ classId, initialClassName }: ClassActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newClassName, setNewClassName] = useState(initialClassName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRename = async () => {
    setError(null);
    setLoading(true);

    if (!newClassName || newClassName.length > 25 || !/^[\p{L}0-9\s]+$/u.test(newClassName)) {
      setError('Invalid class name. Must be alphanumeric and max 25 characters.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/classes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: classId, newName: newClassName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to rename class.');
      }

      setIsEditing(false);
      router.refresh(); // Revalidate data on the server
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during rename.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the class "${initialClassName}"? This action cannot be undone.`)) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/classes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: classId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete class.');
      }

      router.push('/classes'); // Redirect to classes list after successful deletion
      router.refresh(); // Revalidate data on the server
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during delete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            disabled={loading}
            className="border p-1 rounded text-gray-800"
            maxLength={25}
          />
          <button
            onClick={handleRename}
            disabled={loading}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => { setIsEditing(false); setNewClassName(initialClassName); }}
            disabled={loading}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 p-1 rounded"
            title="Rename class"
          >
            <MdEdit size={20} />
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-600 hover:text-red-800 p-1 rounded"
            title="Delete class"
          >
            <MdDelete size={20} />
          </button>
        </>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}