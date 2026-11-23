import { Emirate, Farm } from '../types';
import { getProduct } from '../data/products';

/* ============================================================
   Food miles and emissions (estimate)
   Distances and factors come from data pack section 10.7.
   CO2e is shown only for products that have an import route
   reference in the pack, and always with its source.

   Per kilogram of produce:
     kg CO2e = route km x emission factor (kg per tonne km) / 1000
   ============================================================ */

export const SOURCES = {
  defra: {
    label: 'UK DESNZ / DEFRA Greenhouse Gas Conversion Factors 2026',
    short: 'DEFRA 2026',
    url: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
  },
  glec: {
    label: 'Smart Freight Centre GLEC Framework v3.2',
    short: 'GLEC v3.2',
    url: 'https://www.smartfreightcentre.org/en/how-to-implement-items/what-is-glec-framework/58/',
  },
} as const;

export type RouteMode = 'air' | 'road' | 'sea';

export interface ImportRoute {
  id: string;
  label: string;
  labelAr: string;
  km: number;
  mode: RouteMode;
  /** kg CO2e per tonne km */
  factor: number;
  source: keyof typeof SOURCES;
  productIds: string[];
}

/** Emission factors, kg CO2e per tonne km. */
export const FACTORS = {
  airLongHaul: { value: 0.936, note: 'Long haul air freight, with radiative forcing', source: 'defra' as const },
  roadReefer: { value: 0.1, note: 'Refrigerated road freight (HGV)', source: 'glec' as const },
  seaReefer: { value: 0.0052, note: 'Sea container and reefer freight, lower bound of 0.0052 to 0.016', source: 'glec' as const },
};

export const IMPORT_ROUTES: ImportRoute[] = [
  {
    id: 'amsterdam-dxb',
    label: 'Amsterdam to Dubai, air freight',
    labelAr: 'أمستردام إلى دبي، شحن جوي',
    km: 5170,
    mode: 'air',
    factor: FACTORS.airLongHaul.value,
    source: 'defra',
    productIds: ['p-tomato', 'p-capsicum'],
  },
  {
    id: 'nairobi-dxb',
    label: 'Nairobi to Dubai, air freight',
    labelAr: 'نيروبي إلى دبي، شحن جوي',
    km: 3556,
    mode: 'air',
    factor: FACTORS.airLongHaul.value,
    source: 'defra',
    productIds: ['p-leafy', 'p-herbs'],
  },
  {
    id: 'mumbai-dxb',
    label: 'Mumbai to Dubai, air freight',
    labelAr: 'مومباي إلى دبي، شحن جوي',
    km: 1926,
    mode: 'air',
    factor: FACTORS.airLongHaul.value,
    source: 'defra',
    productIds: ['p-mango'],
  },
  {
    id: 'amman-uae',
    label: 'Amman to Abu Dhabi or Dubai, refrigerated road',
    labelAr: 'عمّان إلى أبوظبي أو دبي، نقل بري مبرد',
    km: 2050,
    mode: 'road',
    factor: FACTORS.roadReefer.value,
    source: 'glec',
    productIds: ['p-cucumber'],
  },
];

export function importRouteFor(productId: string): ImportRoute | undefined {
  return IMPORT_ROUTES.find((r) => r.productIds.includes(productId));
}

/** kg CO2e per kg of produce for a route. */
export function routeKgPerKg(route: { km: number; factor: number }): number {
  return (route.km * route.factor) / 1000;
}

/**
 * Local leg from the consolidation point to the buyer, km (estimate).
 * Al Ain to Abu Dhabi or Dubai is about 130 to 160 km, so 145 km is used.
 */
export function consolidationToBuyerKm(deliveryEmirate: Emirate): number {
  return deliveryEmirate === 'Al Ain Region' ? 25 : 145;
}

/** Distance a kilogram travels from farm gate to buyer on the local route (estimate). */
export function localRouteKm(farm: Pick<Farm, 'distanceKm'>, deliveryEmirate: Emirate): number {
  return Math.round((farm.distanceKm + consolidationToBuyerKm(deliveryEmirate)) * 10) / 10;
}

export interface FoodMiles {
  localKm: number;
  importKm: number | null;
  kmSavedPerKg: number | null;
  /** Total tonne km avoided is not shown. Savings are reported per order in km and kg CO2e. */
  co2SavedKg: number | null;
  importRoute?: ImportRoute;
}

/** Food miles and CO2e saved for a quantity in kg, against the typical import route. */
export function foodMilesFor(productId: string, qtyKg: number, localKm: number): FoodMiles {
  const route = importRouteFor(productId);
  if (!route) {
    return { localKm, importKm: null, kmSavedPerKg: null, co2SavedKg: null };
  }
  const localKgPerKg = (localKm * FACTORS.roadReefer.value) / 1000;
  const saved = (routeKgPerKg(route) - localKgPerKg) * qtyKg;
  return {
    localKm,
    importKm: route.km,
    kmSavedPerKg: Math.max(0, route.km - localKm),
    co2SavedKg: Math.max(0, Math.round(saved)),
    importRoute: route,
  };
}

/** Linehaul trips a consolidated order needs against one trip per farm. Chiller van carries 2 t (estimate). */
export const VAN_CAPACITY_KG = 2000;

export function tripsSaved(farmCount: number, totalKg: number): { direct: number; consolidated: number; saved: number } {
  const direct = Math.max(0, farmCount);
  const consolidated = Math.max(1, Math.ceil(totalKg / VAN_CAPACITY_KG));
  return { direct, consolidated, saved: Math.max(0, direct - consolidated) };
}

export function productKind(productId: string): string {
  return getProduct(productId).category;
}

/** Display text for a CO2e figure. Shows "not estimated" when the data pack has no route reference. */
export function formatCo2(kg: number | null | undefined): string {
  return kg == null ? 'No route reference' : `${kg.toLocaleString()} kg CO2e (estimate)`;
}
