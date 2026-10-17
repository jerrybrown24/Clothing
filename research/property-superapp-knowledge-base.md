# UAE Property Superapp: Concept Knowledge Base

**Version:** 1.1 · **Knowledge date:** 17 October 2026 (market data through H1 2026) · **Region:** United Arab Emirates (Dubai first, Abu Dhabi second)
**Purpose:** A single, self-contained reference on a startup concept, written so another language model can be trained or prompted on it. It covers the idea and how it evolved, the problem, the market, how UAE property transactions actually work, the regulation that shapes the business, the business model, competitors, the execution plan, the validation survey, the fundraising pitch, risks, a glossary and worked Q&A.

---

## 0. How to read and use this document

### 0.1 Confidence tags
Every non-trivial fact carries one of these tags. A model using this document must keep the tag in mind when it answers.

| Tag | Meaning | How to speak about it |
|---|---|---|
| **[V]** | Verified: from a government body, regulator, company announcement, or established news outlet | State it plainly, name the source, give the date |
| **[B]** | Indicative: from a brokerage, law-firm or startup blog; may be promotional or out of date | Say "according to industry sources" and avoid precise claims |
| **[E]** | Our estimate: calculated by the founders' research from [V] inputs and typical rates | Say "we estimate" and show the method if asked |
| **[A]** | Planning assumption or placeholder input, to be replaced by a quote, contract or real result | Say "assumed for planning" |
| **[U]** | Unverified or conflicting across sources; must be confirmed before use | Say "sources differ; confirm with DLD, RERA or a lawyer" |

### 0.2 Rules for any model answering from this document
1. **Not legal, tax or investment advice.** UAE property fees and rules change often. For any specific transaction, tell the user to confirm with the Dubai Land Department (DLD), RERA, ADREC (Abu Dhabi) or a UAE-qualified lawyer.
2. **Never invent a statistic, quote, partner name, survey result or pilot result.** Several figures in this concept are intentionally blank placeholders (written `[__]`) because the survey and pilot have not run yet.
3. **Separate the concept from the market facts.** The concept (a "property superapp") is a proposal. The market, fee and regulation facts describe the real UAE environment.
4. **Keep the compliance position.** In Dubai, brokering (selling, negotiating, closing) requires a RERA broker registration. Do not describe unlicensed people closing deals for fees as lawful. See section 6.4.
5. **"Buy Now" does not mean instant ownership.** It means *reserve now* with a checkout that routes payment to the legally required account. See section 6.5.
6. **Date-stamp answers** about fees, thresholds and rules, e.g. "as of late 2026".
7. Numbers in AED unless stated. **USD 1 = AED 3.6725** (fixed peg).

### 0.3 One-paragraph summary
The concept is a licensed real-estate brokerage with an app on top. It gives buyers, investors and renters in the UAE verified listings, independent data and insights, 3D views of the exact unit, an online reserve-and-pay flow, and then handles documents, DLD registrations and payment reminders. After purchase it offers interior design, furniture and property management. A referral network brings in demand. The company stays asset-light: it never holds customer money (payments go to developer escrow or the trustee centre) and never buys property itself. Revenue comes mainly from developer commissions (3 to 7% on off-plan), a 2% buyer fee on resale, a 5% fee on rentals, and secondary streams such as mortgage referrals and design or furniture partnerships. A 13-week pilot after licensing is the evidence investors need before a pre-seed raise.

---

## 1. The concept

### 1.1 Origin and how the idea evolved
1. **Starting idea:** an "Amazon for properties". Take what Bayut, dubizzle and Property Finder do (listings and search), then add a **Buy Now button** where a customer pays the company, and the company "takes care of everything": DLD registration and dealing with developers such as Emaar and Danube. The founder doubted any direct competitor existed.
2. **Expanded idea:** an app giving data and insights to people who buy or invest in UAE property; a **3D view of the exact apartment** being bought; **virtual home design**, furniture shopping and **interior designers**; help with **all documents and registrations**; **reminders for future payments**; and a model where the company is the brokerage and **any resident can generate leads and close deals for referral fees without a RERA licence**.
3. **Decision after analysis:** first **open a RERA-licensed brokerage**, then build a phased roadmap with a **pilot in 2 to 3 months**, build a pitch deck, and run a **survey** to prove the problem is real. The resident referral model was kept only as a conditional track pending a legal opinion (section 6.4).

### 1.2 What it is and is not
| It is | It is not |
|---|---|
| A licensed brokerage plus app that guides and tracks the whole journey | A portal that only sells ads to brokers |
| A checkout that routes payment to developer escrow or the trustee | A company that holds customers' money in its own account |
| Free to the buyer on off-plan (developer pays commission) | An iBuyer that buys homes onto its balance sheet |
| Focused first on overseas buyers of off-plan units | A mass-market app for every property type on day one |
| Compliant with RERA, AML and data rules | A route for unlicensed people to broker deals |

### 1.3 Core promise (customer-facing)
"One app and one accountable licensed company, from first search to keys."

### 1.4 Customer journey in eight stages
Discover, Verify, Transact, Finance, Register, Move in, Own and earn, then Sell or re-let (which feeds new listings back into Discover).

---

## 2. The problem

### 2.1 Pain points (to be proven by survey)
1. **Trust in information.** Listings already sold or rented, photos or descriptions that do not match, "verified" tags that verify little.
2. **Hidden costs and steps.** The 4% DLD fee, trustee fee, service charges, mortgage fees and a long document trail appear late.
3. **Nobody tracks the customer after signing.** Instalments, registrations and deadlines live in spreadsheets, emails or an agent's memory.
4. **Off-plan delivery risk.** Handover delays, snagging disputes, higher-than-expected service charges.
5. **Fragmentation.** Portal, agent, developer, bank, trustee centre, DLD, DEWA: each is a separate counter.
6. **Rental friction.** Several post-dated cheques, deposits slow to be returned, Ejari and DEWA steps, disputes over renewals and rent increases.

### 2.2 Evidence from outside sources
| Evidence | Source type |
|---|---|
| About 3,800 property-related complaints to RERA in 2025, roughly 400 involving suspected fraud | [B] industry reports |
| 40 to 50% of Dubai off-plan projects see handover delays; one study says more than half are delayed 6 months to 2 years; top-tier developers deliver on time 80 to 90% of the time | [B] Real Estate Club Dubai |
| Fitch: of 174,000 units projected for delivery 2022 to 2024, only 97,000 were delivered (56% completion rate) | [V] Fitch Ratings via press |
| Buyers should budget 7 to 10% above the purchase price for transaction costs | [B] brokerage guides |
| Upfront transaction costs cannot be financed by banks; they are paid in cash | [B] |
| Rental disputes: filing at the Rental Dispute Centre costs 3.5% of annual rent (min AED 500, max AED 30,000) plus about AED 320 admin | [V] press and DLD-related guidance |
| Portals urged to crack down on misleading "verified" listings | [V] Gulf News |
| DLD directive: unavailable properties must be removed within 3 working days; agents posting fake listings face fines and licence action | [V] |

### 2.3 Themes seen on Reddit and in press (qualitative)
Source threads were in r/dubai, r/dubairealestate, r/DubaiCentral and r/dubairentals. Only search-result excerpts were read, so treat these as themes, not statistics.
- **Buying:** deposits lost or stalled when a deal fails and the agent stops answering; sellers' agents who are unresponsive or rude; agents insisting to cancel the contract and "do it manually" at the trustee; confusion over whether buyer and seller can do the MOU without a broker; hidden fees, inconsistent developer quality, service charges the developer or agent "missed" telling investors; regret after handover delays of over a year with service charges exceeding rental income.
- **Renting:** bait listings ("already rented"); landlords insisting on 1 to 4 cheques; deposits not returned for months; landlord refusing keys after cheques are given; landlord disconnecting DEWA during a dispute; renewal disputes running for months; landlord selling the unit near the end of tenancy.
- **Off-plan owners:** stress about continuing instalments in a softer market; delays; resale-by-assignment rules unclear.

---

## 3. Customers and segments

| Segment | Description | Priority |
|---|---|---|
| **Overseas investor (beachhead)** | Buys off-plan from abroad, budget about AED 1 to 3m, cannot visit easily, relies on portals, WhatsApp and friends. Origins by share of foreign investment: India 20%, UK 12%, Pakistan 10%, Russia 9%, China 8% [B] | First |
| UAE first-time buyer | Resident buying ready or off-plan, often mortgaged | Second |
| UAE renter | 513,000 new Dubai leases in 2025 [V] | Second (frequent-use wedge) |
| Property owner or landlord | Lists, rents, sells; needs management | Supply side |
| Referral partner | Licensed agent, overseas realtor (DIPC), resident introducer (conditional) | Growth engine |
| Developer | Pays commission, wants distribution | Supply side |

