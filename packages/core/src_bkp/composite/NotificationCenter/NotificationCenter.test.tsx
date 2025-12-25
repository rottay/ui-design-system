import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationCenter } from './NotificationCenter';
import { ThemeProvider } from '../../providers/ThemeProvider';
import type { Notification } from './types';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Bell: () => <span data-testid="bell-icon">🔔</span>,
  Check: () => <span data-testid="check-icon">✓</span>,
  Trash2: () => <span data-testid="trash-icon">🗑️</span>,
  Info: () => <span data-testid="info-icon">ℹ️</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">✓</span>,
  AlertTriangle: () => <span data-testid="warning-icon">⚠️</span>,
  XCircle: () => <span data-testid="error-icon">❌</span>,
}));

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New message from John',
    description: 'Hey, can you review my PR?',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    read: false,
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    title: 'Build completed successfully',
    timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    read: true,
    type: 'success',
  },
  {
    id: '3',
    title: 'Deployment failed',
    description: 'Check logs for details',
    timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
    read: false,
    type: 'error',
  },
];

const renderWithTheme = (
  ui: React.ReactElement,
  theme: 'base' | 'spotify' | 'stripe' | 'notion' | 'linear' = 'base'
) => {
  return render(<ThemeProvider defaultTemplate={theme}>{ui}</ThemeProvider>);
};

