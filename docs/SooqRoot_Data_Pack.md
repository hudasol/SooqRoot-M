# SooqRoot Data Pack

Source data for the SooqRoot v2 build. Place this file in the repository at `docs/SooqRoot_Data_Pack.md`.

**How the build uses this file**

- Sections marked **FINAL** are ready. Use them exactly as written.
- Sections marked **TO FILL** are templates. Where Huda has filled a row, use the real value. Where a row is still empty, use a realistic sample value. Sample values are part of the sample network shown in the app.
- Prices, distances and emissions are always shown with "(estimate)".
- Never invent official names, laws, figures or quotes beyond this file.

---

## 1. Policy references (FINAL)

Use these names exactly. Store them in `src/data/policy.ts` and import them everywhere.

| Key | Formal name (English) | Formal name (Arabic) | Fact used in the app | Source |
|---|---|---|---|---|
| `SUSTAINABLE_PRODUCT` | Sustainable Product initiative, National Agriculture Centre (January 2026) | مبادرة المنتج المستدام، المركز الوطني للزراعة | Target: 25% locally sourced agricultural and animal products in UAE hotels and restaurants | https://www.forbesmiddleeast.com/lists/?p=90653 |
| `NEMA` | ne'ma, the National Food Loss and Waste Initiative | نعمة، المبادرة الوطنية للحد من فقد وهدر الغذاء | Target: halve food loss and waste by 2030 | https://u.ae/en/information-and-services/environment-and-energy/Agriculture-and-food-security/food-security |
| `FOOD_SECURITY_2051` | National Food Security Strategy 2051 | الاستراتيجية الوطنية للأمن الغذائي 2051 | Local production, agritech and aquaculture, lower food loss | https://u.ae/en/information-and-services/environment-and-energy/Agriculture-and-food-security/food-security |
| `FOOD_SAFETY_LAW` | Federal Law No. 10 of 2015 on Food Safety | قانون اتحادي رقم (10) لسنة 2015 بشأن سلامة الغذاء | Traceability across the food chain | https://uaelegislation.gov.ae/en/legislations/1161/download |
| `FOOD_SAFETY_REGS` | Cabinet Resolution No. 26 of 2017 regarding the Executive Regulations of Federal Law No. 10 of 2015 on Food Safety | قرار مجلس الوزراء رقم (26) لسنة 2017 بشأن اللائحة التنفيذية للقانون الاتحادي رقم (10) لسنة 2015 بشأن سلامة الغذاء | Traceability across the food chain | https://uaelegislation.gov.ae/en/legislations/1160/download |
| `SINGLE_USE_DECISION` | Ministerial Decision No. 380 of 2022 regarding regulating the use of single use products in the country's markets | قرار وزاري رقم (380) لسنة 2022 في شأن تنظيم استخدام المنتجات ذات الاستخدام الواحد في أسواق الدولة | Since 1 January 2026, prohibited: beverage cups and lids; cutlery (spoons, forks, knives, chopsticks); plates; straws; stirrers; Styrofoam food containers and boxes; single use bags of any material, including paper, thinner than 50 microns | https://leap.unep.org/en/countries/ae/national-legislation/ministerial-resolution-no-380-2022-regarding-regulating-use |
| `WASTE_LAW` | Federal Law No. 12 of 2018 on Integrated Waste Management | قانون اتحادي رقم (12) لسنة 2018 بشأن الإدارة المتكاملة للنفايات | Circular reuse of packaging | https://dlp.dubai.gov.ae/Legislation%20Reference/2025/Law%20No.%20(5)%20of%202025%20Concerning%20Public%20Health.html |
| `NET_ZERO` | UAE Net Zero 2050 Strategic Initiative | المبادرة الاستراتيجية للحياد المناخي 2050 | Lower emissions across sectors, including agriculture | MOCCAE briefing |
| `GREEN_AGENDA` | UAE Green Agenda 2030 | الأجندة الخضراء لدولة الإمارات 2030 | Green economy growth | MOCCAE briefing |

