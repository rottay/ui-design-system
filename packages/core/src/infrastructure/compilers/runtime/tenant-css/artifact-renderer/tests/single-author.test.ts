/**
 * SINGLE AUTHOR — the artifact has exactly one authored source.
 *
 * The first-party artifact used to be assembled from two authored inputs: the
 * compiled BrandTheme, and a hand-written `_source/extension.css` appended after
 * it. Two authors in one cascade means the value a tenant actually paints with
 * is decided by whichever one is read last, so a theme edit could move a channel
 * in the compiled block and change nothing on screen. That is not a bug in a
 * declaration; it is a bug in the FORMAT, and it is unfixable while the format
 * admits a second author.
 *
 * The severance removed the second input from the renderer's API. These laws
 * pin the properties that removal is supposed to buy, so the second author
 * cannot come back through a different door:
 *
 *   L1 the document-root ink is declared exactly once, and by CHANNEL
 *   L2 no mode block re-declares it
 *   L3 the output names one authored source and carries no extension section
 *   L4 a theme with no ink channel fails CLOSED, naming its slug
 *   L5 rendering is deterministic
 *   L6 the ink sits after `color-scheme` and before the custom properties
 *   L7 the ink channel is welded to the compiler's own emitted key
 *
 * WHY THE RENDERER DECLARES THE INK AT ALL. `color` on the document root is
 * artifact-FORMAT semantics, not theme content: this file is the top-level
 * stylesheet a host page loads, so it owns the root chrome the way it owns
 * `color-scheme`. It is written as `var(--ds-color-text-primary)` and never as a
 * literal, which is what keeps it a format concern rather than a second theme
 * author — a DB tenant moves the same ink by moving the same channel through the
 * same `compileTheme` lowering, with no slug branch here and nothing to override.
 *
 * Every law runs per FIRST_PARTY_ARTIFACT_SPECS slug, so a newly registered
 * vertical is covered without editing this file.
 */
import { describe, expect, it } from 'vitest';

import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { FIRST_PARTY_VERTICAL_ROSTER } from '@/foundation/tokens/ts/presentation/brand-themes';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import {
  FIRST_PARTY_ARTIFACT_SPECS,
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  renderFirstPartyArtifact,
  renderVerticalArtifact,
  type FirstPartyArtifactSpec,
} from '../index';
import { channelStates, rootPropertyDeclarations } from './support';
import { liftAuthoredTheme } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/intake';
import { EMPTY_PROVENANCE } from '@/foundation/contracts/composition/tenants/themes/resolved';
import { PRIMARY_ENGINE } from '@/foundation/contracts/kernel/engine-identity';
import { resolveAdapter } from '@/infrastructure/compilers/runtime/theme';
import { compileTheme } from '@/infrastructure/compilers/runtime/theme/runtime/lowering';

/**
 * The ink channel, spelled as a literal ON PURPOSE.
 *
 * Importing this name from the compiler — or deriving it from the compiled map —
 * would make the weld self-referential: rename the channel on both sides and
 * every assertion here would follow the rename and stay green while the shipped
 * artifact silently stopped pointing at the channel apps read. The literal is
 * the only thing that makes L7 able to fail.
 */
const INK_CHANNEL = '--ds-color-text-primary';
const INK_DECLARATION = `color: var(${INK_CHANNEL});`;

/** A color no shipped theme authors, so its presence can only come from the test. */
const CANARY_INK = '#FE01DC';

const THEME_BY_SLUG = new Map<string, BrandTheme>(
  FIRST_PARTY_VERTICAL_ROSTER.map((row) => [row.slug, row.theme]),
);

function themeFor(spec: FirstPartyArtifactSpec): BrandTheme {
  const theme = THEME_BY_SLUG.get(spec.slug);
  if (!theme) throw new Error(`no BrandTheme in the roster for slug ${spec.slug}`);
  return theme;
}

function render(spec: FirstPartyArtifactSpec): string {
  return renderFirstPartyArtifact({
    spec,
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  }).css;
}

/**
 * The same artifact, compiled from a theme this suite authored.
 *
 * `renderFirstPartyArtifact` no longer accepts a theme: the intent names the
 * vertical and the door reads the roster, which is the whole point of the
 * single door. A canary is therefore compiled here and handed to the artifact
 * COMPOSER, so the suite still exercises the real format while the productive
 * entry keeps exactly one baseline authority.
 */
function renderCanary(spec: FirstPartyArtifactSpec, brandTheme: BrandTheme): string {
  const compiled = compileTheme(
    { theme: liftAuthoredTheme(brandTheme), provenance: EMPTY_PROVENANCE },
    resolveAdapter(PRIMARY_ENGINE),
  );
  return renderVerticalArtifact({
    tenantSlug: spec.slug,
    verticalKey: spec.verticalKey,
    authoredThemePath: spec.authoredThemePath,
    displayName: spec.displayName,
    selector: spec.selector,
    compiledCssVariables: compiled.cssVariables,
    colorScheme: compiled.colorScheme,
    modeBlocks: compiled.modeBlocks,
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  });
}

