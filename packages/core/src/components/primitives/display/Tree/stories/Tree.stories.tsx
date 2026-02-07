/**
 * Tree Stories
 * Colocated with component following approved architecture
 *
 * @module Tree/Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tree } from '../';
import type { TreeDataNode } from '../types';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

/**
 * Sample tree data for stories
 */
const sampleTreeData: TreeDataNode[] = [
  {
    key: '0',
    title: 'Documents',
    children: [
      {
        key: '0-0',
        title: 'Work',
        children: [
          { key: '0-0-0', title: 'Report.pdf' },
          { key: '0-0-1', title: 'Presentation.pptx' },
        ],
      },
      {
        key: '0-1',
        title: 'Personal',
        children: [
          { key: '0-1-0', title: 'Resume.docx' },
          { key: '0-1-1', title: 'Photo.jpg', isLeaf: true },
        ],
      },
    ],
  },
  {
    key: '1',
    title: 'Downloads',
    children: [
      { key: '1-0', title: 'Software.zip' },
      { key: '1-1', title: 'Music.mp3', isLeaf: true },
    ],
  },
  {
    key: '2',
    title: 'Desktop',
    isLeaf: true,
  },
];

/**
 * Tree data with icons for icon stories
 */
const treeDataWithIcons: TreeDataNode[] = [
  {
    key: '0',
    title: 'src',
    icon: <span>{'>'}</span>,
    children: [
      {
        key: '0-0',
        title: 'components',
        icon: <span>{'>'}</span>,
        children: [
          { key: '0-0-0', title: 'Button.tsx', icon: <span>{'<>'}</span> },
          { key: '0-0-1', title: 'Input.tsx', icon: <span>{'<>'}</span> },
        ],
      },
      { key: '0-1', title: 'index.ts', icon: <span>{'<>'}</span> },
    ],
  },
];

const meta: Meta<typeof Tree> = {
  title: 'Primitives/Display/Tree',
  component: Tree,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: 20, maxWidth: 400 }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Tree component for displaying hierarchical data structures.
Supports multiple selection, checkboxes, drag-and-drop, and virtual scrolling.

Features:
- Multiple rendering engines (Classic, Modern, Rustic)
- Controlled and uncontrolled modes
- Checkable nodes with cascade selection
- Expandable/collapsible nodes
- Custom icons and line connectors
- Keyboard navigation support
        `,
      },
    },
  },
  argTypes: {
    checkable: {
      control: 'boolean',
      description: 'Show checkboxes for each node',
    },
    showLine: {
      control: 'boolean',
      description: 'Show connecting lines between nodes',
    },
    showIcon: {
      control: 'boolean',
      description: 'Show icons for each node',
    },
    defaultExpandAll: {
      control: 'boolean',
      description: 'Expand all nodes by default',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple selection',
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
type Story = StoryObj<typeof Tree>;

/**
 * Default tree with basic functionality
 */
export const Default: Story = {
  args: {
    treeData: sampleTreeData,
    defaultExpandedKeys: ['0'],
  },
};

/**
 * Tree with checkboxes for selection
 */
export const Checkable: Story = {
  args: {
    treeData: sampleTreeData,
    checkable: true,
    defaultExpandedKeys: ['0', '0-0'],
    defaultCheckedKeys: ['0-0-0'],
  },
};

/**
 * Tree with all nodes expanded
 */
export const ExpandAll: Story = {
  args: {
    treeData: sampleTreeData,
    defaultExpandAll: true,
  },
};

/**
 * Tree with connecting lines
 */
export const WithLines: Story = {
  args: {
    treeData: sampleTreeData,
    showLine: true,
    defaultExpandedKeys: ['0', '0-0', '1'],
  },
};

/**
 * Tree with custom icons
 */
export const WithIcons: Story = {
  args: {
    treeData: treeDataWithIcons,
    showIcon: true,
    defaultExpandedKeys: ['0', '0-0'],
  },
};

/**
 * Tree with disabled nodes
 */
export const WithDisabledNodes: Story = {
  args: {
    treeData: [
      {
        key: '0',
        title: 'Parent',
        children: [
          { key: '0-0', title: 'Enabled child' },
          { key: '0-1', title: 'Disabled child', disabled: true },
          { key: '0-2', title: 'Another enabled child' },
        ],
      },
    ],
    defaultExpandedKeys: ['0'],
    checkable: true,
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Tree across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Tree rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Tree}
      props={{
        treeData: sampleTreeData,
        defaultExpandedKeys: ['0', '0-0'],
        checkable: true,
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};

/**
 * Matrix showing Tree with different options across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant x Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix comparing Tree options (showLine) across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Tree}
      baseProps={{
        treeData: sampleTreeData,
        defaultExpandedKeys: ['0', '0-0'],
      }}
      variantProp="showLine"
      variants={['false', 'true']}
    />
  ),
};

/**
 * Controlled tree with external state management
 */
export const Controlled: Story = {
  render: function ControlledTree() {
    const [selectedKeys, setSelectedKeys] = React.useState<React.Key[]>(['0-0-0']);
    const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>(['0', '0-0']);

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <strong>Selected:</strong> {selectedKeys.join(', ') || 'None'}
        </div>
        <Tree
          treeData={sampleTreeData}
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          onSelect={(keys) => setSelectedKeys(keys)}
          onExpand={(keys) => setExpandedKeys(keys)}
        />
      </div>
    );
  },
};

/**
 * Tree with selection and check callbacks
 */
export const WithCallbacks: Story = {
  render: function CallbacksTree() {
    const [log, setLog] = React.useState<string[]>([]);

    const addLog = (message: string) => {
      setLog((prev) => [...prev.slice(-4), message]);
    };

    return (
      <div>
        <Tree
          treeData={sampleTreeData}
          defaultExpandedKeys={['0']}
          checkable
          onSelect={(keys, info) => addLog(`Selected: ${info.node.title}`)}
          onCheck={(keys, info) => addLog(`Checked: ${info.node.title} (${info.checked})`)}
          onExpand={(keys, info) => addLog(`${info.expanded ? 'Expanded' : 'Collapsed'}: ${info.node.title}`)}
        />
        <div style={{ marginTop: 16, padding: 8, background: '#f5f5f5', borderRadius: 4, fontSize: 12 }}>
          <strong>Event Log:</strong>
          {log.map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Large tree for testing performance
 */
export const LargeTree: Story = {
  args: {
    treeData: Array.from({ length: 10 }, (_, i) => ({
      key: `${i}`,
      title: `Parent ${i}`,
      children: Array.from({ length: 10 }, (_, j) => ({
        key: `${i}-${j}`,
        title: `Child ${i}-${j}`,
        children: Array.from({ length: 5 }, (_, k) => ({
          key: `${i}-${j}-${k}`,
          title: `Leaf ${i}-${j}-${k}`,
        })),
      })),
    })),
    defaultExpandedKeys: ['0', '0-0'],
    checkable: true,
  },
};
