/**
 * C2c behavioral laws for the shared adaptive runtime. These tests drive the
 * REAL lifecycle — stubbed ResizeObserver entries, a stubbed FontFaceSet,
 * tenant-config identity swaps — and assert on measurements and placements,
 * never on the epoch string alone:
 *
 * - measured cell heights become row spans through the COMPUTED row unit,
 *   and a changed row unit changes the conversion;
 * - an artifact (tenant config) swap clears measurements and re-subscribes
 *   the observer (invalidate → re-measure), and new measurements re-enter;
 * - a late font `loadingdone` (subset arriving after the initial settle)
 *   re-opens measurement instead of being lost to a one-shot ready.
 */
import React, { useRef } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TenantContext } from '@/infrastructure/runtime/tenant/composition/react/provider';
import type { WidgetBoardItem } from '../../../../contracts';
import { useAdaptiveBoardLayout } from '..';
import type { AdaptiveBoardLayoutResult } from '..';

type ObserverEntry = { target: Element; contentRect: { width: number; height: number } };

const observers: Array<{
  callback: (entries: ObserverEntry[]) => void;
  targets: Element[];
}> = [];

class StubResizeObserver {
  private record: { callback: (entries: ObserverEntry[]) => void; targets: Element[] };
  constructor(callback: (entries: ObserverEntry[]) => void) {
    this.record = { callback, targets: [] };
    observers.push(this.record);
  }
  observe(target: Element): void {
    this.record.targets.push(target);
  }
  unobserve(): void {}
  disconnect(): void {}
}

type FontListener = () => void;
function installFontsStub(): { fireLoadingDone: () => void } {
  const listeners = new Set<FontListener>();
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: {
      ready: Promise.resolve(),
      addEventListener: (type: string, listener: FontListener) => {
        if (type === 'loadingdone') listeners.add(listener);
      },
      removeEventListener: (type: string, listener: FontListener) => {
        listeners.delete(listener);
      },
    },
  });
  return {
    fireLoadingDone: () => {
      for (const listener of listeners) listener();
    },
  };
}

function item(id: string, size: WidgetBoardItem['size'], order: number): WidgetBoardItem {
  return { id, accessibleTitle: id, title: id, content: null, size, order, visible: true };
}

const latest: { current: AdaptiveBoardLayoutResult | null } = { current: null };

function BoardProbe({ items }: { items: WidgetBoardItem[] }) {
  const gridRef = useRef<HTMLElement | null>(null);
  const cellRefs = useRef(new Map<string, HTMLElement>());
  latest.current = useAdaptiveBoardLayout({ items, gridRef, cellRefs, narrow: false });
  return (
    <div
      data-probe-grid
      ref={(element) => {
        gridRef.current = element;
      }}
    >
      {items.map((entry) => (
        <div
          key={entry.id}
          data-widget-id={entry.id}
          ref={(element) => {
            if (element) cellRefs.current.set(entry.id, element);
          }}
        />
      ))}
    </div>
  );
}

let rowUnitPx = 8;
let rowGapPx = 8;

