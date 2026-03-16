import React, { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithEngine } from '../../../../testing/helpers/engine-test-utils';

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Bravo', value: 'bravo', disabled: true },
  { label: 'Charlie', value: 'charlie' },
] as const;

describe('Select rustic engine', () => {
  it('covers searchable multi-select keyboard navigation, clear, and disabled-option branches', async () => {
    const { Select } = await import('.');
    const handleChange = vi.fn();
    const handleSearch = vi.fn();
    const handleClear = vi.fn();

    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = vi.fn();

    try {
      const { container } = renderWithEngine(
        <Suspense fallback={<div>Loading…</div>}>
          <Select
            engine="rustic"
            options={OPTIONS as any}
            searchable
            multiple
            clearable
            placeholder="Pick records"
            onChange={handleChange}
            onSearch={handleSearch}
            onClear={handleClear}
          />
        </Suspense>,
        'rustic'
      );

      const combobox = await screen.findByRole('combobox');
      fireEvent.click(combobox);

      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement | null;
      expect(searchInput).toBeTruthy();

      fireEvent.change(searchInput!, { target: { value: 'a' } });
      expect(handleSearch).toHaveBeenCalledWith('a');

      fireEvent.keyDown(searchInput!, { key: 'End' });
      fireEvent.keyDown(searchInput!, { key: 'Home' });
      fireEvent.keyDown(searchInput!, { key: 'ArrowDown' });
      fireEvent.click(screen.getByText('Alpha'));

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });

      const callCountAfterFirstSelect = handleChange.mock.calls.length;
      fireEvent.click(screen.getByText('Bravo'));
      expect(handleChange).toHaveBeenCalledTimes(callCountAfterFirstSelect);

      fireEvent.keyDown(searchInput!, { key: 'Escape' });
      fireEvent.click(combobox);
      fireEvent.click(screen.getByText('Charlie'));
      await waitFor(() => {
        expect(handleChange.mock.calls.length).toBeGreaterThan(callCountAfterFirstSelect);
      });

      const clearButton = container.querySelector('.rottay-select__clear') as HTMLButtonElement | null;
      expect(clearButton).toBeTruthy();
      fireEvent.click(clearButton!);
      expect(handleClear).toHaveBeenCalledTimes(1);
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }
  });
});