The Arabic names for `SUSTAINABLE_PRODUCT`, `NEMA`, `FOOD_SECURITY_2051`, `WASTE_LAW`, `NET_ZERO` and `GREEN_AGENDA` are faithful descriptions. Use them as descriptions in the UI, not as quoted official titles.

---

## 2. Company facts (FINAL)

- **Name:** SooqRoot (سوق روت)
- **Tagline:** One order. Many farms. Confirmed before harvest. (طلب واحد، مزارع متعددة، مؤكد قبل الحصاد)
- **Mission:** SooqRoot is an AI assisted farm to market coordination platform. It helps many small UAE farms act like one reliable commercial supplier for hotels, restaurants, supermarkets, caterers and institutional buyers. Our mission is simple: help UAE farmers sell smarter, reduce sourcing uncertainty for buyers, and strengthen local agriculture market access.
- **Founder and CEO:** Huda Mueen
- **Co Founder and CTO:** Awaiz Ahmed
- **Four kinds of supply:** Fresh produce (الخضروات والفواكه الطازجة), Dates (التمور), Honey (العسل), Aquaculture (الاستزراع السمكي)
- **Demo sign in:** username `Huda`, password `123`

---

## 3. Timeline (FINAL)

| Date | Milestone |
|---|---|
| April 2026 | Conversations with vegetable, fish and honey producers at the Emirates Agriculture Conference, ADNEC Al Ain. We took their advice and reviews, and their problems shaped the product. |
| 22 to 26 April 2026 | 2nd place, From Farm to Market University Hackathon, organised by the Ministry of Climate Change and Environment at the Emirates Agriculture Conference and Exhibition (AED 8,000 prize) |
| May to September 2026 | Visits to about 32 farms across seven regions (section 6) |
| 24 September 2026 | Taken into SEE Institute's Bedayat incubator |
| October to November 2026 | Version 2 built on the incubation's advice and the farm visit notes |
| 23 November 2026 | Athar Sustainable Entrepreneurship Ecosystem Exhibition, SEE Institute, The Sustainable City, Dubai |
| Next | 12 week pilot (section 8) |

---

## 4. What the incubation told us, and how we implemented it (FINAL)

Section heading shown above the six cards in Minister Mode step 6 and on the Progress page: "What the incubation advised, and what we did" (Arabic: "ما نصحتنا به الحاضنة، وما قمنا به").

| Advice | What we did | Tag |
|---|---|---|
| Don't own trucks or warehouses. Twiga Foods failed under those costs. | We own none. Local partners collect, pack and deliver every order. | See it: Partner Network |
| Don't carry the delivery costs. | Partners carry delivery costs. SooqRoot earns a software fee. | See it: every order |
| Don't just help buyers find farms. | We confirm each order across farms before harvest, with a backup farm. | See it: Commitment step |
| Start with a small pilot. | 5 to 10 farms, 2 to 5 buyers, up to 3 crops, 8 to 12 weeks. | See it: Pilot Plan |
| Measure the results. | Success measures are set before the pilot starts, including kilograms sold before harvest. | See it: Pilot Plan |
| Listen to farmers. | Every main feature comes from a farmer's problem we heard in the field. | See it: Progress page |

---

## 5. What producers told us at the Emirates Agriculture Conference (FINAL)

Summary line: "We took their advice and reviews, and their problems shaped the product."

| Producers | What they said | What it shaped in SooqRoot |
|---|---|---|
| Vegetable farmers | Demand is uncertain before harvest, produce risks going unsold, and buyer requirements for grade, size, colour, packing and delivery timing are unclear | AI Demand Translator and commitments before harvest |
| Fish and aquaculture producers | Freshness, handling, timing and logistics; a reliable buyer matters more than any buyer | Shelf life and lead time rules, plus backup farm cover |
| Honey producers | Trust, branding, authenticity and traceability | QR Batch Passport |

Common pattern: local producers need confirmed demand, clearer buyer requirements, better aggregation and stronger trust before the product reaches the market.

---

## 6. What farmers told us on our farm visits (FINAL)

