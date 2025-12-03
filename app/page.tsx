'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AddClassForm from '@/components/add-class-form'

export default function Page() {
  const [classes, setClasses] = useState<any[] | null>(null)
  const supabase = createClient()

  const fetchClasses = useCallback(async () => {
    const { data } = await supabase.from('classes').select()
    setClasses(data)
  }, [supabase])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  return (
    <div className="container mx-auto p-4">
      <AddClassForm onClassAdded={fetchClasses} />

      <h1 className="text-2xl font-bold mb-4">Your Classes</h1>
      {classes === null ? (
        <p>Loading classes...</p>
      ) : classes.length > 0 ? (
        <ul className="space-y-4">
          {classes.map((c) => (
            <li key={c.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
              {c.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't created any classes yet. Use the form above to add one!</p>
      )}
    </div>
  )
}