import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu } from './UserMenu';
import { User, Settings, HelpCircle, LogOut, CreditCard, Shield } from 'lucide-react';

const meta: Meta<typeof UserMenu> = {
  title: 'Composite/UserMenu',
  component: UserMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

const defaultMenuItems = [
  {
    key: 'profile',
    label: 'My Profile',
    icon: <User size={16} />,
    onClick: () => console.log('Profile clicked'),
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <Settings size={16} />,
    onClick: () => console.log('Settings clicked'),
  },
  {
    key: 'billing',
    label: 'Billing',
    icon: <CreditCard size={16} />,
    onClick: () => console.log('Billing clicked'),
  },
  {
    key: 'divider1',
    label: '',
    divider: true,
  },
  {
    key: 'help',
    label: 'Help & Support',
    icon: <HelpCircle size={16} />,
    onClick: () => console.log('Help clicked'),
  },
  {
    key: 'divider2',
    label: '',
    divider: true,
  },
  {
    key: 'logout',
    label: 'Log out',
    icon: <LogOut size={16} />,
    danger: true,
    onClick: () => console.log('Logout clicked'),
  },
];

export const Default: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Administrator',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    menuItems: defaultMenuItems,
  },
};

export const WithNotificationBadge: Story = {
  args: {
    user: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    menuItems: defaultMenuItems,
    showBadge: true,
    notificationCount: 5,
  },
};

export const WithoutAvatar: Story = {
  args: {
    user: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'Manager',
    },
    menuItems: defaultMenuItems,
  },
};

export const SimpleMenu: Story = {
  args: {
    user: {
      name: 'Bob Wilson',
      email: 'bob@example.com',
    },
    menuItems: [
      {
        key: 'profile',
        label: 'Profile',
        icon: <User size={16} />,
        onClick: () => console.log('Profile'),
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: <Settings size={16} />,
        onClick: () => console.log('Settings'),
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogOut size={16} />,
        danger: true,
        onClick: () => console.log('Logout'),
      },
    ],
  },
};

export const WithCustomRole: Story = {
  args: {
    user: {
      name: 'Sarah Connor',
      email: 'sarah.connor@cyberdyne.com',
      role: 'Security Admin',
      avatar: 'https://i.pravatar.cc/150?img=20',
    },
    menuItems: [
      {
        key: 'profile',
        label: 'My Profile',
        icon: <User size={16} />,
      },
      {
        key: 'security',
        label: 'Security Settings',
        icon: <Shield size={16} />,
      },
      {
        key: 'logout',
        label: 'Sign Out',
        icon: <LogOut size={16} />,
        danger: true,
      },
    ],
    showBadge: true,
    notificationCount: 12,
  },
};

export const HoverTrigger: Story = {
  args: {
    user: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
    menuItems: defaultMenuItems,
    trigger: ['hover'],
  },
};
