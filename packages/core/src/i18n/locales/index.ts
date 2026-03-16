/**
 * @fileoverview Barrel for all locale translation dictionaries.
 *
 * Each locale directory contains four JSON namespace files (common, components,
 * errors, validation) aggregated into a single `LocaleTranslations` object.
 * Adding a new locale requires creating its directory, JSON files, and
 * re-exporting here plus registering it in `LOCALE_CONFIGS` in `../types`.
 */

export { es } from './es';
export { en } from './en';
export { pt } from './pt';
export { fr } from './fr';
export { ar } from './ar';

export type { LocaleTranslations } from '../types';
