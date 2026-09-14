/**
 * The folded Callout keeps its own weight. Before the fold the Modern callout
 * skin washed at step 4 of the status tint ramp and the alert surface at step 8;
 * folding Callout onto that surface would otherwise have painted every callout
 * a step darker than it was. The `subtle` emphasis is that step, and it reaches
 * paint: the skin's wash falls through the family channel to `--ds-tint-<tone>-4`
 * itself, which is what makes the channel a live read rather than a deriver value
 * the cascade never resolves.
 */
import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernCallout from '../presentation/callout';
import { AlertSurface } from '../runtime/surface';
import { alertChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/alert';

const TONES = ['info', 'success', 'warning', 'error'] as const;

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/runtime/engines/modern/skin/alert/index.css'),
  'utf8',
);

describe('the folded callout washes a step lighter than the alert surface', () => {
  it('stamps the subtle emphasis, which the plain alert surface does not', () => {
    render(<ModernCallout tone="info">Body copy</ModernCallout>);
    expect(document.querySelector('.ds-alert')).toHaveAttribute('data-emphasis', 'subtle');
  });

  it('leaves the alert surface on its own weight', () => {
    render(<AlertSurface tone="info" description="Body copy" closeLabel="Close" announce="status" />);
    expect(document.querySelector('.ds-alert')).not.toHaveAttribute('data-emphasis');
  });

  it.each(TONES)('carries the %s tone through to the subtle surface', (tone) => {
    render(
      <ModernCallout tone={tone === 'error' ? 'danger' : tone} title="Heads up">
        Body copy
      </ModernCallout>,
    );
    const root = document.querySelector('.ds-alert')!;
    expect(root).toHaveAttribute('data-tone', tone);
    expect(root).toHaveAttribute('data-emphasis', 'subtle');
    expect(screen.getByText('Body copy')).toBeInTheDocument();
  });

  it.each(TONES)('resolves the %s subtle wash to step 4, never step 8', (tone) => {
    // The skin reads the FAMILY channel and mirrors step 4 in its own fallback.
    // Reaching past it to --ds-tint-<tone>-4 would paint the same pixel and is
    // what the family-cut contract refuses by name (readWithoutProducer).
    expect(SKIN).toContain(
      `--ds-alert-wash: var(--ds-alert-${tone}-wash-subtle, color-mix(in oklab, var(--ds-color-${tone}) 4%, var(--ds-color-bg-primary)));`,
    );
    expect(SKIN).toContain(`--ds-alert-wash: var(--ds-alert-${tone}-wash,`);
    expect(SKIN).not.toMatch(new RegExp(`wash-subtle,[^;]*--ds-color-${tone}\\) 8%`));
  });

  it('declares every subtle channel it paints, on step 4 of its own tone', () => {
    const vars = alertChromeDeriver.derive({} as never, {} as never);
    for (const tone of TONES) {
      expect(alertChromeDeriver.produces).toContain(`--ds-alert-${tone}-wash-subtle`);
      expect(vars[`--ds-alert-${tone}-wash-subtle`]).toBe(`var(--ds-tint-${tone}-4)`);
      expect(vars[`--ds-alert-${tone}-wash`]).toBe(`var(--ds-tint-${tone}-8)`);
    }
  });
});
