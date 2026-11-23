import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { LangProvider, useLang } from '../../lib/i18n';
import { useStore } from '../../state/AppStore';
import { asset } from '../../lib/assets';
import { MINISTER_COPY } from '../../data/pack';
import {
  CoverStep,
  BuyerOrderStep,
  CommitmentStep,
  FarmerStep,
  ImpactStep,
  ProgressStepEditorial,
  PilotStep,
} from './Steps';

/* ============================================================
   Minister Mode
   A dedicated presentation route outside the sign in gate.
   iPad landscape first. No page scroll inside a step. All data
   is local, so the route works without a network after first load.
   Move between steps with the buttons, arrow keys, a swipe, or a
   tap on the left or right edge.
   ============================================================ */

const STEP_COUNT = MINISTER_COPY.length;

/** Minister Mode keeps its own language, always English on entry and discarded on exit. */
export function Minister() {
  return (
    <LangProvider persist={false}>
      <MinisterScreen />
    </LangProvider>
  );
}

function MinisterScreen() {
  const { lang, dir, isAr, setLang, t } = useLang();
  const { session } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback((n: number) => setStep((s) => Math.max(0, Math.min(STEP_COUNT - 1, n))), []);
  const next = useCallback(() => setStep((s) => Math.min(STEP_COUNT - 1, s + 1)), []);
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  // Arrow keys follow reading direction.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // An open dialog (the Assumptions drawer) takes the keys first.
      if (document.querySelector('[role="dialog"]')) return;
      const fwd = isAr ? 'ArrowLeft' : 'ArrowRight';
      const bwd = isAr ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd || e.key === 'PageDown') next();
      else if (e.key === bwd || e.key === 'PageUp') back();
      else if (e.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAr, next, back]);

  const exit = () => navigate(session ? '/dashboard' : '/login');

  const copy = MINISTER_COPY[step];
  const isCover = step === 0;

  const onTouchStart = (e: React.TouchEvent) => {
    const p = e.touches[0];
    touch.current = { x: p.clientX, y: p.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - start.x;
    const dy = p.clientY - start.y;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    // Swipe towards the start edge moves forward, as turning a page.
    const forward = isAr ? dx > 0 : dx < 0;
    if (forward) next();
    else back();
  };

  const body = useMemo(() => {
    switch (step) {
      case 0:
        return <CoverStep />;
      case 1:
        return <BuyerOrderStep />;
      case 2:
        return <CommitmentStep />;
      case 3:
        return <FarmerStep />;
      case 4:
        return <ImpactStep />;
      case 5:
        return <ProgressStepEditorial />;
      default:
        return <PilotStep />;
    }
  }, [step]);

  return (
    <div
      dir={dir}
      lang={lang}
      className={`fixed inset-0 flex flex-col overflow-hidden bg-canvas text-charcoal-900 ${isAr ? 'font-ar' : ''}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ fontSize: 20 }}
    >
      {/* ---------------- Header ---------------- */}
      <header
        className={`relative z-20 flex h-[72px] shrink-0 items-center gap-4 px-8 ${
          isCover ? 'bg-brand-900 text-white' : 'border-b border-charcoal-100 bg-white'
        }`}
      >
        <img
          src={asset(isCover ? 'lightlogo.png' : 'darklogo.png')}
          alt="SooqRoot"
          className="h-9 w-auto"
        />

        <nav className="mx-auto flex items-center gap-2.5" aria-label={t('Steps', 'الخطوات')}>
          {MINISTER_COPY.map((c, i) => (
            <button
              key={c.key}
              onClick={() => go(i)}
              aria-label={`${i}. ${isAr ? c.label.ar : c.label.en}`}
              aria-current={i === step}
              className="flex h-10 items-center px-1"
            >
              <span
                className={`block h-3 rounded-full transition-all ${
                  i === step
                    ? `w-9 ${isCover ? 'bg-white' : 'bg-brand-600'}`
                    : `w-3 ${isCover ? 'bg-white/35' : i < step ? 'bg-brand-300' : 'bg-charcoal-200'}`
                }`}
              />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div
            className={`inline-flex rounded-xl p-1 ${isCover ? 'bg-white/10' : 'bg-charcoal-100'}`}
            role="group"
            aria-label={t('Language', 'اللغة')}
          >
            {(['en', 'ar'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`h-10 min-w-[56px] rounded-lg px-3 text-base font-bold transition ${
                  lang === l
                    ? isCover
                      ? 'bg-white text-brand-900'
                      : 'bg-white text-brand-800 shadow-sm'
                    : isCover
                      ? 'text-white/80'
                      : 'text-charcoal-500'
                }`}
              >
                {l === 'en' ? 'EN' : 'عربي'}
              </button>
            ))}
          </div>
          <button
            onClick={exit}
            aria-label={t('Exit Minister Mode', 'الخروج من وضع العرض')}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition ${
              isCover ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
            }`}
          >
            <X size={22} />
          </button>
        </div>
      </header>

      {/* ---------------- Step body ---------------- */}
      <main className="relative min-h-0 flex-1 overflow-hidden">
        {/* Edge taps. Start edge goes back, end edge goes forward. */}
        <button
          aria-label={t('Previous step', 'الخطوة السابقة')}
          onClick={back}
          className="absolute inset-y-0 start-0 z-10 w-8 cursor-w-resize opacity-0"
          tabIndex={-1}
        />
        <button
          aria-label={t('Next step', 'الخطوة التالية')}
          onClick={next}
          className="absolute inset-y-0 end-0 z-10 w-8 cursor-e-resize opacity-0"
          tabIndex={-1}
        />
        <div key={`${step}-${lang}`} className="h-full animate-in">
          {body}
        </div>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer
        className={`relative z-20 flex h-[88px] shrink-0 items-center justify-between gap-4 px-8 ${
          isCover ? 'bg-brand-900' : 'border-t border-charcoal-100 bg-white'
        }`}
      >
        <button
          onClick={back}
          disabled={step === 0}
          className={`inline-flex h-16 min-w-[168px] items-center justify-center gap-3 rounded-2xl px-7 text-xl font-bold transition disabled:opacity-30 ${
            isCover ? 'bg-white/10 text-white' : 'border border-charcoal-200 bg-white text-charcoal-700 hover:bg-charcoal-50'
          }`}
        >
          {isAr ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
          {t('Back', 'السابق')}
        </button>

        <div className={`text-lg font-semibold ${isCover ? 'text-white/70' : 'text-charcoal-500'}`} aria-live="polite">
          <span dir="ltr">
            {step + 1} / {STEP_COUNT}
          </span>
        </div>

        <button
          onClick={step === STEP_COUNT - 1 ? () => go(0) : next}
          className={`inline-flex h-16 min-w-[168px] items-center justify-center gap-3 rounded-2xl px-7 text-xl font-bold shadow-soft transition ${
            isCover ? 'bg-white text-brand-900 hover:bg-brand-50' : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          {step === STEP_COUNT - 1 ? t('Restart', 'البداية') : t('Next', 'التالي')}
          {isAr ? <ArrowLeft size={24} /> : <ArrowRight size={24} />}
        </button>
      </footer>
      <span className="sr-only">{isAr ? copy.headline.ar : copy.headline.en}</span>
    </div>
  );
}
