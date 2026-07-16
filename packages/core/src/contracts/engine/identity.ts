/**
 * Supplier-neutral rendering-engine identity.
 *
 * Keep this leaf free of React/component imports so pure package subpaths can
 * reuse the canonical engine union without pulling UI declarations.
 */
export type EngineName = 'classic' | 'modern' | 'rustic' | 'custom';
