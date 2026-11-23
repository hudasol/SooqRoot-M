import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadItem, saveItem } from './storage';

/* ============================================================
   Language
   English and Arabic. Screens read the language from here and
   set dir on their own container, so right to left layout is
   applied per screen. Text is passed inline: t('English', 'العربية').
   ============================================================ */

export type Lang = 'en' | 'ar';

interface LangValue {
  lang: Lang;
  isAr: boolean;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** Pick the English or Arabic string. */
  t: (en: string, ar: string) => string;
  /** Pick a field from a bilingual object. */
  pick: <T>(v: { en: T; ar: T }) => T;
  /** Spread on a page root so right to left layout and the Arabic font apply. */
  root: { dir: 'ltr' | 'rtl'; lang: Lang; className: string };
}

const Ctx = createContext<LangValue | null>(null);

/**
 * With persist set to false the language is local to this provider: it starts in English,
 * is never read from or written to storage, and is gone when the provider unmounts.
 * Minister Mode uses this so its language never reaches the rest of the application.
 */
export function LangProvider({ children, persist = true }: { children: React.ReactNode; persist?: boolean }) {
  const [lang, setLangState] = useState<Lang>(() => (persist ? loadItem<Lang>('lang', 'en') : 'en'));

  useEffect(() => {
    if (persist) saveItem('lang', lang);
  }, [lang, persist]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(() => setLangState((l) => (l === 'en' ? 'ar' : 'en')), []);

  const value = useMemo<LangValue>(
    () => ({
      lang,
      isAr: lang === 'ar',
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      setLang,
      toggle,
      t: (en, ar) => (lang === 'ar' ? ar : en),
      pick: (v) => (lang === 'ar' ? v.ar : v.en),
      root: { dir: lang === 'ar' ? 'rtl' : 'ltr', lang, className: lang === 'ar' ? 'font-ar' : '' },
    }),
    [lang, setLang, toggle]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}

/** Western digits with grouping, used for both languages so figures match the rest of the product. */
export function num(n: number, digits = 0): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
