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
 * THE TWO PRIMITIVE GAPS THIS LANE MEASURED, both pinned below so the next
 * lane inherits the evidence instead of re-deriving it:
 *
 *  1. `Text` DROPS an inline `fontSize` whose value is a `var()` string — all
 *     three engines. `metrics-cards` already ships
 *     `fontSize: 'var(--_ds-metric-value-size, 28px)'`, so its hero figure has
 *     never rendered at 28px; it renders at inherited body size. This is why
 *     the rows/minimal figures stay plain numbers: channelizing them would
 *     not have made them retunable, it would have deleted them.
 *  2. `Text` drops a caller `data-part` under classic and rustic (modern
 *     forwards it), so every `Text`-borne part rule in these skins — the
 *     caption truncation included — is live under modern only.
 *
 * Both are `Text` contract defects, not family defects, and a family lane does
 * not ship a primitive change. When either is repaired the matching assertion
 * here fails ON PURPOSE, and its message says what to do next.
 *
 * CSS claims are parsed (never grepped) and carry a positive control. DOM
 * claims are rendered across all three engines, because `getComputedStyle` is
 * monkey-patched in this lane and cannot adjudicate anything.
 */

import { readFileSync } from 'node:fs';

import React from 'react';
import postcss, { type Root } from 'postcss';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { MetricsCards } from '../cards';
import { MetricsMinimal } from '../minimal';
import { MetricsRows } from '../rows';
import type { KeyMetric } from '../../../foundation/contracts';
import { Text } from '../../../../../../primitives';
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
    rule.walkDecls(prop, (decl) => values.push(decl.value));
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
    root.walkAtRules('container', (at) => cuts.push(at.params));
    expect(cuts.length).toBeGreaterThan(0);
    for (const cut of cuts) expect(cut).toContain(scope);

    const viewportQueries: string[] = [];
    root.walkAtRules('media', (at) => {
      if (/min-width|max-width/.test(at.params)) viewportQueries.push(at.params);
    });
    expect(viewportQueries).toEqual([]);
  });

  it.each(LEAVES)('$name writes nothing from a cut that cannot be read', ({ file }) => {
    const root = parseSkin(file);

    // The figure channel is unreachable through `Text` (see the file header),
    // so no cut may write it. A declaration that reads as done and paints
    // nothing is worse than an honest gap, and it would flip live unreviewed
    // the day the primitive is repaired.
    const writes: string[] = [];
    root.walkAtRules('container', (at) => {
      at.walkDecls('--_ds-metric-value-size', (decl) => writes.push(decl.value));
    });
    expect(writes).toEqual([]);
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

  it.each(ENGINES)('keeps the figure a plain number, because Text cannot carry a var() size under %s', async (engine) => {
    // The probe IS the claim: an arbitrary `var()` font-size must survive Text
    // before any metrics figure may be channelized.
    const { container, unmount } = renderSurface(
      <Text className="wo-cra-23-probe" style={{ fontSize: 'var(--_ds-probe-size, 28px)', fontWeight: 800 }}>
        probe
      </Text>,
      { engine },
    );
    await screen.findByText('probe');
    const probe = container.querySelector<HTMLElement>('.wo-cra-23-probe');
    const style = probe?.getAttribute('style') ?? '';

    // Control: a sibling declaration on the SAME element does survive, so a
    // missing font-size is Text dropping it and not the probe failing to run.
    expect(style).toContain('font-weight');
    expect(
      style.includes('font-size'),
      'Text now carries a var() font-size: the metrics figures can be channelized and the ' +
        'narrow cuts can step them. Re-open the --_ds-metric-value-size wiring in all three leaves.',
    ).toBe(false);

    unmount();
  });

  it('reports the metrics-cards figure channel as authored but unreachable', async () => {
    // Not a defect this lane repairs — repairing it changes the KPI hierarchy
    // on three shipped dashboards and belongs to the sighted pass. Pinned so
    // the finding is inherited rather than rediscovered.
    const { container } = renderSurface(<MetricsCards metrics={METRICS} />, { engine: 'modern' });
    await screen.findByText('Open roles');

    const figure = container.querySelector<HTMLElement>('.metric-value-v3');
    expect(figure).not.toBeNull();
    expect(
      (figure?.getAttribute('style') ?? '').includes('font-size'),
      'MetricsCards now renders a font-size: the authored --_ds-metric-value-size channel is live. ' +
        'Confirm the hero figure landed at 28px and retire this pin.',
    ).toBe(false);
  });
});
