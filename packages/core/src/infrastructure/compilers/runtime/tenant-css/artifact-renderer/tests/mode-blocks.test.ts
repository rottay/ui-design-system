/**
 * The compiled mode block must actually reach the artifact.
 *
 * A contract that compiles a second mode but never renders it would be the
 * same silent inertness the Round 3 audit found elsewhere: the type checks, the
 * unit test passes, and the shipped CSS is unchanged. These assert the artifact
 * itself — the block is present, scoped above the base block, and carries the
 * value a typed edit put there.
 */
import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from '../index';

const EXTENSION = "html[data-tenant='bithire'] {\n  --ds-fixture-only: 1px;\n}\n";

const bithireSpec = () => {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === 'bithire');
  if (!spec) throw new Error('no artifact spec for bithire');
  return spec;
};

const render = (brandTheme: BrandTheme) =>
  renderFirstPartyArtifact({ spec: bithireSpec(), brandTheme, extensionCss: EXTENSION }).css;

describe('mode blocks in the rendered artifact', () => {
  it('renders one block per authored mode, scoped above the base block', () => {
    const css = render(bithireBrandTheme);

    expect(css).toContain('/* === Compiled from BrandTheme.modes.dark — do not edit === */');
    // The scope projection wraps the tenant arm; the mode attribute must stay
    // OUTSIDE that group, or the block would tie with the base block instead of
    // outranking it. `:is()` contributes the max specificity of its arguments,
    // so the projected base is (0,1,1) and the projected mode is (0,2,1).
    expect(css).toContain(
      ":is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire']))[data-theme='dark'], " +
        ":is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire'])).dark {",
    );
    // The base block comes first and stays unconditional; the mode block is the
    // only place an explicit mode selector is written.
    expect(css.indexOf('=== Compiled from BrandTheme via')).toBeLessThan(
      css.indexOf('=== Compiled from BrandTheme.modes.dark'),
    );
  });

  it('carries a typed seed edit from modes.dark into the artifact', () => {
    const edited: BrandTheme = {
      ...bithireBrandTheme,
      modes: {
        ...bithireBrandTheme.modes,
        dark: {
          ...bithireBrandTheme.modes?.dark,
          palette: {
            ...bithireBrandTheme.modes?.dark?.palette,
            backgroundColor: '#BADA55',
          },
        },
      },
    };

    expect(render(bithireBrandTheme)).not.toContain('#BADA55');
    expect(render(edited)).toContain('--ds-color-bg-primary: #BADA55;');
  });

  it('emits no mode section for a theme that authors none', () => {
    const singleMode: BrandTheme = { ...bithireBrandTheme, modes: undefined };
    const css = render(singleMode);

    expect(css).not.toContain('Compiled from BrandTheme.modes');
    expect(css).not.toContain("[data-theme='dark']");
  });

  it('keeps the artifact a pure function of its two authored sources', () => {
    // Same inputs, same bytes: the renderer must not depend on anything else.
    expect(render(bithireBrandTheme)).toBe(render(bithireBrandTheme));
  });

  it('does not restate a base-block channel inside the mode block', () => {
    const compiled = compileBrandTheme({
      brandTheme: bithireBrandTheme,
      tenantSlug: 'bithire',
    });
    const dark = compiled.modeBlocks?.find((block) => block.mode === 'dark');

    expect(dark).toBeDefined();
    for (const [channel, value] of Object.entries(dark!.cssVariables)) {
      expect(
        compiled.cssVariables[channel],
        `${channel} is restated with the base value`,
      ).not.toBe(value);
    }
  });
});
