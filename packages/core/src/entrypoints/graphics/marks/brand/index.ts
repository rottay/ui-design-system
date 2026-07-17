/** Focused public boundary for company/product brand marks only. */
export { BrandMark } from '../../../../graphics/brand-marks/presentation/brand-mark';
export {
  BRAND_MARK_NAMES,
  MARK_VARIANTS,
  isBrandMarkName,
  isMarkVariant,
} from '../../../../graphics/brand-marks/foundation/catalog';
export {
  BRAND_MARK_PROVENANCE,
  MARK_CATALOG_SOURCE,
  MARK_RENDERER_SOURCE,
  MARK_TRADEMARK_NOTICE,
} from '../../../../graphics/brand-marks/runtime/provenance';
export { BRAND_MARK_VARIANTS } from '../../../../graphics/brand-marks/runtime/resolution/brand-variant';
export type {
  BrandMarkName,
  BrandMarkProps,
  BrandMarkProvenance,
  MarkLicense,
  MarkSize,
  MarkSizeToken,
  MarkSourcePackage,
  MarkVariant,
} from '../../../../graphics/brand-marks/foundation/catalog';
export {
  GRAPHIC_ASSET_CLASSES,
  GRAPHIC_ASSET_PROVIDERS,
  GRAPHIC_ASSET_PROVIDER_BY_CLASS,
  GRAPHIC_ASSET_TELEMETRY_CODES,
  installGraphicAssetRuntimeControl,
} from '../../../../infrastructure/runtime/graphics/asset-governance';
export type {
  GraphicAssetClass,
  GraphicAssetDisableScope,
  GraphicAssetProvider,
  GraphicAssetRuntimeControl,
  GraphicAssetTelemetryCode,
  GraphicAssetTelemetryEvent,
  GraphicAssetTelemetryOutcome,
} from '../../../../infrastructure/runtime/graphics/asset-governance';
