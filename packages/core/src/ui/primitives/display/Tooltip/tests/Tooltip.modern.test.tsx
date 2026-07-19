import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernTooltip from '../engines/modern';

describe('ModernTooltip', () => {
  it('wraps long tooltip content and honors maxWidth/zIndex', () => {
    render(
      <ModernTooltip
        content="Open this operational row to review the complete context before routing work."
        maxWidth={272}
        visible
        zIndex={2700}
      >
        <button>Action</button>
      </ModernTooltip>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveStyle({
      position: 'fixed',
      width: 'max-content',
      maxWidth: '272px',
      maxInlineSize: '272px',
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
      writingMode: 'horizontal-tb',
      zIndex: '2700',
    });
    // The measured branch renders through the shared overlay portal root.
    expect(tooltip.closest('[data-rottay-portal]')).not.toBeNull();
  });

  it('uses a tokenized high z-index fallback', () => {
    render(
      <ModernTooltip content="Default wrapping" visible>
        <button>Default action</button>
      </ModernTooltip>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.style.zIndex).toContain('--ds-z-tooltip');
    expect(tooltip).toHaveStyle({
      whiteSpace: 'normal',
      textOrientation: 'mixed',
    });
  });

  it('renders formatted key chips alongside content when shortcut is set', () => {
    render(
      <ModernTooltip content="Open command palette" shortcut="ctrl+k" visible>
        <button>Open</button>
      </ModernTooltip>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Open command palette');
    // formatShortcutKey renders platform-appropriate symbols (Ctrl or the
    // Mac control glyph) plus the letter -- assert on the kbd count and the
    // stable letter segment rather than the platform-dependent modifier glyph.
    expect(tooltip.querySelectorAll('kbd')).toHaveLength(2);
    expect(tooltip).toHaveTextContent('K');
  });

  it('renders no kbd chips when shortcut is omitted', () => {
    render(
      <ModernTooltip content="Plain tooltip" visible>
        <button>Action</button>
      </ModernTooltip>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.querySelectorAll('kbd')).toHaveLength(0);
  });
});
