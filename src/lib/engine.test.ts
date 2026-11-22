import { describe, expect, it } from 'vitest';
import {
  ADVANCE_ONLY_MIN_LEAD_DAYS,
  checkPackaging,
  EngineRequest,
  reallocateShortfall,
  runCommitmentEngine,
  weightsSum,
} from './engine';
import { Farm, FarmCapacityLine } from '../types';
import { FARMS } from '../data/farms';

/* ---------------- fixtures ---------------- */

function line(productId: string, expected: number, over: Partial<FarmCapacityLine> = {}): FarmCapacityLine {
  return {
    productId,
    expectedHarvest: expected,
    committed: 0,
    reserve: 0,
    unit: 'kg',
    harvestWindowStart: '2026-07-01',
    harvestWindowEnd: '2026-07-10',
    gradeProbability: { A: 90, B: 8 },
    packaging: ['5kg reusable crates'],
    ...over,
  };
}

function farm(id: string, over: Partial<Farm> = {}): Farm {
  const base: Farm = {
    id,
    code: id.toUpperCase().slice(0, 6),
    name: id,
    nameAr: id,
    area: 'Test',
    areaAr: 'اختبار',
    emirate: 'Abu Dhabi',
    x: 50,
    y: 50,
    lat: 24.5,
    lng: 55.0,
    distanceKm: 20,
    hectares: 5,
    growingMethod: 'Open field',
    region: 'Al Khatim',
    farmRegistrationNo: 'SR-FR-TEST-0001',
    provenanceTags: [],
    foremanLanguage: 'ar',
    advanceOnly: false,
    minLeadDays: 1,
    labClearancePending: false,
    facility: [],
    certifications: [],
    preferredLanguage: 'Arabic',
    contactName: 'Farm manager',
    fulfilmentRate: 92,
    qualityScore: 90,
    reliability: 90,
    joinedOn: '2026-01-01',
    status: 'healthy',
    capacity: [line('p-tomato', 3000)],
  };
  return { ...base, ...over };
}

const julyRequest: EngineRequest = {
  productId: 'p-tomato',
  qty: 1000,
  unit: 'kg',
  grade: 'A',
  requiredBy: '2026-07-12',
  placedOn: '2026-07-01',
  packaging: '5kg reusable crates',
  deliveryEmirate: 'Abu Dhabi',
  orderRef: 'T-1',
};

/* ---------------- tests ---------------- */

