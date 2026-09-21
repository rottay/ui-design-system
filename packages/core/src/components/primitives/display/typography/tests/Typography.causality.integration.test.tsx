/**
 * The typography compounds in a real browser: the decisions the family declares
 * move the computed style of the right compound with a negative control; the
 * tier ramp resolves to the exact values the engine used to paint inline; and
 * no role's ink carries a serious axe finding beyond what is pinned.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ModernHeading, ModernText, ModernParagraph, ModernLink } from '../engines/modern';
import type { TextSize } from '../contracts';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const SIZES: readonly TextSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

const markup = [
  ...SIZES.map((s) => `<div id="h-${s}">${renderToStaticMarkup(<ModernHeading size={s}>Heading Aa</ModernHeading>)}</div>`),
  `<div id="t">${renderToStaticMarkup(<ModernText size="md">Inline text</ModernText>)}</div>`,
  `<div id="p">${renderToStaticMarkup(<ModernParagraph size="md">Paragraph copy</ModernParagraph>)}</div>`,
  `<div id="l">${renderToStaticMarkup(<ModernLink href="#">A link</ModernLink>)}</div>`,
  `<div id="muted">${renderToStaticMarkup(<ModernText color="muted">Muted</ModernText>)}</div>`,
  `<div id="subtle">${renderToStaticMarkup(<ModernText color="secondary">Subtle</ModernText>)}</div>`,
].join('');

const HEAD = (s: TextSize) => `#h-${s} [data-part='root']`;

describeCausality({
  family: 'typography',
  markup,
  targets: [
    { id: 'headingSize', selector: HEAD('md'), property: 'font-size' },
    { id: 'headingWeight', selector: HEAD('md'), property: 'font-weight' },
    { id: 'headingLeading', selector: HEAD('md'), property: 'line-height' },
    { id: 'linkInk', selector: "#l [data-part='root']", property: 'color' },
  ],
  decisions: {
    // The type dial scales the ramp the tier reads.
    'typography.scale': { value: 1.08, moves: ['headingSize', 'headingLeading'], holds: 'linkInk', in: VERTICALS },
    // The role ladder reaches the weight the heading binds from its role.
    'typography.role-weights': { value: 'light', moves: ['headingWeight'], holds: 'linkInk', in: VERTICALS },
  },
});

/**
 * The ramp the engine used to paint inline, now read from the tier channels.
 * `xs` and `sm` declare no tracking of their own and inherit it, which is why
 * only the leading is stated for them -- and since R5 (F2.9) they emit no
 * tracking channel at all: the two `0` emissions had no reader in any of the
 * four repos, and a second tracking authority worth `0` can only fight the
 * governed heading role it was supposed to defer to. The inherited route is
 * probed below rather than assumed.
 *
 * MEASURED GAP, registered rather than forced: no kit decision moves
 * `--ds-type-tier-*` today. The channels exist so the ramp HAS an owner a
 * decision can reach; naming which decision owns it is the catalog lane's call,
 * and this suite states the gap instead of pretending it is covered.
 */
const TIER_RAMP: Readonly<Record<string, readonly [leading: string, tracking: string | null]>> = {
  xs: ['1.4', null],
  sm: ['1.3', null],
  md: ['1.25', '-0.01em'],
  lg: ['1.2', '-0.015em'],
  xl: ['1.15', '-0.02em'],
  '2xl': ['1.1', '-0.025em'],
  '3xl': ['1.1', '-0.025em'],
};

