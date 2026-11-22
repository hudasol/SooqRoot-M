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
}

const Ctx = createContext<LangValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadItem<Lang>('lang', 'en'));

  useEffect(() => saveItem('lang', lang), [lang]);

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
