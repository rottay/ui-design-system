/**
 * @fileoverview French (fr-FR) translation dictionary.
 *
 * Aggregates namespace JSON files into a typed `LocaleTranslations` object.
 */

import common from './common.json';
import components from './components.json';
import errors from './errors.json';
import validation from './validation.json';
import type { LocaleTranslations } from '@/foundation/i18n/kernel/contracts';

export const fr: LocaleTranslations = {
  common,
  components,
  errors,
  validation,
};

export default fr;
