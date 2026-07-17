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
