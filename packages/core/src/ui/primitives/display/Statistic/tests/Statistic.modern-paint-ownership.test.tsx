import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { Countdown, Statistic } from '../engines/modern';

// ---------------------------------------------------------------------------
// K3-A Pass 1 — modern Statistic paint-ownership + Daisy-drain ratchet.
//
// The engine emitted the DaisyUI `stat-title` / `stat-value` classes, which
// `engines/modern/theme.css` painted. Those classes are gone: statistic.css is
// the single paint owner of the title/value typography through the data-part
// hooks, and the geometry that used to sit inline (title/value line-height,
// affix margins, skeleton bar sizes, loading pulse) moved with it. `valueStyle`
// remains the public inline override channel and must keep landing on the value.
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/statistic.css'
  ),
  'utf8'
);

describe('Statistic modern — Daisy drained, skin owns the paint', () => {
  it('renders no DaisyUI stat classes; the data-part hooks carry the anatomy', () => {
    const { container } = render(
      <Statistic title="Revenue" value={12500} prefix="$" suffix="USD" valueType="positive" />
    );

    expect(container.querySelector('.stat-title')).toBeNull();
    expect(container.querySelector('.stat-value')).toBeNull();
    expect(container.querySelector('[data-part="title"]')).toHaveTextContent('Revenue');
    expect(container.querySelector('[data-part="value"]')).toHaveTextContent('$12,500USD');
    expect(container.querySelector('[data-part="value"]')).toHaveAttribute('data-trend', 'positive');
  });

  it('keeps no static geometry inline; valueStyle still lands on the value', () => {
    const { container } = render(
      <Statistic
        title="Orders"
        value={42}
        prefix="#"
        suffix="total"
        valueStyle={{ color: 'rgb(1, 2, 3)' }}
      />
    );

    const title = container.querySelector('[data-part="title"]') as HTMLElement;
    expect(title.style.lineHeight).toBe('');
    expect(title.style.marginBottom).toBe('');

    const value = container.querySelector('[data-part="value"]') as HTMLElement;
    expect(value.style.lineHeight).toBe('');
    expect(value.style.fontFamily).toBe('');
    // The public override channel is untouched and still wins.
    expect(value.style.color).toBe('rgb(1, 2, 3)');

    const prefix = container.querySelector('[data-part="prefix"]') as HTMLElement;
    const suffix = container.querySelector('[data-part="suffix"]') as HTMLElement;
    expect(prefix.style.marginRight).toBe('');
    expect(suffix.style.marginLeft).toBe('');
  });

  it('countdown carries the same drained anatomy', () => {
    const { container } = render(
      <Countdown title="Launch" value={Date.now() + 60_000} format="mm:ss" />
    );

    expect(container.querySelector('.stat-title')).toBeNull();
    expect(container.querySelector('.stat-value')).toBeNull();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-countdown', 'true');
    expect(
      (container.querySelector('[data-part="value"]') as HTMLElement).style.fontFamily
    ).toBe('');
  });

  it('loading skeleton carries hooks only — the pulse and bar sizes are the skin', () => {
    const { container } = render(<Statistic title="Revenue" loading />);

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(root.style.animation).toBe('');
    expect(root.style.animationDuration).toBe('');
    const lines = container.querySelectorAll('[data-part="skeleton-line"]');
    expect(lines).toHaveLength(2);
    for (const line of lines) {
      expect((line as HTMLElement).style.height).toBe('');
      expect((line as HTMLElement).style.width).toBe('');
    }
  });

  it('pins the skin rules that replaced the drained classes and inline geometry', () => {
    // title/value typography owned through the data hooks
    expect(SKIN).toMatch(/\[data-part='title'\][^{]*\{[^}]*margin-bottom/);
    expect(SKIN).toMatch(/\[data-part='value'\][^{]*\{[^}]*line-height/);
    // logical affix gaps
    expect(SKIN).toMatch(/\[data-part='prefix'\][^{]*\{[^}]*margin-inline-end/);
    expect(SKIN).toMatch(/\[data-part='suffix'\][^{]*\{[^}]*margin-inline-start/);
    // loading pulse + skeleton geometry
    expect(SKIN).toMatch(/\[data-loading='true'\][^{]*\{[^}]*ds-foundation-pulse/);
    expect(SKIN).toMatch(/\[data-part='skeleton-line'\]:first-of-type[^{]*\{[^}]*height/);
    // countdown monospace digits via the countdown hook
    expect(SKIN).toMatch(/\[data-countdown='true'\][^{]*\[data-part='number'\][^{]*\{[^}]*font-family/);
  });

  it('pins the CONTRAST LAW mixes on the title and warning inks (axe AA, K3-A Pass 2)', () => {
    // Title: #737373 failed AA on both sources' tinted surfaces (4.44/4.40) --
    // deepened 30% toward the source's own primary ink, raw escape hatch kept.
    expect(SKIN).toMatch(/--ds-statistic-title-ink/);
    expect(SKIN).toMatch(
      /\[data-part='title'\][^{]*\{[^}]*color-mix\(\s*in srgb,\s*var\(--ds-statistic-title-color,\s*var\(--ds-color-text-secondary\)\)\s*70%,\s*var\(--ds-color-text-primary\)\s*30%\s*\)/
    );
    // Warning trend: bithire's raw #D6A04E failed even large-text AA (2.19) --
    // deepened 40% toward black, deriving from the tenant's own hue.
    expect(SKIN).toMatch(
      /\[data-trend='warning'\][^{]*\{[^}]*color-mix\(\s*in srgb,\s*var\(--ds-color-warning\)\s*60%,\s*var\(--ds-color-black,\s*#000\)\s*40%\s*\)/
    );
  });
});
