/**
 * @fileoverview Emergency-token precedence, after the block was retired.
 *
 * THE OLD QUESTION was a cascade question: the ThemeProvider shipped a
 * hardcoded `:root` token block, injected as a runtime `<style>` element, and
 * this file measured whether that block could ever outrank a real artifact.
 * The answer was "only on the `:root`-scoped subset, and only if the state gate
 * regressed", so the file pinned that residual exposure by name.
 *
 * THE QUESTION IS GONE, because the block is gone. The provider now owns
 * theme/tenant CONTEXT and the root `data-theme` / `color-scheme` claim, and
 * emits no visual channel at all. A cascade contest needs two authors; there is
 * one. So this file was rewritten around the two claims that replace it:
 *
 *   1. THE NEGATIVE, and it is executable. Mounting the provider must add no
 *      stylesheet and no `--ds-*` custom property to the document. This is not
 *      a source-text belief about the provider -- it is the rendered result. If
 *      an emergency block, a branding effect or any other second author is ever
 *      reintroduced, this leg goes red on the DOM it produces, whatever the
 *      code looks like.
 *
 *   2. THE SUCCESSOR, and it is measured from a FRESH COMPILE. The eighteen
 *      channels the retired block declared are pinned below by name, and every
 *      one of them is accounted for against artifacts rendered in-process from
 *      the authored BrandTheme sources. Nothing here reads a committed
 *      `index.css`, a `styles/` file or any other byte on disk: a stale
 *      artifact would otherwise let this file certify a channel the current
 *      compiler no longer authors.
 *
 * The accounting is deliberately NOT "all eighteen survive". Measured, they
 * split three ways -- authored directly, authored as the seed a base scale
 * multiplies, and not authored at all -- and the third bucket is pinned by name
 * rather than hidden. A completeness claim that rounded those together would be
 * the same failure the old count-based ceiling had.
 *
 * NOT DUPLICATED HERE. `whitelabel-field-coverage.test.ts` owns the branding
 * FIELD question (which authored field reaches which compiled channel, and what
 * admission does with a sub-floor payload). This file owns the emergency block
 * and its succession.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from '@/infrastructure/compilers/runtime/tenant-css';
import {
  bithireBrandTheme,
  evntoBrandTheme,
  rottayBrandTheme,
} from '@/foundation/tokens/ts/presentation/brand-themes';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';
import { ThemeProvider } from '@/infrastructure/runtime/theming/composition/react/provider';
import { FIRST_PARTY_THEMES } from '@/foundation/tokens/ts/presentation/brand-themes';
import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';

const PROVIDER = resolve(
  process.cwd(),
  'src/infrastructure/runtime/theming/composition/react/provider/index.tsx'
);

const providerSource = () => readFileSync(PROVIDER, 'utf8');

/**
 * The exact channel list the retired block declared, lifted from the last
 * revision that carried it: `ROTTAY_EMERGENCY_TOKENS` at
 * `.../theming/composition/react/provider/index.tsx:454`, commit `dcadb8474~1`.
 *
 * Pinned as a literal because the source it came from no longer exists. That is
 * the point: the successor legs below have to answer for a fixed, historical
 * set, not for whatever the current runtime happens to emit.
 */
const RETIRED_EMERGENCY_CHANNELS = [
  '--ds-color-primary',
  '--ds-color-primary-500',
  '--ds-color-secondary',
  '--ds-color-secondary-500',
  '--ds-color-bg-primary',
  '--ds-color-bg-secondary',
  '--ds-color-border',
  '--ds-color-text-primary',
  '--ds-color-text-secondary',
  '--ds-text-primary',
  '--ds-text-secondary',
  '--ds-spacing-xs',
  '--ds-spacing-sm',
  '--ds-spacing-md',
  '--ds-spacing-lg',
  '--ds-radius-sm',
  '--ds-radius-md',
  '--ds-font-family-base',
] as const;

/**
 * Retired channels a fresh artifact declares under that exact name, in every
 * first-party vertical. These are the ones the successor covers outright.
 */
