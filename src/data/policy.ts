/* ============================================================
   Policy references
   Formal names, facts and sources exactly as written in
   docs/SooqRoot_Data_Pack.md section 1. Import from here and
   never retype these strings elsewhere in the application.
   ============================================================ */

export type PolicyKey =
  | 'SUSTAINABLE_PRODUCT'
  | 'NEMA'
  | 'FOOD_SECURITY_2051'
  | 'FOOD_SAFETY_LAW'
  | 'FOOD_SAFETY_REGS'
  | 'SINGLE_USE_DECISION'
  | 'WASTE_LAW'
  | 'NET_ZERO'
  | 'GREEN_AGENDA';

export interface PolicyRef {
  key: PolicyKey;
  en: string;
  ar: string;
  /** The Arabic name is a faithful description, not a quoted official title. */
  arIsDescription: boolean;
  fact: string;
  source: string;
}

export const POLICY: Record<PolicyKey, PolicyRef> = {
  SUSTAINABLE_PRODUCT: {
    key: 'SUSTAINABLE_PRODUCT',
    en: 'Sustainable Product initiative, National Agriculture Centre (January 2026)',
    ar: 'مبادرة المنتج المستدام، المركز الوطني للزراعة',
    arIsDescription: true,
    fact: 'Target: 25% locally sourced agricultural and animal products in UAE hotels and restaurants',
    source: 'https://www.forbesmiddleeast.com/lists/?p=90653',
  },
  NEMA: {
    key: 'NEMA',
    en: "ne'ma, the National Food Loss and Waste Initiative",
    ar: 'نعمة، المبادرة الوطنية للحد من فقد وهدر الغذاء',
    arIsDescription: true,
    fact: 'Target: halve food loss and waste by 2030',
    source:
      'https://u.ae/en/information-and-services/environment-and-energy/Agriculture-and-food-security/food-security',
  },
  FOOD_SECURITY_2051: {
    key: 'FOOD_SECURITY_2051',
    en: 'National Food Security Strategy 2051',
    ar: 'الاستراتيجية الوطنية للأمن الغذائي 2051',
    arIsDescription: true,
    fact: 'Local production, agritech and aquaculture, lower food loss',
    source:
      'https://u.ae/en/information-and-services/environment-and-energy/Agriculture-and-food-security/food-security',
  },
  FOOD_SAFETY_LAW: {
    key: 'FOOD_SAFETY_LAW',
    en: 'Federal Law No. 10 of 2015 on Food Safety',
    ar: 'قانون اتحادي رقم (10) لسنة 2015 بشأن سلامة الغذاء',
    arIsDescription: false,
    fact: 'Traceability across the food chain',
    source: 'https://uaelegislation.gov.ae/en/legislations/1161/download',
  },
  FOOD_SAFETY_REGS: {
    key: 'FOOD_SAFETY_REGS',
    en: 'Cabinet Resolution No. 26 of 2017 regarding the Executive Regulations of Federal Law No. 10 of 2015 on Food Safety',
    ar: 'قرار مجلس الوزراء رقم (26) لسنة 2017 بشأن اللائحة التنفيذية للقانون الاتحادي رقم (10) لسنة 2015 بشأن سلامة الغذاء',
    arIsDescription: false,
    fact: 'Traceability across the food chain',
    source: 'https://uaelegislation.gov.ae/en/legislations/1160/download',
  },
  SINGLE_USE_DECISION: {
    key: 'SINGLE_USE_DECISION',
    en: "Ministerial Decision No. 380 of 2022 regarding regulating the use of single use products in the country's markets",
    ar: 'قرار وزاري رقم (380) لسنة 2022 في شأن تنظيم استخدام المنتجات ذات الاستخدام الواحد في أسواق الدولة',
    arIsDescription: false,
    fact: 'Since 1 January 2026, prohibited: beverage cups and lids; cutlery (spoons, forks, knives, chopsticks); plates; straws; stirrers; Styrofoam food containers and boxes; single use bags of any material, including paper, thinner than 50 microns',
    source:
      'https://leap.unep.org/en/countries/ae/national-legislation/ministerial-resolution-no-380-2022-regarding-regulating-use',
  },
  WASTE_LAW: {
    key: 'WASTE_LAW',
    en: 'Federal Law No. 12 of 2018 on Integrated Waste Management',
    ar: 'قانون اتحادي رقم (12) لسنة 2018 بشأن الإدارة المتكاملة للنفايات',
    arIsDescription: true,
    fact: 'Circular reuse of packaging',
    source:
      'https://dlp.dubai.gov.ae/Legislation%20Reference/2025/Law%20No.%20(5)%20of%202025%20Concerning%20Public%20Health.html',
  },
  NET_ZERO: {
    key: 'NET_ZERO',
    en: 'UAE Net Zero 2050 Strategic Initiative',
    ar: 'المبادرة الاستراتيجية للحياد المناخي 2050',
    arIsDescription: true,
    fact: 'Lower emissions across sectors, including agriculture',
    source: 'MOCCAE briefing',
  },
  GREEN_AGENDA: {
    key: 'GREEN_AGENDA',
    en: 'UAE Green Agenda 2030',
    ar: 'الأجندة الخضراء لدولة الإمارات 2030',
    arIsDescription: true,
    fact: 'Green economy growth',
    source: 'MOCCAE briefing',
  },
};

/** Short forms used in small type on tiles and badges. Derived from the formal names above. */
export const POLICY_SHORT: Record<PolicyKey, { en: string; ar: string }> = {
  SUSTAINABLE_PRODUCT: { en: 'Sustainable Product initiative', ar: 'مبادرة المنتج المستدام' },
  NEMA: { en: "ne'ma", ar: 'نعمة' },
  FOOD_SECURITY_2051: { en: 'National Food Security Strategy 2051', ar: 'الاستراتيجية الوطنية للأمن الغذائي 2051' },
  FOOD_SAFETY_LAW: { en: 'Federal Law No. 10 of 2015', ar: 'القانون الاتحادي رقم (10) لسنة 2015' },
  FOOD_SAFETY_REGS: { en: 'Cabinet Resolution No. 26 of 2017', ar: 'قرار مجلس الوزراء رقم (26) لسنة 2017' },
  SINGLE_USE_DECISION: { en: 'Ministerial Decision No. 380 of 2022', ar: 'القرار الوزاري رقم (380) لسنة 2022' },
  WASTE_LAW: { en: 'Federal Law No. 12 of 2018', ar: 'القانون الاتحادي رقم (12) لسنة 2018' },
  NET_ZERO: { en: 'UAE Net Zero 2050 Strategic Initiative', ar: 'المبادرة الاستراتيجية للحياد المناخي 2050' },
  GREEN_AGENDA: { en: 'UAE Green Agenda 2030', ar: 'الأجندة الخضراء لدولة الإمارات 2030' },
};

/** Target from the Sustainable Product initiative: share of local sourcing, percent. */
export const LOCAL_SHARE_TARGET_PCT = 25;

/** Minimum bag thickness in microns under Ministerial Decision No. 380 of 2022. */
export const MIN_BAG_MICRONS = 50;

export function policyName(key: PolicyKey, lang: 'en' | 'ar'): string {
  return lang === 'ar' ? POLICY[key].ar : POLICY[key].en;
}

export function policyShort(key: PolicyKey, lang: 'en' | 'ar'): string {
  return POLICY_SHORT[key][lang];
}
