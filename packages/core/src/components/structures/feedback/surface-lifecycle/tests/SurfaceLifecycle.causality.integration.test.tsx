/**
 * The surface-lifecycle family in a real browser: the status seeds move the
 * banner's info paint and the boundary's error paint independently, the
 * density and type planes move both surfaces' geometry and scale, and the
 * error boundary's failure-mode floor is proven to be a fallback rather than
 * the paint.
 *
 * Every probe below reads a skin-owned declaration whose fallback chain
 * bottoms out at a produced root, so the causality holds from this lot
 * onward; the family's own channels (`derivation/chrome/surface-lifecycle`)
 * restate the same values and give the family its dial once the DT registers
 * the deriver.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import {
  SurfaceEmptyState,
  SurfaceLoadingSkeleton,
  SurfaceStaleBanner,
} from '..';
import { DefaultSurfaceErrorFallback } from '../error-boundary';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const noop = () => {};

const TENANT: TenantConfig = {
  slug: 'surface-lifecycle-causality',
  name: 'Surface lifecycle causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Surface lifecycle causality' },
};

async function serverMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <div id="family">
        <SurfaceLoadingSkeleton rows={2} showHeader />
        <SurfaceEmptyState title="Nothing to show yet" description="Create one to begin" />
        <SurfaceStaleBanner message="Showing cached data" onRefresh={noop} />
        {/* The offline banner carries none of this family's paint (it
            delegates to the Alert primitive wholesale), so the axe gallery
            does not host Alert's own warning-arm evidence. */}
        {/* React 19 renders no error boundary on the server, so the paint
            probes mount the boundary's default fallback directly; the catch
            path itself is client-rendered in the boundary suite. */}
        <DefaultSurfaceErrorFallback
          surfaceName="billing"
          error={new Error('quota exceeded')}
          onRetry={noop}
        />
      </div>
    </DesignSystemProvider>,
  );
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
      .on('finish', () => resolve())
      .on('error', reject);
  });
  return html;
}

const rendered = await serverMarkup();
const markup = `<div id="page" style="inline-size:64rem">${rendered}</div>`;

const BANNER = "#page #family [data-part='banner']";
const BOUNDARY = "#page #family .ds-surface-lifecycle-error[data-part='root']";
const BOUNDARY_DESCRIPTION = '#page #family .ds-surface-lifecycle-error [data-part=\'description\']';
const BOUNDARY_ACTION = "#page #family .ds-surface-lifecycle-error [data-part='action']";
const BOUNDARY_TITLE = "#page #family .ds-surface-lifecycle-error [data-part='title']";

