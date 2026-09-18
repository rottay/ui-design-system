/**
 * SurfaceLifecycle, WO-FAM-10 sub-lot G.
 *
 * The family shipped with its paint mostly drained already; this suite pins
 * what the cut changed: the error boundary's anatomy contract and its
 * measured failure-mode floor, the loading surface's anatomy-derived
 * rendering, and the single-announcement loading post. It is also the
 * family's accessibility evidence alongside the axe run in the causality
 * suite.
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import {
  SurfaceErrorBoundary,
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
  SurfaceStaleBanner,
} from '..';
import { DefaultSurfaceErrorFallback } from '../error-boundary';

const FLOOR_BG = 'var(--ds-surface-lifecycle-error-bg, light-dark(#fef2f2, #2a1215))';
const FLOOR_COLOR = 'var(--ds-surface-lifecycle-error-color, light-dark(#991b1b, #fca8a5))';
const FLOOR_BORDER =
  '1px solid var(--ds-surface-lifecycle-error-border, light-dark(#fca5a5, #8c3a42))';

function Bomb({ message }: { message: string }): React.ReactElement {
  throw new Error(message);
}

function silenceReactErrorLogging(): () => void {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  return () => spy.mockRestore();
}

function parts(container: HTMLElement, scope: string): string[] {
  return [...container.querySelectorAll(`${scope} [data-part]`)]
    .map((node) => node.getAttribute('data-part') as string)
    .sort();
}

describe('SurfaceLifecycle (WO-FAM-10 sub-lot G cut)', () => {
  it('stamps the boundary anatomy the governed paint reads, and nothing else inline', async () => {
    const restore = silenceReactErrorLogging();
    try {
      const { container } = renderSurface(
        <SurfaceErrorBoundary surfaceName="billing">
          <Bomb message="quota exceeded" />
        </SurfaceErrorBoundary>,
        { engine: 'modern' },
      );

      const root = (await waitFor(() => {
        const el = container.querySelector('.ds-surface-lifecycle-error[data-part="root"]');
        expect(el).not.toBeNull();
        return el;
      })) as HTMLElement;

      expect(root.getAttribute('role')).toBe('alert');
      expect(parts(container, '.ds-surface-lifecycle-error')).toEqual([
        'action',
        'description',
        'title',
      ]);

      for (const part of ['title', 'description', 'action']) {
        const el = container.querySelector(`[data-part="${part}"]`) as HTMLElement;
        expect(el.getAttribute('style'), part).toBeNull();
      }
    } finally {
      restore();
    }
  });

  it('keeps the failure-mode floor to exactly three per-mode channel references', () => {
    // SSR reads the style object as authored; jsdom's CSSOM drops var()
    // values, so the floor's exact contract is asserted on the markup.
    const html = renderToString(
      <DefaultSurfaceErrorFallback
        surfaceName="billing"
        error={new Error('quota exceeded')}
        onRetry={() => undefined}
      />,
    );

    const floor = /style="([^"]*)"/.exec(html)?.[1] ?? '';
    expect(floor).toContain(`background-color:${FLOOR_BG}`);
    expect(floor).toContain(`color:${FLOOR_COLOR}`);
    expect(floor).toContain(`border:${FLOOR_BORDER}`);
    // Geometry, radii and typography are governed paint: none of them in the floor.
    expect(floor).not.toContain('padding');
    expect(floor).not.toContain('border-radius');
    expect(floor).not.toContain('font-size');
    expect(floor).not.toContain('opacity');
    // And the floor is the only style attribute in the fallback at all.
    expect(html.match(/style="/g)).toHaveLength(1);
  });

  it('keeps the retry control a named button inside the alert', async () => {
    const restore = silenceReactErrorLogging();
    try {
      const { container } = renderSurface(
        <SurfaceErrorBoundary>
          <Bomb message="boom" />
        </SurfaceErrorBoundary>,
        { engine: 'modern' },
      );

      await waitFor(() => expect(container.textContent).toContain('boom'));
      const alert = container.querySelector('[role="alert"]') as HTMLElement;
      const retry = alert.querySelector("[data-part='action']") as HTMLElement;
      expect(retry.tagName).toBe('BUTTON');
      expect(retry).toHaveTextContent('Try again');
      // The alert owns the whole message: title, detail and the retry name.
      expect(alert.textContent).toContain('encountered an error');
    } finally {
      restore();
    }
  });

  it('builds the loading surface from the stamped anatomy with a single announcement', async () => {
    const { container } = renderSurface(
      <SurfaceLoadingSkeleton rows={2} showHeader />,
      { engine: 'modern' },
    );

    const root = (await waitFor(() => {
      const el = container.querySelector('.ds-surface-lifecycle-loading[data-part="root"]');
      expect(el).not.toBeNull();
      return el;
    })) as HTMLElement;

    // One announcement: the root is the status region and the measured
    // source the renderer draws from is hidden from assistive tech.
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(root.getAttribute('aria-label')).toBe('Loading surface');
    const source = root.querySelector("[data-part='source']") as HTMLElement;
    expect(source.getAttribute('aria-hidden')).toBe('true');

    // The source anatomy the renderer measures: header line, secondary
    // line, and the row lines. The pinned landing classes still ride the
    // same parts for the long-tail contract.
    const anatomy = source.querySelectorAll('[data-part]');
    expect(
      [...anatomy].map((node) => node.getAttribute('data-part') as string).sort(),
    ).toEqual(['header', 'rows', 'text', 'text', 'text', 'title']);
    expect(root.querySelector('.ds-loading-skeleton__header-primary')).not.toBeNull();
    expect(root.querySelector('.ds-loading-skeleton__header-secondary')).not.toBeNull();
    expect(root.querySelector('.ds-loading-skeleton__rows')).not.toBeNull();
    // No part of the loading surface carries inline paint. The renderer's
    // bone spans are the one allowed exception -- runtime-computed
    // `--ds-skeleton-bone-*` custom properties, never visual values.
    for (const el of source.querySelectorAll('[data-part]')) {
      expect(el.getAttribute('style'), el.getAttribute('data-part') ?? '').toBeNull();
    }
  });

  it('honours rows and showHeader without orphaned anatomy', async () => {
    const { container } = renderSurface(<SurfaceLoadingSkeleton rows={1} showHeader={false} />, {
      engine: 'modern',
    });

    await waitFor(() => {
      expect(container.querySelector('.ds-surface-lifecycle-loading')).not.toBeNull();
    });
    expect(container.querySelector("[data-part='header']")).toBeNull();
    expect(container.querySelectorAll("[data-part='rows'] > [data-part='text']")).toHaveLength(1);
  });

  it('keeps the stale banner anatomy on the renamed family channels', async () => {
    const { container } = renderSurface(
      <SurfaceStaleBanner message="Stale" onRefresh={() => undefined} />,
      { engine: 'modern' },
    );

    const banner = (await waitFor(() => {
      const el = container.querySelector('.ds-stale-banner[data-part="banner"]');
      expect(el).not.toBeNull();
      return el;
    })) as HTMLElement;

    expect(banner.querySelector("[data-part='description']")).not.toBeNull();
    // The banner root rides runtime `--ds-*` custom properties only (the Flex
    // gap channel); no visual property travels inline.
    const style = banner.getAttribute('style') ?? '';
    for (const decl of style.split(';')) {
      const trimmed = decl.trim();
      if (trimmed === '') continue;
      expect(trimmed.startsWith('--'), trimmed).toBe(true);
    }
  });

  it('keeps the error state anatomy it always stamped, minus the unconsumed content part', async () => {
    const { container } = renderSurface(
      <SurfaceErrorState error="Broken" onRetry={() => undefined} />,
      { engine: 'modern' },
    );

    await waitFor(() => expect(container.textContent).toContain('Broken'));
    expect(container.querySelector('.ds-error-state [data-part="title"]')).not.toBeNull();
    // The Stack this family stamps no longer claims `content`; the part that
    // remains under the error state is the Alert's own anatomy.
    expect(container.querySelector('.ds-error-state__body > [data-part="content"]')).toBeNull();
  });
});
