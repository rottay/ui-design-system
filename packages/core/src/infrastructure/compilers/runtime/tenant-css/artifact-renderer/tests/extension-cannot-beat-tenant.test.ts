/**
 * EXTENSION-CANNOT-BEAT-TENANT — no manual layer outranks the tenant config.
 *
 * A first-party artifact has exactly two authors: the BrandTheme, compiled
 * into the base block and its mode blocks, and a declared extension for what
 * the typed contract cannot express. The extension comes LAST in the file, so
 * at equal specificity it wins. If it re-declares a channel the compiler
 * already emits, for a state where both rules apply, then the theme's value
 * never reaches a pixel: the BrandTheme becomes a document about intent while
 * the extension is the thing that paints. Editing the theme changes nothing
 * and nothing tells you why.
 *
 * `scripts/artifact-provenance-gate.mjs` enforces this on the committed CSS.
 * This asserts the same law behaviourally, on what `renderVerticalArtifact`
 * produces right now, so a compiler change that starts emitting a channel the
 * extension already owns is caught at the source rather than at the next gate
 * run — and so the law holds for a rendered artifact that was never written to
 * disk.
 *
 * Same-reachable-state is the whole subtlety. A `[data-theme='light']` rule in
 * a dark-default artifact does not compete with the base block; it authors a
 * state the base block only supplies a fallback for. Only a rule that can match
 * the tenant ROOT in the artifact's DEFAULT mode is a conflict.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { evntoBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/evnto';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/rottay';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import { FIRST_PARTY_ARTIFACT_SPECS, renderFirstPartyArtifact } from '../index';
import {
  EXTENSION_MARKER,
  channelStates,
  splitArtifact,
  tenantOverrideConflicts,
} from './support';

const ARTIFACTS = resolve(
  process.cwd(),
  'src/foundation/tokens/css/facade/artifacts'
);

const THEME_BY_SLUG: Record<string, BrandTheme> = {
  bithire: bithireBrandTheme,
  evnto: evntoBrandTheme,
  rottay: rottayBrandTheme,
};

/** One tenant-override conflict, tagged with the vertical it was observed on. */
type Conflict = { slug: string; channel: string };

/** Conflicts for one vertical, tagged with the slug for the pinned inventory. */
function conflicts(slug: string, artifactCss: string): Conflict[] {
  return tenantOverrideConflicts(artifactCss).map((channel) => ({ slug, channel }));
}

function renderArtifact(slug: string, extensionOverride?: string): string {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === slug);
  if (!spec) throw new Error(`no artifact spec for ${slug}`);
  const extensionCss =
    extensionOverride ??
    readFileSync(join(ARTIFACTS, slug, '_source/extension.css'), 'utf-8');
  return renderFirstPartyArtifact({ spec, brandTheme: THEME_BY_SLUG[slug], extensionCss }).css;
}

/**
 * Same-state re-declarations that survive TODAY (decrease-only).
 *
 * VERTICAL-CONFLICT-9 drained the 9-channel roster from DEAD-61, so the
 * inventory is now empty. The staleness assertion refuses any pin that does
 * not match reality, which is why this array must stay empty until a new
 * capability-gap re-declaration is honestly introduced.
 */
const KNOWN_SAME_STATE_REDECLARATIONS: readonly string[] = [];

const key = (conflict: Conflict) => `${conflict.slug} :: ${conflict.channel}`;

const observed = () =>
  FIRST_PARTY_ARTIFACT_SPECS.flatMap((spec) =>
    conflicts(spec.slug, renderArtifact(spec.slug))
  ).map(key);

describe('EXTENSION-CANNOT-BEAT-TENANT · rendered first-party artifacts', () => {
  it('covers all three verticals with a real extension and a real theme', () => {
    expect(FIRST_PARTY_ARTIFACT_SPECS.map((spec) => spec.slug).sort()).toEqual([
      'bithire',
      'evnto',
      'rottay',
    ]);
    for (const spec of FIRST_PARTY_ARTIFACT_SPECS) {
      expect(renderArtifact(spec.slug)).toContain(EXTENSION_MARKER);
    }
  });

  it('no extension re-declares a compiled channel beyond the pinned inventory', () => {
    const pinned = new Set(KNOWN_SAME_STATE_REDECLARATIONS);
    expect(observed().filter((entry) => !pinned.has(entry))).toEqual([]);
  });

  it('the pinned inventory has no stale entry', () => {
    const current = new Set(observed());
    expect(KNOWN_SAME_STATE_REDECLARATIONS.filter((entry) => !current.has(entry))).toEqual(
      []
    );
  });

  it('evnto is already clean — the property is reachable, not aspirational', () => {
    expect(conflicts('evnto', renderArtifact('evnto'))).toEqual([]);
  });

  it('a channel the compiled side authors only in the OTHER mode is not a conflict', () => {
    // The real case, not a synthetic one. bithire is light by default and its
    // extension is gated `:not([data-theme=dark]):not(.dark)`, so it authors
    // {default, light}. The compiled dark mode block authors {dark}. They name
    // many of the same channels and never compete — counting those would report
    // over a hundred phantom conflicts and make the inventory unusable.
    const artifact = renderArtifact('bithire');
    const sections = splitArtifact(artifact);
    const compiled = channelStates(sections.compiled);
    const extension = channelStates(sections.extension);

    const darkOnlyOverlap = [...extension.keys()].filter((channel) => {
      const states = compiled.get(channel);
      return states !== undefined && states.size === 1 && states.has('dark');
    });

    // The retired VERTICAL-CONFLICT-9 roster lived in the default state; none of
    // those channels may reappear as dark-only overlap. The positive control
    // below proves the set is still populated with real channels, not a fluke.
    const retiredRoster = new Set([
      '--ds-card-shadow-elevated',
      '--ds-color-bg-input',
      '--ds-color-bg-primary',
      '--ds-color-error',
      '--ds-color-info',
      '--ds-font-family-base',
      '--ds-font-family-display',
      '--ds-font-family-heading',
      '--ds-surface-card-border-strong',
    ]);
    expect(darkOnlyOverlap.filter((channel) => retiredRoster.has(channel))).toEqual([]);
    expect(darkOnlyOverlap.length).toBeGreaterThan(0);

    const reported = new Set(conflicts('bithire', artifact).map((c) => c.channel));
    expect(darkOnlyOverlap.filter((channel) => reported.has(channel))).toEqual([]);
  });

  it('a mode-gated re-declaration IS a conflict when the compiled block is unconditional', () => {
    // rottay compiles its base block on a bare tenant selector, so that block
    // authors every state including light. A light-gated extension rule
    // therefore does compete with it — and wins, being later in the file. This
    // is stricter than a "does it match the DEFAULT mode" reading of the same
    // law, and deliberately so: the mode the theme is not defaulting to is
    // still a mode the theme authors.
    const lightGated = [
      "html[data-tenant='rottay'][data-theme='light'] {",
      '  --ds-color-primary: #123456;',
      '}',
      '',
    ].join('\n');
    expect(conflicts('rottay', renderArtifact('rottay', lightGated)).map((c) => c.channel)).toEqual(
      ['--ds-color-primary']
    );
  });

  it('a descendant-scoped rule is not a conflict', () => {
    const descendantOnly = [
      "html[data-tenant='bithire'] .rt-drill-panel {",
      '  --ds-color-primary: #123456;',
      '}',
      '',
    ].join('\n');
    expect(conflicts('bithire', renderArtifact('bithire', descendantOnly))).toEqual([]);
  });
});

