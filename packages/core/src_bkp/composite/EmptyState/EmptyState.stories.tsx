import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { RefreshCwIcon, HomeIcon } from 'lucide-react';

const meta = {
  title: 'Composite/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'no-data',
  },
};

export const AllVariants: Story = {
  args: {
    variant: 'no-data',
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32, padding: 24 }}>
      <EmptyState variant="no-data" />
      <EmptyState variant="no-results" />
      <EmptyState variant="error" />
      <EmptyState variant="404" />
      <EmptyState variant="offline" />
      <EmptyState variant="maintenance" />
    </div>
  ),
};

export const WithActions: Story = {
  args: {
    variant: 'no-data',
    actions: [
      {
        label: 'Refresh',
        onClick: () => alert('Refresh clicked'),
        type: 'primary',
        icon: <RefreshCwIcon size={16} />,
      },
      {
        label: 'Go Home',
        onClick: () => alert('Go Home clicked'),
        type: 'default',
        icon: <HomeIcon size={16} />,
      },
    ],
  },
};

export const CustomIcon: Story = {
  args: {
    variant: 'no-data',
    title: 'No Messages',
    description: 'You have no messages in your inbox.',
    icon: <span style={{ fontSize: 64 }}>📧</span>,
  },
};

export const CustomImage: Story = {
  args: {
    variant: 'no-data',
    title: 'No Products',
    description: 'Start adding products to your catalog.',
    image: 'https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg',
  },
};

export const DifferentSizes: Story = {
  args: {
    variant: 'no-data',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 24 }}>
      <div>
        <h3>Small</h3>
        <EmptyState variant="no-data" size="sm" />
      </div>
      <div>
        <h3>Medium (Default)</h3>
        <EmptyState variant="no-data" size="md" />
      </div>
      <div>
        <h3>Large</h3>
        <EmptyState variant="no-data" size="lg" />
      </div>
    </div>
  ),
};

export const ErrorWithRetry: Story = {
  args: {
    variant: 'error',
    actions: [
      {
        label: 'Try Again',
        onClick: () => alert('Retrying...'),
        type: 'primary',
      },
    ],
  },
};

export const NotFoundWithNavigation: Story = {
  args: {
    variant: '404',
    title: 'Oops! Page Not Found',
    description: "The page you're looking for doesn't exist or has been moved.",
    actions: [
      {
        label: 'Go to Homepage',
        onClick: () => alert('Navigating to home...'),
        type: 'primary',
      },
      {
        label: 'Contact Support',
        onClick: () => alert('Opening support...'),
        type: 'link',
      },
    ],
  },
};
