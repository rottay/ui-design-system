/**
 * Button Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Inputs/Button',
  component: Button,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'A versatile button component supporting multiple variants, sizes, and states with multi-engine support.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the button',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'default', 'text', 'dashed'],
      description: 'Visual variant of the button',
    },
    shape: {
      control: 'select',
      options: ['default', 'round', 'circle'],
      description: 'Shape of the button',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    danger: {
      control: 'boolean',
      description: 'Danger/destructive button style',
    },
    block: {
      control: 'boolean',
      description: 'Full width button',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Button key={size} size={size} variant="primary">
          {size.toUpperCase()}
        </Button>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {(['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'default', 'text', 'dashed'] as const).map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button shape="default">Default</Button>
      <Button shape="round">Round</Button>
      <Button shape="circle">C</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button loading variant="primary">Loading</Button>
      <Button loading variant="secondary">Loading</Button>
      <Button loading variant="outline">Loading</Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button disabled variant="primary">Disabled</Button>
      <Button disabled variant="secondary">Disabled</Button>
      <Button disabled variant="outline">Disabled</Button>
    </div>
  ),
};

export const DangerButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="danger">Danger</Button>
      <Button danger variant="primary">Primary Danger</Button>
      <Button danger variant="outline">Outline Danger</Button>
    </div>
  ),
};

export const Block: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <Button block variant="primary">Full Width Button</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button icon={<span>🔍</span>}>Search</Button>
      <Button icon={<span>➕</span>} variant="primary">Add Item</Button>
      <Button icon={<span>💾</span>} variant="secondary">Save</Button>
    </div>
  ),
};

export const ButtonGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Button.Group>
        <Button>Left</Button>
        <Button>Center</Button>
        <Button>Right</Button>
      </Button.Group>
      <Button.Group>
        <Button variant="primary">One</Button>
        <Button variant="primary">Two</Button>
        <Button variant="primary">Three</Button>
      </Button.Group>
    </div>
  ),
};

export const IconButton: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button.Icon icon={<span>⚙️</span>} aria-label="Settings" />
      <Button.Icon icon={<span>❤️</span>} aria-label="Like" variant="outline" />
      <Button.Icon icon={<span>🗑️</span>} aria-label="Delete" variant="danger" />
    </div>
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button engine={engine} variant="primary">Primary</Button>
            <Button engine={engine} variant="secondary">Secondary</Button>
            <Button engine={engine} variant="outline">Outline</Button>
            <Button engine={engine} loading>Loading</Button>
            <Button engine={engine} disabled>Disabled</Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="primary">Normal</Button>
        <Button variant="primary" loading>Loading</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="secondary">Normal</Button>
        <Button variant="secondary" loading>Loading</Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="outline">Normal</Button>
        <Button variant="outline" loading>Loading</Button>
        <Button variant="outline" disabled>Disabled</Button>
      </div>
    </div>
  ),
};
