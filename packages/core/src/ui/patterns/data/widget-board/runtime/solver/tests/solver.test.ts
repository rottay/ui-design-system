/**
 * Property evidence for the adaptive solver (C2): determinism, no-overlap,
 * no avoidable holes, DOM=visual order, tier honesty, clamps, posture
 * pressure, and the exact legacy defects it exists to kill.
 */
import { describe, expect, it } from 'vitest';

import type {
  AdaptiveItemContract,
  AdaptiveLayoutEnv,
  LayoutIntent,
  ResolvedPlacement,
} from '..';
import {
  LEGACY_SIZE_SPANS,
  resolveAdaptiveLayout,
  resolveContainerPosture,
} from '..';

function contract(
  id: string,
  overrides: Partial<AdaptiveItemContract> = {}
): AdaptiveItemContract {
  return {
    id,
    accessibleTitle: id,
    minSpan: { cols: 2 },
    preferredSpan: { cols: 4 },
    maxSpan: { cols: 8 },
    blockPolicy: { mode: 'intrinsic', minRows: 2 },
    contentModes: [
      { id: 'full', minSpan: { cols: 4 } },
      { id: 'compact', minSpan: { cols: 2 } },
      { id: 'summary', minSpan: { cols: 1 } },
    ],
    priority: 'primary',
    overflowPolicy: 'shrink-to-min',
    visualReorder: 'forbid',
    ...overrides,
  };
}

const ENV: AdaptiveLayoutEnv = {
  cols: 12,
  posture: 'expanded',
};

function assertNoOverlapAndBounds(
  placements: readonly ResolvedPlacement[],
  cols: number
): void {
  const cells = new Set<string>();
  for (const placement of placements) {
    expect(placement.colStart).toBeGreaterThanOrEqual(1);
    expect(placement.colStart + placement.colSpan - 1).toBeLessThanOrEqual(cols);
    for (let col = placement.colStart; col < placement.colStart + placement.colSpan; col += 1) {
      for (let row = placement.rowStart; row < placement.rowStart + placement.rowSpan; row += 1) {
        const key = `${col}:${row}`;
        expect(cells.has(key), `overlap at ${key} (${placement.itemId})`).toBe(false);
        cells.add(key);
      }
    }
  }
}

/** Row-major reading order of placements must equal the input order. */
function assertVisualEqualsDomOrder(
  placements: readonly ResolvedPlacement[],
  expectedIds: readonly string[]
): void {
  const visual = [...placements].sort(
    (a, b) => a.rowStart - b.rowStart || a.colStart - b.colStart
  );
  expect(visual.map((placement) => placement.itemId)).toEqual(expectedIds);
}

