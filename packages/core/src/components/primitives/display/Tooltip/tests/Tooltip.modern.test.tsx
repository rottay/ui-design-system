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
    expect(tooltip.parentElement).toBe(document.body);
  });

  it('uses a tokenized high z-index fallback', () => {
    render(
      <ModernTooltip content="Default wrapping" visible>
        <button>Default action</button>
      </ModernTooltip>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.style.zIndex).toContain('--ds-z-index-tooltip');
    expect(tooltip).toHaveStyle({
      whiteSpace: 'normal',
      textOrientation: 'mixed',
    });
  });
});
