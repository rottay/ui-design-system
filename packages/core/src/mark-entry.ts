/** Dedicated public entry for the supplier-independent mark facades. */
export { BrandMark } from './marks/BrandMark';
export { CloudServiceMark } from './marks/CloudServiceMark';
export {
  BRAND_MARK_NAMES,
  BRAND_MARK_VARIANTS,
  CLOUD_PROVIDERS,
  CLOUD_SERVICES,
  MARK_VARIANTS,
  isBrandMarkName,
  isCloudProvider,
  isCloudService,
  isMarkVariant,
} from './marks/registry';
export {
  BRAND_MARK_PROVENANCE,
  CLOUD_SERVICE_MARK_PROVENANCE,
  MARK_CATALOG_SOURCE,
  MARK_RENDERER_SOURCE,
  MARK_TRADEMARK_NOTICE,
} from './marks/provenance';
export type {
  BrandMarkName,
  CloudOpticalVariant,
  CloudProvider,
  CloudService,
} from './marks/registry';
export type {
  BrandMarkProps,
  BrandMarkProvenance,
  CloudServiceMarkProps,
  CloudServiceMarkProvenance,
  MarkLicense,
  MarkSize,
  MarkSizeToken,
  MarkSourcePackage,
  MarkVariant,
} from './marks/types';
