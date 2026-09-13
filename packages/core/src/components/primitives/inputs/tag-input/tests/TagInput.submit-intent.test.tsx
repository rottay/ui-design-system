import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import ModernTagInput from '../engines/modern';

describe('TagInput keyboard under an IME', () => {
  it('creates a tag on Enter and on the separator only when no candidate is composing', () => {
    const onChange = vi.fn();
    render(
      <EngineProvider defaultEngine="modern">
        <ModernTagInput aria-label="Cities" value={['Lima']} onChange={onChange} />
      </EngineProvider>,
    );
    const field = screen.getByRole('textbox', { name: 'Cities' });
    fireEvent.change(field, { target: { value: '東京' } });
    fireEvent.keyDown(field, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(field, { key: 'Backspace', keyCode: 229 });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['Lima', '東京']);
  });
});
