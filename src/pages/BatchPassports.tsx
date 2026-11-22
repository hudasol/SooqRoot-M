import { formatCo2 } from '../lib/emissions';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Droplets,
  Fingerprint,
  Leaf,
  MapPin,
  Package,
  Printer,
  QrCode as QrIcon,
  Route as RouteIcon,
  ShieldCheck,
  Snowflake,
  Sprout,
  Tag,
} from 'lucide-react';
import { QrCode } from '../components/QrCode';
import { PrintPortal } from '../components/PrintPortal';
import { passportUrl } from '../lib/qr';
import { SOURCES } from '../lib/emissions';
import { useStore } from '../state/AppStore';
import { Badge, Button, Card, DataRow, Modal, PageHeader } from '../components/ui';
import { getProduct } from '../data/products';
import { farmPhoto, productPhoto } from '../data/media';
import { Avatar, Photo } from '../components/ui/Photo';
import { getFarm } from '../data/farms';
import { getBuyer } from '../data/buyers';
import { BATCH_PASSPORTS, traceLot } from '../data/traceability';
import { POLICY } from '../data/policy';
import { formatDate } from '../lib/metrics';
import { BatchPassport } from '../types';

export function BatchPassports() {
  const { orders } = useStore();
  const [open, setOpen] = useState<BatchPassport | null>(null);
  const [stickers, setStickers] = useState(false);

  const totalCo2 = BATCH_PASSPORTS.reduce((s, p) => s + (p.co2SavedKg ?? 0), 0);
  const avgDistance =
    BATCH_PASSPORTS.reduce((s, p) => s + p.distanceKm, 0) / Math.max(1, BATCH_PASSPORTS.length);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Batch Passports"
        subtitle={`Traceability across the food chain under ${POLICY.FOOD_SAFETY_LAW.en} and ${POLICY.FOOD_SAFETY_REGS.en.split(' regarding')[0]}. Each batch carries its farm registration, provenance, custody chain and estimated impact.`}
        actions={
          <>
            <Badge tone="emerald" icon={<ShieldCheck size={12} />}>
              {BATCH_PASSPORTS.length} issued
            </Badge>
            <Badge tone="brand" icon={<Leaf size={12} />}>
              {totalCo2.toLocaleString()} kg CO₂e avoided (estimate)
            </Badge>
            <Button variant="secondary" icon={<QrIcon size={15} />} onClick={() => setStickers(true)}>
              QR sticker sheet
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Tile label="Passports issued" value={BATCH_PASSPORTS.length.toString()} />
        <Tile label="Average food miles (estimate)" value={`${avgDistance.toFixed(1)} km`} />
        <Tile
          label="CO₂e avoided (estimate)"
          value={`${totalCo2.toLocaleString()} kg`}
          hint={`${SOURCES.defra.label}; ${SOURCES.glec.label}`}
        />
        <Tile label="Harvest lots" value={new Set(BATCH_PASSPORTS.map((p) => p.lotId)).size.toString()} hint="Each lot can be traced to every delivery" />
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BATCH_PASSPORTS.map((p) => {
          const product = getProduct(p.productId);
          const farm = getFarm(p.farmId);
          const buyer = getBuyer(p.buyerId);
          return (
            <button
              key={p.id}
              onClick={() => setOpen(p)}
              className="sr-card sr-card-hover group overflow-hidden p-0 text-start"
            >
              <div className="relative overflow-hidden bg-brand-gradient px-4 py-3 text-white">
                <Photo
                  src={productPhoto(p.productId, 560, 200)}
                  alt={product.name}
                  tint={product.color}
                  className="absolute inset-0 h-full w-full opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-950/90 to-brand-900/50" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="font-mono text-2xs font-semibold text-white/75">{p.batchId}</div>
                    <div className="mt-0.5 text-sm font-bold">{product.name}</div>
                  </div>
                  <ShieldCheck size={20} className="text-white/85" />
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="sr-num text-2xl leading-none">{p.qty.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-charcoal-400">{p.unit}</span>
                  <Badge tone="neutral" className="ms-auto">
                    Grade {p.grade}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5 text-2xs">
                  <div className="flex items-center gap-1.5 text-charcoal-500 dark:text-charcoal-400">
                    <Avatar src={farmPhoto(p.farmId, 48, 48)} alt={farm?.name ?? ''} size={18} />
                    {farm?.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-charcoal-500 dark:text-charcoal-400">
                    <Package size={11} /> {buyer?.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-charcoal-500 dark:text-charcoal-400">
                    <MapPin size={11} /> {p.distanceKm} km · harvested {formatDate(p.harvestedOn)}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-900/30">
                  <span className="text-2xs font-semibold text-brand-700 dark:text-brand-200">
                    CO₂e avoided
                  </span>
                  <span className="text-xs font-bold text-brand-700 dark:text-brand-200">
                    {formatCo2(p.co2SavedKg)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-charcoal-100 pt-3 text-2xs text-charcoal-400 dark:border-charcoal-800">
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Fingerprint size={10} /> {p.verificationHash}
                  </span>
                  <span className="font-semibold text-brand-600 group-hover:underline">View passport</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <PassportModal passport={open} onClose={() => setOpen(null)} orders={orders} />
      {stickers ? (
        <PrintPortal title="QR sticker sheet" onClose={() => setStickers(false)}>
          <div className="sr-sticker-sheet grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BATCH_PASSPORTS.map((p) => (
              <div key={p.id} className="sr-sticker flex items-center gap-2 rounded-lg border border-charcoal-300 bg-white p-2 text-charcoal-900">
                <QrCode batchId={p.batchId} size={84} />
                <div className="min-w-0 text-2xs leading-tight">
                  <div className="font-bold">{getProduct(p.productId).name}</div>
                  <div className="font-mono">{p.batchId}</div>
                  <div>{p.qty.toLocaleString()} {p.unit} · {p.region}</div>
                  <div className="text-charcoal-500">Harvested {p.harvestedOn}</div>
                </div>
              </div>
            ))}
          </div>
        </PrintPortal>
      ) : null}
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="sr-eyebrow">{label}</div>
      <div className="sr-num mt-2 text-2xl leading-none">{value}</div>
      {hint ? <div className="mt-1.5 text-2xs text-charcoal-400">{hint}</div> : null}
    </Card>
  );
}

function PassportModal({
  passport,
  onClose,
  orders,
}: {
  passport: BatchPassport | null;
  onClose: () => void;
  orders: ReturnType<typeof useStore>['orders'];
}) {
  if (!passport) return null;
  const product = getProduct(passport.productId);
  const farm = getFarm(passport.farmId);
  const buyer = getBuyer(passport.buyerId);
  const order = orders.find((o) => o.id === passport.orderId);

  return (
    <Modal
      open={Boolean(passport)}
      onClose={onClose}
      title={`Batch Passport · ${passport.batchId}`}
      subtitle="Auditable record of origin, custody and impact"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button icon={<Printer size={15} />} onClick={() => window.print()}>
            Print for buyer
          </Button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <div className="rounded-xl bg-brand-gradient p-5 text-white">
            <div className="text-2xs font-semibold uppercase tracking-widest text-white/65">
              Verified local batch
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl leading-none">{product.emoji}</span>
              <div>
                <div className="font-display text-2xl font-bold leading-none">
                  {passport.qty.toLocaleString()}
                  <span className="ms-1 text-sm font-semibold text-white/70">{passport.unit}</span>
                </div>
                <div className="mt-1 text-sm font-semibold">{product.name}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/15 pt-3 font-mono text-2xs text-white/70">
              <Fingerprint size={12} /> {passport.verificationHash}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-charcoal-100 p-3 dark:border-charcoal-800">
            <QrCode batchId={passport.batchId} size={88} />
            <div className="min-w-0 text-2xs text-charcoal-500">
              <div className="font-bold uppercase tracking-wider text-charcoal-400">Public passport</div>
              <a href={passportUrl(passport.batchId)} className="break-all font-mono text-brand-700 hover:underline dark:text-brand-200" target="_blank" rel="noreferrer">
                {passportUrl(passport.batchId)}
              </a>
            </div>
          </div>

          <div className="mt-4">
            <DataRow label="Batch ID" value={<span className="font-mono">{passport.batchId}</span>} />
            <DataRow label="Farm registration" value={<span className="font-mono">{passport.farmRegistrationNo}</span>} />
            <DataRow label="Region" value={passport.region} />
            <DataRow label="Buyer PO" value={<span className="font-mono">{passport.buyerPoRef}</span>} />
            <DataRow label="Harvest lot" value={<span className="font-mono">{passport.lotId}</span>} />
            <DataRow
              label="Order"
              value={
                order ? (
                  <Link to={`/orders/${order.id}`} className="hover:text-brand-700" onClick={onClose}>
                    {order.ref}
                  </Link>
                ) : (
                  ', '
                )
              }
            />
            <DataRow label="Grade" value={`Grade ${passport.grade}`} />
            <DataRow label="Farm" value={farm?.name ?? ', '} />
            <DataRow label="Buyer" value={buyer?.name ?? ', '} />
            <DataRow label="Harvested" value={formatDate(passport.harvestedOn, 'long')} />
            <DataRow label="Packed" value={formatDate(passport.packedOn, 'long')} />
            {passport.deliveredOn ? (
              <DataRow label="Delivered" value={formatDate(passport.deliveredOn, 'long')} />
            ) : null}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-2">
            <ImpactTile
              icon={<MapPin size={14} />}
              label="Food miles"
              value={`${passport.distanceKm} km`}
            />
            <ImpactTile
              icon={<Leaf size={14} />}
              label="CO₂e avoided"
              value={formatCo2(passport.co2SavedKg)}
            />
          </div>

          <div className="mt-3 rounded-xl border border-charcoal-100 p-3.5 dark:border-charcoal-800">
            <div className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-charcoal-500">
              <Droplets size={12} /> Water method
            </div>
            <p className="mt-1.5 text-xs text-charcoal-700 dark:text-charcoal-200">
              {passport.waterMethod}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {passport.certifications.map((c) => (
              <Badge key={c} tone="emerald" icon={<ShieldCheck size={10} />}>
                {c}
              </Badge>
            ))}
            {passport.provenanceTags.map((tag) => (
              <Badge key={tag} tone="brand" icon={<Tag size={10} />}>
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-4">
            <div className="sr-eyebrow mb-3">Custody</div>
            <ol className="relative space-y-3 border-s border-charcoal-100 ps-5 dark:border-charcoal-800">
              {passport.custodyChain.map((c, i) => (
                <li key={i} className="relative">
                  <span className="absolute -start-[25px] mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-sand-400 text-white">
                    <Check size={9} strokeWidth={3} />
                  </span>
                  <div className="text-2xs font-bold uppercase tracking-wider text-sand-600">{c.role}</div>
                  <div className="text-xs font-semibold text-charcoal-900 dark:text-white">{c.party}</div>
                  <div className="text-2xs text-charcoal-400">
                    {c.at} · {c.location}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {passport.coldChainLog ? (
            <div className="mt-4 rounded-xl border border-sky-100 p-3 dark:border-sky-900">
              <div className="sr-eyebrow mb-2 flex items-center gap-1.5">
                <Snowflake size={12} /> Cold chain log
              </div>
              <table className="w-full text-2xs">
                <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
                  {passport.coldChainLog.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-mono text-charcoal-400">{r.at}</td>
                      <td className="py-1">{r.point}</td>
                      <td className="py-1 text-end font-bold">{r.tempC.toFixed(1)} °C</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <TraceThisBatch passport={passport} />

          <div className="mt-4">
            <div className="sr-eyebrow mb-3">Chain of custody</div>
            <ol className="relative space-y-3 border-s border-charcoal-100 ps-5 dark:border-charcoal-800">
              {passport.checkpoints.map((c, i) => (
                <li key={i} className="relative">
                  <span className="absolute -start-[25px] mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check size={9} strokeWidth={3} />
                  </span>
                  <div className="text-xs font-bold text-charcoal-900 dark:text-white">{c.label}</div>
                  <div className="mt-0.5 text-2xs text-charcoal-400">
                    {c.at} · {c.by}
                  </div>
                  {c.note ? (
                    <div className="mt-1 rounded-md bg-canvas-soft px-2 py-1 text-2xs text-charcoal-600 dark:bg-charcoal-950 dark:text-charcoal-300">
                      {c.note}
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** Recall trace: every buyer and delivery drawn from the same harvest lot. */
function TraceThisBatch({ passport }: { passport: BatchPassport }) {
  const [shown, setShown] = useState(false);
  const rows = shown ? traceLot(passport.batchId) : [];
  return (
    <div className="mt-4">
      <Button variant="secondary" icon={<RouteIcon size={14} />} onClick={() => setShown((s) => !s)}>
        {shown ? 'Hide trace' : 'Trace this batch'}
      </Button>
      {shown ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-charcoal-100 dark:border-charcoal-800">
          <div className="bg-canvas-soft px-3 py-2 text-2xs font-semibold text-charcoal-500 dark:bg-charcoal-950">
            Lot {passport.lotId}: {rows.length} {rows.length === 1 ? 'delivery' : 'deliveries'}
          </div>
          <table className="w-full text-2xs">
            <thead>
              <tr className="text-charcoal-400">
                <th className="px-3 py-1.5 text-start">Buyer</th>
                <th className="px-3 py-1.5 text-start">Order</th>
                <th className="px-3 py-1.5 text-end">Qty</th>
                <th className="px-3 py-1.5 text-end">Delivered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
              {rows.map((r) => (
                <tr key={r.id} className={r.batchId === passport.batchId ? 'bg-brand-50/60 dark:bg-brand-900/20' : ''}>
                  <td className="px-3 py-1.5 font-semibold">{getBuyer(r.buyerId)?.name}</td>
                  <td className="px-3 py-1.5 font-mono">{r.buyerPoRef}</td>
                  <td className="px-3 py-1.5 text-end">{r.qty.toLocaleString()} {r.unit}</td>
                  <td className="px-3 py-1.5 text-end font-mono">{r.custodyChain[3]?.at ?? 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function ImpactTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-charcoal-100 p-3 dark:border-charcoal-800">
      <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-charcoal-400">
        {icon} {label}
      </div>
      <div className="sr-num mt-1.5 text-lg">{value}</div>
    </div>
  );
}
