/**
 * Generated-artifact guard for the bithire vertical artifact (WO-DES-02).
 *
 * The committed `artifacts/bithire/index.css` must be byte-identical to what the
 * generator produces from its authored sources (compiled BrandTheme + declared
 * extension). This is the regenerate-and-diff rule that fails on ANY manual edit
 * to the artifact: hand-edit the artifact and this test goes red; regenerate
 * (`pnpm build:vertical-css`) and it goes green. It also proves regeneration is
 * deterministic (a second render equals the first).
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
import { bithireBrandTheme } from '../ts/brand-themes/bithire';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = resolve(TEST_DIR, '..', 'css/artifacts');

const BRAND_THEMES = {
  bithire: bithireBrandTheme,
} as const;

function generate(slug: keyof typeof BRAND_THEMES): string {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((entry) => entry.slug === slug);
  if (!spec) throw new Error(`no artifact spec for ${slug}`);
  const compiled = compileBrandTheme({ brandTheme: BRAND_THEMES[slug], tenantSlug: slug });
  return renderVerticalArtifact({
    tenantSlug: spec.slug,
    displayName: spec.displayName,
    selector: spec.selector,
    compiledCssVariables: compiled.cssVariables,
    extensionCss: readFileSync(resolve(ARTIFACTS_DIR, `${slug}/_source/extension.css`), 'utf8'),
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  });
}

describe('bithire artifact is a generated build output', () => {
  it('carries the GENERATED — do not edit header', () => {
    const committed = readFileSync(resolve(ARTIFACTS_DIR, 'bithire/index.css'), 'utf8');
    expect(committed.startsWith(`/* ${GENERATED_ARTIFACT_BANNER} */`)).toBe(true);
  });

  it('matches the committed artifact byte-for-byte (regenerate-and-diff)', () => {
    const committed = readFileSync(resolve(ARTIFACTS_DIR, 'bithire/index.css'), 'utf8');
    expect(generate('bithire')).toBe(committed);
  });

  it('is deterministic (a second render is byte-identical)', () => {
    expect(generate('bithire')).toBe(generate('bithire'));
  });
});
