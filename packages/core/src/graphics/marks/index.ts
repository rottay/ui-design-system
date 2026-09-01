export { BrandMark } from './presentation/brand-mark';
export { CloudServiceMark } from './presentation/cloud-service-mark';
export {
  BRAND_MARK_NAMES,
  CLOUD_PROVIDERS,
  CLOUD_SERVICES,
  MARK_VARIANTS,
  isBrandMarkName,
  isCloudProvider,
  isCloudService,
  isMarkVariant,
} from './foundation/catalog';
export { BRAND_MARK_VARIANTS } from './runtime/resolution';
export {
  BRAND_MARK_PROVENANCE,
  CLOUD_SERVICE_MARK_PROVENANCE,
  MARK_CATALOG_SOURCE,
  MARK_RENDERER_SOURCE,
  MARK_TRADEMARK_NOTICE,
} from './runtime/provenance';
export type {
  BrandMarkName,
  BrandMarkProps,
  BrandMarkProvenance,
  CloudOpticalVariant,
  CloudProvider,
  CloudService,
  CloudServiceMarkProps,
  CloudServiceMarkProvenance,
  MarkLicense,
  MarkSize,
  MarkSizeToken,
  MarkSourcePackage,
  MarkVariant,
} from './foundation/catalog';
