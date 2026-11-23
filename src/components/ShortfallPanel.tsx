import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Check, MessageCircle, PackageSearch } from 'lucide-react';
import { Badge, Button, Card, Field, Input, Modal } from './ui';
import { useStore } from '../state/AppStore';
import { useLang } from '../lib/i18n';
import { Order } from '../types';
import { getFarm } from '../data/farms';
import { getProduct } from '../data/products';
import { networkWithout } from '../data/orders';
import { emirateFromLocation, reallocateShortfall, runCommitmentEngine, ShortfallResult } from '../lib/engine';
import { formatDate } from '../lib/metrics';

/* ============================================================
   Report shortfall / إبلاغ عن نقص
   The farm enters the revised available kilograms. The engine
   moves the gap to the nearest backup farm, previews the alert
   to that farm's foreman in their language, and proposes an
   approved substitute to the buyer when no backup fits.
   ============================================================ */

function foremanMessage(
  lang: 'ar' | 'ur' | 'en',
  p: { qty: number; product: string; productAr: string; productUr: string; ref: string; date: string; pack: string }
): string {
  if (lang === 'ar') {
    return `تنبيه من سوق روت: حُوِّل إلى مزرعتكم ${p.qty.toLocaleString('en-US')} كغ ${p.productAr} ضمن الطلب ${p.ref}. الحصاد قبل ${p.date}. التعبئة: ${p.pack}. يرجى تأكيد الاستلام.`;
  }
  if (lang === 'ur') {
    // Urdu wording should be reviewed by a native speaker before field use.
    return `سوق روٹ کی اطلاع: آرڈر ${p.ref} کے تحت ${p.qty.toLocaleString('en-US')} کلو ${p.productUr} آپ کے فارم کو منتقل کیا گیا ہے۔ کٹائی ${p.date} سے پہلے۔ پیکنگ: ${p.pack}۔ براہ کرم تصدیق کریں۔`;
  }
  return `SooqRoot alert: ${p.qty.toLocaleString('en-US')} kg ${p.product} has moved to your farm under order ${p.ref}. Harvest by ${p.date}. Packing: ${p.pack}. Please confirm.`;
}

import { PRODUCT_UR } from '../data/specs';

