'use client'

import { useState } from 'react'

interface AddClassFormProps {
  onClassAdded: () => void;
}

export default function AddClassForm({ onClassAdded }: AddClassFormProps) {
  const [className, setClassName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!className.trim()) {
      setError('Class name cannot be empty.')
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
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">Add New Class</h2>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter class name"
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
    </form>
  )
}