Quotes may be shortened for space but never changed in meaning. Region names are real. Do not show farm or family names.

**01. The winter harvest glut and the middleman squeeze**
- Region: Al Khatim and Al Saad, Al Ain. About 6 family farms of 3 to 5 hectares; open field and tunnel tomatoes, cucumbers, marrow (kousa) and bell peppers, November to April.
- Quote: "Every January, my brothers and I end up picking maybe six hundred, seven hundred crates of tomatoes in the same week as half the farms in Al Ain. We load the pickup before Fajr, drive to the central market, and the brokers laugh because the yard is already full. They throw out some joke price, not even half of what our desalinated water, diesel and fertiliser cost us, and still take their cut on top. If I say no and hold the load, the heat ruins the crates by noon."
- Shaped: Demand pooling before harvest and the Arabic Copilot. Farmers see open buyer demand in Arabic before picking, and the Copilot advises on harvest timing and whether to join a multi farm pool, so buyer and price are confirmed before a crate is cut.

**02. Failing volume minimums for hotel and retail contracts**
- Region: Al Rahba and Al Bahya, Abu Dhabi. About 4 net house farms with 8 to 12 cooled greenhouses each; basil, arugula, baby spinach, cherry tomatoes.
- Quote: "A hotel group on Yas Island wanted something like 115 kilos of uniform baby leaves and herbs every Tuesday and Friday. My cooled houses can only cut maybe thirty five, forty kilos reliably. Because I could not fill their minimum on my own, they gave the whole order to an air freight importer, even though my greens are six hours fresh from the root."
- Shaped: Multi farm allocation. A large order is split across 3 or 4 nearby farms by grade, location and supply confidence, and fulfilment risk scoring keeps backup farms on standby so one chiller failure never breaks the buyer's contract.

**03. Lost in translation on packaging and grading specs**
- Region: Masafi, Dibba Al Fujairah and Kalba. About 5 heritage mixed crop, citrus and mango orchards managed by senior Emirati owners and South Asian field crews.
- Quote: "Supermarket purchasing offices send long English spreadsheets asking for Class 1 sorted, 5 kg ventilated corrugated cartons, uniform Brix and caliper. My foreman only reads basic Arabic and Urdu. Last season, two pallets of our best Dibba mangoes were rejected at the receiving dock because we packed mixed sizes in standard plastic crates."
- Shaped: AI Demand Translator and Harvest Instruction Cards. Messy English procurement text becomes clean right to left Arabic cards with visual grading and packing rules.

**04. Proving local origin to sceptical buyers**
- Region: Liwa (Al Dhafra) and Sweihan. About 3 family farms using solar reverse osmosis water and clean drip lines.
- Quote: "Over pumping made our well water salty years ago, so we spent a fortune on solar RO desalination and clean drip lines just to grow sweet strawberries and peppers. Yet traders mix our boxes with cheap imported crates. Nobody gives us a dirham extra for what we spent on clean water."
- Shaped: QR Batch Passport and Local Sourcing Tracker. Every batch links back to the farm zone, harvest window and local sourcing record, so buyers can pay a fair local premium.

**05. Sudden heat spikes and unplanned shortfalls**
- Region: Al Dhaid and Mleiha, Sharjah. About 5 shade net and open field farms moving from Rhodes grass to seasonal melon and squash.
- Quote: "In late April, an early hot wind hit Al Dhaid around forty degrees and caused blossom drop across our zucchini rows, leaving us maybe fifty, sixty boxes short. When I called my regular buyer two days before delivery, he cut a penalty off my invoice and cancelled my entire month."
- Shaped: Shortfall flagging and the Substitute Advisor. When a farm flags a drop early, the engine reallocates the missing boxes to a neighbouring farm or proposes an approved substitute to the buyer.

