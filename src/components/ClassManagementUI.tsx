'use client';

import React, { useState, useEffect } from 'react';

// Define the Class type
interface Class {
  id: string;
  name: string;
  user_id: string;
}

export const ClassManagementUI: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassName, setNewClassName] = useState<string>('');
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [renamedClassName, setRenamedClassName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Class | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        const data = await response.json();
        setClasses(data.classes);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Handle creating a new class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^[a-zA-Z0-9\s]+$/.test(newClassName)) {
      setError('Class name must be alphanumeric.');
      return;
    }

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create class');
      }
      const data = await response.json();
      setClasses([...classes, data.class]);
      setNewClassName('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Handle renaming a class
  const handleRenameClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!editingClass) return;

    if (!/^[a-zA-Z0-9\s]+$/.test(renamedClassName)) {
      setError('Class name must be alphanumeric.');
      return;
    }

    try {
      const response = await fetch(`/api/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renamedClassName }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to rename class');
      }
      const data = await response.json();
      setClasses(classes.map(c => (c.id === editingClass.id ? data.class : c)));
      setEditingClass(null);
      setRenamedClassName('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Handle deleting a class
  const handleDeleteClass = async (classToDelete: Class) => {
    setError(null);
    try {
      const response = await fetch(`/api/classes/${classToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete class');
      }
      setClasses(classes.filter(c => c.id !== classToDelete.id));
      setShowDeleteConfirm(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return <div>Loading classes...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Classes</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Create Class Form */}
      <form onSubmit={handleCreateClass} className="mb-6">
        <input
          type="text"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          placeholder="New class name"
          className="border p-2 mr-2"
          maxLength={25}
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Class
        </button>
      </form>

      {/* List of Classes */}
      <ul>
        {classes.map((c) => (
          <li key={c.id} className="mb-2 flex items-center justify-between">
            {editingClass?.id === c.id ? (
              <form onSubmit={handleRenameClass}>
                <input
                  type="text"
                  value={renamedClassName}
                  onChange={(e) => setRenamedClassName(e.target.value)}
                  className="border p-2"
                  maxLength={25}
                  required
                />
                <button type="submit" className="bg-green-500 text-white p-2 ml-2 rounded">Save</button>
                <button type="button" onClick={() => setEditingClass(null)} className="bg-gray-500 text-white p-2 ml-2 rounded">Cancel</button>
              </form>
            ) : (
              <>
                <span>{c.name}</span>
                <div>
                  <button
                    onClick={() => { setEditingClass(c); setRenamedClassName(c.name); }}
                    className="bg-yellow-500 text-white p-2 mr-2 rounded"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(c)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div role="dialog" aria-labelledby="confirm-deletion-title" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 id="confirm-deletion-title" className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete the class "{showDeleteConfirm.name}"? All associated content will be deleted.</p>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowDeleteConfirm(null)} className="bg-gray-500 text-white p-2 mr-2 rounded">Cancel</button>
              <button onClick={() => handleDeleteClass(showDeleteConfirm)} className="bg-red-500 text-white p-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
