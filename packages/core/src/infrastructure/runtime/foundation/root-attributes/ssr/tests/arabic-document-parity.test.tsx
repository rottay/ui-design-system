/**
 * An Arabic document has to be renderable, not merely labelled.
 *
 * Three independent things must hold before `locale="ar"` produces a document
 * an Arabic reader can use, and each has failed on its own:
 *
 *   1. the SSR projection must emit `lang="ar"` and `dir="rtl"`;
 *   2. the font stacks that ship must contain a family with Arabic coverage —
 *      evnto lost its `"Noto Sans Arabic"` tail to an extension re-declaration
 *      and rendered tofu while `lang`/`dir` were perfectly correct;
 *   3. the client provider must converge on the SAME pair the server wrote,
 *      or the first client effect flips a correctly-served document.
 *
 * Proving one of the three proves nothing about the other two, which is why
 * they are asserted together here rather than filed under three owners.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { resolveDocumentLocaleAttributes } from '@/foundation/i18n/runtime/resolution';
import {
  hasMandatoryFontFallback,
  MANDATORY_FALLBACK_FONT_CHANNELS,
  MANDATORY_FONT_FALLBACK_FAMILY,
} from '@/foundation/kernel/typography';
import { firstPartyFixture, lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { BrandTheme } from '@/foundation/contracts';
import { resolveDocumentRootAttributes } from '..';

const bithireBrandTheme = firstPartyFixture('bithire');
const evntoBrandTheme = firstPartyFixture('evnto');
const rottayBrandTheme = firstPartyFixture('rottay');

const FIRST_PARTY_VIEWS: ReadonlyArray<readonly [string, BrandTheme]> = [
  ['bithire', bithireBrandTheme],
  ['evnto', evntoBrandTheme],
  ['rottay', rottayBrandTheme],
];

afterEach(() => {
  document.documentElement.removeAttribute('dir');
  document.documentElement.removeAttribute('lang');
});

describe('arabic document: SSR projection', () => {
  it('projects lang and dir for an Arabic locale', () => {
    const attributes = resolveDocumentRootAttributes({
      themeMode: 'light',
      engine: 'modern',
      locale: 'ar',
    });

    expect(attributes.lang).toBe('ar');
    expect(attributes.dir).toBe('rtl');
  });

  it('reads its pair from the shared locale resolver rather than a second table', () => {
    // If the projection ever grew its own direction map, the two could drift
    // and only one of them would be wrong.
    expect(resolveDocumentLocaleAttributes('ar')).toEqual({ lang: 'ar', dir: 'rtl' });

    const latin = resolveDocumentRootAttributes({
      themeMode: 'light',
      engine: 'modern',
      locale: 'en',
    });
    expect(latin.dir).toBe('ltr');
  });
});

describe('arabic document: shipped font stacks', () => {
  // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset; a
  // vertical emits a family channel only where its preset authors one, so the
  // subject moves from "every vertical emits all three" (an authored-theme
  // receipt) to "every stack a vertical SHIPS is Arabic-capable" -- which is
  // the engine property the evnto tofu regression actually broke. Measured:
  // bithire authors base + heading (display absent), rottay and evnto author
  // no family at all. An unemitted channel renders no text and cannot tofu.
  it.each(FIRST_PARTY_VIEWS)(
    'compiles %s with an Arabic-capable fallback on every text-bearing channel it ships',
    (slug, brandTheme) => {
      const { cssVariables } = lowerBrandThemeFixture({ brandTheme, tenantSlug: slug });

      for (const channel of MANDATORY_FALLBACK_FONT_CHANNELS) {
        const stack = cssVariables[channel];
        if (stack == null) continue;
        expect(
          stack,
          `${slug} ${channel} carries no Arabic-capable family: ${stack}`,
        ).toContain(MANDATORY_FONT_FALLBACK_FAMILY);
      }
    },
  );

  it('is not vacuous: a vertical that authors families ships them repaired', () => {
    // Anti-vacuity for the per-vertical assertion above. Skipping absent
    // channels would let "nobody emits anything" read green, so the corpus has
    // to carry at least one real stack, and it is named rather than counted.
    const { cssVariables } = lowerBrandThemeFixture({
      brandTheme: bithireBrandTheme,
      tenantSlug: 'bithire',
    });
    const shipped = MANDATORY_FALLBACK_FONT_CHANNELS.filter(
      (channel) => cssVariables[channel] != null,
    );

    expect(shipped).toEqual(['--ds-font-family-base', '--ds-font-family-heading']);
    for (const channel of shipped) {
      expect(cssVariables[channel]).toContain(MANDATORY_FONT_FALLBACK_FAMILY);
    }
  });

  it('discriminates: a Latin-only stack is not accepted as covered', () => {
    // Anti-cheat for the assertion above. A predicate that answered true for
    // everything would let the evnto regression through unnoticed.
    expect(hasMandatoryFontFallback('Inter, system-ui, sans-serif')).toBe(false);
    expect(hasMandatoryFontFallback(`Inter, ${MANDATORY_FONT_FALLBACK_FAMILY}, sans-serif`)).toBe(
      true,
    );
  });

  it('repairs a Latin-only authored stack instead of shipping it', () => {
    // The coverage cannot depend on every theme author remembering the tail, so
    // an author who writes a Latin-only stack still gets an Arabic-capable one
    // on the wire. (The complementary direction — an emitted map that lost the
    // tail on some path AFTER this repair — throws, and is drilled in the
    // compiler's own `mandatory-font-fallback.test.ts`.)
    const latinOnly = 'Inter, system-ui, sans-serif';
    expect(hasMandatoryFontFallback(latinOnly)).toBe(false);

    const authored: BrandTheme = {
      ...bithireBrandTheme,
      typography: {
        ...bithireBrandTheme.typography,
        fontFamilyBase: latinOnly,
        fontFamilyHeading: latinOnly,
        fontFamilyDisplay: latinOnly,
      },
    };

    const { cssVariables } = lowerBrandThemeFixture({ brandTheme: authored, tenantSlug: 'bithire' });
    for (const channel of MANDATORY_FALLBACK_FONT_CHANNELS) {
      expect(cssVariables[channel]).toContain(MANDATORY_FONT_FALLBACK_FAMILY);
      // The author's own families keep priority; the tail is appended, not swapped in.
      expect(cssVariables[channel]).toContain('Inter');
    }
  });
});

describe('arabic document: hydration parity', () => {
  it('has the client provider converge on exactly what the server projected', async () => {
    const projected = resolveDocumentRootAttributes({
      themeMode: 'light',
      engine: 'modern',
      locale: 'ar',
    });

    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <output>mounted</output>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.lang).toBe(projected.lang);
      expect(document.documentElement.dir).toBe(projected.dir);
    });
  });

  it('tracks a locale switch instead of pinning the first pair it wrote', async () => {
    const view = render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <output>mounted</output>
      </I18nProvider>,
    );
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));

    view.rerender(
      <I18nProvider locale="en" fallbackLocale="en">
        <output>mounted</output>
      </I18nProvider>,
    );

    const projected = resolveDocumentRootAttributes({
      themeMode: 'light',
      engine: 'modern',
      locale: 'en',
    });
    await waitFor(() => {
      expect(document.documentElement.lang).toBe(projected.lang);
      expect(document.documentElement.dir).toBe(projected.dir);
    });
  });
});
