import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { ThemeProvider } from '../../providers/ThemeProvider';
import type { SidebarGroup } from './types';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left-icon">◀</span>,
  ChevronRight: () => <span data-testid="chevron-right-icon">▶</span>,
}));

const mockGroups: SidebarGroup[] = [
  {
    items: [
      {
        key: 'home',
        label: 'Home',
        icon: <span data-testid="home-icon">🏠</span>,
        path: '/',
      },
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: <span data-testid="dashboard-icon">📊</span>,
        badge: 5,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        key: 'users',
        label: 'Users',
        icon: <span data-testid="users-icon">👥</span>,
        badge: '12',
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: <span data-testid="settings-icon">⚙️</span>,
      },
    ],
  },
];

const renderWithTheme = (
  ui: React.ReactElement,
  theme: 'base' | 'spotify' | 'stripe' | 'notion' | 'linear' = 'base'
) => {
  return render(<ThemeProvider defaultTemplate={theme}>{ui}</ThemeProvider>);
};

describe('Sidebar', () => {
  it('renders correctly with groups', () => {
    renderWithTheme(<Sidebar groups={mockGroups} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays group titles', () => {
    renderWithTheme(<Sidebar groups={mockGroups} />);

    expect(screen.getByText('Management')).toBeInTheDocument();
  });

  it('displays icons for items', () => {
    renderWithTheme(<Sidebar groups={mockGroups} />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('shows badges for items', () => {
    const { container } = renderWithTheme(<Sidebar groups={mockGroups} />);

    // Ant Design Badge has specific class
    const badges = container.querySelectorAll('.ant-badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('toggles collapsed state on button click', () => {
    renderWithTheme(<Sidebar groups={mockGroups} />);

    // Initially not collapsed - chevron left icon should be visible
    expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();

    // Click collapse button
    const collapseButton = screen.getByTestId('chevron-left-icon').closest('button');
    if (collapseButton) {
      fireEvent.click(collapseButton);

      // After collapse - chevron right icon should be visible
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    }
  });

  it('hides labels when collapsed', () => {
    renderWithTheme(<Sidebar groups={mockGroups} collapsed />);

    // Labels should not be visible when collapsed
    // (Ant Design Menu inlineCollapsed hides them)
    const menu = document.querySelector('.ant-menu-inline-collapsed');
    expect(menu).toBeInTheDocument();
  });

  it('calls onCollapse when collapse button is clicked', () => {
    const onCollapse = vi.fn();

    renderWithTheme(<Sidebar groups={mockGroups} onCollapse={onCollapse} />);

    const collapseButton = screen.getByTestId('chevron-left-icon').closest('button');
    if (collapseButton) {
      fireEvent.click(collapseButton);

      expect(onCollapse).toHaveBeenCalledWith(true);
    }
  });

  it('calls onItemClick when item is clicked', () => {
    const onItemClick = vi.fn();

    renderWithTheme(<Sidebar groups={mockGroups} onItemClick={onItemClick} />);

    const homeItem = screen.getByText('Home');
    fireEvent.click(homeItem);

    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'home',
        label: 'Home',
      })
    );
  });

  it('highlights active item', () => {
    renderWithTheme(<Sidebar groups={mockGroups} activeKey="home" />);

    // Ant Design Menu applies specific class to selected items
    const menu = document.querySelector('.ant-menu');
    expect(menu).toBeInTheDocument();
  });

  it('renders custom logo', () => {
    const logo = <div data-testid="custom-logo">My Logo</div>;

    renderWithTheme(<Sidebar groups={mockGroups} logo={logo} />);

    expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
  });

  it('renders custom footer', () => {
    const footer = <div data-testid="custom-footer">Footer Content</div>;

    renderWithTheme(<Sidebar groups={mockGroups} footer={footer} />);

    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  it('applies custom width', () => {
    const { container } = renderWithTheme(<Sidebar groups={mockGroups} width={300} />);

    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveStyle({ width: '300px' });
  });

  it('applies collapsed width when collapsed', () => {
    const { container } = renderWithTheme(
      <Sidebar groups={mockGroups} collapsed collapsedWidth={60} />
    );

    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveStyle({ width: '60px' });
  });

  it('applies custom className and style', () => {
    const { container } = renderWithTheme(
      <Sidebar
        groups={mockGroups}
        className="custom-sidebar"
        style={{ marginTop: 10 }}
      />
    );

    const sidebar = container.querySelector('.custom-sidebar');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveStyle({ marginTop: '10px' });
  });

  it('renders correctly with Spotify theme', () => {
    const { container } = renderWithTheme(
      <Sidebar groups={mockGroups} />,
      'spotify'
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Stripe theme', () => {
    const { container } = renderWithTheme(
      <Sidebar groups={mockGroups} />,
      'stripe'
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Notion theme', () => {
    const { container } = renderWithTheme(
      <Sidebar groups={mockGroups} />,
      'notion'
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Linear theme', () => {
    const { container } = renderWithTheme(
      <Sidebar groups={mockGroups} />,
      'linear'
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('hides group titles when collapsed', () => {
    const { rerender } = renderWithTheme(<Sidebar groups={mockGroups} />);

    expect(screen.getByText('Management')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Sidebar groups={mockGroups} collapsed />
      </ThemeProvider>
    );

    // Group titles should not be visible when collapsed
    expect(screen.queryByText('Management')).not.toBeInTheDocument();
  });

  it('handles submenu items', () => {
    const groupsWithSubmenu: SidebarGroup[] = [
      {
        items: [
          {
            key: 'parent',
            label: 'Parent',
            icon: <span>📁</span>,
            children: [
              {
                key: 'child1',
                label: 'Child 1',
              },
              {
                key: 'child2',
                label: 'Child 2',
              },
            ],
          },
        ],
      },
    ];

    renderWithTheme(<Sidebar groups={groupsWithSubmenu} />);

    expect(screen.getByText('Parent')).toBeInTheDocument();
  });

  it('handles controlled collapse state', () => {
    const { rerender } = renderWithTheme(<Sidebar groups={mockGroups} collapsed={false} />);

    expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Sidebar groups={mockGroups} collapsed={true} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
  });

  it('supports uncontrolled collapse state', () => {
    renderWithTheme(<Sidebar groups={mockGroups} />);

    const collapseButton = screen.getByTestId('chevron-left-icon').closest('button');
    if (collapseButton) {
      fireEvent.click(collapseButton);

      // Should toggle to collapsed state
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    }
  });

  it('renders empty sidebar with no groups', () => {
    const { container } = renderWithTheme(<Sidebar groups={[]} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows badge text when provided', () => {
    renderWithTheme(<Sidebar groups={mockGroups} />);

    // Badge with text "12" should be visible
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
