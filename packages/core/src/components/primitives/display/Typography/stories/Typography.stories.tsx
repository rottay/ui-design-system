/**
 * Typography Stories
 *
 * Storybook stories for Typography components (Heading, Text, Paragraph).
 * Colocated with component following approved architecture.
 *
 * @module Typography/stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Heading, Text, Paragraph } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

/**
 * Typography component family for rendering headings, text, and paragraphs.
 *
 * The Typography namespace provides three sub-components:
 * - **Heading**: Semantic heading elements (h1-h6) with customizable visual size
 * - **Text**: Inline text with decorations (underline, italic, etc.)
 * - **Paragraph**: Block-level text with optimized line-height
 *
 * All components support multiple engines (titan, hermes, apollo) for
 * consistent behavior across different styling frameworks.
 */
const meta: Meta<typeof Typography.Heading> = {
  title: 'Primitives/Display/Typography',
  component: Typography.Heading,
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
        component:
          'Typography components for headings, text, and paragraphs with support for multiple engines.',
      },
    },
  },
  argTypes: {
    level: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'Semantic heading level',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
      description: 'Visual text size',
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight',
    },
    color: {
      control: 'select',
      options: ['default', 'muted', 'primary', 'success', 'warning', 'error'],
      description: 'Semantic text color',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Typography.Heading>;

// ============================================================================
// Heading Stories
// ============================================================================

/**
 * Default heading with h2 level.
 */
export const Default: Story = {
  args: {
    level: 'h2',
    children: 'Default Heading',
  },
};

/**
 * All heading levels from h1 to h6.
 */
export const HeadingLevels: Story = {
  name: 'Heading - All Levels',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Heading level="h1">Heading Level 1</Heading>
      <Heading level="h2">Heading Level 2</Heading>
      <Heading level="h3">Heading Level 3</Heading>
      <Heading level="h4">Heading Level 4</Heading>
      <Heading level="h5">Heading Level 5</Heading>
      <Heading level="h6">Heading Level 6</Heading>
    </div>
  ),
};

/**
 * Heading with custom visual sizes (independent of semantic level).
 */
export const HeadingSizes: Story = {
  name: 'Heading - Custom Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((size) => (
        <Heading key={size} level="h2" size={size}>
          Size {size}
        </Heading>
      ))}
    </div>
  ),
};

/**
 * Heading color variants.
 */
export const HeadingColors: Story = {
  name: 'Heading - Colors',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['default', 'muted', 'primary', 'success', 'warning', 'error'] as const).map(
        (color) => (
          <Heading key={color} level="h3" color={color}>
            {color.charAt(0).toUpperCase() + color.slice(1)} Color
          </Heading>
        )
      )}
    </div>
  ),
};

// ============================================================================
// Text Stories
// ============================================================================

/**
 * Basic text component.
 */
export const TextDefault: Story = {
  name: 'Text - Default',
  render: () => <Text>This is default text content.</Text>,
};

/**
 * Text with various decorations.
 */
export const TextDecorations: Story = {
  name: 'Text - Decorations',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Text>Normal text</Text>
      <Text underline>Underlined text</Text>
      <Text strikethrough>Strikethrough text</Text>
      <Text italic>Italic text</Text>
      <Text monospace>Monospace text</Text>
      <Text underline italic>
        Combined underline and italic
      </Text>
    </div>
  ),
};

/**
 * Text sizes from xs to 3xl.
 */
export const TextSizes: Story = {
  name: 'Text - Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((size) => (
        <Text key={size} size={size}>
          Text size {size}
        </Text>
      ))}
    </div>
  ),
};

/**
 * Text color variants.
 */
export const TextColors: Story = {
  name: 'Text - Colors',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(['default', 'muted', 'primary', 'success', 'warning', 'error'] as const).map(
        (color) => (
          <Text key={color} color={color}>
            {color.charAt(0).toUpperCase() + color.slice(1)} colored text
          </Text>
        )
      )}
    </div>
  ),
};

/**
 * Text weight variants.
 */
