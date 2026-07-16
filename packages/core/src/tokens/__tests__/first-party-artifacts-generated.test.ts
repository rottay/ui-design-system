/**
 * Generated-artifact guard for every first-party vertical artifact (WO-TOK-01).
 *
 * Each committed `artifacts/<slug>/index.css` must be byte-identical to what the
 * generator produces from its authored sources (compiled BrandTheme + declared
 * extension). This is the regenerate-and-diff rule that fails on ANY manual edit
 * to the artifact: hand-edit an artifact and this test goes red; regenerate
 * (`pnpm build:vertical-css`) and it goes green. It also proves regeneration is
 * deterministic (a second render equals the first). Parameterized over
 * FIRST_PARTY_ARTIFACT_SPECS so a newly registered slug is covered automatically.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '../../compilers/brand-theme';
import {
  renderVerticalArtifact,
  FIRST_PARTY_ARTIFACT_SPECS,
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  GENERATED_ARTIFACT_BANNER,
} from '../../runtime/tenant/storage/static/generator';
import { bithireBrandTheme, evntoBrandTheme, rottayBrandTheme } from '../ts/brand-themes';
import type { BrandTheme } from '../../contracts/themes';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = resolve(TEST_DIR, '..', 'css/artifacts');

const BRAND_THEMES: Record<string, BrandTheme> = {
  bithire: bithireBrandTheme,
  evnto: evntoBrandTheme,
  rottay: rottayBrandTheme,
};

function generate(slug: string): string {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((entry) => entry.slug === slug);
  if (!spec) throw new Error(`no artifact spec for ${slug}`);
  const brandTheme = BRAND_THEMES[slug];
  if (!brandTheme) throw new Error(`no BrandTheme registered in this test for slug ${slug}`);
  const compiled = compileBrandTheme({ brandTheme, tenantSlug: slug });
  return renderVerticalArtifact({
    tenantSlug: spec.slug,
    verticalKey: spec.verticalKey,
    authoredThemePath: spec.authoredThemePath,
    displayName: spec.displayName,
    selector: spec.selector,
    compiledCssVariables: compiled.cssVariables,
    extensionCss: readFileSync(resolve(ARTIFACTS_DIR, `${slug}/_source/extension.css`), 'utf8'),
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  });
}

function countInRuleSelectors(css: string, fragments: readonly string[]): number {
  let count = 0;
  postcss.parse(css).walkRules((rule) => {
    for (const fragment of fragments) {
      count += rule.selector.split(fragment).length - 1;
    }
  });
  return count;
}

describe.each(FIRST_PARTY_ARTIFACT_SPECS.map((spec) => spec.slug))(
  '%s artifact is a generated build output',
  (slug) => {
    it('carries the GENERATED — do not edit header', () => {
      const committed = readFileSync(resolve(ARTIFACTS_DIR, `${slug}/index.css`), 'utf8');
      expect(committed.startsWith(`/* ${GENERATED_ARTIFACT_BANNER} */`)).toBe(true);
    });

    it('matches the committed artifact byte-for-byte (regenerate-and-diff)', () => {
      const committed = readFileSync(resolve(ARTIFACTS_DIR, `${slug}/index.css`), 'utf8');
      expect(generate(slug)).toBe(committed);
    });

    it('is deterministic (a second render is byte-identical)', () => {
      expect(generate(slug)).toBe(generate(slug));
    });
  },
);

describe('first-party generated artifact scope ownership', () => {
  it.each(FIRST_PARTY_ARTIFACT_SPECS)(
    '$slug projects its complete static baseline onto the $verticalKey provider root only',
    (spec) => {
      const generated = generate(spec.slug);
      const ownRoot = `[data-ds-root][data-vertical='${spec.verticalKey}']`;
      const extension = readFileSync(
        resolve(ARTIFACTS_DIR, `${spec.slug}/_source/extension.css`),
        'utf8',
      );
      const authoredSelectors = `${spec.selector} {}\n${extension}`;
      const legacyOwners = [
        `html[data-tenant='${spec.slug}']`,
        `html[data-tenant="${spec.slug}"]`,
      ];
      const authoredOwnerCount = countInRuleSelectors(authoredSelectors, legacyOwners);

      expect(generated).toContain(ownRoot);
      expect(generated).toContain(`html[data-tenant='${spec.slug}']`);
      // Every authored legacy arm survives unchanged and gets exactly one
      // provider-root peer, including both single- and double-quoted sources.
      expect(countInRuleSelectors(generated, legacyOwners)).toBe(authoredOwnerCount);
      expect(countInRuleSelectors(generated, [ownRoot])).toBe(authoredOwnerCount);

      for (const other of FIRST_PARTY_ARTIFACT_SPECS) {
        if (other.verticalKey === spec.verticalKey) continue;
        expect(generated).not.toContain(
          `[data-ds-root][data-vertical='${other.verticalKey}']`,
        );
      }
    },
  );
});
