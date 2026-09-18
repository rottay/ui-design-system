import React from 'react';
import { describe, expect, it } from 'vitest';

import { BulletChart } from '..';
import {
  requireChartSemanticPaint,
  resolveChartPaint,
} from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const TONES = requireChartSemanticPaint(resolveChartPaint({ family: 'bullet' }));

const DATA = { label: 'Revenue', value: 68, target: 80, ranges: [50, 75, 100] as [number, number, number] };

function renderBullet(props: Record<string, unknown> = {}) {
  return renderSurface(
    <BulletChart data={DATA} width={600} height={120} responsive={false} animate={false} legend {...props} />,
  );
}

function bandPaint(container: HTMLElement): Record<string, string | null> {
  const entries = [...container.querySelectorAll('[data-part="range-band"]')]
    .map((band) => [band.getAttribute('data-tier') ?? '', band.getAttribute('fill')] as const);
  return Object.fromEntries(entries);
}

describe('BulletChart semantic tones', () => {
  it('paints each qualitative tier through its own tone chain', () => {
    expect(bandPaint(renderBullet().container)).toEqual({
      poor: TONES.toneFor('poor'),
      satisfactory: TONES.toneFor('satisfactory'),
      good: TONES.toneFor('good'),
    });
  });

  it('paints the value bar and the target marker through their tones', () => {
    const { container } = renderBullet();
    expect(container.querySelector('[data-part="value-bar"]')?.getAttribute('fill'))
      .toBe(TONES.toneFor('value'));
    expect(container.querySelector('[data-part="target-marker"]')?.getAttribute('fill'))
      .toBe(TONES.toneFor('target'));
  });

  it('lets caller colours win over every tone they name', () => {
    const { container } = renderBullet({
      rangeColors: ['#111111', '#222222', '#333333'],
      valueColor: '#444444',
      targetColor: '#555555',
    });
    expect(bandPaint(container)).toEqual({
      poor: '#111111',
      satisfactory: '#222222',
      good: '#333333',
    });
    expect(container.querySelector('[data-part="value-bar"]')?.getAttribute('fill')).toBe('#444444');
    expect(container.querySelector('[data-part="target-marker"]')?.getAttribute('fill')).toBe('#555555');
  });

  it('declares exactly the five tones it paints', () => {
    expect(TONES.tones).toEqual(['poor', 'satisfactory', 'good', 'value', 'target']);
  });

  it('never borrows a categorical slot: a scheme switch leaves the tones alone', () => {
    for (const scheme of ['accessible', 'monochrome', 'vibrant'] as const) {
      const decision = resolveChartPaint({ family: 'bullet', scheme });
      expect(decision.categorical, scheme).toBeNull();
      expect(requireChartSemanticPaint(decision).toneFor('target'), scheme)
        .toBe(TONES.toneFor('target'));
    }
  });
});
