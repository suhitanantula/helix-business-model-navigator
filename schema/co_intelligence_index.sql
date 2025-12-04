-- Co-Intelligence Index Database Schema
-- Version: 1.0.0
-- Created: 2025-12-04
-- Purpose: Persistent storage for ASX/S&P company tracking, AAA scoring, and quadrant classification

-- ============================================
-- CORE TABLES
-- ============================================

-- Companies: Master list of tracked companies
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    name TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'ASX',  -- ASX, NYSE, NASDAQ, LSE, etc.
    country TEXT DEFAULT 'Australia',
    sector TEXT,
    subsector TEXT,
    size_bucket TEXT,  -- 'mega' (>$50B), 'large' ($10-50B), 'mid' ($2-10B), 'small' (<$2B)
    market_cap_aud REAL,
    employee_count INTEGER,
    founded_year INTEGER,
    notes_json TEXT,  -- JSON for ad-hoc metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticker, exchange)
);

-- Snapshots: One row per company per period (the heart of the Index)
CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    period TEXT NOT NULL,  -- Format: '2025Q4', '2025H1', '2025'
    period_type TEXT DEFAULT 'quarter',  -- 'quarter', 'half', 'annual'

    -- Quadrant Classification (Q1-Q9)
    quadrant TEXT NOT NULL,  -- 'Q1', 'Q2', ..., 'Q9'
    quadrant_name TEXT,  -- 'Basic Assistant', 'Dynamic Curator', etc.
    quadrant_confidence REAL DEFAULT 0.8,  -- 0.0-1.0 confidence in classification

    -- AAA Maturity Scores (0-5 scale, can be fractional)
    maturity_overall REAL,  -- Overall maturity score (1.0-5.0)

    -- Six AAA Dimensions (each 0-5)
    aaa_data_foundations REAL,
    aaa_system_integration REAL,
    aaa_human_ai_interaction REAL,
    aaa_governance_risk REAL,
    aaa_inclusion_accessibility REAL,
    aaa_org_readiness REAL,

    -- GAIN Score (Growth/Amplification/Intelligence/Novelty - out of 40)
    gain_growth REAL,  -- 0-10
    gain_amplification REAL,  -- 0-10
    gain_intelligence REAL,  -- 0-10
    gain_novelty REAL,  -- 0-10
    gain_total REAL,  -- 0-40

    -- LLV Signature (Lines/Loops/Vibes percentages)
    llv_lines INTEGER,  -- 0-100%
    llv_loops INTEGER,  -- 0-100%
    llv_vibes INTEGER,  -- 0-100%
    llv_signature_json TEXT,  -- Full LLV detail as JSON

    -- Index Score (scalar for rankings)
    index_score REAL,  -- Computed composite score for ranking
    index_rank INTEGER,  -- Rank within period (1 = highest)
    sector_rank INTEGER,  -- Rank within sector for period

    -- Pathway Analysis
    previous_quadrant TEXT,  -- Quadrant in previous period
    quadrant_movement TEXT,  -- 'stable', 'up', 'down', 'lateral'
    pathway_hint TEXT,  -- e.g., 'Q5→Q6 (12-18 months)'

    -- Narrative
    commentary TEXT,  -- Short narrative summary
    key_evidence TEXT,  -- Bullet points of key evidence
    analyst_notes TEXT,  -- Internal notes

    -- Metadata
    research_method TEXT DEFAULT 'perplexity_mcp',
    source_count INTEGER,
    research_quality_score REAL,  -- 0-100
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id),
    UNIQUE(company_id, period)
);

-- Sources: Raw evidence documents
CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    period TEXT,
    source_type TEXT NOT NULL,  -- 'annual_report', 'quarterly', 'asx_announcement', 'earnings_call', 'news', 'company_site', 'research_report'
    credibility_tier INTEGER DEFAULT 3,  -- 1=highest (filings), 5=lowest (general media)
    title TEXT,
    url TEXT,
    published_date DATE,
    raw_text TEXT,
    summary TEXT,
    key_quotes TEXT,  -- JSON array of key quotes
    metadata_json TEXT,
    ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Insights: Extracted structured facts
CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    period TEXT NOT NULL,
    theme TEXT NOT NULL,  -- 'ai_strategy', 'governance', 'business_model', 'org_design', 'tech_infrastructure', 'customer_experience', 'operations'

    summary TEXT NOT NULL,
    evidence_level TEXT DEFAULT 'medium',  -- 'high', 'medium', 'low', 'inferred'
    source_ids TEXT,  -- JSON array of source IDs

    -- Feature flags for scoring
    feature_name TEXT,  -- e.g., 'has_ai_strategy', 'governance_framework_exists'
    feature_value TEXT,  -- 'true', 'false', or specific value
    feature_confidence REAL,

    tags TEXT,  -- JSON array of tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Vectors: Embeddings for semantic search
CREATE TABLE IF NOT EXISTS vectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_type TEXT NOT NULL,  -- 'source', 'insight', 'snapshot', 'company'
    owner_id INTEGER NOT NULL,
    chunk_index INTEGER DEFAULT 0,  -- For multi-chunk documents

    embedding BLOB,  -- Vector embedding (stored as binary)
    embedding_model TEXT DEFAULT 'hash-1024',  -- Model used for embedding

    -- Metadata for filtering
    company_id INTEGER,
    period TEXT,
    theme TEXT,
    quadrant TEXT,
    metadata_json TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pathways: Tracked quadrant transitions
CREATE TABLE IF NOT EXISTS pathways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    from_quadrant TEXT NOT NULL,
    to_quadrant TEXT NOT NULL,
    from_period TEXT NOT NULL,
    to_period TEXT NOT NULL,
    duration_quarters INTEGER,

    key_interventions TEXT,  -- JSON array of what drove the change
    success_factors TEXT,
    blockers TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Index Reports: Quarterly/annual index publications
CREATE TABLE IF NOT EXISTS index_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL UNIQUE,
    report_type TEXT DEFAULT 'quarterly',  -- 'quarterly', 'annual', 'special'

    companies_analyzed INTEGER,
    sectors_covered TEXT,  -- JSON array

    -- Distribution stats
    q1_count INTEGER DEFAULT 0,
    q2_count INTEGER DEFAULT 0,
    q3_count INTEGER DEFAULT 0,
    q4_count INTEGER DEFAULT 0,
    q5_count INTEGER DEFAULT 0,
    q6_count INTEGER DEFAULT 0,
    q7_count INTEGER DEFAULT 0,
    q8_count INTEGER DEFAULT 0,
    q9_count INTEGER DEFAULT 0,

    -- Movement stats
    companies_advanced INTEGER DEFAULT 0,
    companies_declined INTEGER DEFAULT 0,
    companies_stable INTEGER DEFAULT 0,

    executive_summary TEXT,
    key_findings TEXT,  -- JSON array
    sector_analysis TEXT,  -- JSON
    methodology_notes TEXT,

    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_exchange ON companies(exchange);

CREATE INDEX IF NOT EXISTS idx_snapshots_company_period ON snapshots(company_id, period);
CREATE INDEX IF NOT EXISTS idx_snapshots_period ON snapshots(period);
CREATE INDEX IF NOT EXISTS idx_snapshots_quadrant ON snapshots(quadrant);
CREATE INDEX IF NOT EXISTS idx_snapshots_index_score ON snapshots(index_score DESC);

CREATE INDEX IF NOT EXISTS idx_sources_company ON sources(company_id);
CREATE INDEX IF NOT EXISTS idx_sources_period ON sources(period);
CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(source_type);

CREATE INDEX IF NOT EXISTS idx_insights_company_period ON insights(company_id, period);
CREATE INDEX IF NOT EXISTS idx_insights_theme ON insights(theme);

