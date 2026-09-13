import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernSkeleton from '../engines/modern';

// TASK S item 1: ONE canon ds- skeleton keyframe set (pulse/shimmer/wave) shared
// across engines, replacing the DaisyUI-owned modern animation and the piecemeal
// per-engine keyframes; static under reduced motion via the global guard.

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS = resolve(HERE, '../../../../../foundation/tokens/css');
const keyframes = readFileSync(resolve(CSS, 'foundation/animations/keyframes/index.css'), 'utf8');
const modernSkin = readFileSync(resolve(CSS, 'runtime/engines/modern/skin/skeleton/index.css'), 'utf8');
const rusticSkin = readFileSync(resolve(CSS, 'runtime/engines/rustic/skin/skeleton/index.css'), 'utf8');
const personality = readFileSync(resolve(CSS, 'runtime/personality/index.css'), 'utf8');

const CANON = ['ds-skeleton-pulse', 'ds-skeleton-shimmer', 'ds-skeleton-wave'] as const;

function stripBlockComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

describe('canon skeleton keyframes', () => {
  it('defines the three ds- namespaced members exactly once', () => {
    const src = stripBlockComments(keyframes);
    for (const name of CANON) {
      const matches = src.match(new RegExp(`@keyframes ${name}\\s*\\{`, 'g')) ?? [];
      expect(matches.length, name).toBe(1);
    }
  });

  it('animates only compositor-friendly properties (opacity / background-position)', () => {
    const src = stripBlockComments(keyframes);
    // Layout/paint-heavy properties would defeat the compositor-only motion law.
    const banned = /\b(width|height|margin|padding|top|left|right|bottom|inset|box-shadow|filter)\s*:/;
    for (const name of CANON) {
      const m = new RegExp(`@keyframes ${name}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src);
      expect(m, name).not.toBeNull();
      expect(banned.test(m![1]), `${name} must be compositor-only`).toBe(false);
      expect(/opacity|background-position/.test(m![1]), name).toBe(true);
    }
  });

  it('no legacy per-engine skeleton keyframes survive in the engine skins', () => {
    expect(modernSkin).not.toContain('@keyframes');
    expect(rusticSkin).not.toContain('@keyframes');
  });
});

describe('modern skeleton animation rides the motion vocabulary (DaisyUI dropped)', () => {
  it('runs the foundation keyframes on --ds-motion-* and names no skeleton keyframe', () => {
    const src = stripBlockComments(modernSkin);
    expect(src).toContain('ds-foundation-pulse calc(var(--ds-motion-attention) * 5) var(--ds-motion-ease-in-out) infinite');
    expect(src).toContain('ds-foundation-shimmer calc(var(--ds-motion-attention) * 5) var(--ds-motion-ease-in-out) infinite');
    for (const name of CANON) expect(src).not.toMatch(new RegExp(`${name}(?![\\w-])`));
    expect(src).not.toContain('--ds-skeleton-animation-');
  });

  it('no bare DaisyUI `.skeleton` selector remains in the modern skin', () => {
    expect(stripBlockComments(modernSkin)).not.toMatch(/\.skeleton[\s.,{[]/);
  });
});

describe('modern skeleton honors skeletonStyle across the resolved animation', () => {
  it('pulse -> flat opacity pulse', () => {
    const { container } = render(<ModernSkeleton variant="rectangular" animation="pulse" active />);
    const root = container.querySelector('.rottay-skeleton[data-part="root"]') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute('data-animation')).toBe('pulse');
  });

  it('wave -> sweeping gradient shimmer', () => {
    const { container } = render(<ModernSkeleton variant="rectangular" animation="wave" active />);
    const root = container.querySelector('.rottay-skeleton[data-part="root"]') as HTMLElement;
    expect(root.getAttribute('data-animation')).toBe('shimmer');
  });

  it('inactive -> static (no data-animation)', () => {
    const { container } = render(<ModernSkeleton variant="rectangular" animation="wave" active={false} />);
    const root = container.querySelector('.rottay-skeleton[data-part="root"]') as HTMLElement;
    expect(root.getAttribute('data-animation')).toBeNull();
    expect(root.getAttribute('style') ?? '').not.toContain('animation');
  });
});

describe('skeleton is static under reduced motion', () => {
  it('the modern skin collapses every animated block onto a flat fill', () => {
    const src = stripBlockComments(modernSkin);
    const media = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/.exec(src);
    expect(media).not.toBeNull();
    expect(media![1]).toContain(".rottay-skeleton.rottay-skeleton--modern[data-part='root'][data-animation='shimmer']");
    expect(media![1]).toContain('animation-iteration-count: 1 !important;');
    expect(media![1]).toMatch(/background: var\(\s*--ds-skeleton-bg/);
    expect(media![1]).not.toContain('gradient');
    expect(src).toMatch(/html\[data-ds-motion='reduced'\] \.rottay-skeleton\.rottay-skeleton--modern\[data-part='root'\]\[data-animation='shimmer'\]/);
    expect(personality).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
