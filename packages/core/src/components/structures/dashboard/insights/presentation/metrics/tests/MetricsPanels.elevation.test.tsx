/**
 * @fileoverview Metrics panel elevation contract (WO-CRA-23 dashboard lane).
 *
 * `insights` is a GROUP; its metrics leaves are the families, and each owns a
 * skin. The three share one anatomy, so they are proved together against a
 * per-leaf table rather than in three near-identical files.
 *
 * THE DEFECT, and it is one defect wearing two faces. The panel header and
 * the row are flex clusters, and the icon wells inside them declared a square
 * measure but not their SHAPE: with no `flex-shrink: 0` a narrow panel — or
 * merely a long title — squeezed a 32px/40px square into an oval that kept
 * its border, its background and its glyph. `metrics-minimal` already pinned
 * its row well and `metrics-rows` did not, so the same anatomy squashed in one
 * variant and held in its sibling: an asymmetry between two files, which is
 * why nobody reading either file alone could see it.
 *
 * THE POSTURE. Every leaf is now its own inline-size container and the narrow
 * cut spends the measure differently rather than compressing.
 *
 * TWO ENVIRONMENT/PRIMITIVE FACTS THIS LANE MEASURED, pinned below so the next
 * lane inherits the evidence instead of re-deriving it:
 *
 *  1. THE TEST DOM, NOT THE COMPONENT. happy-dom silently drops an inline
 *     style value containing a comma-SPACE inside a CSS function —
 *     `var(--x, 28px)`, `clamp(a, b, c)`, `min(a, b)`, `calc(var(--x) * 2)` —
 *     on every property it validates, while keeping the byte-identical
 *     `var(--x,28px)`. A bare `document.createElement('span')` with no React
 *     and no design system reproduces it. So an inline figure size CANNOT be
 *     read back from a rendered node here; it is asserted from the engine
 *     source and from the skin instead. An earlier version of this file
 *     claimed `Text` dropped the value and that `metrics-cards` had never
 *     painted its 28px hero — both were artefacts of this shim and are
 *     withdrawn.
 *  2. `Text` drops a caller `data-part` under classic and rustic (modern
 *     forwards it), so every `Text`-borne part rule in these skins — the
 *     caption truncation included — is live under modern only. That one is
 *     about ATTRIBUTES, which the shim renders faithfully, and it stands.
 *
 * (2) is a `Text` contract question, not a family defect, and a family lane
 * does not ship a primitive change.
 *
 * CSS claims are parsed (never grepped) and carry a positive control. DOM
 * claims are rendered across all three engines, because `getComputedStyle` is
 * monkey-patched in this lane and cannot adjudicate anything.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import postcss, { type Root } from 'postcss';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { MetricsCards } from '../cards';
import { MetricsMinimal } from '../minimal';
import { MetricsRows } from '../rows';
import type { KeyMetric } from '../../../foundation/contracts';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const SKIN_DIR = '../../../../../../../foundation/tokens/css/presentation/components/skin/';

const ENGINES = ['classic', 'modern', 'rustic'] as const;

const StubIcon = (props: Record<string, unknown>) => <svg {...props} />;

const METRICS: KeyMetric[] = [
  { label: 'Open roles', value: '42', change: '+3', positive: true, icon: StubIcon },
  {
    label: 'Median time to first recruiter response',
    value: '18',
    change: '-2',
    positive: false,
    icon: StubIcon,
  },
];

const LEAVES = [
  { name: 'metrics-cards', scope: 'ds-metrics-cards', file: 'metrics-cards.css', Component: MetricsCards },
  { name: 'metrics-rows', scope: 'ds-metrics-rows', file: 'metrics-rows.css', Component: MetricsRows },
  { name: 'metrics-minimal', scope: 'ds-metrics-minimal', file: 'metrics-minimal.css', Component: MetricsMinimal },
] as const;

/** The two leaves whose caption shares a line with the figure. Cards is
 *  excluded on purpose: its eyebrow is a deliberate two-line clamp that keeps
 *  values optically aligned across a row of cards (K-7). */
const TRUNCATING_LEAVES = ['metrics-rows.css', 'metrics-minimal.css'] as const;

function parseSkin(file: string): Root {
  const path = `${SKIN_DIR}${file}`;
  return postcss.parse(readFileSync(new URL(path, import.meta.url), 'utf8'), { from: path });
}

/** Declarations of `prop` on rules whose selector names `part`. */
function declarationsFor(root: Root, part: string, prop: string): string[] {
  const values: string[] = [];
  root.walkRules((rule) => {
    if (!rule.selector.includes(`[data-part='${part}']`)) return;
    rule.walkDecls(prop, (decl) => {
      values.push(decl.value);
    });
  });
  return values;
}

