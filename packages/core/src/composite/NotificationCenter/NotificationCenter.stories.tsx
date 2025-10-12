import type { Meta, StoryObj } from '@storybook/react';
import { NotificationCenter } from './NotificationCenter';
import { MessageCircle, Heart, UserPlus } from 'lucide-react';
import type { Notification } from './types';

const meta: Meta<typeof NotificationCenter> = {
  title: 'Composite/NotificationCenter',
  component: NotificationCenter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationCenter>;

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Sarah Connor mentioned you in a comment',
    description: 'Great work on the new feature! Can you review my PR?',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    read: false,
    avatar: 'https://i.pravatar.cc/150?img=5',
    actionLabel: 'View comment',
    onAction: () => console.log('View comment'),
  },
  {
    id: '2',
    title: 'John Doe assigned you to a task',
    description: 'Implement user authentication flow - Due in 3 days',
    timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    read: false,
    avatar: 'https://i.pravatar.cc/150?img=12',
    actionLabel: 'View task',
    onAction: () => console.log('View task'),
  },
  {
    id: '3',
    title: 'New message from Alice Johnson',
    description: 'Hey! Can we schedule a meeting for tomorrow?',
    timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    read: true,
    avatar: 'https://i.pravatar.cc/150?img=20',
    actionLabel: 'Reply',
    onAction: () => console.log('Reply'),
  },
  {
    id: '4',
    title: 'Your deployment was successful',
    description: 'Version 2.3.1 is now live in production',
    timestamp: new Date(Date.now() - 5 * 3600000), // 5 hours ago
    read: true,
    type: 'success',
    actionLabel: 'View logs',
  },
  {
    id: '5',
    title: 'Bob Wilson liked your post',
    timestamp: new Date(Date.now() - 24 * 3600000), // 1 day ago
    read: true,
    avatar: 'https://i.pravatar.cc/150?img=8',
  },
];

export const Default: Story = {
  args: {
    notifications: mockNotifications,
    onNotificationClick: (notification) => console.log('Clicked:', notification),
    onMarkAsRead: (id) => console.log('Mark as read:', id),
    onMarkAllAsRead: () => console.log('Mark all as read'),
    onClearAll: () => console.log('Clear all'),
  },
};

export const WithBadge: Story = {
  args: {
    notifications: mockNotifications,
    showBadge: true,
    unreadCount: 2,
  },
};

export const Empty: Story = {
  args: {
    notifications: [],
    emptyText: 'No new notifications',
  },
};

export const AllRead: Story = {
  args: {
    notifications: mockNotifications.map((n) => ({ ...n, read: true })),
    showBadge: true,
  },
};

export const AllUnread: Story = {
  args: {
    notifications: mockNotifications.map((n) => ({ ...n, read: false })),
    showBadge: true,
  },
};

export const ManyNotifications: Story = {
  args: {
    notifications: [
      ...mockNotifications,
      ...mockNotifications.map((n, i) => ({
        ...n,
        id: `${n.id}-${i}`,
        timestamp: new Date(Date.now() - (i + 1) * 86400000),
      })),
    ],
    maxHeight: 400,
  },
};

export const WithTypeIcons: Story = {
  args: {
    notifications: [
      {
        id: '1',
        title: 'Build completed successfully',
        description: 'Your project has been built and deployed',
        timestamp: new Date(Date.now() - 10 * 60000),
        read: false,
        type: 'success',
      },
      {
        id: '2',
        title: 'Warning: High memory usage',
        description: 'Your application is using 85% of available memory',
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
        type: 'warning',
      },
      {
        id: '3',
        title: 'Error: Deployment failed',
        description: 'Failed to deploy to production. Check logs for details.',
        timestamp: new Date(Date.now() - 60 * 60000),
        read: false,
        type: 'error',
      },
      {
        id: '4',
        title: 'System update available',
        description: 'A new version is available for download',
        timestamp: new Date(Date.now() - 2 * 3600000),
        read: true,
        type: 'info',
      },
    ],
  },
};

export const CustomIcons: Story = {
  args: {
    notifications: [
      {
        id: '1',
        title: 'New follower',
        description: 'Sarah Connor started following you',
        timestamp: new Date(),
        read: false,
        icon: <UserPlus size={20} />,
      },
      {
        id: '2',
        title: 'Someone liked your post',
        description: 'Your post received a new like',
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
        icon: <Heart size={20} />,
      },
      {
        id: '3',
        title: 'New message',
        description: 'You have a new direct message',
        timestamp: new Date(Date.now() - 60 * 60000),
        read: true,
        icon: <MessageCircle size={20} />,
      },
    ],
  },
};
