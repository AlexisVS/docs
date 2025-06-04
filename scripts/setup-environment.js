#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {createInterface} from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnvironmentSetup {
    constructor() {
        this.rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async setup() {
        console.log('🚀 AGVES Documentation Environment Setup');
        console.log('=====================================\n');

        console.log('✅ Node.js version:', process.version);
        console.log('📅 Date:', new Date().toLocaleDateString());
        console.log('🏗️ Setting up for Node.js 22 + Anthropic Pro\n');

        try {
            await this.setupEnvironmentFile();
            await this.installDependencies();
            await this.setupGitIgnore();
            await this.testConfiguration();

            console.log('\n🎉 Setup completed successfully!');
            console.log('\n🚀 Next steps:');
            console.log('1. npm run test:ai    # Test AI connection');
            console.log('2. npm run generate:all   # Generate initial docs');
            console.log('3. npm run watch:ai   # Start watching for changes');
            console.log('4. npm run dev        # Start Mintlify dev server');

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async setupEnvironmentFile() {
        console.log('🔐 Setting up environment variables...');

        const envPath = path.join(__dirname, '../.env');

        if (fs.existsSync(envPath)) {
            console.log('⚠️ .env file already exists');
            const overwrite = await this.question('Do you want to overwrite it? (y/N): ');
            if (overwrite.toLowerCase() !== 'y') {
                console.log('📝 Skipping .env setup');
                return;
            }
        }

        console.log('\n📋 You need to get your Anthropic API key from:');
        console.log('🔗 https://console.anthropic.com/settings/keys');
        console.log('💡 Create a new key named "AGVES Docs Automation"\n');

        const apiKey = await this.question('Enter your Anthropic API key: ');

        if (!apiKey || apiKey.trim() === '') {
            console.log('⚠️ No API key provided, creating template .env file');
        }

        const envContent = `# AGVES Documentation Environment
# Generated on ${new Date().toISOString()}

# Anthropic API Configuration
ANTHROPIC_API_KEY=${apiKey || 'sk-ant-api03-your-key-here'}

# Automation Settings
AUTO_PUSH=false
WATCH_ENABLED=true
AI_ENHANCEMENT_ENABLED=true

# Development Settings
NODE_ENV=development
LOG_LEVEL=info

# Optional: GitHub Integration
# GITHUB_TOKEN=ghp_your_token_here
# DOCS_REPO_TOKEN=ghp_your_docs_repo_token_here
`;

        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created');

        if (!apiKey) {
            console.log('⚠️ Don\'t forget to add your real API key to .env');
        }
    }

    async installDependencies() {
        console.log('\n📦 Installing dependencies...');

        // Vérifier package.json
        const packagePath = path.join(__dirname, '../package.json');
        let packageJson = {};

        if (fs.existsSync(packagePath)) {
            packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        }

        // S'assurer que les dépendances nécessaires sont présentes
        const requiredDeps = {
            'mintlify': '^4.0.0'
        };

        const requiredDevDeps = {
            '@anthropic-ai/sdk': '^0.24.3',
            'chokidar': '^3.6.0',
            'dotenv': '^16.4.5'
        };

        let needsInstall = false;

        // Vérifier les dépendances
        for (const [dep, version] of Object.entries(requiredDeps)) {
            if (!packageJson.dependencies?.[dep]) {
                console.log(`➕ Adding dependency: ${dep}`);
                needsInstall = true;
            }
        }

        for (const [dep, version] of Object.entries(requiredDevDeps)) {
            if (!packageJson.devDependencies?.[dep]) {
                console.log(`➕ Adding dev dependency: ${dep}`);
                needsInstall = true;
            }
        }

        if (needsInstall) {
            console.log('🔄 Run: npm install @anthropic-ai/sdk chokidar dotenv');
        } else {
            console.log('✅ All dependencies are present');
        }
    }

    async setupGitIgnore() {
        console.log('\n📝 Setting up .gitignore...');

        const gitignorePath = path.join(__dirname, '../.gitignore');
        const gitignoreContent = `# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Mintlify
.mintlify/

# AI generated content (optional)
# ai-insights/
# performance-reports/
`;

        if (!fs.existsSync(gitignorePath)) {
            fs.writeFileSync(gitignorePath, gitignoreContent);
            console.log('✅ .gitignore created');
        } else {
            console.log('✅ .gitignore already exists');
        }
    }

    async testConfiguration() {
        console.log('\n🧪 Testing configuration...');

        // Test 1: Vérifier Node.js version
        const nodeVersion = parseInt(process.version.slice(1));
        if (nodeVersion >= 22) {
            console.log('✅ Node.js version compatible');
        } else {
            console.log('⚠️ Node.js version may be too old (need 22+)');
        }

        // Test 2: Vérifier les fichiers essentiels
        const essentialFiles = [
            '../docs.json',
            '../scripts/generate-docs.js',
            '../index.mdx'
        ];

        for (const file of essentialFiles) {
            const fullPath = path.join(__dirname, file);
            if (fs.existsSync(fullPath)) {
                console.log(`✅ ${file} exists`);
            } else {
                console.log(`❌ ${file} missing`);
            }
        }

        // Test 3: Vérifier la structure des dossiers
        const requiredDirs = ['scripts', 'modules', 'api-reference', 'architecture'];
        for (const dir of requiredDirs) {
            const dirPath = path.join(__dirname, '..', dir);
            if (fs.existsSync(dirPath)) {
                console.log(`✅ ${dir}/ directory exists`);
            } else {
                console.log(`⚠️ ${dir}/ directory missing`);
            }
        }
    }

    async question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
}

// Exécution
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new EnvironmentSetup();
    setup.setup();
}
