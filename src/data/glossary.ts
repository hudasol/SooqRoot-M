/* ============================================================
   Packing glossary for Harvest and Packing Cards.
   Short terms in English, Arabic and Urdu.

   The Urdu terms must be reviewed by a native speaker before
   field use. Data pack section 10.9 has no reviewed Urdu yet.
   ============================================================ */

export type CardLang = 'en' | 'ar' | 'ur';

export interface GlossaryTerm {
  key: string;
  en: string;
  ar: string;
  ur: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { key: 'class1', en: 'Class 1', ar: 'الدرجة الأولى', ur: 'درجہ اول' },
  { key: 'extra', en: 'Extra Class', ar: 'الدرجة الممتازة', ur: 'درجہ ممتاز' },
  { key: 'noMix', en: 'Do not mix sizes', ar: 'لا تخلط الأحجام', ur: 'سائز مکس نہ کریں' },
  { key: 'crate5', en: '5 kg crate', ar: 'صندوق 5 كغ', ur: '5 کلو کا کریٹ' },
  { key: 'carton5', en: '5 kg ventilated carton', ar: 'كرتون مهوّى 5 كغ', ur: '5 کلو ہوادار کارٹن' },
  { key: 'harvest', en: 'Harvest', ar: 'الحصاد', ur: 'کٹائی' },
  { key: 'grade', en: 'Grade', ar: 'الدرجة', ur: 'درجہ' },
  { key: 'size', en: 'Size', ar: 'الحجم', ur: 'سائز' },
  { key: 'weight', en: 'Weight per crate', ar: 'الوزن لكل صندوق', ur: 'فی کریٹ وزن' },
  { key: 'box', en: 'Box type', ar: 'نوع الصندوق', ur: 'ڈبے کی قسم' },
  { key: 'stemCut', en: 'Cut with stem', ar: 'القطف مع العنق', ur: 'ڈنڈی کے ساتھ کاٹیں' },
  { key: 'whole', en: 'Whole harvest', ar: 'حصاد كامل', ur: 'پورا پودا کاٹیں' },
  { key: 'keepCool', en: 'Keep cool', ar: 'حافظ على البرودة', ur: 'ٹھنڈا رکھیں' },
  { key: 'deliverBy', en: 'Deliver by', ar: 'موعد التسليم', ur: 'ترسیل کی تاریخ' },
  { key: 'label', en: 'Arabic and English label', ar: 'ملصق عربي وإنجليزي', ur: 'عربی اور انگریزی لیبل' },
  { key: 'noStyrofoam', en: 'No Styrofoam boxes', ar: 'ممنوع صناديق الستايروفوم', ur: 'اسٹائروفوم کے ڈبے ممنوع' },
  { key: 'qty', en: 'Quantity', ar: 'الكمية', ur: 'مقدار' },
  { key: 'crates', en: 'Crates', ar: 'عدد الصناديق', ur: 'کریٹ کی تعداد' },
];

export const GLOSSARY_MAP: Record<string, GlossaryTerm> = Object.fromEntries(
  GLOSSARY.map((g) => [g.key, g])
);

export function term(key: string, lang: CardLang): string {
  return GLOSSARY_MAP[key]?.[lang] ?? key;
}
