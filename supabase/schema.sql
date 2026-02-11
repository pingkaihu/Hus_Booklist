-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create books table (Global Cache)
create table books (
  id uuid default gen_random_uuid() primary key,
  ol_edition_key text unique not null,
  title text not null,
  author text,
  publisher text,
  published_year int,
  isbn_13 text,
  cover_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for books
alter table books enable row level security;

create policy "Books are viewable by everyone."
  on books for select
  using ( true );

-- Only service role can insert/update books (for now, or authenticated users via server action)
-- Allowing authenticated users to add books to cache if they don't exist
create policy "Authenticated users can insert books."
  on books for insert
  with check ( auth.role() = 'authenticated' );

-- Create user_books table (Personal Shelf)
create table user_books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  book_id uuid references books(id) not null,
  status text check (status in ('unread', 'reading', 'completed')) not null default 'unread',
  finished_at timestamp with time zone,
  re_read_logs jsonb default '[]'::jsonb,
  personal_notes text,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, book_id)
);

-- RLS for user_books
alter table user_books enable row level security;

create policy "Users can view own book list."
  on user_books for select
  using ( auth.uid() = user_id );

create policy "Users can insert into own book list."
  on user_books for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own book list."
  on user_books for update
  using ( auth.uid() = user_id );

create policy "Users can delete from own book list."
  on user_books for delete
  using ( auth.uid() = user_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
