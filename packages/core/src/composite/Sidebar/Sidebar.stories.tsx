import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './Sidebar';
import { Home, Users, Settings, FileText, Bell, Search, Layout, Heart, Bookmark, MessageSquare } from 'lucide-react';
import { Avatar } from '../../components/Display/Avatar';

const meta = {
  title: 'Composite/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultGroups = [
  {
    items: [
      { key: 'home', label: 'Home', icon: <Home size={18} />, path: '/' },
      { key: 'search', label: 'Search', icon: <Search size={18} />, path: '/search' },
    ],
  },
  {
    title: 'Content',
    items: [
      { key: 'documents', label: 'Documents', icon: <FileText size={18} />, path: '/documents' },
      { key: 'users', label: 'Users', icon: <Users size={18} />, path: '/users', badge: 12 },
      { key: 'notifications', label: 'Notifications', icon: <Bell size={18} />, path: '/notifications', badge: 5 },
    ],
  },
  {
    title: 'Settings',
    items: [
      { key: 'layout', label: 'Layout', icon: <Layout size={18} />, path: '/layout' },
      { key: 'settings', label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
    ],
  },
];

const groupsWithSubItems = [
  {
    items: [
      { key: 'home', label: 'Home', icon: <Home size={18} />, path: '/' },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        key: 'documents',
        label: 'Documents',
        icon: <FileText size={18} />,
        children: [
          { key: 'recent', label: 'Recent', icon: <Bell size={18} /> },
          { key: 'favorites', label: 'Favorites', icon: <Heart size={18} /> },
          { key: 'archived', label: 'Archived', icon: <Bookmark size={18} /> },
        ],
      },
      { key: 'users', label: 'Users', icon: <Users size={18} />, path: '/users', badge: 12 },
      {
        key: 'messages',
        label: 'Messages',
        icon: <MessageSquare size={18} />,
        badge: 3,
        children: [
          { key: 'inbox', label: 'Inbox', badge: 3 },
          { key: 'sent', label: 'Sent' },
          { key: 'drafts', label: 'Drafts' },
        ],
      },
    ],
  },
];

const spotifyLogo = (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#000' }}>S</div>
    <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>Spotify</span>
  </div>
);

const linearLogo = (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #5E6AD2 0%, #9333EA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>L</span>
    </div>
    <span style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>Linear</span>
  </div>
);

const userFooter = (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
    <Avatar src="https://i.pravatar.cc/150?img=1" size={36} />
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>John Doe</div>
      <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>john@example.com</div>
    </div>
  </div>
);

export const Default: Story = {
  args: {
    groups: defaultGroups,
    activeKey: 'home',
  },
  render: (args) => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar {...args} />
      <div style={{ flex: 1, padding: 24, background: '#f5f5f5' }}>
        <h1>Main Content Area</h1>
        <p>The sidebar is on the left with theme-aware styling.</p>
      </div>
    </div>
  ),
};

export const Collapsed: Story = {
  args: {
    groups: defaultGroups,
    activeKey: 'home',
    collapsed: true,
  },
  render: (args) => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar {...args} />
      <div style={{ flex: 1, padding: 24, background: '#f5f5f5' }}>
        <h1>Main Content Area</h1>
        <p>The sidebar is collapsed showing only icons.</p>
      </div>
    </div>
  ),
};

export const WithBadges: Story = {
  args: {
    groups: defaultGroups,
    activeKey: 'users',
  },
  render: (args) => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar {...args} />
      <div style={{ flex: 1, padding: 24, background: '#f5f5f5' }}>
        <h1>Main Content Area</h1>
        <p>Notice the badge counters on Users (12) and Notifications (5).</p>
      </div>
    </div>
  ),
};

export const WithSubItems: Story = {
  args: {
    groups: groupsWithSubItems,
    activeKey: 'recent',
  },
  render: (args) => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar {...args} />
      <div style={{ flex: 1, padding: 24, background: '#f5f5f5' }}>
        <h1>Main Content Area</h1>
        <p>The sidebar supports nested navigation with sub-items under Documents and Messages.</p>
      </div>
    </div>
  ),
};

export const WithLogo: Story = {
  args: {
    groups: defaultGroups,
    activeKey: 'home',
    logo: spotifyLogo,
  },
  render: (args) => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar {...args} />
      <div style={{ flex: 1, padding: 24, background: '#f5f5f5' }}>
        <h1>Main Content Area</h1>
        <p>The sidebar includes a logo area at the top.</p>
      </div>
    </div>
  ),
};

export const WithFooter: Story = {
  args: {
    groups: defaultGroups,
    activeKey: 'home',
    logo: linearLogo,
    footer: userFooter,
  },
  render: (args) => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar {...args} />
      <div style={{ flex: 1, padding: 24, background: '#f5f5f5' }}>
        <h1>Main Content Area</h1>
        <p>The sidebar includes both logo and user footer.</p>
      </div>
    </div>
  ),
};

export const SpotifyTheme: Story = {
  args: {
    groups: defaultGroups,
    activeKey: 'home',
    logo: spotifyLogo,
    footer: userFooter,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: (args) => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar {...args} />
      <div style={{ flex: 1, padding: 24, background: '#121212' }}>
        <h1 style={{ color: '#FFFFFF' }}>Spotify Dark Theme</h1>
        <p style={{ color: '#B3B3B3' }}>Black background with green accents.</p>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    groups: defaultGroups,
    activeKey: 'home',
    logo: linearLogo,
    footer: userFooter,
  },
  render: (args) => {
    const [activeKey, setActiveKey] = React.useState('home');
    const [collapsed, setCollapsed] = React.useState(false);

    return (
      <div style={{ height: '100vh', display: 'flex' }}>
        <Sidebar
          {...args}
          activeKey={activeKey}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          onItemClick={(item) => {
            setActiveKey(item.key);
            console.log('Clicked:', item);
          }}
        />
        <div style={{ flex: 1, padding: 24, background: '#f5f5f5' }}>
          <h1>Interactive Sidebar</h1>
          <p>Active: <strong>{activeKey}</strong></p>
          <p>Collapsed: <strong>{collapsed ? 'Yes' : 'No'}</strong></p>
          <p>Click items to navigate or toggle collapse button.</p>
        </div>
      </div>
    );
  },
};
