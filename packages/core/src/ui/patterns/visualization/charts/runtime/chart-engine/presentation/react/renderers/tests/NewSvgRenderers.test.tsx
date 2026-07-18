import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { SvgAreaRenderer } from '../area';
import { SvgHistogramRenderer } from '../histogram';
import { SvgWaterfallRenderer } from '../waterfall';
import { SvgSparklineRenderer } from '../sparkline';

function testTenant(): TenantConfig {
  return {
    slug: 'nr1',
    name: 'nr1',
    engine: 'rustic',
    theme: 'light',
    plan: 'enterprise',
    features: ['all'],
    branding: {
      companyName: 'nr1',
      primaryColor: '#0f766e',
      accentColor: '#0f766e',
      darkPrimaryColor: '#93c5fd',
      darkAccentColor: '#5eead4',
    },
  };
}

function withProvider(child: React.ReactElement): React.ReactElement {
  return (
    <DesignSystemProvider
      tenantConfig={testTenant()}
      productProfile="generic.default"
      forceEngine="rustic"
      skipCssLoading
    >
      {child}
    </DesignSystemProvider>
  );
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('New React-owned SVG renderers', () => {
  it('renders the area renderer with shared line-series anatomy', () => {
    const { container } = render(withProvider(
      <SvgAreaRenderer
        ariaLabel="Traffic"
        width={480}
        height={280}
        responsive={false}
        series={[
          { id: 'a', label: 'Desktop', points: [
            { id: 'a0', x: 'Jan', value: 80 },
            { id: 'a1', x: 'Feb', value: 120 },
          ] },
          { id: 'b', label: 'Mobile', points: [
            { id: 'b0', x: 'Jan', value: 40 },
            { id: 'b1', x: 'Feb', value: 90 },
          ] },
        ]}
      />,
    ));
    const surface = container.querySelector('[data-renderer-id="svg.area"]');
    expect(surface).not.toBeNull();
    expect(container.querySelector('.ds-chart-renderer-area')).not.toBeNull();
    expect(container.querySelectorAll('[data-part="area-series"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-part="area"]')).toHaveLength(2);
    // The top edge keeps the historical `series-line` anatomy.
    expect(container.querySelectorAll('[data-part="series-line"]')).toHaveLength(2);
  });

  it('renders histogram bars and an optional cumulative overlay', () => {
    const { container } = render(withProvider(
      <SvgHistogramRenderer
        ariaLabel="Distribution"
        width={600}
        height={360}
        responsive={false}
        bins={6}
        cumulative
        color="#123456"
        values={[12, 15, 22, 28, 28, 31, 35, 42, 42, 42, 55, 60]}
      />,
    ));
    expect(container.querySelector('[data-renderer-id="svg.histogram"]')).not.toBeNull();
    const bars = [...container.querySelectorAll('[data-part="bar"][data-series="histogram"]')];
    expect(bars.length).toBeGreaterThan(0);
    // Explicit bar colour paints inline (not the categorical palette channel).
    bars.forEach((bar) => expect(bar).toHaveAttribute('fill', '#123456'));
    expect(container.querySelector('[data-part="cumulative-line"]')).not.toBeNull();
  });

  it('tones waterfall bars by semantic type and links them with connectors', () => {
    const { container } = render(withProvider(
      <SvgWaterfallRenderer
        ariaLabel="Profit"
        width={600}
        height={360}
        responsive={false}
        decreaseColor="#aa00cc"
        data={[
          { label: 'Revenue', value: 420 },
          { label: 'COGS', value: -200 },
          { label: 'Net', value: 220, type: 'total' },
        ]}
      />,
    ));
    expect(container.querySelector('[data-renderer-id="svg.waterfall"]')).not.toBeNull();
    expect(container.querySelector('[data-part="plot-area"]')).toHaveAttribute('data-orientation', 'vertical');
    expect(container.querySelectorAll('[data-part="bar"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-part="connector"]')).toHaveLength(2);
    const decreaseBar = container.querySelector('[data-part="bar"][data-status="decrease"]');
    expect(decreaseBar).toHaveAttribute('fill', '#aa00cc');
    const increaseBar = container.querySelector('[data-part="bar"][data-status="increase"]');
    expect(increaseBar).toHaveAttribute('fill', 'var(--ds-color-success)');
  });

  it('renders a standalone sparkline without chart chrome', () => {
    const { container } = render(
      <SvgSparklineRenderer data={[4, 8, 3, 12, 7]} color="var(--ds-color-primary)" width={100} height={24} />,
    );
    const spark = container.querySelector('[data-part="sparkline"]');
    expect(spark).not.toBeNull();
    expect(spark?.getAttribute('data-state')).toBe('ready');
    expect(container.querySelector('[data-part="line"]')).not.toBeNull();
    expect(container.querySelector('[data-part="end-dot"]')).not.toBeNull();
  });

  it('returns null from the sparkline renderer when there is no finite datum', () => {
    const { container } = render(
      <SvgSparklineRenderer data={[]} color="var(--ds-color-primary)" />,
    );
    expect(container.querySelector('[data-part="sparkline"]')).toBeNull();
  });
});

describe('New renderer supplier purity (W2 law)', () => {
  // Marks reach pure geometry + DS tokens only. D3 math is confined to the
  // geometry foundation module; a mark that imports d3/antd/motion directly is
  // an architecture regression that tsc and the paint counter cannot see.
  const here = dirname(fileURLToPath(import.meta.url));
  const rendererSources = ['area', 'sparkline', 'histogram', 'waterfall'].map(
    (name) => join(here, '..', name, 'index.tsx'),
  );
  const forbidden = /from ['"](d3|antd|framer-motion|motion)(\/[^'"]*)?['"]/;

  for (const source of rendererSources) {
    it(`keeps ${source.split('/').slice(-2, -1)[0]} free of d3/antd/motion imports`, () => {
      expect(readFileSync(source, 'utf8')).not.toMatch(forbidden);
    });
  }
});
