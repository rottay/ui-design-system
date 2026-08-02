import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { Modal } from '../Modal';
import { Tour } from '../Tour';
import { ConfirmDialog } from '../ConfirmDialog';
import { AlertDialog } from '../AlertDialog';
import { Popconfirm } from '../Popconfirm';
import { Sheet } from '../Sheet';
import { ContextMenu } from '../ContextMenu';
import { Popover } from '../Popover';
import { Dropdown } from '../Dropdown';
import { HoverCard } from '../HoverCard';
import { Watermark } from '../Watermark';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-04 checkpoint P -- the overlay-primitives family (Modal, Tour,
// ConfirmDialog, AlertDialog, Popconfirm, Sheet, ContextMenu, Popover,
// Dropdown, HoverCard, Watermark) data-part contract evidence. The
// pattern-tier AdaptiveOverlay owns no DOM of its own (checkpoint contract
// P4/P6) and has no primitive fixture here.
//
// The pre-step stamps `data-part` (plus data-open/data-placement/data-tone/
// data-variant/data-ok-type/data-loading/data-action/data-current/
// data-disabled) onto all eleven components without moving any paint. This
// file proves the stamp reached the DOM for each component under every
// engine it supports, and pins portal posture -- which is per-ENGINE, not
// per-component (checkpoint contract P4): Modal and Tour portal in both
// engines; Watermark portals in neither; Popconfirm, ContextMenu, Dropdown
// and HoverCard portal only under rustic; Sheet portals in both. It does not
// assert paint (that is overlay-batch.spec.ts's job).
//
// ConfirmDialog, AlertDialog and Popover moved their MODERN engines onto the
// shared `<Portal>` + `<PortalScope>` substrate: modern promotes a native
// `<dialog>` (ConfirmDialog/AlertDialog) or follows the JS-positioning branch
// (Popover) and renders at document level, while rustic stays in-tree. For
// those three the posture assertions are engine-aware, and the modern branch
// additionally proves the property the old in-tree assertion could not: the
// tenant/DS scope SURVIVES the portal boundary (see `withDsRoot` /
// `expectTenantScopeSurvivedPortal` below).
//
// `primitives/overlay/Modal` is imported directly from its own local path,
// never from the package barrel -- the barrel re-exports it as `OverlayModal`
// specifically to avoid colliding with the unrelated, already-published
// `primitives/feedback/Modal`'s own `Modal` export (checkpoint contract P1).
//
// Modal, Tour, ConfirmDialog, ContextMenu, and Dropdown's modern engines all
// gate their mount behind `usePresence`, whose `dataState` is derived
// directly from the `present` argument on every render (`present ? 'open' :
// 'closed'`, source: `motion/react/runtime/presence`) -- passing `open` as a
// static prop from the first render means `dataState` (and therefore
// `data-open`) is already correct the instant the node mounts, with no
// separate settling wait beyond the `waitFor`-based `waitForPart`/
// `waitForDocumentSurface` helpers below (which exist for the lazy-engine-
// chunk race, same idiom as OverlaysBatch/StatusBatch.contract.test.tsx).
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<HTMLElement> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as HTMLElement;
}

/** Waits for a portaled surface matching `selector` to appear anywhere in
 * `document` (portaled surfaces render under document.body, outside the
 * render container). `selector` is always anchored to the component's own
 * scope class -- `data-part` is a shared vocabulary, not an identifier
 * (checkpoint contract P1 / data-part-contracts law). */
async function waitForDocumentSurface(selector: string): Promise<HTMLElement> {
  await waitFor(() => {
    expect(document.querySelector(selector)).not.toBeNull();
  });
  return document.querySelector(selector) as HTMLElement;
}

