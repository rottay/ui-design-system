import { describe, expect, it } from 'vitest';

import {
  FIRST_PARTY_ARTIFACT_SPECS,
  projectFirstPartyArtifactScopes,
  renderVerticalArtifact,
} from '../generator';

const BITHIRE_LEGACY = "html[data-tenant='bithire']";
const BITHIRE_ROOT = ":where([data-ds-root][data-vertical='bithire'])";
const BITHIRE_DUAL = `:is(${BITHIRE_LEGACY}, ${BITHIRE_ROOT})`;

describe('first-party static dual-scope projection', () => {
  it('declares the explicit vertical identity for every first-party artifact', () => {
    expect(
      FIRST_PARTY_ARTIFACT_SPECS.map(({ slug, verticalKey }) => [slug, verticalKey]),
    ).toEqual([
      ['bithire', 'bithire'],
      ['evnto', 'evnto'],
      ['rottay', 'platform'],
    ]);
  });

  it('projects dark, class, pseudo, combinator, comma, and nested-at-rule variants', () => {
    const fixture = [
      `${BITHIRE_LEGACY}[data-theme='dark'],`,
      `html[data-tenant="bithire"].dark:hover > .card + .badge::before,`,
      `${BITHIRE_LEGACY}:not([data-theme='dark']) ~ .panel {`,
      '  color: red;',
      '}',
      '@media (width <= 48rem) {',
      `  ${BITHIRE_LEGACY} .mobile-only { display: block; }`,
      '}',
    ].join('\n');

    const projected = projectFirstPartyArtifactScopes(fixture, 'bithire', 'bithire');

    expect(projected).toContain(`${BITHIRE_DUAL}[data-theme='dark'],`);
    expect(projected).toContain(
      `:is(html[data-tenant="bithire"], ${BITHIRE_ROOT}).dark:hover > .card + .badge::before,`,
    );
    expect(projected).toContain(
      `${BITHIRE_DUAL}:not([data-theme='dark']) ~ .panel {`,
    );
    expect(projected).toContain(`  ${BITHIRE_DUAL} .mobile-only { display: block; }`);
  });

  it('keeps legacy specificity by making the unchanged owner the strongest :is arm', () => {
    const projected = projectFirstPartyArtifactScopes(
      `${BITHIRE_LEGACY}.dark:focus-visible .control { color: red; }`,
      'bithire',
      'bithire',
    );

    // The provider branch contributes zero specificity because it is wholly in
    // :where(). :is() therefore takes the unchanged (0,1,1) owner specificity;
    // `.dark:focus-visible .control` contributes exactly as it did before.
    expect(projected).toBe(
      `${BITHIRE_DUAL}.dark:focus-visible .control { color: red; }`,
    );
  });

  it('does not rewrite generic selectors, other slugs, comments, strings, or declarations', () => {
    const fixture = [
      `/* ${BITHIRE_LEGACY} must remain documentation. */`,
      `html[data-tenant], html[data-tenant='evnto'], .html[data-tenant='bithire'] {`,
      `  --selector-example: "${BITHIRE_LEGACY}";`,
      `  content: '${BITHIRE_LEGACY}';`,
      '}',
    ].join('\n');

    expect(projectFirstPartyArtifactScopes(fixture, 'bithire', 'bithire')).toBe(fixture);
  });

  it('targets a provider root itself so nested roots establish an independent baseline', () => {
    const projected = projectFirstPartyArtifactScopes(
      `${BITHIRE_LEGACY} .surface { color: var(--ds-color-text); }`,
      'bithire',
      'bithire',
    );

    // This branch starts at any matching provider root; it does not require the
    // root to be `html` or top-level, so it also works inside another DS root.
    expect(projected).toContain(`${BITHIRE_ROOT}) .surface`);
    expect(projected).not.toContain(`[data-vertical='bithire'][data-tenant='bithire']`);
  });

  it('projects both the compiler block and declared extension without cross-tenant leakage', () => {
    const artifact = renderVerticalArtifact({
      tenantSlug: 'bithire',
      verticalKey: 'bithire',
      authoredThemePath: 'tokens/ts/brand-themes/bithire/bithire.ts',
      displayName: 'BitHire',
      selector: BITHIRE_LEGACY,
      compiledCssVariables: { '--ds-color-primary': '#123456' },
      extensionCss: [
        `${BITHIRE_LEGACY}[data-theme='dark'] { --ds-color-text: white; }`,
        `html[data-tenant='evnto'] { --foreign: untouched; }`,
      ].join('\n'),
      regenerateCommand: 'pnpm build:vertical-css',
    });

    expect(artifact.split(BITHIRE_ROOT)).toHaveLength(3);
    expect(artifact).toContain(`${BITHIRE_DUAL} {\n  --ds-color-primary: #123456;`);
    expect(artifact).toContain(`${BITHIRE_DUAL}[data-theme='dark']`);
    expect(artifact).toContain(`html[data-tenant='evnto'] { --foreign: untouched; }`);
    expect(artifact).not.toContain("data-vertical='evnto'");
  });

  it('rejects unsafe scope keys instead of interpolating selectors', () => {
    expect(() => projectFirstPartyArtifactScopes('', 'bithire', "bithire'] *"))
      .toThrow(/verticalKey must be a lowercase CSS-safe key/);
  });
});
