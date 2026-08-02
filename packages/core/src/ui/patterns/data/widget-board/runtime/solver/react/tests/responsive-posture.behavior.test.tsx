/**
 * E2 behavioral laws for the tenant-reachable responsive posture.
 *
 * The capability is only real if the selected ladder changes what the runtime
 * DOES, so these tests drive the actual lifecycle (stubbed ResizeObserver
 * entries, real tenant contexts) and assert on resolved postures and spans —
 * never on the resolver's return value alone:
 *
 * - absent resolves to `balanced`, whose thresholds AND span bias are the exact
 *   pre-capability constants (the rollback identity);
 * - a document selection changes both, a BrandTheme selection works too, and
 *   the document wins when both are present;
 * - a container measured between two ladders' thresholds resolves to DIFFERENT
 *   postures under each — the observable difference that makes the axis a
 *   capability rather than a stored string;
 * - the span bias reaches the BOARD's solved placements, while the board's
 *   collapse TIER stays CSS-pinned (see the runtime comment for why);
 * - a bogus or retired id falls back to `balanced` on the render path (the
 *   compiler is what rejects it at write time).
 *
 * The hard invariants (no overflow, no reorder, no avoidable holes) are drilled
 * against the pure solver under all three profiles in
 * `../../tests/solver.test.ts` — they belong to geometry, not to React.
 */
import React, { useRef } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TenantContext } from '@/infrastructure/runtime/tenant/composition/react/provider';
import type { WidgetBoardItem } from '../../../../contracts';
import {
  resolveActiveResponsivePosture,
  useAdaptiveBoardLayout,
  useContainerPosture,
} from '..';
import type { AdaptiveBoardLayoutResult } from '..';
import type { ContainerPosture } from '../..';

type ObserverEntry = {
  target: Element;
  contentRect: { width: number; height: number };
};

const observers: Array<{
  callback: (entries: ObserverEntry[]) => void;
  targets: Element[];
}> = [];

