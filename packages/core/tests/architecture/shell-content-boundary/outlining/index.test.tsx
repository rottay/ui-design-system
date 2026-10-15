/**
 * @fileoverview The outlining rule (B-4, B-4s): a placement is admitted only
 * where every boundary it adds stays inline. Fizz outlines a completed
 * boundary over 500 B that no longer fits the progressive chunk, and any
 * boundary carrying suspensey content (a `precedence` stylesheet) regardless
 * of size; an outlined content boundary is a page-wide fallback, so either
 * cause fails admission.
 */
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AppShell } from '@/components/structures/shell/app-shell';
import { PageShellSurface } from '@/components/structures/shell/page-shell-surface';
import { SurfaceSectionCard } from '@/components/structures/shell/surface-chrome';
import {
  CONTENT_BOUNDARY_PLACEMENTS,
  type ContentBoundaryRegion,
} from '@/components/structures/foundation/content-boundary/policy';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';

import { admitted, boundaryCensus, completeHtml, textFamily, warmServerRender } from '../harness';

const placement = vi.hoisted(() => ({ regions: [] as readonly ContentBoundaryRegion[] }));
vi.mock('@/components/structures/foundation/content-boundary/policy', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  activeContentBoundaryRegions: () => placement.regions,
}));

const Content = textFamily('ScbOutlineContent');

/** The measured-route shape: chrome, a page header and a short body. */
const ROUTE_CONTENT = <Content text="Quarterly records" />;
const HEAVY_CONTENT = <Content text={'heavy row '.repeat(1500)} />;
const SUSPENSEY_CONTENT = (
  <>
    <link rel="stylesheet" href="/region.css" precedence="default" />
    <Content text="Quarterly records" />
  </>
);

function route(content: ReactNode) {
  return (
    <EngineProvider defaultEngine="modern">
      <AppShell
        adapt={{ phone: { navigation: 'sidebar' }, tablet: { navigation: 'sidebar' } }}
        sidebar={{ nav: <span>Navigation</span> }}
        header={{ left: <span>Header</span> }}
      >
        <PageShellSurface chrome={{ title: 'Records' }}>{content}</PageShellSurface>
      </AppShell>
    </EngineProvider>
  );
}

async function census(regions: readonly ContentBoundaryRegion[], content: ReactNode) {
  placement.regions = regions;
  const html = completeHtml(await warmServerRender(() => route(content)));
  return { html, census: boundaryCensus(html) };
}

describe('the outlining rule', () => {
  it('B-4 the measured-route fixture under content-slot: both slot boundaries stay inline, the placement is admitted', async () => {
    const { html, census: found } = await census(CONTENT_BOUNDARY_PLACEMENTS['content-slot'], ROUTE_CONTENT);
    expect(found).toEqual({ inline: 2, outlined: 0, clientRendered: 0, revealScript: false });
    expect(admitted(html)).toBe(true);
  });

  it('B-4 an outlined boundary fails by rule: content past the progressive chunk outlines and is refused', async () => {
    const { html, census: found } = await census(CONTENT_BOUNDARY_PLACEMENTS['content-slot'], HEAVY_CONTENT);
    expect(found.outlined).toBeGreaterThan(0);
    expect(found.revealScript).toBe(true);
    expect(admitted(html)).toBe(false);
  });

  it('B-4s a small region carrying a precedence stylesheet outlines regardless of size and is refused', async () => {
    const { html, census: found } = await census(CONTENT_BOUNDARY_PLACEMENTS['content-slot'], SUSPENSEY_CONTENT);
    expect(html.length).toBeLessThan(12_800);
    expect(found.outlined).toBeGreaterThan(0);
    expect(found.revealScript).toBe(true);
    expect(admitted(html)).toBe(false);
  });

  it('B-4s the same stylesheet inside a structure region refuses that region too', async () => {
    const { html, census: found } = await census(
      CONTENT_BOUNDARY_PLACEMENTS['structure-regions'],
      <SurfaceSectionCard title="Section">{SUSPENSEY_CONTENT}</SurfaceSectionCard>,
    );
    expect(found.outlined).toBeGreaterThan(0);
    expect(admitted(html)).toBe(false);
  });

  it('B-4s tripwire: on the installed React an eager image is not suspensey content (it needs a ViewTransition scope); a flip here makes images an admission cause', async () => {
    const { html } = await census(
      CONTENT_BOUNDARY_PLACEMENTS['content-slot'],
      <>
        <img src="/region.png" alt="" />
        <Content text="Quarterly records" />
      </>,
    );
    expect(admitted(html)).toBe(true);
  });

  it('B-4 structure-regions does not escape the progressive chunk: regions after it outline even though each is small enough alone', async () => {
    const sections = Array.from({ length: 4 }, (_, index) => (
      <SurfaceSectionCard key={index} title={`Section ${index}`}>
        <Content text={'row '.repeat(1200)} />
      </SurfaceSectionCard>
    ));
    const { html, census: found } = await census(CONTENT_BOUNDARY_PLACEMENTS['structure-regions'], sections);
    expect(found.inline).toBeGreaterThan(0);
    expect(found.outlined).toBeGreaterThan(0);
    expect(admitted(html)).toBe(false);
  });
});
