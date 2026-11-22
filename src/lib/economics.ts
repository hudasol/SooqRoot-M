import { Order } from '../types';
import { FARM_MAP } from '../data/farms';
import { PARTNERS } from '../data/partners';
import { emirateFromLocation } from './engine';
import { foodMilesFor, localRouteKm, tripsSaved } from './emissions';

/* ============================================================
   Asset light economics (estimate)
   SooqRoot does not own trucks or warehouses. Logistics are
   carried by partners. SooqRoot earns a software fee.

   Fee and subscription are sample values: rows 10.6 of the data
   pack for these two items are empty. Drop costs come from the
   partner network (UAE 1 to 3 t chiller van range,
   AED 150 to 450 per drop, estimate).
   ============================================================ */

export const ECONOMICS = {
  /** Fee on fulfilled orders, percent of order value (estimate). */
  feePct: 3.5,
  /** Buyer subscription per month, AED (estimate). */
  subscriptionAedPerMonth: 2500,
};

export interface OrderEconomics {
  orderValueAed: number;
  feeAed: number;
  paidToFarmsAed: number;
  logisticsAed: number;
  farms: number;
  trips: { direct: number; consolidated: number; saved: number };
  /** Share of order value paid to UAE farms, percent. */
  farmSharePct: number;
}

function dropCost(partnerName: string | undefined): number {
  return PARTNERS.find((p) => p.name === partnerName)?.dropCostAed ?? 0;
}

export function orderEconomics(order: Order): OrderEconomics {
  const primary = order.allocations.filter((a) => a.role === 'primary' && a.qty > 0);
  const committedKg = primary.reduce((s, a) => s + a.qty, 0);
  const fee = Math.round(order.valueAed * (ECONOMICS.feePct / 100));
  const trips = tripsSaved(primary.length, committedKg);

  // One pickup per farm by the collection partner, plus the linehaul trips by the delivery partner.
  const pickups = primary.reduce((s, a) => s + dropCost(a.partnerChain?.collection), 0);
  const delivery = dropCost(primary[0]?.partnerChain?.delivery) * trips.consolidated;

  return {
    orderValueAed: order.valueAed,
    feeAed: fee,
    paidToFarmsAed: order.valueAed - fee,
    logisticsAed: pickups + delivery,
    farms: primary.length,
    trips,
    farmSharePct: order.valueAed ? Math.round(((order.valueAed - fee) / order.valueAed) * 1000) / 10 : 0,
  };
}

export interface OrderMiles {
  localKm: number;
  importKm: number | null;
  kmAvoided: number | null;
  co2SavedKg: number | null;
  routeLabel?: string;
  sourceKey?: 'defra' | 'glec';
}

/** Quantity weighted route length from the allocated farms, against the typical import route. */
export function orderMiles(order: Order): OrderMiles {
  const primary = order.allocations.filter((a) => a.role === 'primary' && a.qty > 0);
  const emirate = emirateFromLocation(order.deliveryLocation);
  const total = primary.reduce((s, a) => s + a.qty, 0) || 1;
  const localKm =
    primary.reduce((s, a) => {
      const farm = FARM_MAP[a.farmId];
      return s + (farm ? localRouteKm(farm, emirate) : 0) * a.qty;
    }, 0) / total;
  const unitKg = order.unit === 'kg' ? total : 0;
  const m = foodMilesFor(order.productId, unitKg, localKm);
  return {
    localKm: Math.round(localKm),
    importKm: m.importKm,
    kmAvoided: m.importKm == null ? null : Math.max(0, Math.round(m.importKm - localKm)),
    co2SavedKg: unitKg > 0 ? m.co2SavedKg : null,
    routeLabel: m.importRoute?.label,
    sourceKey: m.importRoute?.source,
  };
}
