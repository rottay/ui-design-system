import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from './SearchBar';
import { File, Folder, User, Settings, FileText } from 'lucide-react';
import type { SearchResult } from './types';

const meta: Meta<typeof SearchBar> = {
  title: 'Composite/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 600, padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'User Management',
    description: 'Manage users, roles, and permissions',
    category: 'Pages',
    icon: <User size={20} />,
  },
  {
    id: '2',
    title: 'Settings',
    description: 'Configure application settings',
    category: 'Pages',
    icon: <Settings size={20} />,
  },
  {
    id: '3',
    title: 'Documents',
    description: 'View and manage all documents',
    category: 'Pages',
    icon: <FileText size={20} />,
  },
  {
    id: '4',
    title: 'Project Files',
    description: 'Access your project files',
    category: 'Files',
    icon: <Folder size={20} />,
  },
  {
    id: '5',
    title: 'README.md',
    description: 'Project documentation',
    category: 'Files',
    icon: <File size={20} />,
  },
];

export const Default: Story = {
  args: {
    placeholder: 'Search...',
    results: mockResults,
    onSearch: (value) => console.log('Searching:', value),
    onSelect: (result) => console.log('Selected:', result),
  },
};

export const WithRecentSearches: Story = {
  args: {
    placeholder: 'Search pages, files, and more...',
    recentSearches: ['user settings', 'dashboard', 'reports', 'analytics'],
    results: mockResults,
    onSearch: (value) => console.log('Searching:', value),
  },
};

export const Loading: Story = {
  args: {
    placeholder: 'Search...',
    loading: true,
    results: [],
  },
};

export const NoResults: Story = {
  args: {
    placeholder: 'Search...',
    results: [],
  },
};

export const WithKeyboardShortcut: Story = {
  args: {
    placeholder: 'Search... (Ctrl+K)',
    showShortcut: true,
    shortcutKey: 'K',
    results: mockResults,
  },
};

export const AutoFocused: Story = {
  args: {
    placeholder: 'Search automatically focused',
    autoFocus: true,
    results: mockResults,
  },
};

export const CustomShortcut: Story = {
  args: {
    placeholder: 'Search with Ctrl+F',
    showShortcut: true,
    shortcutKey: 'F',
    results: mockResults,
  },
};
