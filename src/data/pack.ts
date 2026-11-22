/* ============================================================
   Content from docs/SooqRoot_Data_Pack.md, sections 3 to 9.
   FINAL sections are used as written. Arabic is Modern Standard
   Arabic. Farmer quotes are shortened where needed and keep their
   meaning. Region names are real. No farm or family names.
   ============================================================ */

export interface Bi {
  en: string;
  ar: string;
}

/* ---------------- 3. Timeline ---------------- */

export interface TimelineEntry {
  id: string;
  date: Bi;
  milestone: Bi;
  /** Short form for the Minister Mode progress step. */
  short: Bi;
  upcoming?: boolean;
}

export const TIMELINE: TimelineEntry[] = [
  {
    id: 'tl-1',
    date: { en: 'April 2026', ar: 'أبريل 2026' },
    milestone: {
      en: 'Conversations with vegetable, fish and honey producers at the Emirates Agriculture Conference, ADNEC Al Ain. We took their advice and reviews, and their problems shaped the product.',
      ar: 'محادثات مع منتجي الخضروات والأسماك والعسل في مؤتمر الإمارات للزراعة، أدنيك العين. أخذنا بنصائحهم وآرائهم، وشكّلت مشكلاتهم المنتج.',
    },
    short: { en: 'Producer conversations', ar: 'محادثات مع المنتجين' },
  },
  {
    id: 'tl-2',
    date: { en: '22 to 26 April 2026', ar: '22 إلى 26 أبريل 2026' },
    milestone: {
      en: '2nd place, From Farm to Market University Hackathon, organised by the Ministry of Climate Change and Environment at the Emirates Agriculture Conference and Exhibition (AED 8,000 prize)',
      ar: 'المركز الثاني في هاكاثون «من المزرعة إلى السوق» للجامعات، الذي نظمته وزارة التغير المناخي والبيئة ضمن مؤتمر ومعرض الإمارات للزراعة (جائزة 8,000 درهم)',
    },
    short: { en: '2nd place, Farm to Market Hackathon', ar: 'المركز الثاني في هاكاثون «من المزرعة إلى السوق»' },
  },
  {
    id: 'tl-3',
    date: { en: 'May to September 2026', ar: 'مايو إلى سبتمبر 2026' },
    milestone: {
      en: 'Visits to about 32 farms across seven regions',
      ar: 'زيارات إلى نحو 32 مزرعة في سبع مناطق',
    },
    short: { en: 'About 32 farm visits, seven regions', ar: 'نحو 32 زيارة مزرعة في سبع مناطق' },
  },
  {
    id: 'tl-4',
    date: { en: '24 September 2026', ar: '24 سبتمبر 2026' },
    milestone: {
      en: "Taken into SEE Institute's Bedayat incubator",
      ar: 'القبول في حاضنة «بدايات» التابعة لمعهد SEE',
    },
    short: { en: 'Bedayat incubator', ar: 'حاضنة «بدايات»' },
  },
  {
    id: 'tl-5',
    date: { en: 'October to November 2026', ar: 'أكتوبر إلى نوفمبر 2026' },
    milestone: {
      en: "Version 2 built on the incubation's advice and the farm visit notes",
      ar: 'بناء الإصدار الثاني استناداً إلى نصائح الحاضنة وملاحظات زيارات المزارع',
    },
    short: { en: 'Version 2 built', ar: 'بناء الإصدار الثاني' },
  },
  {
    id: 'tl-6',
    date: { en: '23 November 2026', ar: '23 نوفمبر 2026' },
    milestone: {
      en: 'Athar Sustainable Entrepreneurship Ecosystem Exhibition, SEE Institute, The Sustainable City, Dubai',
      ar: 'معرض أثر لمنظومة ريادة الأعمال المستدامة، معهد SEE، المدينة المستدامة، دبي',
    },
    short: { en: 'Athar Exhibition, The Sustainable City', ar: 'معرض أثر، المدينة المستدامة' },
  },
  {
    id: 'tl-7',
    date: { en: 'Next', ar: 'المرحلة التالية' },
    milestone: { en: '12 week pilot', ar: 'تجربة تشغيلية لمدة 12 أسبوعاً' },
    short: { en: '12 week pilot', ar: 'تجربة تشغيلية لمدة 12 أسبوعاً' },
    upcoming: true,
  },
];

/* ---------------- 4. Incubation ---------------- */

export interface IncubationRow {
  id: string;
  advice: Bi;
  implemented: Bi;
  where: Bi;
  /** Route of the feature, for linking. */
  to: string;
}

