/**
 * Checkbox Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Checkbox> = {
  title: 'Primitives/Inputs/Checkbox',
  component: Checkbox,
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
A checkbox component for selecting one or multiple options with multi-engine support.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DS tokens (skin-painted) | Vanilla CSS |
| Animation | Smooth | CSS | Basic |
| Indeterminate | Full | Partial | Full |
| Group | Built-in | Custom | Custom |
`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the checkbox',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error'],
      description: 'Color variant',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// ============================================================================
// Default Stories
// ============================================================================

export const Default: Story = {
  args: { children: 'Accept terms and conditions' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Checkbox key={size} size={size}>Size: {size}</Checkbox>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const).map((color) => (
        <Checkbox key={color} color={color} defaultChecked>Color: {color}</Checkbox>
      ))}
    </div>
  ),
};

export const Checked: Story = {
  args: { children: 'This is checked', checked: true },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox disabled>Disabled unchecked</Checkbox>
      <Checkbox disabled checked>Disabled checked</Checkbox>
    </div>
  ),
};

export const Indeterminate: Story = {
  args: { children: 'Select all', indeterminate: true },
};

export const CheckboxGroup: Story = {
  render: () => (
    <Checkbox.Group
      options={[
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'orange', label: 'Orange' },
        { value: 'grape', label: 'Grape', disabled: true },
      ]}
      defaultValue={['apple']}
    />
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the Checkbox component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Checkbox rendered by Classic (Ant Design), Modern (DS tokens), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Checkbox}
      props={{ children: 'Check me', defaultChecked: true }}
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
        story: 'Complete matrix of all checkbox sizes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Checkbox}
      baseProps={{ children: 'Checkbox', defaultChecked: true }}
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
      component={Checkbox}
      baseProps={{ children: 'Checkbox', defaultChecked: true }}
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
        component={Checkbox}
        props={{ children: 'Unchecked' }}
        showDescriptions
      />
      <EngineComparison
        component={Checkbox}
        props={{ children: 'Checked', defaultChecked: true }}
      />
      <EngineComparison
        component={Checkbox}
        props={{ children: 'Disabled', disabled: true }}
      />
      <EngineComparison
        component={Checkbox}
        props={{ children: 'Indeterminate', indeterminate: true }}
      />
    </div>
  ),
};

/**
 * Modern-engine state matrix: unchecked/checked/indeterminate, error,
 * disabled, description, label placement, sizes, and long Arabic RTL copy.
 */
export const ModernStateMatrix: Story = {
  name: 'Modern State Matrix',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <Checkbox engine="modern" label="Unchecked" />
      <Checkbox engine="modern" label="Checked" defaultChecked />
      <Checkbox engine="modern" label="Indeterminate" indeterminate />
      <Checkbox engine="modern" label="Error" error />
      <Checkbox engine="modern" label="Disabled" disabled />
      <Checkbox engine="modern" label="Disabled checked" disabled defaultChecked />
      <Checkbox
        engine="modern"
        label="With description"
        description="Long supporting copy that wraps across lines without pushing the indicator out of alignment."
        defaultChecked
      />
      <Checkbox engine="modern" label="Label at start" labelPlacement="start" />
      <Checkbox engine="modern" label="Success color" color="success" defaultChecked />
      <Checkbox engine="modern" label="Large" size="lg" defaultChecked />
      <Checkbox engine="modern" label="Small" size="sm" />
      <div dir="rtl" lang="ar">
        <Checkbox
          engine="modern"
          label="أوافق على مشاركة ملفي الشخصي مع جهات التوظيف المعتمدة بما في ذلك البيانات الحساسة المحددة في نموذج الموافقة الطويل"
          defaultChecked
        />
      </div>
    </div>
  ),
};
