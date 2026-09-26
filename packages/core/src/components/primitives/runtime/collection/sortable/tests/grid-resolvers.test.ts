import { describe, expect, it } from 'vitest';

import {
  resolveGridSlot,
  resolveResizeAxes,
  resolveResizeIntent,
  type ResizeEdge,
  type SlotRect,
} from '../index';

const box = (left: number, top: number, width: number, height: number): SlotRect => ({
  left,
  top,
  right: left + width,
  bottom: top + height,
});

/** Three 100x100 slots in one row, 20px apart, inside a 0..340 x 0..100 grid. */
const ROW = [box(0, 0, 100, 100), box(120, 0, 100, 100), box(240, 0, 100, 100)];
const BOUNDS = box(0, 0, 340, 100);

describe('resolveGridSlot', () => {
  it('returns the slot under the point, edges inclusive', () => {
    expect(resolveGridSlot({ x: 50, y: 50 }, ROW, { bounds: BOUNDS })).toBe(0);
    expect(resolveGridSlot({ x: 120, y: 0 }, ROW, { bounds: BOUNDS })).toBe(1);
    expect(resolveGridSlot({ x: 340, y: 100 }, ROW, { bounds: BOUNDS })).toBe(2);
  });

  it('takes the nearest slot in a gap, and the earlier one on an exact tie', () => {
    expect(resolveGridSlot({ x: 104, y: 50 }, ROW, { bounds: BOUNDS })).toBe(0);
    expect(resolveGridSlot({ x: 116, y: 50 }, ROW, { bounds: BOUNDS })).toBe(1);
    expect(resolveGridSlot({ x: 110, y: 50 }, ROW, { bounds: BOUNDS })).toBe(0);
  });

  it('measures 2-D distance to the nearest edge, not to the centre', () => {
    const grid = [box(0, 0, 100, 40), box(0, 60, 1000, 40)];
    expect(resolveGridSlot({ x: 120, y: 45 }, grid, { bounds: box(0, 0, 1000, 100) })).toBe(1);
  });

  it('keeps the nearest slot within the tolerance and returns null past it', () => {
    expect(resolveGridSlot({ x: 364, y: 50 }, ROW, { bounds: BOUNDS })).toBe(2);
    expect(resolveGridSlot({ x: 365, y: 50 }, ROW, { bounds: BOUNDS })).toBeNull();
    expect(resolveGridSlot({ x: 50, y: -25 }, ROW, { bounds: BOUNDS })).toBeNull();
    expect(resolveGridSlot({ x: 50, y: 130 }, ROW, { bounds: BOUNDS, tolerance: 30 })).toBe(0);
    expect(resolveGridSlot({ x: 50, y: 131 }, ROW, { bounds: BOUNDS, tolerance: 30 })).toBeNull();
  });

  it('skips slots with no rect or no area, and has no slot to offer from an empty grid', () => {
    expect(resolveGridSlot({ x: 50, y: 50 }, [null, box(0, 0, 0, 100), box(200, 0, 100, 100)], { bounds: BOUNDS })).toBe(2);
    expect(resolveGridSlot({ x: 50, y: 50 }, [], { bounds: BOUNDS })).toBeNull();
    expect(resolveGridSlot({ x: 50, y: 50 }, [undefined], { bounds: BOUNDS })).toBeNull();
  });

  it('under RTL the logical order runs over mirrored rects, so the same point finds the mirrored slot', () => {
    const mirrored = [box(240, 0, 100, 100), box(120, 0, 100, 100), box(0, 0, 100, 100)];
    expect(resolveGridSlot({ x: 50, y: 50 }, mirrored, { bounds: BOUNDS })).toBe(2);
    expect(resolveGridSlot({ x: 300, y: 50 }, mirrored, { bounds: BOUNDS })).toBe(0);
    expect(resolveGridSlot({ x: 236, y: 50 }, mirrored, { bounds: BOUNDS })).toBe(0);
  });
});

const EDGES: ResizeEdge[] = [
  'inline-start',
  'inline-end',
  'block-start',
  'block-end',
  'block-start-inline-start',
  'block-start-inline-end',
  'block-end-inline-start',
  'block-end-inline-end',
];

describe('resolveResizeAxes', () => {
  it('maps each of the eight logical edges to its axes and growth sign', () => {
    expect(EDGES.map((edge) => [edge, resolveResizeAxes(edge)])).toEqual([
      ['inline-start', { inline: -1, block: 0 }],
      ['inline-end', { inline: 1, block: 0 }],
      ['block-start', { inline: 0, block: -1 }],
      ['block-end', { inline: 0, block: 1 }],
      ['block-start-inline-start', { inline: -1, block: -1 }],
      ['block-start-inline-end', { inline: 1, block: -1 }],
      ['block-end-inline-start', { inline: -1, block: 1 }],
      ['block-end-inline-end', { inline: 1, block: 1 }],
    ]);
  });
});

describe('resolveResizeIntent', () => {
  const step = { inline: 80, block: 1 };

  it('turns travel into whole steps on the axes the edge owns, rounding to the nearest step', () => {
    expect(resolveResizeIntent('inline-end', { x: 119, y: 500 }, { step, rtl: false })).toEqual({
      edge: 'inline-end',
      inline: 1,
      block: 0,
    });
    expect(resolveResizeIntent('inline-end', { x: 121, y: 0 }, { step, rtl: false }).inline).toBe(2);
    expect(resolveResizeIntent('block-end-inline-end', { x: -210, y: 37 }, { step, rtl: false })).toEqual({
      edge: 'block-end-inline-end',
      inline: -3,
      block: 37,
    });
  });

  it('a start edge grows when dragged toward the start', () => {
    expect(resolveResizeIntent('inline-start', { x: -160, y: 0 }, { step, rtl: false }).inline).toBe(2);
    expect(resolveResizeIntent('block-start', { x: 0, y: -40 }, { step, rtl: false }).block).toBe(40);
  });

  it('mirrors the inline axis under RTL and never the block axis', () => {
    expect(resolveResizeIntent('inline-end', { x: -160, y: 0 }, { step, rtl: true }).inline).toBe(2);
    expect(resolveResizeIntent('block-end-inline-start', { x: 160, y: 10 }, { step, rtl: true })).toEqual({
      edge: 'block-end-inline-start',
      inline: 2,
      block: 10,
    });
  });

  it('moves nothing below half a step, and nothing on a non-positive step', () => {
    expect(resolveResizeIntent('inline-end', { x: 39, y: 0 }, { step, rtl: false })).toEqual({
      edge: 'inline-end',
      inline: 0,
      block: 0,
    });
    expect(resolveResizeIntent('inline-end', { x: -39, y: 0 }, { step, rtl: false }).inline).toBe(0);
    expect(resolveResizeIntent('block-end', { x: 0, y: 400 }, { step: { inline: 80, block: 0 }, rtl: false }).block).toBe(0);
  });
});
