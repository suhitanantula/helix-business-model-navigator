#!/usr/bin/env node
/**
 * Co-Intelligence Index Research Swarm
 *
 * Uses agentic-flow Federation Hub to orchestrate multi-agent company research:
 * - Explorer Agent: Finds company AI strategy data
 * - Analyst Agent: Applies AAA framework scoring
 * - Verifier Agent: Cross-references sources
 * - Synthesizer Agent: Creates final snapshot
 *
 * Usage:
 *   node pipelines/research_swarm.js --company WES --period 2025Q4
 *   node pipelines/research_swarm.js --batch "WES,MQG,TCL" --period 2025Q4
 */

const { spawn } = require('child_process');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', '.agentdb', 'co_intel.db');

// Agent prompts for Co-Intelligence Index research
const AGENT_PROMPTS = {
  explorer: (ticker, exchange) => `
You are an Explorer Agent for the Co-Intelligence Index.

TASK: Research ${ticker} (${exchange}) AI strategy and digital transformation.

FIND:
1. AI investment amounts and digital transformation budget
2. Key AI initiatives and partnerships (names, dates, amounts)
3. CEO/CTO statements on AI strategy (direct quotes)
4. Specific AI use cases deployed (with metrics)
5. Governance and responsible AI frameworks
6. Recent announcements (ASX/SEC filings)
7. Comparison to sector leaders

OUTPUT FORMAT:
{
  "ticker": "${ticker}",
  "company_name": "...",
  "sector": "...",
  "ai_investments": [...],
  "key_initiatives": [...],
  "executive_quotes": [...],
  "use_cases": [...],
  "governance": {...},
  "sources": [{"url": "...", "title": "...", "tier": 1-5}]
}

Be thorough. Include specific numbers, dates, and sources.
`,

  analyst: (ticker, explorerData) => `
You are an Analyst Agent for the Co-Intelligence Index.

TASK: Apply the Double-AAA Framework to score ${ticker}.

INPUT DATA:
${JSON.stringify(explorerData, null, 2)}

SCORING FRAMEWORK:
The Double-AAA Framework has two axes:
- Customer Axis (Assist/Augment/Adapt): How org acts for customers
- Execution Axis (Assist/Augment/Adapt): How org executes operations

Quadrants:
- Q1: Basic Assistant (Assist/Assist) - Rule-based, structured
- Q2: Smart Assistant (Assist/Augment) - Learning, adaptive
- Q3: Intelligent Assistant (Assist/Adapt) - Autonomous orchestration
- Q4: Co-Creation Assistant (Augment/Assist) - Human-AI co-creation
- Q5: Dynamic Curator (Augment/Augment) - Modular ecosystem assembly
- Q6: Adaptive Partner (Augment/Adapt) - Self-optimizing partnership
- Q7: Traditional Proxy (Adapt/Assist) - Rule-based proxy
- Q8: Intelligent Proxy (Adapt/Augment) - Learning autonomous agent
- Q9: Autonomous Orchestrator (Adapt/Adapt) - Full ecosystem orchestration

SCORE EACH AAA DIMENSION (1.0-5.0):
1. Data Foundations: Data integration, quality, accessibility
2. System Integration: API maturity, architecture modernization
3. Human-AI Interaction: Collaboration capability, adoption
4. Governance & Risk: Policies, oversight, responsible AI
5. Inclusion & Accessibility: Universal design, equity
6. Org Readiness: Culture, change management, talent

OUTPUT FORMAT:
{
  "ticker": "${ticker}",
  "quadrant": "Q1-Q9",
  "quadrant_rationale": "...",
  "maturity_overall": 1.0-5.0,
  "aaa_data_foundations": 1.0-5.0,
  "aaa_system_integration": 1.0-5.0,
  "aaa_human_ai_interaction": 1.0-5.0,
  "aaa_governance_risk": 1.0-5.0,
  "aaa_inclusion_accessibility": 1.0-5.0,
  "aaa_org_readiness": 1.0-5.0,
  "gain_score": {"growth": 0-10, "amplification": 0-10, "intelligence": 0-10, "novelty": 0-10, "total": 0-40},
  "llv_signature": {"lines": 0-100, "loops": 0-100, "vibes": 0-100},
  "pathway_hint": "Current→Target (timeline)"
}
`,

  verifier: (ticker, explorerData, analystData) => `
You are a Verifier Agent for the Co-Intelligence Index.

TASK: Verify and validate the analysis of ${ticker}.

EXPLORER DATA:
${JSON.stringify(explorerData, null, 2)}

ANALYST SCORING:
${JSON.stringify(analystData, null, 2)}

VERIFICATION TASKS:
1. Source Credibility: Rate each source (Tier 1=Official filings, Tier 5=General media)
2. Evidence Strength: Is the quadrant placement supported by evidence?
3. Score Validation: Are the AAA dimension scores justified?
4. Gap Detection: What information is missing?
5. Confidence Level: Overall confidence in the analysis (0-100%)

OUTPUT FORMAT:
{
  "ticker": "${ticker}",
  "verification_status": "validated|needs_review|rejected",
  "source_assessment": [...],
  "evidence_gaps": [...],
  "score_adjustments": {...},
  "confidence_level": 0-100,
  "reviewer_notes": "..."
}
`,

  synthesizer: (ticker, explorerData, analystData, verifierData) => `
You are a Synthesizer Agent for the Co-Intelligence Index.

TASK: Create the final snapshot for ${ticker}.

INPUTS:
Explorer: ${JSON.stringify(explorerData, null, 2)}
Analyst: ${JSON.stringify(analystData, null, 2)}
Verifier: ${JSON.stringify(verifierData, null, 2)}

CREATE FINAL SNAPSHOT:
Reconcile any discrepancies, apply verifier adjustments, and produce:

{
  "ticker": "${ticker}",
  "company_name": "...",
  "sector": "...",
  "period": "2025Q4",
  "quadrant": "Q1-Q9",
  "quadrant_name": "...",
  "maturity_overall": 1.0-5.0,
  "aaa_data_foundations": 1.0-5.0,
  "aaa_system_integration": 1.0-5.0,
  "aaa_human_ai_interaction": 1.0-5.0,
  "aaa_governance_risk": 1.0-5.0,
  "aaa_inclusion_accessibility": 1.0-5.0,
  "aaa_org_readiness": 1.0-5.0,
  "gain": {"growth": 0-10, "amplification": 0-10, "intelligence": 0-10, "novelty": 0-10, "total": 0-40},
  "llv": {"lines": 0-100, "loops": 0-100, "vibes": 0-100},
  "commentary": "2-3 sentence summary",
  "key_evidence": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "source_count": N,
  "confidence": 0-100
}
`
};

