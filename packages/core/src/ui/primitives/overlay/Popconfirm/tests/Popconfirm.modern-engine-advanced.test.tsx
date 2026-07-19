import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPopconfirm from '../engines/modern';

describe('Popconfirm modern engine advanced coverage', () => {
  it('covers trigger open, async confirm, cancel, outside click, and disabled branches', async () => {
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    const onConfirm = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 10);
        })
    );

    const { rerender } = render(
      <ModernPopconfirm
        title="Delete record?"
        description="This action cannot be undone."
        icon={<span data-testid="confirm-icon">!</span>}
        okText="Delete"
        cancelText="Keep"
        okType="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
        placement="bottomRight"
      >
        <button type="button">Delete</button>
      </ModernPopconfirm>
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByText('Delete record?')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-icon')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText('Delete record?')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByText('Delete record?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Keep' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByText('Delete record?')).toBeInTheDocument();

    const surface = screen.getByText('Delete record?').closest('[data-part="surface"]') as HTMLElement;
    fireEvent.click(within(surface).getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.queryByText('Delete record?')).not.toBeInTheDocument();
    });

    rerender(
      <ModernPopconfirm
        title="Disabled"
        disabled
        okType="default"
      >
        <button type="button">Disabled trigger</button>
      </ModernPopconfirm>
    );

    fireEvent.click(screen.getByText('Disabled trigger'));
    expect(screen.queryByText('Disabled')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalled();
  });
});
