# Research Archaeology Methodology v1.0

## A Standalone Framework for Transparent AI-Assisted Research

---

## OVERVIEW

**Research Archaeology** is a methodology for ensuring complete transparency, traceability, and accountability in AI-assisted research and decision-making. It documents every step of the research process, enabling any conclusion to be traced back through explicit logical steps to verifiable sources.

### Core Principles

1. **Complete Traceability**: Every conclusion can be traced back to evidence
2. **Decision Logic Chains**: Show alternatives considered and rejection rationale
3. **Source Validation**: All sources rated for credibility
4. **Assumption Transparency**: Explicit documentation of what was assumed
5. **Limitation Acknowledgment**: Honest about gaps and uncertainty
6. **Reproducibility**: Process can be replicated by others

### Applicability

This methodology can be applied to any AI-assisted research task, including:
- Company analysis and positioning
- Market research and competitive intelligence
- Strategic recommendations
- Due diligence and assessment
- Policy analysis
- Technology evaluation

---

## METHODOLOGY COMPONENTS

### Component 1: Research Trigger Documentation

Document the initiation of every research task:

```
RESEARCH INITIATED:
├── Subject: [What is being researched]
├── Date: [YYYY-MM-DD HH:MM]
├── Research Method: [Tools and techniques used]
├── Research Depth: [Comprehensive/Focused/Quick]
├── Framework: [Assessment framework being applied]
├── Context: [Why this research is happening]
└── Target Output: [Expected deliverable]
```

**Why This Matters**: Establishes context and enables understanding of research scope and constraints.

---

### Component 2: Raw Research Capture

Document the exact queries and raw outputs:

```
RESEARCH EXECUTED:
├── Query/Prompt: "[Exact text used]"
├── Tool: [Research tool used]
├── Timestamp: [ISO timestamp]
├── Sources Retrieved: [Number]
└── Research Duration: [Time taken]

RAW FINDINGS:
├── Finding 1: [Exact finding with source]
├── Finding 2: [Exact finding with source]
└── ...
```

**Why This Matters**: Enables verification of what information was actually gathered and when.

---

### Component 3: Source Chain Documentation

Rate and document every source used:

#### Source Credibility Tiers

| Tier | Source Type | Credibility | Examples |
|------|-------------|-------------|----------|
| 1 | Primary/Official | Highest | Company filings, official records, peer-reviewed research |
| 2 | Direct Authority | Very High | Executive statements, official interviews, expert testimony |
| 3 | Industry Analysis | High | Major analyst reports, industry research firms |
| 4 | Quality Secondary | Medium-High | Quality journalism, professional publications |
| 5 | General Secondary | Medium | General news, industry blogs |
| 6 | Informal | Lower | Social media, opinion pieces, unverified claims |

#### Source Documentation Template

```
SOURCE CHAIN:

PRIMARY SOURCES (Tier 1-2):
├── [SOURCE NAME]
│   ├── Type: [Category]
│   ├── Date: [Publication date]
│   ├── URL/Reference: [If available]
│   ├── Key Finding: [What this source contributes]
│   ├── Credibility: Tier [X]
│   └── Limitation: [Any caveats]
...

SUPPORTING SOURCES (Tier 3-4):
├── [SOURCE NAME]
│   └── [Same structure]
...

SOURCE QUALITY ASSESSMENT:
├── Tier 1-2 Sources: [Count]
├── Tier 3-4 Sources: [Count]
├── Source Diversity: [High/Medium/Low]
├── Recency: [All recent/Some dated/Mostly dated]
└── Overall Credibility: [Very High/High/Medium/Low]
```

**Why This Matters**: Enables assessment of evidence quality and identification of weak foundations.

---

### Component 4: Decision Logic Chains

For every significant decision, document the logic:

```
DECISION: [What was decided]

OPTION A: [First option considered]
├── Definition: [What this option means]
├── Evidence For: [Supporting evidence]
│   └── Strength: [Strong/Moderate/Weak/None]
├── Evidence Against: [Contradicting evidence]
│   └── Strength: [Strong/Moderate/Weak/None]
└── Assessment: [SELECTED/REJECTED] - [Rationale]

OPTION B: [Second option considered]
├── [Same structure]
└── Assessment: [SELECTED/REJECTED] - [Rationale]

OPTION C: [Third option if applicable]
├── [Same structure]
└── Assessment: [SELECTED/REJECTED] - [Rationale]

FINAL DETERMINATION:
├── SELECTED: [Option chosen]
├── REJECTED: [Options rejected with key reasons]
├── Key Evidence: [Primary evidence driving decision]
├── CONFIDENCE: [X]%
└── Uncertainty: [What could change this decision]
```

