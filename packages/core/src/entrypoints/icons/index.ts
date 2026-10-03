/**
 * Dedicated public icon entry for `@rottay/design-system/icons`.
 *
 * `Icon` is the supplier-independent product facade. Named supplier glyphs
 * remain private to their existing component owners.
 * The entry file deliberately does not shadow the canonical
 * `src/graphics/icons/` owner.
 * Only this focused package subpath can reach the governed icon adapter.
 */
export { createIcon } from '../../graphics/icons/glyphs/runtime/factory';
export type {
  DSIconComponent,
  DSIconProps,
  DSIconSourceComponent,
  IconSize,
} from '../../graphics/icons/glyphs/runtime/factory';
export type {
  SvgIconProps,
  IconComponent,
} from '../../graphics/icons/glyphs/foundation/contracts';
export { ICON_SIZE_MAP, ICON_SIZE_TOKENS } from '../../graphics/icons/glyphs/foundation';
export type { IconSizeToken } from '../../graphics/icons/glyphs/foundation';
export { BaseIcon } from '../../graphics/icons/glyphs/foundation/contracts/base';
export { AlertIcon } from '../../graphics/icons/glyphs/presentation/catalog/status/alert-icon';
export { Icon } from '../../graphics/icons/semantic/presentation/icon';
export {
  ICON_CORPUS,
  ICON_NAMES,
  getIconCorpusEntry,
  isIconName,
} from '../../graphics/icons/semantic/foundation/registry';
export { ICON_PROVENANCE } from '../../graphics/icons/semantic/foundation/provenance';
export type { IconCorpusEntry, IconName } from '../../graphics/icons/semantic/foundation/registry';
export {
  BITHIRE_ICON_NAMES,
  FOUNDATION_ICON_NAMES,
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
  GENERATED_ICON_NAMES,
  IDENTITY_ICON_NAMES,
  INTELLIGENCE_ICON_NAMES,
  OPERATIONS_ICON_NAMES,
} from '../../graphics/icons/semantic/generated/corpus';
export type {
  BithireIconName,
  FoundationIconName,
  GeneratedIconMetadata,
  GeneratedIconName,
  GeneratedIconPack,
  GeneratedIconStatus,
  IdentityIconName,
  IntelligenceIconName,
  OperationsIconName,
} from '../../graphics/icons/semantic/generated/corpus';
export type { IconProps } from '../../graphics/icons/semantic/foundation/contracts';
export type {
  IconMirroring,
  IconProvenance,
  IconRole,
  IconState,
  IconTone,
  SemanticIconSize,
} from '../../graphics/icons/glyphs/foundation/contracts';
export {
  GRAPHIC_ASSET_CLASSES,
  GRAPHIC_ASSET_PROVIDERS,
  GRAPHIC_ASSET_PROVIDER_BY_CLASS,
  GRAPHIC_ASSET_TELEMETRY_CODES,
  installGraphicAssetRuntimeControl,
} from '../../infrastructure/runtime/graphics/asset-governance';
export type {
  GraphicAssetClass,
  GraphicAssetDisableScope,
  GraphicAssetProvider,
  GraphicAssetRuntimeControl,
  GraphicAssetTelemetryCode,
  GraphicAssetTelemetryEvent,
  GraphicAssetTelemetryOutcome,
} from '../../infrastructure/runtime/graphics/asset-governance';
