import type {
  ControlId,
  EngineAdapter,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { TenantAuthoredPaths } from "@/foundation/contracts/composition/tenants/themes/iso";
import { TENANT_CAPABILITY_REGISTRY } from "@/foundation/contracts/composition/tenants/capabilities";
import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";

/** Expand the registry's brace/star authoring path into concrete BrandTheme prefixes. */
function authoringPrefixes(brandThemePath: string): readonly string[] {
  const brace = brandThemePath.match(/^(.*)\{([^}]*)\}(.*)$/);
  const spellings = brace
    ? brace[2].split(",").map((member) => `${brace[1]}${member.trim()}${brace[3]}`)
    : [brandThemePath];
  return spellings.map((path) => (path.endsWith(".*") ? path.slice(0, -2) : path));
}

const CONTROL_PREFIXES: readonly (readonly [ControlId, readonly string[]])[] =
  TENANT_CAPABILITY_REGISTRY.map(
    (control) => [control.id, authoringPrefixes(control.brandThemePath)] as const
  );

/**
 * The controls a tenant's own patch ACTIVATED, read off the authored paths the
 * resolution already collects. A vertical baseline is not an activation: it is
 * the product's own identity, and it never reaches this function.
 */
export function controlsActivatedBy(
  authoredPaths: TenantAuthoredPaths
): readonly ControlId[] {
  const activated: ControlId[] = [];
  for (const [id, prefixes] of CONTROL_PREFIXES) {
    const hit = prefixes.some((prefix) =>
      [...authoredPaths].some(
        (path) => path === prefix || path.startsWith(`${prefix}.`)
      )
    );
    if (hit) activated.push(id);
  }
  return activated;
}

/** A tenant selected a control the engine that will render has no route to. */
export class EngineControlUnsupportedError extends Error {
  readonly engine: EngineName;
  readonly controls: readonly ControlId[];

  constructor(engine: EngineName, controls: readonly ControlId[], reasons: readonly string[]) {
    super(
      `Engine "${engine}" does not support ${controls.join(", ")}. ` +
        reasons.join(" ") +
        " Select an engine that supports it, or unset the option."
    );
    this.name = "EngineControlUnsupportedError";
    this.engine = engine;
    this.controls = controls;
  }
}

/**
 * Refuse a tenant selection the active engine cannot deliver.
 *
 * `unsupported` is the one posture that means "activating this changes
 * nothing here". Compiling it silently is how a tenant pays for a dial that
 * never moves, so the single lowering refuses instead.
 */
export function assertEngineSupportsActivatedControls(
  adapter: EngineAdapter,
  authoredPaths: TenantAuthoredPaths
): void {
  const refused = controlsActivatedBy(authoredPaths).filter(
    (id) => adapter.posture[id] === "unsupported"
  );
  if (refused.length === 0) return;
  throw new EngineControlUnsupportedError(
    adapter.id,
    refused,
    refused.map((id) => {
      const cell = adapter.controls[id];
      return cell.evidence.kind === "absent" ? `${id}: ${cell.evidence.reason}.` : "";
    })
  );
}
