import type { Meta, StoryObj } from '@storybook/react';
import { DaisyBadge } from './DaisyBadge';

const meta: Meta<typeof DaisyBadge> = {
  title: 'DaisyUI/DaisyBadge',
  component: DaisyBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'DaisyUI Badge component with Tailwind CSS classes. Use the **DaisyUI Theme** selector in the toolbar to see different themes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'primary', 'secondary', 'accent', 'ghost', 'info', 'success', 'warning', 'error'],
      description: 'Badge variant/color',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Badge size',
    },
    outline: {
      control: 'boolean',
      description: 'Outline style',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DaisyBadge>;

// Default badge
export const Default: Story = {
  args: {
    children: 'Default',
  },
};

// All variants
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
      <DaisyBadge>Neutral</DaisyBadge>
      <DaisyBadge variant="primary">Primary</DaisyBadge>
      <DaisyBadge variant="secondary">Secondary</DaisyBadge>
      <DaisyBadge variant="accent">Accent</DaisyBadge>
      <DaisyBadge variant="ghost">Ghost</DaisyBadge>
      <DaisyBadge variant="info">Info</DaisyBadge>
      <DaisyBadge variant="success">Success</DaisyBadge>
      <DaisyBadge variant="warning">Warning</DaisyBadge>
      <DaisyBadge variant="error">Error</DaisyBadge>
    </div>
  ),
};

// Outline style
export const Outline: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
      <DaisyBadge outline>Neutral</DaisyBadge>
      <DaisyBadge variant="primary" outline>Primary</DaisyBadge>
      <DaisyBadge variant="secondary" outline>Secondary</DaisyBadge>
      <DaisyBadge variant="accent" outline>Accent</DaisyBadge>
      <DaisyBadge variant="info" outline>Info</DaisyBadge>
      <DaisyBadge variant="success" outline>Success</DaisyBadge>
      <DaisyBadge variant="warning" outline>Warning</DaisyBadge>
      <DaisyBadge variant="error" outline>Error</DaisyBadge>
    </div>
  ),
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <DaisyBadge variant="primary" size="xs">Extra Small</DaisyBadge>
      <DaisyBadge variant="primary" size="sm">Small</DaisyBadge>
      <DaisyBadge variant="primary" size="md">Medium</DaisyBadge>
      <DaisyBadge variant="primary" size="lg">Large</DaisyBadge>
    </div>
  ),
};

// Status badges
export const StatusBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px' }}>Active:</span>
        <DaisyBadge variant="success">Online</DaisyBadge>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px' }}>Pending:</span>
        <DaisyBadge variant="warning">Processing</DaisyBadge>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px' }}>Error:</span>
        <DaisyBadge variant="error">Failed</DaisyBadge>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px' }}>Info:</span>
        <DaisyBadge variant="info">Beta</DaisyBadge>
      </div>
    </div>
  ),
};

// Notification badges
export const NotificationBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
      <div style={{ position: 'relative', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <span style={{ fontSize: '14px' }}>Messages</span>
        <DaisyBadge
          variant="error"
          size="sm"
          style={{ position: 'absolute', top: '-8px', right: '-8px' }}
        >
          99+
        </DaisyBadge>
      </div>

      <div style={{ position: 'relative', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <span style={{ fontSize: '14px' }}>Notifications</span>
        <DaisyBadge
          variant="primary"
          size="sm"
          style={{ position: 'absolute', top: '-8px', right: '-8px' }}
        >
          5
        </DaisyBadge>
      </div>

      <div style={{ position: 'relative', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <span style={{ fontSize: '14px' }}>Cart</span>
        <DaisyBadge
          variant="accent"
          size="sm"
          style={{ position: 'absolute', top: '-8px', right: '-8px' }}
        >
          3
        </DaisyBadge>
      </div>
    </div>
  ),
};

// Tags/Labels
export const TagsAndLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Technologies:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <DaisyBadge variant="primary">React</DaisyBadge>
          <DaisyBadge variant="secondary">TypeScript</DaisyBadge>
          <DaisyBadge variant="accent">Tailwind</DaisyBadge>
          <DaisyBadge variant="info">Vite</DaisyBadge>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Categories:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <DaisyBadge variant="ghost" outline>Design</DaisyBadge>
          <DaisyBadge variant="ghost" outline>Development</DaisyBadge>
          <DaisyBadge variant="ghost" outline>Marketing</DaisyBadge>
          <DaisyBadge variant="ghost" outline>Sales</DaisyBadge>
        </div>
      </div>
    </div>
  ),
};

// Theme showcase
export const ThemeShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
          Use the "DaisyUI Theme" selector in the toolbar to see different themes
        </h3>
      </div>

      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>Solid Variants:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <DaisyBadge variant="primary">Primary</DaisyBadge>
          <DaisyBadge variant="secondary">Secondary</DaisyBadge>
          <DaisyBadge variant="accent">Accent</DaisyBadge>
          <DaisyBadge variant="info">Info</DaisyBadge>
          <DaisyBadge variant="success">Success</DaisyBadge>
          <DaisyBadge variant="warning">Warning</DaisyBadge>
          <DaisyBadge variant="error">Error</DaisyBadge>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>Outline Variants:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <DaisyBadge variant="primary" outline>Primary</DaisyBadge>
          <DaisyBadge variant="secondary" outline>Secondary</DaisyBadge>
          <DaisyBadge variant="accent" outline>Accent</DaisyBadge>
          <DaisyBadge variant="info" outline>Info</DaisyBadge>
          <DaisyBadge variant="success" outline>Success</DaisyBadge>
          <DaisyBadge variant="warning" outline>Warning</DaisyBadge>
          <DaisyBadge variant="error" outline>Error</DaisyBadge>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>Sizes:</h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <DaisyBadge variant="primary" size="xs">XS</DaisyBadge>
          <DaisyBadge variant="primary" size="sm">SM</DaisyBadge>
          <DaisyBadge variant="primary" size="md">MD</DaisyBadge>
          <DaisyBadge variant="primary" size="lg">LG</DaisyBadge>
        </div>
      </div>
    </div>
  ),
};

// User profile example
export const UserProfileExample: Story = {
  render: () => (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      maxWidth: '400px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>John Doe</h4>
            <DaisyBadge variant="success" size="xs">Pro</DaisyBadge>
          </div>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>@johndoe</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <DaisyBadge variant="primary" size="sm">Developer</DaisyBadge>
        <DaisyBadge variant="secondary" size="sm">React</DaisyBadge>
        <DaisyBadge variant="accent" size="sm">TypeScript</DaisyBadge>
        <DaisyBadge variant="info" size="sm">UI/UX</DaisyBadge>
      </div>
    </div>
  ),
};
