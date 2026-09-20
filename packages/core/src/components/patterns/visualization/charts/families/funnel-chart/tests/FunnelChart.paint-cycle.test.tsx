import React from 'react';
import { describe, expect, it } from 'vitest';

import { FunnelChart } from '..';
import { resolveChartSeriesPaint } from '../../../runtime/chart-engine/foundation/grammar/palette';
import { CHART_CATEGORICAL_SIZE } from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const PALETTE = resolveChartSeriesPaint('default');

const STAGES = Array.from({ length: 13 }, (_, index) => ({
  label: `Stage ${index}`,
  value: 120 - index * 8,
}));

const LONG_OVERRIDE = Array.from(
  { length: 13 },
  (_, index) => `#${String(index + 10).repeat(3)}`,
);

function fillsOf(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll('[data-part="segment"]')]
    .map((mark) => mark.getAttribute('fill'));
}

describe('FunnelChart categorical paint', () => {
  it('cycles the resolved palette in stage order and wraps at the categorical size', () => {
    const { container } = renderSurface(
      <FunnelChart data={STAGES} width={480} height={420} responsive={false} animate={false} />,
    );

    expect(fillsOf(container)).toEqual(
      STAGES.map((_, index) => PALETTE[index % CHART_CATEGORICAL_SIZE]),
    );
  });

  it('lets a declared stage colour win over the cycle', () => {
    const data = STAGES.map((stage, index) => (
      index === 2 ? { ...stage, color: '#abcdef' } : stage
    ));
    const { container } = renderSurface(
      <FunnelChart data={data} width={480} height={420} responsive={false} animate={false} />,
    );

    expect(fillsOf(container)[2]).toBe('#abcdef');
    expect(fillsOf(container)[3]).toBe(PALETTE[3]);
  });

  // A caller palette cycles at its own length, so an override longer than the
  // categorical size paints more than CHART_CATEGORICAL_SIZE distinct stages.
  it('honours a caller palette longer than the categorical size', () => {
    const { container } = renderSurface(
      <FunnelChart
        data={STAGES}
        colors={[...LONG_OVERRIDE]}
        width={480}
        height={420}
        responsive={false}
        animate={false}
      />,
    );

    expect(fillsOf(container)).toEqual(LONG_OVERRIDE);
    expect(new Set(fillsOf(container)).size).toBeGreaterThan(CHART_CATEGORICAL_SIZE);
  });
});
