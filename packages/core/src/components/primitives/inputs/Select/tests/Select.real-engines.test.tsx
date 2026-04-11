import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ClassicSelect from '../engines/classic';
import ModernSelect from '../engines/modern';
import RusticSelect from '../engines/rustic';
import { SelectOption } from '../compound/Option';
import { SelectOptGroup } from '../compound/OptGroup';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta', disabled: true },
  { label: 'Gamma', value: 'gamma' },
] as const;

describe('Select real engine coverage', () => {
  it('covers modern simple select and advanced dropdown flows', async () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();

    const { rerender, container } = renderWithEngine(
      <ModernSelect
        options={OPTIONS as any}
        defaultValue="alpha"
        status="success"
        variant="filled"
        onChange={handleChange}
      />,
      'modern'
    );

    const nativeSelect = container.querySelector('select') as HTMLSelectElement | null;
    expect(nativeSelect).toBeTruthy();
    fireEvent.change(nativeSelect!, { target: { value: 'gamma' } });
    expect(handleChange).toHaveBeenCalledWith('gamma', expect.objectContaining({ value: 'gamma' }));

    rerender(
      <ModernSelect
        options={OPTIONS as any}
        searchable
        multiple
        clearable
        onChange={handleChange}
        onClear={handleClear}
      />,
      'modern'
    );

    fireEvent.click(container.querySelector('.select.w-full') as HTMLDivElement);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    fireEvent.click(screen.getByText('Alpha'));

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });

    fireEvent.click(container.querySelector('.select.w-full') as HTMLDivElement);
    fireEvent.click(screen.getByText('Gamma'));
    fireEvent.click(container.querySelector('.btn.btn-ghost.btn-xs.btn-circle') as HTMLButtonElement);

    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('covers classic select render and option mapping branches', async () => {
    const handleChange = vi.fn();

    renderWithEngine(
      <ClassicSelect
        options={[
          { label: 'Alpha', value: 'alpha', icon: <span data-testid="icon-alpha">*</span> },
          { label: 'Beta', value: 'beta' },
        ]}
        showSearch
        allowClear
        status="warning"
        size="xl"
        onChange={handleChange}
        placeholder="Pick a value"
      />,
      'classic'
    );

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    const option = await screen.findByText('Alpha');
    fireEvent.click(option);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('alpha', expect.objectContaining({ value: 'alpha' }));
    });
  });

  it('covers rustic engine through the public component and backspace removal', async () => {
    const handleChange = vi.fn();

    const { container } = renderWithEngine(
      <RusticSelect
        options={OPTIONS as any}
        searchable
        multiple
        defaultValue={['alpha', 'gamma']}
        onChange={handleChange}
      />,
      'rustic'
    );

    fireEvent.click(screen.getByRole('combobox'));
    const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    fireEvent.keyDown(searchInput, { key: 'Backspace' });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(['alpha'], [expect.objectContaining({ value: 'alpha' })]);
    });
  });

  it('covers option and optgroup compounds directly', () => {
    const { rerender } = render(
      <SelectOption value="one" icon={<span data-testid="opt-icon">i</span>}>
        One
      </SelectOption>
    );

    expect(screen.getByRole('option')).toHaveAttribute('data-value', 'one');
    expect(screen.getByTestId('opt-icon')).toBeInTheDocument();

    rerender(
      <SelectOptGroup label="Cluster" disabled>
        <SelectOption value="two">Two</SelectOption>
      </SelectOptGroup>
    );

    expect(screen.getByRole('group', { name: 'Cluster' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('option')).toHaveAttribute('aria-disabled', 'true');
  });
});
