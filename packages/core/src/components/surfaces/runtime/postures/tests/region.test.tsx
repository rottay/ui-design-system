import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { ResponsiveProvider } from '@/infrastructure/runtime/responsive/composition/react/provider';
import { resetResponsiveMediaStore } from '@/infrastructure/runtime/responsive/viewport/media-snapshot';
import { mockMatchMedia } from '@tests/support/browser/match-media';

import { SurfaceRegion } from '..';
import type { SurfacePostures } from '..';

const HIDE_RAIL: SurfacePostures = {
  phone: { regions: { 'preview-rail': 'hide' } },
};

function renderAtWidth(
  width: number,
  children: React.ReactElement,
): ReturnType<typeof render> {
  mockMatchMedia(width);
  resetResponsiveMediaStore();
  return render(<ResponsiveProvider>{children}</ResponsiveProvider>);
}

afterEach(() => {
  cleanup();
  resetResponsiveMediaStore();
});

describe('SurfaceRegion', () => {
  it('renders a named region with the render disposition', () => {
    const { container } = renderAtWidth(
      1440,
      <SurfaceRegion name="results" label="Results">
        <p>Row data</p>
      </SurfaceRegion>,
    );

    const region = container.querySelector('[data-surface-region="results"]');
    expect(region).not.toBeNull();
    expect(region).toHaveAttribute('data-region-disposition', 'render');
    expect(region).toHaveAttribute('data-posture', 'desktop');
    expect(region?.textContent).toContain('Row data');
  });

  it('hides a region by name under the matching posture', () => {
    const { container } = renderAtWidth(
      390,
      <SurfaceRegion name="preview-rail" postures={HIDE_RAIL}>
        <p>Preview body</p>
      </SurfaceRegion>,
    );

    expect(container.querySelector('[data-surface-region="preview-rail"]')).toBeNull();
    expect(container.textContent ?? '').not.toContain('Preview body');
  });

  it('renders the same region under a posture that does not hide it', () => {
    const { container } = renderAtWidth(
      1440,
      <SurfaceRegion name="preview-rail" postures={HIDE_RAIL}>
        <p>Preview body</p>
      </SurfaceRegion>,
    );

    expect(container.querySelector('[data-surface-region="preview-rail"]')).not.toBeNull();
  });

  it('keeps the region landmark without content when collapsed', () => {
    const postures: SurfacePostures = {
      phone: { regions: { 'filters': 'collapse' } },
    };

    const { container } = renderAtWidth(
      390,
      <SurfaceRegion name="filters" postures={postures}>
        <p>Filter body</p>
      </SurfaceRegion>,
    );

    const region = container.querySelector('[data-surface-region="filters"]');
    expect(region).not.toBeNull();
    expect(region).toHaveAttribute('data-region-disposition', 'collapse');
    expect(region?.textContent ?? '').not.toContain('Filter body');
  });

  it('defaults the accessible name to the region name', () => {
    const { container } = renderAtWidth(
      1440,
      <SurfaceRegion name="results">x</SurfaceRegion>,
    );

    expect(container.querySelector('div[role="region"]')).toHaveAttribute(
      'aria-label',
      'results',
    );
  });
});
