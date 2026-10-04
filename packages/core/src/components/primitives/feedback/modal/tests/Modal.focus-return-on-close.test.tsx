// A controlled close runs the native close steps while the page behind the
// dialog is still inert, so the browser cannot land focus on an invoker outside
// it and strands it on `body`. Once the chamber is gone, Modal returns it.

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, waitFor } from '@testing-library/react';

import ModernModal from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';

const invokers: HTMLElement[] = [];

function focusedInvoker(label = 'Open'): HTMLButtonElement {
  const invoker = document.createElement('button');
  invoker.textContent = label;
  document.body.appendChild(invoker);
  invokers.push(invoker);
  act(() => invoker.focus());
  expect(document.activeElement).toBe(invoker);
  return invoker;
}

const modal = (open: boolean) => (
  <ModernModal open={open} title="Delete record" onClose={() => {}}>
    <button type="button" data-testid="inside">Confirm</button>
  </ModernModal>
);

const strandOnBody = () => (document.activeElement as HTMLElement | null)?.blur();

/** Stand focus where a browser's showModal() puts it, then close with the native close steps ending the
 *  way `afterNativeClose` leaves them. Chromium ends them on `body`: its restore targets an inert invoker. */
async function openThenClose(view: ReturnType<typeof renderWithEngine>, afterNativeClose: () => void) {
  const inside = await waitFor(() => {
    const node = document.querySelector<HTMLElement>('[data-testid="inside"]');
    expect(node).toBeTruthy();
    return node!;
  });
  act(() => inside.focus());
  expect(document.activeElement).toBe(inside);

  const nativeClose = HTMLDialogElement.prototype.close;
  const closed = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
    this: HTMLDialogElement,
    ...args: Parameters<HTMLDialogElement['close']>
  ) {
    nativeClose.apply(this, args);
    afterNativeClose();
  });
  try {
    view.rerender(modal(false));
    await waitFor(() => expect(document.querySelector('dialog')).toBeNull());
    expect(closed).toHaveBeenCalledTimes(1);
  } finally {
    closed.mockRestore();
  }
}

afterEach(() => {
  for (const invoker of invokers.splice(0)) invoker.remove();
});

describe('Modal modern engine focus return on a controlled close', () => {
  it('returns a focus stranded on body to the invoker once the dialog is gone', async () => {
    const invoker = focusedInvoker();
    const view = renderWithEngine(modal(true), 'modern');

    await openThenClose(view, strandOnBody);

    await waitFor(() => expect(document.activeElement).toBe(invoker));
  });

  it('releases the page before it refocuses: the invoker is not inert when focus returns', async () => {
    const invoker = focusedInvoker();
    const view = renderWithEngine(modal(true), 'modern');
    await waitFor(() => expect(invoker.inert).toBe(true));

    let inertAtClose: boolean | undefined;
    await openThenClose(view, () => {
      inertAtClose = invoker.inert;
      strandOnBody();
    });

    expect(inertAtClose).toBe(true);
    await waitFor(() => expect(document.activeElement).toBe(invoker));
    expect(invoker.inert).toBe(false);
    expect(invoker.hasAttribute('aria-hidden')).toBe(false);
  });

  it('leaves focus alone when the close moved it somewhere on purpose', async () => {
    focusedInvoker();
    const elsewhere = document.createElement('button');
    elsewhere.textContent = 'Next step';
    document.body.appendChild(elsewhere);
    invokers.push(elsewhere);
    const view = renderWithEngine(modal(true), 'modern');

    await openThenClose(view, () => {
      elsewhere.inert = false;
      elsewhere.focus();
    });

    expect(document.activeElement).toBe(elsewhere);
  });

  it('does nothing when the invoker left the document while the dialog was open', async () => {
    const invoker = focusedInvoker();
    const view = renderWithEngine(modal(true), 'modern');

    await openThenClose(view, () => {
      invoker.remove();
      strandOnBody();
    });

    expect(document.activeElement).toBe(document.body);
  });

  it('steals nothing on a mount that never opened', () => {
    const invoker = focusedInvoker();
    const other = focusedInvoker('Other');
    renderWithEngine(modal(false), 'modern');

    expect(document.activeElement).toBe(other);
    expect(document.activeElement).not.toBe(invoker);
  });
});
