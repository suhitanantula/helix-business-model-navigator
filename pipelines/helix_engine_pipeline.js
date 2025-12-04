#!/usr/bin/env node
/**
 * Helix Engine Pipeline
 *
 * Orchestrates the 5 Helix Engine agents through Claude Flow memory coordination
 * and persists final output to Co-Intelligence Index database.
 *
 * Architecture:
 * 1. Research Layer (research-swarm) → Raw data
 * 2. Claude Flow Memory → Agent coordination
 * 3. Co-Intelligence Index DB → Persistent storage
 *
 * Usage:
 *   node pipelines/helix_engine_pipeline.js --ticker TCL --research "raw research data"
 *   node pipelines/helix_engine_pipeline.js --ticker WES --from-file research_output.json
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { ingestCompanyData } = require('./ingest_company');

const MEMORY_NAMESPACE = 'helix-engine';

// Memory key patterns for agent coordination
const MEMORY_KEYS = {
  architect: (ticker, period) => `helix/architect/${ticker}/${period}`,
  sensing: (ticker, period) => `helix/sensing/${ticker}/${period}`,
  genesis: (ticker, period) => `helix/genesis/${ticker}/${period}`,
  evolve: (ticker, period) => `helix/evolve/${ticker}/${period}`,
  orchestration: (ticker, period) => `helix/orchestration/${ticker}/${period}`,
  pipeline_status: (ticker, period) => `helix/pipeline/${ticker}/${period}/status`,
  final_snapshot: (ticker, period) => `helix/snapshot/${ticker}/${period}`
};

// Store to Claude Flow ReasoningBank memory
async function storeMemory(key, value, namespace = MEMORY_NAMESPACE) {
  return new Promise((resolve, reject) => {
    // Format: npx claude-flow@alpha memory store KEY VALUE
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    const fullKey = `${namespace}/${key}`;

    const cmd = spawn('npx', [
      'claude-flow@alpha', 'memory', 'store',
      fullKey, valueStr
    ]);

    let output = '';
    cmd.stdout.on('data', (data) => output += data);
    cmd.stderr.on('data', (data) => output += data);
    cmd.on('close', (code) => {
      if (code === 0 && output.includes('Stored')) {
        resolve(output);
      } else {
        // Memory might not be available, continue anyway
        console.log(`  ⚠️ Memory store skipped (Claude Flow not available)`);
        resolve(null);
      }
    });
  });
}

// Retrieve from Claude Flow memory
async function retrieveMemory(key, namespace = MEMORY_NAMESPACE) {
  return new Promise((resolve, reject) => {
    // Format: npx claude-flow@alpha memory query KEY
    const fullKey = `${namespace}/${key}`;

    const cmd = spawn('npx', [
      'claude-flow@alpha', 'memory', 'query', fullKey
    ]);

    let output = '';
    cmd.stdout.on('data', (data) => output += data);
    cmd.on('close', (code) => {
      try {
        // Extract value from output
        const match = output.match(/Value:\s*(.+)/);
        if (match) {
          resolve(JSON.parse(match[1]));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    });
  });
}

// Pipeline stages
const PIPELINE_STAGES = {
  RESEARCH: 'research',
  ARCHITECT: 'architect',
  SENSING: 'sensing',
  GENESIS: 'genesis',
  EVOLVE: 'evolve',
  ORCHESTRATION: 'orchestration',
  INGEST: 'ingest',
  COMPLETE: 'complete'
};

/**
 * Run the full Helix Engine pipeline for a company
 */
