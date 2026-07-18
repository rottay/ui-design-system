/**
 * @fileoverview Two tenants of one vertical must read as two companies, and
 * still as the same product (WO-ENG-18).
 *
 * Both halves are proven here, not by eye. The commercial promise is that a
 * customer can buy a genuinely customized experience; the architectural promise
 * is that it is still BitHire. A test that only checks the first would pass for
 * a fork, and a test that only checks the second would pass for a hue rotation.
 *
 * The expectation is anchored on the compiled BrandTheme, never on a `--ds-*`
 * variable read back off `<html>`. That read only proves a component consumes
 * the variable: a later, more specific rule can overwrite it and the component
 * and the read move together while the tenant's value is silently gone. That
 * lesson cost this program a whole probe (WO-GAT-03).
 */

import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '../index';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes';
import { themanagementmiamiBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/fixtures/themanagementmiami';
import { resolveEngine } from '@/infrastructure/runtime/engines/runtime/resolution';
import { getVerticalPreset } from '@/foundation/presets/verticals';

const bithire = compileBrandTheme({ brandTheme: bithireBrandTheme });
const themanagement = compileBrandTheme({ brandTheme: themanagementmiamiBrandTheme });

/**
 * The bounded channels a tenant owns. Every one must differ, or the tenant is
 * wearing the vertical's clothes.
 *
 * Deliberately spread across the six axes a customer can feel -- colour, corner,
 * type, depth, motion, and surface -- because a divergence that is only colour
 * is a hue rotation, and this program has been burned by counters that were
 * green for the wrong reason.
 */
const BOUNDED_CHANNELS: readonly string[] = [
  // colour
  '--ds-color-primary',
  '--ds-button-primary-bg',
  // corner
  '--ds-radius-sm',
  '--ds-radius-md',
  '--ds-radius-lg',
  '--ds-radius-xl',
  // type
  '--ds-font-family-base',
  '--ds-font-family-heading',
  // depth
  '--ds-shadow-md',
  '--ds-shadow-lg',
  // surface
  '--ds-color-bg-primary',
  '--ds-card-bg',
  '--ds-input-bg',
];

/**
 * Structural strings that MUST match. These are formulas, not values: the tint
 * scale is `color-mix(in oklch, var(--ds-color-primary) N%, var(--ds-color-bg-primary))`,
 * so two tenants share the expression and resolve it differently. If a tenant
 * ever compiled a literal here, the scale would stop deriving from its palette
 * and this assertion is what would catch it.
 */
const DERIVED_FORMULAS: readonly string[] = ['--ds-tint-4', '--ds-tint-12', '--ds-tint-24'];

describe('two tenants of the bithire vertical diverge on every bounded channel', () => {
  it.each(BOUNDED_CHANNELS)('%s differs between bithire and themanagementmiami', (channel) => {
    const left = bithire.cssVariables[channel];
    const right = themanagement.cssVariables[channel];

    // A channel neither tenant declares would pass a naive inequality check by
    // being undefined on both sides. Prove both are present before comparing.
    expect(left, `bithire does not declare ${channel}`).toBeDefined();
    expect(right, `themanagementmiami does not declare ${channel}`).toBeDefined();
    expect(right, `${channel} is identical, so this tenant is wearing the vertical's clothes`).not.toBe(left);
  });

  it('the divergence is not a hue rotation', () => {
    // Colour alone is the cheap kind of different. A customer feels the corner
    // radius, the typeface and the shadow before they name the hue.
    expect(themanagement.cssVariables['--ds-radius-md']).not.toBe(bithire.cssVariables['--ds-radius-md']);
    expect(themanagement.cssVariables['--ds-font-family-heading']).not.toBe(
      bithire.cssVariables['--ds-font-family-heading']
    );
    expect(themanagement.cssVariables['--ds-shadow-md']).not.toBe(bithire.cssVariables['--ds-shadow-md']);
  });

  it('personality diverges on elevation, border treatment and motion', () => {
    expect(themanagement.personality.card.defaultElevation).not.toBe(bithire.personality.card.defaultElevation);
    expect(themanagement.personality.card.showBorder).not.toBe(bithire.personality.card.showBorder);
    expect(themanagement.personality.animation.entrance).not.toBe(bithire.personality.animation.entrance);
  });

  it('a large majority of the compiled surface actually moves', () => {
    // A weak theme could satisfy every named channel above and leave the other
    // three hundred variables identical. Measured at authoring time: 281 of 371
    // compiled variables differ. The floor is deliberately below that, so a
    // future theme edit does not fail this test for a value it did not change,
    // but far above a hue rotation.
    const keys = new Set([...Object.keys(bithire.cssVariables), ...Object.keys(themanagement.cssVariables)]);
    const differing = [...keys].filter((k) => bithire.cssVariables[k] !== themanagement.cssVariables[k]);
    expect(differing.length / keys.size).toBeGreaterThan(0.5);
  });
});

describe('and converge on the identity of the product they both are', () => {
  it.each(DERIVED_FORMULAS)('%s is the same formula for both, so each resolves against its own palette', (channel) => {
    expect(themanagement.cssVariables[channel]).toBe(bithire.cssVariables[channel]);
    expect(bithire.cssVariables[channel]).toContain('color-mix');
  });

  it('both render the engine their vertical declares', () => {
    const vertical = getVerticalPreset('bithire');
    expect(vertical?.engine).toBe('modern');

    for (const slug of ['bithire', 'themanagementmiami']) {
      expect(resolveEngine({ verticalEngine: vertical?.engine, tenantSlug: slug })).toBe('modern');
    }
  });

  it('a tenant cannot move the vertical it belongs to', () => {
    // `vertical`, `engine` and `productProfile` are static-first by law
    // (CLAUDE.md). Neither BrandTheme carries any of them, and the compiler has
    // nowhere to put them: that is the guarantee, and this asserts the shape of
    // it rather than trusting the prose.
    for (const theme of [bithireBrandTheme, themanagementmiamiBrandTheme]) {
      expect(theme).not.toHaveProperty('vertical');
      expect(theme).not.toHaveProperty('engine');
      expect(theme).not.toHaveProperty('productProfile');
    }
  });
});
