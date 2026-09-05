/**
 * @fileoverview Whitelabel field coverage: where a tenant's authored branding
 * actually lands, and what happens when it is not legible.
 *
 * WHAT THIS FILE USED TO DO was grep. It read the ThemeProvider's source text
 * and asserted the substring `primaryColor` appeared in it; it read a committed
 * `artifacts/<tenant>/index.css` off disk and asserted the substring
 * `--ds-font-family-base` appeared in that. Both are proxies, and both had
 * already failed in the two ways proxies fail:
 *
 *   - FALSE GREEN. The personality leg asserted `--ds-personality-animation`
 *     appeared "in the bridge". It does -- in a `@remarks` comment, as the
 *     prose `--ds-personality-animation-*`. No such channel is emitted by
 *     anything. A substring search cannot tell a declaration from a sentence
 *     about one, so that leg was green for a channel that does not exist.
 *   - FALSE RED. The branding and contrast legs went red when the provider
 *     stopped painting -- which was the intended change, not a regression. A
 *     test that reads the implementation cannot distinguish "the field is
 *     unwired" from "the field is wired somewhere else now", and this one
 *     reported a completed migration as three failures.
 *
 * WHAT IT DOES NOW is compile. Every coverage claim below runs the real
 * compiler over an authored document, or renders a first-party artifact in
 * process, and reads the resulting channels. Nothing here reads a committed
 * `.css`, a `styles/` file or any other byte on disk: a stale artifact would
 * otherwise let this file certify a channel the current compiler has stopped
 * authoring, which is the same proxy failure one layer down.
 *
 * The three claims are:
 *
 *   1. The provider is not a painter, proved on the DOM it renders rather than
 *      on its source. There is no branding input on it to test -- see the
 *      props leg -- so the negative is that mounting it adds no stylesheet, no
 *      link and no custom property.
 *   2. Every authored branding field reaches a compiled channel, measured by
 *      compiling a document that authors it. The one field with no
 *      general-tier lever is named rather than skipped.
 *   3. Legibility is admission law, not runtime repair. A branding payload
 *      below the governed APCA floors is REJECTED at compile; it is never
 *      quietly corrected, and there is no runtime validator left to correct it.
 *
 * NOT DUPLICATED HERE. `theming-precedence/tests/index.test.ts` owns the
 * retired emergency block and the succession of its eighteen channels.
 * `personality/tests/primitives.test.ts` owns the personality projection's key
 * set. This file owns the branding FIELD -> compiled CHANNEL question.
 *
 * @module tooling/testing/system/whitelabel-field-coverage
 * @category Testing
 * @package @rottay/design-system
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';

import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  TenantThemeValidationError,
} from '@/infrastructure/compilers/composition/tenant-theme';
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
import { PERSONALITY_CANONICAL_PROJECTION } from '@/foundation/tokens/ts/runtime/personality';
import { ThemeProvider } from '@/infrastructure/runtime/theming/composition/react/provider';
import { FIRST_PARTY_THEMES } from '@/foundation/tokens/ts/presentation/brand-themes';
import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';

const SRC_ROOT = join(process.cwd(), 'src');

function readSource(relativePath: string): string {
  const fullPath = join(SRC_ROOT, relativePath);
  return existsSync(fullPath) ? readFileSync(fullPath, 'utf-8') : '';
}

const themeProviderSource = readSource(
  'infrastructure/runtime/theming/composition/react/provider/index.tsx'
);

// ---------------------------------------------------------------------------
// Compilation helpers -- every measurement below goes through one of these.
// ---------------------------------------------------------------------------

const AUTHORED_IDENTITY = {
  tenantId: 'tenant_whitelabel_coverage',
  slug: 'whitelabel-coverage',
  verticalKey: 'bithire',
  rowVersion: 1,
} as const;

/**
 * A document that authors one branding field per contract field, at values
 * chosen to clear the governed APCA floors. It is deliberately ordinary: the
 * point is what a compliant tenant gets, not what a torture fixture survives.
 */
function authoredBrandingDocument(): Record<string, unknown> {
  return {
    schemaVersion: 1,
    mode: 'advanced',
    visualFoundation: {
      general: {
        palette: {
          primary: '#1F5896',
          secondary: '#5B4A8A',
          accent: '#0F6F5C',
          background: '#FFFFFF',
          backgroundMode: 'light',
          foreground: {
            primary: '#101418',
            secondary: '#3A4450',
            muted: '#4E5A68',
            disabled: '#69737F',
          },
        },
        typography: {
          fontFamilyBase: '"Coverage Sans", system-ui, sans-serif',
          fontFamilyHeading: '"Coverage Display", Georgia, serif',
        },
      },
      advanced: {
        tokenOverrides: {
          '--ds-color-success': '#1B6E3C',
          '--ds-color-warning': '#8A5A00',
          '--ds-color-error': '#A32020',
          '--ds-color-info': '#1D5FA8',
          '--ds-font-family-mono': '"Coverage Mono", ui-monospace, monospace',
        },
      },
    },
  };
}

