/**
 * @fileoverview Density-mode tests for the MetricsCards structure.
 *
 * Proves the `density` prop resolves the two design-language §3 presets:
 * the metric-card panel emits `--ds-density-card-padding`, carrying the
 * comfortable (`1rem`, preset `md`) vs compact (`0.75rem`, preset `sm`) value.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { MetricsCards } from '../cards';
import type { KeyMetric } from '../../types';
import { renderSurface } from '../../../../../surfaces/foundation/common/test-utils';

const StubIcon = (props: Record<string, unknown>) => <svg {...props} />;

const METRICS: KeyMetric[] = [
  { label: 'Open roles', value: '42', change: '+3', positive: true, icon: StubIcon },
  { label: 'Time to hire', value: '18', change: '-2', positive: false, icon: StubIcon },
];

async function renderPanel(density: 'comfortable' | 'compact'): Promise<HTMLElement> {
  const { container } = renderSurface(<MetricsCards metrics={METRICS} density={density} />);
  await screen.findByText('Key Metrics');
  const panel = container.querySelector('[style*="--ds-density-card-padding"]') as HTMLElement | null;
  if (!panel) throw new Error('metric panel not found');
  return panel;
}

describe('MetricsCards density', () => {
  it('emits the comfortable card-padding preset (1rem)', async () => {
    const panel = await renderPanel('comfortable');
    const cardPadding = panel.style.getPropertyValue('--ds-density-card-padding');
    expect(cardPadding).toContain('1rem');
    expect(cardPadding).not.toContain('0.75rem');
    expect(panel.style.getPropertyValue('--ds-density-scale')).toBe('0.98');
  });

  it('emits the compact card-padding preset (0.75rem)', async () => {
    const panel = await renderPanel('compact');
    expect(panel.style.getPropertyValue('--ds-density-card-padding')).toContain('0.75rem');
    expect(panel.style.getPropertyValue('--ds-density-scale')).toBe('0.9');
  });

  it('defaults to the comfortable preset when density is omitted', async () => {
    const { container } = renderSurface(<MetricsCards metrics={METRICS} />);
    await screen.findByText('Key Metrics');
    const panel = container.querySelector('[style*="--ds-density-card-padding"]') as HTMLElement;
    expect(panel.style.getPropertyValue('--ds-density-card-padding')).toContain('1rem');
  });
});
