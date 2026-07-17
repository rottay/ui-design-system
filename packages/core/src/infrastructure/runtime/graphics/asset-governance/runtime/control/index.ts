import {
  GRAPHIC_ASSET_CLASSES,
  GRAPHIC_ASSET_PROVIDERS,
  GRAPHIC_ASSET_PROVIDER_BY_CLASS,
  type GraphicAssetClass,
  type GraphicAssetProvider,
  type GraphicAssetRuntimeControl,
  type GraphicAssetTelemetryEvent,
} from '../../foundation/contracts';

interface InstalledControl {
  readonly disabledClasses: ReadonlySet<GraphicAssetClass>;
  readonly disabledProviders: ReadonlySet<GraphicAssetProvider>;
  readonly onTelemetry?: (event: GraphicAssetTelemetryEvent) => void;
}

const VALID_CLASSES: ReadonlySet<string> = new Set(GRAPHIC_ASSET_CLASSES);
const VALID_PROVIDERS: ReadonlySet<string> = new Set(GRAPHIC_ASSET_PROVIDERS);
const controls = new Map<symbol, InstalledControl>();

function normalizedSet<Value extends string>(
  values: readonly Value[] | undefined,
  allowlist: ReadonlySet<string>,
): ReadonlySet<Value> {
  return new Set(
    (values ?? []).filter((value): value is Value => (
      typeof value === 'string' && allowlist.has(value)
    )),
  );
}

function emit(event: GraphicAssetTelemetryEvent): void {
  const immutableEvent = Object.freeze({ ...event });
  for (const control of controls.values()) {
    try {
      control.onTelemetry?.(immutableEvent);
    } catch {
      // Diagnostics are deliberately non-fatal. A broken sink must not turn a
      // local asset degradation into an application render failure.
    }
  }
}

/**
 * Installs one independently disposable operational control.
 *
 * Controls compose as a union rather than replacing each other, so a provider
 * rollback and a class-specific rollback can be owned and released separately.
 * Install the same control before SSR and hydration to keep markup identical.
 */
export function installGraphicAssetRuntimeControl(
  control: GraphicAssetRuntimeControl,
): () => void {
  const token = Symbol('graphic-asset-runtime-control');
  controls.set(token, {
    disabledClasses: normalizedSet(control.disabledClasses, VALID_CLASSES),
    disabledProviders: normalizedSet(control.disabledProviders, VALID_PROVIDERS),
    onTelemetry: typeof control.onTelemetry === 'function' ? control.onTelemetry : undefined,
  });

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    controls.delete(token);
  };
}

/** Internal facade gate. Unknown classes cannot reach this typed boundary. */
export function isGraphicAssetAdapterEnabled(
  assetClass: GraphicAssetClass,
  assetKey: string,
): boolean {
  const provider = GRAPHIC_ASSET_PROVIDER_BY_CLASS[assetClass];

  for (const control of controls.values()) {
    if (control.disabledClasses.has(assetClass)) {
      emit(Object.freeze({
        code: 'adapter-disabled',
        assetClass,
        provider,
        assetKey,
        outcome: 'dropped',
        disableScope: 'class',
      }));
      return false;
    }
  }

  for (const control of controls.values()) {
    if (control.disabledProviders.has(provider)) {
      emit(Object.freeze({
        code: 'adapter-disabled',
        assetClass,
        provider,
        assetKey,
        outcome: 'dropped',
        disableScope: 'provider',
      }));
      return false;
    }
  }

  return true;
}

/** Internal degraded-path telemetry used by the four public facades. */
export function reportGraphicAssetTelemetry(
  event: Omit<GraphicAssetTelemetryEvent, 'provider'>,
): void {
  emit(Object.freeze({
    ...event,
    provider: GRAPHIC_ASSET_PROVIDER_BY_CLASS[event.assetClass],
  }));
}
