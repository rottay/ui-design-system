import type { Meta, StoryObj } from '@storybook/react';
import { DashboardLayout } from './DashboardLayout';
import { Avatar, Badge, Dropdown } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BellOutlined,
} from '@ant-design/icons';

const meta = {
  title: 'Composite/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample menu items
const menuItems = [
  {
    key: 'home',
    label: 'Home',
    icon: <HomeOutlined />,
  },
  {
    key: 'users',
    label: 'Users',
    icon: <UserOutlined />,
  },
  {
    key: 'content',
    label: 'Content',
    icon: <FileTextOutlined />,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingOutlined />,
  },
];

// Menu items with submenus
const menuItemsWithSub = [
  {
    key: 'home',
    label: 'Home',
    icon: <HomeOutlined />,
  },
  {
    key: 'users',
    label: 'Users',
    icon: <UserOutlined />,
    children: [
      { key: 'users-list', label: 'User List' },
      { key: 'users-roles', label: 'Roles' },
      { key: 'users-permissions', label: 'Permissions' },
    ],
  },
  {
    key: 'content',
    label: 'Content',
    icon: <FileTextOutlined />,
    children: [
      { key: 'content-posts', label: 'Posts' },
      { key: 'content-pages', label: 'Pages' },
      { key: 'content-media', label: 'Media' },
    ],
  },
  {
    key: 'apps',
    label: 'Applications',
    icon: <AppstoreOutlined />,
    children: [
      { key: 'apps-calendar', label: 'Calendar' },
      { key: 'apps-email', label: 'Email' },
      { key: 'apps-chat', label: 'Chat' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingOutlined />,
  },
];

// User menu dropdown
const UserMenu = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <Badge count={5}>
      <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
    </Badge>
    <Dropdown
      menu={{
        items: [
          { key: 'profile', label: 'Profile' },
          { key: 'settings', label: 'Settings' },
          { type: 'divider' },
          { key: 'logout', label: 'Logout', danger: true },
        ],
      }}
      placement="bottomRight"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} />
        <span>John Doe</span>
      </div>
    </Dropdown>
  </div>
);

// Sample content
const SampleContent = () => (
  <div>
    <h1 style={{ marginTop: 0 }}>Welcome to Dashboard</h1>
    <p>This is your main content area. You can put any content here.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '24px' }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            padding: '24px',
            background: '#f0f2f5',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>Card {i}</h3>
          <p>Sample content for card {i}</p>
        </div>
      ))}
    </div>
  </div>
);

export const Default: Story = {
  args: {
    logo: 'https://ant.design/img/logo.svg',
    menuItems,
    children: <SampleContent />,
  },
};

export const WithUserMenu: Story = {
  args: {
    logo: 'https://ant.design/img/logo.svg',
    menuItems,
    headerRight: <UserMenu />,
    children: <SampleContent />,
  },
};

export const WithSubmenus: Story = {
  args: {
    logo: 'https://ant.design/img/logo.svg',
    menuItems: menuItemsWithSub,
    headerRight: <UserMenu />,
    children: <SampleContent />,
  },
};

export const CollapsedByDefault: Story = {
  args: {
    logo: 'https://ant.design/img/logo.svg',
    menuItems,
    headerRight: <UserMenu />,
    defaultCollapsed: true,
    children: <SampleContent />,
  },
};

export const CustomFooter: Story = {
  args: {
    logo: 'https://ant.design/img/logo.svg',
    menuItems,
    headerRight: <UserMenu />,
    footer: (
      <div>
        <div>My Company ©2025</div>
        <div style={{ marginTop: '8px' }}>
          <a href="#" style={{ marginRight: '16px' }}>Privacy</a>
          <a href="#" style={{ marginRight: '16px' }}>Terms</a>
          <a href="#">Contact</a>
        </div>
      </div>
    ),
    children: <SampleContent />,
  },
};

export const NoFooter: Story = {
  args: {
    logo: 'https://ant.design/img/logo.svg',
    menuItems,
    headerRight: <UserMenu />,
    showFooter: false,
    children: <SampleContent />,
  },
};
