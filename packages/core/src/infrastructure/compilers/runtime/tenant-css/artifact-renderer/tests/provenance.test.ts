/**
 * Strategic tests for the static artifact path (R1-P, AD-7 T1/T11/T12).
 *
 * The Round 3 audit's worst class of defect was silent inertness: a FlatTheme
 * value that never reaches a pixel, and an artifact that no longer matches its
 * sources. Neither shows up in a snapshot test, because the snapshot is taken
 * from the same broken output. These assert the causal chain instead —
 * change the theme, see the artifact change; corrupt the artifact, see the
 * freshness comparison fail; re-gate the rottay selector, see the base state
 * lose its author.
 */
import { describe, expect, it } from 'vitest';

import { firstPartyFixture, lowerFlatThemeFixture } from "@tests/support/theme-lowering";
import type { FlatTheme } from '@/foundation/contracts/composition/tenants/themes';

import {
  FIRST_PARTY_ARTIFACT_SPECS,
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  renderVerticalArtifact,
  type FirstPartyArtifactSpec,
} from '../index';

const bithireFlatTheme = firstPartyFixture('bithire');
const rottayFlatTheme = firstPartyFixture('rottay');

function specFor(slug: string): FirstPartyArtifactSpec {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === slug);
  if (!spec) throw new Error(`no artifact spec for ${slug}`);
  return spec;
}

function render(flatTheme: FlatTheme, spec: FirstPartyArtifactSpec): string {
  const compiled = lowerFlatThemeFixture({ flatTheme, tenantSlug: spec.slug });
  return renderVerticalArtifact({
    tenantSlug: spec.slug,
    verticalKey: spec.verticalKey,
    authoredThemePath: spec.authoredThemePath,
    displayName: spec.displayName,
    selector: spec.selector,
    compiledCssVariables: compiled.cssVariables,
    colorScheme: compiled.colorScheme,
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  });
}

/** Every `--ds-*: value;` pair in a rendered artifact. */
function declarations(css: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const match of css.matchAll(/^\s*(--[\w-]+):\s*([^;]+);$/gm)) {
    found.set(match[1], match[2].trim());
  }
  return found;
}

describe('T1 · FlatTheme values propagate into the rendered artifact', () => {
  const spec = specFor('bithire');

  it('a changed palette seed changes the artifact at that channel and nowhere unrelated', () => {
    const before = render(bithireFlatTheme, spec);
    const mutated: FlatTheme = {
      ...bithireFlatTheme,
      palette: { ...bithireFlatTheme.palette!, textMutedColor: '#123456' },
    };
    const after = render(mutated, spec);

    expect(after).not.toBe(before);
    expect(declarations(after).get('--ds-color-text-muted')).toBe('#123456');

    const beforeDecls = declarations(before);
    const moved = [...declarations(after)].filter(([name, value]) => beforeDecls.get(name) !== value);
    expect(moved.map(([name]) => name)).toEqual(['--ds-color-text-muted']);
  });

  it('an authored chrome literal is served by the compiled block, folded through the vertical dial', () => {
    // The artifact carries a chrome channel because the THEME says so; there is
    // no later block to slice off before asserting. A value that is no single
    // length is left alone.
    const kept: FlatTheme = {
      ...bithireFlatTheme,
      chrome: {
        ...bithireFlatTheme.chrome,
        badge: { ...bithireFlatTheme.chrome?.badge, radius: 'var(--ds-radius-full)' },
      },
    };
    expect(render(kept, spec)).toContain('--ds-badge-radius: var(--ds-radius-full);');

    const mutated: FlatTheme = {
      ...bithireFlatTheme,
      chrome: {
        ...bithireFlatTheme.chrome,
        badge: { ...bithireFlatTheme.chrome?.badge, radius: '3px' },
      },
    };
    // An authored literal reaches the block folded through the radius dial,
    // divided by the scale this same compilation emits so the resting corner is
    // still 3px. bithire's dial is its preset's shape.radius-scale, 0.8
    // (WO-DER-06 derivation-lane registry, D6-2c-ii, 2026-09-15: 1.25 -> 0.8).
    expect(render(mutated, spec)).toContain(
      '--ds-badge-radius: calc(3px / 0.8 * var(--ds-radius-scale, 1));'
    );
  });

  it('the declared default mode reaches the artifact as color-scheme', () => {
    expect(render(bithireFlatTheme, spec)).toContain('  color-scheme: light;');
    expect(render(rottayFlatTheme, specFor('rottay'))).toContain('  color-scheme: dark;');

    const undeclared: FlatTheme = { ...bithireFlatTheme, appearance: undefined };
    expect(render(undeclared, spec)).not.toContain('color-scheme:');
  });
});

