const INSIGHTS_DATA = {
    'market': [
        { trend: 'IA Générative', val: '+12%', skill: 'Prompt Engineering', impact: 'Transformationnel' },
        { trend: 'Green Tech', val: '+18%', skill: 'Bilan Carbone', impact: 'Élevé' },
        { trend: 'No-Code', val: '+25%', skill: 'Make / n8n', impact: 'Productivité' },
        { trend: 'Web3', val: '+8%', skill: 'Smart Contracts', impact: 'Spécifique' }
    ],
    'design': { trend: 'Spatial Design', val: '+22% (Apple Vision)', skill: 'Spline 3D', impact: 'Visuel' },
    'dev': { trend: 'Rust / WASM', val: '+30% de demande', skill: 'WebAssembly', impact: 'Architecture' },
    'data': { trend: 'LLM Ops', val: '+45% de demande', skill: 'LangChain', impact: 'Stratégique' },
    'marketing': { trend: 'UGC Content', val: '+15% de reach', skill: 'Video Editing', impact: 'Conversion' }
};

const app = {
    // ... (rest of configuration)

    SUPABASE_URL: 'https://udychrmqcmjdofebdvof.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeWNocm1xY21qZG9mZWJkdm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjUyNTQsImV4cCI6MjA4MTk0MTI1NH0.X7SEnddtzRQgnyFRFckM_IdAbWxdG3eGDxM4YQt1L5s',
    supabase: null,

    currentView: 'landing',
    currentStep: 1,
    userData: {
        full_name: '',
        email: '',
        target_job: '',
        location: 'Remote'
    },
    currentJobsCache: [], // Store fetched jobs

    async init() {
        console.log('Jobreaker initialized');
        this.initSupabase();
        this.populateLocations();
        this.setupEventListeners();

        // Listen for auth changes
        this.supabase?.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event);
            if (session) {
                this.userData.id = session.user.id;
                this.userData.email = session.user.email;
                this.loadUserDataFromDB();
            } else {
                this.showView('landing');
            }
        });

        this.checkSession();
        this.subscribeToJobs(); // Listen for new jobs
    },

    async checkSession() {
        if (!this.supabase) return;
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.userData.id = session.user.id;
            this.userData.email = session.user.email;
            await this.loadUserDataFromDB();
            this.showView('dashboard');
        }
    },

    populateLocations(targetId = 'input-location') {
        const select = document.getElementById(targetId);
        if (!select) return;

        const africa = [
            "Afrique du Sud", "Algérie", "Angola", "Bénin", "Botswana", "Burkina Faso", "Burundi",
            "Cap-Vert", "Cameroun", "Centrafrique", "Comores", "Congo (Brazzaville)", "Congo (RDC)",
            "Côte d’Ivoire", "Djibouti", "Égypte", "Érythrée", "Eswatini", "Éthiopie", "Gabon",
            "Gambie", "Ghana", "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Kenya", "Lesotho",
            "Liberia", "Libye", "Madagascar", "Malawi", "Mali", "Maroc", "Maurice", "Mauritanie",
            "Mozambique", "Namibie", "Niger", "Nigeria", "Ouganda", "Rwanda", "Sao Tomé-et-Principe",
            "Sénégal", "Seychelles", "Sierra Leone", "Somalie", "Soudan", "Soudan du Sud", "Tanzanie",
            "Tchad", "Togo", "Tunisie", "Zambie", "Zimbabwe"
        ];

        const europe = [
            "Albanie", "Allemagne", "Andorre", "Arménie", "Autriche", "Azerbaïdjan", "Belgique",
            "Biélorussie", "Bosnie-Herzégovine", "Bulgarie", "Chypre", "Croatie", "Danemark", "Espagne",
            "Estonie", "Finlande", "France", "Géorgie", "Grèce", "Hongrie", "Irlande", "Islande",
            "Italie", "Kazakhstan", "Kosovo", "Lettonie", "Liechtenstein", "Lituanie", "Luxembourg",
            "Malte", "Moldavie", "Monaco", "Monténégro", "Norvège", "Pays-Bas", "Pologne", "Portugal",
            "République Tchèque", "Roumanie", "Royaume-Uni", "Russie", "Saint-Marin", "Serbie",
            "Slovaquie", "Slovénie", "Suède", "Suisse", "Turquie", "Ukraine", "Vatican"
        ];

        const createGroup = (label, countries) => {
            const group = document.createElement('optgroup');
            group.label = label;
            countries.sort().forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                group.appendChild(option);
            });
            return group;
        };

        select.innerHTML = '<option value="" disabled selected>Choisir une localisation</option>';
        select.appendChild(createGroup('Europe', europe));
        select.appendChild(createGroup('Afrique', africa));
    },

    async loadUserDataFromDB() {
        if (!this.supabase || !this.userData.id) return;
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', this.userData.id)
            .single();

        if (data) {
            this.userData = { ...this.userData, ...data };
            this.updateDashboardUI();
        }
    },

    initSupabase() {
        try {
            if (typeof supabase !== 'undefined') {
                this.supabase = supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
                console.log('Supabase client connected');
            } else {
                console.warn('Supabase JS library not found');
            }
        } catch (error) {
            console.error('Error initializing Supabase:', error);
        }
    },

    subscribeToJobs() {
        if (!this.supabase) return;

        console.log('Listening for real-time updates...');
        this.supabase
            .channel('public:job_listings')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'job_listings' }, payload => {
                console.log('New job received!', payload.new);
                this.handleNewJob(payload.new);
            })
            .subscribe();
    },

    handleNewJob(job) {
        const feedContainer = document.querySelector('.feed-list');
        if (!feedContainer) return;

        this.currentJobsCache.unshift(job);

        const jobHTML = `
            <div class="p-10 hover:bg-canvas transition-all cursor-pointer group flex items-center justify-between animate-slide-in" onclick="app.openJobDetails('${job.id}')">
                <div class="flex items-center gap-8">
                    <div class="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-2xl font-black text-white transition-transform group-hover:scale-105 shadow-xl">
                        ${job.company[0]}
                    </div>
                    <div>
                        <h4 class="text-2xl font-black text-black mb-2 group-hover:text-brandPink transition-colors flex items-center gap-3">
                            ${job.title}
                            <span class="px-3 py-1 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest">Nouveau</span>
                        </h4>
                        <p class="text-charcoal font-medium">${job.company} • ${job.location} • <span class="text-black font-bold">${job.salary_range}</span></p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="px-4 py-2 rounded-full ${job.match_score > 90 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'} border text-[10px] font-bold uppercase tracking-widest mb-3">
                        ${job.match_score}% Match
                    </div>
                    <div class="text-black/20 text-xs font-mono font-bold tracking-widest">MAINTENANT</div>
                </div>
            </div>
        `;

        if (feedContainer.innerHTML.includes('Aucune offre') || feedContainer.innerHTML.includes('Recherche')) {
            feedContainer.innerHTML = '';
        }

        feedContainer.insertAdjacentHTML('afterbegin', jobHTML);
    },



    setupEventListeners() {
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const group = chip.closest('.chip-group');
                group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        const locSelect = document.getElementById('input-location');
        if (locSelect) {
            locSelect.addEventListener('change', (e) => {
                this.userData.location = e.target.value;
            });
        }

        window.addEventListener('scroll', () => {
            const nav = document.querySelector('nav');
            if (window.scrollY > 50) {
                nav.classList.add('bg-white/90', 'h-16');
                nav.classList.remove('bg-white/70', 'h-20');
            } else {
                nav.classList.add('bg-white/70', 'h-20');
                nav.classList.remove('bg-white/90', 'h-16');
            }
            this.handleLifecycleScroll();
        });

        this.initThreeBackground();
    },

    showView(viewId) {
        if (this.currentView === viewId) return;

        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            setTimeout(() => {
                if (this.currentView !== view.id.replace('view-', '')) {
                    view.style.display = 'none';
                }
            }, 500);
        });

        const target = document.getElementById('view-' + viewId);
        if (target) {
            target.style.display = 'block';
            setTimeout(() => {
                target.classList.add('active');
            }, 50);
        }

        this.currentView = viewId;
        window.scrollTo(0, 0);

        if (viewId === 'onboarding') {
            this.currentStep = 1;
            this.updateWizard();
        }

        if (viewId === 'dashboard') {
            this.updateDashboardUI();
            this.fetchMatchedJobs();
        }

        if (viewId === 'profile') {
            this.loadProfileData();
        }

        const nav = document.querySelector('nav');
        if (viewId === 'dashboard' || viewId === 'onboarding' || viewId === 'profile' || viewId === 'settings' || viewId === 'job-details') {
            if (nav) nav.style.display = 'none';
        } else {
            if (nav) {
                nav.style.display = 'block';
            }
        }
    },

    async deleteAccount() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
            return;
        }

        const email = this.userData.email;
        if (!email) {
            alert('Impossible de trouver votre compte.');
            return;
        }

        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('users')
                    .delete()
                    .eq('email', email);

                if (error) {
                    console.error('Delete error:', error);
                    alert('Note: La suppression complète sur le serveur peut nécessiter des droits supplémentaires.\nVotre session locale sera détruite.');
                }
            }

            this.logout();
            alert('Votre compte a été supprimé.');

        } catch (err) {
            console.error(err);
            alert('Une erreur est survenue.');
        }
    },

    loadProfileData() {
        const profileLoc = document.getElementById('profile-location');
        if (profileLoc && profileLoc.options.length <= 2) {
            this.populateLocations('profile-location');
        }

        if (this.userData) {
            const nameInput = document.getElementById('profile-name');
            const emailInput = document.getElementById('profile-email');
            const jobInput = document.getElementById('profile-job');
            const locInput = document.getElementById('profile-location');
            const avatarPreview = document.getElementById('profile-avatar-preview');

            if (nameInput) nameInput.value = this.userData.full_name || '';
            if (emailInput) emailInput.value = this.userData.email || '';
            if (jobInput) jobInput.value = this.userData.target_job || '';

            if (avatarPreview) {
                if (this.userData.avatar_url) {
                    avatarPreview.innerHTML = `<img src="${this.userData.avatar_url}" style="width:100%; height:100%; object-fit:cover;">`;
                } else {
                    const initials = (this.userData.full_name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    avatarPreview.innerText = initials;
                }
            }

            setTimeout(() => {
                if (locInput) locInput.value = this.userData.location || '';
            }, 100);
        }
    },

    async uploadAvatar() {
        const fileInput = document.getElementById('avatar-upload');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

        const file = fileInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${this.userData.email.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Show loading
        const avatarPreview = document.getElementById('profile-avatar-preview');
        const oldContent = avatarPreview.innerHTML;
        avatarPreview.innerHTML = '<div class="pulse" style="background:#FFF;"></div>';

        try {
            if (!this.supabase) throw new Error('Supabase not connected');

            // 1. Upload
            const { error: uploadError } = await this.supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get URL
            const { data } = this.supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // 3. Update User
            this.userData.avatar_url = publicUrl;

            // Save to DB
            await this.saveUserToSupabase();

            // Update UI
            avatarPreview.innerHTML = `<img src="${publicUrl}" style="width:100%; height:100%; object-fit:cover;">`;
            this.updateDashboardUI();

            alert('Photo de profil mise à jour !');

        } catch (error) {
            console.error('Upload error:', error);
            alert('Erreur lors de l\'upload : ' + error.message);
            avatarPreview.innerHTML = oldContent;
        }
    },

    async updateProfile() {
        const name = document.getElementById('profile-name').value;
        const job = document.getElementById('profile-job').value;
        const location = document.getElementById('profile-location').value;

        if (!name || !job || !location) {
            alert('Veuillez remplir tous les champs.');
            return;
        }

        this.userData.full_name = name;
        this.userData.target_job = job;
        this.userData.location = location;

        const success = await this.saveUserToSupabase();

        if (success) {
            alert('Profil mis à jour avec succès !');
        }
    },

    async nextStep() {
        if (this.currentStep === 1) {
            const name = document.getElementById('input-name').value;
            const email = document.getElementById('input-email').value;

            if (!name || !email) {
                alert('Veuillez remplir tous les champs.');
                return;
            }

            this.userData.full_name = name;
            this.userData.email = email;

            // Trigger Magic Link Signup
            try {
                const { error } = await this.supabase.auth.signInWithOtp({
                    email: this.userData.email,
                    options: {
                        data: { full_name: this.userData.full_name }
                    }
                });
                if (error) throw error;

                alert('Un lien de validation a été envoyé à ' + this.userData.email + '. Cliquez dessus pour continuer votre inscription.');
                this.currentStep++;
                this.updateWizard();
            } catch (err) {
                console.error('Auth error:', err);
                alert('Erreur: ' + err.message);
            }
        } else if (this.currentStep === 2) {
            // Step 2 is now "Profile Completion" after email verification
            // But for onboarding flow simplicity, we can just proceed to dashboard
            this.currentStep++;
            this.updateWizard();
        }
    },

    async saveUserToSupabase() {
        console.log('Saving to Supabase:', this.userData);

        if (!this.supabase) {
            console.error('Supabase not initialized');
            localStorage.setItem('jobreaker_user', JSON.stringify(this.userData));
            return true;
        }

        try {
            // Clean userData before sending to database
            const cleanUserData = { ...this.userData };

            // Remove id if it's empty or not a valid UUID
            if (!cleanUserData.id || cleanUserData.id === '') {
                delete cleanUserData.id;
            }

            // Only keep fields that exist in the users table schema
            const allowedFields = ['id', 'full_name', 'email', 'target_job', 'location', 'skills', 'avatar_url', 'status'];
            Object.keys(cleanUserData).forEach(key => {
                if (!allowedFields.includes(key)) {
                    delete cleanUserData[key];
                }
            });

            const { data, error } = await this.supabase
                .from('users')
                .upsert([cleanUserData], { onConflict: 'email' });

            if (error) throw error;

            console.log('User saved successfully');
            localStorage.setItem('jobreaker_user', JSON.stringify(this.userData));

            this.seedJobsIfNeeded();

            return true;
        } catch (error) {
            console.error('Error saving user:', error.message);
            alert('Erreur lors de l\'enregistrement : ' + error.message);
            return false;
        }
    },

    updateWizard() {
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        for (let i = 1; i <= 3; i++) {
            const dot = document.getElementById('dot-' + i);
            if (dot) {
                if (i <= this.currentStep) {
                    dot.classList.add('bg-black');
                    dot.classList.remove('bg-black/5');
                } else {
                    dot.classList.remove('bg-black');
                    dot.classList.add('bg-black/5');
                }
            }
        }
    },

    updateDashboardUI() {
        const welcomeTitle = document.getElementById('dash-welcome');
        const profileName = document.getElementById('profile-summary-name');
        const profileAvatarPreviews = [
            document.getElementById('profile-avatar-preview'),
            document.getElementById('profile-avatar-preview-2')
        ];

        if (welcomeTitle) welcomeTitle.innerText = `Hello, ${this.userData.full_name || 'Ami'}.`;
        if (profileName) profileName.innerText = this.userData.full_name || 'Alex Rivera';

        profileAvatarPreviews.forEach(preview => {
            if (preview && this.userData.full_name) {
                if (this.userData.avatar_url) {
                    preview.innerHTML = `<img src="${this.userData.avatar_url}" class="w-full h-full object-cover">`;
                } else {
                    const initials = this.userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
                    preview.innerText = initials.substring(0, 2);
                }
            }
        });

        this.updateInsights();
    },

    updateInsights() {
        const jobTitle = (this.userData.target_job || '').toLowerCase();

        let data = INSIGHTS_DATA['market'][0]; // Default

        if (jobTitle.includes('design') || jobTitle.includes('ui') || jobTitle.includes('ux')) {
            data = INSIGHTS_DATA['design'];
        } else if (jobTitle.includes('dev') || jobTitle.includes('engineer') || jobTitle.includes('web') || jobTitle.includes('tech')) {
            data = INSIGHTS_DATA['dev'];
        } else if (jobTitle.includes('data') || jobTitle.includes('analyst') || jobTitle.includes('ia')) {
            data = INSIGHTS_DATA['data'];
        } else if (jobTitle.includes('marketing') || jobTitle.includes('social') || jobTitle.includes('brand')) {
            data = INSIGHTS_DATA['marketing'];
        } else {
            // Random general trend if no match
            data = INSIGHTS_DATA['market'][Math.floor(Math.random() * INSIGHTS_DATA['market'].length)];
        }

        // Update Card 1: Signal
        const signalTrend = document.getElementById('signal-trend');
        const signalVal = document.getElementById('signal-value');
        if (signalTrend) signalTrend.innerHTML = data.trend.replace(' ', '<br>');
        if (signalVal) signalVal.innerText = data.val;

        // Update Card 2: Skill
        const skillName = document.getElementById('skill-name');
        const skillImpact = document.getElementById('skill-impact');
        if (skillName) skillName.innerHTML = data.skill.replace(' ', '<br>');
        if (skillImpact) skillImpact.innerText = `Impact: ${data.impact}`;

        // Update Card 3: Mini Profile
        const miniName = document.getElementById('mini-profile-name');
        const miniJob = document.getElementById('mini-profile-job');
        const miniAvatar = document.getElementById('mini-profile-avatar');

        if (miniName) miniName.innerText = this.userData.full_name || 'Guest';
        if (miniJob) miniJob.innerText = `Profil : ${this.userData.target_job || 'Explorateur'}`;
        if (miniAvatar) {
            if (this.userData.avatar_url) {
                miniAvatar.innerHTML = `<img src="${this.userData.avatar_url}" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                const initials = (this.userData.full_name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                miniAvatar.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#000;color:#fff;font-size:1.5rem;">${initials}</div>`;
            }
        }
    },

    async login() {
        const emailInput = document.getElementById('login-email');
        if (!emailInput) return;
        const email = emailInput.value.trim();

        if (!email) {
            alert('Veuillez entrer votre email.');
            return;
        }

        try {
            const { error } = await this.supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            alert('Lien de connexion envoyé ! Vérifiez votre boîte mail.');
        } catch (err) {
            console.error('Login error:', err);
            alert('Erreur : ' + err.message);
        }
    },

    async logout() {
        if (this.supabase) await this.supabase.auth.signOut();
        this.userData = {
            id: '',
            full_name: '',
            email: '',
            target_job: '',
            location: 'Remote'
        };
        localStorage.removeItem('jobreaker_user');
        this.showView('landing');
    },

    // --- AUTOMATION LOGIC ---

    async seedJobsIfNeeded() {
        if (!this.supabase) return;

        const { count, error } = await this.supabase
            .from('job_listings')
            .select('*', { count: 'exact', head: true });

        if (!error && count === 0) {
            console.log('Seeding jobs...');
            const mockJobs = [
                {
                    title: 'Lead UI/UX Designer',
                    company: 'Lydia',
                    location: 'Paris',
                    salary_range: '65k - 75k€',
                    tags: ['Figma', 'Design System', 'Mobile'],
                    match_score: 94
                }
            ];
            // Just basic seed, not critical since we rely on ingestion
            await this.supabase.from('job_listings').insert(mockJobs);
        }
    },

    async fetchMatchedJobs() {
        const feedContainer = document.querySelector('.feed-list');
        if (!feedContainer) return;

        feedContainer.innerHTML = '<div class="p-12 text-center text-subtle font-medium">Recherche d\'opportunités stratèges...</div>';

        let jobs = [];
        if (this.supabase) {
            let query = this.supabase.from('job_listings').select('*').order('match_score', { ascending: false }).limit(10);
            if (this.userData.target_job) query = query.ilike('title', `%${this.userData.target_job}%`);
            const { data, error } = await query;
            if (!error && data && data.length > 0) jobs = data;
        }

        if (jobs.length === 0) {
            feedContainer.innerHTML = '<div class="p-12 text-center text-subtle font-medium">Aucune rupture détectée pour le moment. Allez prendre un café.</div>';
            return;
        }

        this.currentJobsCache = jobs;

        feedContainer.innerHTML = jobs.map(job => `
            <div class="p-10 hover:bg-canvas transition-all cursor-pointer group flex items-center justify-between" onclick="app.openJobDetails('${job.id}')">
                <div class="flex items-center gap-8">
                    <div class="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-2xl font-black text-white transition-transform group-hover:scale-105 shadow-xl">
                        ${job.company[0]}
                    </div>
                    <div>
                        <h4 class="text-2xl font-black text-black mb-2 group-hover:text-brandPink transition-colors tracking-tight">${job.title}</h4>
                        <p class="text-charcoal font-medium">${job.company} • ${job.location} • <span class="text-black font-bold">${job.salary_range}</span></p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="px-4 py-2 rounded-full ${job.match_score > 90 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'} border text-[10px] font-bold uppercase tracking-widest mb-3">
                        ${job.match_score}% Match
                    </div>
                    <div class="text-black/20 text-xs font-mono font-bold tracking-widest">HIER, 22:04</div>
                </div>
            </div>
        `).join('');
    },

    openJobDetails(jobId) {
        const job = this.currentJobsCache.find(j => j.id === jobId);
        if (!job) return;

        const container = document.getElementById('job-details-content');
        const applyBtn = document.getElementById('job-apply-btn');

        if (container) {
            container.innerHTML = `
                <div class="flex items-center gap-10 mb-16">
                    <div class="w-24 h-24 rounded-[2rem] bg-black flex items-center justify-center text-4xl font-black text-white shadow-2xl">
                        ${job.company[0]}
                    </div>
                    <div>
                        <h1 class="font-display text-5xl font-black text-black mb-3 tracking-tighter">${job.title}</h1>
                        <p class="text-charcoal text-2xl font-medium">${job.company} • ${job.location}</p>
                    </div>
                </div>

                <div class="flex gap-4 mb-16">
                     <div class="px-6 py-3 rounded-2xl bg-canvas border border-black/5 text-black font-black text-sm uppercase tracking-widest">
                        ${job.salary_range}
                    </div>
                    <div class="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-sm uppercase tracking-widest">
                        ${job.match_score}% Match Stratégique
                    </div>
                </div>

                <div class="prose max-w-none text-charcoal leading-loose text-xl font-medium">
                    ${job.description || '<p class="italic opacity-50">Aucune description détaillée n\'a pu être extraite. Nous vous conseillons de consulter l\'offre via le bouton ci-dessous pour plus de granularité.</p>'}
                </div>
            `;
        }

        if (applyBtn) applyBtn.href = job.url || '#';
        this.showView('job-details');
    },

    handleLifecycleScroll() {
        const lifecycle = document.getElementById('lifecycle');
        if (!lifecycle || this.currentView !== 'landing') return;

        const rect = lifecycle.getBoundingClientRect();
        const steps = document.querySelectorAll('.lifecycle-step');
        const pinkBox = document.querySelector('.avatar-center > div');

        steps.forEach((step, i) => {
            const stepRect = step.getBoundingClientRect();
            const center = window.innerHeight / 2;

            if (stepRect.top < center + 100 && stepRect.bottom > center - 100) {
                step.style.opacity = '1';
                step.style.transform = 'translateX(20px)';

                // Update central visual based on step
                if (pinkBox) {
                    if (i === 0) pinkBox.style.transform = 'scale(1) rotate(0deg)';
                    if (i === 1) pinkBox.style.transform = 'scale(1.2) rotate(45deg)';
                    if (i === 2) pinkBox.style.transform = 'scale(0.9) rotate(-15deg)';
                }
            } else {
                step.style.opacity = '0.3';
                step.style.transform = 'translateX(0)';
            }
        });
    },

    initThreeBackground() {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // Create a subtle floating network of points
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 5000; i++) {
            vertices.push(
                THREE.MathUtils.randFloatSpread(2000),
                THREE.MathUtils.randFloatSpread(2000),
                THREE.MathUtils.randFloatSpread(2000)
            );
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0x000000, size: 2, transparent: true, opacity: 0.05 });
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        camera.position.z = 1000;

        const animate = () => {
            requestAnimationFrame(animate);
            points.rotation.x += 0.0001;
            points.rotation.y += 0.0001;
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
};

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.view').forEach(v => {
        if (!v.classList.contains('active')) {
            v.style.display = 'none';
        }
    });
    app.init();
});
