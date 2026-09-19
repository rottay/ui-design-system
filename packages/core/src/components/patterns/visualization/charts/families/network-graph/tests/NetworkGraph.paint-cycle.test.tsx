import React from 'react';
import { describe, expect, it } from 'vitest';

import { NetworkGraph } from '..';
import { resolveChartSeriesPaint } from '../../../runtime/chart-engine/foundation/grammar/palette';
import { CHART_CATEGORICAL_SIZE } from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const PALETTE = resolveChartSeriesPaint('accessible');

const NODES = Array.from({ length: 13 }, (_, index) => ({
  id: `service-${index}`,
  label: `Service ${index}`,
  group: `group-${index}`,
}));

const LINKS = NODES.slice(0, -1).map((node, index) => ({
  source: node.id,
  target: `service-${index + 1}`,
}));

const LONG_OVERRIDE = Array.from(
  { length: 13 },
  (_, index) => `#${String(index + 10).repeat(3)}`,
);

function fillsOf(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll('[data-part="node-mark"]')]
    .map((mark) => mark.getAttribute('fill'));
}

describe('NetworkGraph categorical paint', () => {
  it('cycles the resolved palette in group order and wraps at the categorical size', () => {
    const { container } = renderSurface(
      <NetworkGraph
        nodes={NODES}
        links={LINKS}
        width={640}
        height={480}
        responsive={false}
        animate={false}
      />,
    );

    expect(fillsOf(container)).toEqual(
      NODES.map((_, index) => PALETTE[index % CHART_CATEGORICAL_SIZE]),
    );
  });

  it('lets a declared node colour win over the group cycle', () => {
    const nodes = NODES.map((node, index) => (
      index === 2 ? { ...node, color: '#abcdef' } : node
    ));
    const { container } = renderSurface(
      <NetworkGraph
        nodes={nodes}
        links={LINKS}
        width={640}
        height={480}
        responsive={false}
        animate={false}
      />,
    );

    expect(fillsOf(container)[2]).toBe('#abcdef');
    expect(fillsOf(container)[3]).toBe(PALETTE[3]);
  });

  // A caller palette cycles at its own length, so an override longer than the
  // categorical size paints more than CHART_CATEGORICAL_SIZE distinct groups.
  it('honours a caller palette longer than the categorical size', () => {
    const { container } = renderSurface(
      <NetworkGraph
        nodes={NODES}
        links={LINKS}
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
