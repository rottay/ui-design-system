/**
 * The nested `data-density` boundary, measured in a real browser against the
 * FULL emitted tenant artifact.
 *
 * `foundation/base/density` advertises `data-density` on ANY container as a
 * public, local setting, and redeclares the whole public spacing ramp on every
 * boundary precisely because a custom-property reference resolves on the
 * element that DECLARES it. The tenant artifact declares `--ds-stack-gap-<rung>`
 * once, at the tenant root, so a Stack rung read straight off that channel was
 * computed before any nested boundary existed and could never answer one. The
 * S19-A02 audit measured exactly that: a Modern Stack held one row-gap across
 * `comfortable` / `compact` / `spacious` while a sibling Flex moved.
 *
 * The probe below is the audit's scene, rebuilt on the productive door: three
 * sibling sections, one per density, each holding a named-`md` Stack and a
 * `gap="md"` Flex control. Flex is the POSITIVE control -- it resolves its rung
 * at the consumer (`--ds-flex-gap: var(--ds-spacing-4)` written inline by the
 * engine), so it reads the locally redeclared ramp and proves the boundary is
 * live in this page rather than merely stamped. Two negative controls keep the
 * repair honest: a caller's exact measurement is geometry and must NOT move,
 * and an explicitly declared `--ds-stack-gap-md` must still outrank the ramp.
 *
 * `measureArms` mounts the tenant-free source stylesheet plus the artifact the
 * compiler emits for the vertical, so what is measured here is the same CSS a
 * consumer ships, not a hand-written fixture.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernFlex from '../../flex/engines/modern';
import ModernStack from '../engines/modern';
import { measureArms } from '@tests/support/family-causality';

type StackProps = React.ComponentProps<typeof ModernStack>;

const DENSITIES = ['comfortable', 'compact', 'spacious'] as const;
type Density = (typeof DENSITIES)[number];

/** The local multipliers `foundation/base/density` declares for a boundary. */
const LOCAL_FACTOR: Record<Density, number> = {
  comfortable: 1,
  compact: 0.85,
  spacious: 1.15,
};

/** An explicit statement about the md rung, in the channel a tenant authors. */
const AUTHORED_MD = '20px';

function stack(props: Omit<StackProps, 'children'> = {}): string {
  return renderToStaticMarkup(
    <ModernStack {...props}>
      <span>One</span>
      <span>Two</span>
    </ModernStack>,
  );
}

function flex(): string {
  return renderToStaticMarkup(
    <ModernFlex gap="md">
      <span>One</span>
      <span>Two</span>
    </ModernFlex>,
  );
}

/** One density section: the family under test beside its consumer-resolved control. */
function section(density: Density): string {
  return [
    `<section data-density="${density}">`,
    `<div id="stack-${density}">${stack({ spacing: 'md' })}</div>`,
    `<div id="flex-${density}">${flex()}</div>`,
    `<div id="exact-${density}">${stack({ spacing: 21 })}</div>`,
    `<div id="authored-${density}" style="--ds-stack-gap-md: ${AUTHORED_MD}">${stack({ spacing: 'md' })}</div>`,
    '</section>',
  ].join('');
}

const markup = [
  // The tenant root reading: no boundary intervenes, so the re-base is 1.
  `<div id="stack-root">${stack({ spacing: 'md' })}</div>`,
  `<div id="flex-root">${flex()}</div>`,
  `<div id="authored-root" style="--ds-stack-gap-md: ${AUTHORED_MD}">${stack({ spacing: 'md' })}</div>`,
  ...DENSITIES.map(section),
].join('');

const ROOT = "[data-part='root']";

const targets = [
  { id: 'stackRoot', selector: `#stack-root ${ROOT}`, property: 'row-gap' },
  { id: 'flexRoot', selector: `#flex-root ${ROOT}`, property: 'column-gap' },
  { id: 'authoredRoot', selector: `#authored-root ${ROOT}`, property: 'row-gap' },
  ...DENSITIES.flatMap((density) => [
    { id: `stack-${density}`, selector: `#stack-${density} ${ROOT}`, property: 'row-gap' },
    { id: `flex-${density}`, selector: `#flex-${density} ${ROOT}`, property: 'column-gap' },
    { id: `exact-${density}`, selector: `#exact-${density} ${ROOT}`, property: 'row-gap' },
    { id: `authored-${density}`, selector: `#authored-${density} ${ROOT}`, property: 'row-gap' },
  ]),
];

const px = (value: string | undefined): number => Number.parseFloat(value ?? 'NaN');

describe('the Stack rung answers the density boundary it stands in', () => {
  it('reproduces the S19-A02 probe table green on the emitted bithire artifact', async () => {
    const { base } = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets,
    });
    const r = base!;

    // PRECONDITION: every reading matched something, and the control moves.
    // A page where the boundary is inert would make the whole table trivially
    // "equal" -- this is the leg that rules that out.
    for (const [id, value] of Object.entries(r)) {
      expect(value, id).not.toMatch(/^<no match/);
    }
    expect(px(r['flex-compact'])).toBeLessThan(px(r['flex-comfortable']));
    expect(px(r['flex-spacious'])).toBeGreaterThan(px(r['flex-comfortable']));

    // THE TABLE: per density, the Stack reads what the Flex reads. This is the
    // audit's measurement, and before the re-base the Stack column was the
    // single root value three times over.
    for (const density of DENSITIES) {
      expect(px(r[`stack-${density}`]), density).toBeCloseTo(px(r[`flex-${density}`]), 3);
    }

    // And the boundary genuinely moved the Stack, in the declared direction.
    expect(px(r['stack-compact'])).toBeLessThan(px(r['stack-comfortable']));
    expect(px(r['stack-spacious'])).toBeGreaterThan(px(r['stack-comfortable']));
    expect(px(r['stack-compact'])).toBeCloseTo(
      px(r['stack-comfortable']) * LOCAL_FACTOR.compact,
      3,
    );
    expect(px(r['stack-spacious'])).toBeCloseTo(
      px(r['stack-comfortable']) * LOCAL_FACTOR.spacious,
      3,
    );

    // NO BOUNDARY, NO CHANGE: the tenant-root reading is the untouched one, and
    // `comfortable` is the identity factor, so the two agree exactly.
    expect(px(r.stackRoot)).toBeCloseTo(px(r.flexRoot), 3);
    expect(r['stack-comfortable']).toBe(r.stackRoot);

    // NEGATIVE CONTROL: a caller's number is exact geometry on every density.
    for (const density of DENSITIES) {
      expect(r[`exact-${density}`], density).toBe('21px');
    }

    // NEGATIVE CONTROL: an explicit statement about the channel still outranks
    // the ramp -- unchanged at the root, and re-based by a boundary exactly as
    // every other value on that boundary is.
    expect(r.authoredRoot).toBe(AUTHORED_MD);
    for (const density of DENSITIES) {
      expect(px(r[`authored-${density}`]), density).toBeCloseTo(
        px(AUTHORED_MD) * LOCAL_FACTOR[density],
        3,
      );
    }
  }, 120_000);

  it('holds in every first-party vertical, not only the one the audit probed', async () => {
    for (const vertical of ['rottay', 'evnto'] as const) {
      const { base } = await measureArms({
        vertical,
        markup,
        arms: { base: {} },
        targets,
      });
      const r = base!;
      for (const density of DENSITIES) {
        expect(px(r[`stack-${density}`]), `${vertical} ${density}`).toBeCloseTo(
          px(r[`flex-${density}`]),
          3,
        );
      }
      expect(r.authoredRoot, vertical).toBe(AUTHORED_MD);
    }
  }, 180_000);
});
