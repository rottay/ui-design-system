/**
 * @fileoverview Card Component Stories
 * @description Storybook stories for the Card component, showcasing all variants,
 * engines, compound components, and interactive states.
 *
 * Colocated with component following approved architecture.
 *
 * @module Card/stories
 * @package @es-rottay/designsystem-core
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './';
import { DesignSystemProvider } from '../../../../design-system';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

/**
 * Card component meta configuration for Storybook.
 */
const meta: Meta<typeof Card> = {
  title: 'Primitives/Display/Card',
  component: Card,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Card component for displaying content in a contained, styled container.

## Features
- Multiple visual variants (elevated, outlined, filled, ghost)
- Three rendering engines (Classic, Modern, Rustic)
- Compound components (Header, Body, Footer, Image)
- Loading state with skeleton
- Hover and click interactions
- Configurable padding, radius, and shadow

## Usage
\`\`\`tsx
import { Card } from '@es-rottay/designsystem-core';

<Card variant="elevated">
  <Card.Header title="Card Title" subtitle="Subtitle" />
  <Card.Body>Content goes here</Card.Body>
  <Card.Footer actions={[<Button>Action</Button>]} />
</Card>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'filled', 'ghost'],
      description: 'Visual style variant',
      table: {
        defaultValue: { summary: 'elevated' },
      },
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Content padding size',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    radius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Border radius size',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    hoverable: {
      control: 'boolean',
      description: 'Enable hover effects',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    clickable: {
      control: 'boolean',
      description: 'Make card clickable with cursor pointer',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    bordered: {
      control: 'boolean',
      description: 'Show border',
      table: {
        defaultValue: { summary: 'true' },
      },
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
type Story = StoryObj<typeof Card>;

/**
 * Default Card story with basic content.
 */
export const Default: Story = {
  args: {
    children: (
      <p style={{ margin: 0 }}>
        This is a basic card with default settings. Cards are versatile containers
        for displaying related content and actions.
      </p>
    ),
  },
};

/**
 * Card with compound components showing full structure.
 */
export const WithCompoundComponents: Story = {
  render: () => (
    <Card variant="elevated">
      <Card.Header
        title="Card Title"
        subtitle="A brief description of the card content"
      />
      <Card.Body>
        <p style={{ margin: 0 }}>
          This card demonstrates the use of compound components for structured layouts.
          Use Card.Header, Card.Body, and Card.Footer to organize your content.
        </p>
      </Card.Body>
      <Card.Footer divider align="end">
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #d9d9d9',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            background: '#1890ff',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </Card.Footer>
    </Card>
  ),
};

/**
 * All visual variants displayed together.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['elevated', 'outlined', 'filled', 'ghost'] as const).map((variant) => (
        <Card key={variant} variant={variant} padding="md">
          <Card.Header title={`${variant.charAt(0).toUpperCase() + variant.slice(1)} Variant`} />
          <Card.Body>
            <p style={{ margin: 0 }}>
              This is the {variant} variant of the Card component.
            </p>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};

/**
 * Card with image using Card.Image compound component.
 */
export const WithImage: Story = {
  render: () => (
    <Card variant="elevated" padding="none">
      <Card.Image
        src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=200&fit=crop"
        alt="Beautiful landscape"
        height={200}
      />
      <Card.Header title="Mountain Vista" subtitle="Nature Photography" />
      <Card.Body>
        <p style={{ margin: 0 }}>
          A stunning view of mountain landscapes captured during golden hour.
        </p>
      </Card.Body>
      <Card.Footer divider>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            background: '#1890ff',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          View Details
        </button>
      </Card.Footer>
    </Card>
  ),
};

/**
 * Interactive card with hover effects.
 */
export const Hoverable: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Card hoverable style={{ flex: 1 }}>
        <Card.Header title="Hoverable Card" />
        <Card.Body>
          <p style={{ margin: 0 }}>Hover over this card to see the shadow effect.</p>
        </Card.Body>
      </Card>
      <Card hoverable clickable onClick={() => alert('Card clicked!')} style={{ flex: 1 }}>
        <Card.Header title="Clickable Card" />
        <Card.Body>
          <p style={{ margin: 0 }}>This card is both hoverable and clickable.</p>
        </Card.Body>
      </Card>
    </div>
  ),
};

/**
 * Card in loading state.
 */
export const Loading: Story = {
  args: {
    loading: true,
    children: (
      <>
        <Card.Header title="Loading Card" />
        <Card.Body>
          <p>This content is hidden while loading.</p>
        </Card.Body>
      </>
    ),
  },
};

/**
 * Different padding sizes.
 */
export const PaddingSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <Card key={padding} variant="outlined" padding={padding}>
          <Card.Header title={`Padding: ${padding}`} />
          <Card.Body padding={padding}>
            <p style={{ margin: 0, background: '#f0f0f0', padding: '8px' }}>
              Content with {padding} padding
            </p>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};

/**
 * Different border radius sizes.
 */
export const RadiusSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
      {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((radius) => (
        <Card key={radius} variant="elevated" radius={radius} style={{ width: '150px' }}>
          <Card.Body>
            <p style={{ margin: 0, textAlign: 'center' }}>radius: {radius}</p>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Card across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Card rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Card}
      props={{ children: <p style={{ margin: 0 }}>Card content</p>, variant: 'elevated' }}
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
        story: 'Complete matrix of all card variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Card}
      baseProps={{ children: <p style={{ margin: 0 }}>Content</p>, padding: 'md' }}
      variantProp="variant"
      variants={['elevated', 'outlined', 'filled', 'ghost']}
    />
  ),
};

/**
 * Card with header avatar and extra content.
 */
export const WithHeaderAvatar: Story = {
  render: () => (
    <Card variant="outlined">
      <Card.Header
        title="John Doe"
        subtitle="Software Engineer"
        avatar={
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            JD
          </div>
        }
        extra={
          <button
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Follow
          </button>
        }
        divider
      />
      <Card.Body>
        <p style={{ margin: 0 }}>
          Passionate about building great user experiences and scalable systems.
          Currently working on design systems and component libraries.
        </p>
      </Card.Body>
    </Card>
  ),
};

/**
 * Card grid layout example.
 */
export const CardGrid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        maxWidth: '600px',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} variant="elevated" hoverable>
          <Card.Header title={`Card ${i}`} />
          <Card.Body>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Grid item {i} content
            </p>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};
