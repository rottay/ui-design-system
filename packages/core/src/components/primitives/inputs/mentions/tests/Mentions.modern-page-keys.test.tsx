import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernMentions from '../engines/modern';

const FIFTEEN = Array.from({ length: 15 }, (_, index) => ({ value: `user${index}`, label: `User ${index}` }));

const activeOptionText = (textarea: HTMLElement): string | null => {
  const id = textarea.getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent ?? null : null;
};

describe('Mentions modern page keys', () => {
  it('moves the active suggestion ten rows with PageDown and back with PageUp', () => {
    render(<ModernMentions options={FIFTEEN} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '@' } });

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(15);
    expect(textarea.getAttribute('aria-activedescendant')).toBe(options[0]!.id);

    fireEvent.keyDown(textarea, { key: 'PageDown' });
    expect(textarea.getAttribute('aria-activedescendant')).toBe(options[10]!.id);
    expect(activeOptionText(textarea)).toContain('User 10');

    fireEvent.keyDown(textarea, { key: 'PageUp' });
    expect(textarea.getAttribute('aria-activedescendant')).toBe(options[0]!.id);
  });
});
