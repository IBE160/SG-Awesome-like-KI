<<<<<<< HEAD
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface Profile {
  name: string
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    
    setEmail(user.email || '')

    try {
      const response = await fetch('/api/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      setProfile(data)
      setName(data.name || '')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      setProfile(data)
      setMessage('Profile updated successfully!')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return <p className="container mx-auto p-4">Loading profile...</p>
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <Input id="email" type="email" value={email} disabled className="mt-1" />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <Button type="submit">Update Profile</Button>
      </form>
      <div className="mt-8">
        <Link href="/privacy-policy" className="text-sm text-gray-600 hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  )
=======
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        router.push("/login");
        return;
      }
      const userData = await response.json();
      setUser(userData);
      setName(userData.user_metadata?.name || "");
      setEmail(userData.email || "");
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      setMessage(`Error updating profile: ${error}`);
    } else {
      const updatedUser = await response.json();
      setMessage("Profile updated successfully!");
      setUser(updatedUser);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Profile Settings</h1>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email (Read-only)
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full"
            />
          </div>
          {message && (
            <p className="text-sm text-center text-red-600">{message}</p>
          )}
          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </form>

        <div className="text-center">
          <Link href="/privacy-policy" className="text-sm text-blue-600 hover:underline">
            View Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
>>>>>>> 99235f1ebb1f80e9a405908b456d0e44e62489cb
}
