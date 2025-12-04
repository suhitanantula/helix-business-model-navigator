#!/usr/bin/env node
/**
 * Perplexity Staged Research Pipeline
 *
 * Uses Perplexity for deep company research with context management:
 * - Breaks research into focused queries
 * - Extracts key facts after each query (discards raw response)
 * - Consolidates small summaries for analysis
 *
 * This prevents context overflow from Perplexity's detailed responses.
 *
 * Usage:
 *   node pipelines/perplexity_staged_research.js --company WOW
 *   node pipelines/perplexity_staged_research.js --batch "CBA,NAB"
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { runHelixPipeline } = require('./helix_engine_pipeline');

// Output directory for saving full Perplexity responses
const OUTPUT_DIR = path.join(__dirname, '..', '03_COMPANY_DATABASE', 'perplexity_research');

// Ensure output directory exists
function ensureOutputDir(ticker) {
  const companyDir = path.join(OUTPUT_DIR, ticker);
  if (!fs.existsSync(companyDir)) {
    fs.mkdirSync(companyDir, { recursive: true });
  }
  return companyDir;
}

// Save full Perplexity response to file
function saveFullResponse(ticker, stageId, content, metadata = {}) {
  const companyDir = ensureOutputDir(ticker);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${timestamp}_${stageId}.md`;
  const filepath = path.join(companyDir, filename);

  const output = `# ${metadata.stageName || stageId}
**Company:** ${metadata.company || ticker}
**Ticker:** ${ticker}
**Date:** ${new Date().toISOString()}
**Query:** ${metadata.query || 'N/A'}

---

## Full Perplexity Response

${content}

---

## Metadata
- Response Length: ${content.length} characters
- Sources Found: ${metadata.sourcesCount || 0}
`;

  fs.writeFileSync(filepath, output);
  console.log(`     💾 Saved: ${filepath}`);
  return filepath;
}

// Research stages - each is a focused Perplexity query
const RESEARCH_STAGES = [
  {
    id: 'ai_strategy',
    name: 'AI Strategy & Investments',
    queryTemplate: (company, ticker) =>
      `${company} (ASX: ${ticker}) AI strategy artificial intelligence investments initiatives 2024 2025. Include specific dollar amounts, partnerships, and announced projects.`,
    extractPrompt: `Extract ONLY these facts (be concise, max 5 bullet points):
- AI investment amounts ($ figures)
- Key AI partnerships or vendors
- Specific AI projects announced
- CEO/CTO quotes on AI strategy
Return as JSON: { "investments": [], "partnerships": [], "projects": [], "quotes": [] }`
  },
  {
    id: 'digital_transformation',
    name: 'Digital Transformation',
    queryTemplate: (company, ticker) =>
      `${company} (ASX: ${ticker}) digital transformation technology platform modernization cloud data analytics 2024 2025`,
    extractPrompt: `Extract ONLY these facts (be concise, max 5 bullet points):
- Technology platform investments
- Cloud/data initiatives
- Digital customer experience projects
- Automation deployments
Return as JSON: { "platforms": [], "cloud": [], "customer_digital": [], "automation": [] }`
  },
  {
    id: 'governance_leadership',
    name: 'AI Governance & Leadership',
    queryTemplate: (company, ticker) =>
      `${company} (ASX: ${ticker}) AI governance responsible AI ethics policy framework chief data officer AI leadership`,
    extractPrompt: `Extract ONLY these facts (be concise, max 5 bullet points):
- AI governance frameworks or policies
- Responsible AI commitments
- AI leadership roles (CDO, CAO, etc.)
- Risk management for AI
Return as JSON: { "governance": [], "responsible_ai": [], "leadership": [], "risk": [] }`
  }
];

// Extraction patterns for parsing Perplexity responses
const EXTRACTION_PATTERNS = {
  ai_strategy: {
    investments: /\$[\d,.]+ (?:million|billion|M|B)/gi,
    partnerships: /partner(?:ship|ed|ing)?\s+with\s+([A-Z][a-zA-Z\s]+)/gi,
    projects: /(?:launch|deploy|implement|roll.?out)\s+([^.]+AI[^.]+)/gi
  },
  digital_transformation: {
    platforms: /(?:platform|system|infrastructure)\s+([^.]+)/gi,
    cloud: /(?:cloud|AWS|Azure|GCP|Google Cloud)[^.]+/gi
  },
  governance: {
    frameworks: /(?:governance|framework|policy|guideline)[^.]+AI[^.]+/gi,
    leadership: /(?:chief|head|director)\s+(?:of\s+)?(?:AI|data|digital|analytics)[^.]+/gi
  }
};

/**
 * Execute a single Perplexity research stage
 * - Saves full response to file (for reference)
 * - Returns extracted facts (small context) for analysis
 */
