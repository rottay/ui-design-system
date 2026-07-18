import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useOverlayLayer, getOverlayLayerCount } from '..';

function pressEscape(): void {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
}

afterEach(() => {
  // Every test must leave the module-level registry empty and the body scroll
  // lock released; a leak here means a layer failed to unregister on unmount.
  expect(getOverlayLayerCount()).toBe(0);
  expect(document.body.style.overflow).toBe('');
});

describe('useOverlayLayer - z-index per kind', () => {
  it('resolves the canonical band token for the base layer', () => {
    const { result, unmount } = renderHook(() => useOverlayLayer({ kind: 'modal' }));
    expect(result.current.zIndex).toBe('var(--ds-z-index-modal)');
    expect(result.current.isTop).toBe(true);
    unmount();
  });

  it('offsets stacked same-kind layers so the newer one sits above', () => {
    const first = renderHook(() => useOverlayLayer({ kind: 'modal' }));
    const second = renderHook(() => useOverlayLayer({ kind: 'modal' }));

    expect(first.result.current.zIndex).toBe('var(--ds-z-index-modal)');
    expect(second.result.current.zIndex).toBe('calc(var(--ds-z-index-modal) + 1)');
    expect(second.result.current.isTop).toBe(true);
    expect(first.result.current.isTop).toBe(false);

    second.unmount();
    first.unmount();
  });

  it('keeps cross-kind ordering by band regardless of open order', () => {
    const modal = renderHook(() => useOverlayLayer({ kind: 'modal' }));
    const tooltip = renderHook(() => useOverlayLayer({ kind: 'tooltip' }));

    // Different bands: a tooltip opened after a modal stays in the tooltip band.
    expect(modal.result.current.zIndex).toBe('var(--ds-z-index-modal)');
    expect(tooltip.result.current.zIndex).toBe('calc(var(--ds-z-index-tooltip) + 1)');

    tooltip.unmount();
    modal.unmount();
  });

  it('maps sheet to the drawer band and hover to the popover band', () => {
    const sheet = renderHook(() => useOverlayLayer({ kind: 'sheet' }));
    expect(sheet.result.current.zIndex).toBe('var(--ds-z-index-drawer)');
    sheet.unmount();

    const hover = renderHook(() => useOverlayLayer({ kind: 'hover' }));
    expect(hover.result.current.zIndex).toBe('var(--ds-z-index-popover)');
    hover.unmount();
  });

  it('exposes spreadable layerProps with data-overlay attributes', () => {
    const { result, unmount } = renderHook(() => useOverlayLayer({ kind: 'drawer' }));
    const props = result.current.layerProps;
    expect(props['data-overlay-kind']).toBe('drawer');
    expect(props['data-overlay-layer']).toBe(result.current.layerId);
    expect(props['data-overlay-top']).toBe('');
    expect(props.style.zIndex).toBe('var(--ds-z-index-drawer)');
    unmount();
  });

  it('omits data-overlay-top on layers that are not top-most', () => {
    const lower = renderHook(() => useOverlayLayer({ kind: 'modal' }));
    const upper = renderHook(() => useOverlayLayer({ kind: 'modal' }));

    expect(lower.result.current.layerProps['data-overlay-top']).toBeUndefined();
    expect(upper.result.current.layerProps['data-overlay-top']).toBe('');

    upper.unmount();
    lower.unmount();
  });
});

