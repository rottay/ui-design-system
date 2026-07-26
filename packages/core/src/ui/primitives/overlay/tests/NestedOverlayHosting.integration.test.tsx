import React from 'react';
import { describe, expect, it, afterEach, beforeAll, vi } from 'vitest';
import { cleanup, fireEvent, waitFor } from '@testing-library/react';

import { Modal } from '../Modal';
import { Dropdown } from '../Dropdown';
import { Select } from '../../inputs/Select';
import { DatePicker } from '../../inputs/DatePicker';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// Nested-overlay hosting -- the cross-unit half of the top-layer contract.
//
// `Modal` modern promotes its `<dialog>` with `showModal()`, which puts it in
// the browser TOP LAYER. The top layer paints above every normal-flow node
// regardless of `z-index`, so a nested overlay that portals to the shared
// `#rottay-portal-root` (a plain `document.body` child) lands there as a
// SIBLING of the dialog and is painted over by it -- the reported "Select
// inside a Modal is invisible" defect. Raising `z-index` cannot fix it.
//
// `runtime/overlay/top-layer-host` is the substrate that does: an open dialog
// publishes a `[data-rottay-toplayer-host="true"]` element inside itself and
// `runtime/overlay/portal` resolves into it, so descendant portals stay in the
// same top-layer subtree. `Modal.top-layer-nesting.test.tsx` pins the
// mechanism against a bare `<Portal>`; this file pins the END-TO-END result
// for the real nested overlays a form inside a modal actually uses.
//
// The three subjects deliberately cover the three portal postures in the tree:
// - Select modern portals through the shared `<Portal>` -> resolves the host.
// - Dropdown modern renders its surface in-tree (it only portals when the
//   consumer supplies `getPopupContainer`, and then through `<Portal>`'s
//   explicit-container path), so it is inside the dialog by construction --
//   pinned so a future move to an unconditional portal cannot silently
//   regress it.
// - DatePicker modern used to call `createPortal(panel, document.body)`
//   directly, BYPASSING the Portal primitive, so it never consulted the host.
//   That case was pinned red as `it.fails`; the bypass is now routed through
//   `<Portal>` and the case below asserts the contract green.
// ---------------------------------------------------------------------------

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

afterEach(() => {
  cleanup();
  document.getElementById('rottay-portal-root')?.remove();
});

const OPTIONS = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
];

const MENU_ITEMS = [
  { key: 'rename', label: 'Rename' },
  { key: 'archive', label: 'Archive' },
];

/** Resolves the modal `<dialog>` and the top-layer host it publishes. The
 * engine chunk is lazy, so both appear a tick after render (same race the
 * batch contract waits on).
 *
 * Deliberately does NOT assert `dialog.open`: `Modal` modern's promotion
 * effect reads `dialogRef.current` under a `[open]`-only dependency list, and
 * the dialog mounts inside `<Portal>` one commit LATER, so `showModal()` is
 * never reached on this path (the sibling host effect below it avoids the
 * same trap with a callback-ref `dialogEl` state). That is a Modal-owned
 * defect, reported separately -- it does not affect the hosting contract
 * pinned here, which keys off the published host. */
async function waitForModalDialog(): Promise<HTMLDialogElement> {
  await waitFor(() => {
    expect(document.querySelector('dialog.rottay-modal--modern')).not.toBeNull();
  });
  return document.querySelector('dialog.rottay-modal--modern') as HTMLDialogElement;
}

/** Waits for a document-level node matching `selector`. Selectors are always
 * anchored to the owning component's scope class -- `data-part` is a shared
 * vocabulary, not an identifier (data-part-contracts law). */
async function waitForDocumentNode(selector: string): Promise<HTMLElement> {
  await waitFor(() => {
    expect(document.querySelector(selector)).not.toBeNull();
  });
  return document.querySelector(selector) as HTMLElement;
}

/**
 * The contract under test: a nested overlay opened inside an open modern
 * Modal renders INSIDE that modal's `<dialog>` and NOT as a sibling of it in
 * the shared portal root.
 */
