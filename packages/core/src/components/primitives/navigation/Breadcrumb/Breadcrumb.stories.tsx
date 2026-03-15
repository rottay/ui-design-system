/**
 * Breadcrumb Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './';
import type { BreadcrumbItem } from './Breadcrumb.types';
import { DesignSystemProvider } from '../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Primitives/Navigation/Breadcrumb',
  component: Breadcrumb,
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
        component: 'Breadcrumb navigation component showing the current page location within a hierarchy.',
      },
    },
  },
  argTypes: {
    separator: {
      control: 'text',
      description: 'Custom separator between items',
    },
    maxItems: {
      control: 'number',
      description: 'Maximum items to display before collapsing',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

const defaultItems: BreadcrumbItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'products', label: 'Products', href: '/products' },
  { key: 'category', label: 'Electronics', href: '/products/electronics' },
  { key: 'item', label: 'Laptop' },
];

export const Default: Story = {
  args: {
    items: defaultItems,
  },
};

export const CustomSeparator: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Arrow (&gt;)</h4>
        <Breadcrumb items={defaultItems} separator=">" />
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Pipe (|)</h4>
        <Breadcrumb items={defaultItems} separator="|" />
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Dash (-)</h4>
        <Breadcrumb items={defaultItems} separator="-" />
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Custom Icon</h4>
        <Breadcrumb items={defaultItems} separator={<span style={{ margin: '0 8px' }}>→</span>} />
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home', href: '/', icon: <span style={{ marginRight: 4 }}>🏠</span> },
      { key: 'docs', label: 'Documentation', href: '/docs', icon: <span style={{ marginRight: 4 }}>📚</span> },
      { key: 'guide', label: 'Guide', icon: <span style={{ marginRight: 4 }}>📖</span> },
    ],
  },
};

export const Collapsed: Story = {
  args: {
    items: [
      { key: '1', label: 'Home', href: '/' },
      { key: '2', label: 'Category 1', href: '/cat1' },
      { key: '3', label: 'Category 2', href: '/cat2' },
      { key: '4', label: 'Category 3', href: '/cat3' },
      { key: '5', label: 'Category 4', href: '/cat4' },
      { key: '6', label: 'Current Page' },
    ],
    maxItems: 4,
  },
};

export const IconOnly: Story = {
  args: {
    items: [
      { key: 'home', label: <span title="Home">🏠</span>, href: '/' },
      { key: 'folder', label: <span title="Documents">📁</span>, href: '/docs' },
      { key: 'file', label: <span title="File">📄</span> },
    ],
  },
};

export const WithClickHandlers: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { key: 'home', label: 'Home', onClick: () => alert('Navigate to Home') },
        { key: 'products', label: 'Products', onClick: () => alert('Navigate to Products') },
        { key: 'current', label: 'Current Page' },
      ]}
    />
  ),
};

export const Simple: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home', href: '/' },
      { key: 'current', label: 'Current Page' },
    ],
  },
};

export const LongLabels: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home', href: '/' },
      { key: 'category', label: 'Very Long Category Name That Might Overflow', href: '/category' },
      { key: 'subcategory', label: 'Another Long Subcategory Name', href: '/subcategory' },
      { key: 'current', label: 'Current Page With Long Title' },
    ],
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Breadcrumb across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Breadcrumb rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Breadcrumb}
      props={{
        items: defaultItems,
      }}
      showDescriptions
    />
  ),
};
