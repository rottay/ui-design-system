/**
 * `structure/feedback/surface-lifecycle` -- the family's ownership contract.
 *
 * Two things are asserted here that the components alone cannot state:
 *
 *   1. ONE COMPONENT PER ROLE. The lifecycle used to ship twice -- a card set
 *      and an older trio -- so three of the five roles had two public
 *      components and two anatomies to skin. The barrel census below is the
 *      executable form of the owner ruling that ended that: five states, one
 *      machine, one boundary, and nothing else.
 *   2. THE DRAIN. Every paint and typography value the components used to
 *      carry inline lives in `surface-states.css`; the components stamp
 *      anatomy only.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { mockMatchMedia } from '../../../../../../tooling/testing/helpers/browser/match-media';
import { renderSurface } from '../../../../../surfaces/foundation/common/test-utils';
import { hasSurfaceError } from '../../../../foundation/chrome/runtime/errors';
import * as surfaceLifecycle from '../..';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
  SurfaceOfflineBanner,
  SurfaceStaleBanner,
} from '..';

const skinPath = join(
  __dirname,
  '../../../../../../foundation/tokens/css/presentation/components/skin/surface-states.css',
);

beforeEach(() => {
  mockMatchMedia(1280);
});

describe('the family census -- one component per lifecycle role', () => {
  it('publishes exactly five states, the machine, and the boundary', () => {
    expect(Object.keys(surfaceLifecycle).sort()).toEqual([
      'SurfaceEmptyState',
      'SurfaceErrorBoundary',
      'SurfaceErrorState',
      'SurfaceLoadingSkeleton',
      'SurfaceOfflineBanner',
      'SurfaceStaleBanner',
      'useSurfaceState',
    ]);
  });

  it('keeps no alias for a converged name', () => {
    // The three retired duplicates. A re-export shim under any of these names
    // would reopen the two-vocabulary defect the convergence closed.
    for (const retired of [
      'SurfaceLoadingState',
      'SurfaceEmptyStateCard',
      'SurfaceErrorStateCard',
    ]) {
      expect(surfaceLifecycle, retired).not.toHaveProperty(retired);
    }
  });
});

describe('Surface lifecycle state chrome -- R2+R3 ownership contract', () => {
  it('stamps anatomy only: no inline paint or typography remains', async () => {
    const { container } = renderSurface(
      <div>
        <SurfaceEmptyState title="Nothing" description="Create one" />
        <SurfaceStaleBanner message="Stale" onRefresh={() => undefined} />
        <SurfaceLoadingSkeleton rows={2} showHeader />
        <SurfaceErrorState error="Broken" onRetry={() => undefined} />
      </div>,
      // The ownership contract is Modern's (the only active engine); rustic
      // is frozen and keeps its historical inline behavior by design.
      { engine: 'modern' },
    );

    // Engines resolve behind suspense; wait for the full state anatomy.
    await waitFor(() => {
      expect(container.querySelector('.ds-empty-state')).not.toBeNull();
      expect(container.querySelector('.ds-loading-skeleton__header-primary')).not.toBeNull();
      expect(container.querySelector('.ds-error-state [data-part="title"]')).not.toBeNull();
    });

    // Every part whose paint/typography moved to surface-states.css no longer
    // carries the drained property inline. (The Text primitive stamps its own
    // engine-level inline vars -- that is its family's contract, not ours.)
    const drained: Array<[string, string[]]> = [
      ['.ds-stale-banner[data-part="banner"]', ['padding', 'fontSize']],
      ['.ds-stale-banner [data-part="description"]', ['flex']],
      ['.ds-loading-skeleton__header-primary', ['width', 'height']],
      ['.ds-loading-skeleton__header-secondary', ['width', 'height']],
      ['.ds-error-state [data-part="title"]', ['fontWeight']],
    ];
    for (const [selector, properties] of drained) {
      const el = container.querySelector(selector) as HTMLElement | null;
      expect(el, selector).not.toBeNull();
      for (const property of properties) {
        expect(el!.style.getPropertyValue(property), `${selector} ${property}`).toBe('');
      }
    }
  });
});

describe('SurfaceErrorState -- error?: unknown surfaces a message, never a stack', () => {
  /**
   * This is also the live proof that the family reaches its error contract
   * from the structures tier. `normalizeSurfaceError` lives at
   * `structures/foundation/chrome/runtime/errors`; if the import pointed up at
   * `ui/surfaces/runtime/helpers`, the tier order would be broken and this
   * render would be the first thing to notice.
   */
  it('shows the message of an Error without printing its stack frames', async () => {
    const error = new Error('Surface exploded');
    const { container } = renderSurface(<SurfaceErrorState error={error} />, {
      engine: 'modern',
    });

    await waitFor(() => expect(container.textContent).toContain('Surface exploded'));
    // A stack frame is `at <fn> (<file>:<line>:<col>)`; no rendered text may carry one.
    expect(error.stack).toBeTruthy();
    expect(container.textContent ?? '').not.toMatch(/\bat .+:\d+:\d+/);
  });

  it('treats 0 as a caught value and renders it', async () => {
    expect(hasSurfaceError(0)).toBe(true);
    const { container } = renderSurface(<SurfaceErrorState error={0} />, { engine: 'modern' });

    await waitFor(() => expect(container.textContent).toContain('0'));
  });

  it.each([
    ['empty string', ''],
    ['false', false],
  ])('treats %s as caught but unrenderable and falls back', async (_label, value) => {
    expect(hasSurfaceError(value)).toBe(true);
    const { container } = renderSurface(<SurfaceErrorState error={value} />, {
      engine: 'modern',
    });

    await waitFor(() =>
      expect(container.textContent).toContain('Something went wrong while rendering this surface.'),
    );
  });

  it('renders a ReactNode title alongside a normalized message', async () => {
    const { container } = renderSurface(
      <SurfaceErrorState error={new Error('Boom')} title={<span>Custom title</span>} />,
      { engine: 'modern' },
    );

    await waitFor(() => expect(container.textContent).toContain('Custom title'));
    expect(container.textContent).toContain('Boom');
  });

  /**
   * `description` is the one prop `SurfaceErrorState` absorbed from the retired
   * `SurfaceErrorStateCard`. It is the reason that component's contract was
   * worth preserving: it lets a caller show a safe sentence when the caught
   * error carries internal detail.
   */
  it('prefers an explicit description over the normalized error message', async () => {
    const { container } = renderSurface(
      <SurfaceErrorState error={new Error('Raw internal detail')} description="Try again shortly." />,
      { engine: 'modern' },
    );

    await waitFor(() => expect(container.textContent).toContain('Try again shortly.'));
    expect(container.textContent ?? '').not.toContain('Raw internal detail');
  });
});

