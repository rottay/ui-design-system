/**
 * @fileoverview Badge Component Stories
 * @description Storybook stories for the Badge component demonstrating
 * all variants, sizes, positions, and engine implementations.
 * Colocated with component following approved architecture.
 * @module components/primitives/display/Badge/stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './';
import { Avatar } from '../Avatar';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

/**
 * Badge component for displaying counts, status indicators, or labels.
 * Can be used standalone or positioned over other elements like avatars or icons.
 */
const meta: Meta<typeof Badge> = {
  title: 'Primitives/Display/Badge',
  component: Badge,
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
The Badge component displays counts, status indicators, or labels that can be
positioned over other elements or used as standalone elements. It supports
multiple engines (Classic, Modern, Rustic) for different UI library implementations.

## Features
- One tokenized anatomy for badge, chip and pill roles
- Multiple size and density variants (xs, sm, md, lg, xl)
- Semantic tones plus solid, outline, soft and ghost treatments
- Icon, avatar, dot, label, count, loading and localized remove anatomy
- Selected, interactive, disabled and loading states with native controls
- Logical overlay positions that mirror in RTL (physical aliases remain compatible)
- Long-copy truncation, container adaptation and coarse-pointer touch targets
- Reduced-motion and forced-colors safeguards
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the badge',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'],
      description: 'Color variant of the badge',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    badgeStyle: {
      control: 'select',
      options: ['solid', 'outline', 'soft', 'ghost'],
      description: 'Visual style of the badge',
      table: {
        defaultValue: { summary: 'soft' },
      },
    },
    position: {
      control: 'select',
      options: [
        'top-start',
        'top-end',
        'bottom-start',
        'bottom-end',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ],
      description: 'Position when badge overlays an element',
      table: {
        defaultValue: { summary: 'top-end' },
      },
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    count: {
      control: 'number',
      description: 'Numeric count to display',
    },
    content: {
      control: 'text',
      description: 'Text content to display (alternative to count)',
    },
    dot: {
      control: 'boolean',
      description: 'Show as a small dot indicator',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    pulse: {
      control: 'boolean',
      description: 'Enable pulse animation',
    },
    showZero: {
      control: 'boolean',
      description: 'Show badge when count is zero',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    max: {
      control: 'number',
      description: 'Maximum count before showing overflow (e.g., "99+")',
      table: {
        defaultValue: { summary: '99' },
      },
    },
    bordered: {
      control: 'boolean',
      description: 'Show border around badge',
    },
    closable: {
      control: 'boolean',
      description: 'Deprecated compatibility alias for removable',
    },
    removable: {
      control: 'boolean',
      description: 'Show a remove control; requires localized removeLabel when true',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

/**
 * Default badge with a count displayed over an element.
 */
export const Default: Story = {
  args: {
    count: 5,
    variant: 'error',
  },
  render: (args) => (
    <Badge {...args}>
      <div style={{
        width: 40,
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        Icon
      </div>
    </Badge>
  ),
};

/**
 * Standalone badge without children, used as a label or tag.
 */
export const Standalone: Story = {
  args: {
    content: 'New',
    variant: 'primary',
    size: 'md',
  },
};

/**
 * Different size variants of the badge.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Badge key={size} count={5} size={size} variant="primary">
          <div style={{
            width: 40,
            height: 40,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
          }}>
            {size}
          </div>
        </Badge>
      ))}
    </div>
  ),
};

/**
 * Different color variants of the badge.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'] as const).map((variant) => (
        <Badge key={variant} content={variant} variant={variant} />
      ))}
    </div>
  ),
};

/**
 * Different visual styles of the badge.
 */
export const Styles: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {(['solid', 'outline', 'soft', 'ghost'] as const).map((badgeStyle) => (
        <Badge key={badgeStyle} content={badgeStyle} variant="primary" badgeStyle={badgeStyle} />
      ))}
    </div>
  ),
};

/**
 * Badge positions when overlaying an element.
 */
export const Positions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48 }}>
      {(['top-start', 'top-end', 'bottom-start', 'bottom-end'] as const).map((position) => (
        <Badge key={position} count={5} position={position} variant="error">
          <div style={{
            width: 48,
            height: 48,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
          }}>
            {position}
          </div>
        </Badge>
      ))}
    </div>
  ),
};

