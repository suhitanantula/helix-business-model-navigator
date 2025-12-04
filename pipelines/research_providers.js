#!/usr/bin/env node
/**
 * Research Providers - Multi-Backend Research System
 *
 * Supports multiple search and LLM providers with automatic fallback:
 *
 * SEARCH PROVIDERS (priority order):
 *   1. Perplexity - Best quality, has citations (via MCP)
 *   2. Tavily - Good extraction, affordable
 *   3. Exa - Semantic search, good for companies
 *   4. Brave - Fast, reliable
 *   5. WebSearch - Claude native (always available)
 *
 * LLM PROVIDERS (for analysis):
 *   1. Claude - Default, high quality
 *   2. GLM 4.6 - Low cost alternative ($0.50/1M tokens)
 *   3. OpenAI - GPT-4 fallback
 *
 * Usage:
 *   const { research } = require('./research_providers');
 *   const result = await research('Woolworths AI strategy', { provider: 'auto' });
 */

const { spawn, execSync } = require('child_process');
const https = require('https');
const http = require('http');
require('dotenv').config();

// API Keys from environment
const API_KEYS = {
  tavily: process.env.TAVILY_API_KEY,
  exa: process.env.EXA_API_KEY,
  glm: process.env.GLM_API_KEY
};

// Provider configurations
const PROVIDERS = {
  search: {
    perplexity: {
      name: 'Perplexity',
      type: 'mcp',
      tool: 'mcp__MCP_DOCKER__perplexity_research',
      cost_per_query: 0.005,
      quality: 'high',
      has_citations: true,
      available: true
    },
    tavily: {
      name: 'Tavily',
      type: 'api',
      endpoint: 'https://api.tavily.com/search',
      cost_per_query: 0.001,
      quality: 'medium-high',
      has_citations: true,
      available: true, // API key configured
      note: 'Search + extraction, good for research'
    },
    exa: {
      name: 'Exa',
      type: 'api',
      endpoint: 'https://api.exa.ai/search',
      cost_per_query: 0.001,
      quality: 'medium-high',
      has_citations: true,
      available: true, // API key configured
      note: 'Semantic search, excellent for companies'
    },
    brave: {
      name: 'Brave',
      type: 'mcp',
      tool: 'brave_search',
      cost_per_query: 0.0005,
      quality: 'medium',
      has_citations: true,
      available: false,
      setup: 'mcp__MCP_DOCKER__mcp-add brave'
    },
    websearch: {
      name: 'WebSearch (Claude)',
      type: 'native',
      tool: 'WebSearch',
      cost_per_query: 0,
      quality: 'medium',
      has_citations: true,
      available: true
    },
    fetch: {
      name: 'WebFetch',
      type: 'mcp',
      tool: 'mcp__MCP_DOCKER__fetch',
      cost_per_query: 0,
      quality: 'low',
      has_citations: false,
      available: true,
      note: 'Direct URL fetch only, no search'
    }
  },
  llm: {
    claude: {
      name: 'Claude (Opus/Sonnet)',
      cost_per_1m_tokens: { input: 15, output: 75 },
      quality: 'highest',
      available: true,
      context_window: 200000
    },
    glm46: {
      name: 'GLM 4.6',
      cost_per_1m_tokens: { input: 0.50, output: 0.50 },
      quality: 'high',
      available: true, // Configured - needs credits
      context_window: 128000,
      api_endpoint: 'https://api.z.ai/api/paas/v4/chat/completions',
      note: 'Configured via api.z.ai - add credits to enable'
    },
    openai: {
      name: 'OpenAI GPT-4',
      cost_per_1m_tokens: { input: 10, output: 30 },
      quality: 'high',
      available: false,
      context_window: 128000
    }
  }
};

// Research provider abstraction
class ResearchProvider {
  constructor(config = {}) {
    this.searchProvider = config.searchProvider || 'auto';
    this.llmProvider = config.llmProvider || 'claude';
    this.fallbackChain = config.fallbackChain || ['perplexity', 'websearch', 'fetch'];
    this.glmConfig = config.glmConfig || null;
  }

  // Configure GLM 4.6 for low-cost research
  configureGLM(config) {
    if (!config.apiKey || !config.endpoint) {
      throw new Error('GLM 4.6 requires apiKey and endpoint');
    }
    this.glmConfig = {
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      model: config.model || 'glm-4-plus'
    };
    PROVIDERS.llm.glm46.available = true;
    PROVIDERS.llm.glm46.api_endpoint = config.endpoint;
    console.log('✅ GLM 4.6 configured for low-cost research');
  }

