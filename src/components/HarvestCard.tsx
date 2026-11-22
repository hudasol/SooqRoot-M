import { Package, Ruler, Scale, Scissors, Snowflake, Sprout } from 'lucide-react';
import { getProduct } from '../data/products';
import { CardLang, term } from '../data/glossary';
import { PRODUCT_UR, PackSpec, cardText } from '../data/specs';
import { asset } from '../lib/assets';

/* ============================================================
   Harvest and Packing Card
   One card per farm commitment. Visual spec icons: box type,
   target weight per crate, size or caliper range, and stem cut
   or whole harvest. Prints at A5 (see .sr-card-print in index.css).
   ============================================================ */

export interface HarvestCardProps {
  lang: CardLang;
  productId: string;
  spec: PackSpec;
  qtyKg: number;
  /** Delivery date, already formatted. */
  deliverBy: string;
  /** Code of the farm the card is addressed to, for example RC-021. */
  farmCode?: string;
  /** Optional size override, for example "60 to 75 mm". */
  sizeOverride?: string;
  compact?: boolean;
  /** Dark text on white in all themes so the card prints and reads the same everywhere. */
  className?: string;
}

function cropName(productId: string, lang: CardLang): string {
  const p = getProduct(productId);
  if (lang === 'ar') return p.nameAr;
  if (lang === 'ur') return PRODUCT_UR[productId] ?? p.name;
  return p.name;
}

const TITLE: Record<CardLang, string> = {
  en: 'Harvest and Packing Card',
  ar: 'بطاقة الحصاد والتعبئة',
  ur: 'کٹائی اور پیکنگ کارڈ',
};

export function HarvestCard({ lang, productId, spec, qtyKg, deliverBy, farmCode, sizeOverride, compact, className = '' }: HarvestCardProps) {
  const rtl = lang !== 'en';
  const crates = Math.ceil(qtyKg / spec.packKg);
  const p = getProduct(productId);
  const gradeLabel = term(spec.grade === 'class1' ? 'class1' : 'extra', lang);
  const harvestLabel = spec.harvest === 'stem' ? term('stemCut', lang) : term('whole', lang);
  const cold = spec.notes.some((n) => /0 to 5|10 to 12/.test(n.en));
  const fontClass = lang === 'en' ? '' : 'font-ar';
  const tile = compact ? 'px-2.5 py-1.5' : 'p-3';

  return (
    <article
      dir={rtl ? 'rtl' : 'ltr'}
      lang={lang}
      className={`sr-card-print flex flex-col overflow-hidden rounded-2xl border border-charcoal-200 bg-white text-charcoal-900 shadow-soft ${fontClass} ${className}`}
    >
      <header className={`flex items-center justify-between gap-3 bg-brand-gradient px-4 text-white ${compact ? 'py-1.5' : 'py-2.5'}`}>
        <img src={asset('lightlogo.png')} alt="SooqRoot" className="h-6 w-auto" />
        <span className="text-sm font-bold">{TITLE[lang]}</span>
      </header>

      <div className={`flex min-h-0 flex-1 flex-col ${compact ? 'gap-2 p-3' : 'gap-3 p-4'}`}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className={`font-display font-extrabold leading-tight ${compact ? 'text-2xl' : 'text-3xl'}`}>
              {cropName(productId, lang)}
            </div>
            <div className="mt-1 inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-bold text-brand-700">
              {gradeLabel}
            </div>
          </div>
          <div className="text-end">
            <div className="text-xs font-semibold text-charcoal-500">{term('qty', lang)}</div>
            <div className="font-display text-2xl font-extrabold leading-none" dir="ltr">
              {qtyKg.toLocaleString('en-US')} <span className="text-base font-bold">kg</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SpecTile icon={<Package size={20} />} label={term('box', lang)} value={cardText(spec.packType, lang)} pad={tile} />
          <SpecTile icon={<Scale size={20} />} label={term('weight', lang)} value={`${spec.packKg} kg`} pad={tile} ltrValue />
          <SpecTile icon={<Ruler size={20} />} label={term('size', lang)} value={sizeOverride ?? cardText(spec.size, lang)} pad={tile} />
          <SpecTile
            icon={spec.harvest === 'stem' ? <Scissors size={20} /> : <Sprout size={20} />}
            label={term('harvest', lang)}
            value={harvestLabel}
            pad={tile}
          />
        </div>

        <ul className={`font-medium text-charcoal-700 ${compact ? 'space-y-0.5 text-[13px]' : 'space-y-1 text-sm'}`}>
          {spec.grade === 'class1' ? (
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {term('noMix', lang)}
            </li>
          ) : null}
          {spec.notes.map((n) => (
            <li key={n.en} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {cardText(n, lang)}
            </li>
          ))}
          {cold ? (
            <li className="flex items-start gap-2 text-brand-700">
              <Snowflake size={14} className="mt-1 shrink-0" />
              {term('keepCool', lang)}
            </li>
          ) : null}
        </ul>

        <footer className={`mt-auto flex items-center justify-between gap-3 border-t border-charcoal-100 text-sm ${compact ? 'pt-2' : 'pt-3'}`}>
          <span>
            <span className="text-charcoal-500">{term('deliverBy', lang)}: </span>
            <bdi className="font-bold">{deliverBy}</bdi>
          </span>
          <span className="flex items-center gap-3 font-bold" dir="ltr">
            <span className="inline-flex items-center gap-1">
              <Package size={14} /> {crates} {lang === 'en' ? 'crates' : ''}
            </span>
            {farmCode ? <span className="font-mono text-xs text-charcoal-500">{farmCode}</span> : null}
          </span>
        </footer>
      </div>
    </article>
  );
}

function SpecTile({
  icon,
  label,
  value,
  pad,
  ltrValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  pad: string;
  ltrValue?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-charcoal-100 bg-canvas-soft ${pad}`}>
      <div className="flex items-center gap-2 text-brand-700">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wide text-charcoal-500">{label}</span>
      </div>
      <div className="mt-1 text-[15px] font-bold leading-snug" dir={ltrValue ? 'ltr' : undefined}>
        {value}
      </div>
    </div>
  );
}

