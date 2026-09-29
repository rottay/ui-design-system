/**
 * Chart boxes stay inside a narrow host. The visually hidden summary table
 * collapses to the hairline its wrapper declares instead of laying out its
 * nowrap rows at full width, and treemap tile text under `dir=rtl` runs into
 * its tile rather than out past the inline-start edge.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { GaugeChart } from '../families/gauge';
import { TreeMap } from '../families/tree-map';
import { measureArms, type ProbeReadings, type ProbeTarget } from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'chart-narrow-host',
  name: 'Chart narrow host',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Chart narrow host' },
};

const LONG_SEGMENT = 'Sustained capacity well above the planned operating envelope';

async function serverMarkup(node: React.ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      {node}
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((resolve, reject) => {
    prelude
      .pipe(
        new Writable({
          write(chunk, _encoding, done) {
            html += chunk.toString();
            done();
          },
        }),
      )
      .on('finish', () => resolve())
      .on('error', reject);
  });
  return html;
}

const HOST = 240;
const gauge = await serverMarkup(
  <GaugeChart
    title="Cluster load"
    value={82}
    width={HOST}
    height={200}
    animate={false}
    segments={[
      { from: 0, to: 50, color: '', label: 'Comfortable headroom for the current quarter' },
      { from: 50, to: 100, color: '', label: LONG_SEGMENT },
    ]}
  />,
);
const treemap = await serverMarkup(
  <TreeMap
    data={[
      { name: 'التوظيف الهندسي', value: 60 },
      { name: 'المبيعات', value: 30 },
      { name: 'العمليات', value: 10 },
    ]}
    width={HOST}
    height={200}
    responsive={false}
    animate={false}
  />,
);

const markup = [
  `<div id="gauge" style="inline-size:${HOST}px">${gauge}</div>`,
  `<div id="treemap" dir="rtl" style="inline-size:${HOST}px">${treemap}</div>`,
].join('');

const TABLE_PARTS = ['summary-table', 'summary-caption', 'summary-row', 'summary-header', 'summary-cell'] as const;

const targets: ProbeTarget[] = [
  { id: 'gauge.left', selector: '#gauge', property: '@rect.left' },
  { id: 'gauge.right', selector: '#gauge', property: '@rect.right' },
  ...TABLE_PARTS.map((part) => ({
    id: `${part}.right`,
    selector: `#gauge [data-part='${part}']`,
    property: '@rect.right',
  })),
  { id: 'summary-table.width', selector: "#gauge [data-part='summary-table']", property: 'inline-size' },
  { id: 'tile.left', selector: "#treemap [data-part='tile'] [data-part='tile-surface']", property: '@rect.left' },
  { id: 'tile.right', selector: "#treemap [data-part='tile'] [data-part='tile-surface']", property: '@rect.right' },
  { id: 'tileLabel.left', selector: "#treemap [data-part='tile'] [data-part='tile-label']", property: '@rect.left' },
  { id: 'tileLabel.right', selector: "#treemap [data-part='tile'] [data-part='tile-label']", property: '@rect.right' },
  { id: 'tileValue.left', selector: "#treemap [data-part='tile'] [data-part='tile-value']", property: '@rect.left' },
  { id: 'plot.left', selector: "#treemap [data-part='plot-area']", property: '@rect.left' },
  { id: 'treemap.left', selector: '#treemap', property: '@rect.left' },
];

let readings: ProbeReadings;
const read = (id: string): number => Number(readings.base![id]);

describe('charts in a narrow host', () => {
  beforeAll(async () => {
    readings = await measureArms({ vertical: 'rottay', markup, arms: { base: {} }, targets });
  }, 120_000);

  it('collapses every box of the hidden summary table inside the host', () => {
    expect(Number.isFinite(read('summary-table.right'))).toBe(true);
    for (const part of TABLE_PARTS) {
      expect(read(`${part}.right`), part).toBeLessThanOrEqual(read('gauge.right'));
    }
  });

  it('keeps treemap tile text inside its tile under rtl', () => {
    expect(Number.isFinite(read('tileLabel.left'))).toBe(true);
    expect(read('tileLabel.left')).toBeGreaterThanOrEqual(read('tile.left'));
    expect(read('tileLabel.right')).toBeLessThanOrEqual(read('tile.right'));
    expect(read('tileValue.left')).toBeGreaterThanOrEqual(read('tile.left'));
    expect(read('plot.left')).toBeGreaterThanOrEqual(read('treemap.left'));
  });
});
