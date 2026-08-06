import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import ModernButton from '../engines/modern';

describe('ModernButton icon-only resolution (modern engine)', () => {
  it('treats a conditional label that resolved away as icon-only', () => {
    const collapsed = true;
    render(
      <ModernButton icon={<svg data-testid="glyph" />} aria-label="Settings">
        {!collapsed && 'Settings'}
      </ModernButton>
    );

    const button = screen.getByRole('button', { name: 'Settings' });
    expect(button.querySelector('[data-part="label"]')).toBeNull();
    expect(button).toHaveAttribute('data-icon-only', 'true');
  });

  it('keeps the accessible name a labelled icon provides when there is no text label', () => {
    render(
      <ModernButton
        icon={
          <svg role="img" aria-label="Search">
            <title>Search</title>
          </svg>
        }
      />
    );

    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('still hides the icon from the name when a text label is present', () => {
    render(
      <ModernButton
        icon={
          <svg role="img" aria-label="Search">
            <title>Search</title>
          </svg>
        }
      >
        Find records
      </ModernButton>
    );

    expect(screen.getByRole('button', { name: 'Find records' })).toBeInTheDocument();
  });
});
