'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
}

interface ProfileClientPageProps {
  initialProfile: ProfileData;
}

export default function ProfileClientPage({ initialProfile }: ProfileClientPageProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update profile');
      }
      const updatedData = await response.json();
      setProfile(updatedData);
      setMessage('Profile updated successfully!');
      router.refresh(); // Revalidate server data after update
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
      <p className="mb-2">
        <strong>Email:</strong> {profile.email}
      </p>

      {message && (
        <div
          className={`p-3 mb-4 text-white ${message.includes('successfully') ? 'bg-green-500' : 'bg-red-500'
            } rounded`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleUpdateProfile}>
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
            Full Name:
          </label>
          <input
            type="text"
            id="fullName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
