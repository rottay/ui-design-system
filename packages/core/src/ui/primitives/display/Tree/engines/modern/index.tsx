/**
 * @fileoverview Modern Tree engine -- semantic markup painted by the modern skin.
 *
 * Full-featured hierarchical tree. Implements expand/collapse, checkable nodes
 * with cascading half-checked state, drag-and-drop reordering, async child
 * loading, search/filter with auto-expand, tree-line connectors, and WAI-ARIA
 * TreeView keyboard navigation -- all without Ant Design.
 *
 * All paint (connector lines, row hover/selection, drop indicator, checkbox
 * tint, search highlight) and static geometry (switcher size, icon box, row
 * padding) live in the modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/tree.css`), keyed on the
 * `data-part` hooks stamped here. The DaisyUI checkbox classes and the
 * Tailwind `absolute border-l` connector paint are gone. Inline styles are
 * reserved for per-level computed offsets -- which are LOGICAL
 * (inline-start) so indentation and connectors mirror correctly in RTL.
 *
 * B4-04 (Phase-B): the expand caret and the async-loading indicator stop
 * being family-local SVGs -- the caret is the governed `NavigationForwardIcon`
 * role (same role TreeSelect paints for the same affordance; `mirrored=false`
 * because the skin's pinned `:dir(rtl)` flip remains the single mirror owner)
 * and loading is the governed `Spinner` primitive (its skin owns cadence,
 * reduced motion and forced colors; the tree skin keeps only the 16px box).
 * `switcherIcon` (contract) is honored for custom carets, loading rows stamp
 * `aria-busy`, draggable rows stamp `data-draggable`/`data-dragging`, the
 * keyboard layer gains APG typeahead (printable characters move focus to the
 * next visible node whose label starts with the typed buffer), `multiple`
 * selection now actually accumulates keys, the root carries an accessible
 * name from the catalog (`tree.label`), and the per-level indent scales with
 * the governed density authority.
 *
 * The component is split into a recursive `TreeNodeInternal` (one per visible node)
 * and a root `ModernTree` that manages shared state and event handlers.
 *
 * Engine: **Modern skin (`rottay-tree rottay-tree--modern`) + data-part hooks**
 *
 * @example
 * ```tsx
 * <Tree engine="modern" treeData={files} showLine draggable onDrop={handleReorder} />
 * ```
 *
 * @module Tree/Modern
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import type { TreeProps, TreeDataNode } from '../../contracts';
import { TREE_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import { LoadingIndicator } from '../../../../foundation/loading-indicator';
import { advanceTypeahead } from '../../../../runtime/collection/typeahead';
import type { TypeaheadState } from '../../../../runtime/collection/typeahead';
import {
  type TreeEngineKey,
  normalizeTreeKey,
  collectAllKeys,
  findNodeByKey,
  buildParentMap,
  getDescendantKeys,
  flattenVisibleKeys,
  computeHalfCheckedKeys,
  filterTree,
} from '../../runtime/tree-behavior';

// ---------------------------------------------------------------------------
// Reading-direction probe (Segmented engine idiom): the nearest explicit
// `dir` wins; otherwise the document direction applies.
// ---------------------------------------------------------------------------
function isRtlContext(el: HTMLElement): boolean {
  const scoped = el.closest('[dir]');
  if (scoped) return scoped.getAttribute('dir') === 'rtl';
  return document.documentElement.dir === 'rtl';
}

// ---------------------------------------------------------------------------
// Highlight helper
// ---------------------------------------------------------------------------

// Wraps the matching substring in a warning-tinted span for search highlighting.
// Uses DS tokens so the highlight tracks tenant themes across light and dark modes.
function highlightText(text: React.ReactNode, searchValue: string): React.ReactNode {
  if (!searchValue || typeof text !== 'string') return text;
  const idx = text.toLowerCase().indexOf(searchValue.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + searchValue.length);
  const after = text.slice(idx + searchValue.length);
  return (
    <>
      {before}
      <span className="rottay-tree-search-highlight" data-part="tree-node-highlight">
        {match}
      </span>
      {after}
    </>
  );
}

// ---------------------------------------------------------------------------
// Loading indicator
// ---------------------------------------------------------------------------

// Async child loading renders the governed Spinner primitive with the family
// `loading` part (P-79 caller-wins): its skin owns the arc, cadence, reduced
// motion and forced colors; the tree skin keeps only the 16px layout box and
// the margin. The former family-local SVG spinner is retired (B4-04).

// ---------------------------------------------------------------------------
// Drop indicator line
// ---------------------------------------------------------------------------

const DropIndicator: React.FC<{
  position: 'before' | 'inside' | 'after';
  level: number;
}> = ({ position, level }) => {
  if (position === 'inside') return null;
  const indent = level * 24;
  return (
    <div
      data-part="drop-indicator"
      style={{
        top: position === 'before' ? -1 : undefined,
        bottom: position === 'after' ? -1 : undefined,
        // The indentation tracks the node's logical inline-start so the
        // indicator lines up under the title in both LTR and RTL.
        paddingInlineStart: indent,
      }}
    >
      <div />
    </div>
  );
};

// ---------------------------------------------------------------------------
// TreeNodeInternal
// ---------------------------------------------------------------------------

interface TreeNodeInternalProps extends TreeDataNode {
  nodeKey: TreeEngineKey;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isChecked: boolean;
  isHalfChecked: boolean;
  isLoading: boolean;
  isFocused: boolean;
  isFiltered: boolean;
  /** The key that carries the tree's single tab stop (roving tabindex). */
  tabbableKey: TreeEngineKey | null;
  onToggle: (key: TreeEngineKey) => void;
  onSelect: (key: TreeEngineKey, node: TreeDataNode) => void;
  onCheck: (key: TreeEngineKey, node: TreeDataNode) => void;
  onFocus: (key: TreeEngineKey) => void;
  showLine?: boolean;
  showIcon?: boolean;
  checkable?: boolean;
  blockNode?: boolean;
  draggable?: boolean;
  /** Custom expand/collapse affordance from the contract (default: governed caret). */
  switcherIcon?: TreeProps['switcherIcon'];
  /** Key of the node currently being dragged (null when no drag is active). */
  dragKey: TreeEngineKey | null;
  /** True while this node is the one being dragged (drag affordance paint). */
  isDragging: boolean;
  expandedKeys: TreeEngineKey[];
  selectedKeys: TreeEngineKey[];
  checkedKeys: TreeEngineKey[];
  halfCheckedKeys: TreeEngineKey[];
  loadingKeys: TreeEngineKey[];
  focusedKey: TreeEngineKey | null;
  filteredKeys: Set<TreeEngineKey> | null;
  searchValue?: string;
  findNode: (key: TreeEngineKey) => TreeDataNode | undefined;
  onDragStartInternal: (key: TreeEngineKey, e: React.DragEvent) => void;
  onDragOverInternal: (key: TreeEngineKey, e: React.DragEvent, level: number) => void;
  onDropInternal: (key: TreeEngineKey, e: React.DragEvent) => void;
  onDragEndInternal: () => void;
  dropTarget: {
    key: TreeEngineKey;
    position: 'before' | 'inside' | 'after';
  } | null;
  nodeRef: (key: TreeEngineKey, el: HTMLDivElement | null) => void;
  isLast: boolean;
  parentIsLast: boolean[];
}

