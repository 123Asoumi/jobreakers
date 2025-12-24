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
        location: ''
    },
    currentJobsCache: [], // Store fetched jobs

    async init() {
        console.log('Jobreaker initialized');
        this.initSupabase();
        this.populateLocations();
        this.setupEventListeners();
        this.checkSession();
        this.subscribeToJobs(); // Listen for new jobs
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

        select.appendChild(createGroup('Europe', europe));
        select.appendChild(createGroup('Afrique', africa));
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
        // Only react if we are on the dashboard
        const feedContainer = document.querySelector('.feed-list');
        if (!feedContainer) return;

        // Store in cache if needed (though cache is usually for full list)
        this.currentJobsCache.unshift(job);

        // Create HTML
        const jobHTML = `
            <div class="card feed-item new-item" style="animation: slideDown 0.5s ease-out; border-left: 3px solid #EC4899;">
                <div class="item-info">
                    <div class="item-icon">${job.company[0]}</div>
                    <div>
                        <h4>${job.title} <span style="font-size:0.7em; color:#EC4899; vertical-align:middle; margin-left:5px;">● NOUVEAU</span></h4>
                        <p class="text-gray">${job.company} • ${job.location} • ${job.salary_range}</p>
                    </div>
                </div>
                <div class="item-meta">
                    <div class="tags-row" style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
                         ${job.tags ? job.tags.map(t => `<span style="font-size:0.7rem; background:#f3f4f6; padding:0.1rem 0.4rem; border-radius:4px;">${t}</span>`).join('') : ''}
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                        <span class="match-tag" style="background:${job.match_score > 90 ? '#DEF7EC' : '#FDF6B2'}; color:${job.match_score > 90 ? '#03543F' : '#723B13'}">${job.match_score}% Match</span>
                        <div style="display:flex; gap: 10px; align-items: center;">
                            ${job.url ? `<a href="${job.url}" target="_blank" style="font-size:0.8rem; color:#EC4899; text-decoration:none;">Source ↗</a>` : ''}
                            <button onclick="app.openJobDetails('${job.id}')" style="background:none; border:none; text-decoration:underline; cursor:pointer; font-size:0.8rem; color:#6B7280;">Détails</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Prepend logic
        if (feedContainer.innerHTML.includes('Aucune offre')) {
            feedContainer.innerHTML = '';
        }

        feedContainer.insertAdjacentHTML('afterbegin', jobHTML);
    },

    checkSession() {
        const saved = localStorage.getItem('jobreaker_user');
        if (saved) {
            this.userData = JSON.parse(saved);
        }
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
            const nav = document.getElementById('navbar');
            if (window.scrollY > 50) {
                nav.style.padding = '1rem 0';
                nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
            } else {
                nav.style.padding = '1.5rem 0';
                nav.style.boxShadow = 'none';
            }
        });
    },

    showView(viewId) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            setTimeout(() => {
                view.style.display = 'none';
            }, 600);
        });

        const target = document.getElementById('view-' + viewId);
        setTimeout(() => {
            target.style.display = 'block';
            setTimeout(() => {
                target.classList.add('active');
            }, 50);
        }, 600);

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

        const nav = document.getElementById('navbar');
        if (viewId === 'dashboard' || viewId === 'onboarding' || viewId === 'profile' || viewId === 'settings' || viewId === 'job-details') {
            nav.style.display = 'none';
        } else {
            nav.style.display = 'block';
            setTimeout(() => {
                nav.style.transform = 'translateY(0)';
            }, 10);
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

            this.currentStep++;
            this.updateWizard();
        } else if (this.currentStep === 2) {
            const job = document.getElementById('input-job').value;
            const location = document.getElementById('input-location').value;

            if (!job) {
                alert('Veuillez préciser le poste visé.');
                return;
            }

            if (!location) {
                alert('Veuillez choisir une localisation.');
                return;
            }

            this.userData.target_job = job;
            this.userData.location = location;

            const success = await this.saveUserToSupabase();
            if (success) {
                this.currentStep++;
                this.updateWizard();
            }
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
            const { data, error } = await this.supabase
                .from('users')
                .upsert([this.userData], { onConflict: 'email' });

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

        document.querySelectorAll('.progress-dot').forEach((dot, index) => {
            if (index + 1 === this.currentStep) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    },

    updateDashboardUI() {
        const welcomeTitle = document.querySelector('.welcome h2');
        const profileName = document.querySelector('.profile-summary h3');
        const profileAvatar = document.querySelector('.avatar');
        const profileSub = document.querySelector('.profile-summary p');

        if (welcomeTitle) welcomeTitle.innerText = `Hello, ${this.userData.full_name || 'Ami'}.`;
        if (profileName) profileName.innerText = this.userData.full_name || 'Alex Rivera';
        if (profileSub) profileSub.innerText = `Profil : ${this.userData.target_job || 'Humain Augmenté'}`;

        if (profileAvatar && this.userData.full_name) {
            if (this.userData.avatar_url) {
                profileAvatar.innerHTML = `<img src="${this.userData.avatar_url}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            } else {
                const initials = this.userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
                profileAvatar.innerText = initials.substring(0, 2);
            }
        }

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
            if (!this.supabase) {
                console.warn('Supabase not connected, mocking login');
                const saved = localStorage.getItem('jobreaker_user');
                if (saved) {
                    const localUser = JSON.parse(saved);
                    if (localUser.email === email) {
                        this.userData = localUser;
                        this.showView('dashboard');
                        return;
                    }
                }
                alert('Mode démo : Utilisateur non trouvé ou Supabase déconnecté.');
                return;
            }

            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) {
                alert('Aucun compte trouvé avec cet email.');
                console.error(error);
                return;
            }

            this.userData = data;
            localStorage.setItem('jobreaker_user', JSON.stringify(this.userData));

            console.log('Login successful:', this.userData);
            this.showView('dashboard');

        } catch (err) {
            console.error('Login error:', err);
            alert('Une erreur est survenue lors de la connexion.');
        }
    },

    logout() {
        localStorage.removeItem('jobreaker_user');
        this.userData = {
            full_name: '',
            email: '',
            target_job: '',
            location: 'Remote'
        };
        const loginInput = document.getElementById('login-email');
        if (loginInput) loginInput.value = '';

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

        feedContainer.innerHTML = '<div style="padding:2rem; text-align:center; color:#666;">Recherche d\'opportunités...</div>';

        let jobs = [];
        let isFallback = false;

        if (this.supabase) {
            // 1. Try Filtered Query
            let query = this.supabase
                .from('job_listings')
                .select('*')
                .order('match_score', { ascending: false })
                .limit(10);

            if (this.userData.target_job) {
                query = query.ilike('title', `%${this.userData.target_job}%`);
            }

            if (this.userData.location && this.userData.location !== 'Remote') {
                query = query.ilike('location', `%${this.userData.location}%`);
            }

            const { data, error } = await query;

            if (!error && data && data.length > 0) {
                jobs = data;
            } else {
                // 2. Fallback
                isFallback = true;
                const { data: allData, error: allError } = await this.supabase
                    .from('job_listings')
                    .select('*')
                    .order('match_score', { ascending: false })
                    .limit(10);

                if (!allError && allData) jobs = allData;
            }
        }

        if (jobs.length === 0) {
            feedContainer.innerHTML = '<div style="padding:2rem; text-align:center; color:#666;">Aucune offre disponible pour le moment.</div>';
            return;
        }

        // store in cache
        this.currentJobsCache = jobs;

        let html = '';
        if (isFallback) {
            html += `<div style="padding: 1rem; margin-bottom: 1rem; background: #FFF1F2; color: #9B1C1C; border-radius: 0.5rem; border: 1px solid #FDE8E8; font-size: 0.9rem;">
                <strong>Aucun match exact pour votre profil.</strong> Voici les opportunités les plus pertinentes du moment.
            </div>`;
        }

        html += jobs.map(job => `
            <div class="card feed-item" onclick="app.openJobDetails('${job.id}')" style="cursor: pointer; transition: transform 0.2s;">
                <div class="item-info">
                    <div class="item-icon">${job.company[0]}</div>
                    <div>
                        <h4>${job.title}</h4>
                        <p class="text-gray">${job.company} • ${job.location} • ${job.salary_range}</p>
                    </div>
                </div>
                <div class="item-meta">
                    <div class="tags-row" style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
                        ${job.tags ? job.tags.map(t => `<span style="font-size:0.7rem; background:#f3f4f6; padding:0.1rem 0.4rem; border-radius:4px;">${t}</span>`).join('') : ''}
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                        <span class="match-tag" style="background:${job.match_score > 90 ? '#DEF7EC' : '#FDF6B2'}; color:${job.match_score > 90 ? '#03543F' : '#723B13'}">${job.match_score}% Match</span>
                         <button style="margin-left:auto; background:none; border:none; text-decoration:underline; cursor:pointer; font-size:0.8rem; color:#6B7280; z-index: 2; position: relative;" onclick="event.stopPropagation(); app.openJobDetails('${job.id}')">Détails</button>
                    </div>
                </div>
            </div>
        `).join('');

        feedContainer.innerHTML = html;
    },

    openJobDetails(jobId) {
        const job = this.currentJobsCache.find(j => j.id === jobId);
        if (!job) return;

        const container = document.getElementById('job-details-content');
        const applyBtn = document.getElementById('job-apply-btn');

        if (container) {
            container.innerHTML = `
                <div style="display:flex; align-items:center; gap:1.5rem; margin-bottom:2rem;">
                    <div style="width:80px; height:80px; background:#000; color:#FFF; border-radius:1rem; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:900;">${job.company[0]}</div>
                    <div>
                        <h1 style="font-size: 2rem; line-height:1.2; margin-bottom:0.5rem;">${job.title}</h1>
                        <p class="text-gray" style="font-size: 1.1rem;">${job.company} • ${job.location}</p>
                    </div>
                </div>

                <div style="margin-bottom: 2rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                    <span style="background:#f3f4f6; padding:0.5rem 1rem; border-radius:99px; font-weight:600;">${job.salary_range}</span>
                    <span style="background:${job.match_score > 90 ? '#DEF7EC' : '#FDF6B2'}; color:${job.match_score > 90 ? '#03543F' : '#723B13'}; padding:0.5rem 1rem; border-radius:99px; font-weight:600;">${job.match_score}% Match</span>
                </div>

                <div class="job-description-body" style="line-height: 1.8; color: #374151; font-size: 1.05rem;">
                    ${job.description || '<p style="color:#666; font-style:italic; padding: 2rem; background: #f9fafb; border-radius: 1rem; text-align: center;">Pas de description détaillée disponible.<br>Veuillez vérifier sur le site source pour plus d\'informations.</p>'}
                </div>
            `;
        }

        if (applyBtn) {
            applyBtn.href = job.url || '#';
        }

        this.showView('job-details');
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
