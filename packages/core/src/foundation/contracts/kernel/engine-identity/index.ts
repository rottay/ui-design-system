/**
 * Supplier-neutral rendering-engine identity.
 *
 * Keep this leaf free of React/component imports so pure package subpaths can
 * reuse the canonical engine union without pulling UI declarations.
 *
 * This module is the ONE place an engine name is spelled. Every guard, set,
 * local union, registry row and roster derives from `ENGINE_NAMES` or from the
 * two named constants below; `engine-wiring-gate` refuses a second enumeration.
 */

/**
 * The closed engine roster. A runtime list rather than a type, because the
 * ingestion boundaries that must REFUSE an invented engine name cannot see a
 * union; the union below is derived from it so the two can never disagree.
 */
export const ENGINE_NAMES = ['classic', 'modern', 'rustic', 'custom'] as const;

export type EngineName = (typeof ENGINE_NAMES)[number];

/**
 * The engine the design system renders with when nothing in the chain declares
 * one. This is the ONLY place that fact is stated: there is no second default,
 * no per-registry fallback and no "safe" engine a resolver may substitute.
 */
export const PRIMARY_ENGINE: EngineName = 'modern';

/** The seam a registered white-label pack renders under; never a fallback. */
export const EXTENSION_ENGINE = 'custom' as const satisfies EngineName;

/** The engines a component may ship a physical implementation for. */
export type ImplementedEngineName = Exclude<EngineName, typeof EXTENSION_ENGINE>;

/** The roster minus the extension seam. A loader record is TOTAL over this. */
export const IMPLEMENTED_ENGINE_NAMES: readonly ImplementedEngineName[] =
  ENGINE_NAMES.filter(
    (name): name is ImplementedEngineName => name !== EXTENSION_ENGINE
  );

/** Shipped for compatibility, FROZEN (owner decision 2026-09-05), never admitted. */
export const FROZEN_ENGINE_NAMES: readonly EngineName[] = ENGINE_NAMES.filter(
  (name) => name !== PRIMARY_ENGINE && name !== EXTENSION_ENGINE
);

/** Selectable by a tenant/intent/runtime. Necessary, never sufficient: `custom` needs a pack. */
export const ADMITTED_ENGINE_NAMES: readonly EngineName[] = ENGINE_NAMES.filter(
  (name) => !FROZEN_ENGINE_NAMES.includes(name)
);

/** Type guard over the roster. The one implementation; nobody re-derives it. */
export function isValidEngineName(value: unknown): value is EngineName {
  return (
    typeof value === 'string' && (ENGINE_NAMES as readonly string[]).includes(value)
  );
}

/** Does the DS still ship a physical implementation for this name? */
export function isImplementedEngineName(value: unknown): value is ImplementedEngineName {
  return isValidEngineName(value) && value !== EXTENSION_ENGINE;
}

/** Is this engine frozen -- shipped, never admitted? */
export function isFrozenEngineName(value: unknown): value is EngineName {
  return isValidEngineName(value) && FROZEN_ENGINE_NAMES.includes(value);
}

/** May a tenant, intent or runtime select this engine at all? */
export function isAdmittedEngineName(value: unknown): value is EngineName {
  return isValidEngineName(value) && !FROZEN_ENGINE_NAMES.includes(value);
}
