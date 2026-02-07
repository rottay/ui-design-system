/**
 * Tag Stories
 * Colocated with component following approved architecture.
 *
 * @module Tag/stories
 * @description Storybook stories demonstrating the Tag component's
 * features, variants, and engine implementations.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tag } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

/**
 * Star icon for demonstration purposes.
 */
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 0l1.854 3.756L12 4.362l-3 2.923.708 4.131L6 9.262l-3.708 2.154.708-4.131-3-2.923 4.146-.606L6 0z" />
  </svg>
);

/**
 * Check icon for demonstration purposes.
 */
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const meta: Meta<typeof Tag> = {
  title: 'Primitives/Display/Tag',
  component: Tag,
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
Tag component for displaying labels, categories, and status indicators.

Features:
- Multiple size variants (xs, sm, md, lg, xl)
- Semantic color variants (default, primary, secondary, success, warning, error)
- Closable tags with callback
- Icon support
- Clickable state
- Outline and bordered styles
- Customizable border radius
- Engine-agnostic (classic, modern, rustic)
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the tag',
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error'],
      description: 'Color variant of the tag',
    },
    radius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Border radius of the tag',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    closable: {
      control: 'boolean',
      description: 'Whether the tag can be closed',
    },
    bordered: {
      control: 'boolean',
      description: 'Whether the tag has a border',
    },
    outlined: {
      control: 'boolean',
      description: 'Whether the tag uses outline style',
    },
    clickable: {
      control: 'boolean',
      description: 'Whether the tag is clickable',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tag>;

/**
 * Default tag with basic configuration.
 */
export const Default: Story = {
  args: {
    children: 'Tag',
    size: 'md',
    variant: 'default',
  },
};

/**
 * Demonstrates all available size variants.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Tag key={size} size={size} variant="primary">
          {size.toUpperCase()}
        </Tag>
      ))}
    </div>
  ),
};

/**
 * Demonstrates all semantic color variants.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const).map((variant) => (
        <Tag key={variant} variant={variant}>
          {variant.charAt(0).toUpperCase() + variant.slice(1)}
        </Tag>
      ))}
    </div>
  ),
};

/**
 * Demonstrates outlined style tags.
 */
export const Outlined: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const).map((variant) => (
        <Tag key={variant} variant={variant} outlined>
          {variant.charAt(0).toUpperCase() + variant.slice(1)}
        </Tag>
      ))}
    </div>
  ),
};

/**
 * Demonstrates bordered tags with solid background.
 */
export const Bordered: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {(['primary', 'secondary', 'success'] as const).map((variant) => (
        <Tag key={variant} variant={variant} bordered>
          Bordered {variant}
        </Tag>
      ))}
    </div>
  ),
};

/**
 * Demonstrates different border radius options.
 */
export const BorderRadius: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {(['none', 'sm', 'md', 'lg', 'full'] as const).map((radius) => (
        <Tag key={radius} variant="primary" radius={radius}>
          {radius}
        </Tag>
      ))}
    </div>
  ),
};

/**
 * Demonstrates closable tags with callback.
 */
export const Closable: Story = {
  render: function ClosableExample() {
    const [tags, setTags] = useState(['React', 'TypeScript', 'Vite', 'Storybook']);

    const handleClose = (tagToRemove: string) => {
      setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const resetTags = () => {
      setTags(['React', 'TypeScript', 'Vite', 'Storybook']);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <Tag key={tag} variant="primary" closable onClose={() => handleClose(tag)}>
              {tag}
            </Tag>
          ))}
        </div>
        {tags.length === 0 && (
          <button onClick={resetTags} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Reset Tags
          </button>
        )}
      </div>
    );
  },
};

/**
 * Demonstrates tags with icons.
 */
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Tag icon={<StarIcon />} variant="warning">
        Featured
      </Tag>
      <Tag icon={<CheckIcon />} variant="success">
        Verified
      </Tag>
      <Tag icon={<StarIcon />} variant="primary" closable>
        Premium
      </Tag>
    </div>
  ),
};

/**
 * Demonstrates clickable tags.
 */
export const Clickable: Story = {
  render: function ClickableExample() {
    const [selected, setSelected] = useState<string | null>(null);

    const tags = ['JavaScript', 'Python', 'Rust', 'Go'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <Tag
              key={tag}
              variant={selected === tag ? 'primary' : 'default'}
              clickable
              onClick={() => setSelected(tag)}
            >
              {tag}
            </Tag>
          ))}
        </div>
        {selected && <p>Selected: {selected}</p>}
      </div>
    );
  },
};

/**
 * Demonstrates Tag.Group compound component.
 */
export const TagGroupExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Horizontal (default)</h4>
        <Tag.Group gap="md">
          <Tag variant="primary">React</Tag>
          <Tag variant="secondary">TypeScript</Tag>
          <Tag variant="success">Node.js</Tag>
          <Tag variant="warning">GraphQL</Tag>
        </Tag.Group>
      </div>

      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Vertical</h4>
        <Tag.Group direction="vertical" gap="sm">
          <Tag variant="primary">Frontend</Tag>
          <Tag variant="secondary">Backend</Tag>
          <Tag variant="success">DevOps</Tag>
        </Tag.Group>
      </div>
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Tag across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Tag rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Tag}
      props={{ children: 'Tag', variant: 'primary' }}
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
        story: 'Complete matrix of all tag variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Tag}
      baseProps={{ children: 'Tag' }}
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
        story: 'Complete matrix of all tag sizes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Tag}
      baseProps={{ children: 'Tag', variant: 'primary' }}
      sizeProp="size"
      sizes={['xs', 'sm', 'md', 'lg', 'xl']}
    />
  ),
};

/**
 * Demonstrates custom color usage.
 */
export const CustomColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Tag color="#ff6b6b">Custom Red</Tag>
      <Tag color="#4ecdc4">Custom Teal</Tag>
      <Tag color="#ffe66d">Custom Yellow</Tag>
      <Tag color="#95e1d3">Custom Mint</Tag>
    </div>
  ),
};

/**
 * Demonstrates tags in different UI contexts.
 */
export const UseCases: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Status indicators */}
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Status Indicators</h4>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Tag variant="success" radius="full">Active</Tag>
          <Tag variant="warning" radius="full">Pending</Tag>
          <Tag variant="error" radius="full">Inactive</Tag>
        </div>
      </div>

      {/* Category tags */}
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Categories</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag variant="primary" size="sm">Technology</Tag>
          <Tag variant="secondary" size="sm">Design</Tag>
          <Tag variant="default" size="sm">Business</Tag>
        </div>
      </div>

      {/* Filter tags */}
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Filters</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag outlined closable>Price: $10-$50</Tag>
          <Tag outlined closable>Color: Blue</Tag>
          <Tag outlined closable>Size: Large</Tag>
        </div>
      </div>
    </div>
  ),
};