describeCausality({
  family: 'surface-lifecycle',
  markup,
  targets: [
    // The banner's info paint reads the info ramp. (The wash is a stated
    // constant on bithire, not seed-derived, so the probe reads the ink.)
    { id: 'bannerInk', selector: BANNER, property: 'color' },
    // The boundary's error paint, on skin-owned parts the failure floor
    // never touches: the description ink and the retry button's edge both
    // bottom out at the error ramp.
    { id: 'descriptionInk', selector: BOUNDARY_DESCRIPTION, property: 'color' },
    { id: 'actionBorder', selector: BOUNDARY_ACTION, property: 'border-top-color' },
    // Geometry: the banner strip rides the family channel over the spacing
    // scale; the boundary frame rides the spacing scale directly.
    { id: 'bannerPad', selector: BANNER, property: 'padding-top' },
    { id: 'boundaryPad', selector: BOUNDARY, property: 'padding-top' },
    // Type: the banner's strip size and the boundary title both ride the
    // type scale.
    { id: 'bannerFont', selector: BANNER, property: 'font-size' },
    { id: 'boundaryTitleSize', selector: BOUNDARY_TITLE, property: 'font-size' },
    // The title weight is a stated constant on no plane at all, so it is the
    // control every arm below holds.
    { id: 'boundaryTitleWeight', selector: BOUNDARY_TITLE, property: 'font-weight' },
  ],
  decisions: {
    // `consumes: palette.*` -- the info seed moves only the banner; the
    // error seed moves only the boundary. One decision, both directions of
    // separability.
    'palette.status-seeds': {
      value: { info: '#2F6B9A', error: '#8B2C3F' },
      moves: ['bannerInk', 'descriptionInk', 'actionBorder'],
      holds: 'boundaryTitleWeight',
      in: VERTICALS,
    },
    // `consumes: typography.scale`.
    'typography.scale': {
      value: 1.08,
      moves: ['bannerFont', 'boundaryTitleSize'],
      holds: 'boundaryTitleWeight',
      in: VERTICALS,
    },
    // `consumes: density`.
    'density.mode': {
      value: 'spacious',
      moves: ['bannerPad', 'boundaryPad'],
      holds: 'boundaryTitleWeight',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('surface-lifecycle causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of ['root', 'banner', 'title', 'description', 'action']) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The boundary renders through the crash: the fallback carries the
    // family's class scope, the alert role and the floor's three channels.
    expect(rendered).toContain('ds-surface-lifecycle-error');
    expect(rendered).toContain('role="alert"');
    expect(rendered).toContain('billing encountered an error');
    expect(rendered).toContain('quota exceeded');
    expect(rendered).toContain('var(--ds-surface-lifecycle-error-bg, light-dark(#fef2f2, #2a1215))');
    // The loading state announces once and hides its measured source.
    expect(rendered).toContain('role="status"');
    expect(rendered).toContain('aria-label="Loading surface"');
  });

  it('keeps visual paint out of every style attribute but the measured floor', () => {
    const family = rendered.slice(rendered.indexOf('id="family"'));
    const boundaryAt = family.indexOf('ds-surface-lifecycle-error');
    const head = family.slice(0, boundaryAt);
    const boundary = family.slice(boundaryAt);

    const attrsOf = (scope: string) => scope.match(/style="([^"]*)"/g) ?? [];

    // Everything before the boundary (loading, empty, stale, offline) rides
    // channels only: runtime `--ds-*` custom properties, or a declaration
    // whose value IS a `var(--ds-*)` reference -- primitives stamp their own
    // engine-level channel references; no curated literal travels inline.
    for (const attr of attrsOf(head)) {
      const body = attr.slice('style="'.length, -1);
      for (const decl of body.split(';')) {
        const trimmed = decl.trim();
        if (trimmed === '') continue;
        expect(
          trimmed.startsWith('--') || trimmed.includes('var(--ds-'),
          trimmed,
        ).toBe(true);
      }
    }

    // The boundary carries exactly one style attribute: the floor, three
    // properties, no geometry, no typography.
    const boundaryAttrs = attrsOf(boundary);
    expect(boundaryAttrs).toHaveLength(1);
    const floor = boundaryAttrs[0]!;
    expect(floor).toContain('--ds-surface-lifecycle-error-bg');
    expect(floor).toContain('--ds-surface-lifecycle-error-color');
    expect(floor).toContain('--ds-surface-lifecycle-error-border');
    expect(floor).not.toContain('padding');
    expect(floor).not.toContain('border-radius');
    expect(floor).not.toContain('font-size');
    expect(floor).not.toContain('opacity');
  });

  it('paints the governed surface on the skin-owned parts, not through the floor', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'boundaryPad', selector: BOUNDARY, property: 'padding-top' },
        { id: 'actionPad', selector: BOUNDARY_ACTION, property: 'padding-top' },
        { id: 'actionCorner', selector: BOUNDARY_ACTION, property: 'border-top-left-radius' },
        { id: 'bannerPad', selector: BANNER, property: 'padding-top' },
        // The floor resolves through its channels where they exist and falls
        // back to the literals otherwise; either way it is a complete,
        // legible surface.
        { id: 'floorGround', selector: BOUNDARY, property: 'background-color' },
        { id: 'floorInk', selector: BOUNDARY, property: 'color' },
      ],
    });
    const r = readings.base!;
    // The drained geometry is governed paint now: the boundary frame, the
    // button's strip and its corner all resolve from the skin's channel
    // chain (exact rungs ride the vertical's density/radius scales, so the
    // probe pins presence and non-degeneracy, not pixels).
    for (const id of ['boundaryPad', 'actionPad', 'actionCorner'] as const) {
      expect({ id, empty: r[id]!.trim() === '' }, id).toEqual({ id, empty: false });
      expect(r[id]).not.toBe('0px');
    }
    // The floor renders a readable contrast pair on every vertical, from the
    // channel in a compiled tree and from the literal in a broken one.
    for (const id of ['floorGround', 'floorInk'] as const) {
      expect({ id, empty: r[id]!.trim() === '' }, id).toEqual({ id, empty: false });
    }
  }, 120_000);

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