// ---------------------------------------------------------------------------
// DS-root scope fixture
//
// Generated tenant CSS keys on
// `:is(html[data-tenant='X'], :where([data-ds-root][data-vertical='X']))`
// (source: `infrastructure/compilers/composition/tenant-theme`). An overlay
// that portals out of its trigger's lineage therefore keeps its tenant skin
// ONLY if the portal re-stamps that scope -- which is what `<PortalScope>`
// exists for. Proving it requires a real DS root in the tree: the provider
// alone stamps its attributes on `<html>`, which every node inherits whether
// or not the portal carried anything, so a document-level check against the
// provider would pass even for a scope-losing portal.
// ---------------------------------------------------------------------------

const SCOPE_VERTICAL = 'bithire';
const SCOPE_TENANT = 'acme-corp';

/** Wraps `ui` in a DS root carrying a vertical + tenant distinct from the
 * provider's, so a dropped scope is observable rather than masked by <html>. */
function withDsRoot(ui: React.ReactElement): React.ReactElement {
  return (
    <div data-ds-root="" data-vertical={SCOPE_VERTICAL} data-tenant={SCOPE_TENANT}>
      {ui}
    </div>
  );
}

/** Asserts a portaled `surface` still resolves the tenant CSS selectors: it
 * must sit under a `[data-portal-scope="true"]` wrapper re-stamped with the
 * anchor's `data-ds-root` / `data-vertical` / `data-tenant`. */
async function expectTenantScopeSurvivedPortal(surface: HTMLElement): Promise<void> {
  // The scope snapshot is populated from a layout effect on the inline
  // anchor, one commit after the portal branch first mounts.
  await waitFor(() => {
    expect(
      surface
        .closest('[data-portal-scope="true"]')
        ?.getAttribute('data-vertical'),
    ).toBe(SCOPE_VERTICAL);
  });
  const scope = surface.closest('[data-portal-scope="true"]') as HTMLElement;
  expect(scope.hasAttribute('data-ds-root')).toBe(true);
  expect(scope.getAttribute('data-tenant')).toBe(SCOPE_TENANT);
}

/** Per-engine surface selector for the canonical Modal owner. Both engines
 * stamp a distinct root and nested surface; Modern's root is the native
 * `<dialog>`, while Rustic's root is the portaled fixed-position shell. */
function modalSurfaceSelector(engine: 'modern' | 'rustic'): string {
  return engine === 'modern'
    ? ".rottay-overlay-modal-shell--modern [data-part='surface']"
    : ".rottay-modal-root--rustic [data-part='surface']";
}

