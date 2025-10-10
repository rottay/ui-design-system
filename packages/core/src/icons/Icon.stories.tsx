import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import {
  Home,
  Search,
  Settings,
  User,
  Mail,
  Bell,
  Heart,
  Star,
  Loader,
  Loader2,
  Download,
  Upload,
  Trash,
  Edit,
  Save,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const meta = {
  title: 'Icons/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      description: 'Icon component from lucide-react',
      control: false,
    },
    size: {
      description: 'Icon size (preset or number)',
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 16, 24, 32, 48],
    },
    spin: {
      description: 'Rotate icon continuously',
      control: 'boolean',
    },
    strokeWidth: {
      description: 'Stroke width',
      control: { type: 'number', min: 0.5, max: 3, step: 0.5 },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: Home,
    size: 'md',
  },
};

export const Sizes: Story = {
  args: {
    icon: Home,
  },
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Home} size="xs" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>xs (12px)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Home} size="sm" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>sm (16px)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Home} size="md" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>md (20px)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Home} size="lg" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>lg (24px)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Home} size="xl" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>xl (32px)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Home} size="2xl" />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>2xl (40px)</div>
      </div>
    </div>
  ),
};

export const CommonIcons: Story = {
  args: {
    icon: Home,
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '24px' }}>
      {[
        { icon: Home, name: 'Home' },
        { icon: Search, name: 'Search' },
        { icon: Settings, name: 'Settings' },
        { icon: User, name: 'User' },
        { icon: Mail, name: 'Mail' },
        { icon: Bell, name: 'Bell' },
        { icon: Heart, name: 'Heart' },
        { icon: Star, name: 'Star' },
        { icon: Download, name: 'Download' },
        { icon: Upload, name: 'Upload' },
        { icon: Trash, name: 'Trash' },
        { icon: Edit, name: 'Edit' },
        { icon: Save, name: 'Save' },
        { icon: AlertCircle, name: 'AlertCircle' },
        { icon: CheckCircle, name: 'CheckCircle' },
        { icon: XCircle, name: 'XCircle' },
      ].map(({ icon, name }) => (
        <div key={name} style={{ textAlign: 'center' }}>
          <Icon icon={icon} size="lg" />
          <div style={{ fontSize: '12px', marginTop: '8px' }}>{name}</div>
        </div>
      ))}
    </div>
  ),
};

export const WithColors: Story = {
  args: {
    icon: Heart,
  },
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ color: '#1890ff' }}>
        <Icon icon={Heart} size="xl" />
      </div>
      <div style={{ color: '#52c41a' }}>
        <Icon icon={CheckCircle} size="xl" />
      </div>
      <div style={{ color: '#ff4d4f' }}>
        <Icon icon={XCircle} size="xl" />
      </div>
      <div style={{ color: '#faad14' }}>
        <Icon icon={AlertCircle} size="xl" />
      </div>
      <div style={{ color: '#722ed1' }}>
        <Icon icon={Star} size="xl" />
      </div>
    </div>
  ),
};

export const LoadingSpinner: Story = {
  args: {
    icon: Loader,
  },
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Icon icon={Loader} size="md" spin />
      <Icon icon={Loader2} size="md" spin />
      <Icon icon={Loader} size="lg" spin />
      <Icon icon={Loader2} size="lg" spin />
      <Icon icon={Loader} size="xl" spin />
      <Icon icon={Loader2} size="xl" spin />
    </div>
  ),
};

export const CustomStrokeWidth: Story = {
  args: {
    icon: Heart,
  },
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Heart} size="xl" strokeWidth={0.5} />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>0.5</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Heart} size="xl" strokeWidth={1} />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>1</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Heart} size="xl" strokeWidth={1.5} />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>1.5 (default)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Heart} size="xl" strokeWidth={2} />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>2</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Heart} size="xl" strokeWidth={3} />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>3</div>
      </div>
    </div>
  ),
};
