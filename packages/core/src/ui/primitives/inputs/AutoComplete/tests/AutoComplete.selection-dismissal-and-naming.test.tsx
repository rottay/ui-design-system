/**
 * Selection dismissal and accessible naming for the modern AutoComplete.
 *
 * The panel opens on input focus, and committing an option restores focus to
 * the input -- so the restore re-fired the open, and picking a suggestion with
 * the pointer left the list standing open over the value it had just written.
 * Separately the input's accessible name was generated unconditionally, which
 * outranks a visible `<label htmlFor>`; the contract exposed no `id` for that
 * label to aim at either, so the documented FormField escape hatch could not
 * work.
 *
 * @module AutoComplete/tests
 */

import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernAutoComplete from '../engines/modern';

const OPTIONS = [{ value: 'alpha' }, { value: 'bravo' }];

describe('AutoComplete modern selection dismissal + naming', () => {
  /** The browser focuses an option button on mousedown; jsdom does not, so the
   *  pointer path is only faithful when the test moves focus the same way. */
  const commitByPointer = (name: string) => {
    const option = screen.getByRole('option', { name });
    // Real focus must also flush React state, or the panel never renders.
    act(() => { option.focus(); });
    fireEvent.click(option);
  };
  const focusInput = (input: HTMLInputElement) => act(() => { input.focus(); });

  it('dismisses the panel when the pointer commits a suggestion', () => {
    const onSelect = vi.fn();
    render(<ModernAutoComplete options={OPTIONS} onSelect={onSelect} />);

    const input = screen.getByRole('combobox') as HTMLInputElement;
    focusInput(input);
    commitByPointer('bravo');

    expect(onSelect).toHaveBeenCalledWith('bravo', OPTIONS[1]);
    expect(screen.queryByRole('listbox')).toBeNull();
    // The restore still happens -- the click target unmounted with the panel.
    expect(document.activeElement).toBe(input);
  });

  it('still opens on a genuine focus after a commit', () => {
    render(<ModernAutoComplete options={OPTIONS} />);

    const input = screen.getByRole('combobox') as HTMLInputElement;
    focusInput(input);
    commitByPointer('alpha');
    expect(screen.queryByRole('listbox')).toBeNull();

    act(() => { input.blur(); });
    focusInput(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('dismisses on the keyboard commit too', () => {
    render(<ModernAutoComplete options={OPTIONS} />);

    const input = screen.getByRole('combobox') as HTMLInputElement;
    focusInput(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(input);
  });

  it('lets a visible label name the input instead of the generated floor', () => {
    render(
      <>
        <label htmlFor="workspace">Workspace</label>
        <ModernAutoComplete id="workspace" options={OPTIONS} placeholder="Type a name" />
      </>
    );

    const input = screen.getByRole('combobox');
    expect(document.getElementById('workspace')).toBe(input);
    expect(input).toHaveAccessibleName('Workspace');
  });

  it('honours an explicit aria-label over the placeholder floor', () => {
    render(<ModernAutoComplete aria-label="Search projects" placeholder="Type a name" options={OPTIONS} />);
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Search projects');
  });

  it('still names a bare control so it never ships unlabelled', () => {
    render(<ModernAutoComplete options={OPTIONS} />);
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Autocomplete');
  });

  it('carries a consumer description through to the input', () => {
    render(
      <>
        <ModernAutoComplete aria-label="Project" aria-describedby="hint" options={OPTIONS} />
        <span id="hint">Start typing to search</span>
      </>
    );
    expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Start typing to search');
  });
});
