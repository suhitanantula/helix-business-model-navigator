#!/usr/bin/env node
/**
 * Query Co-Intelligence Index
 *
 * Usage:
 *   node pipelines/query_index.js --summary
 *   node pipelines/query_index.js --company CBA
 *   node pipelines/query_index.js --sector Banking
 *   node pipelines/query_index.js --quadrant Q5
 *   node pipelines/query_index.js --leaders
 *   node pipelines/query_index.js --distribution
 */

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', '.agentdb', 'co_intel.db');

function openDB() {
  return new Database(DB_PATH, { readonly: true });
}

// Summary of all current positions
function getSummary() {
  const db = openDB();

  const companies = db.prepare(`
    SELECT
      c.ticker,
      c.name,
      c.sector,
      s.period,
      s.quadrant,
      s.quadrant_name,
      s.maturity_overall,
      s.gain_total,
      s.commentary
    FROM companies c
    JOIN snapshots s ON c.id = s.company_id
    ORDER BY s.quadrant DESC, s.maturity_overall DESC
  `).all();

  db.close();

  console.log('\n📊 Co-Intelligence Index Summary');
  console.log('================================\n');
  console.log(`Companies Tracked: ${companies.length}`);
  console.log(`Period: ${companies[0]?.period || 'N/A'}\n`);

  console.log('| Ticker | Company                      | Sector     | Quadrant        | Maturity | GAIN |');
  console.log('|--------|------------------------------|------------|-----------------|----------|------|');

  for (const c of companies) {
    console.log(
      `| ${c.ticker.padEnd(6)} ` +
      `| ${c.name.substring(0, 28).padEnd(28)} ` +
      `| ${(c.sector || '').substring(0, 10).padEnd(10)} ` +
      `| ${c.quadrant} ${(c.quadrant_name || '').substring(0, 12).padEnd(12)} ` +
      `| ${c.maturity_overall}/5      ` +
      `| ${c.gain_total}/40 |`
    );
  }

  return companies;
}

// Get specific company details
function getCompany(ticker) {
  const db = openDB();

  const company = db.prepare(`
    SELECT c.*, s.*
    FROM companies c
    JOIN snapshots s ON c.id = s.company_id
    WHERE c.ticker = ?
    ORDER BY s.period DESC
    LIMIT 1
  `).get(ticker.toUpperCase());

  db.close();

  if (!company) {
    console.log(`\n❌ Company not found: ${ticker}`);
    return null;
  }

  console.log(`\n📋 ${company.name} (${company.ticker})`);
  console.log('='.repeat(50));
  console.log(`\nSector: ${company.sector}`);
  console.log(`Exchange: ${company.exchange}`);
  console.log(`Period: ${company.period}`);
  console.log(`\n🎯 Position: ${company.quadrant} - ${company.quadrant_name}`);
  console.log(`   Maturity: ${company.maturity_overall}/5`);
  console.log(`   GAIN Score: ${company.gain_total}/40`);
  console.log(`\n📊 AAA Dimensions:`);
  console.log(`   Data Foundations:     ${company.aaa_data_foundations}/5`);
  console.log(`   System Integration:   ${company.aaa_system_integration}/5`);
  console.log(`   Human-AI Interaction: ${company.aaa_human_ai_interaction}/5`);
  console.log(`   Governance & Risk:    ${company.aaa_governance_risk}/5`);
  console.log(`   Inclusion:            ${company.aaa_inclusion_accessibility}/5`);
  console.log(`   Org Readiness:        ${company.aaa_org_readiness}/5`);
  console.log(`\n🔄 LLV Signature: L:${company.llv_lines}% / Lp:${company.llv_loops}% / V:${company.llv_vibes}%`);
  console.log(`\n📝 Commentary:\n   ${company.commentary}`);

  if (company.key_evidence) {
    console.log(`\n🔍 Key Evidence:`);
    try {
      const evidence = JSON.parse(company.key_evidence);
      for (const e of evidence) {
        console.log(`   • ${e}`);
      }
    } catch (err) {
      console.log(`   ${company.key_evidence}`);
    }
  }

  return company;
}

// Get companies by sector
function getBySector(sector) {
  const db = openDB();

  const companies = db.prepare(`
    SELECT c.ticker, c.name, s.quadrant, s.quadrant_name, s.maturity_overall, s.gain_total
    FROM companies c
    JOIN snapshots s ON c.id = s.company_id
    WHERE LOWER(c.sector) = LOWER(?)
    ORDER BY s.maturity_overall DESC
  `).all(sector);

  db.close();

  console.log(`\n📊 ${sector} Sector Companies`);
  console.log('='.repeat(40));
  console.log(`\nTotal: ${companies.length} companies\n`);

  console.log('| Ticker | Quadrant | Maturity | GAIN |');
  console.log('|--------|----------|----------|------|');
  for (const c of companies) {
    console.log(`| ${c.ticker.padEnd(6)} | ${c.quadrant.padEnd(8)} | ${c.maturity_overall}/5      | ${c.gain_total}/40 |`);
  }

  // Sector average
  const avgMaturity = companies.reduce((sum, c) => sum + c.maturity_overall, 0) / companies.length;
  console.log(`\nSector Average Maturity: ${avgMaturity.toFixed(2)}/5`);

  return companies;
}

