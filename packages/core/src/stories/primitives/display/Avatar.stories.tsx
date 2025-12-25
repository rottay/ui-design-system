/**
 * Avatar Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../../../components/primitives/display/avatar';
import { DesignSystemProvider } from '../../../system/providers/root';

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
        component: 'Avatar component for displaying user images or initials.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
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
  },
};

export const WithInitials: Story = {
  args: {
    children: 'JD',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar size="sm" src="https://i.pravatar.cc/150?img=1" />
      <Avatar size="md" src="https://i.pravatar.cc/150?img=2" />
      <Avatar size="lg" src="https://i.pravatar.cc/150?img=3" />
      <Avatar size="xl" src="https://i.pravatar.cc/150?img=4" />
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

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Titan</h4>
        <Avatar engine="titan" src="https://i.pravatar.cc/150?img=1" />
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Hermes</h4>
        <Avatar engine="hermes" src="https://i.pravatar.cc/150?img=2" />
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Apollo</h4>
        <Avatar engine="apollo" src="https://i.pravatar.cc/150?img=3" />
      </div>
    </div>
  ),
};
