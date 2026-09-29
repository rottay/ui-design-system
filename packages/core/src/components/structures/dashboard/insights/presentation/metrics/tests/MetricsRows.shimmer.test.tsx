/**
 * @fileoverview MetricsRows shimmer rest posture.
 *
 * The sweep rests at its keyframe start (`left: -100%`), one row width past
 * the inline-start edge, clipped by the row. At rest it must be neither a
 * painted box nor an accessibility node; only the hover sweep shows it.
 */

import { readFileSync } from 'node:fs';

import React from 'react';
import postcss, { type AtRule, type Root } from 'postcss';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { MetricsRows } from '../rows';
import type { KeyMetric } from '../../../foundation/contracts';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const SKIN_PATH =
  '../../../../../../../foundation/tokens/css/presentation/components/skin/metrics-rows/index.css';

const ENGINES = ['classic', 'modern', 'rustic'] as const;

const StubIcon = (props: Record<string, unknown>) => <svg {...props} />;

const METRICS: KeyMetric[] = [
  { label: 'Open roles', value: '42', change: '+3', positive: true, icon: StubIcon },
  { label: 'Time to hire', value: '18d', change: '-2', positive: false, icon: StubIcon },
];

function parseSkin(): Root {
  return postcss.parse(readFileSync(new URL(SKIN_PATH, import.meta.url), 'utf8'), { from: SKIN_PATH });
}

function mediaOf(node: postcss.Node): string[] {
  const media: string[] = [];
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && (parent as AtRule).name === 'media') media.push((parent as AtRule).params);
  }
  return media;
}

function shimmerVisibility(root: Root): { selector: string; value: string; media: string[] }[] {
  const found: { selector: string; value: string; media: string[] }[] = [];
  root.walkRules((rule) => {
    if (!rule.selector.includes("[data-part='shimmer']")) return;
    rule.walkDecls('visibility', (decl) => {
      found.push({ selector: rule.selector, value: decl.value, media: mediaOf(rule) });
    });
  });
  return found;
}

describe('MetricsRows shimmer rest posture', () => {
  it.each(ENGINES)('%s marks every shimmer as decorative', async (engine) => {
    const { container, unmount } = renderSurface(<MetricsRows metrics={METRICS} />, { engine });
    await screen.findByText('Open roles');
    const shimmers = container.querySelectorAll('[data-part="shimmer"]');
    expect(shimmers).toHaveLength(METRICS.length);
    for (const shimmer of shimmers) expect(shimmer.getAttribute('aria-hidden')).toBe('true');
    unmount();
  });

  it('hides the parked sweep at rest and shows it only for the hover sweep with motion allowed', () => {
    const rules = shimmerVisibility(parseSkin());

    const rest = rules.filter((rule) => rule.media.length === 0 && !rule.selector.includes(':hover'));
    expect(rest.map((rule) => rule.value)).toEqual(['hidden']);

    const sweep = rules.filter((rule) => rule.value === 'visible');
    expect(sweep).toHaveLength(1);
    expect(sweep[0].selector).toContain(':hover');
    expect(sweep[0].media.join(' ')).toMatch(/hover:\s*hover/);
    expect(sweep[0].media.join(' ')).toMatch(/prefers-reduced-motion:\s*no-preference/);

    expect(shimmerVisibility(postcss.parse('.x [data-part=\'other\'] { visibility: hidden }'))).toEqual([]);
  });

  it('keeps the contract-pinned rest geometry (the keyframe start)', () => {
    const root = parseSkin();
    const left: string[] = [];
    root.walkRules((rule) => {
      if (rule.selector.includes("[data-part='shimmer']") && mediaOf(rule).length === 0) {
        rule.walkDecls('left', (decl) => {
          left.push(decl.value);
        });
      }
    });
    expect(left).toEqual(['-100%']);
  });
});
