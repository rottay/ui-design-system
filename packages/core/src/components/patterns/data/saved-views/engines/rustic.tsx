'use client';

/**
 * @fileoverview Rustic (Vanilla/CSS-variable) engine for the SavedViews bar pattern.
 * Zero external UI library dependency -- renders a horizontal tab strip with
 * inline styles referencing `--ds-*` CSS custom properties. Supports drag-and-drop
 * reorder, inline rename, a hand-crafted context menu (rename/duplicate/delete +
 * custom actions), and an inline "Create view" input. Mouse-hover background
 * effects are applied via inline onMouseEnter/Leave handlers since no CSS
 * framework is available.
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
import type { SavedViewsBarProps, SavedView } from '../SavedViews.types';

/**
 * Rustic engine saved views bar using only inline styles and CSS variables.
 * Mirrors Classic/Modern feature set (tab strip, DnD reorder, rename, duplicate,
 * delete, custom actions, create) without any third-party UI dependency.
 * Hover effects use onMouseEnter/Leave since no CSS pseudo-classes are available.
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
    onViewCreate({
      name: newViewName.trim(),
      config: {},
    });
    setNewViewName('');
    setIsCreating(false);
  }, [newViewName, onViewCreate]);

  const handleRenameStart = useCallback(
    (view: SavedView) => {
      if (!allowRename) return;
      setEditingViewId(view.id);
      setEditingName(view.name);
      setOpenMenuId(null);
    },
    [allowRename]
  );

  const handleRenameConfirm = useCallback(() => {
    if (editingViewId && editingName.trim()) {
      onViewRename(editingViewId, editingName.trim());
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
        className={`ds-pattern-saved-views ds-engine-rustic ${className ?? ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 40,
          color: 'var(--ds-color-text-muted)',
          fontSize: 13,
          ...style,
        }}
      >
        Loading...
      </div>
    );
  }

  // Disable creation when maxViews cap is reached (e.g. plan-based limits).
  const canCreate = allowCreate && (!maxViews || views.length < maxViews);

  return (
    <div
      data-part="root"
      className={`ds-pattern-saved-views ds-engine-rustic ${className ?? ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderBottom: '1px solid var(--ds-color-border)',
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
        const hasMenu = allowRename || allowDelete || onViewDuplicate || customActions.length > 0;

        return (
          <div
            key={view.id}
            data-part="tab"
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
              borderBottom: isActive
                ? '2px solid var(--ds-color-primary, var(--ds-color-primary-500))'
                : '2px solid transparent',
              cursor: 'pointer',
              opacity: isDragging ? 0.4 : 1,
              borderLeft: isDropTarget
                ? '2px solid var(--ds-color-primary, var(--ds-color-primary-500))'
                : '2px solid transparent',
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
                style={{
                  fontSize: 10,
                  color: 'var(--ds-color-text-muted, var(--ds-color-text-tertiary))',
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
                  border: '1px solid var(--ds-color-border)',
                  borderRadius: 3,
                  outline: 'none',
                  background: 'var(--ds-color-background, var(--ds-color-bg-elevated))',
                  color: 'var(--ds-color-text, var(--ds-color-text-primary))',
                }}
              />
            ) : (
              <span
                data-part="tab-label"
                data-active={isActive}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? 'var(--ds-color-primary, var(--ds-color-primary-500))'
                    : 'var(--ds-color-text, var(--ds-color-text-primary))',
                }}
              >
                {view.name}
              </span>
            )}
            {view.isDefault && (
              <span
                data-part="default-star"
                data-default={true}
                style={{
                  fontSize: 10,
                  color: 'var(--ds-color-warning)',
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
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--ds-color-text-muted, var(--ds-color-text-tertiary))',
                    fontSize: 14,
                    padding: 0,
                    borderRadius: 3,
                  }}
                >
                  &#x22EE;
                </button>
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    data-part="menu-panel"
                    data-open={isMenuOpen}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      zIndex: 50,
                      minWidth: 140,
                      background: 'var(--ds-color-surface, var(--ds-color-bg-elevated))',
                      border: '1px solid var(--ds-color-border)',
                      borderRadius: 6,
                      boxShadow: 'var(--ds-saved-views-menu-shadow, var(--ds-shadow-lg))',
                      padding: 4,
                    }}
                  >
                    {allowRename && (
                      <button
                        data-part="menu-item"
                        data-danger={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameStart(view);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 13,
                          borderRadius: 4,
                          color: 'var(--ds-color-text, var(--ds-color-text-primary))',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            'var(--ds-color-bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            'transparent';
                        }}
                      >
                        Rename
                      </button>
                    )}
                    {onViewDuplicate && (
                      <button
                        data-part="menu-item"
                        data-danger={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDuplicate(view.id);
                          setOpenMenuId(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 13,
                          borderRadius: 4,
                          color: 'var(--ds-color-text, var(--ds-color-text-primary))',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            'var(--ds-color-bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            'transparent';
                        }}
                      >
                        Duplicate
                      </button>
                    )}
                    {customActions.map((action) => (
                      <button
                        key={action.key}
                        data-part="menu-item"
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
                          border: 'none',
                          background: 'transparent',
                          cursor: action.disabled ? 'not-allowed' : 'pointer',
                          textAlign: 'left',
                          fontSize: 13,
                          borderRadius: 4,
                          color: action.danger
                            ? 'var(--ds-color-danger, var(--ds-color-error))'
                            : 'var(--ds-color-text, var(--ds-color-text-primary))',
                          opacity: action.disabled ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!action.disabled) {
                            (e.currentTarget as HTMLButtonElement).style.background =
                              'var(--ds-color-bg-secondary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            'transparent';
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                    {/* Default views are protected from deletion to prevent
                        accidental removal of the system-provided baseline. */}
                    {allowDelete && !view.isDefault && (
                      <>
                        <div
                          data-part="divider"
                          style={{
                            height: 1,
                            background: 'var(--ds-color-border)',
                            margin: '4px 0',
                          }}
                        />
                        <button
                          data-part="menu-item"
                          data-danger={true}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDelete(view.id);
                            setOpenMenuId(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 13,
                            borderRadius: 4,
                            color: 'var(--ds-color-danger, var(--ds-color-error))',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background =
                              'var(--ds-color-bg-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background =
                              'transparent';
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
              border: '1px solid var(--ds-color-border)',
              borderRadius: 4,
              outline: 'none',
              background: 'var(--ds-color-background, var(--ds-color-bg-elevated))',
              color: 'var(--ds-color-text, var(--ds-color-text-primary))',
            }}
          />
        </div>
      ) : (
        canCreate && (
          <button
            data-part="create-button"
            onClick={() => setIsCreating(true)}
            data-testid="create-view-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--ds-color-text-muted, var(--ds-color-text-tertiary))',
              flexShrink: 0,
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'var(--ds-color-bg-secondary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'transparent';
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
