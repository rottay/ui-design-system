import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ModernTimeline, { Item as ModernTimelineItem } from '../engines/modern';

// ---------------------------------------------------------------------------
// K3-A Pass 1 — modern Timeline engine coverage + Daisy-drain ratchet.
//
// This family had NO modern-engine test (rustic had one). The engine emitted
// the DaisyUI `timeline` / `timeline-start` / `timeline-middle` / `timeline-end`
// classes, painted by theme.css and daisy itself. Those classes are gone:
// timeline.css is the single paint owner of every part (item grid, connectors,
// dots, label, pending spinner) through the data-part / data-side / data-tone /
// data-edge hooks. These tests pin the drained DOM contract and the skin rules
// that took the geometry over.
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/timeline.css'
  ),
  'utf8'
);

describe('Timeline modern advanced engine coverage', () => {
  it('covers modes, per-item position overrides, tones, labels, custom dots, reverse, and pending', () => {
    const { container, rerender } = render(
      <ModernTimeline mode="alternate">
        <ModernTimelineItem color="green" label="Jan">
          Created
        </ModernTimelineItem>
        <ModernTimelineItem color="red" position="left">
          Failed
        </ModernTimelineItem>
        <ModernTimelineItem dot={<span data-testid="custom-dot">★</span>}>
          Reviewed
        </ModernTimelineItem>
      </ModernTimeline>
    );

    const items = container.querySelectorAll('[data-part="item"]');
    expect(items).toHaveLength(3);
    // alternate: even start, odd end — and the explicit position override wins
    expect(items[0]).toHaveAttribute('data-side', 'start');
    expect(items[1]).toHaveAttribute('data-side', 'start');
    expect(items[0]).toHaveAttribute('data-tone', 'green');
    expect(items[1]).toHaveAttribute('data-tone', 'red');
    // content side matches the item side; custom dot replaces the marker
    expect(items[0].querySelector('[data-part="content"]')).toHaveAttribute('data-side', 'start');
    expect(container.querySelector('[data-testid="custom-dot"]')).toBeInTheDocument();
    expect(items[2].querySelector('[data-part="dot-marker"]')).toBeNull();
    // connectors: middle item has both edges; first has no leading, last no trailing
    expect(items[0].querySelector('[data-part="connector"][data-edge="leading"]')).toBeNull();
    expect(items[0].querySelector('[data-part="connector"][data-edge="trailing"]')).not.toBeNull();
    expect(items[1].querySelectorAll('[data-part="connector"]')).toHaveLength(2);
    expect(items[2].querySelector('[data-part="connector"][data-edge="trailing"]')).toBeNull();

    rerender(
      <ModernTimeline
        mode="right"
        pending="Deploying…"
        items={[{ children: 'Step one', color: 'blue' }, { children: 'Step two' }]}
      />
    );
    const rightItems = container.querySelectorAll('[data-part="item"]:not([data-pending])');
    expect(rightItems[0]).toHaveAttribute('data-side', 'end');
    expect(rightItems[1]).toHaveAttribute('data-tone', 'primary');
    const pendingItem = container.querySelector('[data-part="item"][data-pending="true"]');
    expect(pendingItem).not.toBeNull();
    expect(pendingItem?.querySelector('[data-part="spinner"]')).not.toBeNull();
    expect(pendingItem).toHaveTextContent('Deploying…');
  });

  it('renders no DaisyUI timeline classes anywhere in the tree', () => {
    const { container } = render(
      <ModernTimeline pending="Working">
        <ModernTimelineItem color="blue">One</ModernTimelineItem>
      </ModernTimeline>
    );

    const html = container.innerHTML;
    for (const drained of ['timeline-start', 'timeline-middle', 'timeline-end', 'timeline-vertical']) {
      expect(html).not.toContain(drained);
    }
    // The root keeps its scope classes — and nothing else class-wise.
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.className).toBe('rottay-timeline rottay-timeline--modern');
    expect(root).toHaveAttribute('data-mode', 'left');
  });

  it('keeps no static geometry inline — the skin owns grid, connectors, dots, spinner', () => {
    const { container } = render(
      <ModernTimeline pending="Working">
        <ModernTimelineItem label="Q1" color="green">
          Shipped
        </ModernTimelineItem>
      </ModernTimeline>
    );

    const connector = container.querySelector('[data-part="connector"]') as HTMLElement;
    expect(connector.style.width).toBe('');

    const marker = container.querySelector('[data-part="dot-marker"]') as HTMLElement;
    expect(marker.style.width).toBe('');
    expect(marker.style.animation).toBe('');

    const label = container.querySelector('[data-part="label"]') as HTMLElement;
    expect(label.style.fontSize).toBe('');

    const spinner = container.querySelector('[data-part="spinner"]') as HTMLElement;
    expect(spinner.style.animation).toBe('');
    expect(spinner.style.marginRight).toBe('');

    // The public per-item style channel is untouched.
    const { container: styled } = render(
      <ModernTimeline>
        <ModernTimelineItem className="custom-body" style={{ color: 'rgb(9, 9, 9)' }}>
          Body
        </ModernTimelineItem>
      </ModernTimeline>
    );
    const body = styled.querySelector('[data-part="body"]') as HTMLElement;
    expect(body.className).toBe('custom-body');
    expect(body.style.color).toBe('rgb(9, 9, 9)');
  });

  it('pins the skin as the single paint owner of every part', () => {
    // item grid geometry (the drained Daisy timeline-vertical layout)
    expect(SKIN).toMatch(/\[data-part='item'\][^{]*\{[^}]*display:\s*grid/);
    // connectors sized + placed by edge hook
    expect(SKIN).toMatch(/\[data-part='connector'\][^{]*\{[^}]*width:\s*var\(--ds-timeline-line-width/);
    expect(SKIN).toMatch(/\[data-part='connector'\]\[data-edge='leading'\][^{]*\{[^}]*grid-row-start:\s*1/);
    expect(SKIN).toMatch(/\[data-part='connector'\]\[data-edge='trailing'\][^{]*\{[^}]*grid-area:\s*3\s*\/\s*2/);
    // content placement + the theme.css text-color takeover
    expect(SKIN).toMatch(/\[data-part='content'\]\[data-side='start'\][^{]*\{[^}]*grid-area:\s*1\s*\/\s*1\s*\/\s*4\s*\/\s*2/);
    // K3-A Pass 2 (sighted on the live sweep): start-side content aligns
    // TOWARD the rail (the label used to float a full text-width away from
    // the dot, leaving a ragged rail edge in alternate mode)
    expect(SKIN).toMatch(/\[data-part='content'\]\[data-side='start'\][^{]*\{[^}]*text-align:\s*end/);
    expect(SKIN).toMatch(/\[data-part='content'\][^{]*\{[^}]*color:\s*var\(--ds-timeline-content-color,\s*var\(--ds-text-primary/);
    // dot track + marker geometry
    expect(SKIN).toMatch(/\[data-part='dot'\][^{]*\{[^}]*grid-row-start:\s*2/);
    expect(SKIN).toMatch(/\[data-part='dot-marker'\][^{]*\{[^}]*border-radius/);
    // pending spinner painted by the skin
    expect(SKIN).toMatch(/\[data-part='spinner'\][^{]*\{[^}]*border-top-color/);
    // CONTRAST LAW (K3-A Pass 2, axe serious on BOTH sources): the resolved
    // label channel failed AA (3.10 bithire / 4.40 TMM) — deepened 30% toward
    // the source's own primary ink, raw escape hatch kept.
    expect(SKIN).toMatch(/--ds-timeline-label-ink/);
    expect(SKIN).toMatch(
      /\[data-part='label'\][^{]*\{[^}]*color-mix\(\s*in srgb,\s*var\(--ds-timeline-label-color,\s*var\(--ds-color-text-secondary\)\)\s*70%,\s*var\(--ds-color-text-primary\)\s*30%\s*\)/
    );
    // No Daisy class selectors survive in rule position (comments stripped).
    const skinRules = SKIN.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(skinRules).not.toMatch(/\.timeline-start/);
    expect(skinRules).not.toMatch(/\.timeline-middle/);
    expect(skinRules).not.toMatch(/\.timeline-end/);
  });
});
