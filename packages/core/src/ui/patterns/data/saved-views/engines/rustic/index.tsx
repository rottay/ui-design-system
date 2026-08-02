'use client';

/**
 * @fileoverview Rustic (Vanilla/CSS-variable) engine for the SavedViews bar pattern.
 * Zero external UI library dependency -- renders a horizontal tab strip with
 * inline layout styles and engine skin paint referencing `--ds-*` CSS custom
 * properties. Supports drag-and-drop reorder, inline rename, a hand-crafted
 * context menu (rename/duplicate/delete + custom actions), and an inline
 * "Create view" input.
 *
 * @example
 * <RusticSavedViewsBar
 *   views={[{ id: '1', name: 'Default', isDefault: true, config: {} }]}
 *   activeViewId="1"
 *   onViewSelect={(id) => applyView(id)}
 *   onViewCreate={(v) => saveNewView(v)}
 *   onViewDelete={(id) => removeView(id)}
 *   onViewRename={(id, name) => renameView(id, name)}
 * />
 */

import React, { useCallback, useRef, useState } from 'react';
import type { SavedViewsBarProps, SavedView } from '../../contracts';

/**
 * Rustic engine saved views bar using inline layout styles and CSS-variable
 * skin paint. Mirrors Classic/Modern feature set (tab strip, DnD reorder,
 * rename, duplicate, delete, custom actions, create) without any third-party
 * UI dependency.
 *
 * @param props - {@link SavedViewsBarProps}
 * @returns A horizontal flex container acting as a tab bar for saved views.
 */
