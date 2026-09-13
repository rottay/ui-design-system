import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernInput from '../engines/modern';
import { InputSearch, InputTextArea } from '../compound';

describe('input family Enter intent', () => {
  it('commits a plain Enter and ignores the keydown Safari stamps with keyCode 229', () => {
    const onPressEnter = vi.fn();
    render(<ModernInput aria-label="Name" onPressEnter={onPressEnter} />);
    const field = screen.getByRole('textbox', { name: 'Name' });
    fireEvent.keyDown(field, { key: 'Enter', keyCode: 229 });
    expect(onPressEnter).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onPressEnter).toHaveBeenCalledTimes(1);
  });

  it('never searches while a candidate is composing', async () => {
    const onSearch = vi.fn();
    render(<InputSearch engine="modern" aria-label="Search" defaultValue="東京" onSearch={onSearch} />);
    const field = await screen.findByRole('textbox', { name: 'Search' });
    fireEvent.keyDown(field, { key: 'Enter', isComposing: true });
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('keeps Shift+Enter for a new line in the text-area compound', async () => {
    const onPressEnter = vi.fn();
    render(<InputTextArea engine="modern" aria-label="Notes" onPressEnter={onPressEnter} />);
    const field = await screen.findByRole('textbox', { name: 'Notes' });
    fireEvent.keyDown(field, { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(field, { key: 'Enter', isComposing: true });
    expect(onPressEnter).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onPressEnter).toHaveBeenCalledTimes(1);
  });
});
