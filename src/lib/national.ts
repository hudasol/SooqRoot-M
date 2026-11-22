import { Order, SupplyKind } from '../types';
import { CATEGORY_MIX, LPI_CURRENT_MONTH } from '../data/analytics';
import { SUPPLY_KINDS, supplyKindOf } from '../data/products';
import { LOCAL_SHARE_TARGET_PCT } from '../data/policy';
import { orderMiles } from './economics';
import { tripsSaved } from './emissions';

/* ============================================================
   National impact roll-up from the sample network.
   Every figure is an estimate computed from the order book.
   ============================================================ */

const KIND_OF_CATEGORY: Record<string, SupplyKind> = {
  Vegetables: 'fresh_produce',
  'Leafy greens': 'fresh_produce',
  Herbs: 'fresh_produce',
  Dates: 'dates',
  Honey: 'honey',
  Fish: 'aquaculture',
};

export interface KindShare {
  kind: SupplyKind;
  localPct: number;
  volumeKg: number;
}

/** Volume weighted local share by supply kind (sample network). */
export function localShareByKind(): KindShare[] {
  return SUPPLY_KINDS.map((kind) => {
    const rows = CATEGORY_MIX.filter((c) => KIND_OF_CATEGORY[c.category] === kind);
    const volume = rows.reduce((s, r) => s + r.volumeKg, 0);
    const weighted = rows.reduce((s, r) => s + r.localPct * r.volumeKg, 0);
    return { kind, volumeKg: volume, localPct: volume ? Math.round((weighted / volume) * 10) / 10 : 0 };
  });
}

export interface NationalImpact {
  localSharePct: number;
  targetPct: number;
  byKind: KindShare[];
  /** Kilograms committed before harvest on open orders. */
  committedBeforeHarvestKg: number;
  /** Route kilometres avoided against the typical import route, summed over orders. */
  kmAvoided: number;
  ordersWithRoute: number;
  tripsSaved: number;
  co2SavedKg: number;
  packagingCompliancePct: number;
  packagingCompliant: number;
  packagingTotal: number;
  crates: number;
}

export function nationalImpact(orders: Order[]): NationalImpact {
  const open = orders.filter((o) => o.status !== 'Delivered');
  const committedBeforeHarvestKg = open
    .filter((o) => o.unit === 'kg')
    .reduce((s, o) => s + o.committedQty, 0);

  let kmAvoided = 0;
  let withRoute = 0;
  let trips = 0;
  let co2 = 0;
  for (const o of orders) {
    const primary = o.allocations.filter((a) => a.role === 'primary' && a.qty > 0);
    if (primary.length === 0) continue;
    const m = orderMiles(o);
    if (m.kmAvoided != null) {
      kmAvoided += m.kmAvoided;
      withRoute += 1;
    }
    if (m.co2SavedKg != null) co2 += m.co2SavedKg;
    const kg = o.unit === 'kg' ? primary.reduce((s, a) => s + a.qty, 0) : 0;
    if (kg > 0) trips += tripsSaved(primary.length, kg).saved;
  }

  const compliant = orders.filter((o) => o.packagingStatus === 'compliant').length;
  return {
    localSharePct: LPI_CURRENT_MONTH,
    targetPct: LOCAL_SHARE_TARGET_PCT,
    byKind: localShareByKind(),
    committedBeforeHarvestKg,
    kmAvoided,
    ordersWithRoute: withRoute,
    tripsSaved: trips,
    co2SavedKg: co2,
    packagingCompliancePct: orders.length ? Math.round((compliant / orders.length) * 100) : 100,
    packagingCompliant: compliant,
    packagingTotal: orders.length,
    crates: orders.reduce((s, o) => s + o.crateCount, 0),
  };
}

export { supplyKindOf };
