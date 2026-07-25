/**
 * Input Stories
 * Storybook stories for Input component
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './';
import { FormField } from '../FormField';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
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
| Library | Ant Design | DS tokens (skin-painted) | Vanilla CSS |
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

/**
 * Pass-1 acceptance surface: every state shares one public anatomy and must
 * remain usable under long copy, narrow containers, RTL and async actions.
 */
export const ModernContractMatrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ds-spacing-5)', maxWidth: '52rem' }}>
      <FormField
        engine="modern"
        label="Candidate contact email with an intentionally long localized label"
        name="candidate-email"
        required
        help="This guidance remains in normal flow and can wrap without colliding with the control."
      >
        <Input
          engine="modern"
          type="email"
          prefix={<span aria-hidden="true">@</span>}
          clearable
          defaultValue="ada@example.com"
          size={{ base: 'sm', md: 'lg' }}
        />
      </FormField>

      <FormField
        engine="modern"
        label="Decision context"
        name="decision-context"
        error="Add a source before this evidence can be used in a final decision."
      >
        <Input.TextArea
          defaultValue="Evidence captured from the latest structured interview and ready"
          maxLength={68}
          showCount
          rows={4}
          loading
          resize="both"
        />
      </FormField>

      <Input.Group size="md">
        <Input.Addon position="before">https://</Input.Addon>
        <Input engine="modern" defaultValue="careers.example" aria-label="Careers domain" />
        <Input.Addon position="after">/candidates</Input.Addon>
      </Input.Group>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 15rem), 1fr))', gap: 'var(--ds-spacing-4)' }}>
        <Input.Password engine="modern" defaultValue="white-label" aria-label="Password" />
        <Input.Search engine="modern" loading defaultValue="Candidate search" aria-label="Search" />
        <Input engine="modern" readOnly value="Read-only verified value" aria-label="Verified value" />
        <Input engine="modern" disabled value="Disabled value" aria-label="Disabled value" />
        <Input engine="modern" status="success" value="Validated" aria-label="Validated value" />
        <Input engine="modern" status="warning" value="Review soon" aria-label="Warning value" />
      </div>

      <div dir="rtl" lang="ar">
        <FormField
          engine="modern"
          layout="horizontal"
          label="البريد الإلكتروني للمرشح"
          name="candidate-email-ar"
          help="يجب أن تبقى الرسالة واضحة ومحاذاة الحقول صحيحة في اتجاه الكتابة من اليمين إلى اليسار."
        >
          <Input engine="modern" type="email" suffix={<span aria-hidden="true">@</span>} clearable defaultValue="ada@example.com" />
        </FormField>
      </div>
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
        story: 'Compare the same Input rendered by Classic (Ant Design), Modern (DS tokens), and Rustic (Vanilla CSS).',
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

/**
 * Modern-engine state matrix: rest, filled, statuses, prefix/suffix, clear,
 * loading, count, disabled, read-only, and long Arabic RTL values.
 */
export const ModernStateMatrix: Story = {
  name: 'Modern State Matrix',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
      <Input engine="modern" placeholder="Rest" />
      <Input engine="modern" defaultValue="Filled value" clearable />
      <Input engine="modern" status="error" error errorMessage="This field is required and cannot stay empty when you submit the onboarding form." defaultValue="bad" />
      <Input engine="modern" status="warning" defaultValue="Review me" />
      <Input engine="modern" status="success" defaultValue="Looks good" />
      <Input engine="modern" prefix={<span aria-hidden="true">@</span>} placeholder="handle" />
      <Input engine="modern" suffix={<span aria-hidden="true">.com</span>} placeholder="domain" />
      <Input engine="modern" loading defaultValue="Checking…" />
      <Input engine="modern" showCount maxLength={40} defaultValue="Counted value" />
      <Input engine="modern" defaultValue="Read only" readOnly />
      <Input engine="modern" defaultValue="Disabled" disabled />
      <Input engine="modern" size="xs" placeholder="XS" />
      <Input engine="modern" size="xl" placeholder="XL" />
      <div dir="rtl" lang="ar">
        <Input
          engine="modern"
          clearable
          defaultValue="قيمة عربية طويلة عمداً لاختبار التفاف النص داخل الحقل دون اقتطاع أو تداخل مع زر المسح"
        />
      </div>
    </div>
  ),
};
