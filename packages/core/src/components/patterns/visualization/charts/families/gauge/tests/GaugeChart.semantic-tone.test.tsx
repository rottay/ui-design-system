import React from 'react';
import { describe, expect, it } from 'vitest';

import { GaugeChart } from '..';
import {
  requireChartSemanticPaint,
  resolveChartPaint,
} from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const TONES = requireChartSemanticPaint(resolveChartPaint({ family: 'gauge' }));

function renderGauge(props: Record<string, unknown> = {}) {
  return renderSurface(
    <GaugeChart value={50} width={400} height={260} responsive={false} animate={false} legend {...props} />,
  );
}

function needleMarks(container: HTMLElement): Element[] {
  return [
    ...container.querySelectorAll('[data-part="needle-mark"], [data-part="needle-cap"]'),
  ];
}

describe('GaugeChart semantic tones', () => {
  it('paints its default zones by meaning, in the order the family stamps them', () => {
    const { container } = renderGauge();

    const stamped = [...container.querySelectorAll('[data-part="segment"]')]
      .map((segment) => segment.getAttribute('data-tone'));
    expect(stamped).toEqual(['error', 'warning', 'success']);
    // The stamped order is a prefix of the declared domain, so a tone the
    // family paints can never be one the resolver does not declare.
    expect(TONES.tones.slice(0, stamped.length)).toEqual(stamped);

    const swatches = [...container.querySelectorAll('[data-part="legend-swatch"]')];
    expect(swatches.map((swatch) => swatch.getAttribute('data-tone'))).toEqual(stamped);
    for (const swatch of swatches) {
      expect(swatch).toHaveAttribute('data-color-source', 'default');
    }
  });

  it('reads the needle through the tone chain, and a caller colour still wins', () => {
    const { container } = renderGauge();
    const governed = needleMarks(container);
    expect(governed.length).toBeGreaterThan(0);
    for (const mark of governed) {
      expect(mark.getAttribute('fill')).toBe(TONES.toneFor('needle'));
    }

    const { container: authored } = renderGauge({ needleColor: '#aa00cc' });
    for (const mark of needleMarks(authored)) {
      expect(mark.getAttribute('fill')).toBe('#aa00cc');
    }
  });

  it('keeps caller-authored segments on their own paint', () => {
    const { container } = renderGauge({
      segments: [
        { from: 0, to: 50, color: '#112233', label: 'Low' },
        { from: 50, to: 100, color: '#445566', label: 'High' },
      ],
    });

    const segments = [...container.querySelectorAll('[data-part="segment"]')];
    expect(segments.map((segment) => segment.getAttribute('data-color-source')))
      .toEqual(['custom', 'custom']);
    expect(segments.map((segment) => segment.getAttribute('fill')))
      .toEqual(['#112233', '#445566']);
  });

  it('never borrows a categorical slot: a scheme switch leaves the tones alone', () => {
    for (const scheme of ['accessible', 'monochrome', 'vibrant'] as const) {
      const decision = resolveChartPaint({ family: 'gauge', scheme });
      expect(decision.categorical, scheme).toBeNull();
      expect(requireChartSemanticPaint(decision).toneFor('error'), scheme)
        .toBe(TONES.toneFor('error'));
    }
  });

  it('refuses a tone outside the declared domain', () => {
    expect(() => TONES.toneFor('primary')).toThrow(/outside the domain/u);
  });
});