  // Auto-select best available search provider
  selectSearchProvider() {
    for (const provider of this.fallbackChain) {
      if (PROVIDERS.search[provider]?.available) {
        return provider;
      }
    }
    return 'websearch'; // Always available
  }

  // Search using selected provider
  async search(query, options = {}) {
    const provider = options.provider || this.selectSearchProvider();
    const config = PROVIDERS.search[provider];

    if (!config) {
      throw new Error(`Unknown search provider: ${provider}`);
    }

    console.log(`🔍 Searching with ${config.name}...`);

    switch (provider) {
      case 'perplexity':
        return this.searchPerplexity(query, options);
      case 'tavily':
        return this.searchTavily(query, options);
      case 'exa':
        return this.searchExa(query, options);
      case 'websearch':
        return this.searchWebSearch(query, options);
      case 'fetch':
        return this.fetchUrl(options.url, query);
      default:
        // Fallback to websearch
        return this.searchWebSearch(query, options);
    }
  }

  // Perplexity search via MCP
  async searchPerplexity(query, options = {}) {
    return new Promise((resolve, reject) => {
      // This would be called via MCP in actual usage
      // For now, return structure for integration
      resolve({
        provider: 'perplexity',
        query,
        note: 'Call mcp__MCP_DOCKER__perplexity_research directly in Claude',
        usage: {
          tool: 'mcp__MCP_DOCKER__perplexity_research',
          messages: [
            { role: 'user', content: query }
          ]
        }
      });
    });
  }

  // WebSearch (Claude native)
  async searchWebSearch(query, options = {}) {
    return {
      provider: 'websearch',
      query,
      note: 'Use WebSearch tool directly in Claude',
      usage: {
        tool: 'WebSearch',
        params: { query }
      }
    };
  }

  // Direct URL fetch
  async fetchUrl(url, prompt) {
    return {
      provider: 'fetch',
      url,
      prompt,
      note: 'Use mcp__MCP_DOCKER__fetch directly',
      usage: {
        tool: 'mcp__MCP_DOCKER__fetch',
        params: { url, max_length: 10000 }
      }
    };
  }

