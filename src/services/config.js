// Configuration Service - Centralise et sécurise les clés API
class ConfigService {
    constructor() {
        // En production, ces valeurs devraient venir du serveur
        // Pour le développement, on utilise les variables d'environnement côté client
        this.config = {
            supabaseUrl: process.env.SUPABASE_URL || 'https://udychrmqcmjdofebdvof.supabase.co',
            supabaseKey: process.env.SUPABASE_KEY || null,
            remotiveApi: process.env.REMOTIVE_API || 'https://remotive.com/api/remote-jobs?limit=50'
        };
    }

    get(key) {
        return this.config[key];
    }

    // Pour le développement uniquement - à remplacer par une vraie solution serveur
    getSupabaseConfig() {
        if (!this.config.supabaseKey) {
            console.warn('⚠️ Clé Supabase manquante - Mode démo activé');
            return null;
        }
        return {
            url: this.config.supabaseUrl,
            key: this.config.supabaseKey
        };
    }

    // Vérifie si la configuration est valide
    isValid() {
        return this.config.supabaseKey && this.config.supabaseUrl;
    }
}

// Export pour utilisation dans les modules
window.ConfigService = new ConfigService();