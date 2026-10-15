/**
 * @fileoverview Regional SSR isolation (C-3, C-3u, C-3r, B-3): a Modern server
 * render failure in page content completes the response with that region
 * client-rendered and the chrome intact, wherever in the content slot it is
 * thrown; with the placement dark the same throw fails the whole response.
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

import {
  boundaryCensus,
  completeHtml,
  hydrate,
  mountHtml,
  serverThrowingFamily,
  textFamily,
  warmServerRender,
} from '../harness';

const placement = vi.hoisted(() => ({ regions: [] as readonly ContentBoundaryRegion[] }));
vi.mock('@/components/structures/foundation/content-boundary/policy', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  activeContentBoundaryRegions: () => placement.regions,
}));

const Throws = serverThrowingFamily('ScbThrows');
const Sibling = textFamily('ScbSibling');

function appShellPage(content: ReactNode) {
  return (
    <EngineProvider defaultEngine="modern">
      <AppShell
        adapt={{ phone: { navigation: 'sidebar' }, tablet: { navigation: 'sidebar' } }}
        sidebar={{ nav: <span data-testid="chrome-nav">Navigation</span> }}
        header={{ left: <span data-testid="chrome-header">Header</span> }}
        footer={<span data-testid="chrome-footer">Footer</span>}
      >
        {content}
      </AppShell>
    </EngineProvider>
  );
}

function pageShellPage(content: ReactNode) {
  return (
    <EngineProvider defaultEngine="modern">
      <PageShellSurface chrome={{ title: 'Records' }} actions={<span data-testid="chrome-actions">Actions</span>}>
        {content}
      </PageShellSurface>
    </EngineProvider>
  );
}

const SHELLS = [
  { name: 'AppShell', page: appShellPage, chrome: ['chrome-nav', 'chrome-header', 'chrome-footer'] },
  { name: 'PageShellSurface', page: pageShellPage, chrome: ['chrome-actions'] },
] as const;

function fallbackRegions(html: string): string[] {
  return [...html.matchAll(/data-content-fallback="([^"]+)"/g)].map(([, region]) => region);
}

describe('regional SSR isolation', () => {
  describe.each(SHELLS)('$name', ({ page, chrome }) => {
    it('C-3 control: with the placement dark, a Modern SSR throw in content fails the whole response', async () => {
      placement.regions = CONTENT_BOUNDARY_PLACEMENTS.off;
      const result = await warmServerRender(() => page(<Throws />));
      expect(result.status).toBe('shell-error');
    });

    it('C-3 under content-slot the response completes with exactly one client-rendered boundary and the chrome present', async () => {
      placement.regions = CONTENT_BOUNDARY_PLACEMENTS['content-slot'];
      const html = completeHtml(await warmServerRender(() => page(<Throws />)));

      expect(boundaryCensus(html).clientRendered).toBe(1);
      expect(fallbackRegions(html)).toEqual(['content-slot']);
      for (const id of chrome) expect(html).toContain(`data-testid="${id}"`);
    });

    it('C-3u under structure-regions a throw at a content position outside every finer region lands in the slot boundary, not the page', async () => {
      placement.regions = CONTENT_BOUNDARY_PLACEMENTS['structure-regions'];
      const html = completeHtml(
        await warmServerRender(() =>
          page(
            <>
              <SurfaceSectionCard title="Section">
                <Sibling text="inside the section" />
              </SurfaceSectionCard>
              <Throws />
            </>,
          ),
        ),
      );

      expect(boundaryCensus(html).clientRendered).toBe(1);
      expect(fallbackRegions(html)).toEqual(['content-slot']);
      for (const id of chrome) expect(html).toContain(`data-testid="${id}"`);
    });

    it('C-3r under structure-regions a throw inside a section isolates only that section; the rest of the content renders on the server', async () => {
      placement.regions = CONTENT_BOUNDARY_PLACEMENTS['structure-regions'];
      const html = completeHtml(
        await warmServerRender(() =>
          page(
            <>
              <Sibling text="beside the section" />
              <SurfaceSectionCard title="Section">
                <Throws />
              </SurfaceSectionCard>
            </>,
          ),
        ),
      );

      expect(boundaryCensus(html).clientRendered).toBe(1);
      expect(fallbackRegions(html)).toEqual(['section-content']);
      expect(html).toContain('beside the section');
    });
  });

  it('B-3 the served shape: the failed region sits inside the content slot, the chrome is outside it, and hydration client-renders only that region', async () => {
    placement.regions = CONTENT_BOUNDARY_PLACEMENTS['content-slot'];
    const page = () => appShellPage(<><Sibling text="server content" /><Throws /></>);
    const html = completeHtml(await warmServerRender(page));

    const start = html.indexOf('<!--$!-->');
    const end = html.indexOf('<!--/$-->', start);
    expect(start).toBeGreaterThan(html.indexOf('data-testid="chrome-header"'));
    expect(start).toBeGreaterThan(html.indexOf('data-testid="chrome-nav"'));
    expect(end).toBeLessThan(html.indexOf('data-testid="chrome-footer"'));
    expect(html.slice(start, end)).toMatch(/^<!--\$!-->(<template[^>]*><\/template>)?<main [^>]*data-content-fallback="content-slot"/);

    const container = mountHtml(html);
    const header = container.querySelector('[data-testid="chrome-header"]');
    const nav = container.querySelector('[data-testid="chrome-nav"]');
    const recoverable = await hydrate(container, page());

    expect(container.querySelector('[data-testid="ScbThrows"]')?.textContent).toBe('client rendered');
    expect(container.querySelector('[data-testid="ScbSibling"]')?.textContent).toBe('server content');
    expect(container.querySelector('[data-content-fallback]')).toBeNull();
    expect(container.querySelector('main[data-part="content"]')?.id).toBeTruthy();
    expect(container.querySelector('[data-testid="chrome-header"]')).toBe(header);
    expect(container.querySelector('[data-testid="chrome-nav"]')).toBe(nav);
    expect(recoverable).toHaveLength(1);
  });
});