export const INCUBATION: IncubationRow[] = [
  {
    id: 'inc-1',
    advice: { en: 'Do not own trucks or warehouses (the lesson of Twiga Foods)', ar: 'لا تمتلكوا شاحنات ولا مستودعات (درس شركة Twiga Foods)' },
    implemented: {
      en: 'Partner Network: every commitment names who collects, who consolidates and who delivers',
      ar: 'شبكة الشركاء: يحدد كل التزام من يجمع ومن يوحّد الشحنات ومن يسلّم',
    },
    where: { en: 'Partners inside each order', ar: 'الشركاء داخل كل طلب' },
    to: '/partners',
  },
  {
    id: 'inc-2',
    advice: { en: 'Do not carry the logistics costs either', ar: 'ولا تتحملوا تكاليف الخدمات اللوجستية أيضاً' },
    implemented: {
      en: 'Asset light economics: logistics carried by partners, SooqRoot earns a software fee',
      ar: 'اقتصاديات خفيفة الأصول: يتحمل الشركاء الخدمات اللوجستية، ويحصل سوق روت على رسوم برمجية',
    },
    where: { en: 'Economics card on each order', ar: 'بطاقة الاقتصاديات في كل طلب' },
    to: '/orders',
  },
  {
    id: 'inc-3',
    advice: { en: 'Coordinate, do not only help buyers discover farms', ar: 'نسّقوا، ولا تكتفوا بمساعدة المشترين على اكتشاف المزارع' },
    implemented: {
      en: 'Commitments before harvest, backup cover and an auditable engine',
      ar: 'التزامات قبل الحصاد، وتغطية احتياطية، ومحرك قابل للتدقيق',
    },
    where: { en: 'Commitment Engine', ar: 'محرك الالتزامات' },
    to: '/engine',
  },
  {
    id: 'inc-4',
    advice: { en: 'Run a narrow pilot', ar: 'ابدؤوا بتجربة تشغيلية محدودة النطاق' },
    implemented: {
      en: 'Pilot Plan: 5 to 10 farms, 2 to 5 buyers, 1 to 3 categories, 8 to 12 weeks',
      ar: 'خطة التجربة: من 5 إلى 10 مزارع، ومن 2 إلى 5 مشترين، ومن فئة واحدة إلى ثلاث فئات، من 8 إلى 12 أسبوعاً',
    },
    where: { en: 'Pilot Plan', ar: 'خطة التجربة' },
    to: '/pilot',
  },
  {
    id: 'inc-5',
    advice: { en: 'Measure the impact', ar: 'قيسوا الأثر' },
    implemented: {
      en: 'Success metrics set in advance, including kilograms committed before harvest',
      ar: 'مؤشرات نجاح محددة مسبقاً، منها الكيلوغرامات الملتزم بها قبل الحصاد',
    },
    where: { en: 'Pilot Plan', ar: 'خطة التجربة' },
    to: '/pilot',
  },
  {
    id: 'inc-6',
    advice: { en: 'Listen to the field', ar: 'أنصتوا إلى الميدان' },
    implemented: {
      en: 'Producer and farmer insights, each linked to the feature it shaped',
      ar: 'ملاحظات المنتجين والمزارعين، وكل منها مرتبط بالميزة التي شكّلتها',
    },
    where: { en: 'Progress page', ar: 'صفحة التقدم' },
    to: '/progress',
  },
];

/* ---------------- 5. Conference producers ---------------- */

export const PRODUCERS_SUMMARY: Bi = {
  en: 'We took their advice and reviews, and their problems shaped the product.',
  ar: 'أخذنا بنصائحهم وآرائهم، وشكّلت مشكلاتهم المنتج.',
};

export interface ProducerGroup {
  id: string;
  producers: Bi;
  said: Bi;
  shaped: Bi;
  to: string;
}