Foreign buyers account for roughly **85 to 88% of Dubai property transactions by number** [B]. Dubai had **129,400 new property investors in 2025**, of which residents were 23% [V, DLD via press].

---

## 4. UAE market background

### 4.1 Dubai
| Metric | Value | Tag |
|---|---|---|
| Total real estate transactions 2025 | AED 917bn, up 20% year on year, about 270,000 transactions, a record | [V] (a second report gives AED 919bn vs AED 760.7bn in 2024) |
| Property sales value 2025 | AED 682.5bn to AED 686.8bn depending on source | [V]/[U] |
| Real estate investment 2025 | AED 680bn, up 29% | [V] |
| H1 2025 total transactions | AED 431bn vs AED 345bn in H1 2024 (+25%) | [V] |
| 2025 off-plan | 132,000 transactions worth AED 286bn (average about AED 2.17m) | [B]/[E] average |
| 2025 secondary (resale) | 71,000 transactions worth AED 262bn (average about AED 3.69m) | [B]/[E] average |
| Financing split 2025 | 52% of transactions mortgage-backed by count vs 48% cash; mortgages about 25% of sales value (about AED 179bn) | [B] |
| Ready-home purchases financed by mortgage | 61% in 2025, up from 44% in 2023 | [B] |
| H1 2026 total transactions | AED 419.94bn across 112,850 transactions | [V] |
| H1 2026 property sales | AED 286.43bn across 86,005 sales; ready AED 146.7bn (about 27,200); off-plan AED 139.8bn (about 58,800) | [V] |
| H1 2026 mortgages | More than AED 102bn across more than 22,000 transactions | [V] |
| Q1 2026 total transactions | AED 252bn, up 31% year on year | [V] |
| Rental contracts (Ejari) 2025 | 1.38m contracts (+6%), value AED 126.4bn (+17%); new 513,000 (+10%), renewals 514,000 (+3%) | [V] |
| Strategy | Dubai Real Estate Sector Strategy 2033: AED 1 trillion in annual transactions; tokenised property AED 60bn (7% of market) by 2033 | [V] |

Note: in H1 2026 ready-property sales value (AED 146.7bn) overtook off-plan (AED 139.8bn) in value.

### 4.2 Abu Dhabi (ADREC)
| Metric | Value | Tag |
|---|---|---|
| Total transactions 2025 | AED 142bn from 42,814 transactions (+44% value, +52% volume) | [V] |
| Sales and purchases | AED 99.4bn from 25,604 transactions | [V] |
| Mortgages | AED 42.7bn from 17,210 transactions | [V] |
| Foreign direct investment in real estate | AED 8.2bn (+13%), 100+ nationalities | [V] |

### 4.3 Supply and price risk
- **Fitch Ratings** expected a moderate correction in H2 2025 and 2026, **not more than 15%**, with banks and developers able to absorb it [V].
- More than **250,000 units** were scheduled to be delivered 2023 to 2026, with **2026 completions peaking near 120,000 (about four times 2024)**; supply stock could grow about 16% a year in 2025 to 2027 against about 5% population growth [V]. Actual delivery often lags (56% completion rate 2022 to 2024).
- Implication: off-plan launches and developer commissions are cyclical. A business reliant only on off-plan is exposed; resale and rentals diversify it.

### 4.4 The digital rails that make this idea newly possible
- **DLD Digital Sale** on the DubaiNow app, launched at GITEX in October 2025. Buyers and sellers sign and register the sale contract online with UAE Pass e-signature; an electronic title deed is issued once payment is confirmed. **Eligibility is narrow:** both parties need an Emirates ID and active UAE Pass; the unit must be freehold (residential unit, commercial unit or residential townhouse); mortgage-free; single owner; and both parties need a UAE bank account. It is primarily for cash deals. [V]
- **ADREC Digital Buy & Sell Journey** (Abu Dhabi), launched 13 October 2025 with TAMM and UAE Pass: mortgage release, registration, trustee verification (including by video), digital signing and ADREC-owned escrow settlement, usable from abroad. [V]
- Result: fully online transfer is legally possible for some transactions, but most overseas, mortgaged and off-plan buyers still need help. That gap is the opportunity.

---

## 5. How UAE property transactions work

### 5.1 Actors and institutions
| Actor | Role |
|---|---|
| **DLD** (Dubai Land Department) | Registers property, collects fees, runs Oqood, Ejari, DubaiNow, Dubai REST |
| **RERA** (Real Estate Regulatory Agency, part of DLD) | Licenses brokers and developers, supervises escrow, advertising permits (Trakheesi), disputes |
| **DET** (Department of Economy and Tourism, Dubai) | Issues trade licences (including real estate brokerage) and holiday home permits |
| **ADREC** (Abu Dhabi Real Estate Centre) | Abu Dhabi equivalent of DLD |
| **Developer** | Builds and sells off-plan (Emaar, DAMAC, Sobha, Nakheel, Danube and others) |
| **Escrow agent** | DLD-accredited bank holding off-plan buyer money for each project |
| **Trustee centre** (Real Estate Registration Trustee) | Licensed centre where ready-property transfers and registrations are completed |
| **Bank** | Mortgage lender, also escrow agent |
| **Broker and agent** | Hold a RERA broker registration number (BRN); work under a licensed brokerage |
| **MoET** (Ministry of Economy and Tourism) | Supervises real estate brokers for anti-money-laundering as DNFBPs |
| **UAE FIU** | Receives suspicious transaction reports through goAML |
| **DEWA** | Dubai electricity and water; connection requires an Ejari number for rentals |
| **Rental Dispute Centre (RDC)** | Resolves tenancy disputes |

### 5.2 Off-plan purchase (buying from a developer)
**Developer prerequisites** [V]: register the project with DLD and RERA; open a separate **escrow account** at a DLD-accredited bank under **Dubai Law No. 8 of 2007**; before selling, satisfy one of: (a) 20% of construction completed, then RERA no-objection to sell; (b) deposit 20% of construction value in the escrow account; or (c) bank guarantee to RERA for 20% of construction value. Buyer payments go **only** into the project escrow account; funds are released against engineer-certified construction progress; **5% of the escrow is retained for one year after units are registered** as a defects guarantee; escrow funds are protected from the developer's creditors. [V]

**Buyer steps:**
1. Choose project and unit; verify RERA project number, escrow account number and project status on Dubai REST.
2. KYC and source of funds.
3. **EOI or booking:** commonly 5 to 10% of price, paid into escrow. [B]
4. **SPA (Sale and Purchase Agreement)** signed, typically 2 to 4 weeks after booking. [B]
5. Down payment plus **4% DLD fee** (some developers waive or share). [B]
6. **Oqood** registration (interim registration of an off-plan sale) by the developer; buyer receives an Oqood certificate. [B]
7. **Instalments** into escrow under the payment plan: construction-linked, time-linked, or post-handover (extending 2 to 5 years after keys). [B]
8. Completion notice, final payment (cash or handover mortgage), **inspection and snagging** (the snagging window is commonly 30 calendar days from notification [B]), handover, DEWA, title deed (Oqood converts to a title deed).

**Off-plan mortgage:** Central Bank of the UAE caps loan-to-value at **50%** for off-plan, for nationals and expatriates alike; once a completion certificate is issued the unit becomes "ready" and higher LTV (up to 80% for expat first homes under AED 5m) can apply. [V]

**Assignment (resale before handover):** typically allowed after a paid threshold (commonly **30 to 40%** of price), with a **developer NOC** (fee about AED 5,000 to 15,000), a developer assignment fee (about 1 to 2% of resale price) and 4% DLD fee on the resale price; the new buyer takes over the remaining payment plan. [B]

**Commission:** developers pay brokers **3 to 7%** of price; Tier-1 (Emaar, Nakheel) base about 3 to 4%, Tier-2 (Sobha, DAMAC) base about 4 to 5%, higher during launches. The buyer pays no agency fee; the commission is built into the price. [B]

### 5.3 Ready (resale) purchase
**Documents:** Form A (seller and broker agreement), Form B (buyer and broker agreement), Form I (between two brokers), **Form F** (the MOU, the standard preliminary contract on the DLD system, legally binding once signed). [B]

**Steps:**
1. Pre-approval if financing (free; 3 to 7 business days; valid 60 to 90 days). [B]
2. Search verified listings (Trakheesi permit and Madmoun QR). Check title on Dubai REST, service-charge arrears, tenancy status, modifications.
3. Offer and negotiation.
4. Sign Form A and B (and I if two brokers); **sign Form F**. The buyer usually gives a **10% security deposit by manager's cheque**, held by the broker, deducted at completion and not cashed. [B] A **valuation opt-out clause** protects mortgage buyers if the bank values the home below the price. [B]
5. Seller obtains the **developer NOC** (confirms service charges are paid; fee about AED 500 to 5,000). [B]
6. If the seller has a mortgage: bank liability letter; the loan is paid off at transfer so the title is released.
7. If the buyer has a mortgage: bank valuation (about AED 2,500 to 3,500 + VAT), final offer letter, insurance. [B]
8. **Transfer day** at a trustee centre (or DubaiNow Digital Sale if eligible): manager's cheques to the seller (and seller's bank), DLD fee, trustee fee, agency fee; title deed issued in the buyer's name (mortgage registered on the deed if financed).
9. Keys, DEWA transfer, service-charge account, move-in permit.

