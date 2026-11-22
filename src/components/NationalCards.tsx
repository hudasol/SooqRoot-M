import { useMemo } from 'react';
import { Sprout, Target } from 'lucide-react';
import { Badge, Card, CardHeader, Progress } from './ui';
import { KIND_ICON } from './KindBadge';
import { useStore } from '../state/AppStore';
import { BUYER_LPI } from '../data/analytics';
import { getBuyer } from '../data/buyers';
import { LOCAL_SHARE_TARGET_PCT, POLICY } from '../data/policy';
import { SUPPLY_KIND_LABEL, SUPPLY_KINDS, supplyKindOf } from '../data/products';
import { nationalImpact } from '../lib/national';

/* ============================================================
   National targets: each buyer's local share against the
   Sustainable Product initiative target, by supply kind, and
   the food loss avoided card linked to ne'ma.
   ============================================================ */

export function NationalTargetsPanel() {
  const { orders } = useStore();

  // Share of each buyer's ordered volume (kg) already committed to UAE farms, by supply kind.
  const byBuyer = useMemo(() => {
    return BUYER_LPI.map((b) => {
      const mine = orders.filter((o) => o.buyerId === b.buyerId && o.unit === 'kg' && o.status !== 'Delivered');
      const kinds = SUPPLY_KINDS.map((k) => {
        const rows = mine.filter((o) => supplyKindOf(o.productId) === k);
        const qty = rows.reduce((s, o) => s + o.qty, 0);
        const committed = rows.reduce((s, o) => s + Math.min(o.committedQty, o.qty), 0);
        return { kind: k, pct: qty ? Math.round((committed / qty) * 100) : null };
      });
      return { ...b, kinds };
    });
  }, [orders]);

  return (
    <Card padded={false}>
      <div className="p-5 pb-3">
        <CardHeader
          title="National targets"
          subtitle={`${POLICY.SUSTAINABLE_PRODUCT.en}: ${POLICY.SUSTAINABLE_PRODUCT.fact}`}
          icon={<Target size={16} />}
          action={<Badge tone="sand">{LOCAL_SHARE_TARGET_PCT}% target</Badge>}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-y border-charcoal-100 bg-canvas-soft text-2xs font-bold uppercase tracking-wider text-charcoal-500 dark:border-charcoal-800 dark:bg-charcoal-950">
              <th className="px-5 py-2.5 text-start">Buyer</th>
              <th className="px-3 py-2.5 text-start">Local share against {LOCAL_SHARE_TARGET_PCT}% (estimate)</th>
              {SUPPLY_KINDS.map((k) => (
                <th key={k} className="px-3 py-2.5 text-end">
                  {SUPPLY_KIND_LABEL[k].en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
            {byBuyer.map((b) => {
              const buyer = getBuyer(b.buyerId);
              const meets = b.localPct >= LOCAL_SHARE_TARGET_PCT;
              return (
                <tr key={b.buyerId}>
                  <td className="px-5 py-3 font-semibold text-charcoal-800 dark:text-charcoal-100">{buyer?.name}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Progress value={(b.localPct / 50) * 100} tone={meets ? 'healthy' : 'attention'} height="h-1.5" className="w-32" />
                      <span className="sr-num text-sm">{b.localPct}%</span>
                      <Badge tone={meets ? 'emerald' : 'amber'}>{meets ? 'Meets target' : `${(LOCAL_SHARE_TARGET_PCT - b.localPct).toFixed(1)} pp to go`}</Badge>
                    </div>
                  </td>
                  {b.kinds.map((k) => {
                    const Icon = KIND_ICON[k.kind];
                    return (
                      <td key={k.kind} className="px-3 py-3 text-end text-xs text-charcoal-600 dark:text-charcoal-300">
                        {k.pct == null ? (
                          <span className="text-charcoal-300">None ordered</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Icon size={11} className="text-brand-600" />
                            {k.pct}%
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="px-5 py-3 text-2xs text-charcoal-400">
        By supply kind: share of each buyer&rsquo;s open ordered volume already committed to UAE farms before harvest (estimate, sample network).
      </p>
    </Card>
  );
}

export function FoodLossAvoidedCard({ className = '' }: { className?: string }) {
  const { orders } = useStore();
  const impact = useMemo(() => nationalImpact(orders), [orders]);
  const farms = useMemo(
    () => new Set(orders.filter((o) => o.status !== 'Delivered').flatMap((o) => o.allocations.filter((a) => a.role === 'primary').map((a) => a.farmId))).size,
    [orders]
  );
  return (
    <Card className={className}>
      <CardHeader title="Food loss avoided" subtitle={POLICY.NEMA.en} icon={<Sprout size={16} />} />
      <div className="mt-3 flex items-baseline gap-2">
        <span className="sr-num text-3xl leading-none">{impact.committedBeforeHarvestKg.toLocaleString()}</span>
        <span className="text-xs font-semibold text-charcoal-400">kg committed before harvest</span>
      </div>
      <p className="mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">
        Produce is picked against a confirmed order from {farms} farms, so it is not harvested into an unsold glut. {POLICY.NEMA.fact}.
      </p>
    </Card>
  );
}
