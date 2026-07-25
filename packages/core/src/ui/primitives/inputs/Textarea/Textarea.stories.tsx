/**
 * Textarea Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Textarea> = {
  title: 'Primitives/Inputs/Textarea',
  component: Textarea,
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
A multi-line text input component with multi-engine support.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DS tokens (skin-painted) | Vanilla CSS |
| Auto Resize | Built-in | Manual | Custom |
| Character Count | Built-in | Custom | Custom |
| Clear Button | Yes | Yes | Yes |
`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the textarea',
    },
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'borderless'],
      description: 'Visual variant',
    },
    status: {
      control: 'select',
      options: ['default', 'error', 'warning', 'success'],
      description: 'Validation status',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    showCount: { control: 'boolean' },
    allowClear: { control: 'boolean' },
    rows: { control: 'number' },
    maxLength: { control: 'number' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// ============================================================================
// Default Stories
// ============================================================================

export const Default: Story = {
  args: { placeholder: 'Enter your message here...' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Textarea key={size} size={size} placeholder={`Size: ${size}`} />
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['outlined', 'filled', 'borderless'] as const).map((variant) => (
        <Textarea key={variant} variant={variant} placeholder={`Variant: ${variant}`} />
      ))}
    </div>
  ),
};

export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['default', 'error', 'warning', 'success'] as const).map((status) => (
        <Textarea key={status} status={status} placeholder={`Status: ${status}`} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { placeholder: 'This textarea is disabled', disabled: true },
};

export const ReadOnly: Story = {
  args: { value: 'This content is read-only and cannot be modified.', readOnly: true },
};

export const WithCounter: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Textarea placeholder="Character count without limit" showCount />
      <Textarea placeholder="Max 100 characters" showCount maxLength={100} />
    </div>
  ),
};

export const Resizable: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Textarea placeholder="Fixed rows (4 default)" rows={4} />
      <Textarea placeholder="Auto resize enabled" autoSize />
      <Textarea placeholder="Auto resize with min/max rows" autoSize={{ minRows: 2, maxRows: 6 }} />
    </div>
  ),
};

export const WithAllowClear: Story = {
  args: {
    placeholder: 'Type something then clear it',
    allowClear: true,
    defaultValue: 'Click the clear button to remove this text',
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the Textarea component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Textarea rendered by Classic (Ant Design), Modern (DS tokens), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Textarea}
      props={{ placeholder: 'Enter text...', rows: 3 }}
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
      component={Textarea}
      baseProps={{ placeholder: 'Textarea', rows: 2 }}
      sizeProp="size"
      sizes={['sm', 'md', 'lg']}
    />
  ),
};

/**
 * Status comparison across engines.
 */
export const StatusMatrix: Story = {
  name: '⚠️ Status × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Textarea}
      baseProps={{ placeholder: 'Textarea', rows: 2 }}
      variantProp="status"
      variants={['default', 'error', 'warning', 'success']}
    />
  ),
};

/**
 * Modern-engine state matrix: rest, filled, statuses, disabled, read-only,
 * clear, count, sizes, and a long Arabic RTL value.
 */
export const ModernStateMatrix: Story = {
  name: 'Modern State Matrix',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
      <Textarea engine="modern" placeholder="Rest" rows={2} />
      <Textarea engine="modern" defaultValue="Filled with a longer value that keeps flowing across lines without clipping the clear action." allowClear rows={2} />
      <Textarea engine="modern" status="error" defaultValue="Invalid entry" rows={2} />
      <Textarea engine="modern" status="warning" defaultValue="Needs review" rows={2} />
      <Textarea engine="modern" status="success" defaultValue="Approved" rows={2} />
      <Textarea engine="modern" defaultValue="Read only value" readOnly rows={2} />
      <Textarea engine="modern" defaultValue="Disabled value" disabled rows={2} />
      <Textarea engine="modern" showCount maxLength={120} defaultValue="Counted" rows={2} />
      <Textarea engine="modern" size="sm" placeholder="Small" rows={2} />
      <Textarea engine="modern" size="lg" placeholder="Large" rows={2} />
      <div dir="rtl" lang="ar">
        <Textarea
          engine="modern"
          allowClear
          showCount
          maxLength={280}
          defaultValue="هذه سيرة ذاتية طويلة عمداً لاختبار التفاف النص العربي داخل الحقل دون اقتطاع أو تداخل مع زر المسح أو عداد الأحرف."
          rows={3}
        />
      </div>
    </div>
  ),
};