describe('useOverlayLayer - single Escape router', () => {
  it('routes Escape to the top blocking layer only', () => {
    const bottomEscape = vi.fn();
    const topEscape = vi.fn();

    const bottom = renderHook(() =>
      useOverlayLayer({ kind: 'modal', onEscape: bottomEscape, restoreFocus: false }),
    );
    const top = renderHook(() =>
      useOverlayLayer({ kind: 'modal', onEscape: topEscape, restoreFocus: false }),
    );

    pressEscape();

    expect(topEscape).toHaveBeenCalledTimes(1);
    expect(bottomEscape).not.toHaveBeenCalled();

    // Close the top layer; Escape now reaches the (new top) bottom layer.
    top.unmount();
    pressEscape();
    expect(bottomEscape).toHaveBeenCalledTimes(1);
    expect(topEscape).toHaveBeenCalledTimes(1);

    bottom.unmount();
  });

  it('a blocking layer without a handler still swallows Escape from lower layers', () => {
    const lowerEscape = vi.fn();
    const lower = renderHook(() =>
      useOverlayLayer({ kind: 'modal', onEscape: lowerEscape, restoreFocus: false }),
    );
    // A blocking layer with no onEscape (e.g. a non-dismissable dialog).
    const upper = renderHook(() => useOverlayLayer({ kind: 'modal', restoreFocus: false }));

    pressEscape();
    expect(lowerEscape).not.toHaveBeenCalled();

    upper.unmount();
    lower.unmount();
  });

  it('non-blocking layers do not intercept Escape for the modal below', () => {
    const modalEscape = vi.fn();
    const modal = renderHook(() =>
      useOverlayLayer({ kind: 'modal', onEscape: modalEscape, restoreFocus: false }),
    );
    // A tooltip is non-blocking by default - it must not swallow Escape.
    const tooltip = renderHook(() => useOverlayLayer({ kind: 'tooltip', onEscape: vi.fn() }));

    pressEscape();
    expect(modalEscape).toHaveBeenCalledTimes(1);

    tooltip.unmount();
    modal.unmount();
  });

  it('detaches the document listener once the stack empties', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useOverlayLayer({ kind: 'modal', restoreFocus: false }));
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true);

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

describe('useOverlayLayer - scroll-lock refcount', () => {
  it('locks body on the first blocking layer and unlocks at count zero', () => {
    expect(document.body.style.overflow).toBe('');

    const first = renderHook(() => useOverlayLayer({ kind: 'modal', restoreFocus: false }));
    expect(document.body.style.overflow).toBe('hidden');

    const second = renderHook(() => useOverlayLayer({ kind: 'drawer', restoreFocus: false }));
    expect(document.body.style.overflow).toBe('hidden');

    // Unlock is refcounted: still locked while any blocking layer remains.
    second.unmount();
    expect(document.body.style.overflow).toBe('hidden');

    first.unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('does not lock scroll for non-blocking kinds', () => {
    const { unmount } = renderHook(() => useOverlayLayer({ kind: 'popover' }));
    expect(document.body.style.overflow).toBe('');
    unmount();
  });

  it('honors an explicit lockScroll override on a non-blocking kind', () => {
    const { unmount } = renderHook(() =>
      useOverlayLayer({ kind: 'popover', lockScroll: true }),
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('useOverlayLayer - LIFO focus restore', () => {
  it('restores focus to the element focused before each layer opened (deferred, LIFO)', async () => {
    const anchorA = document.createElement('button');
    const anchorB = document.createElement('button');
    document.body.append(anchorA, anchorB);

    anchorA.focus();
    expect(document.activeElement).toBe(anchorA);

    const outer = renderHook(() => useOverlayLayer({ kind: 'modal' }));
    // Focus moves into the outer overlay, then a nested overlay opens.
    anchorB.focus();
    const inner = renderHook(() => useOverlayLayer({ kind: 'modal' }));

    // Inner closes first -> focus returns to what was focused when it opened (B).
    inner.unmount();
    await waitFor(() => expect(document.activeElement).toBe(anchorB));

    // Outer closes -> focus returns to what was focused when IT opened (A).
    outer.unmount();
    await waitFor(() => expect(document.activeElement).toBe(anchorA));

    anchorA.remove();
    anchorB.remove();
  });

  it('does not touch focus when restoreFocus is explicitly false', async () => {
    const anchor = document.createElement('button');
    document.body.append(anchor);
    anchor.focus();

    const { unmount } = renderHook(() =>
      useOverlayLayer({ kind: 'modal', restoreFocus: false }),
    );
    const moved = document.createElement('button');
    document.body.append(moved);
    moved.focus();

    unmount();
    // No restore requested -> focus stays where the app last put it. Give any
    // stray deferred restore a tick to (not) fire.
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(document.activeElement).toBe(moved);

    anchor.remove();
    moved.remove();
  });
});

describe('useOverlayLayer - active gate', () => {
  it('joins the stack only while active', () => {
    const { result, rerender, unmount } = renderHook(
      ({ active }: { active: boolean }) =>
        useOverlayLayer({ kind: 'modal', active, restoreFocus: false }),
      { initialProps: { active: false } },
    );

    expect(getOverlayLayerCount()).toBe(0);
    expect(result.current.isTop).toBe(false);

    rerender({ active: true });
    expect(getOverlayLayerCount()).toBe(1);
    expect(result.current.isTop).toBe(true);

    rerender({ active: false });
    expect(getOverlayLayerCount()).toBe(0);

    unmount();
  });
});