/**
 * Measured ink debt, pinned by node IDENTITY. Registered, never excluded.
 *
 * What WAS left was ONE ladder: `--ds-color-text-secondary` (#A0A0A5) and
 * `--ds-color-muted`, which cleared no text floor on a light canvas -- 2.60:1
 * on bithire's white and 2.49:1 on evnto's #fafafa. The supporting-ink regrade
 * (f73348ed5) lifted both rungs over the floor on every light scope, so both
 * pin rows drained on the measured suite rerun (a relapse reddens this pin).
 * DROPPED BY IDENTITY, both genuinely repaired (a relapse reddens this pin):
 *  - `rottay dark: a` and `bithire dark: a` -- the link took its ink from
 *    `--ds-color-primary`, the raw seed, which is a BRAND statement and not a
 *    contrast one: it measured 1.04:1 on rottay's dark ground and 3.56:1 on
 *    bithire's. The link now reads `--ds-color-link`, the channel that already
 *    existed for it, and that channel is derived against the canvas the block
 *    compiles for.
 *  - the ten `bithire dark` ground-ink rows -- drained upstream by the
 *    mode-canvas repair (4f7d46751), measured absent at HEAD before this cut.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('typography ramp and accessibility', () => {
  it.each(VERTICALS)('resolves the tier ramp to its declared stops in %s', async (vertical) => {
    const readings = await measureArms({
      vertical,
      markup,
      arms: { base: {} },
      targets: SIZES.flatMap((s) => [
        { id: `${s}-leading`, selector: HEAD(s), property: '--ds-type-tier-' + s + '-line-height' },
        ...(TIER_RAMP[s][1] === null
          ? []
          : [{ id: `${s}-tracking`, selector: HEAD(s), property: '--ds-type-tier-' + s + '-letter-spacing' }]),
        { id: `${s}-computed-leading`, selector: HEAD(s), property: 'line-height' },
        { id: `${s}-computed-size`, selector: HEAD(s), property: 'font-size' },
      ]),
    });
    const r = readings.base!;
    for (const size of SIZES) {
      const [leading, tracking] = TIER_RAMP[size];
      expect(r[`${size}-leading`].trim(), size).toBe(leading);
      if (tracking) expect(r[`${size}-tracking`].trim(), size).toBe(tracking);
      // The channel is not merely declared: the tier's leading is what the
      // element computes, to the pixel its own size implies.
      const px = Number.parseFloat(r[`${size}-computed-size`]) * Number.parseFloat(leading);
      expect(Number.parseFloat(r[`${size}-computed-leading`])).toBeCloseTo(px, 2);
    }
  }, 300_000);

  /**
   * The route the two retired `xs`/`sm` tracking channels were standing in
   * front of: a small heading takes its tracking from the governed heading
   * role, and the tier ramp only takes over from `md` up.
   *
   * bithire is the witness that makes this unambiguous rather than a
   * coincidence: its role tracking is POSITIVE (`0.01em`) while the `md` tier
   * channel is negative (`-0.01em`), so the two sources cannot be confused for
   * each other in a computed reading. The `type` arm is the causality half --
   * it moves the role and `xs`/`sm` follow it, while `md` does not budge
   * because the tier owns `md` outright.
   */
  it.each(VERTICALS)('leaves small-heading tracking on the governed role in %s, with the tier owning md up', async (vertical) => {
    const r = await measureArms({
      vertical,
      markup,
      arms: { base: {}, type: { 'typography.pairing': 'editorial' } },
      targets: (['xs', 'sm', 'md'] as const).flatMap((s) => [
        { id: `${s}-role`, selector: HEAD(s), property: '--ds-typography-heading-letter-spacing' },
        { id: `${s}-tier`, selector: HEAD(s), property: `--ds-type-tier-${s}-letter-spacing` },
        { id: `${s}-tracking`, selector: HEAD(s), property: 'letter-spacing' },
        { id: `${s}-size`, selector: HEAD(s), property: 'font-size' },
      ]),
    });
    // Both readings are a signed number with a unit suffix; the conversion
    // below is `em x font-size px`, which is what the browser computed.
    const num = (reading: string) => Number.parseFloat(reading);

    // Retired: the two small tiers declare no tracking channel of their own.
    expect(r.base!['xs-tier']!.trim()).toBe('');
    expect(r.base!['sm-tier']!.trim()).toBe('');
    expect(r.base!['md-tier']!.trim()).toBe('-0.01em');

    // Effective: what they paint at rest is the ROLE, to the pixel their own
    // size implies -- not `normal`, and not a leftover zero.
    for (const size of ['xs', 'sm'] as const) {
      expect(r.base![`${size}-tracking`], `${vertical} ${size}`).not.toBe('normal');
      expect(num(r.base![`${size}-tracking`]!)).toBeCloseTo(
        num(r.base![`${size}-role`]!) * num(r.base![`${size}-size`]!),
        4,
      );
    }
    // …and `md` is on the tier instead, which is why its reading can differ in
    // SIGN from the role that governs the two tiers below it.
    expect(num(r.base!['md-tracking']!)).toBeCloseTo(num(r.base!['md-tier']!) * num(r.base!['md-size']!), 4);

    // Causal: the arm moves the role, the small tiers move with it, `md` holds.
    expect(r.type!['xs-role']).not.toBe(r.base!['xs-role']);
    expect(r.type!['xs-tracking']).not.toBe(r.base!['xs-tracking']);
    expect(r.type!['sm-tracking']).not.toBe(r.base!['sm-tracking']);
    expect(r.type!['md-tracking']).toBe(r.base!['md-tracking']);
  }, 300_000);

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
