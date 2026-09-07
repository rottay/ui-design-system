/** Runtime values and operations separated from the public type contract. */

import type { FilterGroup, FilterRule } from '../../contracts';

/**
 * Type guard to check if a filter tree node is a `FilterGroup` (branch node).
 *
 * @param node - A node from the filter tree.
 * @returns `true` if the node has `logic` and `rules` properties.
 */
export function isFilterGroup(
  node: FilterRule | FilterGroup
): node is FilterGroup {
  return 'logic' in node && 'rules' in node;
}

/**
 * Type guard to check if a filter tree node is a `FilterRule` (leaf node).
 *
 * @param node - A node from the filter tree.
 * @returns `true` if the node has `field` and `operator` properties.
 */
export function isFilterRule(
  node: FilterRule | FilterGroup
): node is FilterRule {
  return 'field' in node && 'operator' in node;
}

/**
 * A module counter, not a die roll: an id that differs between the server
 * render and the client render is a hydration mismatch, and a filter tree is
 * rendered from a config the server already knows.
 */
let filterIdSequence = 0;

/**
 * Generates a unique string ID for new filter rules and groups.
 *
 * @returns A unique string in the format `"f-{n}"`, stable for a given
 * sequence of creations.
 */
export function generateFilterId(): string {
  filterIdSequence += 1;
  return `f-${filterIdSequence}`;
}
