'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  DetailSurface,
  ListSurface,
  useViewTransition,
  type DetailSurfaceConfig,
  type EntityAdapter,
  type ListSurfaceConfig,
} from '@rottay/design-system';
import { TenantPaletteSurface, surfaceLabelFor, type SurfaceTenant } from '@/components/state-gallery';

// ---------------------------------------------------------------------------
// View-transition evidence surface (WO-CRA-08 list-to-detail seam capture)
//
// Drives the REAL ListSurface/DetailSurface components (not hand-rolled
// markup) through a Next.js router push wrapped by the DS `useViewTransition`
// helper. Both surfaces resolve the SAME record identity (behavior.rowKey /
// behavior.recordKey, both 'id') and derive the same `view-transition-name`
// through the shared `recordTransitionName` helper, so a capture from this
// route is evidence of the DS's actual element-morph wiring rather than of
// markup that happens to imitate it.
//
// One tenant per load (tenant + theme are html-anchored by the palette
// surface). Params:
//   ?tenant=rottay|bithire|evnto   which palette owns the page (default rottay
//                                  = dark ground; bithire = light ground)
//   ?view=list|detail              which screen renders (default list)
//   ?id=<record id>                which record the detail screen shows
//
// The reduced-motion run is the same route captured while the browser emulates
// `prefers-reduced-motion: reduce`; the DS neutralizes the transition there.
// ---------------------------------------------------------------------------

const TENANTS: SurfaceTenant[] = ['rottay', 'bithire', 'evnto'];

function sanitizeTenant(raw: string | null): SurfaceTenant {
  return raw && (TENANTS as string[]).includes(raw) ? (raw as SurfaceTenant) : 'rottay';
}

interface DemoRecord {
  id: string;
  name: string;
  role: string;
  summary: string;
}

const RECORDS: DemoRecord[] = [
  { id: '1', name: 'Ana Gomez', role: 'Staff Engineer', summary: 'Owns the runtime engine and token pipeline.' },
  { id: '2', name: 'Liam Chen', role: 'Product Designer', summary: 'Drives the Quiet Premium motion language.' },
  { id: '3', name: 'Priya Nair', role: 'Engineering Manager', summary: 'Leads the adoption program across verticals.' },
  { id: '4', name: 'Marco Rossi', role: 'Platform Engineer', summary: 'Maintains the multi-tenant branding contract.' },
  { id: '5', name: 'Sara Okoro', role: 'Frontend Engineer', summary: 'Ships the surface catalog and page shells.' },
  { id: '6', name: 'Yuki Tanaka', role: 'Design Technologist', summary: 'Bridges tokens, engines, and the showroom.' },
];

const recordAdapter: EntityAdapter<DemoRecord, DemoRecord> = {
  entity: 'view-transition-probe-record',
  version: '1.0.0',
  map: (raw) => raw,
  fields: [
    { key: 'name', fieldId: 'record.name' },
    { key: 'role', fieldId: 'record.role' },
    { key: 'summary', fieldId: 'record.summary' },
  ],
};

function ViewTransitionsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const runTransition = useViewTransition();

  const tenant = useMemo(() => sanitizeTenant(searchParams.get('tenant')), [searchParams]);
  const view = searchParams.get('view') === 'detail' ? 'detail' : 'list';
  const activeId = searchParams.get('id');
  const activeRecord = RECORDS.find((record) => record.id === activeId) ?? RECORDS[0];

  const buildHref = useCallback(
    (next: Record<string, string>) => {
      const params = new URLSearchParams();
      params.set('tenant', tenant);
      for (const [key, value] of Object.entries(next)) {
        params.set(key, value);
      }
      return `${pathname}?${params.toString()}`;
    },
    [pathname, tenant]
  );

  const openDetail = useCallback(
    (record: DemoRecord) => {
      runTransition(() => router.push(buildHref({ view: 'detail', id: record.id })));
    },
    [router, runTransition, buildHref]
  );

  const backToList = useCallback(() => {
    runTransition(() => router.push(buildHref({ view: 'list' })));
  }, [router, runTransition, buildHref]);

  // rowKey: 'id' on the list and recordKey: 'id' on the detail surface below
  // resolve the SAME identity for the SAME record, so both surfaces derive
  // the same view-transition-name and the browser morphs the clicked card
  // into the detail body instead of cross-fading the page root.
  const listConfig: ListSurfaceConfig<DemoRecord> = useMemo(
    () => ({
      visual: {
        defaultView: 'cards',
        allowViewSwitch: false,
      },
      presentation: {
        chrome: {
          title: `View transitions — ${tenant} · ${surfaceLabelFor(tenant)}`,
          subtitle: 'Select a record to navigate into the detail seam.',
        },
      },
      behavior: {
        columns: [
          { key: 'name', fieldId: 'record.name', header: 'Name', accessorKey: 'name' },
          { key: 'role', fieldId: 'record.role', header: 'Role', accessorKey: 'role' },
        ],
        rowKey: 'id',
        onRowClick: (item) => openDetail(item),
      },
    }),
    [tenant, openDetail]
  );

  const detailConfig: DetailSurfaceConfig<DemoRecord> = useMemo(
    () => ({
      visual: {},
      presentation: {
        title: (item) => item.name,
        subtitle: (item) => item.role,
        chrome: {
          back: { label: 'Back to list', onClick: backToList },
        },
      },
      behavior: {
        recordKey: 'id',
      },
    }),
    [backToList]
  );

  return (
    <TenantPaletteSurface tenant={tenant}>
      <Box style={{ minHeight: '100vh', background: 'var(--ds-color-bg-primary)' }}>
        {view === 'list' ? (
          <ListSurface data={RECORDS} adapter={recordAdapter} config={listConfig} />
        ) : (
          <DetailSurface data={activeRecord} adapter={recordAdapter} config={detailConfig} />
        )}
      </Box>
    </TenantPaletteSurface>
  );
}

export default function ViewTransitionsProbePage() {
  return (
    <Suspense fallback={null}>
      <ViewTransitionsContent />
    </Suspense>
  );
}
