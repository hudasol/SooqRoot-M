import { useState } from 'react';
import { Coins, Info, PackageCheck, Recycle, Route, ShieldAlert, Truck } from 'lucide-react';
import { Order } from '../types';
import { Badge, Button, Card, CardHeader, DataRow, Modal } from './ui';
import { orderEconomics, orderMiles, ECONOMICS } from '../lib/economics';
import { FACTORS, IMPORT_ROUTES, SOURCES, VAN_CAPACITY_KG, consolidationToBuyerKm, routeKgPerKg } from '../lib/emissions';
import { checkPackaging } from '../lib/engine';
import { POLICY } from '../data/policy';
import { formatAed } from '../lib/metrics';

/* ============================================================
   Order cards: packaging, asset light economics, food miles and
   local value. Every price, distance and emission figure is an
   estimate and says so.
   ============================================================ */

export function PackagingCard({ order }: { order: Order }) {
  const check = checkPackaging(order.packagingType, [{ packaging: order.packagingType, reusable: order.reusable }]);
  const primary = order.allocations.find((a) => a.role === 'primary');
  const returner = primary?.partnerChain?.delivery;
  return (
    <Card>
      <CardHeader
        title="Packaging"
        subtitle={`${POLICY.SINGLE_USE_DECISION.en.split(' regarding')[0]}`}
        icon={<PackageCheck size={16} />}
        action={
          check.status === 'compliant' ? (
            <Badge tone="emerald" icon={<PackageCheck size={11} />}>
              Compliant
            </Badge>
          ) : (
            <Badge tone="rose" icon={<ShieldAlert size={11} />}>
              Flagged
            </Badge>
          )
        }
      />
      <div className="mt-3">
        <DataRow label="Packaging" value={order.packagingType} />
        <DataRow label="Crates" value={order.crateCount.toLocaleString()} />
        <DataRow label="Reusable" value={order.reusable ? 'Yes' : 'No'} />
      </div>
      {check.flags.map((f) => (
        <div key={f.item} className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-2xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
          <span className="font-bold">{f.item}.</span> {f.reason} {f.alternative}
        </div>
      ))}
      {check.recommendation ? (
        <div className="mt-2 rounded-lg bg-canvas-soft px-3 py-2 text-2xs text-charcoal-600 dark:bg-charcoal-950 dark:text-charcoal-300">
          {check.recommendation}
        </div>
      ) : null}
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-2 text-2xs text-brand-800 dark:border-brand-900 dark:bg-brand-900/20 dark:text-brand-100">
        <Recycle size={13} className="mt-0.5 shrink-0" />
        <span>
          <span className="font-bold">Crate return loop.</span>{' '}
          {returner ? `${returner} collects the empty crates on the next run.` : 'The delivering partner collects the empty crates on the next run.'}{' '}
          {POLICY.WASTE_LAW.en}: {POLICY.WASTE_LAW.fact.toLowerCase()}.
        </span>
      </div>
    </Card>
  );
}

export function EconomicsCard({ order }: { order: Order }) {
  const e = orderEconomics(order);
  return (
    <Card>
      <CardHeader
        title="Asset light economics"
        subtitle="Logistics carried by partners. SooqRoot earns a software fee."
        icon={<Coins size={16} />}
      />
      <div className="mt-3">
        <DataRow label="Order value" value={`${formatAed(e.orderValueAed, { plain: true })} (estimate)`} />
        <DataRow label="Paid to UAE farms" value={`${formatAed(e.paidToFarmsAed, { plain: true })} (estimate)`} />
        <DataRow label="SooqRoot software fee" value={`${formatAed(e.feeAed, { plain: true })} (estimate), ${ECONOMICS.feePct}%`} />
        <DataRow label="Logistics, paid to partners" value={`${formatAed(e.logisticsAed, { plain: true })} (estimate)`} />
        <DataRow label="Farm share of order value" value={`${e.farmSharePct}% (estimate)`} />
      </div>
      <p className="mt-2 text-2xs text-charcoal-400">
        SooqRoot owns no trucks or warehouses. Buyer subscription AED {ECONOMICS.subscriptionAedPerMonth.toLocaleString()} per month (estimate).
      </p>
    </Card>
  );
}