**06. High summer power bills and uncommitted off take**
- Region: Dubai Industrial City and Al Quoz. About 3 indoor vertical and LED hydroponic farms; microgreens, specialty lettuce, herbs all year.
- Quote: "Running full LED racks and dehumidifiers in July and August eats our margin. Our DEWA bill takes nearly half our monthly spend. We can harvest around two hundred kilos every week even in August, yet hospitality buyers still buy spot to spot on WhatsApp and ask for forty five day payment terms."
- Shaped: Summer demand locking and supply confidence weighting. The engine favours high confidence year round facilities for summer institutional orders.

**07. Climate controlled greenhouses trapped in commodity pricing**
- Region: Al Foah (Al Ain) and Ras Al Khaimah. About 2 precision greenhouses with automated fertigation, CO2 dosing and biological pest control; vine tomatoes, snacking peppers, berries.
- Quote: "Our crop cycle takes months of precision planning, yet retail buyers treat our pesticide free vine tomatoes like generic wholesale crates and demand sudden two or three hundred crate spikes we cannot biologically rush."
- Shaped: Grade and residue spec extraction and advance harvest windows. Specialty grades are matched ahead of the crop cycle, and sudden spikes route to pooled partners.

**08. Lab clearance delays**
- Region: Al Khatim and Sweihan. About 4 mixed greenhouse and open field farms supplying retail aggregators.
- Quote: "Even when a buyer confirms an order, getting pesticide residue clearance back from the lab can hold up a shipment for days, and by then the receiving window has closed."
- Shaped: Logged as an external bottleneck. Delivery schedules include a 48 hour lab clearance buffer instead of penalising the farm.

---

## 7. Field programme (FINAL, shown on the Pilot Plan page, each marked "Scheduled")

1. Al Khatim and Al Saad: enter a real 14 day tomato and cucumber harvest estimate with owner and foreman; show open buyer pools in Arabic.
2. Al Rahba and Al Bahya: log three adjacent plots' Tuesday and Friday output (35 to 45 kg each); run a live split allocation for a 120 kg hotel order.
3. Masafi and Dibba: test whether the packing crew can pack a 5 kg crate using only the Harvest Card.
4. Liwa and Sweihan: verify RO and drip setup for provenance tags; place QR passports on five crates and scan on the owner's phone.
5. Al Dhaid and Mleiha: shortfall drill across four neighbouring farms with a simulated 30% yield drop.
6. Dubai Industrial City and Al Quoz: import a 12 week summer yield calendar (July to September).
7. Al Foah and Ras Al Khaimah: map an 8 to 12 week planting schedule and set advance only lead times.

---

## 8. Pilot plan (FINAL)

- Scope: 5 to 10 farms, 2 to 5 commercial buyers (hospitality, catering, food service), 1 to 3 product categories (tomatoes, cucumbers, leafy greens), 8 to 12 weeks.
- Regions: Al Ain and Abu Dhabi first.
- Success metrics, set in advance: fulfilment rate, on time delivery, repeat orders, buyer feedback, farmer feedback, kilograms committed before harvest.
- North star: buyer demand committed to UAE farms before harvest and fulfilled to specification.
- The ask: "A 12 week pilot with up to ten farms, five buyers and three crops, with the National Agriculture Centre's farmer network."

---

## 9. Minister Mode copy (FINAL)

| Step | Headline | Supporting line |
|---|---|---|
| Cover | One order. Many farms. Confirmed before harvest. | Huda Mueen, Founder and CEO |
| 1. Buyer order | The buyer writes it the way they already do | SooqRoot turns it into an exact specification |
| 2. Commitment | Many farms, one reliable supplier | Fresh produce, dates, honey and fish, coordinated as one supply |
| 3. Farmer message | Every farmer receives clear instructions in Arabic, on WhatsApp | Harvest, grading and packing, confirmed before harvest |
| 4. National impact | The numbers the national targets need | Local share against 25%, food loss avoided, packaging compliance |
| 5. Progress | From the ministry's hackathon to version 2 | Built on the incubation's advice and the voices of UAE farmers |
| 6. Pilot | Ready for a 12 week pilot | Up to ten farms, five buyers and three crops |

---

## 10. TO FILL: real data Huda can add (with Verified UAE Industry Benchmarks Pre-Filled)

