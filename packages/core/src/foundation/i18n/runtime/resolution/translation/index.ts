/**
 * Pure translation lookup and interpolation.
 */

import type {
  LocaleTranslations,
  SupportedLocale,
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

export function resolveTranslation({
  key,
  params,
  locale,
  fallbackLocale,
  customTranslations,
  catalog,
}: TranslationResolutionOptions): string | undefined {
  const customValue = getTranslationValue(customTranslations, key);
  if (customValue) return interpolateTranslation(customValue, params);

  const localeValue = getTranslationValue(catalog[locale], key);
  if (localeValue) return interpolateTranslation(localeValue, params);

  if (locale !== fallbackLocale) {
    const fallbackValue = getTranslationValue(catalog[fallbackLocale], key);
    if (fallbackValue) return interpolateTranslation(fallbackValue, params);
  }

  return undefined;
}
