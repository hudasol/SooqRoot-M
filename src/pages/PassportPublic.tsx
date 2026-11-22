import { Link, useParams } from 'react-router-dom';
import { Check, Fingerprint, MapPin, ShieldCheck, Snowflake, Tag } from 'lucide-react';
import { Badge, Card, EmptyState } from '../components/ui';
import { LangToggle } from '../components/LangToggle';
import { QrCode } from '../components/QrCode';
import { useLang, num } from '../lib/i18n';
import { asset } from '../lib/assets';
import { getPassport, CUSTODY_ROLE_AR, PROVENANCE_AR } from '../data/traceability';
import { getProduct } from '../data/products';
import { FARM_MAP } from '../data/farms';
import { POLICY } from '../data/policy';

/* ============================================================
   Public Batch Passport (#/passport/:batchId). No sign in.
   Shows region, farm certification and provenance, batch weight,
   harvest time, buyer PO reference, custody chain and, for
   aquaculture, the cold chain log. Sample network record.
   ============================================================ */

export function PassportPublic() {
  const { batchId = '' } = useParams();
  const { isAr, t, root } = useLang();
  const p = getPassport(decodeURIComponent(batchId));

  return (
    <div {...root} className={`min-h-screen bg-canvas ${root.className}`}>
      <header className="border-b border-charcoal-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <img src={asset('darklogo.png')} alt="SooqRoot" className="h-8 w-auto" />
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {!p ? (
          <EmptyState
            title={t('Batch not found', 'الدفعة غير موجودة')}
            hint={t(
              'Check the QR code on the crate or carton and scan it again.',
              'تحقق من رمز QR على الصندوق أو الكرتون وامسحه مرة أخرى.'
            )}
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-lift">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-2xs font-bold uppercase tracking-widest">
                    <ShieldCheck size={12} /> {t('Verified local batch', 'دفعة محلية موثّقة')}
                  </div>
                  <h1 className="mt-3 font-display text-3xl font-extrabold">
                    {isAr ? getProduct(p.productId).nameAr : getProduct(p.productId).name}
                  </h1>
                  <div className="mt-1 text-sm text-white/80">
                    {num(p.qty)} {p.unit === 'kg' ? t('kg', 'كغ') : p.unit} · {t('Grade', 'الدرجة')} {p.grade}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 font-mono text-2xs text-white/70" dir="ltr">
                    <Fingerprint size={12} /> {p.batchId}
                  </div>
                </div>
                <QrCode batchId={p.batchId} size={96} />
              </div>
            </div>

            <Card>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <Row label={t('Region', 'المنطقة')} value={p.region} icon={<MapPin size={13} />} />
                <Row label={t('Farm', 'المزرعة')} value={isAr ? FARM_MAP[p.farmId]?.nameAr : FARM_MAP[p.farmId]?.name} />
                <Row
                  label={t('Farm registration', 'تسجيل المزرعة')}
                  value={<bdi dir="ltr" className="font-mono">{p.farmRegistrationNo}</bdi>}
                />
                <Row
                  label={t('Batch weight', 'وزن الدفعة')}
                  value={<bdi dir="ltr">{num(p.lotKg || p.qty)} {p.unit}</bdi>}
                />
                <Row label={t('Harvested', 'وقت الحصاد')} value={<bdi dir="ltr">{p.harvestedAt}</bdi>} />
                <Row
                  label={t('Buyer PO reference', 'مرجع أمر الشراء')}
                  value={<bdi dir="ltr" className="font-mono">{p.buyerPoRef}</bdi>}
                />
              </dl>

              <div className="mt-4">
                <div className="sr-eyebrow mb-2">{t('Farm certification', 'شهادات المزرعة')}</div>
                <div className="flex flex-wrap gap-1.5">
                  {p.certifications.map((c) => (
                    <Badge key={c} tone="emerald" icon={<ShieldCheck size={10} />}>
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
              {p.provenanceTags.length > 0 ? (
                <div className="mt-4">
                  <div className="sr-eyebrow mb-2">{t('Provenance', 'المنشأ')}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.provenanceTags.map((tag) => (
                      <Badge key={tag} tone="brand" icon={<Tag size={10} />}>
                        {isAr ? PROVENANCE_AR[tag] ?? tag : tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>

            <Card>
              <div className="sr-eyebrow mb-4">{t('Chain of custody', 'سلسلة العهدة')}</div>
              <ol className="relative space-y-4 border-s border-charcoal-100 ps-6">
                {p.custodyChain.map((c, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -start-[33px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <div className="text-2xs font-bold uppercase tracking-wider text-brand-700">
                      {isAr ? CUSTODY_ROLE_AR[c.role] : c.role}
                    </div>
                    <div className="text-sm font-semibold text-charcoal-900">{c.party}</div>
                    <div className="text-2xs text-charcoal-500">
                      <bdi dir="ltr">{c.at}</bdi> · {c.location}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            {p.coldChainLog ? (
              <Card>
                <div className="sr-eyebrow mb-3 flex items-center gap-1.5">
                  <Snowflake size={12} /> {t('Cold chain log', 'سجل السلسلة الباردة')}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-2xs uppercase tracking-wider text-charcoal-400">
                      <th className="py-1 text-start">{t('Time', 'الوقت')}</th>
                      <th className="py-1 text-start">{t('Point', 'النقطة')}</th>
                      <th className="py-1 text-end">{t('Temperature', 'الحرارة')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {p.coldChainLog.map((r, i) => (
                      <tr key={i}>
                        <td className="py-1.5 font-mono text-2xs" dir="ltr">
                          {r.at}
                        </td>
                        <td className="py-1.5 text-xs">{r.point}</td>
                        <td className="py-1.5 text-end font-semibold" dir="ltr">
                          {r.tempC.toFixed(1)} °C
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ) : null}

            <p className="text-center text-2xs leading-relaxed text-charcoal-400">
              {t('Traceability under', 'التتبع وفق')} {isAr ? POLICY.FOOD_SAFETY_LAW.ar : POLICY.FOOD_SAFETY_LAW.en}.{' '}
              {t('Figures shown use a sample supply network.', 'تستخدم الأرقام المعروضة شبكة إمداد نموذجية.')}
            </p>
            <p className="text-center text-2xs">
              <Link to="/login" className="font-semibold text-brand-700 hover:underline">
                SooqRoot · سوق روت
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-2xs font-bold uppercase tracking-wider text-charcoal-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-charcoal-900">{value}</dd>
    </div>
  );
}
