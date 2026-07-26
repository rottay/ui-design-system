/**
 * Personality is MOUNTED but SUBORDINATE — the owner's acceptance property.
 *
 * `visual-authority.integration.test.tsx` proves the two emitters are disjoint
 * for one compiled tenant. That is an observation about one artifact. This
 * suite proves the two stronger things behind it:
 *
 *  1. Contention is UNREACHABLE through the DB write contract: the bounded
 *     raw-token surface a tenant may publish and the surface the personality
 *     bridge emits are disjoint SETS, so no customer input can produce a key
 *     both owners declare.
 *  2. If contention ever became reachable — a coverage expansion, a token added
 *     to the override list — the ARTIFACT wins, because it is unlayered and the
 *     bridge writes inside `@layer rottay-personality`.
 *
 * WHY (2) IS NOT A `getComputedStyle` TEST. `happy-dom` does not implement
 * cascade layers: a declaration inside an `@layer` block is dropped from
 * resolution entirely rather than ranked below unlayered ones — it resolves to
 * the empty string even with nothing competing. A computed-style assertion
 * would therefore pass for the wrong reason and would keep passing if the
 * bridge stopped layering. The cascade rule is restated below instead and
 * applied to the REAL text both owners emit, so a change on either side fails
 * these tests. That the bridge actually inserts `buildPersonalityRootRuleText()`
 * into a layer-capable CSSOM is proven in `personality-cascade-layer.test.tsx`.
 */

import { describe, expect, it } from 'vitest';

import type { TenantThemeDocument } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  TENANT_THEME_OVERRIDE_TOKENS,
  TENANT_THEME_V1_COVERAGE,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { resolvePersonalityCssVariables } from '@/foundation/tokens/ts/runtime/personality';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import { DEFAULT_PERSONALITY } from '@/infrastructure/runtime/personality/foundation/defaults';
import {
  PERSONALITY_CASCADE_LAYER,
  ROTTAY_CASCADE_LAYER_ORDER,
  buildPersonalityRootRuleText,
} from '@/infrastructure/runtime/theming/foundation/cascade-layers';

/** A key the personality bridge derives; a tenant cannot publish it today. */
const CONTESTED = '--ds-card-border';
const ARTIFACT_VALUE = '4px solid #ff0000';

const TENANT_DOCUMENT = {
  schemaVersion: 1,
  mode: 'advanced',
  visualFoundation: {
    general: { palette: { primary: '#2F6B9A', backgroundMode: 'dark' } },
    advanced: {
      chrome: { sidebar: { bg: '#101014' } },
      tokenOverrides: { '--ds-radius-md': '10px' },
    },
  },
} as unknown as TenantThemeDocument;

