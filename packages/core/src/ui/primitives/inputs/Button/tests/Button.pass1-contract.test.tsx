import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { brandThemeToChromeVariables } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import ModernButton from '../engines/modern';

describe('ModernButton Pass 1 contract', () => {
  it('publishes stable anatomy for label, icons, prefix and suffix', () => {
    const { container } = render(
      <ModernButton
        icon={<svg data-testid="icon" />}
        prefix={<span>New</span>}
        suffix={<kbd>⌘K</kbd>}
      >
        Run action
      </ModernButton>
    );

    expect(container.querySelector('[data-part="content"]')).toHaveAttribute(
      'data-state',
      'visible'
    );
    expect(container.querySelector('[data-part="icon"][data-position="start"]')).toBeInTheDocument();
    expect(container.querySelector('[data-part="label"]')).toHaveTextContent('Run action');
    // `icon` owns the start slot; prefix is the documented fallback.
    expect(container.querySelector('[data-part="prefix"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-part="suffix"]')).toHaveTextContent('⌘K');
  });

  it('keeps the action name while pending without an English fallback string', () => {
    const { container } = render(<ModernButton pending>Publicar cambios</ModernButton>);

    expect(screen.getByRole('button', { name: 'Publicar cambios' })).toBeDisabled();
    expect(container.querySelector('[data-part="spinner"]')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[data-part="accessible-label"]')).toHaveTextContent(
      'Publicar cambios'
    );
  });

  it('renders href actions as native links and secures new-window navigation', () => {
    const { rerender } = render(
      <ModernButton href="/reports" target="_blank">
        Open reports
      </ModernButton>
    );

    const link = screen.getByRole('link', { name: 'Open reports' });
    expect(link).toHaveAttribute('href', '/reports');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    rerender(
      <ModernButton href="/reports" disabled>
        Open reports
      </ModernButton>
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open reports' })).toBeDisabled();
  });

  it('composes consumer interaction handlers with internal state handlers', () => {
    const onPointerEnter = vi.fn();
    const onPointerDown = vi.fn();
    const onFocus = vi.fn();
    render(
      <ModernButton
        onPointerEnter={onPointerEnter}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
      >
        Compose handlers
      </ModernButton>
    );

    const button = screen.getByRole('button', { name: 'Compose handlers' });
    fireEvent.pointerEnter(button);
    expect(button.getAttribute('data-state')).toContain('hovered');
    expect(onPointerEnter).toHaveBeenCalledOnce();
    fireEvent.pointerDown(button);
    expect(button.getAttribute('data-state')).toContain('pressed');
    expect(onPointerDown).toHaveBeenCalledOnce();
    fireEvent.focus(button);
    expect(onFocus).toHaveBeenCalledOnce();
  });

  it('publishes pressed state for keyboard activation and clears it on release', () => {
    render(<ModernButton>Keyboard action</ModernButton>);
    const button = screen.getByRole('button', { name: 'Keyboard action' });

    fireEvent.keyDown(button, { key: ' ' });
    expect(button.getAttribute('data-state')).toContain('pressed');
    fireEvent.keyUp(button, { key: ' ' });
    expect(button.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('stamps every public visual posture without leaking custom props', () => {
    render(
      <ModernButton
        variant="ai"
        gradient
        shadow
        pulse
        bordered
        radius="lg"
        asChild
      >
        Draft with AI
      </ModernButton>
    );

    const button = screen.getByRole('button', { name: 'Draft with AI' });
    expect(button).toHaveAttribute('data-variant', 'ai');
    expect(button).toHaveAttribute('data-gradient', 'true');
    expect(button).toHaveAttribute('data-shadow', 'true');
    expect(button).toHaveAttribute('data-pulse', 'true');
    expect(button).toHaveAttribute('data-bordered', 'true');
    expect(button).toHaveAttribute('data-radius', 'lg');
    expect(button).not.toHaveAttribute('gradient');
    expect(button).not.toHaveAttribute('shadow');
    expect(button).not.toHaveAttribute('pulse');
    expect(button).not.toHaveAttribute('bordered');
    expect(button).not.toHaveAttribute('aschild');
  });

  it('normalizes shared semantic aliases into the Modern paint contract', () => {
    const { rerender } = render(<ModernButton variant="error">Delete</ModernButton>);
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute(
      'data-variant',
      'danger'
    );

    rerender(<ModernButton variant="gradient">Continue</ModernButton>);
    const gradientButton = screen.getByRole('button', { name: 'Continue' });
    expect(gradientButton).toHaveAttribute('data-variant', 'primary');
    expect(gradientButton).toHaveAttribute('data-gradient', 'true');
  });

  it('emits the complete white-label geometry and AI state palette', () => {
    const vars = brandThemeToChromeVariables({
      id: 'button-contract',
      name: 'Button contract',
      chrome: {
        controls: {
          buttonGeometry: {
            fontFamily: 'var(--tenant-font)',
            textTransform: 'uppercase',
            gap: '0.625rem',
            radius: '0.875rem',
            borderWidth: '2px',
            touchTargetMin: '48px',
            hoverTransform: 'translateY(-2px)',
            activeTransform: 'scale(.96)',
            transitionDuration: 'var(--ds-motion-feedback)',
            transitionTiming: 'var(--ds-motion-ease-out)',
          },
          buttonAI: {
            bg: 'var(--tenant-ai)',
            bgHover: 'var(--tenant-ai-hover)',
            bgActive: 'var(--tenant-ai-active)',
            color: 'var(--tenant-ai-text)',
            colorHover: 'var(--tenant-ai-text-hover)',
            colorActive: 'var(--tenant-ai-text-active)',
            border: 'var(--tenant-ai-border)',
            borderHover: 'var(--tenant-ai-border-hover)',
            borderActive: 'var(--tenant-ai-border-active)',
            shadow: 'var(--tenant-ai-shadow)',
            shadowHover: 'var(--tenant-ai-shadow-hover)',
            shadowActive: 'var(--tenant-ai-shadow-active)',
          },
          buttonDashed: {
            borderActive: 'var(--tenant-dashed-border-active)',
          },
          buttonLink: {
            bgActive: 'var(--tenant-link-bg-active)',
          },
        },
      },
    });

    expect(vars['--ds-button-font-family']).toBe('var(--tenant-font)');
    expect(vars['--ds-button-text-transform']).toBe('uppercase');
    expect(vars['--ds-button-md-gap']).toBe('0.625rem');
    expect(vars['--ds-button-md-radius']).toBe('0.875rem');
    expect(vars['--ds-button-border-width']).toBe('2px');
    expect(vars['--ds-button-touch-target-min']).toBe('48px');
    expect(vars['--ds-button-hover-transform']).toBe('translateY(-2px)');
    expect(vars['--ds-button-ai-bg']).toBe('var(--tenant-ai)');
    expect(vars['--ds-button-ai-color-active']).toBe('var(--tenant-ai-text-active)');
    expect(vars['--ds-button-ai-border-active']).toBe('var(--tenant-ai-border-active)');
    expect(vars['--ds-button-ai-shadow-active']).toBe('var(--tenant-ai-shadow-active)');
    expect(vars['--ds-button-dashed-border-active']).toBe(
      'var(--tenant-dashed-border-active)'
    );
    expect(vars['--ds-button-link-bg-active']).toBe('var(--tenant-link-bg-active)');
  });
});