**Loan-to-value (LTV) caps for expats, first home** [B]: up to **80%** for property under AED 5m, **70%** above AED 5m; off-plan 50% [V]; maximum tenor 25 years; borrower age at final instalment up to 65 for expats [V].

### 5.4 Rental (tenant journey)
1. Search; viewing; offer (rent, number of cheques, start date).
2. Sign the tenancy contract; pay **security deposit (5% of annual rent unfurnished, 10% furnished)**, **agency fee (5% of annual rent + VAT)** and the first cheque. Rent is usually paid by **post-dated cheques (1 to 12)**. [B]
3. **Ejari** registration (mandatory, via DLD) with tenant passport, visa and Emirates ID, landlord title deed, and the unit's DEWA premise number. From 2026, renewals must be registered every year and landlords must declare property modifications, checked against Dubai Municipality records. [B]
4. **DEWA** activation: deposit AED 2,000 (apartment) or AED 4,000 (villa) plus an activation fee of about AED 130; building **move-in permit** may be required. [B]
5. Renewal: the landlord must give **90 days' written notice** of a rent increase or change in terms; otherwise the lease renews on the same terms. Maximum increases follow the **RERA rent calculator / Smart Rental Index**: current rent up to 10% below market, no increase; 11 to 20% below, up to 5%; 21 to 30% below, up to 10%; more than 30% below, up to 20%. [B]
6. Eviction for sale or own use requires **12 months' notice** by notary public or registered mail; a landlord cannot evict simply to re-let at a higher rent. [B]
7. Disputes go to the Rental Dispute Centre (fee 3.5% of annual rent, min AED 500, max AED 30,000, plus about AED 320). [V]

