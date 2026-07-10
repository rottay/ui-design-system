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
    displayName: spec.displayName,
    selector: spec.selector,
    compiledCssVariables: compiled.cssVariables,
    extensionCss: readFileSync(resolve(ARTIFACTS_DIR, `${slug}/_source/extension.css`), 'utf8'),
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  });
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