export const PRODUCERS: ProducerGroup[] = [
  {
    id: 'pr-veg',
    producers: { en: 'Vegetable farmers', ar: 'مزارعو الخضروات' },
    said: {
      en: 'Demand is uncertain before harvest, produce risks going unsold, and buyer requirements for grade, size, colour, packing and delivery timing are unclear',
      ar: 'الطلب غير مؤكد قبل الحصاد، وقد يبقى المحصول دون بيع، ومتطلبات المشترين من الدرجة والحجم واللون والتعبئة وموعد التسليم غير واضحة',
    },
    shaped: { en: 'AI Demand Translator and commitments before harvest', ar: 'مترجم الطلبات بالذكاء الاصطناعي والالتزامات قبل الحصاد' },
    to: '/demand',
  },
  {
    id: 'pr-fish',
    producers: { en: 'Fish and aquaculture producers', ar: 'منتجو الأسماك والاستزراع السمكي' },
    said: {
      en: 'Freshness, handling, timing and logistics; a reliable buyer matters more than any buyer',
      ar: 'النضارة والمناولة والتوقيت والخدمات اللوجستية؛ والمشتري الموثوق أهم من أي مشترٍ',
    },
    shaped: { en: 'Shelf life and lead time rules, plus backup farm cover', ar: 'قواعد مدة الصلاحية والمهلة الزمنية، مع تغطية احتياطية من مزارع أخرى' },
    to: '/engine',
  },
  {
    id: 'pr-honey',
    producers: { en: 'Honey producers', ar: 'منتجو العسل' },
    said: {
      en: 'Trust, branding, authenticity and traceability',
      ar: 'الثقة والعلامة التجارية والأصالة وقابلية التتبع',
    },
    shaped: { en: 'QR Batch Passport', ar: 'جواز الدفعة برمز QR' },
    to: '/passports',
  },
];

export const PRODUCERS_PATTERN: Bi = {
  en: 'Local producers need confirmed demand, clearer buyer requirements, better aggregation and stronger trust before the product reaches the market.',
  ar: 'يحتاج المنتجون المحليون إلى طلب مؤكد، ومتطلبات أوضح من المشترين، وتجميع أفضل، وثقة أقوى قبل أن يصل المنتج إلى السوق.',
};

/* ---------------- 6. Farmer insights ---------------- */

export interface FarmerInsight {
  id: string;
  no: string;
  title: Bi;
  region: Bi;
  farmType: Bi;
  quote: Bi;
  shaped: Bi;
  feature: Bi;
  to: string;
}

