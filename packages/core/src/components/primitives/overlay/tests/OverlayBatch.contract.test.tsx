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
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

// ---------------------------------------------------------------------------
// WO-SKIN-04 checkpoint P -- the overlay-primitives family (Modal, Tour,
// ConfirmDialog, AlertDialog, Popconfirm, Sheet, ContextMenu, Popover,
// Dropdown, HoverCard, Watermark) data-part contract evidence. AdaptiveOverlay
// owns no DOM of its own (checkpoint contract P4/P6) and has no fixture here.
//
// The pre-step stamps `data-part` (plus data-open/data-placement/data-tone/
// data-variant/data-ok-type/data-loading/data-action/data-current/
// data-disabled) onto all eleven components without moving any paint. This
// file proves the stamp reached the DOM for each component under every
// engine it supports, and pins portal posture -- which is per-ENGINE, not
// per-component (checkpoint contract P4): Modal and Tour portal in both
// engines; ConfirmDialog, AlertDialog, and Watermark portal in neither;
// Popconfirm, Sheet, ContextMenu, Popover, Dropdown, and HoverCard portal
// only under rustic. It does not assert paint (that is
// overlay-batch.spec.ts's job).
//
// `primitives/overlay/Modal` is imported directly from its own local path,
// never from the package barrel -- the barrel re-exports it as `OverlayModal`
// specifically to avoid colliding with the unrelated, already-published
// `primitives/feedback/Modal`'s own `Modal` export (checkpoint contract P1).
//
// Modal, Tour, ConfirmDialog, ContextMenu, and Dropdown's modern engines all
// gate their mount behind `usePresence`, whose `dataState` is derived
// directly from the `present` argument on every render (`present ? 'open' :
// 'closed'`, source: `motion/hooks/use-presence`) -- passing `open` as a
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

/** Per-engine surface selector for Modal: modern's scope class lives on the
 * root (`<dialog>`), with `surface` as a nested descendant div; rustic fuses
 * root and surface into one node, so the scope class and `data-part` land on
 * the same element (checkpoint contract P1's `rottay-overlay-modal-shell--*`
 * decision). */
function modalSurfaceSelector(engine: 'modern' | 'rustic'): string {
  return engine === 'modern'
    ? ".rottay-overlay-modal-shell--modern [data-part='surface']"
    : ".rottay-overlay-modal-shell--rustic[data-part='surface']";
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
          // Rustic fuses root+backdrop into the shared Overlay util's own
          // div (data-part="backdrop"); there is no separate rustic root.
          expect(document.querySelectorAll("[data-part='backdrop']").length).toBe(1);
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
        // No `target` prop resolves to a real element, so targetRect stays
        // null and the spotlight (which only renders when targetRect is
        // truthy) must be absent.
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
      'open: stamps backdrop/surface(data-open,data-variant)/icon/title/description/action(data-action=cancel+confirm,data-loading), in-tree (not portaled) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <ConfirmDialog
            open
            title="Delete item?"
            description="This cannot be undone."
            variant="danger"
            onConfirm={vi.fn()}
            onCancel={vi.fn()}
          />,
          engine,
        );

        const surface = await waitForPart(container, 'surface');
        // Portal posture: ConfirmDialog portals in NEITHER engine
        // (checkpoint contract P4).
        expect(container.contains(surface)).toBe(true);
        expect(surface.getAttribute('data-open')).toBe('true');
        expect(surface.getAttribute('data-variant')).toBe('danger');

        expect(container.querySelectorAll("[data-part='backdrop']")).toHaveLength(1);
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

      const surface = await waitForPart(container, 'surface');
      const confirmAction = surface.querySelector("[data-part='action'][data-action='confirm']") as HTMLElement;
      expect(confirmAction.getAttribute('data-loading')).toBe('true');
      expect(confirmAction.querySelectorAll("[data-part='spinner']")).toHaveLength(1);
    });
  });

  describe('AlertDialog', () => {
    it.each(ENGINES)(
      'open: stamps root(modern only)/backdrop/surface(data-open)/icon/title/description/footer/action(data-action=cancel), in-tree (not portaled) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <AlertDialog
            open
            onOpenChange={vi.fn()}
            title="Revoke access?"
            description="All sessions will be terminated."
            action={<button type="button">Revoke</button>}
          />,
          engine,
        );

        const surface = await waitForPart(container, 'surface');
        // Portal posture: AlertDialog portals in NEITHER engine (checkpoint
        // contract P4).
        expect(container.contains(surface)).toBe(true);
        expect(surface.getAttribute('data-open')).toBe('true');

        // Modern has a real root (.modal.modal-open) distinct from both the
        // backdrop (.modal-backdrop) and the surface (.modal-box); rustic has
        // no separate root -- its outer div carries data-part="backdrop"
        // directly, mirroring ConfirmDialog rustic's shape.
        if (engine === 'modern') {
          expect(container.querySelectorAll("[data-part='root']")).toHaveLength(1);
          // Modern's DaisyUI class list stays intact alongside the stamp
          // (checkpoint contract P2) -- verify the classnames the future
          // skin/personality.css anchor on are still present.
          const root = container.querySelector("[data-part='root']") as HTMLElement;
          expect(root.className).toContain('modal');
          expect(root.className).toContain('modal-open');
          const backdropEl = container.querySelector("[data-part='backdrop']") as HTMLElement;
          expect(backdropEl.className).toBe('modal-backdrop');
          expect(surface.className).toContain('modal-box');
        } else {
          expect(container.querySelectorAll("[data-part='root']")).toHaveLength(0);
        }
        expect(container.querySelectorAll("[data-part='backdrop']")).toHaveLength(1);

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
              { key: 'divider', label: '', type: 'divider' },
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
      'open: stamps trigger(data-open)/surface(data-open)/title/arrow, portal posture split by engine under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Popover open title="Popover title" content="Popover content text." trigger="click" arrow>
            <button type="button">Open popover</button>
          </Popover>,
          engine,
        );

        const trigger = await waitForPart(container, 'trigger');
        expect(trigger.getAttribute('data-open')).toBe('true');

        const surfaceSelector =
          engine === 'modern'
            ? ".rottay-popover--modern [data-part='surface']"
            : ".rottay-popover--rustic[data-part='surface']";
        const surface =
          engine === 'modern'
            ? await waitForPart(container, 'surface')
            : await waitForDocumentSurface(surfaceSelector);

        // Portal posture: modern stays in-tree; rustic portals via a direct
        // createPortal (checkpoint contract P4).
        expect(container.contains(surface)).toBe(engine === 'modern');
        expect(surface.getAttribute('data-open')).toBe('true');

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
                { key: 'divider', label: '', type: 'divider' },
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
