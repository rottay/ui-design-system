/**
 * NavigationEditor - Standard Preset
 * Basic navigation editor with tree view and item editing
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MenuOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Tree, Input, Button, Card, Space, Empty, Spin, Tooltip, Tag, Modal, Form, Select, Switch, Divider } from 'antd';
import type { TreeDataNode } from 'antd';

import type { NavigationEditorProps, MenuItem, MenuItemFormData } from '../../core';
import { NAVIGATION_EDITOR_DEFAULTS, ICON_OPTIONS, BADGE_COLORS } from '../../core';

// Extended tree data node with menu item properties
interface MenuTreeNode extends TreeDataNode {
  menuItem: MenuItem;
}

// Build tree data from flat items
function buildTreeData(items: MenuItem[], parentId: string | null = null): MenuTreeNode[] {
  return items
    .filter(item => item.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      key: item.id,
      title: item.label,
      menuItem: item,
      children: buildTreeData(items, item.id),
      isLeaf: !items.some(child => child.parentId === item.id),
    }));
}

// Menu Item Form Component
function MenuItemForm({
  item,
  roles = [],
  permissions = [],
  isCreating = false,
  onSubmit,
  onCancel,
  loading = false,
}: {
  item?: MenuItem | null;
  roles?: { id: string; name: string; color?: string }[];
  permissions?: { id: string; name: string }[];
  isCreating?: boolean;
  onSubmit: (data: MenuItemFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch {
      // Validation failed
    }
  };

  React.useEffect(() => {
    if (item) {
      form.setFieldsValue({
        key: item.key,
        label: item.label,
        icon: item.icon,
        path: item.path,
        visible: item.visible,
        disabled: item.disabled,
        badge: item.badge,
        badgeColor: item.badgeColor,
        target: item.target || '_self',
        description: item.description,
        roles: item.roles || [],
        permissions: item.permissions || [],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ visible: true, disabled: false, target: '_self' });
    }
  }, [item, form]);

  return (
    <Card
      title={isCreating ? 'Create Menu Item' : 'Edit Menu Item'}
      extra={<Button type="text" icon={<CloseOutlined />} onClick={onCancel} />}
      size="small"
    >
      <Form form={form} layout="vertical" size="small">
        <Space style={{ width: '100%' }} direction="vertical" size={12}>
          <Space style={{ width: '100%' }}>
            <Form.Item name="key" label="Key" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="unique-key" />
            </Form.Item>
            <Form.Item name="label" label="Label" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="Menu Label" />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }}>
            <Form.Item name="icon" label="Icon" style={{ flex: 1, marginBottom: 0 }}>
              <Select
                placeholder="Select icon"
                allowClear
                options={ICON_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
              />
            </Form.Item>
            <Form.Item name="path" label="Path" style={{ flex: 2, marginBottom: 0 }}>
              <Input placeholder="/dashboard/example" />
            </Form.Item>
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          <Space>
            <Form.Item name="visible" label="Visible" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
            <Form.Item name="disabled" label="Disabled" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
            <Form.Item name="target" label="Target" style={{ marginBottom: 0 }}>
              <Select style={{ width: 100 }} options={[{ value: '_self', label: 'Same Tab' }, { value: '_blank', label: 'New Tab' }]} />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }}>
            <Form.Item name="badge" label="Badge" style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="New" />
            </Form.Item>
            <Form.Item name="badgeColor" label="Badge Color" style={{ flex: 1, marginBottom: 0 }}>
              <Select placeholder="Color" allowClear options={BADGE_COLORS} />
            </Form.Item>
          </Space>

          {roles.length > 0 && (
            <Form.Item name="roles" label="Visible to Roles" style={{ marginBottom: 0 }}>
              <Select
                mode="multiple"
                placeholder="All roles (leave empty)"
                options={roles.map(r => ({ value: r.id, label: <Tag color={r.color}>{r.name}</Tag> }))}
              />
            </Form.Item>
          )}

          {permissions.length > 0 && (
            <Form.Item name="permissions" label="Required Permissions" style={{ marginBottom: 0 }}>
              <Select
                mode="multiple"
                placeholder="No permissions required"
                options={permissions.map(p => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>
          )}

          <Form.Item name="description" label="Description" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={2} placeholder="Optional description..." />
          </Form.Item>

          <Divider style={{ margin: '8px 0' }} />

          <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={loading}>
              {isCreating ? 'Create' : 'Save'}
            </Button>
          </Space>
        </Space>
      </Form>
    </Card>
  );
}

export function StandardNavigationEditor({
  items = [],
  roles = [],
  permissions = [],
  selectedItemId,
  onItemsChange,
  onItemSelect,
  onItemCreate,
  onItemUpdate,
  onItemDelete,
  onItemMove,
  maxDepth = NAVIGATION_EDITOR_DEFAULTS.maxDepth,
  enableDragDrop = NAVIGATION_EDITOR_DEFAULTS.enableDragDrop,
  enableSearch = NAVIGATION_EDITOR_DEFAULTS.enableSearch,
  loading = false,
  header,
  footer,
  emptyState,
}: NavigationEditorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.label.toLowerCase().includes(query) ||
      item.key.toLowerCase().includes(query) ||
      item.path?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Build tree data
  const treeData = useMemo(() => buildTreeData(filteredItems), [filteredItems]);

  // Get selected item
  const selectedItem = useMemo(
    () => items.find(item => item.id === selectedItemId) || null,
    [items, selectedItemId]
  );

  // Handlers
  const handleSelect = useCallback((selectedKeys: React.Key[]) => {
    const id = selectedKeys[0] as string;
    const item = items.find(i => i.id === id) || null;
    onItemSelect?.(item);
    setIsCreating(false);
  }, [items, onItemSelect]);

  const handleDrop = useCallback(async (info: { node: TreeDataNode; dragNode: TreeDataNode; dropPosition: number; dropToGap: boolean }) => {
    if (!enableDragDrop || !onItemMove) return;

    const dragId = info.dragNode.key as string;
    const dropId = info.node.key as string;
    const dropPos = info.dropPosition;

    // Calculate new parent and index
    const newParentId = info.dropToGap ? (items.find(i => i.id === dropId)?.parentId || null) : dropId;

    // Get siblings and calculate new index
    const siblings = items.filter(i => i.parentId === newParentId).sort((a, b) => a.order - b.order);
    let newIndex = dropPos;
    if (dropPos < 0) newIndex = 0;
    if (dropPos > siblings.length) newIndex = siblings.length;

    await onItemMove(dragId, newParentId, newIndex);
  }, [enableDragDrop, items, onItemMove]);

  const handleCreate = useCallback(async (data: MenuItemFormData) => {
    if (!onItemCreate) return;
    await onItemCreate(data, createParentId);
    setIsCreating(false);
    setCreateParentId(null);
  }, [onItemCreate, createParentId]);

  const handleUpdate = useCallback(async (data: MenuItemFormData) => {
    if (!onItemUpdate || !selectedItemId) return;
    await onItemUpdate(selectedItemId, data);
  }, [onItemUpdate, selectedItemId]);

  const handleDelete = useCallback(async () => {
    if (!onItemDelete || !deleteConfirmId) return;
    await onItemDelete(deleteConfirmId);
    setDeleteConfirmId(null);
    if (selectedItemId === deleteConfirmId) {
      onItemSelect?.(null);
    }
  }, [onItemDelete, deleteConfirmId, selectedItemId, onItemSelect]);

  const startCreate = useCallback((parentId: string | null = null) => {
    setIsCreating(true);
    setCreateParentId(parentId);
    onItemSelect?.(null);
  }, [onItemSelect]);

  if (loading) {
    return (
      <Card>
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 500 }}>
      {/* Left Panel - Tree */}
      <Card
        style={{ flex: 1, minWidth: 300 }}
        title={
          <Space>
            <MenuOutlined />
            <span>Menu Structure</span>
          </Space>
        }
        extra={
          <Tooltip title="Add root item">
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => startCreate(null)}>
              Add
            </Button>
          </Tooltip>
        }
      >
        {header}

        {enableSearch && (
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            allowClear
            style={{ marginBottom: 12 }}
          />
        )}

        {treeData.length === 0 ? (
          emptyState || <Empty description="No menu items" />
        ) : (
          <Tree
            treeData={treeData}
            selectedKeys={selectedItemId ? [selectedItemId] : []}
            onSelect={handleSelect}
            draggable={enableDragDrop}
            onDrop={handleDrop}
            blockNode
            showLine={{ showLeafIcon: false }}
            titleRender={(node) => {
              const menuNode = node as MenuTreeNode;
              const item = menuNode.menuItem;
              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
                  <Space size={4}>
                    <span style={{ opacity: item.visible ? 1 : 0.5 }}>
                      {item.visible ? <EyeOutlined style={{ fontSize: 12, color: 'var(--color-success-500, #52c41a)' }} /> : <EyeInvisibleOutlined style={{ fontSize: 12, color: 'var(--color-neutral-400, #999)' }} />}
                    </span>
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                    {item.badge && <Tag color={item.badgeColor || 'blue'} style={{ fontSize: 10 }}>{item.badge}</Tag>}
                    {item.disabled && <Tag color="default" style={{ fontSize: 10 }}>Disabled</Tag>}
                  </Space>
                  <Space size={4} style={{ opacity: 0.7 }}>
                    <Tooltip title="Add child">
                      <Button type="text" size="small" icon={<PlusOutlined />} onClick={e => { e.stopPropagation(); startCreate(node.key as string); }} />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={e => { e.stopPropagation(); setDeleteConfirmId(node.key as string); }} />
                    </Tooltip>
                  </Space>
                </div>
              );
            }}
          />
        )}

        {footer}
      </Card>

      {/* Right Panel - Form */}
      <div style={{ flex: 1, minWidth: 350 }}>
        {(isCreating || selectedItem) ? (
          <MenuItemForm
            item={isCreating ? null : selectedItem}
            roles={roles}
            permissions={permissions}
            isCreating={isCreating}
            onSubmit={isCreating ? handleCreate : handleUpdate}
            onCancel={() => { setIsCreating(false); onItemSelect?.(null); }}
            loading={loading}
          />
        ) : (
          <Card>
            <Empty description="Select an item to edit or create a new one" />
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <Modal
        title="Delete Menu Item"
        open={!!deleteConfirmId}
        onOk={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this menu item? This action cannot be undone.</p>
        <p style={{ color: 'var(--color-error-500, #ff4d4f)' }}>All child items will also be deleted.</p>
      </Modal>
    </div>
  );
}

StandardNavigationEditor.displayName = 'StandardNavigationEditor';
