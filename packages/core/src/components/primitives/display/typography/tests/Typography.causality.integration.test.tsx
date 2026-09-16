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
 * only the leading is stated for them.
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
 * Measured ink debt, pinned by node IDENTITY. Registered, never excluded, and
 * NOT caused by this cut: the computed style of every compound and tier is
 * byte-identical to what it was before the ramp moved owner, so these are the
 * inks the family already rendered. The muted and secondary tones fail the
 * floor in three scopes; bithire's dark ground fails it for the whole family.
 * A mode-aware ink derivation is the fix, never an axe exclusion.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'rottay dark': { 'color-contrast': ['a'] },
  'bithire light': {
    'color-contrast': ['span[data-color="muted"]', 'span[data-color="secondary"]'],
  },
  'bithire dark': {
    'color-contrast': [
      '#t > span',
      'h2[data-size="2xl"]',
      'h2[data-size="3xl"]',
      'h2[data-size="lg"]',
      'h2[data-size="md"]',
      'h2[data-size="sm"]',
      'h2[data-size="xl"]',
      'h2[data-size="xs"]',
      'p',
      'span[data-color="muted"]',
      'span[data-color="secondary"]',
    ],
  },
  'evnto light': {
    'color-contrast': ['span[data-color="muted"]', 'span[data-color="secondary"]'],
  },
};

describe('typography ramp and accessibility', () => {
  it.each(VERTICALS)('resolves the tier ramp to its declared stops in %s', async (vertical) => {
    const readings = await measureArms({
      vertical,
      markup,
      arms: { base: {} },
      targets: SIZES.flatMap((s) => [
        { id: `${s}-leading`, selector: HEAD(s), property: '--ds-type-tier-' + s + '-line-height' },
        { id: `${s}-tracking`, selector: HEAD(s), property: '--ds-type-tier-' + s + '-letter-spacing' },
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

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
