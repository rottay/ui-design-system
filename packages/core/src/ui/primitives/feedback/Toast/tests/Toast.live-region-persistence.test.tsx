/**
 * Toast live-region persistence.
 *
 * A polite live region only announces content inserted into a region the
 * assistive technology was already observing. The stack container used to
 * unmount whenever it held no toasts, so every first toast (and every toast
 * raised after the stack drained) arrived inside a region that mounted
 * already populated -- the canonical never-announced case.
 *
 * @module Toast/tests
 */

import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Toast, ToastProvider, useToast } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

function Harness(): React.ReactElement {
  const api = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() => api.show({ title: 'Saved', duration: 0, closable: true })}
      >
        Show
      </button>
      <Toast.Container />
    </>
  );
}

describe('Toast stack live region', () => {
  it('mounts the polite region before any toast exists and keeps the same node across a full raise/dismiss cycle', async () => {
    renderSurface(
      <ToastProvider>
        <Harness />
      </ToastProvider>
    );

    const region = await waitFor(() => {
      const node = document.querySelector('.rottay-toast-container');
      expect(node).not.toBeNull();
      return node as HTMLElement;
    });
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region.children.length).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(await screen.findByText('Saved')).toBeInTheDocument();

    // The toast was inserted INTO the pre-existing region, not carried in by a
    // freshly mounted one.
    expect(document.querySelector('.rottay-toast-container')).toBe(region);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    });
    await waitFor(() => {
      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });

    // Draining the stack must not tear the region down either: the next toast
    // has to land in a region assistive technology is already watching.
    expect(document.querySelector('.rottay-toast-container')).toBe(region);
  });
});
