/**
 * The `prefers-contrast: more` section of a first-party artifact.
 *
 * All three verticals legitimately emit NOTHING here: bithire already rests at
 * the high contrast posture, and evnto and rottay author no status seeds, so
 * re-lowering them at high moves no channel. That zero is pinned as the honest
 * invariant; the section itself is exercised over a bithire theme moved to
 * `standard`, which is the only way a first-party compile can have one.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FlatTheme } from '@/foundation/contracts/composition/tenants/themes';
import { EMPTY_PROVENANCE } from '@/foundation/contracts/composition/tenants/themes/resolved';
import { PRIMARY_ENGINE } from '@/foundation/contracts/kernel/engine-identity';
import { resolveAdapter } from '@/infrastructure/compilers/runtime/theme';
import { compileTheme } from '@/infrastructure/compilers/runtime/theme/runtime/lowering';
import { liftAuthoredTheme } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/intake';

import {
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
  renderVerticalArtifact,
} from '../index';

const SRC = resolve(__dirname, '../../../../../..');

describe('first-party artifacts: the contrast section is empty by construction', () => {
  it.each(FIRST_PARTY_ARTIFACT_SPECS.map((spec) => [spec.slug, spec] as const))(
    '%s compiles no contrast block and its committed artifact carries zero bytes of one',
    (slug, spec) => {
      const { compiled, css } = renderFirstPartyArtifact({ spec });
      expect(compiled.contrastBlocks).toBeUndefined();
      expect(css).not.toContain('prefers-contrast');
      const committed = readFileSync(
        resolve(SRC, `foundation/tokens/css/facade/artifacts/${slug}/index.css`),
        'utf8',
      );
      expect(committed).not.toContain('prefers-contrast');
      expect(committed).toBe(css);
    },
  );

  it('covers the whole roster', () => {
    expect(FIRST_PARTY_ARTIFACT_SPECS.map((spec) => spec.slug).sort()).toEqual(['bithire', 'evnto', 'rottay']);
  });
});

describe('first-party artifacts: a compile that has a contrast block renders it', () => {
  const bithire = firstPartyFixture('bithire');
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === 'bithire')!;
  const atStandard: FlatTheme = {
    ...bithire,
    palette: { ...bithire.palette!, contrastPosture: 'standard' },
  };
  const compiled = compileTheme(
    { theme: liftAuthoredTheme(atStandard), provenance: EMPTY_PROVENANCE },
    resolveAdapter(PRIMARY_ENGINE),
  );
  const css = renderVerticalArtifact({
    tenantSlug: spec.slug,
    verticalKey: spec.verticalKey,
    authoredThemePath: spec.authoredThemePath,
    displayName: spec.displayName,
    selector: spec.selector,
    compiledCssVariables: compiled.cssVariables,
    colorScheme: compiled.colorScheme,
    modeBlocks: compiled.modeBlocks,
    contrastBlocks: compiled.contrastBlocks,
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  });

  it('emits exactly the channels the high posture moves, after the mode blocks, on the base scope', () => {
    const base = compiled.contrastBlocks?.find((block) => block.mode === undefined);
    expect(base).toBeDefined();
    const moved = Object.keys(base!.cssVariables).sort();
    expect(moved.length).toBe(11);
    const section = css.slice(css.indexOf('@media (prefers-contrast: more) {'));
    expect(css.indexOf('=== Compiled from Theme.modes.dark')).toBeLessThan(
      css.indexOf('=== Compiled from palette.contrast-posture high'),
    );
    expect(section).toContain(
      ":is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire'])) {",
    );
    const declared = [...section.matchAll(/^\s+(--ds-[a-z0-9-]+):/gm)].map((match) => match[1]).sort();
    expect(declared).toEqual(moved);
    for (const channel of moved) {
      expect(section).toContain(`${channel}: ${base!.cssVariables[channel]};`);
      expect(compiled.cssVariables[channel]).not.toBe(base!.cssVariables[channel]);
    }
  });
});

describe('the lowering: a mode delta corrects the mode rule it sits over', () => {
  const bithire = firstPartyFixture('bithire');
  const lower = (theme: FlatTheme) =>
    compileTheme({ theme: liftAuthoredTheme(theme), provenance: EMPTY_PROVENANCE }, resolveAdapter(PRIMARY_ENGINE));
  // Light dark-mode seeds re-derive their own inks in the dark block, which a
  // base-only delta could never reach: the dark rule outranks it.
  const withDarkSeeds = (posture: 'standard' | 'high'): FlatTheme => ({
    ...bithire,
    palette: { ...bithire.palette!, contrastPosture: posture },
    modes: {
      ...bithire.modes,
      dark: {
        ...bithire.modes?.dark,
        palette: { ...bithire.modes?.dark?.palette, successColor: '#4ADE80', errorColor: '#F87171' },
      },
    },
  });
  const rest = lower(withDarkSeeds('standard'));
  const high = lower(withDarkSeeds('high'));

  const underMore = (mode?: 'dark') => ({
    ...rest.cssVariables,
    ...rest.contrastBlocks?.find((block) => block.mode === undefined)?.cssVariables,
    ...(mode ? rest.modeBlocks.find((block) => block.mode === mode)?.cssVariables : {}),
    ...(mode ? rest.contrastBlocks?.find((block) => block.mode === mode)?.cssVariables : {}),
  });
  const effective = (mode?: 'dark') => ({
    ...high.cssVariables,
    ...(mode ? high.modeBlocks.find((block) => block.mode === mode)?.cssVariables : {}),
  });

  it('states the dark inks in a dark contrast block and nothing else there', () => {
    const dark = rest.contrastBlocks?.find((block) => block.mode === 'dark');
    expect(dark?.cssVariables).toEqual({
      '--ds-color-on-success': '#000000',
      '--ds-color-on-error': '#000000',
    });
    const restDark = rest.modeBlocks.find((block) => block.mode === 'dark')!.cssVariables;
    expect(restDark['--ds-color-on-success']).toBe('#171717');
    expect(restDark['--ds-color-on-error']).toBe('#171717');
  });

  it('resolves every state under the preference exactly as the compile at high', () => {
    expect(high.contrastBlocks).toBeUndefined();
    expect(underMore()).toEqual(effective());
    expect(underMore('dark')).toEqual(effective('dark'));
  });
});
