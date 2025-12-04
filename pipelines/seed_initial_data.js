#!/usr/bin/env node
/**
 * Seed Initial Company Data
 *
 * Populates the Co-Intelligence Index database with previously analyzed companies.
 *
 * Usage: node pipelines/seed_initial_data.js
 */

const { ingestCompanyData } = require('./ingest_company');

// Existing analyzed companies from helix-business-model-navigator
const SEED_DATA = [
  // ============================================
  // BANKING SECTOR - BIG 4 COMPLETE
  // ============================================
  {
    ticker: 'CBA',
    exchange: 'ASX',
    name: 'Commonwealth Bank of Australia',
    sector: 'Banking',
    period: '2025Q4',
    analysis: {
      quadrant: 'Q5',
      maturity_overall: 4.5,
      aaa_data_foundations: 4.5,
      aaa_system_integration: 4.0,
      aaa_human_ai_interaction: 4.5,
      aaa_governance_risk: 5.0,
      aaa_inclusion_accessibility: 4.0,
      aaa_org_readiness: 4.5,
      gain: { growth: 8, amplification: 9, intelligence: 9, novelty: 7, total: 33 },
      llv: { lines: 30, loops: 60, vibes: 10 },
      commentary: '#1 APAC. Engagement Engine makes 55M AI decisions/day. Governance moat via 18-month lead on APRA mandate. Q5→Q6 trajectory.',
      key_evidence: [
        'Engagement Engine: 55M AI decisions daily',
        '#1 APAC AI maturity ranking',
        'Governance leadership 18 months ahead of APRA mandate',
        '$2B+ annual technology investment'
      ],
      source_count: 45
    }
  },
  {
    ticker: 'NAB',
    exchange: 'ASX',
    name: 'National Australia Bank',
    sector: 'Banking',
    period: '2025Q4',
    analysis: {
      quadrant: 'Q5',
      maturity_overall: 4.0,
      aaa_data_foundations: 4.0,
      aaa_system_integration: 4.0,
      aaa_human_ai_interaction: 4.5,
      aaa_governance_risk: 4.0,
      aaa_inclusion_accessibility: 3.5,
      aaa_org_readiness: 4.0,
      gain: { growth: 8, amplification: 8, intelligence: 8, novelty: 7, total: 31 },
      llv: { lines: 35, loops: 55, vibes: 10 },
      commentary: 'Customer Brain processes 50M interactions/month. 40% engagement uplift. Closest to Q6 among Big 4 (12-18mo timeline).',
      key_evidence: [
        'Customer Brain: 50M interactions/month',
        '40% customer engagement uplift',
        'AI-first strategy since 2023',
        'Data-driven personalization leader'
      ],
      source_count: 52
    }
  },
  {
    ticker: 'WBC',
    exchange: 'ASX',
    name: 'Westpac Banking Corporation',
    sector: 'Banking',
    period: '2025Q4',
    analysis: {
      quadrant: 'Q5',
      maturity_overall: 3.75,
      aaa_data_foundations: 4.0,
      aaa_system_integration: 4.0,
      aaa_human_ai_interaction: 3.5,
      aaa_governance_risk: 4.0,
      aaa_inclusion_accessibility: 3.5,
      aaa_org_readiness: 3.5,
      gain: { growth: 7, amplification: 7, intelligence: 7, novelty: 7, total: 28 },
      llv: { lines: 40, loops: 50, vibes: 10 },
      commentary: 'UNITE platform provides modern architecture advantage. $2B annual tech investment. Clean-sheet approach post-AUSTRAC.',
      key_evidence: [
        'UNITE platform modernization',
        '$2B annual technology investment',
        'Post-AUSTRAC governance rebuild',
        'Cloud-first architecture'
      ],
      source_count: 48
    }
  },
  {
    ticker: 'ANZ',
    exchange: 'ASX',
    name: 'ANZ Bank',
    sector: 'Banking',
    period: '2025Q4',
    analysis: {
      quadrant: 'Q5',
      maturity_overall: 3.5,
      aaa_data_foundations: 3.5,
      aaa_system_integration: 3.5,
      aaa_human_ai_interaction: 3.5,
      aaa_governance_risk: 4.0,
      aaa_inclusion_accessibility: 3.5,
      aaa_org_readiness: 3.5,
      gain: { growth: 7, amplification: 7, intelligence: 7, novelty: 6, total: 27 },
      llv: { lines: 40, loops: 50, vibes: 10 },
      commentary: 'ANZ Plus platform with 1M+ customers. Suncorp integration in progress. Institutional banking AI strength. 24-36mo to Q6.',
      key_evidence: [
        'ANZ Plus: 1M+ customers',
        'Suncorp acquisition integration',
        'Institutional banking AI leadership',
        'Google Cloud partnership'
      ],
      source_count: 42
    }
  },

  // ============================================
  // MINING SECTOR
  // ============================================
  {
    ticker: 'BHP',
    exchange: 'ASX',
    name: 'BHP Group',
    sector: 'Mining',
    period: '2025Q4',
    analysis: {
      quadrant: 'Q8',
      maturity_overall: 4.5,
      aaa_data_foundations: 4.5,
      aaa_system_integration: 4.5,
      aaa_human_ai_interaction: 4.0,
      aaa_governance_risk: 4.0,
      aaa_inclusion_accessibility: 4.0,
      aaa_org_readiness: 4.5,
      gain: { growth: 9, amplification: 9, intelligence: 8, novelty: 8, total: 34 },
      llv: { lines: 20, loops: 40, vibes: 40 },
      commentary: 'Global #1 autonomous mining. 300 autonomous trucks (largest fleet). $1B from data automation in first year. Singapore AI Hub (May 2025).',
      key_evidence: [
        '300 autonomous trucks - largest fleet globally',
        '$1B revenue from data automation (first year)',
        'Singapore AI Hub launched May 2025',
        'XCMG partnership: $1.2B over 5 years',
        '40% female representation achieved'
      ],
      source_count: 60
    }
  },
  {
    ticker: 'RIO',
    exchange: 'ASX',
    name: 'Rio Tinto',
    sector: 'Mining',
    period: '2025Q4',
    analysis: {
      quadrant: 'Q8',
      maturity_overall: 4.5,
      aaa_data_foundations: 4.5,
      aaa_system_integration: 4.5,
      aaa_human_ai_interaction: 4.0,
      aaa_governance_risk: 4.0,
      aaa_inclusion_accessibility: 3.5,
      aaa_org_readiness: 4.5,
      gain: { growth: 8, amplification: 9, intelligence: 9, novelty: 7, total: 33 },
      llv: { lines: 20, loops: 40, vibes: 40 },
      commentary: 'AutoHaul railway (1,700 km) - only fully autonomous heavy-haul railway in the world. Q9 trajectory through full value chain automation.',
      key_evidence: [
        'AutoHaul: 1,700 km autonomous railway',
        'World-first fully autonomous heavy-haul rail',
        '210+ autonomous trucks',
        'Full value chain automation strategy'
      ],
      source_count: 45
    }
  },
  {
    ticker: 'FMG',
    exchange: 'ASX',
    name: 'Fortescue Metals Group',
    sector: 'Mining',
    period: '2025Q4',
    analysis: {
      quadrant: 'Q8',
      maturity_overall: 4.0,
      aaa_data_foundations: 4.0,
      aaa_system_integration: 4.0,
      aaa_human_ai_interaction: 3.5,
      aaa_governance_risk: 4.0,
      aaa_inclusion_accessibility: 3.5,
      aaa_org_readiness: 4.0,
      gain: { growth: 8, amplification: 8, intelligence: 7, novelty: 7, total: 30 },
      llv: { lines: 25, loops: 40, vibes: 35 },
      commentary: 'Electrification leader with 360 electric trucks ordered. Autonomy + electrification dual transformation. Fortescue Future Industries spinoff.',
      key_evidence: [
        '360 electric trucks ordered',
        '193 autonomous trucks operating',
        'Electrification + autonomy dual focus',
        'FFI green energy spinoff'
      ],
      source_count: 38
    }
  },

  // ============================================
  // HEALTHCARE SECTOR
  // ============================================
  {
    ticker: 'CSL',
    exchange: 'ASX',
    name: 'CSL Limited',
    sector: 'Healthcare',
    period: '2025Q4',
    analysis: {
      quadrant: 'Q5',
      maturity_overall: 3.5,
      aaa_data_foundations: 4.0,
      aaa_system_integration: 3.5,
      aaa_human_ai_interaction: 3.5,
      aaa_governance_risk: 4.0,
      aaa_inclusion_accessibility: 3.0,
      aaa_org_readiness: 3.5,
      gain: { growth: 7, amplification: 8, intelligence: 7, novelty: 7, total: 29 },
      llv: { lines: 50, loops: 40, vibes: 10 },
      commentary: 'AWS Digital Core enabling 10x wave planning acceleration. Agentic AI for infrastructure. Rika plasma innovation (90-120 min → 60-80 min). EU AI Act ready.',
      key_evidence: [
        '10x acceleration in cloud migration planning',
        'Agentic AI for infrastructure management',
        'Rika plasma collection: 30% time reduction',
        'EU AI Act proactive compliance',
        '59 active clinical trials with AI support'
      ],
      source_count: 60
    }
  },

  // ============================================
  // RETAIL SECTOR
  // ============================================
  {
    ticker: 'WOW',
    exchange: 'ASX',
    name: 'Woolworths Group',
    sector: 'Retail',
    period: '2025Q4',
    analysis: {
      quadrant: 'Q5',
      maturity_overall: 4.0,
      aaa_data_foundations: 4.5,
      aaa_system_integration: 4.0,
      aaa_human_ai_interaction: 4.0,
      aaa_governance_risk: 3.5,
      aaa_inclusion_accessibility: 4.0,
      aaa_org_readiness: 4.0,
      gain: { growth: 8, amplification: 8, intelligence: 8, novelty: 6, total: 30 },
      llv: { lines: 35, loops: 55, vibes: 10 },
      commentary: 'Quantium data advantage (51% ownership). Customer intelligence leader. Q5→Q6 through personalization and supply chain AI.',
      key_evidence: [
        'Quantium: 51% ownership of data analytics leader',
        'WooliesX digital platform',
        'Supply chain AI optimization',
        'Everyday Rewards: 14M members'
      ],
      source_count: 35
    }
  },

  // ============================================
  // TELECOMMUNICATIONS SECTOR
  // ============================================
  {
    ticker: 'TLS',
    exchange: 'ASX',
    name: 'Telstra Corporation',
    sector: 'Telecommunications',
    period: '2025Q4',
    analysis: {
      quadrant: 'Q5',
      maturity_overall: 4.0,
      aaa_data_foundations: 4.0,
      aaa_system_integration: 4.5,
      aaa_human_ai_interaction: 4.0,
      aaa_governance_risk: 4.0,
      aaa_inclusion_accessibility: 4.0,
      aaa_org_readiness: 4.0,
      gain: { growth: 7, amplification: 8, intelligence: 8, novelty: 7, total: 30 },
      llv: { lines: 30, loops: 50, vibes: 20 },
      commentary: 'Dual path: Customer AI (Q5) + Network Autonomy (Q8). Self-healing networks. GenAI customer service. T25 transformation complete.',
      key_evidence: [
        'Self-healing network capabilities',
        'GenAI customer service deployment',
        'T25 transformation program complete',
        'Network autonomy trajectory to Q8'
      ],
      source_count: 40
    }
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding Co-Intelligence Index Database');
  console.log('=========================================\n');

  const results = {
    success: [],
    failed: []
  };

  for (const company of SEED_DATA) {
    try {
      const result = await ingestCompanyData(company);
      results.success.push({
        ticker: company.ticker,
        quadrant: result.quadrant,
        maturity: result.maturity
      });
    } catch (error) {
      console.error(`  ❌ Failed: ${company.ticker} - ${error.message}`);
      results.failed.push({
        ticker: company.ticker,
        error: error.message
      });
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Success: ${results.success.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);

  if (results.success.length > 0) {
    console.log('\n📋 Companies Ingested:');
    console.log('   | Ticker | Quadrant | Maturity |');
    console.log('   |--------|----------|----------|');
    for (const r of results.success) {
      console.log(`   | ${r.ticker.padEnd(6)} | ${r.quadrant.padEnd(8)} | ${r.maturity}/5     |`);
    }
  }

  return results;
}

// Run
if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase, SEED_DATA };
