# Prompt: Business Project Documentation (Online Scale-Up + Price Match)

Purpose: produce the single, definitive business document of this project. The new 1P Business Head is the first reader, and it should also serve as the permanent record for leadership, finance, buying and the tech team.

How to use: copy everything inside the fence into your AI assistant. Attach the app code, data, decks, emails and notes. Fill the `[ ]` fields where you can. Anything left blank is flagged as a gap, not invented.

```text
ROLE
You are a senior business analyst and technical writer. Document the project below as a business record that a commercial leader can read, trust, act on, and hand to others. Plain business language only; define any technical term in one line. The primary reader is a NEW 1P (first-party, own-inventory) Business Head with no prior context.

PROJECT
- Company / category: [company, category]
- Project name and one-line purpose: [name], an app/dashboard supporting (a) an ONLINE SCALE-UP PLAN and (b) a PRICE-MATCH strategy.
- Sponsor / owner / builder / contributors: [names and roles]
- Dates and current status: [start, milestones, live / pilot / prototype]
- Business goals and targets: [revenue, margin, share, conversion, CAC, etc.]
- Competitors and channels in scope: [list]
- Attached inputs (the ONLY source of truth): [code, datasets, decks, notes]

NON-NEGOTIABLE RULES
1. Never invent numbers, dates, owners, decisions or results. Missing = "[GAP: what, who likely has it]".
2. Tag every substantive claim FACT (in the inputs), ASSUMPTION, or HYPOTHESIS (untested).
3. State data provenance. If any data is synthetic, demo or survey-based, say so plainly, and state what it can and cannot prove. Never present it as real market evidence.
4. Every step or recommendation follows: What was done -> Why (business reason) -> Evidence -> Result -> Status -> Implication for the 1P head.
5. Separate BUILT and WORKING from PLANNED. Be candid about limits and weaknesses.
6. First output a short "Inputs Review": what you received, what you inferred, top gaps and questions. Then proceed on best available evidence.

DOCUMENT STRUCTURE (use these headings, in this order; open each with a one-line "Bottom line")
1. Document control: version, date, owner, audience, status, change log, confidentiality.
2. Executive Summary (one page, stands alone): problem, what was done, what was found, status, top 3 decisions needed, top 3 risks.
3. Business Case: problem and opportunity, why online scale-up, why price match, alternatives considered and why rejected, target outcomes, success metrics with exact definitions.
4. Scope: in scope, out of scope, deferred, and the reason for each boundary.
5. Solution Overview (plain English): each module or screen mapped to the business question it answers; inputs, outputs, how to read them, who uses them, limits. Include a simple end-to-end flow (data -> analysis -> decision).
6. Data & Method: sources, provenance, volume, quality caveats, privacy and licensing; what each model or analysis does in plain English, how well it performs, and what it must not be used for.
7. Decision & Action Log (table): # | Date | Step taken | Why | Evidence | Outcome | Status | Owner. Chronological, as granular as the inputs allow.
8. Online Scale-Up Plan: phases 0-30 / 30-90 / 90-180 days. Per phase: goal, actions, owner, KPIs, dependencies, stage-gate, rationale for sequencing. Cover assortment, pricing, inventory and supply, traffic and conversion, fulfilment and returns, loyalty/CRM, tech and data.
9. Price-Match Strategy: objectives; competitor set and why; SKUs/categories matched vs excluded; rules and guardrails (margin floor, MAP/vendor terms, stock, promo vs everyday price); data feed and refresh cadence; exception handling; governance; conversion gain vs margin dilution trade-off; conservative / base / aggressive scenarios with explicit assumptions.
10. Findings & Results: each with source, confidence (High/Med/Low) and "so what".
11. 1P Economics & Dependencies: margin and inventory risk, vendor funding of price match, buying and markdown impact, working capital, channel cannibalisation. Every figure tagged FACT or ASSUMPTION.
12. Risks, Assumptions, Issues & Dependencies (RAID): likelihood, impact, mitigation, owner.
13. Governance & Operating Model: who owns what, decision rights, review cadence, escalation path, how the tool is maintained and by whom.
14. Decisions Needed From You: option, recommendation, rationale, cost of delay, deadline.
15. Handover & First 30/60/90 Days: concrete asks, meetings, data to request, quick wins, what to stop or protect.
16. Appendix: glossary, metric definitions, data dictionary, source and file index, FAQ.

STYLE
- Direct, structured, no fluff. Short sentences. Tables for logs, plans, scenarios and RAID; bullets elsewhere.
- Put the "why" next to every "what".
- Length: as thorough as the inputs support, but the Executive Summary must stand alone.

FINAL CHECK (before output)
(a) List every figure or claim you could not trace to an input and confirm each is tagged GAP or ASSUMPTION.
(b) List the 5 questions the new Business Head will most likely ask, with answers or gaps.
(c) List the top 10 missing inputs, ranked by how much they would change the conclusions.
```

## Notes for whoever runs this

- **Gap found in the repo:** the code here (`app.py`, `chatbot.html`, `threadmine_survey_5000.csv`) is a **ThreadMine survey dashboard** testing three product ideas (AI StyleDNA quiz, circular storytelling marketplace, wardrobe swaps with loyalty) on **5,000 synthetic survey rows**. It contains **no price-match logic, competitor pricing data or scale-up plan**. Attach those materials, or those sections will show as `[GAP]`.
- The README labels the data "demo only". The prompt forces the document to say so, so nobody treats it as real consumer evidence.
- Ask the builder for a short list of why each choice was made. The "why" is rarely in code and the document depends on it most.
