'use client';

/**
 * @fileoverview Modern engine for the SavedViews bar pattern.
 * Renders a premium horizontal pill/chip strip using DS token-driven inline
 * styles with drag-and-drop reorder, inline rename, a custom dropdown context
 * menu (rename/duplicate/delete), and a "Create view" button with inline text
 * input.
 *
 * All styling uses CSS custom properties from the design system:
 * - Surfaces: --ds-surface-card, --ds-surface-highlight, --ds-surface-inset
 * - Elevation: --ds-elevation-3
 * - Motion: --ds-motion-fast, --ds-motion-normal, --ds-motion-ease-out
 * - Radius: --ds-radius-sm, --ds-radius-md, --ds-radius-full
 * - Border: --ds-color-border
 * - Focus: --ds-focus-ring-width, --ds-focus-ring-color
 * - Colors: --ds-color-primary, --ds-color-primary-foreground, --ds-color-text,
 *           --ds-color-text-muted, --ds-color-error, --ds-color-warning
 *
 * @example
 * <ModernSavedViewsBar
 *   views={[{ id: '1', name: 'My Tasks', config: {} }]}
 *   activeViewId="1"
 *   onViewSelect={(id) => applyView(id)}
 *   onViewCreate={(v) => saveNewView(v)}
 *   onViewDelete={(id) => removeView(id)}
 *   onViewRename={(id, name) => renameView(id, name)}
 * />
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { SavedViewsBarProps, SavedView } from '../SavedViews.types';

/* ---------------------------------------------------------------------------
 * Shared inline-style constants
 * ----------------------------------------------------------------------- */

const inlineInputStyle: React.CSSProperties = {
  height: 26,
  padding: '0 8px',
  fontSize: 13,
  border: '1px solid var(--ds-color-border)',
  borderRadius: 'var(--ds-radius-sm)',
  background: 'var(--ds-surface-inset)',
  color: 'inherit',
  outline: 'none',
  boxSizing: 'border-box' as const,
  width: 130,
  transition: `border-color var(--ds-motion-fast) var(--ds-motion-ease-out),
               box-shadow var(--ds-motion-fast) var(--ds-motion-ease-out)`,
};

const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'var(--ds-focus-ring-color)';
  e.currentTarget.style.boxShadow =
    '0 0 0 var(--ds-focus-ring-width) var(--ds-focus-ring-color)';
};

const inputBlurStyleHandler = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'var(--ds-color-border)';
  e.currentTarget.style.boxShadow = 'none';
};

/** Reusable menu-item base style factory */
function menuItemStyle(
  isHovered: boolean,
  isDanger?: boolean,
  isDisabled?: boolean,
): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '6px 10px',
    fontSize: 13,
    border: 'none',
    background: isHovered ? 'var(--ds-surface-highlight)' : 'transparent',
    borderRadius: 'var(--ds-radius-sm)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    color: isDanger ? 'var(--ds-color-error)' : 'inherit',
    opacity: isDisabled ? 0.5 : 1,
    textAlign: 'left' as const,
    transition: `background var(--ds-motion-fast) var(--ds-motion-ease-out)`,
  };
}

/* ---------------------------------------------------------------------------
 * ModernSavedViewsBar
 * ----------------------------------------------------------------------- */

/**
 * Modern engine saved views bar built on DS token-driven inline styles.
 * Renders a scrollable horizontal pill list with drag-and-drop reorder,
 * inline rename, a manually-controlled dropdown menu per pill, and an
 * inline create input. Default views (isDefault) are protected from deletion.
 *
 * @param props - {@link SavedViewsBarProps}
 * @returns A horizontal flex container acting as a pill bar for saved views.
 */