export const FARMER_INSIGHTS: FarmerInsight[] = [
  {
    id: 'fi-01',
    no: '01',
    title: { en: 'The winter harvest glut and the middleman squeeze', ar: 'تخمة حصاد الشتاء وضغط الوسطاء' },
    region: { en: 'Al Khatim and Al Saad, Al Ain', ar: 'الخطم والسعد، العين' },
    farmType: {
      en: 'About 6 family farms of 3 to 5 hectares; open field and tunnel tomatoes, cucumbers, marrow (kousa) and bell peppers, November to April',
      ar: 'نحو 6 مزارع عائلية بمساحة 3 إلى 5 هكتارات؛ طماطم وخيار وكوسا وفلفل حلو في الحقل المفتوح والأنفاق، من نوفمبر إلى أبريل',
    },
    quote: {
      en: 'Every January, my brothers and I end up picking maybe six hundred, seven hundred crates of tomatoes in the same week as half the farms in Al Ain. We load the pickup before Fajr, drive to the central market, and the brokers laugh because the yard is already full. If I say no and hold the load, the heat ruins the crates by noon.',
      ar: 'كل يناير نقطف أنا وإخوتي ستمئة أو سبعمئة صندوق طماطم في الأسبوع نفسه الذي تقطف فيه نصف مزارع العين. نحمّل السيارة قبل الفجر ونذهب إلى السوق المركزي، فيضحك الوسطاء لأن الساحة ممتلئة أصلاً. وإن رفضت وأبقيت الحمولة، أتلفت الحرارة الصناديق قبل الظهر.',
    },
    shaped: {
      en: 'Demand pooling before harvest and the Arabic Copilot. Farmers see open buyer demand in Arabic before picking, and the Copilot advises on harvest timing and whether to join a multi farm pool.',
      ar: 'تجميع الطلب قبل الحصاد والمساعد العربي. يرى المزارعون طلب المشترين المفتوح بالعربية قبل القطف، وينصحهم المساعد بتوقيت الحصاد وبالانضمام إلى مجمّع المزارع المتعددة.',
    },
    feature: { en: 'Farmer Copilot', ar: 'مساعد المزارع' },
    to: '/copilot',
  },
  {
    id: 'fi-02',
    no: '02',
    title: { en: 'Failing volume minimums for hotel and retail contracts', ar: 'تعذّر تلبية الحد الأدنى للكميات في عقود الفنادق والتجزئة' },
    region: { en: 'Al Rahba and Al Bahya, Abu Dhabi', ar: 'الرحبة والبهية، أبوظبي' },
    farmType: {
      en: 'About 4 net house farms with 8 to 12 cooled greenhouses each; basil, arugula, baby spinach, cherry tomatoes',
      ar: 'نحو 4 مزارع بيوت شبكية، في كل منها 8 إلى 12 بيتاً مبرداً؛ ريحان وجرجير وسبانخ صغيرة وطماطم كرزية',
    },
    quote: {
      en: 'A hotel group on Yas Island wanted something like 115 kilos of uniform baby leaves and herbs every Tuesday and Friday. My cooled houses can only cut maybe thirty five, forty kilos reliably. Because I could not fill their minimum on my own, they gave the whole order to an air freight importer, even though my greens are six hours fresh from the root.',
      ar: 'أرادت مجموعة فندقية في جزيرة ياس نحو 115 كيلوغراماً من الأوراق الصغيرة والأعشاب المتجانسة كل ثلاثاء وجمعة. بيوتي المبردة لا تقطف بانتظام أكثر من خمسة وثلاثين أو أربعين كيلوغراماً. ولأنني لم أستطع تلبية حدّهم الأدنى وحدي، أعطوا الطلب كله لمستورد بالشحن الجوي، مع أن خضرتي طازجة منذ ست ساعات من الجذر.',
    },
    shaped: {
      en: "Multi farm allocation. A large order is split across 3 or 4 nearby farms by grade, location and supply confidence, and fulfilment risk scoring keeps backup farms on standby so one chiller failure never breaks the buyer's contract.",
      ar: 'التوزيع على مزارع متعددة. يُقسَّم الطلب الكبير على 3 أو 4 مزارع قريبة بحسب الدرجة والموقع وثقة الإمداد، ويُبقي تقييم مخاطر التنفيذ مزارع احتياطية جاهزة، فلا يعطّل عطلُ مبرّد واحد عقدَ المشتري.',
    },
    feature: { en: 'Commitment Engine', ar: 'محرك الالتزامات' },
    to: '/engine',
  },
  {
    id: 'fi-03',
    no: '03',
    title: { en: 'Lost in translation on packaging and grading specs', ar: 'مواصفات التعبئة والفرز تضيع في الترجمة' },
    region: { en: 'Masafi, Dibba Al Fujairah and Kalba', ar: 'مسافي ودبا الفجيرة وكلباء' },
    farmType: {
      en: 'About 5 heritage mixed crop, citrus and mango orchards managed by senior Emirati owners and South Asian field crews',
      ar: 'نحو 5 بساتين تراثية متنوعة المحاصيل من الحمضيات والمانجو، يديرها ملاك إماراتيون كبار في السن وطواقم ميدانية من جنوب آسيا',
    },
    quote: {
      en: 'Supermarket purchasing offices send long English spreadsheets asking for Class 1 sorted, 5 kg ventilated corrugated cartons, uniform Brix and caliper. My foreman only reads basic Arabic and Urdu. Last season, two pallets of our best Dibba mangoes were rejected at the receiving dock because we packed mixed sizes in standard plastic crates.',
      ar: 'ترسل مكاتب مشتريات المتاجر جداول إنجليزية طويلة تطلب فرزاً من الدرجة الأولى وكراتين مموجة مهوّاة بوزن 5 كيلوغرامات ودرجة بريكس وقطراً متجانساً. ومشرفي لا يقرأ إلا العربية والأردية الأساسية. في الموسم الماضي رُفضت منصّتان من أجود مانجو دبا عند رصيف الاستلام لأننا عبّأنا أحجاماً مختلطة في صناديق بلاستيكية عادية.',
    },
    shaped: {
      en: 'AI Demand Translator and Harvest Instruction Cards. Messy English procurement text becomes clean right to left Arabic cards with visual grading and packing rules.',
      ar: 'مترجم الطلبات وبطاقات تعليمات الحصاد. يتحول نص المشتريات الإنجليزي المعقّد إلى بطاقات عربية واضحة من اليمين إلى اليسار بقواعد فرز وتعبئة مصوّرة.',
    },
    feature: { en: 'Demand Translator', ar: 'مترجم الطلبات' },
    to: '/demand',
  },
  {
    id: 'fi-04',
    no: '04',
    title: { en: 'Proving local origin to sceptical buyers', ar: 'إثبات المنشأ المحلي أمام مشترين متشككين' },
    region: { en: 'Liwa (Al Dhafra) and Sweihan', ar: 'ليوا (الظفرة) والسويحان' },
    farmType: {
      en: 'About 3 family farms using solar reverse osmosis water and clean drip lines',
      ar: 'نحو 3 مزارع عائلية تستخدم مياه التناضح العكسي بالطاقة الشمسية وخطوط تنقيط نظيفة',
    },
    quote: {
      en: 'Over pumping made our well water salty years ago, so we spent a fortune on solar RO desalination and clean drip lines just to grow sweet strawberries and peppers. Yet traders mix our boxes with cheap imported crates. Nobody gives us a dirham extra for what we spent on clean water.',
      ar: 'تسبّب الضخ الجائر في ملوحة مياه آبارنا قبل سنوات، فأنفقنا الكثير على تحلية بالتناضح العكسي بالطاقة الشمسية وخطوط تنقيط نظيفة لنزرع فراولة وفلفلاً حلوين. ومع ذلك يخلط التجار صناديقنا بصناديق مستوردة رخيصة. ولا يدفع لنا أحد درهماً إضافياً مقابل ما أنفقناه على المياه النظيفة.',
    },
    shaped: {
      en: 'QR Batch Passport and Local Sourcing Tracker. Every batch links back to the farm zone, harvest window and local sourcing record, so buyers can pay a fair local premium.',
      ar: 'جواز الدفعة برمز QR ومتتبع التوريد المحلي. ترتبط كل دفعة بمنطقة المزرعة ونافذة الحصاد وسجل التوريد المحلي، ليدفع المشترون علاوة محلية عادلة.',
    },
    feature: { en: 'Batch Passports', ar: 'جوازات الدفعات' },
    to: '/passports',
  },
  {
    id: 'fi-05',
    no: '05',
    title: { en: 'Sudden heat spikes and unplanned shortfalls', ar: 'موجات الحر المفاجئة ونقص الإنتاج غير المخطط' },
    region: { en: 'Al Dhaid and Mleiha, Sharjah', ar: 'الذيد ومليحة، الشارقة' },
    farmType: {
      en: 'About 5 shade net and open field farms moving from Rhodes grass to seasonal melon and squash',
      ar: 'نحو 5 مزارع بيوت شبكية وحقول مفتوحة تتحول من حشيشة رودس إلى الشمام والقرع الموسميين',
    },
    quote: {
      en: 'In late April, an early hot wind hit Al Dhaid around forty degrees and caused blossom drop across our zucchini rows, leaving us maybe fifty, sixty boxes short. When I called my regular buyer two days before delivery, he cut a penalty off my invoice and cancelled my entire month.',
      ar: 'في أواخر أبريل ضربت رياح حارة مبكرة الذيد بحرارة تقارب الأربعين، فتساقطت الأزهار في صفوف الكوسا وبقينا ناقصين نحو خمسين أو ستين صندوقاً. وحين اتصلت بمشتريّ المعتاد قبل التسليم بيومين، خصم غرامة من فاتورتي وألغى شهري كله.',
    },
    shaped: {
      en: 'Shortfall flagging and the Substitute Advisor. When a farm flags a drop early, the engine reallocates the missing boxes to a neighbouring farm or proposes an approved substitute to the buyer.',
      ar: 'الإبلاغ عن النقص ومستشار البدائل. حين تبلّغ المزرعة مبكراً عن انخفاض، يعيد المحرك توزيع الصناديق الناقصة على مزرعة مجاورة أو يقترح على المشتري بديلاً معتمداً.',
    },
    feature: { en: 'Exceptions', ar: 'الاستثناءات' },
    to: '/exceptions',
  },
  {
    id: 'fi-06',
    no: '06',
    title: { en: 'High summer power bills and uncommitted off take', ar: 'ارتفاع فواتير الكهرباء صيفاً وغياب الشراء الملتزم' },
    region: { en: 'Dubai Industrial City and Al Quoz', ar: 'مدينة دبي الصناعية والقوز' },
    farmType: {
      en: 'About 3 indoor vertical and LED hydroponic farms; microgreens, specialty lettuce, herbs all year',
      ar: 'نحو 3 مزارع عمودية داخلية ومزارع مائية بإضاءة LED؛ أعشاب مجهرية وخس متخصص وأعشاب طوال العام',
    },
    quote: {
      en: 'Running full LED racks and dehumidifiers in July and August eats our margin. Our DEWA bill takes nearly half our monthly spend. We can harvest around two hundred kilos every week even in August, yet hospitality buyers still buy spot to spot on WhatsApp and ask for forty five day payment terms.',
      ar: 'تشغيل رفوف LED كاملة ومزيلات الرطوبة في يوليو وأغسطس يلتهم هامش ربحنا، وتبلغ فاتورة هيئة كهرباء ومياه دبي قرابة نصف مصروفنا الشهري. نستطيع حصاد نحو مئتي كيلوغرام كل أسبوع حتى في أغسطس، ومع ذلك يشتري مشترو الضيافة بالطلب الفوري عبر واتساب ويطلبون مهلة دفع خمسة وأربعين يوماً.',
    },
    shaped: {
      en: 'Summer demand locking and supply confidence weighting. The engine favours high confidence year round facilities for summer institutional orders.',
      ar: 'تثبيت الطلب الصيفي وترجيح ثقة الإمداد. يفضّل المحرك المنشآت عالية الثقة العاملة طوال العام للطلبات المؤسسية الصيفية.',
    },
    feature: { en: 'Harvest Calendar, summer gap view', ar: 'تقويم الحصاد، عرض فجوة الصيف' },
    to: '/harvest',
  },
  {
    id: 'fi-07',
    no: '07',
    title: { en: 'Climate controlled greenhouses trapped in commodity pricing', ar: 'البيوت المحمية المكيّفة عالقة في تسعير السلع' },
    region: { en: 'Al Foah (Al Ain) and Ras Al Khaimah', ar: 'الفوعة (العين) ورأس الخيمة' },
    farmType: {
      en: 'About 2 precision greenhouses with automated fertigation, CO2 dosing and biological pest control; vine tomatoes, snacking peppers, berries',
      ar: 'نحو بيتين محميين دقيقين بتسميد آلي مع الري وجرعات ثاني أكسيد الكربون ومكافحة حيوية للآفات؛ طماطم عنقودية وفلفل خفيف وتوت',
    },
    quote: {
      en: 'Our crop cycle takes months of precision planning, yet retail buyers treat our pesticide free vine tomatoes like generic wholesale crates and demand sudden two or three hundred crate spikes we cannot biologically rush.',
      ar: 'تستغرق دورة محصولنا شهوراً من التخطيط الدقيق، ومع ذلك يعامل مشترو التجزئة طماطمنا العنقودية الخالية من المبيدات كصناديق جملة عادية، ويطلبون فجأة مئتين أو ثلاثمئة صندوق إضافي لا نستطيع تسريع إنتاجها بيولوجياً.',
    },
    shaped: {
      en: 'Grade and residue spec extraction and advance harvest windows. Specialty grades are matched ahead of the crop cycle, and sudden spikes route to pooled partners.',
      ar: 'استخراج مواصفات الدرجة والمتبقيات ونوافذ الحصاد المسبقة. تُطابَق الدرجات المتخصصة قبل دورة المحصول، وتُوجَّه الطلبات المفاجئة إلى الشركاء المجمّعين.',
    },
    feature: { en: 'Supply Digital Twin', ar: 'التوأم الرقمي للإمداد' },
    to: '/network',
  },
  {
    id: 'fi-08',
    no: '08',
    title: { en: 'Lab clearance delays', ar: 'تأخر تصاريح المختبر' },
    region: { en: 'Al Khatim and Sweihan', ar: 'الخطم والسويحان' },
    farmType: {
      en: 'About 4 mixed greenhouse and open field farms supplying retail aggregators',
      ar: 'نحو 4 مزارع متنوعة من البيوت المحمية والحقول المفتوحة تورّد إلى مجمّعي التجزئة',
    },
    quote: {
      en: 'Even when a buyer confirms an order, getting pesticide residue clearance back from the lab can hold up a shipment for days, and by then the receiving window has closed.',
      ar: 'حتى حين يؤكد المشتري الطلب، قد يعطّل وصول تصريح متبقيات المبيدات من المختبر الشحنة أياماً، وتكون نافذة الاستلام قد أُغلقت.',
    },
    shaped: {
      en: 'Logged as an external bottleneck. Delivery schedules include a 48 hour lab clearance buffer instead of penalising the farm.',
      ar: 'سُجّلت كعائق خارجي. تتضمن جداول التسليم مهلة 48 ساعة لتصريح المختبر بدلاً من معاقبة المزرعة.',
    },
    feature: { en: 'Fulfilment', ar: 'التنفيذ' },
    to: '/fulfilment',
  },
];

