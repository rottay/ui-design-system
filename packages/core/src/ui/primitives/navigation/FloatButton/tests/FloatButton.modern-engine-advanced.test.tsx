import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  BackTop as ModernBackTop,
  FloatButton as ModernFloatButton,
  Group as ModernFloatButtonGroup,
} from '../engines/modern';

const DAISY_CLASSES = ['btn', 'btn-circle', 'btn-primary', 'btn-ghost', 'bg-base-100', 'bg-error', 'shadow-lg', 'rounded-lg'];

// The skin is the single paint owner (K4-C); token-bound interaction and
// geometry are asserted against its source because happy-dom drops var() on
// standard CSS properties.
const modernSkin = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/float-button.css'),
  'utf8',
);

describe('FloatButton modern advanced engine coverage', () => {
  it('covers modern button and anchor branches, tooltip guards, and badge rendering', () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <ModernFloatButton
        icon={<span aria-hidden="true">+</span>}
        description="Create"
        tooltip={{ title: 'rich tooltip' } as never}
        badge={{ dot: true, count: 128 }}
        onClick={handleClick}
        className="qa-fab"
      />
    );

    const button = screen.getByRole('button', { name: /create/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveClass('rottay-float-button', 'rottay-float-button--modern', 'qa-fab');
    for (const cls of DAISY_CLASSES) {
      expect(button.classList.contains(cls)).toBe(false);
    }
    expect(button).toHaveAttribute('data-variant', 'default');
    expect(button).toHaveAttribute('data-shape', 'circle');
    expect(button).not.toHaveAttribute('title');
    expect(screen.getByText('99+')).toBeInTheDocument();
    // Both badges are bare data-part hooks now: skin owns paint AND geometry.
    const dot = button.querySelector('[data-part="badge"][data-variant="dot"]') as HTMLElement;
    expect(dot).not.toBeNull();
    expect(dot.className).toBe('');
    expect(dot.getAttribute('style')).toBeNull();
    const count = button.querySelector('[data-part="badge"][data-variant="count"]') as HTMLElement;
    expect(count.getAttribute('style')).toBeNull();

    rerender(
      <ModernFloatButton
        href="https://example.com"
        target="_blank"
        description="Docs"
        tooltip="Open docs"
        type="default"
        shape="square"
      />
    );

    const link = screen.getByRole('link', { name: /docs/i });
    expect(link).toHaveClass('rottay-float-button', 'rottay-float-button--modern');
    for (const cls of DAISY_CLASSES) {
      expect(link.classList.contains(cls)).toBe(false);
    }
    expect(link).toHaveAttribute('data-variant', 'default');
    expect(link).toHaveAttribute('data-shape', 'square');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('title', 'Open docs');
  });

  it('keeps hover/press/focus interaction and geometry token-bound in the skin (K4-C)', () => {
    // Interaction: transcribed verbatim from the drained theme.css `.btn` rules.
    expect(modernSkin).toContain('transform: var(--ds-button-hover-transform, translateY(0) scale(1))');
    expect(modernSkin).toContain('transform: var(--ds-button-active-transform, scale(0.98))');
    expect(modernSkin).toContain('box-shadow: var(--ds-button-focus-ring)');
    expect(modernSkin).toContain('transition: var(--ds-button-transition)');
    // Footprint + badge geometry: verbatim fallbacks for the drained literals,
    // density-scaled via the canonical effective-scale idiom (K4-C Pass 2).
    expect(modernSkin).toContain('inline-size: calc(var(--ds-floatbutton-size, 40px) * var(--ds-density-effective-scale, 1))');
    expect(modernSkin).toContain('calc(var(--ds-floatbutton-padding-block, 8px) * var(--ds-density-effective-scale, 1))');
    expect(modernSkin).toContain('inset-inline-end: var(--ds-floatbutton-dot-offset-inline, -4px)');
    expect(modernSkin).toContain('inset-inline-end: var(--ds-floatbutton-badge-offset-inline, -8px)');
    expect(modernSkin).toContain('var(--ds-floatbutton-badge-padding-block, 1px) var(--ds-floatbutton-badge-padding-inline, 6px)');
    expect(modernSkin).toContain('font-size: var(--ds-floatbutton-badge-font-size, 11px)');
    expect(modernSkin).toContain('line-height: var(--ds-floatbutton-badge-line-height, 16px)');
    // K4-C Pass 2: 44px coarse-pointer floor on the circle footprint.
    expect(modernSkin).toContain('@media (pointer: coarse)');
    expect(modernSkin).toContain('var(--ds-floatbutton-size-coarse, 44px)');
  });

  it('names icon-only triggers accessibly (K4-C axe button-name remediation)', () => {
    // Icon-only, no tooltip: the guarded generic label applies.
    const { rerender } = render(<ModernFloatButton icon={<span aria-hidden="true">+</span>} />);
    expect(screen.getByRole('button', { name: 'Floating action button' })).toBeInTheDocument();

    // A string tooltip is the preferred name.
    rerender(<ModernFloatButton icon={<span aria-hidden="true">+</span>} tooltip="Create item" />);
    const named = screen.getByRole('button', { name: 'Create item' });
    expect(named).toHaveAttribute('title', 'Create item');

    // Discernible content names the trigger; no aria-label is added.
    rerender(<ModernFloatButton icon={<span aria-hidden="true">+</span>} description="Create" />);
    const byContent = screen.getByRole('button', { name: /create/i });
    expect(byContent).not.toHaveAttribute('aria-label');

    // Anchor rendering gets the same treatment.
    rerender(<ModernFloatButton href="https://example.com" icon={<span aria-hidden="true">+</span>} />);
    expect(screen.getByRole('link', { name: 'Floating action button' })).toBeInTheDocument();
  });

  it('names the group trigger and BackTop through the guarded channel (K4-C)', () => {
    // Group with the DEFAULT close glyph: the open trigger gets the guarded
    // close label instead of the meaningless "×" name.
    const { unmount } = render(
      <ModernFloatButtonGroup open trigger="click" icon={<span>?</span>} onOpenChange={() => undefined}>
        <ModernFloatButton description="Child" />
      </ModernFloatButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Close action group' })).toBeInTheDocument();
    unmount();

    // BackTop with the default ↑ glyph and no description: proper action name.
    const target = document.createElement('div');
    Object.defineProperty(target, 'scrollTop', { value: 100, writable: true, configurable: true });
    render(<ModernBackTop visibilityHeight={0} target={() => target} />);
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('covers hover groups in both uncontrolled and controlled modes', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ModernFloatButtonGroup
        trigger="hover"
        icon={<span>?</span>}
        closeIcon={<span>×</span>}
        onOpenChange={onOpenChange}
      >
        <ModernFloatButton description="Child action" />
      </ModernFloatButtonGroup>
    );

    // Closed trigger is icon-only: the guarded state-aware label applies
    // (K4-C); a custom closeIcon node keeps owning the open-state name.
    const uncontrolledRoot = screen.getByRole('button', { name: 'Open action group' }).parentElement;
    if (!(uncontrolledRoot instanceof HTMLElement)) {
      throw new Error('Expected uncontrolled group container');
    }

    // Logical fixed placement: mirrors under RTL, never physical right-6.
    expect(uncontrolledRoot.className).toContain('end-6');
    expect(uncontrolledRoot.className).not.toContain('right-6');

    fireEvent.mouseEnter(uncontrolledRoot);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: /×/i })).toBeInTheDocument();

    fireEvent.mouseLeave(uncontrolledRoot);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <ModernFloatButtonGroup
        trigger="hover"
        open
        icon={<span>?</span>}
        closeIcon={<span>×</span>}
        onOpenChange={onOpenChange}
      >
        <ModernFloatButton description="Controlled child" />
      </ModernFloatButtonGroup>
    );

    const controlledRoot = screen.getByRole('button', { name: /×/i }).parentElement;
    if (!(controlledRoot instanceof HTMLElement)) {
      throw new Error('Expected controlled group container');
    }

    expect(controlledRoot.querySelector('.opacity-100.translate-y-0')).toBeTruthy();
    const groupTrigger = controlledRoot.querySelector('[data-part="trigger"]') as HTMLElement;
    for (const cls of DAISY_CLASSES) {
      expect(groupTrigger.classList.contains(cls)).toBe(false);
    }
    fireEvent.mouseLeave(controlledRoot);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('covers custom target scroll containers and hidden-state branches for BackTop', async () => {
    const target = document.createElement('div');
    Object.defineProperty(target, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true,
    });
    target.scrollTo = vi.fn();

    const handleClick = vi.fn();
    const { rerender } = render(
      <ModernBackTop
        visibilityHeight={20}
        target={() => target}
        description="Back to top"
        onClick={handleClick}
        type="default"
        shape="square"
      />
    );

    expect(screen.queryByRole('button', { name: /back to top/i })).not.toBeInTheDocument();

    await act(async () => {
      target.scrollTop = 48;
      target.dispatchEvent(new Event('scroll'));
    });

    const button = screen.getByRole('button', { name: /back to top/i });
    fireEvent.click(button);

    expect(target.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveClass('rottay-float-button', 'rottay-float-button--modern');
    for (const cls of DAISY_CLASSES) {
      expect(button.classList.contains(cls)).toBe(false);
    }
    expect(button.className).toContain('end-6');
    expect(button.className).not.toContain('right-6');

    rerender(
      <ModernBackTop
        visibilityHeight={50}
        target={() => target}
        description="Back to top"
      />
    );

    await act(async () => {
      target.scrollTop = 10;
      target.dispatchEvent(new Event('scroll'));
    });

    expect(screen.queryByRole('button', { name: /back to top/i })).not.toBeInTheDocument();
  });
});