export default function ModernSavedViewsBar(props: SavedViewsBarProps) {
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dragViewId, setDragViewId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [hoveredViewId, setHoveredViewId] = useState<string | null>(null);
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string | null>(null);
  const [hoveredMenuBtn, setHoveredMenuBtn] = useState<string | null>(null);
  const [hoveredCreateBtn, setHoveredCreateBtn] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

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
    [allowRename],
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
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, viewId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (viewId !== dragViewId) {
        setDropTargetId(viewId);
      }
    },
    [dragViewId],
  );

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
    [dragViewId, views, onViewReorder],
  );

  const handleDragEnd = useCallback(() => {
    setDragViewId(null);
    setDropTargetId(null);
  }, []);

  /* -- Loading state -- */
  if (loading) {
    return (
      <div
        className={className ?? ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 40,
          ...style,
        }}
      >
        <svg
          className="loading-spinner"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            animation: 'ds-views-spin 1s linear infinite',
            color: 'var(--ds-color-primary)',
          }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray="60 30"
            strokeLinecap="round"
          />
        </svg>
        <style>{`@keyframes ds-views-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const canCreate = allowCreate && (!maxViews || views.length < maxViews);

  /* -- Bar container -- */
  const barStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 8,
    paddingRight: 8,
    minHeight: 40,
    overflowX: 'auto',
    ...style,
  };

  return (
    <div className={className ?? ''} style={barStyle}>
      {views.map((view) => {
        const isActive = view.id === activeViewId;
        const isEditing = editingViewId === view.id;
        const isDragging = dragViewId === view.id;
        const isDropTarget = dropTargetId === view.id;
        const isMenuOpen = openMenuId === view.id;
        const isHovered = hoveredViewId === view.id;
        const customActions = getMenuActions?.(view) ?? [];
        const hasMenu =
          allowRename || allowDelete || onViewDuplicate || customActions.length > 0;

        /* -- Pill/chip style -- */
        const pillStyle: React.CSSProperties = {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          cursor: 'pointer',
          flexShrink: 0,
          fontSize: 13,
          fontWeight: isActive ? 600 : 400,
          lineHeight: '20px',
          color: isActive ? 'var(--ds-color-primary-foreground, #fff)' : 'var(--ds-color-text)',
          background: isActive
            ? 'var(--ds-color-primary)'
            : isHovered
              ? 'var(--ds-surface-highlight)'
              : 'transparent',
          border: isActive
            ? '1px solid var(--ds-color-primary)'
            : '1px solid var(--ds-color-border)',
          borderRadius: 'var(--ds-radius-full, 9999px)',
          opacity: isDragging ? 0.4 : 1,
          boxShadow: isDropTarget ? 'inset 2px 0 0 var(--ds-color-primary)' : 'none',
          transition: `background var(--ds-motion-fast) var(--ds-motion-ease-out),
                       color var(--ds-motion-fast) var(--ds-motion-ease-out),
                       border-color var(--ds-motion-fast) var(--ds-motion-ease-out),
                       opacity var(--ds-motion-fast) var(--ds-motion-ease-out),
                       box-shadow var(--ds-motion-fast) var(--ds-motion-ease-out)`,
          position: 'relative' as const,
          userSelect: 'none' as const,
        };

        return (
          <div
            key={view.id}
            draggable={!!onViewReorder}
            onDragStart={(e) => handleDragStart(e, view.id)}
            onDragOver={(e) => handleDragOver(e, view.id)}
            onDrop={(e) => handleDrop(e, view.id)}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => setHoveredViewId(view.id)}
            onMouseLeave={() => setHoveredViewId(null)}
            data-testid={`view-tab-${view.id}`}
            style={pillStyle}
            onClick={() => {
              if (!isEditing) onViewSelect(view.id);
            }}
          >
            {/* Drag handle */}
            {onViewReorder && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.4, cursor: 'grab', flexShrink: 0 }}
              >
                <path d="M4 8h16M4 16h16" />
              </svg>
            )}

            {/* View icon */}
            {view.icon}

            {/* Name or rename input */}
            {isEditing ? (
              <input
                type="text"
                style={inlineInputStyle}
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameConfirm();
                  if (e.key === 'Escape') {
                    setEditingViewId(null);
                    setEditingName('');
                  }
                }}
                onBlur={handleRenameConfirm}
                onFocus={inputFocusHandler}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span style={{ whiteSpace: 'nowrap' }}>{view.name}</span>
            )}

            {/* Unsaved changes indicator */}
            {view.config && (view as any).isDirty && (
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isActive
                    ? 'var(--ds-color-primary-foreground, #fff)'
                    : 'var(--ds-color-primary)',
                  flexShrink: 0,
                }}
                title="Unsaved changes"
              />
            )}

            {/* Default star */}
            {view.isDefault && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{
                  color: isActive
                    ? 'var(--ds-color-primary-foreground, #fff)'
                    : 'var(--ds-color-warning)',
                  flexShrink: 0,
                }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}

            {/* Context menu trigger -- ghost icon button */}
            {hasMenu && (
              <div
                style={{ position: 'relative' }}
                ref={isMenuOpen ? menuRef : undefined}
              >
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    padding: 0,
                    border: 'none',
                    background:
                      hoveredMenuBtn === view.id
                        ? isActive
                          ? 'rgba(255,255,255,0.2)'
                          : 'var(--ds-surface-highlight)'
                        : 'transparent',
                    borderRadius: 'var(--ds-radius-sm)',
                    cursor: 'pointer',
                    color: 'inherit',
                    opacity: isHovered || isMenuOpen ? 1 : 0,
                    transition: `opacity var(--ds-motion-fast) var(--ds-motion-ease-out),
                                 background var(--ds-motion-fast) var(--ds-motion-ease-out)`,
                    flexShrink: 0,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(isMenuOpen ? null : view.id);
                  }}
                  onMouseEnter={() => setHoveredMenuBtn(view.id)}
                  onMouseLeave={() => setHoveredMenuBtn(null)}
                  aria-label={`${view.name} options`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="5" r="1" fill="currentColor" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="12" cy="19" r="1" fill="currentColor" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 4,
                      minWidth: 160,
                      background: 'var(--ds-surface-card)',
                      border: '1px solid var(--ds-color-border)',
                      borderRadius: 'var(--ds-radius-md)',
                      boxShadow: 'var(--ds-elevation-3)',
                      padding: 4,
                      zIndex: 50,
                      overflow: 'hidden',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {allowRename && (
                      <button
                        type="button"
                        style={menuItemStyle(
                          hoveredMenuItem === `rename-${view.id}`,
                        )}
                        onMouseEnter={() =>
                          setHoveredMenuItem(`rename-${view.id}`)
                        }
                        onMouseLeave={() => setHoveredMenuItem(null)}
                        onClick={() => handleRenameStart(view)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                        Rename
                      </button>
                    )}
                    {onViewDuplicate && (
                      <button
                        type="button"
                        style={menuItemStyle(
                          hoveredMenuItem === `duplicate-${view.id}`,
                        )}
                        onMouseEnter={() =>
                          setHoveredMenuItem(`duplicate-${view.id}`)
                        }
                        onMouseLeave={() => setHoveredMenuItem(null)}
                        onClick={() => {
                          onViewDuplicate(view.id);
                          setOpenMenuId(null);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        Duplicate
                      </button>
                    )}
                    {customActions.map((action) => (
                      <button
                        key={action.key}
                        type="button"
                        disabled={action.disabled}
                        style={menuItemStyle(
                          hoveredMenuItem === `custom-${action.key}`,
                          action.danger,
                          action.disabled,
                        )}
                        onMouseEnter={() =>
                          setHoveredMenuItem(`custom-${action.key}`)
                        }
                        onMouseLeave={() => setHoveredMenuItem(null)}
                        onClick={() => {
                          action.onClick();
                          setOpenMenuId(null);
                        }}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                    {/* Divider + Delete */}
                    {allowDelete && !view.isDefault && (
                      <>
                        <div
                          style={{
                            height: 1,
                            background: 'var(--ds-color-border)',
                            margin: '4px 0',
                          }}
                        />
                        <button
                          type="button"
                          style={menuItemStyle(
                            hoveredMenuItem === `delete-${view.id}`,
                            true,
                          )}
                          onMouseEnter={() =>
                            setHoveredMenuItem(`delete-${view.id}`)
                          }
                          onMouseLeave={() => setHoveredMenuItem(null)}
                          onClick={() => {
                            onViewDelete(view.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
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

      {/* Create view input / button */}
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
            style={inlineInputStyle}
            placeholder={newViewPlaceholder}
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewViewName('');
              }
            }}
            onBlur={() => {
              if (!newViewName.trim()) setIsCreating(false);
              else handleCreate();
            }}
            onFocus={inputFocusHandler}
            autoFocus
            data-testid="new-view-input"
          />
        </div>
      ) : (
        canCreate && (
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              fontSize: 13,
              fontWeight: 500,
              border: '1px dashed var(--ds-color-border)',
              background: hoveredCreateBtn
                ? 'var(--ds-surface-highlight)'
                : 'transparent',
              borderRadius: 'var(--ds-radius-full, 9999px)',
              cursor: 'pointer',
              color: 'var(--ds-color-text-muted)',
              flexShrink: 0,
              transition: `background var(--ds-motion-fast) var(--ds-motion-ease-out),
                           color var(--ds-motion-fast) var(--ds-motion-ease-out),
                           border-color var(--ds-motion-fast) var(--ds-motion-ease-out)`,
            }}
            onMouseEnter={() => setHoveredCreateBtn(true)}
            onMouseLeave={() => setHoveredCreateBtn(false)}
            onClick={() => setIsCreating(true)}
            data-testid="create-view-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
            {createLabel}
          </button>
        )
      )}
    </div>
  );
}
