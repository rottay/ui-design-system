import type { EngineAdapter } from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";
import {
  classicThemeAdapter,
  CLASSIC_RADIUS_CHANNELS,
  CLASSIC_SEED_CHANNELS,
} from "./classic";
import { modernThemeAdapter } from "./modern";
import { rusticThemeAdapter } from "./rustic";

export type ShippedThemeEngine = "modern" | "classic" | "rustic";

export const THEME_ENGINE_ADAPTERS: Readonly<Record<ShippedThemeEngine, EngineAdapter>> =
  Object.freeze({
    modern: modernThemeAdapter,
    classic: classicThemeAdapter,
    rustic: rusticThemeAdapter,
  });

/**
 * Throws on an unknown engine and on `custom` without a registered pack. There
 * is no fallback: a silent default to classic is the exact failure the posture
 * law exists to end.
 */
export function resolveAdapter(engine: EngineName): EngineAdapter {
  const adapter = (THEME_ENGINE_ADAPTERS as Record<string, EngineAdapter | undefined>)[engine];
  if (!adapter) {
    throw new Error(
      `resolveAdapter: no theme adapter for engine "${engine}". ` +
        "Shipped adapters are modern, classic and rustic; `custom` must register a " +
        "component pack first. There is no fallback engine."
    );
  }
  return adapter;
}

export {
  CLASSIC_RADIUS_CHANNELS,
  CLASSIC_SEED_CHANNELS,
  classicThemeAdapter,
  modernThemeAdapter,
  rusticThemeAdapter,
};
