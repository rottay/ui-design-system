import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { Modal } from '..';
import { renderWithEngine, STABLE_ENGINES } from '../../../../../_internal/testing/helpers/engine-test-utils';

async function preloadModalEngine(engine: (typeof STABLE_ENGINES)[number]) {
  switch (engine) {
    case 'classic':
      await import('../engines/classic');
      return;
    case 'modern':
      await import('../engines/modern');
      return;
    case 'rustic':
      await import('../engines/rustic');
      return;
  }
}

describe('Modal integration', () => {
  it.each(STABLE_ENGINES)(
    'renders the live modal and exposes close affordances through the %s engine',
    async (engine) => {
      await preloadModalEngine(engine);
      const handleClose = vi.fn();

      const { unmount } = renderWithEngine(
        <Modal
          engine={engine}
          open
          title="Confirm publish"
          onClose={handleClose}
        >
          Modal body
        </Modal>,
        engine
      );

      // Some engines render <dialog>, others render role="dialog"; body text is the stable cross-engine signal.
      expect(await screen.findByText('Modal body', {}, { timeout: 15000 })).toBeInTheDocument();
      expect(document.body.textContent).toContain('Confirm publish');

      if (engine === 'classic') {
        const closeButton = document.querySelector('.ant-modal-close') as HTMLButtonElement | null;
        expect(closeButton).toBeTruthy();
        fireEvent.click(closeButton!);
      } else {
        const closeButtons = await screen.findAllByLabelText(/close/i, {}, { timeout: 15000 });
        fireEvent.click(closeButtons[0]);
      }

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledTimes(1);
      });

      unmount();
    },
    45000
  );

  it.each(STABLE_ENGINES)(
    'respects the closeOnEscape guard through the %s engine',
    async (engine) => {
      await preloadModalEngine(engine);
      const handleClose = vi.fn();

      renderWithEngine(
        <Modal engine={engine} open title="Protected" closeOnEscape={false} onClose={handleClose}>
          Guarded modal
        </Modal>,
        engine
      );

      expect(await screen.findByText('Guarded modal', {}, { timeout: 15000 })).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(
        () => {
          expect(handleClose).not.toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    },
    45000
  );
});
