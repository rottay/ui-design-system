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
 * `onCheck(keys)`, `onDrop({dragKey, dropKey, position})`), and the loading
 * skeleton.
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
import { Input } from '../../../../../primitives/inputs/Input';

const ROOT_CLASS_NAME = 'ds-pattern-tree-view ds-engine-modern';

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
    onCheck, draggable, onDrop, searchable, searchPlaceholder = 'Search...', multiple,
    loading, className, style,
  } = props;

  const [searchQuery, setSearchQuery] = useState('');
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [internalChecked, setInternalChecked] = useState<string[]>([]);

  const resolvedSelected = controlledSelected ?? internalSelected;
  const resolvedChecked = controlledChecked ?? internalChecked;

  const treeData = useMemo(() => toTreeData(data, renderNode, 0), [data, renderNode]);

  /* The search predicate matches the ORIGINAL string labels (rich ReactNode
     titles are not text-searchable, same contract as the hand-rolled tree). */
  const labelByKey = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (nodes: TreeNode[]): void => {
      for (const node of nodes) {
        if (typeof node.label === 'string') map.set(node.key, node.label);
        if (node.children) walk(node.children);
      }
    };
    walk(data);
    return map;
  }, [data]);

  const filterTreeNode = useCallback(
    (searchValue: string, node: TreeDataNode): boolean => {
      const label = labelByKey.get(String(node.key)) ?? '';
      return label.toLowerCase().includes(searchValue.toLowerCase());
    },
    [labelByKey]
  );

  /* The `data-empty` hook keeps its pre-composition semantics: it flips when
     the tree has no data at all OR when a search matches nothing. The shared
     `tree-behavior` util (the same one the primitive runs) computes the
     match count -- one filter implementation, no second motor. */
  const isEmpty = useMemo(() => {
    if (!searchQuery) return data.length === 0;
    return filterTree(treeData, filterTreeNode, searchQuery).filteredKeys.size === 0;
  }, [searchQuery, data.length, treeData, filterTreeNode]);

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
      <div data-part="root" data-loading="true" className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={{ ...panelCardStyle, ...style }}>
        <div data-part="skeleton-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div data-part="skeleton" className="ds-tree-view-modern__skeleton" key={i} />
          ))}
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
              engine="modern"
              size="sm"
              value={searchQuery}
              onChange={(value) => setSearchQuery(value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              clearable
              onClear={() => setSearchQuery('')}
            />
          </div>
        )}
        <ModernTree
          treeData={treeData}
          checkable={checkable}
          expandedKeys={controlledExpanded}
          defaultExpandedKeys={defaultExpandedKeys}
          selectedKeys={resolvedSelected}
          checkedKeys={resolvedChecked}
          showIcon
          blockNode
          draggable={draggable}
          multiple={multiple}
          searchValue={searchQuery || undefined}
          filterTreeNode={searchQuery ? filterTreeNode : undefined}
          onExpand={(keys) => onExpand?.(keys.map(String))}
          onSelect={handleSelect}
          onCheck={handleCheck}
          onDrop={handleDrop}
        />
      </div>
    </div>
  );
}
