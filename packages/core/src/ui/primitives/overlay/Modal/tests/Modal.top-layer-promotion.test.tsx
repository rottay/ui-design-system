/**
 * @fileoverview Modal modern -- top-layer PROMOTION contract.
 *
 * Sibling of `Modal.top-layer-nesting.test.tsx`. That file pins where the
 * top-layer host lives; this one pins the thing the host is useless without:
 * the `<dialog>` must actually be promoted via `showModal()`, i.e.
 * `dialog.open === true`.
 *
 * The distinction matters because the host lifecycle keys off React state
 * (`open && shouldRender && dialogEl`), NOT off the dialog's real top-layer
 * status. A regression that never calls `showModal()` still publishes a host,
 * so host-existence assertions cannot see it. Only `dialog.open` can.
 *
 * `<dialog>` is never rendered with an `open` attribute by this engine, so
 * `dialog.open === true` is observable proof that `showModal()` ran.
 */

import { describe, expect, it, afterEach, beforeAll, vi } from 'vitest';
import { StrictMode, type ReactNode } from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernModal from '../engines/modern';

/** ModernModal calls useTranslation(), which requires an I18nProvider. */
const withI18n = (ui: ReactNode): React.ReactElement => (
  <I18nProvider locale="en">{ui}</I18nProvider>
);

// happy-dom does not implement the native dialog top layer. `showModal()` is
// stubbed to the observable part of the contract (`open`), which is what the
// host lifecycle keys off. Same idiom as Modal.top-layer-nesting.test.tsx.
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
 * Records every `showModal()` call and the element it was called on, while
 * preserving the real behaviour. `showModal()` on an already-open dialog
 * throws `InvalidStateError` in real browsers (happy-dom is lenient), so the
 * call COUNT is the only portable way to pin "promoted exactly once".
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

describe('Modal modern -- top-layer promotion', () => {
  it('promotes the dialog on the first commit, despite Portal mounting it a commit late', () => {
    // The defect: <Portal> renders null until its own mount effect resolves a
    // container, so the dialog does not exist when a `[open]`-only effect
    // first runs -- and nothing retriggers it. The host is published anyway.
    const { calls } = trackPromotions();

    render(withI18n(
      <ModernModal open onClose={vi.fn()} aria-label="m">
        <p>body</p>
      </ModernModal>,
    ));

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog).not.toBeNull();
    expect(dialog.open).toBe(true);
    expect(calls).toEqual([dialog]);
  });

  it('promotes when the modal opens after mount (closed -> open)', () => {
    const { calls } = trackPromotions();

    const { rerender } = render(withI18n(
      <ModernModal open={false} onClose={vi.fn()} aria-label="m">
        <p>body</p>
      </ModernModal>,
    ));
    expect(document.querySelector('dialog')).toBeNull();
    expect(calls).toHaveLength(0);

    rerender(withI18n(
      <ModernModal open onClose={vi.fn()} aria-label="m">
        <p>body</p>
      </ModernModal>,
    ));

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(calls).toEqual([dialog]);
  });

  it('does not re-promote on unrelated re-renders while it stays open', () => {
    // `showModal()` on an already-open dialog throws InvalidStateError in a
    // real browser. Any effect that re-fires on every render would be a live
    // crash there and only a silent no-op here.
    const { calls } = trackPromotions();

    const { rerender } = render(withI18n(
      <ModernModal open onClose={vi.fn()} aria-label="m" title="a">
        <p>body</p>
      </ModernModal>,
    ));
    expect(calls).toHaveLength(1);

    rerender(withI18n(
      <ModernModal open onClose={vi.fn()} aria-label="m" title="b">
        <p>body</p>
      </ModernModal>,
    ));
    rerender(withI18n(
      <ModernModal open onClose={vi.fn()} aria-label="m" title="c">
        <p>body</p>
      </ModernModal>,
    ));

    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
    expect(calls).toHaveLength(1);
  });

  it('survives a rapid open -> closed -> open cycle with one promotion per open', async () => {
    const { calls } = trackPromotions();
    const modal = (open: boolean) => withI18n(
      <ModernModal open={open} onClose={vi.fn()} aria-label="m">
        <p>body</p>
      </ModernModal>,
    );

    const { rerender } = render(modal(true));
    expect(calls).toHaveLength(1);

    rerender(modal(false));
    rerender(modal(true));

    await waitFor(() => {
      const dialog = document.querySelector('dialog') as HTMLDialogElement | null;
      expect(dialog).not.toBeNull();
      expect(dialog?.open).toBe(true);
    });
    // One promotion per open transition -- never two for the same dialog.
    expect(calls.length).toBeLessThanOrEqual(2);
    expect(new Set(calls).size).toBe(calls.length);
  });

  it('promotes exactly once under StrictMode double-invocation', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { calls } = trackPromotions();

    render(
      <StrictMode>
        {withI18n(
          <ModernModal open onClose={vi.fn()} aria-label="m">
            <p>body</p>
          </ModernModal>,
        )}
      </StrictMode>,
    );

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(calls).toEqual([dialog]);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('withdraws the host AND leaves no open dialog behind on close', async () => {
    const { calls } = trackPromotions();
    const modal = (open: boolean) => withI18n(
      <ModernModal open={open} onClose={vi.fn()} aria-label="m">
        <p>body</p>
      </ModernModal>,
    );

    const { rerender } = render(modal(true));
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
    expect(
      document.querySelector('dialog [data-rottay-toplayer-host="true"]'),
    ).not.toBeNull();

    rerender(modal(false));

    await waitFor(() => {
      expect(document.querySelector('[data-rottay-toplayer-host="true"]')).toBeNull();
      // usePresence unmounts the dialog only after its exit motion resolves;
      // whichever way it resolves, no promoted dialog may survive the close.
      const dialog = document.querySelector('dialog') as HTMLDialogElement | null;
      expect(dialog?.open ?? false).toBe(false);
    });
    expect(calls).toHaveLength(1);
  });

  it('publishes the top-layer host only alongside a really-promoted dialog', () => {
    // Guards the exact blind spot of the host-existence assertions: a host
    // inside a dialog that never entered the top layer is a false positive.
    trackPromotions();

    render(withI18n(
      <ModernModal open onClose={vi.fn()} aria-label="m">
        <p>body</p>
      </ModernModal>,
    ));

    const host = document.querySelector<HTMLElement>('[data-rottay-toplayer-host="true"]');
    expect(host).not.toBeNull();
    const owner = host?.closest('dialog') as HTMLDialogElement | null;
    expect(owner).not.toBeNull();
    expect(owner?.open).toBe(true);
  });
});
