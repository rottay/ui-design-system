import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { useResolvedChartPersonality } from '../useResolvedChartPersonality';

function ServerChartProbe(): React.ReactElement {
  const chart = useResolvedChartPersonality();
  return <span>{`${chart.lineStyle}:${chart.mountDuration}:${chart.tooltipStyle}`}</span>;
}

describe('useResolvedChartPersonality SSR', () => {
  it('renders the context-safe generic profile without a provider tree', () => {
    expect(renderToString(<ServerChartProbe />)).toBe('<span>sharp:700:detailed</span>');
    expect(renderToString(<ServerChartProbe />)).toBe('<span>sharp:700:detailed</span>');
  });
});
