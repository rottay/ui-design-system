import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ModernToggle from '../engines/modern';

describe('Modern Toggle accessible name', () => {
  it('holds the accessible name stable while the state label swaps', async () => {
    const user = userEvent.setup();

    render(
      <ModernToggle label="Profile visibility" checkedLabel="On" uncheckedLabel="Off" />,
    );

    const toggle = screen.getByRole('switch', { name: 'Profile visibility' });
    expect(toggle).toHaveAccessibleName('Profile visibility');

    await user.click(toggle);

    expect(toggle).toBeChecked();
    expect(toggle).toHaveAccessibleName('Profile visibility');
  });

  it('keeps the description out of the accessible name and describes with it', () => {
    render(
      <ModernToggle
        label="Profile visibility"
        description="Visible to recruiters when online."
      />,
    );

    const toggle = screen.getByRole('switch', { name: 'Profile visibility' });
    expect(toggle).toHaveAccessibleName('Profile visibility');
    expect(toggle).toHaveAccessibleDescription('Visible to recruiters when online.');
  });
});

describe('Toggle explicit name precedence', () => {
  it('keeps a caller aria-label authoritative over the derived label', () => {
    render(
      <ModernToggle
        label="Profile visibility"
        description="Anyone with the link can view."
        checkedLabel="On"
        uncheckedLabel="Off"
        aria-label="Visibility"
      />
    );

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAccessibleName('Visibility');
    expect(toggle).not.toHaveAttribute('aria-labelledby');
  });

  it('keeps a caller aria-labelledby authoritative', () => {
    render(
      <>
        <span id="ext-name">External name</span>
        <ModernToggle
          label="Profile visibility"
          description="Anyone with the link can view."
          aria-labelledby="ext-name"
        />
      </>
    );

    expect(screen.getByRole('switch')).toHaveAccessibleName('External name');
  });
});
