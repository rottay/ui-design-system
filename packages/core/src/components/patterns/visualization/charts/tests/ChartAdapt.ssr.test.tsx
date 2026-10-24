/**
 * A chart's viewport `adapt` entries resolve on the server: a phone REQUEST
 * renders compact mode in the server markup itself, from the request's
 * viewport hint, while the live media of the rendering machine says desktop.
 * Container entries need a measured box, so the server never applies them.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockMatchMedia } from '@tests/support/browser/match-media';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import { resetResponsiveMediaStore } from '@/infrastructure/runtime/responsive/viewport/media-snapshot';
import type { DocumentViewportHint } from '@/infrastructure/runtime/foundation/root-attributes/ssr';
import type { TenantConfig } from '@/foundation/contracts';
import { LineChart, type LineChartProps } from '..';

const TENANT: TenantConfig = {
  slug: 'chart-adapt-ssr-test',
  name: 'Chart Adapt SSR Test',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: { companyName: 'Chart Adapt SSR Test' },
};

const SERIES: LineChartProps['series'] = [
  { name: 'Revenue', data: [{ x: 'Jan', y: 100 }, { x: 'Feb', y: 140 }, { x: 'Mar', y: 120 }] },
  { name: 'Cost', data: [{ x: 'Jan', y: 60 }, { x: 'Feb', y: 70 }, { x: 'Mar', y: 90 }] },
];

function tree(ssrViewport: DocumentViewportHint, props: Partial<LineChartProps>): React.ReactElement {
  return (
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport={ssrViewport}
    >
      <LineChart title="Revenue" series={SERIES} legend animate={false} {...(props as Record<string, unknown>)} />
    </DesignSystemProvider>
  );
}

async function serverMarkup(ssrViewport: DocumentViewportHint, props: Partial<LineChartProps>): Promise<string> {
  const { prelude } = await prerenderToNodeStream(tree(ssrViewport, props));
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
      .on('finish', resolve)
      .on('error', reject);
  });
  return html;
}

const MULTIPLE_RENDERERS =
  'Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported.';

function scaffoldTag(html: string): string {
  const tags = html.match(/<div[^>]*data-part="chart-scaffold"[^>]*>/g) ?? [];
  expect(tags).toHaveLength(1);
  return tags[0] as string;
}

afterEach(() => {
  resetResponsiveMediaStore();
  vi.restoreAllMocks();
});

describe('LineChart adapt -- server-resolved viewport posture', () => {
  it('renders a phone request compact in the server markup, against desktop media', async () => {
    mockMatchMedia(1440);
    const html = await serverMarkup('phone', { adapt: { phone: { compactMode: true } } });

    const root = scaffoldTag(html);
    expect(root).toContain('data-posture="phone"');
    expect(root).toContain('data-state="ready"');
    expect(root).toContain('min-height:150px');
    expect(html).not.toContain('data-part="legend"');
  });

  it('renders the same declaration in full for a desktop request, against phone media', async () => {
    mockMatchMedia(390);
    const html = await serverMarkup('desktop', { adapt: { phone: { compactMode: true } } });

    const root = scaffoldTag(html);
    expect(root).toContain('data-posture="desktop"');
    expect(root).not.toContain('min-height');
    expect(html).toContain('data-part="legend"');
  });

  it('never applies a container entry on the server: the box has not been measured', async () => {
    mockMatchMedia(1440);
    const html = await serverMarkup('phone', { adapt: { compact: { compactMode: true } } });

    const root = scaffoldTag(html);
    expect(root).toContain('data-posture="phone"');
    expect(root).not.toContain('min-height');
    expect(html).toContain('data-part="legend"');
  });

  it('stamps the loading state in the server markup', async () => {
    mockMatchMedia(1440);
    const html = await serverMarkup('phone', { loading: true, adapt: { phone: { compactMode: true } } });

    const root = scaffoldTag(html);
    expect(root).toContain('data-state="loading"');
    expect(root).toContain('data-posture="phone"');
  });

  it('hydrates the phone markup on a phone client with no recoverable error or mismatch', async () => {
    mockMatchMedia(1440);
    const props: Partial<LineChartProps> = { adapt: { phone: { compactMode: true } } };
    const html = await serverMarkup('phone', props);

    // A fresh module graph for the client, as a browser has: the server
    // renderer above must not share React's context objects with hydration.
    vi.resetModules();
    const { act, createElement } = await import('react');
    const { hydrateRoot } = await import('react-dom/client');
    const bootstrap = await import('@/infrastructure/runtime/bootstrap');
    const theme = await import('@/infrastructure/compilers/runtime/theme');
    const charts = await import('..');
    const media = await import('@/infrastructure/runtime/responsive/viewport/media-snapshot');
    media.resetResponsiveMediaStore();
    mockMatchMedia(390);

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverableErrors: string[] = [];
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const serverRoot = container.querySelector('[data-part="chart-scaffold"]');
    expect(serverRoot).not.toBeNull();

    let root: { unmount: () => void } | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(
          container,
          createElement(bootstrap.DesignSystemProvider, {
            tenantConfig: TENANT,
            forceEngine: 'modern',
            engineVisual: theme.firstPartyEngineVisual('rottay', 'modern'),
            skipCssLoading: true,
            ssrViewport: 'phone',
            children: createElement(charts.LineChart, {
              title: 'Revenue',
              series: SERIES,
              legend: true,
              animate: false,
              adapt: props.adapt,
            }),
          }),
          { onRecoverableError: (error: unknown) => recoverableErrors.push(String(error)) },
        );
      });

      expect(recoverableErrors).toEqual([]);
      // Fizz never clears its renderer mark on contexts outside the reset graph,
      // so one process running both renderers warns; a browser never runs Fizz.
      const messages = consoleError.mock.calls.map((call) => call.map(String).join(' '));
      expect(messages.filter((message) => message !== MULTIPLE_RENDERERS)).toEqual([]);
      const hydrated = container.querySelector('[data-part="chart-scaffold"]');
      expect(hydrated).toBe(serverRoot);
      expect(hydrated).toHaveAttribute('data-posture', 'phone');
      expect(container.querySelector('[data-part="legend"]')).toBeNull();
    } finally {
      act(() => root?.unmount());
      container.remove();
      media.resetResponsiveMediaStore();
      vi.resetModules();
    }
  });
});