beforeEach(() => {
  observers.length = 0;
  latest.current = null;
  rowUnitPx = 8;
  rowGapPx = 8;
  vi.stubGlobal('ResizeObserver', StubResizeObserver);
  const realGetComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element: Element) => {
    if ((element as HTMLElement).dataset?.probeGrid !== undefined) {
      return {
        gridAutoRows: `${rowUnitPx}px`,
        rowGap: `${rowGapPx}px`,
      } as unknown as CSSStyleDeclaration;
    }
    return realGetComputedStyle(element);
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

function lastObserver() {
  const observer = observers[observers.length - 1];
  if (!observer) throw new Error('no observer registered');
  return observer;
}

function fire(entries: ObserverEntry[]): Promise<void> {
  return act(async () => {
    lastObserver().callback(entries);
  });
}

function gridEl(container: HTMLElement): Element {
  const grid = container.querySelector('[data-probe-grid]');
  if (!grid) throw new Error('probe grid missing');
  return grid;
}

function cellEl(container: HTMLElement, id: string): Element {
  const cell = container.querySelector(`[data-widget-id="${id}"]`);
  if (!cell) throw new Error(`cell ${id} missing`);
  return cell;
}

describe('measured heights → row spans through the computed row unit', () => {
  it('converts with the live grid metrics and re-converts when the unit changes', async () => {
    const items = [item('a', 'lg', 0)];
    const { container } = render(<BoardProbe items={items} />);
    await settle();

    // 100px at unit 8/gap 8 → ceil(108/16) = 7 rows.
    await fire([
      { target: gridEl(container), contentRect: { width: 1200, height: 0 } },
      { target: cellEl(container, 'a'), contentRect: { width: 0, height: 100 } },
    ]);
    expect(latest.current?.rowSpans.a).toBe(7);
    expect(latest.current?.placements.a?.gridRow).toContain('span 7');

    // The CSS row unit doubles (density/token change): the SAME rendered
    // height now converts to fewer rows — ceil(108/24) = 5. The conversion
    // follows the computed metrics, never a constant.
    rowUnitPx = 16;
    await fire([
      { target: cellEl(container, 'a'), contentRect: { width: 0, height: 100 } },
    ]);
    expect(latest.current?.rowSpans.a).toBe(5);
    expect(latest.current?.placements.a?.gridRow).toContain('span 5');
  });
});

describe('artifact revision — invalidate and re-measure', () => {
  it('clears measurements, re-subscribes the observer, and accepts fresh measurements after a tenant-config swap', async () => {
    const items = [item('a', 'lg', 0)];
    const configA = { slug: 'tenant-a' };
    const configB = { slug: 'tenant-b' };
    const tree = (config: object) => (
      <TenantContext.Provider
        value={{ config, isLoading: false, vertical: undefined } as never}
      >
        <BoardProbe items={items} />
      </TenantContext.Provider>
    );
    const view = render(tree(configA));
    await settle();
    await fire([
      { target: gridEl(view.container), contentRect: { width: 1200, height: 0 } },
      { target: cellEl(view.container, 'a'), contentRect: { width: 0, height: 100 } },
    ]);
    expect(latest.current?.rowSpans.a).toBe(7);
    const observersBefore = observers.length;

    // Live artifact swap: same density, same locale — ONLY the config
    // identity moves. Measurements must not survive the theme.
    view.rerender(tree(configB));
    await settle();
    expect(latest.current?.rowSpans.a).toBeUndefined();
    expect(observers.length).toBeGreaterThan(observersBefore);

    await fire([
      { target: cellEl(view.container, 'a'), contentRect: { width: 0, height: 200 } },
    ]);
    expect(latest.current?.rowSpans.a).toBe(13);
  });
});

describe('font loadingdone — late subsets re-open measurement', () => {
  it('a loadingdone AFTER the initial ready clears spans and re-measures (the lost-subset drill)', async () => {
    const fonts = installFontsStub();
    const items = [item('a', 'lg', 0)];
    const { container } = render(<BoardProbe items={items} />);
    await settle();

    await fire([
      { target: gridEl(container), contentRect: { width: 1200, height: 0 } },
      { target: cellEl(container, 'a'), contentRect: { width: 0, height: 100 } },
    ]);
    expect(latest.current?.rowSpans.a).toBe(7);
    const observersBefore = observers.length;

    // The AR subset finishes downloading after a locale switch: metrics
    // changed, a one-shot `ready` design would keep the stale 7.
    await act(async () => {
      fonts.fireLoadingDone();
    });
    expect(latest.current?.rowSpans.a).toBeUndefined();
    expect(observers.length).toBeGreaterThan(observersBefore);

    await fire([
      { target: cellEl(container, 'a'), contentRect: { width: 0, height: 132 } },
    ]);
    expect(latest.current?.rowSpans.a).toBe(9);
  });
});
