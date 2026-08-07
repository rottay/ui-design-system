'use client';

/**
 * @fileoverview Modern (token-driven) engine for the TreeView pattern.
 *
 * COMPOSITION LAW (Lote 2): the tree itself is the DS Tree primitive's modern
 * engine (WAI-ARIA TreeView keyboard contract, roving tabindex, RTL-mirrored
 * arrows and chevron, cascade checking with half-checked state, full HTML5
 * drag-and-drop) — this pattern no longer hand-rolls a second tree motor.
 * What the pattern owns: the `label`-shaped contract adaptation (label →
 * title, renderNode with depth), the search field (the public Input
 * primitive feeding the primitive's `filterTreeNode`/`searchValue`
 * contract), the selection/check wrappers that preserve the pattern's
 * public callback shapes (`onSelect(keys)`, additive `multiple` sets,
 * `onCheck(keys)`, `onDrop({dragKey, dropKey, position})`), the empty state
 * (the public Empty primitive for no-data and no-filter-results) and the
 * loading skeleton.
 *
 * Notable upgrades the composition brings (documented, same public API):
 * - `draggable` now actually reorders: the previous hand-rolled tree stamped
 *   the `draggable` attribute but never wired a single drag handler.
 * - Checkable gained the primitive's cascade + indeterminate model; the
 *   callback still reports the flat checked-key array.
 *
 * @example
 * <ModernTreeView
 *   data={[{ key: '1', label: 'Folder', children: [{ key: '1-1', label: 'File.ts' }] }]}
 *   searchable
 *   multiple
 *   onSelect={(keys) => setSelected(keys)}
 * />
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { Key } from 'react';
import type { TreeViewProps, TreeNode } from '../../contracts';
import { panelCardStyle } from '../../../../foundation/engine-styles/modern';
import ModernTree from '../../../../../primitives/display/Tree/engines/modern';
import type {
  TreeDataNode,
  TreeDropInfo,
} from '../../../../../primitives/display/Tree/contracts';
import { filterTree } from '../../../../../primitives/display/Tree/runtime/tree-behavior';
import Input from '../../../../../primitives/inputs/Input/engines/modern';
import ModernEmpty from '../../../../../primitives/display/Empty/engines/modern';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

const ROOT_CLASS_NAME = 'ds-pattern-tree-view ds-engine-modern';

/**
 * Flattens a ReactNode label to its readable text. A rich label (badge +
 * name, formatted spans, fragments) is what a user actually reads, so it is
 * what the filter has to match; anything non-textual contributes nothing.
 */
function nodeText(node: React.ReactNode, depth = 0): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (depth > 8) return '';
  if (Array.isArray(node)) return node.map((child) => nodeText(child, depth + 1)).join(' ');
  if (React.isValidElement(node)) {
    const { children } = (node.props ?? {}) as { children?: React.ReactNode };
    return nodeText(children, depth + 1);
  }
  return '';
}

/**
 * Case- and diacritic-insensitive search key: "cafe" has to reach "Café",
 * which a bare `toLowerCase()` never did.
 */
