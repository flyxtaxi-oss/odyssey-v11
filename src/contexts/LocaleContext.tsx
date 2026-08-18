"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  type Locale,
  SUPPORTED_LOCALES,
  LOCALE_DIR,
  t as translate,
  type TranslationKey,
} from "@/lib/i18n";

// ==============================================================================
// Locale
// ==============================================================================
//
// src/lib/i18n.ts already held 89 keys translated into FR / EN / NL — roughly
// 400 lines of finished work — but nothing in the UI ever called `t()`. Every
// page hardcoded its strings, so the three dictionaries were dead weight and
// the app could not actually change language.
//
// The locale lives in localStorage, which is an *external store*: the server
// cannot see it, so rendering it directly would produce different markup on
// each side and break hydration. Reading it in an effect and calling setState
// works but causes a second render pass on every mount (and React now warns
// about it). `useSyncExternalStore` is the primitive built for this exact
// shape — it takes a server snapshot and a client snapshot, and it gives
// cross-tab synchronisation for free through the `storage` event.

const STORAGE_KEY = "odyssey.locale";
const DEFAULT: Locale = "fr";

/** Dispatched on same-tab writes; `storage` only fires in *other* tabs. */
const CHANGE_EVENT = "odyssey:locale-change";

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

/**
 * Best locale for a first-time visitor, from browser preferences.
 * `navigator.languages` is ordered by preference, so the first supported entry
 * wins — a visitor set to [nl-BE, fr-BE, en] gets Dutch, not English.
 */
function detectFromBrowser(): Locale {
  if (typeof navigator === "undefined") return DEFAULT;

  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.split("-")[0]?.toLowerCase();
    if (isLocale(base)) return base;
  }
  return DEFAULT;
}

// getSnapshot must return a stable value between changes or React re-renders
// forever, so the resolved locale is cached here rather than recomputed.
let cached: Locale | null = null;

function getSnapshot(): Locale {
  if (cached !== null) return cached;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    cached = isLocale(stored) ? stored : detectFromBrowser();
  } catch {
    // Private mode / storage disabled — browser preference is still useful.
    cached = detectFromBrowser();
  }
  return cached;
}

/** The server has no access to the visitor's storage; it always renders French. */
function getServerSnapshot(): Locale {
  return DEFAULT;
}

function subscribe(onChange: () => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cached = null; // another tab changed it — re-read
      onChange();
    }
  };
  const handleLocal = () => onChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, handleLocal);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, handleLocal);
  };
}

function writeLocale(next: Locale) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
    // Also a cookie, so server components and middleware can read the choice
    // without waiting for JavaScript.
    document.cookie = `${STORAGE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
  } catch {
    // Preference stays for this session only.
  }
  // Screen readers pick voice and pronunciation from <html lang>, and search
  // engines use it to index the page under the right language. `dir` makes the
  // browser lay Arabic out right-to-left, including mixed Arabic/Latin runs.
  document.documentElement.lang = next;
  document.documentElement.dir = LOCALE_DIR[next];
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** Translate a key in the current locale. Falls back to French, then the key. */
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Mirror the locale onto <html>. Synchronising React state with the DOM is
  // precisely what an effect is for. This also covers first load: writeLocale
  // only runs when the user *changes* language, so a visitor returning with
  // Arabic stored would otherwise get Arabic text in a left-to-right layout.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = LOCALE_DIR[locale];
  }, [locale]);

  const setLocale = useCallback((next: Locale) => writeLocale(next), []);
  const t = useCallback((key: TranslationKey) => translate(key, locale), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale doit être utilisé à l'intérieur de <LocaleProvider>");
  }
  return ctx;
}

/** Shorthand for components that only need to translate. */
export function useTranslation() {
  const { t, locale } = useLocale();
  return { t, locale };
}