describe('EXTENSION-CANNOT-BEAT-TENANT · drill', () => {
  it('a planted base-state re-declaration is caught for every vertical', () => {
    for (const spec of FIRST_PARTY_ARTIFACT_SPECS) {
      const planted = [
        `html[data-tenant='${spec.slug}'] {`,
        '  --ds-color-primary: #123456;',
        '}',
        '',
      ].join('\n');
      const found = conflicts(spec.slug, renderArtifact(spec.slug, planted)).map(key);
      expect(found).toContain(`${spec.slug} :: --ds-color-primary`);
    }
  });

  it('the planted value is the one that would paint, which is why it is red', () => {
    // The reason the law is not cosmetic: the extension section comes after the
    // compiled block at equal reach, so the last declaration wins.
    const planted = "html[data-tenant='evnto'] {\n  --ds-color-primary: #123456;\n}\n";
    const artifact = renderArtifact('evnto', planted);
    const compiledIndex = artifact.indexOf('--ds-color-primary:');
    const plantedIndex = artifact.lastIndexOf('--ds-color-primary: #123456;');
    expect(compiledIndex).toBeGreaterThan(-1);
    expect(plantedIndex).toBeGreaterThan(compiledIndex);
  });
});

describe('EXTENSION-CANNOT-BEAT-TENANT · VERTICAL-CONFLICT-9 mutants', () => {
  const RETIRED_ROSTER = new Set([
    '--ds-card-shadow-elevated',
    '--ds-color-bg-input',
    '--ds-color-bg-primary',
    '--ds-color-error',
    '--ds-color-info',
    '--ds-font-family-base',
    '--ds-font-family-display',
    '--ds-font-family-heading',
    '--ds-surface-card-border-strong',
  ]);

  it('reinserting any retired roster channel into a default-state rule is caught', () => {
    for (const channel of RETIRED_ROSTER) {
      const slug = channel.startsWith('--ds-surface-card-border-strong') || channel === '--ds-color-bg-primary'
        ? 'bithire'
        : 'rottay';
      const planted = `html[data-tenant='${slug}'] {\n  ${channel}: #123456;\n}\n`;
      const found = conflicts(slug, renderArtifact(slug, planted)).map((c) => c.channel);
      expect(found).toContain(channel);
    }
  });

  it('reinserting a retired roster channel in the wrong mode is still a conflict for rottay', () => {
    // rottay's compiled base block is unconditional, so a light-gated reinsertion
    // competes with it. This is stricter than bithire, and the law is deliberate.
    const planted = [
      "html[data-tenant='rottay'][data-theme='light'] {",
      '  --ds-color-error: #123456;',
      '}',
      '',
    ].join('\n');
    expect(conflicts('rottay', renderArtifact('rottay', planted)).map((c) => c.channel)).toContain(
      '--ds-color-error'
    );
  });

  it('reinserting the old bithire aliases is caught as a default-state conflict', () => {
    const planted = [
      'html[data-tenant="bithire"]:not([data-theme="dark"]):not(.dark) {',
      '  --ds-color-bg-primary: #ffffff;',
      '  --ds-surface-card-border-strong: var(--ds-color-border-secondary);',
      '}',
      '',
    ].join('\n');
    const found = new Set(conflicts('bithire', renderArtifact('bithire', planted)).map((c) => c.channel));
    expect(found).toContain('--ds-color-bg-primary');
    expect(found).toContain('--ds-surface-card-border-strong');
  });

  it('the committed inventory is empty and stays empty', () => {
    expect(KNOWN_SAME_STATE_REDECLARATIONS).toEqual([]);
    expect(observed()).toEqual([]);
  });
});