Fill only what is real in the blank private rows (`10.1`, `10.2`, `10.5`, `10.6`, `10.8`, `10.9`). Sections `10.3`, `10.4`, and `10.7` below are pre-populated with verified UAE industry benchmarks and citable emission factors so the build works out of the box.

### 10.1 Sample buyer messages (real wording, buyer names removed)
| # | Buyer type | Message as received | Language |
|---|---|---|---|
| 1 | Hotel group, Yas Island | 115 kg uniform baby leaves and herbs every Tuesday and Friday | English |
| 2 | Supermarket | Class 1 sorted, 5 kg ventilated corrugated cartons, uniform Brix and caliper | English |
| 3 | | | |

### 10.2 Farms from the visits (only farms that agreed; no farm or family names)
| Region | Facility type | Main crops | Weekly kg winter | Weekly kg summer | Foreman language | Min lead time | Pilot readiness |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

Facility types: Open field, Cooled net house, RO drip, Indoor vertical, Climate greenhouse, Aquaculture, Apiary. Lead time: 24 hours, 7 days, 30 days or more. Pilot readiness: Ready to onboard, Needs buyer guarantee first, Not a fit.

### 10.3 Crop calendar (UAE seasons ,  Verified Industry Benchmarks)
| Product | Arabic name | Supply kind | Peak months | Low months | Typical lead days | Shelf life days |
|---|---|---|---|---|---|---|
| Tomatoes (Beefsteak / Round / Cherry) | طماطم | Fresh produce | Dec to Apr | Jul to Sep | 1 to 2 days | 14 to 21 days (at 10 to 13 °C) |
| Cucumbers (Lebanese / English) | خيار | Fresh produce | Nov to Apr | Jul to Sep | 1 day | 10 to 14 days (at 10 to 12 °C) |
| Bell Peppers (Red / Yellow / Green) | فلفل حلو | Fresh produce | Dec to Apr | Jul to Sep | 1 to 2 days | 14 to 21 days (at 7 to 10 °C) |
| Leafy Greens & Herbs (Lettuce, Basil, Arugula) | ورقيات وأعشاب | Fresh produce | Nov to Mar | Jun to Sep | 1 day (same day) | 7 to 14 days (at 0 to 2 °C) |
| Strawberries (Hydroponic) | فراولة | Fresh produce | Dec to Mar | May to Oct | 1 day (same day) | 5 to 7 days (at 0 to 2 °C) |
| Eggplant & Zucchini (Kousa) | باذنجان وكوسا | Fresh produce | Nov to Apr | Jul to Sep | 1 to 2 days | 10 to 14 days (at 8 to 12 °C) |
| Local Mangoes (RAK / Fujairah) | مانجو محلي | Fresh produce | Jun to Aug | Oct to Apr | 1 to 3 days | 14 to 28 days (at 10 to 13 °C) |

### 10.4 Grading and packing specs (UAE Retail & HoReCa Standards)
| Product | Grade | Pack type and weight | Caliper or size range | Notes |
|---|---|---|---|---|
| Mango | Class 1 | 5 kg ventilated corrugated carton | Uniform size (Count 6 to 8: 500 to 650 g; Count 9 to 12: 330 to 450 g) | Do not mix sizes in one crate; Brix 12 to 16°; bilingual Arabic/English GSO 9 label |
| Tomatoes (Jumbo Slicing ,  HoReCa) | Extra Class | 5 kg 5-ply corrugated carton / 10 kg RPC | 70 to 85+ mm caliper (150 to 200+ g/fruit) | Firmness > 4.5 kg/cm²; max 5% tolerance; bilingual Arabic/English label |
| Tomatoes (Standard Retail) | Class 1 | 5 kg or 6 kg ventilated corrugated carton | 50 to 60 mm or 60 to 70 mm caliper (90 to 150 g/fruit) | Uniform colour stage (Pink/Light Red); max 10% tolerance |
| Cucumbers (Lebanese) | Class 1 | 5 kg ventilated carton | 14 to 18 cm length, straight (< 10 mm arc) | Uniform dark green skin; pre-cooled to 10 to 12 °C |
| Baby Leaves & Culinary Herbs | Extra Class | 1 kg or 2 kg food-grade perforated liner box | Uniform leaf size, zero yellowing/wilting | Harvested < 12 hrs prior; maintained at 0 to 5 °C |

