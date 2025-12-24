const https = require('https');

// DEFINING CONFIG
const SUPABASE_URL = 'https://udychrmqcmjdofebdvof.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeWNocm1xY21qZG9mZWJkdm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjUyNTQsImV4cCI6MjA4MTk0MTI1NH0.X7SEnddtzRQgnyFRFckM_IdAbWxdG3eGDxM4YQt1L5s';

const REMOTIVE_API = 'https://remotive.com/api/remote-jobs?limit=50';

// HELPER: Simple fetch wrapper because Node < 18 might not have global fetch active, 
// but we assume modern env or just use https for safety if fetch fails.
// Actually, let's try standard fetch first (Node 18+). If it fails, we fall back.
// For simplicity in this environment, we'll assume fetch exists or use a polyfill logic if needed. 
// But wait, the environment is Windows user, likely standard Node. I'll use standard fetch.

async function ingestJobs() {
    console.log('🚀 Starting Job Ingestion...');

    try {
        // 1. Fetch Jobs from Remotive
        console.log('📥 Fetching from Remotive...');
        const response = await fetch(REMOTIVE_API);
        const data = await response.json();

        const jobs = data.jobs || [];
        console.log(`✅ Found ${jobs.length} jobs.`);

        // 2. Transform Data
        const mappedJobs = jobs.map(job => {
            // Generate random match score for demo
            const matchScore = 70 + Math.floor(Math.random() * 29); // 70-99

            return {
                title: job.title,
                company: job.company_name,
                location: job.candidate_required_location || 'Remote',
                salary_range: job.salary || 'Competitive',
                tags: job.tags || [],
                url: job.url, // Map the URL
                description: job.description, // Map the description
                match_score: matchScore,
                // created_at: job.publication_date // Optional, let db set or parse it
            };
        });

        // 3. Insert into Supabase via REST
        console.log('📤 Uploading to Supabase...');

        // We do it in chunks or all at once? All at once for 50 items is fine.
        // Endpoint: /rest/v1/job_listings
        const result = await fetch(`${SUPABASE_URL}/rest/v1/job_listings`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal' // Don't need the inserted rows back
            },
            body: JSON.stringify(mappedJobs)
        });

        if (result.ok) {
            console.log('✨ Success! Jobs ingested.');
        } else {
            console.error('❌ Supabase Error:', result.status, await result.text());
        }

    } catch (err) {
        console.error('❌ Script Error:', err);
    }
}

ingestJobs();
