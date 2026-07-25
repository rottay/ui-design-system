/**
 * Radio Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

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

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DS tokens (skin-painted) | Vanilla CSS |
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
      options: ['classic', 'modern', 'rustic'],
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
        story: 'Compare the same Radio rendered by Classic (Ant Design), Modern (DS tokens), and Rustic (Vanilla CSS).',
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

/**
 * Modern-engine state matrix: unchecked/checked, error, disabled,
 * description, label placement, colors, sizes, and long Arabic RTL copy.
 */
export const ModernStateMatrix: Story = {
  name: 'Modern State Matrix',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <Radio engine="modern" label="Unchecked" value="a" name="m1" />
      <Radio engine="modern" label="Checked" value="b" name="m1" defaultChecked />
      <Radio engine="modern" label="Error" value="c" name="m2" error />
      <Radio engine="modern" label="Disabled" value="d" name="m2" disabled />
      <Radio engine="modern" label="Disabled checked" value="e" name="m3" disabled defaultChecked />
      <Radio
        engine="modern"
        label="With description"
        description="Long supporting copy that wraps across lines without pushing the ring out of alignment."
        value="f"
        name="m4"
        defaultChecked
      />
      <Radio engine="modern" label="Label at start" labelPlacement="start" value="g" name="m5" />
      <Radio engine="modern" label="Success color" color="success" value="h" name="m6" defaultChecked />
      <Radio engine="modern" label="Large" size="lg" value="i" name="m7" defaultChecked />
      <div dir="rtl" lang="ar">
        <Radio
          engine="modern"
          label="الفوترة السنوية مع تجديد تلقائي ونسخ احتياطي كامل للبيانات طوال مدة الاشتراك الطويلة"
          value="annual"
          name="m8"
          defaultChecked
        />
      </div>
    </div>
  ),
};
