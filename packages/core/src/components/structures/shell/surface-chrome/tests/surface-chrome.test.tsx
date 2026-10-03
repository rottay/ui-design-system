/**
 * @fileoverview `structure/shell/surface-chrome` tests for action a11y and
 * final visibility. Lives under the owning family now that the components
 * have one, instead of beside the support owner that used to publish them.
 */

import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { SurfaceActionBarProps } from '..';
import type { ViewportPosture } from '@/foundation/contracts/kernel/adaptation/foundation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/components/primitives', () => ({
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
  Flex: ({ children, 'data-surface-region': region, 'data-region-disposition': disposition, 'data-posture': posture }: any) => (
    <div data-surface-region={region} data-region-disposition={disposition} data-posture={posture}>{children}</div>
  ),
  Stack: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
}));

describe('SurfaceActionBar', () => {
  it('uses lower-level viewport vocabulary for its optional anatomy attributes', () => {
    expectTypeOf<SurfaceActionBarProps['data-posture']>().toEqualTypeOf<ViewportPosture | undefined>();
    expectTypeOf<SurfaceActionBarProps['data-region-disposition']>().toEqualTypeOf<'render' | 'collapse' | 'hide' | undefined>();
  });

  it('renders app-resolved actions with accessible labels and stable action ids', async () => {
    const { SurfaceActionBar } = await import('..');
    const user = userEvent.setup();
    const onExport = vi.fn();
    const onDelete = vi.fn();

    render(
      <SurfaceActionBar
        data-surface-region="primary-action"
        data-region-disposition="render"
        data-posture="phone"
        actions={[
          { id: 'export', label: 'Export CSV', onClick: onExport },
          { id: 'delete', label: 'Delete', variant: 'danger', onClick: onDelete },
        ]}
        access={{
          mode: 'resolved',
          capabilities: [
            { kind: 'action', id: 'export', visible: true },
            { kind: 'action', id: 'delete', visible: false },
          ],
        }}
      />
    );

    const exportButton = screen.getByRole('button', { name: 'Export CSV' });
    expect(exportButton).toHaveAttribute('data-surface-action', 'export');
    const row = exportButton.parentElement;
    expect(row).toHaveAttribute('data-surface-region', 'primary-action');
    expect(row).toHaveAttribute('data-region-disposition', 'render');
    expect(row).toHaveAttribute('data-posture', 'phone');
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();

    await user.click(exportButton);
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('does not render an annotated row when final access hides every action', async () => {
    const { SurfaceActionBar } = await import('..');
    const { container } = render(
      <SurfaceActionBar
        data-surface-region="primary-action"
        data-region-disposition="render"
        data-posture="phone"
        actions={[{ id: 'denied', label: 'Restricted operation', onClick: vi.fn() }]}
        access={{ mode: 'resolved', capabilities: [{ kind: 'action', id: 'denied', visible: false }] }}
      />,
    );
    expect(container.querySelector('[data-surface-region]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Restricted operation' })).toBeNull();
  });
});
