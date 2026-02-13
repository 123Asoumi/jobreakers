// API Service - Gère toutes les communications avec les APIs externes
class ApiService {
    constructor() {
        this.config = window.ConfigService;
        this.state = window.StateService;
    }

    // Initialize Supabase client
    initSupabase() {
        if (!this.config) {
            console.warn('ConfigService not available');
            return null;
        }

        const supabaseConfig = this.config.getSupabaseConfig();
        if (!supabaseConfig) {
            console.warn('Supabase configuration not available - Demo mode');
            return null;
        }

        try {
            if (typeof supabase !== 'undefined') {
                return supabase.createClient(supabaseConfig.url, supabaseConfig.key);
            } else {
                console.warn('Supabase JS library not found');
                return null;
            }
        } catch (error) {
            console.error('Error initializing Supabase:', error);
            return null;
        }
    }

    // Save user data to database
    async saveUser(userData) {
        const supabase = this.initSupabase();
        if (!supabase) {
            console.warn('Demo mode: Saving to localStorage only');
            return true;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .upsert([userData], { onConflict: 'email' });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error saving user:', error.message);
            throw error;
        }
    }

    // Login user by email
    async loginUser(email) {
        const supabase = this.initSupabase();
        if (!supabase) {
            // Demo mode - check localStorage
            const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
            const user = users.find(u => u.email === email);
            if (user) {
                this.state.updateUserData(user);
                return user;
            }
            throw new Error('Utilisateur non trouvé en mode démo');
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) {
                throw new Error('Aucun compte trouvé avec cet email');
            }

            this.state.updateUserData(data);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Fetch matched jobs for user
    async fetchMatchedJobs(userProfile) {
        const supabase = this.initSupabase();
        if (!supabase) {
            // Demo mode - return mock data
            return this.getMockJobs();
        }

        try {
            let query = supabase
                .from('job_listings')
                .select('*')
                .order('match_score', { ascending: false })
                .limit(10);

            // Apply filters
            if (userProfile.target_job) {
                query = query.ilike('title', `%${userProfile.target_job}%`);
            }

            if (userProfile.location && userProfile.location !== 'Remote') {
                query = query.ilike('location', `%${userProfile.location}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching jobs:', error);
            // Fallback to demo data
            return this.getMockJobs();
        }
    }

    // Get mock jobs for demo mode
    getMockJobs() {
        return [
            {
                id: '1',
                title: 'Lead UI/UX Designer',
                company: 'Lydia',
                location: 'Paris',
                salary_range: '65k - 75k€',
                tags: ['Figma', 'Design System', 'Mobile'],
                match_score: 94,
                url: '#',
                description: 'Nous recherchons un Lead UI/UX Designer talentueux...'
            },
            {
                id: '2',
                title: 'Product Designer',
                company: 'Alan',
                location: 'Remote',
                salary_range: '70k - 85k€',
                tags: ['Product Design', 'Research', 'Prototyping'],
                match_score: 88,
                url: '#',
                description: 'Rejoignez notre équipe en tant que Product Designer...'
            }
        ];
    }

    // Upload avatar to storage
    async uploadAvatar(file, userEmail) {
        const supabase = this.initSupabase();
        if (!supabase) {
            throw new Error('Supabase non disponible en mode démo');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${userEmail.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        try {
            // Upload file
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    // Delete user account
    async deleteUser(email) {
        const supabase = this.initSupabase();
        if (!supabase) {
            // Demo mode - just clear local data
            return true;
        }

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('email', email);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }
}

window.ApiService = new ApiService();