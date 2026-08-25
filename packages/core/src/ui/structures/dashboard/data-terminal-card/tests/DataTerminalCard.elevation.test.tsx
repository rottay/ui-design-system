/**
 * @fileoverview DataTerminalCard elevation contract (WO-CRA-23 dashboard lane).
 *
 * THE DEFECT. The hero value is a single unbreakable mono token sized from a
 * fixed multiple of `--ds-font-size-6xl` (56px to 68px at the shipped ladder),
 * inside a root that declares `overflow: hidden`. Once the tile was narrower
 * than the type demanded, the number was simply CUT — symmetrically on both
 * sides in variants 2 and 4, whose value section centres. Nothing else about
 * the render degraded: the frame, the terminal chrome, the brackets, the
 * traces and the texture all stayed correct, and only the datum went missing.
 * A defect that leaves the thing recognisable is the one that survives review.
 *
 * The repair is a `min()` cap against the tile's own measure, so it is inert
 * at the widths each variant was drawn for and continuous below them — no
 * breakpoint, therefore no width at which the figure is momentarily wrong.
 *
 * The CSS side is parsed (never grepped) with a positive control; the DOM side
 * is rendered, because whether a variant emits the part is a DOM question and
 * `getComputedStyle` is monkey-patched in this lane.
 */

import { readFileSync } from 'node:fs';

import React from 'react';
import postcss, { type Root } from 'postcss';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { DataTerminalCard, DataTerminalStat } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const SKIN = '../../../../../foundation/tokens/css/presentation/components/skin/data-terminal-card.css';

const ENGINES = ['classic', 'modern', 'rustic'] as const;

const StubIcon = (props: Record<string, unknown>) => <svg {...props} />;

function parseSkin(): Root {
  return postcss.parse(readFileSync(new URL(SKIN, import.meta.url), 'utf8'), { from: SKIN });
}

/** Every `font-size` declared on a rule that targets the hero value. */
function heroFontSizes(root: Root): string[] {
  const values: string[] = [];
  root.walkRules((rule) => {
    if (!rule.selector.includes("[data-part='value']")) return;
    rule.walkDecls('font-size', (decl) => {
      values.push(decl.value);
    });
  });
  return values;
}

/** The claim under test: the figure is bounded by the tile, not by the ladder
 *  alone. `min()` against a container-relative cap, with the ladder term kept. */
function isTileBounded(value: string): boolean {
  return value.startsWith('min(') && value.includes('cqi') && value.includes('--ds-font-size-');
}

describe('DataTerminalCard elevation', () => {
  it('bounds every hero figure by the tile it sits in', () => {
    const sizes = heroFontSizes(parseSkin());

    // Four card variants plus the stat: every one of them, or the fix has a
    // hole exactly where the variant nobody checked lives.
    expect(sizes).toHaveLength(5);
    for (const size of sizes) expect(isTileBounded(size)).toBe(true);

    // The per-variant hierarchy survives the cap: the ladder multiples are
    // untouched, so at design widths the render is byte-identical.
    expect(sizes.filter((size) => size.includes('1.166667'))).toHaveLength(3);
    expect(sizes.some((size) => size.includes('1.333333'))).toBe(true);
    expect(sizes.some((size) => size.includes('1.416667'))).toBe(true);

    // POSITIVE CONTROL — the matcher must reject the retired shape and a cap
    // that lost its ladder term. A reader that only returns "fine" has never
    // demonstrated it can fail.
    expect(isTileBounded('calc(var(--ds-font-size-6xl) * 1.416667)')).toBe(false);
    expect(isTileBounded('min(68px, 18cqi)')).toBe(false);
  });

  it('makes both roots their own container and never asks the viewport', () => {
    const root = parseSkin();

    const containers: string[] = [];
    root.walkRules((rule) => {
      if (!rule.selector.includes("[data-part='root']")) return;
      rule.walkDecls(/^container/, (decl) => {
        containers.push(decl.value);
      });
    });
    expect(containers).toHaveLength(2);
    for (const value of containers) expect(value).toContain('inline-size');
    expect(containers.some((value) => value.includes('ds-data-terminal-card'))).toBe(true);
    expect(containers.some((value) => value.includes('ds-data-terminal-stat'))).toBe(true);

    const cuts: string[] = [];
    root.walkAtRules('container', (at) => {
      cuts.push(at.params);
    });
    expect(cuts.length).toBeGreaterThan(0);
    for (const cut of cuts) expect(cut).toContain('ds-data-terminal-card');

    const viewportQueries: string[] = [];
    root.walkAtRules('media', (at) => {
      if (/min-width|max-width/.test(at.params)) viewportQueries.push(at.params);
    });
    expect(viewportQueries).toEqual([]);
  });

  it('folds the three-across readout to two tracks inside its own narrow cut', () => {
    const root = parseSkin();

    const folded: string[] = [];
    root.walkAtRules('container', (at) => {
      at.walkDecls('grid-template-columns', (decl) => {
        folded.push(decl.value);
      });
    });
    expect(folded.length).toBeGreaterThan(0);
    for (const value of folded) expect(value).toContain('repeat(2,');

    // The base grid is still the three-across one it was designed as.
    const base: string[] = [];
    root.walkRules((rule) => {
      if (!rule.selector.includes("[data-part='stats-grid']")) return;
      rule.walkDecls('grid-template-columns', (decl) => {
        base.push(decl.value);
      });
    });
    expect(base.some((value) => value.includes('repeat(3,'))).toBe(true);
  });

  it.each([1, 2, 3, 4] as const)('renders variant %i under every engine, with the cap live where the block is', async (variant) => {
    for (const engine of ENGINES) {
      const { container, unmount } = renderSurface(
        <DataTerminalCard
          variant={variant}
          label="Active pipelines"
          value={128450}
          change="+12.4%"
          trend="up"
          icon={StubIcon}
          path="/dashboard"
          progress={64}
        />,
        { engine },
      );
      await screen.findByText('128,450');

      const roots = container.querySelectorAll('.ds-data-terminal-card[data-part="root"]');
      expect(roots, engine).toHaveLength(1);
      expect(roots[0].getAttribute('data-variant'), engine).toBe(String(variant));

      // CI-1 re-pin (2026-08-18, dcc65ca34d "checkpoint del manifiesto de
      // variables y gates asociados"): the Typography engines' `data-part`
      // fallback (`data-part={dataPart ?? "root"}`) now ships on all three
      // engines (Typography/engines/{classic,modern,rustic}/index.tsx), so a
      // caller's `data-part` is forwarded under every engine, not only
      // modern. Measured directly with an isolated per-engine probe (not
      // inferred from the source grep alone, and not from this very loop's
      // own first pass -- `expect()` throwing on the first failing engine
      // silently skips the remaining engines in the same `it.each` variant,
      // which is why the pre-fix failure only ever NAMED "classic" even
      // though rustic's own expectation was equally stale): heroParts=1 for
      // classic, modern AND rustic alike, uniformly.
      const heroParts = container.querySelectorAll('[data-part="value"]').length;
      expect(heroParts, engine).toBe(1);

      unmount();
    }
  });

  it('renders the stat with the second capped hero figure', async () => {
    const { container } = renderSurface(
      <DataTerminalStat label="Throughput" value={98210} change="-2.1%" trend="down" icon={StubIcon} progress={41} />,
      { engine: 'modern' },
    );
    await screen.findByText('98,210');

    expect(container.querySelectorAll('.ds-data-terminal-stat[data-part="root"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-part="value"]')).toHaveLength(1);
  });
});
