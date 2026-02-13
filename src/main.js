// Main Application Controller
class JobreakerApp {
    constructor() {
        this.state = window.StateService;
        this.api = window.ApiService;
        this.ui = window.UIService;
        this.config = window.ConfigService;
        
        this.init();
    }

    async init() {
        console.log('🚀 Jobreaker initialized');
        
        try {
            // Initialize services in order
            this.state.loadSession();
            this.ui.populateLocations();
            this.setupRealtimeJobs();
            this.setupGlobalEventHandlers();
            
            // Show initial view based on session
            const userData = this.state.getState('userData');
            if (userData.email) {
                this.ui.showView('dashboard');
            } else {
                this.ui.showView('landing');
            }
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.ui.showError('Erreur lors de l\'initialisation de l\'application');
        }
    }

    // Configuration des jobs en temps réel
    setupRealtimeJobs() {
        const supabase = this.api.initSupabase();
        if (!supabase) return;

        console.log('📡 Listening for real-time job updates...');
        
        supabase
            .channel('public:job_listings')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'job_listings' 
            }, payload => {
                console.log('🆕 New job received!', payload.new);
                this.handleNewJob(payload.new);
            })
            .subscribe();
    }

    // Gérer un nouvel emploi reçu en temps réel
    handleNewJob(job) {
        const currentView = this.state.getState('currentView');
        if (currentView !== 'dashboard') return;

        const feedContainer = document.querySelector('.feed-list');
        if (!feedContainer) return;

        // Update cache
        const currentJobs = this.state.getState('currentJobsCache');
        this.state.setState({ currentJobsCache: [job, ...currentJobs] });

        // Create and prepend new job HTML
        const jobHTML = this.createNewJobHTML(job);
        
        if (feedContainer.innerHTML.includes('Aucune offre')) {
            feedContainer.innerHTML = '';
        }

        feedContainer.insertAdjacentHTML('afterbegin', jobHTML);
    }

    // Créer le HTML pour un nouvel emploi
    createNewJobHTML(job) {
        const tagsHTML = job.tags ? job.tags.map(tag => 
            `<span style="font-size:0.7rem; background:#f3f4f6; padding:0.1rem 0.4rem; border-radius:4px;">${tag}</span>`
        ).join('') : '';

        return `
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
                        ${tagsHTML}
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
    }

    // Configuration des gestionnaires d'événements globaux
    setupGlobalEventHandlers() {
        // Gérer le changement de fichier pour l'avatar
        const avatarInput = document.getElementById('avatar-upload');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.ui.handleAvatarUpload(e.target.files[0]);
                }
            });
        }
    }

    // Navigation entre les vues
    showView(viewId) {
        this.ui.showView(viewId);
    }

    // Gestion de l'onboarding
    async nextStep() {
        const currentStep = this.state.getState('currentStep');
        const userData = this.state.getState('userData');

        if (currentStep === 1) {
            const name = document.getElementById('input-name')?.value.trim();
            const email = document.getElementById('input-email')?.value.trim();

            if (!name || !email) {
                this.ui.showError('Veuillez remplir tous les champs.');
                return;
            }

            if (!this.isValidEmail(email)) {
                this.ui.showError('Veuillez entrer une adresse email valide.');
                return;
            }

            this.state.updateUserData({ full_name: name, email: email });
            this.state.setState({ currentStep: currentStep + 1 });
            this.ui.updateWizard();

        } else if (currentStep === 2) {
            const job = document.getElementById('input-job')?.value.trim();
            const location = document.getElementById('input-location')?.value;

            if (!job) {
                this.ui.showError('Veuillez préciser le poste visé.');
                return;
            }

            if (!location) {
                this.ui.showError('Veuillez choisir une localisation.');
                return;
            }

            this.state.updateUserData({ target_job: job, location: location });

            try {
                await this.api.saveUser(this.state.getState('userData'));
                this.state.setState({ currentStep: currentStep + 1 });
                this.ui.updateWizard();
            } catch (error) {
                this.ui.showError('Erreur lors de l\'enregistrement: ' + error.message);
            }
        }
    }

    // Connexion utilisateur
    async login() {
        const emailInput = document.getElementById('login-email');
        if (!emailInput) return;

        const email = emailInput.value.trim();
        
        if (!email) {
            this.ui.showError('Veuillez entrer votre email.');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.ui.showError('Veuillez entrer une adresse email valide.');
            return;
        }

        try {
            await this.api.loginUser(email);
            this.ui.showView('dashboard');
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    // Déconnexion
    logout() {
        this.state.clearSession();
        const loginInput = document.getElementById('login-email');
        if (loginInput) loginInput.value = '';
        
        this.ui.showView('landing');
    }

    // Mise à jour du profil
    async updateProfile() {
        const name = document.getElementById('profile-name')?.value.trim();
        const job = document.getElementById('profile-job')?.value.trim();
        const location = document.getElementById('profile-location')?.value;

        if (!name || !job || !location) {
            this.ui.showError('Veuillez remplir tous les champs.');
            return;
        }

        this.state.updateUserData({ full_name: name, target_job: job, location: location });

        try {
            await this.api.saveUser(this.state.getState('userData'));
            this.ui.showError('Profil mis à jour avec succès !', 'success');
        } catch (error) {
            this.ui.showError('Erreur lors de la mise à jour: ' + error.message);
        }
    }

    // Suppression de compte
    async deleteAccount() {
        const email = this.state.getState('userData.email');
        if (!email) {
            this.ui.showError('Impossible de trouver votre compte.');
            return;
        }

        if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
            return;
        }

        try {
            await this.api.deleteUser(email);
            this.logout();
            this.ui.showError('Votre compte a été supprimé.', 'success');
        } catch (error) {
            this.ui.showError('Une erreur est survenue: ' + error.message);
        }
    }

    // Ouvrir les détails d'un emploi
    openJobDetails(jobId) {
        this.ui.openJobDetails(jobId);
    }

    // Upload d'avatar
    uploadAvatar() {
        const fileInput = document.getElementById('avatar-upload');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            this.ui.handleAvatarUpload(fileInput.files[0]);
        }
    }

    // Validation d'email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Obtenir les informations de configuration
    getConfig() {
        return this.config?.getSupabaseConfig();
    }
}

// Initialiser l'application lorsque le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    // Cacher toutes les vues au chargement
    document.querySelectorAll('.view').forEach(view => {
        if (!view.classList.contains('active')) {
            view.style.display = 'none';
        }
    });

    // Créer l'instance principale de l'application
    window.app = new Jobreaker();
});

// Animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .new-item {
        animation: slideDown 0.5s ease-out;
    }
`;
document.head.appendChild(animationStyles);