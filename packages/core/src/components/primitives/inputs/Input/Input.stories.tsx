/**
 * Input Stories
 * Storybook stories for Input component
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './';
import { DesignSystemProvider } from '../../../../runtime/bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Inputs/Input',
  component: Input,
  decorators: [(Story) => (<DesignSystemProvider><Story /></DesignSystemProvider>)],
  parameters: {
    docs: {
      description: {
        component: `
Input component for text entry with support for multiple engines, sizes, variants, and states.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Styling | CSS-in-JS | Tailwind | CSS Variables |
| Clear Button | Ant Clear | Custom | Native |
| Prefix/Suffix | Full Support | Partial | Full Support |
`,
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'], description: 'Size of the input' },
    variant: { control: 'select', options: ['outline', 'filled', 'flushed', 'unstyled'], description: 'Visual variant' },
    status: { control: 'select', options: ['default', 'error', 'warning', 'success'], description: 'Validation status' },
    engine: { control: 'select', options: ['classic', 'modern', 'rustic'], description: 'Rendering engine' },
    disabled: { control: 'boolean', description: 'Disabled state' },
    clearable: { control: 'boolean', description: 'Show clear button' },
    showCount: { control: 'boolean', description: 'Show character count' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

// ============================================================================
// Default Stories
// ============================================================================

export const Default: Story = { args: { placeholder: "Enter text...", size: "md", variant: "outline" } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (<Input key={size} size={size} placeholder={`Size: ${size}`} />))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["outline", "filled", "flushed", "unstyled"] as const).map((variant) => (<Input key={variant} variant={variant} placeholder={`Variant: ${variant}`} />))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input placeholder="Default" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Read only" readOnly value="Read only value" />
      <Input placeholder="Error" error errorMessage="This field is required" />
      <Input placeholder="Success" status="success" />
      <Input placeholder="Warning" status="warning" />
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input placeholder="With prefix" prefix={<span>@</span>} />
      <Input placeholder="With suffix" suffix={<span>.com</span>} />
      <Input placeholder="With both" prefix={<span>https://</span>} suffix={<span>.com</span>} />
      <Input placeholder="Clearable" clearable defaultValue="Clear me" />
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the Input component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Input rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Input}
      props={{ placeholder: 'Enter text...', size: 'md' }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all variants across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all input variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Input}
      baseProps={{ placeholder: 'Input' }}
      variantProp="variant"
      variants={['outline', 'filled', 'flushed', 'unstyled']}
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
        story: 'Complete matrix of all input sizes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Input}
      baseProps={{ placeholder: 'Input' }}
      sizeProp="size"
      sizes={['xs', 'sm', 'md', 'lg', 'xl']}
    />
  ),
};

/**
 * Status comparison across engines.
 */
export const StatusComparison: Story = {
  name: '⚠️ Status × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Input}
      baseProps={{ placeholder: 'Input' }}
      variantProp="status"
      variants={['default', 'error', 'warning', 'success']}
    />
  ),
};
