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
 * Generates a unique string ID for new filter rules and groups.
 * Uses a timestamp + random suffix to avoid collisions without requiring
 * an external UUID library.
 *
 * @returns A unique string in the format `"f-{timestamp}-{random}"`.
 */
export function generateFilterId(): string {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
