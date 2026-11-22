import { Link } from 'react-router-dom';
import { Package, Ruler, Snowflake } from 'lucide-react';
import { Badge, Card, PageHeader } from '../components/ui';
import { LangToggle } from '../components/LangToggle';
import { KIND_ICON } from '../components/KindBadge';
import { useLang } from '../lib/i18n';
import { ALL_SPECS, cardText } from '../data/specs';
import { SUPPLY_KIND_LABEL, SUPPLY_KINDS, getProduct } from '../data/products';
import { term } from '../data/glossary';
import { POLICY } from '../data/policy';

/* ============================================================
   Harvest and Packing Guides for the four kinds of supply:
   grading, packing and handling, cold chain for fish, origin
   and labelling for honey, grading for dates. Numeric grading
   specs come from data pack section 10.4.
   ============================================================ */

export function Guides() {
  const { isAr, lang, t, root } = useLang();

  return (
    <div {...root} className={`space-y-6 ${root.className}`}>
      <PageHeader
        eyebrow={t('Supply Network', 'شبكة الإمداد')}
        title={t('Harvest and Packing Guides', 'أدلة الحصاد والتعبئة')}
        subtitle={t(
          'Grading, packing, handling and labelling rules for fresh produce, dates, honey and aquaculture. Each guide prints as a card for the foreman.',
          'قواعد الفرز والتعبئة والمناولة والتوسيم للخضروات والفواكه الطازجة والتمور والعسل والاستزراع السمكي. يُطبع كل دليل على شكل بطاقة للمشرف.'
        )}
        actions={<LangToggle />}
      />

      {SUPPLY_KINDS.map((kind) => {
        const Icon = KIND_ICON[kind];
        const specs = ALL_SPECS.filter((s) => s.kind === kind);
        return (
          <section key={kind}>
            <h2 className="sr-h2 mb-3 flex items-center gap-2">
              <Icon size={18} className="text-brand-600" />
              {SUPPLY_KIND_LABEL[kind][lang]}
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {specs.map((s) => (
                <Card key={s.key}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="sr-h3">{cardText(s.label, isAr ? 'ar' : 'en')}</h3>
                    <Badge tone="brand">{term(s.grade === 'class1' ? 'class1' : 'extra', lang)}</Badge>
                  </div>
                  <dl className="mt-3 space-y-2 text-xs">
                    <div className="flex gap-2">
                      <dt className="flex w-24 shrink-0 items-center gap-1 font-semibold text-charcoal-500">
                        <Package size={12} /> {t('Pack', 'التعبئة')}
                      </dt>
                      <dd>{cardText(s.packType, isAr ? 'ar' : 'en')}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="flex w-24 shrink-0 items-center gap-1 font-semibold text-charcoal-500">
                        <Ruler size={12} /> {t('Size', 'الحجم')}
                      </dt>
                      <dd>{cardText(s.size, isAr ? 'ar' : 'en')}</dd>
                    </div>
                  </dl>
                  <ul className="mt-3 space-y-1 text-xs text-charcoal-700 dark:text-charcoal-200">
                    {s.notes.map((n) => (
                      <li key={n.en} className="flex items-start gap-2">
                        {/0 to 5|10 to 12/.test(n.en) ? (
                          <Snowflake size={12} className="mt-0.5 shrink-0 text-sky-600" />
                        ) : (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        )}
                        {cardText(n, isAr ? 'ar' : 'en')}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {s.productIds.map((id) => (
                      <Badge key={id} tone="neutral">
                        {isAr ? getProduct(id).nameAr : getProduct(id).name}
                      </Badge>
                    ))}
                    <Link to="/demand" className="ms-auto text-2xs font-bold text-brand-700 hover:underline dark:text-brand-200">
                      {t('Make a card in Buyer Demand', 'أنشئ بطاقة من طلبات المشترين')}
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

      <p className="text-2xs text-charcoal-400">
        {t('Labels follow bilingual Arabic and English requirements. Packaging follows', 'تتبع الملصقات متطلبات اللغتين العربية والإنجليزية. وتتبع التعبئة')}{' '}
        {isAr ? POLICY.SINGLE_USE_DECISION.ar : POLICY.SINGLE_USE_DECISION.en}.
      </p>
    </div>
  );
}
