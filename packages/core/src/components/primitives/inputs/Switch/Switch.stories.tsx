/**
 * Switch Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './';
import { DesignSystemProvider } from '../../../../design-system';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Switch> = {
  title: 'Primitives/Inputs/Switch',
  component: Switch,
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
        component: `
A switch component for binary on/off states with multi-engine support.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Animation | Smooth | CSS | Basic |
| Loading | Built-in | Custom | Custom |
| Labels | Full | Partial | Full |
`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'default'],
      description: 'Size of the switch',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    checked: { control: 'boolean' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Switch>;

// ============================================================================
// Default Stories
// ============================================================================

export const Default: Story = {
  args: {},
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Switch size="small" />
        <span>Small</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Switch size="default" />
        <span>Default</span>
      </div>
    </div>
  ),
};

export const Checked: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Switch disabled />
        <span>Disabled off</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Switch disabled checked />
        <span>Disabled on</span>
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Switch loading />
        <span>Loading off</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Switch loading checked />
        <span>Loading on</span>
      </div>
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Switch checkedChildren="ON" unCheckedChildren="OFF" />
      <Switch checkedChildren="Yes" unCheckedChildren="No" />
      <Switch checkedChildren="1" unCheckedChildren="0" />
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the Switch component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Switch rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Switch}
      props={{ defaultChecked: true }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all sizes across all engines.
 */
export const SizeMatrix: Story = {
  name: '📏 Size × Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all switch sizes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Switch}
      baseProps={{ defaultChecked: true }}
      sizeProp="size"
      sizes={['small', 'default']}
    />
  ),
};

/**
 * States comparison across engines.
 */
export const StatesComparison: Story = {
  name: '📋 States Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <EngineComparison
        component={Switch}
        props={{}}
        showDescriptions
      />
      <EngineComparison
        component={Switch}
        props={{ defaultChecked: true }}
      />
      <EngineComparison
        component={Switch}
        props={{ disabled: true }}
      />
      <EngineComparison
        component={Switch}
        props={{ loading: true }}
      />
    </div>
  ),
};
