/**
 * Grid Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './';
import { DesignSystemProvider } from '../../../../runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';
import React from 'react';

const meta: Meta<typeof Grid> = {
  title: 'Primitives/Layout/Grid',
  component: Grid,
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
Grid is a CSS Grid layout component that provides a powerful way to create two-dimensional layouts.
It supports responsive columns, gap spacing, and advanced grid features.

### Features
- Configurable columns (1-12, 'auto', or responsive object)
- Gap/spacing presets (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
- Template columns and rows for advanced layouts
- Auto flow control (row, column, dense)
- Alignment and justification options
- Grid.Item compound component for spanning and positioning
- Polymorphic rendering with \`as\` prop
- Support for all three engines (Classic, Modern, Rustic)
        `,
      },
    },
  },
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6, 12, 'auto'],
      description: 'Number of columns in the grid',
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      description: 'Gap between grid items',
    },
    alignItems: {
      control: 'select',
      options: ['start', 'end', 'center', 'stretch', 'baseline'],
      description: 'Alignment of items along the block axis',
    },
    justifyItems: {
      control: 'select',
      options: ['start', 'end', 'center', 'stretch'],
      description: 'Alignment of items along the inline axis',
    },
    autoFlow: {
      control: 'select',
      options: ['row', 'column', 'dense', 'row dense', 'column dense'],
      description: 'Auto placement algorithm',
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
type Story = StoryObj<typeof Grid>;

// Helper component for grid items
const GridItemBox = ({ children, bg = '#3b82f6' }: { children: React.ReactNode; bg?: string }) => (
  <div
    style={{
      padding: '16px',
      background: bg,
      color: 'white',
      borderRadius: '8px',
      textAlign: 'center',
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

// Default story
export const Default: Story = {
  args: {
    columns: 3,
    gap: 'md',
  },
  render: (args) => (
    <Grid {...args}>
      <GridItemBox>Item 1</GridItemBox>
      <GridItemBox>Item 2</GridItemBox>
      <GridItemBox>Item 3</GridItemBox>
      <GridItemBox>Item 4</GridItemBox>
      <GridItemBox>Item 5</GridItemBox>
      <GridItemBox>Item 6</GridItemBox>
    </Grid>
  ),
};

// Column variations
export const ColumnVariations: Story = {
  name: 'Column Counts',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {[1, 2, 3, 4, 6, 12].map((cols) => (
        <div key={cols}>
          <h4 style={{ margin: '0 0 8px 0' }}>{cols} Column{cols > 1 ? 's' : ''}</h4>
          <Grid columns={cols as any} gap="sm">
            {Array.from({ length: cols }, (_, i) => (
              <GridItemBox key={i}>{i + 1}</GridItemBox>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  ),
};

// Gap variations
export const GapVariations: Story = {
  name: 'Gap Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((gap) => (
        <div key={gap}>
          <h4 style={{ margin: '0 0 8px 0' }}>gap="{gap}"</h4>
          <Grid columns={4} gap={gap}>
            {Array.from({ length: 4 }, (_, i) => (
              <GridItemBox key={i}>{i + 1}</GridItemBox>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  ),
};

// Separate row and column gaps
export const SeparateGaps: Story = {
  name: 'Row and Column Gaps',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>columnGap="lg" rowGap="sm"</h4>
        <Grid columns={3} columnGap="lg" rowGap="sm">
          {Array.from({ length: 6 }, (_, i) => (
            <GridItemBox key={i}>{i + 1}</GridItemBox>
          ))}
        </Grid>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>columnGap="sm" rowGap="xl"</h4>
        <Grid columns={3} columnGap="sm" rowGap="xl">
          {Array.from({ length: 6 }, (_, i) => (
            <GridItemBox key={i}>{i + 1}</GridItemBox>
          ))}
        </Grid>
      </div>
    </div>
  ),
};

// Grid.Item spanning
export const ItemSpanning: Story = {
  name: 'Grid.Item Spanning',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Column Spanning</h4>
        <Grid columns={4} gap="md">
          <Grid.Item span={2}>
            <GridItemBox bg="#8b5cf6">Span 2</GridItemBox>
          </Grid.Item>
          <Grid.Item>
            <GridItemBox>1</GridItemBox>
          </Grid.Item>
          <Grid.Item>
            <GridItemBox>1</GridItemBox>
          </Grid.Item>
          <Grid.Item>
            <GridItemBox>1</GridItemBox>
          </Grid.Item>
          <Grid.Item span={3}>
            <GridItemBox bg="#ec4899">Span 3</GridItemBox>
          </Grid.Item>
        </Grid>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Row Spanning</h4>
        <Grid columns={4} gap="md">
          <Grid.Item rowSpan={2}>
            <GridItemBox bg="#10b981" style={{ height: '100%' }}>
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Row Span 2
              </div>
            </GridItemBox>
          </Grid.Item>
          <Grid.Item>
            <GridItemBox>1</GridItemBox>
          </Grid.Item>
          <Grid.Item>
            <GridItemBox>2</GridItemBox>
          </Grid.Item>
          <Grid.Item>
            <GridItemBox>3</GridItemBox>
          </Grid.Item>
          <Grid.Item>
            <GridItemBox>4</GridItemBox>
          </Grid.Item>
          <Grid.Item>
            <GridItemBox>5</GridItemBox>
          </Grid.Item>
          <Grid.Item>
            <GridItemBox>6</GridItemBox>
          </Grid.Item>
        </Grid>
      </div>
    </div>
  ),
};

// Grid.Item positioning
export const ItemPositioning: Story = {
  name: 'Grid.Item Positioning',
  render: () => (
    <Grid columns={4} gap="md" style={{ minHeight: '300px' }}>
      <Grid.Item colStart={1} colEnd={3}>
        <GridItemBox bg="#f59e0b">Col 1-2</GridItemBox>
      </Grid.Item>
      <Grid.Item colStart={3} colEnd={5}>
        <GridItemBox bg="#ef4444">Col 3-4</GridItemBox>
      </Grid.Item>
      <Grid.Item colStart={2} colEnd={4}>
        <GridItemBox bg="#10b981">Col 2-3</GridItemBox>
      </Grid.Item>
      <Grid.Item colStart={1}>
        <GridItemBox>Auto</GridItemBox>
      </Grid.Item>
      <Grid.Item colStart={4}>
        <GridItemBox>Auto</GridItemBox>
      </Grid.Item>
    </Grid>
  ),
};

// Template columns
export const TemplateColumns: Story = {
  name: 'Template Columns',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Fixed + Fluid: "200px 1fr 200px"</h4>
        <Grid templateColumns="200px 1fr 200px" gap="md">
          <GridItemBox bg="#ef4444">200px</GridItemBox>
          <GridItemBox bg="#3b82f6">1fr</GridItemBox>
          <GridItemBox bg="#ef4444">200px</GridItemBox>
        </Grid>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Auto-fit: "repeat(auto-fit, minmax(150px, 1fr))"</h4>
        <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap="md">
          {Array.from({ length: 6 }, (_, i) => (
            <GridItemBox key={i}>{i + 1}</GridItemBox>
          ))}
        </Grid>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Fractional: "1fr 2fr 1fr"</h4>
        <Grid templateColumns="1fr 2fr 1fr" gap="md">
          <GridItemBox bg="#8b5cf6">1fr</GridItemBox>
          <GridItemBox bg="#ec4899">2fr</GridItemBox>
          <GridItemBox bg="#8b5cf6">1fr</GridItemBox>
        </Grid>
      </div>
    </div>
  ),
};

// Template areas
export const TemplateAreas: Story = {
  name: 'Template Areas',
  render: () => (
    <Grid
      templateColumns="200px 1fr 200px"
      templateRows="auto 1fr auto"
      templateAreas="'header header header' 'sidebar main aside' 'footer footer footer'"
      gap="md"
      minHeight="400px"
    >
      <Grid.Item area="header">
        <GridItemBox bg="#1e40af">Header</GridItemBox>
      </Grid.Item>
      <Grid.Item area="sidebar">
        <GridItemBox bg="#4f46e5">Sidebar</GridItemBox>
      </Grid.Item>
      <Grid.Item area="main">
        <GridItemBox bg="#0ea5e9">Main Content</GridItemBox>
      </Grid.Item>
      <Grid.Item area="aside">
        <GridItemBox bg="#8b5cf6">Aside</GridItemBox>
      </Grid.Item>
      <Grid.Item area="footer">
        <GridItemBox bg="#1e40af">Footer</GridItemBox>
      </Grid.Item>
    </Grid>
  ),
};

// Auto flow
export const AutoFlowVariations: Story = {
  name: 'Auto Flow',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>autoFlow="row" (default)</h4>
        <Grid columns={3} gap="md" autoFlow="row">
          <Grid.Item span={2}>
            <GridItemBox bg="#f59e0b">Span 2</GridItemBox>
          </Grid.Item>
          {Array.from({ length: 4 }, (_, i) => (
            <Grid.Item key={i}>
              <GridItemBox>{i + 1}</GridItemBox>
            </Grid.Item>
          ))}
        </Grid>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>autoFlow="dense" (fills gaps)</h4>
        <Grid columns={3} gap="md" autoFlow="dense">
          <Grid.Item span={2}>
            <GridItemBox bg="#f59e0b">Span 2</GridItemBox>
          </Grid.Item>
          {Array.from({ length: 4 }, (_, i) => (
            <Grid.Item key={i}>
              <GridItemBox>{i + 1}</GridItemBox>
            </Grid.Item>
          ))}
        </Grid>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>autoFlow="column"</h4>
        <Grid columns={3} gap="md" autoFlow="column" templateRows="repeat(3, 60px)">
          {Array.from({ length: 6 }, (_, i) => (
            <Grid.Item key={i}>
              <GridItemBox>{i + 1}</GridItemBox>
            </Grid.Item>
          ))}
        </Grid>
      </div>
    </div>
  ),
};

// Alignment
export const AlignmentOptions: Story = {
  name: 'Alignment',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {(['start', 'center', 'end', 'stretch'] as const).map((align) => (
        <div key={align}>
          <h4 style={{ margin: '0 0 8px 0' }}>alignItems="{align}"</h4>
          <Grid
            columns={3}
            gap="md"
            alignItems={align}
            style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}
          >
            <div style={{ height: '100px', background: '#3b82f6', borderRadius: '8px' }} />
            <div style={{ height: '60px', background: '#3b82f6', borderRadius: '8px' }} />
            <div style={{ height: '80px', background: '#3b82f6', borderRadius: '8px' }} />
          </Grid>
        </div>
      ))}
    </div>
  ),
};

// Justify items
export const JustifyOptions: Story = {
  name: 'Justify Items',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {(['start', 'center', 'end', 'stretch'] as const).map((justify) => (
        <div key={justify}>
          <h4 style={{ margin: '0 0 8px 0' }}>justifyItems="{justify}"</h4>
          <Grid
            columns={3}
            gap="md"
            justifyItems={justify}
            style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}
          >
            <div style={{ width: '80px', height: '60px', background: '#10b981', borderRadius: '8px' }} />
            <div style={{ width: '100px', height: '60px', background: '#10b981', borderRadius: '8px' }} />
            <div style={{ width: '60px', height: '60px', background: '#10b981', borderRadius: '8px' }} />
          </Grid>
        </div>
      ))}
    </div>
  ),
};

// Place items
export const PlaceItems: Story = {
  name: 'Place Items (center)',
  render: () => (
    <Grid
      columns={3}
      gap="md"
      placeItems="center"
      height="300px"
      style={{ background: '#f3f4f6', borderRadius: '8px' }}
    >
      <div style={{ width: '80px', height: '80px', background: '#ec4899', borderRadius: '8px' }} />
      <div style={{ width: '60px', height: '60px', background: '#8b5cf6', borderRadius: '8px' }} />
      <div style={{ width: '100px', height: '100px', background: '#f59e0b', borderRadius: '8px' }} />
    </Grid>
  ),
};

// Responsive columns
export const ResponsiveColumns: Story = {
  name: 'Responsive Columns',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', color: '#6b7280' }}>
        Resize the viewport to see columns change (xs: 1, sm: 2, md: 3, lg: 4)
      </p>
      <Grid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="md">
        {Array.from({ length: 8 }, (_, i) => (
          <GridItemBox key={i}>{i + 1}</GridItemBox>
        ))}
      </Grid>
    </div>
  ),
};

// Polymorphic as prop
export const PolymorphicElement: Story = {
  name: 'Polymorphic Elements',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Grid as="section" columns={3} gap="md">
        <GridItemBox bg="#fee2e2">as="section"</GridItemBox>
        <GridItemBox bg="#fee2e2">Item 2</GridItemBox>
        <GridItemBox bg="#fee2e2">Item 3</GridItemBox>
      </Grid>
      <Grid as="ul" columns={3} gap="md" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <Grid.Item as="li">
          <GridItemBox bg="#d1fae5">as="ul" / as="li"</GridItemBox>
        </Grid.Item>
        <Grid.Item as="li">
          <GridItemBox bg="#d1fae5">Item 2</GridItemBox>
        </Grid.Item>
        <Grid.Item as="li">
          <GridItemBox bg="#d1fae5">Item 3</GridItemBox>
        </Grid.Item>
      </Grid>
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Grid across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Grid rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Grid}
      props={{
        children: (
          <>
            <GridItemBox>Item 1</GridItemBox>
            <GridItemBox>Item 2</GridItemBox>
            <GridItemBox>Item 3</GridItemBox>
            <GridItemBox>Item 4</GridItemBox>
          </>
        ),
        columns: 2,
        gap: 'md',
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};

// Inline grid
export const InlineGrid: Story = {
  name: 'Inline Grid',
  render: () => (
    <div>
      <p>Text before the grid</p>
      <Grid inline columns={3} gap="sm" style={{ verticalAlign: 'middle' }}>
        <GridItemBox>1</GridItemBox>
        <GridItemBox>2</GridItemBox>
        <GridItemBox>3</GridItemBox>
      </Grid>
      <p>Text after the grid</p>
    </div>
  ),
};

// Grid item self alignment
export const GridItemSelfAlignment: Story = {
  name: 'Grid.Item Self Alignment',
  render: () => (
    <Grid columns={4} gap="md" height="200px" style={{ background: '#f3f4f6', borderRadius: '8px' }}>
      <Grid.Item alignSelf="start">
        <GridItemBox bg="#ef4444">alignSelf: start</GridItemBox>
      </Grid.Item>
      <Grid.Item alignSelf="center">
        <GridItemBox bg="#f59e0b">alignSelf: center</GridItemBox>
      </Grid.Item>
      <Grid.Item alignSelf="end">
        <GridItemBox bg="#10b981">alignSelf: end</GridItemBox>
      </Grid.Item>
      <Grid.Item alignSelf="stretch">
        <div style={{ height: '100%', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          alignSelf: stretch
        </div>
      </Grid.Item>
    </Grid>
  ),
};

// Dashboard layout example
export const DashboardLayout: Story = {
  name: 'Dashboard Layout',
  render: () => (
    <Grid
      templateColumns="250px 1fr"
      templateRows="60px 1fr"
      gap="md"
      height="500px"
    >
      {/* Header */}
      <Grid.Item colSpan={2}>
        <div style={{ height: '100%', background: '#1e40af', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 24px', color: 'white', fontWeight: 600 }}>
          Dashboard Header
        </div>
      </Grid.Item>

      {/* Sidebar */}
      <Grid.Item>
        <div style={{ height: '100%', background: '#4f46e5', borderRadius: '8px', padding: '16px', color: 'white' }}>
          <div style={{ fontWeight: 600, marginBottom: '16px' }}>Sidebar</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>Dashboard</div>
            <div>Analytics</div>
            <div>Reports</div>
            <div>Settings</div>
          </div>
        </div>
      </Grid.Item>

      {/* Main content */}
      <Grid.Item>
        <Grid columns={3} gap="md" height="100%">
          <GridItemBox bg="#10b981">Card 1</GridItemBox>
          <GridItemBox bg="#f59e0b">Card 2</GridItemBox>
          <GridItemBox bg="#ef4444">Card 3</GridItemBox>
          <Grid.Item colSpan={2}>
            <div style={{ height: '200px', background: '#0ea5e9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              Chart Area
            </div>
          </Grid.Item>
          <GridItemBox bg="#8b5cf6">Stats</GridItemBox>
        </Grid>
      </Grid.Item>
    </Grid>
  ),
};

// Card grid example
export const CardGrid: Story = {
  name: 'Card Grid',
  render: () => (
    <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap="lg">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: '160px', background: `hsl(${i * 60}, 70%, 60%)` }} />
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Card Title {i + 1}</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              This is a card description with some sample text to show the layout.
            </p>
          </div>
        </div>
      ))}
    </Grid>
  ),
};

