/**
 * NavigationEditor - Advanced Preset
 * Full-featured navigation editor with tabs for Structure, Roles, Policies, and Preview
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
  TeamOutlined,
  LockOutlined,
  DesktopOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  Tree, Input, Button, Card, Space, Empty, Spin, Tooltip, Tag, Modal, Form, Select, Switch,
  Divider, Tabs, Table, Alert, Badge, Typography, Menu as AntMenu,
} from 'antd';
import type { TreeDataNode, TabsProps } from 'antd';

import type { NavigationEditorProps, MenuItem, MenuItemFormData, EditorTab, RoutePolicy, Role } from '../../core';
import { NAVIGATION_EDITOR_DEFAULTS, ICON_OPTIONS, BADGE_COLORS } from '../../core';

const { Text, Title } = Typography;

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

// Filter menu items by role
function filterByRole(items: MenuItem[], roleId: string | null): MenuItem[] {
  if (!roleId) return items;
  return items.filter(item => !item.roles?.length || item.roles.includes(roleId));
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
  roles?: Role[];
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
      title={<Space><EditOutlined />{isCreating ? 'Create Menu Item' : 'Edit Menu Item'}</Space>}
      extra={<Button type="text" icon={<CloseOutlined />} onClick={onCancel} size="small" />}
      size="small"
      style={{ height: '100%' }}
    >
      <Form form={form} layout="vertical" size="small">
        <Space style={{ width: '100%' }} direction="vertical" size={12}>
          <Space style={{ width: '100%' }}>
            <Form.Item name="key" label="Key" rules={[{ required: true, message: 'Key is required' }]} style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="unique-key" />
            </Form.Item>
            <Form.Item name="label" label="Label" rules={[{ required: true, message: 'Label is required' }]} style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="Menu Label" />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }}>
            <Form.Item name="icon" label="Icon" style={{ flex: 1, marginBottom: 0 }}>
              <Select
                placeholder="Select icon"
                allowClear
                showSearch
                options={ICON_OPTIONS.map(opt => ({ value: opt.value, label: `${opt.label}` }))}
              />
            </Form.Item>
            <Form.Item name="path" label="Path" style={{ flex: 2, marginBottom: 0 }}>
              <Input placeholder="/dashboard/example" />
            </Form.Item>
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          <Space size={24}>
            <Form.Item name="visible" label="Visible" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch checkedChildren={<EyeOutlined />} unCheckedChildren={<EyeInvisibleOutlined />} />
            </Form.Item>
            <Form.Item name="disabled" label="Disabled" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
            <Form.Item name="target" label="Target" style={{ marginBottom: 0 }}>
              <Select style={{ width: 110 }} options={[{ value: '_self', label: 'Same Tab' }, { value: '_blank', label: 'New Tab' }]} />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }}>
            <Form.Item name="badge" label="Badge Text" style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="New" />
            </Form.Item>
            <Form.Item name="badgeColor" label="Badge Color" style={{ flex: 1, marginBottom: 0 }}>
              <Select placeholder="Color" allowClear options={BADGE_COLORS} />
            </Form.Item>
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          {roles.length > 0 && (
            <Form.Item name="roles" label="Visible to Roles" style={{ marginBottom: 8 }} extra="Leave empty to show to all roles">
              <Select
                mode="multiple"
                placeholder="All roles"
                options={roles.map(r => ({
                  value: r.id,
                  label: (
                    <Space>
                      <Tag color={r.color || 'blue'}>{r.name}</Tag>
                      {r.isSystem && <Text type="secondary" style={{ fontSize: 11 }}>System</Text>}
                    </Space>
                  ),
                }))}
              />
            </Form.Item>
          )}

          {permissions.length > 0 && (
            <Form.Item name="permissions" label="Required Permissions" style={{ marginBottom: 8 }}>
              <Select
                mode="multiple"
                placeholder="No permissions required"
                options={permissions.map(p => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>
          )}

          <Form.Item name="description" label="Description" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={2} placeholder="Optional description for this menu item..." />
          </Form.Item>

          <Divider style={{ margin: '8px 0' }} />

          <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={loading}>
              {isCreating ? 'Create' : 'Save Changes'}
            </Button>
          </Space>
        </Space>
      </Form>
    </Card>
  );
}

// Role Assignment Panel
function RoleAssignmentPanel({
  items,
  roles,
  onItemUpdate,
}: {
  items: MenuItem[];
  roles: Role[];
  onItemUpdate?: (id: string, data: Partial<MenuItemFormData>) => Promise<void>;
}) {
  const columns = [
    {
      title: 'Menu Item',
      dataIndex: 'label',
      key: 'label',
      render: (_: string, record: MenuItem) => (
        <Space>
          <Text strong>{record.label}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>({record.key})</Text>
        </Space>
      ),
    },
    ...roles.map(role => ({
      title: <Tag color={role.color || 'blue'}>{role.name}</Tag>,
      key: role.id,
      width: 100,
      render: (_: unknown, record: MenuItem) => {
        const hasRole = !record.roles?.length || record.roles.includes(role.id);
        return (
          <Switch
            size="small"
            checked={hasRole}
            onChange={async (checked) => {
              if (!onItemUpdate) return;
              const currentRoles = record.roles || [];
              const newRoles = checked
                ? currentRoles.filter(r => r !== role.id) // Remove restriction = add to visible
                : [...currentRoles, role.id]; // Add restriction
              // If all roles are included, clear the array (visible to all)
              const finalRoles = newRoles.length === roles.length ? [] : newRoles;
              await onItemUpdate(record.id, { roles: finalRoles });
            }}
          />
        );
      },
    })),
  ];

  return (
    <Card title={<Space><TeamOutlined />Role Visibility Matrix</Space>} size="small">
      <Alert
        message="Role-based visibility"
        description="Toggle which roles can see each menu item. Items with no role restrictions are visible to everyone."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
}

// Route Policies Panel
function RoutePoliciesPanel({
  policies = [],
  roles = [],
  permissions = [],
  onPolicyCreate,
  onPolicyUpdate,
  onPolicyDelete,
}: {
  policies?: RoutePolicy[];
  roles?: Role[];
  permissions?: { id: string; name: string }[];
  onPolicyCreate?: (policy: Omit<RoutePolicy, 'id'>) => Promise<void>;
  onPolicyUpdate?: (id: string, policy: Partial<RoutePolicy>) => Promise<void>;
  onPolicyDelete?: (id: string) => Promise<void>;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await onPolicyCreate?.({
        pattern: values.pattern,
        roles: values.roles || [],
        permissions: values.permissions || [],
        redirectTo: values.redirectTo,
        showInMenu: values.showInMenu ?? true,
      });
      form.resetFields();
      setIsCreating(false);
    } catch {
      // Validation failed
    }
  };

  const columns = [
    {
      title: 'Route Pattern',
      dataIndex: 'pattern',
      key: 'pattern',
      render: (pattern: string) => <Text code>{pattern}</Text>,
    },
    {
      title: 'Allowed Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roleIds: string[]) => (
        <Space wrap>
          {roleIds.length === 0 ? (
            <Text type="secondary">All roles</Text>
          ) : (
            roleIds.map(id => {
              const role = roles.find(r => r.id === id);
              return role ? <Tag key={id} color={role.color}>{role.name}</Tag> : null;
            })
          )}
        </Space>
      ),
    },
    {
      title: 'Redirect',
      dataIndex: 'redirectTo',
      key: 'redirectTo',
      render: (redirect: string) => redirect ? <Text code>{redirect}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: 'In Menu',
      dataIndex: 'showInMenu',
      key: 'showInMenu',
      width: 80,
      render: (show: boolean) => show ? <Badge status="success" text="Yes" /> : <Badge status="default" text="No" />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: RoutePolicy) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => onPolicyDelete?.(record.id)}
        />
      ),
    },
  ];

  return (
    <Card
      title={<Space><LockOutlined />Route Policies</Space>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setIsCreating(true)}>
          Add Policy
        </Button>
      }
      size="small"
    >
      <Alert
        message="Route access control"
        description="Define which roles can access specific routes. Policies are evaluated in order."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {isCreating && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical" size="small">
            <Space style={{ width: '100%' }}>
              <Form.Item name="pattern" label="Route Pattern" rules={[{ required: true }]} style={{ flex: 2, marginBottom: 0 }}>
                <Input placeholder="/admin/*" />
              </Form.Item>
              <Form.Item name="redirectTo" label="Redirect To" style={{ flex: 1, marginBottom: 0 }}>
                <Input placeholder="/403" />
              </Form.Item>
            </Space>
            <Form.Item name="roles" label="Allowed Roles" style={{ marginTop: 8, marginBottom: 0 }}>
              <Select mode="multiple" placeholder="All roles" options={roles.map(r => ({ value: r.id, label: r.name }))} />
            </Form.Item>
            <Form.Item name="showInMenu" label="Show in Menu" valuePropName="checked" initialValue={true} style={{ marginTop: 8, marginBottom: 8 }}>
              <Switch />
            </Form.Item>
            <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
              <Button size="small" onClick={() => { setIsCreating(false); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" size="small" onClick={handleCreate}>Create</Button>
            </Space>
          </Form>
        </Card>
      )}

      <Table
        dataSource={policies}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </Card>
  );
}

// Preview Panel
function PreviewPanel({
  items,
  roles,
  previewRole,
  onPreviewRoleChange,
}: {
  items: MenuItem[];
  roles: Role[];
  previewRole?: string;
  onPreviewRoleChange?: (roleId: string | undefined) => void;
}) {
  const filteredItems = useMemo(() => filterByRole(items, previewRole || null), [items, previewRole]);

  // Build menu items for preview
  const buildMenuItems = (menuItems: MenuItem[], parentId: string | null = null): any[] => {
    return menuItems
      .filter(item => item.parentId === parentId && item.visible)
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        key: item.key,
        label: (
          <Space>
            {item.label}
            {item.badge && <Tag color={item.badgeColor || 'blue'} style={{ fontSize: 10 }}>{item.badge}</Tag>}
          </Space>
        ),
        disabled: item.disabled,
        children: buildMenuItems(menuItems, item.id),
      }))
      .map(item => item.children?.length ? item : { ...item, children: undefined });
  };

  const menuItems = buildMenuItems(filteredItems);

  return (
    <Card
      title={<Space><DesktopOutlined />Menu Preview</Space>}
      extra={
        <Select
          placeholder="Preview as role"
          allowClear
          value={previewRole}
          onChange={onPreviewRoleChange}
          style={{ width: 180 }}
          options={roles.map(r => ({ value: r.id, label: <Tag color={r.color}>{r.name}</Tag> }))}
        />
      }
      size="small"
    >
      <Alert
        message="Live preview"
        description={previewRole ? `Showing menu as ${roles.find(r => r.id === previewRole)?.name || 'selected role'}` : 'Showing full menu (no role filter)'}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{
        background: 'var(--color-neutral-900, #001529)', borderRadius: 8, padding: 8 }}>
        <AntMenu
          mode="inline"
          theme="dark"
          items={menuItems}
          style={{ background: 'transparent', borderInlineEnd: 'none' }}
        />
      </div>
    </Card>
  );
}

export function AdvancedNavigationEditor({
  items = [],
  roles = [],
  permissions = [],
  policies = [],
  selectedItemId,
  activeTab = 'structure',
  onItemsChange,
  onItemSelect,
  onTabChange,
  onItemCreate,
  onItemUpdate,
  onItemDelete,
  onItemMove,
  onPolicyCreate,
  onPolicyUpdate,
  onPolicyDelete,
  maxDepth = NAVIGATION_EDITOR_DEFAULTS.maxDepth,
  enableDragDrop = NAVIGATION_EDITOR_DEFAULTS.enableDragDrop,
  enableSearch = NAVIGATION_EDITOR_DEFAULTS.enableSearch,
  enablePreview = NAVIGATION_EDITOR_DEFAULTS.enablePreview,
  previewRole,
  loading = false,
  header,
  footer,
  emptyState,
}: NavigationEditorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [localPreviewRole, setLocalPreviewRole] = useState<string | undefined>(previewRole);

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

  const handleDrop = useCallback(async (info: any) => {
    if (!enableDragDrop || !onItemMove) return;
    const dragId = info.dragNode.key as string;
    const dropId = info.node.key as string;
    const newParentId = info.dropToGap ? (items.find(i => i.id === dropId)?.parentId || null) : dropId;
    const siblings = items.filter(i => i.parentId === newParentId).sort((a, b) => a.order - b.order);
    let newIndex = info.dropPosition;
    if (newIndex < 0) newIndex = 0;
    if (newIndex > siblings.length) newIndex = siblings.length;
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
    if (selectedItemId === deleteConfirmId) onItemSelect?.(null);
  }, [onItemDelete, deleteConfirmId, selectedItemId, onItemSelect]);

  const startCreate = useCallback((parentId: string | null = null) => {
    setIsCreating(true);
    setCreateParentId(parentId);
    onItemSelect?.(null);
  }, [onItemSelect]);

  // Tab items
  const tabItems: TabsProps['items'] = [
    {
      key: 'structure',
      label: <Space><MenuOutlined />Structure</Space>,
      children: (
        <div style={{ display: 'flex', gap: 16, minHeight: 450 }}>
          {/* Tree Panel */}
          <Card
            style={{ flex: 1, minWidth: 280 }}
            title="Menu Items"
            extra={
              <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => startCreate(null)}>
                Add
              </Button>
            }
            size="small"
          >
            {enableSearch && (
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                allowClear
                size="small"
                style={{ marginBottom: 8 }}
              />
            )}
            {treeData.length === 0 ? (
              emptyState || <Empty description="No menu items" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 4 }}>
                      <Space size={4}>
                        {item.visible ? <EyeOutlined style={{ fontSize: 11, color: 'var(--color-success-500, #52c41a)' }} /> : <EyeInvisibleOutlined style={{ fontSize: 11, color: 'var(--color-neutral-400, #999)' }} />}
                        <span>{item.label}</span>
                        {item.badge && <Tag color={item.badgeColor || 'blue'} style={{ fontSize: 10, marginLeft: 4 }}>{item.badge}</Tag>}
                      </Space>
                      <Space size={0}>
                        <Tooltip title="Add child"><Button type="text" size="small" icon={<PlusOutlined style={{ fontSize: 11 }} />} onClick={e => { e.stopPropagation(); startCreate(node.key as string); }} /></Tooltip>
                        <Tooltip title="Delete"><Button type="text" size="small" danger icon={<DeleteOutlined style={{ fontSize: 11 }} />} onClick={e => { e.stopPropagation(); setDeleteConfirmId(node.key as string); }} /></Tooltip>
                      </Space>
                    </div>
                  );
                }}
              />
            )}
          </Card>

          {/* Form Panel */}
          <div style={{ flex: 1, minWidth: 320 }}>
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
              <Card size="small" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="Select an item to edit" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Card>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      label: <Space><TeamOutlined />Roles</Space>,
      children: <RoleAssignmentPanel items={items} roles={roles} onItemUpdate={onItemUpdate as any} />,
    },
    {
      key: 'policies',
      label: <Space><LockOutlined />Policies</Space>,
      children: (
        <RoutePoliciesPanel
          policies={policies}
          roles={roles}
          permissions={permissions}
          onPolicyCreate={onPolicyCreate}
          onPolicyUpdate={onPolicyUpdate}
          onPolicyDelete={onPolicyDelete}
        />
      ),
    },
    ...(enablePreview ? [{
      key: 'preview' as EditorTab,
      label: <Space><DesktopOutlined />Preview</Space>,
      children: (
        <PreviewPanel
          items={items}
          roles={roles}
          previewRole={localPreviewRole}
          onPreviewRoleChange={setLocalPreviewRole}
        />
      ),
    }] : []),
  ];

  if (loading) {
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <div>
      {header}

      <Tabs
        activeKey={activeTab}
        onChange={(key) => onTabChange?.(key as EditorTab)}
        items={tabItems}
        type="card"
      />

      {footer}

      {/* Delete Confirmation */}
      <Modal
        title={<Space><ExclamationCircleOutlined style={{ color: 'var(--color-error-500, #ff4d4f)' }} />Delete Menu Item</Space>}
        open={!!deleteConfirmId}
        onOk={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this menu item?</p>
        <Alert message="All child items will also be deleted" type="warning" showIcon />
      </Modal>
    </div>
  );
}

AdvancedNavigationEditor.displayName = 'AdvancedNavigationEditor';
