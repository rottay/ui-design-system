import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Mentions as RusticMentions } from '../engines/rustic';

const OPTIONS = [
  { value: 'alice', label: 'Alice' },
  { value: 'archer', label: 'Archer', disabled: true },
  { value: 'backend', label: 'Backend' },
];

describe('Mentions rustic advanced coverage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('covers prefix detection, filtering, keyboard navigation, selection, and click-outside closing', async () => {
    const handleChange = vi.fn();
    const handleSearch = vi.fn();
    const handleSelect = vi.fn();

    render(
      <div>
        <button type="button">Outside</button>
        <RusticMentions
          options={OPTIONS}
          prefix={['@', '#']}
          split=" "
          rows={4}
          onChange={handleChange}
          onSearch={handleSearch}
          onSelect={handleSelect}
          filterOption={(input, option) => option.value.startsWith(input.toLowerCase())}
          placement="top"
        />
      </div>
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    Object.defineProperty(input, 'selectionStart', { configurable: true, writable: true, value: 9 });
    fireEvent.change(input, { target: { value: 'Hello @al' } });

    expect(handleChange).toHaveBeenCalledWith('Hello @al');
    expect(handleSearch).toHaveBeenCalledWith('al', '@');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'alice' }), '@');
      expect(handleChange).toHaveBeenCalledWith('Hello @alice ');
    });

    Object.defineProperty(input, 'selectionStart', { configurable: true, writable: true, value: 7 });
    fireEvent.change(input, { target: { value: 'Tag #be' } });
    expect(handleSearch).toHaveBeenCalledWith('be', '#');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText('Outside'));
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('covers escape, disabled styling, not-found rendering, and readonly guards', async () => {
    const { rerender } = render(
      <RusticMentions
        options={OPTIONS}
        defaultValue="@z"
        status="warning"
        notFoundContent="Nothing matched"
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    Object.defineProperty(input, 'selectionStart', { configurable: true, writable: true, value: 4 });
    fireEvent.change(input, { target: { value: '@zzz' } });

    expect(await screen.findByText('Nothing matched')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    rerender(
      <RusticMentions
        options={OPTIONS}
        defaultValue="@zzz"
        status="warning"
        notFoundContent="Nothing matched"
        disabled
        readOnly
      />
    );

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('readonly');
  }, 10000);
});
