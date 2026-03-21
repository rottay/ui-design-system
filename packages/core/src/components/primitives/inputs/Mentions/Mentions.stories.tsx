/**
 * Mentions Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Mentions } from './';
import type { MentionsOption } from './Mentions.types';
import { DesignSystemProvider } from '../../../../runtime/bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Mentions> = {
  title: 'Primitives/Inputs/Mentions',
  component: Mentions,
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
Mentions component for @mentions in text input with dropdown suggestions.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Dropdown | Built-in | Custom | Custom |
| Multi Prefix | Full | Limited | Full |
| Async Search | Built-in | Manual | Built-in |
`,
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['error', 'warning'],
      description: 'Validation status',
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom'],
      description: 'Dropdown placement',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is readonly',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    rows: {
      control: 'number',
      description: 'Number of rows',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Mentions>;

const defaultOptions: MentionsOption[] = [
  { value: 'john', label: 'John Doe' },
  { value: 'jane', label: 'Jane Smith' },
  { value: 'bob', label: 'Bob Wilson' },
  { value: 'alice', label: 'Alice Johnson' },
];

export const Default: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Type @ to mention someone',
    style: { width: 400 },
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState('');

    return (
      <div>
        <Mentions
          value={value}
          options={defaultOptions}
          onChange={setValue}
          placeholder="Type @ to mention"
          style={{ width: 400 }}
        />
        <div style={{ marginTop: 16 }}>
          Value: {value || '(empty)'}
        </div>
      </div>
    );
  },
};

export const WithSearch: Story = {
  render: function SearchStory() {
    const [options, setOptions] = useState<MentionsOption[]>([]);

    const handleSearch = (text: string) => {
      const filtered = defaultOptions.filter(
        (opt) =>
          opt.value.toLowerCase().includes(text.toLowerCase()) ||
          (typeof opt.label === 'string' && opt.label.toLowerCase().includes(text.toLowerCase()))
      );
      setOptions(filtered);
    };

    return (
      <Mentions
        options={options}
        onSearch={handleSearch}
        placeholder="Type @ to search users"
        style={{ width: 400 }}
      />
    );
  },
};

export const CustomPrefix: Story = {
  args: {
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' },
    ],
    prefix: '#',
    placeholder: 'Type # to mention a framework',
    style: { width: 400 },
  },
};

export const MultiplePrefix: Story = {
  render: function MultiplePrefixStory() {
    const [prefix, setPrefix] = useState('@');

    const userOptions = [
      { value: 'john', label: 'John Doe' },
      { value: 'jane', label: 'Jane Smith' },
    ];

    const tagOptions = [
      { value: 'react', label: 'React' },
      { value: 'javascript', label: 'JavaScript' },
    ];

    return (
      <div>
        <p style={{ marginBottom: 8 }}>Use @ for users, # for tags</p>
        <Mentions
          options={prefix === '@' ? userOptions : tagOptions}
          prefix={['@', '#']}
          onSearch={(_, p) => setPrefix(p)}
          placeholder="Type @ or # to mention"
          style={{ width: 400 }}
        />
      </div>
    );
  },
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <span style={{ display: 'inline-block', width: 80 }}>Error:</span>
        <Mentions
          options={defaultOptions}
          status="error"
          placeholder="Error state"
          style={{ width: 300 }}
        />
      </div>
      <div>
        <span style={{ display: 'inline-block', width: 80 }}>Warning:</span>
        <Mentions
          options={defaultOptions}
          status="warning"
          placeholder="Warning state"
          style={{ width: 300 }}
        />
      </div>
    </div>
  ),
};

export const Placement: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Bottom (default)</h4>
        <Mentions
          options={defaultOptions}
          placement="bottom"
          placeholder="Type @ to mention"
          style={{ width: 300 }}
        />
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Top</h4>
        <Mentions
          options={defaultOptions}
          placement="top"
          placeholder="Type @ to mention"
          style={{ width: 300 }}
        />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    options: defaultOptions,
    disabled: true,
    defaultValue: 'Hello @john',
    style: { width: 400 },
  },
};

export const ReadOnly: Story = {
  args: {
    options: defaultOptions,
    readOnly: true,
    defaultValue: 'Hello @john @jane',
    style: { width: 400 },
  },
};

export const DisabledOptions: Story = {
  args: {
    options: [
      { value: 'john', label: 'John Doe' },
      { value: 'jane', label: 'Jane Smith', disabled: true },
      { value: 'bob', label: 'Bob Wilson' },
    ],
    placeholder: 'Some users are disabled',
    style: { width: 400 },
  },
};

export const AutoSize: Story = {
  args: {
    options: defaultOptions,
    autoSize: { minRows: 2, maxRows: 6 },
    placeholder: 'Type here... textarea will grow',
    style: { width: 400 },
  },
};

export const CustomRows: Story = {
  args: {
    options: defaultOptions,
    rows: 5,
    placeholder: 'Textarea with 5 rows',
    style: { width: 400 },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    placeholder: 'Loading suggestions...',
    style: { width: 400 },
  },
};

export const NoSuggestions: Story = {
  args: {
    options: [],
    notFoundContent: 'No users found',
    placeholder: 'Type @ to mention',
    style: { width: 400 },
  },
};

export const AsyncSearch: Story = {
  render: function AsyncSearchStory() {
    const [options, setOptions] = useState<MentionsOption[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (text: string) => {
      if (!text) {
        setOptions([]);
        return;
      }

      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const filtered = defaultOptions.filter(
        (opt) => opt.value.toLowerCase().includes(text.toLowerCase())
      );
      setOptions(filtered);
      setLoading(false);
    };

    return (
      <Mentions
        options={options}
        loading={loading}
        onSearch={handleSearch}
        placeholder="Type @ to search users (async)"
        style={{ width: 400 }}
      />
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the Mentions component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Mentions rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Mentions}
      props={{ options: defaultOptions, placeholder: 'Type @ to mention', style: { width: 300 } }}
      showDescriptions
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
      component={Mentions}
      baseProps={{ options: defaultOptions, placeholder: 'Type @', style: { width: 200 } }}
      variantProp="status"
      variants={['error', 'warning']}
    />
  ),
};