/**
 * Dot indicator badges for status display.
 */
export const DotIndicator: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      {(['primary', 'success', 'warning', 'error'] as const).map((variant) => (
        <Badge key={variant} dot variant={variant}>
          <div style={{
            width: 40,
            height: 40,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
          }} />
        </Badge>
      ))}
    </div>
  ),
};

/**
 * Badge with pulse animation for notifications.
 */
export const WithPulse: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Badge count={3} pulse variant="error">
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
        }} />
      </Badge>
      <Badge dot pulse variant="error">
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
        }} />
      </Badge>
    </div>
  ),
};

/**
 * Badge with overflow count (shows "99+" when count exceeds max).
 */
export const OverflowCount: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Badge count={50} max={99} variant="error">
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
        }}>
          50
        </div>
      </Badge>
      <Badge count={100} max={99} variant="error">
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
        }}>
          100
        </div>
      </Badge>
      <Badge count={1000} max={999} variant="error">
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
        }}>
          1000
        </div>
      </Badge>
    </div>
  ),
};

/**
 * Badge with border around it.
 */
export const Bordered: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Badge count={5} bordered variant="error">
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: '#1890ff',
          borderRadius: '50%',
        }} />
      </Badge>
      <Badge dot bordered variant="success">
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: '#1890ff',
          borderRadius: '50%',
        }} />
      </Badge>
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Badge across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Badge rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Badge}
      props={{ content: 'New', variant: 'primary' }}
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
        story: 'Complete matrix of all badge variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Badge}
      baseProps={{ content: 'Badge' }}
      variantProp="variant"
      variants={['default', 'primary', 'secondary', 'success', 'warning', 'error']}
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
        story: 'Complete matrix of all badge sizes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Badge}
      baseProps={{ content: '5', variant: 'primary' }}
      sizeProp="size"
      sizes={['xs', 'sm', 'md', 'lg', 'xl']}
    />
  ),
};

/**
 * Badge with close button functionality.
 */
export const Closable: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Badge
        content="Closable"
        variant="primary"
        removable
        removeLabel="Remove Closable"
        onClose={() => alert('Badge closed!')}
      />
      <Badge
        content="Error"
        variant="error"
        removable
        removeLabel="Remove Error"
        onClose={() => alert('Error badge closed!')}
      />
    </div>
  ),
};

/**
 * Clickable badge with onClick handler.
 */
export const Clickable: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Badge
        content="Click me"
        variant="primary"
        clickable
        onClick={() => alert('Badge clicked!')}
      />
      <Badge
        count={10}
        variant="error"
        onClick={() => alert('Notification clicked!')}
      >
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
        }} />
      </Badge>
    </div>
  ),
};

/**
 * Badge showing zero count behavior.
 */
export const ShowZero: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 12 }}>showZero: false (default)</p>
        <Badge count={0} variant="error">
          <div style={{
            width: 40,
            height: 40,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
          }} />
        </Badge>
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 12 }}>showZero: true</p>
        <Badge count={0} showZero variant="error">
          <div style={{
            width: 40,
            height: 40,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
          }} />
        </Badge>
      </div>
    </div>
  ),
};

