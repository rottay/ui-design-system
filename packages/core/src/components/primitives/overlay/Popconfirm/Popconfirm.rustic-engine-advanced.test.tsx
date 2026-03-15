import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RusticPopconfirm from './engines/rustic';

describe('Popconfirm rustic engine advanced coverage', () => {
  it('covers trigger open, async confirm, cancel, outside click, disabled, and okType branches', async () => {
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    const onConfirm = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 10);
        })
    );

    const { rerender } = render(
      <RusticPopconfirm
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
      </RusticPopconfirm>
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-icon')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Keep' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    rerender(
      <RusticPopconfirm
        title="Disabled"
        disabled
        okType="default"
      >
        <button type="button">Disabled trigger</button>
      </RusticPopconfirm>
    );

    fireEvent.click(screen.getByText('Disabled trigger'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalled();
  });
});