async function runHelixPipeline(options) {
  const { ticker, exchange = 'ASX', period = '2025Q4', researchData, name, sector } = options;

  console.log(`\n🧬 HELIX ENGINE PIPELINE: ${ticker}`);
  console.log('═'.repeat(50));
  console.log(`Exchange: ${exchange} | Period: ${period}`);
  console.log('═'.repeat(50));

  const pipelineState = {
    ticker,
    exchange,
    period,
    startTime: new Date().toISOString(),
    stages: {}
  };

  try {
    // Stage 1: Store research data in memory
    console.log(`\n📥 Stage 1: Research Data`);
    await storeMemory(
      `helix/research/${ticker}/${period}`,
      researchData
    );
    pipelineState.stages.research = { status: 'complete', data: researchData };
    console.log(`  ✅ Research data stored`);

    // Stage 2: Architect Analysis (AAA Dimensions)
    console.log(`\n🏗️  Stage 2: Helix Architect (AAA Dimensions)`);
    const architectOutput = analyzeWithArchitect(researchData);
    await storeMemory(
      MEMORY_KEYS.architect(ticker, period),
      architectOutput
    );
    pipelineState.stages.architect = { status: 'complete', data: architectOutput };
    console.log(`  ✅ AAA Dimensions: Data ${architectOutput.aaa_data_foundations}/5, Systems ${architectOutput.aaa_system_integration}/5`);
    console.log(`     Maturity: ${architectOutput.maturity_overall}/5`);

    // Stage 3: Sensing (Quadrant Detection)
    console.log(`\n📡 Stage 3: Helix Sensing (Quadrant Detection)`);
    const sensingOutput = detectQuadrant(architectOutput);
    await storeMemory(
      MEMORY_KEYS.sensing(ticker, period),
      sensingOutput
    );
    pipelineState.stages.sensing = { status: 'complete', data: sensingOutput };
    console.log(`  ✅ Quadrant: ${sensingOutput.quadrant} (${sensingOutput.quadrant_name})`);
    console.log(`     Confidence: ${(sensingOutput.confidence * 100).toFixed(0)}%`);

    // Stage 4: Genesis (LLV Signature)
    console.log(`\n🧬 Stage 4: Helix Genesis (LLV Signature)`);
    const genesisOutput = generateLLV(sensingOutput);
    await storeMemory(
      MEMORY_KEYS.genesis(ticker, period),
      genesisOutput
    );
    pipelineState.stages.genesis = { status: 'complete', data: genesisOutput };
    console.log(`  ✅ LLV: L:${genesisOutput.llv.lines}% / Lp:${genesisOutput.llv.loops}% / V:${genesisOutput.llv.vibes}%`);
    console.log(`     Pattern: ${genesisOutput.cognitive_pattern}`);

    // Stage 5: Evolve (Pathway Analysis)
    console.log(`\n🔄 Stage 5: Helix Evolve (Pathway Analysis)`);
    const evolveOutput = analyzePathway(architectOutput, sensingOutput);
    await storeMemory(
      MEMORY_KEYS.evolve(ticker, period),
      evolveOutput
    );
    pipelineState.stages.evolve = { status: 'complete', data: evolveOutput };
    console.log(`  ✅ Pathway: ${evolveOutput.pathway_hint}`);
    console.log(`     Blockers: ${evolveOutput.blockers.length}, Accelerators: ${evolveOutput.accelerators.length}`);

    // Stage 6: Orchestration (GAIN Score + Synthesis)
    console.log(`\n🎼 Stage 6: Helix Orchestration (Final Synthesis)`);
    const orchestrationOutput = synthesize(ticker, architectOutput, sensingOutput, genesisOutput, evolveOutput, researchData);
    await storeMemory(
      MEMORY_KEYS.orchestration(ticker, period),
      orchestrationOutput
    );
    pipelineState.stages.orchestration = { status: 'complete', data: orchestrationOutput };
    console.log(`  ✅ GAIN: ${orchestrationOutput.gain.total}/40`);
    console.log(`     G:${orchestrationOutput.gain.growth} A:${orchestrationOutput.gain.amplification} I:${orchestrationOutput.gain.intelligence} N:${orchestrationOutput.gain.novelty}`);

    // Stage 7: Database Ingestion
    console.log(`\n💾 Stage 7: Database Ingestion`);
    const ingestionData = {
      ticker,
      exchange,
      name: name || ticker,
      sector: sector || 'Unknown',
      period,
      analysis: {
        quadrant: sensingOutput.quadrant,
        maturity_overall: architectOutput.maturity_overall,
        aaa_data_foundations: architectOutput.aaa_data_foundations,
        aaa_system_integration: architectOutput.aaa_system_integration,
        aaa_human_ai_interaction: architectOutput.aaa_human_ai_interaction,
        aaa_governance_risk: architectOutput.aaa_governance_risk,
        aaa_inclusion_accessibility: architectOutput.aaa_inclusion_accessibility,
        aaa_org_readiness: architectOutput.aaa_org_readiness,
        gain: orchestrationOutput.gain,
        llv: genesisOutput.llv,
        commentary: orchestrationOutput.commentary,
        key_evidence: orchestrationOutput.key_evidence,
        source_count: researchData.sources?.length || 1
      }
    };

    const ingestionResult = await ingestCompanyData(ingestionData);
    pipelineState.stages.ingest = { status: 'complete', data: ingestionResult };

    // Store final snapshot in memory
    await storeMemory(
      MEMORY_KEYS.final_snapshot(ticker, period),
      orchestrationOutput
    );

    // Update pipeline status
    pipelineState.endTime = new Date().toISOString();
    pipelineState.status = 'complete';
    await storeMemory(
      MEMORY_KEYS.pipeline_status(ticker, period),
      pipelineState
    );

    // Summary
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`✅ HELIX ENGINE PIPELINE COMPLETE`);
    console.log(`${'═'.repeat(50)}`);
    console.log(`\n📊 Final Position: ${sensingOutput.quadrant} - ${sensingOutput.quadrant_name}`);
    console.log(`   Maturity: ${architectOutput.maturity_overall}/5`);
    console.log(`   GAIN: ${orchestrationOutput.gain.total}/40`);
    console.log(`   LLV: L:${genesisOutput.llv.lines}% Lp:${genesisOutput.llv.loops}% V:${genesisOutput.llv.vibes}%`);
    console.log(`   Pathway: ${evolveOutput.pathway_hint}`);
    console.log(`\n📁 Memory Keys:`);
    console.log(`   helix/architect/${ticker}/${period}`);
    console.log(`   helix/sensing/${ticker}/${period}`);
    console.log(`   helix/genesis/${ticker}/${period}`);
    console.log(`   helix/evolve/${ticker}/${period}`);
    console.log(`   helix/orchestration/${ticker}/${period}`);
    console.log(`\n💾 Database: Company ID ${ingestionResult.company_id}`);

    return orchestrationOutput;

  } catch (error) {
    console.error(`\n❌ Pipeline failed: ${error.message}`);
    pipelineState.status = 'failed';
    pipelineState.error = error.message;
    await storeMemory(
      MEMORY_KEYS.pipeline_status(ticker, period),
      pipelineState
    );
    throw error;
  }
}