describe('Overlay-primitives data-part contract (WO-SKIN-04 checkpoint P)', () => {
  describe('Modal', () => {
    it.each(ENGINES)(
      'open: stamps root/backdrop(modern)/surface(data-open)/header/title/description/body/footer/close-button, portaled outside the render container under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Modal
            open
            onClose={vi.fn()}
            title="Settings"
            description="Manage your account"
            closable
            footer={<button type="button">Save</button>}
          >
            Body content
          </Modal>,
          engine,
        );

        const surface = await waitForDocumentSurface(modalSurfaceSelector(engine));
        // Portal posture: Modal portals in BOTH engines via the shared
        // Portal util -> #rottay-portal-root (checkpoint contract P4).
        expect(container.contains(surface)).toBe(false);
        expect(surface.getAttribute('data-open')).toBe('true');

        if (engine === 'modern') {
          // Modern renders a real root (<dialog>) distinct from both the
          // backdrop and the surface.
          expect(document.querySelectorAll(".rottay-overlay-modal-shell--modern[data-part='root']").length).toBe(1);
          expect(document.querySelectorAll(".rottay-overlay-modal-shell--modern [data-part='backdrop']").length).toBe(1);
        } else {
          // Rustic uses its root shell as the scrim. It deliberately has no
          // second backdrop node, but still exposes one canonical root.
          expect(document.querySelectorAll(".rottay-modal-root--rustic[data-part='root']").length).toBe(1);
          expect(document.querySelectorAll(".rottay-modal-root--rustic [data-part='backdrop']").length).toBe(0);
        }

        expect(surface.querySelectorAll("[data-part='header']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='title']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='description']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='body']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='footer']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='close-button']")).toHaveLength(1);
      },
    );
  });

  describe('Tour', () => {
    it.each(ENGINES)(
      'open: stamps root/backdrop/surface(data-open,data-type)/title/description/close-button/footer/indicator(data-current)/action(data-action=prev+next), portaled outside the render container under the %s engine; omits spotlight when no target resolves',
      async (engine) => {
        const { container } = renderWithEngine(
          <Tour
            open
            onClose={vi.fn()}
            type="primary"
            current={1}
            steps={[
              { title: 'Step one', description: 'First step description.' },
              { title: 'Step two', description: 'Second step description.' },
            ]}
          />,
          engine,
        );

        const surface = await waitForDocumentSurface(`.rottay-tour--${engine} [data-part='surface']`);
        // Portal posture: Tour portals in BOTH engines, via a direct
        // createPortal (not the shared Portal util) -- checkpoint contract P4.
        expect(container.contains(surface)).toBe(false);
        expect(surface.getAttribute('data-open')).toBe('true');
        expect(surface.getAttribute('data-type')).toBe('primary');

        expect(document.querySelectorAll(`.rottay-tour--${engine}[data-part='root']`).length).toBe(1);
        expect(document.querySelectorAll(`.rottay-tour--${engine} [data-part='backdrop']`).length).toBe(1);
        // No `target` prop resolves to a real element, so no cutout rect is
        // measured and the spotlight (which only renders when a cutout was
        // measured) must be absent.
        expect(document.querySelectorAll(`.rottay-tour--${engine} [data-part='spotlight']`)).toHaveLength(0);

        expect(surface.querySelectorAll("[data-part='title']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='description']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='close-button']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='footer']")).toHaveLength(1);

        const indicators = surface.querySelectorAll("[data-part='indicator']");
        expect(indicators).toHaveLength(2);
        expect(Array.from(indicators).map((el) => el.getAttribute('data-current'))).toEqual(['false', 'true']);

        // current=1 (the last of 2 steps) renders both the "prev" action
        // (currentStep > 0) and the "next" action (relabelled "Finish" but
        // still data-action="next").
        const actions = surface.querySelectorAll("[data-part='action']");
        expect(actions).toHaveLength(2);
        expect(Array.from(actions).map((el) => el.getAttribute('data-action')).sort()).toEqual(['next', 'prev']);
      },
    );
  });

  describe('ConfirmDialog', () => {
    it.each(ENGINES)(
      'open: stamps backdrop/surface(data-open,data-variant)/icon/title/description/action(data-action=cancel+confirm,data-loading); modern portals to a top-layer <dialog> carrying its tenant scope, rustic stays in-tree, under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          withDsRoot(
            <ConfirmDialog
              open
              title="Delete item?"
              description="This cannot be undone."
              variant="danger"
              onConfirm={vi.fn()}
              onCancel={vi.fn()}
            />,
          ),
          engine,
        );

        // Portal posture: modern portals via <Portal> + <PortalScope>; rustic
        // stays in-tree (checkpoint contract P4, per-ENGINE).
        const surface =
          engine === 'modern'
            ? await waitForDocumentSurface(".rottay-confirm-dialog--modern [data-part='surface']")
            : await waitForPart(container, 'surface');
        expect(container.contains(surface)).toBe(engine === 'rustic');
        expect(surface.getAttribute('data-open')).toBe('true');
        expect(surface.getAttribute('data-variant')).toBe('danger');

        if (engine === 'modern') {
          // What the old in-tree assertion never covered: tenant CSS matches
          // `[data-ds-root][data-vertical]`, so the scope must cross with it.
          await expectTenantScopeSurvivedPortal(surface);
          // Modern fuses backdrop onto the <dialog> it promotes to the top
          // layer; the surface is a descendant of that same dialog.
          const backdrop = document.querySelector(
            ".rottay-confirm-dialog--modern[data-part='backdrop']",
          ) as HTMLDialogElement;
          expect(document.querySelectorAll(".rottay-confirm-dialog--modern[data-part='backdrop']")).toHaveLength(1);
          expect(backdrop.tagName).toBe('DIALOG');
          expect(backdrop.open).toBe(true);
          expect(backdrop.contains(surface)).toBe(true);
        } else {
          expect(container.querySelectorAll("[data-part='backdrop']")).toHaveLength(1);
        }
        // The variant's built-in icon renders by default (icon prop is
        // optional; ConfirmDialog falls back to VARIANT_ICON_MAP[variant]).
        expect(surface.querySelectorAll("[data-part='icon']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='title']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='description']")).toHaveLength(1);

        const actions = surface.querySelectorAll("[data-part='action']");
        expect(actions).toHaveLength(2);
        expect(Array.from(actions).map((el) => el.getAttribute('data-action')).sort()).toEqual(['cancel', 'confirm']);
        const confirmAction = surface.querySelector("[data-part='action'][data-action='confirm']") as HTMLElement;
        expect(confirmAction.getAttribute('data-loading')).toBe('false');
      },
    );

    it.each(ENGINES)('loading: stamps data-loading=true and a spinner part on the confirm action under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <ConfirmDialog open title="Archiving" variant="info" loading onConfirm={vi.fn()} onCancel={vi.fn()} />,
        engine,
      );

      // Same per-engine posture as above: modern's surface is portaled out of
      // the render container, rustic's is not.
      const surface =
        engine === 'modern'
          ? await waitForDocumentSurface(".rottay-confirm-dialog--modern [data-part='surface']")
          : await waitForPart(container, 'surface');
      const confirmAction = surface.querySelector("[data-part='action'][data-action='confirm']") as HTMLElement;
      expect(confirmAction.getAttribute('data-loading')).toBe('true');
      expect(confirmAction.querySelectorAll("[data-part='spinner']")).toHaveLength(1);
    });
  });

  describe('AlertDialog', () => {
    it.each(ENGINES)(
      'open: stamps root(modern only)/backdrop/surface(data-open)/icon/title/description/footer/action(data-action=cancel); modern portals to a top-layer <dialog> carrying its tenant scope, rustic stays in-tree, under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          withDsRoot(
            <AlertDialog
              open
              onOpenChange={vi.fn()}
              title="Revoke access?"
              description="All sessions will be terminated."
              action={<button type="button">Revoke</button>}
            />,
          ),
          engine,
        );

        // Portal posture: modern portals via <Portal> + <PortalScope>; rustic
        // stays in-tree (checkpoint contract P4, per-ENGINE).
        const surface =
          engine === 'modern'
            ? await waitForDocumentSurface(".rottay-alert-dialog--modern [data-part='surface']")
            : await waitForPart(container, 'surface');
        expect(container.contains(surface)).toBe(engine === 'rustic');
        expect(surface.getAttribute('data-open')).toBe('true');

        // Modern has a real root (the promoted <dialog>) distinct from both
        // the backdrop and the surface; rustic has no separate root -- its
        // outer div carries data-part="backdrop" directly, mirroring
        // ConfirmDialog rustic.
        if (engine === 'modern') {
          // What the old in-tree assertion never covered: tenant CSS matches
          // `[data-ds-root][data-vertical]`, so the scope must cross with it.
          await expectTenantScopeSurvivedPortal(surface);

          expect(document.querySelectorAll(".rottay-alert-dialog--modern[data-part='root']")).toHaveLength(1);
          const root = document.querySelector(
            ".rottay-alert-dialog--modern[data-part='root']",
          ) as HTMLDialogElement;
          // The root is the element promoted to the browser top layer, and
          // the whole overlay lives inside it.
          expect(root.tagName).toBe('DIALOG');
          expect(root.open).toBe(true);
          expect(root.contains(surface)).toBe(true);
          // Post-Daisy contract (the DaisyUI plugin was removed from Modern
          // and the skin transcribed those styles onto the data-parts): the
          // observable hooks are the canonical rottay-* classes and the
          // data-part stamps, NOT the dead Daisy class list. Negative case:
          // the Daisy classes must NOT come back — their return would mean
          // someone re-introduced the removed dependency instead of using
          // the skin.
          expect(root.className).toContain('rottay-alert-dialog');
          expect(root.className).toContain('rottay-alert-dialog--modern');
          expect(root.className).not.toContain('modal-open');
          const backdropEl = root.querySelector("[data-part='backdrop']") as HTMLElement;
          expect(backdropEl).not.toBeNull();
          expect(backdropEl.className).not.toContain('modal-backdrop');
          expect(surface.className).not.toContain('modal-box');
          expect(root.querySelectorAll("[data-part='backdrop']")).toHaveLength(1);
        } else {
          expect(container.querySelectorAll("[data-part='root']")).toHaveLength(0);
          expect(container.querySelectorAll("[data-part='backdrop']")).toHaveLength(1);
        }

        expect(surface.querySelectorAll("[data-part='icon']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='title']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='description']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='footer']")).toHaveLength(1);
        const cancelAction = surface.querySelectorAll("[data-part='action'][data-action='cancel']");
        expect(cancelAction).toHaveLength(1);
      },
    );
  });

  describe('Popconfirm', () => {
    it.each(ENGINES)(
      'open: stamps trigger(data-open)/surface(data-open)/icon/title/description/action(data-action=cancel+confirm,data-ok-type,data-loading), portal posture split by engine under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Popconfirm
            open
            title="Remove item?"
            description="This action cannot be undone."
            okType="danger"
            icon={<span>!</span>}
            onConfirm={vi.fn()}
            onCancel={vi.fn()}
          >
            <button type="button">Remove</button>
          </Popconfirm>,
          engine,
        );

        const trigger = await waitForPart(container, 'trigger');
        expect(trigger.getAttribute('data-open')).toBe('true');

        const surfaceSelector =
          engine === 'modern'
            ? ".rottay-popconfirm--modern [data-part='surface']"
            : ".rottay-popconfirm--rustic[data-part='surface']";
        const surface =
          engine === 'modern'
            ? await waitForPart(container, 'surface')
            : await waitForDocumentSurface(surfaceSelector);

        // Portal posture: modern stays in-tree; rustic portals via a direct
        // createPortal (checkpoint contract P4).
        expect(container.contains(surface)).toBe(engine === 'modern');
        expect(surface.getAttribute('data-open')).toBe('true');

        expect(surface.querySelectorAll("[data-part='icon']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='title']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='description']")).toHaveLength(1);

        const actions = surface.querySelectorAll("[data-part='action']");
        expect(actions).toHaveLength(2);
        const confirmAction = surface.querySelector("[data-part='action'][data-action='confirm']") as HTMLElement;
        expect(confirmAction.getAttribute('data-ok-type')).toBe('danger');
        expect(confirmAction.getAttribute('data-loading')).toBe('false');
      },
    );
  });

  describe('Sheet', () => {
    it.each(ENGINES)(
      'open: stamps root/backdrop/surface(data-open,data-placement)/handle/header/title/close-button/body and portals under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Sheet open onOpenChange={vi.fn()} side="bottom" title="Sheet title">
            Sheet body content.
          </Sheet>,
          engine,
        );

        const rootSelector = `.rottay-sheet--${engine}[data-part='root']`;
        const root = await waitForDocumentSurface(rootSelector);

        // Both engines escape ancestor clipping. Modern uses the shared portal
        // root while rustic portals directly into document.body.
        expect(container.contains(root)).toBe(false);

        const surface = root.querySelector("[data-part='surface']") as HTMLElement;
        expect(surface).not.toBeNull();
        expect(surface.getAttribute('data-open')).toBe('true');
        expect(surface.getAttribute('data-placement')).toBe('bottom');

        expect(root.querySelectorAll("[data-part='backdrop']")).toHaveLength(1);
        // side="bottom" + default showHandle=true renders the drag handle.
        expect(surface.querySelectorAll("[data-part='handle']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='header']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='title']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='close-button']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='body']")).toHaveLength(1);
      },
    );
  });

  describe('ContextMenu', () => {
    it.each(ENGINES)(
      'right-click opens: stamps trigger(data-open)/surface(data-open)/divider/group-label/item(data-tone,data-disabled), portal posture split by engine under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <ContextMenu
            items={[
              { key: 'edit', label: 'Edit' },
              { key: 'group', label: 'Actions', type: 'group' },
              { key: 'divider', type: 'divider' },
              { key: 'delete', label: 'Delete', danger: true },
              { key: 'disabled-item', label: 'Unavailable', disabled: true },
            ]}
            onSelect={vi.fn()}
            trigger={<div data-testid="cm-trigger">Right-click target</div>}
          />,
          engine,
        );

        const trigger = await waitForPart(container, 'trigger');
        expect(trigger.getAttribute('data-open')).toBe('false');
        fireEvent.contextMenu(container.querySelector('[data-testid="cm-trigger"]') as HTMLElement);

        await waitFor(() => {
          expect(trigger.getAttribute('data-open')).toBe('true');
        });

        const surfaceSelector =
          engine === 'modern'
            ? ".rottay-context-menu--modern [data-part='surface']"
            : ".rottay-context-menu--rustic[data-part='surface']";
        const surface =
          engine === 'modern'
            ? await waitForPart(container, 'surface')
            : await waitForDocumentSurface(surfaceSelector);

        // Portal posture: modern stays in-tree; rustic portals via a direct
        // createPortal (checkpoint contract P4).
        expect(container.contains(surface)).toBe(engine === 'modern');

        expect(surface.querySelectorAll("[data-part='divider']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='group-label']")).toHaveLength(1);
        const items = surface.querySelectorAll("[data-part='item']");
        expect(items).toHaveLength(3);
        const dangerItem = surface.querySelector("[data-part='item'][data-tone='danger']");
        expect(dangerItem).not.toBeNull();
        const disabledItem = surface.querySelector("[data-part='item'][data-disabled='true']");
        expect(disabledItem).not.toBeNull();
      },
    );
  });

  describe('Popover', () => {
    it.each(ENGINES)(
      'open: stamps trigger(data-open)/surface(data-open)/title/arrow; both engines portal here -- modern through its JS-positioning branch, carrying its tenant scope -- under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          withDsRoot(
            <Popover open title="Popover title" content="Popover content text." trigger="click" arrow>
              <button type="button">Open popover</button>
            </Popover>,
          ),
          engine,
        );

        const trigger = await waitForPart(container, 'trigger');
        expect(trigger.getAttribute('data-open')).toBe('true');

        const surfaceSelector =
          engine === 'modern'
            ? ".rottay-popover--modern [data-part='surface']"
            : ".rottay-popover--rustic[data-part='surface']";
        const surface = await waitForDocumentSurface(surfaceSelector);

        // Portal posture: rustic always portals via a direct createPortal.
        // Modern's posture follows `useOverlayPosition`: the `anchor-css`
        // branch renders in-tree in the browser top layer, the `js` branch
        // portals. This environment has no CSS anchor positioning, so the
        // strategy resolves to `js` -- asserted rather than assumed, because
        // the posture below is a consequence of it, not of the engine alone.
        if (engine === 'modern') {
          expect(surface.getAttribute('data-ds-position-strategy')).toBe('js');
        }
        expect(container.contains(surface)).toBe(false);
        expect(surface.getAttribute('data-open')).toBe('true');

        if (engine === 'modern') {
          // What the old in-tree assertion never covered: tenant CSS matches
          // `[data-ds-root][data-vertical]`, so the scope must cross with it.
          await expectTenantScopeSurvivedPortal(surface);
        }

        expect(surface.querySelectorAll("[data-part='title']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='arrow']")).toHaveLength(1);
      },
    );
  });

  describe('Dropdown', () => {
    it.each(ENGINES)(
      'open: stamps trigger(data-open)/surface(data-open)/divider/group-label/item(data-tone,data-disabled), portal posture split by engine under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Dropdown
            open
            trigger={['click']}
            menu={{
              items: [
                { key: 'profile', label: 'Profile' },
                { key: 'group', label: 'Actions', type: 'group' },
                { key: 'divider', type: 'divider' },
                { key: 'delete', label: 'Delete', danger: true },
                { key: 'disabled-item', label: 'Unavailable', disabled: true },
              ],
              onClick: vi.fn(),
            }}
          >
            <button type="button">Open dropdown</button>
          </Dropdown>,
          engine,
        );

        const trigger = await waitForPart(container, 'trigger');
        expect(trigger.getAttribute('data-open')).toBe('true');

        const surfaceSelector =
          engine === 'modern'
            ? ".rottay-dropdown--modern [data-part='surface']"
            : ".rottay-dropdown--rustic[data-part='surface']";
        const surface =
          engine === 'modern'
            ? await waitForPart(container, 'surface')
            : await waitForDocumentSurface(surfaceSelector);

        // Portal posture: modern stays in-tree; rustic portals via a direct
        // createPortal (checkpoint contract P4).
        expect(container.contains(surface)).toBe(engine === 'modern');
        expect(surface.getAttribute('data-open')).toBe('true');

        expect(surface.querySelectorAll("[data-part='divider']")).toHaveLength(1);
        expect(surface.querySelectorAll("[data-part='group-label']")).toHaveLength(1);
        const items = surface.querySelectorAll("[data-part='item']");
        expect(items).toHaveLength(3);
        const dangerItem = surface.querySelector("[data-part='item'][data-tone='danger']");
        expect(dangerItem).not.toBeNull();
        const disabledItem = surface.querySelector("[data-part='item'][data-disabled='true']");
        expect(disabledItem).not.toBeNull();
      },
    );
  });

  describe('HoverCard', () => {
    it.each(ENGINES)(
      'open: stamps trigger(data-open)/surface(data-open), portal posture split by engine under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <HoverCard open content="Hover card content." trigger={<button type="button">@username</button>} />,
          engine,
        );

        const trigger = await waitForPart(container, 'trigger');
        expect(trigger.getAttribute('data-open')).toBe('true');

        const surfaceSelector =
          engine === 'modern'
            ? ".rottay-hover-card--modern [data-part='surface']"
            : ".rottay-hover-card--rustic[data-part='surface']";
        const surface =
          engine === 'modern'
            ? await waitForPart(container, 'surface')
            : await waitForDocumentSurface(surfaceSelector);

        // Portal posture: modern stays in-tree; rustic portals via a direct
        // createPortal (checkpoint contract P4).
        expect(container.contains(surface)).toBe(engine === 'modern');
        expect(surface.getAttribute('data-open')).toBe('true');
      },
    );
  });

  describe('Watermark', () => {
    it.each(ENGINES)('stamps root/pattern, never portals, under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Watermark content="Draft">
          <div>Watermarked content</div>
        </Watermark>,
        engine,
      );

      const root = await waitForPart(container, 'root');
      // Portal posture: Watermark portals in NEITHER engine -- it is not a
      // floating overlay at all (checkpoint contract P4).
      expect(container.contains(root)).toBe(true);
      expect(root.querySelectorAll("[data-part='pattern']")).toHaveLength(1);
    });
  });
});
