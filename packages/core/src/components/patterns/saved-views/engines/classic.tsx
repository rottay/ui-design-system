'use client';

/**
 * SavedViewsBar - Classic Engine (Ant Design)
 */

import React, { useCallback, useRef, useState } from 'react';
import { Button, Dropdown, Input, Spin, Tabs, Typography } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  MoreOutlined,
  StarOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import type { SavedViewsBarProps, SavedView } from '../SavedViews.types';

const { Text } = Typography;

export default function ClassicSavedViewsBar(props: SavedViewsBarProps) {
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
  const [dragViewId, setDragViewId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const inputRef = useRef<any>(null);

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

  const buildMenuItems = useCallback(
    (view: SavedView) => {
      const customActions = getMenuActions?.(view) ?? [];
      const items: any[] = [];

      if (allowRename) {
        items.push({
          key: 'rename',
          icon: <EditOutlined />,
          label: 'Rename',
          onClick: () => handleRenameStart(view),
        });
      }

      if (onViewDuplicate) {
        items.push({
          key: 'duplicate',
          icon: <CopyOutlined />,
          label: 'Duplicate',
          onClick: () => onViewDuplicate(view.id),
        });
      }

      if (customActions.length > 0) {
        if (items.length > 0) {
          items.push({ type: 'divider' as const });
        }
        customActions.forEach((action) => {
          items.push({
            key: action.key,
            icon: action.icon,
            label: action.label,
            disabled: action.disabled,
            danger: action.danger,
            onClick: action.onClick,
          });
        });
      }

      if (allowDelete && !view.isDefault) {
        if (items.length > 0) {
          items.push({ type: 'divider' as const });
        }
        items.push({
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Delete',
          danger: true,
          onClick: () => onViewDelete(view.id),
        });
      }

      return items;
    },
    [allowRename, allowDelete, onViewDuplicate, onViewDelete, getMenuActions, handleRenameStart]
  );

  if (loading) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
          ...style,
        }}
      >
        <Spin size="small" />
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
        gap: 4,
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
              gap: 4,
              padding: '6px 12px',
              borderBottom: isActive
                ? '2px solid var(--ds-color-primary, #1677ff)'
                : '2px solid transparent',
              cursor: 'pointer',
              opacity: isDragging ? 0.4 : 1,
              borderLeft: isDropTarget
                ? '2px solid var(--ds-color-primary, #1677ff)'
                : '2px solid transparent',
              transition: 'opacity 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onClick={() => {
              if (!isEditing) onViewSelect(view.id);
            }}
          >
            {onViewReorder && (
              <HolderOutlined
                style={{
                  fontSize: 10,
                  color: 'var(--ds-color-text-muted)',
                  cursor: 'grab',
                }}
              />
            )}
            {view.icon}
            {isEditing ? (
              <Input
                ref={inputRef}
                size="small"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onPressEnter={handleRenameConfirm}
                onBlur={handleRenameConfirm}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 120 }}
                autoFocus
              />
            ) : (
              <Text
                strong={isActive}
                style={{
                  fontSize: 13,
                  color: isActive
                    ? 'var(--ds-color-primary, #1677ff)'
                    : 'var(--ds-color-text, #1a1a1a)',
                }}
              >
                {view.name}
              </Text>
            )}
            {view.isDefault && (
              <StarOutlined
                style={{
                  fontSize: 10,
                  color: 'var(--ds-color-warning, #faad14)',
                }}
              />
            )}
            {(allowRename || allowDelete || onViewDuplicate || getMenuActions) && (
              <Dropdown
                menu={{ items: buildMenuItems(view) }}
                trigger={['click']}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 20, height: 20, minWidth: 20 }}
                  aria-label={`${view.name} options`}
                />
              </Dropdown>
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
          <Input
            size="small"
            placeholder={newViewPlaceholder}
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            onPressEnter={handleCreate}
            onBlur={() => {
              if (!newViewName.trim()) setIsCreating(false);
              else handleCreate();
            }}
            style={{ width: 140 }}
            autoFocus
            data-testid="new-view-input"
          />
        </div>
      ) : (
        canCreate && (
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setIsCreating(true)}
            style={{ flexShrink: 0 }}
            data-testid="create-view-button"
          >
            {createLabel}
          </Button>
        )
      )}
    </div>
  );
}