/* ---------------- 7. Field programme ---------------- */

export interface FieldProgrammeItem {
  id: string;
  text: Bi;
}

export const FIELD_PROGRAMME: FieldProgrammeItem[] = [
  {
    id: 'fp-1',
    text: {
      en: 'Al Khatim and Al Saad: enter a real 14 day tomato and cucumber harvest estimate with owner and foreman; show open buyer pools in Arabic.',
      ar: 'الخطم والسعد: إدخال تقدير فعلي لحصاد الطماطم والخيار لمدة 14 يوماً مع المالك والمشرف؛ وعرض مجمّعات المشترين المفتوحة بالعربية.',
    },
  },
  {
    id: 'fp-2',
    text: {
      en: "Al Rahba and Al Bahya: log three adjacent plots' Tuesday and Friday output (35 to 45 kg each); run a live split allocation for a 120 kg hotel order.",
      ar: 'الرحبة والبهية: تسجيل إنتاج ثلاث قطع متجاورة يومي الثلاثاء والجمعة (من 35 إلى 45 كغ لكل قطعة)؛ وتشغيل توزيع مجزّأ مباشر لطلب فندقي بوزن 120 كغ.',
    },
  },
  {
    id: 'fp-3',
    text: {
      en: 'Masafi and Dibba: test whether the packing crew can pack a 5 kg crate using only the Harvest Card.',
      ar: 'مسافي ودبا: اختبار قدرة طاقم التعبئة على تعبئة صندوق 5 كغ باستخدام بطاقة الحصاد وحدها.',
    },
  },
  {
    id: 'fp-4',
    text: {
      en: "Liwa and Sweihan: verify RO and drip setup for provenance tags; place QR passports on five crates and scan on the owner's phone.",
      ar: 'ليوا والسويحان: التحقق من منظومة التناضح العكسي والتنقيط لوسوم المنشأ؛ ووضع جوازات QR على خمسة صناديق ومسحها بهاتف المالك.',
    },
  },
  {
    id: 'fp-5',
    text: {
      en: 'Al Dhaid and Mleiha: shortfall drill across four neighbouring farms with a simulated 30% yield drop.',
      ar: 'الذيد ومليحة: تمرين على النقص في الإنتاج عبر أربع مزارع متجاورة بانخفاض افتراضي في الغلة قدره 30%.',
    },
  },
  {
    id: 'fp-6',
    text: {
      en: 'Dubai Industrial City and Al Quoz: import a 12 week summer yield calendar (July to September).',
      ar: 'مدينة دبي الصناعية والقوز: استيراد تقويم غلة صيفي لمدة 12 أسبوعاً (من يوليو إلى سبتمبر).',
    },
  },
  {
    id: 'fp-7',
    text: {
      en: 'Al Foah and Ras Al Khaimah: map an 8 to 12 week planting schedule and set advance only lead times.',
      ar: 'الفوعة ورأس الخيمة: رسم جدول زراعة من 8 إلى 12 أسبوعاً وتحديد مُهَل مسبقة فقط.',
    },
  },
];

