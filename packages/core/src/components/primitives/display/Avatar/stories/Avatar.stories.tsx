/**
 * Avatar Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Display/Avatar',
  component: Avatar,
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
        component: 'Avatar component for displaying user images or initials with support for multiple engines.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
      description: 'Size of the avatar',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Shape of the avatar',
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
      description: 'Color variant for avatar background',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
    bordered: {
      control: 'boolean',
      description: 'Show border around avatar',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'User avatar',
    size: 'md',
  },
};

export const WithInitials: Story = {
  args: {
    children: 'JD',
    size: 'md',
    variant: 'primary',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
        <Avatar key={size} size={size} src={`https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`}>
          {size}
        </Avatar>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar shape="circle" src="https://i.pravatar.cc/150?img=5" />
      <Avatar shape="square" src="https://i.pravatar.cc/150?img=6" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as const).map((variant) => (
        <Avatar key={variant} variant={variant}>
          {variant.slice(0, 2).toUpperCase()}
        </Avatar>
      ))}
    </div>
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <div style={{ display: 'flex', gap: 8 }}>
            <Avatar engine={engine} src="https://i.pravatar.cc/150?img=1" />
            <Avatar engine={engine} variant="primary">AB</Avatar>
            <Avatar engine={engine} shape="square" src="https://i.pravatar.cc/150?img=2" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <Avatar.Group max={3}>
      <Avatar src="https://i.pravatar.cc/150?img=1" />
      <Avatar src="https://i.pravatar.cc/150?img=2" />
      <Avatar src="https://i.pravatar.cc/150?img=3" />
      <Avatar src="https://i.pravatar.cc/150?img=4" />
      <Avatar src="https://i.pravatar.cc/150?img=5" />
    </Avatar.Group>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Avatar.Badge status="online">
        <Avatar src="https://i.pravatar.cc/150?img=1" />
      </Avatar.Badge>
      <Avatar.Badge status="offline">
        <Avatar src="https://i.pravatar.cc/150?img=2" />
      </Avatar.Badge>
      <Avatar.Badge status="busy">
        <Avatar src="https://i.pravatar.cc/150?img=3" />
      </Avatar.Badge>
      <Avatar.Badge status="away">
        <Avatar src="https://i.pravatar.cc/150?img=4" />
      </Avatar.Badge>
    </div>
  ),
};
