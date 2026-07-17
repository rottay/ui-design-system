'use client';

import { Suspense, useMemo, cloneElement, isValidElement, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Text } from '@rottay/design-system';
import { TenantPaletteSurface, getResponsiveSpec, type SurfaceTenant } from '@/components/state-gallery';

// ---------------------------------------------------------------------------
// Container-axis probe (WO-ARC-08 checkpoint 1 -- capture harness)
//
// Renders ONE workspace component inside a fixed-width wrapper, at the
// page's natural 1280 layout, under a tenant palette. The browser viewport
// stays fixed at 1280 across every capture -- only the wrapper's width
// changes -- so a screenshot of the wrapper (not the page) isolates the
// component's response to its CONTAINER's inline size ahead of the
// @container adaptations later checkpoints in this WO add. Query params:
//   ?slug=data-table|rail        which workspace component renders (default data-table)
//   ?tenant=rottay|bithire|evnto which palette owns the page (default rottay)
//   ?cw=380|620|1160             the wrapper's fixed pixel width (default 1160)
//   ?demo=collapse                data-table only: clones the fixture's columns
//                                  and marks the LAST one `priority: 'low'` so
//                                  the §10 collapse rule has something to hide.
//                                  The shared fixture (responsive-specs.tsx) is
//                                  never mutated -- every capture without this
//                                  param renders the fixture exactly as authored,
//                                  so the inert baselines are unaffected.
//
// Reuses the responsive-set fixtures (state-gallery/responsive-specs.tsx):
// each slug's first group/first cell is that component's populated state.
// ---------------------------------------------------------------------------

const CONTAINER_WIDTHS: Record<string, number> = {
  '380': 380,
  '620': 620,
  '1160': 1160,
};

const TENANTS: SurfaceTenant[] = ['rottay', 'bithire', 'evnto'];

const SLUGS = ['data-table', 'rail'] as const;
type ContainerAxisSlug = (typeof SLUGS)[number];

function sanitizeTenant(raw: string | null): SurfaceTenant {
  return raw && (TENANTS as string[]).includes(raw) ? (raw as SurfaceTenant) : 'rottay';
}

function sanitizeSlug(raw: string | null): ContainerAxisSlug {
  return raw && (SLUGS as readonly string[]).includes(raw) ? (raw as ContainerAxisSlug) : 'data-table';
}

function sanitizeContainerWidth(raw: string | null): number {
  return raw && CONTAINER_WIDTHS[raw] ? CONTAINER_WIDTHS[raw] : 1160;
}

type DemoVariant = 'none' | 'collapse';

function sanitizeDemo(raw: string | null): DemoVariant {
  return raw === 'collapse' ? 'collapse' : 'none';
}

/**
 * `demo=collapse`, data-table only: clones the fixture's `columns` prop
 * (via `cloneElement`, never touching the shared fixture array) and marks
 * the last entry `priority: 'low'`, giving the §10 collapse rule a column to
 * hide. Every other slug, and every request without `demo=collapse`, returns
 * `node` untouched.
 */
function withCollapseDemo(slug: ContainerAxisSlug, demo: DemoVariant, node: ReactNode): ReactNode {
  if (slug !== 'data-table' || demo !== 'collapse' || !isValidElement<{ columns?: unknown }>(node)) {
    return node;
  }
  const { columns } = node.props;
  if (!Array.isArray(columns) || columns.length === 0) return node;
  const lastIndex = columns.length - 1;
  const demoColumns = columns.map((col, index) => {
    if (index !== lastIndex || col === null || typeof col !== 'object') return col;
    return { ...col, priority: 'low' as const };
  });
  return cloneElement(node, { columns: demoColumns });
}

function ProbeContent() {
  const searchParams = useSearchParams();

  const tenant = useMemo(() => sanitizeTenant(searchParams.get('tenant')), [searchParams]);
  const slug = useMemo(() => sanitizeSlug(searchParams.get('slug')), [searchParams]);
  const containerWidth = useMemo(() => sanitizeContainerWidth(searchParams.get('cw')), [searchParams]);
  const demo = useMemo(() => sanitizeDemo(searchParams.get('demo')), [searchParams]);

  const baseNode = getResponsiveSpec(slug)?.groups[0]?.cells[0]?.node ?? null;
  const node = useMemo(() => withCollapseDemo(slug, demo, baseNode), [slug, demo, baseNode]);

  return (
    <TenantPaletteSurface tenant={tenant}>
      <Box style={{ minHeight: '100vh', padding: 24, background: 'var(--ds-color-bg-primary)' }}>
        <Box style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Box style={{ marginBottom: 16 }}>
            <Text
              as={'h1' as never}
              size="lg"
              weight="bold"
              style={{ display: 'block', color: 'var(--ds-color-text-primary)' }}
            >
              Container axis — {slug} · {tenant} @ {containerWidth}px{demo === 'collapse' ? ' · collapse demo' : ''}
            </Text>
            <Text size="sm" style={{ display: 'block', marginTop: 4, color: 'var(--ds-color-text-secondary)' }}>
              Same component, same 1280 viewport; wrapper width driven by ?cw.
            </Text>
          </Box>
          <Box data-testid="probe-container-axis" style={{ width: containerWidth }}>
            {node}
          </Box>
        </Box>
      </Box>
    </TenantPaletteSurface>
  );
}

export default function ContainerAxisProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