describe('commitment engine', () => {
  it('weights sum to 1', () => {
    expect(weightsSum()).toBeCloseTo(1, 10);
  });

  it('summer boost ranks an indoor farm above an equal open field farm in July', () => {
    const open = farm('open-a', { growingMethod: 'Open field' });
    const indoor = farm('indoor-a', { growingMethod: 'Indoor vertical', facility: ['indoor', 'cooling'] });
    const result = runCommitmentEngine(julyRequest, [open, indoor]);
    const ranks = result.candidates.map((c) => c.farm.id);
    expect(ranks[0]).toBe('indoor-a');
    expect(ranks.indexOf('indoor-a')).toBeLessThan(ranks.indexOf('open-a'));
  });

  it('excludes advance only farms from a 7 day order', () => {
    const locked = farm('climate-a', {
      growingMethod: 'Climate greenhouse',
      advanceOnly: true,
      minLeadDays: 30,
    });
    const pooled = farm('open-b');
    const shortOrder: EngineRequest = { ...julyRequest, requiredBy: '2026-07-08', placedOn: '2026-07-01' };
    const short = runCommitmentEngine(shortOrder, [locked, pooled]);
    expect(short.leadDays).toBe(7);
    expect(short.advanceOnlyExcluded).toContain('climate-a');
    expect([...short.primary, ...short.backup].some((a) => a.farmId === 'climate-a')).toBe(false);

    // The same farm is eligible once the lead time reaches the cycle window.
    const advance: EngineRequest = { ...julyRequest, requiredBy: '2026-08-15', placedOn: '2026-07-01' };
    expect(advance.requiredBy > shortOrder.requiredBy).toBe(true);
    const longLocked = farm('climate-a', {
      growingMethod: 'Climate greenhouse',
      advanceOnly: true,
      minLeadDays: 30,
      capacity: [line('p-tomato', 3000, { harvestWindowStart: '2026-08-01', harvestWindowEnd: '2026-08-12' })],
    });
    const long = runCommitmentEngine(advance, [longLocked]);
    expect(long.leadDays).toBeGreaterThanOrEqual(ADVANCE_ONLY_MIN_LEAD_DAYS);
    expect(long.primary.some((a) => a.farmId === 'climate-a')).toBe(true);
  });

  it('adds a 48 hour lab clearance buffer instead of a penalty', () => {
    const lab = farm('lab-a', { labClearancePending: true });
    const clear = farm('lab-b');
    const result = runCommitmentEngine(julyRequest, [lab, clear]);
    const labAlloc = result.primary.find((a) => a.farmId === 'lab-a');
    const clearAlloc = result.primary.find((a) => a.farmId === 'lab-b');
    expect(labAlloc?.rationale.join(' ')).toContain('48 hour lab clearance buffer');
    expect(labAlloc?.score).toBe(clearAlloc?.score);
  });

  it('assigns a cold chain partner to every aquaculture commitment', () => {
    const fish = FARMS.filter((f) => f.capacity.some((c) => c.productId === 'p-seabass'));
    expect(fish.length).toBeGreaterThanOrEqual(2);
    const result = runCommitmentEngine(
      {
        productId: 'p-seabass',
        qty: 600,
        unit: 'kg',
        grade: 'A',
        requiredBy: '2026-10-15',
        placedOn: '2026-09-08',
        deliveryEmirate: 'Abu Dhabi',
        orderRef: 'T-FISH',
      },
      FARMS
    );
    const all = [...result.primary, ...result.backup];
    expect(all.length).toBeGreaterThan(0);
    for (const a of all) {
      expect(a.partnerChain?.coldChain).toBeTruthy();
    }
  });

  it('is deterministic', () => {
    const a = runCommitmentEngine(julyRequest, FARMS);
    const b = runCommitmentEngine(julyRequest, FARMS);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('shortfall reallocation', () => {
  it('moves the shortfall to the backup farm', () => {
    const near = farm('short-a', { lat: 24.5, lng: 55.0, capacity: [line('p-tomato', 600)] });
    const backupFarm = farm('backup-a', {
      lat: 24.52,
      lng: 55.02,
      distanceKm: 60,
      capacity: [line('p-tomato', 800)],
    });
    const request: EngineRequest = { ...julyRequest, qty: 600 };
    const result = runCommitmentEngine(request, [near, backupFarm]);
    const primary = result.primary.find((a) => a.farmId === 'short-a');
    expect(primary).toBeTruthy();

    const actual = (primary?.qty ?? 0) - 200;
    const outcome = reallocateShortfall(result, 'short-a', actual, [near, backupFarm]);
    expect(outcome.shortfallKg).toBe(200);
    expect(outcome.reassigned.length).toBeGreaterThan(0);
    expect(outcome.reassigned[0].farmId).toBe('backup-a');
    expect(outcome.unresolvedKg).toBe(0);
    expect(outcome.substitute).toBeUndefined();
    const total = outcome.allocations.filter((a) => a.role === 'primary').reduce((s, a) => s + a.qty, 0);
    expect(total).toBe(result.primaryQty);
  });

  it('proposes an approved substitute when no backup fits', () => {
    const only = farm('only-a', { capacity: [line('p-tomato', 400), line('p-capsicum', 900)] });
    const request: EngineRequest = { ...julyRequest, qty: 400 };
    const result = runCommitmentEngine(request, [only]);
    const alloc = result.primary[0];
    const outcome = reallocateShortfall(result, 'only-a', alloc.qty - 150, [only]);
    expect(outcome.shortfallKg).toBe(150);
    expect(outcome.reassigned).toHaveLength(0);
    expect(outcome.unresolvedKg).toBe(150);
    expect(outcome.substitute?.productId).toBe('p-capsicum');
    expect(outcome.substitute?.requiresBuyerApproval).toBe(true);
  });
});

describe('packaging check', () => {
  it('flags styrofoam boxes', () => {
    const r = checkPackaging('We need tomatoes in styrofoam boxes', []);
    expect(r.status).toBe('flagged');
    expect(r.flags[0].item).toContain('Styrofoam');
    expect(r.flags[0].reason).toContain('Ministerial Decision No. 380 of 2022');
  });

  it('passes 5kg reusable crates', () => {
    const r = checkPackaging('5kg reusable crates', [{ packaging: '5kg reusable crates', reusable: true }]);
    expect(r.status).toBe('compliant');
    expect(r.flags).toHaveLength(0);
  });

  it('flags only listed items', () => {
    expect(checkPackaging('ventilated corrugated cartons with crate lids', []).status).toBe('compliant');
    expect(checkPackaging('plastic cutlery and straws', []).flags.length).toBe(2);
    expect(checkPackaging('single use bags of 30 microns', []).status).toBe('flagged');
  });

  it('recommends reusable crates when produce is not in reusable packing', () => {
    const r = checkPackaging('10kg cartons', []);
    expect(r.status).toBe('compliant');
    expect(r.recommendation).toBeTruthy();
  });
});
