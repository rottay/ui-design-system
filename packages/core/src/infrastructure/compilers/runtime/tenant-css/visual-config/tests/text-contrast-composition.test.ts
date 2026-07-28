/**
 * @fileoverview AD-7 T7 -- the value APCA validates is the value the generator
 * ships.
 *
 * The pass used to run over the appearance slice alone, so any pair composed
 * from another layer reached the stylesheet unverified: a button ink authored
 * in `brandTheme.chrome` was never seen, and an appearance foreground could be
 * validated against a ground a lower layer then replaced. The pass now runs
 * over the composed map, which makes the emitted block a FIXED POINT of the
 * pass -- the property these tests assert, with a planted divergence proving
 * the assertion is falsifiable rather than vacuous.
 */

import { describe, expect, it } from 'vitest';

import type { TenantConfig } from '../../../../../../foundation/contracts';
import {
  APCA_BODY_TEXT_MIN_LC,
  apcaContrast,
} from '@/foundation/kernel/accessibility/branding-contrast';
import { enforceTextContrast } from '@/foundation/kernel/accessibility/branding-contrast/text-contrast-autocorrect';
import { compileAppearanceVariables } from '@/infrastructure/compilers/kernel/runtime/appearance';
import { buildTenantSelector, generateTenantCss } from '..';

/** A button ink that cannot be read on its own background. */
const UNREADABLE_INK = '#EEEEEE';
const BUTTON_GROUND = '#FFFFFF';

/**
 * A tenant whose failing pair lives entirely in compiled chrome, with NO
 * appearance document -- exactly the shape the old appearance-slice pass was
 * blind to.
 */
const CHROME_TENANT: TenantConfig = {
  slug: 'apca-shipped',
  name: 'APCA Shipped',
  engine: 'modern',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'APCA Shipped' },
  brandTheme: {
    id: 'apca-shipped-brand',
    name: 'APCA Shipped Brand',
    palette: { primaryColor: '#3A6FB0', backgroundColor: BUTTON_GROUND },
    chrome: {
      controls: {
        buttonPrimary: { bg: BUTTON_GROUND, color: UNREADABLE_INK },
      },
    },
  },
};

function readBlock(css: string, selectorFragment: string): Record<string, string> {
  const selectorAt = css.indexOf(selectorFragment);
  expect(selectorAt).toBeGreaterThan(-1);
  const open = css.indexOf('{', selectorAt);
  const close = css.indexOf('}', open);
  const declarations: Record<string, string> = {};
  for (const line of css.slice(open + 1, close).split('\n')) {
    const match = /^\s*(--[\w-]+):\s*(.+);$/.exec(line);
    if (match) declarations[match[1]] = match[2];
  }
  return declarations;
}

const SELECTOR = buildTenantSelector(CHROME_TENANT.slug);

describe('T7 -- APCA runs on the shipped values', () => {
  it('corrects a failing pair that only exists after the layers are composed', () => {
    const light = readBlock(
      generateTenantCss(CHROME_TENANT, {
        includeDarkSelector: false,
        includeSystemDarkSelector: false,
      }),
      SELECTOR,
    );

    expect(light['--ds-button-primary-bg']).toBe(BUTTON_GROUND);
    expect(light['--ds-button-primary-color']).not.toBe(UNREADABLE_INK);
    expect(
      Math.abs(apcaContrast(light['--ds-button-primary-color'], light['--ds-button-primary-bg'])),
    ).toBeGreaterThanOrEqual(APCA_BODY_TEXT_MIN_LC);
  });

  it('is invisible to the appearance-slice-only pass the hookup replaced', () => {
    // The old input: this tenant has no appearance document at all, so the
    // slice the pass used to see is empty and the failing pair never appears
    // in it. That is the defect, stated as a value.
    const oldPassInput = CHROME_TENANT.appearance
      ? compileAppearanceVariables(CHROME_TENANT.appearance).variables
      : {};

    expect(oldPassInput['--ds-button-primary-color']).toBeUndefined();
    expect(enforceTextContrast(oldPassInput, {}).adjustments).toHaveLength(0);
  });

  it('emits a light block that is a fixed point of the pass', () => {
    const light = readBlock(
      generateTenantCss(CHROME_TENANT, {
        includeDarkSelector: false,
        includeSystemDarkSelector: false,
      }),
      SELECTOR,
    );

    const revalidated = enforceTextContrast(light, {
      general: { palette: { backgroundMode: 'light' } },
    });

    expect(revalidated.adjustments).toEqual([]);
    expect(revalidated.variables).toEqual(light);
  });

  it('emits a dark block that is a fixed point of the pass', () => {
    const dark = readBlock(generateTenantCss(CHROME_TENANT), `${SELECTOR}[data-theme='dark']`);

    const revalidated = enforceTextContrast(dark, {
      general: { palette: { backgroundMode: 'dark' } },
    });

    expect(revalidated.adjustments).toEqual([]);
    expect(revalidated.variables).toEqual(dark);
  });

  it('DRILL: a planted post-merge divergence breaks the fixed point', () => {
    const light = readBlock(
      generateTenantCss(CHROME_TENANT, {
        includeDarkSelector: false,
        includeSystemDarkSelector: false,
      }),
      SELECTOR,
    );

    // Simulate a layer writing an unverified ink after the pass -- the exact
    // failure mode the appearance-slice-only hookup allowed. If the fixed-point
    // assertions above could not see this, they would be vacuous.
    const diverged = { ...light, '--ds-button-primary-color': UNREADABLE_INK };
    const revalidated = enforceTextContrast(diverged, {
      general: { palette: { backgroundMode: 'light' } },
    });

    expect(revalidated.adjustments).toHaveLength(1);
    expect(revalidated.adjustments[0].token).toBe('--ds-button-primary-color');
    expect(revalidated.variables['--ds-button-primary-color']).not.toBe(UNREADABLE_INK);
  });

  it('adds nothing for a tenant that authored no color at all', () => {
    const bare: TenantConfig = {
      ...CHROME_TENANT,
      slug: 'bare',
      name: 'Bare',
      branding: { companyName: 'Bare' },
      brandTheme: undefined,
      tokenOverrides: undefined,
      personality: undefined,
    };

    const block = readBlock(
      generateTenantCss(bare, { includeDarkSelector: false, includeSystemDarkSelector: false }),
      buildTenantSelector('bare'),
    );

    // The block is not empty -- the legacy product profile still supplies
    // personality and typography defaults -- but no color channel is authored,
    // so there is no pair to verify and the pass must not invent one.
    expect(Object.keys(block).filter((name) => name.startsWith('--ds-color-'))).toEqual([]);
    expect(enforceTextContrast(block, {}).adjustments).toEqual([]);
  });
});
