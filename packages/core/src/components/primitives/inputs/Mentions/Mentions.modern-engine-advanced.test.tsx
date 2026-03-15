import React, { createRef } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernMentions from './engines/modern';

const OPTIONS = [
  { value: 'alice', label: 'Alice' },
  { value: 'archer', label: 'Archer', disabled: true },
  { value: 'backend', label: 'Backend' },
];

describe('Mentions modern advanced coverage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('covers custom filtering, keyboard selection, disabled options, popup placement, and outside closing', async () => {
    const handleChange = vi.fn();
    const handleSearch = vi.fn();
    const handleSelect = vi.fn();

    render(
      <div>
        <button type="button">Outside</button>
        <ModernMentions
          options={OPTIONS}
          prefix={['@', '#']}
          split=" "
          placement="top"
          popupClassName="mentions-popup"
          onChange={handleChange}
          onSearch={handleSearch}
          onSelect={handleSelect}
          filterOption={(input, option) => option.value.startsWith(input.toLowerCase())}
        />
      </div>
    );

    const input = screen.getByRole('textbox');
    Object.defineProperty(input, 'selectionStart', { configurable: true, writable: true, value: 8 });
    fireEvent.change(input, { target: { value: 'Hello @a' } });

    expect(handleChange).toHaveBeenCalledWith('Hello @a');
    expect(handleSearch).toHaveBeenCalledWith('a', '@');

    const list = await screen.findByRole('listbox');
    expect(list.className).toContain('bottom-full');
    expect(list.className).toContain('mentions-popup');

    const optionButtons = within(list).getAllByRole('button');
    expect(optionButtons[1]).toBeDisabled();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Tab' });

    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'alice' }), '@');
      expect(handleChange).toHaveBeenCalledWith('Hello @alice ');
    });

    Object.defineProperty(input, 'selectionStart', { configurable: true, writable: true, value: 9 });
    fireEvent.change(input, { target: { value: 'Topic #be' } });
    expect(handleSearch).toHaveBeenCalledWith('be', '#');

    fireEvent.mouseDown(screen.getByText('Outside'));
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('covers not-found rendering, escape handling, filterOption=false, autoSize, and forwarded refs', async () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { rerender } = render(
      <ModernMentions
        ref={ref}
        options={OPTIONS}
        status="warning"
        autoSize={{ minRows: 2, maxRows: 6 }}
        notFoundContent="Nothing matched"
      />
    );

    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('rows', '2');
    expect(input.className).toContain('textarea-warning');
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);

    Object.defineProperty(input, 'selectionStart', { configurable: true, writable: true, value: 4 });
    fireEvent.change(input, { target: { value: '@zzz' } });

    expect(await screen.findByText('Nothing matched')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByText('Nothing matched')).not.toBeInTheDocument();
    });

    rerender(
      <ModernMentions
        options={OPTIONS}
        filterOption={false}
        defaultValue="@zz"
      />
    );

    input = screen.getByRole('textbox');
    Object.defineProperty(input, 'selectionStart', { configurable: true, writable: true, value: 3 });
    fireEvent.change(input, { target: { value: '@zz' } });

    const allButtons = await screen.findAllByRole('button');
    expect(allButtons.map((button) => button.textContent)).toEqual(
      expect.arrayContaining(['Alice', 'Archer', 'Backend'])
    );

    rerender(
      <ModernMentions
        options={OPTIONS}
        filterOption={false}
        defaultValue="@zz"
        readOnly
        disabled
      />
    );

    input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('readonly');
  });
});
