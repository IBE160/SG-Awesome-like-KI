


export async function PUT(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          (await cookieStore).set(name, value, options)
        },
        async remove(name: string, options: CookieOptions) {
          (await cookieStore).set(name, '', options)
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();

  // Update full_name in the public.profiles table
  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({ full_name: name, updated_at: new Date().toISOString() }) // Use full_name
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating profile:', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Return the updated profile combined with user data for consistency
  const combinedUser = { ...user, profile: updatedProfile };

  return NextResponse.json(combinedUser);
}