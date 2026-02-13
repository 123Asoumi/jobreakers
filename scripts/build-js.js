// Build script pour JavaScript
// Minifie et combine les fichiers JavaScript
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const SRC_DIR = path.join(__dirname, '../src');
const DIST_DIR = path.join(__dirname, '../dist');
const PUBLIC_DIR = path.join(__dirname, '..');

// Créer le dossier dist s'il n'existe pas
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Ordre de chargement des fichiers
const JS_FILES = [
    'services/config.js',
    'services/state.js', 
    'services/api.js',
    'services/ui.js',
    'main.js'
];

async function buildJS() {
    console.log('🔨 Building JavaScript...');
    
    try {
        let combinedJS = '';
        
        // Combiner tous les fichiers dans le bon ordre
        for (const file of JS_FILES) {
            const filePath = path.join(SRC_DIR, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                combinedJS += `// === ${file} ===\n`;
                combinedJS += content + '\n\n';
            } else {
                console.warn(`⚠️ File not found: ${file}`);
            }
        }
        
        // Minifier si en production
        const isProduction = process.env.NODE_ENV === 'production';
        let result;
        
        if (isProduction) {
            result = await minify(combinedJS, {
                compress: true,
                mangle: true,
                format: {
                    comments: false
                }
            });
        } else {
            result = { code: combinedJS };
        }
        
        // Écrire le fichier de sortie
        const outputFile = isProduction ? 'app.min.js' : 'app.js';
        const outputPath = path.join(DIST_DIR, outputFile);
        
        fs.writeFileSync(outputPath, result.code);
        console.log(`✅ JavaScript built: ${outputFile}`);
        
        // Copier vers le répertoire public pour le développement
        if (!isProduction) {
            fs.copyFileSync(outputPath, path.join(PUBLIC_DIR, 'app.js'));
            console.log('📋 Copied to public directory');
        }
        
    } catch (error) {
        console.error('❌ Build error:', error);
        process.exit(1);
    }
}

buildJS();