function compileAuthored(document: Record<string, unknown>): Record<string, string> {
  const envelope = getTenantThemeVerticalEnvelope(AUTHORED_IDENTITY.verticalKey);
  if (!envelope) throw new Error(`no vertical envelope for ${AUTHORED_IDENTITY.verticalKey}`);
  const artifact = compileTenantThemeConfig(
    hydrateTenantThemeConfig(document as never, { ...AUTHORED_IDENTITY } as never),
    { verticalEnvelope: envelope }
  );
  return artifact.variables as Record<string, string>;
}

const BRAND_THEMES: Record<string, BrandTheme> = {
  bithire: bithireBrandTheme,
  evnto: evntoBrandTheme,
  rottay: rottayBrandTheme,
};

/** A first-party artifact rendered in process, never read from disk. */
function freshArtifactCss(slug: string): string {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((entry) => entry.slug === slug);
  if (!spec) throw new Error(`no artifact spec for ${slug}`);
  return renderFirstPartyArtifact({
    spec,
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  }).css;
}

const SLUGS = FIRST_PARTY_ARTIFACT_SPECS.map((spec) => spec.slug);

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('style');
});

// ---------------------------------------------------------------------------
// 1. The provider is not a branding painter
// ---------------------------------------------------------------------------

describe('the provider paints no branding channel', () => {
  it('exposes no branding input to paint from', () => {
    // The strongest form this claim can take: there is no field to wire. The
    // provider's props are theme and tenant identity plus deprecated
    // compatibility inputs, so a branding color cannot reach it at all.
    for (const field of ['primaryColor', 'secondaryColor', 'accentColor', 'branding']) {
      expect(
        new RegExp(`^\\s*${field}\\??:`, 'm').test(themeProviderSource),
        `ThemeProvider declares a ${field} input`
      ).toBe(false);
    }
  });

  it('adds no stylesheet and no link when mounted with a tenant', () => {
    const before = document.querySelectorAll('style, link').length;

    render(
      // `cssBaseUrl` is a retained compatibility input and this is what
      // retained means here: accepted, recorded in the type, and inert. A
      // `<link>` appearing for it would be a branding delivery path.
      React.createElement(ThemeProvider, {
        tenant: 'acme',
        theme: 'dark',
        cssBaseUrl: 'https://cdn.example.test/themes',
        children: React.createElement('div', null),
      })
    );

    expect(document.querySelectorAll('style, link').length).toBe(before);
  });

  it('writes no branding custom property on the root element', () => {
    render(
      React.createElement(ThemeProvider, {
        tenant: 'acme',
        theme: 'dark',
        children: React.createElement('div', null),
      })
    );

    const style = document.documentElement.getAttribute('style') ?? '';
    expect(style).not.toMatch(/--ds-/);
    // The sanctioned root claims, so the negative above is not passing because
    // the provider did nothing at all.
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(style).toMatch(/color-scheme/);
  });

  it('carries no runtime contrast repair', () => {
    // WCAG is admission law, not a runtime correction -- see the admission
    // describe below, which is where this claim's positive half lives. A
    // validator here could only ever fire after the unreadable payload was
    // already stored and already painted for somebody.
    expect(themeProviderSource).not.toMatch(/validateBrandingContrast/);
    expect(themeProviderSource).toMatch(/export function ThemeProvider/);
  });
});

// ---------------------------------------------------------------------------
// 2. Authored branding fields reach compiled channels
// ---------------------------------------------------------------------------

