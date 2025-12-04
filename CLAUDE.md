# Helix Business Model Navigator - Claude Code Activation

## Project Overview

The **Helix Business Model Navigator** is a strategic intelligence system for analyzing and positioning companies on the **Co-Intelligent Business Model Matrix** (Double-AAA Framework).

**Core Purpose:** Research public companies, assess their AI business model positioning (Q1-Q9), and generate strategic briefs for consulting engagements.

---

## MCP Tools - Pre-Approved for Auto-Execution

The following tools are approved for research operations without additional confirmation:

### Perplexity Research (Primary)
```
mcp__MCP_DOCKER__perplexity_research - Deep company research with citations
mcp__MCP_DOCKER__perplexity_ask - Quick queries
```

### Web Fetching
```
mcp__MCP_DOCKER__fetch - Direct URL content fetching
mcp__MCP_DOCKER__browser_* - Browser automation for complex scraping
```

### File Operations
```
Read, Write, Edit - All file operations in this repository
Bash - Git operations, directory management
```

---

## Standard Research Workflow

### Single Company Analysis (4-5 minutes)

**Step 1: Deep Research via Perplexity (45 seconds)**
```
Use mcp__MCP_DOCKER__perplexity_research with prompt:
"Research [COMPANY] (ASX: [CODE]) AI strategy 2024-2025. Find:
1. AI investment amounts and digital transformation budget
2. Key AI initiatives and partnerships
3. CEO/CTO statements on AI strategy
4. Specific AI use cases deployed
5. Comparison to sector leaders
6. Governance and responsible AI frameworks
7. Recent ASX announcements

Provide specific numbers, dates, and sources."
```

**Step 2: AAA Framework Assessment (2 minutes)**
Apply the Double-AAA Framework from `01_CORE_FRAMEWORK/double_aaa_framework.md`:
- Assess Customer Action dimension (Assist/Augment/Adapt)
- Assess Execution dimension (Assist/Augment/Adapt)
- Determine quadrant (Q1-Q9)
- Estimate maturity level (1-5)
- Identify strategic pathway

**Step 3: Strategic Brief Generation (1 minute)**
Use template from `02_RESEARCH_ENGINE/prompts/strategic_brief.md`:
- Current position summary
- Evidence from public data
- Capability-ambition gap analysis
- Comparable benchmark
- Engagement viability score

**Step 4: Save to Database**
Save output to `03_COMPANY_DATABASE/ASX_300/[sector]/[company].md`

---

## Framework Quick Reference

### The 9 Quadrants

```
                    ASSIST            AUGMENT           ADAPT
                   Execution         Execution        Execution
              ┌─────────────────┬────────────────┬──────────────────┐
   ADAPT      │   Traditional   │   Intelligent  │   Autonomous     │
  Customer    │   Proxy (Q7)    │   Proxy (Q8)   │   Orchestrator   │
              │                 │   Rio Tinto    │      (Q9)        │
              ├─────────────────┼────────────────┼──────────────────┤
  AUGMENT     │   Co-Creation   │   Dynamic      │   Adaptive       │
  Customer    │   Assistant     │   Curator (Q5) │   Partner (Q6)   │
              │     (Q4)        │   CBA, Westpac │                  │
              ├─────────────────┼────────────────┼──────────────────┤
  ASSIST      │   Basic         │   Smart        │   Intelligent    │
  Customer    │   Assistant     │   Assistant    │   Assistant      │
              │     (Q1)        │     (Q2)       │     (Q3)         │
              └─────────────────┴────────────────┴──────────────────┘
```

### Maturity Levels (1-5)

- **Level 1:** Ad hoc AI experiments
- **Level 2:** Systematic pilots
- **Level 3:** Scaled deployment
- **Level 4:** Strategic integration
- **Level 5:** AI-native business model

### Strategic Pathways

1. **Operational Excellence:** Q1 → Q2 → Q3 (horizontal)
2. **Expertise Scaling:** Q1 → Q5 → Q6 (diagonal) - Most common for enterprises
3. **Autonomous Intelligence:** Q1 → Q7 → Q9 (vertical then horizontal)

---

## Key Files

| File | Purpose |
|------|---------|
| `01_CORE_FRAMEWORK/double_aaa_framework.md` | Master framework documentation |
| `02_RESEARCH_ENGINE/prompts/company_research.md` | Perplexity research prompt template |
| `02_RESEARCH_ENGINE/prompts/aaa_assessment.md` | Quadrant positioning logic with transparency |
| `02_RESEARCH_ENGINE/prompts/strategic_brief.md` | Brief generation with logic audit trail |
| `02_RESEARCH_ENGINE/prompts/research_archaeology.md` | Full transparency documentation template |
| `03_COMPANY_DATABASE/ASX_300/index.md` | Master index of all company positions |
| `03_COMPANY_DATABASE/validated_cases/` | Deep-dive validated case studies |
| `06_METHODOLOGY/research_archaeology_methodology.md` | Standalone transparency methodology for agents |

---

## Transparency Standard: Research Archaeology

Every company analysis must include transparent decision documentation:

### Required Elements
1. **Source Chain**: All sources with credibility tier ratings
2. **Decision Logic Chains**: Alternatives considered and rejection rationale
3. **Assumption Register**: Explicit assumptions with confidence levels
4. **Limitation Acknowledgment**: Information gaps and uncertainty ranges
5. **Audit Trail**: Complete traceability from conclusion to evidence

### Source Credibility Tiers
| Tier | Source Type | Credibility |
|------|-------------|-------------|
| 1 | Company Filings (Annual Reports, ASX) | Highest |
| 2 | Executive Statements (CEO, CTO quotes) | Very High |
| 3 | Industry Research (Gartner, Forrester) | High |
| 4 | Quality Media (AFR, IT News) | Medium-High |
| 5 | General Media | Medium |

### Example: Westpac Research Archaeology
See `03_COMPANY_DATABASE/ASX_300/banking/westpac_research_archaeology.md` for a complete example of transparent research documentation

---

## Validated Cases (Reference)

| Company | Quadrant | Maturity | Notes |
|---------|----------|----------|-------|
| CBA | Q5→Q6 | 4.5 | #1 APAC, governance-first |
| Westpac | Q5 | 3.5-4.0 | Catching up, $2B/year investment |
| Rio Tinto | Q8 | 4.5 | Autonomous mining operations |
| Fortescue | Q8 | 4.0 | Autonomous fleet |

---

## Commands

**Activate Navigator:**
```
cd ~/Documents/Git/helix-business-model-navigator
```

**Research a Company:**
```
"Research [COMPANY] using the AAA framework and save to the database"
```

**Generate Index Report:**
```
"Generate the current ASX 300 index summary from the company database"
```

**Compare Companies:**
```
"Compare [COMPANY A] and [COMPANY B] positioning on the AAA matrix"
```

---

## Git Workflow

After each research session:
```bash
git add .
git commit -m "feat: Add [COMPANY] AAA analysis

Quadrant: Q[X] | Maturity: [X]/5 | Sector: [SECTOR]

Generated with Claude Code + Helix Business Model Navigator"
git push origin main
```

---

**Last Updated:** 2025-12-04
**Version:** 1.0