async function executeResearchStage(stage, company, ticker, perplexityTool) {
  console.log(`\n  📡 Stage: ${stage.name}`);

  const query = stage.queryTemplate(company, ticker);
  console.log(`     Query: "${query.substring(0, 60)}..."`);

  // Call Perplexity via MCP
  const startTime = Date.now();

  try {
    const response = await perplexityTool({
      messages: [{ role: 'user', content: query }]
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`     ✅ Response received (${duration}s)`);

    // Extract raw content
    const rawContent = response.content || response.choices?.[0]?.message?.content || '';

    // Get citations/sources
    const sources = extractSources(rawContent);

    // SAVE FULL RESPONSE TO FILE (preserved for reference)
    const savedPath = saveFullResponse(ticker, stage.id, rawContent, {
      stageName: stage.name,
      company,
      query,
      sourcesCount: sources.length
    });

    // Extract key facts from response (small context for analysis)
    const extracted = extractKeyFacts(stage.id, rawContent);

    console.log(`     📋 Extracted ${Object.values(extracted).flat().length} facts, ${sources.length} sources`);

    return {
      stage: stage.id,
      facts: extracted,
      sources,
      rawLength: rawContent.length,
      extractedLength: JSON.stringify(extracted).length,
      savedPath
    };

  } catch (error) {
    console.log(`     ⚠️ Stage failed: ${error.message}`);
    return {
      stage: stage.id,
      facts: {},
      sources: [],
      error: error.message
    };
  }
}

/**
 * Extract key facts from Perplexity response
 * This is critical for context management - we keep only essential facts
 */
function extractKeyFacts(stageId, content) {
  const facts = {
    bullets: [],
    numbers: [],
    entities: [],
    quotes: []
  };

  if (!content) return facts;

  // Extract bullet points or numbered lists
  const bulletMatches = content.match(/[-•*]\s+[^-•*\n]+/g) || [];
  facts.bullets = bulletMatches.slice(0, 8).map(b => b.replace(/^[-•*]\s+/, '').trim());

  // Extract dollar amounts
  const dollarMatches = content.match(/\$[\d,.]+ (?:million|billion|M|B|USD|AUD)/gi) || [];
  facts.numbers = [...new Set(dollarMatches)].slice(0, 5);

  // Extract company/product names (capitalized phrases)
  const entityMatches = content.match(/(?:partnership with |acquired |using |deployed |implemented )([A-Z][a-zA-Z\s&]+)/g) || [];
  facts.entities = [...new Set(entityMatches)].slice(0, 5);

  // Extract quotes (text in quotation marks)
  const quoteMatches = content.match(/"[^"]{20,200}"/g) || [];
  facts.quotes = quoteMatches.slice(0, 2);

  // Stage-specific extraction
  if (stageId === 'ai_strategy') {
    const aiTerms = content.match(/(?:machine learning|generative AI|AI-powered|artificial intelligence|ML|GenAI)[^.]+\./gi) || [];
    facts.ai_specific = aiTerms.slice(0, 3);
  }

  if (stageId === 'governance_leadership') {
    const roles = content.match(/(?:Chief|Head|Director|VP|SVP)\s+(?:of\s+)?(?:AI|Data|Digital|Analytics|Technology)[^,.\n]+/gi) || [];
    facts.leadership_roles = [...new Set(roles)].slice(0, 3);
  }

  return facts;
}

/**
 * Extract source URLs from Perplexity response
 */
function extractSources(content) {
  const urls = content.match(/https?:\/\/[^\s\]\)]+/g) || [];
  return [...new Set(urls)].slice(0, 10);
}

/**
 * Consolidate extracted facts from all stages into a compact summary
 */
