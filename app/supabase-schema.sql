-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- If you already ran the previous schema, run the ALTER statements at the bottom instead.

-- 1. Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT,
  color TEXT DEFAULT '#FF6B35',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_name TEXT,
  target_type TEXT,
  target_id UUID,
  target_name TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'Untitled Event',
  description TEXT,
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ DEFAULT (now() + interval '1 hour'),
  location TEXT DEFAULT 'TBD',
  category TEXT DEFAULT 'Other',
  custom_category TEXT,
  org_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  logo_url TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Insert initial school (University of Houston)
INSERT INTO public.schools (name, slug, location, color)
VALUES ('University of Houston', 'uh', 'Houston, TX', '#C8102E')
ON CONFLICT (slug) DO NOTHING;

-- 6. Create admin account (password: admin123)
-- Using SHA-256 hash for 'admin123': 240be518fabd2724ddb6f04eeb9d5b75e02c9dc867377967af67d26b710c01b8
INSERT INTO public.users (email, password_hash, organization_name, is_verified, is_admin)
VALUES (
  'admin@admin.edu',
  '240be518fabd2724ddb6f04eeb9d5b75e02c9dc867377967af67d26b710c01b8',
  'Admin',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- 7. Enable Row Level Security
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON public.schools;
DROP POLICY IF EXISTS "Anyone can insert schools" ON public.schools;
DROP POLICY IF EXISTS "Anyone can update schools" ON public.schools;
DROP POLICY IF EXISTS "Anyone can delete schools" ON public.schools;
DROP POLICY IF EXISTS "Activity logs are viewable by everyone" ON public.activity_logs;
DROP POLICY IF EXISTS "Anyone can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Anyone can create user" ON public.users;

-- Schools table policies (allow all for now, auth handled in app)
CREATE POLICY "Schools are viewable by everyone" ON public.schools
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert schools" ON public.schools
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update schools" ON public.schools
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete schools" ON public.schools
  FOR DELETE USING (true);

-- Activity logs table policies (allow all for now, auth handled in app)
CREATE POLICY "Activity logs are viewable by everyone" ON public.activity_logs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- Anyone can read events
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

-- Anyone can insert events (logged in or not)
CREATE POLICY "Anyone can insert events" ON public.events
  FOR INSERT WITH CHECK (true);

-- Anyone can update events (for now, can restrict later)
CREATE POLICY "Anyone can update events" ON public.events
  FOR UPDATE USING (true);

-- Anyone can delete events (admin check is done in app code)
CREATE POLICY "Anyone can delete events" ON public.events
  FOR DELETE USING (true);

-- Users table policies
CREATE POLICY "Users are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create user" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update users" ON public.users
  FOR UPDATE USING (true);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS events_org_id_idx ON public.events(org_id);
CREATE INDEX IF NOT EXISTS events_start_time_idx ON public.events(start_time);
CREATE INDEX IF NOT EXISTS events_category_idx ON public.events(category);
CREATE INDEX IF NOT EXISTS users_school_id_idx ON public.users(school_id);
CREATE INDEX IF NOT EXISTS activity_logs_actor_id_idx ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at);

-- 10. Create storage bucket for logos
-- Run this in SQL Editor or do it manually in Storage UI
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for logos bucket
DROP POLICY IF EXISTS "Anyone can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read logos" ON storage.objects;

CREATE POLICY "Anyone can upload logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Anyone can read logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

-- =====================================================
-- IF YOU ALREADY HAVE THE OLD SCHEMA, RUN THESE INSTEAD:
-- =====================================================
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS logo_url TEXT;
-- ALTER TABLE public.events ADD COLUMN IF NOT EXISTS custom_category TEXT;
-- ALTER TABLE public.events ADD COLUMN IF NOT EXISTS logo_url TEXT;
-- ALTER TABLE public.events ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
-- ALTER TABLE public.events ADD COLUMN IF NOT EXISTS video_url TEXT;
-- ALTER TABLE public.events DROP COLUMN IF EXISTS org_short_name;
-- ALTER TABLE public.events ALTER COLUMN org_id DROP NOT NULL;
-- ALTER TABLE public.events ALTER COLUMN title SET DEFAULT 'Untitled Event';
-- ALTER TABLE public.events ALTER COLUMN location SET DEFAULT 'TBD';
-- ALTER TABLE public.events ALTER COLUMN category SET DEFAULT 'Other';
-- UPDATE public.users SET password_hash = '240be518fabd2724ddb6f04eeb9d5b75e02c9dc867377967af67d26b710c01b8' WHERE email = 'admin@admin.edu';

-- =====================================================
-- NEW TABLES AND COLUMNS (run if upgrading from previous schema):
-- =====================================================
-- 
-- -- Create schools table
-- CREATE TABLE IF NOT EXISTS public.schools (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name TEXT NOT NULL,
--   slug TEXT UNIQUE NOT NULL,
--   location TEXT,
--   color TEXT DEFAULT '#FF6B35',
--   created_at TIMESTAMPTZ DEFAULT now()
-- );
-- 
-- -- Create activity_logs table
-- CREATE TABLE IF NOT EXISTS public.activity_logs (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   action TEXT NOT NULL,
--   actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
--   actor_name TEXT,
--   target_type TEXT,
--   target_id UUID,
--   target_name TEXT,
--   details JSONB,
--   created_at TIMESTAMPTZ DEFAULT now()
-- );
-- 
-- -- Add new columns to users table
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
-- 
-- -- Insert initial school
-- INSERT INTO public.schools (name, slug, location, color)
-- VALUES ('University of Houston', 'uh', 'Houston, TX', '#C8102E')
-- ON CONFLICT (slug) DO NOTHING;
-- 
-- -- Enable RLS on new tables
-- ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
-- 
-- -- Schools table policies
-- CREATE POLICY "Schools are viewable by everyone" ON public.schools FOR SELECT USING (true);
-- CREATE POLICY "Anyone can insert schools" ON public.schools FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Anyone can update schools" ON public.schools FOR UPDATE USING (true);
-- CREATE POLICY "Anyone can delete schools" ON public.schools FOR DELETE USING (true);
-- 
-- -- Activity logs table policies
-- CREATE POLICY "Activity logs are viewable by everyone" ON public.activity_logs FOR SELECT USING (true);
-- CREATE POLICY "Anyone can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);
-- 
-- -- Users update policy
-- CREATE POLICY "Anyone can update users" ON public.users FOR UPDATE USING (true);
-- 
-- -- New indexes
-- CREATE INDEX IF NOT EXISTS users_school_id_idx ON public.users(school_id);
-- CREATE INDEX IF NOT EXISTS activity_logs_actor_id_idx ON public.activity_logs(actor_id);
-- CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at);
