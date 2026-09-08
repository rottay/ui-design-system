import type {
  ControlId,
  EngineAdapter,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { TenantAuthoredPaths } from "@/foundation/contracts/composition/tenants/themes/iso";
import { TENANT_CAPABILITY_REGISTRY } from "@/foundation/contracts/composition/tenants/capabilities";
import {
  FROZEN_ENGINE_NAMES,
  isAdmittedEngineName,
  type EngineName,
} from "@/foundation/contracts/kernel/engine-identity";

/**
 * Expand a brace/star authoring path into concrete BrandTheme prefixes.
 *
 * Exported because the tier admission asks the SAME question of the catalog's
 * `keypath.brandTheme` spelling that this owner asks of the capability
 * registry's `brandThemePath`. Two expanders would be two answers to "which
 * authored paths does this control claim".
 */
export function authoringPrefixes(brandThemePath: string): readonly string[] {
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

/** A tenant or intent selected an engine the design system no longer admits. */
export class EngineNotAdmittedForCompileError extends Error {
  readonly engine: EngineName;

  constructor(engine: EngineName) {
    super(
      `Engine "${engine}" is not admitted. Modern is the only productive engine; ` +
        `${FROZEN_ENGINE_NAMES.join(", ")} stay in the package for compatibility, ` +
        "frozen, and no tenant document or preview may select one. A white-label " +
        "product renders through a registered `custom` pack. There is no fallback engine."
    );
    this.name = "EngineNotAdmittedForCompileError";
    this.engine = engine;
  }
}

/**
 * Refuse a frozen engine BY NAME, before any control is looked at.
 *
 * This runs on the tenant-authored path only, which is the whole point: the
 * DS still COMPILES a frozen engine for its own shipped verticals, its
 * comparison captures and its posture evidence, and no customer document,
 * saved or previewed, can select one. `preview` and `tenant-document` are the
 * same origin class by the intent contract's own definition, so one check
 * covers both and a preview can never show a publish that would be refused.
 */
export function assertEngineAdmitted(engine: EngineName): void {
  if (!isAdmittedEngineName(engine)) throw new EngineNotAdmittedForCompileError(engine);
}

/**
 * The controls this selection activates that the engine declares `unsupported`.
 *
 * Pure, and total over every engine including the frozen ones: the posture
 * evidence for Classic and Rustic is still measured, which is what keeps their
 * declared contract honest while nobody may select them.
 */
export function refusedControls(
  adapter: EngineAdapter,
  authoredPaths: TenantAuthoredPaths
): readonly ControlId[] {
  return controlsActivatedBy(authoredPaths).filter(
    (id) => adapter.posture[id] === "unsupported"
  );
}

/**
 * Refuse a tenant selection: first the engine, then the controls.
 *
 * The engine check runs FIRST because it is the coarser fact. An engine nobody
 * may select cannot produce an actionable control-level message -- "classic
 * does not support typography.scale" invites the reader to pick a control, when
 * the answer is that the engine is not on offer.
 *
 * `unsupported` is the one posture that means "activating this changes
 * nothing here". Compiling it silently is how a tenant pays for a dial that
 * never moves, so the single lowering refuses instead.
 */
export function assertEngineSupportsActivatedControls(
  adapter: EngineAdapter,
  authoredPaths: TenantAuthoredPaths
): void {
  assertEngineAdmitted(adapter.id);
  const refused = refusedControls(adapter, authoredPaths);
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