// Get companies by quadrant
function getByQuadrant(quadrant) {
  const db = openDB();

  const companies = db.prepare(`
    SELECT c.ticker, c.name, c.sector, s.maturity_overall, s.gain_total, s.commentary
    FROM companies c
    JOIN snapshots s ON c.id = s.company_id
    WHERE s.quadrant = ?
    ORDER BY s.maturity_overall DESC
  `).all(quadrant.toUpperCase());

  const quadDef = db.prepare(`
    SELECT * FROM quadrant_definitions WHERE quadrant = ?
  `).get(quadrant.toUpperCase());

  db.close();

  console.log(`\n📊 ${quadrant.toUpperCase()} - ${quadDef?.name || 'Unknown'}`);
  console.log('='.repeat(50));
  console.log(`\n${quadDef?.description || ''}`);
  console.log(`\nCustomer Axis: ${quadDef?.customer_axis}`);
  console.log(`Execution Axis: ${quadDef?.execution_axis}`);
  console.log(`Typical LLV: L:${quadDef?.llv_lines_typical}% / Lp:${quadDef?.llv_loops_typical}% / V:${quadDef?.llv_vibes_typical}%`);
  console.log(`\nCompanies in ${quadrant.toUpperCase()}: ${companies.length}\n`);

  for (const c of companies) {
    console.log(`• ${c.ticker} - ${c.name} (${c.sector}) - ${c.maturity_overall}/5`);
  }

  return companies;
}

// Get sector leaders
function getLeaders() {
  const db = openDB();

  const leaders = db.prepare(`
    SELECT
      c.sector,
      c.ticker,
      c.name,
      s.quadrant,
      s.maturity_overall,
      s.gain_total
    FROM companies c
    JOIN snapshots s ON c.id = s.company_id
    WHERE s.maturity_overall = (
      SELECT MAX(s2.maturity_overall)
      FROM snapshots s2
      JOIN companies c2 ON s2.company_id = c2.id
      WHERE c2.sector = c.sector
    )
    ORDER BY c.sector
  `).all();

  db.close();

  console.log('\n🏆 Sector Leaders');
  console.log('='.repeat(50));

  console.log('\n| Sector     | Leader | Quadrant | Maturity |');
  console.log('|------------|--------|----------|----------|');
  for (const l of leaders) {
    console.log(
      `| ${(l.sector || 'N/A').padEnd(10)} ` +
      `| ${l.ticker.padEnd(6)} ` +
      `| ${l.quadrant.padEnd(8)} ` +
      `| ${l.maturity_overall}/5      |`
    );
  }

  return leaders;
}

// Quadrant distribution
function getDistribution() {
  const db = openDB();

  const dist = db.prepare(`
    SELECT
      s.quadrant,
      qd.name as quadrant_name,
      COUNT(*) as count,
      AVG(s.maturity_overall) as avg_maturity,
      AVG(s.gain_total) as avg_gain
    FROM snapshots s
    JOIN quadrant_definitions qd ON s.quadrant = qd.quadrant
    GROUP BY s.quadrant
    ORDER BY s.quadrant
  `).all();

  const total = dist.reduce((sum, d) => sum + d.count, 0);

  db.close();

  console.log('\n📊 Quadrant Distribution');
  console.log('='.repeat(60));
  console.log(`\nTotal Companies: ${total}\n`);

  console.log('| Quadrant | Name                | Count | % of Total | Avg Maturity |');
  console.log('|----------|---------------------|-------|------------|--------------|');
  for (const d of dist) {
    const pct = ((d.count / total) * 100).toFixed(0);
    console.log(
      `| ${d.quadrant.padEnd(8)} ` +
      `| ${d.quadrant_name.substring(0, 19).padEnd(19)} ` +
      `| ${String(d.count).padEnd(5)} ` +
      `| ${pct.padStart(3)}%       ` +
      `| ${d.avg_maturity.toFixed(2)}/5        |`
    );
  }

  // Visual distribution
  console.log('\n📈 Visual Distribution:');
  for (const d of dist) {
    const bar = '█'.repeat(d.count * 3);
    console.log(`   ${d.quadrant}: ${bar} (${d.count})`);
  }

  return dist;
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--summary') || args.length === 0) {
    getSummary();
  }

  if (args.includes('--company')) {
    const idx = args.indexOf('--company');
    const ticker = args[idx + 1];
    if (ticker) getCompany(ticker);
  }

  if (args.includes('--sector')) {
    const idx = args.indexOf('--sector');
    const sector = args[idx + 1];
    if (sector) getBySector(sector);
  }

  if (args.includes('--quadrant')) {
    const idx = args.indexOf('--quadrant');
    const quadrant = args[idx + 1];
    if (quadrant) getByQuadrant(quadrant);
  }

  if (args.includes('--leaders')) {
    getLeaders();
  }

  if (args.includes('--distribution')) {
    getDistribution();
  }
}

module.exports = {
  getSummary,
  getCompany,
  getBySector,
  getByQuadrant,
  getLeaders,
  getDistribution
};