describe('metrics panel elevation', () => {
  it.each(LEAVES)('$name pins its icon wells against flex squash', ({ file }) => {
    const root = parseSkin(file);

    // The panel well sits beside the title in every leaf.
    expect(declarationsFor(root, 'panel-icon-box', 'flex-shrink')).toContain('0');

    // The row well: only the two row leaves put it under inline pressure, and
    // both must now pin it. Cards stacks it in a column, so it is exempt.
    if (TRUNCATING_LEAVES.includes(file as (typeof TRUNCATING_LEAVES)[number])) {
      expect(declarationsFor(root, 'metric-icon-box', 'flex-shrink')).toContain('0');
    }

    // POSITIVE CONTROL — the reader must come back empty for a part that does
    // not exist, or "found it" proves nothing.
    expect(declarationsFor(root, 'no-such-part', 'flex-shrink')).toEqual([]);
  });

  it.each(LEAVES)('$name answers its own measure and never the viewport', ({ file, scope }) => {
    const root = parseSkin(file);

    let containerValue = '';
    root.walkRules((rule) => {
      if (!rule.selector.includes(`.${scope}`) || !rule.selector.includes("[data-part='root']")) return;
      rule.walkDecls(/^container/, (decl) => {
        containerValue = decl.value;
      });
    });
    expect(containerValue).toContain('inline-size');
    expect(containerValue).toContain(scope);

    const cuts: string[] = [];
    root.walkAtRules('container', (at) => {
      cuts.push(at.params);
    });
    expect(cuts.length).toBeGreaterThan(0);
    for (const cut of cuts) expect(cut).toContain(scope);

    const viewportQueries: string[] = [];
    root.walkAtRules('media', (at) => {
      if (/min-width|max-width/.test(at.params)) viewportQueries.push(at.params);
    });
    expect(viewportQueries).toEqual([]);
  });

  it.each(LEAVES)('$name steps the figure down from inside its own cut', ({ file }) => {
    const root = parseSkin(file);

    const stepped: string[] = [];
    root.walkAtRules('container', (at) => {
      at.walkDecls('--_ds-metric-value-size', (decl) => {
        stepped.push(decl.value);
      });
    });
    expect(stepped).toHaveLength(1);
    // A step DOWN, not merely a step: the narrow posture must not enlarge the
    // figure it is trying to fit.
    expect(Number.parseFloat(stepped[0])).toBeLessThan(28);
  });

  it.each(LEAVES)('$name reads that channel inline, so the cut can reach it', async ({ name, Component }) => {
    // Read from SOURCE, not from a rendered node: the shim drops this exact
    // value shape (see the file header), so the DOM cannot answer here.
    const source = readFileSync(
      resolve(
        process.cwd(),
        `src/components/structures/dashboard/insights/presentation/metrics/${name.replace('metrics-', '')}/index.tsx`,
      ),
      'utf8',
    );
    expect(source).toContain("fontSize: 'var(--_ds-metric-value-size, 28px)'");

    // The element the channel has to land on still has to exist.
    const { container, unmount } = renderSurface(<Component metrics={METRICS} />, { engine: 'modern' });
    await screen.findByText('Open roles');
    expect(container.querySelectorAll('[data-part="metric-value"]')).toHaveLength(METRICS.length);
    unmount();
  });

  it.each(TRUNCATING_LEAVES)('%s truncates the caption so the figure survives the clip', (file) => {
    const root = parseSkin(file);

    expect(declarationsFor(root, 'metric-label', 'text-overflow')).toContain('ellipsis');
    expect(declarationsFor(root, 'metric-label', 'white-space')).toContain('nowrap');
    expect(declarationsFor(root, 'metric-label', 'min-inline-size')).toContain('0');
  });

  it.each(ENGINES)('renders every leaf with reachable Box anatomy under %s', async (engine) => {
    for (const { scope, Component } of LEAVES) {
      const { container, unmount } = renderSurface(<Component metrics={METRICS} />, { engine });
      await screen.findByText('Open roles');

      // These parts sit on `Box`, which forwards them in every engine — which
      // is exactly why the icon-well repair is universal and the caption
      // repair is not.
      expect(container.querySelectorAll(`.${scope}[data-part="root"]`)).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="panel-icon-box"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="metric-row"], [data-part="metric-card"]')).toHaveLength(
        METRICS.length,
      );

      unmount();
    }
  });

  it('pins WHY no test here may read an inline figure size back from the DOM', () => {
    // This is a property of the TEST DOM, not of React, not of `Text` and not
    // of any browser — a bare element with no framework reproduces it. Pinned
    // because a lane that does not know it will read a missing `font-size` as
    // a product defect, which is exactly what happened once.
    const el = document.createElement('span');

    el.style.setProperty('font-size', '28px');
    expect(el.style.getPropertyValue('font-size'), 'a plain length is kept').toBe('28px');

    el.setAttribute('style', '');
    el.style.setProperty('font-size', 'var(--x,28px)');
    expect(el.style.getPropertyValue('font-size'), 'no comma-space: kept').not.toBe('');

    for (const dropped of ['var(--x, 28px)', 'clamp(1rem, 2vw, 2rem)', 'min(28px, 18cqi)']) {
      el.setAttribute('style', '');
      el.style.setProperty('font-size', dropped);
      expect(
        el.style.getPropertyValue('font-size'),
        `the test DOM now keeps ${dropped}: inline figure sizes became readable here, so the ` +
          'metrics tests may assert them against a rendered node instead of against source.',
      ).toBe('');
    }

    // And the rejection is not a reset: the shim leaves whatever was there
    // before, so a probe that does not clear first reads a STALE value and
    // concludes the opposite. That is how this defect first read as real.
    el.setAttribute('style', '');
    el.style.setProperty('font-size', '28px');
    el.style.setProperty('font-size', 'var(--x, 99px)');
    expect(el.style.getPropertyValue('font-size'), 'rejection keeps the prior value').toBe('28px');
  });
});