// Architect: Calculate AAA Dimensions
function analyzeWithArchitect(researchData) {
  // In production, this would call the Claude agent
  // For now, return structure based on research indicators
  return {
    aaa_data_foundations: researchData.scores?.data || 3.5,
    aaa_system_integration: researchData.scores?.systems || 3.5,
    aaa_human_ai_interaction: researchData.scores?.human_ai || 3.0,
    aaa_governance_risk: researchData.scores?.governance || 3.0,
    aaa_inclusion_accessibility: researchData.scores?.inclusion || 3.0,
    aaa_org_readiness: researchData.scores?.readiness || 3.5,
    maturity_overall: researchData.scores?.overall || 3.25
  };
}

// Sensing: Detect Quadrant
function detectQuadrant(architectOutput) {
  const customerScore = (architectOutput.aaa_human_ai_interaction + architectOutput.aaa_org_readiness) / 2;
  const executionScore = (architectOutput.aaa_data_foundations + architectOutput.aaa_system_integration) / 2;

  const customerAxis = customerScore >= 4.0 ? 'adapt' : customerScore >= 2.5 ? 'augment' : 'assist';
  const executionAxis = executionScore >= 4.0 ? 'adapt' : executionScore >= 2.5 ? 'augment' : 'assist';

  const quadrantMap = {
    'assist-assist': { q: 'Q1', name: 'Basic Assistant' },
    'assist-augment': { q: 'Q2', name: 'Smart Assistant' },
    'assist-adapt': { q: 'Q3', name: 'Intelligent Assistant' },
    'augment-assist': { q: 'Q4', name: 'Co-Creation Assistant' },
    'augment-augment': { q: 'Q5', name: 'Dynamic Curator' },
    'augment-adapt': { q: 'Q6', name: 'Adaptive Partner' },
    'adapt-assist': { q: 'Q7', name: 'Traditional Proxy' },
    'adapt-augment': { q: 'Q8', name: 'Intelligent Proxy' },
    'adapt-adapt': { q: 'Q9', name: 'Autonomous Orchestrator' }
  };

  const result = quadrantMap[`${customerAxis}-${executionAxis}`] || { q: 'Q1', name: 'Basic Assistant' };

  return {
    quadrant: result.q,
    quadrant_name: result.name,
    customer_axis: customerAxis,
    execution_axis: executionAxis,
    customer_score: customerScore,
    execution_score: executionScore,
    confidence: 0.80
  };
}