class StubResizeObserver {
  private record: {
    callback: (entries: ObserverEntry[]) => void;
    targets: Element[];
  };
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

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal('ResizeObserver', StubResizeObserver);
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

function fire(entries: ObserverEntry[]): Promise<void> {
  const observer = observers[observers.length - 1];
  if (!observer) throw new Error('no observer registered');
  return act(async () => {
    observer.callback(entries);
  });
}

/** A tenant config carrying only the document-side ladder selection. */
function documentConfig(responsivePosture: string): object {
  return { appearance: { advanced: { responsivePosture } } };
}

function withTenant(config: object | undefined, children: React.ReactNode) {
  if (!config) return <>{children}</>;
  return (
    <TenantContext.Provider
      value={{ config, isLoading: false, vertical: undefined } as never}
    >
      {children}
    </TenantContext.Provider>
  );
}

describe('resolveActiveResponsivePosture — the pure derivation', () => {
  it('resolves ABSENT to balanced with the exact pre-capability values', () => {
    // 639/839 + `preferred` are not "sensible defaults" chosen here: they are
    // the literals the runtime and solver used before this axis existed. If
    // this drifts, every tenant that never opted in silently reflows.
    for (const config of [undefined, null, {}, { appearance: {} }]) {
      const resolved = resolveActiveResponsivePosture(config);
      expect(resolved.id).toBe('balanced');
      expect(resolved.thresholds).toEqual({
        compactMaxPx: 639,
        standardMaxPx: 839,
      });
      expect(resolved.spanBias).toBe('preferred');
    }
  });

  it('resolves each published ladder from the document path', () => {
    expect(
      resolveActiveResponsivePosture(documentConfig('compact'))
    ).toMatchObject({
      id: 'compact',
      thresholds: { compactMaxPx: 759, standardMaxPx: 959 },
      spanBias: 'min',
    });
    expect(
      resolveActiveResponsivePosture(documentConfig('expansive'))
    ).toMatchObject({
      id: 'expansive',
      thresholds: { compactMaxPx: 519, standardMaxPx: 719 },
      spanBias: 'max',
    });
  });

  it('keeps the ladder one shape: every profile holds the same 200px band', () => {
    // The design law, asserted rather than asserted-about. Only the onset may
    // move between profiles; a profile that also reshaped the band would be a
    // second reflow character, not a posture.
    for (const id of ['compact', 'balanced', 'expansive']) {
      const { thresholds } = resolveActiveResponsivePosture(documentConfig(id));
      expect(thresholds.standardMaxPx - thresholds.compactMaxPx, id).toBe(200);
    }
  });

  it('resolves from BrandTheme, and the document wins when both are present', () => {
    expect(
      resolveActiveResponsivePosture({
        brandTheme: { responsive: { schemaVersion: 1, posture: 'expansive' } },
      }).id
    ).toBe('expansive');

    // The DB document outranks static authoring, matching the icon-axis canon.
    expect(
      resolveActiveResponsivePosture({
        appearance: { advanced: { responsivePosture: 'compact' } },
        brandTheme: { responsive: { schemaVersion: 1, posture: 'expansive' } },
      }).id
    ).toBe('compact');
  });

  it('falls back to balanced for a retired, bogus or foreign-version id', () => {
    // The compiler rejects these at WRITE time; the render path must never
    // throw inside a layout effect over a row that predates a retirement.
    expect(resolveActiveResponsivePosture(documentConfig('cavernous')).id).toBe(
      'balanced'
    );
    expect(resolveActiveResponsivePosture(documentConfig('')).id).toBe(
      'balanced'
    );
    expect(
      resolveActiveResponsivePosture({
        brandTheme: { responsive: { schemaVersion: 99, posture: 'expansive' } },
      }).id
    ).toBe('balanced');
  });
});

describe('useContainerPosture — the same width, three ladders', () => {
  const latest: { current: ContainerPosture | null } = { current: null };

  function PostureProbe({
    thresholds,
  }: {
    thresholds?: { compactMaxPx: number; standardMaxPx: number };
  }) {
    const ref = useRef<HTMLDivElement | null>(null);
    latest.current = useContainerPosture(ref, 'expanded', thresholds);
    return <div data-probe-container ref={ref} />;
  }

  function container(view: HTMLElement): Element {
    const element = view.querySelector('[data-probe-container]');
    if (!element) throw new Error('probe container missing');
    return element;
  }

  async function postureAt(
    width: number,
    config: object | undefined
  ): Promise<ContainerPosture | null> {
    const view = render(withTenant(config, <PostureProbe />));
    await settle();
    await fire([
      { target: container(view.container), contentRect: { width, height: 0 } },
    ]);
    const result = latest.current;
    cleanup();
    return result;
  }

  it('resolves the same width to different postures across the ladders', async () => {
    // 700px is a width that can only disagree: below compact's 759 bound,
    // but above balanced's 639 and above expansive's 519.
    expect(await postureAt(700, documentConfig('compact'))).toBe('compact');
    expect(await postureAt(700, undefined)).toBe('standard');
    // The second boundary separates the remaining pair: 800px is above
    // expansive's 719 standard bound but below balanced's 839.
    expect(await postureAt(800, undefined)).toBe('standard');
    expect(await postureAt(800, documentConfig('expansive'))).toBe('expanded');
  });

  it('lets an explicit thresholds argument beat the tenant ladder', async () => {
    // Caller-props-win applied to thresholds: a consumer that already knows
    // its own geometry is not overridden by a tenant selection.
    const view = render(
      withTenant(
        documentConfig('compact'),
        <PostureProbe thresholds={{ compactMaxPx: 639, standardMaxPx: 839 }} />
      )
    );
    await settle();
    await fire([
      {
        target: container(view.container),
        contentRect: { width: 700, height: 0 },
      },
    ]);
    expect(latest.current).toBe('standard');
  });
});

describe('useAdaptiveBoardLayout — the span bias reaches solved placements', () => {
  const latest: { current: AdaptiveBoardLayoutResult | null } = {
    current: null,
  };

  function item(id: string, order: number): WidgetBoardItem {
    return {
      id,
      accessibleTitle: id,
      title: id,
      content: null,
      size: 'md',
      order,
      visible: true,
    };
  }

  function BoardProbe() {
    const gridRef = useRef<HTMLElement | null>(null);
    const cellRefs = useRef(new Map<string, HTMLElement>());
    latest.current = useAdaptiveBoardLayout({
      // FOUR items, not two: with two md items the row redistribution grows
      // both to 6 under every bias (the hole law outranks the preference), so
      // a two-item board cannot tell the ladders apart. Four is the smallest
      // board where the packing actually differs.
      items: [item('a', 0), item('b', 1), item('c', 2), item('d', 3)],
      gridRef,
      cellRefs,
      narrow: false,
    });
    return (
      <div
        data-probe-grid
        ref={(element) => {
          gridRef.current = element;
        }}
      />
    );
  }

  function grid(view: HTMLElement): Element {
    const element = view.querySelector('[data-probe-grid]');
    if (!element) throw new Error('probe grid missing');
    return element;
  }

  async function solveAt(
    width: number,
    config: object | undefined
  ): Promise<AdaptiveBoardLayoutResult | null> {
    const view = render(withTenant(config, <BoardProbe />));
    await settle();
    await fire([
      { target: grid(view.container), contentRect: { width, height: 0 } },
    ]);
    const result = latest.current;
    cleanup();
    return result;
  }

  it('keeps the board collapse tier CSS-pinned under every ladder', async () => {
    // The tier must NOT move with the tenant: widget-board.css mirrors 639/839
    // as container queries that repoint the grid tracks (the 639 query drops
    // the grid to ONE track), and the solver's inline grid-column wins over
    // them. A JS-only tier move would stamp spans into a track count that no
    // longer exists. Same width, same tier, all three ladders.
    for (const config of [
      undefined,
      documentConfig('compact'),
      documentConfig('expansive'),
    ]) {
      expect((await solveAt(600, config))?.tier).toBe('single');
      expect((await solveAt(700, config))?.tier).toBe('mid');
      expect((await solveAt(1200, config))?.tier).toBe('full');
    }
  });

  it('resolves items toward min under compact and toward max under expansive', async () => {
    // LEGACY_SIZE_SPANS.md is {min 3, preferred 4, max 6}. On the 12-col full
    // tier the three ladders therefore pack four widgets three different ways,
    // which is the tenant-visible payoff: compact fits all four side by side,
    // expansive gives each its full width.
    const spans = async (config: object | undefined) =>
      (await solveAt(1200, config))!.resolved.map((p) => p.colSpan);

    expect(await spans(documentConfig('compact'))).toEqual([3, 3, 3, 3]);
    expect(await spans(undefined)).toEqual([4, 4, 4, 6]);
    expect(await spans(documentConfig('expansive'))).toEqual([6, 6, 6, 6]);
  });
});
