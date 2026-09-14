/**
 * Tour modern engine: the chrome carries no static inline geometry, its copy
 * resolves from the common locale, and the body portal re-enters the tenant
 * scope. Measured geometry travels as family channels, never as paint.
 */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ModernTour from '../engines/modern';

afterEach(() => cleanup());

function surface(): HTMLElement {
  const el = document.querySelector(".ds-tour--modern [data-part='surface']") as HTMLElement | null;
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

  it('declares only measured geometry inline on the surface, never paint', () => {
    render(
      <div>
        <div id="ret02-tour-anchor">Anchor</div>
        <ModernTour open steps={[{ target: '#ret02-tour-anchor', title: 'Anchored step' }]} />
      </div>,
    );

    // The surface spreads only the certified `overlay.positionStyle`
    // (position/inset); the layer band rides on the root as a channel.
    const el = surface();
    const declared = Array.from({ length: el.style.length }, (_, i) => el.style.item(i));
    for (const property of declared) {
      expect(property).not.toMatch(
        /^(background|border|outline|color|box-shadow|text-shadow|fill|stroke|accent-color|filter|backdrop-filter|-webkit-backdrop-filter|transform)/,
      );
    }
    // Non-vacuity: an empty declaration list would satisfy the loop above.
    expect(declared).toContain('top');
    expect(declared).not.toContain('z-index');
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
    const root = document.querySelector('.ds-tour--modern') as HTMLElement;

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

    const root = document.querySelector('.ds-tour--modern[data-part="root"]') as HTMLElement;
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

    const root = document.querySelector('.ds-tour--modern[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-tenant', 'target-tenant');
  });

  it('stamps no tenant attributes outside a DS scope', () => {
    render(<ModernTour open mask={false} steps={[{ title: 'Unscoped step' }]} />);

    const root = document.querySelector('.ds-tour--modern[data-part="root"]') as HTMLElement;
    expect(root.hasAttribute('data-tenant')).toBe(false);
  });
});
