import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ButtonGroup, ButtonIcon } from '../compound';
import { SHAPE_MAP, VARIANT_MAP } from '../contracts';
import ModernButton from '../engines/modern';

const modernSkin = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/button.css'
  ),
  'utf8'
);

const compoundSkin = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/presentation/components/skin/button-group.css'
  ),
  'utf8'
);

describe('ModernButton Pass 2 craft contract', () => {
  it('keeps material depth, optical alignment and motion tenant-owned', () => {
    expect(modernSkin).toContain('--ds-button-surface-highlight');
    expect(modernSkin).toContain('--ds-button-surface-highlight-hover-opacity');
    expect(modernSkin).toContain('--ds-button-label-offset-y');
    expect(modernSkin).toContain('--ds-button-icon-hover-transform');
    expect(modernSkin).toContain('--ds-button-hover-filter');
    expect(modernSkin).toContain('--ds-button-spinner-duration');
    expect(modernSkin).not.toMatch(/#[\da-f]{3,8}\b/i);
  });

  it('keeps exported maps on the same canonical tenant token channels as the skin', () => {
    const publicMap = JSON.stringify({ VARIANT_MAP, SHAPE_MAP });

    expect(publicMap).not.toMatch(/#[\da-f]{3,8}|rgba?\(|,\s*(?:transparent|\d)/i);
    expect(VARIANT_MAP.primary.hoverBg).toBe(
      'var(--ds-button-primary-bg-hover)'
    );
    expect(VARIANT_MAP.danger.bg).toBe('var(--ds-button-error-bg)');
    expect(SHAPE_MAP.default).toBe('var(--ds-button-md-radius)');
  });

  it('uses finite decorative attention while retaining a functional busy spinner', () => {
    const attentionRule = modernSkin.match(
      /\[data-pulse='true'\][\s\S]*?\n\}/
    )?.[0];

    expect(attentionRule).toBeDefined();
    expect(attentionRule).toContain('--ds-button-attention-iteration-count');
    expect(attentionRule).not.toContain('infinite');
    expect(modernSkin).toMatch(
      /\[data-part='spinner'\][\s\S]*?var\(--ds-button-spinner-duration\)[\s\S]*?infinite/
    );
  });

  it('provides complete reduced-motion, forced-color and coarse-pointer exits', () => {
    const reducedMotion = modernSkin.slice(
      modernSkin.indexOf('@media (prefers-reduced-motion: reduce)')
    );
    const forcedColors = modernSkin.slice(
      modernSkin.indexOf('@media (forced-colors: active)')
    );

    expect(reducedMotion).toContain('transition: none');
    expect(reducedMotion).toContain('animation: none');
    expect(modernSkin).toContain("[data-icon-only='true']");
    expect(modernSkin).toContain('--ds-button-touch-target-min');
    expect(forcedColors).toContain('border-color: ButtonText');
    expect(forcedColors).toContain("[data-part='trigger']::before");
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
    expect(modernSkin).toContain('overflow-wrap: anywhere');
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
    expect(button).toHaveClass('rottay-button--modern');
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
    expect(container.querySelectorAll('.rottay-button')).toHaveLength(3);
    expect(compoundSkin).toContain('border-start-start-radius');
    expect(compoundSkin).toContain('border-end-end-radius');
    expect(compoundSkin).toContain('overscroll-behavior-inline');
    expect(compoundSkin).not.toMatch(/6px|border-(left|right)/);
  });
});
