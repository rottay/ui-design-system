import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSteps from '../engines/modern';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const items = [
  { title: 'Draft', description: 'Write content' },
  { title: 'Review', subTitle: 'Optional' },
  { title: 'Publish' },
];

// A clickable step is reached as a <button>; aria-current on the ancestor <li>
// never reaches it, so the focused control announces no current-step state.
describe('Modern Steps current-step state on the interactive trigger', () => {
  it('puts aria-current="step" on the clickable trigger', () => {
    renderWithEngine(<ModernSteps current={1} items={items} onChange={vi.fn()} />, 'modern');

    const review = screen.getByRole('button', { name: /Review/ });
    expect(review).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: /Draft/ })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: /Publish/ })).not.toHaveAttribute('aria-current');
  });

  it('does not duplicate the state on the listitem wrapper when clickable', () => {
    renderWithEngine(<ModernSteps current={1} items={items} onChange={vi.fn()} />, 'modern');

    expect(screen.getByRole('button', { name: /Review/ }).closest('li')).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('keeps the state on the listitem for a non-interactive track', () => {
    renderWithEngine(<ModernSteps current={1} items={items} />, 'modern');

    expect(screen.getByText('Review').closest('li')).toHaveAttribute('aria-current', 'step');
  });
});