**Why This Matters**: Shows that alternatives were considered, prevents confirmation bias, enables challenge.

---

### Component 5: Assumption Register

Document every assumption made during analysis:

```
ASSUMPTION REGISTER:

| # | Assumption | Evidence Base | Confidence | Validation Method | Risk if Wrong |
|---|------------|---------------|------------|-------------------|---------------|
| 1 | [Statement] | [Source] | [H/M/L] | [How validated] | [Impact] |
| 2 | [Statement] | [Source] | [H/M/L] | [How validated] | [Impact] |
...

ASSUMPTION CATEGORIES:

HIGH CONFIDENCE (80%+):
├── [Assumption 1]: Based on [Tier 1-2 source]
├── [Assumption 2]: Based on [multiple sources]
...

MEDIUM CONFIDENCE (50-80%):
├── [Assumption 3]: Based on [Tier 3-4 source]
├── [Assumption 4]: Inferred from [pattern]
...

LOWER CONFIDENCE (<50%):
├── [Assumption 5]: Limited evidence
├── [Assumption 6]: Single source only
...
```

**Why This Matters**: Makes implicit assumptions explicit, enables targeted validation, identifies risk areas.

---

### Component 6: Limitation Acknowledgment

Honestly document what you don't know:

```
LIMITATIONS:

INFORMATION GAPS:
├── [Gap 1]: [What couldn't be found/verified]
│   └── Impact: [How this affects the analysis]
├── [Gap 2]: [What couldn't be found/verified]
│   └── Impact: [How this affects the analysis]
...

METHODOLOGICAL LIMITATIONS:
├── [Limitation 1]: [E.g., "Public information only"]
├── [Limitation 2]: [E.g., "Point-in-time analysis"]
├── [Limitation 3]: [E.g., "Single researcher perspective"]
...

UNCERTAINTY RANGES:
├── Primary Conclusion: [X]
├── Possible Range: [Y] to [Z]
├── Key Uncertainty Factor: [What drives the uncertainty]
└── Trigger for Reassessment: [What would change the conclusion]
```

**Why This Matters**: Prevents overconfidence, enables appropriate use of findings, builds trust.

---

### Component 7: Comparative Validation

When applicable, validate against reference cases:

```
COMPARATIVE VALIDATION:

REFERENCE CASE: [Comparison subject]

COMPARISON ANALYSIS:
├── Similarities:
│   ├── [Similarity 1]: [Evidence]
│   ├── [Similarity 2]: [Evidence]
│   └── Implication: [What this supports]
├── Differences:
│   ├── [Difference 1]: [Evidence]
│   ├── [Difference 2]: [Evidence]
│   └── Implication: [What this explains]
└── Validation Conclusion: [Does comparison support findings?]
```

**Why This Matters**: Provides external validation, builds pattern recognition, identifies anomalies.

---

### Component 8: Quality Assessment

Self-assess the research quality:

```
RESEARCH QUALITY SCORECARD:

Source Quality: [X]/20
├── Tier 1-2 sources: [Count]
├── Source diversity: [Assessment]
└── Recency: [Assessment]

Evidence Strength: [X]/20
├── Direct evidence points: [Count]
├── Quantitative data: [Available/Partial/Missing]
└── Primary sources: [Count]

Logic Rigor: [X]/20
├── Decision chain complete: [Yes/Partial/No]
├── Alternatives documented: [Yes/Partial/No]
├── Assumptions explicit: [Yes/Partial/No]
└── Limitations acknowledged: [Yes/Partial/No]

Reproducibility: [X]/20
├── Sources verifiable: [Yes/Most/Some]
├── Process documented: [Yes/Partial/No]
└── Reasoning transparent: [Yes/Partial/No]

Confidence Calibration: [X]/20
├── Uncertainty acknowledged: [Yes/Partial/No]
├── Ranges provided: [Yes/Partial/No]
└── Caveats noted: [Yes/Partial/No]

OVERALL QUALITY: [X]/100
├── 90+: Excellent - Publication ready
├── 80-89: Good - Minor gaps only
├── 70-79: Adequate - Some limitations
├── 60-69: Fair - Significant gaps
└── <60: Poor - Major revision needed
```

**Why This Matters**: Enables quality control, identifies improvement areas, sets expectations.

---

### Component 9: Audit Trail

Create a complete audit trail:

