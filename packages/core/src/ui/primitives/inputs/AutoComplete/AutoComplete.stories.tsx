/**
 * AutoComplete Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AutoComplete } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof AutoComplete> = {
  title: 'Primitives/Inputs/AutoComplete',
  component: AutoComplete,
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
AutoComplete component for input with dropdown suggestions.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Search | Built-in | Native | Custom |
| Async Loading | Full | Manual | Full |
| Custom Render | Full | Partial | Full |
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
    disabled: { control: 'boolean', description: 'Whether the input is disabled' },
    allowClear: { control: 'boolean', description: 'Allow clearing the input' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AutoComplete>;

const defaultOptions = [
  { value: 'React' },
  { value: 'Vue' },
  { value: 'Angular' },
  { value: 'Svelte' },
  { value: 'Solid' },
];

// ============================================================================
// Default Stories
// ============================================================================

export const Default: Story = {
  args: { options: defaultOptions, placeholder: 'Search frameworks...', style: { width: 300 } },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState('');
    const [options, setOptions] = useState(defaultOptions);

    const handleSearch = (searchText: string) => {
      if (!searchText) {
        setOptions(defaultOptions);
      } else {
        setOptions(
          defaultOptions.filter((opt) =>
            opt.value.toLowerCase().includes(searchText.toLowerCase())
          )
        );
      }
    };

    return (
      <div>
        <AutoComplete
          value={value}
          options={options}
          onSearch={handleSearch}
          onChange={setValue}
          placeholder="Type to search"
          style={{ width: 300 }}
        />
        <div style={{ marginTop: 16 }}>Selected value: {value || '(none)'}</div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <AutoComplete
          key={size}
          options={defaultOptions}
          size={size}
          placeholder={`Size ${size}`}
          style={{ width: 200 }}
        />
      ))}
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AutoComplete options={defaultOptions} status="error" placeholder="Error state" style={{ width: 200 }} />
      <AutoComplete options={defaultOptions} status="warning" placeholder="Warning state" style={{ width: 200 }} />
    </div>
  ),
};

export const WithClear: Story = {
  args: { options: defaultOptions, allowClear: true, defaultValue: 'React', placeholder: 'Type to search', style: { width: 300 } },
};

export const Disabled: Story = {
  args: { options: defaultOptions, disabled: true, value: 'React', style: { width: 300 } },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the AutoComplete component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same AutoComplete rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={AutoComplete}
      props={{ options: defaultOptions, placeholder: 'Search...', style: { width: 200 } }}
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
      component={AutoComplete}
      baseProps={{ options: defaultOptions, placeholder: 'Search', style: { width: 150 } }}
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
      component={AutoComplete}
      baseProps={{ options: defaultOptions, placeholder: 'Search', style: { width: 150 } }}
      variantProp="status"
      variants={['error', 'warning']}
    />
  ),
};
