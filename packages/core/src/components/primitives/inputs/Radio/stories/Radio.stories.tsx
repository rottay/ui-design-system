/**
 * Radio Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof Radio> = {
  title: 'Primitives/Inputs/Radio',
  component: Radio,
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
A radio button component for single selection from a set of options with multi-engine support.

## Engine Differences

| Feature | Titan | Hermes | Apollo |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Animation | Smooth | CSS | Basic |
| Button Style | Full | Partial | Full |
| Group | Built-in | Custom | Custom |
`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Size of the radio',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Radio>;

// ============================================================================
// Default Stories
// ============================================================================

export const Default: Story = {
  args: { children: 'Radio Option' },
};

export const Checked: Story = {
  args: { children: 'Selected Option', checked: true },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Radio disabled>Disabled unchecked</Radio>
      <Radio disabled checked>Disabled checked</Radio>
    </div>
  ),
};

export const RadioGroup: Story = {
  render: () => (
    <Radio.Group defaultValue="apple">
      <Radio value="apple">Apple</Radio>
      <Radio value="banana">Banana</Radio>
      <Radio value="orange">Orange</Radio>
      <Radio value="grape" disabled>Grape (disabled)</Radio>
    </Radio.Group>
  ),
};

export const RadioGroupVertical: Story = {
  render: () => (
    <Radio.Group defaultValue="option1">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
        <Radio value="option3">Option 3</Radio>
      </div>
    </Radio.Group>
  ),
};

export const RadioButton: Story = {
  render: () => (
    <Radio.Group defaultValue="a" buttonStyle="solid">
      <Radio.Button value="a">Option A</Radio.Button>
      <Radio.Button value="b">Option B</Radio.Button>
      <Radio.Button value="c">Option C</Radio.Button>
      <Radio.Button value="d" disabled>Option D</Radio.Button>
    </Radio.Group>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the Radio component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Radio rendered by Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Radio}
      props={{ children: 'Radio Option', defaultChecked: true }}
      showDescriptions
    />
  ),
};

/**
 * Size comparison across engines.
 */
export const SizeMatrix: Story = {
  name: '📏 Size × Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all radio sizes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Radio}
      baseProps={{ children: 'Radio', defaultChecked: true }}
      sizeProp="size"
      sizes={['small', 'middle', 'large']}
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
        component={Radio}
        props={{ children: 'Unchecked' }}
        showDescriptions
      />
      <EngineComparison
        component={Radio}
        props={{ children: 'Checked', defaultChecked: true }}
      />
      <EngineComparison
        component={Radio}
        props={{ children: 'Disabled', disabled: true }}
      />
    </div>
  ),
};
