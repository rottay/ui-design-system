import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernKbd from '../engines/modern';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/kbd.css'
  ),
  'utf8'
);

describe('Kbd modern engine contract', () => {
  it('stamps only the skin contract: no inline paint or geometry', () => {
    render(<ModernKbd size="lg">⌘</ModernKbd>);

    const kbd = screen.getByText('⌘');
    expect(kbd.tagName).toBe('KBD');
    expect(kbd).toHaveClass('rottay-kbd', 'rottay-kbd--modern');
    expect(kbd).toHaveAttribute('data-part', 'root');
    expect(kbd).toHaveAttribute('data-size', 'lg');
    // The skin owns layout, size and chrome; the engine inlines none of it.
    expect(kbd.getAttribute('style')).toBeNull();
  });

  it('passes a caller style through untouched (caller outranks the skin)', () => {
    render(<ModernKbd style={{ letterSpacing: '0.1em' }}>K</ModernKbd>);

    expect(screen.getByText('K')).toHaveStyle({ letterSpacing: '0.1em' });
  });

  it('renders multi-key chord content as separate key caps', () => {
    render(
      <span>
        <ModernKbd>⌘</ModernKbd>
        <ModernKbd>⇧</ModernKbd>
        <ModernKbd>K</ModernKbd>
      </span>
    );

    expect(document.querySelectorAll('.rottay-kbd--modern')).toHaveLength(3);
  });
});

describe('Kbd modern skin resilience', () => {
  it('owns the key-cap craft: frame, depth border, highlight, mono ink', () => {
    expect(SKIN).toContain('border-block-end-width: var(--ds-kbd-depth-width, 2px);');
    expect(SKIN).toContain('--ds-kbd-font-family, var(--ds-font-family-mono');
    expect(SKIN).toContain('inset 0 1px 0');
    expect(SKIN).not.toMatch(/font-family:\s*monospace\s*;/);
  });

  it('carries every size with density-scaled padding and logical properties', () => {
    for (const size of ['sm', 'md', 'lg']) {
      expect(SKIN).toContain(`[data-size='${size}']`);
      expect(SKIN).toContain(`--ds-kbd-${size}-padding-inline`);
    }
    expect(SKIN).toContain('var(--ds-density-effective-scale)');
    expect(SKIN).not.toContain('var(--ds-density-effective-scale, 1)');
    expect(SKIN).not.toMatch(/margin-(left|right)\s*:/);
    expect(SKIN).not.toMatch(/padding-(left|right)\s*:/);
  });

  it('stays legible under forced colors', () => {
    expect(SKIN).toContain('@media (forced-colors: active)');
    expect(SKIN).toContain('ButtonText');
  });
});

describe('Kbd key-cap elevation is mode-adaptive', () => {
  // A fixed white specular is a light-mode idiom: on a dark theme a 55% white
  // top edge blows the cap out. The elevated-surface token resolves near-white
  // in light mode and a raised dark neutral in dark mode.
  it('derives every specular highlight from the elevated surface, never from white', () => {
    const highlights = SKIN.match(/inset 0 1px 0 color-mix\([^)]*\)[^,;]*/g) ?? [];

    expect(highlights.length).toBeGreaterThanOrEqual(2);
    for (const highlight of highlights) {
      expect(highlight).toContain('--ds-color-bg-elevated');
    }
    expect(SKIN).not.toContain('--ds-color-white');
  });

  it('exposes one tenant channel for the cap specular across rest and pressed', () => {
    expect(SKIN.match(/--_ds-kbd-specular/g)?.length).toBe(2);
  });

  it('keeps the cap depth on the neutral ramp, not a literal shadow colour', () => {
    expect(SKIN).toContain('--ds-color-neutral-900');
    expect(SKIN).not.toMatch(/box-shadow:[^;]*#[0-9a-fA-F]{3,8}/);
    expect(SKIN).not.toMatch(/box-shadow:[^;]*rgba?\(/);
  });
});
