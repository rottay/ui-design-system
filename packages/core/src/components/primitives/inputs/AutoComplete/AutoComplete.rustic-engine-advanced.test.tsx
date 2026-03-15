import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import RusticAutoComplete from './engines/rustic';

const OPTIONS = [
  { value: 'Alpha', label: 'Alpha result' },
  { value: 'Bravo', label: 'Bravo result', disabled: true },
  { value: 'Charlie', label: 'Charlie result' },
];

describe('AutoComplete rustic advanced engine coverage', () => {
  it('covers filtering, keyboard selection, allowClear, custom not-found content, and click-outside closing', async () => {
    const handleChange = vi.fn();
    const handleSearch = vi.fn();
    const handleSelect = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <div>
        <button type="button">Outside</button>
        <RusticAutoComplete
          options={OPTIONS}
          allowClear
          defaultValue="Al"
          onChange={handleChange}
          onSearch={handleSearch}
          onSelect={handleSelect}
          onDropdownVisibleChange={handleOpenChange}
          filterOption={(value, option) => option.value.toLowerCase().includes(value.toLowerCase())}
          notFoundContent="Nothing here"
        />
      </div>
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'zz' } });

    expect(handleSearch).toHaveBeenCalledWith('zz');
    expect(await screen.findByText('Nothing here')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByLabelText('Clear'));
    expect(handleChange).toHaveBeenCalledWith('');

    fireEvent.focus(input);
    fireEvent.mouseDown(screen.getByText('Outside'));

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(handleOpenChange).toHaveBeenCalled();
  });

  it('covers controlled visibility, disabled clear guards, arrow-up wrapping, and escape closing', async () => {
    const handleOpenChange = vi.fn();
    const handleSelect = vi.fn();

    const { rerender } = render(
      <RusticAutoComplete
        options={OPTIONS}
        value="ch"
        open
        allowClear
        onSelect={handleSelect}
        onDropdownVisibleChange={handleOpenChange}
        filterOption={true}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalledWith('Charlie', expect.objectContaining({ value: 'Charlie' }));
    });

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <RusticAutoComplete options={OPTIONS} value="fixed" allowClear disabled />
    );

    expect(screen.queryByLabelText('Clear')).toBeNull();
  });
});
