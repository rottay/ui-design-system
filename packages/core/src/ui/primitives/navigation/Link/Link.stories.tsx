/**
 * Link Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Link> = {
  title: 'Primitives/Navigation/Link',
  component: Link,
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
        component: 'Link component for navigation with support for multiple engines.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
      description: 'Link color type',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the link is disabled',
    },
    underline: {
      control: 'boolean',
      description: 'Whether to show underline',
    },
    external: {
      control: 'boolean',
      description: 'Open in new tab',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    href: 'https://example.com',
    children: 'Default Link',
    type: 'default',
  },
};

export const Disabled: Story = {
  args: {
    href: 'https://example.com',
    children: 'Disabled Link',
    disabled: true,
  },
};

export const External: Story = {
  args: {
    href: 'https://example.com',
    children: 'External Link (opens in new tab)',
    external: true,
  },
};

export const WithIcon: Story = {
  render: () => (
    <Link href="https://example.com" external>
      Visit Site <span style={{ marginLeft: 4 }}>-&gt;</span>
    </Link>
  ),
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as const).map((type) => (
        <Link key={type} href="#" type={type}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Link
        </Link>
      ))}
    </div>
  ),
};

export const NoUnderline: Story = {
  args: {
    href: 'https://example.com',
    children: 'Link without underline',
    underline: false,
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Link across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Link rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Link}
      props={{
        href: '#',
        children: 'Example Link',
        type: 'primary',
      }}
      showDescriptions
    />
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
 * Modern state matrix: types, underline policy, external affordance, disabled,
 * and inline-vs-standalone placement. Hover/pressed/visited/focus-visible are
 * skin-owned and verifiable by pointer and keyboard on the live cells.
 */
export const StateMatrix: Story = {
  name: '🧪 State Matrix',
  render: () => (
    <div style={{ display: 'grid', gap: 20, maxWidth: 560 }}>
      <div>
        <div style={matrixLabel}>Types</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {(['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as const).map((type) => (
            <Link key={type} href="#" type={type}>
              {type}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Underline policy</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <Link href="#">Underlined (default)</Link>
          <Link href="#" underline={false}>
            Standalone (reveals on hover)
          </Link>
        </div>
      </div>
      <div>
        <div style={matrixLabel}>External & disabled</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'baseline' }}>
          <Link href="https://example.com" external>
            External with affordance
          </Link>
          <Link href="https://example.com" external externalIcon={false}>
            External, icon suppressed
          </Link>
          <Link href="/blocked" disabled>
            Disabled
          </Link>
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Inline within body copy</div>
        <p style={{ margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
          Review the <Link href="#">shortlisted candidates</Link> before Friday, or open the{' '}
          <Link href="https://example.com" external>
            public job posting
          </Link>{' '}
          in a new tab. Disabled entries such as <Link href="/archived" disabled>archived searches</Link>{' '}
          stay muted and unreachable.
        </p>
      </div>
    </div>
  ),
};
