import { Link } from 'react-router-dom';
import { Building2, CalendarClock, CalendarCheck, Leaf, MapPin, Presentation, Sprout, Target } from 'lucide-react';
import { Badge, Card, CardHeader, PageHeader } from '../components/ui';
import { LangToggle } from '../components/LangToggle';
import { useLang } from '../lib/i18n';
import { FIELD_PROGRAMME, PILOT } from '../data/pack';

/* ============================================================
   Pilot Plan
   Scope, regions, success metrics set in advance, the field
   programme and the ask. Content: data pack sections 7 and 8.
   ============================================================ */

export function Pilot() {
  const { pick, t, root } = useLang();

  const scope = [
    { icon: Sprout, value: PILOT.scope.farms, label: t('Farms', 'المزارع') },
    { icon: Building2, value: PILOT.scope.buyers, label: t('Commercial buyers', 'المشترون التجاريون') },
    { icon: Leaf, value: PILOT.scope.categories, label: t('Product categories', 'فئات المنتجات') },
    { icon: CalendarClock, value: PILOT.scope.weeks, label: t('Duration', 'المدة') },
  ];

  return (
    <div {...root} className={`space-y-6 ${root.className}`}>
      <PageHeader
        eyebrow={t('System', 'النظام')}
        title={t('Pilot Plan', 'خطة التجربة')}
        subtitle={t(
          'A narrow, measured pilot with success metrics set before it starts.',
          'تجربة تشغيلية محدودة النطاق وقابلة للقياس، بمؤشرات نجاح تُحدَّد قبل بدئها.'
        )}
        actions={
          <>
            <LangToggle />
            <Link to="/minister" className="sr-btn border border-charcoal-200 bg-white text-charcoal-700 hover:bg-charcoal-50 dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-100">
              <Presentation size={15} />
              {t('Minister Mode', 'وضع العرض')}
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {scope.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <Icon size={18} className="text-brand-600" />
              <div className="mt-2 font-display text-lg font-bold text-charcoal-900 dark:text-white">
                {pick(s.value).split(' (')[0]}
              </div>
              <div className="text-xs font-semibold text-charcoal-500">{s.label}</div>
              {pick(s.value).includes('(') ? (
                <div className="mt-1 text-2xs text-charcoal-400">{pick(s.value).slice(pick(s.value).indexOf('('))}</div>
              ) : null}
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={t('Regions', 'المناطق')} icon={<MapPin size={16} />} />
          <p className="mt-3 text-sm font-semibold text-charcoal-800 dark:text-charcoal-100">{pick(PILOT.regions)}</p>
          <CardHeader className="mt-6" title={t('North star', 'الهدف الأسمى')} icon={<Target size={16} />} />
          <p className="mt-3 text-sm text-charcoal-700 dark:text-charcoal-200">{pick(PILOT.northStar)}</p>
        </Card>

        <Card>
          <CardHeader
            title={t('Success metrics, set in advance', 'مؤشرات النجاح المحددة مسبقاً')}
            icon={<CalendarCheck size={16} />}
          />
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {PILOT.metrics.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-2 rounded-xl border border-charcoal-100 px-3 py-2 text-sm font-medium dark:border-charcoal-800"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {pick(m)}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title={t('Field programme', 'برنامج العمل الميداني')} subtitle={t('Seven regions, each scheduled', 'سبع مناطق، وكل منها مجدول')} />
        <ol className="mt-4 divide-y divide-charcoal-100 dark:divide-charcoal-800">
          {FIELD_PROGRAMME.map((f, i) => (
            <li key={f.id} className="flex items-start gap-3 py-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-2xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                {i + 1}
              </span>
              <p className="min-w-0 flex-1 text-sm text-charcoal-700 dark:text-charcoal-200">{pick(f.text)}</p>
              <Badge tone="sand">{t('Scheduled', 'مجدول')}</Badge>
            </li>
          ))}
        </ol>
      </Card>

      <section className="rounded-2xl bg-brand-gradient p-6 text-white shadow-lift md:p-8">
        <div className="text-2xs font-bold uppercase tracking-widest text-white/70">{t('The ask', 'الطلب')}</div>
        <p className="mt-2 max-w-3xl font-display text-xl font-bold leading-snug md:text-2xl">{pick(PILOT.ask)}</p>
      </section>
    </div>
  );
}