function consolidateResearch(stageResults, company, ticker) {
  const consolidated = {
    ticker,
    company,
    summary: {
      ai_initiatives: [],
      investments: [],
      partnerships: [],
      governance: [],
      leadership: []
    },
    sources: [],
    evidence: [],
    saved_files: [],  // Track all saved response files
    raw_reduction: { before: 0, after: 0 }
  };

  for (const result of stageResults) {
    if (result.facts) {
      // Collect all bullet points as evidence
      if (result.facts.bullets) {
        consolidated.evidence.push(...result.facts.bullets);
      }

      // Collect investments
      if (result.facts.numbers) {
        consolidated.summary.investments.push(...result.facts.numbers);
      }

      // Collect entities (partnerships, vendors)
      if (result.facts.entities) {
        consolidated.summary.partnerships.push(...result.facts.entities);
      }

      // AI-specific findings
      if (result.facts.ai_specific) {
        consolidated.summary.ai_initiatives.push(...result.facts.ai_specific);
      }

      // Leadership
      if (result.facts.leadership_roles) {
        consolidated.summary.leadership.push(...result.facts.leadership_roles);
      }

      // Quotes
      if (result.facts.quotes) {
        consolidated.evidence.push(...result.facts.quotes);
      }
    }

    // Sources
    if (result.sources) {
      consolidated.sources.push(...result.sources);
    }

    // Track context reduction
    consolidated.raw_reduction.before += result.rawLength || 0;
    consolidated.raw_reduction.after += result.extractedLength || 0;

    // Track saved files
    if (result.savedPath) {
      consolidated.saved_files.push(result.savedPath);
    }
  }

  // Dedupe
  consolidated.sources = [...new Set(consolidated.sources)];
  consolidated.evidence = [...new Set(consolidated.evidence)].slice(0, 15);

  // Generate scores from evidence
  consolidated.scores = generateScoresFromEvidence(consolidated);

  return consolidated;
}

/**
 * Generate AAA scores from consolidated evidence
 */
function generateScoresFromEvidence(consolidated) {
  const allText = [
    ...consolidated.evidence,
    ...consolidated.summary.ai_initiatives,
    ...consolidated.summary.partnerships
  ].join(' ').toLowerCase();

  const count = (keywords) => keywords.reduce((sum, kw) => {
    const matches = allText.match(new RegExp(kw, 'gi'));
    return sum + (matches ? matches.length : 0);
  }, 0);

  const normalize = (c) => Math.min(5, Math.max(1, 1 + c * 0.3));

  const scores = {
    data: normalize(count(['data', 'analytics', 'platform', 'cloud', 'infrastructure', 'warehouse'])),
    systems: normalize(count(['api', 'integration', 'architecture', 'modern', 'digital', 'transform'])),
    human_ai: normalize(count(['ai', 'machine learning', 'automation', 'assistant', 'copilot', 'generative'])),
    governance: normalize(count(['governance', 'responsible', 'ethics', 'policy', 'compliance', 'risk'])),
    inclusion: normalize(count(['access', 'inclusive', 'customer', 'experience', 'personali'])),
    readiness: normalize(count(['strategy', 'investment', 'initiative', 'program', 'roadmap', 'transform']))
  };

  scores.overall = Object.values(scores).reduce((a, b) => a + b, 0) / 6;

  return scores;
}

/**
 * Run full staged research for a company
 * This is the main entry point - call with Perplexity MCP tool
 */
