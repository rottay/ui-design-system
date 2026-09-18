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
 * (`foundation/tokens/css/runtime/engines/modern/skin/tree/index.css`), keyed on the
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
 * KEYBOARD AND TOUCH MOVE (a11y, DECLARED ADDITION): a draggable row carries a
 * real Move control (`data-part="drag-handle"`) that opens move mode. The up and
 * down arrows choose a destination among the visible rows, the left and right
 * arrows step the before/inside/after position (mirrored by the shared reading
 * direction), Enter or Space drops through the kernel and Escape cancels; the
 * node itself and its own subtree are never offered, and the control that names
 * one refuses it aloud. Every step is announced through a visually-hidden pair
 * of `aria-live="polite"` regions the tree alternates, so a repeated identical
 * outcome still changes a region's text. The control shares the tree's roving
 * tab stop, so the WAI-ARIA TreeView single-tab-stop contract is unchanged, and
 * a pointer drag still announces nothing.
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
import { useOptionalDirection, useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { interpolateTranslation } from '@/foundation/i18n/runtime/resolution/translation';
import { NavigationForwardIcon } from '@/graphics/icons/semantic/generated/roles/navigation-forward';
import { ActionReorderIcon } from '@/graphics/icons/semantic/generated/roles/action-reorder';
import { LoadingIndicator } from '../../../../foundation/loading-indicator';
import { VisuallyHidden } from '../../../../foundation/visually-hidden';
import { advanceTypeahead } from '../../../../runtime/collection/typeahead';
import type { TypeaheadState } from '../../../../runtime/collection/typeahead';
import { resolveEdgeZone, resolveMoveIntent, useDragSession } from '../../../../runtime/collection/sortable';
import type { SortableDropZone, UseDragSessionResult } from '../../../../runtime/collection/sortable';
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

// A search filter culls siblings from the DOM. Set position, set size and the
// tree-line termination all describe what is actually drawn, so they are all
// derived from this list rather than from the source array -- otherwise the
// last rendered row announces the wrong position and draws a guide running
// down to a sibling that is not there.
function renderedSiblings(
  nodes: TreeDataNode[],
  filteredKeys: Set<TreeEngineKey> | null
): TreeDataNode[] {
  if (!filteredKeys) return nodes;
  return nodes.filter((node) => filteredKeys.has(normalizeTreeKey(node.key)));
}

// ---------------------------------------------------------------------------
// Drag transport
// ---------------------------------------------------------------------------

// The row binds its own key; the cursor resolves the key AND the zone, so the
// destination is a wider shape than the bound target.
type TreeDragPayload = { key: TreeEngineKey };
type TreeDragDestination = { key: TreeEngineKey; position: SortableDropZone };
type TreeDragSession = UseDragSessionResult<TreeDragPayload, TreeDragPayload, TreeDragDestination>;

const DROP_POSITION: Record<SortableDropZone, number> = { before: -1, inside: 0, after: 1 };

// ---------------------------------------------------------------------------
// Keyboard/touch move affordance
// ---------------------------------------------------------------------------

// The pointer's 3-zone model, ordered as the row reads top to bottom; the
// cross axis steps through it.
const MOVE_ZONES: readonly SortableDropZone[] = ['before', 'inside', 'after'];

/** What the row's Move control means right now. */
type TreeMoveMode = 'idle' | 'origin' | 'destination' | 'refused';

/** Everything a row needs to render its Move control; the root owns every decision. */
interface TreeMoveAffordance {
  mode: (key: TreeEngineKey) => TreeMoveMode;
  label: (key: TreeEngineKey, title: string) => string;
  activate: (key: TreeEngineKey) => void;
}

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
      data-position={position}
      // The indentation tracks the node's logical inline-start so the indicator
      // lines up under the title in both LTR and RTL. The edge it sits on is
      // the skin's, keyed on `data-position`.
      style={{ '--ds-tree-row-indent': `${indent}px` } as React.CSSProperties}
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
  expandedKeys: TreeEngineKey[];
  selectedKeys: TreeEngineKey[];
  checkedKeys: TreeEngineKey[];
  halfCheckedKeys: TreeEngineKey[];
  loadingKeys: TreeEngineKey[];
  focusedKey: TreeEngineKey | null;
  filteredKeys: Set<TreeEngineKey> | null;
  searchValue?: string;
  findNode: (key: TreeEngineKey) => TreeDataNode | undefined;
  drag: TreeDragSession;
  /** The row's Move control, or null when the tree is not draggable. */
  move: TreeMoveAffordance | null;
  nodeRef: (key: TreeEngineKey, el: HTMLDivElement | null) => void;
  isLast: boolean;
  parentIsLast: boolean[];
  /** 1-based position within the rendered sibling set (aria-posinset). */
  posInSet: number;
  /** Size of the rendered sibling set (aria-setsize). */
  setSize: number;
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
  expandedKeys,
  selectedKeys,
  checkedKeys,
  halfCheckedKeys,
  loadingKeys,
  focusedKey,
  filteredKeys,
  searchValue,
  findNode,
  drag,
  move,
  nodeRef,
  isLast,
  parentIsLast,
  posInSet,
  setSize,
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
  // The row is both the drag source and the drop target, so it carries both
  // kernel bags -- their keys are disjoint and neither overrides the other.
  const dragProps = {
    ...drag.getSourceProps({ key: nodeKey }, { eligible: !disabled }),
    ...drag.getTargetProps({ key: nodeKey }, { eligible: !!propDraggable }),
  };
  const dropTarget = drag.session?.target ?? null;
  const isDragging = drag.session?.payload.key === nodeKey;
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
                data-span="full"
                style={{ '--ds-tree-connector-inset': `calc(${i} * ${indentStep} + 12px)` } as React.CSSProperties}
              />
            ) : null
          )}
          <div
            data-part="connector"
            data-axis="horizontal"
            style={{ '--ds-tree-connector-inset': `calc(${level - 1} * ${indentStep} + 12px)` } as React.CSSProperties}
          />
          {isLast && (
            <div
              data-part="connector"
              data-axis="vertical"
              data-span="half"
              style={{ '--ds-tree-connector-inset': `calc(${level - 1} * ${indentStep} + 12px)` } as React.CSSProperties}
            />
          )}
          {!isLast && (
            <div
              data-part="connector"
              data-axis="vertical"
              data-span="full"
              style={{ '--ds-tree-connector-inset': `calc(${level - 1} * ${indentStep} + 12px)` } as React.CSSProperties}
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
        ref={drag.registerItem(nodeKey) as React.Ref<HTMLDivElement>}
        style={{ '--ds-tree-row-indent': paddingInlineStart } as React.CSSProperties}
        onClick={handleClick}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={showExpander ? isExpanded : undefined}
        aria-disabled={disabled}
        aria-checked={checkable ? (isHalfChecked ? 'mixed' : isChecked) : undefined}
        aria-level={level + 1}
        aria-posinset={posInSet}
        aria-setsize={setSize}
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
        {...dragProps}
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

        {/* Shares the row's roving tab stop rather than adding one per row, and
            stays enabled on a refusal: a disabled control announces nothing. */}
        {isDraggable && move && (
          <button
            type="button"
            data-part="drag-handle"
            data-move-mode={move.mode(nodeKey)}
            aria-label={move.label(nodeKey, nodeTitle)}
            aria-pressed={move.mode(nodeKey) === 'origin' ? true : undefined}
            tabIndex={nodeKey === tabbableKey ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              move.activate(nodeKey);
            }}
          >
            <ActionReorderIcon decorative size={12} />
          </button>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div role="group">
          {renderedSiblings(children!, filteredKeys).map((child, index, siblings) => {
            const { key: rawChildKey, ...childRest } = child;
            const childKey = normalizeTreeKey(rawChildKey);
            const childIsLast = index === siblings.length - 1;
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
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                checkedKeys={checkedKeys}
                halfCheckedKeys={halfCheckedKeys}
                loadingKeys={loadingKeys}
                focusedKey={focusedKey}
                filteredKeys={filteredKeys}
                searchValue={searchValue}
                findNode={findNode}
                drag={drag}
                move={move}
                nodeRef={nodeRef}
                isLast={childIsLast}
                parentIsLast={[...parentIsLast, isLast]}
                posInSet={index + 1}
                setSize={siblings.length}
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
  // The reading direction comes from the shared i18n authority, not a DOM
  // probe of a node's `dir` chain: the locale knows it on the server too, and a
  // probe re-derives from paint a fact the provider already holds.
  const direction = useOptionalDirection();

  const rootLabelTranslated = rootI18n?.t('tree.label');
  const rootLabel = rootLabelTranslated && !rootLabelTranslated.endsWith('tree.label') ? rootLabelTranslated : 'Tree';

  // The floor carries the same placeholders as catalog copy, so a standalone
  // render interpolates its own English instead of echoing `{title}`.
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    rootI18n?.tOr(key, floor, params) ?? interpolateTranslation(floor, params);

  /* A polite region is only spoken when its own text CHANGES, so the two
     regions alternate: every message is an addition to whichever was empty. */
  const [announcement, setAnnouncement] = useState<{ slot: 0 | 1; text: string }>({ slot: 0, text: '' });
  const announce = (text: string): void =>
    setAnnouncement((previous) => ({ slot: previous.slot === 0 ? 1 : 0, text }));

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
  // A search filter culls nodes from the DOM, so the walk is narrowed to the
  // rendered set: navigating onto a culled key has no element to focus, which
  // stranded DOM focus while focusedKey silently walked invisible nodes.
  const visibleKeys = useMemo(() => {
    const flat = flattenVisibleKeys(treeData, actualExpandedKeys);
    return filteredKeys ? flat.filter((key) => filteredKeys.has(key)) : flat;
  }, [treeData, actualExpandedKeys, filteredKeys]);

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
  // Drag and drop -- the shared sortable session. Drop position is inferred
  // from cursor Y within the target node: top 25% = before, middle = inside
  // (reparent), bottom 25% = after. This 3-zone model matches macOS Finder
  // and Windows Explorer tree drag semantics. Arrows stay the WAI-ARIA
  // TreeView contract below, so the session binds no key of its own.
  // -----------------------------------------------------------------------

  // -----------------------------------------------------------------------
  // Move mode -- the keyboard and touch half of the same transport. A node
  // cannot land on itself or inside its own subtree, so the walk skips those
  // keys and the control that names one refuses it instead of committing.
  // -----------------------------------------------------------------------

  const titleOfKey = useCallback(
    (key: TreeEngineKey): string => {
      const node = findNode(key);
      return typeof node?.title === 'string' ? node.title : String(key);
    },
    [findNode]
  );

  const ineligibleKeys = useCallback(
    (payloadKey: TreeEngineKey): Set<TreeEngineKey> => {
      const node = findNode(payloadKey);
      return new Set<TreeEngineKey>([payloadKey, ...(node ? getDescendantKeys(node) : [])]);
    },
    [findNode]
  );

  // The nearest destination that is a real move: one step down if anything is
  // below, otherwise one step up. Null means the tree offers nowhere to land.
  const seedDestination = useCallback(
    (payloadKey: TreeEngineKey): TreeDragDestination | null => {
      const blocked = ineligibleKeys(payloadKey);
      const from = visibleKeys.indexOf(payloadKey);
      if (from === -1) return null;
      for (let at = from + 1; at < visibleKeys.length; at += 1) {
        const key = arrayValueAt(visibleKeys, at);
        if (key !== undefined && !blocked.has(key)) return { key, position: 'after' };
      }
      for (let at = from - 1; at >= 0; at -= 1) {
        const key = arrayValueAt(visibleKeys, at);
        if (key !== undefined && !blocked.has(key)) return { key, position: 'before' };
      }
      return null;
    },
    [ineligibleKeys, visibleKeys]
  );

  const positionWord = (position: SortableDropZone, title: string): string =>
    position === 'before'
      ? tOr('tree.move_before', 'before {title}', { title })
      : position === 'inside'
        ? tOr('tree.move_inside', 'into {title}', { title })
        : tOr('tree.move_after', 'after {title}', { title });

  const drag = useDragSession<TreeDragPayload, TreeDragPayload, TreeDragDestination>({
    disabled: !draggable,
    resolveTarget: ({ phase, event, payload, target, current }) => {
      // The commit combines the RECEIVING row with the zone the hover stored;
      // no zone is the refusal, and the drop phase carries no self guard.
      if (phase === 'drop') {
        return current ? { key: target.key, position: current.position } : null;
      }
      if (payload.key === target.key) return null;
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      return {
        key: target.key,
        position: resolveEdgeZone(rect, event.clientY, { zones: 'before-inside-after' }),
      };
    },
    onDrop: (payload, target) => {
      const dragNode = findNode(payload.key);
      const dropNode = findNode(target.key);
      if (dragNode && dropNode) {
        onDrop?.({ dragNode, dropNode, dropPosition: DROP_POSITION[target.position] });
      }
    },
    onDragStarted: (payload) => {
      const node = findNode(payload.key);
      if (node) onDragStart?.({ node });
    },
    /* Delegated: the arrows, Space and Enter are the WAI-ARIA TreeView
       contract, so the kernel binds none of them and the family drives. */
    keyboard: {
      mode: 'delegated',
      resolveKeyboardTarget: ({ payload, intent, candidate }) => {
        if (intent === 'prev-container' || intent === 'next-container') {
          if (!candidate) return { kind: 'blocked' };
          const at = MOVE_ZONES.indexOf(candidate.position) + (intent === 'next-container' ? 1 : -1);
          if (at < 0) return { kind: 'blocked' };
          const zone = arrayValueAt(MOVE_ZONES, at);
          if (zone === undefined) return { kind: 'blocked' };
          return { kind: 'target', target: { key: candidate.key, position: zone } };
        }
        // The CANDIDATE advances, not the payload: nothing has committed during
        // a move, so the payload's own index is stale after the first arrow.
        const blocked = ineligibleKeys(payload.key);
        const from = visibleKeys.indexOf(candidate ? candidate.key : payload.key);
        if (from === -1) return { kind: 'blocked' };
        const step = intent === 'next-item' ? 1 : -1;
        for (let at = from + step; at >= 0 && at < visibleKeys.length; at += step) {
          const key = arrayValueAt(visibleKeys, at);
          if (key === undefined || blocked.has(key)) continue;
          return { kind: 'target', target: { key, position: candidate?.position ?? 'after' } };
        }
        return { kind: 'blocked' };
      },
    },
    /* The kernel says WHEN, the family says WHAT -- and a pointer drag says
       nothing at all. */
    onAnnounce: (event) => {
      if (event.origin === 'pointer') return;
      const name = titleOfKey(event.payload.key);
      if (event.kind === 'grabbed') {
        announce(
          tOr(
            'tree.move_grabbed',
            'Moving {name}. Use the up and down arrows to choose a destination, the left and right arrows to choose the position, Enter to drop, Escape to cancel.',
            { name }
          )
        );
        return;
      }
      if (event.kind === 'moved') {
        announce(positionWord(event.target.position, titleOfKey(event.target.key)));
        return;
      }
      if (event.kind === 'dropped') {
        announce(
          tOr('tree.move_dropped', '{name} moved {position}', {
            name,
            position: positionWord(event.target.position, titleOfKey(event.target.key)),
          })
        );
        return;
      }
      if (event.kind === 'cancelled') {
        announce(tOr('tree.move_cancelled', 'Move cancelled. {name} stays where it was', { name }));
        return;
      }
      announce(
        event.reason === 'edge'
          ? tOr('tree.move_edge', 'Cannot move {name} any further in that direction', { name })
          : tOr('tree.move_no_destination', 'No destination chosen. {name} stays where it was', { name })
      );
    },
  });

  const moveSession = drag.session?.origin === 'keyboard' ? drag.session : null;

  // Escape and the Move control's own cancel both land the user back on the row
  // they were moving -- the kernel restores focus for a COMMIT only.
  const cancelMove = (): void => {
    const open = moveSession;
    drag.cancel();
    if (!open) return;
    setFocusedKey(open.payload.key);
    nodeRefs.current.get(open.payload.key)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
  };

  const moveAffordance: TreeMoveAffordance | null = draggable
    ? {
        mode: (key) => {
          if (!moveSession) return 'idle';
          if (moveSession.payload.key === key) return 'origin';
          return ineligibleKeys(moveSession.payload.key).has(key) ? 'refused' : 'destination';
        },
        label: (key, title) => {
          const named = title || String(key);
          if (!moveSession) return tOr('tree.move', 'Move {title}', { title: named });
          const name = titleOfKey(moveSession.payload.key);
          if (moveSession.payload.key === key) {
            return tOr('tree.move_cancel', 'Cancel moving {name}', { name });
          }
          if (ineligibleKeys(moveSession.payload.key).has(key)) {
            return tOr('tree.move_refuse', 'Cannot move {name} into {title}', { name, title: named });
          }
          return tOr('tree.move_drop_here', 'Move {name} {position}', {
            name,
            position: positionWord(moveSession.target?.position ?? 'after', named),
          });
        },
        activate: (key) => {
          if (!moveSession) {
            const seed = seedDestination(key);
            if (!seed) {
              announce(tOr('tree.move_nowhere', 'There is nowhere to move {name}', { name: titleOfKey(key) }));
              return;
            }
            drag.start({ key }, { target: seed });
            return;
          }
          if (moveSession.payload.key === key) {
            cancelMove();
            return;
          }
          if (ineligibleKeys(moveSession.payload.key).has(key)) {
            announce(
              tOr('tree.move_refused', 'Cannot move {name} into {title} -- it is inside {name}', {
                name: titleOfKey(moveSession.payload.key),
                title: titleOfKey(key),
              })
            );
            return;
          }
          drag.commit({ key, position: moveSession.target?.position ?? 'after' });
        },
      }
    : null;

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
      // Move mode is modal over the arrows, Space and Enter; every other key
      // falls through untouched, so typeahead and Tab keep working.
      if (moveSession) {
        if (e.key === 'Escape') {
          e.preventDefault();
          cancelMove();
          return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          drag.commit();
          return;
        }
        // The reading-direction law is the navigation authority's: on the cross
        // axis ArrowLeft steps the position forward in RTL, backward in LTR.
        const intent = resolveMoveIntent(e.key, {
          orientation: 'vertical',
          crossAxis: 'horizontal',
          rtl: direction === 'rtl',
        });
        if (intent === null) return;
        e.preventDefault();
        drag.move(intent);
        return;
      }

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
      const rtl = direction === 'rtl';
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
      moveSession,
      cancelMove,
      drag,
      direction,
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
      {renderedSiblings(treeData, filteredKeys).map((node, index, siblings) => {
        const { key: rawNodeKey, ...nodeRest } = node;
        const nodeKey = normalizeTreeKey(rawNodeKey);
        const nodeIsLast = index === siblings.length - 1;
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
            expandedKeys={actualExpandedKeys}
            selectedKeys={actualSelectedKeys}
            checkedKeys={actualCheckedKeys}
            halfCheckedKeys={halfCheckedKeys}
            loadingKeys={loadingKeys}
            focusedKey={focusedKey}
            filteredKeys={filteredKeys}
            searchValue={searchValue}
            findNode={findNode}
            drag={drag}
            move={moveAffordance}
            nodeRef={registerNodeRef}
            isLast={nodeIsLast}
            parentIsLast={[]}
            posInSet={index + 1}
            setSize={siblings.length}
          />
        );
      })}

      {/* Both regions stay mounted and empty, so one exists before the first
          message and one is free for the next. No part: the primitive owns the clip. */}
      {draggable && (
        <>
          <VisuallyHidden role="status" aria-live="polite">
            {announcement.slot === 0 ? announcement.text : ''}
          </VisuallyHidden>
          <VisuallyHidden role="status" aria-live="polite">
            {announcement.slot === 1 ? announcement.text : ''}
          </VisuallyHidden>
        </>
      )}
    </div>
  );
}

ModernTree.displayName = 'Tree.Modern';
