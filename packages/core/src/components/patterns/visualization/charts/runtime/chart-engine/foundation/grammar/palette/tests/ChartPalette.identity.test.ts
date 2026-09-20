import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { hexToOklab, hexToOklch } from '@/foundation/kernel/color/oklch';

import { CHART_CATEGORICAL_SIZE } from '..';

/**
 * THE DERIVATION RULE FOR `default`, as assertions rather than prose. It is
 * not `accessible` renamed and not a twelfth of the hue wheel per slot: it
 * carries the Rottay-class neutral+primary character, measured here on the
 * compiled light AND dark tables so the character survives the mode switch.
 *
 *   R1  slots 1-9 are three hue lanes cycled three times -- a restrained teal
 *       primary, the warm ochre of the neutral/secondary family, and a
 *       terracotta companion; lane membership is `slot mod 3`
 *   R2  a lane holds its hue and separates its repeats by lightness/chroma
 *   R3  the three lane anchors sit at least 30 degrees apart
 *   R4  slot 10 is the one near-achromatic slot, and it is warm
 *   R5  slots 11-12 are the derived extension: new hue ground off every lane
 *       (their separation floor is proved in ChartPalette.contrast)
 *   R6  restraint -- default peaks below accessible, accessible below vibrant
 *   R7  it shares no value with accessible at any slot, in either mode
 */
const PATTERNS_CSS = readFileSync(
  join(__dirname, '../../../../../../../../../../foundation/tokens/css/presentation/components/patterns/index.css'),
  'utf8',
);

const MODES = ['light', 'dark'] as const;

type Mode = typeof MODES[number];

/** The scheme's twelve declared values per mode, in slot order. */
function readTable(scheme: string): Record<Mode, readonly string[]> {
  const light: string[] = [];
  const dark: string[] = [];
  for (let slot = 1; slot <= CHART_CATEGORICAL_SIZE; slot += 1) {
    const matches = [
      ...PATTERNS_CSS.matchAll(new RegExp(`--ds-chart-${scheme}-${slot}:\\s*(#[0-9a-f]{6})`, 'gi')),
    ];
    expect(matches, `${scheme}-${slot} must declare one light and one dark value`).toHaveLength(2);
    light.push(matches[0]![1]!.toLowerCase());
    dark.push(matches[1]![1]!.toLowerCase());
  }
  return { light, dark };
}

const DEFAULT_TABLE = readTable('default');
const ACCESSIBLE_TABLE = readTable('accessible');
const VIBRANT_TABLE = readTable('vibrant');

/** Shortest angular distance on the hue circle. */
function hueGap(first: number, second: number): number {
  const raw = Math.abs(first - second) % 360;
  return Math.min(raw, 360 - raw);
}

function oklabDistance(first: string, second: string): number {
  const a = hexToOklab(first);
  const b = hexToOklab(second);
  return Math.hypot(a.l - b.l, a.a - b.a, a.b - b.b);
}

/** Slots 1-9, grouped by `slot mod 3`: the three lanes R1 names. */
const LANES = Object.freeze({
  teal: Object.freeze([0, 3, 6]),
  ochre: Object.freeze([1, 4, 7]),
  terracotta: Object.freeze([2, 5, 8]),
});

const NEUTRAL_SLOT = 9;
const LANE_HUE_DRIFT = 2;
const LANE_ANCHOR_SEPARATION = 30;
const NEUTRAL_CHROMA_CEILING = 0.02;
const DERIVED_HUE_CLEARANCE = 20;

describe('the `default` chart scheme derives its own identity', () => {
  it.each(MODES)('R1/R2: %s cycles three hue lanes, separated inside a lane by L and C', (mode) => {
    const table = DEFAULT_TABLE[mode];

    for (const [lane, slots] of Object.entries(LANES)) {
      const hues = slots.map((index) => hexToOklch(table[index]!).h);
      for (const hue of hues) {
        expect(
          hueGap(hue, hues[0]!),
          `${mode} ${lane} lane must hold its hue across its three repeats`,
        ).toBeLessThanOrEqual(LANE_HUE_DRIFT);
      }

      // Same hue three times is only a vocabulary if the repeats separate on
      // the other two axes; this is the assertion that forbids a flat lane.
      for (const index of slots) {
        for (const peer of slots) {
          if (peer <= index) continue;
          expect(
            oklabDistance(table[index]!, table[peer]!),
            `${mode} ${lane} slots ${index + 1}/${peer + 1} must separate by lightness and chroma`,
          ).toBeGreaterThan(0.02);
        }
      }
    }
  });

  it.each(MODES)('R3: the %s lane anchors are far apart on the wheel', (mode) => {
    const table = DEFAULT_TABLE[mode];
    const anchors = Object.values(LANES).map((slots) => hexToOklch(table[slots[0]!]!).h);
    for (const [index, anchor] of anchors.entries()) {
      for (const peer of anchors.slice(index + 1)) {
        expect(hueGap(anchor, peer)).toBeGreaterThanOrEqual(LANE_ANCHOR_SEPARATION);
      }
    }
  });

  it.each(MODES)('R4: %s slot 10 is the one neutral anchor, and it is warm', (mode) => {
    const table = DEFAULT_TABLE[mode];
    const neutral = hexToOklch(table[NEUTRAL_SLOT]!);

    expect(neutral.c).toBeLessThanOrEqual(NEUTRAL_CHROMA_CEILING);
    // Warm, like the neutral/secondary family it anchors -- a cool grey would
    // read as a borrowed slot from another scheme.
    expect(neutral.h).toBeGreaterThan(40);
    expect(neutral.h).toBeLessThan(110);

    table.forEach((color, index) => {
      if (index === NEUTRAL_SLOT) return;
      expect(
        hexToOklch(color).c,
        `${mode} slot ${index + 1} must stay chromatic; only slot 10 is the anchor`,
      ).toBeGreaterThan(NEUTRAL_CHROMA_CEILING);
    });
  });

  it.each(MODES)('R5: %s slots 11-12 open new hue ground off every lane', (mode) => {
    const table = DEFAULT_TABLE[mode];
    const anchors = Object.values(LANES).map((slots) => hexToOklch(table[slots[0]!]!).h);
    for (const slot of [10, 11]) {
      const hue = hexToOklch(table[slot]!).h;
      const nearest = Math.min(...anchors.map((anchor) => hueGap(hue, anchor)));
      expect(
        nearest,
        `${mode} slot ${slot + 1} must not be a fourth repeat of an existing lane`,
      ).toBeGreaterThanOrEqual(DERIVED_HUE_CLEARANCE);
    }
  });

  it.each(MODES)('R6: %s default is quieter than accessible, which is quieter than vibrant', (mode) => {
    const peak = (table: readonly string[]): number =>
      Math.max(...table.map((color) => hexToOklch(color).c));

    expect(peak(DEFAULT_TABLE[mode])).toBeLessThan(peak(ACCESSIBLE_TABLE[mode]));
    expect(peak(ACCESSIBLE_TABLE[mode])).toBeLessThan(peak(VIBRANT_TABLE[mode]));
  });

  it.each(MODES)('R7: %s shares no value with accessible at any slot', (mode) => {
    const defaults = DEFAULT_TABLE[mode];
    const accessible = ACCESSIBLE_TABLE[mode];

    expect(defaults.filter((color) => accessible.includes(color))).toEqual([]);
    defaults.forEach((color, index) => {
      expect(
        oklabDistance(color, accessible[index]!),
        `${mode} slot ${index + 1} must be a decision, not a copy of accessible`,
      ).toBeGreaterThan(0.04);
    });
  });
});
