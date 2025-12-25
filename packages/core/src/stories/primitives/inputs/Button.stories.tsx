/**
 * Button Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../../components/primitives/inputs/button';
import { DesignSystemProvider } from '../../../system/providers/root';

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
        component: 'Multi-engine button component with variants and sizes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'link'],
      description: 'Button visual variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'UI engine to render with',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
    variant: 'primary',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary',
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
    variant: 'primary',
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Titan (Ant Design)</h4>
        <Button engine="titan" variant="primary">
          Titan Button
        </Button>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Hermes (DaisyUI)</h4>
        <Button engine="hermes" variant="primary">
          Hermes Button
        </Button>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Apollo (HTML)</h4>
        <Button engine="apollo" variant="primary">
          Apollo Button
        </Button>
      </div>
    </div>
  ),
};
