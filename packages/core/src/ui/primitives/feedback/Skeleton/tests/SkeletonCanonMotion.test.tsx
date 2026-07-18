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
const keyframes = readFileSync(resolve(CSS, 'foundation/animations/keyframes.css'), 'utf8');
const modernSkin = readFileSync(resolve(CSS, 'runtime/engines/modern/skin/skeleton.css'), 'utf8');
const rusticSkin = readFileSync(resolve(CSS, 'runtime/engines/rustic/skin/skeleton.css'), 'utf8');
const personality = readFileSync(resolve(CSS, 'runtime/personality.css'), 'utf8');

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

describe('modern skeleton canon animation (DaisyUI dropped)', () => {
  it('drives animation through --ds-skeleton-animation-name with a canon fallback', () => {
    expect(modernSkin).toContain('var(--ds-skeleton-animation-name, ds-skeleton-shimmer)');
  });

  it('no bare DaisyUI `.skeleton` selector remains in the modern skin', () => {
    // The scope classes are `.rottay-skeleton` / `.rottay-skeleton-wrapper`; a
    // bare `.skeleton` selector would mean the engine still leans on DaisyUI.
    expect(stripBlockComments(modernSkin)).not.toMatch(/\.skeleton[\s.,{[]/);
  });
});

describe('modern skeleton honors skeletonStyle across the resolved animation', () => {
  it('pulse -> flat opacity pulse (ds-skeleton-pulse)', () => {
    const { container } = render(<ModernSkeleton variant="rectangular" animation="pulse" active />);
    const root = container.querySelector('.rottay-skeleton[data-part="root"]') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute('data-animation')).toBe('pulse');
    expect(root.style.getPropertyValue('--ds-skeleton-animation-name')).toBe('ds-skeleton-pulse');
  });

  it('wave -> premium sweeping gradient (ds-skeleton-shimmer)', () => {
    const { container } = render(<ModernSkeleton variant="rectangular" animation="wave" active />);
    const root = container.querySelector('.rottay-skeleton[data-part="root"]') as HTMLElement;
    expect(root.getAttribute('data-animation')).toBe('shimmer');
    expect(root.style.getPropertyValue('--ds-skeleton-animation-name')).toBe('ds-skeleton-shimmer');
  });

  it('inactive -> static (animation-name none, no data-animation)', () => {
    const { container } = render(<ModernSkeleton variant="rectangular" animation="wave" active={false} />);
    const root = container.querySelector('.rottay-skeleton[data-part="root"]') as HTMLElement;
    expect(root.getAttribute('data-animation')).toBeNull();
    expect(root.style.getPropertyValue('--ds-skeleton-animation-name')).toBe('none');
  });
});

describe('skeleton is static under reduced motion', () => {
  it('relies on the global wildcard guard (0.01ms, single iteration) — no per-skeleton rule needed', () => {
    // The canon keyframes carry no reduced-motion branch of their own; the
    // global guard in personality.css zeroes animation-duration and pins the
    // iteration-count to 1 for every element, so each canon skeleton animation
    // lands on its final frame instantly instead of looping.
    expect(personality).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(personality).toContain('animation-duration: 0.01ms !important');
    expect(personality).toContain('animation-iteration-count: 1 !important');
    expect(keyframes).not.toMatch(/prefers-reduced-motion/);
  });
});