const SUCCEEDED_DIRECTLY = [
  '--ds-color-primary',
  '--ds-color-primary-500',
  '--ds-color-secondary',
  '--ds-color-secondary-500',
  '--ds-color-bg-primary',
  '--ds-color-bg-secondary',
  '--ds-color-border',
  '--ds-color-text-primary',
  '--ds-color-text-secondary',
  '--ds-font-family-base',
] as const;

/**
 * Retired channels the artifact no longer writes flat, because the tenant dial
 * would not reach them if it did. The artifact authors the SEED and the base
 * scale computes the channel, so the successor is present -- one rung further
 * back. Each entry lists the seeds a fresh compile must declare.
 */
const SUCCEEDED_BY_SEED: Record<string, readonly string[]> = {
  '--ds-radius-sm': ['--ds-radius-sm-base', '--ds-radius-scale'],
  '--ds-radius-md': ['--ds-radius-md-base', '--ds-radius-scale'],
  '--ds-spacing-xs': ['--ds-density-scale'],
  '--ds-spacing-sm': ['--ds-density-scale'],
  '--ds-spacing-md': ['--ds-density-scale'],
  '--ds-spacing-lg': ['--ds-density-scale'],
};

/**
 * Retired channels with NO successor in the artifact, pinned per vertical
 * rather than averaged away. `--ds-text-*` are the legacy flat aliases of
 * `--ds-color-text-*`; only rottay still authors them, so in bithire and evnto
 * these two names resolve from the base layer alone. If a vertical's membership
 * here changes, that is a real change in who owns the channel and this leg is
 * where it has to be re-stated.
 */
const UNSUCCEEDED_BY_VERTICAL: Record<string, readonly string[]> = {
  rottay: [],
  bithire: ['--ds-text-primary', '--ds-text-secondary'],
  evnto: ['--ds-text-primary', '--ds-text-secondary'],
};

const BRAND_THEMES: Record<string, BrandTheme> = {
  bithire: bithireBrandTheme,
  evnto: evntoBrandTheme,
  rottay: rottayBrandTheme,
};

/** Every custom property a freshly rendered artifact declares, by name. */
function freshlyDeclaredChannels(slug: string): Set<string> {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((entry) => entry.slug === slug);
  if (!spec) throw new Error(`no artifact spec for ${slug}`);
  const theme = FIRST_PARTY_THEMES[slug as FirstPartyVerticalId];
  if (!theme) throw new Error(`no first-party theme registered for slug ${slug}`);
  const css = renderFirstPartyArtifact({
    spec,
    theme,
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  }).css;
  const declared = new Set<string>();
  for (const [, body] of css.matchAll(/\{([^{}]*)\}/g)) {
    for (const [, property] of body.matchAll(/(--[a-z0-9-]+)\s*:/gi)) {
      declared.add(property);
    }
  }
  return declared;
}

const SLUGS = FIRST_PARTY_ARTIFACT_SPECS.map((spec) => spec.slug);

/** Custom properties written inline on `<html>`, which outrank every sheet. */
function rootInlineCustomProperties(): string[] {
  const style = document.documentElement.getAttribute('style') ?? '';
  return [...style.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map(([, property]) => property);
}

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('style');
});

