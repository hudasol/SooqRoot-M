import { useMemo, useState } from 'react';
import {
  Building2,
  CalendarClock,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Droplet,
  Fish,
  Leaf,
  MessageCircle,
  PackageCheck,
  Route,
  Sprout,
  Target,
  Truck,
  Users,
  Warehouse,
  Wheat,
} from 'lucide-react';
import { useLang, num } from '../../lib/i18n';
import { COMPANY, INCUBATION, MINISTER_COPY, PILOT, TIMELINE } from '../../data/pack';
import { POLICY_SHORT, PolicyKey } from '../../data/policy';
import { partnerLabel } from '../../data/partners';
import { CANONICAL_REQUEST, checkPackaging, runCommitmentEngine } from '../../lib/engine';
import { translateDemand, TRANSLATOR_SAMPLES } from '../../lib/translator';
import { FARM_MAP, FARMS } from '../../data/farms';
import { getProduct, SUPPLY_KIND_LABEL, SUPPLY_KINDS, supplyKindOf } from '../../data/products';
import { METHOD_LABEL_AR } from '../../data/methods';
import { networkWithout, ORDERS } from '../../data/orders';
import { nationalImpact } from '../../lib/national';
import { SOURCES } from '../../lib/emissions';
import { HarvestCard } from '../../components/HarvestCard';
import { specFor } from '../../data/specs';
import { CardLang } from '../../data/glossary';
import { SupplyKind } from '../../types';

/* ============================================================
   Minister Mode steps. Copy comes from data pack section 9 via
   MINISTER_COPY. Figures are computed from the sample network.
   ============================================================ */

const RESULT = runCommitmentEngine(CANONICAL_REQUEST, networkWithout(CANONICAL_REQUEST.orderRef));
const IMPACT = nationalImpact(ORDERS);

const KIND_ICON: Record<SupplyKind, typeof Leaf> = {
  fresh_produce: Leaf,
  dates: Wheat,
  honey: Droplet,
  aquaculture: Fish,
};

/* ---------------- shared pieces ---------------- */

function StepFrame({ index, children }: { index: number; children: React.ReactNode }) {
  const { isAr, pick } = useLang();
  const c = MINISTER_COPY[index];
  return (
    <div className="flex h-full flex-col px-10 pb-4 pt-4">
      <div className="shrink-0">
        <h1
          className={`font-display font-extrabold tracking-tight text-charcoal-900 ${isAr ? 'leading-[1.35]' : 'leading-[1.08]'}`}
          style={{ fontSize: 'clamp(40px, 3.6vw, 52px)' }}
        >
          {pick(c.headline)}
        </h1>
        <p className="mt-1 text-[22px] font-medium text-charcoal-500">{pick(c.support)}</p>
      </div>
      <div className="mt-3 min-h-0 flex-1">{children}</div>
    </div>
  );
}

