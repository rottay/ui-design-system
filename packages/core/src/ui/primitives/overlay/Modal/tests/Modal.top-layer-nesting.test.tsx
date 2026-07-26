/**
 * @fileoverview Modal modern -- top-layer nesting contract.
 *
 * `ModernModal` promotes its `<dialog>` with `showModal()`, putting it in the
 * browser TOP LAYER. Any descendant overlay that portals to the shared
 * `#rottay-portal-root` would render as a SIBLING of that dialog and be
 * painted over by it -- the reported "Select inside a Modal is invisible"
 * defect. z-index cannot fix it; the top layer is outside the z-index model.
 *
 * These tests pin the end-to-end contract: a Modal publishes a top-layer host
 * inside its own dialog, and every descendant Portal resolves into it.
 */

import { describe, expect, it, afterEach, beforeAll, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernModal from '../engines/modern';
import { Portal } from '../../../runtime/overlay/portal';

/** ModernModal calls useTranslation(), which requires an I18nProvider. */
const withI18n = (ui: ReactNode): React.ReactElement => (
  <I18nProvider>{ui}</I18nProvider>
);

// happy-dom does not implement the native dialog top layer. `showModal()` is
// stubbed to the observable part of the contract (`open`), which is what the
// host lifecycle keys off.
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

afterEach(() => {
  cleanup();
  document.getElementById('rottay-portal-root')?.remove();
});

describe('Modal modern -- top-layer nesting', () => {
  it('publishes a top-layer host inside its own dialog when open', () => {
    render(withI18n(
      <ModernModal open onClose={vi.fn()} ariaLabel="m">
        <p>body</p>
      </ModernModal>,
    ));

    const dialog = document.querySelector('dialog') as HTMLDialogElement | null;
    expect(dialog).not.toBeNull();
    // Host existence alone is a false positive: the host lifecycle keys off
    // React state, so it publishes even for a dialog that was never promoted.
    // `open` is only ever set by showModal(), never by this engine's JSX.
    expect(dialog?.open).toBe(true);
    const host = dialog?.querySelector('[data-rottay-toplayer-host="true"]');
    expect(host).not.toBeNull();
  });

  it('keeps a descendant Portal INSIDE the dialog, not beside it', () => {
    render(withI18n(
      <ModernModal open onClose={vi.fn()} ariaLabel="m">
        <Portal>
          <div data-testid="nested-overlay" />
        </Portal>
      </ModernModal>,
    ));

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    const nested = document.querySelector('[data-testid="nested-overlay"]');

    // Nesting only matters because the dialog really is in the top layer.
    expect(dialog.open).toBe(true);
    expect(nested).not.toBeNull();
    // The defect: nested would live in #rottay-portal-root as a sibling of
    // the top-layer dialog, and therefore be occluded.
    expect(dialog.contains(nested as Node)).toBe(true);

    const sharedRoot = document.getElementById('rottay-portal-root');
    // The dialog itself lives in the shared root; the nested overlay must not
    // be a direct child of it.
    expect(nested?.parentElement?.id).not.toBe('rottay-portal-root');
    expect(sharedRoot?.contains(dialog)).toBe(true);
  });

  it('withdraws the host when the modal closes so portals fall back', () => {
    const { rerender } = render(withI18n(
      <ModernModal open onClose={vi.fn()} ariaLabel="m">
        <p>body</p>
      </ModernModal>,
    ));
    expect(
      document.querySelector('dialog [data-rottay-toplayer-host="true"]'),
    ).not.toBeNull();
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(true);

    rerender(withI18n(
      <ModernModal open={false} onClose={vi.fn()} ariaLabel="m">
        <p>body</p>
      </ModernModal>,
    ));

    expect(
      document.querySelector('[data-rottay-toplayer-host="true"]'),
    ).toBeNull();
    // No dialog may be left sitting in the top layer once the host is gone.
    expect(
      (document.querySelector('dialog') as HTMLDialogElement | null)?.open ?? false,
    ).toBe(false);
  });

  it('does not resolve the dialog itself into its own host (no circularity)', () => {
    render(withI18n(
      <ModernModal open onClose={vi.fn()} ariaLabel="m">
        <p>body</p>
      </ModernModal>,
    ));

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    const host = dialog.querySelector('[data-rottay-toplayer-host="true"]');

    expect(dialog.open).toBe(true);
    // The dialog must NOT have been portaled inside its own host.
    expect(host?.contains(dialog) ?? false).toBe(false);
    expect(dialog.parentElement?.id).toBe('rottay-portal-root');
  });
});