/** Premium anatomy and state coverage for the shared compact-label family. */
export const PremiumCompactLabelFamily: Story = {
  name: 'Premium · Badge / Chip / Pill anatomy',
  parameters: {
    docs: {
      description: {
        story: 'One tokenized anatomy across passive labels, status pills, selectable filters, counts, identity, removal, disabled and loading states.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ds-spacing-lg)', maxWidth: 760 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-sm)' }}>
        <Badge kind="badge" tone="success" icon={<StatusSuccessIcon decorative />}>
          Verified
        </Badge>
        <Badge kind="pill" tone="primary" dot selected>
          Interview ready
        </Badge>
        <Badge kind="chip" count={18} selected onSelectedChange={() => undefined}>
          Active candidates
        </Badge>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-sm)' }}>
        <Badge
          kind="chip"
          avatar={<Avatar initials="LF" size="xs" />}
          removable
          removeLabel="Remove Lucía Fernández"
          onClose={() => undefined}
        >
          Lucía Fernández
        </Badge>
        <Badge kind="pill" disabled onClick={() => undefined} aria-label="Archived filter">
          Archived
        </Badge>
        <Badge
          kind="pill"
          loading
          loadingText="Updating recommendation"
          onClick={() => undefined}
          aria-label="AI recommendation"
        >
          AI recommendation
        </Badge>
      </div>
    </div>
  ),
};

/** Long-copy, translated accessible labels and logical RTL layout. */
export const LocalizedLongCopyAndRtl: Story = {
  name: 'Premium · locale, overflow & RTL',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ds-spacing-lg)', maxWidth: 520 }}>
      <Badge
        kind="chip"
        count={24}
        removable
        removeLabel="Quitar filtro de candidatos recomendados"
      >
        Candidatos recomendados con disponibilidad inmediata y experiencia verificada
      </Badge>
      <div dir="rtl">
        <Badge
          kind="chip"
          count={12}
          selected
          removable
          removeLabel="إزالة عامل تصفية المرشحين"
        >
          المرشحون الموصى بهم ذوو الخبرة الموثقة والتوفر الفوري
        </Badge>
      </div>
    </div>
  ),
};


// ============================================================================
// State Matrix Stories (K1 Lane A)
// ============================================================================

const matrixLabel = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  opacity: 0.55,
  marginBottom: 8,
} as const;

/**
 * Full interaction-state matrix for the modern engine: rest, selected,
 * disabled, loading, pulse and removable across kinds and treatments.
 * Hover/pressed/focus-visible are skin-owned and verifiable by pointer and
 * keyboard directly on the interactive cells.
 */
export const InteractionStateMatrix: Story = {
  name: '🧪 Interaction State Matrix',
  render: () => (
    <div style={{ display: 'grid', gap: 20, maxWidth: 640 }}>
      <div>
        <div style={matrixLabel}>Rest × treatment × tone</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['solid', 'soft', 'outline', 'ghost'] as const).map((badgeStyle) => (
            <Badge key={badgeStyle} kind="chip" badgeStyle={badgeStyle} tone="primary">
              {badgeStyle}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Interactive states (hover / pressed / focus-visible)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Badge kind="chip" clickable onClick={() => undefined} aria-label="Rest filter">
            Rest
          </Badge>
          <Badge kind="chip" selected onSelectedChange={() => undefined} aria-label="Selected filter">
            Selected
          </Badge>
          <Badge kind="chip" disabled onClick={() => undefined} aria-label="Disabled filter">
            Disabled
          </Badge>
          <Badge kind="chip" loading loadingText="Loading filter" onClick={() => undefined}>
            Loading
          </Badge>
          <Badge kind="chip" pulse tone="danger">
            Pulse
          </Badge>
          <Badge kind="chip" removable removeLabel="Remove filter" onClose={() => undefined}>
            Removable
          </Badge>
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Counts & dot</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Badge count={0} showZero kind="pill" />
          <Badge count={7} kind="pill" tone="primary" />
          <Badge count={99} kind="pill" tone="success" />
          <Badge count={128} max={99} kind="pill" tone="danger" />
          <Badge dot tone="success" aria-label="Active" />
          <Badge kind="chip" icon={<span>★</span>} count={4} tone="warning">
            Watching
          </Badge>
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Truncation (narrow collection, no mid-word wraps)</div>
        <div style={{ display: 'flex', gap: 8, maxWidth: 260, overflow: 'hidden' }}>
          <Badge kind="chip" tone="primary">
            Recomendaciones destacadas
          </Badge>
          <Badge kind="chip" variant="secondary">
            Candidatos con disponibilidad inmediata
          </Badge>
        </div>
      </div>
    </div>
  ),
};
