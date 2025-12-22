-- Create the users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE,
    target_job TEXT,
    location TEXT,
    skills TEXT[], -- Array of skills
    status TEXT DEFAULT 'active'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert (for onboarding)
CREATE POLICY "Allow anonymous insertion" ON public.users FOR INSERT WITH CHECK (true);

-- Create a policy that allows anyone to read (for this demo dashboard)
-- NOTE: In a production app, you'd want to restrict this to the specific user.
CREATE POLICY "Allow public read" ON public.users FOR SELECT USING (true);
