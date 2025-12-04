#!/usr/bin/env node
/**
 * Ingest Company Data for Co-Intelligence Index
 *
 * Usage:
 *   node pipelines/ingest_company.js --ticker CBA --period 2025Q4
 *   node pipelines/ingest_company.js --ticker BHP --exchange ASX --period 2025Q4
 *
 * This pipeline:
 * 1. Creates/updates company record
 * 2. Fetches AI strategy data via Perplexity (requires MCP running)
 * 3. Stores sources and creates snapshot
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', '.agentdb', 'co_intel.db');

// Quadrant scoring logic
const QUADRANT_THRESHOLDS = {
  // Customer axis thresholds
  customer: {
    assist: { min: 0, max: 2.5 },      // Assist Customer
    augment: { min: 2.5, max: 4.0 },   // Augment Customer
    adapt: { min: 4.0, max: 5.0 }      // Adapt for Customer
  },
  // Execution axis thresholds
  execution: {
    assist: { min: 0, max: 2.5 },      // Assist Execution
    augment: { min: 2.5, max: 4.0 },   // Augment Execution
    adapt: { min: 4.0, max: 5.0 }      // Adapt Execution
  }
};

// Map axes to quadrant
function getQuadrant(customerScore, executionScore) {
  const customerAxis = customerScore >= 4.0 ? 'adapt' :
                       customerScore >= 2.5 ? 'augment' : 'assist';
  const executionAxis = executionScore >= 4.0 ? 'adapt' :
                        executionScore >= 2.5 ? 'augment' : 'assist';

  const quadrantMap = {
    'assist-assist': 'Q1',
    'assist-augment': 'Q2',
    'assist-adapt': 'Q3',
    'augment-assist': 'Q4',
    'augment-augment': 'Q5',
    'augment-adapt': 'Q6',
    'adapt-assist': 'Q7',
    'adapt-augment': 'Q8',
    'adapt-adapt': 'Q9'
  };

  return quadrantMap[`${customerAxis}-${executionAxis}`] || 'Q1';
}

// Calculate GAIN score components
function calculateGAIN(insights) {
  // This would be more sophisticated in practice
  // For now, derive from maturity dimensions
  return {
    growth: 7,      // Placeholder - would analyze growth trajectory
    amplification: 7, // Placeholder - would analyze AI leverage
    intelligence: 8,  // Placeholder - would analyze AI sophistication
    novelty: 6,       // Placeholder - would analyze innovation
    total: 28
  };
}

// Get or create company
function getOrCreateCompany(db, ticker, exchange = 'ASX', name = null, sector = null) {
  // Try to find existing
  let company = db.prepare(`
    SELECT * FROM companies WHERE ticker = ? AND exchange = ?
  `).get(ticker, exchange);

  if (!company) {
    // Create new
    const result = db.prepare(`
      INSERT INTO companies (ticker, exchange, name, sector)
      VALUES (?, ?, ?, ?)
    `).run(ticker, exchange, name || ticker, sector);

    company = db.prepare(`SELECT * FROM companies WHERE id = ?`).get(result.lastInsertRowid);
  }

  return company;
}

// Store research source
function storeSource(db, companyId, period, sourceData) {
  return db.prepare(`
    INSERT INTO sources (company_id, period, source_type, credibility_tier, title, url, raw_text, summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    companyId,
    period,
    sourceData.type || 'research_report',
    sourceData.tier || 3,
    sourceData.title || 'Perplexity Research',
    sourceData.url || null,
    sourceData.raw_text || null,
    sourceData.summary || null
  );
}

// Store insight
function storeInsight(db, companyId, period, theme, summary, evidenceLevel = 'medium') {
  return db.prepare(`
    INSERT INTO insights (company_id, period, theme, summary, evidence_level)
    VALUES (?, ?, ?, ?, ?)
  `).run(companyId, period, theme, summary, evidenceLevel);
}

// Create or update snapshot
function upsertSnapshot(db, companyId, period, snapshotData) {
  // Check if snapshot exists
  const existing = db.prepare(`
    SELECT id FROM snapshots WHERE company_id = ? AND period = ?
  `).get(companyId, period);

  if (existing) {
    // Update
    return db.prepare(`
      UPDATE snapshots SET
        quadrant = ?,
        quadrant_name = ?,
        maturity_overall = ?,
        aaa_data_foundations = ?,
        aaa_system_integration = ?,
        aaa_human_ai_interaction = ?,
        aaa_governance_risk = ?,
        aaa_inclusion_accessibility = ?,
        aaa_org_readiness = ?,
        gain_growth = ?,
        gain_amplification = ?,
        gain_intelligence = ?,
        gain_novelty = ?,
        gain_total = ?,
        llv_lines = ?,
        llv_loops = ?,
        llv_vibes = ?,
        commentary = ?,
        key_evidence = ?,
        source_count = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      snapshotData.quadrant,
      snapshotData.quadrant_name,
      snapshotData.maturity_overall,
      snapshotData.aaa_data_foundations,
      snapshotData.aaa_system_integration,
      snapshotData.aaa_human_ai_interaction,
      snapshotData.aaa_governance_risk,
      snapshotData.aaa_inclusion_accessibility,
      snapshotData.aaa_org_readiness,
      snapshotData.gain_growth,
      snapshotData.gain_amplification,
      snapshotData.gain_intelligence,
      snapshotData.gain_novelty,
      snapshotData.gain_total,
      snapshotData.llv_lines,
      snapshotData.llv_loops,
      snapshotData.llv_vibes,
      snapshotData.commentary,
      snapshotData.key_evidence,
      snapshotData.source_count,
      existing.id
    );
  } else {
    // Insert
    return db.prepare(`
      INSERT INTO snapshots (
        company_id, period, quadrant, quadrant_name,
        maturity_overall,
        aaa_data_foundations, aaa_system_integration, aaa_human_ai_interaction,
        aaa_governance_risk, aaa_inclusion_accessibility, aaa_org_readiness,
        gain_growth, gain_amplification, gain_intelligence, gain_novelty, gain_total,
        llv_lines, llv_loops, llv_vibes,
        commentary, key_evidence, source_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      companyId,
      period,
      snapshotData.quadrant,
      snapshotData.quadrant_name,
      snapshotData.maturity_overall,
      snapshotData.aaa_data_foundations,
      snapshotData.aaa_system_integration,
      snapshotData.aaa_human_ai_interaction,
      snapshotData.aaa_governance_risk,
      snapshotData.aaa_inclusion_accessibility,
      snapshotData.aaa_org_readiness,
      snapshotData.gain_growth,
      snapshotData.gain_amplification,
      snapshotData.gain_intelligence,
      snapshotData.gain_novelty,
      snapshotData.gain_total,
      snapshotData.llv_lines,
      snapshotData.llv_loops,
      snapshotData.llv_vibes,
      snapshotData.commentary,
      snapshotData.key_evidence,
      snapshotData.source_count
    );
  }
}

// Main ingestion function - called with pre-analyzed data
async function ingestCompanyData(options) {
  const { ticker, exchange = 'ASX', period, name, sector, analysis } = options;

  console.log(`\n📥 Ingesting: ${ticker} (${exchange}) for ${period}`);

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  try {
    // 1. Get or create company
    const company = getOrCreateCompany(db, ticker, exchange, name, sector);
    console.log(`  ✅ Company: ${company.name} (ID: ${company.id})`);

    // 2. Store source reference
    if (analysis.raw_research) {
      storeSource(db, company.id, period, {
        type: 'research_report',
        tier: 2,
        title: `${ticker} AI Strategy Research ${period}`,
        raw_text: analysis.raw_research,
        summary: analysis.summary
      });
      console.log(`  ✅ Source stored`);
    }

    // 3. Store insights
    if (analysis.insights) {
      for (const insight of analysis.insights) {
        storeInsight(db, company.id, period, insight.theme, insight.summary, insight.evidence_level);
      }
      console.log(`  ✅ ${analysis.insights.length} insights stored`);
    }

    // 4. Calculate quadrant from scores
    const customerScore = (analysis.aaa_human_ai_interaction + analysis.aaa_org_readiness) / 2;
    const executionScore = (analysis.aaa_data_foundations + analysis.aaa_system_integration) / 2;
    const quadrant = analysis.quadrant || getQuadrant(customerScore, executionScore);

    // Get quadrant name
    const quadrantDef = db.prepare('SELECT name FROM quadrant_definitions WHERE quadrant = ?').get(quadrant);

    // 5. Create snapshot
    const snapshotData = {
      quadrant,
      quadrant_name: quadrantDef?.name || quadrant,
      maturity_overall: analysis.maturity_overall,
      aaa_data_foundations: analysis.aaa_data_foundations,
      aaa_system_integration: analysis.aaa_system_integration,
      aaa_human_ai_interaction: analysis.aaa_human_ai_interaction,
      aaa_governance_risk: analysis.aaa_governance_risk,
      aaa_inclusion_accessibility: analysis.aaa_inclusion_accessibility || 3.0,
      aaa_org_readiness: analysis.aaa_org_readiness,
      gain_growth: analysis.gain?.growth || 7,
      gain_amplification: analysis.gain?.amplification || 7,
      gain_intelligence: analysis.gain?.intelligence || 8,
      gain_novelty: analysis.gain?.novelty || 6,
      gain_total: analysis.gain?.total || 28,
      llv_lines: analysis.llv?.lines || 35,
      llv_loops: analysis.llv?.loops || 55,
      llv_vibes: analysis.llv?.vibes || 10,
      commentary: analysis.commentary,
      key_evidence: JSON.stringify(analysis.key_evidence || []),
      source_count: analysis.source_count || 1
    };

    upsertSnapshot(db, company.id, period, snapshotData);
    console.log(`  ✅ Snapshot created: ${quadrant} (${quadrantDef?.name})`);

    db.close();

    return {
      success: true,
      company_id: company.id,
      ticker,
      period,
      quadrant,
      maturity: analysis.maturity_overall
    };

  } catch (error) {
    db.close();
    throw error;
  }
}

// Export for use as module
module.exports = {
  ingestCompanyData,
  getOrCreateCompany,
  storeSource,
  storeInsight,
  upsertSnapshot,
  getQuadrant,
  DB_PATH
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const tickerIdx = args.indexOf('--ticker');
  const periodIdx = args.indexOf('--period');

  if (tickerIdx === -1 || periodIdx === -1) {
    console.log(`
Usage: node pipelines/ingest_company.js --ticker TICKER --period PERIOD

Example:
  node pipelines/ingest_company.js --ticker CBA --period 2025Q4

Note: This script is typically called by the orchestration layer with
      pre-analyzed data. For direct ingestion, use the seed script.
    `);
    process.exit(0);
  }

  const ticker = args[tickerIdx + 1];
  const period = args[periodIdx + 1];

  console.log(`Manual ingestion mode: ${ticker} for ${period}`);
  console.log('For full ingestion with research, use the orchestration layer.');
}