function expectHostedInsideDialog(dialog: HTMLDialogElement, surface: HTMLElement): void {
  expect(dialog.contains(surface)).toBe(true);

  // The defect shape: the surface (or an ancestor of it) sitting directly
  // under `#rottay-portal-root`, beside the top-layer dialog and occluded by
  // it. The dialog itself legitimately lives there, so the check is that the
  // surface's own portal branch is not a second child of that root.
  const sharedRoot = document.getElementById('rottay-portal-root');
  expect(sharedRoot).not.toBeNull();
  const sharedRootChildren = Array.from(sharedRoot?.children ?? []);
  expect(sharedRootChildren).toContain(dialog);
  expect(sharedRootChildren.some((child) => child !== dialog && child.contains(surface))).toBe(false);

  // ...and not parked directly on document.body either (the other bypass
  // shape: `createPortal(panel, document.body)`).
  expect(Array.from(document.body.children).some((child) => child.contains(surface) && !child.contains(dialog))).toBe(false);
}

describe('Nested overlays inside an open modern Modal', () => {
  it('keeps a portaled Select dropdown inside the modal dialog, in the published top-layer host', async () => {
    renderWithEngine(
      <Modal open onClose={vi.fn()} title="Edit record">
        {/* `searchable` selects the custom-dropdown branch. The plain branch
            (non-searchable, single, ungrouped) renders a native <select>,
            which has no portal and therefore nothing to prove here. */}
        <Select options={OPTIONS} placeholder="Pick one" searchable />
      </Modal>,
      'modern',
    );

    const dialog = await waitForModalDialog();
    const host = dialog.querySelector('[data-rottay-toplayer-host="true"]');
    expect(host).not.toBeNull();

    // The Select trigger lives inside the portaled dialog, not in the render
    // container, so it is resolved from the document.
    const trigger = await waitForDocumentNode('.rottay-select__trigger');
    expect(dialog.contains(trigger)).toBe(true);
    fireEvent.click(trigger);

    const dropdown = await waitForDocumentNode('.ds-select-shell__dropdown');
    expectHostedInsideDialog(dialog, dropdown);
    // Stronger than mere containment: the surface resolved the MODAL'S host,
    // which is the mechanism that guarantees it stays in the top-layer subtree
    // rather than landing inside the dialog by accident of markup.
    expect(host?.contains(dropdown)).toBe(true);
  });

  it('keeps a Dropdown menu surface inside the modal dialog', async () => {
    renderWithEngine(
      <Modal open onClose={vi.fn()} title="Edit record">
        <Dropdown open trigger={['click']} menu={{ items: MENU_ITEMS, onClick: vi.fn() }}>
          <button type="button">Actions</button>
        </Dropdown>
      </Modal>,
      'modern',
    );

    const dialog = await waitForModalDialog();
    const surface = await waitForDocumentNode(".rottay-dropdown--modern [data-part='surface']");

    expectHostedInsideDialog(dialog, surface);
    // Dropdown modern keeps its surface in-tree unless the consumer supplies
    // `getPopupContainer`, so the surface must be a descendant of its own
    // trigger container -- no portal hop at all.
    const triggerContainer = document.querySelector('.rottay-dropdown--modern') as HTMLElement;
    expect(triggerContainer.contains(surface)).toBe(true);
  });

  // Was `it.fails` while `inputs/DatePicker/engines/modern/index.tsx` called
  // `createPortal(panel, document.body)` directly, which never consulted the
  // modal's published top-layer host and let the dialog paint over the panel.
  // The picker now renders through `<Portal>`, so the same unweakened
  // assertion is pinned green.
  it('keeps a DatePicker calendar panel inside the modal dialog', async () => {
    renderWithEngine(
      <Modal open onClose={vi.fn()} title="Edit record">
        <DatePicker open />
      </Modal>,
      'modern',
    );

    const dialog = await waitForModalDialog();
    const panel = await waitForDocumentNode(".rottay-datepicker-panel--modern[data-part='panel']");

    expectHostedInsideDialog(dialog, panel);
    // Stronger than mere containment: the panel resolved the MODAL'S host, the
    // mechanism that keeps it in the top-layer subtree rather than landing
    // inside the dialog by accident of markup.
    const host = dialog.querySelector('[data-rottay-toplayer-host="true"]');
    expect(host).not.toBeNull();
    expect(host?.contains(panel)).toBe(true);
  });
});
