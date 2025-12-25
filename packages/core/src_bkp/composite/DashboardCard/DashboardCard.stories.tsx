import type { Meta, StoryObj } from '@storybook/react';
import { DashboardCard } from './DashboardCard';
import { UsersIcon, ShoppingCartIcon, DollarSignIcon, TrendingUpIcon } from 'lucide-react';

const meta = {
  title: 'Composite/DashboardCard',
  component: DashboardCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Total Users',
    value: '12,543',
    icon: <UsersIcon size={28} />,
  },
};

export const WithTrendUp: Story = {
  args: {
    title: 'Revenue',
    value: '$45,231',
    trend: {
      value: 12.5,
      direction: 'up',
      label: 'vs last month',
    },
    icon: <DollarSignIcon size={28} />,
    color: 'success',
  },
};

export const WithTrendDown: Story = {
  args: {
    title: 'Active Sessions',
    value: '8,432',
    trend: {
      value: -3.2,
      direction: 'down',
      label: 'vs last week',
    },
    icon: <TrendingUpIcon size={28} />,
    color: 'warning',
  },
};

export const AllColors: Story = {
  args: {
    title: 'Demo',
    value: '0',
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      <DashboardCard
        title="Primary"
        value="1,234"
        color="primary"
        icon={<UsersIcon size={28} />}
      />
      <DashboardCard
        title="Success"
        value="$5,678"
        color="success"
        icon={<DollarSignIcon size={28} />}
      />
      <DashboardCard
        title="Warning"
        value="45"
        color="warning"
        icon={<ShoppingCartIcon size={28} />}
      />
      <DashboardCard
        title="Error"
        value="12"
        color="error"
        icon={<TrendingUpIcon size={28} />}
      />
      <DashboardCard
        title="Info"
        value="890"
        color="info"
        icon={<UsersIcon size={28} />}
      />
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    title: 'Demo',
    value: '0',
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      <DashboardCard
        title="Total Users"
        value="12,543"
        icon={<UsersIcon size={28} />}
        color="primary"
      />
      <DashboardCard
        title="Total Orders"
        value="3,456"
        icon={<ShoppingCartIcon size={28} />}
        color="info"
      />
      <DashboardCard
        title="Revenue"
        value="$45,231"
        icon={<DollarSignIcon size={28} />}
        color="success"
      />
      <DashboardCard
        title="Growth"
        value="+23%"
        icon={<TrendingUpIcon size={28} />}
        color="success"
      />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    title: 'Total Users',
    value: '12,543',
    loading: true,
  },
};

export const Clickable: Story = {
  args: {
    title: 'Total Users',
    value: '12,543',
    icon: <UsersIcon size={28} />,
    onClick: () => alert('Card clicked!'),
    trend: {
      value: 8.2,
      direction: 'up',
      label: 'vs last month',
    },
  },
};

export const Grid: Story = {
  args: {
    title: 'Demo',
    value: '0',
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      <DashboardCard
        title="Total Revenue"
        value="$54,239"
        trend={{
          value: 12.5,
          direction: 'up',
          label: 'vs last month',
        }}
        icon={<DollarSignIcon size={28} />}
        color="success"
        onClick={() => alert('Revenue clicked')}
      />
      <DashboardCard
        title="New Customers"
        value="1,234"
        trend={{
          value: 8.2,
          direction: 'up',
          label: 'vs last month',
        }}
        icon={<UsersIcon size={28} />}
        color="primary"
        onClick={() => alert('Customers clicked')}
      />
      <DashboardCard
        title="Pending Orders"
        value="45"
        trend={{
          value: -3.1,
          direction: 'down',
          label: 'vs yesterday',
        }}
        icon={<ShoppingCartIcon size={28} />}
        color="warning"
        onClick={() => alert('Orders clicked')}
      />
      <DashboardCard
        title="Conversion Rate"
        value="3.24%"
        trend={{
          value: 2.4,
          direction: 'up',
          label: 'vs last week',
        }}
        icon={<TrendingUpIcon size={28} />}
        color="info"
        onClick={() => alert('Conversion clicked')}
      />
    </div>
  ),
};

export const WithoutIcon: Story = {
  args: {
    title: 'Total Sales',
    value: '$123,456',
    trend: {
      value: 15.3,
      direction: 'up',
      label: 'vs last quarter',
    },
    color: 'success',
  },
};

export const LargeNumbers: Story = {
  args: {
    title: 'Demo',
    value: '0',
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      <DashboardCard
        title="Annual Revenue"
        value="$1.2M"
        trend={{ value: 23.5, direction: 'up', label: 'YoY' }}
        icon={<DollarSignIcon size={28} />}
        color="success"
      />
      <DashboardCard
        title="Total Transactions"
        value="2.5M"
        trend={{ value: 18.2, direction: 'up', label: 'this year' }}
        icon={<ShoppingCartIcon size={28} />}
        color="info"
      />
    </div>
  ),
};
