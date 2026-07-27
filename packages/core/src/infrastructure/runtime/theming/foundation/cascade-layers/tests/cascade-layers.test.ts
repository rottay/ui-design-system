/**
 * @fileoverview Cascade-layer contract tests - Rottay Design System
 * @description Pins ONE cascade model: tenant paint is unlayered and wins;
 * every other emitter joins the declared layer order and is subordinate to it.
 *
 * Two defects produced this shape, and the tests are split accordingly.
 *
 * FIRST (fixed earlier): the entrypoints disagreed with each other --
 * `platform.css` mounted the rottay artifact unlayered while
 * `bithire.css`/`evnto.css` mounted theirs `layer(rottay-tenants)`, so the
 * winner flipped per vertical. That was repaired by making all three agree.
 *
 * SECOND (fixed here): they agreed on the WRONG answer, and the guard could not
 * tell. The build composes its bundle from base.css plus the artifact BY PATH
 * and never reads the vertical entrypoints at all -- and every `./styles/*`
 * package export resolves to dist/. So `layer(rottay-tenants)` in those
 * entrypoints described a layer that existed in NO shipped bundle, and
 * `rottay-tenants` sat in the declared order with zero rules in it, one rank
 * below `rottay-personality`. The source asserted that the subordinate
 * personality bridge outranked the compiled tenant artifact; production did the
 * opposite, correctly.
 *
 * The lesson encoded below: these tests read `src/`, which the build does not
 * consume, so they could pin a cascade nobody ships. The `shipped bundle
 * parity` block reads the committed bundles instead -- the actual bytes.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  ROTTAY_CASCADE_LAYER_ORDER,
  PERSONALITY_CASCADE_LAYER,
  buildCascadeLayerOrderStatement,
  buildPersonalityRootRuleText,
} from '..';

const ENTRYPOINTS = 'src/foundation/tokens/css/facade/entrypoints';
const ARTIFACTS = 'src/foundation/tokens/css/facade/artifacts';

function readCss(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

/** Extracts the layer names from the `@layer a, b, c;` order statement. */
function parseDeclaredLayerOrder(css: string): string[] {
  const match = css.match(/@layer\s+([^;{]+);/);
  if (!match) return [];
  return match[1].split(',').map((name) => name.trim());
}

/** The three first-party vertical entrypoints and the artifact each mounts. */
const VERTICAL_ENTRYPOINTS = [
  { entrypoint: 'platform.css', artifact: 'rottay' },
  { entrypoint: 'bithire.css', artifact: 'bithire' },
  { entrypoint: 'evnto.css', artifact: 'evnto' },
] as const;

describe('cascade layer order', () => {
  it.each(['base.css', 'styles.css'])(
    'mirrors the order declared by %s',
    (file) => {
      const declared = parseDeclaredLayerOrder(readCss(`${ENTRYPOINTS}/${file}`));

      expect(declared).toEqual([...ROTTAY_CASCADE_LAYER_ORDER]);
    },
  );

  it('ranks personality directly above the engine skins it completes', () => {
    // Personality's job is to finish what the engine baseline leaves open, so
    // it sits immediately above `rottay-engines`. It does NOT sit above tenant
    // paint: tenant paint is unlayered and outranks every layer here, which is
    // what makes the bridge subordinate to a compiled artifact.
    const engines = ROTTAY_CASCADE_LAYER_ORDER.indexOf('rottay-engines');
    const personality = ROTTAY_CASCADE_LAYER_ORDER.indexOf(PERSONALITY_CASCADE_LAYER);

    expect(engines).toBeGreaterThan(-1);
    expect(personality).toBe(engines + 1);
  });

  it('builds a statement that re-declares the full order', () => {
    expect(buildCascadeLayerOrderStatement()).toBe(
      `@layer ${ROTTAY_CASCADE_LAYER_ORDER.join(', ')};`,
    );
  });

  it('wraps the personality root rule in the personality layer', () => {
    expect(buildPersonalityRootRuleText()).toBe(
      `@layer ${PERSONALITY_CASCADE_LAYER} { :root {} }`,
    );
  });
});

describe('vertical entrypoint parity', () => {
  // The regression guard, inverted from what it used to assert.
  //
  // These entrypoints previously mounted the artifact `layer(rottay-tenants)`,
  // which the build then STRIPPED -- so dev resolved the cascade one way and
  // production another. Worse, the declared order put `rottay-personality`
  // ABOVE `rottay-tenants`, so in dev the subordinate personality bridge
  // outranked the compiled tenant artifact it is supposed to complete. Under
  // the coverage model the artifact must win every channel it declares, and it
  // can only do that unlayered.
  it.each(VERTICAL_ENTRYPOINTS)(
    '$entrypoint mounts the $artifact artifact UNLAYERED',
    ({ entrypoint, artifact }) => {
      const css = readCss(`${ENTRYPOINTS}/${entrypoint}`);
      const importLine = css
        .split('\n')
        .find((line) => line.includes(`artifacts/${artifact}/index.css`));

      expect(importLine).toBeDefined();
      expect(importLine).not.toMatch(/layer\(/);
    },
  );

  it('declares no layer that nothing writes into', () => {
    // A declared-but-empty layer publishes a precedence position no emitter
    // occupies, and readers reason about the cascade from it. `rottay-tenants`
    // was exactly that in every shipped bundle.
    expect(ROTTAY_CASCADE_LAYER_ORDER).not.toContain('rottay-tenants');
    for (const file of ['base.css', 'styles.css']) {
      const css = readCss(`${ENTRYPOINTS}/${file}`);
      expect(parseDeclaredLayerOrder(css), file).not.toContain('rottay-tenants');
      // An @import DIRECTIVE, not a mention. Prose explaining why the layer
      // was removed necessarily names it, and forbidding that would make the
      // defect undocumentable.
      expect(css, file).not.toMatch(/@import[^;]*layer\(rottay-tenants\)/);
    }
  });

  it('resolves identically no matter which vertical entrypoint is loaded', () => {
    // Import-order independence now comes from every artifact being unlayered
    // and scoped to its own vertical, not from a shared layer.
    const mountedLayers = VERTICAL_ENTRYPOINTS.map(({ entrypoint, artifact }) => {
      const css = readCss(`${ENTRYPOINTS}/${entrypoint}`);
      const importLine = css
        .split('\n')
        .find((line) => line.includes(`artifacts/${artifact}/index.css`))!;
      const layerMatch = importLine.match(/layer\(([^)]+)\)/);
      return layerMatch ? layerMatch[1] : 'UNLAYERED';
    });

    expect(new Set(mountedLayers).size).toBe(1);
    expect(mountedLayers[0]).toBe('UNLAYERED');
  });
});

describe('shipped bundle parity (dev must equal prod)', () => {
  /**
   * The property every test above only approximates: what the entrypoints say
   * is not what ships. The build reads the artifacts directly and composes its
   * own bundle, so a source-only guard cannot see a divergence introduced in
   * `build-vertical-css.mjs`. These read the COMMITTED bundle -- the exact
   * bytes published to consumers.
   *
   * `styles/*.css` is the gate-checked mirror of `dist/*.css` (build-vertical-css
   * writes both from one in-memory bundle and `--check` diffs them byte for
   * byte), so reading the mirror is reading production.
   */
  const SHIPPED = ['bithire', 'evnto', 'platform', 'rottay', 'index'] as const;

  it.each(SHIPPED)('styles/%s.css ships tenant paint unlayered', (bundle) => {
    const css = readCss(`styles/${bundle}.css`);

    expect(css).toContain('@layer');
    // The precise property: no BLOCK may open the removed layer, and no order
    // statement may name it. Prose that mentions the historical name while
    // explaining why it is gone is not a violation -- matching on the bare
    // string would forbid documenting the very defect this guards against.
    expect(css).not.toMatch(/@layer\s+rottay-tenants\s*\{/);
    expect(parseDeclaredLayerOrder(css)).not.toContain('rottay-tenants');
  });

  it.each(SHIPPED)('styles/%s.css keeps the personality bridge layered', (bundle) => {
    // Personality must stay INSIDE a layer: that is what makes it lose to the
    // unlayered artifact and therefore subordinate, as the coverage model says.
    expect(readCss(`styles/${bundle}.css`)).toContain(`@layer ${PERSONALITY_CASCADE_LAYER}`);
  });

  it('ships the same declared layer order the TypeScript mirror states', () => {
    for (const bundle of SHIPPED) {
      const declared = parseDeclaredLayerOrder(readCss(`styles/${bundle}.css`));
      expect(declared, `styles/${bundle}.css`).toEqual([...ROTTAY_CASCADE_LAYER_ORDER]);
    }
  });

  it('scopes the bithire artifact with the (0,1,1) selector that beats an app :root', () => {
    // The whole app-tier limit rests on this: `:is()` takes the specificity of
    // its most specific argument, statically, so the artifact is (0,1,1) for
    // EVERY tenant -- including custom ones that only match the `:where()` arm.
    // An application `:root` is (0,1,0) and therefore loses.
    expect(readCss('styles/bithire.css')).toContain(
      ":is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire']))",
    );
  });
});

describe('contested token channels', () => {
  /**
   * Channels declared by BOTH a static tenant artifact and the runtime
   * personality bridge. These are the only variables whose winner is decided
   * by cascade position, so they are pinned by name: a change to this census
   * is a change to what a vertical actually renders and must be reviewed, not
   * absorbed silently.
   *
   * Counts were measured against the generated artifacts; personality-namespaced
   * variables (`--ds-personality-*`) never appear here because the artifacts
   * declare none of them -- the bridge is their sole emitter.
   */
  const CONTESTED_BY_VERTICAL: Record<string, string[]> = {
    rottay: [
      '--ds-card-bg-hover',
      '--ds-card-border',
      '--ds-card-border-hover',
      '--ds-card-shadow',
      '--ds-card-shadow-hover',
      '--ds-divider-color',
    ],
    bithire: [
      '--ds-badge-hover-transform',
      '--ds-badge-radius',
      '--ds-card-bg-hover',
      '--ds-card-body-padding',
      '--ds-card-border',
      '--ds-card-border-hover',
      '--ds-card-footer-padding',
      '--ds-card-header-padding',
      '--ds-card-hover-transform',
      '--ds-card-shadow',
      '--ds-card-shadow-hover',
    ],
    evnto: [
      '--ds-card-border',
      '--ds-card-shadow',
      '--ds-card-shadow-hover',
    ],
  };

  /** Variable names the personality bridge can emit. */
  function bridgeEmittedNames(): Set<string> {
    const source = readCss('src/foundation/tokens/ts/runtime/personality/index.ts');
    const names = new Set<string>();
    for (const match of source.matchAll(/'(--ds-[a-z0-9-]+)'\s*:/g)) {
      names.add(match[1]);
    }
    return names;
  }

  /** Variable names a generated artifact declares. */
  function artifactDeclaredNames(artifact: string): Set<string> {
    const css = readCss(`${ARTIFACTS}/${artifact}/index.css`);
    const names = new Set<string>();
    for (const match of css.matchAll(/(--ds-[a-z0-9-]+)\s*:/g)) {
      names.add(match[1]);
    }
    return names;
  }

  it.each(Object.keys(CONTESTED_BY_VERTICAL))(
    'the %s artifact contests exactly the pinned channels',
    (artifact) => {
      const emitted = bridgeEmittedNames();
      const declared = artifactDeclaredNames(artifact);
      const contested = [...emitted].filter((name) => declared.has(name)).sort();

      expect(contested).toEqual(CONTESTED_BY_VERTICAL[artifact]);
    },
  );

  it('never contests a personality-namespaced channel', () => {
    // The bridge is the sole emitter of `--ds-personality-*`. If an artifact
    // ever declares one, suppressing the bridge stops being safe and the
    // personality layer would have two owners.
    for (const artifact of Object.keys(CONTESTED_BY_VERTICAL)) {
      const declared = [...artifactDeclaredNames(artifact)];
      const personalityScoped = declared.filter((name) =>
        name.startsWith('--ds-personality-'),
      );

      expect(personalityScoped, `${artifact} artifact`).toEqual([]);
    }
  });
});
