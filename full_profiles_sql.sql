create table profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  username text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Aktiver RLS
alter table profiles enable row level security;

-- Policy: brukere kan kun lese sin egen profil
create policy "Users can read own profile"
on profiles
for select
using (auth.uid() = id);

-- Policy: brukere kan oppdatere sin egen profil
create policy "Users can update own profile"
on profiles
for update
using (auth.uid() = id);

-- Policy: brukere kan opprette sin egen profil
create policy "Users can insert own profile"
on profiles
for insert
with check (auth.uid() = id);