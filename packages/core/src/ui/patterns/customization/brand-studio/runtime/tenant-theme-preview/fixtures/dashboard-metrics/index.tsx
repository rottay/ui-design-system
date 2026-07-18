'use client';

/**
 * @fileoverview Domain-free DashboardSurface fixture for the tenant-theme preview.
 *
 * Renders a generic overview page -- a KPI stat row plus a section carrying a
 * real bar chart -- so a compiled tenant theme visibly re-skins metric chrome
 * and re-colors the chart series inside the preview scope. It uses only generic
 * vocabulary (records, sessions, throughput) and knows nothing about tenants,
 * candidates, roles, companies, interviews, or events.
 *
 * @remarks
 * Preview fixture, not product code: it lives under a `fixtures/` container so it
 * may compose the surface and chart tiers for demonstration only. The chart runs
 * non-responsive with a fixed size so it needs no ResizeObserver.
 */

import type { DashboardSurfaceConfig } from '@/ui/surfaces';
import { DashboardSurface } from '@/ui/surfaces';
import { BarChart, type DataPoint } from '@/ui/patterns/visualization/charts';
import { Box } from '@/ui/primitives';

const noop = (): void => undefined;

const SERIES: DataPoint[] = [
  { label: 'Jan', value: 32 },
  { label: 'Feb', value: 54 },
  { label: 'Mar', value: 41 },
  { label: 'Apr', value: 68 },
  { label: 'May', value: 59 },
];

const CONFIG: DashboardSurfaceConfig = {
  visual: { statsColumns: 3, sectionsColumns: 12 },
  presentation: {
    chrome: { title: 'Overview', subtitle: 'Live metrics' },
    sections: [
      {
        key: 'throughput',
        title: 'Throughput',
        description: 'Records processed per month',
        span: 12,
        content: (
          <Box data-part="preview-chart" style={{ padding: 4 }}>
            <BarChart
              data={SERIES}
              width={360}
              height={200}
              responsive={false}
              animate={false}
              barRadius={4}
            />
          </Box>
        ),
      },
    ],
  },
  behavior: {
    stats: [
      { key: 'records', label: 'Records', value: 254 },
      { key: 'sessions', label: 'Sessions', value: '1.2k' },
      { key: 'throughput', label: 'Throughput', value: '68/mo' },
    ],
    headerActions: [{ id: 'refresh', label: 'Refresh', variant: 'primary', onClick: noop }],
  },
};

/** A themed metrics + chart dashboard surface for the live preview scope. */
export function DashboardMetricsPreviewFixture(): React.ReactElement {
  return <DashboardSurface config={CONFIG} />;
}
