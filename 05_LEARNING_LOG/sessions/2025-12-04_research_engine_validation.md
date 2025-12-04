# Session: Research Engine Validation

**Date:** 2025-12-04
**Duration:** ~1 hour
**Focus:** Validate Claude Code + MCP tools for AAA company research at scale

---

## Key Outcomes

### 1. Research Swarm vs Claude Code Comparison

Tested both approaches on Westpac Bank research:

| Dimension | Claude Code + Perplexity | Research Swarm |
|-----------|--------------------------|----------------|
| Time to Data | ~45 seconds | Still in Phase 1 (15+ min) |
| Actual Results | 10,000+ word report, 60 citations | Placeholders only |
| Actionable Output | Complete AAA brief | Methodology template |
| Complexity | Simple, single tool call | Multi-phase workflow |

**Verdict:** Claude Code + Perplexity MCP wins for this use case. Simpler, faster, immediately actionable.

### 2. Validated Workflow

```
Step 1: perplexity_research (45 sec)
   → Deep company research with citations

Step 2: Claude analysis (2 min)
   → Apply AAA framework
   → Determine quadrant (Q1-Q9)
   → Assess maturity level (1-5)

Step 3: Brief generation (1 min)
   → Strategic positioning brief
   → Capability-ambition gap analysis
   → Engagement viability score

Step 4: Human review (1-2 min)
   → Validate positioning
   → Adjust based on domain knowledge

Total: 4-5 minutes per company
```

### 3. Westpac Research Completed

- **Quadrant:** Q5 (Dynamic Curator)
- **Maturity:** 3.5-4.0/5
- **Key Finding:** Investing $2B/year, closing gap with CBA
- **Engagement Viability:** 24/25 (Very High)

### 4. Repository Created

Created "helix-business-model-navigator" with:
- Core framework migrated from helix-mind
- Research prompt templates
- Company database structure
- Session logging

---

## Strategic Vision Captured

The user shared a comprehensive vision for scaling:

### Product Stack
- **Tier 1:** Co-Intelligence Index (free → $997/year)
- **Tier 2:** AAA Diagnostic ($5K → $25K)
- **Tier 3:** Strategic Advisory ($100K → $500K)

### Geographic Expansion
- **Year 1 (2026):** ASX 300 complete
- **Year 2 (2027):** S&P 500
- **Year 3 (2028):** FTSE, DAX, Nikkei (1,500+ companies)

### Competitive Moat
- First-mover data advantage
- Public company focus (verifiable)
- AI-assisted methodology (50 companies in time competitors do 5)
- Geographic expansion creates multi-market moats

---

## Decisions Made

1. **New fresh repo** - "helix-business-model-navigator" (not building on helix-aaa-research)
2. **Claude Code + Perplexity** - Primary research tool (not Research Swarm)
3. **Big 4 Banks first** - Complete banking sector before expanding
4. **Full MCP permissions** - Perplexity, browser, fetch pre-approved

---

## Next Actions

- [x] Create repository structure
- [x] Migrate core framework
- [x] Create prompt templates
- [x] Complete Westpac analysis
- [ ] Research ANZ Bank
- [ ] Research NAB Bank
- [ ] Commit initial structure to git

---

## Patterns Discovered

### Perplexity Research Effectiveness
- Deep research mode returns comprehensive data
- 60+ citations in a single call
- Specific numbers, dates, executive quotes
- Ideal for public company research

### AAA Framework Application
- Q5 (Dynamic Curator) is the "sweet spot" for Australian enterprises
- Governance maturity is key differentiator (CBA pattern)
- Capability-ambition gap is common and actionable

---

*Session captured by Helix Business Model Navigator*
