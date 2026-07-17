/** Product-facing asset classes. They describe meaning, never a renderer supplier. */
export const GRAPHIC_ASSET_CLASSES = [
  'semantic-icon',
  'brand-mark',
  'cloud-service-mark',
  'feature-pictogram',
] as const;

export type GraphicAssetClass = (typeof GRAPHIC_ASSET_CLASSES)[number];

/**
 * Supplier-neutral adapter groups used by operational kill switches.
 *
 * Brand and cloud marks intentionally share one catalog provider while still
 * retaining separate class switches. A provider can therefore be withdrawn
 * without pretending those two asset classes are interchangeable.
 */
export const GRAPHIC_ASSET_PROVIDERS = [
  'functional-icons',
  'catalog-marks',
  'product-pictograms',
] as const;

export type GraphicAssetProvider = (typeof GRAPHIC_ASSET_PROVIDERS)[number];

export const GRAPHIC_ASSET_PROVIDER_BY_CLASS: Readonly<
  Record<GraphicAssetClass, GraphicAssetProvider>
> = Object.freeze({
  'semantic-icon': 'functional-icons',
  'brand-mark': 'catalog-marks',
  'cloud-service-mark': 'catalog-marks',
  'feature-pictogram': 'product-pictograms',
});

export const GRAPHIC_ASSET_TELEMETRY_CODES = [
  'adapter-disabled',
  'unmapped-name',
  'accessible-name-failure',
  'variant-fallback',
  'invalid-optical-input',
  'renderer-failure',
] as const;

export type GraphicAssetTelemetryCode = (typeof GRAPHIC_ASSET_TELEMETRY_CODES)[number];
export type GraphicAssetTelemetryOutcome = 'dropped' | 'fallback';
export type GraphicAssetDisableScope = 'class' | 'provider';

/** Bounded, supplier-free diagnostic emitted only on a degraded asset path. */
export interface GraphicAssetTelemetryEvent {
  readonly code: GraphicAssetTelemetryCode;
  readonly assetClass: GraphicAssetClass;
  readonly provider: GraphicAssetProvider;
  readonly assetKey: string;
  readonly outcome: GraphicAssetTelemetryOutcome;
  readonly disableScope?: GraphicAssetDisableScope;
}

export interface GraphicAssetRuntimeControl {
  /** Disable only the listed semantic classes. Other classes keep rendering. */
  readonly disabledClasses?: readonly GraphicAssetClass[];
  /** Disable only the listed supplier-neutral adapter groups. */
  readonly disabledProviders?: readonly GraphicAssetProvider[];
  /** Receives degraded-path diagnostics. Listener failures never break render. */
  readonly onTelemetry?: (event: GraphicAssetTelemetryEvent) => void;
}
