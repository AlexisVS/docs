#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIDocumentationEnhancer {
    constructor() {
        // Vérifier la clé API Anthropic
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY is required. Get it from https://console.anthropic.com/settings/keys');
        }

        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        this.changedModules = process.env.CHANGED_MODULES?.split('\n').filter(Boolean) || [];
        this.typesChanged = Boolean(process.env.TYPES_CHANGED);

        console.log('🤖 AI Documentation Enhancer initialized');
        console.log('📊 Plan: Anthropic Pro (June 2025)');
        console.log('🚀 Node.js:', process.version);
    }

    async enhanceDocumentation() {
        console.log('🎯 Starting AI-powered documentation enhancement...');

        try {
            // Test de connection
            await this.testConnection();

            if (this.typesChanged) {
                await this.updateApiDocumentation();
            }

            for (const module of this.changedModules) {
                await this.enhanceModuleDocumentation(module);
            }

            await this.updateOverviewPages();

            console.log('✅ AI enhancement completed successfully!');

        } catch (error) {
            console.error('❌ AI enhancement failed:', error.message);
            throw error;
        }
    }

    async testConnection() {
        try {
            console.log('🔌 Testing Anthropic API connection...');

            const response = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 100,
                messages: [{
                    role: 'user',
                    content: 'Hello! Just testing the connection. Respond with "Connection successful!"'
                }]
            });

            console.log('✅ Anthropic API connection successful!');
            console.log('🤖 Claude response:', response.content[0].text);

        } catch (error) {
            console.error('❌ Anthropic API connection failed:', error.message);
            throw new Error('Unable to connect to Anthropic API. Check your API key.');
        }
    }

    async updateApiDocumentation() {
        console.log('📡 Updating API documentation based on type changes...');

        const typesContent = this.readTypesFile();
        const extractedChanges = this.extractTypeChanges(typesContent);

        for (const change of extractedChanges) {
            await this.enhanceApiPage(change);
        }
    }

    async enhanceModuleDocumentation(moduleName) {
        console.log(`🔧 Enhancing ${moduleName} module documentation...`);

        const moduleCode = this.analyzeModuleCode(moduleName);
        const currentDoc = this.readModuleDoc(moduleName);

        if (!currentDoc) {
            console.log(`⚠️ No existing documentation found for ${moduleName}, skipping...`);
            return;
        }

        const enhancedDoc = await this.callClaude(`
Améliore cette documentation de module AGVES (Next.js + Laravel) en tant qu'expert technique.

CONTEXTE:
- Application: AGVES (entity-driven architecture)
- Stack: Next.js 15 + Laravel backend
- Date: Juin 2025
- Module: ${moduleName}

ANALYSE DU CODE:
${JSON.stringify(moduleCode, null, 2)}

DOCUMENTATION ACTUELLE:
${currentDoc}

TÂCHE:
Améliore la documentation en ajoutant:

1. **Exemples d'usage avancés** avec du code TypeScript/React réaliste
2. **Cas d'usage métier concrets** pour ce module
3. **Patterns d'architecture** spécifiques à ce module
4. **Conseils de performance** et optimisations
5. **Bonnes pratiques** de développement
6. **Exemples d'intégration** avec les autres modules

CONTRAINTES:
- Garde le style Laravel Documentation (clair, structuré)
- Utilise des exemples concrets et réalistes
- Focus sur la valeur métier
- Reste cohérent avec l'architecture entity-driven

Retourne UNIQUEMENT le contenu Markdown amélioré, sans explications.
    `);

        if (enhancedDoc) {
            this.writeModuleDoc(moduleName, enhancedDoc);
            console.log(`✅ Enhanced ${moduleName} module documentation`);
        }
    }

    async updateOverviewPages() {
        console.log('📊 Updating overview pages with AI insights...');

        // Générer des insights architecturaux
        const insights = await this.generateArchitectureInsights();
        if (insights) {
            await this.enhanceArchitectureOverview(insights);
        }

        // Générer des recommandations de performance
        const recommendations = await this.generatePerformanceRecommendations();
        if (recommendations) {
            await this.addPerformanceSection(recommendations);
        }
    }

    async callClaude(prompt) {
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022', // Latest model as of June 2025
                max_tokens: 4000,
                temperature: 0.3, // Plus créatif pour la documentation
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            return response.content[0].text;

        } catch (error) {
            console.error('❌ Claude API call failed:', error.message);

            // Rate limiting handling
            if (error.status === 429) {
                console.log('⏸️ Rate limited, waiting 60 seconds...');
                await new Promise(resolve => setTimeout(resolve, 60000));
                return this.callClaude(prompt); // Retry
            }

            return null;
        }
    }

    async generateArchitectureInsights() {
        const codebaseAnalysis = this.analyzeFullCodebase();

        return await this.callClaude(`
En tant qu'architecte logiciel expert, génère des insights architecturaux pour l'application AGVES.

ANALYSE DE LA CODEBASE:
${JSON.stringify(codebaseAnalysis, null, 2)}

CONTEXTE:
- Application: Entity-driven architecture
- Stack: Next.js 15 + Laravel 11
- Date: Juin 2025
- Philosophie: Laravel-confident development

GÉNÈRE:
1. **Patterns architecturaux émergents** identifiés
2. **Opportunités d'amélioration** concrètes
3. **Bonnes pratiques observées** dans le code
4. **Recommandations d'évolution** pour 2025-2026
5. **Points d'attention** pour la scalabilité

FORMAT: Markdown style Laravel docs, avec des exemples de code quand pertinent.

Focus sur la VALEUR BUSINESS et les décisions techniques pragmatiques.
    `);
    }

    async generatePerformanceRecommendations() {
        return await this.callClaude(`
En tant qu'expert performance, génère des recommandations pour optimiser l'application AGVES.

STACK TECHNIQUE:
- Frontend: Next.js 15, React 19, TypeScript strict
- State: React Query, InversifyJS DI
- UI: Material-UI, TailwindCSS  
- Backend: Laravel API
- Architecture: Entity-driven

CONTEXTE 2025:
- Node.js 22 disponible
- React 19 avec nouveaux hooks
- Next.js 15 avec App Router stable

GÉNÈRE des recommandations pour:

1. **Optimisations Frontend**
   - Bundle optimization avec Next.js 15
   - Lazy loading intelligent
   - React 19 specific optimizations

2. **Patterns de Cache Efficaces**
   - React Query advanced patterns
   - API caching strategies
   - Static generation optimizations

3. **Optimisations de Requêtes**
   - Entity relationship loading
   - API response optimization
   - Database query patterns

4. **Monitoring et Observabilité**
   - Performance metrics
   - Error tracking
   - User experience monitoring

FORMAT: Style Laravel docs, avec du code TypeScript/React concret et moderne.
    `);
    }

    // Méthodes utilitaires...
    readTypesFile() {
        const typesPath = path.join(__dirname, '../types/generated.d.ts');
        return fs.existsSync(typesPath) ? fs.readFileSync(typesPath, 'utf8') : '';
    }

    readModuleDoc(moduleName) {
        const docPath = path.join(__dirname, `../modules/${moduleName}.mdx`);
        return fs.existsSync(docPath) ? fs.readFileSync(docPath, 'utf8') : '';
    }

    writeModuleDoc(moduleName, content) {
        const docPath = path.join(__dirname, `../modules/${moduleName}.mdx`);
        fs.writeFileSync(docPath, content);
    }

    analyzeModuleCode(moduleName) {
        const modulePath = path.join(__dirname, `../../agves_app/src/modules/${moduleName}`);

        if (!fs.existsSync(modulePath)) {
            return {error: 'Module not found'};
        }

        const analysis = {
            entities: [],
            services: [],
            tests: [],
            i18n: []
        };

        // Analyser les entités
        const entitiesPath = path.join(modulePath, 'entities');
        if (fs.existsSync(entitiesPath)) {
            analysis.entities = fs.readdirSync(entitiesPath)
                .filter(file => file.endsWith('.tsx'))
                .map(file => {
                    const content = fs.readFileSync(path.join(entitiesPath, file), 'utf8');
                    return {
                        name: file.replace('.tsx', ''),
                        hasRelationships: content.includes('relationships:'),
                        fieldCount: this.extractFieldCount(content)
                    };
                });
        }

        return analysis;
    }

    analyzeFullCodebase() {
        try {
            return {
                modules: fs.readdirSync(path.join(__dirname, '../../agves_app/src/modules')),
                components: this.countFiles(path.join(__dirname, '../../agves_app/src/components')),
                hooks: this.countFiles(path.join(__dirname, '../../agves_app/src/lib/hooks')),
                services: this.countFiles(path.join(__dirname, '../../agves_app/src/lib/api/services')),
                nodeVersion: process.version,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {error: error.message};
        }
    }

    extractFieldCount(content) {
        const fieldsMatch = content.match(/fields:\s*\{([^}]+)\}/s);
        return fieldsMatch ? fieldsMatch[1].split(',').length : 0;
    }

    countFiles(dirPath) {
        try {
            return fs.readdirSync(dirPath).filter(file =>
                file.endsWith('.ts') || file.endsWith('.tsx')
            ).length;
        } catch {
            return 0;
        }
    }

    extractTypeChanges(typesContent) {
        const modulePattern = /declare namespace Modules\.Contracts\.Contracts\.(\w+)/g;
        const changes = [];
        let match;

        while ((match = modulePattern.exec(typesContent)) !== null) {
            changes.push({
                module: match[1].toLowerCase(),
                content: `Module ${match[1]} detected`
            });
        }

        return changes;
    }

    async enhanceApiPage(change) {
        const apiPagePath = path.join(__dirname, `../api-reference/${change.module}`);

        if (!fs.existsSync(apiPagePath)) return;

        const files = fs.readdirSync(apiPagePath).filter(file => file.endsWith('.mdx'));
        console.log(`📄 Enhancing ${files.length} API pages for ${change.module}...`);
    }

    async enhanceArchitectureOverview(insights) {
        if (!insights) return;

        const overviewPath = path.join(__dirname, '../architecture/overview.mdx');
        if (fs.existsSync(overviewPath)) {
            const currentContent = fs.readFileSync(overviewPath, 'utf8');
            const enhancedContent = currentContent + '\n\n## AI-Generated Insights\n\n' + insights;
            fs.writeFileSync(overviewPath, enhancedContent);
            console.log('✅ Enhanced architecture overview with AI insights');
        }
    }

    async addPerformanceSection(recommendations) {
        if (!recommendations) return;

        const perfPath = path.join(__dirname, '../architecture/performance.mdx');
        const perfContent = `---
title: "Performance Recommendations"
description: "AI-generated performance optimization recommendations for AGVES"
---

# Performance Optimization Guide

*AI-generated recommendations based on codebase analysis - ${new Date().toLocaleDateString()}*

${recommendations}
`;

        fs.writeFileSync(perfPath, perfContent);
        console.log('✅ Created AI-generated performance recommendations');
    }
}

// Script de test de connection
async function testConnection() {
    try {
        console.log('🧪 Testing Anthropic API connection...');
        const enhancer = new AIDocumentationEnhancer();
        await enhancer.testConnection();
        console.log('✅ Connection test successful!');
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        process.exit(1);
    }
}

// Exécution
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--test')) {
        await testConnection();
    } else {
        const enhancer = new AIDocumentationEnhancer();
        await enhancer.enhanceDocumentation();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default AIDocumentationEnhancer;
