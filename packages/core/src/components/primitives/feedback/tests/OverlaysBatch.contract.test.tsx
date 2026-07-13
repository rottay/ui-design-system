import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { Modal } from '../Modal';
import { Drawer } from '../Drawer';
import { Toast, ToastProvider, useToast } from '../Toast';
import { MessageItem } from '../Message';
import { NotificationItem } from '../Notification';
import { Result } from '../Result';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

// ---------------------------------------------------------------------------
// WO-SKIN-03 checkpoint O -- the overlays family (Modal, Drawer, Toast,
// Message, Notification, Result) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-tone/data-placement/data-open)
// onto all six components without moving any paint. This file proves the
// stamp reached the DOM for each component under every engine it supports,
// and pins portal posture -- which is per-component and NOT symmetric
// (Modal portals in both engines via the shared Portal util; Toast portals
// ONLY at the Toast.Container stacking layer, never for a standalone
// <Toast>; Drawer/Message/Notification/Result do not portal in either
// engine). It does not assert paint (that is overlays-batch.spec.ts's job).
//
// Modal, Drawer, and Toast (BaseToast) all render through
// createEngineComponent's Suspense-wrapped lazy engine loader, so a
// synchronous container.querySelector(...) right after render() can race the
// still-pending engine chunk -- same waitForPart idiom as
// StatusBatch/PickersBatch.contract.test.tsx. MessageItem and
// NotificationItem resolve their engine synchronously (a plain
// useEngineContext() switch, not a lazy import), so no waitFor is needed for
// those two.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

/** Waits for a `data-part="surface"` to appear anywhere in `document`
 * (portaled surfaces render under document.body, outside the render
 * container). Excludes Drawer's surface (always carries data-placement)
 * since only Modal's surface is expected to be portal-located in this file. */
async function waitForDocumentModalSurface(): Promise<HTMLElement> {
  await waitFor(() => {
    expect(
      document.querySelectorAll('[data-part="surface"]:not([data-placement])').length
    ).toBeGreaterThan(0);
  });
  return document.querySelector('[data-part="surface"]:not([data-placement])') as HTMLElement;
}

