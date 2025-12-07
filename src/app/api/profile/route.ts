


import { createClient } from '@/lib/supabase/server' // Import from the shared utility
import { NextResponse } from 'next/server'

// Shared function to get the authenticated user
const getAuthenticatedUser = async (supabase: any) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }
  return user
}

export async function GET() {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the profile from the public.profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Gracefully handle cases where a profile doesn't exist yet
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error.message)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }

  // Combine user and profile data, returning only necessary fields
  const responseData = {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || '',
  }

  return NextResponse.json(responseData)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { full_name } = await request.json()

  // Validate input
  if (typeof full_name !== 'string' || full_name.trim() === '') {
    return NextResponse.json(
      { error: 'Full name is required' },
      { status: 400 }
    )
  }

  // Upsert the profile data
  const { data: updatedProfile, error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: full_name.trim(),
      updated_at: new Date().toISOString(),
    })
    .select('full_name')
    .single()

  if (upsertError) {
    console.error('Error upserting profile:', upsertError.message)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }

  // Return the updated profile combined with user data for consistency
  const responseData = {
    id: user.id,
    email: user.email,
    full_name: updatedProfile.full_name,
  }

  return NextResponse.json(responseData)
}