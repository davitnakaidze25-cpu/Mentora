import React, { createContext, useContext, useState, useCallback } from 'react';
import enDict from '../locales/en.json';
import kaDict from '../locales/ka.json';

export type Locale = 'en' | 'ka';

type Dict = Record<string, string>;

const dicts: Record<Locale, Dict> = {
  en: enDict as Dict,
  ka: kaDict as Dict,
};

interface LangContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = 'mentora-locale';

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    return stored ?? 'en';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.setAttribute('lang', l);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'ka' : 'en');
  }, [locale, setLocale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let str = dicts[locale][key] ?? dicts['en'][key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, String(v));
        });
      }
      return str;
    },
    [locale]
  );

  return (
    <LangContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LangContext.Provider>
  );
};

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
