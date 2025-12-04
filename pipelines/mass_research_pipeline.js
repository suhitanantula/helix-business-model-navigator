#!/usr/bin/env node
/**
 * Mass Research Pipeline
 *
 * Integrates Research Swarm (mass data collection) with Helix Engine (AAA analysis)
 * for processing large numbers of companies efficiently.
 *
 * Architecture:
 *   [Company List] → [Research Swarm] → [Helix Engine] → [Database]
 *                          ↓
 *              Perplexity/Tavily/Exa/WebSearch
 *
 * Usage:
 *   node pipelines/mass_research_pipeline.js --company WES
 *   node pipelines/mass_research_pipeline.js --batch "CBA,NAB,ANZ,WBC"
 *   node pipelines/mass_research_pipeline.js --file company_list.json
 *   node pipelines/mass_research_pipeline.js --asx-20
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { ResearchProvider, PROVIDERS, calculateResearchCost } = require('./research_providers');
const { runHelixPipeline } = require('./helix_engine_pipeline');
const { AGENT_PROMPTS } = require('./research_swarm');

// Configuration
const CONFIG = {
  searchProvider: 'tavily',  // Primary search: tavily, exa, perplexity, websearch
  fallbackChain: ['tavily', 'exa', 'websearch'],
  llmProvider: 'claude',     // Analysis: claude (via Claude Code), glm46
  concurrency: 3,            // Parallel research tasks
  delayBetweenRequests: 1000, // ms delay to avoid rate limits
  period: '2025Q4'
};

// ASX 20 companies (largest by market cap)
const ASX_20 = [
  { ticker: 'BHP', name: 'BHP Group', sector: 'Mining' },
  { ticker: 'CBA', name: 'Commonwealth Bank', sector: 'Banking' },
  { ticker: 'CSL', name: 'CSL Limited', sector: 'Healthcare' },
  { ticker: 'NAB', name: 'National Australia Bank', sector: 'Banking' },
  { ticker: 'WBC', name: 'Westpac Banking', sector: 'Banking' },
  { ticker: 'ANZ', name: 'ANZ Group', sector: 'Banking' },
  { ticker: 'WES', name: 'Wesfarmers', sector: 'Retail' },
  { ticker: 'MQG', name: 'Macquarie Group', sector: 'Financial Services' },
  { ticker: 'WOW', name: 'Woolworths Group', sector: 'Retail' },
  { ticker: 'RIO', name: 'Rio Tinto', sector: 'Mining' },
  { ticker: 'FMG', name: 'Fortescue Metals', sector: 'Mining' },
  { ticker: 'TLS', name: 'Telstra', sector: 'Telecommunications' },
  { ticker: 'WDS', name: 'Woodside Energy', sector: 'Energy' },
  { ticker: 'TCL', name: 'Transurban', sector: 'Infrastructure' },
  { ticker: 'GMG', name: 'Goodman Group', sector: 'Real Estate' },
  { ticker: 'ALL', name: 'Aristocrat Leisure', sector: 'Gaming' },
  { ticker: 'REA', name: 'REA Group', sector: 'Technology' },
  { ticker: 'SQ2', name: 'Block Inc', sector: 'Fintech' },
  { ticker: 'COL', name: 'Coles Group', sector: 'Retail' },
  { ticker: 'QBE', name: 'QBE Insurance', sector: 'Insurance' }
];

// Initialize research provider
const provider = new ResearchProvider({
  searchProvider: CONFIG.searchProvider,
  fallbackChain: CONFIG.fallbackChain
});

/**
 * Research a single company using multi-provider search
 */
