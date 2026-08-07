import { describe, expect, it } from 'vitest';

import { computeRevealDelta } from '../index';

/**
 * Pure geometry of the shared scrollport reveal.
 *
 * These assertions are exhaustive precisely BECAUSE they are pure: the delta is
 * the one part of the reveal that can be decided without a layout engine, so it
 * is worth deciding here rather than inside a DOM test that has to simulate one.
 * The DOM wiring is covered per consumer
 * (`navigation/Segmented/engines/modern/tests/reveal.test.tsx`,
 * `navigation/Pagination/tests/Pagination.modern-controls-reveal.test.tsx`);
 * real browser layout is covered by the capture harness, not by jsdom.
 */
describe('computeRevealDelta', () => {
  const view = { viewStart: 0, viewEnd: 240 };

  it('returns zero for an item already inside the view', () => {
    expect(computeRevealDelta({ ...view, itemStart: 10, itemEnd: 110 })).toBe(0);
  });

  it('returns zero for an item exactly filling the view', () => {
    expect(computeRevealDelta({ ...view, itemStart: 0, itemEnd: 240 })).toBe(0);
  });

  it('pulls back a negative delta when the item starts before the view', () => {
    // -60 is what must be ADDED to the current offset, not an absolute target.
    expect(computeRevealDelta({ ...view, itemStart: -60, itemEnd: 40 })).toBe(-60);
  });

  it('pushes forward a positive delta when the item ends after the view', () => {
    expect(computeRevealDelta({ ...view, itemStart: 200, itemEnd: 300 })).toBe(60);
  });

  it('moves the minimum: the item lands flush against the edge it crossed', () => {
    const delta = computeRevealDelta({ ...view, itemStart: 200, itemEnd: 300 });
    expect(300 - delta).toBe(view.viewEnd);
  });

  it('aligns the LOGICAL start when the item cannot fit at all', () => {
    // Trailing-edge alignment would show the END of a truncated label, which is
    // the useless half. This case is decided before the "starts before" test.
    //
    // Paired LTR/RTL, because the logical start swaps physical edges and this is
    // the only branch in the function where direction is observable. An
    // implementation that aligns the physical left unconditionally passes the
    // LTR half and shows an RTL reader the tail of the label.
    expect(computeRevealDelta({ ...view, itemStart: 20, itemEnd: 500 })).toBe(20);
    expect(computeRevealDelta({ ...view, itemStart: -20, itemEnd: 460 })).toBe(-20);

    // RTL: the logical start is the physical RIGHT, so the item's right edge
    // lands flush with the view's right edge and the delta has the opposite sign.
    expect(
      computeRevealDelta({ ...view, itemStart: 20, itemEnd: 500, logicalStart: 'right' })
    ).toBe(260);
    expect(
      computeRevealDelta({ ...view, itemStart: -300, itemEnd: 180, logicalStart: 'right' })
    ).toBe(-60);
  });

  it('keeps containment handedness-free', () => {
    // Only the oversized case is direction-aware. A contained-or-containable
    // item must produce the identical delta under both, or the reveal would
    // drift differently for RTL users on ordinary options.
    for (const geometry of [
      { ...view, itemStart: 200, itemEnd: 300 },
      { ...view, itemStart: -60, itemEnd: 40 },
      { ...view, itemStart: 10, itemEnd: 110 },
    ]) {
      expect(computeRevealDelta({ ...geometry, logicalStart: 'right' })).toBe(
        computeRevealDelta(geometry)
      );
    }
  });

  it('tolerates sub-pixel overhang instead of fighting it', () => {
    // Fractional rects are routine at non-integer zoom. Without the tolerance
    // each observation would rewrite the offset by a fraction of a pixel.
    expect(computeRevealDelta({ ...view, itemStart: -0.4, itemEnd: 100 })).toBe(0);
    expect(computeRevealDelta({ ...view, itemStart: 140, itemEnd: 240.4 })).toBe(0);
    expect(computeRevealDelta({ ...view, itemStart: 140, itemEnd: 241 })).toBe(1);
  });

  it('does nothing for a collapsed view rather than dividing by it', () => {
    // A display:none ancestor measures every box at zero. The reveal must be a
    // no-op there, not a scroll to an arbitrary offset that survives the reveal.
    expect(computeRevealDelta({ viewStart: 0, viewEnd: 0, itemStart: 0, itemEnd: 0 })).toBe(0);
    expect(computeRevealDelta({ viewStart: 0, viewEnd: 0, itemStart: 50, itemEnd: 90 })).toBe(0);
  });

  it('is origin-independent, which is what makes it direction-neutral', () => {
    // The same relative arrangement must yield the same delta wherever the
    // scrollport happens to sit in viewport coordinates. This is the property
    // that lets one branch-free expression serve LTR and RTL, where the
    // scrollLeft ORIGIN differs but "add d, move the window right by d" does not.
    const shifted = computeRevealDelta({
      viewStart: 1000,
      viewEnd: 1240,
      itemStart: 1200,
      itemEnd: 1300,
    });
    expect(shifted).toBe(computeRevealDelta({ ...view, itemStart: 200, itemEnd: 300 }));
  });
});
