import { FarmRegion, GrowingMethod } from '../types';

/* ============================================================
   Growing method profiles
   predictability      0 to 1, scales a farm's supply confidence
   yearRound           true when the facility can supply in summer
   summerMultiplier    applied from May to September (above 1 for
                       controlled environment, below 1 for open field)
   typicalLeadDays     shortest lead time the method serves reliably
   advanceOnlyDefault  crop cycle is locked, so only advance
                       orders are accepted
   ============================================================ */

export interface MethodProfile {
  predictability: number;
  yearRound: boolean;
  summerMultiplier: number;
  typicalLeadDays: number;
  advanceOnlyDefault: boolean;
}

export const methodProfile: Record<GrowingMethod, MethodProfile> = {
  'Open field': {
    predictability: 0.78,
    yearRound: false,
    summerMultiplier: 0.6,
    typicalLeadDays: 3,
    advanceOnlyDefault: false,
  },
  Greenhouse: {
    predictability: 0.88,
    yearRound: false,
    summerMultiplier: 0.85,
    typicalLeadDays: 3,
    advanceOnlyDefault: false,
  },
  'Net house': {
    predictability: 0.84,
    yearRound: false,
    // Applies to cooled net houses. Net houses without cooling use NET_HOUSE_UNCOOLED_SUMMER.
    summerMultiplier: 1.1,
    typicalLeadDays: 3,
    advanceOnlyDefault: false,
  },
  Hydroponic: {
    predictability: 0.93,
    yearRound: true,
    summerMultiplier: 1.15,
    typicalLeadDays: 2,
    advanceOnlyDefault: false,
  },
  'Indoor vertical': {
    predictability: 0.97,
    yearRound: true,
    summerMultiplier: 1.25,
    typicalLeadDays: 1,
    advanceOnlyDefault: false,
  },
  'Climate greenhouse': {
    predictability: 0.95,
    yearRound: true,
    summerMultiplier: 1.2,
    typicalLeadDays: 30,
    advanceOnlyDefault: true,
  },
  Aquaculture: {
    predictability: 0.9,
    yearRound: true,
    summerMultiplier: 1,
    typicalLeadDays: 7,
    advanceOnlyDefault: false,
  },
  Apiary: {
    predictability: 0.85,
    yearRound: false,
    summerMultiplier: 0.9,
    typicalLeadDays: 14,
    advanceOnlyDefault: false,
  },
};

export const NET_HOUSE_UNCOOLED_SUMMER = 0.9;

/** Months, 0 = January. May to September is the summer window. */
export const SUMMER_MONTHS = [4, 5, 6, 7, 8];

export function isSummerMonth(month: number): boolean {
  return SUMMER_MONTHS.includes(month);
}

export const GROWING_METHODS: GrowingMethod[] = [
  'Open field',
  'Greenhouse',
  'Net house',
  'Hydroponic',
  'Indoor vertical',
  'Climate greenhouse',
  'Aquaculture',
  'Apiary',
];

export const METHOD_LABEL_AR: Record<GrowingMethod, string> = {
  'Open field': 'حقل مفتوح',
  Greenhouse: 'بيت محمي',
  'Net house': 'بيت شبكي',
  Hydroponic: 'زراعة مائية',
  'Indoor vertical': 'زراعة عمودية داخلية',
  'Climate greenhouse': 'بيت محمي مكيّف',
  Aquaculture: 'استزراع سمكي',
  Apiary: 'منحل',
};

/** Methods that keep supplying from June to September. */
export const CONTROLLED_ENVIRONMENT: GrowingMethod[] = [
  'Indoor vertical',
  'Hydroponic',
  'Climate greenhouse',
];

export type SeasonalMethod =
  | 'Open field'
  | 'Net house'
  | 'Greenhouse'
  | 'Hydroponic'
  | 'Indoor vertical'
  | 'Climate greenhouse';

/**
 * Relative monthly supply index by growing method, 1.0 = peak month, January to December.
 * Open field and net house follow the UAE crop calendar in the data pack
 * (peak November to April, low July to September). Controlled environment
 * facilities hold supply through the summer gap. Sample network values (estimate).
 */
export const METHOD_MONTHLY_INDEX: Record<SeasonalMethod, number[]> = {
  'Open field': [1.0, 1.0, 0.9, 0.7, 0.4, 0.25, 0.15, 0.15, 0.2, 0.55, 0.9, 1.0],
  'Net house': [1.0, 1.0, 0.95, 0.85, 0.65, 0.5, 0.4, 0.4, 0.5, 0.75, 0.95, 1.0],
  Greenhouse: [0.95, 0.95, 0.9, 0.8, 0.6, 0.45, 0.35, 0.35, 0.45, 0.7, 0.9, 0.95],
  Hydroponic: [0.9, 0.9, 0.9, 0.9, 0.9, 0.85, 0.85, 0.85, 0.9, 0.9, 0.9, 0.9],
  'Indoor vertical': [0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95],
  'Climate greenhouse': [0.95, 0.95, 0.95, 0.95, 0.9, 0.9, 0.9, 0.9, 0.9, 0.95, 0.95, 0.95],
};

export const FARM_REGIONS: FarmRegion[] = [
  'Al Khatim',
  'Al Saad',
  'Al Rahba',
  'Al Bahya',
  'Masafi',
  'Dibba',
  'Kalba',
  'Liwa',
  'Sweihan',
  'Al Dhaid',
  'Mleiha',
  'Dubai Industrial City',
  'Al Quoz',
  'Al Foah',
  'Ras Al Khaimah',
];
