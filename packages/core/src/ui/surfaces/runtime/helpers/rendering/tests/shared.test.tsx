/**
 * @fileoverview Shared surface chrome tests for action a11y and allowlists.
 */

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/ui/primitives', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    loading,
    icon,
    'aria-label': ariaLabel,
    'data-surface-action': surfaceAction,
  }: any) => (
    <button
      type="button"
      aria-label={ariaLabel}
      data-surface-action={surfaceAction}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  ),
  Card: ({ children }: any) => <section>{children}</section>,
  Flex: ({ children }: any) => <div>{children}</div>,
  Stack: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
}));

describe('SurfaceActionBar', () => {
  it('renders allowlisted actions with accessible labels and stable action ids', async () => {
    const { SurfaceActionBar } = await import('..');
    const user = userEvent.setup();
    const onExport = vi.fn();
    const onDelete = vi.fn();

    render(
      <SurfaceActionBar
        actions={[
          { id: 'export', label: 'Export CSV', onClick: onExport },
          { id: 'delete', label: 'Delete', variant: 'danger', onClick: onDelete },
        ]}
        permissions={{
          allowedActions: ['export'],
        }}
      />
    );

    const exportButton = screen.getByRole('button', { name: 'Export CSV' });
    expect(exportButton).toHaveAttribute('data-surface-action', 'export');
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();

    await user.click(exportButton);
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });
});