describe('Overlays-family data-part contract (WO-SKIN-03 checkpoint O)', () => {
  describe('Modal', () => {
    it.each(ENGINES)(
      'open: stamps root/backdrop/surface(data-open)/header/title/description/body/footer/close-button/action(cancel+ok), portaled outside the render container under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Modal
            open
            onClose={vi.fn()}
            onCancel={vi.fn()}
            onOk={vi.fn()}
            title="Settings"
            description="Manage your account"
            closable
          >
            Body content
          </Modal>,
          engine,
        );

        const surface = await waitForDocumentModalSurface();
        // Portal posture: Modal mounts outside the render container in both
        // engines (checkpoint contract decision 1).
        expect(container.contains(surface)).toBe(false);
        expect(surface.getAttribute('data-open')).toBe('true');

        expect(document.querySelectorAll('[data-part="root"]').length).toBeGreaterThan(0);
        // Modern has a separate unpainted root wrapper around a distinct
        // backdrop div; rustic fuses root+backdrop into one node (its outer
        // overlay div is stamped data-part="root" only -- see the Modal
        // portal-map note in the checkpoint contract), so it has zero
        // standalone backdrop parts.
        if (engine === 'modern') {
          expect(document.querySelectorAll('[data-part="backdrop"]').length).toBeGreaterThan(0);
        } else {
          expect(document.querySelectorAll('[data-part="backdrop"]')).toHaveLength(0);
        }
        expect(surface.querySelectorAll('[data-part="header"]')).toHaveLength(1);
        expect(surface.querySelectorAll('[data-part="title"]')).toHaveLength(1);
        // Rustic's engine never destructures/renders the `description` prop
        // at all (only `title`) -- a genuine cross-engine capability gap the
        // inventory documents, not a stamping omission.
        if (engine === 'modern') {
          expect(surface.querySelectorAll('[data-part="description"]')).toHaveLength(1);
        } else {
          expect(surface.querySelectorAll('[data-part="description"]')).toHaveLength(0);
        }
        expect(surface.querySelectorAll('[data-part="body"]')).toHaveLength(1);
        expect(surface.querySelectorAll('[data-part="footer"]')).toHaveLength(1);
        expect(surface.querySelectorAll('[data-part="close-button"]')).toHaveLength(1);

        const actions = surface.querySelectorAll('[data-part="action"]');
        expect(actions).toHaveLength(2);
        expect(Array.from(actions).map((el) => el.getAttribute('data-action')).sort()).toEqual([
          'cancel',
          'ok',
        ]);
      },
    );

    it.each(ENGINES)(
      'omits title/description/footer/action parts the JSX branches skip under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Modal open onClose={vi.fn()} hideFooter>
            Body only
          </Modal>,
          engine,
        );

        const surface = await waitForDocumentModalSurface();
        expect(container.contains(surface)).toBe(false);
        expect(surface.querySelectorAll('[data-part="title"]')).toHaveLength(0);
        expect(surface.querySelectorAll('[data-part="description"]')).toHaveLength(0);
        expect(surface.querySelectorAll('[data-part="footer"]')).toHaveLength(0);
        expect(surface.querySelectorAll('[data-part="action"]')).toHaveLength(0);
      },
    );
  });

  describe('Drawer', () => {
    it.each(ENGINES)(
      'open: stamps backdrop/surface(data-placement, data-open)/header/title/close-button/body/footer, in-tree (not portaled) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Drawer
            open
            onClose={vi.fn()}
            placement="left"
            title="Filters"
            closable
            footer={<button type="button">Apply</button>}
          >
            Drawer body
          </Drawer>,
          engine,
        );

        const surface = await waitForPart(container, 'surface');
        // Portal posture: Drawer stays in-tree in both engines (checkpoint
        // contract decision 1 -- the opposite of Modal).
        expect(container.contains(surface)).toBe(true);
        expect(surface.getAttribute('data-placement')).toBe('left');
        expect(surface.getAttribute('data-open')).toBe('true');

        expect(container.querySelectorAll('[data-part="backdrop"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="header"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="title"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="close-button"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="body"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="footer"]')).toHaveLength(1);
      },
    );

    it.each(ENGINES)('omits the backdrop part when mask is false under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Drawer open onClose={vi.fn()} mask={false}>
          Drawer body
        </Drawer>,
        engine,
      );

      await waitForPart(container, 'surface');
      expect(container.querySelectorAll('[data-part="backdrop"]')).toHaveLength(0);
    });
  });

  describe('Toast', () => {
    it.each(ENGINES)(
      'standalone: stamps root(data-tone)/icon/body/action/close-button/progress-bar, in-tree (not portaled) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Toast
            visible
            variant="success"
            title="Saved"
            description="Your changes are live."
            closable
            showProgress
            duration={5000}
            action={{ label: 'Undo', onClick: vi.fn() }}
          />,
          engine,
        );

        const root = await waitForPart(container, 'root');
        // Portal posture: a standalone Toast never portals -- only a toast
        // driven through Toast.Container does (checkpoint contract
        // decision 1 / Toast section fact 1).
        expect(container.contains(root)).toBe(true);
        expect(root.getAttribute('data-tone')).toBe('success');
        expect(container.querySelectorAll('[data-part="icon"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="body"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="action"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="close-button"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="progress-bar"]')).toHaveLength(1);
      },
    );

    it.each(ENGINES)('Toast.Container: stamps stack-container, portaled outside the render container under the %s engine', async (engine) => {
      function Trigger() {
        const { show } = useToast();
        return (
          <button type="button" onClick={() => show({ variant: 'info', title: 'Hi', showProgress: true, duration: 5000 })}>
            trigger
          </button>
        );
      }

      const { container, getByRole } = renderWithEngine(
        <ToastProvider>
          <Trigger />
          <Toast.Container position="top-right" />
        </ToastProvider>,
        engine,
      );

      fireEvent.click(getByRole('button', { name: 'trigger' }));

      const stackContainer = await waitFor(() => {
        const el = document.querySelector('[data-part="stack-container"]');
        expect(el).not.toBeNull();
        return el as HTMLElement;
      });

      // Portal posture: Toast.Container portals to document.body regardless
      // of engine (checkpoint contract decision 1).
      expect(container.contains(stackContainer)).toBe(false);
      expect(stackContainer.getAttribute('data-placement')).toBe('top-right');
      await waitFor(() => {
        expect(stackContainer.querySelectorAll('[data-part="root"]').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Message', () => {
    it.each(ENGINES)(
      'MessageItem: stamps root(data-tone)/icon/body/close-button, in-tree (not portaled) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <MessageItem id="m1" type="success" content="Saved" duration={0} closable onRemove={vi.fn()} />,
          engine,
        );

        const root = container.querySelector('[data-part="root"]') as HTMLElement;
        expect(root).not.toBeNull();
        expect(container.contains(root)).toBe(true);
        expect(root.getAttribute('data-tone')).toBe('success');
        expect(container.querySelectorAll('[data-part="icon"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="body"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="close-button"]')).toHaveLength(1);
      },
    );
  });

  describe('Notification', () => {
    it.each(ENGINES)(
      'NotificationItem: stamps root(data-tone)/icon/title/description/action/close-button, in-tree (not portaled) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <NotificationItem
            id="n1"
            type="warning"
            message="Heads up"
            description="Check the details before continuing."
            actions={<button type="button">Retry</button>}
            duration={0}
            closable
            onRemove={vi.fn()}
          />,
          engine,
        );

        const root = container.querySelector('[data-part="root"]') as HTMLElement;
        expect(root).not.toBeNull();
        expect(container.contains(root)).toBe(true);
        expect(root.getAttribute('data-tone')).toBe('warning');
        expect(container.querySelectorAll('[data-part="icon"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="title"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="description"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="action"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="close-button"]')).toHaveLength(1);
      },
    );

    it.each(ENGINES)('omits the description/action parts the JSX branches skip under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <NotificationItem id="n2" type="info" message="Just a heads up" duration={0} onRemove={vi.fn()} />,
        engine,
      );

      expect(container.querySelector('[data-part="root"]')).not.toBeNull();
      expect(container.querySelectorAll('[data-part="description"]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-part="action"]')).toHaveLength(0);
    });
  });

  describe('Result', () => {
    it.each(ENGINES)(
      'stamps root(data-tone)/icon/title/description/extra/content, in-tree (not portaled) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Result status="success" title="All done" subTitle="Your request was processed." extra={<button type="button">Continue</button>}>
            <p>Extra detail</p>
          </Result>,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(container.contains(root)).toBe(true);
        expect(root.getAttribute('data-tone')).toBe('success');
        expect(container.querySelectorAll('[data-part="icon"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="title"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="description"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="extra"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="content"]')).toHaveLength(1);
      },
    );

    it.each(ENGINES)('omits title/description/extra/content parts the JSX branches skip under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Result status="404" />, engine);

      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="title"]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-part="description"]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-part="extra"]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-part="content"]')).toHaveLength(0);
    });
  });
});
