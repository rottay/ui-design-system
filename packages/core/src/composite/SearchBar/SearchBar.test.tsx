import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from './SearchBar';
import { ThemeProvider } from '../../providers/ThemeProvider';
import type { SearchResult } from './types';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon">🔍</span>,
  Clock: () => <span data-testid="clock-icon">🕐</span>,
  Command: () => <span data-testid="command-icon">⌘</span>,
}));

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'User Management',
    description: 'Manage users, roles and permissions',
    category: 'Pages',
    icon: <span data-testid="result-icon-1">👤</span>,
  },
  {
    id: '2',
    title: 'Dashboard',
    description: 'View analytics and metrics',
    category: 'Pages',
    icon: <span data-testid="result-icon-2">📊</span>,
  },
  {
    id: '3',
    title: 'Settings',
    description: 'Configure application settings',
    category: 'Configuration',
  },
];

const renderWithTheme = (
  ui: React.ReactElement,
  theme: 'base' | 'spotify' | 'stripe' | 'notion' | 'linear' = 'base'
) => {
  return render(<ThemeProvider defaultTemplate={theme}>{ui}</ThemeProvider>);
};

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders correctly with default props', () => {
    renderWithTheme(<SearchBar />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();

    // Search icon should be visible
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    renderWithTheme(<SearchBar placeholder="Search for anything..." />);

    expect(screen.getByPlaceholderText('Search for anything...')).toBeInTheDocument();
  });

  it('shows keyboard shortcut hint', () => {
    renderWithTheme(<SearchBar showShortcut />);

    // Command icon and K should be visible
    expect(screen.getByTestId('command-icon')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('hides keyboard shortcut when showShortcut is false', () => {
    renderWithTheme(<SearchBar showShortcut={false} />);

    expect(screen.queryByTestId('command-icon')).not.toBeInTheDocument();
  });

  it('calls onSearch when typing', () => {
    const onSearch = vi.fn();
    renderWithTheme(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('displays results when searching', async () => {
    renderWithTheme(<SearchBar results={mockResults} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'user' } });

    // Results should be displayed
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('displays result descriptions and categories', async () => {
    renderWithTheme(<SearchBar results={mockResults} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'user' } });

    await waitFor(() => {
      expect(screen.getByText('Manage users, roles and permissions')).toBeInTheDocument();
      expect(screen.getByText('Pages')).toBeInTheDocument();
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });
  });

  it('displays result icons when provided', async () => {
    renderWithTheme(<SearchBar results={mockResults} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'user' } });

    await waitFor(() => {
      expect(screen.getByTestId('result-icon-1')).toBeInTheDocument();
      expect(screen.getByTestId('result-icon-2')).toBeInTheDocument();
    });
  });

  it('calls onSelect when clicking a result', async () => {
    const onSelect = vi.fn();
    renderWithTheme(<SearchBar results={mockResults} onSelect={onSelect} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'user' } });

    await waitFor(() => {
      const result = screen.getByText('User Management');
      fireEvent.click(result);

      expect(onSelect).toHaveBeenCalledWith(mockResults[0]);
    });
  });

  it('shows recent searches when input is empty', async () => {
    const recentSearches = ['dashboard', 'users', 'settings'];
    renderWithTheme(<SearchBar recentSearches={recentSearches} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('dashboard')).toBeInTheDocument();
      expect(screen.getByText('users')).toBeInTheDocument();
      expect(screen.getByText('settings')).toBeInTheDocument();
    });
  });

  it('clicking recent search triggers onSearch', async () => {
    const onSearch = vi.fn();
    const recentSearches = ['dashboard'];
    renderWithTheme(<SearchBar recentSearches={recentSearches} onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);

    await waitFor(() => {
      const recentItem = screen.getByText('dashboard');
      fireEvent.click(recentItem);

      expect(onSearch).toHaveBeenCalledWith('dashboard');
    });
  });

  it('shows loading spinner when loading is true', async () => {
    renderWithTheme(<SearchBar loading />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      const spinner = screen.getByText((content, element) => {
        return element?.classList.contains('ant-spin') ?? false;
      });
      expect(spinner).toBeInTheDocument();
    });
  });

  it('shows empty state when no results found', async () => {
    renderWithTheme(<SearchBar results={[]} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('respects maxResults prop', async () => {
    const manyResults: SearchResult[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      title: `Result ${i}`,
    }));

    renderWithTheme(<SearchBar results={manyResults} maxResults={5} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      // Should only show 5 results
      expect(screen.getByText('Result 0')).toBeInTheDocument();
      expect(screen.getByText('Result 4')).toBeInTheDocument();
      expect(screen.queryByText('Result 5')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown on blur', async () => {
    renderWithTheme(<SearchBar results={mockResults} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    fireEvent.blur(input);

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
    });
  });

  it('applies autoFocus when prop is true', () => {
    const { container } = renderWithTheme(<SearchBar autoFocus />);

    const input = container.querySelector('input');
    expect(document.activeElement).toBe(input);
  });

  it('shows clear button when allowClear is true', () => {
    renderWithTheme(<SearchBar allowClear />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Ant Design adds clear button with specific class
    const { container } = renderWithTheme(<SearchBar allowClear />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'test' },
    });

    const clearButton = container.querySelector('.ant-input-clear-icon');
    expect(clearButton).toBeInTheDocument();
  });

  it('applies custom className and style', () => {
    const { container } = renderWithTheme(
      <SearchBar className="custom-search" style={{ marginTop: 10 }} />
    );

    const wrapper = container.querySelector('.custom-search');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ marginTop: '10px' });
  });

  it('renders correctly with Spotify theme', () => {
    const { container } = renderWithTheme(<SearchBar />, 'spotify');
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Stripe theme', () => {
    const { container } = renderWithTheme(<SearchBar />, 'stripe');
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Notion theme', () => {
    const { container } = renderWithTheme(<SearchBar />, 'notion');
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Linear theme', () => {
    const { container } = renderWithTheme(<SearchBar />, 'linear');
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles custom shortcutKey prop', () => {
    renderWithTheme(<SearchBar showShortcut shortcutKey="P" />);

    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('opens dropdown when focused', async () => {
    renderWithTheme(<SearchBar results={mockResults} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);

    // Since results require a search value, type something
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
  });

  it('clears search value after selecting a result', async () => {
    renderWithTheme(<SearchBar results={mockResults} />);

    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      const result = screen.getByText('User Management');
      fireEvent.click(result);

      expect(input.value).toBe('');
    });
  });

  it('handles keyboard shortcut (Ctrl+K)', () => {
    const { container } = renderWithTheme(<SearchBar showShortcut />);

    const input = container.querySelector('input');

    // Simulate Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    vi.advanceTimersByTime(100);

    expect(document.activeElement).toBe(input);
  });

  it('handles Escape key to close dropdown', async () => {
    renderWithTheme(<SearchBar results={mockResults} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
    });
  });
});
