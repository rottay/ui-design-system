/**
 * Explicit full-corpus compatibility boundary.
 *
 * This synchronous facade preserves every governed semantic role for callers
 * whose icon name is not statically bounded. It is intentionally separate
 * from route-sized role and preset entrypoints because it retains the complete
 * generated registry.
 */
export { Icon } from '../../../graphics/icons/presentation/semantic-icon';
export {
  ICON_CORPUS,
  ICON_NAMES,
  getIconCorpusEntry,
  isIconName,
} from '../../../graphics/icons/foundation/contracts/registry';
export { ICON_PROVENANCE } from '../../../graphics/icons/foundation/contracts/provenance';
export type {
  IconCorpusEntry,
  IconName,
} from '../../../graphics/icons/foundation/contracts/registry';
export type { IconProps } from '../../../graphics/icons/foundation/contracts/registry/semantic';
export type {
  IconMirroring,
  IconProvenance,
  IconRole,
  IconState,
  IconTone,
  SemanticIconSize,
} from '../../../graphics/icons/foundation/contracts';
export {
  GRAPHIC_ASSET_CLASSES,
  GRAPHIC_ASSET_PROVIDERS,
  GRAPHIC_ASSET_PROVIDER_BY_CLASS,
  GRAPHIC_ASSET_TELEMETRY_CODES,
  installGraphicAssetRuntimeControl,
} from '../../../infrastructure/runtime/graphics/asset-governance';
export type {
  GraphicAssetClass,
  GraphicAssetDisableScope,
  GraphicAssetProvider,
  GraphicAssetRuntimeControl,
  GraphicAssetTelemetryCode,
  GraphicAssetTelemetryEvent,
  GraphicAssetTelemetryOutcome,
} from '../../../infrastructure/runtime/graphics/asset-governance';
