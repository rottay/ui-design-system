/**
 * Spinner Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '../';

const meta: Meta<typeof Spinner> = {
  title: 'Primitives/Feedback/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
    },
    color: {
      control: 'color',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} style={{ textAlign: 'center' }}>
          <Spinner size={size} />
          <p style={{ marginTop: 8, fontSize: 12 }}>{size}</p>
        </div>
      ))}
    </div>
  ),
};

export const WithLabel: Story = {
  args: {
    size: 'md',
    label: 'Loading...',
  },
};

export const CustomColor: Story = {
  args: {
    size: 'lg',
    color: '#8b5cf6',
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine} style={{ textAlign: 'center' }}>
          <Spinner engine={engine} size="lg" />
          <p style={{ marginTop: 8, textTransform: 'capitalize' }}>{engine}</p>
        </div>
      ))}
    </div>
  ),
};
