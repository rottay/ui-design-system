import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ButtonGroup, ButtonIcon } from '../compound';
import { SHAPE_MAP, VARIANT_MAP } from '../contracts';
import ModernButton from '../engines/modern';

describe('ModernButton Pass 2 craft contract', () => {
  it('keeps exported maps on the same canonical tenant token channels as the skin', () => {
    const publicMap = JSON.stringify({ VARIANT_MAP, SHAPE_MAP });

    expect(publicMap).not.toMatch(/#[\da-f]{3,8}|rgba?\(|,\s*(?:transparent|\d)/i);
    expect(VARIANT_MAP.primary.hoverBg).toBe(
      'var(--ds-button-primary-bg-hover)'
    );
    expect(VARIANT_MAP.danger.bg).toBe('var(--ds-button-error-bg)');
    expect(SHAPE_MAP.default).toBe('var(--ds-button-md-radius)');
  });

  it('lets a full-width localized label wrap without reducing its size posture', () => {
    render(
      <ModernButton block size="sm">
        Review the complete candidate evidence before making the final decision
      </ModernButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-full-width', 'true');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button.querySelector('[data-part="label"]')).toHaveTextContent(
      'Review the complete candidate evidence before making the final decision'
    );
  });

  it('routes Button.Icon through the same Modern anatomy and DS Tooltip', () => {
    render(
      <ButtonIcon
        icon={<svg data-testid="settings-icon" />}
        aria-label="Open settings"
        tooltip="Open settings"
        variant="ghost"
      />
    );

    const button = screen.getByRole('button', { name: 'Open settings' });
    expect(button).toHaveClass('ds-button--modern');
    expect(button).toHaveAttribute('data-icon-only', 'true');
    expect(button).toHaveAttribute('data-shape', 'default');
    expect(button).not.toHaveAttribute('title');
    expect(button.closest('.rottay-tooltip-root')).toBeInTheDocument();
  });

  it('keeps connected group geometry logical, tokenized and free of inline paint', () => {
    const { container } = render(
      <div dir="rtl">
        <ButtonGroup connected aria-label="View mode">
          <ModernButton variant="default">One</ModernButton>
          <ModernButton variant="default">Two</ModernButton>
          <ModernButton variant="default">Three</ModernButton>
        </ButtonGroup>
      </div>
    );

    const group = screen.getByRole('group', { name: 'View mode' });
    expect(group).toHaveAttribute('data-connected', 'true');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');
    expect(group.getAttribute('style') ?? '').not.toMatch(
      /border|background|box-shadow|color/i
    );
    expect(container.querySelectorAll('.ds-button')).toHaveLength(3);
  });
});
