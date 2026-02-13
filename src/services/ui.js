// UI Service - Gère les interactions avec l'interface utilisateur
class UIService {
    constructor() {
        this.state = window.StateService;
        this.api = window.ApiService;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupViewTransitions();
    }

    // Afficher une vue spécifique
    showView(viewId) {
        const currentState = this.state.getState();
        
        // Prevent flickering if already on the same view
        if (currentState.currentView === viewId) {
            const target = document.getElementById(`view-${viewId}`);
            if (target && target.classList.contains('active')) {
                this.handleViewSpecificSetup(viewId);
                return;
            }
        }

        // Hide all views with fade out
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            setTimeout(() => {
                if (this.state.getState('currentView') !== view.id.replace('view-', '')) {
                    view.style.display = 'none';
                }
            }, 600);
        });

        // Show target view
        const target = document.getElementById(`view-${viewId}`);
        if (target) {
            target.style.display = 'block';
            setTimeout(() => {
                target.classList.add('active');
            }, 50);
        }

        this.state.setState({ currentView: viewId });
        window.scrollTo(0, 0);
        this.handleViewSpecificSetup(viewId);
        this.updateNavigation(viewId);
    }

    // Configuration spécifique pour chaque vue
    handleViewSpecificSetup(viewId) {
        switch (viewId) {
            case 'onboarding':
                this.state.setState({ currentStep: 1 });
                this.updateWizard();
                break;
            case 'dashboard':
                this.updateDashboardUI();
                this.fetchAndDisplayJobs();
                break;
            case 'profile':
                this.loadProfileData();
                break;
        }
    }

    // Mettre à jour la navigation
    updateNavigation(viewId) {
        const nav = document.getElementById('navbar');
        const hiddenViews = ['dashboard', 'onboarding', 'profile', 'settings', 'job-details'];
        
        if (hiddenViews.includes(viewId)) {
            nav.style.display = 'none';
        } else {
            nav.style.display = 'block';
            setTimeout(() => {
                nav.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    // Configuration du wizard d'onboarding
    updateWizard() {
        const currentStep = this.state.getState('currentStep');
        
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        document.querySelectorAll('.progress-dot').forEach((dot, index) => {
            if (index + 1 === currentStep) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Mettre à jour l'interface du dashboard
    updateDashboardUI() {
        const userData = this.state.getState('userData');
        
        // Welcome message
        const welcomeTitle = document.querySelector('.welcome h2');
        if (welcomeTitle) {
            welcomeTitle.textContent = `Hello, ${userData.full_name || 'Ami'}.`;
        }

        // Profile summary
        const profileName = document.querySelector('.profile-summary h3');
        if (profileName) {
            profileName.textContent = userData.full_name || 'Alex Rivera';
        }

        const profileSub = document.querySelector('.profile-summary p');
        if (profileSub) {
            profileSub.textContent = `Profil : ${userData.target_job || 'Humain Augmenté'}`;
        }

        // Avatar
        this.updateAvatar(userData);
        
        // Update insights
        this.updateInsights(userData);
    }

    // Mettre à jour l'avatar
    updateAvatar(userData) {
        const avatarElements = [
            document.querySelector('.profile-summary .avatar'),
            document.getElementById('profile-avatar-preview'),
            document.getElementById('mini-profile-avatar')
        ];

        avatarElements.forEach(avatar => {
            if (!avatar) return;
            
            if (userData.avatar_url) {
                avatar.innerHTML = `<img src="${userData.avatar_url}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            } else if (userData.full_name) {
                const initials = userData.full_name.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
                avatar.textContent = initials;
            }
        });
    }

    // Mettre à jour les insights du marché
    updateInsights(userData) {
        const insights = this.getInsightsForJob(userData.target_job);
        
        // Update signal card
        const signalTrend = document.getElementById('signal-trend');
        const signalValue = document.getElementById('signal-value');
        if (signalTrend) signalTrend.innerHTML = insights.trend.replace(' ', '<br>');
        if (signalValue) signalValue.textContent = insights.val;

        // Update skill card
        const skillName = document.getElementById('skill-name');
        const skillImpact = document.getElementById('skill-impact');
        if (skillName) skillName.innerHTML = insights.skill.replace(' ', '<br>');
        if (skillImpact) skillImpact.textContent = `Impact: ${insights.impact}`;
    }

    // Obtenir les insights pour un métier spécifique
    getInsightsForJob(jobTitle) {
        const INSIGHTS_DATA = {
            market: [
                { trend: 'IA Générative', val: '+12%', skill: 'Prompt Engineering', impact: 'Transformationnel' },
                { trend: 'Green Tech', val: '+18%', skill: 'Bilan Carbone', impact: 'Élevé' },
                { trend: 'No-Code', val: '+25%', skill: 'Make / n8n', impact: 'Productivité' }
            ],
            design: { trend: 'Spatial Design', val: '+22%', skill: 'Spline 3D', impact: 'Visuel' },
            dev: { trend: 'Rust / WASM', val: '+30%', skill: 'WebAssembly', impact: 'Architecture' },
            data: { trend: 'LLM Ops', val: '+45%', skill: 'LangChain', impact: 'Stratégique' },
            marketing: { trend: 'UGC Content', val: '+15%', skill: 'Video Editing', impact: 'Conversion' }
        };

        const job = (jobTitle || '').toLowerCase();
        
        if (job.includes('design') || job.includes('ui') || job.includes('ux')) {
            return INSIGHTS_DATA.design;
        } else if (job.includes('dev') || job.includes('engineer') || job.includes('tech')) {
            return INSIGHTS_DATA.dev;
        } else if (job.includes('data') || job.includes('analyst') || job.includes('ia')) {
            return INSIGHTS_DATA.data;
        } else if (job.includes('marketing') || job.includes('social') || job.includes('brand')) {
            return INSIGHTS_DATA.marketing;
        } else {
            return INSIGHTS_DATA.market[Math.floor(Math.random() * INSIGHTS_DATA.market.length)];
        }
    }

    // Charger les données du profil
    loadProfileData() {
        const userData = this.state.getState('userData');
        const locations = document.getElementById('profile-location');
        
        if (locations && locations.options.length <= 2) {
            this.populateLocations('profile-location');
        }

        // Fill form fields
        const fields = {
            'profile-name': userData.full_name || '',
            'profile-email': userData.email || '',
            'profile-job': userData.target_job || '',
            'profile-location': userData.location || ''
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });

        // Update avatar preview
        setTimeout(() => {
            const locInput = document.getElementById('profile-location');
            if (locInput && userData.location) {
                locInput.value = userData.location;
            }
        }, 100);
    }

    // Fetch et afficher les offres d'emploi
    async fetchAndDisplayJobs() {
        const feedContainer = document.querySelector('.feed-list');
        if (!feedContainer) return;

        feedContainer.innerHTML = '<div style="padding:2rem; text-align:center; color:#666;">Recherche d\'opportunités...</div>';
        
        try {
            const userData = this.state.getState('userData');
            const jobs = await this.api.fetchMatchedJobs(userData);
            this.state.setState({ currentJobsCache: jobs });
            this.renderJobsFeed(jobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            feedContainer.innerHTML = '<div style="padding:2rem; text-align:center; color:#EF4444;">Erreur lors du chargement des offres.</div>';
        }
    }

    // Afficher les offres dans le feed
    renderJobsFeed(jobs, isFallback = false) {
        const feedContainer = document.querySelector('.feed-list');
        if (!feedContainer) return;

        if (jobs.length === 0) {
            feedContainer.innerHTML = '<div style="padding:2rem; text-align:center; color:#666;">Aucune offre disponible pour le moment.</div>';
            return;
        }

        let html = '';
        if (isFallback) {
            html += `<div style="padding: 1rem; margin-bottom: 1rem; background: #FFF1F2; color: #9B1C1C; border-radius: 0.5rem; border: 1px solid #FDE8E8; font-size: 0.9rem;">
                <strong>Aucun match exact pour votre profil.</strong> Voici les opportunités les plus pertinentes du moment.
            </div>`;
        }

        html += jobs.map(job => this.createJobItemHTML(job)).join('');
        feedContainer.innerHTML = html;
    }

    // Créer le HTML pour un item d'offre
    createJobItemHTML(job) {
        const tagsHTML = job.tags ? job.tags.map(tag => 
            `<span style="font-size:0.7rem; background:#f3f4f6; padding:0.1rem 0.4rem; border-radius:4px;">${tag}</span>`
        ).join('') : '';

        const matchColor = job.match_score > 90 ? '#DEF7EC' : '#FDF6B2';
        const matchTextColor = job.match_score > 90 ? '#03543F' : '#723B13';

        return `
            <div class="card feed-item" onclick="window.UIService.openJobDetails('${job.id}')" style="cursor: pointer; transition: transform 0.2s;">
                <div class="item-info">
                    <div class="item-icon">${job.company[0]}</div>
                    <div>
                        <h4>${job.title}</h4>
                        <p class="text-gray">${job.company} • ${job.location} • ${job.salary_range}</p>
                    </div>
                </div>
                <div class="item-meta">
                    <div class="tags-row" style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
                        ${tagsHTML}
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                        <span class="match-tag" style="background:${matchColor}; color:${matchTextColor}">${job.match_score}% Match</span>
                        <button style="margin-left:auto; background:none; border:none; text-decoration:underline; cursor:pointer; font-size:0.8rem; color:#6B7280; z-index: 2; position: relative;" onclick="event.stopPropagation(); window.UIService.openJobDetails('${job.id}')">Détails</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Ouvrir les détails d'une offre
    openJobDetails(jobId) {
        const jobs = this.state.getState('currentJobsCache');
        const job = jobs.find(j => j.id === jobId);
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

    // Gérer l'upload d'avatar
    async handleAvatarUpload(file) {
        if (!file) return;

        const avatarPreview = document.getElementById('profile-avatar-preview');
        const oldContent = avatarPreview.innerHTML;
        avatarPreview.innerHTML = '<div class="pulse" style="background:#FFF;"></div>';

        try {
            const userData = this.state.getState('userData');
            const publicUrl = await this.api.uploadAvatar(file, userData.email);
            
            this.state.updateUserData({ avatar_url: publicUrl });
            this.updateDashboardUI();
            
            alert('Photo de profil mise à jour !');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erreur lors de l\'upload : ' + error.message);
            avatarPreview.innerHTML = oldContent;
        }
    }

    // Gérer les transitions entre vues
    setupViewTransitions() {
        // Ajoute des animations fluides lors du changement de vue
        const style = document.createElement('style');
        style.textContent = `
            .view {
                transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .view.active {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Scroll effect on navbar
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

        // Location change listener
        const locSelect = document.getElementById('input-location');
        if (locSelect) {
            locSelect.addEventListener('change', (e) => {
                this.state.updateUserData({ location: e.target.value });
            });
        }
    }

    // Remplir les options de localisation
    populateLocations(targetId = 'input-location') {
        const select = document.getElementById(targetId);
        if (!select) return;

        const locations = [
            'Remote (Télétravail)',
            'France', 'Allemagne', 'Espagne', 'Italie', 'Royaume-Uni', 'Belgique', 'Suisse', 'Pays-Bas',
            'Canada', 'États-Unis', 'Brésil', 'Mexique', 'Argentine', 'Chili', 'Colombie',
            'Maroc', 'Algérie', 'Tunisie', 'Égypte', 'Afrique du Sud', 'Nigeria', 'Kenya', 'Ghana'
        ];

        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Add new options
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            select.appendChild(option);
        });
    }

    // Afficher les erreurs de manière élégante
    showError(message, context = 'general') {
        const errorHTML = `
            <div class="error-toast" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #EF4444;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
                z-index: 9999;
                animation: slideInRight 0.3s ease;
            ">
                ${message}
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHTML);
        
        setTimeout(() => {
            const errorToast = document.querySelector('.error-toast');
            if (errorToast) {
                errorToast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => errorToast.remove(), 300);
            }
        }, 5000);
    }
}

window.UIService = new UIService();