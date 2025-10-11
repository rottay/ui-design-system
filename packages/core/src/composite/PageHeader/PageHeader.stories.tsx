import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './PageHeader';
import { Button, Flex } from 'antd';
import { PlusIcon, DownloadIcon, SettingsIcon } from 'lucide-react';

const meta = {
  title: 'Composite/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Dashboard',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'User Management',
    subtitle: 'Manage and organize your team members',
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: 'Users',
    breadcrumbs: [
      { title: 'Home' },
      { title: 'Dashboard' },
      { title: 'Users' },
    ],
  },
};

export const WithActions: Story = {
  args: {
    title: 'Projects',
    subtitle: 'Manage your projects and tasks',
    actions: (
      <Flex gap={8}>
        <Button icon={<DownloadIcon size={16} />}>Export</Button>
        <Button type="primary" icon={<PlusIcon size={16} />}>
          New Project
        </Button>
      </Flex>
    ),
  },
};

export const WithBackButton: Story = {
  args: {
    title: 'Project Details',
    subtitle: 'View and edit project information',
    onBack: () => alert('Going back...'),
  },
};

export const WithTabs: Story = {
  args: {
    title: 'Settings',
    tabs: [
      { key: 'general', label: 'General' },
      { key: 'security', label: 'Security' },
      { key: 'notifications', label: 'Notifications' },
      { key: 'billing', label: 'Billing' },
    ],
  },
};

export const WithAvatar: Story = {
  args: {
    title: 'John Doe',
    subtitle: 'Software Engineer',
    avatar: {
      src: 'https://i.pravatar.cc/150?img=12',
    },
  },
};

export const WithTags: Story = {
  args: {
    title: 'E-Commerce Platform',
    subtitle: 'Full-stack web application',
    tags: [
      { label: 'Active', color: 'success' },
      { label: 'Production', color: 'blue' },
    ],
  },
};

export const Complete: Story = {
  args: {
    title: 'Product Analytics',
    subtitle: 'Track and analyze product performance metrics',
    breadcrumbs: [
      { title: 'Home' },
      { title: 'Analytics' },
      { title: 'Products' },
    ],
    onBack: () => alert('Going back...'),
    tags: [
      { label: 'Live', color: 'success' },
      { label: 'Updated 5m ago', color: 'default' },
    ],
    actions: (
      <Flex gap={8}>
        <Button icon={<SettingsIcon size={16} />}>Settings</Button>
        <Button icon={<DownloadIcon size={16} />}>Export</Button>
        <Button type="primary" icon={<PlusIcon size={16} />}>
          Create Report
        </Button>
      </Flex>
    ),
    tabs: [
      { key: 'overview', label: 'Overview' },
      { key: 'sales', label: 'Sales' },
      { key: 'traffic', label: 'Traffic' },
      { key: 'conversion', label: 'Conversion' },
    ],
  },
};

export const UserProfile: Story = {
  args: {
    title: 'Sarah Anderson',
    subtitle: 'Product Designer · San Francisco, CA',
    avatar: {
      src: 'https://i.pravatar.cc/150?img=5',
    },
    tags: [
      { label: 'Team Lead', color: 'purple' },
      { label: 'Verified', color: 'blue' },
    ],
    actions: (
      <Flex gap={8}>
        <Button>Message</Button>
        <Button type="primary">Edit Profile</Button>
      </Flex>
    ),
    tabs: [
      { key: 'activity', label: 'Activity' },
      { key: 'projects', label: 'Projects' },
      { key: 'about', label: 'About' },
    ],
  },
};
