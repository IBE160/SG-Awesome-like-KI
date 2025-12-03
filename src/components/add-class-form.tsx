'use client'

import { useState } from 'react'
<<<<<<< HEAD
import { createClient } from '@/lib/supabase/client'

interface AddClassFormProps {
  onClassAdded: () => void
=======

interface AddClassFormProps {
  onClassAdded: () => void;
>>>>>>> 99235f1ebb1f80e9a405908b456d0e44e62489cb
}

export default function AddClassForm({ onClassAdded }: AddClassFormProps) {
  const [className, setClassName] = useState('')
<<<<<<< HEAD
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
=======
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
>>>>>>> 99235f1ebb1f80e9a405908b456d0e44e62489cb
    setError(null)

    if (!className.trim()) {
      setError('Class name cannot be empty.')
<<<<<<< HEAD
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to add a class.')
      return
    }

    const { error: insertError } = await supabase
      .from('classes')
      .insert([{ name: className.trim(), user_id: user.id }])

    if (insertError) {
      setError(`Failed to add class: ${insertError.message}`)
    } else {
      setClassName('')
      onClassAdded()
=======
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: className }),
      })

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = `Failed to create class. Status: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          if (responseText) {
            errorMessage = `${errorMessage}. Server response: ${responseText}`;
          }
        }
        throw new Error(errorMessage);
      }

      setClassName('')
      onClassAdded()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
>>>>>>> 99235f1ebb1f80e9a405908b456d0e44e62489cb
    }
  }

  return (
<<<<<<< HEAD
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Add a New Class</h2>
      <div className="flex gap-4">
=======
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">Add New Class</h2>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <div className="flex flex-col space-y-4">
>>>>>>> 99235f1ebb1f80e9a405908b456d0e44e62489cb
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter class name"
<<<<<<< HEAD
          className="flex-grow p-2 border rounded-md"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Add Class
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
=======
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Class'}
        </button>
      </div>
>>>>>>> 99235f1ebb1f80e9a405908b456d0e44e62489cb
    </form>
  )
}