const ARTIFACT = compileTenantThemeConfig(
  hydrateTenantThemeConfig(TENANT_DOCUMENT, {
    tenantId: 'tenant_subordination',
    slug: 'subordination',
    verticalKey: 'bithire',
    rowVersion: 1,
  }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
);

const BRIDGE_VARIABLES = resolvePersonalityCssVariables({
  colors: { primary: '#4f46e5' },
  personality: DEFAULT_PERSONALITY,
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as never) as Record<string, string | undefined>;

const BRIDGE_KEYS = Object.keys(BRIDGE_VARIABLES).filter(
  (key) => BRIDGE_VARIABLES[key] !== undefined,
);

/**
 * The CSS cascade rule that settles two author-origin declarations of one
 * custom property, restated. Unlayered normal declarations outrank every named
 * layer; among layers, later in the declared order wins. Specificity and source
 * order only break ties INSIDE one layer, which is why they are absent here:
 * these two emitters are never in the same layer.
 */
function cascadeRank(cssText: string): number {
  const layer = cssText.match(/@layer\s+([\w-]+)\s*\{/)?.[1];
  if (!layer) return Number.POSITIVE_INFINITY;
  const index = ROTTAY_CASCADE_LAYER_ORDER.indexOf(
    layer as (typeof ROTTAY_CASCADE_LAYER_ORDER)[number],
  );
  // An unregistered layer name registers at first appearance, i.e. above the
  // declared order. Treating it as the top is the pessimistic reading.
  return index === -1 ? ROTTAY_CASCADE_LAYER_ORDER.length : index;
}

/**
 * Class-column specificity of a selector. `:where()` contributes nothing, which
 * is why the compiler wraps its scope selectors in it. Id and element columns
 * are absent from both emitters, so one column is the whole comparison.
 */
function specificityOf(selector: string): number {
  const withoutWhere = selector.replace(/:where\([^)]*\)/g, '');
  return (withoutWhere.match(/\[[^\]]+\]|\.[\w-]+|:[\w-]+/g) ?? []).length;
}

/**
 * Which emitter owns a key both texts declare, under the full author-origin
 * rule: layer rank first, then specificity, then source order. The bridge is
 * always the later source — it inserts its stylesheet in an effect, after the
 * artifact `<style>` is already in the document.
 */
function resolveContested(
  artifact: { css: string; selector: string },
  bridgeRuleText: string,
): 'artifact' | 'bridge' {
  const artifactRank = cascadeRank(artifact.css);
  const bridgeRank = cascadeRank(bridgeRuleText);
  if (artifactRank !== bridgeRank) return artifactRank > bridgeRank ? 'artifact' : 'bridge';

  const artifactSpecificity = specificityOf(artifact.selector);
  const bridgeSpecificity = specificityOf(':root');
  if (artifactSpecificity !== bridgeSpecificity) {
    return artifactSpecificity > bridgeSpecificity ? 'artifact' : 'bridge';
  }
  return 'bridge';
}

/** The artifact a coverage expansion would produce: it claims a bridge key. */
function artifactClaiming(key: string, value: string): { css: string; selector: string } {
  const css = ARTIFACT.css.replace(/\{/, `{\n  ${key}: ${value};`);
  expect(css).toContain(`${key}: ${value}`);
  return { css, selector: ARTIFACT.scopes.combinedSelector };
}

describe('personality subordination — contention is unreachable by contract', () => {
  it('inspects two real, non-empty emission surfaces', () => {
    // Anti-cheat. A disjointness claim over an empty set is free. Both surfaces
    // must be substantial and must contain their signature members.
    expect(BRIDGE_KEYS.length).toBeGreaterThan(40);
    expect(BRIDGE_KEYS).toContain(CONTESTED);
    expect(BRIDGE_KEYS.some((key) => key.startsWith('--ds-personality-'))).toBe(true);
    expect(TENANT_THEME_OVERRIDE_TOKENS.length).toBeGreaterThan(40);
    expect(Object.keys(ARTIFACT.variables).length).toBeGreaterThan(10);
  });

  it('leaves no key a tenant could publish that the bridge also declares', () => {
    const reachable = TENANT_THEME_OVERRIDE_TOKENS.filter((token) =>
      BRIDGE_KEYS.includes(token),
    );

    expect(reachable).toEqual([]);
  });

  it('leaves no key in a fully populated compiled artifact that the bridge declares', () => {
    const contested = Object.keys(ARTIFACT.variables).filter((key) =>
      BRIDGE_KEYS.includes(key),
    );

    expect(contested).toEqual([]);
    // ...and the bridge stays MOUNTED for this artifact, so the disjointness is
    // what keeps the two apart, not suppression.
    expect(TENANT_THEME_V1_COVERAGE).not.toContain('personality');
    expect(ARTIFACT.coverage).not.toContain('personality');
  });
});

describe('personality subordination — if contention became reachable', () => {
  it('resolves a key declared by both owners to the artifact', () => {
    const contesting = artifactClaiming(CONTESTED, ARTIFACT_VALUE);

    expect(resolveContested(contesting, buildPersonalityRootRuleText())).toBe('artifact');
  });

  it('wins for the artifact on the LAYER, independently of how it was authored', () => {
    // The decisive framing: the artifact must win even when it holds no
    // specificity or source-order advantage. A `:root`-scoped artifact ties the
    // bridge on both and is inserted EARLIER, so only the layer can save it.
    const weakArtifact = {
      css: artifactClaiming(CONTESTED, ARTIFACT_VALUE).css,
      selector: ':root',
    };

    expect(specificityOf(weakArtifact.selector)).toBe(specificityOf(':root'));
    expect(resolveContested(weakArtifact, buildPersonalityRootRuleText())).toBe('artifact');
  });

  it('reads the layering off the real emitted text, not an assumption', () => {
    // The two facts the resolution rests on, each owned by a different module
    // and each falsifiable on its own.
    expect(ARTIFACT.css).not.toContain('@layer');
    expect(buildPersonalityRootRuleText()).toContain(`@layer ${PERSONALITY_CASCADE_LAYER} {`);
    expect(cascadeRank(ARTIFACT.css)).toBe(Number.POSITIVE_INFINITY);
    expect(cascadeRank(buildPersonalityRootRuleText())).toBe(
      ROTTAY_CASCADE_LAYER_ORDER.indexOf(PERSONALITY_CASCADE_LAYER),
    );
  });

  it('flips to the bridge when the artifact is planted into a layer', () => {
    // Planted violation #1: the artifact joins the layered cascade. Personality
    // sits above `rottay-tenants` by design, so the bridge would then win —
    // even at (0,4,0) against `:root`, because a layer beats specificity. This
    // is the regression the unlayered artifact exists to prevent, and it proves
    // the passing assertions above are decided by the layer.
    const contesting = artifactClaiming(CONTESTED, ARTIFACT_VALUE);
    const planted = { css: `@layer rottay-tenants {\n${contesting.css}\n}`, selector: contesting.selector };

    expect(specificityOf(planted.selector)).toBeGreaterThan(specificityOf(':root'));
    expect(resolveContested(planted, buildPersonalityRootRuleText())).toBe('bridge');
  });

  it('makes the winner depend on artifact authoring when personality stops layering', () => {
    // Planted violation #2: the bridge regresses to a bare `:root` rule, which
    // is what it emitted before the cascade contract. Both sides then sit
    // unlayered, so the winner is decided by how each artifact happened to be
    // authored rather than by the declared order — the defect the layer fixed.
    const planted = buildPersonalityRootRuleText().replace(
      `@layer ${PERSONALITY_CASCADE_LAYER} {`,
      '',
    );
    expect(planted).not.toContain('@layer');

    const contesting = artifactClaiming(CONTESTED, ARTIFACT_VALUE);
    const weakArtifact = { css: contesting.css, selector: ':root' };

    // Same artifact content, two authorings, two different winners.
    expect(resolveContested(contesting, planted)).toBe('artifact');
    expect(resolveContested(weakArtifact, planted)).toBe('bridge');
    // Whereas the shipped, layered bridge gives one answer for both.
    const layered = buildPersonalityRootRuleText();
    expect(resolveContested(contesting, layered)).toBe('artifact');
    expect(resolveContested(weakArtifact, layered)).toBe('artifact');
  });

  it('keeps personality above the static first-party tenant artifacts', () => {
    // Subordinate to the DB artifact, superior to the static vertical baseline:
    // one ordering fact, both halves load-bearing.
    expect(ROTTAY_CASCADE_LAYER_ORDER.indexOf(PERSONALITY_CASCADE_LAYER)).toBeGreaterThan(
      ROTTAY_CASCADE_LAYER_ORDER.indexOf('rottay-tenants'),
    );
  });
});
