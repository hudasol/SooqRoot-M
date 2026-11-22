import { Bi } from './pack';
import { CardLang } from './glossary';

/* ============================================================
   Grading and packing specs
   Data pack section 10.4 (UAE retail and HoReCa standards).
   Products without a spec in the pack use the guides in
   guides.ts, which carry no numeric grading figures.
   ============================================================ */

export type HarvestMode = 'stem' | 'whole';

export interface PackSpec {
  key: string;
  productIds: string[];
  label: Bi;
  grade: 'class1' | 'extra';
  /** Pack type in words. */
  packType: Bi;
  packKg: number;
  /** Size or caliper range, as written in the pack. */
  size: Bi;
  harvest: HarvestMode;
  /** Handling notes. */
  notes: Bi[];
}

export const SPECS: PackSpec[] = [
  {
    key: 'tomato-retail',
    productIds: ['p-tomato'],
    label: { en: 'Tomatoes, standard retail', ar: 'الطماطم، التجزئة القياسية' },
    grade: 'class1',
    packType: { en: '5 kg ventilated corrugated carton or reusable crate', ar: 'كرتون مموج مهوّى 5 كغ أو صندوق قابل لإعادة الاستخدام' },
    packKg: 5,
    size: { en: '60 to 70 mm caliper (90 to 150 g per fruit)', ar: 'قطر 60 إلى 70 مم (90 إلى 150 غ للثمرة)' },
    harvest: 'stem',
    notes: [
      { en: 'Uniform colour stage (Pink to Light Red)', ar: 'مرحلة لون موحدة (وردي إلى أحمر فاتح)' },
      { en: 'Maximum 10% tolerance', ar: 'حد أقصى للتفاوت 10%' },
    ],
  },
  {
    key: 'tomato-horeca',
    productIds: ['p-tomato'],
    label: { en: 'Tomatoes, jumbo slicing, HoReCa', ar: 'الطماطم، شرائح كبيرة، الضيافة' },
    grade: 'extra',
    packType: { en: '5 kg 5 ply corrugated carton or 10 kg RPC', ar: 'كرتون مموج خماسي الطبقات 5 كغ أو صندوق RPC 10 كغ' },
    packKg: 5,
    size: { en: '70 to 85+ mm caliper (150 to 200+ g per fruit)', ar: 'قطر 70 إلى 85+ مم (150 إلى 200+ غ للثمرة)' },
    harvest: 'stem',
    notes: [
      { en: 'Firmness above 4.5 kg/cm²; maximum 5% tolerance', ar: 'صلابة أعلى من 4.5 كغ/سم²؛ حد أقصى للتفاوت 5%' },
      { en: 'Bilingual Arabic and English label', ar: 'ملصق ثنائي اللغة بالعربية والإنجليزية' },
    ],
  },
  {
    key: 'cucumber',
    productIds: ['p-cucumber'],
    label: { en: 'Cucumbers, Lebanese', ar: 'الخيار اللبناني' },
    grade: 'class1',
    packType: { en: '5 kg ventilated carton', ar: 'كرتون مهوّى 5 كغ' },
    packKg: 5,
    size: { en: '14 to 18 cm length, straight (under 10 mm arc)', ar: 'طول 14 إلى 18 سم، مستقيم (انحناء أقل من 10 مم)' },
    harvest: 'stem',
    notes: [
      { en: 'Uniform dark green skin', ar: 'قشرة خضراء داكنة موحدة' },
      { en: 'Pre-cooled to 10 to 12 °C', ar: 'تبريد مسبق إلى 10 إلى 12 °م' },
    ],
  },
  {
    key: 'mango',
    productIds: ['p-mango'],
    label: { en: 'Mango', ar: 'المانجو' },
    grade: 'class1',
    packType: { en: '5 kg ventilated corrugated carton', ar: 'كرتون مموج مهوّى 5 كغ' },
    packKg: 5,
    size: {
      en: 'Uniform size (Count 6 to 8: 500 to 650 g; Count 9 to 12: 330 to 450 g)',
      ar: 'حجم موحد (العدد 6 إلى 8: 500 إلى 650 غ؛ العدد 9 إلى 12: 330 إلى 450 غ)',
    },
    harvest: 'stem',
    notes: [
      { en: 'Do not mix sizes in one crate', ar: 'لا تخلط الأحجام في الصندوق الواحد' },
      { en: 'Brix 12 to 16; bilingual Arabic and English GSO 9 label', ar: 'بريكس 12 إلى 16؛ ملصق GSO 9 ثنائي اللغة بالعربية والإنجليزية' },
    ],
  },
  {
    key: 'baby-leaves',
    productIds: ['p-leafy', 'p-herbs'],
    label: { en: 'Baby leaves and culinary herbs', ar: 'الأوراق الصغيرة والأعشاب الطهوية' },
    grade: 'extra',
    packType: { en: '1 kg or 2 kg food grade perforated liner box', ar: 'صندوق ببطانة مثقبة صالحة للأغذية، 1 كغ أو 2 كغ' },
    packKg: 1,
    size: { en: 'Uniform leaf size, no yellowing or wilting', ar: 'حجم ورقة موحد، دون اصفرار أو ذبول' },
    harvest: 'whole',
    notes: [
      { en: 'Harvested under 12 hours before delivery', ar: 'يُحصد قبل التسليم بأقل من 12 ساعة' },
      { en: 'Kept at 0 to 5 °C', ar: 'يُحفظ عند 0 إلى 5 °م' },
    ],
  },
];

export function specFor(productId: string, grade?: 'A' | 'B' | 'Mixed'): PackSpec | undefined {
  const matches = SPECS.filter((s) => s.productIds.includes(productId));
  if (matches.length === 0) return undefined;
  // Grade A retail orders use Class 1. Extra Class applies to HoReCa and leaf specs.
  return matches.find((s) => s.grade === 'class1') ?? matches[0];
}

export function specByKey(key: string): PackSpec | undefined {
  return SPECS.find((s) => s.key === key);
}

/** Urdu crop names for the Harvest and Packing Card. Review with a native speaker before field use. */
export const PRODUCT_UR: Record<string, string> = {
  'p-tomato': 'ٹماٹر',
  'p-cucumber': 'کھیرا',
  'p-mango': 'آم',
  'p-leafy': 'پتوں والی سبزیاں',
  'p-herbs': 'جڑی بوٹیاں',
  'p-capsicum': 'شملہ مرچ',
  'p-eggplant': 'بینگن',
  'p-dates': 'کھجور',
  'p-honey': 'شہد',
  'p-seabass': 'سی باس مچھلی',
};

export function cardText(b: Bi, lang: CardLang): string {
  // Urdu cards reuse the Arabic spec line, since the pack has no reviewed Urdu spec text.
  return lang === 'en' ? b.en : b.ar;
}