async function runStagedResearch(company, ticker, options = {}) {
  const { perplexityTool, skipAnalysis = false } = options;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🔬 STAGED PERPLEXITY RESEARCH: ${ticker} - ${company}`);
  console.log(`${'═'.repeat(60)}`);

  if (!perplexityTool) {
    console.log('\n⚠️ Perplexity tool not provided - returning stage structure');
    return {
      stages: RESEARCH_STAGES.map(s => ({
        id: s.id,
        name: s.name,
        query: s.queryTemplate(company, ticker)
      })),
      instructions: `
To execute this research, call each stage with Perplexity MCP:

For each stage:
1. Call mcp__MCP_DOCKER__perplexity_research with the query
2. Extract key facts from response
3. Discard raw response to save context
4. Pass extracted facts to next stage

Example:
  mcp__MCP_DOCKER__perplexity_research({
    messages: [{ role: 'user', content: '${RESEARCH_STAGES[0].queryTemplate(company, ticker)}' }]
  })
      `
    };
  }

  // Execute each stage
  const stageResults = [];
  for (const stage of RESEARCH_STAGES) {
    const result = await executeResearchStage(stage, company, ticker, perplexityTool);
    stageResults.push(result);
  }

  // Consolidate all extracted facts
  console.log(`\n📊 Consolidating research...`);
  const consolidated = consolidateResearch(stageResults, company, ticker);

  // Report context reduction
  const reduction = ((1 - consolidated.raw_reduction.after / consolidated.raw_reduction.before) * 100).toFixed(0);
  console.log(`   Context reduction: ${consolidated.raw_reduction.before} → ${consolidated.raw_reduction.after} chars (${reduction}% smaller)`);
  console.log(`   Evidence items: ${consolidated.evidence.length}`);
  console.log(`   Sources: ${consolidated.sources.length}`);

  // Run Helix Engine analysis if not skipped
  if (!skipAnalysis) {
    console.log(`\n🧬 Running Helix Engine Analysis...`);

    const researchData = {
      ticker,
      sources: consolidated.sources,
      scores: consolidated.scores,
      key_evidence: consolidated.evidence.slice(0, 8),
      commentary: `Deep Perplexity research on ${company}. ${consolidated.evidence[0] || ''}`
    };

    const analysisResult = await runHelixPipeline({
      ticker,
      exchange: options.exchange || 'ASX',
      period: options.period || '2025Q4',
      name: company,
      sector: options.sector || 'Unknown',
      researchData
    });

    return {
      research: consolidated,
      analysis: analysisResult
    };
  }

  return { research: consolidated };
}

/**
 * Manual staged research (when Perplexity is called externally)
 * Use this to process Perplexity responses one at a time
 * SAVES FULL RESPONSE TO FILE
 */
function processPerplexityResponse(stageId, content, ticker, company) {
  const stage = RESEARCH_STAGES.find(s => s.id === stageId);
  if (!stage) {
    throw new Error(`Unknown stage: ${stageId}`);
  }

  const facts = extractKeyFacts(stageId, content);
  const sources = extractSources(content);

  // Save full response if ticker provided
  let savedPath = null;
  if (ticker) {
    savedPath = saveFullResponse(ticker, stageId, content, {
      stageName: stage.name,
      company: company || ticker,
      query: stage.queryTemplate(company || ticker, ticker),
      sourcesCount: sources.length
    });
  }

  return {
    stage: stageId,
    facts,
    sources,
    rawLength: content.length,
    extractedLength: JSON.stringify(facts).length,
    savedPath
  };
}

/**
 * Get queries for manual execution
 */
function getResearchQueries(company, ticker) {
  return RESEARCH_STAGES.map(stage => ({
    id: stage.id,
    name: stage.name,
    query: stage.queryTemplate(company, ticker),
    extractPrompt: stage.extractPrompt
  }));
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
🔬 Perplexity Staged Research Pipeline

Breaks deep research into stages to manage context size.

USAGE:
  node pipelines/perplexity_staged_research.js --company TICKER [--name "Company Name"]
  node pipelines/perplexity_staged_research.js --queries TICKER    # Just show queries

OPTIONS:
  --company TICKER     Research a company
  --name "Name"        Company name (optional)
  --queries TICKER     Show Perplexity queries without executing
  --sector SECTOR      Company sector

STAGES:
  1. AI Strategy & Investments
  2. Digital Transformation
  3. AI Governance & Leadership

Each stage:
  - Calls Perplexity with focused query
  - Extracts key facts (discards raw response)
  - ~95% context reduction per stage

EXAMPLE WORKFLOW:
  # Get queries
  node pipelines/perplexity_staged_research.js --queries WOW

  # Execute manually in Claude Code:
  1. Call mcp__MCP_DOCKER__perplexity_research with Stage 1 query
  2. Extract facts, discard raw response
  3. Repeat for Stages 2-3
  4. Consolidate and analyze
    `);
    process.exit(0);
  }

  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  if (args.includes('--queries')) {
    const ticker = getArg('--queries');
    const name = getArg('--name') || ticker;

    console.log(`\n🔬 Research Queries for ${ticker}\n`);

    const queries = getResearchQueries(name, ticker);
    for (const q of queries) {
      console.log(`${'─'.repeat(60)}`);
      console.log(`📡 Stage: ${q.name}`);
      console.log(`   ID: ${q.id}`);
      console.log(`\n   Query:`);
      console.log(`   ${q.query}`);
      console.log(`\n   Extract Prompt:`);
      console.log(`   ${q.extractPrompt.substring(0, 200)}...`);
    }

  } else if (args.includes('--company')) {
    const ticker = getArg('--company');
    const name = getArg('--name') || ticker;
    const sector = getArg('--sector') || 'Unknown';

    // Without Perplexity tool, just show structure
    runStagedResearch(name, ticker, { sector })
      .then(result => {
        console.log('\n📋 Stage Structure:');
        console.log(JSON.stringify(result, null, 2));
      });
  }
}

module.exports = {
  runStagedResearch,
  processPerplexityResponse,
  getResearchQueries,
  consolidateResearch,
  RESEARCH_STAGES
};
