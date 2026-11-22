# SooqRoot

**One order. Many farms. Confirmed before harvest.**

SooqRoot helps many small UAE farms act like one reliable commercial supplier for hotels, restaurants, supermarkets, caterers and institutional buyers.

Founder and CEO: Huda Mueen. Co Founder and CTO: Awaiz Ahmed.

```
BUYER ORDER → SOOQROOT → FARM NETWORK → COMMITMENT BEFORE HARVEST → FULFILMENT → PROOF
```

Figures in the application use a sample supply network. Prices, distances and emissions are estimates and are labelled as such.

---

## Sign in

| | |
|---|---|
| Username | `Huda` |
| Password | `123` |

The session lives in `sessionStorage`. Minister Mode (`#/minister`), the Batch Passport (`#/passport/:batchId`) and the login page work without signing in.

---

## What is in the product

| Area | Page | What it does |
|---|---|---|
| Overview | Control Tower | Local procurement share, open commitments, food loss avoided, at risk orders and the network map |
| Procurement | Buyer Demand | Demand builder and the Demand Translator. A buyer's sentence becomes crop, grade, quantity, packaging and schedule. A packaging check flags items prohibited under Ministerial Decision No. 380 of 2022, and a Harvest and Packing Card is produced in Arabic, Urdu or English |
| | Procurement Cycles | Demand, commitment, harvest, fulfilment and proof, per window |
| | Orders | The order book with a supply kind filter. Each order shows its packaging, partner chain, asset light economics and food miles |
| | Commitment Engine | Deterministic allocation across the farm network, with the partner chain for every farm |
| Supply Network | Farms, Supply Digital Twin | Farms by supply kind and growing method, with a partner layer on the map |
| | Harvest Calendar | Scheduled harvests and a summer gap view by growing method |
| | Partner Network | Cooperatives, aggregators, distributors and logistics providers |
| | Harvest and Packing Guides | Grading, packing, handling and labelling for fresh produce, dates, honey and aquaculture |
| Operations | Exceptions, Fulfilment, Quality Check | Shortfalls, delivery stages and photo grading |
| | Batch Passports | Farm registration, provenance, custody chain, cold chain log, QR code, sticker sheet and recall trace |
| Intelligence | Local Procurement Index | Each buyer's local share against the 25% target, by supply kind |
| | Analytics, Sustainability Impact | Commitments, fill rate, food miles, truck trips and CO2e estimates |
| Communication | Farmer Copilot | Messages to farms in Arabic, with shortfall reporting and a foreman alert in Arabic or Urdu |
| System | Guided Walkthrough, Progress, Pilot Plan, Settings | Run sheet, timeline and field voices, the 12 week pilot and sample data controls |
| Presentation | Minister Mode | Seven full screen steps for iPad, in English and Arabic |

Four kinds of supply are coordinated: fresh produce, dates, honey and aquaculture.

---

## Policy alignment

All formal names live in `src/data/policy.ts` and are imported wherever they appear.

- Sustainable Product initiative, National Agriculture Centre (January 2026): target of 25% locally sourced agricultural and animal products in UAE hotels and restaurants. Used for the national targets panel.
- ne'ma, the National Food Loss and Waste Initiative: halve food loss and waste by 2030. Used for the food loss avoided card.
- National Food Security Strategy 2051.
- Federal Law No. 10 of 2015 on Food Safety and Cabinet Resolution No. 26 of 2017: traceability across the food chain. Used for Batch Passports and the recall trace.
- Ministerial Decision No. 380 of 2022 regarding regulating the use of single use products in the country's markets: the packaging check.
- Federal Law No. 12 of 2018 on Integrated Waste Management: reusable crates and the crate return loop.
- UAE Net Zero 2050 Strategic Initiative and UAE Green Agenda 2030: food miles, truck trips and CO2e estimates.

---

## The commitment engine

`src/lib/engine.ts` is deterministic. The same inputs always produce the same output.

Score is the sum of weight times signal value, each signal from 0 to 100:

| Signal | Weight |
|---|---|
| Supply confidence (reliability x method predictability x summer factor) | 20% |
| Historical fulfilment | 16% |
| Grade match | 16% |
| Proximity (inverse distance) | 14% |
| Harvest date fit | 10% |
| Lead time fit | 10% |
| Packaging capability | 7% |
| Uncommitted headroom | 7% |

Rules:

- Freshness gate, primary gate, a 23% concentration limit and a 5% backup cover limit.
- Growing method profiles (`src/data/methods.ts`) scale supply confidence. From May to September the summer multiplier applies: above 1 for indoor vertical, hydroponic, climate greenhouse and cooled net house, below 1 for open field.
- Advance only farms accept orders with a lead time of 21 days or more. Shorter orders route to pooled open field and net house farms with buffer inventory.
- A farm with lab clearance pending gets a 48 hour buffer in its delivery schedule, not a penalty.
- Every commitment names a collection, consolidation and delivery partner. Aquaculture always includes a cold chain partner.
- `checkPackaging` flags only the items prohibited under Ministerial Decision No. 380 of 2022. `reallocateShortfall` moves a shortfall to the nearest backup farm, or proposes an approved substitute to the buyer.

---

## Estimates and sources

Prices, distances and emissions are always labelled "(estimate)". CO2e is shown only where a published factor applies, and the source is cited next to the figure.

- UK DESNZ / DEFRA Greenhouse Gas Conversion Factors 2026: long haul air freight, 0.936 kg CO2e per tonne km.
- Smart Freight Centre GLEC Framework v3.2: refrigerated road freight, 0.100 kg CO2e per tonne km.

The Assumptions drawer on each order and on Sustainability Impact lists every distance, factor, price and fee used. Wholesale reference prices come from the data pack (`docs/SooqRoot_Data_Pack.md`). The software fee and buyer subscription are sample values.

---

## Data layer

The application reads farms, harvest windows and allocations through the `Repository` interface in `src/data/repository.ts`. `LocalRepository` serves the typed sample data in `src/data/`. `supabase/schema.sql` defines the matching `farms`, `harvest_windows` and `allocations` tables with row level security notes. The application does not connect to any hosted database today. To adopt one, implement `Repository` against it and replace the exported `repository`.

---

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Testing

```bash
npm test                          # engine tests (vitest)
npx playwright test               # screenshots of Minister Mode and key pages, saved to docs/screenshots/v2/
```

## Building and deployment

```bash
npm run build
npx wrangler deploy
```

`wrangler.jsonc` deploys the Vite build as a Cloudflare Workers static asset site on workers.dev. The deployed address is set in `src/lib/qr.ts`, so QR codes on batch passports point to the live application.

## Stack

Vite 5, React 18, TypeScript, Tailwind CSS 3, React Router (hash routing), Recharts, Leaflet, lucide-react, qrcode. There is no backend.
