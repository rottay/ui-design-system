import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * View Transitions v2 choreography contract (transitions.css).
 *
 * The directional panel slide, record morph, and modal promote groups are
 * styled through view-transition pseudo-elements that jsdom cannot render, so
 * this contract locks the CSS-side invariants the runtime depends on:
 * canon-token timing, compositor-only keyframes, and a reduced-motion
 * neutralization that can actually win the cascade against the directional
 * rules. Real direction/skip rendering needs a browser (Playwright visual
 * lane); what is testable statically is locked here.
 */
const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const TRANSITIONS_CSS = readFileSync(
  resolve(TEST_DIR, '..', 'css/foundation/animations/transitions.css'),
  'utf8',
);

/** Blanks block-comment content so prose cannot satisfy a rule assertion. */
function stripBlockComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));
}

const CSS = stripBlockComments(TRANSITIONS_CSS);

/** Extracts the body of the FIRST block whose selector text contains `marker`. */
function blockBody(css: string, marker: string): string {
  const start = css.indexOf(marker);
  expect(start, `selector containing '${marker}' present`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

describe('view transitions v2 choreography contract', () => {
  it('declares the panel offset on the motion canon', () => {
    expect(CSS).toContain('--ds-motion-panel-offset:');
  });

  it('styles the shared panel class with canon-token timing (no literal durations)', () => {
    for (const marker of [
      '::view-transition-group(*.ds-vt-tab-panel)',
      '::view-transition-old(*.ds-vt-tab-panel)',
      '::view-transition-new(*.ds-vt-tab-panel)',
    ]) {
      const body = blockBody(CSS, marker);
      expect(body, `${marker} timing on canon`).toContain('var(--ds-motion-');
      expect(body, `${marker} has no literal ms duration`).not.toMatch(/\d+m?s\b/);
    }
  });

  it('defines the four direction-aware rules, :where()-wrapped so reduce can out-cascade them', () => {
    const directionalSelectors = [
      ":where(html[data-ds-vt-direction='forward'])::view-transition-old(*.ds-vt-tab-panel)",
      ":where(html[data-ds-vt-direction='forward'])::view-transition-new(*.ds-vt-tab-panel)",
      ":where(html[data-ds-vt-direction='backward'])::view-transition-old(*.ds-vt-tab-panel)",
      ":where(html[data-ds-vt-direction='backward'])::view-transition-new(*.ds-vt-tab-panel)",
    ];
    for (const selector of directionalSelectors) {
      expect(CSS).toContain(selector);
    }
    // A bare attribute selector would out-specify the reduced-motion block.
    expect(CSS).not.toMatch(/^\s*html\[data-ds-vt-direction/m);
  });

  it('pairs old-exit-toward with new-enter-from per direction (old exits toward, new enters from)', () => {
    const forwardOld = blockBody(
      CSS,
      ":where(html[data-ds-vt-direction='forward'])::view-transition-old(*.ds-vt-tab-panel)",
    );
    const forwardNew = blockBody(
      CSS,
      ":where(html[data-ds-vt-direction='forward'])::view-transition-new(*.ds-vt-tab-panel)",
    );
    const backwardOld = blockBody(
      CSS,
      ":where(html[data-ds-vt-direction='backward'])::view-transition-old(*.ds-vt-tab-panel)",
    );
    const backwardNew = blockBody(
      CSS,
      ":where(html[data-ds-vt-direction='backward'])::view-transition-new(*.ds-vt-tab-panel)",
    );
    expect(forwardOld).toContain('ds-vt-panel-exit-toward-start');
    expect(forwardNew).toContain('ds-vt-panel-enter-from-end');
    expect(backwardOld).toContain('ds-vt-panel-exit-toward-end');
    expect(backwardNew).toContain('ds-vt-panel-enter-from-start');
  });

  it('keeps every ds-vt-panel keyframe compositor-only (opacity + transform, nothing else)', () => {
    const keyframeBlocks = [
      ...CSS.matchAll(/@keyframes\s+(ds-vt-panel-[a-z-]+)\s*\{([\s\S]*?)\n\}/g),
    ];
    expect(keyframeBlocks.length).toBe(4);
    for (const [, name, body] of keyframeBlocks) {
      const properties = [...body.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
      expect(properties.length, `${name} declares properties`).toBeGreaterThan(0);
      for (const property of properties) {
        expect(['opacity', 'transform'], `${name} uses only compositor properties`).toContain(
          property,
        );
      }
      expect(body, `${name} travel on the canon offset`).toContain('--ds-motion-panel-offset');
    }
  });

  it('puts record morph and modal promote timing on the canon', () => {
    const record = blockBody(CSS, '::view-transition-group(*.ds-vt-record)');
    expect(record).toContain('var(--ds-motion-');
    const promote = blockBody(CSS, '::view-transition-group(ds-vt-modal-promote)');
    expect(promote).toContain('var(--ds-motion-');
  });

  it('neutralizes every v2 group under prefers-reduced-motion AFTER the directional rules', () => {
    const lastDirectional = CSS.lastIndexOf("html[data-ds-vt-direction='backward']");
    const reduceNeutralization = CSS.indexOf(
      '::view-transition-group(*.ds-vt-tab-panel),',
      lastDirectional,
    );
    expect(reduceNeutralization, 'v2 reduce block after directional rules').toBeGreaterThan(
      lastDirectional,
    );

    const reduceTail = CSS.slice(lastDirectional);
    expect(reduceTail).toContain('@media (prefers-reduced-motion: reduce)');
    for (const marker of [
      '::view-transition-old(*.ds-vt-tab-panel)',
      '::view-transition-new(*.ds-vt-tab-panel)',
      '::view-transition-group(*.ds-vt-record)',
      '::view-transition-group(ds-vt-modal-promote)',
    ]) {
      expect(reduceTail, `reduce block re-neutralizes ${marker}`).toContain(marker);
    }
    // The tie-breaking block must end in animation: none, not a duration tweak.
    const block = reduceTail.slice(reduceTail.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(block.slice(0, block.indexOf('}'))).toContain('animation: none');
  });

  it('keeps the generic wildcard neutralization for any future named group', () => {
    expect(CSS).toContain('::view-transition-group(*),');
    expect(CSS).toContain('::view-transition-old(*),');
  });

  it('holds the neutralization on the provider-owned html[data-ds-motion=reduced] seam', () => {
    for (const marker of [
      "html[data-ds-motion='reduced']::view-transition-group(*)",
      "html[data-ds-motion='reduced']::view-transition-old(*)",
      "html[data-ds-motion='reduced']::view-transition-new(*)",
    ]) {
      expect(CSS).toContain(marker);
    }
  });
});
