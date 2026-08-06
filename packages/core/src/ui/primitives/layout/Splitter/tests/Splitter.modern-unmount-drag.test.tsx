/** A tree unmounted mid-gesture never reaches endDrag, so its document listeners survived. */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Splitter, Panel } from '../engines/modern';

function gutter(): HTMLElement {
  const node = document.querySelector('[data-part="gutter"]');
  if (!node) throw new Error('expected a gutter');
  return node as HTMLElement;
}

describe('Splitter modern: mid-drag unmount releases the document listeners', () => {
  it('leaves no pointer listener on document after a mid-drag unmount', () => {
    // onResize cannot see the leak: handlePointerMove early-returns on the nulled ref.
    const live = new Map<string, Set<EventListenerOrEventListenerObject>>();
    const add = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation(((type: string, fn: EventListenerOrEventListenerObject) => {
        if (!live.has(type)) live.set(type, new Set());
        live.get(type)!.add(fn);
      }) as typeof document.addEventListener);
    const remove = vi
      .spyOn(document, 'removeEventListener')
      .mockImplementation(((type: string, fn: EventListenerOrEventListenerObject) => {
        live.get(type)?.delete(fn);
      }) as typeof document.removeEventListener);

    try {
      const { unmount } = render(
        <Splitter>
          <Panel>
            <span>panel-0</span>
          </Panel>
          <Panel>
            <span>panel-1</span>
          </Panel>
        </Splitter>
      );

      // Start a real drag; the three document listeners must now be live.
      fireEvent.pointerDown(gutter(), { clientX: 100, pointerId: 1 });
      expect(live.get('pointermove')?.size).toBe(1);
      expect(live.get('pointerup')?.size).toBe(1);
      expect(live.get('pointercancel')?.size).toBe(1);

      // The gesture never completes — no pointerup — the tree just goes away.
      unmount();

      expect(live.get('pointermove')?.size ?? 0).toBe(0);
      expect(live.get('pointerup')?.size ?? 0).toBe(0);
      expect(live.get('pointercancel')?.size ?? 0).toBe(0);
    } finally {
      add.mockRestore();
      remove.mockRestore();
    }
  });

  it('does not report a resize it never finished when unmounted mid-drag', () => {
    const onResizeEnd = vi.fn();
    const { unmount } = render(
      <Splitter onResizeEnd={onResizeEnd}>
        <Panel>
          <span>panel-0</span>
        </Panel>
        <Panel>
          <span>panel-1</span>
        </Panel>
      </Splitter>
    );

    fireEvent.pointerDown(gutter(), { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(document, { clientX: 140, pointerId: 1 });
    unmount();

    // Teardown detaches; it must not synthesize a completion callback.
    expect(onResizeEnd).not.toHaveBeenCalled();

    // And a stray pointerup afterwards must not resurrect one either.
    fireEvent.pointerUp(document, { clientX: 140, pointerId: 1 });
    expect(onResizeEnd).not.toHaveBeenCalled();
  });

  it('still completes normally when the drag ends before unmount', () => {
    const onResizeEnd = vi.fn();
    const { unmount } = render(
      <Splitter onResizeEnd={onResizeEnd}>
        <Panel>
          <span>panel-0</span>
        </Panel>
        <Panel>
          <span>panel-1</span>
        </Panel>
      </Splitter>
    );

    fireEvent.pointerDown(gutter(), { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(document, { clientX: 140, pointerId: 1 });
    fireEvent.pointerUp(document, { clientX: 140, pointerId: 1 });
    expect(onResizeEnd).toHaveBeenCalledTimes(1);

    // Unmounting after a completed drag must not fire a second completion.
    unmount();
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
  });
});
