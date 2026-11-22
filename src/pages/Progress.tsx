import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, CheckCircle2, Fish, Handshake, Sprout, Users } from 'lucide-react';
import { Badge, Card, CardHeader, PageHeader } from '../components/ui';
import { LangToggle } from '../components/LangToggle';
import { useLang } from '../lib/i18n';
import {
  FARMER_INSIGHTS,
  INCUBATION,
  PRODUCERS,
  PRODUCERS_PATTERN,
  PRODUCERS_SUMMARY,
  TIMELINE,
} from '../data/pack';

/* ============================================================
   Progress
   Timeline, what the incubation told us, what producers told us
   at the Emirates Agriculture Conference, and what farmers told
   us on farm visits. Content: data pack sections 3 to 6.
   ============================================================ */

const PRODUCER_ICON = [Sprout, Fish, Handshake];

export function Progress() {
  const { pick, t, root } = useLang();

  return (
    <div {...root} className={`space-y-6 ${root.className}`}>
      <PageHeader
        eyebrow={t('System', 'النظام')}
        title={t('Progress', 'التقدم')}
        subtitle={t(
          'From the ministry hackathon to version 2, and the field voices behind each feature.',
          'من هاكاثون الوزارة إلى الإصدار الثاني، وأصوات الميدان وراء كل ميزة.'
        )}
        actions={<LangToggle />}
      />

      {/* ---------------- Timeline ---------------- */}
      <Card>
        <CardHeader title={t('Timeline', 'الجدول الزمني')} icon={<Calendar size={16} />} />
        <ol className="relative mt-5 space-y-5 border-s border-charcoal-100 ps-6 dark:border-charcoal-800">
          {TIMELINE.map((e) => (
            <li key={e.id} className="relative">
              <span
                className={`absolute -start-[33px] inline-flex h-6 w-6 items-center justify-center rounded-full text-white ${
                  e.upcoming ? 'border-2 border-dashed border-brand-400 bg-white dark:bg-charcoal-900' : 'bg-brand-600'
                }`}
              >
                {e.upcoming ? null : <CheckCircle2 size={13} />}
              </span>
              <div className="text-2xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-200">
                {pick(e.date)}
              </div>
              <p className="sr-sub mt-1 max-w-3xl text-sm">{pick(e.milestone)}</p>
            </li>
          ))}
        </ol>
      </Card>

      {/* ---------------- Incubation ---------------- */}
      <Card padded={false}>
        <div className="p-5 pb-3">
          <CardHeader
            title={t('What the incubation told us, and how we implemented it', 'ما أخبرتنا به الحاضنة، وكيف نفّذناه')}
            icon={<Handshake size={16} />}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-charcoal-100 bg-canvas-soft text-start text-2xs font-bold uppercase tracking-wider text-charcoal-500 dark:border-charcoal-800 dark:bg-charcoal-950">
                <th className="px-5 py-2.5 text-start">{t('Advice', 'النصيحة')}</th>
                <th className="px-5 py-2.5 text-start">{t('How we implemented it', 'كيف نفّذناها')}</th>
                <th className="px-5 py-2.5 text-start">{t('Where it shows', 'أين تظهر')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
              {INCUBATION.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-5 py-3 font-semibold text-charcoal-800 dark:text-charcoal-100">{pick(r.advice)}</td>
                  <td className="px-5 py-3 text-charcoal-600 dark:text-charcoal-300">{pick(r.implemented)}</td>
                  <td className="px-5 py-3">
                    <Link to={r.to} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline dark:text-brand-200">
                      {pick(r.where)}
                      <ArrowUpRight size={13} className="rtl:-scale-x-100" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ---------------- Conference producers ---------------- */}
      <section>
        <div className="mb-3">
          <h2 className="sr-h2">
            {t('What producers told us at the Emirates Agriculture Conference', 'ما أخبرنا به المنتجون في مؤتمر الإمارات للزراعة')}
          </h2>
          <p className="sr-sub mt-1">{pick(PRODUCERS_SUMMARY)}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PRODUCERS.map((p, i) => {
            const Icon = PRODUCER_ICON[i] ?? Users;
            return (
              <Card key={p.id}>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900 dark:text-brand-200">
                  <Icon size={16} />
                </div>
                <h3 className="sr-h3 mt-3">{pick(p.producers)}</h3>
                <p className="sr-sub mt-1.5 text-xs">{pick(p.said)}</p>
                <Link to={p.to} className="mt-3 inline-flex items-center gap-1 text-2xs font-bold text-brand-700 hover:underline dark:text-brand-200">
                  {t('Shaped', 'شكّل')}: {pick(p.shaped)}
                  <ArrowUpRight size={12} className="rtl:-scale-x-100" />
                </Link>
              </Card>
            );
          })}
        </div>
        <p className="sr-sub mt-3 text-xs">{pick(PRODUCERS_PATTERN)}</p>
      </section>

      {/* ---------------- Farm visits ---------------- */}
      <section>
        <div className="mb-3">
          <h2 className="sr-h2">{t('What farmers told us on our farm visits', 'ما أخبرنا به المزارعون في زياراتنا للمزارع')}</h2>
          <p className="sr-sub mt-1">
            {t(
              'About 32 farms across seven regions, May to September 2026. Farm and family names are not shown.',
              'نحو 32 مزرعة في سبع مناطق، من مايو إلى سبتمبر 2026. لا تُعرض أسماء المزارع ولا العائلات.'
            )}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {FARMER_INSIGHTS.map((f) => (
            <Card key={f.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-2xs font-bold uppercase tracking-wider text-sand-600">{f.no}</div>
                  <h3 className="sr-h3 mt-0.5">{pick(f.title)}</h3>
                </div>
                <Badge tone="neutral">{pick(f.region)}</Badge>
              </div>
              <p className="sr-sub mt-1.5 text-2xs">{pick(f.farmType)}</p>
              <blockquote className="mt-3 border-s-2 border-brand-300 ps-3 text-sm italic leading-relaxed text-charcoal-700 dark:text-charcoal-200">
                {pick(f.quote)}
              </blockquote>
              <p className="sr-sub mt-3 text-xs">{pick(f.shaped)}</p>
              <Link
                to={f.to}
                className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-bold text-brand-700 hover:underline dark:text-brand-200"
              >
                {pick(f.feature)}
                <ArrowUpRight size={13} className="rtl:-scale-x-100" />
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
