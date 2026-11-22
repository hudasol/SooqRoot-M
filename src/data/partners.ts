import { Emirate, FarmRegion, PartnerCapability } from '../types';

/* ============================================================
   Partner network
   SooqRoot does not own trucks or warehouses. Every commitment
   names who collects, who consolidates and who delivers.
   The partners below are sample entries. No partner agreement
   is implied. Section 10.5 of the data pack is empty.
   ============================================================ */

export type PartnerType = 'Cooperative' | 'Aggregator' | 'Distributor' | 'Logistics provider';

export interface Partner {
  id: string;
  /** Depot or consolidation location, used for the map layer (sample). */
  hub: { lat: number; lng: number };
  name: string;
  nameAr: string;
  type: PartnerType;
  /** Field note regions where this partner collects. */
  regions: FarmRegion[];
  /** Emirates where this partner delivers. */
  deliversTo: Emirate[];
  capabilities: PartnerCapability[];
  vehicles: string;
  vehiclesAr: string;
  /** Typical drop cost, AED (estimate). */
  dropCostAed: number;
}

export const PARTNERS: Partner[] = [
  {
    id: 'ptn-eastern-coop',
    hub: { lat: 24.2105, lng: 55.7512 },
    name: 'Eastern Region Growers Cooperative',
    nameAr: 'تعاونية مزارعي المنطقة الشرقية',
    type: 'Cooperative',
    regions: ['Al Khatim', 'Al Saad', 'Al Foah', 'Sweihan'],
    deliversTo: ['Al Ain Region'],
    capabilities: ['collection', 'consolidation', 'crate_return'],
    vehicles: '3 refrigerated pickups, 1 consolidation bay',
    vehiclesAr: '3 مركبات نقل مبردة وصالة تجميع واحدة',
    dropCostAed: 150,
  },
  {
    id: 'ptn-dhafra-coop',
    hub: { lat: 24.4962, lng: 54.7203 },
    name: 'Al Dhafra Growers Cooperative',
    nameAr: 'تعاونية مزارعي الظفرة',
    type: 'Cooperative',
    regions: ['Liwa', 'Al Rahba', 'Al Bahya'],
    deliversTo: ['Abu Dhabi'],
    capabilities: ['collection', 'consolidation', 'crate_return'],
    vehicles: '2 chiller vans, 1 consolidation bay',
    vehiclesAr: 'مركبتا نقل مبردتان وصالة تجميع واحدة',
    dropCostAed: 190,
  },
  {
    id: 'ptn-north-hub',
    hub: { lat: 25.2831, lng: 55.8794 },
    name: 'Northern Emirates Aggregation Hub',
    nameAr: 'مركز تجميع الإمارات الشمالية',
    type: 'Aggregator',
    regions: ['Al Dhaid', 'Mleiha', 'Masafi', 'Ras Al Khaimah'],
    deliversTo: ['Sharjah', 'Dubai', 'Ras Al Khaimah'],
    capabilities: ['collection', 'consolidation', 'crate_return'],
    vehicles: '4 chiller vans, 2 consolidation bays',
    vehiclesAr: '4 مركبات نقل مبردة وصالتا تجميع',
    dropCostAed: 260,
  },
  {
    id: 'ptn-east-coast',
    hub: { lat: 25.1288, lng: 56.3265 },
    name: 'East Coast Chilled Transport',
    nameAr: 'النقل المبرد للساحل الشرقي',
    type: 'Logistics provider',
    regions: ['Dibba', 'Kalba', 'Masafi'],
    deliversTo: ['Fujairah', 'Sharjah', 'Dubai'],
    capabilities: ['collection', 'cold_chain', 'delivery', 'crate_return'],
    vehicles: '3 chiller vans, 1 insulated fish truck',
    vehiclesAr: '3 مركبات نقل مبردة وشاحنة معزولة لنقل الأسماك',
    dropCostAed: 340,
  },
  {
    id: 'ptn-ad-dist',
    hub: { lat: 24.3422, lng: 54.4874 },
    name: 'Abu Dhabi Produce Distribution',
    nameAr: 'أبوظبي لتوزيع المنتجات الزراعية',
    type: 'Distributor',
    regions: ['Al Khatim', 'Al Rahba', 'Al Bahya', 'Liwa', 'Sweihan'],
    deliversTo: ['Abu Dhabi', 'Al Ain Region'],
    capabilities: ['consolidation', 'delivery', 'crate_return'],
    vehicles: '6 chiller vans, 1 cross dock',
    vehiclesAr: '6 مركبات نقل مبردة ومنصة تحميل وتفريغ',
    dropCostAed: 220,
  },
  {
    id: 'ptn-dxb-dist',
    hub: { lat: 25.1341, lng: 55.2391 },
    name: 'Dubai Fresh Distribution',
    nameAr: 'دبي لتوزيع المنتجات الطازجة',
    type: 'Distributor',
    regions: ['Dubai Industrial City', 'Al Quoz', 'Al Dhaid', 'Mleiha'],
    deliversTo: ['Dubai', 'Sharjah'],
    capabilities: ['consolidation', 'delivery', 'cold_chain', 'crate_return'],
    vehicles: '8 chiller vans, 1 cold store',
    vehiclesAr: '8 مركبات نقل مبردة ومخزن بارد',
    dropCostAed: 280,
  },
  {
    id: 'ptn-marine-cold',
    hub: { lat: 25.1651, lng: 56.3512 },
    name: 'Marine Cold Chain Services',
    nameAr: 'خدمات السلسلة الباردة للمنتجات البحرية',
    type: 'Logistics provider',
    regions: ['Kalba', 'Dibba', 'Al Khatim', 'Al Saad', 'Al Foah'],
    deliversTo: ['Abu Dhabi', 'Dubai', 'Al Ain Region', 'Fujairah', 'Sharjah'],
    capabilities: ['collection', 'cold_chain', 'delivery'],
    vehicles: '4 iced fish trucks with temperature loggers',
    vehiclesAr: '4 شاحنات أسماك مثلجة مزودة بمسجلات حرارة',
    dropCostAed: 420,
  },
  {
    id: 'ptn-crate-loop',
    hub: { lat: 24.2488, lng: 55.6531 },
    name: 'Crate Loop Services',
    nameAr: 'خدمات دورة الصناديق',
    type: 'Logistics provider',
    regions: ['Al Khatim', 'Al Saad', 'Al Foah', 'Sweihan', 'Al Rahba', 'Al Bahya', 'Liwa'],
    deliversTo: ['Abu Dhabi', 'Al Ain Region', 'Dubai'],
    capabilities: ['collection', 'delivery', 'crate_return'],
    vehicles: '2 chiller vans, crate washing line',
    vehiclesAr: 'مركبتا نقل مبردتان وخط غسيل صناديق',
    dropCostAed: 170,
  },
];

export const PARTNER_MAP: Record<string, Partner> = Object.fromEntries(PARTNERS.map((p) => [p.id, p]));

export const CAPABILITY_LABEL: Record<PartnerCapability, { en: string; ar: string }> = {
  collection: { en: 'Collection', ar: 'الجمع' },
  consolidation: { en: 'Consolidation', ar: 'التجميع' },
  cold_chain: { en: 'Cold chain', ar: 'السلسلة الباردة' },
  delivery: { en: 'Delivery', ar: 'التوصيل' },
  crate_return: { en: 'Crate return', ar: 'إرجاع الصناديق' },
};

/** Partner name in the chosen language, looked up by its English name. */
export function partnerLabel(name: string, lang: 'en' | 'ar'): string {
  if (lang === 'en') return name;
  return PARTNERS.find((p) => p.name === name)?.nameAr ?? name;
}

export function getPartner(id: string): Partner | undefined {
  return PARTNER_MAP[id];
}
