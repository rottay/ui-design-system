import React from 'react';
import { describe, expect, it } from 'vitest';

import { TreeMap } from '..';
import { resolveChartSeriesPaint } from '../../../runtime/chart-engine/foundation/grammar/palette';
import { CHART_CATEGORICAL_SIZE } from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const PALETTE = resolveChartSeriesPaint('accessible');

const LEAVES = Array.from({ length: 12 }, (_, index) => ({
  name: `Leaf ${index}`,
  value: 240 - index * 10,
}));

const LONG_OVERRIDE = Array.from(
  { length: 12 },
  (_, index) => `#${String(index + 10).repeat(3)}`,
);

function fillsOf(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll('[data-part="tile-surface"]')]
    .map((mark) => mark.getAttribute('fill'));
}

describe('TreeMap categorical paint', () => {
  it('cycles the resolved palette in tile order and wraps at the categorical size', () => {
    const { container } = renderSurface(
      <TreeMap data={LEAVES} width={640} height={480} responsive={false} animate={false} />,
    );

    expect(fillsOf(container)).toEqual(
      LEAVES.map((_, index) => PALETTE[index % CHART_CATEGORICAL_SIZE]),
    );
  });

  // A caller palette cycles at its own length, so an override longer than the
  // categorical size paints more than CHART_CATEGORICAL_SIZE distinct tiles.
  it('honours a caller palette longer than the categorical size', () => {
    const { container } = renderSurface(
      <TreeMap
        data={LEAVES}
        colors={[...LONG_OVERRIDE]}
        width={640}
        height={480}
        responsive={false}
        animate={false}
      />,
    );

    expect(fillsOf(container)).toEqual(LONG_OVERRIDE);
    expect(new Set(fillsOf(container)).size).toBeGreaterThan(CHART_CATEGORICAL_SIZE);
  });
});