async function researchCompany(company) {
  const { ticker, name, sector, exchange = 'ASX' } = company;

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📡 RESEARCHING: ${ticker} - ${name}`);
  console.log(`${'─'.repeat(60)}`);

  const startTime = Date.now();
  const researchData = {
    ticker,
    name,
    sector,
    exchange,
    sources: [],
    raw_data: [],
    scores: null,
    key_evidence: [],
    commentary: null
  };

  // Define research queries
  const queries = [
    `${name} ${ticker} AI strategy artificial intelligence initiatives 2024 2025`,
    `${name} digital transformation technology investments`,
    `${name} ${ticker} annual report AI machine learning automation`
  ];

  // Execute searches with fallback
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`  🔍 Query ${i + 1}/${queries.length}: "${query.substring(0, 50)}..."`);

    for (const providerName of CONFIG.fallbackChain) {
      try {
        const result = await provider.search(query, { provider: providerName });

        if (result && (result.results?.length > 0 || result.answer)) {
          console.log(`     ✅ ${providerName}: ${result.results?.length || 0} results`);

          researchData.raw_data.push({
            query,
            provider: providerName,
            answer: result.answer,
            results: result.results
          });

          // Extract sources
          if (result.sources) {
            researchData.sources.push(...result.sources);
          }

          break; // Success, move to next query
        }
      } catch (error) {
        console.log(`     ⚠️ ${providerName}: ${error.message}`);
      }
    }

    // Rate limiting delay
    if (i < queries.length - 1) {
      await sleep(CONFIG.delayBetweenRequests);
    }
  }

  // Extract key evidence from research
  researchData.key_evidence = extractKeyEvidence(researchData.raw_data);

  // Generate initial scores based on research
  researchData.scores = generateScoresFromResearch(researchData);

  // Generate commentary
  researchData.commentary = generateCommentary(ticker, researchData);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`  ⏱️ Research completed in ${duration}s`);
  console.log(`  📚 Sources: ${[...new Set(researchData.sources)].length} unique`);

  return researchData;
}

/**
 * Extract key evidence points from raw research data
 */
function extractKeyEvidence(rawData) {
  const evidence = [];

  for (const data of rawData) {
    // Extract from Tavily answer
    if (data.answer) {
      const sentences = data.answer.split('. ').slice(0, 3);
      evidence.push(...sentences.map(s => s.trim()).filter(s => s.length > 20));
    }

    // Extract from result snippets
    if (data.results) {
      for (const result of data.results.slice(0, 3)) {
        if (result.content) {
          const snippet = result.content.substring(0, 200);
          if (snippet.match(/AI|artificial intelligence|digital|technology|automation/i)) {
            evidence.push(snippet);
          }
        }
      }
    }
  }

  // Dedupe and limit
  return [...new Set(evidence)].slice(0, 8);
}

/**
 * Generate AAA scores from research data
 */
function generateScoresFromResearch(researchData) {
  const evidence = researchData.key_evidence.join(' ').toLowerCase();

  // Score based on keyword presence and density
  const scoreFactors = {
    data: countMatches(evidence, ['data', 'analytics', 'platform', 'cloud', 'infrastructure']),
    systems: countMatches(evidence, ['api', 'integration', 'architecture', 'modern', 'digital']),
    human_ai: countMatches(evidence, ['ai', 'machine learning', 'automation', 'assistant', 'copilot']),
    governance: countMatches(evidence, ['governance', 'responsible', 'ethics', 'policy', 'compliance']),
    inclusion: countMatches(evidence, ['access', 'inclusive', 'equity', 'universal']),
    readiness: countMatches(evidence, ['transformation', 'strategy', 'investment', 'initiative', 'program'])
  };

  // Convert to 1-5 scale
  const normalize = (count) => Math.min(5, Math.max(1, 1 + count * 0.5));

  const scores = {
    data: normalize(scoreFactors.data),
    systems: normalize(scoreFactors.systems),
    human_ai: normalize(scoreFactors.human_ai),
    governance: normalize(scoreFactors.governance),
    inclusion: normalize(scoreFactors.inclusion),
    readiness: normalize(scoreFactors.readiness)
  };

  scores.overall = (scores.data + scores.systems + scores.human_ai + scores.governance + scores.inclusion + scores.readiness) / 6;

  return scores;
}

function countMatches(text, keywords) {
  return keywords.reduce((count, kw) => {
    const matches = text.match(new RegExp(kw, 'gi'));
    return count + (matches ? matches.length : 0);
  }, 0);
}

/**
 * Generate commentary from research
 */
function generateCommentary(ticker, researchData) {
  const { scores, key_evidence } = researchData;

  const maturityLevel = scores.overall >= 4 ? 'advanced' : scores.overall >= 3 ? 'developing' : 'early-stage';
  const topStrength = Object.entries(scores)
    .filter(([k]) => k !== 'overall')
    .sort((a, b) => b[1] - a[1])[0];

  return `${ticker} shows ${maturityLevel} AI maturity (${scores.overall.toFixed(1)}/5). ` +
    `Strongest in ${topStrength[0].replace('_', ' ')} (${topStrength[1].toFixed(1)}). ` +
    `${key_evidence[0] || 'Further research recommended.'}`;
}

/**
 * Run full pipeline: Research → Helix Engine → Database
 */
async function runFullPipeline(company) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🚀 FULL PIPELINE: ${company.ticker} - ${company.name}`);
  console.log(`${'═'.repeat(60)}`);

  try {
    // Step 1: Research
    console.log('\n📡 PHASE 1: Research Swarm');
    const researchData = await researchCompany(company);

    // Step 2: Helix Engine Analysis
    console.log('\n🧬 PHASE 2: Helix Engine Analysis');
    const analysisResult = await runHelixPipeline({
      ticker: company.ticker,
      exchange: company.exchange || 'ASX',
      period: CONFIG.period,
      name: company.name,
      sector: company.sector,
      researchData
    });

    return {
      success: true,
      ticker: company.ticker,
      research: researchData,
      analysis: analysisResult
    };

  } catch (error) {
    console.error(`\n❌ Pipeline failed for ${company.ticker}: ${error.message}`);
    return {
      success: false,
      ticker: company.ticker,
      error: error.message
    };
  }
}

/**
 * Batch process multiple companies with concurrency control
 */
