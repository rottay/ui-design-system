/**
 * @fileoverview StatsHeader elevation contract (WO-CRA-23 dashboard lane).
 *
 * Two claims, proved with two different instruments because they are two
 * different kinds of claim:
 *
 *  - THE DEFECT. `pulse-dot-ping` used to hold absolute `opacity: 1 / 0.4 / 1`
 *    frames. A spark dot encodes its series value in
 *    `--_ds-stats-header-spark-dot-opacity`, and an animation origin outranks
 *    a declared value, so hovering a card flattened the whole sparkline to one
 *    tone — and `animation-fill-mode: both` held it flat for the entire hover.
 *    The frames are now RELATIVE to each dot's own opacity. Read with postcss,
 *    never grep, and with a positive control that plants the retired shape.
 *
 *  - THE POSTURE. The container cuts CAP the track count on a private channel
 *    instead of replacing the grid, and the cap is floored by
 *    `:not([data-columns='1'])` so a one-stat header is never WIDENED to a
 *    half-measure card beside an empty track. The attribute half of that pair
 *    is proved by rendering, because whether the engine stamps it is a DOM
 *    question and `getComputedStyle` is monkey-patched in this lane.
 */

import { readFileSync } from 'node:fs';

import React from 'react';
import postcss, { type Root } from 'postcss';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { StatsHeader } from '..';
import type { StatItem } from '../contracts';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const SKIN = '../../../../../foundation/tokens/css/presentation/components/skin/stats-header.css';
const KEYFRAMES =
  '../../../../../foundation/tokens/css/presentation/components/skin/stats-header-keyframes.css';

function parseSkin(path: string): Root {
  return postcss.parse(readFileSync(new URL(path, import.meta.url), 'utf8'), { from: path });
}

/** Every opacity value inside the named keyframes block, in frame order. */
function pingOpacities(root: Root): string[] {
  const values: string[] = [];
  root.walkAtRules('keyframes', (at) => {
    if (at.params !== 'pulse-dot-ping') return;
    at.walkDecls('opacity', (decl) => values.push(decl.value));
  });
  return values;
}

/** The claim under test: no frame states an opacity the dot did not author. */
function isSeriesRelative(values: string[]): boolean {
  return (
    values.length > 0 &&
    values.every((value) => value.includes('--_ds-stats-header-spark-dot-opacity'))
  );
}

function statsOf(count: number): StatItem[] {
  return Array.from({ length: count }, (_, index) => ({
    key: `stat-${index}`,
    label: `Stat ${index}`,
    value: 1000 + index,
    accentColor: 'primary' as const,
    sparkDots: [30, 45, 60, 40, 80, 70, 95],
  }));
}

describe('StatsHeader elevation', () => {
  it('pings the sparkline RELATIVE to each dot, so hover cannot flatten the series', () => {
    const values = pingOpacities(parseSkin(KEYFRAMES));

    expect(values).toHaveLength(3);
    expect(isSeriesRelative(values)).toBe(true);
    // The dip is still a dip: the middle frame multiplies the dot down.
    expect(values[1]).toContain('* 0.4');
    // Rest is rest: the first and last frames restore the authored value
    // exactly, which is what makes `animation-fill-mode: both` harmless.
    expect(values[0]).toBe(values[2]);

    // POSITIVE CONTROL — the matcher must reject the retired shape. A reader
    // that only ever returns "fine" has never demonstrated it can fail.
    expect(isSeriesRelative(['1', '0.4', '1'])).toBe(false);
    expect(isSeriesRelative([])).toBe(false);
  });

  it('caps the track count on a private channel, floored so one stat is never widened', () => {
    const root = parseSkin(SKIN);

    const gridTracks: string[] = [];
    root.walkRules((rule) => {
      if (!rule.selector.includes("[data-part='card-grid']")) return;
      rule.walkDecls('grid-template-columns', (decl) => gridTracks.push(decl.value));
    });
    // ONE grid declaration in the whole file: the cuts write the channel it
    // reads rather than restating the grid at a higher specificity.
    expect(gridTracks).toHaveLength(1);
    expect(gridTracks[0]).toContain('--_ds-stats-header-track-count');
    expect(gridTracks[0]).toContain('--ds-stats-header-columns');

    const caps: { params: string; selector: string; value: string }[] = [];
    root.walkAtRules('container', (at) => {
      at.walkDecls('--_ds-stats-header-track-count', (decl) => {
        caps.push({
          params: at.params,
          selector: (decl.parent as { selector: string }).selector,
          value: decl.value,
        });
      });
    });
    expect(caps.map((cap) => cap.value)).toEqual(['2', '1']);
    for (const cap of caps) {
      expect(cap.params).toContain('ds-stats-header');
      expect(cap.selector).toContain(":not([data-columns='1'])");
    }
  });

  it('answers its own measure and never the viewport', () => {
    const root = parseSkin(SKIN);

    let containerDecl = '';
    root.walkRules((rule) => {
      if (rule.selector !== ".ds-stats-header[data-part='root']") return;
      rule.walkDecls(/^container/, (decl) => {
        containerDecl = `${decl.prop}:${decl.value}`;
      });
    });
    expect(containerDecl).toContain('inline-size');

    const viewportQueries: string[] = [];
    root.walkAtRules('media', (at) => {
      if (/min-width|max-width/.test(at.params)) viewportQueries.push(at.params);
    });
    expect(viewportQueries).toEqual([]);
  });

  it('stamps the column count the cap selects on, matching the channel the grid reads', async () => {
    for (const count of [1, 3, 6]) {
      const { container, unmount } = renderSurface(<StatsHeader stats={statsOf(count)} />);
      await screen.findByText('Stat 0');

      const roots = container.querySelectorAll<HTMLElement>('.ds-stats-header[data-part="root"]');
      expect(roots).toHaveLength(1);

      const expected = String(Math.max(Math.min(count, 4), 1));
      expect(roots[0].getAttribute('data-columns')).toBe(expected);
      // The attribute and the channel must never disagree: the grid reads one
      // and the cap selects on the other.
      expect(roots[0].style.getPropertyValue('--ds-stats-header-columns')).toBe(expected);

      unmount();
    }
  });
});
