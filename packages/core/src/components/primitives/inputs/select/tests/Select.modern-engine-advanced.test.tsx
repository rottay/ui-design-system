import React, { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Bravo', value: 'bravo' },
  { label: 'Charlie', value: 'charlie' },
] as const;

describe('Select modern engine overlay substrate', () => {
  it('portals the custom listbox with the tenant scope re-stamped', async () => {
    const { Select } = await import('..');

    renderWithEngine(
      <div
        data-ds-root=""
        data-tenant="bithire"
        data-theme="light"
        style={{ '--ds-select-max-height': '200px' } as React.CSSProperties}
      >
        <Suspense fallback={<div>Loading…</div>}>
          <Select engine="modern" options={OPTIONS as any} multiple placeholder="Pick records" />
        </Suspense>
      </div>,
      'modern'
    );

    const trigger = await screen.findByRole('combobox');
    fireEvent.click(trigger);

    const listbox = await screen.findByRole('listbox');
    expect(listbox.closest('[data-rottay-portal]')).not.toBeNull();
    const scope = listbox.closest<HTMLElement>('[data-portal-scope="true"]');
    expect(scope).not.toBeNull();
    expect(scope).toHaveAttribute('data-tenant', 'bithire');
    expect(scope).toHaveAttribute('data-theme', 'light');
    expect(scope?.style.getPropertyValue('--ds-select-max-height')).toBe('200px');
    // The canonical dropdown z band replaces the ad-hoc z-index: 2400.
    const dropdown = document.querySelector('[data-part="dropdown"]') as HTMLElement;
    expect(dropdown.style.zIndex).toContain('--ds-z-index-dropdown');
  });

  it('closes on Escape through the shared layer router', async () => {
    const { Select } = await import('..');

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select engine="modern" options={OPTIONS as any} multiple placeholder="Pick records" />
      </Suspense>,
      'modern'
    );

    const trigger = await screen.findByRole('combobox');
    fireEvent.click(trigger);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('closes on outside pointerdown but not on inside interactions', async () => {
    const { Select } = await import('..');

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select engine="modern" options={OPTIONS as any} multiple placeholder="Pick records" />
      </Suspense>,
      'modern'
    );

    const trigger = await screen.findByRole('combobox');
    fireEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');

    // Pointer down inside the portaled listbox keeps it open.
    fireEvent.pointerDown(listbox);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('still reports selections through onChange (regression)', async () => {
    const { Select } = await import('..');
    const handleChange = vi.fn();

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="modern"
          options={OPTIONS as any}
          forceCustomDropdown
          placeholder="Pick one"
          onChange={handleChange}
        />
      </Suspense>,
      'modern'
    );

    const trigger = await screen.findByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByText('Bravo'));

    expect(handleChange).toHaveBeenCalledWith(
      'bravo',
      expect.objectContaining({ value: 'bravo', label: 'Bravo' })
    );
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});

const tagLabels = (): string[] =>
  Array.from(document.querySelectorAll('[data-part="tag-label"]'), (node) => node.textContent ?? '');

describe('Select modern engine Backspace on an empty filter', () => {
  const ORDERED = [
    { label: 'Alpha', value: 'alpha' },
    { label: 'Bravo', value: 'bravo' },
    { label: 'Charlie', value: 'charlie' },
    { label: 'Delta', value: 'delta' },
  ] as const;

  it('peels the most recently selected value, not the first or last option', async () => {
    const { Select } = await import('..');
    const handleChange = vi.fn();

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="modern"
          options={ORDERED as any}
          multiple
          defaultValue={['delta', 'alpha', 'charlie']}
          onChange={handleChange}
        />
      </Suspense>,
      'modern'
    );

    const trigger = await screen.findByRole('combobox');
    fireEvent.click(trigger);
    await screen.findByRole('listbox');
    expect(tagLabels()).toEqual(['Alpha', 'Charlie', 'Delta']);

    expect(fireEvent.keyDown(trigger, { key: 'Backspace' })).toBe(false);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenLastCalledWith(
      ['delta', 'alpha'],
      [expect.objectContaining({ value: 'alpha' }), expect.objectContaining({ value: 'delta' })]
    );
    await waitFor(() => {
      expect(tagLabels()).toEqual(['Alpha', 'Delta']);
    });

    fireEvent.keyDown(trigger, { key: 'Backspace' });
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenLastCalledWith(['delta'], [expect.objectContaining({ value: 'delta' })]);
    await waitFor(() => {
      expect(tagLabels()).toEqual(['Delta']);
    });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('peels a controlled falsy value from the search input, and a typed filter keeps Backspace for editing', async () => {
    const { Select } = await import('..');
    const handleChange = vi.fn();
    const NUMERIC = [
      { label: 'Five', value: 5 },
      { label: 'Zero', value: 0 },
      { label: 'Seven', value: 7 },
    ];

    function Controlled() {
      const [value, setValue] = React.useState<number[]>([7, 5, 0]);
      return (
        <Select
          engine="modern"
          options={NUMERIC as any}
          multiple
          searchable
          value={value}
          onChange={(next: unknown, selected?: unknown) => {
            handleChange(next, selected);
            setValue(next as number[]);
          }}
        />
      );
    }

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Controlled />
      </Suspense>,
      'modern'
    );

    fireEvent.click(await screen.findByRole('combobox'));
    const input = await waitFor(() => {
      const node = document.querySelector<HTMLInputElement>('[data-part="search-input"]');
      if (!node) throw new Error('search input not mounted');
      return node;
    });
    expect(tagLabels()).toEqual(['Five', 'Zero', 'Seven']);

    expect(fireEvent.keyDown(input, { key: 'Backspace' })).toBe(false);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenLastCalledWith(
      [7, 5],
      [expect.objectContaining({ value: 5 }), expect.objectContaining({ value: 7 })]
    );
    await waitFor(() => {
      expect(tagLabels()).toEqual(['Five', 'Seven']);
    });

    fireEvent.change(input, { target: { value: 'Fi' } });
    expect(fireEvent.keyDown(input, { key: 'Backspace' })).toBe(true);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(tagLabels()).toEqual(['Five', 'Seven']);
  });

  it.each([
    {
      kind: 'a disabled',
      options: [
        { label: 'Alpha', value: 'alpha' },
        { label: 'Charlie', value: 'charlie', disabled: true },
      ],
      defaultValue: ['alpha', 'charlie'],
      tags: ['Alpha', 'Charlie'],
    },
    {
      kind: 'an unknown',
      options: [
        { label: 'Alpha', value: 'alpha' },
        { label: 'Charlie', value: 'charlie' },
      ],
      defaultValue: ['alpha', 'ghost'],
      tags: ['Alpha'],
    },
  ])('does not peel an earlier tag when the last selected value is $kind option', async ({ options, defaultValue, tags }) => {
    const { Select } = await import('..');
    const handleChange = vi.fn();

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="modern"
          options={options as any}
          multiple
          defaultValue={defaultValue}
          onChange={handleChange}
        />
      </Suspense>,
      'modern'
    );

    const trigger = await screen.findByRole('combobox');
    fireEvent.click(trigger);
    await screen.findByRole('listbox');

    expect(fireEvent.keyDown(trigger, { key: 'Backspace' })).toBe(false);
    expect(handleChange).not.toHaveBeenCalled();
    expect(tagLabels()).toEqual(tags);
  });

  it('leaves the selection alone while the list is closed', async () => {
    const { Select } = await import('..');
    const handleChange = vi.fn();

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select
          engine="modern"
          options={ORDERED as any}
          multiple
          defaultValue={['bravo', 'alpha']}
          onChange={handleChange}
        />
      </Suspense>,
      'modern'
    );

    const trigger = await screen.findByRole('combobox');
    expect(fireEvent.keyDown(trigger, { key: 'Backspace' })).toBe(true);
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(tagLabels()).toEqual(['Alpha', 'Bravo']);
  });
});
