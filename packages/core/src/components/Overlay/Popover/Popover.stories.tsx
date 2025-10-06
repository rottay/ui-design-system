import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Popover } from './Popover';
import { Button, Space, Typography, Input, Divider, Card, List, Avatar, Badge } from 'antd';
import {
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Text, Title, Paragraph, Link } = Typography;

const meta: Meta<typeof Popover> = {
  title: 'Overlay/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Tarjeta emergente que muestra información adicional al hacer hover o clic en un elemento.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/popover)
- [🎨 API de Props](https://ant.design/components/popover#api)
- [💡 Ejemplos](https://ant.design/components/popover#examples)

## Cuándo usar

- Para mostrar información contextual o ayuda adicional
- Cuando necesitas contenido más rico que un tooltip simple
- Para formularios pequeños o controles emergentes
        `,
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'left',
        'right',
        'bottom',
        'topLeft',
        'topRight',
        'bottomLeft',
        'bottomRight',
        'leftTop',
        'leftBottom',
        'rightTop',
        'rightBottom',
      ],
    },
    trigger: {
      control: 'select',
      options: ['hover', 'focus', 'click'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

/**
 * Basic popover with title and content.
 * Use for displaying additional information or context.
 */
export const Basic: Story = {
  render: () => {
    const content = (
      <div>
        <p>This is the content of the popover.</p>
        <p>It can contain multiple paragraphs.</p>
      </div>
    );

    return (
      <Popover content={content} title="Popover Title">
        <Button>Hover me</Button>
      </Popover>
    );
  },
};

/**
 * All 12 placement options for popovers.
 * Choose the placement that best fits your layout.
 */
export const Placements: Story = {
  render: () => {
    const content = <div style={{ padding: '8px 0' }}>Popover content</div>;
    const buttonWidth = 100;

    return (
      <div style={{ padding: '50px' }}>
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <Space size="small">
            <Popover content={content} title="TL" placement="topLeft">
              <Button style={{ width: buttonWidth }}>TL</Button>
            </Popover>
            <Popover content={content} title="Top" placement="top">
              <Button style={{ width: buttonWidth }}>Top</Button>
            </Popover>
            <Popover content={content} title="TR" placement="topRight">
              <Button style={{ width: buttonWidth }}>TR</Button>
            </Popover>
          </Space>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space direction="vertical" size="small">
            <Popover content={content} title="LT" placement="leftTop">
              <Button style={{ width: buttonWidth }}>LT</Button>
            </Popover>
            <Popover content={content} title="Left" placement="left">
              <Button style={{ width: buttonWidth }}>Left</Button>
            </Popover>
            <Popover content={content} title="LB" placement="leftBottom">
              <Button style={{ width: buttonWidth }}>LB</Button>
            </Popover>
          </Space>

          <Space direction="vertical" size="small">
            <Popover content={content} title="RT" placement="rightTop">
              <Button style={{ width: buttonWidth }}>RT</Button>
            </Popover>
            <Popover content={content} title="Right" placement="right">
              <Button style={{ width: buttonWidth }}>Right</Button>
            </Popover>
            <Popover content={content} title="RB" placement="rightBottom">
              <Button style={{ width: buttonWidth }}>RB</Button>
            </Popover>
          </Space>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Space size="small">
            <Popover content={content} title="BL" placement="bottomLeft">
              <Button style={{ width: buttonWidth }}>BL</Button>
            </Popover>
            <Popover content={content} title="Bottom" placement="bottom">
              <Button style={{ width: buttonWidth }}>Bottom</Button>
            </Popover>
            <Popover content={content} title="BR" placement="bottomRight">
              <Button style={{ width: buttonWidth }}>BR</Button>
            </Popover>
          </Space>
        </div>
      </div>
    );
  },
};

/**
 * Different trigger methods for showing popovers.
 * Click trigger is most common for interactive popovers.
 */
export const Triggers: Story = {
  render: () => {
    const content = <div>Popover content here</div>;

    return (
      <Space wrap size="large">
        <Popover content={content} title="Hover Trigger" trigger="hover">
          <Button>Hover me</Button>
        </Popover>
        <Popover content={content} title="Click Trigger" trigger="click">
          <Button type="primary">Click me</Button>
        </Popover>
        <Popover content={content} title="Focus Trigger" trigger="focus">
          <Button>Focus me</Button>
        </Popover>
      </Space>
    );
  },
};

/**
 * Controlled popover for programmatic visibility control.
 * Use when you need external control over popover state.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const content = (
      <div>
        <p>Content of the popover</p>
        <Button size="small" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    );

    return (
      <Space direction="vertical" size="large">
        <Space>
          <Button onClick={() => setOpen(!open)}>Toggle from outside</Button>
          <Text type="secondary">Popover is {open ? 'open' : 'closed'}</Text>
        </Space>
        <Popover
          content={content}
          title="Controlled Popover"
          trigger="click"
          open={open}
          onOpenChange={setOpen}
        >
          <Button type="primary">Click me</Button>
        </Popover>
      </Space>
    );
  },
};

/**
 * Popover with form content.
 * Use for quick data entry without leaving the current page.
 */
export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const content = (
      <div style={{ width: 250 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text>Name</Text>
            <Input placeholder="Enter your name" />
          </div>
          <div>
            <Text>Email</Text>
            <Input placeholder="Enter your email" type="email" />
          </div>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                console.log('Form submitted');
                setOpen(false);
              }}
            >
              Submit
            </Button>
          </Space>
        </Space>
      </div>
    );

    return (
      <Popover
        content={content}
        title="Quick Contact Form"
        trigger="click"
        open={open}
        onOpenChange={setOpen}
      >
        <Button type="primary">Add Contact</Button>
      </Popover>
    );
  },
};

/**
 * User profile card popover.
 * Common pattern for displaying user information.
 */
export const UserCard: Story = {
  render: () => {
    const content = (
      <div style={{ width: 280 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  John Doe
                </Text>
              </div>
              <Text type="secondary">Software Engineer</Text>
            </div>
          </Space>
          <Divider style={{ margin: 0 }} />
          <Space direction="vertical" size="small">
            <Space>
              <MailOutlined />
              <Text>john.doe@example.com</Text>
            </Space>
            <Space>
              <PhoneOutlined />
              <Text>+1 (555) 123-4567</Text>
            </Space>
            <Space>
              <EnvironmentOutlined />
              <Text>San Francisco, CA</Text>
            </Space>
          </Space>
          <Button type="primary" block>
            View Full Profile
          </Button>
        </Space>
      </div>
    );

    return (
      <Popover content={content} trigger="click" placement="bottomLeft">
        <Badge dot>
          <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
        </Badge>
      </Popover>
    );
  },
};

/**
 * Notifications popover.
 * Common pattern for displaying recent notifications or alerts.
 */
export const Notifications: Story = {
  render: () => {
    const notifications = [
      {
        id: 1,
        title: 'New message from Sarah',
        description: 'Hey, are we still on for lunch?',
        time: '2 min ago',
      },
      {
        id: 2,
        title: 'System update available',
        description: 'Version 2.0.1 is ready to install',
        time: '1 hour ago',
      },
      {
        id: 3,
        title: 'Meeting reminder',
        description: 'Team standup in 30 minutes',
        time: '2 hours ago',
      },
    ];

    const content = (
      <div style={{ width: 320 }}>
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item style={{ cursor: 'pointer', padding: '12px 0' }}>
              <List.Item.Meta
                avatar={<Avatar icon={<BellOutlined />} />}
                title={item.title}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.description}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {item.time}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        <Divider style={{ margin: '8px 0' }} />
        <Link style={{ display: 'block', textAlign: 'center' }}>View all notifications</Link>
      </div>
    );

    return (
      <Popover content={content} title="Notifications" trigger="click" placement="bottomRight">
        <Badge count={3}>
          <Button icon={<BellOutlined />} shape="circle" />
        </Badge>
      </Popover>
    );
  },
};

/**
 * Settings menu popover.
 * Use for quick access to configuration options.
 */
export const SettingsMenu: Story = {
  render: () => {
    const content = (
      <div style={{ width: 240 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Appearance</Text>
            <div style={{ marginTop: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="text" block style={{ textAlign: 'left' }}>
                  Light Mode
                </Button>
                <Button type="text" block style={{ textAlign: 'left' }}>
                  Dark Mode
                </Button>
                <Button type="text" block style={{ textAlign: 'left' }}>
                  Auto
                </Button>
              </Space>
            </div>
          </div>
          <Divider style={{ margin: 0 }} />
          <div>
            <Text strong>Preferences</Text>
            <div style={{ marginTop: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="text" block style={{ textAlign: 'left' }}>
                  Language
                </Button>
                <Button type="text" block style={{ textAlign: 'left' }}>
                  Notifications
                </Button>
                <Button type="text" block style={{ textAlign: 'left' }}>
                  Privacy
                </Button>
              </Space>
            </div>
          </div>
        </Space>
      </div>
    );

    return (
      <Popover content={content} title="Settings" trigger="click" placement="bottomLeft">
        <Button icon={<SettingOutlined />}>Settings</Button>
      </Popover>
    );
  },
};

/**
 * Rich content with images and formatting.
 * Popovers can contain complex layouts and media.
 */
export const RichContent: Story = {
  render: () => {
    const content = (
      <Card
        style={{ width: 300, border: 'none' }}
        cover={
          <img
            alt="example"
            src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
            style={{ height: 150, objectFit: 'cover' }}
          />
        }
      >
        <Card.Meta
          title="Product Name"
          description={
            <Space direction="vertical" size="small">
              <Paragraph ellipsis={{ rows: 2 }}>
                This is a detailed description of the product with multiple features and benefits
                that help users understand what they're looking at.
              </Paragraph>
              <Space>
                <Text strong style={{ fontSize: 18 }}>
                  $29.99
                </Text>
                <Text delete type="secondary">
                  $39.99
                </Text>
              </Space>
              <Button type="primary" block>
                View Details
              </Button>
            </Space>
          }
        />
      </Card>
    );

    return (
      <Popover content={content} trigger="click" placement="right">
        <Button type="primary">View Product</Button>
      </Popover>
    );
  },
};

/**
 * Nested popovers for hierarchical information.
 * Use sparingly as multiple layers can be confusing.
 */
export const NestedPopovers: Story = {
  render: () => {
    const innerContent = (
      <div>
        <p>This is the inner popover content.</p>
        <p>It appears on top of the first one.</p>
      </div>
    );

    const content = (
      <div style={{ width: 200 }}>
        <p>This is the first popover.</p>
        <Popover content={innerContent} title="Nested Popover" trigger="click">
          <Button size="small">Click for more</Button>
        </Popover>
      </div>
    );

    return (
      <Popover content={content} title="Main Popover" trigger="click">
        <Button type="primary">Open Popover</Button>
      </Popover>
    );
  },
};

/**
 * Popover with arrow variations.
 * Control arrow visibility and positioning.
 */
export const ArrowVariations: Story = {
  render: () => {
    const content = <div>Popover content here</div>;

    return (
      <Space wrap size="large">
        <Popover content={content} title="With Arrow" arrow>
          <Button>With Arrow</Button>
        </Popover>
        <Popover content={content} title="Without Arrow" arrow={false}>
          <Button>Without Arrow</Button>
        </Popover>
        <Popover content={content} title="Arrow Points at Center" arrow={{ pointAtCenter: true }}>
          <Button>Arrow at Center</Button>
        </Popover>
      </Space>
    );
  },
};

/**
 * Popover with custom close behavior.
 * Prevent closing on content click or customize close triggers.
 */
export const CustomCloseBehavior: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const content = (
      <div style={{ width: 200 }}>
        <p>Click anywhere in this content area.</p>
        <p>The popover won't close automatically.</p>
        <Button size="small" onClick={() => setOpen(false)} block>
          Close Popover
        </Button>
      </div>
    );

    return (
      <Popover
        content={content}
        title="Custom Close Behavior"
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        overlayInnerStyle={{ cursor: 'default' }}
      >
        <Button type="primary">Open Popover</Button>
      </Popover>
    );
  },
};

/**
 * Help documentation popover.
 * Common pattern for providing contextual help.
 */
export const HelpDocumentation: Story = {
  render: () => {
    const content = (
      <div style={{ width: 300 }}>
        <Title level={5}>How to use this feature</Title>
        <Paragraph>
          <ol style={{ paddingLeft: 20 }}>
            <li>Click the "Add" button to create a new item</li>
            <li>Fill in the required fields in the form</li>
            <li>Click "Save" to store your changes</li>
            <li>Use the edit icon to modify existing items</li>
          </ol>
        </Paragraph>
        <Divider />
        <Link>Learn more in documentation →</Link>
      </div>
    );

    return (
      <Space align="center">
        <Input placeholder="Search items..." style={{ width: 200 }} />
        <Popover content={content} trigger="click" placement="bottomRight">
          <Button icon={<SettingOutlined />} type="text">
            Help
          </Button>
        </Popover>
      </Space>
    );
  },
};

/**
 * Quick actions menu.
 * Use for context-specific actions in cards or list items.
 */
export const QuickActions: Story = {
  render: () => {
    const content = (
      <Space direction="vertical" size="small">
        <Button type="text" block style={{ textAlign: 'left' }}>
          Edit
        </Button>
        <Button type="text" block style={{ textAlign: 'left' }}>
          Duplicate
        </Button>
        <Button type="text" block style={{ textAlign: 'left' }}>
          Share
        </Button>
        <Divider style={{ margin: '4px 0' }} />
        <Button type="text" danger block style={{ textAlign: 'left' }}>
          Delete
        </Button>
      </Space>
    );

    return (
      <Card
        title="Project Card"
        extra={
          <Popover content={content} trigger="click" placement="bottomRight">
            <Button type="text" icon={<SettingOutlined />} />
          </Popover>
        }
        style={{ width: 300 }}
      >
        <p>Project description and details go here.</p>
      </Card>
    );
  },
};
