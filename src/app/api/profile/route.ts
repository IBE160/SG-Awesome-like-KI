import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'


export async function GET() {
  const supabase = createServerClient ({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  let { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code === 'PGRST116') {
    // Profile not found, create one
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id, name: user.email }) // Default name to email
      .select()
      .single()
    
    if(insertError) {
        return new NextResponse(JSON.stringify({ error: 'Failed to create profile' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
    profile = newProfile
  } else if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  return NextResponse.json(profile)
}

export async function PUT(request: Request) {
  const supabase = createServerClient ({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  const { name } = await request.json()

  const { data, error } = await supabase
    .from('profiles')
    .update({ name })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  return NextResponse.json(data)
}