function Chip({
  children,
  tone = 'brand',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'brand' | 'sand' | 'neutral' | 'sky';
  className?: string;
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-800',
    sand: 'bg-sand-100 text-sand-600',
    neutral: 'bg-charcoal-100 text-charcoal-700',
    sky: 'bg-sky-50 text-sky-700',
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-base font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

function PolicyNote({ keys, className = '', capitalise = false }: { keys: PolicyKey[]; className?: string; capitalise?: boolean }) {
  const { lang } = useLang();
  const text = keys.map((k) => POLICY_SHORT[k][lang]).join(' · ');
  return (
    <p className={`text-[16px] leading-snug text-charcoal-500 ${className}`}>
      {capitalise ? text.replace('initiative', 'Initiative') : text}
    </p>
  );
}

function methodLabel(method: string, isAr: boolean): string {
  return isAr ? METHOD_LABEL_AR[method as keyof typeof METHOD_LABEL_AR] ?? method : method;
}

/* ---------------- Cover ---------------- */

export function CoverStep() {
  const { isAr, t } = useLang();
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-brand-gradient px-12 text-center text-white">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.1]"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern id="min-rows" width="18" height="18" patternTransform="rotate(26)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="18" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="200" fill="url(#min-rows)" />
      </svg>

      <div className="relative max-w-[980px]">
        <h1
          className={`font-display font-extrabold tracking-tight ${isAr ? 'leading-[1.35]' : 'leading-[1.05]'}`}
          style={{ fontSize: 'clamp(48px, 6vw, 76px)' }}
        >
          {isAr ? COMPANY.tagline.ar : COMPANY.tagline.en}
        </h1>
        <p
          className={`mt-6 text-[34px] font-semibold text-white/85 ${isAr ? '' : 'font-ar'}`}
          dir={isAr ? 'ltr' : 'rtl'}
          lang={isAr ? 'en' : 'ar'}
        >
          {isAr ? COMPANY.tagline.en : COMPANY.tagline.ar}
        </p>
        <div className="mx-auto mt-10 h-px w-24 bg-white/40" />
        <p className="mt-8 text-[28px] font-semibold">
          {MINISTER_COPY[0].support[isAr ? 'ar' : 'en']}
        </p>
      </div>

      <span className="absolute bottom-5 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-semibold text-white/85">
        <span className="h-1.5 w-1.5 rounded-full bg-sand-300" />
        {t('Sample network', 'شبكة نموذجية')}
      </span>
    </div>
  );
}

/* ---------------- 1. Buyer order ---------------- */

const SCHEDULE_AR: Record<string, string> = {
  Monday: 'الاثنين',
  Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء',
  Thursday: 'الخميس',
  Friday: 'الجمعة',
  Saturday: 'السبت',
  Sunday: 'الأحد',
};

export function BuyerOrderStep() {
  const { isAr, t } = useLang();
  const [revealed, setRevealed] = useState(false);
  const text = TRANSLATOR_SAMPLES[0];
  const tr = useMemo(() => translateDemand(text), [text]);
  const product = getProduct(tr.productId ?? 'p-tomato');
  const packCheck = useMemo(() => checkPackaging(text, [{ packaging: tr.packaging }]), [text, tr.packaging]);

  const scheduleAr =
    tr.schedule
      .split(/\s*\+\s*/)
      .map((d) => SCHEDULE_AR[d] ?? d)
      .join(' و') + '، مرتان أسبوعياً';

  const rows: { label: string; value: string }[] = [
    { label: t('Crop', 'المحصول'), value: isAr ? `${product.nameAr}` : product.name },
    { label: t('Grade', 'الدرجة'), value: isAr ? 'الدرجة الأولى (A)' : 'Class 1 (Grade A)' },
    { label: t('Quantity', 'الكمية'), value: `${num(tr.qty ?? 0)} ${isAr ? 'كغ' : 'kg'}` },
    {
      label: t('Packaging', 'التعبئة'),
      value: isAr ? 'صناديق 5 كغ قابلة لإعادة الاستخدام' : tr.packaging,
    },
    {
      label: t('Delivery schedule', 'جدول التسليم'),
      value: isAr ? scheduleAr : `${tr.schedule}, ${tr.frequency.toLowerCase()}`,
    },
  ];

  return (
    <StepFrame index={1}>
      <div className="grid h-full grid-cols-2 gap-6">
        {/* Buyer message */}
        <section className="flex min-h-0 flex-col rounded-3xl border border-charcoal-200 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3 text-charcoal-500">
            <MessageCircle size={24} />
            <span className="text-lg font-semibold">{t('Message from the buyer', 'رسالة من المشتري')}</span>
            <Chip tone="neutral" className="ms-auto">
              {t('Hotel group', 'مجموعة فندقية')}
            </Chip>
          </div>
          <div className="mt-4 flex-1 rounded-2xl rounded-ss-md bg-brand-50 p-5">
            <p className="text-[24px] leading-snug text-charcoal-900" dir="ltr" lang="en" style={{ textAlign: 'start' }}>
              {text}
            </p>
          </div>
          <button
            onClick={() => setRevealed(true)}
            disabled={revealed}
            className="mt-4 inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-brand-600 px-6 text-xl font-bold text-white shadow-soft transition hover:bg-brand-700 disabled:bg-brand-100 disabled:text-brand-700"
          >
            {revealed ? <Check size={24} /> : <ChevronDown size={24} />}
            {revealed ? t('Specification ready', 'المواصفات جاهزة') : t('Show the specification', 'اعرض المواصفات')}
          </button>
        </section>

        {/* Structured specification */}
        <section
          className={`flex min-h-0 flex-col rounded-3xl border p-6 transition ${
            revealed ? 'border-brand-200 bg-white shadow-lift' : 'border-dashed border-charcoal-200 bg-canvas-soft'
          }`}
        >
          <div className="flex items-center gap-3 text-brand-700">
            <PackageCheck size={24} />
            <span className="text-lg font-semibold">{t('Exact specification', 'المواصفات الدقيقة')}</span>
          </div>
          {revealed ? (
            <div className="animate-in mt-3 flex min-h-0 flex-1 flex-col">
              <dl className="flex-1 divide-y divide-charcoal-100">
                {rows.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-4 py-[11px]">
                    <dt className="text-lg font-medium text-charcoal-500">{r.label}</dt>
                    <dd className="text-end text-[22px] font-bold text-charcoal-900">{r.value}</dd>
                  </div>
                ))}
              </dl>
              {packCheck.status === 'compliant' ? (
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800">
                  <CheckCircle2 size={28} className="shrink-0" />
                  <span className="text-lg font-bold leading-snug">
                    {t('Packaging compliant', 'التعبئة مطابقة')}{isAr ? '، ' : ', '}{POLICY_SHORT.SINGLE_USE_DECISION[isAr ? 'ar' : 'en']}
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center px-8 text-center text-xl text-charcoal-400">
              {t('One tap turns the sentence into crop, grade, quantity, packaging and schedule.', 'نقرة واحدة تحوّل الجملة إلى محصول ودرجة وكمية وتعبئة وجدول.')}
            </div>
          )}
        </section>
      </div>
    </StepFrame>
  );
}

/* ---------------- 2. Commitment ---------------- */

export function CommitmentStep() {
  const { isAr, t } = useLang();
  const rows = [...RESULT.primary, ...RESULT.backup];
  const [selected, setSelected] = useState(0);
  const sel = rows[selected];
  const chain = sel?.partnerChain;
  const maxQty = Math.max(...rows.map((r) => r.qty));
  const farmsByKind = SUPPLY_KINDS.map((k) => ({
    kind: k,
    count: FARMS.filter((f) => f.capacity.some((c) => supplyKindOf(c.productId) === k)).length,
  }));

  const steps: { icon: typeof Truck; label: string; value: string }[] = chain
    ? [
        { icon: Sprout, label: t('Farm', 'المزرعة'), value: isAr ? FARM_MAP[sel.farmId].nameAr : FARM_MAP[sel.farmId].name },
        { icon: Truck, label: t('Collected by', 'يجمعها'), value: partnerLabel(chain.collection, isAr ? 'ar' : 'en') },
        { icon: Warehouse, label: t('Consolidated by', 'يوحّدها'), value: partnerLabel(chain.consolidation, isAr ? 'ar' : 'en') },
        { icon: PackageCheck, label: t('Delivered by', 'يسلّمها'), value: partnerLabel(chain.delivery, isAr ? 'ar' : 'en') },
      ]
    : [];

  return (
    <StepFrame index={2}>
      <div className="flex h-full flex-col gap-3">
        <div className="grid min-h-0 flex-1 grid-cols-[1.25fr_1fr] gap-5">
          {/* Allocation list */}
          <section className="flex min-h-0 flex-col rounded-3xl border border-charcoal-200 bg-white p-4 shadow-soft">
            <div className="flex items-baseline justify-between gap-3 px-2 pb-2">
              <div className="text-xl font-bold">
                {num(CANONICAL_REQUEST.qty)} {isAr ? 'كغ' : 'kg'} {isAr ? 'طماطم' : 'tomatoes'}
              </div>
              <div className="text-lg font-semibold text-charcoal-500">
                {RESULT.primary.length} {t('farms', 'مزارع')} · {RESULT.coveragePct}% {t('covered', 'مغطى')}
              </div>
            </div>
            <ul className="min-h-0 flex-1 space-y-1">
              {rows.map((a, i) => {
                const farm = FARM_MAP[a.farmId];
                const isBackup = a.role === 'backup';
                const KindIcon = KIND_ICON[supplyKindOf(CANONICAL_REQUEST.productId)];
                return (
                  <li key={a.id}>
                    <button
                      onClick={() => setSelected(i)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-[7px] text-start transition ${
                        i === selected ? 'bg-brand-50 ring-1 ring-brand-300' : 'hover:bg-charcoal-50'
                      } ${isBackup ? 'border border-dashed border-sand-300' : ''}`}
                    >
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                        <KindIcon size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[20px] font-bold leading-tight">
                          {isAr ? farm.nameAr : farm.name}
                        </span>
                      </span>
                      <Chip tone={isBackup ? 'sand' : 'neutral'} className="!py-0.5 !text-[15px]">
                        {isBackup ? t('Backup', 'احتياطي') : methodLabel(farm.growingMethod, isAr)}
                      </Chip>
                      <span className="w-[92px] text-end text-[20px] font-bold tabular-nums" dir="ltr">
                        {num(a.qty)} {isAr ? 'كغ' : 'kg'}
                      </span>
                      <span className="hidden h-2 w-16 overflow-hidden rounded-full bg-charcoal-100 xl:block">
                        <span
                          className={`block h-full rounded-full ${isBackup ? 'bg-sand-400' : 'bg-brand-500'}`}
                          style={{ width: `${Math.round((a.qty / maxQty) * 100)}%` }}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Partner chain */}
          <section className="flex min-h-0 flex-col rounded-3xl border border-brand-200 bg-white p-5 shadow-lift">
            <div className="flex items-center gap-3 text-brand-700">
              <Route size={24} />
              <span className="text-lg font-semibold">{t('Partner chain', 'سلسلة الشركاء')}</span>
            </div>
            <ol className="mt-3 flex-1 space-y-0">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li key={s.label} className="relative flex items-start gap-4 pb-4 last:pb-0">
                    {i < steps.length - 1 ? (
                      <span className="absolute start-[19px] top-10 h-[calc(100%-26px)] w-0.5 bg-brand-200" />
                    ) : null}
                    <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-charcoal-500">{s.label}</div>
                      <div className="text-[21px] font-bold leading-snug">{s.value}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-1 text-base text-charcoal-500">
              {t('SooqRoot owns no trucks or warehouses. Partners carry the logistics.', 'لا يمتلك سوق روت شاحنات ولا مستودعات. يتولى الشركاء الخدمات اللوجستية.')}
            </p>
          </section>
        </div>

        {/* Four kinds */}
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {farmsByKind.map((k) => {
            const Icon = KIND_ICON[k.kind];
            return (
              <span
                key={k.kind}
                className="inline-flex items-center gap-2 rounded-full border border-charcoal-200 bg-white px-4 py-1.5 text-[18px] font-semibold"
              >
                <Icon size={18} className="text-brand-600" />
                {SUPPLY_KIND_LABEL[k.kind][isAr ? 'ar' : 'en']}
                <span className="text-charcoal-400">{k.count}</span>
              </span>
            );
          })}
        </div>
      </div>
    </StepFrame>
  );
}

/* ---------------- 3. Farmer message ---------------- */

function arDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ar-AE-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function FarmerStep() {
  const { isAr, t } = useLang();
  const [cardLang, setCardLang] = useState<CardLang>('ar');
  const alloc = RESULT.primary[0];
  const farm = FARM_MAP[alloc.farmId];
  const spec = specFor(CANONICAL_REQUEST.productId, 'A')!;
  const DELIVERY_ISO = '2026-11-23';
  const deliverEn = new Date(DELIVERY_ISO).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const deliverUr = new Date(DELIVERY_ISO).toLocaleDateString('ur-PK-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const deliver = cardLang === 'en' ? deliverEn : cardLang === 'ur' ? deliverUr : arDate(DELIVERY_ISO);

  const messageUr = `السلام علیکم، سوق روٹ کی طرف سے اطلاع: کٹائی سے پہلے آپ کا آرڈر کنفرم ہو گیا ہے۔ ${num(alloc.qty)} کلو ٹماٹر، درجہ اول، 5 کلو کے دوبارہ قابل استعمال کریٹس میں، مناسب پختگی کے ساتھ۔ ڈیلیوری کی تاریخ ${deliverUr}۔ تفصیل منسلک ہارویسٹ اور پیکنگ کارڈ میں ہے۔ شکریہ۔`;
  const messageAr =`السلام عليكم، معكم سوق روت. تم تأكيد طلبكم قبل الحصاد: ${num(alloc.qty)} كغ طماطم من الدرجة الأولى، في صناديق 5 كغ قابلة لإعادة الاستخدام، بدرجة نضج مناسبة. موعد التسليم ${arDate(DELIVERY_ISO)}. تجدون التفاصيل في بطاقة الحصاد المرفقة. شكراً لكم.`;
  const messageEn = `Your order is confirmed before harvest: ${num(alloc.qty)} kg Class 1 tomatoes in 5 kg reusable crates, at the right ripeness. Delivery ${deliverEn}. The attached Harvest and Packing Card has the details.`;

  return (
    <StepFrame index={3}>
      <div className="grid h-full grid-cols-[1fr_1fr] gap-6">
        <section className="flex min-h-0 flex-col rounded-3xl border border-charcoal-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
              <MessageCircle size={24} />
            </span>
            <div>
              <div className="text-xl font-bold">WhatsApp</div>
              <div className="text-base text-charcoal-500">
                {isAr ? farm.nameAr : farm.name}
              </div>
            </div>
          </div>
          <div className="mt-4 flex-1 rounded-2xl bg-[#e9f6ec] p-4">
            <div
              className={`rounded-2xl bg-[#d6f0dc] p-4 leading-[1.7] text-charcoal-900 ${
                cardLang === 'en' ? 'rounded-ee-md text-[21px]' : 'ar rounded-se-md text-[23px]'
              }`}
              dir={cardLang === 'en' ? 'ltr' : 'rtl'}
              lang={cardLang}
            >
              {cardLang === 'en' ? messageEn : cardLang === 'ur' ? messageUr : messageAr}
              <div className="mt-2 flex items-center justify-end gap-1 text-sm text-charcoal-500" dir="ltr">
                06:30 <CheckCheck size={16} className="text-sky-500" />
              </div>
            </div>
            {!isAr && cardLang !== 'en' ? (
              <p className="mt-3 text-base leading-snug text-charcoal-500">
                <span className="font-semibold">{t('In English', 'بالإنجليزية')}: </span>
                {messageEn}
              </p>
            ) : null}
          </div>
        </section>

        <section className="flex min-h-0 flex-col">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-lg font-semibold text-charcoal-500">
              {t('Harvest and Packing Card', 'بطاقة الحصاد والتعبئة')}
            </span>
            <div className="inline-flex rounded-xl bg-charcoal-100 p-1" role="group" dir="ltr">
              {(['ar', 'ur', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setCardLang(l)}
                  className={`h-10 min-w-[64px] rounded-lg px-3 text-base font-bold ${
                    cardLang === l ? 'bg-white text-brand-800 shadow-sm' : 'text-charcoal-500'
                  }`}
                >
                  {l === 'ar' ? 'عربي' : l === 'ur' ? 'اردو' : 'EN'}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <HarvestCard
              lang={cardLang}
              productId={CANONICAL_REQUEST.productId}
              spec={spec}
              qtyKg={alloc.qty}
              deliverBy={deliver}
              farmCode={farm.code}
              compact
              className="h-full"
            />
          </div>
        </section>
      </div>
    </StepFrame>
  );
}

/* ---------------- 4. National impact ---------------- */

export function ImpactStep() {
  const { isAr, t } = useLang();
  const meets = IMPACT.localSharePct >= IMPACT.targetPct;

  return (
    <StepFrame index={4}>
      <div className="grid h-full grid-cols-[0.85fr_1fr] gap-5">
        {/* Local share */}
        <section className="flex min-h-0 flex-col rounded-3xl border border-charcoal-200 bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-charcoal-500">
                {t('Local share of buyer spend (estimate)', 'الحصة المحلية من إنفاق المشترين (تقدير)')}
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-display text-[56px] font-extrabold leading-none text-brand-700" dir="ltr">
                  {IMPACT.localSharePct}%
                </span>
                <span className="text-xl font-semibold text-charcoal-500">
                  {t('against', 'مقابل')} {IMPACT.targetPct}%
                </span>
              </div>
            </div>
            {meets ? (
              <Chip tone="brand" className="!text-[17px]">
                <Target size={18} /> {t('Above target', 'فوق المستهدف')}
              </Chip>
            ) : null}
          </div>
          <div className="mt-4 flex flex-1 flex-col justify-evenly">
            <div className="text-base font-semibold text-charcoal-500">
              {t('Local share of volume by supply kind (estimate)', 'الحصة المحلية من الحجم بحسب نوع الإمداد (تقدير)')}
            </div>
            {IMPACT.byKind.map((k) => {
              const Icon = KIND_ICON[k.kind];
              return (
                <div key={k.kind} className="flex items-center gap-3">
                  <Icon size={22} className="shrink-0 text-brand-600" />
                  <span className="w-[210px] shrink-0 truncate text-[19px] font-semibold">
                    {SUPPLY_KIND_LABEL[k.kind][isAr ? 'ar' : 'en']}
                  </span>
                  <span className="relative h-4 flex-1 overflow-hidden rounded-full bg-charcoal-100">
                    <span
                      className="absolute inset-y-0 start-0 rounded-full bg-brand-500"
                      style={{ width: `${Math.min(100, k.localPct)}%` }}
                    />
                    <span
                      className="absolute inset-y-0 w-0.5 bg-charcoal-900"
                      style={{ insetInlineStart: `${IMPACT.targetPct}%` }}
                      title={`${IMPACT.targetPct}%`}
                    />
                  </span>
                  <span className="w-[64px] text-end text-[19px] font-bold tabular-nums" dir="ltr">
                    {k.localPct}%
                  </span>
                </div>
              );
            })}
          </div>
          <PolicyNote keys={['SUSTAINABLE_PRODUCT']} className="mt-2 !text-[21px] font-semibold" capitalise />
        </section>

        {/* Right column tiles */}
        <div className="grid min-h-0 grid-rows-[1fr_1.3fr_1fr] gap-3">
          <Tile
            icon={<Sprout size={26} />}
            label={t('Committed before harvest', 'ملتزم به قبل الحصاد')}
            value={`${num(IMPACT.committedBeforeHarvestKg)} ${t('kg', 'كغ')}`}
            sub={t('Produce picked against a confirmed order', 'محصول يُقطف مقابل طلب مؤكد')}
            policy={<PolicyNote keys={['NEMA']} />}
          />
          <Tile
            icon={<Route size={26} />}
            label={t('Food miles and truck trips saved (estimate)', 'أميال الغذاء ورحلات الشاحنات الموفَّرة (تقدير)')}
            value={`${num(IMPACT.kmAvoided)} ${t('km', 'كم')}`}
            sub={t(
              `${IMPACT.tripsSaved} truck trips saved (estimate) · ${num(IMPACT.co2SavedKg)} kg CO2e (estimate), across ${IMPACT.ordersWithRoute} orders against typical import routes`,
              `${IMPACT.tripsSaved} رحلة شاحنة موفَّرة (تقدير)، و${num(IMPACT.co2SavedKg)} كغ من مكافئ ثاني أكسيد الكربون (تقدير)، على ${IMPACT.ordersWithRoute} طلباً مقابل مسارات الاستيراد المعتادة`
            )}
            policy={
              <div>
                <PolicyNote keys={['NET_ZERO', 'GREEN_AGENDA']} />
                <p className="text-[14px] leading-snug text-charcoal-400">
                  {SOURCES.defra.label}; {SOURCES.glec.label}
                </p>
              </div>
            }
          />
          <Tile
            icon={<PackageCheck size={26} />}
            label={t('Packaging compliance', 'الالتزام بالتعبئة')}
            value={`${IMPACT.packagingCompliancePct}%`}
            sub={t(
              `${IMPACT.packagingCompliant} / ${IMPACT.packagingTotal} orders · ${num(IMPACT.crates)} reusable crates`,
              `${IMPACT.packagingCompliant} من ${IMPACT.packagingTotal} طلباً، و${num(IMPACT.crates)} صندوقاً قابلاً لإعادة الاستخدام`
            )}
            policy={<PolicyNote keys={['SINGLE_USE_DECISION', 'WASTE_LAW']} />}
          />
        </div>
      </div>
    </StepFrame>
  );
}

function Tile({
  icon,
  label,
  value,
  sub,
  policy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  policy: React.ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-col justify-between rounded-3xl border border-charcoal-200 bg-white px-4 py-3 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-semibold leading-tight text-charcoal-500">{label}</div>
          <div className="font-display text-[38px] font-extrabold leading-tight text-brand-800">
            <bdi dir="ltr">{value}</bdi>
          </div>
        </div>
      </div>
      <div>
        <div className="text-[20px] font-medium leading-snug text-charcoal-700">{sub}</div>
        {policy}
      </div>
    </section>
  );
}

/* ---------------- 5. Progress ---------------- */

export function ProgressStep() {
  const { pick } = useLang();
  return (
    <StepFrame index={5}>
      <div className="flex h-full flex-col gap-4">
        {/* Timeline strip */}
        <section className="shrink-0 rounded-3xl border border-charcoal-200 bg-white px-5 py-4 shadow-soft">
          <ol className="grid grid-cols-7 gap-3">
            {TIMELINE.map((e, i) => (
              <li key={e.id} className="relative">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      e.upcoming ? 'border-2 border-dashed border-brand-400 bg-white' : 'bg-brand-600'
                    }`}
                  >
                    {e.upcoming ? null : <Check size={12} className="text-white" />}
                  </span>
                  {i < TIMELINE.length - 1 ? <span className="h-0.5 flex-1 bg-brand-200" /> : null}
                </div>
                <div className="mt-2 text-[16px] font-bold leading-tight text-brand-800">{pick(e.date)}</div>
                <div className="mt-1 text-[15px] leading-snug text-charcoal-600">{pick(e.short)}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* Incubation table */}
        <section className="grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-3">
          {INCUBATION.map((r) => (
            <div key={r.id} className="flex min-h-0 flex-col justify-center rounded-2xl border border-charcoal-200 bg-white px-4 py-2.5 shadow-soft">
              <div className="text-[17px] font-bold leading-tight text-charcoal-900">{pick(r.advice)}</div>
              <div className="mt-0.5 text-[15px] leading-snug text-charcoal-600">{pick(r.implemented)}</div>
              <div className="mt-0.5 text-[14px] font-semibold text-brand-700">{pick(r.where)}</div>
            </div>
          ))}
        </section>
      </div>
    </StepFrame>
  );
}

/* ---------------- 6. Pilot ---------------- */

export function PilotStep() {
  const { pick, t } = useLang();
  const scope: { icon: typeof Users; value: Bi2; label: string }[] = [
    { icon: Sprout, value: PILOT.scope.farms, label: t('Farms', 'مزارع') },
    { icon: Building2, value: PILOT.scope.buyers, label: t('Commercial buyers', 'مشترون تجاريون') },
    { icon: Leaf, value: PILOT.scope.categories, label: t('Product categories', 'فئات المنتجات') },
    { icon: CalendarClock, value: PILOT.scope.weeks, label: t('Duration', 'المدة') },
  ];
  return (
    <StepFrame index={6}>
      <div className="flex h-full flex-col gap-4">
        <div className="grid shrink-0 grid-cols-4 gap-4">
          {scope.map((s) => {
            const Icon = s.icon;
            const headline = pick(s.value).split(' (')[0];
            return (
              <div key={s.label} className="rounded-2xl border border-charcoal-200 bg-white p-4 shadow-soft">
                <Icon size={26} className="text-brand-600" />
                <div className="mt-2 text-[24px] font-extrabold leading-tight text-brand-800">{headline}</div>
                <div className="text-[16px] font-semibold text-charcoal-500">{s.label}</div>
              </div>
            );
          })}
        </div>

        <section className="shrink-0 rounded-2xl border border-charcoal-200 bg-white p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-2">
            <span className="me-2 text-[17px] font-bold text-charcoal-500">{t('Success metrics, set in advance', 'مؤشرات النجاح المحددة مسبقاً')}</span>
            {PILOT.metrics.map((m) => (
              <Chip key={m.id} tone="brand" className="!text-[16px]">
                {pick(m)}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-[18px] font-medium text-charcoal-700">
            <span className="font-bold">{t('Regions', 'المناطق')}:</span> {pick(PILOT.regions)}.{' '}
            <span className="font-bold">{t('North star', 'الهدف الأسمى')}:</span> {pick(PILOT.northStar)}
          </p>
        </section>

        <section className="flex min-h-0 flex-1 items-center rounded-3xl bg-brand-gradient px-8 text-white shadow-lift">
          <div className="flex items-center gap-5">
            <Target size={44} className="shrink-0 text-white/80" />
            <p className="text-[30px] font-bold leading-snug">{pick(PILOT.ask)}</p>
          </div>
        </section>
      </div>
    </StepFrame>
  );
}

type Bi2 = { en: string; ar: string };

