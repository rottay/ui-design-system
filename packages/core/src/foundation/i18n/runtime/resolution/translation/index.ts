/**
 * Pure translation lookup and interpolation.
 *
 * The chain is exactly four tiers, always in this order:
 *
 *   1. `custom`   — tenant overrides, so a whitelabel app can replace any DS
 *                   string without forking a locale dictionary
 *   2. `locale`   — the active locale's dictionary
 *   3. `fallback` — the CONFIGURED fallback locale's dictionary, skipped when
 *                   it is the active locale (the lookup already happened)
 *   4. `floor`    — English, the guaranteed-complete catalog
 *
 * Tier 4 does not overrule anybody. An application that configures
 * `fallbackLocale="es"` still has Spanish consulted first, for every key
 * Spanish has copy for; the floor answers only where the app's entire declared
 * chain has nothing. The alternative it replaces was not "the app's policy
 * wins" — it was a raw dotted key (`listToolbar.densitySuffix`) rendering into
 * production UI, which serves no language policy and no reader.
 *
 * A `missing` result therefore now means the key exists in NO catalog at all:
 * an authoring bug, not a translation gap. That is the only case where callers
 * still see the key echoed, and it warns in development.
 */

import type {
  LocaleTranslations,
  SupportedLocale,
  TranslationResolution,
} from '@/foundation/i18n/kernel/contracts';
import { TRANSLATION_FLOOR_LOCALE } from '@/foundation/i18n/kernel/contracts';

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

  // Terminal floor. Skipped when English was already one of the tiers above,
  // so a key genuinely absent from English still reports `missing` rather than
  // being looked up twice and reported as a floor hit.
  if (locale !== TRANSLATION_FLOOR_LOCALE && fallbackLocale !== TRANSLATION_FLOOR_LOCALE) {
    const floorValue = getTranslationValue(catalog[TRANSLATION_FLOOR_LOCALE], key);
    if (floorValue !== undefined) {
      return { tier: 'floor', value: interpolateTranslation(floorValue, params) };
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
 * The floor is interpolated exactly like catalog copy so it can carry the same
 * placeholders.
 *
 * It outranks the ENGLISH floor, and that ordering is the whole point: a call
 * site that writes `tOr(key, 'Suivant')` inside a French surface has supplied
 * copy in the right language for this exact spot. Preferring the DS's English
 * catalog there would discard a more specific, deliberately-authored answer in
 * favour of a generic one. The English floor exists to rescue call sites that
 * named no alternative; this one did.
 */
export function resolveTranslationOr(
  options: TranslationResolutionOptions,
  fallback: string,
): string {
  const resolution = resolveTranslationEntry(options);
  return resolution.tier === 'missing' || resolution.tier === 'floor'
    ? interpolateTranslation(fallback, options.params)
    : resolution.value;
}