export default function RusticSavedViewsBar(props: SavedViewsBarProps) {
  const {
    views,
    activeViewId,
    onViewSelect,
    onViewSave,
    onViewDelete,
    onViewRename,
    onViewCreate,
    onViewReorder,
    onViewDuplicate,
    allowCreate = true,
    allowDelete = true,
    allowRename = true,
    createLabel = 'New view',
    newViewPlaceholder = 'View name',
    getMenuActions,
    maxViews,
    loading,
    className,
    style,
  } = props;

  // --- Local UI state ---
  const [isCreating, setIsCreating] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  // Tracks which view's context menu is open; only one can be open at a time.
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // Drag-and-drop state for visual feedback during tab reorder.
  const [dragViewId, setDragViewId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCreate = useCallback(() => {
    if (!newViewName.trim()) return;
    onViewCreate?.({
      name: newViewName.trim(),
      config: {},
    });
    setNewViewName('');
    setIsCreating(false);
  }, [newViewName, onViewCreate]);

  const handleRenameStart = useCallback(
    (view: SavedView) => {
      // Same visibility law as the menu item that reaches here: without a
      // handler the action is not available, so editing must not start either.
      if (!allowRename || !onViewRename) return;
      setEditingViewId(view.id);
      setEditingName(view.name);
      setOpenMenuId(null);
    },
    [allowRename, onViewRename]
  );

  const handleRenameConfirm = useCallback(() => {
    if (editingViewId && editingName.trim()) {
      onViewRename?.(editingViewId, editingName.trim());
    }
    setEditingViewId(null);
    setEditingName('');
  }, [editingViewId, editingName, onViewRename]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, viewId: string) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', viewId);
      setDragViewId(viewId);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, viewId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (viewId !== dragViewId) {
        setDropTargetId(viewId);
      }
    },
    [dragViewId]
  );

  // Reorders by splicing the dragged view out of its old position and inserting
  // it at the drop target's position, then emitting the new ID order array.
  const handleDrop = useCallback(
    (e: React.DragEvent, targetViewId: string) => {
      e.preventDefault();
      if (dragViewId && dragViewId !== targetViewId && onViewReorder) {
        const currentOrder = views.map((v) => v.id);
        const fromIndex = currentOrder.indexOf(dragViewId);
        const toIndex = currentOrder.indexOf(targetViewId);
        if (fromIndex !== -1 && toIndex !== -1) {
          const newOrder = [...currentOrder];
          newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, dragViewId);
          onViewReorder(newOrder);
        }
      }
      setDragViewId(null);
      setDropTargetId(null);
    },
    [dragViewId, views, onViewReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragViewId(null);
    setDropTargetId(null);
  }, []);

  if (loading) {
    return (
      <div
        data-part="root"
        data-loading={true}
        className={`ds-pattern-saved-views ds-engine-rustic ${className ?? ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 40,
          fontSize: 13,
          ...style,
        }}
      >
        Loading...
      </div>
    );
  }

  /**
   * VISIBILITY LAW (contracts/index.ts:80-82): an absent mutation handler means
   * the action is NOT AVAILABLE and the bar renders WITHOUT it. An `allow*` flag
   * is a permission, not a capability; rendering on the flag alone is what
   * produced visible inert actions. Absence is omission, never `disabled`.
   *
   * maxViews still caps creation on top of that (e.g. plan-based limits).
   */
  const canRename = allowRename && Boolean(onViewRename);
  const canDelete = allowDelete && Boolean(onViewDelete);
  const canCreate =
    allowCreate && Boolean(onViewCreate) && (!maxViews || views.length < maxViews);

  return (
    <div
      data-part="root"
      data-loading={false}
      className={`ds-pattern-saved-views ds-engine-rustic ${className ?? ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '0 8px',
        minHeight: 40,
        overflowX: 'auto',
        ...style,
      }}
    >
      {views.map((view) => {
        const isActive = view.id === activeViewId;
        const isEditing = editingViewId === view.id;
        const isDragging = dragViewId === view.id;
        const isDropTarget = dropTargetId === view.id;
        const isMenuOpen = openMenuId === view.id;
        const customActions = getMenuActions?.(view) ?? [];
        /* Includes the isDefault carve-out: a default view whose only permitted
           action is delete has nothing to show, and an empty trigger is itself
           an inert affordance. */
        const hasMenu =
          canRename ||
          (canDelete && !view.isDefault) ||
          Boolean(onViewDuplicate) ||
          customActions.length > 0;

        return (
          <div
            key={view.id}
            data-part="tab"
            className="ds-saved-views__tab"
            data-active={isActive}
            data-drop-target={isDropTarget}
            data-dragging={isDragging}
            draggable={!!onViewReorder}
            onDragStart={(e) => handleDragStart(e, view.id)}
            onDragOver={(e) => handleDragOver(e, view.id)}
            onDrop={(e) => handleDrop(e, view.id)}
            onDragEnd={handleDragEnd}
            data-testid={`view-tab-${view.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              opacity: isDragging ? 0.4 : 1,
              transition: 'opacity 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              position: 'relative',
            }}
            onClick={() => {
              if (!isEditing) onViewSelect(view.id);
            }}
          >
            {onViewReorder && (
              <span
                data-part="drag-handle"
                className="ds-saved-views__drag-handle"
                style={{
                  fontSize: 10,
                  cursor: 'grab',
                  lineHeight: 1,
                }}
              >
                &#x2630;
              </span>
            )}
            {view.icon}
            {isEditing ? (
              <input
                type="text"
                data-part="rename-input"
                className="ds-saved-views__rename-input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameConfirm();
                }}
                onBlur={handleRenameConfirm}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                style={{
                  width: 120,
                  padding: '2px 6px',
                  fontSize: 13,
                }}
              />
            ) : (
              <span
                data-part="tab-label"
                className="ds-saved-views__tab-label"
                data-active={isActive}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {view.name}
              </span>
            )}
            {view.isDefault && (
              <span
                data-part="default-star"
                className="ds-saved-views__default-star"
                data-default={true}
                style={{
                  fontSize: 10,
                  lineHeight: 1,
                }}
              >
                &#9733;
              </span>
            )}
            {hasMenu && (
              <div style={{ position: 'relative' }}>
                <button
                  data-part="menu-trigger"
                  className="ds-saved-views__menu-trigger"
                  data-open={isMenuOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(isMenuOpen ? null : view.id);
                  }}
                  aria-label={`${view.name} options`}
                  style={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 0,
                  }}
                >
                  &#x22EE;
                </button>
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    data-part="menu-panel"
                    className="ds-saved-views__menu-panel"
                    data-open={isMenuOpen}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      zIndex: 50,
                      minWidth: 140,
                      padding: 4,
                    }}
                  >
                    {canRename && (
                      <button
                        data-part="menu-item"
                        className="ds-saved-views__menu-item"
                        data-danger={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameStart(view);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 13,
                        }}
                      >
                        Rename
                      </button>
                    )}
                    {onViewDuplicate && (
                      <button
                        data-part="menu-item"
                        className="ds-saved-views__menu-item"
                        data-danger={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDuplicate(view.id);
                          setOpenMenuId(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 13,
                        }}
                      >
                        Duplicate
                      </button>
                    )}
                    {customActions.map((action) => (
                      <button
                        key={action.key}
                        data-part="menu-item"
                        className="ds-saved-views__menu-item"
                        data-danger={!!action.danger}
                        data-disabled={!!action.disabled}
                        disabled={action.disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                          setOpenMenuId(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          cursor: action.disabled ? 'not-allowed' : 'pointer',
                          textAlign: 'left',
                          fontSize: 13,
                          opacity: action.disabled ? 0.5 : 1,
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                    {/* Default views are protected from deletion to prevent
                        accidental removal of the system-provided baseline. */}
                    {canDelete && !view.isDefault && (
                      <>
                        <div
                          data-part="divider"
                          className="ds-saved-views__divider"
                          style={{
                            height: 1,
                            margin: '4px 0',
                          }}
                        />
                        <button
                          data-part="menu-item"
                          className="ds-saved-views__menu-item"
                          data-danger={true}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDelete?.(view.id);
                            setOpenMenuId(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 13,
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {isCreating ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 0',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            data-part="create-input"
            className="ds-saved-views__create-input"
            placeholder={newViewPlaceholder}
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
            onBlur={() => {
              if (!newViewName.trim()) setIsCreating(false);
              else handleCreate();
            }}
            autoFocus
            data-testid="new-view-input"
            style={{
              width: 140,
              padding: '4px 8px',
              fontSize: 13,
            }}
          />
        </div>
      ) : (
        canCreate && (
          <button
            data-part="create-button"
            className="ds-saved-views__create-button"
            onClick={() => setIsCreating(true)}
            data-testid="create-view-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
            {createLabel}
          </button>
        )
      )}
    </div>
  );
}
