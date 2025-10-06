import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dropdown } from './Dropdown';
import { Button, Space, Typography, Divider } from 'antd';
import type { MenuProps } from 'antd';
import {
  DownOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MailOutlined,
  AppstoreOutlined,
  FileOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const meta: Meta<typeof Dropdown> = {
  title: 'Overlay/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Menú desplegable que muestra una lista de opciones al hacer clic o hover.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/dropdown)
- [🎨 API de Props](https://ant.design/components/dropdown#api)
- [💡 Ejemplos](https://ant.design/components/dropdown#examples)

## Cuándo usar

- Para mostrar un menú de acciones u opciones
- Cuando necesitas agrupar comandos relacionados
- Para menús contextuales o de configuración
        `,
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottomLeft', 'bottomCenter', 'bottomRight', 'topLeft', 'topCenter', 'topRight'],
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover', 'contextMenu'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

/**
 * Basic dropdown with a simple menu.
 * Use this when you need a simple action menu triggered by a button.
 */
export const Basic: Story = {
  render: () => {
    const items: MenuProps['items'] = [
      {
        key: '1',
        label: '1st menu item',
      },
      {
        key: '2',
        label: '2nd menu item',
      },
      {
        key: '3',
        label: '3rd menu item',
      },
    ];

    return (
      <Dropdown menu={{ items }}>
        <Button>
          Hover me <DownOutlined />
        </Button>
      </Dropdown>
    );
  },
};

/**
 * Dropdown with icon-enhanced menu items.
 * Use this for better visual hierarchy and quick recognition.
 */
export const WithIcons: Story = {
  render: () => {
    const items: MenuProps['items'] = [
      {
        key: '1',
        icon: <UserOutlined />,
        label: 'Profile',
      },
      {
        key: '2',
        icon: <SettingOutlined />,
        label: 'Settings',
      },
      {
        key: '3',
        icon: <MailOutlined />,
        label: 'Messages',
      },
      {
        type: 'divider',
      },
      {
        key: '4',
        icon: <LogoutOutlined />,
        label: 'Logout',
        danger: true,
      },
    ];

    return (
      <Dropdown menu={{ items }} trigger={['click']}>
        <Button type="primary">
          User Menu <DownOutlined />
        </Button>
      </Dropdown>
    );
  },
};

/**
 * Dropdown using the Dropdown.Button component.
 * Provides a split button with primary action and dropdown menu.
 */
export const WithDropdownButton: Story = {
  render: () => {
    const handleButtonClick = () => {
      console.log('Click on left button');
    };

    const handleMenuClick: MenuProps['onClick'] = (e) => {
      console.log('Click on menu item:', e.key);
    };

    const items: MenuProps['items'] = [
      {
        key: '1',
        label: 'Save draft',
      },
      {
        key: '2',
        label: 'Save as template',
      },
      {
        key: '3',
        label: 'Download',
      },
    ];

    return (
      <Space>
        <Dropdown.Button onClick={handleButtonClick} menu={{ items, onClick: handleMenuClick }}>
          Save & Publish
        </Dropdown.Button>
        <Dropdown.Button
          type="primary"
          onClick={handleButtonClick}
          menu={{ items, onClick: handleMenuClick }}
        >
          Save & Publish
        </Dropdown.Button>
      </Space>
    );
  },
};

/**
 * Different placement options for the dropdown menu.
 * Choose the placement that best fits your layout.
 */
export const Placements: Story = {
  render: () => {
    const items: MenuProps['items'] = [
      {
        key: '1',
        label: 'Menu item 1',
      },
      {
        key: '2',
        label: 'Menu item 2',
      },
      {
        key: '3',
        label: 'Menu item 3',
      },
    ];

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space wrap size="large">
          <Dropdown menu={{ items }} placement="bottomLeft">
            <Button>Bottom Left</Button>
          </Dropdown>
          <Dropdown menu={{ items }} placement="bottomCenter">
            <Button>Bottom Center</Button>
          </Dropdown>
          <Dropdown menu={{ items }} placement="bottomRight">
            <Button>Bottom Right</Button>
          </Dropdown>
        </Space>
        <Space wrap size="large">
          <Dropdown menu={{ items }} placement="topLeft">
            <Button>Top Left</Button>
          </Dropdown>
          <Dropdown menu={{ items }} placement="topCenter">
            <Button>Top Center</Button>
          </Dropdown>
          <Dropdown menu={{ items }} placement="topRight">
            <Button>Top Right</Button>
          </Dropdown>
        </Space>
      </Space>
    );
  },
};

/**
 * Different trigger methods: click, hover, or context menu.
 * Choose based on user interaction patterns.
 */
export const Triggers: Story = {
  render: () => {
    const items: MenuProps['items'] = [
      {
        key: '1',
        label: 'Menu option 1',
      },
      {
        key: '2',
        label: 'Menu option 2',
      },
      {
        key: '3',
        label: 'Menu option 3',
      },
    ];

    return (
      <Space wrap size="large">
        <Dropdown menu={{ items }} trigger={['hover']}>
          <Button>Hover to open</Button>
        </Dropdown>
        <Dropdown menu={{ items }} trigger={['click']}>
          <Button type="primary">Click to open</Button>
        </Dropdown>
        <Dropdown menu={{ items }} trigger={['contextMenu']}>
          <div
            style={{
              padding: '16px 20px',
              border: '1px dashed #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Right click here
          </div>
        </Dropdown>
      </Space>
    );
  },
};

/**
 * Nested dropdown menus for hierarchical actions.
 * Use sparingly as deep nesting can harm usability.
 */
export const NestedMenus: Story = {
  render: () => {
    const items: MenuProps['items'] = [
      {
        key: '1',
        icon: <FileOutlined />,
        label: 'New',
        children: [
          {
            key: '1-1',
            label: 'Document',
          },
          {
            key: '1-2',
            label: 'Spreadsheet',
          },
          {
            key: '1-3',
            label: 'Presentation',
          },
        ],
      },
      {
        key: '2',
        icon: <EditOutlined />,
        label: 'Edit',
      },
      {
        key: '3',
        icon: <CopyOutlined />,
        label: 'Copy',
      },
      {
        type: 'divider',
      },
      {
        key: '4',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
      },
    ];

    return (
      <Dropdown menu={{ items }} trigger={['click']}>
        <Button>
          File Actions <DownOutlined />
        </Button>
      </Dropdown>
    );
  },
};

/**
 * Dropdown with disabled menu items.
 * Use to show unavailable actions while maintaining context.
 */
export const DisabledItems: Story = {
  render: () => {
    const items: MenuProps['items'] = [
      {
        key: '1',
        label: 'Enabled item',
      },
      {
        key: '2',
        label: 'Disabled item',
        disabled: true,
      },
      {
        key: '3',
        label: 'Another enabled item',
      },
      {
        type: 'divider',
      },
      {
        key: '4',
        label: 'Danger action (disabled)',
        danger: true,
        disabled: true,
      },
    ];

    return (
      <Dropdown menu={{ items }} trigger={['click']}>
        <Button>
          Actions <DownOutlined />
        </Button>
      </Dropdown>
    );
  },
};

/**
 * Dropdown menu with descriptions for complex actions.
 * Helps users understand what each option does.
 */
export const WithDescriptions: Story = {
  render: () => {
    const items: MenuProps['items'] = [
      {
        key: '1',
        icon: <AppstoreOutlined />,
        label: (
          <div>
            <div style={{ fontWeight: 500 }}>Dashboard</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              View all your statistics
            </Text>
          </div>
        ),
      },
      {
        key: '2',
        icon: <UserOutlined />,
        label: (
          <div>
            <div style={{ fontWeight: 500 }}>Profile</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Manage your account settings
            </Text>
          </div>
        ),
      },
      {
        key: '3',
        icon: <SettingOutlined />,
        label: (
          <div>
            <div style={{ fontWeight: 500 }}>Settings</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Configure application preferences
            </Text>
          </div>
        ),
      },
    ];

    return (
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomLeft">
        <Button size="large">
          Menu <DownOutlined />
        </Button>
      </Dropdown>
    );
  },
};

/**
 * Context menu pattern with comprehensive actions.
 * Ideal for table rows or card items.
 */
export const ContextMenu: Story = {
  render: () => {
    const handleMenuClick: MenuProps['onClick'] = (e) => {
      console.log('Action:', e.key);
    };

    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <FileOutlined />,
        label: 'View details',
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
      },
      {
        key: 'copy',
        icon: <CopyOutlined />,
        label: 'Duplicate',
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
      },
    ];

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Text>Right-click on the items below:</Text>
        {[1, 2, 3].map((num) => (
          <Dropdown key={num} menu={{ items, onClick: handleMenuClick }} trigger={['contextMenu']}>
            <div
              style={{
                padding: '16px 20px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                cursor: 'pointer',
                background: '#fafafa',
              }}
            >
              Item {num} - Right click for options
            </div>
          </Dropdown>
        ))}
      </Space>
    );
  },
};

/**
 * Dropdown menu with custom content beyond standard menu items.
 * Use for richer interactions but keep it lightweight.
 */
export const CustomContent: Story = {
  render: () => {
    const menu = (
      <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ marginBottom: '12px' }}>
          <Text strong>Quick Stats</Text>
        </div>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Total Views</Text>
            <Text strong>1,234</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Active Users</Text>
            <Text strong>456</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Conversion Rate</Text>
            <Text strong>23.4%</Text>
          </div>
        </Space>
        <Divider style={{ margin: '12px 0' }} />
        <Button type="link" size="small" style={{ padding: 0 }}>
          View full report →
        </Button>
      </div>
    );

    return (
      <Dropdown dropdownRender={() => menu} trigger={['click']}>
        <Button>
          Statistics <DownOutlined />
        </Button>
      </Dropdown>
    );
  },
};

/**
 * Controlled dropdown for programmatic control.
 * Use when you need to control the visibility externally.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const items: MenuProps['items'] = [
      {
        key: '1',
        label: 'Option 1',
        onClick: () => setOpen(false),
      },
      {
        key: '2',
        label: 'Option 2',
        onClick: () => setOpen(false),
      },
      {
        key: '3',
        label: 'Keep dropdown open',
      },
    ];

    return (
      <Space direction="vertical" size="large">
        <Space>
          <Button onClick={() => setOpen(!open)}>Toggle from outside</Button>
          <Text type="secondary">Dropdown is {open ? 'open' : 'closed'}</Text>
        </Space>
        <Dropdown menu={{ items }} open={open} onOpenChange={setOpen}>
          <Button type="primary">
            Controlled Dropdown <DownOutlined />
          </Button>
        </Dropdown>
      </Space>
    );
  },
};
