import { afterEach, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';

import { ResponsiveProvider } from '@/infrastructure/runtime/responsive/composition/react/provider';
import { resetResponsiveMediaStore } from '@/infrastructure/runtime/responsive/viewport/media-snapshot';

import { SurfaceRegion } from '..';
import type { SurfacePostures } from '..';

const SIMPLIFIED_PHONE: SurfacePostures = {
  phone: {
    regions: { 'preview-rail': 'hide', 'column-menu': 'hide' },
  },
};

afterEach(() => {
  resetResponsiveMediaStore();
});

describe('surface posture first paint (SSR)', () => {
  it('renders a phone request without the hidden desktop chrome in the HTML', () => {
    const html = renderToString(
      <ResponsiveProvider ssrViewport="phone">
        <SurfaceRegion name="column-menu" postures={SIMPLIFIED_PHONE} label="Column menu">
          <p>Column menu body</p>
        </SurfaceRegion>
        <SurfaceRegion name="preview-rail" postures={SIMPLIFIED_PHONE} label="Preview rail">
          <p>Preview body</p>
        </SurfaceRegion>
        <SurfaceRegion name="results" postures={SIMPLIFIED_PHONE} label="Results">
          <p>Row data</p>
        </SurfaceRegion>
      </ResponsiveProvider>,
    );

    expect(html).not.toContain('Column menu body');
    expect(html).not.toContain('Preview body');
    expect(html).not.toContain('data-surface-region="column-menu"');
    expect(html).not.toContain('data-surface-region="preview-rail"');
    expect(html).toContain('data-surface-region="results"');
    expect(html).toContain('data-posture="phone"');
  });

  it('renders a desktop request with the full posture', () => {
    const html = renderToString(
      <ResponsiveProvider ssrViewport="desktop">
        <SurfaceRegion name="column-menu" postures={SIMPLIFIED_PHONE} label="Column menu">
          <p>Column menu body</p>
        </SurfaceRegion>
        <SurfaceRegion name="preview-rail" postures={SIMPLIFIED_PHONE} label="Preview rail">
          <p>Preview body</p>
        </SurfaceRegion>
      </ResponsiveProvider>,
    );

    expect(html).toContain('Column menu body');
    expect(html).toContain('Preview body');
    expect(html).toContain('data-surface-region="column-menu"');
    expect(html).toContain('data-posture="desktop"');
  });
});
