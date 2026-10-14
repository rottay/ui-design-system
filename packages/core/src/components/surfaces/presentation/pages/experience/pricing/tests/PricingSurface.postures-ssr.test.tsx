import React from 'react';
import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { resetResponsiveMediaStore } from '@/infrastructure/runtime/responsive/viewport/media-snapshot';
import { mockMatchMedia } from '@tests/support/browser/match-media';
import { PricingSurface } from '..';

function markup(disposition: 'hide' | 'collapse', state: 'loading' | 'error'): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    let html = '';
    let piped = false;
    let settled = false;
    let stream: ReturnType<typeof renderToPipeableStream> | undefined;
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      stream?.abort();
      output.destroy();
      reject(error);
    };
    output.on('data', (chunk) => { html += chunk.toString(); });
    output.on('end', () => {
      if (settled) return;
      settled = true;
      resolve(html);
    });
    output.on('error', fail);
    stream = renderToPipeableStream(
      <DesignSystemProvider
        tenantConfig={{ slug: 'posture-test', name: 'Posture test', theme: 'light', locale: 'en', fallbackLocale: 'en', plan: 'enterprise', features: ['testing'], branding: { companyName: 'Posture test' } }}
        forceEngine="modern"
        skipCssLoading
        ssrViewport="phone"
      >
        <PricingSurface
          config={{ visual: {}, presentation: { chrome: { title: 'Plans' } }, behavior: { plans: [], features: [] } }}
          loading={state === 'loading'}
          error={state === 'error' ? new Error('Comparison failed') : undefined}
          postures={{ phone: { regions: { comparison: disposition } }, desktop: { regions: { comparison: 'render' } } }}
        />
      </DesignSystemProvider>,
      {
        onAllReady: () => queueMicrotask(() => {
          if (piped || settled || !stream) return;
          piped = true;
          stream.pipe(output);
        }),
        onError: fail,
      },
    );
  });
}

afterEach(resetResponsiveMediaStore);

describe('PricingSurface server state postures', () => {
  it.each(['loading', 'error'] as const)('ships no hidden comparison markup in the %s state for a phone request', async (state) => {
    mockMatchMedia(1440);
    const html = await markup('hide', state);
    expect(html).toContain('Plans');
    expect(html).not.toContain('Plan comparison');
    expect(html).not.toContain('pricing-skeleton-plans');
    expect(html).not.toContain('Comparison failed');
    expect(html).not.toContain('ds-action-dock');
  });

  it.each(['loading', 'error'] as const)('keeps the collapsed comparison landmark empty in the %s state', async (state) => {
    mockMatchMedia(1440);
    const html = await markup('collapse', state);
    expect(html).toContain('aria-label="Plan comparison"');
    expect(html).toContain('data-region-disposition="collapse"');
    expect(html).toContain('data-posture="phone"');
    expect(html).not.toContain('pricing-skeleton-plans');
    expect(html).not.toContain('Comparison failed');
  });
});