```
AUDIT TRAIL:

Research Initiated: [Timestamp]
├── Research Query Executed: [Timestamp]
├── Raw Data Collected: [Timestamp]
├── Evidence Compiled: [Timestamp]
├── [Decision 1] Assessed: [Timestamp] → [Result] ([Confidence]%)
├── [Decision 2] Assessed: [Timestamp] → [Result] ([Confidence]%)
├── [Decision N] Assessed: [Timestamp] → [Result] ([Confidence]%)
├── Assumptions Documented: [Timestamp] → [Count] assumptions
├── Limitations Noted: [Timestamp]
├── Comparison Validated: [Timestamp] → [Result]
├── Quality Assessed: [Timestamp] → [Score]/100
└── Output Generated: [Timestamp]

TRACEABILITY CONFIRMATION:
├── Every conclusion traceable to evidence: [Yes/No]
├── All sources documented with credibility: [Yes/No]
├── Alternative interpretations considered: [Yes/No]
├── Assumptions explicitly stated: [Yes/No]
├── Limitations acknowledged: [Yes/No]
└── Reproducible process: [Yes/No]
```

**Why This Matters**: Provides complete traceability, enables verification, supports auditing.

---

## IMPLEMENTATION GUIDE

### For AI Agents

When implementing this methodology in an AI agent:

1. **Create Templates**: Embed the templates from each component into your agent's prompt or memory
2. **Enforce Structure**: Require structured output for each research task
3. **Source Tracking**: Track every source used during research with credibility rating
4. **Decision Documentation**: For every decision, document alternatives considered
5. **Self-Assessment**: Include quality self-assessment in every output
6. **Audit Trail**: Maintain timestamps and logical flow

### Integration Points

```
AGENT INTEGRATION TEMPLATE:

After Research:
├── Execute research using available tools
├── Capture raw findings with sources
└── Rate each source for credibility

After Analysis:
├── Document decision logic for each conclusion
├── List alternatives considered and rejected
├── State assumptions explicitly
└── Acknowledge limitations

Before Output:
├── Complete quality self-assessment
├── Generate audit trail
├── Confirm traceability
└── Include transparency appendix
```

### Minimum Requirements

For a research task to meet this methodology:

| Requirement | Minimum Standard |
|-------------|------------------|
| Sources | At least 2 Tier 1-2 sources for major conclusions |
| Decision Logic | All significant decisions show alternatives |
| Assumptions | All assumptions explicitly stated |
| Limitations | Information gaps acknowledged |
| Quality Score | Minimum 60/100 for release |
| Traceability | All conclusions traceable |

---

## APPLYING TO DIFFERENT DOMAINS

### Company/Market Analysis
- Use financial filings as Tier 1 sources
- Executive statements as Tier 2
- Analyst reports as Tier 3
- Focus on capability-ambition gaps

### Technology Evaluation
- Use official documentation as Tier 1
- Technical benchmarks as Tier 2
- Industry reviews as Tier 3
- Focus on capability maturity assessment

### Policy/Strategy Analysis
- Use official policy documents as Tier 1
- Official statements as Tier 2
- Think tank research as Tier 3
- Focus on impact assessment

### Due Diligence
- Use legal filings as Tier 1
- Financial audits as Tier 2
- Industry references as Tier 3
- Focus on risk identification

---

## QUALITY STANDARDS

### Research Archaeology Quality Levels

| Level | Score | Description | Use Case |
|-------|-------|-------------|----------|
| Publication Ready | 90+ | Complete documentation, all sources verified | External reports, client deliverables |
| Professional | 80-89 | Thorough documentation, minor gaps | Internal strategy, working documents |
| Adequate | 70-79 | Core documentation complete | Initial assessments, quick analysis |
| Draft | 60-69 | Basic documentation | Early-stage exploration |
| Insufficient | <60 | Incomplete documentation | Not for decision-making |

### Audit Readiness

A research output is audit-ready when:
- [ ] All conclusions trace to documented evidence
- [ ] All sources have credibility ratings
- [ ] All significant decisions show alternatives considered
- [ ] All assumptions are explicitly stated
- [ ] All limitations are acknowledged
- [ ] Quality score meets minimum threshold
- [ ] Complete audit trail exists

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-04 | Initial methodology based on Mitcham Council transparency framework and Helix research archaeology system |

---

## ATTRIBUTION

This methodology synthesizes approaches from:
- **Mitcham Council AI Strategy Transparency Framework**: Decision pathway mapping, assumption registers, logic audit trails
- **Helix Research Archaeology System**: Step-by-step research documentation, source chain validation, competitive baseline analysis
- **Academic Research Standards**: Source credibility frameworks, reproducibility requirements

---

*This methodology enables AI agents to produce research that is transparent, traceable, and trustworthy.*

*Research Archaeology Methodology v1.0*
*Helix Business Model Navigator*
