import { Product, ProductCategory, SupplyKind } from '../types';

/**
 * Sample product catalogue.
 * refPrice is an indicative AED per unit wholesale reference (estimate), taken from the
 * Al Aweer wholesale ranges in the data pack where one is listed.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'p-tomato',
    name: 'Tomatoes',
    nameAr: 'طماطم',
    category: 'vegetable',
    unit: 'kg',
    refPrice: 3.15,
    leadDays: 21,
    shelfLifeDays: 10,
    emoji: 'To',
    color: '#c4452f',
  },
  {
    id: 'p-cucumber',
    name: 'Cucumbers',
    nameAr: 'خيار',
    category: 'vegetable',
    unit: 'kg',
    refPrice: 2.45,
    leadDays: 18,
    shelfLifeDays: 8,
    emoji: 'Cu',
    color: '#3c8c61',
  },
  {
    id: 'p-leafy',
    name: 'Leafy Greens',
    nameAr: 'خضار ورقية',
    category: 'leafygreen',
    unit: 'kg',
    refPrice: 2.75,
    leadDays: 14,
    shelfLifeDays: 5,
    emoji: 'Lg',
    color: '#5ca87e',
  },
  {
    id: 'p-capsicum',
    name: 'Capsicum',
    nameAr: 'فلفل رومي',
    category: 'vegetable',
    unit: 'kg',
    refPrice: 5.85,
    leadDays: 24,
    shelfLifeDays: 12,
    emoji: 'Cp',
    color: '#b07f3e',
  },
  {
    id: 'p-eggplant',
    name: 'Eggplant',
    nameAr: 'باذنجان',
    category: 'vegetable',
    unit: 'kg',
    refPrice: 5.8,
    leadDays: 20,
    shelfLifeDays: 10,
    emoji: 'Eg',
    color: '#6b4f8a',
  },
  {
    id: 'p-herbs',
    name: 'Fresh Herbs',
    nameAr: 'أعشاب طازجة',
    category: 'herb',
    unit: 'kg',
    refPrice: 18.0,
    leadDays: 12,
    shelfLifeDays: 5,
    emoji: 'He',
    color: '#2a714c',
  },
  {
    id: 'p-dates',
    name: 'Dates',
    nameAr: 'تمور',
    category: 'date',
    unit: 'kg',
    refPrice: 26.0,
    leadDays: 30,
    shelfLifeDays: 180,
    emoji: 'Da',
    color: '#8d6430',
  },
  {
    id: 'p-honey',
    name: 'Sidr Honey',
    nameAr: 'عسل السدر',
    category: 'honey',
    unit: 'jars',
    refPrice: 145.0,
    leadDays: 35,
    shelfLifeDays: 365,
    emoji: 'Ho',
    color: '#c99c57',
  },
  {
    id: 'p-mango',
    name: 'Local Mangoes',
    nameAr: 'مانجو محلي',
    category: 'fruit',
    unit: 'kg',
    refPrice: 12.5,
    leadDays: 3,
    shelfLifeDays: 14,
    emoji: 'Ma',
    color: '#d98a2b',
  },
  {
    id: 'p-seabass',
    name: 'Sea Bass',
    nameAr: 'قاروص',
    category: 'fish',
    unit: 'kg',
    refPrice: 38.0,
    leadDays: 7,
    shelfLifeDays: 3,
    emoji: 'Sb',
    color: '#2f6f8a',
  },
];

/** Four kinds of supply, mapped from the product category. */
export const SUPPLY_KIND_OF: Record<ProductCategory, SupplyKind> = {
  vegetable: 'fresh_produce',
  leafygreen: 'fresh_produce',
  herb: 'fresh_produce',
  fruit: 'fresh_produce',
  date: 'dates',
  honey: 'honey',
  fish: 'aquaculture',
};

export const SUPPLY_KINDS: SupplyKind[] = ['fresh_produce', 'dates', 'honey', 'aquaculture'];

export const SUPPLY_KIND_LABEL: Record<SupplyKind, { en: string; ar: string }> = {
  fresh_produce: { en: 'Fresh produce', ar: 'الخضروات والفواكه الطازجة' },
  dates: { en: 'Dates', ar: 'التمور' },
  honey: { en: 'Honey', ar: 'العسل' },
  aquaculture: { en: 'Aquaculture', ar: 'الاستزراع السمكي' },
};

export function supplyKindOf(productId: string): SupplyKind {
  return SUPPLY_KIND_OF[getProduct(productId).category];
}

export const PRODUCT_MAP: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p])
);

export function getProduct(id: string): Product {
  return (
    PRODUCT_MAP[id] ?? {
      id,
      name: 'Unknown product',
      nameAr: ', ',
      category: 'vegetable',
      unit: 'kg',
      refPrice: 0,
      leadDays: 0,
      shelfLifeDays: 7,
      emoji: 'Pr',
      color: '#848a8e',
    }
  );
}
