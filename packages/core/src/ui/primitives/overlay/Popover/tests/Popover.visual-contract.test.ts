import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const modernSkin = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/popover.css'
  ),
  'utf8'
);

describe('Popover modern visual contract', () => {
  it('keeps four bounded recipes on one token-owned anatomy', () => {
    for (const recipe of ['minimal', 'inverse', 'rich'] as const) {
      expect(modernSkin).toContain(`[data-recipe="${recipe}"]`);
    }
    expect(modernSkin).toContain('--ds-popover-bordered-background');
    expect(modernSkin).toContain('--ds-popover-minimal-background');
    expect(modernSkin).toContain('--ds-popover-inverse-background');
    expect(modernSkin).toContain('--ds-popover-rich-background');
    expect(modernSkin).not.toMatch(/#[\da-f]{3,8}\b/i);
  });

  it('clamps both axes to the dynamic viewport and wraps hostile copy', () => {
    expect(modernSkin).toContain('100dvi');
    expect(modernSkin).toContain('100dvb');
    expect(modernSkin).toContain('overflow-wrap: anywhere');
    expect(modernSkin).toContain('overscroll-behavior: contain');
  });

  it('coordinates directional enter and exit motion with reduced-motion parity', () => {
    expect(modernSkin).toContain('@keyframes ds-popover-enter-modern');
    expect(modernSkin).toContain('@keyframes ds-popover-exit-modern');
    expect(modernSkin).toContain('--ds-popover-motion-distance');

    const reducedMotion = modernSkin.slice(
      modernSkin.indexOf('@media (prefers-reduced-motion: reduce)')
    );
    expect(reducedMotion).toContain('animation-duration: 1ms');
    expect(reducedMotion).toContain('transform: none');
  });

  it('uses logical arrow geometry, touch targets and explicit forced colors', () => {
    expect(modernSkin).toContain('inset-inline-start');
    expect(modernSkin).toContain('inset-block-start');
    expect(modernSkin).toContain('@media (pointer: coarse)');
    expect(modernSkin).toContain('--ds-popover-touch-target');
    expect(modernSkin).toContain('--ds-popover-arrow-anchor-offset');
    expect(modernSkin).toContain('[data-arrow-tracked="true"]');
    expect(modernSkin).toContain('inset-inline-start: clamp(');
    expect(modernSkin).toContain('@media (forced-colors: active)');
    expect(modernSkin).toContain('border-color: CanvasText');
  });

  it('keeps density, collision settle and product-level reduced motion token-owned', () => {
    for (const density of ['compact', 'comfortable', 'spacious'] as const) {
      expect(modernSkin).toContain(`[data-density="${density}"]`);
    }
    expect(modernSkin).toContain('--ds-popover-compact-padding-block');
    expect(modernSkin).toContain('--ds-popover-spacious-padding-inline');
    expect(modernSkin).toContain('[data-collision-adjusted="true"]');
    expect(modernSkin).toContain('--ds-popover-collision-shadow');
    expect(modernSkin).toContain('html[data-ds-motion="reduced"]');
    expect(modernSkin).toContain('[data-portal-scope="true"]');
  });

  it('never uses a colored side rail as state or decorative grammar', () => {
    expect(modernSkin).not.toMatch(/border-(?:left|right):/);
    expect(modernSkin).not.toMatch(/box-shadow:\s*inset\s+[+-]?\d+(?:\.\d+)?(?:px|rem)\s+0/);
  });
});