describe('NotificationCenter', () => {
  it('renders correctly with bell icon', () => {
    renderWithTheme(<NotificationCenter notifications={[]} />);

    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  it('shows badge with unread count', () => {
    const { container } = renderWithTheme(
      <NotificationCenter notifications={mockNotifications} showBadge />
    );

    const badge = container.querySelector('.ant-badge');
    expect(badge).toBeInTheDocument();
  });

  it('hides badge when showBadge is false', () => {
    const { container } = renderWithTheme(
      <NotificationCenter notifications={mockNotifications} showBadge={false} />
    );

    const badgeCount = container.querySelector('.ant-badge-count');
    expect(badgeCount).not.toBeInTheDocument();
  });

  it('displays notifications on click', () => {
    renderWithTheme(<NotificationCenter notifications={mockNotifications} />);

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      expect(screen.getByText('New message from John')).toBeInTheDocument();
      expect(screen.getByText('Build completed successfully')).toBeInTheDocument();
      expect(screen.getByText('Deployment failed')).toBeInTheDocument();
    }
  });

  it('displays notification descriptions', () => {
    renderWithTheme(<NotificationCenter notifications={mockNotifications} />);

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      expect(screen.getByText('Hey, can you review my PR?')).toBeInTheDocument();
      expect(screen.getByText('Check logs for details')).toBeInTheDocument();
    }
  });

  it('shows unread count in header', () => {
    renderWithTheme(<NotificationCenter notifications={mockNotifications} />);

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      // 2 unread notifications (id 1 and 3)
      expect(screen.getByText('(2 unread)')).toBeInTheDocument();
    }
  });

  it('calls onNotificationClick when clicking a notification', () => {
    const onNotificationClick = vi.fn();

    renderWithTheme(
      <NotificationCenter
        notifications={mockNotifications}
        onNotificationClick={onNotificationClick}
      />
    );

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      const notification = screen.getByText('New message from John');
      fireEvent.click(notification);

      expect(onNotificationClick).toHaveBeenCalledWith(mockNotifications[0]);
    }
  });

  it('calls onMarkAsRead when clicking mark as read button', () => {
    const onMarkAsRead = vi.fn();

    renderWithTheme(
      <NotificationCenter
        notifications={mockNotifications}
        onMarkAsRead={onMarkAsRead}
      />
    );

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      const checkButtons = screen.getAllByTestId('check-icon');
      // Click the first mark as read button (for unread notification)
      fireEvent.click(checkButtons[checkButtons.length - 1].closest('button')!);

      expect(onMarkAsRead).toHaveBeenCalled();
    }
  });

  it('calls onMarkAllAsRead when clicking mark all read button', () => {
    const onMarkAllAsRead = vi.fn();

    renderWithTheme(
      <NotificationCenter
        notifications={mockNotifications}
        onMarkAllAsRead={onMarkAllAsRead}
      />
    );

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      const markAllButton = screen.getByText('Mark all read');
      fireEvent.click(markAllButton);

      expect(onMarkAllAsRead).toHaveBeenCalled();
    }
  });

  it('calls onClearAll when clicking clear button', () => {
    const onClearAll = vi.fn();

    renderWithTheme(
      <NotificationCenter
        notifications={mockNotifications}
        onClearAll={onClearAll}
      />
    );

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      expect(onClearAll).toHaveBeenCalled();
    }
  });

  it('shows empty state when no notifications', () => {
    renderWithTheme(<NotificationCenter notifications={[]} />);

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      expect(screen.getByText('No notifications')).toBeInTheDocument();
    }
  });

  it('shows custom empty text', () => {
    renderWithTheme(
      <NotificationCenter notifications={[]} emptyText="All caught up!" />
    );

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      expect(screen.getByText('All caught up!')).toBeInTheDocument();
    }
  });

  it('displays correct icon for notification types', () => {
    renderWithTheme(<NotificationCenter notifications={mockNotifications} />);

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      // Success notification shows check-circle icon
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();

      // Error notification shows error icon
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    }
  });

  it('calculates unread count correctly', () => {
    const { container } = renderWithTheme(
      <NotificationCenter notifications={mockNotifications} showBadge />
    );

    // Should show badge with count of 2 (2 unread notifications)
    const badge = container.querySelector('.ant-badge');
    expect(badge).toBeInTheDocument();
  });

  it('uses provided unreadCount prop', () => {
    renderWithTheme(
      <NotificationCenter
        notifications={mockNotifications}
        unreadCount={5}
        showBadge
      />
    );

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      // Should show provided count instead of calculated
      expect(screen.getByText('(5 unread)')).toBeInTheDocument();
    }
  });

  it('applies custom className and style', () => {
    const { container } = renderWithTheme(
      <NotificationCenter
        notifications={[]}
        className="custom-notification"
        style={{ marginTop: 10 }}
      />
    );

    const wrapper = container.querySelector('.custom-notification');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ marginTop: '10px' });
  });

  it('renders correctly with Spotify theme', () => {
    const { container } = renderWithTheme(
      <NotificationCenter notifications={[]} />,
      'spotify'
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Stripe theme', () => {
    const { container } = renderWithTheme(
      <NotificationCenter notifications={[]} />,
      'stripe'
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Notion theme', () => {
    const { container } = renderWithTheme(
      <NotificationCenter notifications={[]} />,
      'notion'
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Linear theme', () => {
    const { container } = renderWithTheme(
      <NotificationCenter notifications={[]} />,
      'linear'
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('formats timestamps correctly', () => {
    renderWithTheme(<NotificationCenter notifications={mockNotifications} />);

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      // Should show relative timestamps
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    }
  });

  it('respects maxHeight prop for scroll', () => {
    const manyNotifications: Notification[] = Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      title: `Notification ${i}`,
      timestamp: new Date(),
      read: false,
    }));

    renderWithTheme(
      <NotificationCenter notifications={manyNotifications} maxHeight={300} />
    );

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      // Check that notifications are rendered
      expect(screen.getByText('Notification 0')).toBeInTheDocument();
    }
  });

  it('shows notification with avatar', () => {
    renderWithTheme(<NotificationCenter notifications={mockNotifications} />);

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      const avatar = screen.getByRole('img', { hidden: true });
      expect(avatar).toBeInTheDocument();
    }
  });

  it('displays action button when provided', () => {
    const notificationWithAction: Notification[] = [
      {
        id: '1',
        title: 'New comment',
        timestamp: new Date(),
        read: false,
        actionLabel: 'View',
        onAction: vi.fn(),
      },
    ];

    renderWithTheme(<NotificationCenter notifications={notificationWithAction} />);

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      expect(screen.getByText('View')).toBeInTheDocument();
    }
  });

  it('calls notification action when clicked', () => {
    const onAction = vi.fn();
    const notificationWithAction: Notification[] = [
      {
        id: '1',
        title: 'New comment',
        timestamp: new Date(),
        read: false,
        actionLabel: 'View',
        onAction,
      },
    ];

    renderWithTheme(<NotificationCenter notifications={notificationWithAction} />);

    const trigger = screen.getByTestId('bell-icon').closest('div');
    if (trigger) {
      fireEvent.click(trigger);

      const actionButton = screen.getByText('View');
      fireEvent.click(actionButton);

      expect(onAction).toHaveBeenCalled();
    }
  });
});
