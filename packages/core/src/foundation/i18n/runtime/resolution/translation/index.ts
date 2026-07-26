/**
 * Pure translation lookup and interpolation.
 *
 * The chain is exactly three tiers, always in this order, with no hidden
 * fourth hop:
 *
 *   1. `custom`   — tenant overrides, so a whitelabel app can replace any DS
 *                   string without forking a locale dictionary
 *   2. `locale`   — the active locale's dictionary
 *   3. `fallback` — the CONFIGURED fallback locale's dictionary, skipped when
 *                   it is the active locale (the lookup already happened)
 *
 * When tier 3 also misses, the lookup MISSES. The design system does not fall
 * through to English, or to any other locale, behind the configured fallback:
 * the fallback an application configures is the last word on which language it
 * is willing to show. A universal English floor would silently overrule an
 * app that deliberately configured, say, `fallbackLocale="es"`.
 */

import type {
  LocaleTranslations,
  SupportedLocale,
  TranslationResolution,
} from '@/foundation/i18n/kernel/contracts';

export interface TranslationResolutionOptions {
  key: string;
  params?: Record<string, string | number>;
  locale: SupportedLocale;
  fallbackLocale: SupportedLocale;
  customTranslations?: Partial<LocaleTranslations>;
  catalog: Readonly<Record<SupportedLocale, LocaleTranslations>>;
}

export function getTranslationValue(
  dictionary: unknown,
  path: string,
): string | undefined {
  const keys = path.split('.');
  let current = dictionary;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

export function interpolateTranslation(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, key: string) => (
    key in params ? String(params[key]) : match
  ));
}

/**
 * Resolves a key and reports WHICH tier answered.
 *
 * This is the single implementation of the chain; `resolveTranslation` is a
 * thin projection of it. Callers that must distinguish "translated" from
 * "missing" use this (or `tOr`), because the alternative — comparing the
 * returned string to the key — cannot tell a genuine miss from a translation
 * that happens to equal its key, and quietly breaks for every namespace the
 * comparison was not written for.
 */
export function resolveTranslationEntry({
  key,
  params,
  locale,
  fallbackLocale,
  customTranslations,
  catalog,
}: TranslationResolutionOptions): TranslationResolution {
  // An empty string is a legitimate translation ("render nothing here" — e.g.
  // es/ar listToolbar.densitySuffix, whose adjectives already agree with the
  // noun), so lookups test for presence, not truthiness.
  const customValue = getTranslationValue(customTranslations, key);
  if (customValue !== undefined) {
    return { tier: 'custom', value: interpolateTranslation(customValue, params) };
  }

  const localeValue = getTranslationValue(catalog[locale], key);
  if (localeValue !== undefined) {
    return { tier: 'locale', value: interpolateTranslation(localeValue, params) };
  }

  if (locale !== fallbackLocale) {
    const fallbackValue = getTranslationValue(catalog[fallbackLocale], key);
    if (fallbackValue !== undefined) {
      return { tier: 'fallback', value: interpolateTranslation(fallbackValue, params) };
    }
  }

  return { tier: 'missing', value: undefined };
}

export function resolveTranslation(
  options: TranslationResolutionOptions,
): string | undefined {
  return resolveTranslationEntry(options).value;
}

/**
 * Resolves a key against a caller-owned floor.
 *
 * The floor is used only for a genuine miss, and is interpolated exactly like
 * catalog copy so it can carry the same placeholders.
 */
export function resolveTranslationOr(
  options: TranslationResolutionOptions,
  fallback: string,
): string {
  const resolution = resolveTranslationEntry(options);
  return resolution.tier === 'missing'
    ? interpolateTranslation(fallback, options.params)
    : resolution.value;
}
