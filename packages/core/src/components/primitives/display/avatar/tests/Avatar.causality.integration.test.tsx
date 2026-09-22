/**
 * The avatar family in a real browser: the decisions its drained channels
 * consume move a destination's computed style with a negative control, across
 * the initials, image and group-surplus contexts, and no gated vertical mode
 * carries a serious axe finding beyond what is pinned.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernAvatar from '../engines/modern';
import { AvatarGroup } from '../compound';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type AvatarProps = React.ComponentProps<typeof ModernAvatar>;

const avatar = (props: Partial<AvatarProps>, label: React.ReactNode = 'AB') =>
  renderToStaticMarkup(<ModernAvatar {...(props as AvatarProps)}>{label}</ModernAvatar>);

const group = renderToStaticMarkup(
  <AvatarGroup max={2}>
    <ModernAvatar variant="primary">A</ModernAvatar>
    <ModernAvatar variant="success">B</ModernAvatar>
    <ModernAvatar variant="error">C</ModernAvatar>
  </AvatarGroup>,
);

const markup = [
  `<div id="primary">${avatar({ variant: 'primary' })}</div>`,
  `<div id="success">${avatar({ variant: 'success' }, 'CD')}</div>`,
  `<div id="square">${avatar({ variant: 'primary', shape: 'square' }, 'EF')}</div>`,
  `<div id="image">${avatar({ src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', alt: 'Portrait' })}</div>`,
  `<div id="group">${group}</div>`,
].join('');

const INITIALS = "#primary [data-part='fallback']";
const SQUARE = "#square [data-part='mask']";
const SURPLUS = "#group [data-part='surplus']";

describeCausality({
  family: 'avatar',
  markup,
  targets: [
    { id: 'initialsFill', selector: INITIALS, property: 'background-color' },
    { id: 'initialsTracking', selector: INITIALS, property: 'letter-spacing' },
    { id: 'squareCorner', selector: SQUARE, property: 'border-top-left-radius' },
    { id: 'surplusCorner', selector: SURPLUS, property: 'border-top-left-radius' },
  ],
  decisions: {
    // The palette reaches the tone the initials wear, and not the silhouette.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['initialsFill'],
      holds: 'squareCorner',
      in: VERTICALS,
    },
    // The radius dial reaches the square silhouette, and leaves the ink alone.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['squareCorner'],
      holds: 'initialsFill',
      in: VERTICALS,
    },
  },
});

/**
 * Measured ink debt, pinned by node IDENTITY. Registered, never excluded: the
 * solid tones a portrait falls back to do not clear the contrast floor against
 * their own initials. A mode-aware ink derivation for the tone ramp is the
 * fix.
 *
 * `.rottay-avatar-surplus` left `bithire light` and `evnto light` at the
 * supporting-ink re-grade (f73348ed5, 2026-09-21), which moved
 * `--ds-color-text-secondary` from `#A0A0A5` to `#5A5A61` in the default light
 * `:root`; the group-surplus counter inks from that rung and neither vertical
 * authors it. The fallback nodes that remain are family-owned tone ink, a
 * different mechanism, and are untouched.
 *
 * Measured 2026-09-22: the surviving rows above are byte-identical. Reverting
 * only `--ds-color-text-secondary` at HEAD returns exactly the node identities
 * dropped here, and the other two supporting rungs return none of them -- that
 * arm is the attribution, not the commit date. Dropped by identity, not
 * waived: a relapse of a dropped node reddens this map.
 *
 * The whole `bithire light` group and `evnto light` left with the initials-ink
 * repair (WO-INV-03 axe batch): the caller-ink rule resolved to a bare
 * `inherit` and out-ranked every variant step, so a solid fill painted
 * inherited body text -- primary initials measured 3.22:1 on bithire and
 * 1.02:1 on the-management. The variants now declare `--ds-avatar-ink-resting`
 * and the caller knob resolves through it (white initials: 5.55:1 and
 * 17.42:1). The two dark `success` rows are a different mechanism -- the
 * darkened success fill on a dark ground -- and are untouched.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'rottay dark': {
    'color-contrast': [
      '#success > .rottay-avatar[data-variant="success"][data-shape="circle"] > div[data-part="mask"] > div[data-part="fallback"]',
    ],
  },
  'bithire dark': {
    'color-contrast': [
      '#success > .rottay-avatar[data-variant="success"][data-shape="circle"] > div[data-part="mask"] > div[data-part="fallback"]',
    ],
  },
};

describe('avatar derived channels and accessibility', () => {
  it('derives the initials, the image and the group surplus from the family deriver', async () => {
    const r = (
      await measureArms({
        vertical: 'bithire',
        markup,
        arms: { base: {} },
        targets: [
          { id: 'primaryFill', selector: INITIALS, property: 'background-color' },
          { id: 'successFill', selector: "#success [data-part='fallback']", property: 'background-color' },
          { id: 'tracking', selector: INITIALS, property: 'letter-spacing' },
          { id: 'imageFit', selector: "#image [data-part='img']", property: 'object-fit' },
          { id: 'surplusCorner', selector: SURPLUS, property: 'border-top-left-radius' },
        ],
      })
    ).base!;
    // Two tones do not share a ground.
    expect(r.primaryFill).not.toBe(r.successFill);
    // The initials carry the family's own tracking, not the inherited normal.
    expect(r.tracking).not.toBe('normal');
    // A portrait fills its silhouette rather than stretching.
    expect(r.imageFit).toBe('cover');
    // The surplus counter is a silhouette of its own.
    expect(Number.parseFloat(r.surplusCorner)).toBeGreaterThan(0);
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
