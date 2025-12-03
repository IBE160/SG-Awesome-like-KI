'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AddClassForm from '@/components/add-class-form'

// Define a type for the class objects to avoid using 'any'
interface Class {
  id: number;
  name: string;
  created_at: string;
  user_id: string;
}

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const fetchClasses = useCallback(async (userId: string) => {
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('classes')
      .select()
      .eq('user_id', userId)

    if (fetchError) {
      setError(`Failed to fetch classes: ${fetchError.message}`)
      setClasses([])
    } else {
      setClasses(data || [])
    }
  }, [supabase])

  useEffect(() => {
    const checkUserAndFetchClasses = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        await fetchClasses(user.id)
        setLoading(false)
      }
    }

    checkUserAndFetchClasses()
  }, [supabase, router, fetchClasses])

  if (loading) {
    return <p className="container mx-auto p-4">Loading...</p>
  }

  return (
    <div className="container mx-auto p-4">
      <AddClassForm onClassAdded={() => supabase.auth.getUser().then(({data: {user}}) => user && fetchClasses(user.id))} />

      <h1 className="text-2xl font-bold mb-4">Your Classes</h1>
      {error && <p className="text-red-500">{error}</p>}
      {classes.length > 0 ? (
        <ul className="space-y-4">
          {classes.map((c) => (
            <li key={c.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
              {c.name}
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>You haven't created any classes yet. Use the form above to add one!</p>
      )}
    </div>
  )
}