export function ReportShortfallButton({ order, farmId, size = 'sm' }: { order: Order; farmId: string; size?: 'sm' | 'md' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" size={size} icon={<AlertTriangle size={13} />} onClick={() => setOpen(true)}>
        Report shortfall / إبلاغ عن نقص
      </Button>
      {open ? <ShortfallModal order={order} farmId={farmId} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function ShortfallModal({ order, farmId, onClose }: { order: Order; farmId: string; onClose: () => void }) {
  const { commitOrder, pushActivity } = useStore();
  const { t } = useLang();
  const farm = getFarm(farmId);
  const mine = order.allocations.find((a) => a.farmId === farmId && a.role === 'primary');
  const allocated = mine?.qty ?? 0;
  const [actual, setActual] = useState(String(Math.round(allocated * 0.7)));
  const [outcome, setOutcome] = useState<ShortfallResult | null>(null);
  const [applied, setApplied] = useState(false);
  const [subApproved, setSubApproved] = useState(false);

  const engineResult = useMemo(
    () =>
      runCommitmentEngine(
        {
          productId: order.productId,
          qty: order.qty,
          unit: order.unit,
          grade: order.grade,
          requiredBy: order.requiredBy,
          packaging: order.packaging,
          orderRef: order.ref,
          placedOn: order.createdAt,
          deliveryEmirate: emirateFromLocation(order.deliveryLocation),
          buyerLocation: order.deliveryLocation,
        },
        networkWithout(order.ref)
      ),
    [order]
  );

  const product = getProduct(order.productId);
  const calc = () => {
    const kg = Math.max(0, Number(actual) || 0);
    setOutcome(reallocateShortfall(engineResult, farmId, kg));
    setApplied(false);
  };

  const apply = () => {
    if (!outcome) return;
    const total = outcome.allocations.reduce((s, a) => s + a.qty, 0);
    commitOrder(order.id, outcome.allocations, total);
    pushActivity({
      kind: 'exception',
      title: `Shortfall reported on ${order.ref}`,
      detail: `${farm?.name} reported ${outcome.actualKg.toLocaleString()} kg against ${outcome.allocatedKg.toLocaleString()} kg. ${outcome.shortfallKg.toLocaleString()} kg reallocated.`,
      actor: 'Huda Mueen',
    });
    setApplied(true);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Report shortfall / إبلاغ عن نقص"
      subtitle={`${farm?.name} · ${order.ref} · ${product.name}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('Close', 'إغلاق')}
          </Button>
          {outcome && outcome.shortfallKg > 0 ? (
            <Button icon={<Check size={14} />} onClick={apply} disabled={applied}>
              {applied ? 'Commitment updated' : 'Update commitment'}
            </Button>
          ) : null}
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label={`Revised available kilograms (committed ${allocated.toLocaleString()} kg)`} htmlFor="actual-kg">
          <Input id="actual-kg" inputMode="numeric" value={actual} onChange={(e) => setActual(e.target.value)} />
        </Field>
        <Button onClick={calc}>Reallocate</Button>
      </div>

      {outcome ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <Stat label="Committed" value={`${outcome.allocatedKg.toLocaleString()} kg`} />
            <Stat label="Now available" value={`${outcome.actualKg.toLocaleString()} kg`} />
            <Stat label="Shortfall" value={`${outcome.shortfallKg.toLocaleString()} kg`} tone={outcome.shortfallKg > 0 ? 'amber' : 'emerald'} />
          </div>

          {outcome.reassigned.map((r) => {
            const backup = getFarm(r.farmId);
            if (!backup) return null;
            const lang = backup.foremanLanguage;
            const text = foremanMessage(lang, {
              qty: r.qty,
              product: product.name,
              productAr: product.nameAr,
              productUr: PRODUCT_UR[order.productId] ?? product.name,
              ref: order.ref,
              date: formatDate(mine?.harvestDate ?? order.requiredBy, 'long', lang === 'ar' ? 'ar' : 'en'),
              pack: order.packaging,
            });
            return (
              <div key={r.farmId} className="rounded-xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-900 dark:bg-brand-900/20">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <ArrowRight size={13} />
                  {r.qty.toLocaleString()} kg to {backup.name}
                  <Badge tone="neutral">{r.distanceKm} km away</Badge>
                  <Badge tone="brand">Foreman reads {lang === 'ar' ? 'Arabic' : lang === 'ur' ? 'Urdu' : 'English'}</Badge>
                </div>
                <div className="mt-3 flex items-start gap-2">
                  <MessageCircle size={16} className="mt-1 shrink-0 text-emerald-600" />
                  <div
                    dir={lang === 'en' ? 'ltr' : 'rtl'}
                    className={`max-w-md rounded-2xl rounded-ss-md bg-[#d6f0dc] p-3 text-sm leading-relaxed text-charcoal-900 ${lang !== 'en' ? 'ar' : ''}`}
                  >
                    {text}
                  </div>
                </div>
                <p className="mt-1.5 text-2xs text-charcoal-400">In app message preview to the backup farm&rsquo;s foreman.</p>
              </div>
            );
          })}

          {outcome.shortfallKg > 0 && outcome.reassigned.length === 0 ? (
            <p className="text-xs text-charcoal-500">No backup farm has the same product and grade available.</p>
          ) : null}

          {outcome.substitute ? (
            <div className="rounded-xl border border-sand-200 bg-sand-50 p-4 dark:border-sand-600 dark:bg-sand-600/10">
              <div className="flex items-center gap-2 text-xs font-bold text-sand-600 dark:text-sand-200">
                <PackageSearch size={14} /> Substitute Advisor, buyer side
              </div>
              <p className="mt-2 text-xs text-charcoal-700 dark:text-charcoal-200">
                {outcome.unresolvedKg.toLocaleString()} kg could not be covered. Proposed substitute for buyer approval:{' '}
                <span className="font-bold">{getProduct(outcome.substitute.productId).name}</span> from{' '}
                {getFarm(outcome.substitute.farmId)?.name}.
              </p>
              <Button
                className="mt-3"
                size="sm"
                variant="secondary"
                disabled={subApproved}
                onClick={() => {
                  setSubApproved(true);
                  pushActivity({
                    kind: 'demand',
                    title: `Substitute proposed on ${order.ref}`,
                    detail: `${outcome.unresolvedKg.toLocaleString()} kg of ${product.name} offered as ${getProduct(outcome.substitute!.productId).name}. Awaiting buyer approval.`,
                    actor: 'Huda Mueen',
                  });
                }}
              >
                {subApproved ? 'Sent for buyer approval' : 'Send to buyer for approval'}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'amber' | 'emerald' }) {
  return (
    <Card className="!p-3">
      <div className="text-2xs uppercase tracking-wider text-charcoal-400">{label}</div>
      <div
        className={`sr-num mt-1 text-lg ${tone === 'amber' ? 'text-amber-600' : tone === 'emerald' ? 'text-emerald-600' : ''}`}
      >
        {value}
      </div>
    </Card>
  );
}
