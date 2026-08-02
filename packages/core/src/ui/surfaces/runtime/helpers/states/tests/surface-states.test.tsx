import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { mockMatchMedia } from '../../../../../../tooling/testing/helpers/browser/match-media';
import { renderSurface } from '../../../../foundation/common/test-utils';
import {
  SurfaceCapabilityAnatomy,
  SurfaceErrorState,
  SurfaceLoadingState,
} from '..';
import {
  SurfaceEmptyStateCard,
  SurfaceLoadingSkeleton,
  SurfaceStaleBanner,
} from '../i18n/components';

const skinPath = join(
  __dirname,
  '../../../../../../foundation/tokens/css/presentation/components/skin/surface-states.css',
);

beforeEach(() => {
  mockMatchMedia(1280);
});

describe('Surface lifecycle states — R2+R3 ownership contract', () => {
  it('stamps anatomy only: no inline paint or typography remains', async () => {
    const { container } = renderSurface(
      <div>
        <SurfaceLoadingState title="Loading" description="Preparing" />
        <SurfaceErrorState error="Broken" onRetry={() => undefined} />
        <SurfaceEmptyStateCard title="Nothing" description="Create one" />
        <SurfaceStaleBanner message="Stale" onRefresh={() => undefined} />
        <SurfaceLoadingSkeleton rows={2} showHeader />
      </div>,
      // The ownership contract is Modern's (the only active engine); rustic
      // is frozen and keeps its historical inline behavior by design.
      { engine: 'modern' },
    );

    // Engines resolve behind suspense; wait for the full state anatomy.
    await waitFor(() => {
      expect(container.querySelector('.ds-empty-state-card [data-part="title"]')).not.toBeNull();
      expect(container.querySelector('.ds-loading-skeleton__header-primary')).not.toBeNull();
    });

    // Every part whose paint/typography moved to surface-states.css no longer
    // carries the drained property inline. (The Text primitive stamps its own
    // engine-level inline vars — that is its family's contract, not ours.)
    const drained: Array<[string, string[]]> = [
      ['.ds-loading-state [data-part="title"]', ['fontWeight']],
      ['.ds-error-state [data-part="title"]', ['fontWeight']],
      ['.ds-empty-state-card [data-part="content"]', ['padding']],
      ['.ds-empty-state-card [data-part="copy"]', ['textAlign']],
      ['.ds-empty-state-card [data-part="title"]', ['fontWeight', 'fontSize']],
      ['.ds-empty-state-card [data-part="description"]', ['fontSize']],
      ['.ds-stale-banner[data-part="banner"]', ['padding', 'fontSize']],
      ['.ds-stale-banner [data-part="description"]', ['flex']],
      ['.ds-loading-skeleton__header-primary', ['width', 'height']],
      ['.ds-loading-skeleton__header-secondary', ['width', 'height']],
    ];
    for (const [selector, properties] of drained) {
      const el = container.querySelector(selector) as HTMLElement | null;
      expect(el, selector).not.toBeNull();
      for (const property of properties) {
        expect(el!.style.getPropertyValue(property), `${selector} ${property}`).toBe('');
      }
    }
  });

  it('renders capability anatomy with catalog copy and skin-owned layout', async () => {
    const { container } = renderSurface(
      <SurfaceCapabilityAnatomy
        capabilities={[
          { kind: 'action', id: 'export', label: 'Export' },
          { kind: 'tab', id: 'kanban', disabled: true },
        ]}
      />,
      { engine: 'modern' },
    );

    let root: Element | null = null;
    await waitFor(() => {
      root = container.querySelector('[data-part="capability-anatomy"]');
      expect(root).not.toBeNull();
    });

    // EN catalog floors: surfaces.states.capability_label / capability_aria.
    expect(root).toHaveAttribute('aria-label', 'Registered surface capabilities');
    expect(root).toHaveTextContent('Available when data is retrieved');
    expect(root).not.toHaveAttribute('style');
    expect(container.querySelector('[data-part="capability-list"]')).not.toHaveAttribute('style');
    expect(
      container.querySelector('[data-part="capability"][data-disabled="true"]'),
    ).not.toHaveAttribute('style');
  });

  it('keeps the skin free of hardcoded color literals', () => {
    const skin = readFileSync(skinPath, 'utf-8');

    // The stale-banner fallbacks derive from --ds-color-info via color-mix;
    // no rgb()/rgba()/hex literal may paint a state surface.
    expect(skin).not.toMatch(/rgba?\(/);
    expect(skin).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(skin).toContain("[data-disabled='true']");
  });
});