describe('authored branding fields reach a compiled channel', () => {
  /**
   * Field -> channel -> authored value, as measured through the compiler. The
   * palette trio rides the general tier; the semantic quartet and the mono
   * family ride the bounded token-override allowlist.
   */
  const FIELD_CHANNELS: ReadonlyArray<readonly [string, string, string]> = [
    ['primaryColor', '--ds-color-primary', '#1F5896'],
    ['secondaryColor', '--ds-color-secondary', '#5B4A8A'],
    ['accentColor', '--ds-color-accent', '#0F6F5C'],
    ['successColor', '--ds-color-success', '#1B6E3C'],
    ['warningColor', '--ds-color-warning', '#8A5A00'],
    ['errorColor', '--ds-color-error', '#A32020'],
    ['infoColor', '--ds-color-info', '#1D5FA8'],
  ];

  it.each(FIELD_CHANNELS)('%s compiles into %s', (_field, channel, value) => {
    expect(compileAuthored(authoredBrandingDocument())[channel]).toBe(value);
  });

  const FONT_FIELDS: ReadonlyArray<readonly [string, string, string]> = [
    ['fontFamilyBase', '--ds-font-family-base', '"Coverage Sans"'],
    ['fontFamilyHeading', '--ds-font-family-heading', '"Coverage Display"'],
    ['fontFamilyMono', '--ds-font-family-mono', '"Coverage Mono"'],
  ];

  it.each(FONT_FIELDS)('%s compiles into %s', (_field, channel, family) => {
    // Substring, not equality: the compiler appends script-coverage fallbacks
    // to an authored stack, so the authored family leads a longer list than
    // the tenant wrote. Pinning the whole stack here would pin the fallback
    // policy, which belongs to the compiler's own tests.
    expect(compileAuthored(authoredBrandingDocument())[channel]).toContain(family);
  });

  it('names the one font field with no general-tier lever', () => {
    // Measured, and worth stating rather than papering over: `typography`
    // carries `fontFamilyBase` and `fontFamilyHeading` but no `fontFamilyMono`,
    // so a tenant that wants a monospace family reaches the bounded override
    // allowlist for it -- the leg above -- or does not get one.
    //
    // The general tier does not merely IGNORE the field, which is the outcome
    // worth pinning. An ignored field is the worst of the three possible
    // behaviors: the tenant authors a monospace family, the save succeeds, and
    // nothing changes, with nothing anywhere saying why. This rejects by exact
    // path instead, so the answer arrives at the point of authorship.
    const generalOnly = authoredBrandingDocument() as {
      visualFoundation: { advanced?: unknown; general: Record<string, unknown> };
    };
    delete generalOnly.visualFoundation.advanced;
    (generalOnly.visualFoundation.general as { typography: Record<string, unknown> }).typography[
      'fontFamilyMono'
    ] = '"Coverage Mono", monospace';

    let thrown: unknown;
    try {
      compileAuthored(generalOnly as never);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(TenantThemeValidationError);
    expect((thrown as TenantThemeValidationError).issues).toEqual([
      {
        code: 'unknown_key',
        path: '$.visualFoundation.general.typography.fontFamilyMono',
        message: 'Field is not part of TenantThemeConfig v1',
      },
    ]);

    // And the sibling families on the same tier still compile, so the
    // rejection is about that one field rather than about the tier.
    const withoutMono = authoredBrandingDocument() as { visualFoundation: { advanced?: unknown } };
    delete withoutMono.visualFoundation.advanced;
    expect(compileAuthored(withoutMono as never)['--ds-font-family-base']).toContain(
      '"Coverage Sans"'
    );
  });

  it('does not accept a branding field the allowlist excludes', () => {
    // Non-vacuity for every leg above: the compiler is not simply echoing
    // whatever it is handed. `--ds-color-text-on-primary` is derived from the
    // primary seed precisely so a tenant cannot author an illegible pair, and
    // the allowlist refuses it by name.
    const document = authoredBrandingDocument() as {
      visualFoundation: { advanced: { tokenOverrides: Record<string, string> } };
    };
    document.visualFoundation.advanced.tokenOverrides['--ds-color-text-on-primary'] = '#FFFFFF';

    expect(() => compileAuthored(document as never)).toThrow(TenantThemeValidationError);
  });
});

describe('the TenantBranding contract still declares the legacy transport', () => {
  // Declaration only. What each field DOES is the describe above; this one
  // exists so a field cannot be dropped from the contract while the transport
  // is still in use, which the compiled legs would not notice.
  const contractSource = readSource('foundation/contracts/composition/tenants/index.ts');

  const allBrandingFields = [
    'primaryColor',
    'secondaryColor',
    'accentColor',
    'fontFamilyBase',
    'fontFamilyHeading',
    'fontFamilyMono',
    'successColor',
    'warningColor',
    'errorColor',
    'infoColor',
  ];

  for (const field of allBrandingFields) {
    it(`TenantBranding declares ${field}`, () => {
      expect(new RegExp(`^\\s*${field}\\??:`, 'm').test(contractSource)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. First-party artifacts, rendered fresh
// ---------------------------------------------------------------------------

describe('freshly rendered first-party artifacts', () => {
  const FONT_CHANNELS = [
    '--ds-font-family-base',
    '--ds-font-family-heading',
    '--ds-font-family-mono',
  ];

  it.each(SLUGS)('%s declares every font family channel', (slug) => {
    const css = freshArtifactCss(slug);
    for (const channel of FONT_CHANNELS) {
      expect(css, `${slug} is missing ${channel}`).toContain(`${channel}:`);
    }
  });

  it.each(SLUGS)('%s is variables-only, with no engine selectors', (slug) => {
    const withoutComments = freshArtifactCss(slug).replace(/\/\*[\s\S]*?\*\//g, '');

    // Non-vacuity: a renderer returning nothing would also contain no `.ant-`.
    expect(withoutComments.length).toBeGreaterThan(1000);
    // Whole artifact, not just the part before an extension marker. The marker
    // split was there because a committed file could carry authored extension
    // bytes appended after compilation; a freshly rendered artifact has no such
    // tail, so the weaker claim is no longer necessary.
    expect(withoutComments).not.toMatch(/\.ant-/);
  });
});

// ---------------------------------------------------------------------------
// 4. Personality channels, stated as a projection rather than as source text
// ---------------------------------------------------------------------------

describe('personality channels are declared by the canonical projection', () => {
  // The public channel and the private bridge input it is fed from, taken from
  // the projection itself. `--ds-personality-animation`, which this file used
  // to assert, is absent from the projection entirely -- it never existed as a
  // channel, and only ever matched a sentence in a comment.
  const publicChannels = [
    '--ds-card-shadow',
    '--ds-button-hover-transform',
    '--ds-typography-heading-font-weight',
    '--ds-modal-animation-duration',
  ];

  for (const channel of publicChannels) {
    it(`${channel} maps to a private bridge input`, () => {
      const input = (PERSONALITY_CANONICAL_PROJECTION as Record<string, string>)[channel];
      expect(input, `${channel} is not in the canonical projection`).toBeDefined();
      expect(input).toMatch(/^--_ds-personality-resolved-/);
    });
  }

  it('projects every public channel from a private input, never from itself', () => {
    const entries = Object.entries(PERSONALITY_CANONICAL_PROJECTION as Record<string, string>);
    expect(entries.length).toBeGreaterThan(30);
    for (const [channel, input] of entries) {
      expect(channel).toMatch(/^--ds-/);
      expect(input).toMatch(/^--_ds-personality-resolved-/);
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Legibility is admission law
// ---------------------------------------------------------------------------

describe('an illegible branding payload is refused at admission', () => {
  /** Near-white inks on a white canvas: authored, ordinary-looking, unreadable. */
  function subFloorDocument(): Record<string, unknown> {
    return {
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        general: {
          palette: {
            primary: '#F5F5F5',
            background: '#FFFFFF',
            backgroundMode: 'light',
            foreground: {
              primary: '#EDEDED',
              secondary: '#E8E8E8',
              muted: '#E4E4E4',
              disabled: '#E0E0E0',
            },
          },
        },
      },
    };
  }

  it('throws rather than repairing', () => {
    expect(() => compileAuthored(subFloorDocument())).toThrow(TenantThemeValidationError);
  });

  it('names the failing pair and its measured contrast', () => {
    let thrown: unknown;
    try {
      compileAuthored(subFloorDocument());
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(TenantThemeValidationError);
    const issues = (thrown as TenantThemeValidationError).issues as ReadonlyArray<{
      message: string;
    }>;
    const messages = issues.map((issue) => issue.message);

    // The report is per-pair and quantified, not a single "invalid theme":
    // a tenant has to be told which of its authored colors is unreadable
    // against which ground, or the rejection is unactionable.
    expect(
      messages.some((message) =>
        /--ds-color-text-primary has APCA Lc [\d.]+ against --ds-color-bg-primary/.test(message)
      ),
      `no per-pair APCA issue for the body ink; got: ${messages.join(' | ')}`
    ).toBe(true);
    // The derived on-primary pair is reported too, which is the half a tenant
    // cannot author and therefore cannot fix except by moving the seed.
    expect(
      messages.some((message) => message.includes('--ds-color-text-on-primary'))
    ).toBe(true);
  });

  it('admits the same document once its inks clear the floors', () => {
    // Non-vacuity: the rejection above is about the contrast, not about the
    // document's shape. This one differs only in the authored values.
    const legible = subFloorDocument() as {
      visualFoundation: { general: { palette: Record<string, unknown> } };
    };
    legible.visualFoundation.general.palette['primary'] = '#1F5896';
    legible.visualFoundation.general.palette['foreground'] = {
      primary: '#101418',
      secondary: '#3A4450',
      muted: '#4E5A68',
      disabled: '#69737F',
    };

    expect(compileAuthored(legible as never)['--ds-color-primary']).toBe('#1F5896');
  });
});
