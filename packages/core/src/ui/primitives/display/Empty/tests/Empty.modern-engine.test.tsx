import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import ModernEmpty from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

describe('Empty modern engine', () => {
  it('renders a compact tenant-aware semantic visual', () => {
    const { container } = renderWithEngine(
      <ModernEmpty image="simple" description="No matches" />,
      'modern',
    );
    const root = screen.getByRole('status');

    expect(root).toHaveAttribute('data-image', 'simple');
    expect(root).toHaveAttribute('data-has-description', 'true');
    expect(root).toHaveAttribute('data-has-footer', 'false');
    expect(root).toHaveAttribute('aria-live', 'polite');
    expect(container.querySelector('[data-icon-name="communication.inbox"]')).not.toBeNull();
  });

  it('exposes an action tray without inventing copy', () => {
    const { container } = renderWithEngine(
      <ModernEmpty description="Nothing scheduled">
        <button type="button">Plan</button>
      </ModernEmpty>,
      'modern',
    );

    expect(screen.getByRole('status')).toHaveAttribute('data-has-footer', 'true');
    expect(container.querySelector('[data-part="footer"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Plan' })).toBeInTheDocument();
  });

  it('falls back to the localized default description when none is given', () => {
    renderWithEngine(<ModernEmpty />, 'modern');

    const description = document.querySelector('[data-part="description"]');
    // i18n key components:empty.description -- never an empty guidance box.
    expect(description?.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('renders a custom ReactNode image into the visual slot', () => {
    const { container } = renderWithEngine(
      <ModernEmpty image={<span data-testid="custom-visual">🗂</span>} description="Archived" />,
      'modern',
    );

    expect(screen.getByRole('status')).toHaveAttribute('data-image', 'custom');
    expect(screen.getByTestId('custom-visual')).toBeInTheDocument();
    expect(container.querySelector('[data-part="image"]')).not.toBeNull();
  });

  it('omits the visual entirely when image is false (bounded height holds)', () => {
    const { container } = renderWithEngine(
      <ModernEmpty image={false} description="Compact" />,
      'modern',
    );

    expect(screen.getByRole('status')).toHaveAttribute('data-image', 'none');
    expect(container.querySelector('[data-part="image"]')).toBeNull();
    expect(container.querySelector('[data-part="description"]')).not.toBeNull();
  });
});