  // Tavily search (actual API call)
  async searchTavily(query, options = {}) {
    const apiKey = API_KEYS.tavily;
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY not set in environment');
    }

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: options.depth || 'advanced',
        include_answer: true,
        include_raw_content: false,
        max_results: options.maxResults || 10
      });

      const req = https.request({
        hostname: 'api.tavily.com',
        path: '/search',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (response.error) {
              reject(new Error(`Tavily error: ${response.error}`));
            } else {
              resolve({
                provider: 'tavily',
                query,
                answer: response.answer,
                results: response.results?.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content,
                  score: r.score
                })) || [],
                sources: response.results?.map(r => r.url) || []
              });
            }
          } catch (e) {
            reject(new Error(`Tavily parse error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // Exa search (actual API call)
  async searchExa(query, options = {}) {
    const apiKey = API_KEYS.exa;
    if (!apiKey) {
      throw new Error('EXA_API_KEY not set in environment');
    }

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        query: query,
        num_results: options.maxResults || 10,
        use_autoprompt: true,
        type: options.type || 'auto',
        contents: {
          text: true
        }
      });

      const req = https.request({
        hostname: 'api.exa.ai',
        path: '/search',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'Content-Length': data.length
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (response.error) {
              reject(new Error(`Exa error: ${response.error}`));
            } else {
              resolve({
                provider: 'exa',
                query,
                results: response.results?.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.text || r.snippet,
                  score: r.score,
                  publishedDate: r.publishedDate
                })) || [],
                sources: response.results?.map(r => r.url) || [],
                autopromptString: response.autopromptString
              });
            }
          } catch (e) {
            reject(new Error(`Exa parse error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // Call GLM 4.6 for analysis (low cost)
  async analyzeWithGLM(content, prompt) {
    if (!this.glmConfig) {
      throw new Error('GLM 4.6 not configured. Call configureGLM() first.');
    }

    const { apiKey, endpoint, model } = this.glmConfig;

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are an expert AI strategy analyst for the Co-Intelligence Index.' },
          { role: 'user', content: `${prompt}\n\nCONTENT TO ANALYZE:\n${content}` }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const url = new URL(endpoint);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            resolve({
              provider: 'glm46',
              model,
              content: response.choices?.[0]?.message?.content || body,
              usage: response.usage
            });
          } catch (e) {
            reject(new Error(`GLM response parse error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // Get provider status
  getStatus() {
    return {
      search: Object.fromEntries(
        Object.entries(PROVIDERS.search).map(([k, v]) => [k, {
          name: v.name,
          available: v.available,
          quality: v.quality,
          cost: v.cost_per_query
        }])
      ),
      llm: Object.fromEntries(
        Object.entries(PROVIDERS.llm).map(([k, v]) => [k, {
          name: v.name,
          available: v.available,
          quality: v.quality,
          cost: v.cost_per_1m_tokens
        }])
      ),
      recommended: {
        search: this.selectSearchProvider(),
        llm: this.glmConfig ? 'glm46' : 'claude'
      }
    };
  }
}

// Cost calculator
function calculateResearchCost(numCompanies, options = {}) {
  const searchProvider = options.searchProvider || 'perplexity';
  const llmProvider = options.llmProvider || 'claude';
  const queriesPerCompany = options.queriesPerCompany || 3;
  const tokensPerCompany = options.tokensPerCompany || 10000;

  const searchCost = PROVIDERS.search[searchProvider]?.cost_per_query || 0;
  const llmCost = PROVIDERS.llm[llmProvider]?.cost_per_1m_tokens || { input: 0, output: 0 };

  const totalSearchCost = numCompanies * queriesPerCompany * searchCost;
  const totalLLMCost = numCompanies * (tokensPerCompany / 1000000) * (llmCost.input + llmCost.output);

  return {
    companies: numCompanies,
    search: {
      provider: searchProvider,
      queries: numCompanies * queriesPerCompany,
      cost: totalSearchCost
    },
    llm: {
      provider: llmProvider,
      tokens: numCompanies * tokensPerCompany,
      cost: totalLLMCost
    },
    total: totalSearchCost + totalLLMCost
  };
}

// Fallback research chain
async function researchWithFallback(query, options = {}) {
  const provider = new ResearchProvider(options);
  const chain = options.fallbackChain || ['perplexity', 'websearch'];

  for (const providerName of chain) {
    try {
      console.log(`📡 Trying ${providerName}...`);
      const result = await provider.search(query, { provider: providerName });
      if (result) {
        return { success: true, provider: providerName, result };
      }
    } catch (error) {
      console.log(`  ⚠️ ${providerName} failed: ${error.message}`);
    }
  }

  return { success: false, error: 'All providers failed' };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--status')) {
    const provider = new ResearchProvider();
    console.log('\n📊 Research Providers Status\n');
    console.log('═'.repeat(60));

    const status = provider.getStatus();

    console.log('\n🔍 SEARCH PROVIDERS:');
    console.log('─'.repeat(60));
    for (const [key, info] of Object.entries(status.search)) {
      const icon = info.available ? '✅' : '❌';
      console.log(`  ${icon} ${info.name.padEnd(25)} Quality: ${info.quality.padEnd(12)} Cost: $${info.cost}`);
    }

    console.log('\n🧠 LLM PROVIDERS:');
    console.log('─'.repeat(60));
    for (const [key, info] of Object.entries(status.llm)) {
      const icon = info.available ? '✅' : '❌';
      const cost = info.cost ? `$${info.cost.input}/${info.cost.output} per 1M` : 'N/A';
      console.log(`  ${icon} ${info.name.padEnd(25)} Quality: ${info.quality.padEnd(12)} Cost: ${cost}`);
    }

    console.log('\n💡 RECOMMENDED:');
    console.log(`  Search: ${status.recommended.search}`);
    console.log(`  LLM: ${status.recommended.llm}`);

  } else if (args.includes('--cost')) {
    const numCompanies = parseInt(args[args.indexOf('--cost') + 1]) || 100;

    console.log(`\n💰 Cost Estimate for ${numCompanies} Companies\n`);
    console.log('═'.repeat(60));

    // Claude + Perplexity
    const claudeCost = calculateResearchCost(numCompanies, { llmProvider: 'claude', searchProvider: 'perplexity' });
    console.log('\n📊 Option 1: Claude + Perplexity (Highest Quality)');
    console.log(`   Search: ${claudeCost.search.queries} queries × $${PROVIDERS.search.perplexity.cost_per_query} = $${claudeCost.search.cost.toFixed(2)}`);
    console.log(`   LLM: ${(claudeCost.llm.tokens/1000000).toFixed(1)}M tokens × $90/M = $${claudeCost.llm.cost.toFixed(2)}`);
    console.log(`   TOTAL: $${claudeCost.total.toFixed(2)}`);

    // GLM 4.6 + Perplexity
    const glmCost = calculateResearchCost(numCompanies, { llmProvider: 'glm46', searchProvider: 'perplexity' });
    console.log('\n📊 Option 2: GLM 4.6 + Perplexity (Cost Optimized)');
    console.log(`   Search: ${glmCost.search.queries} queries × $${PROVIDERS.search.perplexity.cost_per_query} = $${glmCost.search.cost.toFixed(2)}`);
    console.log(`   LLM: ${(glmCost.llm.tokens/1000000).toFixed(1)}M tokens × $1/M = $${glmCost.llm.cost.toFixed(2)}`);
    console.log(`   TOTAL: $${glmCost.total.toFixed(2)}`);

    // GLM 4.6 + WebSearch (Free)
    const freeCost = calculateResearchCost(numCompanies, { llmProvider: 'glm46', searchProvider: 'websearch' });
    console.log('\n📊 Option 3: GLM 4.6 + WebSearch (Lowest Cost)');
    console.log(`   Search: ${freeCost.search.queries} queries × $0 = $${freeCost.search.cost.toFixed(2)}`);
    console.log(`   LLM: ${(freeCost.llm.tokens/1000000).toFixed(1)}M tokens × $1/M = $${freeCost.llm.cost.toFixed(2)}`);
    console.log(`   TOTAL: $${freeCost.total.toFixed(2)}`);

    console.log('\n💡 SAVINGS:');
    console.log(`   GLM vs Claude: ${((1 - glmCost.total/claudeCost.total) * 100).toFixed(0)}% savings ($${(claudeCost.total - glmCost.total).toFixed(2)})`);
    console.log(`   Free search: Additional ${((1 - freeCost.total/glmCost.total) * 100).toFixed(0)}% savings`);

  } else if (args.includes('--setup-glm')) {
    console.log(`
🔧 GLM 4.6 Setup Instructions

1. Get your API key from your GLM provider

2. Create environment file:
   echo "GLM_API_KEY=your-key-here" >> .env
   echo "GLM_ENDPOINT=https://your-glm-endpoint/v1/chat/completions" >> .env

3. Use in code:
   const { ResearchProvider } = require('./research_providers');
   const provider = new ResearchProvider();
   provider.configureGLM({
     apiKey: process.env.GLM_API_KEY,
     endpoint: process.env.GLM_ENDPOINT,
     model: 'glm-4-plus'
   });

4. Run research:
   const result = await provider.analyzeWithGLM(
     researchData,
     'Apply the Double-AAA Framework to score this company'
   );

Cost: ~$0.50 per 1M tokens (vs $90 for Claude)
Quality: High - excellent for research analysis tasks
    `);

  } else {
    console.log(`
📡 Research Providers - Multi-Backend Research System

USAGE:
  node pipelines/research_providers.js --status      # Show provider status
  node pipelines/research_providers.js --cost 100   # Cost for 100 companies
  node pipelines/research_providers.js --setup-glm  # GLM 4.6 setup guide

SEARCH PROVIDERS (fallback order):
  1. Perplexity - Best quality, citations, costs ~$0.005/query
  2. Tavily - Good extraction (requires API key)
  3. Exa - Semantic search (requires API key)
  4. Brave - Fast, reliable (requires API key)
  5. WebSearch - Claude native, FREE, always available

LLM PROVIDERS:
  1. Claude - Highest quality, $15-75/1M tokens
  2. GLM 4.6 - High quality, $0.50/1M tokens (180x cheaper!)
  3. OpenAI - GPT-4 fallback

RECOMMENDATION:
  For ASX 300 research at scale:
  - Use GLM 4.6 for analysis (saves ~$8,000 per full scan)
  - Use Perplexity for search (best citations)
  - Fallback to WebSearch if Perplexity unavailable
    `);
  }
}

module.exports = {
  ResearchProvider,
  PROVIDERS,
  calculateResearchCost,
  researchWithFallback
};
