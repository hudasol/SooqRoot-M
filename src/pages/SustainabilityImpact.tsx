import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coins, Info, Leaf, Package, Recycle, Route, ShieldCheck, Sprout, Truck } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../state/AppStore';
import { Badge, Button, Card, CardHeader, PageHeader, Progress } from '../components/ui';
import { ChartTooltip } from '../components/viz/ChartTooltip';
import { AssumptionsDrawer } from '../components/OrderCards';
import { useChartColors } from '../lib/theme';
import { BATCH_PASSPORTS } from '../data/traceability';
import { POLICY } from '../data/policy';
import { formatAed } from '../lib/metrics';
import { formatCo2, SOURCES } from '../lib/emissions';
import { nationalImpact } from '../lib/national';
import { orderEconomics, orderMiles } from '../lib/economics';

/* ============================================================
   Sustainability Impact
   UAE Net Zero 2050 Strategic Initiative and UAE Green Agenda
   2030. Every figure is an estimate computed from the sample
   order book. CO2e uses the published factors listed in the
   Assumptions drawer.
   ============================================================ */

export function SustainabilityImpact() {
  const { orders } = useStore();
  const chart = useChartColors();
  const [drawer, setDrawer] = useState(false);

  const impact = useMemo(() => nationalImpact(orders), [orders]);
  const paidToFarms = useMemo(
    () => orders.reduce((s, o) => s + (o.allocations.length ? orderEconomics(o).paidToFarmsAed : 0), 0),
    [orders]
  );
  const byOrder = useMemo(
    () =>
      orders
        .filter((o) => o.allocations.some((a) => a.role === 'primary'))
        .map((o) => ({ ref: o.ref, co2: orderMiles(o).co2SavedKg }))
        .filter((r) => r.co2 != null)
        .map((r) => ({ ref: r.ref, co2: Math.round((r.co2 as number) / 100) / 10 })),
    [orders]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="Sustainability Impact"
        subtitle={`${POLICY.NET_ZERO.en} and ${POLICY.GREEN_AGENDA.en}. Food miles, truck trips and value paid to UAE farms, each an estimate against a typical import route.`}
        actions={
          <>
            <Badge tone="emerald" icon={<Leaf size={12} />}>
              Estimates, sample network
            </Badge>
            <Button variant="secondary" icon={<Info size={14} />} onClick={() => setDrawer(true)}>
              Assumptions
            </Button>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ImpactCard
          icon={<Leaf size={17} />}
          label="CO₂e avoided (estimate)"
          value={`${(impact.co2SavedKg / 1000).toFixed(1)} t`}
          hint={`${SOURCES.defra.label}; ${SOURCES.glec.label}`}
          accent="#2a714c"
        />
        <ImpactCard
          icon={<Route size={17} />}
          label="Route kilometres avoided (estimate)"
          value={`${impact.kmAvoided.toLocaleString()} km`}
          hint={`Summed over ${impact.ordersWithRoute} orders with a reference import route`}
          accent="#b07f3e"
        />
        <ImpactCard
          icon={<Truck size={17} />}
          label="Truck trips saved (estimate)"
          value={impact.tripsSaved.toLocaleString()}
          hint="Partner consolidation against one trip per farm"
          accent="#2f6f8a"
        />
        <ImpactCard
          icon={<Coins size={17} />}
          label="Paid to UAE farms (estimate)"
          value={formatAed(paidToFarms, { compact: true })}
          hint="Order value less the SooqRoot software fee"
          accent="#5ca87e"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_minmax(0,360px)]">
        <Card>
          <CardHeader
            title="CO₂e avoided by order"
            subtitle="Tonnes, against the typical import route for each product (estimate)"
            icon={<Leaf size={16} />}
          />
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byOrder} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="ref" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} unit=" t" />
                <Tooltip content={<ChartTooltip suffix=" t (estimate)" />} cursor={{ fill: chart.cursor }} />
                <Bar dataKey="co2" name="CO₂e avoided" fill={chart.brand} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-2xs text-charcoal-400">
            Shown only for products with a reference route in {SOURCES.defra.label} or {SOURCES.glec.label}. Other products show distance and trips only.
          </p>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Circularity" subtitle={POLICY.WASTE_LAW.en} icon={<Recycle size={16} />} />
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-charcoal-600 dark:text-charcoal-300">Reusable crates in the order book</span>
                  <span className="sr-num text-lg">{impact.crates.toLocaleString()}</span>
                </div>
                <p className="mt-1 text-2xs text-charcoal-400">The delivering partner collects empty crates on the next run.</p>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-charcoal-600 dark:text-charcoal-300">Packaging compliance</span>
                  <span className="sr-num text-lg">{impact.packagingCompliancePct}%</span>
                </div>
                <Progress value={impact.packagingCompliancePct} tone="healthy" className="mt-2" />
                <p className="mt-1 text-2xs text-charcoal-400">{POLICY.SINGLE_USE_DECISION.en.split(' regarding')[0]}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Proof of sourcing" subtitle="Every batch carries a passport" icon={<ShieldCheck size={16} />} />
            <div className="mt-3 space-y-2">
              {BATCH_PASSPORTS.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-canvas-soft p-3 dark:bg-charcoal-950">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                    <Package size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-2xs font-bold text-charcoal-500">{p.batchId}</div>
                    <div className="text-2xs text-charcoal-400">
                      {p.distanceKm} km (estimate) · {formatCo2(p.co2SavedKg)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/passports" className="sr-btn-secondary mt-3 w-full text-xs">
              All batch passports <ArrowRight size={13} />
            </Link>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader title="Producer impact" subtitle="What commitment before harvest changes for a farm" icon={<Sprout size={16} />} />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Narrative
            title="Certainty before harvest"
            body="A confirmed commitment before the crop is picked lets a producer plan labour, inputs and cash flow instead of gambling on the spot market."
          />
          <Narrative
            title="Fewer intermediaries"
            body="Buyer demand reaches the farm through a partner chain of collection, consolidation and delivery, each named on the order."
          />
          <Narrative
            title="Less loss, shorter chain"
            body={`Volume is matched to demand before harvest, which supports the ${POLICY.NEMA.en} target to halve food loss and waste by 2030.`}
          />
        </div>
      </Card>

      <AssumptionsDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}

function ImpactCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-charcoal-400">
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div className="sr-num mt-3 text-3xl leading-none">{value}</div>
      <div className="mt-2 text-2xs text-charcoal-400">{hint}</div>
    </Card>
  );
}

function Narrative({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-charcoal-100 p-4 dark:border-charcoal-800">
      <h3 className="sr-h3">{title}</h3>
      <p className="sr-sub mt-1.5 text-xs">{body}</p>
    </div>
  );
}