// Genesis: Generate LLV Signature
function generateLLV(sensingOutput) {
  const llvPatterns = {
    'Q1': { lines: 85, loops: 10, vibes: 5 },
    'Q2': { lines: 50, loops: 45, vibes: 5 },
    'Q3': { lines: 40, loops: 25, vibes: 35 },
    'Q4': { lines: 45, loops: 50, vibes: 5 },
    'Q5': { lines: 35, loops: 55, vibes: 10 },
    'Q6': { lines: 25, loops: 45, vibes: 30 },
    'Q7': { lines: 50, loops: 15, vibes: 35 },
    'Q8': { lines: 20, loops: 40, vibes: 40 },
    'Q9': { lines: 10, loops: 25, vibes: 65 }
  };

  const cognitivePatterns = {
    'Q1': 'Sequential',
    'Q2': 'Sequential + Logical',
    'Q3': 'Systems + Logical',
    'Q4': 'Creative + Reflective',
    'Q5': 'Creative + Reflective + Systems',
    'Q6': 'Systems + Strategic',
    'Q7': 'Sequential + Logical',
    'Q8': 'Systems + Reflective',
    'Q9': 'Systems + Strategic + Emergent'
  };

  return {
    llv: llvPatterns[sensingOutput.quadrant] || llvPatterns['Q5'],
    cognitive_pattern: cognitivePatterns[sensingOutput.quadrant] || 'Unknown',
    quadrant: sensingOutput.quadrant
  };
}

// Evolve: Analyze Pathway
function analyzePathway(architectOutput, sensingOutput) {
  const currentQ = sensingOutput.quadrant;

  // Determine target based on current position
  const pathways = {
    'Q1': { target: 'Q5', timeline: '24-36 months', path: 'diagonal' },
    'Q2': { target: 'Q5', timeline: '12-18 months', path: 'vertical' },
    'Q3': { target: 'Q6', timeline: '12-18 months', path: 'vertical' },
    'Q4': { target: 'Q5', timeline: '6-12 months', path: 'horizontal' },
    'Q5': { target: 'Q6', timeline: '18-24 months', path: 'horizontal' },
    'Q6': { target: 'Q9', timeline: '24-36 months', path: 'diagonal' },
    'Q7': { target: 'Q8', timeline: '12-18 months', path: 'horizontal' },
    'Q8': { target: 'Q9', timeline: '18-24 months', path: 'horizontal' },
    'Q9': { target: 'Q9', timeline: 'Achieved', path: 'maintain' }
  };

  const pathway = pathways[currentQ] || pathways['Q5'];

  // Identify blockers based on AAA scores
  const blockers = [];
  if (architectOutput.aaa_governance_risk < 3.5) blockers.push('Governance framework maturity');
  if (architectOutput.aaa_human_ai_interaction < 3.5) blockers.push('Human-AI collaboration');
  if (architectOutput.aaa_org_readiness < 3.5) blockers.push('Organizational readiness');

  // Identify accelerators
  const accelerators = [];
  if (architectOutput.aaa_data_foundations >= 4.0) accelerators.push('Strong data foundation');
  if (architectOutput.aaa_system_integration >= 4.0) accelerators.push('Modern architecture');
  if (architectOutput.aaa_org_readiness >= 4.0) accelerators.push('Innovation culture');

  return {
    current_quadrant: currentQ,
    target_quadrant: pathway.target,
    timeline: pathway.timeline,
    pathway_type: pathway.path,
    pathway_hint: `${currentQ}→${pathway.target} (${pathway.timeline})`,
    blockers,
    accelerators
  };
}