describe('SurfaceOfflineBanner', () => {
  it('renders the caller message while cached data is on screen', async () => {
    const { container } = renderSurface(
      <SurfaceOfflineBanner message="Connection lost" showCachedNotice />,
      { engine: 'modern' },
    );

    await waitFor(() => expect(container.textContent).toContain('Connection lost'));
  });
});

describe('surface-states.css', () => {
  it('keeps the skin free of hardcoded color literals', () => {
    const skin = readFileSync(skinPath, 'utf-8');

    // The stale-banner fallbacks derive from --ds-color-info via color-mix;
    // no rgb()/rgba()/hex literal may paint a state surface.
    expect(skin).not.toMatch(/rgba?\(/);
    expect(skin).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(skin).toContain("[data-disabled='true']");
  });

  it('paints no anatomy for a component that no longer exists', () => {
    // Rules only: the file's header names both retired anatomies to explain
    // why they were dropped, and that prose must not read as a live rule.
    const rules = readFileSync(skinPath, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');

    // `.ds-loading-state` and `.ds-empty-state-card` were the two retired
    // anatomies. Leaving their rules behind would keep the skin describing a
    // second lifecycle vocabulary the source no longer renders.
    expect(rules).not.toContain('ds-loading-state');
    expect(rules).not.toContain('ds-empty-state-card');
    // The surviving skeleton anatomy must not have been dropped with them.
    expect(rules).toContain('ds-loading-skeleton__header-primary');
  });
});
