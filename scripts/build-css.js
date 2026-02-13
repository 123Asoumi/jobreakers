// Build script pour CSS
// Optimise et minifie le CSS
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');

const SRC_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(__dirname, '../dist');

// Créer le dossier dist s'il n'existe pas
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

async function buildCSS() {
    console.log('🎨 Building CSS...');
    
    try {
        const cssPath = path.join(SRC_DIR, 'style.css');
        const css = fs.readFileSync(cssPath, 'utf8');
        
        const isProduction = process.env.NODE_ENV === 'production';
        let result;
        
        if (isProduction) {
            result = await postcss([cssnano]).process(css, { 
                from: cssPath,
                to: path.join(DIST_DIR, 'style.min.css')
            });
        } else {
            result = { css: css };
        }
        
        // Écrire le fichier de sortie
        const outputFile = isProduction ? 'style.min.css' : 'style.css';
        const outputPath = path.join(DIST_DIR, outputFile);
        
        fs.writeFileSync(outputPath, result.css);
        console.log(`✅ CSS built: ${outputFile}`);
        
        // Copier vers le répertoire public pour le développement
        if (!isProduction) {
            fs.copyFileSync(cssPath, path.join(SRC_DIR, 'style.css'));
            console.log('📋 CSS already in public directory');
        }
        
    } catch (error) {
        console.error('❌ CSS build error:', error);
        process.exit(1);
    }
}

buildCSS();