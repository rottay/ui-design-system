/**
 * Compatibility shim: chart imports keep their existing topology while paint
 * resolution is shared with other supplier-neutral renderers.
 */
export {
  PROVIDER_PAINT_ATTRIBUTE_FILTER,
  resolveCssColor,
} from '../../../../../_internal/color/css/resolve-css-color';
export type {
  CssColorOwner as ChartColorOwner,
} from '../../../../../_internal/color/css/resolve-css-color';
