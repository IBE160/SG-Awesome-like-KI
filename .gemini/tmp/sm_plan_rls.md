To address the missing **Supabase RLS Policies** for story 2-4, and to align with Supabase best practices for user profile management, I recommend the following:

1.  **Create a `public.profiles` table:**
    *   This is the standard approach to store extended user profile information beyond what `auth.users` provides, linking it directly to the Supabase authentication system.
    *   **Proposed SQL for `supabase/migrations/[timestamp]_create_profiles_table.sql` (or similar migration file):**

    ```sql
    CREATE TABLE public.profiles (
      id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
      name text,
      updated_at timestamp with time zone DEFAULT now()
    );

    -- Set up Row Level Security (RLS) on the `profiles` table
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Public profiles are viewable by everyone."
      ON public.profiles FOR SELECT
      USING (true);

    CREATE POLICY "Users can insert their own profile."
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);

    CREATE POLICY "Users can update their own profile."
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);

    -- This trigger automatically creates a profile entry when a new user signs up
    CREATE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, name)
      VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    ```

2.  **Update `src/app/api/profile/route.ts`:**
    *   The current `PUT` endpoint updates `auth.users` metadata directly. This should be changed to interact with the new `public.profiles` table for `name` updates. The `GET` endpoint would also need to fetch from `public.profiles`.

**This approach directly addresses the RLS requirement on user data in a way that is maintainable and follows Supabase best practices.**

**Please confirm if you would like me to proceed with creating this `profiles` table and updating the API route.** This will be a significant change to the database schema and application logic.