describe('the provider emits no visual channel', () => {
  it('mounts without adding a stylesheet to the document', () => {
    const before = document.querySelectorAll('style, link[rel="stylesheet"]').length;

    render(
      React.createElement(ThemeProvider, {
        tenant: 'acme',
        theme: 'dark',
        children: React.createElement('div', { 'data-testid': 'child' }),
      })
    );

    // The retired block reached the document as exactly this: a runtime
    // `<style>` appended last, which is the highest-precedence position a
    // stylesheet can occupy. One appearing here means a second author is back.
    expect(document.querySelectorAll('style, link[rel="stylesheet"]').length).toBe(before);
  });

  it('writes no `--ds-*` custom property on the root element', () => {
    render(
      React.createElement(ThemeProvider, {
        tenant: 'acme',
        theme: 'dark',
        children: React.createElement('div', null),
      })
    );

    // Inline custom properties outrank every stylesheet including the artifact,
    // so this is the one place a provider could paint that nothing can win back.
    expect(rootInlineCustomProperties()).toEqual([]);
    // The sanctioned inline claim is the color scheme, and only that.
    const style = document.documentElement.getAttribute('style') ?? '';
    expect(style.replace(/color-scheme\s*:[^;]*;?/g, '').trim()).toBe('');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('paints nothing inline into its own subtree either', () => {
    const { container } = render(
      React.createElement(ThemeProvider, {
        tenant: 'acme',
        theme: 'light',
        children: React.createElement('div', { 'data-testid': 'child' }),
      })
    );

    for (const element of container.querySelectorAll('*')) {
      expect(element.getAttribute('style') ?? '').not.toMatch(/--ds-/);
    }
  });

  it('carries no emergency token block in source', () => {
    const source = providerSource();

    // Non-vacuity for the legs above: they would also pass against a provider
    // that had simply been deleted. This states the specific thing that left.
    expect(source).not.toMatch(/ROTTAY_EMERGENCY_TOKENS/);
    expect(source).not.toMatch(/injectEmergencyTokens/);
    expect(source).not.toMatch(/createElement\(\s*['"]style['"]\s*\)/);
    expect(source).not.toMatch(/setProperty\(\s*['"]--ds-/);
    // Still a real provider, so the negatives above are about emission and not
    // about an empty file.
    expect(source).toMatch(/export function ThemeProvider/);
  });
});

describe('the retired block is pinned by name, not by count', () => {
  it('names the eighteen channels the block declared', () => {
    // A count was what made the old ceiling unreadable: it could not tell a
    // repair from a regression when both arrived the same night. The buckets
    // below partition this list exactly, so a name can never quietly move
    // between them without one of them failing.
    expect(RETIRED_EMERGENCY_CHANNELS).toHaveLength(18);
    expect(RETIRED_EMERGENCY_CHANNELS).toContain('--ds-color-primary');
    expect(RETIRED_EMERGENCY_CHANNELS).toContain('--ds-spacing-md');

    const accounted = [
      ...SUCCEEDED_DIRECTLY,
      ...Object.keys(SUCCEEDED_BY_SEED),
      ...UNSUCCEEDED_BY_VERTICAL.bithire,
    ].sort();
    expect(accounted).toEqual([...RETIRED_EMERGENCY_CHANNELS].sort());
  });
});

describe('the successor authors the retired channels, measured fresh', () => {
  it.each(SLUGS)('%s authors every directly succeeded channel', (slug) => {
    const declared = freshlyDeclaredChannels(slug);

    // Non-vacuity: a renderer that produced nothing would satisfy every
    // `not.toContain` below and most of the emptiness checks above.
    expect(declared.size).toBeGreaterThan(200);
    expect(SUCCEEDED_DIRECTLY.filter((channel) => !declared.has(channel))).toEqual([]);
  });

  it.each(SLUGS)('%s authors the seed for every channel it no longer writes flat', (slug) => {
    const declared = freshlyDeclaredChannels(slug);

    for (const [channel, seeds] of Object.entries(SUCCEEDED_BY_SEED)) {
      // The flat channel is genuinely absent -- this is not a channel the
      // artifact writes twice. It is computed downstream from these seeds.
      expect(declared.has(channel), `${slug} unexpectedly writes ${channel} flat`).toBe(false);
      for (const seed of seeds) {
        expect(declared.has(seed), `${slug} is missing ${seed}, the seed for ${channel}`).toBe(true);
      }
    }
  });

  it.each(SLUGS)('%s pins its unsucceeded channels by name', (slug) => {
    const declared = freshlyDeclaredChannels(slug);
    const unsucceeded = RETIRED_EMERGENCY_CHANNELS.filter(
      (channel) =>
        !declared.has(channel) && !Object.prototype.hasOwnProperty.call(SUCCEEDED_BY_SEED, channel)
    );

    expect(unsucceeded.sort()).toEqual([...(UNSUCCEEDED_BY_VERTICAL[slug] ?? [])].sort());
  });
});
