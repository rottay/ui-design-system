/**
 * Avatar Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Display/Avatar',
  component: Avatar,
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
Avatar component for displaying user images or initials with support for multiple engines.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Styling | CSS-in-JS | Tailwind | CSS Variables |
| Group Support | Full | Partial | Full |
| Badge Position | Configurable | Fixed | Configurable |
`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
      description: 'Size of the avatar',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Shape of the avatar',
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
      description: 'Color variant for avatar background',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    bordered: {
      control: 'boolean',
      description: 'Show border around avatar',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'User avatar',
    size: 'md',
  },
};

export const WithInitials: Story = {
  args: {
    children: 'JD',
    size: 'md',
    variant: 'primary',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
        <Avatar key={size} size={size} src={`https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`}>
          {size}
        </Avatar>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar shape="circle" src="https://i.pravatar.cc/150?img=5" />
      <Avatar shape="square" src="https://i.pravatar.cc/150?img=6" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as const).map((variant) => (
        <Avatar key={variant} variant={variant}>
          {variant.slice(0, 2).toUpperCase()}
        </Avatar>
      ))}
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Avatar across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Avatar rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Avatar}
      props={{ children: 'JD', size: 'md', variant: 'primary' }}
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
        story: 'Complete matrix of all avatar sizes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Avatar}
      baseProps={{ children: 'AB' }}
      sizeProp="size"
      sizes={['xs', 'sm', 'md', 'lg', 'xl']}
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
        story: 'Complete matrix of all avatar variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Avatar}
      baseProps={{ children: 'AB' }}
      variantProp="variant"
      variants={['default', 'primary', 'secondary', 'success', 'warning', 'danger']}
    />
  ),
};

export const Group: Story = {
  render: () => (
    <Avatar.Group max={3}>
      <Avatar src="https://i.pravatar.cc/150?img=1" />
      <Avatar src="https://i.pravatar.cc/150?img=2" />
      <Avatar src="https://i.pravatar.cc/150?img=3" />
      <Avatar src="https://i.pravatar.cc/150?img=4" />
      <Avatar src="https://i.pravatar.cc/150?img=5" />
    </Avatar.Group>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Avatar.Badge status="online">
        <Avatar src="https://i.pravatar.cc/150?img=1" />
      </Avatar.Badge>
      <Avatar.Badge status="offline">
        <Avatar src="https://i.pravatar.cc/150?img=2" />
      </Avatar.Badge>
      <Avatar.Badge status="busy">
        <Avatar src="https://i.pravatar.cc/150?img=3" />
      </Avatar.Badge>
      <Avatar.Badge status="away">
        <Avatar src="https://i.pravatar.cc/150?img=4" />
      </Avatar.Badge>
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
 * Interactive-state matrix: rest, clickable (hover/focus via pointer/keyboard),
 * ring, and every presence status across the core sizes. Pseudo states are
 * skin-owned; this grid pins the prop-representable contract.
 */
export const StateMatrix: Story = {
  name: '🧪 State Matrix',
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <div style={matrixLabel}>Rest × sizes</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((size) => (
            <Avatar key={size} size={size} name="Jane Doe" tone="primary" />
          ))}
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Interactive (hover / focus-visible / pressed)</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Avatar name="Jane Doe" tone="primary" clickable onClick={() => undefined} />
          <Avatar name="Jane Doe" variant="secondary" clickable onClick={() => undefined} ring />
          <Avatar src="https://i.pravatar.cc/150?img=8" clickable onClick={() => undefined} bordered />
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Presence × tone</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {(['online', 'offline', 'away', 'busy'] as const).map((status) => (
            <Avatar key={status} name="Jane Doe" variant="gradient" status={status} />
          ))}
          {(['online', 'offline', 'away', 'busy'] as const).map((status) => (
            <Avatar.Badge key={status} status={status}>
              <Avatar name="Ana Ruiz" size="sm" />
            </Avatar.Badge>
          ))}
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Shapes × variants</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {(['circle', 'rounded', 'square'] as const).map((shape) => (
            <Avatar key={shape} shape={shape} name="Jane Doe" tone="success" />
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * Content stress: single-character names, very long names, Arabic names,
 * missing every value, and a broken image falling back to initials.
 */
export const ContentStress: Story = {
  name: '🧪 Content Stress',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Avatar name="X" />
      <Avatar name="Alejandra Konstantinopoulos" />
      <Avatar name="فاطمة الزهراء" />
      <Avatar />
      <Avatar src="https://broken.invalid/avatar.png" name="Error Fallback" tone="danger" />
      <Avatar initials="DS" tone="warning" />
    </div>
  ),
};

/**
 * Group behavior: overflow surplus, exact-max boundary, single avatar, and an
 * RTL stack (row-reverse mirrors the overlap without a markup fork).
 */
export const GroupStates: Story = {
  name: '🧪 Group States',
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <div style={matrixLabel}>Overflow (max 3 of 6)</div>
        <Avatar.Group max={3}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Avatar key={n} name={`User Number${n}`} variant={n % 2 ? 'primary' : 'secondary'} />
          ))}
        </Avatar.Group>
      </div>
      <div>
        <div style={matrixLabel}>Exact max (no surplus)</div>
        <Avatar.Group max={2}>
          <Avatar name="Ana Ruiz" />
          <Avatar name="John Doe" />
        </Avatar.Group>
      </div>
      <div dir="rtl">
        <div style={matrixLabel}>RTL stack</div>
        <Avatar.Group max={3}>
          {[1, 2, 3, 4].map((n) => (
            <Avatar key={n} name={`مستخدم ${n}`} tone={n % 2 ? 'success' : 'primary'} />
          ))}
        </Avatar.Group>
      </div>
    </div>
  ),
};