export function FoodMilesCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const m = orderMiles(order);
  const e = orderEconomics(order);
  return (
    <Card>
      <CardHeader
        title="Food miles and local value"
        subtitle="Against a typical import route (estimate)"
        icon={<Route size={16} />}
        action={
          <Button variant="secondary" size="sm" icon={<Info size={13} />} onClick={() => setOpen(true)}>
            Assumptions
          </Button>
        }
      />
      <div className="mt-3">
        <DataRow label="Distance from allocated farms" value={`${m.localKm.toLocaleString()} km (estimate)`} />
        <DataRow label="Typical import route" value={m.importKm ? `${m.importKm.toLocaleString()} km (estimate)` : 'No reference route'} />
        <DataRow label="Route kilometres avoided" value={m.kmAvoided != null ? `${m.kmAvoided.toLocaleString()} km (estimate)` : 'Not estimated'} />
        <DataRow
          label="Truck trips saved by consolidation"
          value={`${e.trips.saved} of ${e.trips.direct} (estimate)`}
        />
        <DataRow label="Paid to UAE farms" value={`${e.farmSharePct}% of order value (estimate)`} />
        {m.co2SavedKg != null ? (
          <DataRow label="CO2e avoided" value={`${m.co2SavedKg.toLocaleString()} kg (estimate)`} />
        ) : null}
      </div>
      {m.co2SavedKg != null && m.sourceKey ? (
        <p className="mt-2 text-2xs text-charcoal-400">Source: {SOURCES[m.sourceKey].label}.</p>
      ) : null}
      <AssumptionsDrawer open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}

export function AssumptionsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Assumptions" subtitle="Distances, factors and prices behind the estimates" size="lg"
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <div className="space-y-5 text-xs text-charcoal-700 dark:text-charcoal-200">
        <section>
          <div className="sr-eyebrow mb-2">Typical import routes (estimate)</div>
          <table className="w-full text-2xs">
            <thead>
              <tr className="text-charcoal-400">
                <th className="py-1 text-start">Route</th>
                <th className="py-1 text-end">km</th>
                <th className="py-1 text-end">kg CO2e per kg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
              {IMPORT_ROUTES.map((r) => (
                <tr key={r.id}>
                  <td className="py-1.5">{r.label}</td>
                  <td className="py-1.5 text-end">{r.km.toLocaleString()}</td>
                  <td className="py-1.5 text-end">{routeKgPerKg(r).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <div className="sr-eyebrow mb-2">Emission factors, kg CO2e per tonne km</div>
          <ul className="space-y-1">
            <li>Long haul air freight, with radiative forcing: {FACTORS.airLongHaul.value}. <a className="text-brand-700 underline" href={SOURCES.defra.url} target="_blank" rel="noreferrer">{SOURCES.defra.label}</a></li>
            <li>Refrigerated road freight (HGV): {FACTORS.roadReefer.value}. <a className="text-brand-700 underline" href={SOURCES.glec.url} target="_blank" rel="noreferrer">{SOURCES.glec.label}</a></li>
          </ul>
          <p className="mt-2 text-2xs text-charcoal-400">
            CO2e is shown only for products with a reference import route in these sources. Other products show distance and trips only.
          </p>
        </section>
        <section>
          <div className="sr-eyebrow mb-2">Local route and trips</div>
          <ul className="space-y-1">
            <li>Farm gate to consolidation point: the distance recorded for each farm (estimate).</li>
            <li>Consolidation point to buyer: {consolidationToBuyerKm('Abu Dhabi')} km for Abu Dhabi and Dubai deliveries, the midpoint of 130 to 160 km (estimate).</li>
            <li>Trips saved: one direct trip per farm against one consolidated trip per {VAN_CAPACITY_KG.toLocaleString()} kg chiller van (estimate).</li>
          </ul>
        </section>
        <section>
          <div className="sr-eyebrow mb-2">Prices and fees (estimate)</div>
          <ul className="space-y-1">
            <li>Wholesale reference prices: Al Aweer ranges in the data pack, midpoint used.</li>
            <li>Logistics: AED 150 to 450 per drop, by partner and emirate route.</li>
            <li>SooqRoot software fee: {ECONOMICS.feePct}% of fulfilled order value. Buyer subscription: AED {ECONOMICS.subscriptionAedPerMonth.toLocaleString()} per month.</li>
          </ul>
        </section>
        <p className="flex items-start gap-2 text-2xs text-charcoal-400">
          <Truck size={12} className="mt-0.5 shrink-0" />
          {POLICY.NET_ZERO.en} and {POLICY.GREEN_AGENDA.en}.
        </p>
      </div>
    </Modal>
  );
}
