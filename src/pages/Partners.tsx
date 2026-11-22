import { useMemo, useState } from 'react';
import { Building2, Snowflake, Truck, Warehouse, Recycle, Route } from 'lucide-react';
import { Badge, Card, PageHeader, Segmented } from '../components/ui';
import { LangToggle } from '../components/LangToggle';
import { useLang } from '../lib/i18n';
import { CAPABILITY_LABEL, PARTNERS } from '../data/partners';
import { ORDERS } from '../data/orders';
import { PartnerCapability } from '../types';

/* ============================================================
   Partner Network
   SooqRoot does not own trucks or warehouses. Every commitment
   names who collects, who consolidates and who delivers.
   ============================================================ */

const CAP_ICON: Record<PartnerCapability, typeof Truck> = {
  collection: Truck,
  consolidation: Warehouse,
  cold_chain: Snowflake,
  delivery: Route,
  crate_return: Recycle,
};

const TYPE_AR: Record<string, string> = {
  Cooperative: 'تعاونية',
  Aggregator: 'مجمّع',
  Distributor: 'موزّع',
  'Logistics provider': 'مزوّد خدمات لوجستية',
};

const CAPS: PartnerCapability[] = ['collection', 'consolidation', 'cold_chain', 'delivery', 'crate_return'];

export function Partners() {
  const { lang, isAr, t, root } = useLang();
  const [filter, setFilter] = useState<'all' | PartnerCapability>('all');

  const list = useMemo(
    () => (filter === 'all' ? PARTNERS : PARTNERS.filter((p) => p.capabilities.includes(filter))),
    [filter]
  );

  // Orders each partner appears in, from the commitment chains.
  const usage = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const o of ORDERS) {
      for (const a of o.allocations) {
        const c = a.partnerChain;
        if (!c) continue;
        for (const n of [c.collection, c.consolidation, c.delivery, c.coldChain]) {
          if (!n) continue;
          if (!m.has(n)) m.set(n, new Set());
          m.get(n)!.add(o.ref);
        }
      }
    }
    return m;
  }, []);

  return (
    <div {...root} className={`space-y-6 ${root.className}`}>
      <PageHeader
        eyebrow={t('Supply Network', 'شبكة الإمداد')}
        title={t('Partner Network', 'شبكة الشركاء')}
        subtitle={t(
          'Cooperatives, aggregators, distributors and logistics providers carry collection, consolidation and delivery. SooqRoot earns a software fee.',
          'تتولى التعاونيات والمجمّعون والموزعون ومزودو الخدمات اللوجستية الجمع والتجميع والتوصيل، بينما يحصل سوق روت على رسوم برمجية.'
        )}
        actions={<LangToggle />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {CAPS.map((c) => {
          const Icon = CAP_ICON[c];
          const n = PARTNERS.filter((p) => p.capabilities.includes(c)).length;
          return (
            <Card key={c} className="!p-4">
              <Icon size={16} className="text-brand-600" />
              <div className="mt-2 font-display text-xl font-bold text-charcoal-900 dark:text-white">{n}</div>
              <div className="text-2xs font-semibold text-charcoal-500">{CAPABILITY_LABEL[c][lang]}</div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented<'all' | PartnerCapability>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('All', 'الكل') },
            ...CAPS.map((c) => ({ value: c, label: CAPABILITY_LABEL[c][lang] })),
          ]}
        />
        <span className="text-2xs text-charcoal-400">
          {t('Sample partners. No agreement is implied.', 'شركاء نموذجيون. لا يُقصد بذلك وجود اتفاق.')}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((p) => {
          const orders = usage.get(p.name);
          return (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                    <Building2 size={18} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="sr-h3">{isAr ? p.nameAr : p.name}</h3>
                    <div className="text-2xs text-charcoal-400">{isAr ? TYPE_AR[p.type] : p.type}</div>
                  </div>
                </div>
                <Badge tone="neutral">
                  AED {p.dropCostAed} {t('per drop (estimate)', 'للتوصيلة (تقدير)')}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.capabilities.map((c) => {
                  const Icon = CAP_ICON[c];
                  return (
                    <Badge key={c} tone={c === 'cold_chain' ? 'sky' : 'brand'} icon={<Icon size={11} />}>
                      {CAPABILITY_LABEL[c][lang]}
                    </Badge>
                  );
                })}
              </div>

              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 font-semibold text-charcoal-500">{t('Regions', 'المناطق')}</dt>
                  <dd className="text-charcoal-700 dark:text-charcoal-200">{p.regions.join(', ')}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 font-semibold text-charcoal-500">{t('Delivers to', 'يوصّل إلى')}</dt>
                  <dd className="text-charcoal-700 dark:text-charcoal-200">{p.deliversTo.join(', ')}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 font-semibold text-charcoal-500">{t('Fleet', 'الأسطول')}</dt>
                  <dd className="text-charcoal-700 dark:text-charcoal-200">{isAr ? p.vehiclesAr : p.vehicles}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 font-semibold text-charcoal-500">{t('In orders', 'في الطلبات')}</dt>
                  <dd className="font-mono text-charcoal-700 dark:text-charcoal-200" dir="ltr">
                    {orders ? [...orders].join(', ') : t('None yet', 'لا شيء بعد')}
                  </dd>
                </div>
              </dl>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
