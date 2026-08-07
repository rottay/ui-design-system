import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ModernSwitch from '../engines/modern';

// The state label renders inside the wrapping <label>, so without `labelledBy` it becomes
// the input's accessible name and swaps on every toggle.
describe('Modern Switch accessible name', () => {
  it('keeps a caller aria-label authoritative while the state label swaps', async () => {
    const user = userEvent.setup();

    render(
      <ModernSwitch
        aria-label="Profile visibility"
        checkedChildren="On"
        unCheckedChildren="Off"
      />,
    );

    const control = screen.getByRole('switch', { name: 'Profile visibility' });
    expect(control).toHaveAccessibleName('Profile visibility');

    await user.click(control);

    expect(control).toBeChecked();
    expect(control).toHaveAccessibleName('Profile visibility');
  });

  it('never lets the state label become the accessible name', async () => {
    const user = userEvent.setup();

    render(<ModernSwitch checkedChildren="On" unCheckedChildren="Off" />);

    const control = screen.getByRole('switch');
    // "Off" is the VALUE, already carried by aria-checked. Naming the control
    // with it produces a name that mutates on every activation.
    expect(control).not.toHaveAccessibleName('Off');

    await user.click(control);

    expect(control).toBeChecked();
    expect(control).not.toHaveAccessibleName('On');
  });

  it('still paints the state label for sighted users', () => {
    render(
      <ModernSwitch
        aria-label="Profile visibility"
        checkedChildren="On"
        unCheckedChildren="Off"
      />,
    );

    // Excluding it from the name must not delete it from the layout.
    expect(screen.getByText('Off')).toBeInTheDocument();
  });
});
