import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  AreaChart,
  BarChart,
  ChartTooltip,
  LineChart,
  ScatterChart,
  type ChartTooltipVariant,
} from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const TOOLTIP_VARIANTS: ChartTooltipVariant[] = ['minimal', 'detailed', 'glass'];
const CHART_FOUNDATION_SKIN = readFileSync(
  join(__dirname, '../../../../../tokens/css/components/skin/chart-foundation.css'),
  'utf8',
);

describe('chart tooltip personality', () => {
  it('exposes and paints every supported treatment through a stable variant contract', () => {
    const style = document.createElement('style');
    style.textContent = CHART_FOUNDATION_SKIN;
    document.head.appendChild(style);

    const { container } = render(
      <div>
        {TOOLTIP_VARIANTS.map((variant) => (
          <ChartTooltip key={variant} visible x={0} y={0} variant={variant}>
            {variant}
          </ChartTooltip>
        ))}
      </div>,
    );

    const tooltips = [...container.querySelectorAll<HTMLElement>('[data-part="chart-tooltip"]')];
    expect(tooltips).toHaveLength(3);

    for (const [index, variant] of TOOLTIP_VARIANTS.entries()) {
      expect(tooltips[index]).toHaveAttribute('data-variant', variant);
      expect(tooltips[index]).toHaveClass(`ds-chart-tooltip--${variant}`);
    }

    expect(window.getComputedStyle(tooltips[0]!).getPropertyValue('padding').trim()).toBe('4px 8px');
    expect(window.getComputedStyle(tooltips[0]!).getPropertyValue('max-width').trim()).toBe('220px');
    expect(window.getComputedStyle(tooltips[1]!).getPropertyValue('padding').trim()).toBe('8px 12px');
    expect(window.getComputedStyle(tooltips[2]!).getPropertyValue('max-width').trim()).toBe('300px');

    style.remove();
  });

  it('carries the provider-resolved tooltip personality through the four interactive chart families', () => {
    const { container } = renderSurface(
      <>
        <BarChart
          width={320}
          height={180}
          responsive={false}
          data={[{ label: 'Open', value: 12 }]}
        />
        <LineChart
          width={320}
          height={180}
          responsive={false}
          series={[{ name: 'Open', data: [{ x: 'Mon', y: 12 }] }]}
        />
        <AreaChart
          width={320}
          height={180}
          responsive={false}
          series={[{ name: 'Open', data: [{ x: 'Mon', y: 12 }] }]}
        />
        <ScatterChart
          width={320}
          height={180}
          responsive={false}
          data={[{ x: 1, y: 12 }]}
        />
      </>,
      { productProfile: 'events.organizer' },
    );

    const tooltips = [...container.querySelectorAll<HTMLElement>('[data-part="chart-tooltip"]')];
    expect(tooltips).toHaveLength(4);
    for (const tooltip of tooltips) {
      expect(tooltip).toHaveAttribute('data-variant', 'glass');
      expect(tooltip).toHaveClass('ds-chart-tooltip--glass');
    }
  });
});
