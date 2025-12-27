/**
 * AutoComplete Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AutoComplete } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

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
        component: 'AutoComplete component for input with dropdown suggestions.',
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
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    allowClear: {
      control: 'boolean',
      description: 'Allow clearing the input',
    },
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

export const Default: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Search frameworks...',
    style: { width: 300 },
  },
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
        <div style={{ marginTop: 16 }}>
          Selected value: {value || '(none)'}
        </div>
      </div>
    );
  },
};

export const WithLabels: Story = {
  args: {
    options: [
      { value: 'react', label: 'React - A JavaScript library for building UIs' },
      { value: 'vue', label: 'Vue - The Progressive JavaScript Framework' },
      { value: 'angular', label: 'Angular - Platform for building apps' },
    ],
    placeholder: 'Select a framework',
    style: { width: 400 },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <div key={size}>
          <span style={{ display: 'inline-block', width: 80 }}>{size}:</span>
          <AutoComplete
            options={defaultOptions}
            size={size}
            placeholder={`Size ${size}`}
            style={{ width: 200 }}
          />
        </div>
      ))}
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <span style={{ display: 'inline-block', width: 80 }}>Error:</span>
        <AutoComplete
          options={defaultOptions}
          status="error"
          placeholder="Error state"
          style={{ width: 200 }}
        />
      </div>
      <div>
        <span style={{ display: 'inline-block', width: 80 }}>Warning:</span>
        <AutoComplete
          options={defaultOptions}
          status="warning"
          placeholder="Warning state"
          style={{ width: 200 }}
        />
      </div>
    </div>
  ),
};

export const WithClear: Story = {
  args: {
    options: defaultOptions,
    allowClear: true,
    defaultValue: 'React',
    placeholder: 'Type to search',
    style: { width: 300 },
  },
};

export const Disabled: Story = {
  args: {
    options: defaultOptions,
    disabled: true,
    value: 'React',
    style: { width: 300 },
  },
};

export const DisabledOptions: Story = {
  args: {
    options: [
      { value: 'React' },
      { value: 'Vue', disabled: true },
      { value: 'Angular' },
      { value: 'Svelte', disabled: true },
    ],
    placeholder: 'Some options are disabled',
    style: { width: 300 },
  },
};

export const CustomFilter: Story = {
  render: function CustomFilterStory() {
    const [options, setOptions] = useState<{ value: string }[]>([]);

    const handleSearch = (searchText: string) => {
      if (!searchText) {
        setOptions([]);
      } else {
        // Custom filter logic - show email domain suggestions
        setOptions([
          { value: `${searchText}@gmail.com` },
          { value: `${searchText}@outlook.com` },
          { value: `${searchText}@yahoo.com` },
        ]);
      }
    };

    return (
      <AutoComplete
        options={options}
        onSearch={handleSearch}
        placeholder="Enter email prefix"
        filterOption={false}
        style={{ width: 300 }}
      />
    );
  },
};

export const AsyncSearch: Story = {
  render: function AsyncSearchStory() {
    const [options, setOptions] = useState<{ value: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (searchText: string) => {
      if (!searchText) {
        setOptions([]);
        return;
      }

      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setOptions(
        defaultOptions.filter((opt) =>
          opt.value.toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setLoading(false);
    };

    return (
      <div>
        <AutoComplete
          options={options}
          onSearch={handleSearch}
          placeholder="Search with async"
          filterOption={false}
          notFoundContent={loading ? 'Loading...' : 'No results'}
          style={{ width: 300 }}
        />
      </div>
    );
  },
};

export const WithSelect: Story = {
  render: function WithSelectStory() {
    const [value, setValue] = useState('');

    return (
      <div>
        <AutoComplete
          value={value}
          options={defaultOptions}
          onChange={setValue}
          onSelect={(val, option) => {
            console.log('Selected:', val, option);
          }}
          placeholder="Select a framework"
          style={{ width: 300 }}
        />
        <div style={{ marginTop: 16 }}>
          Selected: {value || '(none)'}
        </div>
      </div>
    );
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <AutoComplete
            engine={engine}
            options={defaultOptions}
            placeholder={`${engine} engine`}
            style={{ width: 300 }}
          />
        </div>
      ))}
    </div>
  ),
};
