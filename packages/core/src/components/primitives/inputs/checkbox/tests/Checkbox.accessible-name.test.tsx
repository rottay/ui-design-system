import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernCheckbox from '../engines/modern';

describe('Modern Checkbox accessible name', () => {
  it('keeps the description out of the accessible name and exposes it as a description', () => {
    render(
      <ModernCheckbox
        label="Marketing emails"
        description="We send at most one message per week."
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Marketing emails' });
    expect(checkbox).toHaveAccessibleName('Marketing emails');
    expect(checkbox).toHaveAccessibleDescription(
      'We send at most one message per week.',
    );
  });

  it('leaves an explicit aria-label authoritative', () => {
    render(
      <ModernCheckbox
        label="Marketing emails"
        description="We send at most one message per week."
        aria-label="Subscribe to marketing emails"
      />,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Subscribe to marketing emails' }),
    ).toBeInTheDocument();
  });
});
