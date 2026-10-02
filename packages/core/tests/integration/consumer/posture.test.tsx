/**
 * WO-INV-06 consumer proof: the surface posture contract exercised from the
 * app side of the fence.
 *
 * The page under test (`app/posture-list-page.tsx`) is written the way an app
 * writes it — root-barrel imports only — and this file drives it the way the
 * request/response cycle does: a phone request must render the simplified
 * posture with no hidden desktop chrome in the HTML, a desktop request the
 * full posture, and a region must be hideable by name.
 */

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { ResponsiveProvider } from '@/infrastructure/runtime/responsive/composition/react/provider';
import { resetResponsiveMediaStore } from '@/infrastructure/runtime/responsive/runtime/media-snapshot';
import { mockMatchMedia } from '@tests/support/browser/match-media';

import PostureListPage, { POSTURE_LIST_POSTURES } from './app/posture-list-page';

const ROWS = [
  { id: '1', label: 'Senior designer' },
  { id: '2', label: 'Platform engineer' },
] as const;

function renderPageServerSide(viewport: 'phone' | 'tablet' | 'desktop'): string {
  return renderToString(
    <EngineProvider defaultEngine="modern">
      <ResponsiveProvider ssrViewport={viewport}>
        <PostureListPage rows={ROWS} />
      </ResponsiveProvider>
    </EngineProvider>,
  );
}

function renderPageClientSide(width: number): ReturnType<typeof render> {
  mockMatchMedia(width);
  resetResponsiveMediaStore();
  return render(
    <EngineProvider defaultEngine="modern">
      <ResponsiveProvider>
        <PostureListPage rows={ROWS} />
      </ResponsiveProvider>
    </EngineProvider>,
  );
}

afterEach(() => {
  cleanup();
  resetResponsiveMediaStore();
});

describe('WO-INV-06 surface postures in the consumer fixture', () => {
  it('renders a phone request in the simplified posture: hidden chrome stays out of the HTML', () => {
    const html = renderPageServerSide('phone');

    expect(html).not.toContain('data-surface-region="column-menu"');
    expect(html).not.toContain('data-surface-region="preview-rail"');
    expect(html).not.toContain('Preview rail body');
    expect(html).not.toContain('All columns');
    expect(html).toContain('data-surface-region="results"');
    expect(html).toContain('data-surface-region="bottom-bar"');
    expect(html).toContain('data-region-disposition="render"');
    expect(html).toContain('data-posture="phone"');
  });

  it('renders a desktop request with the full posture', () => {
    const html = renderPageServerSide('desktop');

    expect(html).toContain('data-surface-region="column-menu"');
    expect(html).toContain('data-surface-region="preview-rail"');
    expect(html).toContain('Preview rail body');
    expect(html).not.toContain('data-surface-region="bottom-bar"');
    expect(html).toContain('data-posture="desktop"');
  });

  it('renders the phone navigation as a persistent bottom bar, not the sidebar', () => {
    const html = renderPageServerSide('phone');

    expect(html).toContain('data-part="navigation-bottom-bar"');
    expect(html).not.toContain('data-part="navigation-sidebar"');
  });

  it('renders the desktop navigation as the sidebar, not a bottom bar', () => {
    const html = renderPageServerSide('desktop');

    expect(html).toContain('data-part="navigation-sidebar"');
    expect(html).not.toContain('data-part="navigation-bottom-bar"');
  });

  it('renders a tablet request unsimplified: the app declared no tablet posture', () => {
    const html = renderPageServerSide('tablet');

    expect(html).toContain('data-surface-region="column-menu"');
    expect(html).toContain('data-surface-region="preview-rail"');
    expect(html).toContain('data-posture="tablet"');
  });

  it('hides a region by name on the client paint and stamps the disposition', () => {
    const { container } = renderPageClientSide(390);

    expect(container.querySelector('[data-surface-region="preview-rail"]')).toBeNull();
    const results = container.querySelector('[data-surface-region="results"]');
    expect(results).not.toBeNull();
    expect(results).toHaveAttribute('data-region-disposition', 'render');
    expect(results).toHaveAttribute('data-posture', 'phone');
    const bottomBar = container.querySelector('[data-surface-region="bottom-bar"]');
    expect(bottomBar).not.toBeNull();
    expect(bottomBar?.textContent ?? '').toContain('New role');
  });

  it('keeps the desktop chrome on the client paint for a desktop viewport', () => {
    const { container } = renderPageClientSide(1440);

    expect(container.querySelector('[data-surface-region="column-menu"]')).not.toBeNull();
    expect(container.querySelector('[data-surface-region="preview-rail"]')).not.toBeNull();
    expect(container.querySelector('[data-surface-region="bottom-bar"]')).toBeNull();
  });

  it('exposes the declaration as app-owned configuration: regions key by name', () => {
    expect(POSTURE_LIST_POSTURES.phone?.regions?.['preview-rail']).toBe('hide');
    expect(POSTURE_LIST_POSTURES.phone?.regions?.['column-menu']).toBe('hide');
    expect(POSTURE_LIST_POSTURES.phone?.primaryAction).toBe('bottom-bar');
  });
});
