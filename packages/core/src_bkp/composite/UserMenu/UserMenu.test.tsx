import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserMenu } from './UserMenu';
import { ThemeProvider } from '../../providers/ThemeProvider';
import type { UserMenuProps } from './types';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronDown: () => <span data-testid="chevron-down-icon">▼</span>,
}));

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Administrator',
  avatar: 'https://i.pravatar.cc/150?img=1',
};

const mockMenuItems: UserMenuProps['menuItems'] = [
  {
    key: 'profile',
    label: 'Profile',
    icon: <span data-testid="profile-icon">👤</span>,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <span data-testid="settings-icon">⚙️</span>,
  },
  {
    key: 'divider1',
    label: '',
    divider: true,
  },
  {
    key: 'logout',
    label: 'Logout',
    icon: <span data-testid="logout-icon">🚪</span>,
    danger: true,
  },
];

// Wrapper component with ThemeProvider
const renderWithTheme = (
  ui: React.ReactElement,
  theme: 'base' | 'spotify' | 'stripe' | 'notion' | 'linear' = 'base'
) => {
  return render(<ThemeProvider defaultTemplate={theme}>{ui}</ThemeProvider>);
};

describe('UserMenu', () => {
  it('renders correctly with user info', () => {
    renderWithTheme(<UserMenu user={mockUser} menuItems={mockMenuItems} />);

    // Check if user name is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Check if chevron icon is displayed
    expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
  });

  it('renders avatar with image src', () => {
    const { container } = renderWithTheme(
      <UserMenu user={mockUser} menuItems={mockMenuItems} />
    );

    // Ant Design Avatar with image has a specific class
    const avatar = container.querySelector('.ant-avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('renders avatar with initials when no avatar provided', () => {
    const userWithoutAvatar = {
      name: 'Jane Smith',
      email: 'jane@example.com',
    };

    renderWithTheme(
      <UserMenu user={userWithoutAvatar} menuItems={mockMenuItems} />
    );

    // Should show first letter of name
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('shows notification badge when showBadge is true', () => {
    const { container } = renderWithTheme(
      <UserMenu
        user={mockUser}
        menuItems={mockMenuItems}
        showBadge
        notificationCount={5}
      />
    );

    // Ant Design Badge has specific class
    const badge = container.querySelector('.ant-badge');
    expect(badge).toBeInTheDocument();
  });

  it('does not show notification badge when showBadge is false', () => {
    const { container } = renderWithTheme(
      <UserMenu
        user={mockUser}
        menuItems={mockMenuItems}
        showBadge={false}
        notificationCount={5}
      />
    );

    // Badge should not show count
    const badgeCount = container.querySelector('.ant-badge-count');
    expect(badgeCount).not.toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    renderWithTheme(<UserMenu user={mockUser} menuItems={mockMenuItems} />);

    const trigger = screen.getByText('John Doe').closest('div');
    expect(trigger).toBeInTheDocument();

    // Click to open dropdown
    if (trigger) {
      fireEvent.click(trigger);

      // Dropdown should show user email
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    }
  });

  it('renders menu items in dropdown', () => {
    renderWithTheme(<UserMenu user={mockUser} menuItems={mockMenuItems} />);

    const trigger = screen.getByText('John Doe').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      // Check if menu items are rendered
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();

      // Check icons
      expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    }
  });

  it('calls menu item onClick handler', () => {
    const onProfileClick = vi.fn();

    const menuItemsWithHandlers: UserMenuProps['menuItems'] = [
      {
        key: 'profile',
        label: 'Profile',
        onClick: onProfileClick,
      },
    ];

    renderWithTheme(
      <UserMenu user={mockUser} menuItems={menuItemsWithHandlers} />
    );

    const trigger = screen.getByText('John Doe').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      const profileItem = screen.getByText('Profile');
      fireEvent.click(profileItem);

      expect(onProfileClick).toHaveBeenCalledOnce();
    }
  });

  it('displays user role when provided', () => {
    renderWithTheme(<UserMenu user={mockUser} menuItems={mockMenuItems} />);

    const trigger = screen.getByText('John Doe').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      expect(screen.getByText('Administrator')).toBeInTheDocument();
    }
  });

  it('renders with custom className and style', () => {
    const { container } = renderWithTheme(
      <UserMenu
        user={mockUser}
        menuItems={mockMenuItems}
        className="custom-class"
        style={{ marginTop: 10 }}
      />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ marginTop: '10px' });
  });

  it('renders correctly with Spotify theme', () => {
    const { container } = renderWithTheme(
      <UserMenu user={mockUser} menuItems={mockMenuItems} />,
      'spotify'
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Stripe theme', () => {
    const { container } = renderWithTheme(
      <UserMenu user={mockUser} menuItems={mockMenuItems} />,
      'stripe'
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Notion theme', () => {
    const { container} = renderWithTheme(
      <UserMenu user={mockUser} menuItems={mockMenuItems} />,
      'notion'
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Linear theme', () => {
    const { container } = renderWithTheme(
      <UserMenu user={mockUser} menuItems={mockMenuItems} />,
      'linear'
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('calls onOpenChange when dropdown state changes', () => {
    const onOpenChange = vi.fn();

    renderWithTheme(
      <UserMenu
        user={mockUser}
        menuItems={mockMenuItems}
        onOpenChange={onOpenChange}
      />
    );

    const trigger = screen.getByText('John Doe').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      expect(onOpenChange).toHaveBeenCalled();
    }
  });

  it('renders with different placement options', () => {
    const { rerender } = renderWithTheme(
      <UserMenu user={mockUser} menuItems={mockMenuItems} placement="bottomLeft" />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <UserMenu user={mockUser} menuItems={mockMenuItems} placement="bottomRight" />
      </ThemeProvider>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles danger menu items with special styling', () => {
    const dangerItem: UserMenuProps['menuItems'] = [
      {
        key: 'delete',
        label: 'Delete Account',
        danger: true,
      },
    ];

    renderWithTheme(<UserMenu user={mockUser} menuItems={dangerItem} />);

    const trigger = screen.getByText('John Doe').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    }
  });

  it('renders dividers correctly', () => {
    renderWithTheme(<UserMenu user={mockUser} menuItems={mockMenuItems} />);

    const trigger = screen.getByText('John Doe').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      // Ant Design Divider has specific class
      const { container } = renderWithTheme(
        <UserMenu user={mockUser} menuItems={mockMenuItems} />
      );

      fireEvent.click(screen.getByText('John Doe').closest('div')!);

      const divider = container.querySelector('.ant-divider');
      expect(divider).toBeInTheDocument();
    }
  });
});
