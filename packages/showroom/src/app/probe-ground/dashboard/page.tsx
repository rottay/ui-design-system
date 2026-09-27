import { ProbeGround } from '@/components/probe-ground';

import { DASHBOARD_WIDTHS } from './widths';
import { DashboardStage } from './stage';

// ---------------------------------------------------------------------------
// The dashboard probe-ground (WO-FAM-13 acceptance).
//
// Six app-side widgets on the Modern board, mounted through the one probe-ground
// kernel: a fixed-height widget, a wide widget, a non-movable widget, a
// non-resizable widget, an adaptive widget whose view follows its own cell's
// width, and one waiting in the catalog. `?width=` sizes the board's container
// at whatever viewport the page is opened in; the knob on the page changes it
// live. The layout the board commits lives in React state only.
// ---------------------------------------------------------------------------

type Query = Record<string, string | string[] | undefined>;

function sanitizeWidth(raw: string | string[] | undefined): number {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return (DASHBOARD_WIDTHS as readonly number[]).includes(value) ? value : 1100;
}

export default async function DashboardProbeGroundPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  return (
    <ProbeGround
      request={{ source: { kind: 'static' }, slug: 'bithire', mode: 'light' }}
      testId="dashboard-probe"
    >
      <DashboardStage initialWidth={sanitizeWidth(query.width)} />
    </ProbeGround>
  );
}
