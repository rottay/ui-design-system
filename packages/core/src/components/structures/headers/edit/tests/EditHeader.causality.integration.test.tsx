/**
 * The edit-header family in a real browser: every keypath its chrome deriver
 * declares in `consumes` is exercised against the family's OWN computed paint with
 * a negative control, the header-tone contract is proven to feed BOTH of this
 * family's toned slots from one authority, and axe holds beyond the pinned debt.
 *
 * Two toned slots matter here and not in the twin: the icon badge reads
 * `colorVariant` and the status pill reads `status.color`. Before this cut each
 * called its own copy of `getVariantTone` and each shipped its own inline custom
 * properties, so the two could have drifted with nothing to say so. They resolve
 * from one set of `--ds-header-tone-*` channels now, and the readings below are
 * that claim rather than a restatement of it.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { EditHeader } from '../index';
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

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" />;

const TENANT: TenantConfig = {
  slug: 'edit-header-causality',
  name: 'Edit header causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Edit header causality' },
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
      <div id="primary">
        <EditHeader
          icon={Icon}
          title="Edit entity"
          subtitle="The record this form edits"
          eyebrow="Entity"
          entityId="abcdef123456"
          backHref="/entities"
          colorVariant="primary"
          status={{ label: 'Published', color: 'success' }}
          dirty
          breadcrumb={[{ label: 'Entities', href: '/entities' }, { label: 'Detail' }]}
          actions={[{ label: 'Duplicate', kind: 'clone', onClick: noop }]}
          onSave={noop}
          onCancel={noop}
          contextRail={<span>Context</span>}
        >
          <span>Body</span>
        </EditHeader>
      </div>
      <div id="secondary">
        <EditHeader
          icon={Icon}
          title="Edit entity"
          backHref="/entities"
          colorVariant="secondary"
          status={{ label: 'Draft', color: 'secondary' }}
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

const PRIMARY = "#page #primary [data-part='root']";
const BADGE = "#page #primary [data-part='icon-badge']";
const NEUTRAL_BADGE = "#page #secondary [data-part='icon-badge']";
const PILL = "#page #primary [data-part='status-pill']";
const NEUTRAL_PILL = "#page #secondary [data-part='status-pill']";
const PILL_TEXT = "#page #primary [data-part='status-pill-text']";
const TITLE = "#page #primary [data-part='title']";
const HERO = "#page #primary [data-part='hero-panel']";
const BACK = "#page #primary [data-part='back-button']";
const HERO_ROW = "#page #primary [data-part='hero-row']";

describeCausality({
  family: 'edit-header',
  markup,
  targets: [
    // The two toned slots, each reading the contract's channels for its own tone.
    { id: 'badgeGround', selector: BADGE, property: 'background-color' },
    { id: 'pillGround', selector: PILL, property: 'background-color' },
    { id: 'pillInk', selector: PILL_TEXT, property: 'color' },
    // The h1 on the governed page-title role, through the family's own channel.
    { id: 'titleFont', selector: TITLE, property: 'font-size' },
    // The hero gutter rides the rhythm/density planes.
    { id: 'heroPad', selector: HERO, property: 'padding-top' },
    // The back chip's ring, resolved through the header contract's channel.
    { id: 'backRing', selector: BACK, property: '--ds-header-back-focus-ring' },
    // The badge's corner is a stated number on no plane at all, so it is the
    // control every arm below holds.
    { id: 'badgeRadius', selector: BADGE, property: 'border-top-left-radius' },
  ],
  decisions: {
    // `consumes: palette.*` -- the badge mixes the seeded primary; the pill is on
    // the STATUS ramp, so it stays put and proves the two tones are separable.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['badgeGround'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
    // `consumes: palette.*` the other way -- the status seed moves the pill.
    'palette.status-seeds': {
      value: { success: '#1F6B45' },
      moves: ['pillGround', 'pillInk'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
    // `consumes: typography.scale` + `typography.roles`.
    'typography.scale': {
      value: 1.08,
      moves: ['titleFont'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
    // `consumes: density`.
    'density.mode': {
      value: 'spacious',
      moves: ['heroPad'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
    // `consumes: spacing.rhythm`.
    'spacing.rhythm': {
      value: 'airy',
      moves: ['heroPad'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
    // The header CONTRACT's own keypath, shared with the twin family.
    'states.focus-style': {
      value: 'glow',
      moves: ['backRing'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('edit-header causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of [
      'root',
      'top-bar',
      'back-button',
      'back-icon',
      'back-label',
      'breadcrumb-divider',
      'breadcrumb-link',
      'breadcrumb-separator',
      'breadcrumb-item',
      'entity-id',
      'hero-panel',
      'hero-row',
      'hero-copy',
      'icon-badge',
      'icon-badge-glyph',
      'eyebrow',
      'title',
      'status-pill',
      'status-pill-text',
      'dirty-chip',
      'dirty-dot',
      'dirty-label',
      'subtitle',
      'actions',
      'action-icon',
      'context-card',
      'context-rail',
      'context-card-children',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // Both toned slots stamp, and the component writes no tone style at all.
    expect(rendered).toContain('data-variant="primary"');
    expect(rendered).toContain('data-variant="success"');
    expect(rendered).not.toContain('--ds-header-icon-tone-bg');
    expect(rendered).not.toContain('--ds-edit-header-status-tone-bg');
  });

  /**
   * One tone authority, two slots: the badge and the pill are toned by the same
   * contract, so a tone the two agree on paints the same and a tone they differ on
   * paints differently -- from the stylesheet, with no inline paint anywhere.
   */
  it('tones the badge and the status pill from one contract', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'primaryBadge', selector: BADGE, property: 'background-color' },
        { id: 'neutralBadge', selector: NEUTRAL_BADGE, property: 'background-color' },
        { id: 'successPill', selector: PILL, property: 'background-color' },
        { id: 'neutralPill', selector: NEUTRAL_PILL, property: 'background-color' },
        { id: 'badgeChannel', selector: BADGE, property: '--ds-header-icon-tone-bg' },
        { id: 'pillChannel', selector: PILL, property: '--ds-edit-header-status-tone-bg' },
        { id: 'neutralBadgeChannel', selector: NEUTRAL_BADGE, property: '--ds-header-icon-tone-bg' },
        { id: 'neutralPillChannel', selector: NEUTRAL_PILL, property: '--ds-edit-header-status-tone-bg' },
      ],
    });
    const r = readings.base!;
    // Different tones read differently, per slot.
    expect(r.primaryBadge).not.toBe(r.neutralBadge);
    expect(r.successPill).not.toBe(r.neutralPill);
    // The SAME tone reads identically in both slots: one authority, not two.
    expect(r.neutralBadgeChannel!.trim()).toBe(r.neutralPillChannel!.trim());
    expect(r.neutralBadge).toBe(r.neutralPill);
    // And each resolves from the contract rather than from a fallback nobody writes.
    expect(r.badgeChannel!.trim()).not.toBe('');
    expect(r.pillChannel!.trim()).not.toBe('');
  }, 120_000);

  /**
   * Hover is decided by the kernel and read off `data-state`, with the platform
   * pseudo as the fallback arm of the same rule.
   */
  it('lifts the back chip from the kernel state token, not only from :hover', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'resting', selector: BACK, property: 'background-color' },
        {
          id: 'hovered',
          selector: BACK,
          property: 'background-color',
          attributes: { 'data-state': 'hovered' },
        },
        {
          id: 'pressed',
          selector: BACK,
          property: 'background-color',
          attributes: { 'data-state': 'pressed' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.hovered).not.toBe(r.resting);
    expect(r.pressed).not.toBe(r.resting);
  }, 120_000);

  /**
   * The channels this cut PRODUCED rather than left to a fallback nobody writes.
   */
  it('resolves every channel the family deriver produces', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'filter', selector: PRIMARY, property: '--ds-edit-header-context-card-filter' },
        { id: 'titleSize', selector: PRIMARY, property: '--ds-edit-header-title-font-size' },
        { id: 'titleCompact', selector: PRIMARY, property: '--ds-edit-header-title-font-size-compact' },
        { id: 'rowGapChannel', selector: PRIMARY, property: '--ds-edit-header-hero-row-gap' },
        { id: 'rowGap', selector: HERO_ROW, property: 'row-gap' },
      ],
    });
    const r = readings.base!;
    for (const id of ['filter', 'titleSize', 'titleCompact', 'rowGapChannel']) {
      expect({ id, empty: r[id]!.trim() === '' }, id).toEqual({ id, empty: false });
    }
    // The row gap the Flex prop used to carry, unchanged, now on a named channel.
    expect(r.rowGap).toBe('20px');
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
