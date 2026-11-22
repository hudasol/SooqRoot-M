import { useMemo, useState } from 'react';
import { CheckCircle2, Printer, ShieldAlert } from 'lucide-react';
import { Badge, Button, Segmented } from './ui';
import { HarvestCard } from './HarvestCard';
import { PrintPortal } from './PrintPortal';
import { checkPackaging } from '../lib/engine';
import { CardLang } from '../data/glossary';
import { specFor } from '../data/specs';
import { POLICY } from '../data/policy';
import { formatDate } from '../lib/metrics';

/** Live packaging check for buyer text. Flags only items prohibited under Ministerial Decision No. 380 of 2022. */
export function PackagingCheckPanel({ text, packaging }: { text: string; packaging?: string }) {
  const check = useMemo(() => checkPackaging(text, [{ packaging }]), [text, packaging]);
  return (
    <div
      className={`mt-3 rounded-xl border px-3 py-2.5 text-xs ${
        check.status === 'flagged'
          ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-100'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100'
      }`}
    >
      <div className="flex items-center gap-2 font-bold">
        {check.status === 'flagged' ? <ShieldAlert size={14} /> : <CheckCircle2 size={14} />}
        {check.status === 'flagged' ? 'Packaging flagged' : 'Packaging compliant'}
        <span className="ms-auto text-2xs font-semibold opacity-80">
          {POLICY.SINGLE_USE_DECISION.en.split(' regarding')[0]}
        </span>
      </div>
      {check.flags.map((f) => (
        <p key={f.item} className="mt-1.5">
          <span className="font-bold">{f.item}.</span> {f.reason} {f.alternative}
        </p>
      ))}
      {check.recommendation ? <p className="mt-1.5">{check.recommendation}</p> : null}
    </div>
  );
}

/**
 * Harvest and Packing Card for one product and quantity, with an Arabic, Urdu and English toggle
 * and an A5 print view.
 */
export function HarvestCardPreview({
  productId,
  qtyKg,
  requiredBy,
  initialLang = 'ar',
  farmCode,
}: {
  productId: string;
  qtyKg: number;
  requiredBy: string;
  initialLang?: CardLang;
  farmCode?: string;
}) {
  const [lang, setLang] = useState<CardLang>(initialLang);
  const [printing, setPrinting] = useState(false);
  const spec = specFor(productId, 'A');
  if (!spec) {
    return <Badge tone="neutral">No pack guide for this crop yet</Badge>;
  }
  const card = (
    <HarvestCard
      lang={lang}
      productId={productId}
      spec={spec}
      qtyKg={qtyKg}
      deliverBy={formatDate(requiredBy, 'long')}
      farmCode={farmCode}
    />
  );
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="sr-eyebrow">Harvest and Packing Card</span>
        <div className="flex items-center gap-2">
          <Segmented<CardLang>
            value={lang}
            onChange={setLang}
            options={[
              { value: 'ar', label: 'عربي' },
              { value: 'ur', label: 'اردو' },
              { value: 'en', label: 'EN' },
            ]}
          />
          <Button variant="secondary" size="sm" icon={<Printer size={13} />} onClick={() => setPrinting(true)}>
            Print A5
          </Button>
        </div>
      </div>
      {card}
      {lang === 'ur' ? (
        <p className="mt-1.5 text-2xs text-charcoal-400">Urdu terms should be reviewed by a native speaker before field use.</p>
      ) : null}
      {printing ? (
        <PrintPortal title="Harvest and Packing Card, A5" onClose={() => setPrinting(false)}>
          <div className="mx-auto max-w-[148mm]">{card}</div>
        </PrintPortal>
      ) : null}
    </div>
  );
}
