import {
  CommitmentAllocation,
  Emirate,
  Farm,
  FarmCapacityLine,
  Grade,
  PackagingStatus,
  PartnerChain,
  Unit,
} from '../types';
import { FARMS } from '../data/farms';
import { getProduct, supplyKindOf } from '../data/products';
import { methodProfile, NET_HOUSE_UNCOOLED_SUMMER, isSummerMonth } from '../data/methods';
import { PARTNERS, Partner } from '../data/partners';
import { MIN_BAG_MICRONS, POLICY } from '../data/policy';

/* ============================================================
   SooqRoot Commitment Engine
   ------------------------------------------------------------
   Deterministic pre-harvest allocation. Given a buyer order it
   scores every farm in the network on eight weighted signals,
   then splits the order across farms under two risk rules:

     CONCENTRATION_CAP. No single farm carries more than 23%
     of one order (supply concentration risk).
     BACKUP_CAP. No single backup farm is asked to stand
     behind more than 5% of one order.

   Score = sum of weight x signal value (each signal 0 to 100).
   Weights sum to 1.00:

     0.20  supply confidence   reliability x method predictability
                               x summer multiplier (May to September)
     0.16  historical fulfilment
     0.16  grade match
     0.14  proximity           inverse distance, 1 / (1 + km / 25)
     0.10  harvest date fit
     0.10  lead time fit       order lead time against the farm's minimum
     0.07  packaging capability
     0.07  uncommitted headroom

   Method rules
     Supply confidence is multiplied by the growing method's
     predictability. From May to September the method's summer
     multiplier is applied: above 1 for Indoor vertical,
     Hydroponic, Climate greenhouse and cooled Net house, below 1
     for Open field.

   Advance only (cycle lock)
     Farms flagged advanceOnly accept orders with a lead time of
     21 days or more (the 21 to 45 day cycle window and beyond).
     Shorter orders are routed to pooled Open field and Net house
     farms, which release half of their buffer inventory.

   Lab clearance
     A farm with pesticide residue clearance pending gets a 48
     hour buffer in its delivery schedule. It is not penalised.

   Partners
     Every commitment names a collection, consolidation and
     delivery partner chosen by region and capability. Aquaculture
     always includes a cold chain partner.

   The same inputs always produce the same output. There is no
   randomness anywhere in this file.
   ============================================================ */

export const CONCENTRATION_CAP = 0.23;
export const BACKUP_CAP = 0.05;
/** Minimum lead time, in days, for advance only farms. */
export const ADVANCE_ONLY_MIN_LEAD_DAYS = 21;
/** Hours added to the delivery schedule while a lab clearance is pending. */
export const LAB_CLEARANCE_BUFFER_HOURS = 48;
/** Share of a pooled farm's reserve released as buffer inventory for short lead orders. */
export const BUFFER_RELEASE_SHARE = 0.5;
/** The sample "today" used to measure order lead time. */
export const SAMPLE_TODAY = '2026-09-15';

export const WEIGHTS = {
  confidence: 0.2,
  fulfilment: 0.16,
  grade: 0.16,
  proximity: 0.14,
  harvest: 0.1,
  leadTime: 0.1,
  packaging: 0.07,
  headroom: 0.07,
} as const;

export function weightsSum(): number {
  return Object.values(WEIGHTS).reduce((s, w) => s + w, 0);
}

/**
 * Allocations round down to a whole lot so crate counts stay clean.
 * Small orders use a finer lot than bulk ones.
 */
export function lotSize(qty: number): number {
  if (qty >= 2000) return 50;
  if (qty >= 500) return 25;
  return 10;
}

export interface EngineRequest {
  productId: string;
  qty: number;
  unit: Unit;
  grade: Grade;
  requiredBy: string;
  packaging?: string;
  buyerLocation?: string;
  orderRef?: string;
  /** Date the order was placed. Defaults to the sample date. */
  placedOn?: string;
  /** Emirate of the delivery point, used to pick the delivery partner. */
  deliveryEmirate?: Emirate;
}

export interface ScoredCandidate {
  farm: Farm;
  line: FarmCapacityLine;
  available: number;
  score: number;
  signals: EngineSignal[];
  eligibility: 'primary' | 'backup';
  reason: string;
  /** Extra notes shown with the allocation (lab buffer, advance only, pooled route). */
  notes: string[];
}

