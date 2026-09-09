/** Runtime values and operations separated from the public type contract. */

import type { FilterGroup, FilterRule } from '../../contracts';

/** Any node of a filter tree, or a collection of them. */
type FilterNodeInput =
  | FilterRule
  | FilterGroup
  | ReadonlyArray<FilterRule | FilterGroup>
  | null
  | undefined;

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
 * The allocator state, owned by the runtime rather than by one module
 * instance: a filter tree is persisted and restored, and a bundle that loads
 * two copies of this module (SSR chunk plus client chunk, or two dependency
 * versions) must not hand the same id to two different rules.
 *
 * It is a counter plus a reservation set, not a die roll: an id that differs
 * between the server render and the client render is a hydration mismatch,
 * and a filter tree is rendered from a config the server already knows.
 */
interface FilterIdAllocator {
  sequence: number;
  reserved: Set<string>;
}

const FILTER_ID_ALLOCATOR_KEY = Symbol.for('rottay.design-system.filter-builder.ids');

function getAllocator(): FilterIdAllocator {
  const host = globalThis as Record<symbol, unknown>;
  const existing = host[FILTER_ID_ALLOCATOR_KEY] as FilterIdAllocator | undefined;
  if (existing) return existing;
  const created: FilterIdAllocator = { sequence: 0, reserved: new Set<string>() };
  host[FILTER_ID_ALLOCATOR_KEY] = created;
  return created;
}

/**
 * Reserves every id already present in a supplied or restored filter tree, so
 * a later {@link generateFilterId} can never reissue one of them.
 *
 * @param node - A rule, a group (walked recursively), or a list of either.
 */
export function reserveFilterIds(node: FilterNodeInput): void {
  if (!node) return;
  const { reserved } = getAllocator();
  const visit = (current: FilterRule | FilterGroup): void => {
    if (!current) return;
    if (typeof current.id === 'string' && current.id) reserved.add(current.id);
    if (isFilterGroup(current)) current.rules.forEach(visit);
  };
  if (Array.isArray(node)) {
    (node as ReadonlyArray<FilterRule | FilterGroup>).forEach(visit);
    return;
  }
  visit(node as FilterRule | FilterGroup);
}

/**
 * Generates an ID for new filter rules and groups that collides neither with
 * the ids of the restored state passed in, nor with any id this runtime has
 * already issued.
 *
 * @param existingState - The current filter tree (or nodes) whose ids must be
 * reserved before the new one is issued. Pass the controlled `value` so a tree
 * restored from a previous session keeps its own descriptors.
 * @returns A string in the format `"f-{n}"`, stable for a given sequence of
 * creations against a given restored state.
 */
export function generateFilterId(existingState?: FilterNodeInput): string {
  reserveFilterIds(existingState);
  const allocator = getAllocator();
  let candidate: string;
  do {
    allocator.sequence += 1;
    candidate = `f-${allocator.sequence}`;
  } while (allocator.reserved.has(candidate));
  allocator.reserved.add(candidate);
  return candidate;
}

/**
 * Immutably replaces AT MOST ONE group: the first node whose id matches, in
 * document order. Two rules that share an id (a restored tree merged with a
 * newly created record) must not be edited by a single interaction.
 *
 * @param root - The root group of the tree.
 * @param targetId - The id of the group to update.
 * @param updater - Receives the matched group, returns its replacement.
 * @returns A new tree; untouched branches keep their references.
 */
export function updateFilterGroup(
  root: FilterGroup,
  targetId: string,
  updater: (group: FilterGroup) => FilterGroup
): FilterGroup {
  let applied = false;
  const walk = (group: FilterGroup): FilterGroup => {
    if (!applied && group.id === targetId) {
      applied = true;
      return updater(group);
    }
    return {
      ...group,
      rules: group.rules.map((node) =>
        !applied && isFilterGroup(node) ? walk(node) : node
      ),
    };
  };
  return walk(root);
}

/**
 * Immutably replaces AT MOST ONE rule: the first leaf whose id matches, in
 * document order.
 *
 * @param root - The root group of the tree.
 * @param ruleId - The id of the rule to update.
 * @param updater - Receives the matched rule, returns its replacement.
 * @returns A new tree; untouched branches keep their references.
 */
export function updateFilterRule(
  root: FilterGroup,
  ruleId: string,
  updater: (rule: FilterRule) => FilterRule
): FilterGroup {
  let applied = false;
  const walk = (group: FilterGroup): FilterGroup => ({
    ...group,
    rules: group.rules.map((node) => {
      if (applied) return node;
      if (isFilterGroup(node)) return walk(node);
      if (node.id === ruleId) {
        applied = true;
        return updater(node);
      }
      return node;
    }),
  });
  return walk(root);
}

/**
 * Immutably removes AT MOST ONE node: the first rule or group whose id
 * matches, in document order.
 *
 * @param root - The root group of the tree.
 * @param nodeId - The id of the rule or group to remove.
 * @returns A new tree without that single node.
 */
export function removeFilterNode(root: FilterGroup, nodeId: string): FilterGroup {
  let removed = false;
  const walk = (group: FilterGroup): FilterGroup => {
    const rules: Array<FilterRule | FilterGroup> = [];
    for (const node of group.rules) {
      if (!removed && node.id === nodeId) {
        removed = true;
        continue;
      }
      rules.push(!removed && isFilterGroup(node) ? walk(node) : node);
    }
    return { ...group, rules };
  };
  return walk(root);
}
