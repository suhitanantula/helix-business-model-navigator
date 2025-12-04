# Company Research Prompt Template

## For Perplexity Deep Research

Use `mcp__MCP_DOCKER__perplexity_research` with this prompt structure:

---

### Standard Research Prompt

```
Research [COMPANY NAME] ([EXCHANGE]: [TICKER]) AI strategy and digital transformation for 2024-2025.

I need:

1. **AI Investment** - Digital transformation budget, AI-specific investments, technology spending as % of revenue

2. **Key AI Initiatives** - Major platforms, tools, or systems deployed (e.g., customer AI assistants, automation platforms, data layers)

3. **Partnerships** - Technology partners (Microsoft, AWS, Google, Accenture, specialized AI vendors)

4. **Leadership Statements** - CEO, CTO, CDO quotes on AI strategy from earnings calls, media, or conferences

5. **Specific AI Use Cases** - Customer-facing AI (chatbots, personalization), operational AI (fraud detection, automation), strategic AI (decision support)

6. **Competitive Comparison** - How does their AI maturity compare to sector leaders?

7. **Governance** - Responsible AI frameworks, ethics committees, AI risk management

8. **Recent Announcements** - ASX/SEC filings, press releases, media coverage about AI initiatives

Provide specific numbers, dates, and sources where possible.
```

---

### Sector-Specific Variations

#### Banking/Financial Services
Add:
- "Comparison to Commonwealth Bank of Australia (CBA) AI positioning"
- "APRA/regulatory AI requirements and compliance"
- "Fraud detection and scam prevention AI capabilities"

#### Mining/Resources
Add:
- "Autonomous operations (vehicles, equipment, mining processes)"
- "Comparison to Rio Tinto and Fortescue autonomous capabilities"
- "Safety and environmental AI applications"

#### Retail
Add:
- "Customer personalization and recommendation AI"
- "Supply chain and inventory optimization"
- "Comparison to Woolworths data/AI capabilities (Quantium)"

#### Telecommunications
Add:
- "Network automation and self-healing capabilities"
- "Customer service AI and chatbot deployment"
- "5G and edge computing AI applications"

---

### Output Processing

After receiving Perplexity results, extract:

1. **Investment Scale** - Total $ and % of revenue
2. **Key Platforms** - Named AI systems/tools
3. **Partnerships** - Vendor relationships
4. **Leadership Quotes** - Direct statements
5. **Use Cases** - Categorized by customer/operational/strategic
6. **Governance** - Framework maturity indicators
7. **Competitive Position** - vs sector leaders

Save raw research to: `03_COMPANY_DATABASE/raw_research/[company]_raw.md`
