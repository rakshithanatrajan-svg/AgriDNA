import { useState, useEffect, useCallback, useRef } from 'react';
import { translateText, translateBatch } from '../services/translate';
import { useApp } from '../context/AppContext';

// Hook to translate a single string reactively
export function useT(text) {
  const { lang } = useApp();
  const [translated, setTranslated] = useState(text);
  const prevLang = useRef(lang);

  useEffect(() => {
    if (lang === 'en') { setTranslated(text); return; }
    let cancelled = false;
    translateText(text, lang).then(t => { if (!cancelled) setTranslated(t); });
    return () => { cancelled = true; };
  }, [text, lang]);

  return translated;
}

// Hook to translate a map of strings reactively
export function useTranslations(strings) {
  const { lang } = useApp();
  const [translated, setTranslated] = useState(strings);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    if (lang === 'en') { setTranslated(strings); return; }
    setLoading(true);
    try {
      const result = await translateBatch(strings, lang);
      setTranslated({ ...strings, ...result });
    } catch {
      setTranslated(strings);
    } finally {
      setLoading(false);
    }
  }, [lang]); // eslint-disable-line

  useEffect(() => { run(); }, [run]);

  return { t: translated, loading };
}

// Simple wrapper component: <Tx>Some text</Tx>
export function Tx({ children }) {
  const translated = useT(typeof children === 'string' ? children : '');
  return translated;
}
