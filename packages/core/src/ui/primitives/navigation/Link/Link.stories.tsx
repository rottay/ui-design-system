/**
 * NavLink Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { NavLink } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof NavLink> = {
  title: 'Primitives/Navigation/NavLink',
  component: NavLink,
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
        component: 'NavLink component for navigation with support for multiple engines.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
      description: 'NavLink color type',
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
type Story = StoryObj<typeof NavLink>;

export const Default: Story = {
  args: {
    href: 'https://example.com',
    children: 'Default NavLink',
    type: 'default',
  },
};

export const Disabled: Story = {
  args: {
    href: 'https://example.com',
    children: 'Disabled NavLink',
    disabled: true,
  },
};

export const External: Story = {
  args: {
    href: 'https://example.com',
    children: 'External NavLink (opens in new tab)',
    external: true,
  },
};

export const WithIcon: Story = {
  render: () => (
    <NavLink href="https://example.com" external>
      Visit Site <span style={{ marginLeft: 4 }}>-&gt;</span>
    </NavLink>
  ),
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as const).map((type) => (
        <NavLink key={type} href="#" type={type}>
          {type.charAt(0).toUpperCase() + type.slice(1)} NavLink
        </NavLink>
      ))}
    </div>
  ),
};

export const NoUnderline: Story = {
  args: {
    href: 'https://example.com',
    children: 'NavLink without underline',
    underline: false,
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of NavLink across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same NavLink rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={NavLink}
      props={{
        href: '#',
        children: 'Example NavLink',
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
            <NavLink key={type} href="#" type={type}>
              {type}
            </NavLink>
          ))}
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Underline policy</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <NavLink href="#">Underlined (default)</NavLink>
          <NavLink href="#" underline={false}>
            Standalone (reveals on hover)
          </NavLink>
        </div>
      </div>
      <div>
        <div style={matrixLabel}>External & disabled</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'baseline' }}>
          <NavLink href="https://example.com" external>
            External with affordance
          </NavLink>
          <NavLink href="https://example.com" external externalIcon={false}>
            External, icon suppressed
          </NavLink>
          <NavLink href="/blocked" disabled>
            Disabled
          </NavLink>
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Inline within body copy</div>
        <p style={{ margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
          Review the <NavLink href="#">shortlisted candidates</NavLink> before Friday, or open the{' '}
          <NavLink href="https://example.com" external>
            public job posting
          </NavLink>{' '}
          in a new tab. Disabled entries such as <NavLink href="/archived" disabled>archived searches</NavLink>{' '}
          stay muted and unreachable.
        </p>
      </div>
    </div>
  ),
};
