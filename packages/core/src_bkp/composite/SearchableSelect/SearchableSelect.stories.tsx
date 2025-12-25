import type { Meta, StoryObj } from '@storybook/react';
import { SearchableSelect } from './SearchableSelect';
import { useState } from 'react';
import { Empty } from 'antd';
import type { SearchableSelectOption } from './types';

const meta = {
  title: 'Composite/SearchableSelect',
  component: SearchableSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Size of the select',
    },
    debounceTime: {
      control: 'number',
      description: 'Debounce time in milliseconds',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchableSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const users: SearchableSelectOption[] = [
  { value: '1', label: 'John Doe' },
  { value: '2', label: 'Jane Smith' },
  { value: '3', label: 'Bob Johnson' },
  { value: '4', label: 'Alice Williams' },
  { value: '5', label: 'Charlie Brown' },
  { value: '6', label: 'Diana Prince' },
  { value: '7', label: 'Eve Anderson' },
  { value: '8', label: 'Frank Miller' },
  { value: '9', label: 'Grace Lee' },
  { value: '10', label: 'Henry Ford' },
];

const countries: SearchableSelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'it', label: 'Italy' },
  { value: 'jp', label: 'Japan' },
  { value: 'cn', label: 'China' },
  { value: 'in', label: 'India' },
  { value: 'br', label: 'Brazil' },
  { value: 'mx', label: 'Mexico' },
  { value: 'ar', label: 'Argentina' },
];

const products: SearchableSelectOption[] = [
  { value: '1', label: 'MacBook Pro 16"' },
  { value: '2', label: 'iPhone 15 Pro' },
  { value: '3', label: 'iPad Air' },
  { value: '4', label: 'AirPods Pro' },
  { value: '5', label: 'Apple Watch Series 9' },
  { value: '6', label: 'Samsung Galaxy S24' },
  { value: '7', label: 'Dell XPS 15' },
  { value: '8', label: 'Sony WH-1000XM5' },
  { value: '9', label: 'Logitech MX Master 3' },
  { value: '10', label: 'LG UltraWide Monitor' },
];

export const Default: Story = {
  args: {
    options: users,
    placeholder: 'Search users...',
    style: { width: '100%' },
  },
};

export const WithSearchIcon: Story = {
  args: {
    options: countries,
    placeholder: 'Search countries...',
    showSearchIcon: true,
    style: { width: '100%' },
  },
};

export const LargeSize: Story = {
  args: {
    options: products,
    placeholder: 'Search products...',
    size: 'large',
    showSearchIcon: true,
    style: { width: '100%' },
  },
};

export const SmallSize: Story = {
  args: {
    options: users,
    placeholder: 'Search...',
    size: 'small',
    style: { width: '100%' },
  },
};

export const CustomDebounce: Story = {
  args: {
    options: countries,
    placeholder: 'Search countries (1s debounce)...',
    debounceTime: 1000,
    showSearchIcon: true,
    style: { width: '100%' },
  },
};

export const MinSearchLength: Story = {
  args: {
    options: products,
    placeholder: 'Type at least 3 characters...',
    minSearchLength: 3,
    showSearchIcon: true,
    style: { width: '100%' },
  },
};

export const AsyncSearch: Story = {
  args: {
    options: [],
  },
  render: () => {
    const [options, setOptions] = useState<SearchableSelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = (query: string) => {
      if (!query) {
        setOptions([]);
        return;
      }

      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        // Filter users based on query
        const filtered = users.filter((user) =>
          user.label.toLowerCase().includes(query.toLowerCase())
        );

        setOptions(filtered);
        setLoading(false);
      }, 800);
    };

    return (
      <SearchableSelect
        options={options}
        onSearch={handleSearch}
        loading={loading}
        placeholder="Search users (async)..."
        showSearchIcon
        style={{ width: '100%' }}
      />
    );
  },
};

export const AsyncSearchWithPromise: Story = {
  args: {
    options: [],
  },
  render: () => {
    const handleSearch = async (query: string): Promise<SearchableSelectOption[]> => {
      if (!query) return [];

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter countries based on query
      const filtered = countries.filter((country) =>
        country.label.toLowerCase().includes(query.toLowerCase())
      );

      return filtered;
    };

    return (
      <SearchableSelect
        options={[]}
        onSearch={handleSearch}
        placeholder="Search countries (returns promise)..."
        showSearchIcon
        style={{ width: '100%' }}
        debounceTime={400}
      />
    );
  },
};

export const WithLoading: Story = {
  args: {
    options: users,
    placeholder: 'Search users...',
    loading: true,
    showSearchIcon: true,
    style: { width: '100%' },
  },
};

export const CustomEmptyContent: Story = {
  args: {
    options: [],
    placeholder: 'Search...',
    showSearchIcon: true,
    emptyContent: (
      <Empty
        description={
          <span>
            No results found.
            <br />
            <a href="#">Try different keywords</a>
          </span>
        }
      />
    ),
    style: { width: '100%' },
  },
};

export const CaseSensitive: Story = {
  args: {
    options: products,
    placeholder: 'Case sensitive search...',
    caseSensitive: true,
    showSearchIcon: true,
    style: { width: '100%' },
  },
};

export const AllowClear: Story = {
  args: {
    options: countries,
    placeholder: 'Search countries...',
    allowClear: true,
    showSearchIcon: true,
    style: { width: '100%' },
  },
};

export const MultipleSelect: Story = {
  args: {
    options: users,
    placeholder: 'Select multiple users...',
    mode: 'multiple',
    showSearchIcon: true,
    style: { width: '100%' },
  },
};

export const WithDefaultValue: Story = {
  args: {
    options: countries,
    placeholder: 'Search countries...',
    defaultValue: 'us',
    showSearchIcon: true,
    style: { width: '100%' },
  },
};

export const Disabled: Story = {
  args: {
    options: users,
    placeholder: 'Search users...',
    disabled: true,
    defaultValue: '1',
    style: { width: '100%' },
  },
};
