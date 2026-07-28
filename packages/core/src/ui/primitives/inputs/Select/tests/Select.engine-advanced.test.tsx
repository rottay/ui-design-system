import React, { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Bravo', value: 'bravo', disabled: true },
  { label: 'Charlie', value: 'charlie' },
  { label: 'Delta', value: 'delta' },
] as const;

const OPTION_GROUPS = [
  {
    label: 'Team A',
    options: [
      { label: 'Alpha', value: 'alpha' },
      { label: 'Bravo', value: 'bravo' },
    ],
  },
  {
    label: 'Team B',
    options: [
      { label: 'Charlie', value: 'charlie' },
      { label: 'Delta', value: 'delta' },
      { label: 'Echo', value: 'echo' },
      { label: 'Foxtrot', value: 'foxtrot' },
    ],
  },
] as const;

describe('Select advanced engine coverage', () => {
  it('covers the modern native select branch with flushed styling, loading, aliases, and placeholder handling', async () => {
    const { Select } = await import('..');
    const handleChange = vi.fn();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    const { container } = renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="modern"
          options={OPTIONS as any}
          placeholder="Choose record"
          variant="flushed"
          size="lg"
          status="warning"
          loading
          allowClear
          showSearch={false}
          id="modern-native-select"
          name="record"
          required
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Suspense>,
      'modern'
    );

    const select = (await screen.findByRole('combobox')) as HTMLSelectElement;
    expect(select).toBeTruthy();
    // R2+R3 (BATCH C): per-size geometry and typography are the modern skin's,
    // keyed on `data-size` — the trigger carries NO inline paint or geometry.
    expect(select.style.height).toBe('');
    expect(select.style.fontSize).toBe('');
    expect(select.style.paddingLeft).toBe('');
    expect(select.getAttribute('data-variant')).toBe('flushed');
    // `data-size` rides the shell root (single owner of the size contract).
    expect(container.querySelector("[data-part='root']")?.getAttribute('data-size')).toBe('lg');
    // The warning border color is applied by the modern Select skin keyed on
    // `data-status`; the native select carries the attribute, not inline paint.
    expect(select.getAttribute('data-status')).toBe('warning');
    expect(select?.querySelector('option[value=""]')).toHaveTextContent('Choose record');
    expect(container.querySelector('.rottay-select__loading-indicator')).toBeTruthy();

    fireEvent.focus(select!);
    fireEvent.blur(select!);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);

    fireEvent.change(select!, { target: { value: 'charlie' } });

    expect(handleChange).toHaveBeenCalledWith(
      'charlie',
      expect.objectContaining({ value: 'charlie', label: 'Charlie' })
    );
  });

  it('covers the modern custom dropdown branch with filtering, no-results, tag collapsing, clearing, and disabled/loading guards', async () => {
    const { Select } = await import('..');
    const handleChange = vi.fn();
    const handleSearch = vi.fn();
    const handleClear = vi.fn();
    const filterOption = vi.fn((input: string, option?: { label?: React.ReactNode }) => {
      return String(option?.label ?? '').toLowerCase().includes(input.toLowerCase());
    });

    const { container } = renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="modern"
          options={OPTIONS as any}
          searchable
          multiple
          clearable
          maxTagCount={1}
          filterOption={filterOption}
          placeholder="Search records"
          onChange={handleChange}
          onSearch={handleSearch}
          onClear={handleClear}
        />
      </Suspense>,
      'modern'
    );

    // The DesignSystemProvider stamps locale/tenant attributes on
    // documentElement from passive effects that resolve after render's act
    // scope; the custom dropdown's portal-scope observer re-syncs on those
    // mutations. Drain that boot inside act so the re-sync does not land as an
    // unwrapped update (same drain idiom as ListToolbar.behavior).
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const trigger = await screen.findByText('Search records');
    expect(trigger).toBeTruthy();

    fireEvent.click(trigger!);
    const searchInput = await screen.findByPlaceholderText('Search...');

    fireEvent.change(searchInput, { target: { value: 'zzz' } });
    expect(handleSearch).toHaveBeenCalledWith('zzz');
    expect(filterOption).toHaveBeenCalled();
    expect(await screen.findByText(/no options/i)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'a' } });
    fireEvent.click(screen.getByText('Alpha'));
    fireEvent.click(screen.getByText('Charlie'));

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: /^clear selection$/i }));
    await waitFor(() => {
      expect(handleChange.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    const lockedRender = renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="modern"
          options={OPTIONS as any}
          searchable
          multiple
          disabled
          loading
          placeholder="Locked records"
        />
      </Suspense>,
      'modern'
    );

    const lockedTrigger = within(lockedRender.container).getByText('Locked records');
    fireEvent.click(lockedTrigger);
    expect(within(lockedRender.container).queryByPlaceholderText('Locked records')).not.toBeInTheDocument();
    lockedRender.unmount();

    // The locked render mounts a second DesignSystemProvider that re-stamps
    // documentElement; the first select's portal-scope observer re-syncs on
    // those mutations. Drain the delivery inside act (same idiom as above).
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  it('covers rustic single-select branches for hidden inputs, filled styling, maxTagCount, and loading/disabled guards', async () => {
    const { Select } = await import('..');
    const handleChange = vi.fn();

    const { container, rerender } = renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="rustic"
          options={OPTIONS as any}
          defaultValue={['alpha', 'charlie']}
          multiple
          maxTagCount={1}
          clearable
          variant="filled"
          status="success"
          name="rustic-records"
          onChange={handleChange}
        />
      </Suspense>,
      'rustic'
    );

    await screen.findByRole('combobox');
    const hiddenInput = container.querySelector('input[type="hidden"]') as HTMLInputElement | null;
    expect(hiddenInput?.value).toBe('alpha,charlie');
    expect(container.textContent).toContain('+1');

    const removeAlphaButton = screen.getByRole('button', { name: /remove alpha/i });
    fireEvent.click(removeAlphaButton);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });

    const trigger = screen.getByRole('combobox');
    // The filled background is applied by the rustic Select skin keyed on the
    // root's `--filled` variant class; the trigger no longer carries inline paint.
    expect(trigger.closest('.rottay-select--filled')).toBeTruthy();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Delta'));

    await waitFor(() => {
      expect(handleChange.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    rerender(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="rustic"
          options={OPTIONS as any}
          disabled
          loading
          placeholder="Unavailable"
        />
      </Suspense>
    );

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
  });

  it('covers the modern grouped + virtual branch with token separators, keyboard navigation, escape, and virtual scrolling', async () => {
    const { Select } = await import('..');
    const handleChange = vi.fn();
    const handleSearch = vi.fn();

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="modern"
          optionGroups={OPTION_GROUPS as any}
          searchable
          multiple
          tokenSeparators={[',']}
          virtual={{ itemHeight: 24, containerHeight: 48 }}
          placeholder="Grouped options"
          onChange={handleChange}
          onSearch={handleSearch}
        />
      </Suspense>,
      'modern'
    );

    const trigger = await screen.findByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(await screen.findByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();

    const listbox = screen.getByRole('listbox');
    fireEvent.scroll(listbox, { target: { scrollTop: 48 } });

    fireEvent.keyDown(trigger, { key: 'End' });
    fireEvent.keyDown(trigger, { key: 'Home' });

    const searchInput = await screen.findByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Bravo,' } });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        ['bravo'],
        expect.arrayContaining([expect.objectContaining({ value: 'bravo' })])
      );
    });
    expect(handleSearch).toHaveBeenLastCalledWith('');
    expect(screen.getAllByText('Bravo').length).toBeGreaterThan(0);

    fireEvent.keyDown(trigger, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('covers the rustic grouped + virtual branch with token separators, backspace removal, and escape close', async () => {
    const { Select } = await import('..');
    const handleChange = vi.fn();
    const handleSearch = vi.fn();
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="rustic"
          optionGroups={OPTION_GROUPS as any}
          searchable
          multiple
          tokenSeparators={[',']}
          virtual={{ itemHeight: 24, containerHeight: 48 }}
          placeholder="Rustic grouped"
          onChange={handleChange}
          onSearch={handleSearch}
        />
      </Suspense>,
      'rustic'
    );

    const trigger = await screen.findByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(await screen.findByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();

    const listbox = screen.getByRole('listbox');
    fireEvent.scroll(listbox, { target: { scrollTop: 48 } });

    fireEvent.keyDown(trigger, { key: 'End' });
    fireEvent.keyDown(trigger, { key: 'Home' });

    const searchInput = await screen.findByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'Echo,' } });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        ['echo'],
        expect.arrayContaining([expect.objectContaining({ value: 'echo' })])
      );
    });
    expect(handleSearch).toHaveBeenLastCalledWith('');
    expect(screen.getByText('Echo')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Backspace' });
    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith([], []);
    });

    fireEvent.keyDown(trigger, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: originalScrollIntoView,
    });
  });
});