const TreeNodeInternal: React.FC<TreeNodeInternalProps> = ({
  nodeKey,
  title,
  children,
  disabled,
  disableCheckbox,
  isLeaf,
  icon,
  level,
  isExpanded,
  isSelected,
  isChecked,
  isHalfChecked,
  isLoading,
  isFocused,
  isFiltered,
  tabbableKey,
  onToggle,
  onSelect,
  onCheck,
  onFocus,
  showLine,
  showIcon,
  checkable,
  blockNode,
  draggable: propDraggable,
  switcherIcon,
  dragKey,
  isDragging,
  expandedKeys,
  selectedKeys,
  checkedKeys,
  halfCheckedKeys,
  loadingKeys,
  focusedKey,
  filteredKeys,
  searchValue,
  findNode,
  onDragStartInternal,
  onDragOverInternal,
  onDropInternal,
  onDragEndInternal,
  dropTarget,
  nodeRef,
  isLast,
  parentIsLast,
}) => {
  const hasChildren = children && children.length > 0;
  // Non-leaf nodes without children are assumed to support async loading,
  // so they get an expander arrow that triggers loadData on first click.
  const showExpander = (hasChildren || (!isLeaf && !hasChildren)) && !isLeaf;
  // Indentation is computed per level, so it stays inline -- but it is a
  // LOGICAL inline-start offset, so the hierarchy indents from the correct
  // side in RTL. Static padding lives in the skin. B4-04: the step scales
  // with the governed density authority (explicit --ds-tree-indent values
  // still scale; density is a layout authority, not paint -- button.css
  // idiom). Connectors read the same step so guides and rows never drift.
  // Both channels are DECLARED (the family token bridge's `:root`, imported
  // by every facade entrypoint, and the density authority in default.css), so
  // they resolve BARE -- a literal fallback over a declared channel would
  // violate fallback parity.
  const indentStep = 'var(--ds-tree-indent) * var(--ds-density-effective-scale)';
  const paddingInlineStart = level === 0 ? 0 : `calc(${level} * ${indentStep})`;

  const isDraggable = propDraggable && !disabled;
  const isDropTarget = dropTarget?.key === nodeKey;
  const dropPosition = isDropTarget ? dropTarget!.position : null;

  const displayTitle = searchValue ? highlightText(title, searchValue) : title;

  // Accessibility labels: translated when an I18nProvider is mounted, with the
  // documented English fallback otherwise (a missing catalog key echoes back,
  // which the endsWith guard detects).
  const i18n = useOptionalTranslation('components');
  const treeLabel = (
    key: string,
    fallback: string,
    params?: Record<string, string | number>
  ): string => {
    const translated = i18n?.t(key, params);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };
  const collapseLabel = treeLabel('tree.collapse', 'Collapse');
  const expandLabel = treeLabel('tree.expand', 'Expand');
  const nodeTitle = typeof title === 'string' ? title : '';
  const selectNodeLabel = treeLabel('tree.select_node', `Select ${nodeTitle}`, { title: nodeTitle });

  const handleClick = () => {
    if (disabled) return;
    onFocus(nodeKey);
    const node = findNode(nodeKey);
    if (node) {
      onSelect(nodeKey, node);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(nodeKey);
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (disableCheckbox || disabled) return;
    const node = findNode(nodeKey);
    if (node) {
      onCheck(nodeKey, node);
    }
  };

  return (
    <div className="rottay-tree-node relative" data-part="node" data-key={nodeKey} ref={(el) => nodeRef(nodeKey, el)}>
      {/* Tree lines */}
      {showLine && level > 0 && (
        <>
          {parentIsLast.map((pIsLast, i) =>
            !pIsLast ? (
              <div
                key={i}
                data-part="connector"
                data-axis="vertical"
                style={{
                  insetInlineStart: `calc(${i} * ${indentStep} + 12px)`,
                  top: 0,
                  bottom: 0,
                }}
              />
            ) : null
          )}
          <div
            data-part="connector"
            data-axis="horizontal"
            style={{
              insetInlineStart: `calc(${level - 1} * ${indentStep} + 12px)`,
              top: '50%',
              width: 12,
            }}
          />
          {isLast && (
            <div
              data-part="connector"
              data-axis="vertical"
              style={{
                insetInlineStart: `calc(${level - 1} * ${indentStep} + 12px)`,
                top: 0,
                height: '50%',
              }}
            />
          )}
          {!isLast && (
            <div
              data-part="connector"
              data-axis="vertical"
              style={{
                insetInlineStart: `calc(${level - 1} * ${indentStep} + 12px)`,
                top: 0,
                bottom: 0,
              }}
            />
          )}
        </>
      )}

      {/* Drop indicator */}
      {isDropTarget && dropPosition && dropPosition !== 'inside' && (
        <DropIndicator position={dropPosition} level={level} />
      )}

      {/* Node content: the skin owns every painted pixel (layout, hover,
          selected frame, focus rings, drop ring) keyed on the data hooks --
          the Tailwind utilities and the imperative --tw-ring-color writes are
          drained. The selected row never carries a left accent rail (product
          law; the skin's framed-surface treatment replaced it). */}
      <div
        style={{
          paddingInlineStart,
        }}
        onClick={handleClick}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={showExpander ? isExpanded : undefined}
        aria-disabled={disabled}
        aria-checked={checkable ? (isHalfChecked ? 'mixed' : isChecked) : undefined}
        aria-level={level + 1}
        aria-busy={isLoading || undefined}
        tabIndex={nodeKey === tabbableKey ? 0 : -1}
        data-tree-node-key={nodeKey}
        data-part="row"
        data-selected={isSelected ? 'true' : 'false'}
        data-expanded={showExpander ? (isExpanded ? 'true' : 'false') : undefined}
        data-disabled={disabled || undefined}
        data-focused={isFocused || undefined}
        data-drop-target={isDropTarget || undefined}
        data-drop-position={isDropTarget ? dropPosition : undefined}
        data-draggable={isDraggable || undefined}
        data-dragging={isDragging || undefined}
        draggable={isDraggable}
        onDragStart={isDraggable ? (e) => onDragStartInternal(nodeKey, e) : undefined}
        onDragOver={
          propDraggable
            ? (e) => {
                e.preventDefault();
                onDragOverInternal(nodeKey, e, level);
              }
            : undefined
        }
        onDrop={
          propDraggable
            ? (e) => {
                e.preventDefault();
                onDropInternal(nodeKey, e);
              }
            : undefined
        }
        onDragEnd={propDraggable ? onDragEndInternal : undefined}
      >
        {/* Expand/collapse affordance or the governed loading Spinner */}
        {isLoading ? (
          <LoadingIndicator data-part="loading" size="sm" />
        ) : showExpander ? (
          <button
            type="button"
            data-part="tree-node-toggle"
            onClick={handleToggle}
            aria-label={isExpanded ? collapseLabel : expandLabel}
            tabIndex={-1}
          >
            {/* Default caret: the governed navigation.forward role at the xs
                icon size (12px, the drained SVG's box). mirrored={false}: the
                skin's pinned :dir(rtl) flip remains the single mirror owner --
                the facade's auto-mirror would double-flip it. A contract
                switcherIcon replaces the caret wholesale (function form gets
                the expanded state) and opts the span out of the skin's 90deg
                expansion turn via data-custom-switcher. */}
            <span data-custom-switcher={switcherIcon ? 'true' : undefined}>
              {switcherIcon
                ? typeof switcherIcon === 'function'
                  ? switcherIcon({ expanded: isExpanded })
                  : switcherIcon
                : <NavigationForwardIcon decorative mirrored={false} size="xs" />}
            </span>
          </button>
        ) : (
          <span data-part="switcher-spacer" aria-hidden="true" />
        )}

        {/* The indeterminate state is set via ref because there is no HTML
            attribute for it; the browser paints the indeterminate mark
            natively, and the skin tints the control with accent-color. */}
        {checkable && (
          <input
            type="checkbox"
            data-part="checkbox"
            checked={isChecked}
            ref={(el) => {
              if (el) el.indeterminate = isHalfChecked && !isChecked;
            }}
            disabled={disabled || disableCheckbox}
            onChange={handleCheck}
            onClick={(e) => e.stopPropagation()}
            aria-label={selectNodeLabel}
            tabIndex={-1}
          />
        )}

        {/* Icon */}
        {showIcon && icon && (
          <span data-part="icon">
            {icon}
          </span>
        )}

        {/* Title. Truncated long labels keep a native disclosure via the
            `title` attribute when the title is a plain string. */}
        <span
          data-part="tree-node-label"
          data-filtered-out={!isFiltered && filteredKeys ? 'true' : undefined}
          title={nodeTitle || undefined}
        >
          {displayTitle}
        </span>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div role="group">
          {children!.map((child, index) => {
            const { key: rawChildKey, ...childRest } = child;
            const childKey = normalizeTreeKey(rawChildKey);
            if (filteredKeys && !filteredKeys.has(childKey)) return null;
            const childIsLast = index === children!.length - 1;
            return (
              <TreeNodeInternal
                key={childKey}
                nodeKey={childKey}
                {...childRest}
                level={level + 1}
                isExpanded={expandedKeys.includes(childKey)}
                isSelected={selectedKeys.includes(childKey)}
                isChecked={checkedKeys.includes(childKey)}
                isHalfChecked={halfCheckedKeys.includes(childKey)}
                isLoading={loadingKeys.includes(childKey)}
                isFocused={focusedKey === childKey}
                isFiltered={filteredKeys ? filteredKeys.has(childKey) : true}
                tabbableKey={tabbableKey}
                onToggle={onToggle}
                onSelect={onSelect}
                onCheck={onCheck}
                onFocus={onFocus}
                showLine={showLine}
                showIcon={showIcon}
                checkable={checkable}
                blockNode={blockNode}
                draggable={propDraggable}
                switcherIcon={switcherIcon}
                dragKey={dragKey}
                isDragging={dragKey === childKey}
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                checkedKeys={checkedKeys}
                halfCheckedKeys={halfCheckedKeys}
                loadingKeys={loadingKeys}
                focusedKey={focusedKey}
                filteredKeys={filteredKeys}
                searchValue={searchValue}
                findNode={findNode}
                onDragStartInternal={onDragStartInternal}
                onDragOverInternal={onDragOverInternal}
                onDropInternal={onDropInternal}
                onDragEndInternal={onDragEndInternal}
                dropTarget={dropTarget}
                nodeRef={nodeRef}
                isLast={childIsLast}
                parentIsLast={[...parentIsLast, isLast]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ModernTree (main export)
// ---------------------------------------------------------------------------

/**
 * Modern Tree engine -- semantic markup painted by the modern skin.
 *
 * Manages expand, select, check, drag-and-drop, async loading, search/filter,
 * and keyboard navigation state (arrows mirror in RTL). Renders tree nodes
 * recursively via `TreeNodeInternal`. Supports both controlled and
 * uncontrolled modes for expandedKeys, selectedKeys, and checkedKeys.
 *
 * @param props - Unified DS TreeProps (see Tree.types.ts)
 * @returns A skin-painted tree with role="tree" ARIA semantics
 */
export default function ModernTree(props: TreeProps): React.ReactElement {
  const {
    treeData = [],
    checkable = TREE_DEFAULTS.checkable,
    defaultExpandedKeys = [],
    defaultSelectedKeys = [],
    defaultCheckedKeys = [],
    expandedKeys: controlledExpandedKeys,
    selectedKeys: controlledSelectedKeys,
    checkedKeys: controlledCheckedKeys,
    showLine = TREE_DEFAULTS.showLine,
    showIcon = TREE_DEFAULTS.showIcon,
    defaultExpandAll = TREE_DEFAULTS.defaultExpandAll,
    draggable = TREE_DEFAULTS.draggable,
    blockNode = TREE_DEFAULTS.blockNode,
    treeCheckStrictly = TREE_DEFAULTS.treeCheckStrictly,
    multiple = false,
    switcherIcon,
    treeLine,
    loadData,
    filterTreeNode,
    searchValue,
    onExpand,
    onSelect,
    onCheck,
    onDragStart,
    onDrop,
    className = '',
    style,
  } = props;

  const resolvedShowLine = treeLine ?? showLine;

  // Accessible tree name from the catalog (APG: role=tree needs a name);
  // the English floor keeps bare renders byte-identical in behavior.
  const rootI18n = useOptionalTranslation('components');
  const rootLabelTranslated = rootI18n?.t('tree.label');
  const rootLabel = rootLabelTranslated && !rootLabelTranslated.endsWith('tree.label') ? rootLabelTranslated : 'Tree';

  // Refs
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<TreeEngineKey, HTMLDivElement>>(new Map());
  const loadedKeysRef = useRef<Set<TreeEngineKey>>(new Set());
  // APG typeahead rolling buffer (printable characters, 500ms window).
  const typeaheadRef = useRef<TypeaheadState>({ buffer: '', lastKeyTime: 0 });

  const registerNodeRef = useCallback((key: TreeEngineKey, el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(key, el);
    else nodeRefs.current.delete(key);
  }, []);

  // Find node helper
  const findNode = useCallback(
    (key: TreeEngineKey): TreeDataNode | undefined => findNodeByKey(treeData, key),
    [treeData]
  );

  // Parent map
  const parentMap = useMemo(() => buildParentMap(treeData), [treeData]);

  // State
  const [expandedKeys, setExpandedKeys] = useState<TreeEngineKey[]>(
    defaultExpandAll ? collectAllKeys(treeData) : defaultExpandedKeys.map(normalizeTreeKey)
  );
  const [selectedKeys, setSelectedKeys] = useState<TreeEngineKey[]>(defaultSelectedKeys.map(normalizeTreeKey));
  const [checkedKeys, setCheckedKeys] = useState<TreeEngineKey[]>(
    Array.isArray(defaultCheckedKeys) ? defaultCheckedKeys.map(normalizeTreeKey) : []
  );
  const [focusedKey, setFocusedKey] = useState<TreeEngineKey | null>(null);
  const [loadingKeys, setLoadingKeys] = useState<TreeEngineKey[]>([]);
  const [dragKey, setDragKey] = useState<TreeEngineKey | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    key: TreeEngineKey;
    position: 'before' | 'inside' | 'after';
  } | null>(null);

  // Resolve controlled vs uncontrolled -- when the consumer provides controlled
  // keys we normalize them on every render (cheap string coercion). When
  // uncontrolled, internal state is the source of truth.
  const actualExpandedKeys = controlledExpandedKeys ? controlledExpandedKeys.map(normalizeTreeKey) : expandedKeys;
  const actualSelectedKeys = controlledSelectedKeys ? controlledSelectedKeys.map(normalizeTreeKey) : selectedKeys;
  const actualCheckedKeys = Array.isArray(controlledCheckedKeys)
    ? controlledCheckedKeys.map(normalizeTreeKey)
    : controlledCheckedKeys?.checked.map(normalizeTreeKey) ?? checkedKeys;

  // Half-checked (indeterminate) keys: a parent is half-checked when some but
  // not all of its descendants are checked. Skipped in strict mode because
  // parent/child checking is independent there.
  const halfCheckedKeys = useMemo(() => {
    if (!checkable || treeCheckStrictly) return [];
    return computeHalfCheckedKeys(treeData, actualCheckedKeys, parentMap);
  }, [treeData, actualCheckedKeys, parentMap, checkable, treeCheckStrictly]);

  // Search/filter
  const filterResult = useMemo(() => {
    if (!filterTreeNode || !searchValue) return null;
    return filterTree(treeData, filterTreeNode, searchValue);
  }, [treeData, filterTreeNode, searchValue]);

  const filteredKeys = filterResult?.filteredKeys ?? null;

  // Auto-expand ancestor nodes of search matches so the user can see the
  // matching nodes without manually opening each parent. Merges with existing
  // expanded keys to avoid collapsing nodes the user already opened.
  useEffect(() => {
    if (filterResult && filterResult.expandKeys.length > 0) {
      setExpandedKeys((prev) => {
        const combined = new Set([...prev, ...filterResult.expandKeys]);
        return Array.from(combined);
      });
    }
  }, [filterResult]);

  // Flatten the tree into a linear list of keys representing the currently
  // visible nodes (respecting which branches are expanded). This powers
  // ArrowUp/ArrowDown keyboard navigation with O(1) index lookups.
  const visibleKeys = useMemo(() => flattenVisibleKeys(treeData, actualExpandedKeys), [treeData, actualExpandedKeys]);

  // The roving tab stop: while no node has been keyboard-focused, the first
  // visible node carries it so a Tab into the tree lands somewhere (WAI-ARIA
  // TreeView). Once focus moves, focusedKey owns the stop.
  const tabbableKey = focusedKey ?? arrayValueAt(visibleKeys, 0) ?? null;

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  const handleToggle = useCallback(
    async (key: TreeEngineKey) => {
      const isExpanding = !actualExpandedKeys.includes(key);
      const newKeys = isExpanding ? [...actualExpandedKeys, key] : actualExpandedKeys.filter((k) => k !== key);
      setExpandedKeys(newKeys);

      const node = findNode(key);
      if (node) {
        onExpand?.(newKeys, { node, expanded: isExpanding });
      }

      // Async loading
      if (isExpanding && loadData && node && !node.isLeaf && !loadedKeysRef.current.has(key)) {
        const hasExistingChildren = node.children && node.children.length > 0;
        if (!hasExistingChildren) {
          setLoadingKeys((prev) => [...prev, key]);
          try {
            await loadData(node);
            loadedKeysRef.current.add(key);
          } finally {
            setLoadingKeys((prev) => prev.filter((k) => k !== key));
          }
        }
      }
    },
    [actualExpandedKeys, findNode, onExpand, loadData]
  );

  const handleSelect = useCallback(
    (key: TreeEngineKey, node: TreeDataNode) => {
      if (node.selectable === false) return;
      // B4-04: `multiple` (contract + aria-multiselectable) now accumulates
      // keys instead of collapsing to the last clicked node; single mode keeps
      // the historical replace semantics.
      const newKeys = actualSelectedKeys.includes(key)
        ? actualSelectedKeys.filter((k) => k !== key)
        : multiple
          ? [...actualSelectedKeys, key]
          : [key];
      setSelectedKeys(newKeys);
      onSelect?.(newKeys, {
        node,
        selected: !actualSelectedKeys.includes(key),
      });
    },
    [actualSelectedKeys, multiple, onSelect]
  );

  const handleCheck = useCallback(
    (key: TreeEngineKey, node: TreeDataNode) => {
      if (treeCheckStrictly) {
        // Independent mode: toggle only this node
        const newKeys = actualCheckedKeys.includes(key)
          ? actualCheckedKeys.filter((k) => k !== key)
          : [...actualCheckedKeys, key];
        setCheckedKeys(newKeys);
        onCheck?.(newKeys, { node, checked: !actualCheckedKeys.includes(key) });
      } else {
        // Cascade mode: toggling a node propagates downward to all descendants
        // and then bubbles upward to fix parent states. This two-phase approach
        // is simpler than a single-pass algorithm and handles arbitrary depth.
        const isChecking = !actualCheckedKeys.includes(key);
        const descendantKeys = getDescendantKeys(node);
        let newChecked: TreeEngineKey[];

        if (isChecking) {
          const toAdd = [key, ...descendantKeys];
          const combined = new Set([...actualCheckedKeys, ...toAdd]);
          newChecked = Array.from(combined);
        } else {
          const toRemove = new Set([key, ...descendantKeys]);
          newChecked = actualCheckedKeys.filter((k) => !toRemove.has(k));
        }

        // Bubble up: check parents if all their children are now checked
        let changed = true;
        while (changed) {
          changed = false;
          for (const [childK, parentK] of parentMap) {
            const parentNode = findNode(parentK);
            if (!parentNode || !parentNode.children) continue;
            const allChildrenChecked = parentNode.children.every((c) => newChecked.includes(normalizeTreeKey(c.key)));
            if (allChildrenChecked && !newChecked.includes(parentK)) {
              newChecked.push(parentK);
              changed = true;
            } else if (!allChildrenChecked && newChecked.includes(parentK)) {
              newChecked = newChecked.filter((k) => k !== parentK);
              changed = true;
            }
          }
        }

        setCheckedKeys(newChecked);

        const newHalfChecked = computeHalfCheckedKeys(treeData, newChecked, parentMap);
        onCheck?.({ checked: newChecked, halfChecked: newHalfChecked }, { node, checked: isChecking });
      }
    },
    [actualCheckedKeys, treeCheckStrictly, parentMap, findNode, treeData, onCheck]
  );

  // -----------------------------------------------------------------------
  // Drag and drop -- uses HTML5 Drag and Drop API. Drop position is inferred
  // from cursor Y within the target node: top 25% = before, middle = inside
  // (reparent), bottom 25% = after. This 3-zone model matches macOS Finder
  // and Windows Explorer tree drag semantics.
  // -----------------------------------------------------------------------

  const handleDragStart = useCallback(
    (key: TreeEngineKey, e: React.DragEvent) => {
      setDragKey(key);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(key));
      const node = findNode(key);
      if (node) onDragStart?.({ node });
    },
    [findNode, onDragStart]
  );

  const handleDragOver = useCallback(
    (key: TreeEngineKey, e: React.DragEvent, level: number) => {
      if (dragKey === null || dragKey === key) {
        setDropTarget(null);
        return;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const h = rect.height;
      let position: 'before' | 'inside' | 'after';
      if (y < h * 0.25) {
        position = 'before';
      } else if (y > h * 0.75) {
        position = 'after';
      } else {
        position = 'inside';
      }
      setDropTarget({ key, position });
    },
    [dragKey]
  );

  const handleDrop = useCallback(
    (key: TreeEngineKey, _e: React.DragEvent) => {
      if (dragKey === null || !dropTarget) return;
      const dragNode = findNode(dragKey);
      const dropNode = findNode(key);
      if (dragNode && dropNode) {
        const positionMap = { before: -1, inside: 0, after: 1 };
        onDrop?.({
          dragNode,
          dropNode,
          dropPosition: positionMap[dropTarget.position],
        });
      }
      setDragKey(null);
      setDropTarget(null);
    },
    [dragKey, dropTarget, findNode, onDrop]
  );

  const handleDragEnd = useCallback(() => {
    setDragKey(null);
    setDropTarget(null);
  }, []);

  // -----------------------------------------------------------------------
  // Keyboard navigation -- follows WAI-ARIA TreeView pattern:
  // ArrowUp/Down = move focus, ArrowRight = expand a closed node (async
  // nodes trigger loadData) or descend to the first child of an open one,
  // ArrowLeft = collapse or move to parent, Space = toggle checkbox,
  // Enter = select node. Focus is tracked via focusedKey state and
  // programmatically moved to the DOM element via nodeRefs.
  // -----------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Roving-stop bootstrap: Tab lands DOM focus on the tabbable node
      // WITHOUT setting focusedKey. Anchor on that node instead of swallowing
      // the first keystroke -- previously the auto-init path consumed the
      // first ArrowDown just to set state, and DOM focus never moved.
      const anchorKey = focusedKey ?? tabbableKey;
      if (anchorKey === null) return;
      const currentIndex = visibleKeys.indexOf(anchorKey);
      if (currentIndex === -1) return;

      // Expand/collapse arrows mirror in RTL (the Segmented engine's idiom):
      // in a right-to-left tree ArrowLeft expands and ArrowRight collapses.
      const rtl = isRtlContext(e.currentTarget as HTMLElement);
      const directionalKey =
        rtl && e.key === 'ArrowRight'
          ? 'ArrowLeft'
          : rtl && e.key === 'ArrowLeft'
          ? 'ArrowRight'
          : e.key;

      switch (directionalKey) {
        case 'ArrowDown': {
          e.preventDefault();
          if (currentIndex < visibleKeys.length - 1) {
            const nextKey = arrayValueAt(visibleKeys, currentIndex + 1);
            if (nextKey === undefined) break;
            setFocusedKey(nextKey);
            nodeRefs.current.get(nextKey)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (currentIndex > 0) {
            const prevKey = arrayValueAt(visibleKeys, currentIndex - 1);
            if (prevKey === undefined) break;
            setFocusedKey(prevKey);
            nodeRefs.current.get(prevKey)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const node = findNode(anchorKey);
          if (!node || node.isLeaf) break;
          if (!actualExpandedKeys.includes(anchorKey)) {
            // Collapsed non-leaf: expand. Async nodes (no children rendered
            // yet) take the same path as the switcher click and trigger
            // loadData -- previously the keyboard could never expand them.
            handleToggle(anchorKey);
          } else if (node.children && node.children.length > 0) {
            // APG: Right on an OPEN node descends to its first child (the
            // next visible key once expanded).
            const firstChildKey = arrayValueAt(visibleKeys, currentIndex + 1);
            if (firstChildKey === undefined) break;
            setFocusedKey(firstChildKey);
            nodeRefs.current.get(firstChildKey)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (actualExpandedKeys.includes(anchorKey)) {
            handleToggle(anchorKey);
          } else {
            // Move to parent
            const parentKey = parentMap.get(anchorKey);
            if (parentKey !== undefined) {
              setFocusedKey(parentKey);
              nodeRefs.current.get(parentKey)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
            }
          }
          break;
        }
        case ' ': {
          e.preventDefault();
          if (checkable) {
            const node = findNode(anchorKey);
            if (node && !node.disabled && !node.disableCheckbox) {
              handleCheck(anchorKey, node);
            }
          }
          break;
        }
        case 'Enter': {
          e.preventDefault();
          const node = findNode(anchorKey);
          if (node && !node.disabled) {
            handleSelect(anchorKey, node);
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          const firstKey = arrayValueAt(visibleKeys, 0);
          if (firstKey === undefined) break;
          setFocusedKey(firstKey);
          nodeRefs.current.get(firstKey)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
          break;
        }
        case 'End': {
          e.preventDefault();
          const lastKey = arrayValueAt(visibleKeys, visibleKeys.length - 1);
          if (lastKey === undefined) break;
          setFocusedKey(lastKey);
          nodeRefs.current.get(lastKey)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
          break;
        }
        default: {
          // APG typeahead: a printable character (no modifiers, and never the
          // space -- it is the check toggle above) moves focus to the next
          // visible node whose string label starts with the rolling buffer.
          // Keystrokes within 500ms accumulate ("sa" -> "Sandbox"); when the
          // buffer stops matching (including a repeated character), it
          // restarts from the fresh character, cycling that letter's matches.
          // Nodes with non-string titles (ReactNode) do not participate.
          if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) break;
          e.preventDefault();
          const char = e.key.toLowerCase();
          const advanced = advanceTypeahead(typeaheadRef.current, char, Date.now());
          // The window advances on every keystroke; the buffer only survives a
          // match, so a dead prefix cannot poison the next character.
          typeaheadRef.current.lastKeyTime = advanced.state.lastKeyTime;
          let buffer = advanced.prefix;

          const titleOf = (key: TreeEngineKey): string | null => {
            const node = findNode(key);
            return node && typeof node.title === 'string' ? node.title.toLowerCase() : null;
          };
          // Searches every visible node starting after the current one and
          // wrapping, so the current node is the last candidate tried.
          const matchFrom = (prefix: string): TreeEngineKey | undefined => {
            for (let step = 1; step <= visibleKeys.length; step++) {
              const candidate = arrayValueAt(visibleKeys, (currentIndex + step) % visibleKeys.length);
              if (candidate === undefined) continue;
              const label = titleOf(candidate);
              if (label && label.startsWith(prefix)) return candidate;
            }
            return undefined;
          };

          let match = matchFrom(buffer);
          if (match === undefined && buffer.length > 1) {
            buffer = char;
            match = matchFrom(buffer);
          }
          if (match === undefined || match === anchorKey) break;
          typeaheadRef.current.buffer = buffer;
          setFocusedKey(match);
          nodeRefs.current.get(match)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
          break;
        }
      }
    },
    [
      focusedKey,
      tabbableKey,
      visibleKeys,
      actualExpandedKeys,
      findNode,
      parentMap,
      checkable,
      handleToggle,
      handleCheck,
      handleSelect,
    ]
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      ref={treeContainerRef}
      className={`rottay-tree rottay-tree--modern ${className}`}
      data-part="root"
      data-block-node={blockNode || undefined}
      style={style}
      role="tree"
      aria-label={rootLabel}
      aria-multiselectable={multiple}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {treeData.map((node, index) => {
        const { key: rawNodeKey, ...nodeRest } = node;
        const nodeKey = normalizeTreeKey(rawNodeKey);
        if (filteredKeys && !filteredKeys.has(nodeKey)) return null;
        const nodeIsLast = index === treeData.length - 1;
        return (
          <TreeNodeInternal
            key={nodeKey}
            nodeKey={nodeKey}
            {...nodeRest}
            level={0}
            isExpanded={actualExpandedKeys.includes(nodeKey)}
            isSelected={actualSelectedKeys.includes(nodeKey)}
            isChecked={actualCheckedKeys.includes(nodeKey)}
            isHalfChecked={halfCheckedKeys.includes(nodeKey)}
            isLoading={loadingKeys.includes(nodeKey)}
            isFocused={focusedKey === nodeKey}
            isFiltered={filteredKeys ? filteredKeys.has(nodeKey) : true}
            tabbableKey={tabbableKey}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onCheck={handleCheck}
            onFocus={setFocusedKey}
            showLine={!!resolvedShowLine}
            showIcon={showIcon}
            checkable={checkable}
            blockNode={blockNode}
            draggable={draggable}
            switcherIcon={switcherIcon}
            dragKey={dragKey}
            isDragging={dragKey === nodeKey}
            expandedKeys={actualExpandedKeys}
            selectedKeys={actualSelectedKeys}
            checkedKeys={actualCheckedKeys}
            halfCheckedKeys={halfCheckedKeys}
            loadingKeys={loadingKeys}
            focusedKey={focusedKey}
            filteredKeys={filteredKeys}
            searchValue={searchValue}
            findNode={findNode}
            onDragStartInternal={handleDragStart}
            onDragOverInternal={handleDragOver}
            onDropInternal={handleDrop}
            onDragEndInternal={handleDragEnd}
            dropTarget={dropTarget}
            nodeRef={registerNodeRef}
            isLast={nodeIsLast}
            parentIsLast={[]}
          />
        );
      })}
    </div>
  );
}

ModernTree.displayName = 'Tree.Modern';