describe.each(FIRST_PARTY_ARTIFACT_SPECS)(
  '$slug artifact has exactly one author',
  (spec) => {
    it('L1 · declares the document-root ink exactly once, by channel and never by value', () => {
      const inks = rootPropertyDeclarations(render(spec), 'color');

      expect(inks).toHaveLength(1);
      expect(inks[0].value).toBe(`var(${INK_CHANNEL})`);
      // A literal here would be a second author for the root: it would keep
      // painting after the theme moved the channel underneath it.
      expect(inks[0].value).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(inks[0].value).not.toMatch(/\b(rgb|hsl|oklch|lab|lch)a?\(/i);
      // …and it is the BASE block that declares it: the base block is the rule
      // that authors the root in the default state, with no mode attribute set.
      expect(inks[0].states.has('default')).toBe(true);
    });

    it('L2 · no mode block re-declares the root ink', () => {
      const css = render(spec);
      const modeInks = rootPropertyDeclarations(css, 'color').filter(
        (ink) => !ink.states.has('default'),
      );

      expect(modeInks).toEqual([]);
      // Stated the other way round, so the law still bites if `states` ever
      // stops distinguishing the two: the whole artifact holds one `color:`
      // DECLARATION. Anchored to the start of a line on purpose — the ink
      // channel is also the VALUE of many compiled channels
      // (`--ds-*-color: var(--ds-color-text-primary);`), and a bare substring
      // search cannot tell a declaration from a dereference of it.
      expect(css.match(/^\s*color:.*$/gm) ?? []).toEqual([`  ${INK_DECLARATION}`]);
    });

    it('L3 · names one authored source and carries no extension section', () => {
      const css = render(spec);

      expect(css).toContain(`${spec.authoredThemePath} (compiled via compileTheme)`);
      expect(css).toContain('compiled from ONE authored source');
      expect(css).not.toContain('two authored sources');
      expect(css).not.toContain('Declared artifact extension');
      expect(css).not.toContain('_source/extension.css');
      // The header must not enumerate sources at all any more.
      expect(css).not.toContain(' *   1. ');
      expect(css).not.toContain(' *   2. ');
    });

    it('L4 · fails closed, naming the slug, when the theme carries no ink channel', () => {
      const compiled = lowerBrandThemeFixture({
        brandTheme: themeFor(spec),
        tenantSlug: spec.slug,
      });
      const withoutInk = { ...compiled.cssVariables };
      delete withoutInk[INK_CHANNEL];

      const renderWith = (compiledCssVariables: Record<string, string>) => () =>
        renderVerticalArtifact({
          tenantSlug: spec.slug,
          verticalKey: spec.verticalKey,
          authoredThemePath: spec.authoredThemePath,
          displayName: spec.displayName,
          selector: spec.selector,
          compiledCssVariables,
          colorScheme: compiled.colorScheme,
          modeBlocks: compiled.modeBlocks,
          regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
        });

      // The compiler emits this channel CONDITIONALLY (it is written only when
      // the palette authors `textPrimaryColor`), which is precisely why the
      // renderer may not assume it. Missing and blank both refuse.
      expect(renderWith(withoutInk)).toThrow(new RegExp(`${spec.slug}.*${INK_CHANNEL}`));
      expect(renderWith({ ...withoutInk, [INK_CHANNEL]: '   ' })).toThrow(
        new RegExp(`${spec.slug}.*${INK_CHANNEL}`),
      );
      // No silent fallback: it refuses rather than inventing an ink.
      expect(renderWith(withoutInk)).not.toThrow(/undefined/);
      expect(renderWith(compiled.cssVariables)).not.toThrow();
    });

    it('L5 · renders deterministically from the same authored source', () => {
      expect(render(spec)).toBe(render(spec));
    });

    it('L6 · places the ink after color-scheme and before the compiled channels', () => {
      const css = render(spec);
      const inkAt = css.indexOf(`  ${INK_DECLARATION}`);
      const firstChannelAt = css.indexOf(`  --ds-`);

      expect(inkAt).toBeGreaterThan(-1);
      expect(firstChannelAt).toBeGreaterThan(-1);
      expect(inkAt).toBeLessThan(firstChannelAt);

      const schemeAt = css.indexOf('  color-scheme:');
      if (schemeAt !== -1) expect(schemeAt).toBeLessThan(inkAt);
    });

    it('L7 · welds the rendered ink to the compiler-emitted channel, not to a value', () => {
      const authored = themeFor(spec);
      // `BrandTheme.palette` is optional, so spreading it unchecked would widen
      // every field to `| undefined` and quietly let the canary theme ship a
      // half-authored palette. A first-party theme that authors no palette
      // cannot exercise this law at all, so say so instead of compiling around
      // it.
      if (!authored.palette) throw new Error(`${spec.slug} BrandTheme authors no palette`);
      const canaryTheme: BrandTheme = {
        ...authored,
        palette: { ...authored.palette, textPrimaryColor: CANARY_INK },
      };
      const compiled = lowerBrandThemeFixture({
        brandTheme: canaryTheme,
        tenantSlug: spec.slug,
      });

      // (i) the theme author reaches the channel, under the literal key. A
      // compiler that renamed the key, or that stopped sourcing it from
      // `palette.textPrimaryColor`, dies here.
      expect(compiled.cssVariables[INK_CHANNEL]).toBe(CANARY_INK);

      // (ii) the artifact points at that channel by NAME and never inlines its
      // value — so moving the seed moves the paint without moving this line.
      const css = renderCanary(spec, canaryTheme);
      const inks = rootPropertyDeclarations(css, 'color');
      expect(inks).toHaveLength(1);
      expect(inks[0].value).toBe(`var(${INK_CHANNEL})`);
      expect(inks[0].value).not.toContain(CANARY_INK);
      expect(css).toContain(`  ${INK_CHANNEL}: ${CANARY_INK};`);

      // (iii) the channel the ink dereferences is authored in the same state
      // the ink is declared in, so the reference actually resolves.
      expect(channelStates(css).get(INK_CHANNEL)?.has('default')).toBe(true);

      // …and the canary only ever appears as a channel value, never as paint.
      expect(css).not.toContain(`color: ${CANARY_INK}`);
    });
  },
);
