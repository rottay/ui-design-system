/**
 * BitHire application-selected semantic icon preset.
 *
 * The preset is generated from BitHire's productive Icon inventory. Consumers
 * may alias BitHireIconPreset to `Icon` while retaining synchronous SSR without
 * loading the complete 263-role compatibility registry.
 */
export {
  BITHIRE_PRESET_ICON_COMPONENTS,
  BITHIRE_PRESET_ICON_NAMES,
  BitHireIconPreset,
  isBitHirePresetIconName,
  resolveBitHirePresetIcon,
} from '../../../../graphics/icons/presentation/semantic/generated/presets/bithire';
export type {
  BitHireIconPresetProps,
  BitHirePresetIconName,
} from '../../../../graphics/icons/presentation/semantic/generated/presets/bithire';
export type {
  SemanticIconComponent,
  SemanticIconProps,
} from '../../../../graphics/icons/runtime/semantic/create-icon';
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
