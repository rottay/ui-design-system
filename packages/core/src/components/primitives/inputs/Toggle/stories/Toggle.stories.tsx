/**
 * Toggle Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof Toggle> = {
  title: 'Primitives/Inputs/Toggle',
  component: Toggle,
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
A toggle/switch component for binary on/off states with multi-engine support.

## Engine Differences

| Feature | Titan | Hermes | Apollo |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Animation | Smooth | CSS | Basic |
| Inner Labels | Full | Partial | Full |
| Loading State | Built-in | Custom | Custom |
`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the toggle',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error'],
      description: 'Color variant',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    checked: { control: 'boolean' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

// ============================================================================
// Default Stories
// ============================================================================

export const Default: Story = {
  args: { label: 'Enable feature' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Toggle key={size} size={size} label={`Size: ${size}`} />
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const).map((color) => (
        <Toggle key={color} color={color} defaultChecked label={`Color: ${color}`} />
      ))}
    </div>
  ),
};

export const Checked: Story = {
  args: { label: 'Notifications enabled', checked: true },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Toggle disabled label="Disabled off" />
      <Toggle disabled checked label="Disabled on" />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Toggle loading label="Saving..." />
      <Toggle loading checked label="Saving..." />
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Toggle checkedLabel="ON" uncheckedLabel="OFF" label="Power" />
      <Toggle checkedLabel="Yes" uncheckedLabel="No" label="Accept terms" />
      <Toggle checkedLabel="1" uncheckedLabel="0" label="Binary" />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    label: 'Email notifications',
    description: 'Receive email updates about your account activity',
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the Toggle component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Toggle rendered by Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Toggle}
      props={{ label: 'Toggle me', defaultChecked: true }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all sizes across all engines.
 */
export const SizeMatrix: Story = {
  name: '📏 Size × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Toggle}
      baseProps={{ label: 'Toggle', defaultChecked: true }}
      sizeProp="size"
      sizes={['xs', 'sm', 'md', 'lg', 'xl']}
    />
  ),
};

/**
 * Color comparison across engines.
 */
export const ColorMatrix: Story = {
  name: '🎨 Color × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Toggle}
      baseProps={{ label: 'Toggle', defaultChecked: true }}
      variantProp="color"
      variants={['primary', 'secondary', 'success', 'warning', 'error']}
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
        component={Toggle}
        props={{ label: 'Off' }}
        showDescriptions
      />
      <EngineComparison
        component={Toggle}
        props={{ label: 'On', defaultChecked: true }}
      />
      <EngineComparison
        component={Toggle}
        props={{ label: 'Disabled', disabled: true }}
      />
      <EngineComparison
        component={Toggle}
        props={{ label: 'Loading', loading: true }}
      />
    </div>
  ),
};
