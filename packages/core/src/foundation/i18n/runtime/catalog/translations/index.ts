/**
 * Translation catalog for every supported locale.
 */

import type {
  LocaleTranslations,
  SupportedLocale,
} from '@/foundation/i18n/kernel/contracts';
import { ar, en, es, fr, pt } from './locales';

export { ar, en, es, fr, pt } from './locales';

export const TRANSLATION_CATALOG: Readonly<Record<SupportedLocale, LocaleTranslations>> = {
  es,
  en,
  pt,
  fr,
  ar,
};
