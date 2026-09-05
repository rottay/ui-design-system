import type { EngineAdapter } from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import {
  ENGINE_NAMES,
  type EngineName,
} from "@/foundation/contracts/kernel/engine-identity";
import { classicThemeAdapter } from "../../presentation/classic";
import { modernThemeAdapter } from "../../presentation/modern";
import { rusticThemeAdapter } from "../../presentation/rustic";

/**
 * TOTAL over `EngineName`: a fifth engine is a `tsc` error here, not a runtime
 * surprise. `null` is a DECLARED absence — `custom` resolves a registered
 * component pack and has no shipped theme adapter of its own.
 */
const SHIPPED_ADAPTERS: Record<EngineName, EngineAdapter | null> = {
  modern: modernThemeAdapter,
  classic: classicThemeAdapter,
  rustic: rusticThemeAdapter,
  custom: null,
};

const registered = new Map<EngineName, EngineAdapter>();

export const THEME_ENGINE_ADAPTERS: Readonly<Record<EngineName, EngineAdapter | null>> =
  Object.freeze({ ...SHIPPED_ADAPTERS });

/**
 * The ONE door a new engine enters by. It refuses an id outside the roster and
 * refuses to replace a shipped adapter, so registration can add an engine and
 * can never silently redefine one.
 */
export function registerEngineAdapter(adapter: EngineAdapter): void {
  if (!(ENGINE_NAMES as readonly string[]).includes(adapter.id))
    throw new Error(
      `registerEngineAdapter: "${adapter.id}" is not in ENGINE_NAMES. Add it to the roster first.`
    );
  if (SHIPPED_ADAPTERS[adapter.id])
    throw new Error(
      `registerEngineAdapter: "${adapter.id}" ships an adapter and may not be replaced.`
    );
  if (registered.has(adapter.id))
    throw new Error(`registerEngineAdapter: "${adapter.id}" is already registered.`);
  registered.set(adapter.id, adapter);
}

/** Test seam: drop registrations so one suite cannot leak an engine into the next. */
export function clearRegisteredEngineAdapters(): void {
  registered.clear();
}

/**
 * Throws on an unknown engine and on `custom` without a registered adapter.
 * There is no fallback: a silent default to another engine is the exact failure
 * the posture law exists to end.
 */
export function resolveAdapter(engine: EngineName): EngineAdapter {
  const shipped = SHIPPED_ADAPTERS[engine];
  if (shipped) return shipped;
  const custom = registered.get(engine);
  if (custom) return custom;
  throw new Error(
    `resolveAdapter: no theme adapter for engine "${engine}". ` +
      "Shipped adapters are modern, classic and rustic; `custom` must register one " +
      "through registerEngineAdapter first. There is no fallback engine."
  );
}