CREATE INDEX IF NOT EXISTS idx_vectors_owner ON vectors(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_vectors_company ON vectors(company_id);

CREATE INDEX IF NOT EXISTS idx_pathways_company ON pathways(company_id);
CREATE INDEX IF NOT EXISTS idx_pathways_transition ON pathways(from_quadrant, to_quadrant);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Current company positions (latest snapshot per company)
CREATE VIEW IF NOT EXISTS current_positions AS
SELECT
    c.ticker,
    c.name,
    c.sector,
    c.exchange,
    s.period,
    s.quadrant,
    s.quadrant_name,
    s.maturity_overall,
    s.gain_total,
    s.index_score,
    s.index_rank,
    s.quadrant_movement,
    s.pathway_hint
FROM companies c
JOIN snapshots s ON c.id = s.company_id
WHERE s.period = (
    SELECT MAX(period)
    FROM snapshots
    WHERE company_id = c.id
);

-- Quadrant distribution by period
CREATE VIEW IF NOT EXISTS quadrant_distribution AS
SELECT
    period,
    quadrant,
    COUNT(*) as company_count,
    AVG(maturity_overall) as avg_maturity,
    AVG(index_score) as avg_index_score
FROM snapshots
GROUP BY period, quadrant
ORDER BY period DESC, quadrant;

-- Company movement tracking
CREATE VIEW IF NOT EXISTS company_movements AS
SELECT
    c.ticker,
    c.name,
    s1.period as from_period,
    s2.period as to_period,
    s1.quadrant as from_quadrant,
    s2.quadrant as to_quadrant,
    s2.maturity_overall - s1.maturity_overall as maturity_change,
    s2.index_score - s1.index_score as score_change,
    CASE
        WHEN s2.quadrant > s1.quadrant THEN 'advanced'
        WHEN s2.quadrant < s1.quadrant THEN 'declined'
        ELSE 'stable'
    END as movement_type
FROM snapshots s1
JOIN snapshots s2 ON s1.company_id = s2.company_id
JOIN companies c ON s1.company_id = c.id
WHERE s2.period > s1.period
AND NOT EXISTS (
    SELECT 1 FROM snapshots s3
    WHERE s3.company_id = s1.company_id
    AND s3.period > s1.period
    AND s3.period < s2.period
);

-- Sector leaders by period
CREATE VIEW IF NOT EXISTS sector_leaders AS
SELECT
    c.sector,
    s.period,
    c.ticker,
    c.name,
    s.quadrant,
    s.index_score,
    s.sector_rank
FROM snapshots s
JOIN companies c ON s.company_id = c.id
WHERE s.sector_rank = 1;

-- ============================================
-- INITIAL DATA: Quadrant Definitions
-- ============================================

CREATE TABLE IF NOT EXISTS quadrant_definitions (
    quadrant TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    customer_axis TEXT NOT NULL,  -- 'Assist', 'Augment', 'Adapt'
    execution_axis TEXT NOT NULL,  -- 'Assist', 'Augment', 'Adapt'
    llv_lines_typical INTEGER,
    llv_loops_typical INTEGER,
    llv_vibes_typical INTEGER,
    description TEXT,
    mit_cisr_name TEXT,  -- Mapping to MIT CISR framework
    examples TEXT  -- JSON array of example companies
);

INSERT OR REPLACE INTO quadrant_definitions VALUES
    ('Q1', 'Basic Assistant', 'Assist', 'Assist', 85, 10, 5, 'AI helps customers through predefined, structured processes', NULL, '[]'),
    ('Q2', 'Smart Assistant', 'Assist', 'Augment', 50, 45, 5, 'AI helps customers with adaptive, learning-enhanced processes', NULL, '[]'),
    ('Q3', 'Intelligent Assistant', 'Assist', 'Adapt', 40, 25, 35, 'AI proactively helps customers through autonomous orchestration', NULL, '[]'),
    ('Q4', 'Co-Creation Assistant', 'Augment', 'Assist', 45, 50, 5, 'Human and AI co-create outcomes through structured workflows', NULL, '["Optus", "Bendigo Bank"]'),
    ('Q5', 'Dynamic Curator', 'Augment', 'Augment', 35, 55, 10, 'AI and customer co-create by dynamically assembling modular solutions', 'Modular Curator', '["CBA", "NAB", "Westpac", "ANZ", "CSL", "Telstra", "Woolworths"]'),
    ('Q6', 'Adaptive Partner', 'Augment', 'Adapt', 25, 45, 30, 'AI autonomously optimizes partnership while co-creating with customer', NULL, '[]'),
    ('Q7', 'Traditional Proxy', 'Adapt', 'Assist', 50, 15, 35, 'AI acts on customers behalf following structured rules', 'Customer Proxy', '[]'),
    ('Q8', 'Intelligent Proxy', 'Adapt', 'Augment', 20, 40, 40, 'AI autonomously acts for customer while continuously learning', NULL, '["BHP", "Rio Tinto", "Fortescue"]'),
    ('Q9', 'Autonomous Orchestrator', 'Adapt', 'Adapt', 10, 25, 65, 'AI autonomously orchestrates ecosystem to achieve customer life outcomes', 'Orchestrator', '[]');
