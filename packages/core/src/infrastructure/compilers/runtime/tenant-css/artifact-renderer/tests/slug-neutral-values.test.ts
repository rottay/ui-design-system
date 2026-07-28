/**
 * SLUG-NEUTRAL COMPILER — the slug picks a SELECTOR, never a value.
 *
 * `kernel/runtime/brand-theme/tests/no-vertical-branch.test.ts` already pins
 * this property for `compileBrandTheme`: one theme compiles to the same
 * channels under every slug, swapping two verticals swaps their output
 * exactly, and the compiler source names no vertical outside comments. What it
 * does NOT reach is everything downstream of the channel map — the artifact
 * renderer that turns those channels into a stylesheet, the scope projection
 * that rewrites preludes, and the DB path that scopes a compiled document. A
 * slug-conditional planted in any of those would leave the brand compiler's
 * three assertions green while the shipped CSS still differed per vertical.
 *
 * So this file covers the same law one tier out. The strongest form is here:
 * render under two synthetic tenants that share nothing but their theme, then
 * rename one into the other. If the slug reaches a value anywhere, the rename
 * cannot reproduce the other artifact byte for byte.
 */
import { describe, expect, it } from 'vitest';

import {
  brandModeSelector,
  compileBrandTheme,
} from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { projectFirstPartyArtifactScopes } from '@/infrastructure/compilers/kernel/foundation/css/scope-projection';
import {
  compileTenantThemeConfig,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { evntoBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/evnto';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/platform';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import {
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  renderVerticalArtifact,
} from '../index';

const THEMES: readonly [string, BrandTheme][] = [
  ['bithire', bithireBrandTheme],
  ['evnto', evntoBrandTheme],
  ['rottay', rottayBrandTheme],
];

const EXTENSION = '/* extension body with no tenant reference */\n';

/**
 * Synthetic tenants. Real slugs would make a passing test ambiguous: `bithire`
 * appears in that theme's own font stacks and asset paths, so a rename-based
 * comparison could not tell a selector from a value. These two names share no
 * substring with each other or with anything a theme authors.
 */
const ALPHA = { slug: 'quiettenantone', verticalKey: 'quietverticalone' };
const BETA = { slug: 'loudtenanttwo', verticalKey: 'loudverticaltwo' };

function render(
  brandTheme: BrandTheme,
  tenant: { slug: string; verticalKey: string },
  extensionCss = EXTENSION
): string {
  const compiled = compileBrandTheme({ brandTheme, tenantSlug: tenant.slug });
  return renderVerticalArtifact({
    tenantSlug: tenant.slug,
    verticalKey: tenant.verticalKey,
    authoredThemePath: 'fixture/theme.ts',
    displayName: 'Fixture',
    selector: `html[data-tenant='${tenant.slug}']`,
    compiledCssVariables: compiled.cssVariables,
    colorScheme: compiled.colorScheme,
    modeBlocks: compiled.modeBlocks,
    extensionCss,
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  });
}

/** Every `--ds-*: value;` pair, keyed by the block it was declared in. */
function declarationsByBlock(css: string): Record<string, Record<string, string>> {
  const blocks: Record<string, Record<string, string>> = {};
  let index = 0;
  for (const section of css.split(/^(?=\/\* === )/m)) {
    const body: Record<string, string> = {};
    for (const match of section.matchAll(/^\s*(--[\w-]+):\s*([^;]+);$/gm)) {
      body[match[1]] = match[2].trim();
    }
    if (Object.keys(body).length > 0) blocks[`block-${index++}`] = body;
  }
  return blocks;
}

describe('SLUG-NEUTRAL · the rendered artifact carries no slug-dependent value', () => {
  it('one theme renders identical declarations under every tenant', () => {
    for (const [, theme] of THEMES) {
      const alpha = declarationsByBlock(render(theme, ALPHA));
      const beta = declarationsByBlock(render(theme, BETA));
      expect(beta).toEqual(alpha);
      expect(Object.keys(alpha).length).toBeGreaterThan(0);
    }
  });

  it('renaming one tenant into the other reproduces its artifact byte for byte', () => {
    for (const [, theme] of THEMES) {
      const renamed = render(theme, ALPHA)
        .split(ALPHA.slug)
        .join(BETA.slug)
        .split(ALPHA.verticalKey)
        .join(BETA.verticalKey);
      expect(renamed).toBe(render(theme, BETA));
    }
  });

  it('every difference between two tenants sits in a selector, never a declaration', () => {
    const alpha = render(rottayBrandTheme, ALPHA).split('\n');
    const beta = render(rottayBrandTheme, BETA).split('\n');
    expect(alpha.length).toBe(beta.length);

    const differing = alpha.filter((line, index) => line !== beta[index]);
    expect(differing.length).toBeGreaterThan(0);
    for (const line of differing) {
      // A declaration line ends in `;` and starts with a property. Anything
      // that differs between two tenants must instead be a prelude or a header
      // comment naming the artifact's own source.
      expect(line.trim().endsWith(';')).toBe(false);
    }
  });

  it('the slug reaches mode blocks only through brandModeSelector', () => {
    const compiled = compileBrandTheme({
      brandTheme: rottayBrandTheme,
      tenantSlug: ALPHA.slug,
    });
    expect(compiled.modeBlocks?.length ?? 0).toBeGreaterThan(0);
    for (const block of compiled.modeBlocks ?? []) {
      for (const value of Object.values(block.cssVariables)) {
        expect(value).not.toContain(ALPHA.slug);
      }
      expect(brandModeSelector(ALPHA.slug, block.mode)).toContain(ALPHA.slug);
    }
  });
});

describe('SLUG-NEUTRAL · scope projection rewrites preludes only', () => {
  it('a declaration value that looks like the owned selector is preserved', () => {
    const css = [
      `html[data-tenant='${ALPHA.slug}'] {`,
      `  --ds-fixture-note: "html[data-tenant='${ALPHA.slug}']";`,
      '}',
      '',
    ].join('\n');
    const projected = projectFirstPartyArtifactScopes(css, ALPHA.slug, ALPHA.verticalKey);

    expect(projected).toContain(
      `:is(html[data-tenant='${ALPHA.slug}'], :where([data-ds-root][data-vertical='${ALPHA.verticalKey}']))`
    );
    // The value keeps its original bytes: a projection that reached into
    // declarations would have wrapped this string too.
    expect(projected).toContain(
      `  --ds-fixture-note: "html[data-tenant='${ALPHA.slug}']";`
    );
  });

  it('another tenant in the same stylesheet is untouched', () => {
    const css = `html[data-tenant='${BETA.slug}'] {\n  --ds-x: 1px;\n}\n`;
    expect(projectFirstPartyArtifactScopes(css, ALPHA.slug, ALPHA.verticalKey)).toBe(css);
  });
});

describe('SLUG-NEUTRAL · the DB path scopes by slug and compiles by document', () => {
  const document = {
    schemaVersion: 1 as const,
    mode: 'simple' as const,
    appearance: {
      palette: { primary: '#0F766E', secondary: '#8C6D46', accent: '#E2725B' },
      density: 'normal' as const,
    },
  };

  const compileAs = (slug: string) =>
    compileTenantThemeConfig(
      hydrateTenantThemeConfig(document, {
        tenantId: 'tenant_slug_neutrality',
        slug,
        verticalKey: 'bithire',
        rowVersion: 1,
      })
    );

  it('two tenants publishing the same document compile the same variables', () => {
    const alpha = compileAs(ALPHA.slug);
    const beta = compileAs(BETA.slug);

    expect(beta.variables).toEqual(alpha.variables);
    expect(Object.keys(alpha.variables).length).toBeGreaterThan(0);
    expect(beta.scopes.tenant.selector).not.toBe(alpha.scopes.tenant.selector);
    expect(beta.scopes.combinedSelector).toContain(BETA.slug);
  });

  it('the digest still separates them, because identity is part of provenance', () => {
    // Equal values, different tenants: the artifacts must not be interchangeable
    // in a cache keyed by digest.
    expect(compileAs(BETA.slug).digest).not.toBe(compileAs(ALPHA.slug).digest);
  });
});

describe('SLUG-NEUTRAL · drill', () => {
  it('a slug-conditional value planted downstream is caught by the rename test', () => {
    const renderWithBranch = (
      brandTheme: BrandTheme,
      tenant: { slug: string; verticalKey: string }
    ) => {
      const compiled = compileBrandTheme({ brandTheme, tenantSlug: tenant.slug });
      const cssVariables = {
        ...compiled.cssVariables,
        // The failure mode verbatim: one vertical gets a different ground.
        '--ds-color-bg-primary':
          tenant.slug === BETA.slug ? '#0C0C0E' : compiled.cssVariables['--ds-color-bg-primary'],
      };
      return renderVerticalArtifact({
        tenantSlug: tenant.slug,
        verticalKey: tenant.verticalKey,
        authoredThemePath: 'fixture/theme.ts',
        displayName: 'Fixture',
        selector: `html[data-tenant='${tenant.slug}']`,
        compiledCssVariables: cssVariables,
        colorScheme: compiled.colorScheme,
        modeBlocks: compiled.modeBlocks,
        extensionCss: EXTENSION,
        regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
      });
    };

    const renamed = renderWithBranch(bithireBrandTheme, ALPHA)
      .split(ALPHA.slug)
      .join(BETA.slug)
      .split(ALPHA.verticalKey)
      .join(BETA.verticalKey);
    expect(renamed).not.toBe(renderWithBranch(bithireBrandTheme, BETA));

    expect(declarationsByBlock(renderWithBranch(bithireBrandTheme, BETA))).not.toEqual(
      declarationsByBlock(renderWithBranch(bithireBrandTheme, ALPHA))
    );
  });
});
