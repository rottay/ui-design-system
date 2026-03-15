import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { AlertDialog } from '.';
import { Button } from '../../inputs/Button';
import { renderWithEngine, STABLE_ENGINES } from '../../../../testing/helpers/engine-test-utils';

async function preloadAlertDialogEngine(engine: (typeof STABLE_ENGINES)[number]) {
  switch (engine) {
    case 'classic':
      await import('./engines/classic');
      return;
    case 'modern':
      await import('./engines/modern');
      return;
    case 'rustic':
      await import('./engines/rustic');
      return;
  }
}

describe('AlertDialog real engines', () => {
  it.each(STABLE_ENGINES)(
    'renders the action slot and cancel flow through the %s engine',
    async (engine) => {
      await preloadAlertDialogEngine(engine);
      const handleOpenChange = vi.fn();
      const handleDelete = vi.fn();

      const { unmount } = renderWithEngine(
        <AlertDialog
          engine={engine}
          open
          title="Remove API key"
          description="All clients using this key will stop working immediately."
          onOpenChange={handleOpenChange}
          action={
            <Button engine={engine} variant="danger" onClick={handleDelete}>
              Delete key
            </Button>
          }
        />,
        engine
      );

      expect(await screen.findByText('Remove API key', {}, { timeout: 15000 })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /delete key/i }));
      expect(handleDelete).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });

      unmount();
    },
    45000
  );

  it('honors backdrop closing branches in the rustic engine', async () => {
    await preloadAlertDialogEngine('rustic');
    const lockedChange = vi.fn();
    const closableChange = vi.fn();

    const { rerender } = renderWithEngine(
      <AlertDialog
        engine="rustic"
        open
        title="Locked dialog"
        description="Backdrop should not close this."
        onOpenChange={lockedChange}
        closeOnBackdropClick={false}
      />,
      'rustic'
    );

    const firstBackdrop = document.querySelector('.rottay-alert-dialog-rustic') as HTMLDivElement | null;
    expect(firstBackdrop).toBeTruthy();
    fireEvent.click(firstBackdrop!);
    expect(lockedChange).not.toHaveBeenCalled();

    rerender(
      <AlertDialog
        engine="rustic"
        open
        title="Closable dialog"
        description="Backdrop should close this."
        onOpenChange={closableChange}
        closeOnBackdropClick
      />
    );

    const secondBackdrop = document.querySelector('.rottay-alert-dialog-rustic') as HTMLDivElement | null;
    expect(secondBackdrop).toBeTruthy();
    fireEvent.click(secondBackdrop!);

    await waitFor(() => {
      expect(closableChange).toHaveBeenCalledWith(false);
    });
  });
});