/* ---------------- 8. Pilot plan ---------------- */

export const PILOT = {
  scope: {
    farms: { en: '5 to 10 farms', ar: 'من 5 إلى 10 مزارع' },
    buyers: { en: '2 to 5 commercial buyers (hospitality, catering, food service)', ar: 'من 2 إلى 5 مشترين تجاريين (الضيافة والتموين وخدمات الأغذية)' },
    categories: { en: '1 to 3 product categories (tomatoes, cucumbers, leafy greens)', ar: 'من فئة واحدة إلى ثلاث فئات منتجات (الطماطم والخيار والخضروات الورقية)' },
    weeks: { en: '8 to 12 weeks', ar: 'من 8 إلى 12 أسبوعاً' },
  },
  regions: { en: 'Al Ain and Abu Dhabi first', ar: 'العين وأبوظبي أولاً' },
  metrics: [
    { id: 'm-fulfil', en: 'Fulfilment rate', ar: 'نسبة التنفيذ' },
    { id: 'm-ontime', en: 'On time delivery', ar: 'التسليم في الموعد' },
    { id: 'm-repeat', en: 'Repeat orders', ar: 'الطلبات المتكررة' },
    { id: 'm-buyer', en: 'Buyer feedback', ar: 'ملاحظات المشترين' },
    { id: 'm-farmer', en: 'Farmer feedback', ar: 'ملاحظات المزارعين' },
    { id: 'm-kg', en: 'Kilograms committed before harvest', ar: 'الكيلوغرامات الملتزم بها قبل الحصاد' },
  ] as { id: string; en: string; ar: string }[],
  northStar: {
    en: 'Buyer demand committed to UAE farms before harvest and fulfilled to specification.',
    ar: 'طلب المشترين الملتزم به لدى المزارع الإماراتية قبل الحصاد والمنفَّذ وفق المواصفات.',
  },
  ask: {
    en: "A 12 week pilot with up to ten farms, five buyers and three crops, with the National Agriculture Centre's farmer network.",
    ar: 'تجربة تشغيلية لمدة 12 أسبوعاً مع ما يصل إلى عشر مزارع وخمسة مشترين وثلاثة محاصيل، بالتعاون مع شبكة المزارعين في المركز الوطني للزراعة.',
  },
};

