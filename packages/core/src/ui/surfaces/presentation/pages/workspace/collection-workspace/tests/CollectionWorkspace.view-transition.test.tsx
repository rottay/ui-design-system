/**
 * @fileoverview View-mode switch seam: the collection container is a named
 * view-transition group and internal view-mode changes run through the
 * direction-aware transition runtime (instant swap under reduced motion or
 * without the View Transitions API).
 */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CollectionWorkspaceSurface } from '../index';
import type { CollectionWorkspaceSurfaceProps } from '../index';
import type { ColumnDef } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import { VIEW_TRANSITION_DIRECTION_ATTRIBUTE } from '@/graphics/motion/react/runtime/view-transition';
import { mockMatchMedia } from '@/tooling/testing/helpers/browser/match-media';

interface TestRow {
  id: string;
  name: string;
}

const TEST_DATA: TestRow[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
];

const TEST_COLUMNS: ColumnDef<TestRow>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name' },
];

function buildProps(
  overrides?: Partial<CollectionWorkspaceSurfaceProps<TestRow>>,
): CollectionWorkspaceSurfaceProps<TestRow> {
  return {
    title: 'Transition Collection',
    data: TEST_DATA,
    columns: TEST_COLUMNS,
    rowKey: 'id',
    controls: {
      viewMode: { enabled: true, modes: ['table', 'cards'] },
    },
    ...overrides,
  };
}

/** `document` widened so tests can install/remove the optional API method.
 * Omits the DOM lib's own non-optional declaration so the stub can be assigned
 * AND deleted; an intersection would keep the lib signature and forbid both. */
type MutableViewTransitionDocument = Omit<Document, 'startViewTransition'> & {
  startViewTransition?: (update: () => void | Promise<void>) => unknown;
};

const viewTransitionDocument = document as unknown as MutableViewTransitionDocument;

function installNativeStartViewTransition(): {
  start: ReturnType<typeof vi.fn>;
  directionsSeen: (string | null)[];
} {
  const directionsSeen: (string | null)[] = [];
  const start = vi.fn((cb: () => void | Promise<void>) => {
    directionsSeen.push(
      document.documentElement.getAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE),
    );
    cb();
    return {
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn(),
    };
  });
  viewTransitionDocument.startViewTransition = start;
  return { start, directionsSeen };
}

afterEach(() => {
  delete viewTransitionDocument.startViewTransition;
  document.documentElement.removeAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE);
  vi.restoreAllMocks();
});

describe('CollectionWorkspaceSurface view-mode transition seam', () => {
  it('names the collection container as a per-instance panel group', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface {...buildProps()} />,
    );

    // The Suspense boundary wraps the whole surface (test-utils renderSurface),
    // so the engine-switched (lazily-loaded) toolbar sibling must settle before
    // the rest of the tree -- including this Box -- is present in the DOM.
    await screen.findByRole('button', { name: 'Cards' }, { timeout: 10000 });

    // Class, not data-part: a surface's anatomy is its classNames (engines may
    // not forward data-part). waitFor: engine components resolve async.
    const collection = await waitFor(
      () => {
        const element = container.querySelector<HTMLElement>(
          '.ds-collection-workspace__collection',
        );
        expect(element).not.toBeNull();
        return element!;
      },
      { timeout: 10000 },
    );
    const style = collection!.style as CSSStyleDeclaration & {
      viewTransitionName?: string;
      viewTransitionClass?: string;
    };
    expect(style.viewTransitionName).toMatch(/^ds-vt-tab-panel-/);
    expect(style.viewTransitionClass).toBe('ds-vt-tab-panel');
  });

  it('runs the internal view-mode switch through a forward-stamped view transition', async () => {
    const { start, directionsSeen } = installNativeStartViewTransition();
    const { container } = renderSurface(
      <CollectionWorkspaceSurface {...buildProps()} />,
    );

    const cardButton = await screen.findByRole(
      'button',
      { name: 'Cards' },
      { timeout: 10000 },
    );
    fireEvent.click(cardButton);

    expect(start).toHaveBeenCalledTimes(1);
    // table -> cards moves forward in the canonical view-mode order.
    expect(directionsSeen).toEqual(['forward']);
    expect(
      container.querySelector('[data-view-mode="cards"]'),
    ).not.toBeNull();

    await Promise.resolve();
    await Promise.resolve();
    expect(
      document.documentElement.getAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE),
    ).toBeNull();
  }, 15000);

  it('swaps the view mode instantly under reduced motion', async () => {
    mockMatchMedia(1024, true);
    const { start } = installNativeStartViewTransition();
    const { container } = renderSurface(
      <CollectionWorkspaceSurface {...buildProps()} />,
    );

    const cardButton = await screen.findByRole(
      'button',
      { name: 'Cards' },
      { timeout: 10000 },
    );
    fireEvent.click(cardButton);

    expect(start).not.toHaveBeenCalled();
    expect(
      container.querySelector('[data-view-mode="cards"]'),
    ).not.toBeNull();
    expect(
      document.documentElement.getAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE),
    ).toBeNull();
  }, 15000);
});
