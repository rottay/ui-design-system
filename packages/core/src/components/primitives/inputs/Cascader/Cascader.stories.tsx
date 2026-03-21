/**
 * Cascader Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Cascader } from './';
import type { CascaderOption, CascaderValue } from './Cascader.types';
import { DesignSystemProvider } from '../../../../runtime/bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Cascader> = {
  title: 'Primitives/Inputs/Cascader',
  component: Cascader,
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
Cascader component for hierarchical multi-level selection.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Multi-level | Full | Limited | Full |
| Search | Built-in | Custom | Custom |
| Multiple | Full | Limited | Full |
`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Size of the input',
    },
    status: {
      control: 'select',
      options: ['error', 'warning'],
      description: 'Validation status',
    },
    expandTrigger: {
      control: 'select',
      options: ['click', 'hover'],
      description: 'Expand trigger method',
    },
    disabled: { control: 'boolean', description: 'Whether the input is disabled' },
    multiple: { control: 'boolean', description: 'Support multiple selection' },
    showSearch: { control: 'boolean', description: 'Show search input' },
    allowClear: { control: 'boolean', description: 'Allow clearing the selection' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Cascader>;

const defaultOptions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          { value: 'xihu', label: 'West Lake' },
          { value: 'xiasha', label: 'Xiasha' },
        ],
      },
      {
        value: 'ningbo',
        label: 'Ningbo',
        children: [{ value: 'jiangbei', label: 'Jiangbei' }],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [{ value: 'zhonghuamen', label: 'Zhonghuamen' }],
      },
      {
        value: 'suzhou',
        label: 'Suzhou',
        children: [{ value: 'gusu', label: 'Gusu' }],
      },
    ],
  },
];

// ============================================================================
// Default Stories
// ============================================================================

export const Default: Story = {
  args: { options: defaultOptions, placeholder: 'Please select location', style: { width: 300 } },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<CascaderValue>([]);

    return (
      <div>
        <Cascader
          options={defaultOptions}
          value={value}
          onChange={(val) => setValue(val as CascaderValue)}
          placeholder="Select location"
          style={{ width: 300 }}
        />
        <div style={{ marginTop: 16 }}>Selected: {value.length ? value.join(' / ') : '(none)'}</div>
      </div>
    );
  },
};

export const DefaultValue: Story = {
  args: { options: defaultOptions, defaultValue: ['zhejiang', 'hangzhou', 'xihu'], style: { width: 300 } },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <Cascader key={size} options={defaultOptions} size={size} placeholder={`Size ${size}`} style={{ width: 250 }} />
      ))}
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Cascader options={defaultOptions} status="error" placeholder="Error state" style={{ width: 250 }} />
      <Cascader options={defaultOptions} status="warning" placeholder="Warning state" style={{ width: 250 }} />
    </div>
  ),
};

export const WithSearch: Story = {
  args: { options: defaultOptions, showSearch: true, placeholder: 'Search locations', style: { width: 300 } },
};

export const Disabled: Story = {
  args: { options: defaultOptions, disabled: true, defaultValue: ['zhejiang', 'hangzhou'], style: { width: 300 } },
};

export const Multiple: Story = {
  render: function MultipleStory() {
    const [value, setValue] = useState<CascaderValue[]>([]);

    return (
      <div>
        <Cascader
          options={defaultOptions}
          value={value}
          onChange={(val) => setValue(val as CascaderValue[])}
          multiple
          placeholder="Select multiple locations"
          style={{ width: 400 }}
        />
        <div style={{ marginTop: 16 }}>
          Selected: {value.length ? value.map((v) => v.join('/')).join(', ') : '(none)'}
        </div>
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the Cascader component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Cascader rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Cascader}
      props={{ options: defaultOptions, placeholder: 'Select...', style: { width: 200 } }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all sizes across all engines.
 */
export const SizeMatrix: Story = {
  name: '📏 Size × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Cascader}
      baseProps={{ options: defaultOptions, placeholder: 'Select', style: { width: 150 } }}
      sizeProp="size"
      sizes={['small', 'middle', 'large']}
    />
  ),
};

/**
 * Status comparison across engines.
 */
export const StatusMatrix: Story = {
  name: '⚠️ Status × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Cascader}
      baseProps={{ options: defaultOptions, placeholder: 'Select', style: { width: 150 } }}
      variantProp="status"
      variants={['error', 'warning']}
    />
  ),
};
