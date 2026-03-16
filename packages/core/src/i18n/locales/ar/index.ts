/**
 * @fileoverview Arabic (ar-SA) translation dictionary.
 *
 * This is the only RTL locale. The I18nProvider automatically sets
 * `document.dir = 'rtl'` when this locale is active.
 */

import common from './common.json';
import components from './components.json';
import errors from './errors.json';
import validation from './validation.json';
import type { LocaleTranslations } from '../../types';

export const ar: LocaleTranslations = {
  common,
  components,
  errors,
  validation,
};

export default ar;