function searchKey(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * Adapts the pattern's `label`-shaped nodes to the primitive's `title`
 * shape, resolving `renderNode` with its depth argument during the walk.
 */
function toTreeData(
  nodes: TreeNode[],
  renderNode: TreeViewProps['renderNode'],
  depth: number
): TreeDataNode[] {
  return nodes.map((node) => ({
    key: node.key,
    title: renderNode ? renderNode(node, depth) : node.label,
    icon: node.icon,
    disabled: node.disabled,
    children: node.children ? toTreeData(node.children, renderNode, depth + 1) : undefined,
  }));
}

/**
 * Modern (token-driven) engine for the TreeView pattern component.
 *
 * @param props - {@link TreeViewProps} controlling tree data, selection, checking, and drag-drop.
 * @returns A searchable tree composed on the DS Tree primitive.
 */
export default function ModernTreeView(props: TreeViewProps) {
  const {
    data, renderNode, onSelect, onExpand, expandedKeys: controlledExpanded,
    selectedKeys: controlledSelected, defaultExpandedKeys, checkable, checkedKeys: controlledChecked,
    onCheck, draggable, onDrop, searchable, searchPlaceholder: searchPlaceholderProp, multiple,
    loading, className, style,
  } = props;

  // Optional channel with an English floor: the view renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string => {
    const resolved = i18n?.tOr(key, floor, params);
    if (resolved !== undefined) return resolved;
    return params
      ? floor.replace(/\{(\w+)\}/g, (match, name: string) =>
          name in params ? String(params[name]) : match,
        )
      : floor;
  };
  const searchPlaceholder = searchPlaceholderProp ?? tOr('treeView.search_placeholder', 'Search...');
  const emptyDataLabel = tOr('treeView.empty', 'No items');
  const emptyResultsLabel = tOr('treeView.empty_results', 'No results found');
  const loadingLabel = tOr('treeView.loading', 'Loading tree');

  const [searchQuery, setSearchQuery] = useState('');
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [internalChecked, setInternalChecked] = useState<string[]>([]);

  const resolvedSelected = controlledSelected ?? internalSelected;
  const resolvedChecked = controlledChecked ?? internalChecked;

  const treeData = useMemo(() => toTreeData(data, renderNode, 0), [data, renderNode]);

  /* The search predicate indexes the ORIGINAL labels, flattened to their
     readable text: a ReactNode label used to index as nothing at all, so
     `searchable` answered "No results found" to every query a rich-label
     tree could ask. */
  const labelByKey = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (nodes: TreeNode[]): void => {
      for (const node of nodes) {
        const text = nodeText(node.label);
        if (text) map.set(node.key, searchKey(text));
        if (node.children) walk(node.children);
      }
    };
    walk(data);
    return map;
  }, [data]);

  const filterTreeNode = useCallback(
    (searchValue: string, node: TreeDataNode): boolean => {
      const label = labelByKey.get(String(node.key)) ?? '';
      return label.includes(searchKey(searchValue));
    },
    [labelByKey]
  );

  /* A whitespace-only query is not a query: it used to filter the whole tree
     away and report "No results found". */
  const activeQuery = searchQuery.trim();

  /* One filter run per query, shared by the empty hook and the controlled
     expansion merge below -- the same `tree-behavior` util the primitive
     runs, so there is still no second motor. */
  const filterResult = useMemo(
    () => (activeQuery ? filterTree(treeData, filterTreeNode, activeQuery) : null),
    [activeQuery, treeData, filterTreeNode]
  );

  /* The `data-empty` hook keeps its pre-composition semantics: it flips when
     the tree has no data at all OR when a search matches nothing. */
  const isEmpty = useMemo(() => {
    if (!filterResult) return data.length === 0;
    return filterResult.filteredKeys.size === 0;
  }, [filterResult, data.length]);

  const matchCount = filterResult?.filteredKeys.size ?? 0;
  const searchStatusLabel =
    matchCount === 1
      ? tOr('treeView.search_results_one', '{count} result', { count: matchCount })
      : tOr('treeView.search_results_other', '{count} results', { count: matchCount });

  /* The primitive auto-expands the ancestors of search matches through its
     INTERNAL expansion state, which a controlled `expandedKeys` overrides --
     so a match inside a collapsed branch stayed invisible while the pattern
     reported results. Merge the ancestor keys the filter already produced. */
  const resolvedExpanded = useMemo(() => {
    if (!controlledExpanded) return undefined;
    if (!filterResult || filterResult.expandKeys.length === 0) return controlledExpanded;
    return Array.from(new Set([...controlledExpanded, ...filterResult.expandKeys.map(String)]));
  }, [controlledExpanded, filterResult]);

  /* Preserve the pattern's public selection contract: additive sets when
     `multiple`, single key otherwise — the primitive reports the toggled
     node + direction in the info argument, so the set math stays here. */
  const handleSelect = useCallback(
    (_keys: Key[], info: { node: TreeDataNode; selected: boolean }) => {
      const key = String(info.node.key);
      const next = multiple
        ? info.selected
          ? [...resolvedSelected, key]
          : resolvedSelected.filter((k) => k !== key)
        : info.selected
        ? [key]
        : [];
      if (!controlledSelected) setInternalSelected(next);
      onSelect?.(next);
    },
    [multiple, resolvedSelected, controlledSelected, onSelect]
  );

  /* The primitive reports cascade results as an object; the pattern's public
     contract is the flat checked-key array. */
  const handleCheck = useCallback(
    (
      keysOrResult: Key[] | { checked: Key[]; halfChecked: Key[] },
      _info: { node: TreeDataNode; checked: boolean }
    ) => {
      const next = (Array.isArray(keysOrResult) ? keysOrResult : keysOrResult.checked).map(String);
      if (!controlledChecked) setInternalChecked(next);
      onCheck?.(next);
    },
    [controlledChecked, onCheck]
  );

  const handleDrop = useCallback(
    (info: TreeDropInfo) => {
      onDrop?.({
        dragKey: String(info.dragNode.key),
        dropKey: String(info.dropNode.key),
        position: info.dropPosition === -1 ? 'before' : info.dropPosition === 1 ? 'after' : 'inside',
      });
    },
    [onDrop]
  );

  if (loading) {
    return (
      <div data-part="root" data-loading="true" aria-busy="true" className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={{ ...panelCardStyle, ...style }}>
        <span className="ds-sr-only" role="status">{loadingLabel}</span>
        {/* A searchable tree keeps its search row while loading: the field
            the caller asked for used to appear only after data landed, so
            every row shifted down on arrival. The body wrapper is the same
            one the loaded render uses, so the inset matches exactly. */}
        <div data-part="body">
          {searchable && (
            <div data-part="search-row" className="ds-tree-view-modern__search-row">
              <Input
                size="sm"
                value=""
                onChange={() => undefined}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                disabled
              />
            </div>
          )}
          <div data-part="skeleton-list" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <div data-part="skeleton" className="ds-tree-view-modern__skeleton" key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-part="root"
      data-loading="false"
      data-empty={isEmpty}
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      style={{ ...panelCardStyle, ...style }}
    >
      <div data-part="body">
        {searchable && (
          <div data-part="search-row" className="ds-tree-view-modern__search-row">
            <Input
              size="sm"
              value={searchQuery}
              onChange={(value) => setSearchQuery(value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              clearable
              onClear={() => setSearchQuery('')}
              /* Escape is the standard escape hatch out of a filtered view;
                 it used to be inert, so the tree stayed filtered. */
              onKeyDown={(e) => {
                if (e.key === 'Escape' && searchQuery) {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchQuery('');
                }
              }}
            />
          </div>
        )}
        {/* Filtering silently rewrote the tree under the caret; the match
            count now reaches assistive technology. */}
        {searchable && (
          <div data-part="search-status" role="status" aria-live="polite" className="ds-sr-only">
            {activeQuery ? searchStatusLabel : ''}
          </div>
        )}
        {isEmpty ? (
          /* Empty (no data at all, or a search that matched nothing): the
             composed Empty primitive owns the quiet hint -- never a mute
             blank panel. The search row stays mounted above so the filter
             can be cleared. */
          <div data-part="empty">
            <ModernEmpty
              description={activeQuery ? emptyResultsLabel : emptyDataLabel}
            />
          </div>
        ) : (
        <ModernTree
          treeData={treeData}
          checkable={checkable}
          expandedKeys={resolvedExpanded}
          defaultExpandedKeys={defaultExpandedKeys}
          selectedKeys={resolvedSelected}
          checkedKeys={resolvedChecked}
          showIcon
          blockNode
          draggable={draggable}
          multiple={multiple}
          searchValue={activeQuery || undefined}
          filterTreeNode={activeQuery ? filterTreeNode : undefined}
          onExpand={(keys) => onExpand?.(keys.map(String))}
          onSelect={handleSelect}
          onCheck={handleCheck}
          onDrop={handleDrop}
        />
        )}
      </div>
    </div>
  );
}
