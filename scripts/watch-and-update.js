#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ContinuousDocsUpdater {
    constructor() {
        this.debounceTimeout = null;
        this.pendingChanges = new Set();
        this.isProcessing = false;

        // Configuration
        this.watchPaths = [
            '../../agves_app/src/modules/**/*.tsx',
            '../../agves_app/src/lib/**/*.ts',
            '../../agves_app/src/components/**/*.tsx',
            '../../agves_app/src/generated.d.ts'
        ];

        this.aiUpdateThreshold = 3; // Nombre de changements avant mise à jour IA
    }

    async start() {
        console.log('🔍 Starting continuous documentation watcher...');

        const watcher = chokidar.watch(this.watchPaths, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: true
        });

        watcher
            .on('change', (filePath) => this.handleFileChange(filePath))
            .on('add', (filePath) => this.handleFileChange(filePath))
            .on('unlink', (filePath) => this.handleFileDelete(filePath))
            .on('error', (error) => console.error('❌ Watcher error:', error));

        console.log('👀 Watching for changes in:', this.watchPaths);

        // Processus de mise à jour périodique
        setInterval(() => this.processAccumulatedChanges(), 30000); // Toutes les 30 secondes
    }

    handleFileChange(filePath) {
        console.log(`📝 File changed: ${filePath}`);

        this.pendingChanges.add(filePath);

        // Debounce pour éviter trop de mises à jour
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.processAccumulatedChanges();
        }, 5000); // 5 secondes de délai
    }

    handleFileDelete(filePath) {
        console.log(`🗑️ File deleted: ${filePath}`);
        this.pendingChanges.add(filePath);
    }

    async processAccumulatedChanges() {
        if (this.isProcessing || this.pendingChanges.size === 0) {
            return;
        }

        this.isProcessing = true;

        try {
            const changes = Array.from(this.pendingChanges);
            this.pendingChanges.clear();

            console.log(`🔄 Processing ${changes.length} accumulated changes...`);

            // Analyser les types de changements
            const changeAnalysis = this.analyzeChanges(changes);

            // Mise à jour de base (rapide)
            await this.quickUpdate(changeAnalysis);

            // Mise à jour IA si seuil atteint
            if (changes.length >= this.aiUpdateThreshold) {
                await this.aiEnhancedUpdate(changeAnalysis);
            }

            console.log('✅ Documentation updated successfully');

        } catch (error) {
            console.error('❌ Error processing changes:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    analyzeChanges(filePaths) {
        const analysis = {
            modules: new Set(),
            types: false,
            components: false,
            services: false
        };

        for (const filePath of filePaths) {
            if (filePath.includes('/modules/')) {
                const moduleName = filePath.split('/modules/')[1].split('/')[0];
                analysis.modules.add(moduleName);
            }

            if (filePath.includes('generated.d.ts')) {
                analysis.types = true;
            }

            if (filePath.includes('/components/')) {
                analysis.components = true;
            }

            if (filePath.includes('/services/')) {
                analysis.services = true;
            }
        }

        return {
            modules: Array.from(analysis.modules),
            types: analysis.types,
            components: analysis.components,
            services: analysis.services
        };
    }

    async quickUpdate(analysis) {
        console.log('⚡ Running quick documentation update...');

        try {
            // Synchroniser les types
            if (analysis.types) {
                await execAsync('npm run sync:types');
            }

            // Regénérer la documentation de base
            await execAsync('node scripts/generate-docs.js');

            // Commit automatique des changements rapides
            await this.commitChanges('📝 Quick docs update', analysis);

        } catch (error) {
            console.error('❌ Quick update failed:', error);
        }
    }

    async aiEnhancedUpdate(analysis) {
        console.log('🤖 Running AI-enhanced documentation update...');

        try {
            // Vérifier si les clés API sont disponibles
            if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
                console.log('⚠️ No AI API keys found, skipping AI enhancement');
                return;
            }

            // Lancer l'amélioration IA
            process.env.CHANGED_MODULES = analysis.modules.join('\n');
            process.env.TYPES_CHANGED = analysis.types ? 'true' : '';

            await execAsync('node scripts/enhance-with-ai.js');

            // Commit avec plus de détails
            await this.commitChanges('🤖 AI-enhanced docs update', analysis);

        } catch (error) {
            console.error('❌ AI enhancement failed:', error);
        }
    }

    async commitChanges(message, analysis) {
        try {
            const { stdout } = await execAsync('git status --porcelain');

            if (stdout.trim()) {
                const detailedMessage = `${message}

Modules updated: ${analysis.modules.join(', ') || 'none'}
Types updated: ${analysis.types ? 'yes' : 'no'}
Components updated: ${analysis.components ? 'yes' : 'no'}
Services updated: ${analysis.services ? 'yes' : 'no'}

Auto-generated at: ${new Date().toISOString()}`;

                await execAsync('git add .');
                await execAsync(`git commit -m "${detailedMessage}"`);

                // Push si configuré
                if (process.env.AUTO_PUSH === 'true') {
                    await execAsync('git push');
                }

                console.log('📤 Changes committed successfully');
            }
        } catch (error) {
            console.error('❌ Commit failed:', error);
        }
    }

    async setupGitHooks() {
        console.log('🔗 Setting up Git hooks for automatic docs...');

        const preCommitHook = `#!/bin/sh
# Auto-update docs before commit
cd docs && npm run generate:docs
git add docs/
`;

        const hookPath = '../agves_app/.git/hooks/pre-commit';
        fs.writeFileSync(hookPath, preCommitHook, { mode: 0o755 });

        console.log('✅ Git hooks installed');
    }
}

// Configuration package.json pour le watcher
const watcherPackageJson = {
    "scripts": {
        "watch": "node scripts/watch-and-update.js",
        "watch:ai": "ANTHROPIC_API_KEY=your_key node scripts/watch-and-update.js",
        "setup:hooks": "node -e \"require('./scripts/watch-and-update.js').setupGitHooks()\""
    },
    "devDependencies": {
        "chokidar": "^3.5.3"
    }
};

// CLI
if (require.main === module) {
    const updater = new ContinuousDocsUpdater();

    if (process.argv.includes('--setup-hooks')) {
        updater.setupGitHooks();
    } else {
        updater.start().catch(console.error);
    }
}

module.exports = ContinuousDocsUpdater;