// Numeric gap values
export const NumericGap: Story = {
  name: 'Numeric Gap (Pixels)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>gap={8} (8px)</h4>
        <Grid columns={4} gap={8}>
          {Array.from({ length: 4 }, (_, i) => (
            <GridItemBox key={i}>{i + 1}</GridItemBox>
          ))}
        </Grid>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>gap={24} (24px)</h4>
        <Grid columns={4} gap={24}>
          {Array.from({ length: 4 }, (_, i) => (
            <GridItemBox key={i}>{i + 1}</GridItemBox>
          ))}
        </Grid>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>columnGap={48} rowGap={8}</h4>
        <Grid columns={4} columnGap={48} rowGap={8}>
          {Array.from({ length: 8 }, (_, i) => (
            <GridItemBox key={i}>{i + 1}</GridItemBox>
          ))}
        </Grid>
      </div>
    </div>
  ),
};

// Using spacing alias
export const SpacingAlias: Story = {
  name: 'Spacing Alias',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', color: '#6b7280' }}>
        The "spacing" prop is an alias for "gap"
      </p>
      <Grid columns={4} spacing="xl">
        {Array.from({ length: 4 }, (_, i) => (
          <GridItemBox key={i}>{i + 1}</GridItemBox>
        ))}
      </Grid>
    </div>
  ),
};
