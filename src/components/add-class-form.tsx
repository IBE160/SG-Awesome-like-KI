'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AddClassFormProps {
  onClassAdded: () => void
}

export default function AddClassForm({ onClassAdded }: AddClassFormProps) {
  const [className, setClassName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!className.trim()) {
      setError('Class name cannot be empty.')
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
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Add a New Class</h2>
      <div className="flex gap-4">
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter class name"
          className="flex-grow p-2 border rounded-md"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Add Class
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  )
}
