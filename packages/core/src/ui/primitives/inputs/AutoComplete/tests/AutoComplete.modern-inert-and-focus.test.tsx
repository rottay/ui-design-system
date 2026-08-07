import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ModernAutoComplete from '../engines/modern';

const OPTIONS = [
  { value: 'Alpha', label: 'Alpha result' },
  { value: 'Bravo', label: 'Bravo result' },
];

/**
 * Two contract holes on the option row.
 *
 * `disabled` only ever gated the input and the clear affordance, so a
 * controlled-`open` disabled combobox rendered fully live option buttons and a
 * click committed a value on a disabled control. And selection unmounted the
 * popup under the button the pointer had just focused, stranding focus on
 * `<body>` — the two sibling dismissal paths (Escape, clear) already restore it.
 */
describe('AutoComplete modern option-row inertness and focus return', () => {
  it('keeps options inert while the component is disabled', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <ModernAutoComplete open disabled options={OPTIONS} onChange={onChange} onSelect={onSelect} />
    );

    const option = screen.getByRole('option', { name: /Alpha result/ });
    expect(option).toBeDisabled();

    fireEvent.click(option);
    expect(onChange).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('leaves options operable when only the component is enabled', () => {
    const onSelect = vi.fn();
    render(<ModernAutoComplete open options={OPTIONS} onSelect={onSelect} />);

    const option = screen.getByRole('option', { name: /Alpha result/ });
    expect(option).not.toBeDisabled();
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalled();
  });

  it('returns DOM focus to the input after a pointer selection', () => {
    render(<ModernAutoComplete open options={OPTIONS} />);

    const input = screen.getByRole('combobox');
    const option = screen.getByRole('option', { name: /Bravo result/ });

    // The browser focuses the button on mousedown; the dismissal then unmounts it.
    option.focus();
    fireEvent.click(option);

    expect(document.activeElement).toBe(input);
  });
});