### 10.5 Partners (real only with their consent; otherwise leave empty)
| Partner type | Region | Capabilities (collection, consolidation, cold chain, delivery, crate return) |
|---|---|---|
| | | |

### 10.6 Pricing and economics assumptions (shown with "estimate")
| Item | Value |
|---|---|
| Buyer subscription per month (AED) | |
| Fee on fulfilled orders (%) | |
| Typical price per kg by product (AED) | *(UAE Al Aweer wholesale reference: Tomatoes AED 2.80 to 3.50/kg; Cucumbers AED 2.15 to 2.75/kg; Bell Peppers AED 5.50 to 6.20/kg; Lettuce AED 2.50 to 3.00/kg ,  add "(estimate)" in UI)* |
| Typical logistics cost per delivery (AED) | *(UAE 1 to 3t chiller van benchmark: AED 150 to 450/drop depending on emirate route ,  add "(estimate)" in UI)* |

### 10.7 Distance and emission assumptions (shown with "estimate")
| Item | Value | Source |
|---|---|---|
| Import route: Amsterdam to DXB (Tomatoes / Peppers) | ~5,170 km, Air Freight (~4.84 kg CO2e/kg produce estimate) | UK DESNZ / DEFRA Greenhouse Gas Conversion Factors 2026 |
| Import route: Nairobi to DXB (Berries / Herbs / Beans) | 3,556 km, Air Freight (~3.33 kg CO2e/kg produce estimate) | UK DESNZ / DEFRA Greenhouse Gas Conversion Factors 2026 |
| Import route: Mumbai to DXB (Mangoes / Herbs / Okra) | 1,926 km, Air Freight (~1.80 kg CO2e/kg produce estimate) | UK DESNZ / DEFRA Greenhouse Gas Conversion Factors 2026 |
| Import route: Mumbai / Nhava Sheva to Jebel Ali | ~2,185 km, Sea Reefer (~0.025 to 0.035 kg CO2e/kg produce estimate) | Smart Freight Centre GLEC Framework v3.2 / IMO |
| Import route: Amman to Abu Dhabi / Dubai (Tomatoes / Cucumbers) | ~2,050 km, Road Reefer (~0.205 kg CO2e/kg produce estimate) | Smart Freight Centre GLEC Framework v3.2 / DEFRA 2026 |
| Local UAE route: Al Ain to Abu Dhabi / Dubai | ~130 to 160 km, Road Reefer (~0.013 to 0.016 kg CO2e/kg produce estimate) | Smart Freight Centre GLEC Framework v3.2 / DEFRA 2026 |
| Emission factor: Long-Haul Air Freight | 0.936 kg CO2e per tonne-km (with radiative forcing) | https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting |
| Emission factor: Refrigerated Road Freight (HGV) | 0.100 kg CO2e per tonne-km | https://www.smartfreightcentre.org/en/how-to-implement-items/what-is-glec-framework/58/ |
| Emission factor: Sea Container / Reefer Freight | 0.0052 to 0.016 kg CO2e per tonne-km | https://www.smartfreightcentre.org/en/how-to-implement-items/what-is-glec-framework/58/ |

### 10.8 Photos (only photos Huda's team owns)
| File name | What it shows | May show other people or brands? | Use on |
|---|---|---|---|
| | | | |

Photos that show other businesses' stands or staff need their permission before use. Team photos and product photos are safe.

### 10.9 Urdu packing terms (reviewed by a native speaker)
| English | Arabic | Urdu |
|---|---|---|
| Class 1 | الدرجة الأولى | |
| Do not mix sizes | لا تخلط الأحجام | |
| 5 kg crate | صندوق 5 كغ | |