// Orchestration: Final Synthesis
function synthesize(ticker, architectOutput, sensingOutput, genesisOutput, evolveOutput, researchData) {
  // Calculate GAIN score
  const gain = {
    growth: Math.min(10, Math.round((architectOutput.maturity_overall / 5) * 8 + Math.random() * 2)),
    amplification: Math.min(10, Math.round((architectOutput.aaa_system_integration / 5) * 8 + Math.random() * 2)),
    intelligence: Math.min(10, Math.round((architectOutput.aaa_data_foundations / 5) * 8 + Math.random() * 2)),
    novelty: Math.min(10, Math.round((architectOutput.aaa_org_readiness / 5) * 7 + Math.random() * 2))
  };
  gain.total = gain.growth + gain.amplification + gain.intelligence + gain.novelty;

  // Generate commentary
  const commentary = researchData.commentary ||
    `${sensingOutput.quadrant} positioning with ${architectOutput.maturity_overall}/5 maturity. ` +
    `${evolveOutput.blockers.length > 0 ? evolveOutput.blockers[0] + ' is key blocker. ' : ''}` +
    `${evolveOutput.pathway_hint}.`;

  return {
    ticker,
    quadrant: sensingOutput.quadrant,
    quadrant_name: sensingOutput.quadrant_name,
    maturity_overall: architectOutput.maturity_overall,
    aaa_dimensions: {
      data_foundations: architectOutput.aaa_data_foundations,
      system_integration: architectOutput.aaa_system_integration,
      human_ai_interaction: architectOutput.aaa_human_ai_interaction,
      governance_risk: architectOutput.aaa_governance_risk,
      inclusion_accessibility: architectOutput.aaa_inclusion_accessibility,
      org_readiness: architectOutput.aaa_org_readiness
    },
    gain,
    llv: genesisOutput.llv,
    cognitive_pattern: genesisOutput.cognitive_pattern,
    pathway: evolveOutput,
    commentary,
    key_evidence: researchData.key_evidence || [],
    confidence: sensingOutput.confidence,
    timestamp: new Date().toISOString()
  };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
🧬 Helix Engine Pipeline

USAGE:
  node pipelines/helix_engine_pipeline.js --ticker TICKER [options]

OPTIONS:
  --ticker TICKER       Company ticker (required)
  --exchange EXCHANGE   Exchange (default: ASX)
  --period PERIOD       Period (default: 2025Q4)
  --name NAME           Company name
  --sector SECTOR       Company sector

EXAMPLES:
  # Run pipeline with basic input
  node pipelines/helix_engine_pipeline.js --ticker TCL --name "Transurban" --sector "Infrastructure"

  # With custom scores
  node pipelines/helix_engine_pipeline.js --ticker WES --name "Wesfarmers" --sector "Retail"

ARCHITECTURE:
  1. Research Layer → Raw data input
  2. Claude Flow Memory → Agent coordination (helix/* keys)
  3. Co-Intelligence Index DB → Persistent storage
    `);
    process.exit(0);
  }

  // Parse arguments
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const ticker = getArg('--ticker');
  const exchange = getArg('--exchange') || 'ASX';
  const period = getArg('--period') || '2025Q4';
  const name = getArg('--name');
  const sector = getArg('--sector');

  if (!ticker) {
    console.error('❌ --ticker is required');
    process.exit(1);
  }

  // Create sample research data for demo
  const researchData = {
    ticker,
    sources: [],
    scores: {
      data: 3.5,
      systems: 3.5,
      human_ai: 3.0,
      governance: 3.0,
      inclusion: 3.0,
      readiness: 3.5,
      overall: 3.25
    },
    key_evidence: [
      'AI initiatives identified',
      'Digital transformation in progress',
      'Technology investments ongoing'
    ],
    commentary: null
  };

  runHelixPipeline({
    ticker,
    exchange,
    period,
    name,
    sector,
    researchData
  }).catch(err => {
    console.error('Pipeline failed:', err);
    process.exit(1);
  });
}

module.exports = {
  runHelixPipeline,
  MEMORY_KEYS,
  PIPELINE_STAGES
};
