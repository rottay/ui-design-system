/**
 * Tour modern engine — skin paint ownership, i18n chrome & logical close (K4-A).
 *
 * The engine hardcoded its chrome inline (close button `right/top/28px`,
 * surface `padding: 16; maxWidth: 384`, nav actions `height/padding/fontSize`)
 * and laid the tree out with ~18 Tailwind utilities. K4-A drained all static
 * chrome into the unlayered skin `tour.css` (shipped values transcribed onto
 * family-local `--ds-tour-*` channels), converted the close button's physical
 * `right: 8` to logical `inset-inline-end` so it mirrors under RTL, and wired
 * the close/previous/next labels to the common locale (`Finish` still lacks a
 * key -- pinned literal here, listed as a needed key in the family ficha).
 *
 * Measured geometry (spotlight rect, runtime positioning, z-index chain,
 * mask colour channel) is genuine runtime data and stays inline.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ModernTour from '../engines/modern';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped so header prose cannot false-green the rule pins.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tour.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

afterEach(() => cleanup());

function surface(): HTMLElement {
  const el = document.querySelector(".rottay-tour--modern [data-part='surface']") as HTMLElement | null;
  if (!el) throw new Error('tour surface not rendered');
  return el;
}

describe('Tour modern engine — chrome carries no static inline geometry or utilities', () => {
  it('gates the spotlight scrim on mask (mask={false} must never veil the page)', () => {
    const steps = [
      {
        target: '[data-testid="k4a-mask-anchor"]',
        title: 'Masked step',
      },
    ];
    const { rerender } = render(
      <div>
        <div data-testid="k4a-mask-anchor">Anchor</div>
        <ModernTour open mask={false} steps={steps} />
      </div>,
    );
    expect(document.querySelector('[data-part="spotlight"]')).toBeNull();
    expect(document.querySelector('[data-part="backdrop"]')).toBeNull();

    rerender(
      <div>
        <div data-testid="k4a-mask-anchor">Anchor</div>
        <ModernTour open steps={steps} />
      </div>,
    );
    expect(document.querySelector('[data-part="spotlight"]')).not.toBeNull();
  });

  it('keeps the surface chrome (padding/max-width) out of the element style', () => {
    render(<ModernTour open mask={false} steps={[{ title: 'Only step' }]} />);

    const el = surface();
    expect(el.style.padding).toBe('');
    expect(el.style.maxWidth).toBe('');
  });

  it('renders the close button with an accessible name and no inline geometry', () => {
    render(<ModernTour open mask={false} steps={[{ title: 'Only step' }]} />);

    const close = screen.getByRole('button', { name: 'Close' });
    expect(close.getAttribute('style')).toBeNull();
    // The glyph is the governed ActionCloseIcon (Modal/Toast/Notification
    // pattern), decorative -- never the retired ✕ text glyph.
    const icon = close.querySelector('[data-icon-name="action.close"]');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(close.textContent).not.toContain('✕');
  });

  it('renders nav actions from the common locale with no inline geometry', () => {
    render(
      <ModernTour
        open
        mask={false}
        current={1}
        steps={[{ title: 'One' }, { title: 'Two' }, { title: 'Three' }]}
      />,
    );

    const prev = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });
    expect(prev.getAttribute('style')).toBeNull();
    expect(next.getAttribute('style')).toBeNull();
  });

  it('keeps the literal Finish label until a locale key exists', () => {
    render(
      <ModernTour
        open
        mask={false}
        current={1}
        steps={[{ title: 'One' }, { title: 'Two' }]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
  });

  it('drops every Tailwind utility from the chrome tree', () => {
    const { container } = render(
      <ModernTour
        open
        steps={[{ title: 'Step', description: 'Copy', cover: <div>Cover</div> }]}
      />,
    );
    void container;
    const root = document.querySelector('.rottay-tour--modern') as HTMLElement;

    for (const el of [root, ...root.querySelectorAll<HTMLElement>('[data-part]')]) {
      const classes = (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
      for (const cls of classes) {
        expect(cls).not.toMatch(/^(fixed|inset-0|rounded-(lg|full)|pointer-events-none|mb-3|mt-2|mt-4|flex|items-center|justify-between|gap-[12]|w-2|h-2|font-bold|text-lg|relative|inline-block)$/);
      }
    }
    // New anatomy parts exist for the skin to own.
    expect(root.querySelector('[data-part="cover"]')).not.toBeNull();
    expect(root.querySelector('[data-part="indicators"]')).not.toBeNull();
    expect(root.querySelector('[data-part="actions"]')).not.toBeNull();
  });
});

describe('Tour modern engine — the body portal re-enters the tenant scope (R1)', () => {
  it('re-stamps data-ds-root/data-tenant/dir on the chrome root from the scope owner', () => {
    render(
      <div data-ds-root="" data-tenant="fixture-tenant" data-vertical="fixture" dir="rtl">
        <ModernTour open mask={false} steps={[{ title: 'Scoped step' }]} />
      </div>,
    );

    const root = document.querySelector('.rottay-tour--modern[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-ds-root', '');
    expect(root).toHaveAttribute('data-tenant', 'fixture-tenant');
    expect(root).toHaveAttribute('data-vertical', 'fixture');
    expect(root).toHaveAttribute('dir', 'rtl');
  });

  it('reads the scope from the target element when one is anchored', () => {
    render(
      <div>
        <div data-ds-root="" data-tenant="target-tenant">
          <div id="k4a-tour-scope-target">Target</div>
        </div>
        <ModernTour
          open
          mask={false}
          steps={[{ target: '#k4a-tour-scope-target', title: 'Anchored step' }]}
        />
      </div>,
    );

    const root = document.querySelector('.rottay-tour--modern[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-tenant', 'target-tenant');
  });

  it('stamps no tenant attributes outside a DS scope', () => {
    render(<ModernTour open mask={false} steps={[{ title: 'Unscoped step' }]} />);

    const root = document.querySelector('.rottay-tour--modern[data-part="root"]') as HTMLElement;
    expect(root.hasAttribute('data-tenant')).toBe(false);
  });
});

describe('Tour modern engine — the skin owns the drained chrome', () => {
  it('owns the title ink from the card material (R2: coherent bg/ink role)', () => {
    expect(SKIN).toContain(
      'color: var(--ds-tour-title-ink, var(--ds-material-card-foreground, var(--ds-color-text-primary)));',
    );
  });

  it('owns the surface bg from the card material, never bare --ds-surface-card', () => {
    expect(SKIN).toContain(
      'background: var(--ds-tour-surface-bg, var(--ds-material-card-background, var(--ds-surface-card)));',
    );
    expect(SKIN).not.toContain('background: var(--ds-surface-card);');
  });

  it('owns the description ink with a raw escape hatch', () => {
    expect(SKIN).toContain('color: var(--ds-tour-description-ink, var(--ds-color-text-secondary));');
  });

  it('inks the solid next action from the overlay foreground and never paints a dead neutral channel', () => {
    expect(SKIN).toContain(
      'background: var(--ds-tour-action-next-bg, var(--ds-color-neutral, var(--ds-color-primary)));',
    );
    expect(SKIN).toContain(
      'color: var(--ds-tour-action-next-ink, var(--ds-material-overlay-foreground, var(--ds-color-text-on-primary)));',
    );
    // --ds-color-neutral is declared nowhere; it must not appear bare.
    expect(SKIN).not.toContain('background: var(--ds-color-neutral);');
    expect(SKIN).not.toContain('color: var(--ds-color-text-on-primary);');
  });

  it('consumes the tenant font channels like its siblings (never the app shell font)', () => {
    expect(SKIN).toContain('font-family: var(--ds-tour-font-family, var(--ds-font-family-base));');
    expect(SKIN).toContain(
      'font-family: var(--ds-tour-title-font-family, var(--ds-font-family-heading, var(--ds-tour-font-family, var(--ds-font-family-base))));',
    );
  });

  it('owns the backdrop fixed positioning', () => {
    expect(SKIN).toMatch(/\[data-part='backdrop'\]\s*\{[^}]*position: fixed;[^}]*inset: 0;/);
  });

  it('owns the spotlight fixed positioning and radius', () => {
    expect(SKIN).toMatch(/\[data-part='spotlight'\]\s*\{[^}]*position: fixed;[^}]*border-radius: var\(--ds-radius-lg\);[^}]*pointer-events: none;/);
  });

  it('owns the surface chrome with LOGICAL max-inline-size', () => {
    expect(SKIN).toContain('padding: var(--ds-tour-surface-padding, var(--ds-spacing-4, 1rem));');
    expect(SKIN).toContain('max-inline-size: var(--ds-tour-surface-max-width, 24rem);');
    expect(SKIN).not.toMatch(/\[data-part='surface'\][^{]*\{[^}]*max-width:/);
  });

  it('owns the close-button geometry on LOGICAL insets that mirror under RTL', () => {
    expect(SKIN).toMatch(/\[data-part='close-button'\]\s*\{[^}]*inset-block-start:[^}]*inset-inline-end:/);
    expect(SKIN).toContain('inline-size: var(--ds-tour-close-size, 1.75rem);');
    expect(SKIN).not.toMatch(/\[data-part='close-button'\]\s*\{[^}]*\sright:/);
  });

  it('owns the nav-action chrome', () => {
    expect(SKIN).toContain('block-size: var(--ds-tour-action-height, 2rem);');
    expect(SKIN).toContain('padding-inline: var(--ds-tour-action-padding-inline, 0.75rem);');
    expect(SKIN).toContain('font-size: var(--ds-tour-action-font-size, 0.8125rem);');
  });

  it('owns indicator size and copy margins with preflight-independent resets', () => {
    expect(SKIN).toMatch(/\[data-part='indicator'\]\s*\{[^}]*inline-size: 0\.5rem;[^}]*block-size: 0\.5rem;/);
    expect(SKIN).toMatch(/\[data-part='title'\]\s*\{[^}]*margin: 0;/);
    expect(SKIN).toMatch(/\[data-part='description'\]\s*\{[^}]*margin: 0;[^}]*margin-block-start:/);
  });

  it('pins the leveled Pass-2 interaction contract (the retired zero-hover is gone)', () => {
    expect(SKIN).toContain("[data-action='prev']:not(:disabled):hover");
    expect(SKIN).toContain("[data-action='next']:not(:disabled):hover");
    expect(SKIN).toContain("[data-action='next']:not(:disabled):active");
    expect(SKIN).toContain("[data-part='close-button']:not(:disabled):hover");
    expect(SKIN).toContain("[data-part='close-button']:not(:disabled):focus-visible");
    expect(SKIN).toContain('outline: 2px solid var(--ds-tour-focus-ring,');
    expect(SKIN).toContain('@media (forced-colors: active)');
    expect(SKIN).toContain('@media (pointer: coarse)');
    expect(SKIN).toContain('min-block-size: max(44px, var(--ds-tour-touch-target-min, 2rem));');
    expect(SKIN).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
