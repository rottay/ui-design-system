import type {
  ControlId,
  EngineAdapter,
  EngineControlDeclaration,
  EnginePosture,
  EngineProjection,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";
import type { EngineTokenOverrides } from "@/foundation/contracts/kernel/tokens/engine-tokens";

/** Everything an engine adapter authors. `posture` is derived, never authored. */
export interface EngineAdapterDefinition {
  readonly id: EngineName;
  readonly tokenBaseline: EngineTokenOverrides;
  readonly controls: Readonly<Record<ControlId, EngineControlDeclaration>>;
  project(compiled: ThemeCompilation): EngineProjection;
}

/**
 * Freeze the whole baseline, not its outer object: a nested group left mutable
 * is one shared record every consumer of every tenant can edit.
 */
function freezeDeep<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) freezeDeep(child);
    Object.freeze(value);
  }
  return value;
}

/**
 * Build an adapter from its cells.
 *
 * `posture` is projected from `controls` so a cell and the value a consumer
 * reads cannot disagree, and a posture cannot claim support its evidence does
 * not name.
 */
export function defineEngineAdapter(definition: EngineAdapterDefinition): EngineAdapter {
  const posture: Record<string, EnginePosture> = {};
  for (const [id, cell] of Object.entries(definition.controls)) {
    posture[id] = cell.posture;
  }
  return Object.freeze({
    id: definition.id,
    tokenBaseline: freezeDeep(definition.tokenBaseline),
    controls: definition.controls,
    posture: Object.freeze(posture) as Readonly<Record<ControlId, EnginePosture>>,
    project: definition.project,
  });
}
