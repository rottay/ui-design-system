import React from 'react';
import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { resetResponsiveMediaStore } from '@/infrastructure/runtime/responsive/viewport/media-snapshot';
import { mockMatchMedia } from '@tests/support/browser/match-media';
import type { DocumentViewportHint } from '@/infrastructure/runtime/foundation/root-attributes/ssr';
import type { EditorSurfaceConfig } from '../../../../../foundation/contracts';
import type { SurfacePostures } from '../../../../../foundation/contracts/postures';
import { EditorSurface } from '..';

function config(): EditorSurfaceConfig {
  return {
    visual: { layout: 'split', previewWidth: 300 },
    presentation: { chrome: { title: 'Compose' }, preview: <div>Review copy</div> },
    behavior: { initialValue: 'Draft', saveAction: { id: 'save', label: 'Save draft', onClick: vi.fn() } },
  };
}

const postures: SurfacePostures = {
  phone: { regions: { preview: 'hide' }, density: 'compact', primaryAction: 'floating' },
  desktop: { regions: { preview: 'render' }, primaryAction: 'app-bar' },
};

function markup(viewport: DocumentViewportHint, declarations?: SurfacePostures): Promise<string> {
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
        ssrViewport={viewport}
      >
        <EditorSurface config={config()} postures={declarations} />
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

describe('EditorSurface server postures', () => {
  it('renders the request posture on the server, independently from browser media', async () => {
    mockMatchMedia(1440);
    const phone = await markup('phone', postures);
    expect(phone).not.toContain('Review copy');
    expect(phone).toContain('data-density="compact"');
    expect(phone).toContain('data-mode="fixed"');
    expect(phone).toContain('data-surface-region="floating"');
    expect(phone).not.toContain('minmax(0, 300px)');
    mockMatchMedia(390);
    const desktop = await markup('desktop', postures);
    expect(desktop).toContain('Review copy');
    expect(desktop).toContain('data-layout="split"');
    expect(desktop).not.toContain('data-mode="fixed"');
  });

  it('keeps legacy chrome and emits no posture region wrappers when omitted', async () => {
    const html = await markup('desktop');
    expect(html).toContain('Review copy');
    expect(html).toContain('data-layout="split"');
    expect(html).not.toContain('data-surface-region=');
    expect(html).not.toContain('ds-action-dock');
    expect(html).toContain('data-has-actions="false"');
  });

});