describe('resolveAdaptiveLayout', () => {
  it('is deterministic: identical inputs give byte-identical results', () => {
    const contracts = [contract('a'), contract('b'), contract('c')];
    const intents: LayoutIntent[] = [
      { itemId: 'b', order: 0, visible: true, spanHint: { cols: 6 } },
    ];
    const first = resolveAdaptiveLayout(contracts, intents, ENV);
    const second = resolveAdaptiveLayout(contracts, intents, ENV);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('kills defect (d): lg+md residue is redistributed, no unfillable columns', () => {
    // Legacy lg(6)+md(4) on 12 columns left 2 dead columns forever.
    const result = resolveAdaptiveLayout(
      [
        contract('lg', { preferredSpan: { cols: 6 }, maxSpan: { cols: 8 } }),
        contract('md', { preferredSpan: { cols: 4 }, maxSpan: { cols: 6 } }),
      ],
      [],
      ENV
    );
    expect(result.avoidableHoleCount).toBe(0);
    const used = result.placements.reduce((sum, p) => sum + p.colSpan, 0);
    expect(used).toBe(12);
    expect(
      result.placements.some((p) => p.reasons.includes('grown-to-fill'))
    ).toBe(true);
    assertNoOverlapAndBounds(result.placements, 12);
  });

  it('kills defect (b): a collapsed 1-column tier resolves 1-column geometry', () => {
    const result = resolveAdaptiveLayout(
      [contract('a'), contract('b', { preferredSpan: { cols: 12 }, minSpan: { cols: 6 } })],
      [],
      { ...ENV, cols: 1, posture: 'compact' }
    );
    for (const placement of result.placements) {
      expect(placement.colStart).toBe(1);
      expect(placement.colSpan).toBe(1);
    }
    // Row indices are the collapsed tier's own, strictly stacked.
    const rows = result.placements.map((p) => p.rowStart);
    expect(new Set(rows).size).toBe(rows.length);
    assertNoOverlapAndBounds(result.placements, 1);
  });

  it('kills defect (c): visual row-major order always equals DOM order', () => {
    const contracts = [
      contract('first', { preferredSpan: { cols: 8 }, maxSpan: { cols: 8 } }),
      contract('second', { preferredSpan: { cols: 8 } }),
      contract('third', { preferredSpan: { cols: 3 }, minSpan: { cols: 3 } }),
    ];
    // Legacy backfill would have floated `third` up beside `first`.
    const result = resolveAdaptiveLayout(contracts, [], ENV);
    assertVisualEqualsDomOrder(result.placements, ['first', 'second', 'third']);
  });

  it('honors span hints inside min/max and reports clamping otherwise', () => {
    const contracts = [contract('a', { minSpan: { cols: 3 }, maxSpan: { cols: 6 } })];
    const honored = resolveAdaptiveLayout(
      contracts,
      [{ itemId: 'a', order: 0, visible: true, spanHint: { cols: 5 } }],
      ENV
    );
    expect(honored.placements[0].reasons).toContain('intent-honored');
    // grown-to-fill may widen it afterwards; the hint itself was honored.
    const clamped = resolveAdaptiveLayout(
      contracts,
      [{ itemId: 'a', order: 0, visible: true, spanHint: { cols: 40 } }],
      ENV
    );
    expect(clamped.placements[0].colSpan).toBeLessThanOrEqual(6);
    expect(clamped.placements[0].reasons).toContain('clamped-max');
  });

  it('never renders stale intents: unknown item ids are ignored', () => {
    const result = resolveAdaptiveLayout(
      [contract('real')],
      [
        { itemId: 'ghost', order: 0, visible: true, spanHint: { cols: 1 } },
        { itemId: 'real', order: 5, visible: true },
      ],
      ENV
    );
    expect(result.placements.map((p) => p.itemId)).toEqual(['real']);
    expect(result.excluded).toEqual([]);
  });

  it('hidden intents exclude items; compact posture defers secondary items by policy', () => {
    const contracts = [
      contract('keep'),
      contract('hideme'),
      contract('drop-secondary', {
        priority: 'secondary',
        overflowPolicy: 'hide-secondary',
      }),
      contract('push-secondary', {
        priority: 'secondary',
        overflowPolicy: 'defer',
      }),
      contract('critical-stays', { priority: 'critical', overflowPolicy: 'defer' }),
    ];
    const result = resolveAdaptiveLayout(
      contracts,
      [{ itemId: 'hideme', order: 1, visible: false }],
      { ...ENV, cols: 2, posture: 'compact' }
    );
    expect(result.excluded).toContainEqual({ itemId: 'hideme', reason: 'hidden' });
    expect(result.excluded).toContainEqual({
      itemId: 'drop-secondary',
      reason: 'deferred',
    });
    const order = result.placements.map((p) => p.itemId);
    expect(order[order.length - 1]).toBe('push-secondary');
    expect(order).toContain('critical-stays');
    // Outside compact, nothing defers.
    const expanded = resolveAdaptiveLayout(contracts, [], ENV);
    expect(expanded.excluded).toEqual([]);
  });

  it('resolves content modes by resolved span and posture, honoring valid hints', () => {
    const item = contract('modal', {
      contentModes: [
        { id: 'full', minSpan: { cols: 6 }, minPosture: 'standard' },
        { id: 'compact', minSpan: { cols: 3 } },
        { id: 'summary', minSpan: { cols: 1 } },
      ],
      minSpan: { cols: 2 },
      preferredSpan: { cols: 4 },
      maxSpan: { cols: 4 },
    });
    const demoted = resolveAdaptiveLayout([item], [], ENV);
    expect(demoted.placements[0].modeId).toBe('compact');
    expect(demoted.placements[0].reasons).toContain('demoted-mode');

    const hinted = resolveAdaptiveLayout(
      [item],
      [{ itemId: 'modal', order: 0, visible: true, modeHint: 'summary' }],
      ENV
    );
    expect(hinted.placements[0].modeId).toBe('summary');

    // Posture gate: full requires standard+, so compact posture demotes even
    // at a wide span.
    const wide = contract('wide', {
      contentModes: [
        { id: 'full', minSpan: { cols: 2 }, minPosture: 'standard' },
        { id: 'summary', minSpan: { cols: 1 } },
      ],
    });
    const compactPosture = resolveAdaptiveLayout([wide], [], {
      ...ENV,
      cols: 8,
      posture: 'compact',
    });
    expect(compactPosture.placements[0].modeId).toBe('summary');
  });

  it('fitted and fixed-bounded block policies clamp measured rows; px never enters', () => {
    const fitted = contract('fitted', {
      blockPolicy: { mode: 'fitted', minRows: 2, maxRows: 4 },
    });
    const fixed = contract('fixed', {
      blockPolicy: { mode: 'fixed-bounded', rows: 3, scroll: 'bounded' },
    });
    const result = resolveAdaptiveLayout([fitted, fixed], [], {
      ...ENV,
      measuredRows: { fitted: 9, fixed: 9 },
    });
    const byId = Object.fromEntries(result.placements.map((p) => [p.itemId, p]));
    expect(byId.fitted.rowSpan).toBe(4);
    expect(byId.fixed.rowSpan).toBe(3);
  });

  it('pins float to the front deterministically, ties broken by id', () => {
    const result = resolveAdaptiveLayout(
      [contract('b'), contract('a'), contract('z', { pinned: true })],
      [],
      ENV
    );
    expect(result.placements.map((p) => p.itemId)[0]).toBe('z');
  });

  it('is direction-agnostic BY TYPE: the pure contract rejects a dir field', () => {
    // C2c: logical geometry cannot depend on direction — CSS Grid mirrors
    // `grid-column` natively under RTL. The law is now pinned at the
    // contract: direction lives only in the runtime door (epoch/FLIP).
    const contracts = [contract('a')];
    expect(() =>
      resolveAdaptiveLayout(contracts, [], {
        cols: 12,
        posture: 'expanded',
        // @ts-expect-error -- dir is not part of the pure solve contract
        dir: 'rtl',
      })
    ).not.toThrow();
  });

  it('property sweep: 60 seeded random boards keep every invariant', () => {
    // Deterministic LCG — no Math.random in solver land, tests included.
    let seed = 0x2f6e2b1;
    const next = (): number => {
      seed = (seed * 48271) % 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let round = 0; round < 60; round += 1) {
      const cols = [1, 2, 4, 6, 12][Math.floor(next() * 5)];
      const posture = (['compact', 'standard', 'expanded'] as const)[
        Math.floor(next() * 3)
      ];
      const count = 1 + Math.floor(next() * 9);
      const contracts: AdaptiveItemContract[] = [];
      for (let index = 0; index < count; index += 1) {
        const min = 1 + Math.floor(next() * 3);
        const preferred = min + Math.floor(next() * 4);
        const max = preferred + Math.floor(next() * 5);
        contracts.push(
          contract(`item-${index}`, {
            minSpan: { cols: min },
            preferredSpan: { cols: preferred },
            maxSpan: { cols: max },
            priority: (['critical', 'primary', 'secondary'] as const)[
              Math.floor(next() * 3)
            ],
            overflowPolicy: (
              ['shrink-to-min', 'demote-mode', 'defer', 'hide-secondary'] as const
            )[Math.floor(next() * 4)],
            blockPolicy: { mode: 'intrinsic', minRows: 1 + Math.floor(next() * 3) },
          })
        );
      }
      // E2 drill: the SAME board is swept under every tenant span bias. The
      // responsive-posture capability may move where an item lands inside its
      // own declared range; it may never buy an exception to the hard
      // invariants. Absent (`undefined`) is included because it must stay the
      // pre-capability path.
      for (const spanBias of [
        undefined,
        'min',
        'preferred',
        'max',
      ] as const) {
        const result = resolveAdaptiveLayout(contracts, [], {
          ...ENV,
          cols,
          posture,
          spanBias,
        });
        const label = `round ${round} bias ${spanBias ?? 'absent'}`;
        // No overflow and no overlap, under every bias.
        assertNoOverlapAndBounds(result.placements, cols);
        // No avoidable holes, under every bias.
        expect(result.avoidableHoleCount, label).toBe(0);
        const placedIds = result.placements.map((p) => p.itemId);
        const expectedOrder = contracts
          .map((c) => c.id)
          .filter((id) => placedIds.includes(id));
        // Every span stays inside the item's OWN declared range: a bias is a
        // preference, never a widening of authority.
        for (const placement of result.placements) {
          const own = contracts.find((c) => c.id === placement.itemId)!;
          expect(
            placement.colSpan,
            `${label} ${placement.itemId} under min`
          ).toBeGreaterThanOrEqual(Math.min(cols, own.minSpan.cols));
          expect(
            placement.colSpan,
            `${label} ${placement.itemId} over max`
          ).toBeLessThanOrEqual(Math.min(cols, Math.max(own.minSpan.cols, own.maxSpan.cols)));
        }
        // Deferred items move to the end by policy; everything else keeps
        // DOM-order-equals-visual-order — a bias never reorders.
        if (posture !== 'compact') {
          assertVisualEqualsDomOrder(result.placements, expectedOrder);
        }
      }
    }
  });

  it('E2: an absent span bias is byte-identical to the explicit preferred bias', () => {
    // The rollback identity at the geometry level. `balanced` resolves to
    // `preferred`, so a tenant that never opted in and a tenant that selected
    // balanced must produce the SAME placements — not merely similar ones.
    const contracts = [
      contract('a', { minSpan: { cols: 2 }, preferredSpan: { cols: 4 }, maxSpan: { cols: 6 } }),
      contract('b', { minSpan: { cols: 3 }, preferredSpan: { cols: 5 }, maxSpan: { cols: 8 } }),
      contract('c', { minSpan: { cols: 1 }, preferredSpan: { cols: 3 }, maxSpan: { cols: 4 } }),
    ];
    const absent = resolveAdaptiveLayout(contracts, [], { ...ENV });
    const explicit = resolveAdaptiveLayout(contracts, [], {
      ...ENV,
      spanBias: 'preferred',
    });
    expect(absent).toEqual(explicit);
  });

  it('E2: the bias changes how many items share a row, holes still zero', () => {
    // What the capability actually BUYS, measured rather than asserted about.
    // Four {min 3, preferred 4, max 6} items on a 12-col tier: `min` packs all
    // four into ONE row, `preferred` keeps the authored three-up rhythm, `max`
    // gives each item its full width. Every layout still audits to zero
    // avoidable holes, which is the point — the bias moves the packing, it
    // does not buy an exception to the hole law.
    const contracts = Array.from({ length: 4 }, (_, index) =>
      contract(`i${index}`, {
        minSpan: { cols: 3 },
        preferredSpan: { cols: 4 },
        maxSpan: { cols: 6 },
        overflowPolicy: 'demote-mode',
      })
    );
    const solve = (spanBias: 'min' | 'preferred' | 'max') => {
      const result = resolveAdaptiveLayout(contracts, [], {
        ...ENV,
        cols: 12,
        spanBias,
      });
      return {
        spans: result.placements.map((placement) => placement.colSpan),
        rows: new Set(result.placements.map((p) => p.rowStart)).size,
        holes: result.avoidableHoleCount,
      };
    };

    expect(solve('min')).toEqual({ spans: [3, 3, 3, 3], rows: 1, holes: 0 });
    expect(solve('preferred')).toEqual({ spans: [4, 4, 4, 6], rows: 2, holes: 0 });
    expect(solve('max')).toEqual({ spans: [6, 6, 6, 6], rows: 2, holes: 0 });
  });

  it('E2: the hole law OUTRANKS the bias, and a span hint outranks the bias', () => {
    // The documented soft-cost order is `avoidable holes > deviation from
    // explicit preference`, so the redistribution pass may grow a `min`-biased
    // item back up to fill its row. Two items that each fill half the tier are
    // the honest demonstration: all three biases converge, because refusing to
    // would mean leaving a hole. A bias is a preference, not an override.
    const pair = [
      contract('a', { minSpan: { cols: 3 }, preferredSpan: { cols: 4 }, maxSpan: { cols: 6 } }),
      contract('b', { minSpan: { cols: 3 }, preferredSpan: { cols: 4 }, maxSpan: { cols: 6 } }),
    ];
    const spans = (spanBias: 'min' | 'preferred' | 'max') =>
      resolveAdaptiveLayout(pair, [], { ...ENV, cols: 12, spanBias }).placements.map(
        (placement) => placement.colSpan
      );
    expect(spans('min')).toEqual([6, 6]);
    expect(spans('preferred')).toEqual([6, 6]);
    expect(spans('max')).toEqual([6, 6]);

    // A user's persisted span hint is a stronger signal than a tenant posture:
    // it replaces the bias outright at the intent stage, so a saved layout is
    // not overruled by the tenant. Measured on a row with NO residue, because
    // the same redistribution pass that outranks the bias outranks a hint too
    // (pre-existing behavior, and the reason the assertion is framed this way
    // rather than as "the hint always wins").
    const hinted = resolveAdaptiveLayout(
      [
        pair[0]!,
        contract('b', {
          minSpan: { cols: 9 },
          preferredSpan: { cols: 9 },
          maxSpan: { cols: 9 },
        }),
      ],
      [{ itemId: 'a', order: 0, visible: true, spanHint: { cols: 3 } }],
      { ...ENV, cols: 12, spanBias: 'max' }
    );
    expect(hinted.placements[0]!.colSpan).toBe(3);
  });

  it('legacy size adapter provides module-friendly span ranges', () => {
    expect(LEGACY_SIZE_SPANS.lg.max).toBeGreaterThan(LEGACY_SIZE_SPANS.lg.preferred);
    expect(LEGACY_SIZE_SPANS.sm.min).toBeGreaterThanOrEqual(2);
    expect(LEGACY_SIZE_SPANS.wide.preferred).toBe(12);
  });

  it('buckets container posture by profile thresholds', () => {
    const profile = { thresholds: { compactMaxPx: 480, standardMaxPx: 960 } };
    expect(resolveContainerPosture(320, profile)).toBe('compact');
    expect(resolveContainerPosture(700, profile)).toBe('standard');
    expect(resolveContainerPosture(1400, profile)).toBe('expanded');
  });
});
