import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieOptions = {
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

export async function PUT(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              // @ts-ignore
              cookies: cookies, // Pass the cookies function directly
            }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();
    const classId = params.id;

    if (!name || typeof name !== 'string' || name.length > 25 || !/^[a-zA-Z0-9\s]+$/.test(name)) {
      return NextResponse.json({ error: 'Invalid class name. Must be alphanumeric and max 25 characters.' }, { status: 400 });
    }

    // Check for uniqueness before renaming
    const { data: existingClass, error: existingClassError } = await supabase
      .from('classes')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
      .not('id', 'eq', classId) // Exclude the current class from the check
      .single();

    if (existingClass) {
      return NextResponse.json({ error: 'A class with this name already exists. Please choose a different name.' }, { status: 409 });
    }
    
    // Update the class
    const { data: updatedClass, error: updateError } = await supabase
      .from('classes')
      .update({ name: name })
      .eq('id', classId)
      .eq('user_id', user.id) // Ensure user can only update their own classes
      .select()
      .single();

    if (updateError) {
      console.error('Error updating class:', updateError);
      return NextResponse.json({ error: 'Failed to update class.' }, { status: 500 });
    }

    return NextResponse.json({ class: updatedClass }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/classes/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
    try {
      const params = await paramsPromise;
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              {
                // @ts-ignore
                cookies: cookies, // Pass the cookies function directly
              }      );
  
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const classId = params.id;
  
      // Delete the class
      const { error: deleteError } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)
        .eq('user_id', user.id); // Ensure user can only delete their own classes
  
      if (deleteError) {
        console.error('Error deleting class:', deleteError);
        return NextResponse.json({ error: 'Failed to delete class.' }, { status: 500 });
      }
  
      return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
      console.error('Error in DELETE /api/classes/[id]:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  
