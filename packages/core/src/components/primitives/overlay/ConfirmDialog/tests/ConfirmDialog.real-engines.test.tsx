import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { ConfirmDialog } from '../ConfirmDialog';
import { renderWithEngine, STABLE_ENGINES } from '../../../../../_internal/testing/helpers/engine-test-utils';

async function preloadConfirmDialogEngine(engine: (typeof STABLE_ENGINES)[number]) {
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

describe('ConfirmDialog real engines', () => {
  it.each(STABLE_ENGINES)(
    'renders title and confirms through the %s engine',
    async (engine) => {
      await preloadConfirmDialogEngine(engine);
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      const { unmount } = renderWithEngine(
        <ConfirmDialog
          engine={engine}
          open
          variant="warning"
          title="Archive workspace"
          description="This keeps the data but hides it from the main workspace list."
          confirmLabel="Archive"
          cancelLabel="Keep active"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
        engine
      );

      expect(await screen.findByText('Archive workspace', {}, { timeout: 15000 })).toBeInTheDocument();
      expect(screen.getByText(/keeps the data/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Archive' }));

      await waitFor(() => {
        expect(handleConfirm).toHaveBeenCalledTimes(1);
      });

      fireEvent.click(screen.getByRole('button', { name: 'Keep active' }));

      await waitFor(() => {
        expect(handleCancel).toHaveBeenCalledTimes(1);
      });

      unmount();
    },
    45000
  );

  it('closes on escape through the rustic engine', async () => {
    await preloadConfirmDialogEngine('rustic');
    const handleCancel = vi.fn();

    renderWithEngine(
      <ConfirmDialog
        engine="rustic"
        open
        title="Delete segment"
        description="This cannot be undone."
        onCancel={handleCancel}
      />,
      'rustic'
    );

    expect(await screen.findByText('Delete segment', {}, { timeout: 15000 })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });

  it('disables both actions while loading in the rustic engine', async () => {
    await preloadConfirmDialogEngine('rustic');

    renderWithEngine(
      <ConfirmDialog
        engine="rustic"
        open
        title="Publishing"
        loading
        onCancel={vi.fn()}
      />,
      'rustic'
    );

    expect(await screen.findByRole('button', { name: 'Cancel' }, { timeout: 15000 })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
  });
});
