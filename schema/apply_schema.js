#!/usr/bin/env node
/**
 * Apply Co-Intelligence Index Schema to AgentDB
 *
 * Usage: node schema/apply_schema.js
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', '.agentdb', 'co_intel.db');

async function applySchema() {
  console.log('🗄️  Co-Intelligence Index Database Setup');
  console.log('=========================================\n');

  // Ensure .agentdb directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`📁 Created directory: ${dbDir}`);
  }

  // Initialize database
  const db = new Database(DB_PATH);
  console.log(`🔌 Connected to: ${DB_PATH}`);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables directly
  console.log('\n📋 Creating tables...');

  // Companies
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      name TEXT NOT NULL,
      exchange TEXT NOT NULL DEFAULT 'ASX',
      country TEXT DEFAULT 'Australia',
      sector TEXT,
      subsector TEXT,
      size_bucket TEXT,
      market_cap_aud REAL,
      employee_count INTEGER,
      founded_year INTEGER,
      notes_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ticker, exchange)
    )
  `);
  console.log('  ✅ companies');

  // Snapshots
  db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      period TEXT NOT NULL,
      period_type TEXT DEFAULT 'quarter',
      quadrant TEXT NOT NULL,
      quadrant_name TEXT,
      quadrant_confidence REAL DEFAULT 0.8,
      maturity_overall REAL,
      aaa_data_foundations REAL,
      aaa_system_integration REAL,
      aaa_human_ai_interaction REAL,
      aaa_governance_risk REAL,
      aaa_inclusion_accessibility REAL,
      aaa_org_readiness REAL,
      gain_growth REAL,
      gain_amplification REAL,
      gain_intelligence REAL,
      gain_novelty REAL,
      gain_total REAL,
      llv_lines INTEGER,
      llv_loops INTEGER,
      llv_vibes INTEGER,
      llv_signature_json TEXT,
      index_score REAL,
      index_rank INTEGER,
      sector_rank INTEGER,
      previous_quadrant TEXT,
      quadrant_movement TEXT,
      pathway_hint TEXT,
      commentary TEXT,
      key_evidence TEXT,
      analyst_notes TEXT,
      research_method TEXT DEFAULT 'perplexity_mcp',
      source_count INTEGER,
      research_quality_score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      UNIQUE(company_id, period)
    )
  `);
  console.log('  ✅ snapshots');

  // Sources
  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      period TEXT,
      source_type TEXT NOT NULL,
      credibility_tier INTEGER DEFAULT 3,
      title TEXT,
      url TEXT,
      published_date DATE,
      raw_text TEXT,
      summary TEXT,
      key_quotes TEXT,
      metadata_json TEXT,
      ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
  console.log('  ✅ sources');

  // Insights
  db.exec(`
    CREATE TABLE IF NOT EXISTS insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      period TEXT NOT NULL,
      theme TEXT NOT NULL,
      summary TEXT NOT NULL,
      evidence_level TEXT DEFAULT 'medium',
      source_ids TEXT,
      feature_name TEXT,
      feature_value TEXT,
      feature_confidence REAL,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
  console.log('  ✅ insights');

  // Vectors
  db.exec(`
    CREATE TABLE IF NOT EXISTS vectors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_type TEXT NOT NULL,
      owner_id INTEGER NOT NULL,
      chunk_index INTEGER DEFAULT 0,
      embedding BLOB,
      embedding_model TEXT DEFAULT 'hash-1024',
      company_id INTEGER,
      period TEXT,
      theme TEXT,
      quadrant TEXT,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('  ✅ vectors');

  // Pathways
  db.exec(`
    CREATE TABLE IF NOT EXISTS pathways (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      from_quadrant TEXT NOT NULL,
      to_quadrant TEXT NOT NULL,
      from_period TEXT NOT NULL,
      to_period TEXT NOT NULL,
      duration_quarters INTEGER,
      key_interventions TEXT,
      success_factors TEXT,
      blockers TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
  console.log('  ✅ pathways');

  // Index Reports
  db.exec(`
    CREATE TABLE IF NOT EXISTS index_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period TEXT NOT NULL UNIQUE,
      report_type TEXT DEFAULT 'quarterly',
      companies_analyzed INTEGER,
      sectors_covered TEXT,
      q1_count INTEGER DEFAULT 0,
      q2_count INTEGER DEFAULT 0,
      q3_count INTEGER DEFAULT 0,
      q4_count INTEGER DEFAULT 0,
      q5_count INTEGER DEFAULT 0,
      q6_count INTEGER DEFAULT 0,
      q7_count INTEGER DEFAULT 0,
      q8_count INTEGER DEFAULT 0,
      q9_count INTEGER DEFAULT 0,
      companies_advanced INTEGER DEFAULT 0,
      companies_declined INTEGER DEFAULT 0,
      companies_stable INTEGER DEFAULT 0,
      executive_summary TEXT,
      key_findings TEXT,
      sector_analysis TEXT,
      methodology_notes TEXT,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('  ✅ index_reports');

  // Quadrant Definitions
  db.exec(`
    CREATE TABLE IF NOT EXISTS quadrant_definitions (
      quadrant TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      customer_axis TEXT NOT NULL,
      execution_axis TEXT NOT NULL,
      llv_lines_typical INTEGER,
      llv_loops_typical INTEGER,
      llv_vibes_typical INTEGER,
      description TEXT,
      mit_cisr_name TEXT,
      examples TEXT
    )
  `);
  console.log('  ✅ quadrant_definitions');

  // Create indexes
  console.log('\n📋 Creating indexes...');
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker)',
    'CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector)',
    'CREATE INDEX IF NOT EXISTS idx_companies_exchange ON companies(exchange)',
    'CREATE INDEX IF NOT EXISTS idx_snapshots_company_period ON snapshots(company_id, period)',
    'CREATE INDEX IF NOT EXISTS idx_snapshots_period ON snapshots(period)',
    'CREATE INDEX IF NOT EXISTS idx_snapshots_quadrant ON snapshots(quadrant)',
    'CREATE INDEX IF NOT EXISTS idx_snapshots_index_score ON snapshots(index_score DESC)',
    'CREATE INDEX IF NOT EXISTS idx_sources_company ON sources(company_id)',
    'CREATE INDEX IF NOT EXISTS idx_sources_period ON sources(period)',
    'CREATE INDEX IF NOT EXISTS idx_insights_company_period ON insights(company_id, period)',
    'CREATE INDEX IF NOT EXISTS idx_insights_theme ON insights(theme)',
    'CREATE INDEX IF NOT EXISTS idx_vectors_owner ON vectors(owner_type, owner_id)',
    'CREATE INDEX IF NOT EXISTS idx_vectors_company ON vectors(company_id)',
    'CREATE INDEX IF NOT EXISTS idx_pathways_company ON pathways(company_id)'
  ];
  for (const idx of indexes) {
    db.exec(idx);
  }
  console.log('  ✅ Created 14 indexes');

  // Insert quadrant definitions
  console.log('\n📋 Inserting quadrant definitions...');
  const insertQuadrant = db.prepare(`
    INSERT OR REPLACE INTO quadrant_definitions
    (quadrant, name, customer_axis, execution_axis, llv_lines_typical, llv_loops_typical, llv_vibes_typical, description, mit_cisr_name, examples)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const quadrants = [
    ['Q1', 'Basic Assistant', 'Assist', 'Assist', 85, 10, 5, 'AI helps customers through predefined, structured processes', null, '[]'],
    ['Q2', 'Smart Assistant', 'Assist', 'Augment', 50, 45, 5, 'AI helps customers with adaptive, learning-enhanced processes', null, '[]'],
    ['Q3', 'Intelligent Assistant', 'Assist', 'Adapt', 40, 25, 35, 'AI proactively helps customers through autonomous orchestration', null, '[]'],
    ['Q4', 'Co-Creation Assistant', 'Augment', 'Assist', 45, 50, 5, 'Human and AI co-create outcomes through structured workflows', null, '["Optus", "Bendigo Bank"]'],
    ['Q5', 'Dynamic Curator', 'Augment', 'Augment', 35, 55, 10, 'AI and customer co-create by dynamically assembling modular solutions', 'Modular Curator', '["CBA", "NAB", "Westpac", "ANZ", "CSL", "Telstra", "Woolworths"]'],
    ['Q6', 'Adaptive Partner', 'Augment', 'Adapt', 25, 45, 30, 'AI autonomously optimizes partnership while co-creating with customer', null, '[]'],
    ['Q7', 'Traditional Proxy', 'Adapt', 'Assist', 50, 15, 35, 'AI acts on customers behalf following structured rules', 'Customer Proxy', '[]'],
    ['Q8', 'Intelligent Proxy', 'Adapt', 'Augment', 20, 40, 40, 'AI autonomously acts for customer while continuously learning', null, '["BHP", "Rio Tinto", "Fortescue"]'],
    ['Q9', 'Autonomous Orchestrator', 'Adapt', 'Adapt', 10, 25, 65, 'AI autonomously orchestrates ecosystem to achieve customer life outcomes', 'Orchestrator', '[]']
  ];

  for (const q of quadrants) {
    insertQuadrant.run(...q);
  }
  console.log('  ✅ Inserted 9 quadrant definitions');

  // Verify
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
  const quadrantCount = db.prepare('SELECT COUNT(*) as count FROM quadrant_definitions').get();

  console.log('\n📊 Database Summary:');
  console.log(`   Tables: ${tables.length}`);
  console.log(`   Quadrant Definitions: ${quadrantCount.count}`);

  db.close();

  console.log('\n✅ Schema applied successfully!');
  console.log(`\n📁 Database location: ${DB_PATH}`);

  return { tables: tables.length };
}

// Run if called directly
if (require.main === module) {
  applySchema().catch(err => {
    console.error('❌ Failed to apply schema:', err);
    process.exit(1);
  });
}

module.exports = { applySchema, DB_PATH };