/* ---------------- 9. Minister Mode copy ---------------- */

export interface MinisterStepCopy {
  key: string;
  label: Bi;
  headline: Bi;
  support: Bi;
}

export const MINISTER_COPY: MinisterStepCopy[] = [
  {
    key: 'cover',
    label: { en: 'Cover', ar: 'الغلاف' },
    headline: { en: 'One order. Many farms. Confirmed before harvest.', ar: 'طلب واحد، مزارع متعددة، مؤكد قبل الحصاد' },
    support: { en: 'Huda Mueen, Founder and CEO', ar: 'هدى معين، المؤسِّسة والرئيسة التنفيذية' },
  },
  {
    key: 'order',
    label: { en: 'Buyer order', ar: 'طلب المشتري' },
    headline: { en: 'The buyer writes it the way they already do', ar: 'يكتب المشتري طلبه كما اعتاد' },
    support: { en: 'SooqRoot turns it into an exact specification', ar: 'يحوّله سوق روت إلى مواصفات دقيقة' },
  },
  {
    key: 'commitment',
    label: { en: 'Commitment', ar: 'الالتزام' },
    headline: { en: 'Many farms, one reliable supplier', ar: 'مزارع متعددة، مورّد واحد موثوق' },
    support: {
      en: 'Fresh produce, dates, honey and fish, coordinated as one supply',
      ar: 'الخضروات والفواكه والتمور والعسل والأسماك، تُنسَّق كإمداد واحد',
    },
  },
  {
    key: 'farmer',
    label: { en: 'Farmer message', ar: 'رسالة المزارع' },
    headline: {
      en: 'Every farmer receives clear instructions in Arabic, on WhatsApp',
      ar: 'يتلقى كل مزارع تعليمات واضحة بالعربية عبر واتساب',
    },
    support: {
      en: 'Harvest, grading and packing, confirmed before harvest',
      ar: 'الحصاد والفرز والتعبئة، مؤكدة قبل الحصاد',
    },
  },
  {
    key: 'impact',
    label: { en: 'National impact', ar: 'الأثر الوطني' },
    headline: { en: 'The numbers the national targets need', ar: 'الأرقام التي تحتاجها الأهداف الوطنية' },
    support: {
      en: 'Local share against 25%, food loss avoided, packaging compliance',
      ar: 'الحصة المحلية مقابل 25%، والفاقد الغذائي المتجنَّب، والالتزام بالتعبئة',
    },
  },
  {
    key: 'progress',
    label: { en: 'Progress', ar: 'التقدم' },
    headline: { en: "From the ministry's hackathon to version 2", ar: 'من هاكاثون الوزارة إلى الإصدار الثاني' },
    support: {
      en: "Built on the incubation's advice and the voices of UAE farmers",
      ar: 'مبني على نصائح الحاضنة وأصوات المزارعين في الإمارات',
    },
  },
  {
    key: 'pilot',
    label: { en: 'Pilot', ar: 'التجربة' },
    headline: { en: 'Ready for a 12 week pilot', ar: 'جاهزون لتجربة تشغيلية لمدة 12 أسبوعاً' },
    support: { en: 'Up to ten farms, five buyers and three crops', ar: 'حتى عشر مزارع وخمسة مشترين وثلاثة محاصيل' },
  },
];

export const COMPANY = {
  name: { en: 'SooqRoot', ar: 'سوق روت' },
  tagline: MINISTER_COPY[0].headline,
  founder: 'Huda Mueen',
  mission: {
    en: 'SooqRoot helps many small UAE farms act like one reliable commercial supplier for hotels, restaurants, supermarkets, caterers and institutional buyers.',
    ar: 'يساعد سوق روت المزارع الإماراتية الصغيرة المتعددة على العمل كمورّد تجاري واحد موثوق للفنادق والمطاعم والمتاجر الكبرى وشركات التموين والمشترين المؤسسيين.',
  },
};
