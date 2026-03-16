'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the SavedViews bar pattern.
 * Renders a horizontal tab strip using DaisyUI utility classes with drag-and-drop
 * reorder, inline rename, a custom dropdown context menu (rename/duplicate/delete),
 * and a "Create view" button with inline text input. Manages its own menu
 * open/close state via `openMenuId` rather than relying on DaisyUI's native
 * dropdown behavior, allowing programmatic close-on-action.
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

import React, { useCallback, useRef, useState } from 'react';
import type { SavedViewsBarProps, SavedView } from '../SavedViews.types';

/**
 * Modern engine saved views bar built on DaisyUI/Tailwind.
 * Renders a scrollable tab strip with drag-and-drop reorder, inline rename,
 * a manually-controlled dropdown menu per tab, and an inline create input.
 * Default views (isDefault) are protected from deletion.
 *
 * @param props - {@link SavedViewsBarProps}
 * @returns A horizontal flex container acting as a tab bar for saved views.
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
  // Tracks which view's context menu is open; only one can be open at a time.
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // Drag-and-drop state for visual feedback during tab reorder.
  const [dragViewId, setDragViewId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

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
        className={`flex items-center justify-center min-h-[40px] ${className ?? ''}`}
        style={style}
      >
        <span className="loading loading-spinner loading-sm" />
      </div>
    );
  }

  // Disable creation when maxViews cap is reached (e.g. plan-based limits).
  const canCreate = allowCreate && (!maxViews || views.length < maxViews);

  return (
    <div
      className={`flex items-center gap-1 border-b border-base-300 px-2 min-h-[40px] overflow-x-auto ${className ?? ''}`}
      style={style}
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
            draggable={!!onViewReorder}
            onDragStart={(e) => handleDragStart(e, view.id)}
            onDragOver={(e) => handleDragOver(e, view.id)}
            onDrop={(e) => handleDrop(e, view.id)}
            onDragEnd={handleDragEnd}
            data-testid={`view-tab-${view.id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer flex-shrink-0 transition-all text-sm border-b-2 ${
              isActive
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-base-content/70 hover:text-base-content'
            } ${isDragging ? 'opacity-40' : 'opacity-100'} ${
              isDropTarget ? 'border-l-2 border-l-primary' : ''
            }`}
            onClick={() => {
              if (!isEditing) onViewSelect(view.id);
            }}
          >
            {onViewReorder && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 opacity-40 cursor-grab"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            )}
            {view.icon}
            {isEditing ? (
              <input
                type="text"
                className="input input-bordered input-xs w-28"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameConfirm();
                }}
                onBlur={handleRenameConfirm}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span>{view.name}</span>
            )}
            {view.isDefault && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-warning"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
            {hasMenu && (
              <div className="dropdown dropdown-bottom dropdown-end">
                <button
                  tabIndex={0}
                  className="btn btn-ghost btn-xs px-0.5 min-h-0 h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(isMenuOpen ? null : view.id);
                  }}
                  aria-label={`${view.name} options`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01"
                    />
                  </svg>
                </button>
                {isMenuOpen && (
                  <ul
                    className="dropdown-content menu p-1 shadow-lg bg-base-100 rounded-lg w-40 z-50"
                    tabIndex={0}
                  >
                    {allowRename && (
                      <li>
                        <button onClick={() => handleRenameStart(view)}>
                          Rename
                        </button>
                      </li>
                    )}
                    {onViewDuplicate && (
                      <li>
                        <button
                          onClick={() => {
                            onViewDuplicate(view.id);
                            setOpenMenuId(null);
                          }}
                        >
                          Duplicate
                        </button>
                      </li>
                    )}
                    {customActions.map((action) => (
                      <li key={action.key}>
                        <button
                          className={action.danger ? 'text-error' : ''}
                          disabled={action.disabled}
                          onClick={() => {
                            action.onClick();
                            setOpenMenuId(null);
                          }}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      </li>
                    ))}
                    {/* Default views are protected from deletion to prevent
                        accidental removal of the system-provided baseline. */}
                    {allowDelete && !view.isDefault && (
                      <>
                        <div className="divider my-0" />
                        <li>
                          <button
                            className="text-error"
                            onClick={() => {
                              onViewDelete(view.id);
                              setOpenMenuId(null);
                            }}
                          >
                            Delete
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}

      {isCreating ? (
        <div className="flex items-center gap-1 py-1 flex-shrink-0">
          <input
            type="text"
            className="input input-bordered input-xs w-36"
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
          />
        </div>
      ) : (
        canCreate && (
          <button
            className="btn btn-ghost btn-sm gap-1 flex-shrink-0"
            onClick={() => setIsCreating(true)}
            data-testid="create-view-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {createLabel}
          </button>
        )
      )}
    </div>
  );
}
