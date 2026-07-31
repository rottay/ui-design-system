'use client';

/**
 * @fileoverview Modern engine for the SavedViews bar pattern (Lote 2 rewrite).
 *
 * @remarks
 * COMPOSITION LAW (Lote 2): a pattern COMPOSES primitives, it never
 * recreates them. Every former raw control is now a public DS primitive:
 * - the view-select control, the menu trigger and the create button are the
 *   Button primitive (`engine="modern"`, caller `data-part` wins the root
 *   anatomy hook per P-79, so the pattern skin owns their paint);
 * - the inline rename input and the create input are the Input primitive
 *   (`variant="unstyled"` — behavior from the primitive, geometry and paint
 *   from the pattern skin);
 * - the per-pill management menu is the Dropdown primitive (portal surface,
 *   roving keyboard contract, outside-click/Escape close, RTL-aware
 *   placement following the Tabs engine's precedent) — the hand-rolled
 *   absolute panel, its outside-click listener and the `menu-panel` /
 *   `menu-item` / `menu-divider` parts are retired in favor of the
 *   Dropdown's own anatomy and `dropdown.css` paint.
 *
 * The pill shell stays a plain layout element (drag source + testid hook);
 * the select action moved INTO a real Button inside it, so no interactive
 * element nests inside another (the Collapse K3-C header-row remediation
 * pattern). All geometry, paint and the hover-reveal of the menu trigger
 * live in `modern/skin/saved-views.css`; the engine stamps anatomy and
 * state only.
 *
 * Copy contract: `useOptionalTranslation('components')` with the documented
 * English floor via `tOr` (page-shell idiom) — byte-identical English when
 * no provider is mounted. Consumer-facing labels (`createLabel`,
 * `newViewPlaceholder`) remain props, unchanged.
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
import type { SavedViewsBarProps, SavedView } from '../../contracts';
import type { DropdownMenuItem } from '../../../../../primitives/overlay/Dropdown/contracts';
import Dropdown from '../../../../../primitives/overlay/Dropdown/engines/modern';
import Button from '../../../../../primitives/inputs/Button/engines/modern';
import Input from '../../../../../primitives/inputs/Input/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import { ActionEditIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-edit';
import { ActionCopyIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-copy';
import { ActionDeleteIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-delete';
import { ActionAddIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-add';
import { ActionReorderIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-reorder';
import { NavigationMoreIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-more';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/**
 * Modern engine saved views bar: a scrollable horizontal strip of pills
 * composed entirely from DS primitives (see the module docblock).
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

  /* ---- localized copy (components catalog, English floor) ---- */
  const translation = useOptionalTranslation('components');
  const renameLabel = translation?.tOr('savedViews.rename', 'Rename') ?? 'Rename';
  const duplicateLabel = translation?.tOr('savedViews.duplicate', 'Duplicate') ?? 'Duplicate';
  const deleteLabel = translation?.tOr('savedViews.delete', 'Delete') ?? 'Delete';
  const optionsLabel = translation?.tOr('savedViews.options', 'options') ?? 'options';
  const unsavedChangesTitle =
    translation?.tOr('savedViews.unsavedChanges', 'Unsaved changes') ?? 'Unsaved changes';

  // --- Local UI state ---
  const [isCreating, setIsCreating] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dragViewId, setDragViewId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  /* RTL probe for the Dropdown placement mirror (Tabs engine precedent):
     the nearest explicit `dir` wins; otherwise the document direction. */
  const rootRef = useRef<HTMLDivElement>(null);
  const [isRtl, setIsRtl] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const scoped = el.closest('[dir]');
    setIsRtl(scoped ? scoped.getAttribute('dir') === 'rtl' : document.documentElement.dir === 'rtl');
  }, []);

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

  /* -- Loading state (geometry lives in the skin, keyed on data-loading) -- */
  if (loading) {
    return (
      <div
        ref={rootRef}
        data-part="root"
        className={`ds-pattern-saved-views ds-engine-modern ${className ?? ''}`}
        data-loading="true"
        style={style}
      >
        <ModernSpinner size="sm" data-part="spinner" />
      </div>
    );
  }

  const canCreate = allowCreate && (!maxViews || views.length < maxViews);

  return (
    <div
      ref={rootRef}
      data-part="root"
      className={`ds-pattern-saved-views ds-engine-modern ${className ?? ''}`}
      style={style}
    >
      {views.map((view) => {
        const isActive = view.id === activeViewId;
        const isEditing = editingViewId === view.id;
        const isDragging = dragViewId === view.id;
        const isDropTarget = dropTargetId === view.id;
        const isMenuOpen = openMenuId === view.id;
        const customActions = getMenuActions?.(view) ?? [];
        const hasMenu =
          allowRename || allowDelete || onViewDuplicate || customActions.length > 0;

        /* The management menu as Dropdown items; per-item onClick fires
           before the primitive closes the surface (controlled open). */
        const menuItems: DropdownMenuItem[] = [];
        if (allowRename) {
          menuItems.push({
            key: 'rename',
            label: renameLabel,
            icon: <ActionEditIcon decorative size={14} />,
            onClick: () => handleRenameStart(view),
          });
        }
        if (onViewDuplicate) {
          menuItems.push({
            key: 'duplicate',
            label: duplicateLabel,
            icon: <ActionCopyIcon decorative size={14} />,
            onClick: () => onViewDuplicate(view.id),
          });
        }
        for (const action of customActions) {
          menuItems.push({
            key: action.key,
            label: action.label,
            icon: action.icon,
            danger: action.danger,
            disabled: action.disabled,
            onClick: action.onClick,
          });
        }
        if (allowDelete && !view.isDefault) {
          menuItems.push({ key: 'delete-divider', type: 'divider', label: '' });
          menuItems.push({
            key: 'delete',
            label: deleteLabel,
            icon: <ActionDeleteIcon decorative size={14} />,
            danger: true,
            onClick: () => onViewDelete(view.id),
          });
        }

        return (
          <div
            key={view.id}
            data-part="pill"
            className="ds-saved-views__pill"
            data-active={isActive}
            data-dragging={isDragging}
            data-drop-target={isDropTarget}
            draggable={!!onViewReorder}
            onDragStart={(e) => handleDragStart(e, view.id)}
            onDragOver={(e) => handleDragOver(e, view.id)}
            onDrop={(e) => handleDrop(e, view.id)}
            onDragEnd={handleDragEnd}
            data-testid={`view-tab-${view.id}`}
          >
            {/* Drag grip (decorative chrome; the pill shell is the drag source) */}
            {onViewReorder && (
              <span data-part="drag-handle" className="ds-saved-views__drag-handle" aria-hidden="true">
                <ActionReorderIcon decorative size={12} />
              </span>
            )}

            {/* View icon slot (consumer-provided) */}
            {view.icon}

            {/* Name: a real Button select control, or the rename Input while editing */}
            {isEditing ? (
              <Input
                variant="unstyled"
                size="sm"
                data-part="rename-input"
                className="ds-saved-views__input"
                value={editingName}
                onChange={(value) => setEditingName(value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameConfirm();
                  if (e.key === 'Escape') {
                    setEditingViewId(null);
                    setEditingName('');
                  }
                }}
                onBlur={handleRenameConfirm}
                autoFocus
                aria-label={renameLabel}
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                data-part="pill-select"
                className="ds-saved-views__pill-select"
                data-active={isActive}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onViewSelect(view.id)}
              >
                {view.name}
              </Button>
            )}

            {/* Unsaved changes indicator */}
            {view.config && (view as any).isDirty && (
              <span
                data-part="unsaved-dot"
                className="ds-saved-views__unsaved-dot"
                data-dirty={true}
                data-active={isActive}
                title={unsavedChangesTitle}
              />
            )}

            {/* Default star (decorative; no semantic role exists for it yet) */}
            {view.isDefault && (
              <svg
                data-part="default-star"
                className="ds-saved-views__default-star"
                data-default={true}
                data-active={isActive}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}

            {/* Management menu: the Dropdown primitive owns the surface, the
                keyboard contract and dismissal; the trigger is a Button. */}
            {hasMenu && (
              <Dropdown
                trigger={['click']}
                placement={isRtl ? 'bottomLeft' : 'bottomRight'}
                open={isMenuOpen}
                onOpenChange={(open) => setOpenMenuId(open ? view.id : null)}
                menu={{ items: menuItems }}
              >
                <Button
                  variant="ghost"
                  size="xs"
                  data-part="menu-trigger"
                  className="ds-saved-views__menu-trigger"
                  data-open={isMenuOpen}
                  data-active={isActive}
                  aria-label={`${view.name} ${optionsLabel}`}
                  icon={<NavigationMoreIcon decorative size={14} />}
                />
              </Dropdown>
            )}
          </div>
        );
      })}

      {/* Create view input / button */}
      {isCreating ? (
        <div data-part="create-form" className="ds-saved-views__create-form">
          <Input
            variant="unstyled"
            size="sm"
            data-part="create-input"
            className="ds-saved-views__create-input"
            placeholder={newViewPlaceholder}
            value={newViewName}
            onChange={(value) => setNewViewName(value)}
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
            autoFocus
            aria-label={createLabel}
            data-testid="new-view-input"
          />
        </div>
      ) : (
        canCreate && (
          <Button
            variant="dashed"
            size="sm"
            data-part="create-button"
            className="ds-saved-views__create-button"
            icon={<ActionAddIcon decorative size={14} />}
            onClick={() => setIsCreating(true)}
            data-testid="create-view-button"
          >
            {createLabel}
          </Button>
        )
      )}
    </div>
  );
}
