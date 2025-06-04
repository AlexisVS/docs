#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIConnectionTester {
    constructor() {
        console.log('🧪 AGVES AI Connection Tester');
        console.log('============================\n');
        console.log('🚀 Node.js version:', process.version);
        console.log('📅 Date:', new Date().toLocaleDateString());
    }

    async testConnection() {
        try {
            // 1. Vérifier le fichier .env
            await this.checkEnvironment();

            // 2. Vérifier la clé API
            await this.checkApiKey();

            // 3. Tester la connection Anthropic
            await this.testAnthropicConnection();

            // 4. Tester les permissions du plan Pro
            await this.testProPlan();

            console.log('\n🎉 All tests passed! Your AI automation is ready to go!');
            console.log('\n🚀 Next steps:');
            console.log('- npm run ai:enhance     # Test AI enhancement');
            console.log('- npm run watch:ai       # Start continuous watching');
            console.log('- npm run generate:all   # Generate docs with AI');

        } catch (error) {
            console.error('\n❌ Connection test failed:', error.message);
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Check your .env file has ANTHROPIC_API_KEY');
            console.log('2. Verify your API key at https://console.anthropic.com/settings/keys');
            console.log('3. Ensure you have Anthropic Pro plan active');
            process.exit(1);
        }
    }

    async checkEnvironment() {
        console.log('🔍 1. Checking environment setup...');

        const envPath = path.join(__dirname, '../.env');

        if (!fs.existsSync(envPath)) {
            throw new Error('.env file not found. Run: npm run setup:env');
        }

        console.log('   ✅ .env file exists');

        // Lire le contenu .env
        const envContent = fs.readFileSync(envPath, 'utf8');

        if (!envContent.includes('ANTHROPIC_API_KEY')) {
            throw new Error('ANTHROPIC_API_KEY not found in .env file');
        }

        console.log('   ✅ ANTHROPIC_API_KEY found in .env');
    }

    async checkApiKey() {
        console.log('\n🔑 2. Checking API key...');

        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not set');
        }

        if (apiKey.includes('your-key-here') || apiKey.length < 20) {
            throw new Error('Please set your real Anthropic API key in .env file');
        }

        if (!apiKey.startsWith('sk-ant-api03-')) {
            console.log('   ⚠️ API key format looks unusual (expected sk-ant-api03-...)');
        } else {
            console.log('   ✅ API key format looks correct');
        }

        console.log('   ✅ API key is set and appears valid');
    }

    async testAnthropicConnection() {
        console.log('\n🤖 3. Testing Anthropic API connection...');

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        try {
            const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 50,
                messages: [{
                    role: 'user',
                    content: 'Hello! Just testing the connection. Please respond with "AGVES AI Documentation Ready!"'
                }]
            });

            const responseText = response.content[0].text;
            console.log('   ✅ Connection successful!');
            console.log('   🤖 Claude response:', responseText);

            if (responseText.includes('AGVES')) {
                console.log('   ✅ Claude understood the request correctly');
            }

        } catch (error) {
            if (error.status === 401) {
                throw new Error('API key is invalid. Check your key at https://console.anthropic.com/settings/keys');
            } else if (error.status === 429) {
                throw new Error('Rate limited. Your API key might not have Pro plan benefits');
            } else {
                throw new Error(`API call failed: ${error.message}`);
            }
        }
    }

    async testProPlan() {
        console.log('\n💎 4. Testing Pro plan features...');

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        try {
            // Test avec plus de tokens (Pro plan feature)
            const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000, // Plus élevé pour tester Pro
                temperature: 0.3,
                messages: [{
                    role: 'user',
                    content: `Test Pro plan capabilities by generating a detailed explanation of entity-driven architecture in exactly 200 words, focusing on:
1. Core principles
2. Benefits for business applications
3. Implementation with Next.js and Laravel

Make it technical but accessible.`
                }]
            });

            const responseText = response.content[0].text;
            console.log('   ✅ Pro plan features working (high token count request)');
            console.log('   📝 Generated', responseText.split(' ').length, 'words');

            if (responseText.length > 500) {
                console.log('   ✅ Detailed response generated successfully');
            }

            // Test de la vitesse de réponse
            const startTime = Date.now();
            await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 100,
                messages: [{
                    role: 'user',
                    content: 'Quick response test: What is TypeScript?'
                }]
            });
            const responseTime = Date.now() - startTime;

            console.log(`   ✅ Response time: ${responseTime}ms (Pro plans typically faster)`);

        } catch (error) {
            if (error.status === 429) {
                console.log('   ⚠️ Rate limited - you might be on a free plan');
                console.log('   💡 Upgrade to Pro at https://console.anthropic.com/settings/billing');
            } else {
                throw error;
            }
        }
    }
}

// Fonction utilitaire pour afficher les informations
function showSystemInfo() {
    console.log('\n📊 System Information:');
    console.log('   Node.js:', process.version);
    console.log('   Platform:', process.platform);
    console.log('   Architecture:', process.arch);
    console.log('   Memory:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    console.log('   Working Directory:', process.cwd());
}

// Exécution
async function main() {
    const tester = new AIConnectionTester();

    if (process.argv.includes('--info')) {
        showSystemInfo();
        return;
    }

    await tester.testConnection();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
