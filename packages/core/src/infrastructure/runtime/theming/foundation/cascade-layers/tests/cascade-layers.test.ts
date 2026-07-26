/**
 * @fileoverview Cascade-layer contract tests - Rottay Design System
 * @description Pins the one property that makes runtime/static token
 * resolution deterministic: every emitter joins the SAME declared cascade
 * order, and no vertical resolves a variable differently from its siblings.
 *
 * These tests exist because the previous defect was invisible to unit tests.
 * `platform.css` imported the rottay artifact WITHOUT `layer(rottay-tenants)`
 * while `bithire.css`/`evnto.css` imported theirs WITH it, and the personality
 * bridge wrote an UNLAYERED `:root` rule. Unlayered beats every layer, so the
 * bridge won for bithire/evnto and lost to the unlayered artifact for rottay --
 * the winner flipped per vertical, decided by entrypoint authoring rather than
 * by the declared order.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  ROTTAY_CASCADE_LAYER_ORDER,
  PERSONALITY_CASCADE_LAYER,
  TENANT_CASCADE_LAYER,
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

  it('ranks personality directly above tenants', () => {
    const tenants = ROTTAY_CASCADE_LAYER_ORDER.indexOf(TENANT_CASCADE_LAYER);
    const personality = ROTTAY_CASCADE_LAYER_ORDER.indexOf(PERSONALITY_CASCADE_LAYER);

    expect(tenants).toBeGreaterThan(-1);
    expect(personality).toBe(tenants + 1);
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
  // The regression guard. A vertical that mounts its artifact unlayered pulls
  // that artifact above every cascade layer, so the SAME variable resolves
  // differently for that vertical than for its siblings.
  it.each(VERTICAL_ENTRYPOINTS)(
    '$entrypoint mounts the $artifact artifact inside the tenant layer',
    ({ entrypoint, artifact }) => {
      const css = readCss(`${ENTRYPOINTS}/${entrypoint}`);
      const importLine = css
        .split('\n')
        .find((line) => line.includes(`artifacts/${artifact}/index.css`));

      expect(importLine).toBeDefined();
      expect(importLine).toContain(`layer(${TENANT_CASCADE_LAYER})`);
    },
  );

  it('declares the layer order before any vertical mounts its artifact', () => {
    // Layers are ordered by first appearance. Every entrypoint imports
    // base.css (which declares the order) ahead of its artifact, so the
    // artifact cannot register `rottay-tenants` at an unintended position.
    for (const { entrypoint, artifact } of VERTICAL_ENTRYPOINTS) {
      const lines = readCss(`${ENTRYPOINTS}/${entrypoint}`).split('\n');
      const baseIndex = lines.findIndex((line) => line.includes("'./base.css'"));
      const artifactIndex = lines.findIndex((line) =>
        line.includes(`artifacts/${artifact}/index.css`),
      );

      expect(baseIndex, `${entrypoint} must import base.css`).toBeGreaterThan(-1);
      expect(artifactIndex, `${entrypoint} must import its artifact`).toBeGreaterThan(-1);
      expect(baseIndex, `${entrypoint} declares layers before its artifact`).toBeLessThan(
        artifactIndex,
      );
    }
  });

  it('resolves identically no matter which vertical entrypoint is loaded', () => {
    // Import order independence: with every artifact in the same layer and the
    // personality bridge in the layer above, the winner is fixed by the
    // declared order alone. No entrypoint can promote its artifact.
    const mountedLayers = VERTICAL_ENTRYPOINTS.map(({ entrypoint, artifact }) => {
      const css = readCss(`${ENTRYPOINTS}/${entrypoint}`);
      const importLine = css
        .split('\n')
        .find((line) => line.includes(`artifacts/${artifact}/index.css`))!;
      const layerMatch = importLine.match(/layer\(([^)]+)\)/);
      return layerMatch ? layerMatch[1] : 'UNLAYERED';
    });

    expect(new Set(mountedLayers).size).toBe(1);
    expect(mountedLayers[0]).toBe(TENANT_CASCADE_LAYER);
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