// Run research swarm for a single company
async function researchCompany(ticker, exchange = 'ASX', period = '2025Q4') {
  console.log(`\n🔬 Research Swarm: ${ticker} (${exchange})`);
  console.log('='.repeat(50));

  // This would integrate with the Federation Hub
  // For now, show the workflow structure

  console.log(`
📋 Swarm Workflow:

1️⃣  EXPLORER AGENT (5-10 min)
    └─ Search: "${ticker} AI strategy digital transformation 2024-2025"
    └─ Sources: Annual reports, ASX announcements, earnings calls
    └─ Output: Raw company data with citations

2️⃣  ANALYST AGENT (2-3 min)
    └─ Input: Explorer data
    └─ Apply: Double-AAA Framework
    └─ Score: 6 AAA dimensions + GAIN + LLV
    └─ Output: Quadrant classification with rationale

3️⃣  VERIFIER AGENT (2-3 min)
    └─ Input: Explorer + Analyst data
    └─ Check: Source credibility, evidence strength
    └─ Flag: Gaps, inconsistencies
    └─ Output: Confidence score + adjustments

4️⃣  SYNTHESIZER AGENT (1-2 min)
    └─ Input: All agent outputs
    └─ Reconcile: Discrepancies
    └─ Produce: Final snapshot for database

⏱️  Total Time: ~10-15 minutes per company
📊  Output: Database snapshot ready for Index
  `);

  return {
    ticker,
    exchange,
    period,
    status: 'workflow_ready',
    agents: ['explorer', 'analyst', 'verifier', 'synthesizer']
  };
}

// Batch research multiple companies
async function batchResearch(tickers, exchange = 'ASX', period = '2025Q4') {
  console.log(`\n🚀 Batch Research Swarm`);
  console.log(`   Companies: ${tickers.join(', ')}`);
  console.log(`   Period: ${period}`);
  console.log('='.repeat(50));

  console.log(`
📋 Parallel Execution Plan:

With Federation Hub + Ephemeral Agents:
- Each company gets its own agent swarm
- Agents share memory via hub
- Results persist after agents terminate
- Self-learning improves with each run

Estimated Time:
- Sequential: ${tickers.length * 15} minutes
- Parallel (${Math.min(tickers.length, 5)} concurrent): ${Math.ceil(tickers.length / 5) * 15} minutes

Federation Commands:
  # Start hub
  npx agentic-flow federation start --db-path .agentdb/federation.db

  # Spawn agents (in separate terminals)
  npx agentic-flow federation spawn --type researcher --lifetime 900
  npx agentic-flow federation spawn --type analyst --lifetime 600
  npx agentic-flow federation spawn --type verifier --lifetime 300

  # Monitor
  npx agentic-flow federation stats
  `);

  return {
    tickers,
    period,
    status: 'batch_ready',
    estimated_time: `${Math.ceil(tickers.length / 5) * 15} minutes`
  };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--company')) {
    const idx = args.indexOf('--company');
    const ticker = args[idx + 1];
    const period = args.includes('--period') ?
      args[args.indexOf('--period') + 1] : '2025Q4';

    researchCompany(ticker, 'ASX', period);

  } else if (args.includes('--batch')) {
    const idx = args.indexOf('--batch');
    const tickers = args[idx + 1].split(',').map(t => t.trim());
    const period = args.includes('--period') ?
      args[args.indexOf('--period') + 1] : '2025Q4';

    batchResearch(tickers, 'ASX', period);

  } else {
    console.log(`
🔬 Co-Intelligence Index Research Swarm

USAGE:
  node pipelines/research_swarm.js --company TICKER [--period 2025Q4]
  node pipelines/research_swarm.js --batch "WES,MQG,TCL" [--period 2025Q4]

EXAMPLES:
  # Research single company
  node pipelines/research_swarm.js --company WES

  # Research multiple companies
  node pipelines/research_swarm.js --batch "WES,MQG,TCL,GMG"

  # With specific period
  node pipelines/research_swarm.js --company WES --period 2026Q1

ARCHITECTURE:
  This swarm uses agentic-flow Federation Hub with 4 agent types:
  - Explorer: Finds company data
  - Analyst: Applies AAA framework
  - Verifier: Validates sources/scores
  - Synthesizer: Creates final snapshot

  Agents are ephemeral (5-15 min) but share persistent memory
  via the Federation Hub's AgentDB.
    `);
  }
}

module.exports = {
  researchCompany,
  batchResearch,
  AGENT_PROMPTS
};
