/**
 * @fileoverview Spanish (es-ES) translation dictionary -- the default locale.
 *
 * Aggregates namespace JSON files into a typed `LocaleTranslations` object.
 */

import common from './common.json';
import components from './components.json';
import errors from './errors.json';
import validation from './validation.json';
import type { LocaleTranslations } from '../../types';

export const es: LocaleTranslations = {
  common,
  components,
  errors,
  validation,
};

export default es;
