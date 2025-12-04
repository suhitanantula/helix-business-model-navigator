#!/usr/bin/env node
/**
 * Test GLM 4.6 API Connection
 *
 * Usage:
 *   node pipelines/test_glm.js
 *   node pipelines/test_glm.js --research "Woolworths AI strategy"
 */

require('dotenv').config();
const https = require('https');

const GLM_CONFIG = {
  endpoint: process.env.GLM_ENDPOINT || 'https://api.z.ai/api/paas/v4/chat/completions',
  apiKey: process.env.GLM_API_KEY,
  model: process.env.GLM_MODEL || 'glm-4.6'
};

async function callGLM(messages, options = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: options.model || GLM_CONFIG.model,
      messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.3
    });

    const url = new URL(GLM_CONFIG.endpoint);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_CONFIG.apiKey}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.error) {
            reject(new Error(`GLM Error: ${response.error.message} (code: ${response.error.code})`));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testConnection() {
  console.log('🔧 Testing GLM 4.6 Connection...\n');
  console.log(`Endpoint: ${GLM_CONFIG.endpoint}`);
  console.log(`Model: ${GLM_CONFIG.model}`);
  console.log(`API Key: ${GLM_CONFIG.apiKey?.slice(0, 10)}...`);
  console.log('');

  try {
    const response = await callGLM([
      { role: 'user', content: 'Say "GLM 4.6 is connected!" in exactly those words.' }
    ], { maxTokens: 20 });

    console.log('✅ Connection Successful!\n');
    console.log('Response:', response.choices[0].message.content);
    console.log('\nUsage:');
    console.log(`  Prompt tokens: ${response.usage.prompt_tokens}`);
    console.log(`  Completion tokens: ${response.usage.completion_tokens}`);
    console.log(`  Total tokens: ${response.usage.total_tokens}`);

    const cost = (response.usage.total_tokens / 1000000) * 1.0; // $0.50 in + $0.50 out
    console.log(`  Estimated cost: $${cost.toFixed(6)}`);

    return true;
  } catch (error) {
    console.log('❌ Connection Failed\n');
    console.log('Error:', error.message);

    if (error.message.includes('1113')) {
      console.log('\n💡 This means your account needs credits.');
      console.log('   Top up at: https://open.bigmodel.cn');
    }

    return false;
  }
}

async function testResearch(query) {
  console.log(`\n🔍 Research Test: "${query}"\n`);

  const systemPrompt = `You are an AI strategy analyst for the Co-Intelligence Index.
Analyze the company's AI initiatives, digital transformation, and provide:
1. Key AI investments and partnerships
2. Specific AI use cases deployed
3. AAA Framework positioning estimate (Q1-Q9)
4. Brief strategic assessment`;

  try {
    const response = await callGLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Research and analyze: ${query}` }
    ], { maxTokens: 1500, temperature: 0.4 });

    console.log('📊 Analysis:\n');
    console.log(response.choices[0].message.content);
    console.log('\n─'.repeat(40));
    console.log(`Tokens used: ${response.usage.total_tokens}`);
    console.log(`Cost: $${((response.usage.total_tokens / 1000000) * 1.0).toFixed(4)}`);

    return response;
  } catch (error) {
    console.log('Error:', error.message);
    return null;
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (!GLM_CONFIG.apiKey) {
    console.log('❌ GLM_API_KEY not found in .env');
    console.log('\nSetup:');
    console.log('  echo "GLM_API_KEY=your-key" >> .env');
    process.exit(1);
  }

  if (args.includes('--research')) {
    const idx = args.indexOf('--research');
    const query = args.slice(idx + 1).join(' ') || 'Woolworths Group AI strategy';
    await testResearch(query);
  } else {
    await testConnection();
  }
}

main();
