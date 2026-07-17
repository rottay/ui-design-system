/**
 * @fileoverview Shared Tree utilities - Rottay Design System
 * @description Common utility functions and types used by both Modern and Rustic Tree engines.
 *
 * Extracted to eliminate duplication between engine implementations.
 *
 * @module Tree/runtime/tree-behavior
 * @category Display
 * @package @rottay/design-system
 */

import type React from 'react';
import type { TreeDataNode } from '../../contracts';

// ---------------------------------------------------------------------------
// Key type and normalization
// ---------------------------------------------------------------------------

export type TreeEngineKey = string | number;

/** Normalize a React.Key to a TreeEngineKey (string | number). */
export function normalizeTreeKey(value: React.Key): TreeEngineKey {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return String(value);
}

// ---------------------------------------------------------------------------
// Tree traversal helpers
// ---------------------------------------------------------------------------

/** Collect all keys from a tree recursively. */
export function collectAllKeys(nodes: TreeDataNode[]): TreeEngineKey[] {
  const keys: TreeEngineKey[] = [];
  const walk = (list: TreeDataNode[]) => {
    for (const n of list) {
      keys.push(normalizeTreeKey(n.key));
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return keys;
}

/** Find a node by key in a tree (depth-first). */
export function findNodeByKey(
  nodes: TreeDataNode[],
  key: TreeEngineKey,
): TreeDataNode | undefined {
  for (const node of nodes) {
    if (normalizeTreeKey(node.key) === key) return node;
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return undefined;
}

/** Build a parent map: childKey -> parentKey. */
export function buildParentMap(
  nodes: TreeDataNode[],
  parentKey: TreeEngineKey | null = null,
): Map<TreeEngineKey, TreeEngineKey> {
  const map = new Map<TreeEngineKey, TreeEngineKey>();
  for (const node of nodes) {
    const nk = normalizeTreeKey(node.key);
    if (parentKey !== null) map.set(nk, parentKey);
    if (node.children) {
      const childMap = buildParentMap(node.children, nk);
      childMap.forEach((v, k) => map.set(k, v));
    }
  }
  return map;
}

/** Get all descendant keys of a node. */
export function getDescendantKeys(node: TreeDataNode): TreeEngineKey[] {
  const keys: TreeEngineKey[] = [];
  if (node.children) {
    for (const child of node.children) {
      keys.push(normalizeTreeKey(child.key));
      keys.push(...getDescendantKeys(child));
    }
  }
  return keys;
}

/** Flatten tree to an ordered list of visible keys (respecting expanded state). */
export function flattenVisibleKeys(
  nodes: TreeDataNode[],
  expandedKeys: TreeEngineKey[],
): TreeEngineKey[] {
  const result: TreeEngineKey[] = [];
  const walk = (list: TreeDataNode[]) => {
    for (const n of list) {
      const nk = normalizeTreeKey(n.key);
      result.push(nk);
      if (n.children && expandedKeys.includes(nk)) {
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return result;
}

/**
 * Compute half-checked keys from checked keys.
 * A parent is half-checked if some (but not all) of its children are checked.
 *
 * Note: The Modern engine passes parentMap for compatibility, but it is not used
 * in the core algorithm. Both engines' implementations are equivalent.
 */
export function computeHalfCheckedKeys(
  nodes: TreeDataNode[],
  checkedKeys: TreeEngineKey[],
  _parentMap?: Map<TreeEngineKey, TreeEngineKey>,
): TreeEngineKey[] {
  const halfChecked = new Set<TreeEngineKey>();
  const checkedSet = new Set(checkedKeys);

  const walk = (nodeList: TreeDataNode[]) => {
    for (const node of nodeList) {
      const nk = normalizeTreeKey(node.key);
      if (node.children && node.children.length > 0) {
        walk(node.children);
        const childKeys = node.children.map((c) => normalizeTreeKey(c.key));
        const allChecked = childKeys.every((ck) => checkedSet.has(ck));
        const someChecked = childKeys.some(
          (ck) => checkedSet.has(ck) || halfChecked.has(ck),
        );
        if (!allChecked && someChecked) {
          halfChecked.add(nk);
        }
      }
    }
  };
  walk(nodes);
  return Array.from(halfChecked);
}

/** Filter tree to only matching nodes + their ancestors. */
export function filterTree(
  nodes: TreeDataNode[],
  filterFn: (searchValue: string, node: TreeDataNode) => boolean,
  searchValue: string,
): { filteredKeys: Set<TreeEngineKey>; expandKeys: TreeEngineKey[] } {
  const matchingKeys = new Set<TreeEngineKey>();
  const ancestorKeys = new Set<TreeEngineKey>();

  const walk = (list: TreeDataNode[], ancestors: TreeEngineKey[]): boolean => {
    let hasMatch = false;
    for (const node of list) {
      const nk = normalizeTreeKey(node.key);
      const isMatch = filterFn(searchValue, node);
      let childMatch = false;
      if (node.children) {
        childMatch = walk(node.children, [...ancestors, nk]);
      }
      if (isMatch || childMatch) {
        matchingKeys.add(nk);
        hasMatch = true;
        for (const ak of ancestors) {
          ancestorKeys.add(ak);
          matchingKeys.add(ak);
        }
      }
    }
    return hasMatch;
  };
  walk(nodes, []);
  return { filteredKeys: matchingKeys, expandKeys: Array.from(ancestorKeys) };
}
