/**
 * Compatibility shim: chart imports keep their existing topology while paint
 * resolution is shared with other supplier-neutral renderers.
 */
export {
  PROVIDER_PAINT_ATTRIBUTE_FILTER,
  resolveCssColor,
} from '@/infrastructure/runtime/dom/runtime/css-color-resolution';
export type {
  CssColorOwner as ChartColorOwner,
} from '@/infrastructure/runtime/dom/runtime/css-color-resolution';