export interface EngineSignal {
  key: string;
  label: string;
  weight: number;
  /** 0-100 */
  value: number;
  note: string;
}

export interface EngineResult {
  request: EngineRequest;
  candidates: ScoredCandidate[];
  primary: CommitmentAllocation[];
  backup: CommitmentAllocation[];
  primaryQty: number;
  backupQty: number;
  coveragePct: number;
  shortfall: number;
  farmsEngaged: number;
  networkAvailable: number;
  /** Order lead time in days. */
  leadDays: number;
  /** Farms excluded because their cycle is locked for this lead time. */
  advanceOnlyExcluded: string[];
  /** Deterministic narrative of what the engine did, in order. */
  trace: string[];
}

/* ---------------- helpers ---------------- */

export function allocatable(line: FarmCapacityLine): number {
  return Math.max(0, line.expectedHarvest - line.committed - line.reserve);
}

function dayDiff(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

function floorTo(n: number, lot: number): number {
  return Math.floor(n / lot) * lot;
}

function gradeFit(line: FarmCapacityLine, grade: Grade): number {
  if (grade === 'A') return line.gradeProbability.A;
  if (grade === 'B') return clamp(line.gradeProbability.A + line.gradeProbability.B);
  return 100;
}

export function leadDaysFor(req: Pick<EngineRequest, 'requiredBy' | 'placedOn'>): number {
  return dayDiff(req.placedOn ?? SAMPLE_TODAY, req.requiredBy);
}

/** Summer multiplier for a farm in the month of delivery. 1 outside May to September. */
export function summerFactor(farm: Farm, requiredBy: string): number {
  const month = new Date(requiredBy).getUTCMonth();
  if (!isSummerMonth(month)) return 1;
  if (farm.growingMethod === 'Net house' && !farm.facility.includes('cooling')) {
    return NET_HOUSE_UNCOOLED_SUMMER;
  }
  return methodProfile[farm.growingMethod].summerMultiplier;
}

export function supplyConfidence(farm: Farm, requiredBy: string): number {
  const profile = methodProfile[farm.growingMethod];
  return clamp(farm.reliability * profile.predictability * summerFactor(farm, requiredBy));
}

/* ---------------- scoring ---------------- */

export function scoreFarm(
  farm: Farm,
  line: FarmCapacityLine,
  req: EngineRequest,
  extraAvailable = 0
): { score: number; signals: EngineSignal[] } {
  const available = allocatable(line) + extraAvailable;
  const slackDays = dayDiff(line.harvestWindowEnd, req.requiredBy);
  const lead = leadDaysFor(req);
  const summer = summerFactor(farm, req.requiredBy);
  const predictability = methodProfile[farm.growingMethod].predictability;

  const confidenceValue = supplyConfidence(farm, req.requiredBy);
  const proximityValue = clamp(100 / (1 + farm.distanceKm / 25));
  // Ideal: harvest lands 1-6 days before the delivery date.
  const harvestValue =
    slackDays < 0 ? clamp(45 + slackDays * 6) : clamp(100 - Math.abs(slackDays - 3) * 7);
  const leadValue = lead < farm.minLeadDays ? 0 : clamp(60 + (lead - farm.minLeadDays) * 8);
  const packagingValue = req.packaging
    ? line.packaging.some((p) => p.toLowerCase().includes(req.packaging!.toLowerCase().slice(0, 6)))
      ? 100
      : 58
    : 85;
  const headroomValue = clamp((available / Math.max(1, line.expectedHarvest)) * 100);
  const gradeValue = gradeFit(line, req.grade);

  const signals: EngineSignal[] = [
    {
      key: 'confidence',
      label: 'Supply confidence',
      weight: WEIGHTS.confidence,
      value: confidenceValue,
      note: `Reliability ${farm.reliability} x ${predictability} ${farm.growingMethod} predictability${
        summer !== 1 ? ` x ${summer} summer factor` : ''
      }`,
    },
    {
      key: 'fulfilment',
      label: 'Historical fulfilment',
      weight: WEIGHTS.fulfilment,
      value: farm.fulfilmentRate,
      note: `${farm.fulfilmentRate}% of committed volume delivered in full`,
    },
    {
      key: 'grade',
      label: 'Grade match',
      weight: WEIGHTS.grade,
      value: gradeValue,
      note: `Grade ${req.grade} probability ${Math.round(gradeValue)}%`,
    },
    {
      key: 'proximity',
      label: 'Proximity (1 / km)',
      weight: WEIGHTS.proximity,
      value: proximityValue,
      note: `${farm.distanceKm} km to consolidation point (estimate)`,
    },
    {
      key: 'harvest',
      label: 'Harvest date fit',
      weight: WEIGHTS.harvest,
      value: harvestValue,
      note:
        slackDays < 0
          ? `Window closes ${Math.abs(slackDays)}d after delivery date`
          : `Harvest completes ${slackDays}d before delivery`,
    },
    {
      key: 'leadTime',
      label: 'Lead time fit',
      weight: WEIGHTS.leadTime,
      value: leadValue,
      note: `${lead} day lead time against a ${farm.minLeadDays} day minimum`,
    },
    {
      key: 'packaging',
      label: 'Packaging capability',
      weight: WEIGHTS.packaging,
      value: packagingValue,
      note: line.packaging.join(', '),
    },
    {
      key: 'headroom',
      label: 'Uncommitted headroom',
      weight: WEIGHTS.headroom,
      value: headroomValue,
      note: `${available.toLocaleString()} ${line.unit} free of ${line.expectedHarvest.toLocaleString()} expected`,
    },
  ];

  const score = signals.reduce((sum, s) => sum + s.value * s.weight, 0);
  return { score: Math.round(score * 10) / 10, signals };
}

/* ---------------- partners ---------------- */

export function emirateFromLocation(location?: string): Emirate {
  const l = (location ?? '').toLowerCase();
  if (l.startsWith('dubai')) return 'Dubai';
  if (l.startsWith('sharjah')) return 'Sharjah';
  if (l.startsWith('fujairah')) return 'Fujairah';
  if (l.startsWith('ras al khaimah')) return 'Ras Al Khaimah';
  if (l.startsWith('al ain')) return 'Al Ain Region';
  return 'Abu Dhabi';
}

function byCost(a: Partner, b: Partner): number {
  return a.dropCostAed - b.dropCostAed || a.id.localeCompare(b.id);
}

/**
 * Chooses the collection, consolidation and delivery partners for one farm.
 * Aquaculture always receives a cold chain partner.
 */
export function assignPartners(
  farm: Farm,
  deliveryEmirate: Emirate,
  productId: string,
  partners: Partner[] = PARTNERS
): PartnerChain {
  const needsCold = supplyKindOf(productId) === 'aquaculture';
  const has = (p: Partner, c: Partner['capabilities'][number]) => p.capabilities.includes(c);

  const inRegion = partners.filter((p) => p.regions.includes(farm.region));
  const collectors = inRegion.filter((p) => has(p, 'collection') && (!needsCold || has(p, 'cold_chain')));
  const collection =
    [...collectors].sort(byCost)[0] ??
    [...partners.filter((p) => has(p, 'collection') && (!needsCold || has(p, 'cold_chain')))].sort(byCost)[0] ??
    [...partners.filter((p) => has(p, 'collection'))].sort(byCost)[0];

  const consolidators = [
    ...inRegion.filter((p) => has(p, 'consolidation')),
    ...partners.filter((p) => has(p, 'consolidation') && p.deliversTo.includes(deliveryEmirate)),
  ];
  const consolidation =
    (collection && has(collection, 'consolidation') ? collection : undefined) ??
    [...consolidators].sort(byCost)[0] ??
    [...partners.filter((p) => has(p, 'consolidation'))].sort(byCost)[0] ??
    collection;

  const deliverers = partners.filter(
    (p) => has(p, 'delivery') && p.deliversTo.includes(deliveryEmirate) && (!needsCold || has(p, 'cold_chain'))
  );
  const delivery =
    [...deliverers].sort(byCost)[0] ??
    [...partners.filter((p) => has(p, 'delivery') && (!needsCold || has(p, 'cold_chain')))].sort(byCost)[0] ??
    [...partners.filter((p) => has(p, 'delivery'))].sort(byCost)[0];

  const chain: PartnerChain = {
    collection: collection?.name ?? 'To be confirmed',
    consolidation: consolidation?.name ?? 'To be confirmed',
    delivery: delivery?.name ?? 'To be confirmed',
  };
  if (needsCold) {
    const cold =
      [collection, delivery, consolidation].find((p): p is Partner => !!p && has(p, 'cold_chain')) ??
      [...partners.filter((p) => has(p, 'cold_chain'))].sort(byCost)[0];
    chain.coldChain = cold?.name ?? 'To be confirmed';
  }
  return chain;
}

/* ---------------- allocation ---------------- */

function batchId(orderRef: string, farm: Farm, index: number): string {
  return `${orderRef}-${farm.code}-${String(index + 1).padStart(2, '0')}`;
}

function commitmentDate(line: FarmCapacityLine, requiredBy: string, bufferHours = 0): string {
  const end = new Date(line.harvestWindowEnd);
  const target = new Date(requiredBy);
  target.setDate(target.getDate() - 1 - Math.ceil(bufferHours / 24));
  return (end < target ? end : target).toISOString().slice(0, 10);
}

export function runCommitmentEngine(req: EngineRequest, farms: Farm[] = FARMS): EngineResult {
  const orderRef = req.orderRef ?? 'SR-ORD';
  const trace: string[] = [];
  const product = getProduct(req.productId);
  const lot = lotSize(req.qty);
  const lead = leadDaysFor(req);
  const deliveryEmirate = req.deliveryEmirate ?? emirateFromLocation(req.buyerLocation);

  /* 1 - gather candidates across every harvest window in the network */
  const candidates: ScoredCandidate[] = [];
  const advanceOnlyExcluded: string[] = [];
  const locked = lead < ADVANCE_ONLY_MIN_LEAD_DAYS;

  for (const farm of farms) {
    for (const line of farm.capacity) {
      if (line.productId !== req.productId) continue;

      // Cycle lock: advance only farms accept orders of 21 days or more.
      if (farm.advanceOnly && locked) {
        if (!advanceOnlyExcluded.includes(farm.id)) advanceOnlyExcluded.push(farm.id);
        continue;
      }

      // Pooled open field and net house farms release buffer inventory for short orders.
      const pooledRoute = locked && (farm.growingMethod === 'Open field' || farm.growingMethod === 'Net house');
      const buffer = pooledRoute ? Math.floor(line.reserve * BUFFER_RELEASE_SHARE) : 0;
      const available = allocatable(line) + buffer;
      if (available <= 0) continue;

      // Freshness gate - produce harvested more than one shelf life before the
      // delivery date cannot serve this order at all.
      const slackDays = dayDiff(line.harvestWindowEnd, req.requiredBy);
      if (slackDays > product.shelfLifeDays) continue;

      // Lead time gate - a farm cannot serve an order inside its minimum lead time.
      if (lead < farm.minLeadDays) continue;

      const { score, signals } = scoreFarm(farm, line, req, buffer);
      const windowEndsAfterDelivery = slackDays < 0;
      const gradeTooLow = gradeFit(line, req.grade) < 60;

      const eligibility: 'primary' | 'backup' =
        windowEndsAfterDelivery || gradeTooLow ? 'backup' : 'primary';

      const notes: string[] = [];
      if (farm.advanceOnly) {
        notes.push(
          `Advance only cycle: the ${lead} day lead time fits the ${ADVANCE_ONLY_MIN_LEAD_DAYS} day cycle lock.`
        );
      }
      if (pooledRoute) {
        notes.push(
          `Pooled route: advance only farms are locked for a ${lead} day order, so ${farm.growingMethod} supply is used with ${buffer.toLocaleString()} ${line.unit} of buffer inventory.`
        );
      }
      if (farm.labClearancePending) {
        notes.push(`${LAB_CLEARANCE_BUFFER_HOURS} hour lab clearance buffer added to the delivery schedule.`);
      }

      const reason = windowEndsAfterDelivery
        ? `Harvest window closes ${new Date(line.harvestWindowEnd).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })}. After the delivery date, so held as backup cover.`
        : gradeTooLow
          ? `Grade ${req.grade} probability below the 60% primary threshold, held as backup cover.`
          : `Harvest completes ${slackDays}d before delivery, inside the ${product.shelfLifeDays}-day freshness window.`;

      candidates.push({ farm, line, available, score, signals, eligibility, reason, notes });
    }
  }

  candidates.sort((a, b) => b.score - a.score || a.farm.distanceKm - b.farm.distanceKm || a.farm.id.localeCompare(b.farm.id));

  const networkAvailable = candidates.reduce((s, c) => s + c.available, 0);
  trace.push(
    `Scanned ${farms.length} farms. ${candidates.length} harvest windows carry ${product.name} inside the ${product.shelfLifeDays}-day freshness window (${networkAvailable.toLocaleString()} ${req.unit} available).`
  );
  if (advanceOnlyExcluded.length > 0) {
    trace.push(
      `${advanceOnlyExcluded.length} advance only farms excluded: a ${lead} day order is inside the ${ADVANCE_ONLY_MIN_LEAD_DAYS} day cycle lock. Routed to pooled open field and net house farms with buffer inventory.`
    );
  }

  const primaryPool = candidates.filter((c) => c.eligibility === 'primary');
  const backupPool = candidates.filter((c) => c.eligibility === 'backup');
  trace.push(
    `${primaryPool.length} clear the primary gate (harvest completes by ${req.requiredBy}, grade ${req.grade} probability at least 60%). ${backupPool.length} held as backup cover.`
  );

  // Concentration limit spreads supply risk, but never below an even split of
  // the order across the eligible pool - the cap must not cause an under-fill.
  const evenSplit = req.qty / Math.max(1, primaryPool.length);
  const perFarmCap = floorTo(Math.max(req.qty * CONCENTRATION_CAP, evenSplit), lot);
  trace.push(
    `Concentration limit applied: ${perFarmCap.toLocaleString()} ${req.unit} per farm, the greater of ${Math.round(
      CONCENTRATION_CAP * 100
    )}% of the order and an even split across ${primaryPool.length} eligible windows.`
  );

  /* 2 - allocate primary */
  const primary: CommitmentAllocation[] = [];
  let remaining = req.qty;
  primaryPool.forEach((cand, i) => {
    if (remaining <= 0) return;
    const take = floorTo(Math.min(cand.available, perFarmCap, remaining), lot);
    if (take <= 0) return;
    remaining -= take;
    primary.push({
      id: `alloc-p-${i}`,
      farmId: cand.farm.id,
      qty: take,
      unit: req.unit,
      score: cand.score,
      role: 'primary',
      confidence: Math.round(clamp(cand.score + (cand.farm.fulfilmentRate - 90) * 0.4)),
      harvestDate: commitmentDate(cand.line, req.requiredBy, cand.farm.labClearancePending ? LAB_CLEARANCE_BUFFER_HOURS : 0),
      batchId: batchId(orderRef, cand.farm, i),
      partnerChain: assignPartners(cand.farm, deliveryEmirate, req.productId),
      rationale: [
        `Score ${cand.score.toFixed(1)}, rank ${i + 1} of ${primaryPool.length} eligible farms.`,
        take === perFarmCap
          ? `Capped at the ${Math.round(CONCENTRATION_CAP * 100)}% concentration limit.`
          : `Full uncommitted volume of ${cand.available.toLocaleString()} ${req.unit} taken.`,
        `${cand.farm.distanceKm} km out, ${cand.farm.fulfilmentRate}% historical fulfilment, Grade ${req.grade} probability ${Math.round(gradeFit(cand.line, req.grade))}%.`,
        ...cand.notes,
      ],
    });
  });

  const primaryQty = primary.reduce((s, a) => s + a.qty, 0);
  trace.push(
    `Primary commitment built across ${primary.length} farms, ${primaryQty.toLocaleString()} ${req.unit} of ${req.qty.toLocaleString()} ${req.unit} requested.`
  );

  /* 3 - backup cover */
  const shortfall = Math.max(0, req.qty - primaryQty);
  const backupPerFarmCap = Math.max(lot, floorTo(req.qty * BACKUP_CAP, lot));
  const backupTarget = Math.max(shortfall, backupPerFarmCap);
  const backup: CommitmentAllocation[] = [];
  let backupRemaining = backupTarget;

  backupPool.forEach((cand, i) => {
    if (backupRemaining <= 0) return;
    const take = floorTo(Math.min(cand.available, backupPerFarmCap, backupRemaining), lot);
    if (take <= 0) return;
    backupRemaining -= take;
    backup.push({
      id: `alloc-b-${i}`,
      farmId: cand.farm.id,
      qty: take,
      unit: req.unit,
      score: cand.score,
      role: 'backup',
      confidence: Math.round(clamp(cand.score - 6)),
      harvestDate: cand.line.harvestWindowEnd,
      batchId: batchId(orderRef, cand.farm, primary.length + i),
      partnerChain: assignPartners(cand.farm, deliveryEmirate, req.productId),
      rationale: [cand.reason, `Backup cover capped at ${Math.round(BACKUP_CAP * 100)}% of order volume per farm.`, ...cand.notes],
    });
  });

  // Backup cover can also come from primary eligible farms with headroom left over.
  if (backupRemaining > 0) {
    const usedIds = new Set([...primary, ...backup].map((a) => a.farmId));
    primaryPool.forEach((cand, i) => {
      if (backupRemaining <= 0 || usedIds.has(cand.farm.id)) return;
      const take = floorTo(Math.min(cand.available, backupPerFarmCap, backupRemaining), lot);
      if (take <= 0) return;
      backupRemaining -= take;
      usedIds.add(cand.farm.id);
      backup.push({
        id: `alloc-b-x${i}`,
        farmId: cand.farm.id,
        qty: take,
        unit: req.unit,
        score: cand.score,
        role: 'backup',
        confidence: Math.round(clamp(cand.score - 6)),
        harvestDate: cand.line.harvestWindowEnd,
        batchId: batchId(orderRef, cand.farm, primary.length + backup.length),
        partnerChain: assignPartners(cand.farm, deliveryEmirate, req.productId),
        rationale: [
          'Held as backup cover from remaining headroom.',
          `Backup cover capped at ${Math.round(BACKUP_CAP * 100)}% of order volume per farm.`,
          ...cand.notes,
        ],
      });
    });
  }

  const backupQty = backup.reduce((s, a) => s + a.qty, 0);
  if (shortfall > 0) {
    trace.push(
      `Shortfall of ${shortfall.toLocaleString()} ${req.unit} covered by ${backup.length} backup farms (${backupQty.toLocaleString()} ${req.unit}).`
    );
  } else {
    trace.push(
      `Order fully covered by primary farms. ${backupQty.toLocaleString()} ${req.unit} of backup cover held as insurance.`
    );
  }

  const coveragePct = Math.min(100, Math.round(((primaryQty + backupQty) / req.qty) * 100));
  trace.push(`Fulfilment coverage ${coveragePct}%, commitment pack ready to issue to farms.`);

  return {
    request: req,
    candidates,
    primary,
    backup,
    primaryQty,
    backupQty,
    coveragePct,
    shortfall,
    farmsEngaged: primary.length + backup.length,
    networkAvailable,
    leadDays: lead,
    advanceOnlyExcluded,
    trace,
  };
}

/* ============================================================
   Packaging check
   Flags only the items prohibited since 1 January 2026 under
   Ministerial Decision No. 380 of 2022 and recommends reusable
   crates for produce (Federal Law No. 12 of 2018).
   ============================================================ */

export interface PackagingFlag {
  item: string;
  reason: string;
  alternative: string;
}

export interface PackagingCheck {
  status: PackagingStatus;
  flags: PackagingFlag[];
  /** Advice that is not a flag, for example a switch to reusable crates. */
  recommendation?: string;
  reusable: boolean;
}

const PROHIBITED_REASON = `Prohibited since 1 January 2026 under ${POLICY.SINGLE_USE_DECISION.en}.`;
const QUALIFIER = '(?:plastic|paper|disposable|single[ -]use|foam|styrofoam|polystyrene|beverage|drink(?:ing)?|coffee)';

const PROHIBITED_PATTERNS: { item: string; test: (t: string) => boolean; alternative: string }[] = [
  {
    item: 'Styrofoam food containers and boxes',
    test: (t) => /styrofoam|polystyrene|foam (?:box|boxes|container|containers|tray|trays)/.test(t),
    alternative: 'Use 5 kg reusable crates or ventilated corrugated cartons.',
  },
  {
    item: `Single use bags thinner than ${MIN_BAG_MICRONS} microns`,
    test: (t) => {
      const thin = [...t.matchAll(/(\d+)\s*(?:microns?|µm|um)\b/g)].some((m) => Number(m[1]) < MIN_BAG_MICRONS);
      const bagWord = /\b(?:bag|bags)\b/.test(t);
      if (bagWord && thin) return true;
      return new RegExp(`${QUALIFIER}\\s+(?:carrier\\s+)?bags?\\b`).test(t) && !/reusable/.test(t);
    },
    alternative: `Use reusable crates, or bags of ${MIN_BAG_MICRONS} microns or thicker.`,
  },
  {
    item: 'Cutlery (spoons, forks, knives, chopsticks)',
    test: (t) => /\b(?:plastic|disposable|single[ -]use|paper|wooden)\s+(?:cutlery|spoons?|forks?|knives|chopsticks)\b/.test(t) || /\bcutlery\b/.test(t),
    alternative: 'Supply reusable or compostable alternatives outside the prohibited list.',
  },
  {
    item: 'Plates',
    test: (t) => new RegExp(`${QUALIFIER}\\s+plates?\\b`).test(t),
    alternative: 'Use reusable plates.',
  },
  {
    item: 'Beverage cups and lids',
    test: (t) => new RegExp(`${QUALIFIER}\\s+(?:cups?|lids?)\\b`).test(t),
    alternative: 'Use reusable cups and lids.',
  },
  {
    item: 'Straws',
    test: (t) => /\bstraws\b/.test(t) || new RegExp(`${QUALIFIER}\\s+straw\\b`).test(t),
    alternative: 'Serve without straws or use a reusable straw.',
  },
  {
    item: 'Stirrers',
    test: (t) => /\bstirrers?\b/.test(t),
    alternative: 'Use a reusable stirrer.',
  },
];

export function checkPackaging(
  text: string,
  lines: { packaging?: string; reusable?: boolean }[] = []
): PackagingCheck {
  const haystack = [text, ...lines.map((l) => l.packaging ?? '')].join(' . ').toLowerCase();
  const flags: PackagingFlag[] = PROHIBITED_PATTERNS.filter((p) => p.test(haystack)).map((p) => ({
    item: p.item,
    reason: PROHIBITED_REASON,
    alternative: p.alternative,
  }));

  const reusable =
    /reusable|returnable|\brpc\b/.test(haystack) || (lines.length > 0 && lines.every((l) => l.reusable === true));
  const recommendation =
    flags.length === 0 && !reusable
      ? `Use reusable crates for produce. ${POLICY.WASTE_LAW.en}: ${POLICY.WASTE_LAW.fact.toLowerCase()}.`
      : undefined;

  return {
    status: flags.length > 0 ? 'flagged' : 'compliant',
    flags,
    recommendation,
    reusable,
  };
}

/** Crates needed for a quantity, rounded up. Default crate is 5 kg. */
export function crateCountForKg(qtyKg: number, crateKg = 5): number {
  return Math.ceil(qtyKg / crateKg);
}

/* ============================================================
   Shortfall reallocation
   A farm reports less than it committed. The gap goes to the
   nearest backup farm with the same product and grade. When no
   backup fits, an approved substitute is proposed to the buyer.
   ============================================================ */

/** Approved substitutes the buyer is asked to accept when no farm can cover the gap. */
export const APPROVED_SUBSTITUTES: Record<string, string[]> = {
  'p-tomato': ['p-capsicum'],
  'p-cucumber': ['p-eggplant'],
  'p-leafy': ['p-herbs'],
  'p-herbs': ['p-leafy'],
  'p-capsicum': ['p-tomato'],
  'p-eggplant': ['p-cucumber'],
};

export interface ShortfallReassignment {
  farmId: string;
  qty: number;
  distanceKm: number;
}

export interface SubstituteProposal {
  productId: string;
  farmId: string;
  qty: number;
  requiresBuyerApproval: true;
}

export interface ShortfallResult {
  farmId: string;
  allocatedKg: number;
  actualKg: number;
  shortfallKg: number;
  reassigned: ShortfallReassignment[];
  /** Kilograms no backup farm could take. */
  unresolvedKg: number;
  substitute?: SubstituteProposal;
  /** The commitment after the change: the farm's allocation reduced, backups promoted. */
  allocations: CommitmentAllocation[];
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function reallocateShortfall(
  result: EngineResult,
  farmId: string,
  actualKg: number,
  farms: Farm[] = FARMS
): ShortfallResult {
  const base = [...result.primary, ...result.backup];
  const current = result.primary.find((a) => a.farmId === farmId);
  const allocatedKg = current?.qty ?? 0;
  const shortfallKg = Math.max(0, allocatedKg - Math.max(0, actualKg));
  const source = farms.find((f) => f.id === farmId);

  const allocations: CommitmentAllocation[] = base.map((a) =>
    a.role === 'primary' && a.farmId === farmId
      ? {
          ...a,
          qty: Math.min(a.qty, Math.max(0, actualKg)),
          rationale: [...a.rationale, `Farm reported ${Math.max(0, actualKg).toLocaleString()} ${a.unit}. Shortfall of ${shortfallKg.toLocaleString()} ${a.unit} reallocated.`],
        }
      : a
  );

  const reassigned: ShortfallReassignment[] = [];
  let left = shortfallKg;

  if (left > 0 && source) {
    const usedByFarm = (id: string) =>
      allocations.filter((a) => a.role === 'primary' && a.farmId === id).reduce((s, a) => s + a.qty, 0);
    const lot = lotSize(result.request.qty);

    // Backup candidates first, then any other candidate with grade fit, nearest to the short farm.
    const options = result.candidates
      .filter((c) => c.farm.id !== farmId && gradeFit(c.line, result.request.grade) >= 60)
      .map((c) => ({
        cand: c,
        km: source ? haversineKm(source, c.farm) : c.farm.distanceKm,
        free: Math.max(0, c.available - usedByFarm(c.farm.id)),
        isBackup: allocations.some((a) => a.role === 'backup' && a.farmId === c.farm.id),
      }))
      .filter((o) => o.free > 0)
      .sort((a, b) => Number(b.isBackup) - Number(a.isBackup) || a.km - b.km || a.cand.farm.id.localeCompare(b.cand.farm.id));

    for (const o of options) {
      if (left <= 0) break;
      const take = Math.min(left, floorTo(o.free, Math.min(lot, 10)) || o.free);
      if (take <= 0) continue;
      left -= take;
      reassigned.push({ farmId: o.cand.farm.id, qty: take, distanceKm: Math.round(o.km * 10) / 10 });
      const existingBackup = allocations.findIndex((a) => a.role === 'backup' && a.farmId === o.cand.farm.id);
      const promoted: CommitmentAllocation = {
        id: `alloc-r-${o.cand.farm.id}`,
        farmId: o.cand.farm.id,
        qty: take,
        unit: result.request.unit,
        score: o.cand.score,
        role: 'primary',
        confidence: Math.round(clamp(o.cand.score - 3)),
        harvestDate: o.cand.line.harvestWindowEnd,
        batchId: `${result.request.orderRef ?? 'SR-ORD'}-${o.cand.farm.code}-R`,
        partnerChain: assignPartners(o.cand.farm, result.request.deliveryEmirate ?? emirateFromLocation(result.request.buyerLocation), result.request.productId),
        rationale: [
          `Shortfall cover: ${take.toLocaleString()} ${result.request.unit} moved from ${source.name}, ${Math.round(o.km)} km away.`,
        ],
      };
      if (existingBackup >= 0) {
        const eb = allocations[existingBackup];
        allocations[existingBackup] = { ...eb, qty: Math.max(0, eb.qty - take) };
      }
      allocations.push(promoted);
    }
  }

  let substitute: SubstituteProposal | undefined;
  if (left > 0) {
    for (const subId of APPROVED_SUBSTITUTES[result.request.productId] ?? []) {
      const pick = farms
        .flatMap((f) => f.capacity.filter((c) => c.productId === subId).map((c) => ({ f, c })))
        .filter(({ c }) => allocatable(c) >= left)
        .sort((a, b) => (source ? haversineKm(source, a.f) - haversineKm(source, b.f) : 0) || a.f.id.localeCompare(b.f.id))[0];
      if (pick) {
        substitute = { productId: subId, farmId: pick.f.id, qty: left, requiresBuyerApproval: true };
        break;
      }
    }
  }

  return {
    farmId,
    allocatedKg,
    actualKg: Math.max(0, actualKg),
    shortfallKg,
    reassigned,
    unresolvedKg: left,
    substitute,
    allocations: allocations.filter((a) => a.qty > 0),
  };
}

/** The scenario the Control Tower and Commitment Engine pages open with. */
export const CANONICAL_REQUEST: EngineRequest = {
  productId: 'p-tomato',
  qty: 10000,
  unit: 'kg',
  grade: 'A',
  requiredBy: '2026-10-22',
  packaging: '5kg reusable crates',
  buyerLocation: 'Abu Dhabi',
  deliveryEmirate: 'Abu Dhabi',
  orderRef: 'SR-2610',
  placedOn: '2026-09-11',
};
