// State Management Service
class StateService {
    constructor() {
        this.state = {
            currentView: 'landing',
            currentStep: 1,
            userData: {
                full_name: '',
                email: '',
                target_job: '',
                location: '',
                avatar_url: null
            },
            currentJobsCache: [],
            isLoading: false,
            error: null
        };
        this.subscribers = [];
    }

    // Subscribe to state changes
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    // Notify all subscribers
    notify() {
        this.subscribers.forEach(callback => callback(this.state));
    }

    // Get state
    getState(key = null) {
        return key ? this.state[key] : this.state;
    }

    // Update state
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notify();
    }

    // Update user data
    updateUserData(userData) {
        this.state.userData = { ...this.state.userData, ...userData };
        localStorage.setItem('jobreaker_user', JSON.stringify(this.state.userData));
        this.notify();
    }

    // Clear user session
    clearSession() {
        this.state.userData = {
            full_name: '',
            email: '',
            target_job: '',
            location: '',
            avatar_url: null
        };
        localStorage.removeItem('jobreaker_user');
        this.notify();
    }

    // Load session from localStorage
    loadSession() {
        const saved = localStorage.getItem('jobreaker_user');
        if (saved) {
            try {
                this.state.userData = JSON.parse(saved);
                this.notify();
            } catch (error) {
                console.error('Error loading session:', error);
                this.clearSession();
            }
        }
    }
}

window.StateService = new StateService();