export const TextWeights: Story = {
  name: 'Text - Weights',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(['normal', 'medium', 'semibold', 'bold'] as const).map((weight) => (
        <Text key={weight} weight={weight}>
          {weight.charAt(0).toUpperCase() + weight.slice(1)} weight
        </Text>
      ))}
    </div>
  ),
};

// ============================================================================
// Paragraph Stories
// ============================================================================

/**
 * Basic paragraph component.
 */
export const ParagraphDefault: Story = {
  name: 'Paragraph - Default',
  render: () => (
    <Paragraph>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris.
    </Paragraph>
  ),
};

/**
 * Paragraph with line clamping (truncation after N lines).
 */
export const ParagraphLineClamping: Story = {
  name: 'Paragraph - Line Clamping',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Text weight="semibold">2 lines max:</Text>
        <Paragraph lineClamp={2}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </Paragraph>
      </div>
      <div>
        <Text weight="semibold">3 lines max:</Text>
        <Paragraph lineClamp={3}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </Paragraph>
      </div>
    </div>
  ),
};

/**
 * Paragraph color variants.
 */
export const ParagraphColors: Story = {
  name: 'Paragraph - Colors',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(['default', 'muted', 'primary', 'success', 'warning', 'error'] as const).map(
        (color) => (
          <Paragraph key={color} color={color} style={{ marginBottom: 0 }}>
            {color.charAt(0).toUpperCase() + color.slice(1)} paragraph text for
            displaying content.
          </Paragraph>
        )
      )}
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Heading across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Typography.Heading rendered by Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Heading}
      props={{
        level: 'h2',
        children: 'Sample Heading Text',
        color: 'primary',
      }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all color variants across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant x Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all Heading color variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Heading}
      baseProps={{
        level: 'h3',
        children: 'Heading Text',
      }}
      variantProp="color"
      variants={['default', 'muted', 'primary', 'success', 'warning', 'error']}
    />
  ),
};

// ============================================================================
// Compound Pattern Stories
// ============================================================================

/**
 * Using the Typography compound pattern.
 */
export const CompoundPattern: Story = {
  name: 'Compound Pattern Usage',
  render: () => (
    <article>
      <Typography.Heading level="h1" size="3xl">
        Article Title
      </Typography.Heading>

      <Typography.Text color="muted" size="sm">
        Published on December 26, 2025
      </Typography.Text>

      <Typography.Heading level="h2" size="xl" style={{ marginTop: 24 }}>
        Introduction
      </Typography.Heading>

      <Typography.Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Typography.Paragraph>

      <Typography.Heading level="h2" size="xl" style={{ marginTop: 24 }}>
        Key Points
      </Typography.Heading>

      <Typography.Paragraph>
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
        nisi ut aliquip ex ea commodo consequat.
      </Typography.Paragraph>

      <Typography.Text color="primary" weight="semibold">
        Important:{' '}
      </Typography.Text>
      <Typography.Text>
        Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur.
      </Typography.Text>
    </article>
  ),
};

// ============================================================================
// Accessibility Stories
// ============================================================================

/**
 * Demonstrates semantic heading hierarchy for accessibility.
 */
export const SemanticHierarchy: Story = {
  name: 'Semantic Hierarchy (A11y)',
  render: () => (
    <article>
      <Heading level="h1" size="3xl">
        Main Page Title (h1)
      </Heading>

      <Heading level="h2" size="2xl" style={{ marginTop: 24 }}>
        Section Heading (h2)
      </Heading>

      <Paragraph>
        This paragraph follows an h2 heading. Screen readers will properly
        announce the document structure.
      </Paragraph>

      <Heading level="h3" size="xl" style={{ marginTop: 16 }}>
        Subsection Heading (h3)
      </Heading>

      <Paragraph>
        This paragraph follows an h3 heading, maintaining proper hierarchy.
      </Paragraph>

      <Heading level="h4" size="lg" style={{ marginTop: 16 }}>
        Minor Heading (h4)
      </Heading>

      <Text>
        Note: The visual size can be customized independently of the
        semantic level for design flexibility.
      </Text>
    </article>
  ),
};
