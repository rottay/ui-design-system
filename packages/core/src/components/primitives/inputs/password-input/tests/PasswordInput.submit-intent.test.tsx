import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPasswordInput from '../engines/modern';

describe('PasswordInput Enter intent', () => {
  it('commits a plain Enter only when no IME is composing', () => {
    const onPressEnter = vi.fn();
    render(<ModernPasswordInput aria-label="Password" onPressEnter={onPressEnter} />);
    const field = screen.getByLabelText('Password');
    fireEvent.keyDown(field, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(field, { key: 'Enter', keyCode: 229 });
    expect(onPressEnter).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onPressEnter).toHaveBeenCalledTimes(1);
  });
});
