import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';
import { Button, Space, Typography, Input, Radio, Divider, List, Avatar } from 'antd';
import { useState } from 'react';
import {
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const meta: Meta<typeof Drawer> = {
  title: 'Overlay/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Panel deslizante que aparece desde el borde de la pantalla para mostrar contenido adicional.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/drawer)
- [🎨 API de Props](https://ant.design/components/drawer#api)
- [💡 Ejemplos](https://ant.design/components/drawer#examples)

## Cuándo usar

- Para mostrar detalles adicionales sin abandonar el contexto actual
- Cuando necesitas formularios o configuraciones en un panel lateral
- Para navegación secundaria o información complementaria
        `,
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
    size: {
      control: 'select',
      options: ['default', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

/**
 * Basic drawer that slides in from the right.
 * Most common pattern for detail views and forms.
 */
export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Drawer
        </Button>
        <Drawer title="Basic Drawer" onClose={() => setOpen(false)} open={open}>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
      </>
    );
  },
};

/**
 * Drawers can slide in from all four directions.
 * Choose based on content type and layout needs.
 */
export const Placements: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState<'left' | 'right' | 'top' | 'bottom'>('right');

    const showDrawer = (position: 'left' | 'right' | 'top' | 'bottom') => {
      setPlacement(position);
      setOpen(true);
    };

    return (
      <>
        <Space wrap size="middle">
          <Button onClick={() => showDrawer('left')}>Left</Button>
          <Button onClick={() => showDrawer('right')}>Right</Button>
          <Button onClick={() => showDrawer('top')}>Top</Button>
          <Button onClick={() => showDrawer('bottom')}>Bottom</Button>
        </Space>
        <Drawer
          title={`Drawer from ${placement}`}
          placement={placement}
          onClose={() => setOpen(false)}
          open={open}
        >
          <p>This drawer slides in from the {placement}.</p>
        </Drawer>
      </>
    );
  },
};

/**
 * Different drawer sizes for different content needs.
 * Use larger sizes for complex forms or detailed views.
 */
export const Sizes: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [size, setSize] = useState<'default' | 'large'>('default');

    const showDrawer = (drawerSize: 'default' | 'large') => {
      setSize(drawerSize);
      setOpen(true);
    };

    return (
      <>
        <Space>
          <Button onClick={() => showDrawer('default')}>Default Size</Button>
          <Button onClick={() => showDrawer('large')}>Large Size</Button>
        </Space>
        <Drawer
          title={`${size === 'large' ? 'Large' : 'Default'} Drawer`}
          placement="right"
          size={size}
          onClose={() => setOpen(false)}
          open={open}
        >
          <p>This is a {size} drawer.</p>
          <p>Default drawer width is 378px.</p>
          <p>Large drawer width is 736px.</p>
        </Drawer>
      </>
    );
  },
};

/**
 * Custom width and height for precise sizing.
 * Use when standard sizes don't fit your needs.
 */
export const CustomSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Custom Width Drawer
        </Button>
        <Drawer
          title="Custom Size Drawer"
          placement="right"
          width={600}
          onClose={() => setOpen(false)}
          open={open}
        >
          <p>This drawer has a custom width of 600px.</p>
          <p>You can also set custom heights for top/bottom drawers.</p>
        </Drawer>
      </>
    );
  },
};

/**
 * Nested drawers for hierarchical content.
 * Use sparingly - too many levels can confuse users.
 */
export const NestedDrawers: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [childrenDrawer, setChildrenDrawer] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Parent Drawer
        </Button>
        <Drawer title="Parent Drawer" width={520} onClose={() => setOpen(false)} open={open}>
          <p>This is the parent drawer.</p>
          <Button type="primary" onClick={() => setChildrenDrawer(true)}>
            Open Child Drawer
          </Button>
          <Drawer
            title="Child Drawer"
            width={320}
            onClose={() => setChildrenDrawer(false)}
            open={childrenDrawer}
          >
            <p>This is a nested drawer.</p>
            <p>It appears on top of the parent drawer.</p>
          </Drawer>
        </Drawer>
      </>
    );
  },
};

/**
 * Drawer without header for minimal design.
 * Use when you want full control of the layout.
 */
export const WithoutHeader: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Headerless Drawer
        </Button>
        <Drawer placement="right" onClose={() => setOpen(false)} open={open} closable={false}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>
                Custom Header
              </Title>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
            <Paragraph>
              This drawer has no default header. You have full control over the layout.
            </Paragraph>
          </Space>
        </Drawer>
      </>
    );
  },
};

/**
 * Drawer with extra actions in the header.
 * Common pattern for providing quick actions.
 */
export const ExtraActions: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Drawer with Actions
        </Button>
        <Drawer
          title="Drawer with Extra Actions"
          placement="right"
          onClose={() => setOpen(false)}
          open={open}
          extra={
            <Space>
              <Button onClick={() => console.log('Edit clicked')}>Edit</Button>
              <Button type="primary" onClick={() => console.log('Save clicked')}>
                Save
              </Button>
            </Space>
          }
        >
          <p>This drawer has extra action buttons in the header.</p>
          <p>Use this pattern for quick actions on the drawer content.</p>
        </Drawer>
      </>
    );
  },
};

/**
 * Drawer with custom footer.
 * Use for forms or actions that need confirmation.
 */
export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Drawer with Footer
        </Button>
        <Drawer
          title="Drawer with Footer"
          placement="right"
          onClose={() => setOpen(false)}
          open={open}
          footer={
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="primary" onClick={() => setOpen(false)}>
                Submit
              </Button>
            </Space>
          }
        >
          <p>This drawer includes a footer with action buttons.</p>
          <p>Perfect for forms or multi-step processes.</p>
        </Drawer>
      </>
    );
  },
};

/**
 * Settings panel drawer.
 * Common pattern for application settings or preferences.
 */
export const SettingsPanel: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState('light');

    return (
      <>
        <Button icon={<SettingOutlined />} onClick={() => setOpen(true)}>
          Settings
        </Button>
        <Drawer
          title="Settings"
          placement="right"
          onClose={() => setOpen(false)}
          open={open}
          width={400}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={5}>Appearance</Title>
              <Radio.Group value={theme} onChange={(e) => setTheme(e.target.value)}>
                <Space direction="vertical">
                  <Radio value="light">Light Mode</Radio>
                  <Radio value="dark">Dark Mode</Radio>
                  <Radio value="auto">Auto (System)</Radio>
                </Space>
              </Radio.Group>
            </div>

            <Divider />

            <div>
              <Title level={5}>Notifications</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio.Group defaultValue="all">
                  <Space direction="vertical">
                    <Radio value="all">All notifications</Radio>
                    <Radio value="important">Important only</Radio>
                    <Radio value="none">None</Radio>
                  </Space>
                </Radio.Group>
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={5}>Language</Title>
              <Radio.Group defaultValue="en">
                <Space direction="vertical">
                  <Radio value="en">English</Radio>
                  <Radio value="es">Spanish</Radio>
                  <Radio value="fr">French</Radio>
                </Space>
              </Radio.Group>
            </div>
          </Space>
        </Drawer>
      </>
    );
  },
};

/**
 * User profile drawer.
 * Display detailed user information in a slide-out panel.
 */
export const UserProfile: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button icon={<UserOutlined />} onClick={() => setOpen(true)}>
          View Profile
        </Button>
        <Drawer
          title="User Profile"
          placement="right"
          onClose={() => setOpen(false)}
          open={open}
          width={450}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={100} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: 16 }}>
                John Doe
              </Title>
              <Text type="secondary">Software Engineer</Text>
            </div>

            <Divider />

            <div>
              <Title level={5}>Contact Information</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Email</Text>
                  <br />
                  <Text>john.doe@example.com</Text>
                </div>
                <div>
                  <Text type="secondary">Phone</Text>
                  <br />
                  <Text>+1 (555) 123-4567</Text>
                </div>
                <div>
                  <Text type="secondary">Location</Text>
                  <br />
                  <Text>San Francisco, CA</Text>
                </div>
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={5}>About</Title>
              <Paragraph>
                Passionate software engineer with 5+ years of experience building scalable web
                applications. Specialized in React, TypeScript, and modern web technologies.
              </Paragraph>
            </div>

            <Button type="primary" block>
              Edit Profile
            </Button>
          </Space>
        </Drawer>
      </>
    );
  },
};

/**
 * Shopping cart drawer.
 * Common e-commerce pattern for displaying cart contents.
 */
export const ShoppingCart: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const cartItems = [
      { id: 1, name: 'Product 1', price: 29.99, quantity: 2 },
      { id: 2, name: 'Product 2', price: 49.99, quantity: 1 },
      { id: 3, name: 'Product 3', price: 19.99, quantity: 3 },
    ];

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
      <>
        <Button icon={<ShoppingCartOutlined />} onClick={() => setOpen(true)}>
          Cart ({cartItems.length})
        </Button>
        <Drawer
          title="Shopping Cart"
          placement="right"
          onClose={() => setOpen(false)}
          open={open}
          width={400}
          footer={
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text strong>Total:</Text>
                <Title level={4} style={{ margin: 0 }}>
                  ${total.toFixed(2)}
                </Title>
              </div>
              <Button type="primary" size="large" block>
                Checkout
              </Button>
            </div>
          }
        >
          <List
            itemLayout="horizontal"
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" danger size="small">
                    Remove
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text>${item.price.toFixed(2)}</Text>
                      <Text type="secondary">Quantity: {item.quantity}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Drawer>
      </>
    );
  },
};

/**
 * Notifications drawer.
 * Display a list of notifications or activity feed.
 */
export const NotificationsDrawer: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const notifications = [
      {
        id: 1,
        title: 'New message from Sarah',
        description: 'Hey, are we still on for lunch tomorrow?',
        time: '2 minutes ago',
        unread: true,
      },
      {
        id: 2,
        title: 'System update completed',
        description: 'Your system has been updated to version 2.0.1',
        time: '1 hour ago',
        unread: true,
      },
      {
        id: 3,
        title: 'Meeting reminder',
        description: 'Team standup in 30 minutes',
        time: '2 hours ago',
        unread: false,
      },
      {
        id: 4,
        title: 'New comment on your post',
        description: 'Alex commented: "Great work!"',
        time: '3 hours ago',
        unread: false,
      },
    ];

    return (
      <>
        <Button
          icon={<BellOutlined />}
          onClick={() => setOpen(true)}
          style={{ position: 'relative' }}
        >
          Notifications
          {notifications.filter((n) => n.unread).length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                background: 'red',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {notifications.filter((n) => n.unread).length}
            </span>
          )}
        </Button>
        <Drawer
          title="Notifications"
          placement="right"
          onClose={() => setOpen(false)}
          open={open}
          width={420}
          extra={
            <Button type="link" size="small">
              Mark all as read
            </Button>
          }
        >
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: item.unread ? '#f0f5ff' : 'transparent',
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 4,
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<BellOutlined />} />}
                  title={
                    <Space>
                      {item.title}
                      {item.unread && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#1890ff',
                            display: 'inline-block',
                          }}
                        />
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text>{item.description}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.time}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Drawer>
      </>
    );
  },
};

/**
 * Mobile navigation drawer.
 * Common pattern for mobile menus and navigation.
 */
export const MobileNavigation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const menuItems = [
      { icon: <UserOutlined />, label: 'Profile', path: '/profile' },
      { icon: <SettingOutlined />, label: 'Settings', path: '/settings' },
      { icon: <BellOutlined />, label: 'Notifications', path: '/notifications' },
      { icon: <ShoppingCartOutlined />, label: 'Orders', path: '/orders' },
    ];

    return (
      <>
        <Button icon={<MenuOutlined />} onClick={() => setOpen(true)}>
          Menu
        </Button>
        <Drawer
          title="Navigation"
          placement="left"
          onClose={() => setOpen(false)}
          open={open}
          width={280}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Avatar size={64} icon={<UserOutlined />} />
              <Title level={5} style={{ marginTop: 12 }}>
                John Doe
              </Title>
              <Text type="secondary">john.doe@example.com</Text>
            </div>

            <Divider style={{ margin: 0 }} />

            <List
              dataSource={menuItems}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '12px 0' }}
                  onClick={() => {
                    console.log('Navigate to:', item.path);
                    setOpen(false);
                  }}
                >
                  <Space>
                    {item.icon}
                    <Text>{item.label}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Divider style={{ margin: 0 }} />

            <Button danger block onClick={() => setOpen(false)}>
              Logout
            </Button>
          </Space>
        </Drawer>
      </>
    );
  },
};

/**
 * Prevent closing by clicking mask.
 * Use when you need to ensure users complete an action.
 */
export const PreventMaskClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open (No Mask Close)
        </Button>
        <Drawer
          title="Important Form"
          placement="right"
          onClose={() => setOpen(false)}
          open={open}
          maskClosable={false}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Paragraph>This drawer cannot be closed by clicking the mask.</Paragraph>
            <Paragraph>You must use the close button or the Cancel button below.</Paragraph>
            <Input placeholder="Required field" />
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </Space>
        </Drawer>
      </>
    );
  },
};