### 5.5 Where the money sits (the four core flows plus two)
| Flow | Buyer pays | Where it goes |
|---|---|---|
| 1. Off-plan, cash | Booking, instalments, handover | **Project escrow account**, released against certified progress |
| 2. Off-plan, mortgage | Equity (at least 50%) in instalments; bank pays its share, usually near handover | Both into the **project escrow account** |
| 3. Ready, cash | Price plus fees on transfer day (bank transfer or manager's cheque, not banknotes) | **Trustee centre settlement**, seller paid once title transfers |
| 4. Ready, mortgage | Down payment from own funds; bank pays the loan share | Same settlement; mortgage registered on the title deed |
| 5. Off-plan resale (assignment) | Paid-to-date plus any premium to seller; then remaining instalments | Seller (after NOC); then project escrow |
| 6. Rental | Deposit, agency fee, rent cheques | Landlord (rent, deposit), agent (fee); with a monthly plan a financing partner pays the landlord upfront |

**Worked example (AED 2,000,000 property)** [E]: 4% DLD = AED 80,000; title deed AED 580; trustee AED 4,200 (AED 4,000 + 5% VAT); agency 2% + VAT = AED 42,000 on resale. Ready mortgage at 80% LTV: loan AED 1,600,000, down payment AED 400,000, mortgage registration 0.25% + AED 290 = AED 4,290. Cash needed by a mortgaged ready buyer is roughly 27% of the price (down payment plus fees).

### 5.6 Fee reference
| Fee | Amount | Who pays | Tag |
|---|---|---|---|
| DLD transfer fee | 4% of price | Off-plan: buyer pays all; resale: customarily split 2% each | [B] |
| Title deed admin fee | About AED 580 (apartments, offices); AED 430 (land); some sources say AED 40 for off-plan | Buyer | [U] |
| Trustee fee | AED 4,000 + VAT (price over AED 500k); AED 2,000 + VAT (under AED 500k) | Buyer (resale) | [B] |
| Mortgage registration | 0.25% of loan + AED 290 | Buyer | [B] |
| Bank valuation | About AED 2,500 to 3,500 + VAT | Buyer | [B] |
| Bank processing | About 0.5 to 1% of loan | Buyer | [B] |
| Agency fee (resale) | 2% of price + 5% VAT | Buyer (customary) | [B] |
| Agency fee (off-plan) | 3 to 7% of price, paid by developer | Developer | [B] |
| Agency fee (rental) | 5% of annual rent + VAT | Tenant | [B] |
| Developer NOC (resale) | About AED 500 to 5,000 | Seller | [B] |
| Off-plan assignment | NOC AED 5,000 to 15,000; developer fee 1 to 2% | Seller | [B] |
| Ejari | About AED 220 | Tenant | [A] |
| Total buyer costs | 7 to 10% above price (6.5 to 7% cash; 8 to 10% with mortgage) | Buyer | [B] |

### 5.7 Golden Visa (property route)
A 10-year renewable UAE Golden Visa is available through property worth **AED 2 million or more**, including mortgaged and off-plan property. Sources differ on the details: off-plan must be from DLD-approved developers; one source says off-plan must be at least 50% complete at application; a February 2026 rule change reportedly allows a mortgaged property to qualify based on its total DLD-certified value of AED 2m with a bank NOC and no minimum equity for ready properties. Valuation uses the DLD certificate, not the deed price. [B]/[U]

### 5.8 Holiday homes (short-term rental)
Every short-term rental in Dubai needs a **DET holiday home permit**. Requirements [B]: a building NOC permitting short stays; registration about AED 1,520 per year plus a per-unit permit of about AED 320 to 1,200 depending on size; an individual may operate up to 8 units under an individual licence (above that, a trade licence); a **Tourism Dirham** of AED 10 (standard) or AED 15 (deluxe) per bedroom per night, filed monthly by the 15th; VAT registration mandatory above AED 375,000 turnover.

---

## 6. Regulation and compliance

### 6.1 Brokerage licensing in Dubai
To operate legally the company needs:
1. A **DET trade licence** for real estate brokerage (mainland Dubai is the standard route). [B]
2. **RERA registration** of the brokerage (registration about AED 5,000 to 10,000 per year; **Trakheesi** access for advertising permits). [B]
3. A **licensed manager** who has passed the **RERA Certified Training for Real Estate Brokers (CTREB)** at the **Dubai Real Estate Institute (DREI)** and the RERA exam (course about AED 2,000 to 3,500 over 4 to 5 days; exam AED 3,200 for a degree holder up to AED 15,750 without formal qualification; sources vary). [B]
4. A personal **RERA broker card (BRN)** for every agent (about AED 5,020 per year; total about AED 6,200 to 8,800 per card including steps; **2 to 4 weeks**). [B]
5. A **physical office with Ejari**; virtual offices do not qualify (budget AED 15,000 to 40,000 per year for a basic setup). [B]
6. **Minimum capital** starting at AED 100,000 for a standard brokerage licence. [B]
7. First-year total typically **AED 20,000 to 35,000** for licence, registration, office, visa and establishment card. [B] **Unlicensed brokerage fines: AED 50,000 to 200,000.** [B]
8. As of Q1 2026 RERA had registered over 24,000 active brokers across 4,500+ licensed brokerage firms. [B]

### 6.2 Advertising rules
Every property ad needs a **Trakheesi permit number** and, since **24 April 2023**, a **Madmoun QR code** that lets anyone verify the advertiser, the property details and whether it has been sold or rented. [V] DLD requires agents to remove unavailable properties within 3 working days. [V]

### 6.3 Anti-money-laundering (AML) duties
- Real estate brokers and agents are **DNFBPs** (designated non-financial businesses and professions) under **Federal Decree-Law No. 10 of 2025** and **Cabinet Resolution No. 134 of 2025**. [B]
- Register on **goAML**; report suspicious transactions immediately to the UAE FIU; file a **real estate activity report (REAR)** for any freehold transaction involving **AED 55,000 or more in cash** (single or linked), any payment wholly or partly in virtual assets, or cash funded by converting a virtual asset. [B]
- **MoET** supervises brokers, with risk-based inspections. **Maximum administrative fine AED 5,000,000 per violation**, plus criminal penalties. [B]
- Practical: KYC on every buyer (ID, proof of address, source of funds), sanctions and PEP screening, a compliance officer, a written risk-based policy.

### 6.4 The referral model and the licensing problem (critical)
**Proposal:** any resident, without a RERA licence, can generate leads and close deals and be paid a referral fee.

**Position:** Selling, negotiating and closing property deals in Dubai is brokerage and requires a RERA broker registration. A published rule clearly allowing a brokerage to pay unlicensed individuals fees for **closing** deals was **not found**. A pure introduction (a lead referral where the licensed brokerage does all selling, with a fixed fee) is a different activity, but whether it is lawful and how it must be structured needs a **written opinion from a UAE real estate lawyer** before launch. [U]

**Structures that keep it compliant (to confirm with counsel):**
1. **Licensed agents only** earn a commission share (live in the pilot).
2. **Overseas realtors** under Dubai's **DIPC (Dubai International Property Consultant) designation**, which enables legal referral relationships with Dubai brokers and guarantees referral compensation to the designee. [B]
3. **Residents:** an introduction-only track (no selling, negotiating or closing) only after the legal opinion, **or** a **"earn your licence" track** where the company sponsors RERA training and registers top referrers as agents under the brokerage.
4. Do not promise payments to unlicensed people in any survey, marketing or terms until the structure is confirmed.

### 6.5 What "Buy Now" can and cannot mean
- **Cannot:** an instant, single-click purchase. Property transfer needs KYC, a contract, DLD registration and (for half of buyers by count) a bank.
- **Can:** **"Reserve now"**: a verified unit, an all-in price, KYC, e-signed contract, and a payment routed to the **legally required account** (project escrow for off-plan; trustee settlement for resale), with a tracker for what happens next.
- **Brokers may not hold client funds.** In Dubai brokers are not allowed to keep client money; escrow accounts are required of developers, and RERA has not indicated plans to require escrow accounts for brokers. [B] So the company routes payment and takes only its own fee, ideally through a licensed payments partner. A Central Bank licence is needed for stored value or retail payment services if the company handled funds itself. [U]

### 6.6 Other rules to keep in view
- **Data protection:** the UAE Federal Decree-Law No. 45 of 2021 on personal data protection (PDPL); consent screens for surveys and apps. [U]
- **Off-plan cancellation:** Dubai Law No. 13 of 2008 (Article 11) governs cancellation and refunds in off-plan sales. [U]
- **Professional indemnity insurance** is advisable and often expected by developers.
- **Tokenisation:** DLD has a pilot tokenisation project with VARA and the Dubai Future Foundation; fractional ownership is an adjacent, regulated field (see Stake, PRYPCO Blocks). [V]

---

## 7. The product

### 7.1 Four modules
| Module | What it does | Build approach for the pilot |
|---|---|---|
| **Insights** | Price per sq ft trends, rental yield, supply pipeline, developer delivery record, service charges, each with source and date | Built by us (v0): DLD open data on Dubai Pulse plus a licensed data feed |
| **3D view of the exact unit** | Walkthrough from developer files; model reused for fit-out and furniture planning | Partner-built: developer assets or a viewer partner; get written rights; do not build in-house for the pilot |
| **Document and payment tracker** | Checklist per deal type, document vault, WhatsApp and email reminders for instalments and registrations | Built by us (v0), no-code plus a contractor first |
| **Design and furniture** | Request a design, book a vetted interior designer, shop from partner furniture brands, all linked to the unit | Partner-built: affiliate or booking-fee deal; no AR design tools yet |

### 7.2 Superapp lifecycle map
Eight stages, each with sub-features:
1. **Discover:** verified listings with Madmoun QR; off-plan, ready and rent; all-in cost calculator; prices versus DLD transactions.
2. **Verify:** KYC and source of funds; title deed or Oqood check; RERA project and escrow number; developer track record.
3. **Transact:** off-plan reserve into escrow and SPA; ready buy-now or offer then Form F; rent via online tenancy contract; payments routed, never held.
4. **Finance:** mortgage pre-approval; valuation and offer letter; monthly rent plans; fees paid in cash.
5. **Register:** Oqood (off-plan); title deed via trustee or DubaiNow; mortgage registration; Ejari for rentals.
6. **Move in:** snagging inspection; keys and handover; DEWA, internet, movers; move-in permit.
7. **Own and earn:** property management; holiday home permit; Golden Visa from AED 2m; home services.
8. **Sell or re-let:** a ready-to-sell pack (service-charge statement, NOC pre-check, liability letter, tenancy and Ejari status, approved modifications); Form A and ad permit; timed offers; then back into Discover.

### 7.3 Design principles from the research
- Show an **all-in cost** before commitment (price plus 4% DLD, trustee, agency, mortgage fees, service charges).
- **Verified supply only:** list units only with a live listing agreement, a Trakheesi permit and a Madmoun QR; auto-delist on a signed MOU or Ejari.
- **One accountable party**, plain-language contracts with key clauses flagged.
- **Reminders and a tracker** for every instalment, registration and renewal; show construction progress from DLD.
- For ready purchases: **timed offers**, a seller **ready-to-sell pack**, a valuation opt-out clause for mortgage buyers, a generated transfer-day payment list.

### 7.4 Best practices by flow (summary of the journey study)
- **Off-plan:** sync availability daily; payment only to the registered escrow account with receipt shown in-app; confirm who pays the 4% DLD fee before payment; show Oqood certificate; track project % complete; show assignment rules and fees early; book independent snagging automatically; show the RERA service-charge figure before purchase.
- **Ready:** list only units with a live Form A; hold the 10% deposit with a regulated party; pre-check service charges and NOC; request the seller's liability letter at MOU signing; check POA validity early; one transfer-day coordinator; route each deal to DubaiNow or trustee based on eligibility.
- **Rental:** show only units with a live Form A; release cheques only against a signed contract; register Ejari at signing; show all move-in costs upfront; built-in rent-index check and 90-day notice reminders; dated photo reports at move-in and move-out.

---

## 8. Business model

### 8.1 Revenue streams
**Primary (transaction fees):**
| # | Stream | Who pays | Rate | Typical | Tag |
|---|---|---|---|---|---|
| P1 | Off-plan sales | Developer | 3 to 7% of price | AED 87k on AED 2.17m (at 4%) | [E] |
| P2 | Ready purchase (buyer side) | Buyer | 2% + VAT | AED 74k on AED 3.69m | [E] |
| P3 | Listing and selling (owner side) | Seller or landlord | Up to 2% + VAT on sale; leasing fee on rent; paid boosts | n/a | [A] |
| P4 | Rentals | Tenant | 5% of annual rent + VAT | AED 6k on AED 120k rent (illustrative) | [E] |

**Secondary:**
| # | Stream | Who pays | Typical rate | Tag |
|---|---|---|---|---|
| S1 | Mortgage referral | Bank | About 0.5 to 1% of loan | [A] |
| S2 | Conveyancing concierge | Buyer or seller | Fixed fee per transfer | [A] |
| S3 | Property management | Landlord | About 5 to 8% of annual rent | [A] |
| S4 | Holiday homes | Owner | About 15 to 25% of booking revenue | [A] |
| S5 | Golden Visa and residency | Owner | Fixed service fee | [A] |
| S6 | Home services (snagging, movers, cleaning, insurance) | Vendor or customer | 10 to 20% take rate | [A] |
| S7 | Rent financing and payments | Financing partner | Revenue share per contract | [A] |
| S8 | B2B, advertising and data | Developers, agents, banks | Subscriptions, featured launches, reports | [A] |

**Adjacent revenue from the post-sale modules:** furniture affiliate, designer booking fees, data and valuation reports.

### 8.2 Unit economics
- An average off-plan deal: AED 286bn / 132,000 deals ≈ AED 2.17m; at a 4% commission, **≈ AED 87k gross**. If a 1% buyer cashback is offered, about AED 65k net. [E]
- Average resale: AED 262bn / 71,000 ≈ AED 3.69m; 2% buyer-side fee ≈ AED 74k. [E]
- VAT of 5% applies to agency commission; UAE corporate tax of 9% applies above AED 375,000 of profit. [B]

### 8.3 Market sizing (all [E])
Method: size the **fee pool**, not total property value.
| Layer | Value | Derivation |
|---|---|---|
| Off-plan commissions (Dubai) | AED 11.4bn | about 4% × AED 286bn |
| Resale agency fees (Dubai) | AED 10.5bn | 2% each side × AED 262bn |
| Abu Dhabi sales fees | AED 3.0bn | about 3% blended × AED 99bn |
| New-lease fees (Dubai) | AED 2.8bn | 5% of an assumed AED 57bn of new-lease rent |
| Mortgage referral fees | AED 1.3bn | about 0.75% × AED 179bn |
| **TAM (UAE transaction fee pool)** | **AED 29bn (about USD 7.9bn)** | Sum of the above |
| **SAM (what a digital checkout can serve in Dubai residential)** | **AED 13.5bn (about USD 3.7bn)** | 70% of off-plan fees (AED 8.0bn) + 50% of buyer-side resale fees (AED 2.6bn) + new-lease fees (AED 2.8bn) |
| **SOM (year 3)** | **AED 160m (about USD 45m)** | About 1% of Dubai residential sales value (about AED 5.5bn GMV) at a roughly 3% net take, about 2,000 deals a year |

**Comparison:** portals earn about **AED 1.2bn** a year in the UAE (Property Finder UAE revenue USD 30m in 2021 growing to USD 117m in 2024, with a UAE EBITDA margin above 60% in H1 2025; Dubizzle Group revenue USD 222m in 2024 with the UAE about 89% of H1 2025 adjusted revenue). So the **transaction fee pool is roughly 25 times portal revenue**, which is why portals are moving toward transactions (Property Finder's Mortgage Finder cashback; investments in Keyper and Stake). [V] inputs, [E] calculation. For reference, Huspy facilitates about USD 7bn of transactions a year after about five years, a real comparable for the SOM. [V]

---

## 9. Competitive landscape

| Player | Type | What they own | Scale or funding | Threat |
|---|---|---|---|---|
| **Property Finder** | Portal | Buyer traffic, broker subscriptions, Mortgage Finder (1% cashback launched 2026), stakes in Keyper and Stake | UAE revenue USD 117m (2024); USD 525m Permira and Blackstone investment plus USD 250m Ares debt (2025) [V] | High |
| **Bayut / dubizzle (Dubizzle Group)** | Portal | #1 UAE property classifieds, Property Monitor data, TruBroker | Group revenue USD 222m (2024); IPO at about USD 2bn valuation postponed in October 2025 [V] | High |
| **Huspy** | Mortgage plus agent platform | Mortgage brokerage, freelance-agent platform, transaction support; UAE, Spain, Saudi | USD 59m Series B led by Balderton (July 2025); about USD 7bn transactions a year; over 25,000 buyers helped [V] | High |
| **PRYPCO** | Fintech and proptech | Mortgages (about AED 10bn), Golden Visa support (3,000+), fractional "PRYPCO Blocks" (50,000+ users), PRYPCO One agent super app (9,000+ agents; extra 0.35% of mortgage value to agents) | General Catalyst-led pre-Series A (2025); USD 10m seed (2024) [V] | Medium |
| **Oliva** | Digital brokerage | Remote end-to-end purchase for international investors; KYC and e-sign; data scoring; free to buyers on off-plan, 2% + VAT buyer fee on resale | Early stage [V] (company's own site) | Direct, high |
| **Developer apps** (Emaar One / Vyom, DAMAC, Sobha) | Direct sales | Online reserve-and-pay for their own units | Single-brand inventory | Medium |
| **DLD DubaiNow Digital Sale and ADREC journey** | Government | Free online contract, e-signature, title deed | Launched October 2025 | Enabler and limited substitute |
| **Large brokerages** (Betterhomes, Driven, Allsopp & Allsopp, fäm) | Agencies | Developer relationships, agents on the ground | Hundreds of agents each | Medium |
| **Keyper** | Rental fintech | Monthly rent payments, landlord paid upfront | USD 11m Series A plus USD 30m Franklin Templeton facility (2026) [V] | Partner |
| **Stake / SmartCrowd** | Fractional investing | Small-ticket investors, tokenisation pilots | Stake USD 31m Series B led by Emirates NBD (Feb 2026) [V] | Low |
| **Nawy (Egypt)** | Off-plan marketplace plus financing | "Nawy Now" move-now-pay-later; GMV USD 38m (2020) to USD 1.4bn (2024) | USD 52m Series A plus USD 24m debt (May 2025) [V] | Analogue |

**Where the concept differs (our view; to be confirmed by a competitor teardown):** portals advertise but do not close or track the deal for the buyer; Huspy and PRYPCO are finance- and agent-led; Oliva is the closest in idea but early; developer apps cover one brand; DubaiNow covers only ready, cash, single-owner units. The distinctive combination is a verified-data and 3D layer, an accountable licensed checkout, a post-sale tracker, and design and furniture partnerships.

---

## 10. Why this has not been done, and lessons from analogues

### 10.1 Six reasons it is hard
1. **A home is not a SKU.** Resale homes have one owner, negotiable prices and tenants; a "buy now" button works only when the seller has pre-agreed a price. Off-plan units are closest to SKUs (fixed price lists, floor plans, payment plans).
2. **Brokers may not hold the money.** Payments must route to developer escrow or the trustee; a company taking the whole payment would need a Central Bank licence or a regulated partner.
3. **The portals' customers are brokers.** Portals earn from broker subscriptions and listings, so a checkout that cuts brokers out attacks their own customers (an innovator's dilemma).
4. **Developers control distribution.** Brokerages drive roughly 70% of off-plan sales and developers reward them with commission and launch bonuses; a new channel must prove volume. [B]
5. **The rails were not digital until late 2025.** Before October 2025, transfer needed in-person visits; Dubai's digital sale still excludes mortgaged deals and many non-residents.
6. **Mortgages and AML add friction.** About half of deals by count need a bank; every buyer needs KYC and source-of-funds checks, so "instant" is impossible for many.

### 10.2 Lessons from outside the UAE
- **Zillow Offers (US iBuying)** lost over USD 1 billion in about 3.5 years and exited in 2021 because it could not price homes in a turning market. **Lesson: stay asset-light; never buy homes onto your balance sheet.** [V]
- **Opendoor** survived by pricing discipline but needs large capital and is cyclical. [V]
- **Purplebricks (UK low-fee online agent)** grew fast on advertising and then collapsed, reportedly selling for £1 in 2023. **Lesson: a low fee alone is not a moat.** [B] (from background knowledge, not re-verified in this research)
- **Nawy (Egypt)** shows an off-plan-first marketplace with financing can scale in a developer-led market.

---

## 11. Go-to-market and referral engine

- **Beachhead:** overseas buyers of off-plan units, reached through diaspora communities (India, UK, Pakistan), community WhatsApp and Facebook groups, developer co-marketing on launches, the survey waitlist and referral partners.
- **Supply:** start with Tier-2 developers who need distribution (3 to 5 signed), then use volume to win Tier-1. Manual inventory sync before APIs.
- **Referral tiers:** (1) licensed agents (commission share); (2) overseas realtors under the DIPC designation; (3) residents, introduction-only track or a sponsored path to a broker licence, **only after** the legal opinion (section 6.4).
- **Sequencing:** off-plan Dubai first; rentals ("Rent now" with Ejari, optionally with monthly rent plans via a partner) and resale ("Buy now" with pre-priced, pre-verified listings) in phase 3; Abu Dhabi and developer API integrations in phase 4; Saudi Arabia later.
- **Pricing stance:** free to the buyer on off-plan; clear upfront fee on resale; optionally a first-time-buyer cashback funded from commission.
- **Customer acquisition:** the main cost and risk, because portals own search intent. Track cost per qualified lead from day one (target at or below AED 500 in the pilot).

---

## 12. Execution plan

### 12.1 Phases and gates (planning start was Monday 12 October 2026; the start date is an input)
| Phase | Weeks | Goal | Key tasks |
|---|---|---|---|
| **P0 Validate** | 1 to 6 | Prove the problem and the model | Define wedge and hypotheses; founders' agreement; build and run the survey (300+ answers); 30 depth interviews; 20 supply-side interviews; competitor mystery shop; **legal opinion**; pitch deck v1; 3 developer letters of intent |
| **P1 Set up** | 2 to 8 | Get licensed and operating | Hire a RERA-certified broker-manager; DREI course and RERA exam; DET name and approval; office and Ejari; DET trade licence; bank account and capital; RERA registration; broker cards; goAML and AML policy; insurance; templates and policies; developer agreements; payment-flow design; Trakheesi and Madmoun workflow |
| **P2 Pilot** | 4 to 13 | Build, launch and run a small real pilot | Pilot charter; Figma prototype and 10-user test; insights v0; 3D and design partner pilots; document and payment tracker v0; referral programme v0; operations playbook; recruit cohort; KPI dashboard; internal dry run; **go-live in week 9**; run pilot weeks 9 to 13 |
| **P3 Raise** | 7 to 20 | Turn evidence into a round | Investor list; 3-year financial model; cap table and legal pack; data room; deck v2 with pilot results; investor meetings; due diligence; term sheet |

**Critical path:** the licence chain (manager hire, training and exam, trade licence, RERA registration, broker cards) sets the earliest pilot date. **Fallback (task 1.17):** if the licence is late at week 8, run the pilot through a licensed partner brokerage as co-brokerage, only after the lawyer confirms the structure.

**Go/no-go gates (targets are suggestions):**
| Gate | When | Criteria (target) |
|---|---|---|
| G0 Problem validated | Week 6 | 300+ survey answers; 60%+ rate reliable-information finding as hard (4 to 5 of 5); 30 interviews; 3 developer LOIs; legal opinion received; 3 mentors reviewed deck v1 |
| G1 Licensed and pilot-ready | Week 8 | DET licence; RERA registration; 2+ broker cards; goAML and AML policy; 3+ developer agreements; 150+ units live with permits; 5 dry-run journeys passed |
| G2 Pilot proven | Week 13 | 150 sign-ups; 40 qualified leads; 10 reservations; 5 contracts signed; NPS 40+; cost per qualified lead at or below AED 500 |
| G3 Term sheet or first close | Week 19 to 20 | 25 first investor meetings; 8 second meetings; 1 term sheet |

### 12.2 Owners (designations)
Founder and CEO; Co-founder and CTO; Broker-Manager (Head of Brokerage, RERA-certified); Compliance and AML Officer (fractional); Head of Growth; Partnerships Lead (developers and supply); Product Designer (freelance); Data Analyst (freelance or part-time); Fractional CFO; Licensed Sales Agents (2, pilot); external Legal Counsel; external Business Setup Consultant or PRO.

### 12.3 Budget to reach pilot results (13 weeks) [A]/[E]
| Line | AED | Share |
|---|---|---|
| People (salaries are placeholders; founders unpaid) | 240,000 | 42% |
| Third-party and government costs (P0 25,500; P1 93,000; P2 49,000; P3 8,000) | 175,500 | 30% |
| Contingency (15% of the two lines above) | 62,325 | 11% |
| Share capital deposit (not an expense; RERA minimum) | 100,000 | 17% |
| **Total cash to have available** | **about 577,825 (about USD 157k)** | 100% |

Representative third-party estimates: legal opinion AED 15,000; trade licence AED 15,000; office AED 25,000; broker cards AED 15,000; RERA registration AED 8,000; insights data licence AED 10,000; 3D partner pilot AED 8,000; tracker build AED 12,000. All are planning estimates to be replaced by quotes.

### 12.4 Due diligence the founders must complete
1. **Legal:** written opinion on the referral model, payments flow and 3D asset rights; licensing path and cost; AML programme; PDPL compliance; off-plan cancellation rules; advertising permits.
2. **Supply and partners:** 3 to 5 developer LOIs; a payments partner able to route to escrow and trustee; trustee-centre partnership; 2 to 4 bank or mortgage partners; rental-finance partner.
3. **Demand:** 40 to 60 buyer, investor and tenant interviews; 15 to 20 broker interviews; 8 to 10 developer sales directors; a smoke-test landing page with paid ads in two corridors; a willingness-to-reserve-online test.
4. **Market and competition:** confirm segment sizes from DLD open data (Dubai Pulse); mystery-shop Oliva, Huspy, PRYPCO, Emaar One and three brokerages; financial model with CAC, conversion, operations cost per deal, payout lag, 9% corporate tax, 5% VAT; a downside case (15% price drop and 40% fewer off-plan launches); professional indemnity quote.

---

## 13. Validation survey (to prove the problem)

### 13.1 Design
- **Length:** about 9 minutes; **56 questions** across sections A About you, B Property journey, C Information and insights, D 3D view and design, E Documents and payments, F The idea, G Introducing friends (UAE residents), H Close.
- **Order principle:** ask about past behaviour first (section B) and the idea last (section F) so the idea does not colour earlier answers; describe the concept identically to everyone.
- **Referral questions (section G) are a concept test only:** no payment is promised or offered.
- **Sampling plan (about 340 answers):** overseas people planning to buy (120); UAE residents who bought or invest (100); UAE renters (80); real-estate professionals (40, sections G and H only). Cap any single source at 30%. A sample of 300 gives about ±5.7% margin of error at 95% confidence (worst case). It is a **convenience sample**: report it as such.
- **Interview guide:** 10 prompts (walk through your last purchase or rental; where you felt least in control; a time a listing or price turned out different; surprise costs; how you tracked deadlines; what you would pay to make it easier; usefulness of a 3D walkthrough; furnishing; reaction to the idea; resident referral appetite).

### 13.2 Hypotheses and proof thresholds (thresholds set before looking at data)
| ID | Hypothesis | Measure | Pass if at least |
|---|---|---|---|
| H1 | Finding reliable information is hard | Rated 4 to 5 of 5 | 60% |
| H2 | People meet unavailable or misdescribed listings | Yes (once or more) | 50% |
| H3 | Unexpected costs are common | Yes | 40% |
| H4 | Paperwork and registrations are hard | Rated 4 to 5 of 5 | 50% |
| H4b | Complexity makes people delay or give up | Yes | 30% |
| H5a | Missed or late deadlines happen | Yes | 25% |
| H5b | A single tracker is wanted | Rated 4 to 5 of 5 | 60% |
| H6 | People will pay for independent insights | Any paid option | 30% |
| H7 | A 3D view of the exact unit matters | Rated 4 to 5 of 5 | 60% |
| H8 | The one-stop idea is attractive | Rated 4 to 5 of 5 (likelihood to use) | 50% |
| H9 | UAE residents would refer others | Rated 4 to 5 of 5 (likely to refer) | 40% |
| H10 | Furniture and design add-on has demand | Definitely or probably | 40% |
| H11 | Trust in portal data is low | Rated 1 to 2 of 5 | 25% |
| H12 | Price fairness is uncertain | Rated 1 to 2 of 5 | 25% |

**Status:** the survey and pilot have **not yet run**. Any result described in a deck is a placeholder `[__]` until real data exists. Required minimum answers before a verdict: 100.

---

## 14. Fundraising: the pitch

### 14.1 Narrative (problem-first)
Stage: **pre-seed**. Storyline of 18 slides: (1) Cover: "Buy, rent and own UAE property with one app"; (2) Problem (three pains with outside numbers and survey placeholders); (3) First customer: overseas investor buying off-plan; (4) Why now (digital rails, record volumes); (5) Solution (five steps: Discover, See it, Reserve, Complete, Live); (6) Product (four modules; built by us versus partner-built); (7) Business model; (8) Market (fee pool about 25 times portal revenue); (9) Competition (everyone owns one piece); (10) Go-to-market and referral engine; (11) Trust and regulation (licensed, escrow-routed, never hold customer money); (12) Evidence scoreboard (targets versus actual); (13) 13-week plan with gates; (14) Team; (15) Use of funds; (16) The ask; (17) Appendix: problem tests and thresholds; (18) Appendix: sources.

### 14.2 Investor concerns to answer in advance
1. **Is the referral model legal?** Answer with the legal opinion and the licensed-first structure.
2. **Do you hold client money?** No: routed to escrow or trustee.
3. **Why won't Property Finder or Huspy simply build this?** They could; we compete on speed, trust, operations quality and the post-sale layer, and portals face a conflict with their broker customers.
4. **What if the market corrects?** Asset-light model, diversification into resale, rentals and services; Fitch expects up to 15%.
5. **How do you acquire customers cheaply?** Diaspora corridors, referrals, developer co-marketing; measure CAC from day one.
6. **Who holds the licence?** A RERA-certified Broker-Manager named on the registration.

### 14.3 Investor types
UAE accelerators and programmes; VCs already active in UAE proptech and fintech; strategic investors (for example, Property Finder has invested in Keyper and Stake; Emirates NBD led Stake's round). Recent UAE proptech rounds for context: Huspy USD 59m Series B; PRYPCO pre-Series A (General Catalyst); Stake USD 31m Series B; Keyper USD 11m Series A plus a USD 30m facility. [V]

---

## 15. Risks and mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Unlicensed brokerage via the referral model | High | Legal opinion first; licensed-first referral tiers; sponsored licence path |
| Handling client payments | High | Route to escrow or trustee; collect only own fee; licensed payments partner |
| Developer supply (no inventory feeds, launch allocations to top brokers) | High | Sign 3 to 5 Tier-2 developers first; manual sync team before APIs |
| Resale supply (multi-listing, tenants in place, stale listings) | High | Phase 2 to 3; exclusive pre-priced mandates with a ready-to-sell pack |
| Customer acquisition cost | High | Overseas corridors, referrals, content; track CAC per deal |
| AML and KYC | Medium | KYC in checkout; compliance officer; avoid crypto at launch |
| Mortgage deals slow the "instant" promise | Medium | Pre-approval step before reserve; partner with 3 to 4 banks |
| Off-plan delivery risk lands on reputation | Medium | List only RERA-registered projects with escrow; publish developer track records; clear liability terms |
| Market cycle | Medium | Asset-light; keep resale and rentals in the roadmap |
| Incumbent response | Medium | Speed, trust, ops quality; treat portals as potential acquirers |
| Licence delay | Medium | Fallback partner-brokerage pilot after legal OK |

**SWOT (summary).** *Strengths:* clear consumer pain; buyer pays nothing on off-plan; off-plan inventory behaves like SKUs; government rails now exist; asset-light; fee transparency. *Weaknesses:* no supply or traffic on day one; payments cannot be taken directly; mortgages slow the flow; high-ticket low-frequency purchases; operations-heavy. *Opportunities:* record volumes; remote foreign buyers; trust gap; rentals; adjacent services; Strategy 2033; Abu Dhabi and Saudi expansion. *Threats:* well-funded incumbents; developers going direct; government as competitor; market cycle; regulation and AML; broker backlash.

---

## 16. Glossary

| Term | Meaning |
|---|---|
| **AED** | UAE dirham; pegged at 3.6725 per USD |
| **ADREC** | Abu Dhabi Real Estate Centre; Abu Dhabi's land registry and regulator |
| **Assignment** | Resale of an off-plan unit before handover; the buyer takes over the SPA |
| **BRN** | Broker Registration Number; a licensed agent's RERA identifier |
| **CTREB / CTRB** | RERA Certified Training for Real Estate Brokers, taught at DREI |
| **DET** | Dubai Department of Economy and Tourism; issues trade licences and holiday home permits |
| **DEWA** | Dubai Electricity and Water Authority |
| **DIPC** | Dubai International Property Consultant designation for overseas realtors |
| **DLD** | Dubai Land Department; the registry |
| **DNFBP** | Designated non-financial business or profession (brokers count) under AML law |
| **DREI** | Dubai Real Estate Institute |
| **DubaiNow** | Dubai government super app, hosts DLD Digital Sale |
| **Dubai REST** | DLD app and service for verifying properties, brokers and permits |
| **Ejari** | Dubai's mandatory tenancy contract registration system |
| **EOI** | Expression of interest; a reservation or booking step in off-plan |
| **Escrow account** | Project-specific account at a DLD-accredited bank holding off-plan buyer money, released against progress |
| **Form A / B / I / F** | RERA forms: A seller-broker; B buyer-broker; I between brokers; F the MOU |
| **goAML** | The UAE FIU portal for AML reports |
| **LTV** | Loan to value |
| **Madmoun** | DLD QR verification service on every property ad (since 24 April 2023) |
| **MOU** | Memorandum of understanding; in Dubai resale, Form F |
| **NOC** | No Objection Certificate (developer NOC confirms service charges are paid; also building NOCs for short stays) |
| **Off-plan** | Property sold before construction is complete |
| **Oqood** | Interim registration of an off-plan sale at DLD |
| **PDPL** | UAE Federal Decree-Law 45 of 2021 on personal data protection |
| **Ready / secondary / resale** | Completed property bought from an existing owner |
| **RDC** | Rental Dispute Centre |
| **RERA** | Real Estate Regulatory Agency (part of DLD) |
| **REAR** | Real estate activity report under AML rules (cash of AED 55,000 or more, or virtual assets) |
| **Service charge** | Annual building maintenance charge paid by owners |
| **Snagging** | Inspection and listing of defects at handover |
| **SPA** | Sale and Purchase Agreement |
| **Tourism Dirham** | Per-night fee on holiday homes (AED 10 or 15 per bedroom) |
| **Trakheesi** | RERA advertising permit system |
| **Trustee centre** | Licensed Real Estate Registration Trustee office that completes transfers |
| **UAE Pass** | National digital identity and e-signature |
| **TAM / SAM / SOM** | Total, serviceable and obtainable market |
| **iBuying** | A company buying homes outright and reselling them |
| **Asset-light** | Business model that does not hold property or client funds on its balance sheet |

---

## 17. Worked Q&A for training

**Q1. What is the concept in one sentence?**
A licensed UAE real-estate brokerage with an app that gives buyers, investors and renters verified data, a 3D view of the exact unit, an online reserve-and-pay flow and a tracker for every document and payment, then adds design, furniture and management after purchase.

**Q2. Does the "Buy Now" button mean instant ownership?**
No. It means "reserve now": a verified unit, all-in cost, KYC, e-signed contract and payment routed to the legally required account (project escrow for off-plan, trustee settlement for resale), followed by registration. Ownership transfers only on DLD registration.

**Q3. Will the company hold customers' money?**
No. In Dubai brokers may not hold client funds. Off-plan money goes to the DLD-supervised project escrow; resale money moves through the trustee centre. The company collects only its own commission or fee.

**Q4. How does the company make money on off-plan if the buyer pays nothing?**
The developer pays the broker a commission of about 3 to 7% of the unit price (commonly built into the price). On an average AED 2.17m off-plan unit at 4% that is roughly AED 87k.

**Q5. Can unlicensed residents close deals and earn referral fees?**
As proposed, likely not lawfully: selling, negotiating and closing requires a RERA broker registration, and unlicensed brokerage carries AED 50,000 to 200,000 fines. A pure introduction role, structured under a lawyer's written opinion, may be possible; the safer options are licensed agents, overseas realtors under the DIPC designation, or a path where the company sponsors the resident's RERA licence.

**Q6. Why start with off-plan and overseas buyers?**
Off-plan units behave like fixed-price products; developers pay the commission so the buyer pays nothing; overseas buyers (85 to 88% of Dubai transactions are by foreigners) feel the trust and complexity pain most and value a single accountable remote checkout.

**Q7. What does a Dubai ready-home purchase cost on top of the price?**
Roughly 7 to 10%: 4% DLD fee (customarily split on resale), about AED 4,000 + VAT trustee fee, a title deed fee near AED 580, 2% + VAT agency fee, and with a mortgage a 0.25% registration fee, valuation and processing fees. Banks do not finance these costs.

**Q8. What are the mortgage limits?**
For expat first homes up to AED 5m, up to 80% loan to value (70% above AED 5m); off-plan is capped at 50% by the Central Bank. Pre-approval takes 3 to 7 business days; maximum tenor 25 years.

**Q9. How is the competition different?**
Property Finder and Bayut own traffic and sell to brokers; Huspy and PRYPCO lead on finance and agents; Oliva is the closest in idea; developer apps cover one brand; DubaiNow Digital Sale covers only ready, cash, single-owner units. The concept combines verified data, 3D, a licensed checkout, a post-sale tracker and design services.

**Q10. How big is the opportunity?**
Dubai property transactions were AED 917bn in 2025. The relevant measure is the fee pool: about AED 29bn a year across the UAE (our estimate), about 25 times portal revenue of about AED 1.2bn.

**Q11. What is the timeline to a pilot?**
Start to pilot go-live is about 9 weeks, and results at week 13. The licence chain is the critical path; a partner-brokerage fallback exists.

**Q12. How much does it cost to get to pilot results?**
About AED 578k (about USD 157k): AED 240k people, AED 175.5k licence, office, product and data, AED 62k contingency, plus a AED 100k share capital deposit. All are estimates.

**Q13. What is escrow and why does it matter for off-plan buyers?**
A DLD-supervised bank account per project. Buyer payments go only there and are released against engineer-certified construction progress; 5% is retained for a year after registration. Funds cannot be seized by the developer's creditors.

**Q14. What is Oqood?**
The interim DLD registration of an off-plan sale, giving the buyer a certificate proving the purchase before the title deed exists.

**Q15. What is Form F?**
The standard DLD resale MOU: price, deposit (typically a 10% manager's cheque held by the broker), completion date, NOC obligations and default consequences. It is binding once signed.

**Q16. What can the DubaiNow Digital Sale handle?**
Fully online sale of ready, freehold, mortgage-free, single-owner units where both parties have an Emirates ID, UAE Pass and a UAE bank account, essentially cash deals. Mortgaged, off-plan and many overseas deals still need other channels.

**Q17. What would make an investor doubt this concept?**
The referral legality, any appearance of holding client money, lack of developer supply, high customer acquisition cost against portals, and market-cycle exposure. The plan addresses each: legal opinion, escrow routing, Tier-2 developer start, tracked CAC, and diversification.

**Q18. Why not buy properties and resell (iBuying)?**
Zillow Offers lost over USD 1bn doing this and shut down; it needs large balance sheets and is cyclical. The concept stays asset-light.

**Q19. What are the secondary revenue streams?**
Mortgage referrals, conveyancing concierge, property management, holiday homes, Golden Visa assistance, home services, rent financing and payments, and B2B data and advertising.

**Q20. How is the problem proven to investors?**
A 56-question survey with 14 pre-set hypotheses and thresholds (for example, at least 60% find reliable information hard), 30 depth interviews, developer letters of intent and a 13-week pilot with fixed targets. Results are reported honestly, including failures.

**Q21. What does the Golden Visa have to do with it?**
Property of AED 2m or more qualifies a buyer for a 10-year visa. The app flags eligible units at checkout and offers a fee-based service, but rules change, so eligibility must be checked before payment.

**Q22. What are typical rental rules a tenant should know?**
Security deposit 5% (unfurnished) or 10% (furnished); agency fee 5%; Ejari registration; 90 days' written notice for rent changes capped by the RERA index; 12 months' notice to evict for sale or own use; disputes to the Rental Dispute Centre.

**Q23. Which facts in this document are least certain?**
The fee admin amounts that sources disagree on (title deed fee), the Golden Visa mortgage and off-plan details, all [A] revenue rates for secondary streams, all salaries, the SAM and SOM figures, the competitor "where we differ" column, and the referral-law position. See section 18.

**Q24. How should a model respond if asked for legal advice?**
Give general background with the confidence tag, state the date, and recommend confirming with DLD, RERA, ADREC or a UAE-qualified lawyer. Do not state that any specific transaction or referral arrangement is lawful.

---

## 18. Known gaps, conflicts and items to re-check

1. **Survey and pilot results do not exist yet.** All `[__]` placeholders in the pitch deck and Analysis sheets await real data.
2. **Sources conflict:** Dubai 2025 sales value (AED 682.5bn vs AED 686.8bn; total AED 917bn vs 919bn); title deed admin fee for off-plan (AED 40 vs AED 580); Golden Visa conditions for mortgaged and off-plan units; DREI course and RERA exam fees (ranges vary); broker card cost (AED 5,020 vs AED 6,200 to 8,800 all-in).
3. **Referral law:** no explicit published rule found either allowing or prohibiting paying unlicensed introducers; needs a lawyer.
4. **Payments licensing:** whether any Central Bank licence is needed depends on how funds flow; needs counsel.
5. **Secondary-stream rates and all salaries and third-party costs** are [A] placeholders.
6. **Competitor capabilities** were taken from public pages and press, not tested; a mystery-shop teardown is planned.
7. **Reddit evidence** came from search-result excerpts of threads, not complete threads; use as themes.
8. **Purplebricks** outcome comes from background knowledge and was not re-verified in this research.
9. Rules and fees move: re-verify anything older than six months before quoting to a customer or investor.

---

## 19. Sources
Tags show reliability. Industry blogs ([B]) are brokerage or startup publications.

**Market data**
- Gulf News, "Dubai's real estate market hits record Dh917b in 2025" [V]
- DXB Interact, Dubai property market records 2025 [B]; Betterhomes, "What really drove Dubai's property market in 2025" [B]
- Emirates 24|7, "Dubai property transactions reach AED419.9 billion in first half of 2026" [V]
- WAM, "Abu Dhabi real estate hits record AED142 billion in 2025" [V]
- Gulf News, "Dubai rental contracts reach Dh126 billion in 2025" [V]
- Real Estate Club Dubai (cash vs mortgage; buyer nationalities; off-plan delays) [B]
- Enterprise and Economy Middle East, Fitch Ratings correction forecast [V]
- Arabian Business, DLD tokenisation project and Strategy 2033 [V]

**Regulation and process**
- Dubai Land Department: Digital Sale on DubaiNow; Madmoun QR service [V]
- WAM, ADREC Digital Buy & Sell Journey [V]
- Dubai Legislation Portal, Law No. 8 of 2007 (escrow) [V]; Al Tamimi, off-plan buyer rights and mortgage regulations [V]
- AML UAE, AML regulations for DNFBPs [B]
- Oliva (brokerage regulations 2026; commission; DLD fee; assignment; escrow explainers) [B]
- Takween Advisory (RERA licence guide), Shuraa, Virtuzone, Afridi & Angell (broker code of ethics) [B]
- Property Finder blog (DLD fees); Sotheby's Realty (mortgage guide); fäm Properties (renting guide, Ejari); Houst (holiday home permit) [B]
- Mondaq and Khaleej Times (rent increase notice and eviction rules); Al Kabban (Ejari modification rule) [B]
- Gulf News and Khaleej Times (security deposits, fake listings, rental scams, off-plan red flags) [V]
- Gulf News, "Trust accounts for Dubai real estate brokers" [V]

**Competitors**
- Online Marketplaces (Property Finder USD 250m Ares debt); Gulf Business (Property Finder mortgage cashback) [V]
- Enterprise and AGBI (Dubizzle Group IPO, financials); Gulf News (IPO postponed) [V]
- TechCrunch and Wamda (Huspy); Gulf Business (PRYPCO funding and PRYPCO One); Wamda (Stake Series B); Gulf Business (Keyper) [V]
- Partech (Nawy Series A) [V]
- Oliva's own site (about and fees) [V]; Mike DelPrete (Zillow Offers) [V]

**Reddit threads (themes only)**
r/dubai: "Worst experience buying property"; "Seller's agent is extremely rude"; "Regret in buying a DAMAC property"; "Landlord will not let me move in"; "Landlord disconnected DEWA"; "My nightmare renewing my tenancy contract". r/dubairealestate: "Agent insisting to cancel contract before transfer"; "What is the worst about buying a property in Dubai"; "Traffic is back and so are the lies"; "Off-plan owners: are you continuing instalments"; "Landlord sold the apartment near end of tenancy". r/DubaiCentral: "The Dubai rental struggle". r/dubairentals: "Most frustrating part of renting in Dubai".

---

## 20. Project deliverables built from this concept (for traceability)

| Deliverable | Format | What it contains |
|---|---|---|
| Research brief | HTML | SWOT, addressable market, competitors, why-not-done, challenges, feasibility, due diligence, plan |
| Superapp journey map | HTML | 12 revenue streams, mind maps, process flows, challenges and best practices, DLD registration and due diligence |
| Dubai money flow | HTML (interactive) | Six money flows with an AED price calculator and fee ledger |
| Off-plan and ready flowcharts | HTML | Step-by-step flows with challenges and best practices |
| Superapp mind map | HTML | Eight-stage journey in four phases |
| Launch roadmap | Excel | 55 tasks, owners, Gantt, gates, roles, budget, deck storyline, sources |
| Problem survey kit | Excel | 56-question questionnaire, sampling plan, interview guide, responses sheet, analysis with verdicts and generated statements |
| Pitch deck | 18-slide deck | Problem-first investor presentation with placeholders for survey and pilot results |
| DLD data integration spec | Markdown | Datasets, field lists, APIs, auth, pipeline, data model, compliance (`dld-data-integration-spec.md`) |
| This knowledge base | Markdown | Everything above in one place |

---

## 21. DLD data access (summary of the technical specification)

Full detail is in `dld-data-integration-spec.md`. Key facts:

- **Open data is available for free.** DLD's Real Estate Data page offers CSV downloads for **nine record types**: Transactions, Rents, Projects, Valuations, Land, Units, Buildings, Brokers and Developers; previous years are on Dubai Pulse (data.dubai). [V]
- **Transactions fields (open):** transaction number, date, type (Sales, Mortgages, Gifts), registration type (Ready or Off Plan), freehold flag, usage, area, property type and sub type, amount, transaction and property size (sq.m), rooms, parking, nearest metro, mall and landmark, number of buyers and sellers, master project, project. **No names and no unit number.** [V]
- **Projects fields (open):** project number and name, developer, start, end and adoption dates, project type and value, **escrow account number**, **project status**, **completed %**, inspection and completion dates, unit and building counts. This supports verifying an off-plan project and measuring a developer's delivery record. [V]
- **Programmatic access.** The Dubai Pulse API is OAuth client-credentials: an API key and secret are exchanged at `api.dubaipulse.gov.ae/oauth/client_credential/accesstoken` for a bearer token that expires (about 30 minutes in the example). [B] Exact dataset query parameters, rate limits and the commercial reuse licence were not found. [U]
- **DLD API Gateway** lists **13 APIs** (Mollak, Ejari, Trakheesi, Oqood, Mollak Budget, Dubai Brokers, Rental Index, Mollak Virtual Account, Mollak Budget Supplier, Mollak Authorized Signatory, Token Sale, Trust Account Bulk Inflow for developers, Oqood-TAS Bank Integration). Registration is through a **MyDLD login with UAE Pass** and is built for registered businesses; several APIs are limited to banks or developers. For a brokerage the relevant ones are **Trakheesi** (listing validation, delisting), **Dubai Brokers** and **Rental Index**. [V]
- **Do not automate the DLD website download form**: it is protected by reCAPTCHA. Use Dubai Pulse. [V]
- **Not in open data:** owner identity, unit-level sale link, live inventory, per-unit service charges, an individual buyer's payment status. Alternatives and consented routes are in the spec. [V]/[U]

**Worked Q&A**

**Q25. Can the app pull DLD transaction data for free?**
Yes for the open datasets (CSV from DLD or Dubai Pulse, and the Dubai Pulse API with a key and secret). Confirm commercial reuse terms with DLD before showing derived data to customers.

**Q26. Can the app verify a seller's identity from DLD open data?**
No. Open transaction rows contain only counts of buyers and sellers, no names and no unit number. Seller verification uses the title deed and DLD or trustee services with consent.

**Q27. Which DLD APIs would a new brokerage apply for first?**
Trakheesi (permit validation and delisting), Dubai Brokers (agent verification) and Rental Index (rent-increase checks), after the DET trade licence is issued. Fees and eligibility must be confirmed with DLD.

---

### Change log
- **1.1 (17 October 2026):** Added section 21 (DLD data access) and three Q&A pairs; added the DLD data specification to the deliverables table.
- **1.0 (17 October 2026):** First complete consolidation of the research, plan, survey, pitch and Q&A.
