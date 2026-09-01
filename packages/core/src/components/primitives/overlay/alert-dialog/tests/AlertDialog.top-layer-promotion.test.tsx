/**
 * @fileoverview AlertDialog modern -- top-layer PROMOTION contract.
 *
 * Same contract as `Modal.top-layer-promotion.test.tsx`: the `<dialog>` must
 * really enter the browser top layer (`dialog.open === true`), not merely
 * publish a top-layer host. The host lifecycle keys off React state, so a
 * dialog that never received `showModal()` still publishes one -- host
 * assertions cannot see that regression, only `dialog.open` can.
 *
 * The race this pins: `<Portal>` renders null until its own mount effect
 * resolves a container, so the dialog element does not exist on the commit
 * where `open` first becomes true. The promotion effect must therefore be
 * keyed on the ELEMENT arriving, not on `open` alone.
 */

import { describe, expect, it, afterEach, beforeAll, vi } from 'vitest';
import { StrictMode } from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';

import ModernAlertDialog from '../engines/modern';

// happy-dom does not implement the native dialog top layer. `showModal()` is
// stubbed to the observable part of the contract (`open`), matching the
// established idiom in Modal/tests/Modal.top-layer-nesting.test.tsx.
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
  }
});

/**
 * Records every `showModal()` call and its receiver while preserving real
 * behaviour. `showModal()` on an already-open dialog throws InvalidStateError
 * in real browsers (happy-dom is lenient), so the call COUNT is the only
 * portable way to pin "promoted exactly once".
 */
function trackPromotions(): { calls: HTMLDialogElement[] } {
  const calls: HTMLDialogElement[] = [];
  const original = HTMLDialogElement.prototype.showModal;
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(
    function trackedShowModal(this: HTMLDialogElement) {
      calls.push(this);
      original.call(this);
    },
  );
  return { calls };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.getElementById('rottay-portal-root')?.remove();
});

describe('AlertDialog modern -- top-layer promotion', () => {
  it('promotes the dialog on the first commit, despite Portal mounting it a commit late', () => {
    const { calls } = trackPromotions();

    render(<ModernAlertDialog open onOpenChange={vi.fn()} title="Revoke access?" />);

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog).not.toBeNull();
    expect(dialog.open).toBe(true);
    expect(calls).toEqual([dialog]);
  });

  it('promotes when it opens after mount (closed -> open)', () => {
    const { calls } = trackPromotions();

    const { rerender } = render(
      <ModernAlertDialog open={false} onOpenChange={vi.fn()} title="Revoke access?" />,
    );
    expect(document.querySelector('dialog')).toBeNull();
    expect(calls).toHaveLength(0);

    rerender(<ModernAlertDialog open onOpenChange={vi.fn()} title="Revoke access?" />);

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(calls).toEqual([dialog]);
  });

  it('does not re-promote on unrelated re-renders while it stays open', () => {
    const { calls } = trackPromotions();

    const { rerender } = render(
      <ModernAlertDialog open onOpenChange={vi.fn()} title="a" />,
    );
    expect(calls).toHaveLength(1);

    rerender(<ModernAlertDialog open onOpenChange={vi.fn()} title="b" />);
    rerender(<ModernAlertDialog open onOpenChange={vi.fn()} title="c" />);

    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
    expect(calls).toHaveLength(1);
  });

  it('survives a rapid open -> closed -> open cycle with one promotion per open', async () => {
    const { calls } = trackPromotions();
    const dialog = (open: boolean) => (
      <ModernAlertDialog open={open} onOpenChange={vi.fn()} title="Revoke access?" />
    );

    const { rerender } = render(dialog(true));
    expect(calls).toHaveLength(1);

    rerender(dialog(false));
    rerender(dialog(true));

    await waitFor(() => {
      expect((document.querySelector('dialog') as HTMLDialogElement | null)?.open).toBe(true);
    });
    expect(calls.length).toBeLessThanOrEqual(2);
    expect(new Set(calls).size).toBe(calls.length);
  });

  it('promotes exactly once under StrictMode double-invocation', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { calls } = trackPromotions();

    render(
      <StrictMode>
        <ModernAlertDialog open onOpenChange={vi.fn()} title="Revoke access?" />
      </StrictMode>,
    );

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(calls).toEqual([dialog]);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('withdraws the host AND leaves no open dialog behind on close', () => {
    const { calls } = trackPromotions();
    const dialog = (open: boolean) => (
      <ModernAlertDialog open={open} onOpenChange={vi.fn()} title="Revoke access?" />
    );

    const { rerender } = render(dialog(true));
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
    expect(
      document.querySelector('dialog [data-rottay-toplayer-host="true"]'),
    ).not.toBeNull();

    rerender(dialog(false));

    expect(document.querySelector('[data-rottay-toplayer-host="true"]')).toBeNull();
    expect(
      (document.querySelector('dialog') as HTMLDialogElement | null)?.open ?? false,
    ).toBe(false);
    expect(calls).toHaveLength(1);
  });

  it('publishes the top-layer host only alongside a really-promoted dialog', () => {
    trackPromotions();

    render(<ModernAlertDialog open onOpenChange={vi.fn()} title="Revoke access?" />);

    const host = document.querySelector<HTMLElement>('[data-rottay-toplayer-host="true"]');
    expect(host).not.toBeNull();
    const owner = host?.closest('dialog') as HTMLDialogElement | null;
    expect(owner).not.toBeNull();
    expect(owner?.open).toBe(true);
  });
});
