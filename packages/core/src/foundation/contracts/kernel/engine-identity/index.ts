/**
 * Supplier-neutral rendering-engine identity.
 *
 * Keep this leaf free of React/component imports so pure package subpaths can
 * reuse the canonical engine union without pulling UI declarations.
 */

/**
 * The closed engine roster. A runtime list rather than a type, because the
 * ingestion boundaries that must REFUSE an invented engine name cannot see a
 * union; the union below is derived from it so the two can never disagree.
 */
export const ENGINE_NAMES = ['classic', 'modern', 'rustic', 'custom'] as const;

export type EngineName = (typeof ENGINE_NAMES)[number];
