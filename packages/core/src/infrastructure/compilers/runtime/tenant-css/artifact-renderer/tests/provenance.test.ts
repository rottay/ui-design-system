/**
 * Strategic tests for the static artifact path (R1-P, AD-7 T1/T11/T12).
 *
 * The Round 3 audit's worst class of defect was silent inertness: a BrandTheme
 * value that never reaches a pixel, and an artifact that no longer matches its
 * sources. Neither shows up in a snapshot test, because the snapshot is taken
 * from the same broken output. These assert the causal chain instead —
 * change the theme, see the artifact change; corrupt the artifact, see the
 * freshness comparison fail; re-gate the rottay selector, see the base state
 * lose its author.
 */
import { describe, expect, it } from 'vitest';

import {
  compileBrandTheme,
} from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/platform';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import {
  FIRST_PARTY_ARTIFACT_SPECS,
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  renderVerticalArtifact,
  type FirstPartyArtifactSpec,
} from '../index';

const EXTENSION = "html[data-tenant='fixture'] {\n  --ds-fixture-only: 1px;\n}\n";

function specFor(slug: string): FirstPartyArtifactSpec {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === slug);
  if (!spec) throw new Error(`no artifact spec for ${slug}`);
  return spec;
}

function render(brandTheme: BrandTheme, spec: FirstPartyArtifactSpec, extensionCss = EXTENSION): string {
  const compiled = compileBrandTheme({ brandTheme, tenantSlug: spec.slug });
  return renderVerticalArtifact({
    tenantSlug: spec.slug,
    verticalKey: spec.verticalKey,
    authoredThemePath: spec.authoredThemePath,
    displayName: spec.displayName,
    selector: spec.selector,
    compiledCssVariables: compiled.cssVariables,
    colorScheme: compiled.colorScheme,
    extensionCss,
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

describe('T1 · BrandTheme values propagate into the rendered artifact', () => {
  const spec = specFor('bithire');

  it('a changed palette seed changes the artifact at that channel and nowhere unrelated', () => {
    const before = render(bithireBrandTheme, spec);
    const mutated: BrandTheme = {
      ...bithireBrandTheme,
      palette: { ...bithireBrandTheme.palette!, textMutedColor: '#123456' },
    };
    const after = render(mutated, spec);

    expect(after).not.toBe(before);
    expect(declarations(after).get('--ds-color-text-muted')).toBe('#123456');

    const beforeDecls = declarations(before);
    const moved = [...declarations(after)].filter(([name, value]) => beforeDecls.get(name) !== value);
    expect(moved.map(([name]) => name)).toEqual(['--ds-color-text-muted']);
  });

  it('a channel adopted from the extension is served by the compiled block', () => {
    // These were extension re-declarations before R1-P; the artifact must now
    // carry them because the THEME says so, not because a later block did.
    const compiledBlock = render(bithireBrandTheme, spec).split('/* === Declared artifact extension')[0];
    expect(compiledBlock).toContain('--ds-badge-radius: var(--ds-radius-full);');
    expect(compiledBlock).toContain('--ds-color-text-muted: #8a9aaa;');

    const mutated: BrandTheme = {
      ...bithireBrandTheme,
      chrome: {
        ...bithireBrandTheme.chrome!,
        badge: { ...bithireBrandTheme.chrome!.badge!, radius: '3px' },
      },
    };
    expect(render(mutated, spec)).toContain('--ds-badge-radius: 3px;');
  });

  it('the declared default mode reaches the artifact as color-scheme', () => {
    expect(render(bithireBrandTheme, spec)).toContain('  color-scheme: light;');
    expect(render(rottayBrandTheme, specFor('rottay'))).toContain('  color-scheme: dark;');

    const undeclared: BrandTheme = { ...bithireBrandTheme, appearance: undefined };
    expect(render(undeclared, spec)).not.toContain('color-scheme:');
  });
});

describe('T11 · a hand-edited artifact fails the freshness comparison', () => {
  const spec = specFor('bithire');

  it('detects a stale copy without touching the committed file', () => {
    const generated = render(bithireBrandTheme, spec);

    // The build script's whole staleness test is `current !== output`; drill it
    // on an in-memory copy so the repository artifact is never written.
    const handEdited = generated.replace('--ds-color-text-muted: #8a9aaa;', '--ds-color-text-muted: #000000;');
    expect(handEdited).not.toBe(generated);
    expect(generated === handEdited).toBe(false);

    // …and a copy that only differs by regeneration is equal again.
    expect(render(bithireBrandTheme, spec)).toBe(generated);
  });

  it('a changed extension source makes the previous artifact stale', () => {
    const generated = render(bithireBrandTheme, spec);
    const withExtraExtension = render(
      bithireBrandTheme,
      spec,
      `${EXTENSION}\nhtml[data-tenant='fixture'] {\n  --ds-fixture-late: 2px;\n}\n`
    );
    expect(withExtraExtension).not.toBe(generated);
    expect(withExtraExtension).toContain('--ds-fixture-late: 2px;');
  });
});

describe('T12 · rottay serves its BrandTheme in the base state', () => {
  const spec = specFor('rottay');

  it('the compiled block applies unconditionally', () => {
    expect(spec.selector).toBe("html[data-tenant='rottay']");
    expect(spec.selector).not.toContain('data-theme');

    const artifact = render(rottayBrandTheme, spec);
    const compiledBlock = artifact.split('/* === Declared artifact extension')[0];
    // Scope projection wraps the spec selector; what matters is that nothing in
    // the result narrows it to a mode.
    expect(compiledBlock).toContain(
      ":is(html[data-tenant='rottay'], :where([data-ds-root][data-vertical='platform'])) {"
    );
    expect(compiledBlock).not.toContain('data-theme');
    expect(compiledBlock).not.toContain('.light');
  });

  it('the theme carries the dark palette it declares', () => {
    expect(rottayBrandTheme.appearance?.defaultMode).toBe('dark');
    const decls = declarations(render(rottayBrandTheme, spec));
    expect(decls.get('--ds-color-primary')).toBe('#FFFFFF');
    expect(decls.get('--ds-color-secondary')).toBe('#A0A0A5');
  });

  it('drill · re-gating the spec on light removes the base-state author', () => {
    const regated: FirstPartyArtifactSpec = {
      ...spec,
      selector: "html[data-tenant='rottay'][data-theme='light'], html[data-tenant='rottay'].light",
    };
    const artifact = render(rottayBrandTheme, regated);
    const compiledBlock = artifact.split('/* === Declared artifact extension')[0];

    // This is the Round 3 defect verbatim: a dark palette emitted under a light
    // gate, so the base state (`data-theme="base"`) has no compiled author.
    expect(compiledBlock).toContain("[data-theme='light']");
    expect(compiledBlock).toContain('--ds-color-primary: #FFFFFF;');
    expect(artifact).not.toBe(render(rottayBrandTheme, spec));
  });
});
