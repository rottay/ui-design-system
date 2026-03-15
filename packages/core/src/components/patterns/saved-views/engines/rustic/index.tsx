'use client';

/**
 * SavedViewsBar - Rustic Engine (Inline styles with CSS variables)
 */

import React, { useCallback, useRef, useState } from 'react';
import type { SavedViewsBarProps, SavedView } from '../../types';

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

  const [isCreating, setIsCreating] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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
        className={className}
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

  const canCreate = allowCreate && (!maxViews || views.length < maxViews);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderBottom: '1px solid var(--ds-color-border, #e0e0e0)',
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
                ? '2px solid var(--ds-color-primary, #3b82f6)'
                : '2px solid transparent',
              cursor: 'pointer',
              opacity: isDragging ? 0.4 : 1,
              borderLeft: isDropTarget
                ? '2px solid var(--ds-color-primary, #3b82f6)'
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
                style={{
                  fontSize: 10,
                  color: 'var(--ds-color-text-muted, #999)',
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
                  border: '1px solid var(--ds-color-border, #d0d0d0)',
                  borderRadius: 3,
                  outline: 'none',
                  background: 'var(--ds-color-background, #fff)',
                  color: 'var(--ds-color-text, #1a1a1a)',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? 'var(--ds-color-primary, #3b82f6)'
                    : 'var(--ds-color-text, #1a1a1a)',
                }}
              >
                {view.name}
              </span>
            )}
            {view.isDefault && (
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--ds-color-warning, #f59e0b)',
                  lineHeight: 1,
                }}
              >
                &#9733;
              </span>
            )}
            {hasMenu && (
              <div style={{ position: 'relative' }}>
                <button
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
                    color: 'var(--ds-color-text-muted, #999)',
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
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      zIndex: 50,
                      minWidth: 140,
                      background: 'var(--ds-color-surface, #fff)',
                      border: '1px solid var(--ds-color-border, #e0e0e0)',
                      borderRadius: 6,
                      boxShadow: '0 4px 12px var(--ds-color-shadow, rgba(0,0,0,0.1))',
                      padding: 4,
                    }}
                  >
                    {allowRename && (
                      <button
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
                          color: 'var(--ds-color-text, #1a1a1a)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            'var(--ds-color-bg-secondary, #f5f5f5)';
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
                          color: 'var(--ds-color-text, #1a1a1a)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            'var(--ds-color-bg-secondary, #f5f5f5)';
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
                            ? 'var(--ds-color-danger, #ef4444)'
                            : 'var(--ds-color-text, #1a1a1a)',
                          opacity: action.disabled ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!action.disabled) {
                            (e.currentTarget as HTMLButtonElement).style.background =
                              'var(--ds-color-bg-secondary, #f5f5f5)';
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
                    {allowDelete && !view.isDefault && (
                      <>
                        <div
                          style={{
                            height: 1,
                            background: 'var(--ds-color-border, #e0e0e0)',
                            margin: '4px 0',
                          }}
                        />
                        <button
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
                            color: 'var(--ds-color-danger, #ef4444)',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background =
                              'var(--ds-color-bg-secondary, #f5f5f5)';
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
              border: '1px solid var(--ds-color-border, #d0d0d0)',
              borderRadius: 4,
              outline: 'none',
              background: 'var(--ds-color-background, #fff)',
              color: 'var(--ds-color-text, #1a1a1a)',
            }}
          />
        </div>
      ) : (
        canCreate && (
          <button
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
              color: 'var(--ds-color-text-muted, #888)',
              flexShrink: 0,
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'var(--ds-color-bg-secondary, #f5f5f5)';
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
