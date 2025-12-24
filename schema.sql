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

-- Create the job_listings table
CREATE TABLE IF NOT EXISTS public.job_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_range TEXT,
    tags TEXT[],
    url TEXT, -- Link to original job offer
    match_score INTEGER DEFAULT 0 -- sophisticated algorithm placeholder
);

-- Enable RLS for jobs
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

-- Allow read access to all (for demo)
CREATE POLICY "Allow public read jobs" ON public.job_listings FOR SELECT USING (true);
-- Allow insert access to all (for seeding)
CREATE POLICY "Allow public insert jobs" ON public.job_listings FOR INSERT WITH CHECK (true);
