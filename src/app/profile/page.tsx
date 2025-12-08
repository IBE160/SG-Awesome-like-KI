'use client'

import { useEffect, useState, useCallback } from 'react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }
      const data = await response.json()
      setProfile(data)
      setFullName(data?.user_metadata?.full_name || '')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.redirected) {
        window.location.href = response.url;
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile')
      }
      setMessage('Profile updated successfully!')
      // Refresh profile data
      fetchProfile()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile) {
    return <p>Loading profile...</p>
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>
  }
  
  if (!profile) {
    return <p>You must be logged in to view this page.</p>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <p className="mb-4">
          <strong>Email:</strong> {profile.email}
        </p>
        <form onSubmit={handleUpdateProfile}>
          <div className="flex flex-col space-y-4">
            <label htmlFor="fullName" className="font-semibold">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                disabled={loading}
              >
                Logout
              </button>
            </div>
          </div>
        </form>
        {message && <p className="mt-4 text-green-600">{message}</p>}
      </div>
    </div>
  )
}