async function batchProcess(companies, options = {}) {
  const { concurrency = CONFIG.concurrency } = options;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🏭 BATCH PROCESSING: ${companies.length} companies`);
  console.log(`   Concurrency: ${concurrency} | Provider: ${CONFIG.searchProvider}`);
  console.log(`${'═'.repeat(60)}`);

  // Cost estimate
  const cost = calculateResearchCost(companies.length, {
    searchProvider: CONFIG.searchProvider,
    llmProvider: CONFIG.llmProvider,
    queriesPerCompany: 3
  });
  console.log(`\n💰 Estimated Cost: $${cost.total.toFixed(2)}`);
  console.log(`   Search: $${cost.search.cost.toFixed(2)} | LLM: $${cost.llm.cost.toFixed(2)}`);

  const results = [];
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < companies.length; i += concurrency) {
    const batch = companies.slice(i, i + concurrency);
    console.log(`\n📦 Batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(companies.length / concurrency)}`);

    const batchResults = await Promise.all(
      batch.map(company => runFullPipeline(company))
    );

    results.push(...batchResults);

    // Progress update
    const completed = i + batch.length;
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log(`\n📊 Progress: ${completed}/${companies.length} (${(completed/companies.length*100).toFixed(0)}%) - ${duration} min`);
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ BATCH COMPLETE`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`   Total: ${companies.length} | Success: ${successful} | Failed: ${failed}`);
  console.log(`   Duration: ${totalDuration} minutes`);
  console.log(`   Avg time per company: ${(totalDuration / companies.length).toFixed(1)} min`);

  return results;
}

/**
 * Research only (without Helix Engine) - for data collection
 */
async function researchOnly(companies) {
  console.log(`\n📡 RESEARCH ONLY MODE: ${companies.length} companies`);

  const results = [];

  for (const company of companies) {
    try {
      const data = await researchCompany(company);
      results.push({ success: true, ticker: company.ticker, data });
    } catch (error) {
      results.push({ success: false, ticker: company.ticker, error: error.message });
    }
  }

  return results;
}

// Helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
🔬 Mass Research Pipeline

Integrates Research Swarm + Helix Engine for scaled company analysis.

USAGE:
  node pipelines/mass_research_pipeline.js [options]

OPTIONS:
  --company TICKER      Research single company
  --batch "A,B,C"       Research multiple companies (comma-separated)
  --asx-20              Research ASX 20 (largest companies)
  --file PATH           Load companies from JSON file
  --research-only       Skip Helix Engine, just collect data
  --provider NAME       Search provider: tavily, exa, websearch (default: tavily)
  --concurrency N       Parallel tasks (default: 3)
  --status              Show provider status

EXAMPLES:
  # Single company
  node pipelines/mass_research_pipeline.js --company WOW

  # Big 4 banks
  node pipelines/mass_research_pipeline.js --batch "CBA,NAB,ANZ,WBC"

  # ASX 20
  node pipelines/mass_research_pipeline.js --asx-20

  # Research only (no analysis)
  node pipelines/mass_research_pipeline.js --batch "BHP,RIO,FMG" --research-only

PROVIDERS:
  tavily    - Best extraction, good for research ($0.001/query)
  exa       - Semantic search, company-focused ($0.001/query)
  websearch - Free, always available (Claude native)
    `);
    process.exit(0);
  }

  // Parse options
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  if (args.includes('--provider')) {
    CONFIG.searchProvider = getArg('--provider');
  }

  if (args.includes('--concurrency')) {
    CONFIG.concurrency = parseInt(getArg('--concurrency'));
  }

  if (args.includes('--status')) {
    console.log('\n📊 Provider Status\n');
    console.log(JSON.stringify(provider.getStatus(), null, 2));
    process.exit(0);
  }

  // Determine companies to process
  let companies = [];

  if (args.includes('--company')) {
    const ticker = getArg('--company');
    companies = [{ ticker, name: ticker, sector: 'Unknown' }];
  } else if (args.includes('--batch')) {
    const tickers = getArg('--batch').split(',').map(t => t.trim());
    companies = tickers.map(ticker => {
      const known = ASX_20.find(c => c.ticker === ticker);
      return known || { ticker, name: ticker, sector: 'Unknown' };
    });
  } else if (args.includes('--asx-20')) {
    companies = ASX_20;
  } else if (args.includes('--file')) {
    const filePath = getArg('--file');
    companies = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  if (companies.length === 0) {
    console.error('❌ No companies specified');
    process.exit(1);
  }

  // Execute
  const researchOnlyMode = args.includes('--research-only');

  (async () => {
    if (researchOnlyMode) {
      const results = await researchOnly(companies);
      console.log('\n📁 Research Results:', JSON.stringify(results, null, 2));
    } else {
      const results = await batchProcess(companies);
      console.log('\n📁 Pipeline Results Summary:');
      for (const r of results) {
        const icon = r.success ? '✅' : '❌';
        console.log(`  ${icon} ${r.ticker}: ${r.success ? r.analysis?.quadrant || 'Analyzed' : r.error}`);
      }
    }
  })();
}

module.exports = {
  researchCompany,
  runFullPipeline,
  batchProcess,
  researchOnly,
  ASX_20,
  CONFIG
};
