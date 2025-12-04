'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client';

interface AddClassFormProps {
  onClassAdded: () => void;
}

export default function AddClassForm({ onClassAdded }: AddClassFormProps) {
  const [className, setClassName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!className.trim()) {
      setError('Class name cannot be empty.')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to add a class.')
        setLoading(false)
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
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Add a New Class</h2>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter class name"
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Class'}
        </button>
      </div>
    </form>
  )
}
