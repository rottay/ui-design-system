import React, { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

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