describe('T11 · a hand-edited artifact fails the freshness comparison', () => {
  const spec = specFor('bithire');

  it('detects a stale copy without touching the committed file', () => {
    const generated = render(bithireFlatTheme, spec);
    const primary = declarations(generated).get('--ds-color-primary');
    expect(primary).toBeDefined();

    // The build script's whole staleness test is `current !== output`; drill it
    // on an in-memory copy so the repository artifact is never written.
    const handEdited = generated.replace(`--ds-color-primary: ${primary};`, '--ds-color-primary: #000000;');
    expect(handEdited).not.toBe(generated);
    expect(generated === handEdited).toBe(false);

    // …and a copy that only differs by regeneration is equal again.
    expect(render(bithireFlatTheme, spec)).toBe(generated);
  });
});

describe('T12 · a rottay tenant is served in the base state', () => {
  const spec = specFor('rottay');
  // rottay's default mode is dark by roster; the preset authors no palette, so
  // the palette served unconditionally is a tenant's own.
  const darkTenant: FlatTheme = {
    ...rottayFlatTheme,
    palette: { ...rottayFlatTheme.palette, primaryColor: '#F5F5F7', secondaryColor: '#9A9AA0' },
  };

  it('the compiled block applies unconditionally', () => {
    expect(spec.selector).toBe("html[data-tenant='rottay']");
    expect(spec.selector).not.toContain('data-theme');

    const compiledBlock = render(rottayFlatTheme, spec);
    // Scope projection wraps the spec selector; what matters is that nothing in
    // the result narrows it to a mode.
    //
    // Built from the spec rather than hardcoded. This literal used to read
    // a mismatched vertical identity under `data-tenant='rottay'`, so the test
    // pinned the very slug/verticalKey inversion the roster exists to remove.
    expect(compiledBlock).toContain(
      `:is(html[data-tenant='${spec.slug}'], :where([data-ds-root][data-vertical='${spec.verticalKey}'])) {`
    );
    // ...and the two halves are the same identity, which is the actual law.
    expect(spec.verticalKey).toBe(spec.slug);
    expect(compiledBlock).not.toContain('data-theme');
    expect(compiledBlock).not.toContain('.light');
  });

  it('the tenant carries the dark-default palette it declares', () => {
    expect(rottayFlatTheme.appearance?.defaultMode).toBe('dark');
    const decls = declarations(render(darkTenant, spec));
    expect(decls.get('--ds-color-primary')).toBe('#F5F5F7');
    expect(decls.get('--ds-color-secondary')).toBe('#9A9AA0');
  });

  it('drill · re-gating the spec on light removes the base-state author', () => {
    const regated: FirstPartyArtifactSpec = {
      ...spec,
      selector: "html[data-tenant='rottay'][data-theme='light'], html[data-tenant='rottay'].light",
    };
    const artifact = render(darkTenant, regated);

    // This is the Round 3 defect verbatim: a dark palette emitted under a light
    // gate, so the base state (`data-theme="base"`) has no compiled author.
    expect(artifact).toContain("[data-theme='light']");
    expect(artifact).toContain('--ds-color-primary: #F5F5F7;');
    expect(artifact).not.toBe(render(darkTenant, spec));
  });
});
