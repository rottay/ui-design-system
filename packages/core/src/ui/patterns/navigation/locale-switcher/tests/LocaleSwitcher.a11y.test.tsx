import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import ModernLocaleSwitcher from '../engines/modern';
import { DEFAULT_LOCALES } from '../runtime/default-locales';

const MODERN_SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/locale-switcher.css',
  ),
  'utf8',
);

// The trigger keeps DOM focus while the panel is open, so the APG combobox
// wiring (aria-controls + aria-activedescendant) has to live on the trigger:
// on the panel it is inert and the arrowed option is never announced.
describe('modern locale switcher -- virtual focus is announced from the trigger', () => {
  it('points the focused trigger at a real option after ArrowDown', () => {
    renderWithEngine(
      <ModernLocaleSwitcher locale="en" onChange={vi.fn()} locales={DEFAULT_LOCALES} />,
      'modern',
    );

    const trigger = screen.getByTestId('locale-switcher-trigger');
    expect(trigger.getAttribute('role')).toBe('combobox');

    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const listbox = screen.getByTestId('locale-switcher-menu');
    expect(listbox.id).not.toBe('');
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id);

    const activeId = trigger.getAttribute('aria-activedescendant') ?? '';
    expect(activeId).not.toBe('');

    const activeOption = document.getElementById(activeId);
    expect(activeOption).not.toBeNull();
    expect(activeOption?.getAttribute('role')).toBe('option');
    expect(activeOption?.getAttribute('data-focused')).toBe('true');
  });

  it('scopes option ids per instance so two switchers cannot collide', () => {
    renderWithEngine(
      <>
        <ModernLocaleSwitcher locale="en" onChange={vi.fn()} locales={DEFAULT_LOCALES} />
        <ModernLocaleSwitcher locale="es" onChange={vi.fn()} locales={DEFAULT_LOCALES} />
      </>,
      'modern',
    );

    const triggers = screen.getAllByTestId('locale-switcher-trigger');
    for (const trigger of triggers) fireEvent.click(trigger);

    const listboxes = screen.getAllByTestId('locale-switcher-menu');
    expect(listboxes).toHaveLength(2);
    expect(listboxes[0].id).not.toBe(listboxes[1].id);

    const optionIds = screen.getAllByRole('option').map((option) => option.id);
    expect(new Set(optionIds).size).toBe(optionIds.length);
  });
});

describe('modern locale switcher -- loading is non-operable and announced', () => {
  it('replaces the trigger with a skeleton, announces busy, and exposes no control', () => {
    const onChange = vi.fn();
    const { container } = renderWithEngine(
      <ModernLocaleSwitcher locale="en" onChange={onChange} locales={DEFAULT_LOCALES} loading />,
      'modern',
    );

    const root = container.querySelector("[data-part='root']");
    expect(root?.getAttribute('aria-busy')).toBe('true');

    expect(screen.queryByTestId('locale-switcher-trigger')).toBeNull();
    expect(root?.querySelector('.rottay-skeleton-button')).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();

    fireEvent.keyDown(root as HTMLElement, { key: 'ArrowDown' });
    expect(screen.queryByTestId('locale-switcher-menu')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('collapses an already-open panel when loading starts', () => {
    const onChange = vi.fn();
    const { rerender } = renderWithEngine(
      <ModernLocaleSwitcher locale="en" onChange={onChange} locales={DEFAULT_LOCALES} />,
      'modern',
    );

    fireEvent.click(screen.getByTestId('locale-switcher-trigger'));
    expect(screen.getByTestId('locale-switcher-menu')).toBeInTheDocument();

    rerender(
      <ModernLocaleSwitcher locale="en" onChange={onChange} locales={DEFAULT_LOCALES} loading />,
    );

    expect(screen.queryByTestId('locale-switcher-menu')).toBeNull();
    expect(screen.queryByTestId('locale-switcher-trigger')).toBeNull();
  });
});

describe('modern locale switcher -- coarse-pointer touch floor', () => {
  it('floors option rows at the governed touch-target channel', () => {
    const coarseBlock = MODERN_SKIN.slice(MODERN_SKIN.indexOf('@media (hover: none), (pointer: coarse)'));
    expect(coarseBlock).not.toBe('');
    expect(coarseBlock).toContain("[data-part='option']");
    expect(coarseBlock).toContain('min-block-size: var(--ds-touch-target-min, 44px);');
  });

  it('does not resurrect the menu when loading clears', () => {
    const onChange = vi.fn();
    const { rerender } = renderWithEngine(<ModernLocaleSwitcher locale="en" onChange={onChange} />, 'modern');

    fireEvent.click(screen.getByTestId('locale-switcher-trigger'));
    expect(screen.getByTestId('locale-switcher-menu')).toBeInTheDocument();

    rerender(<ModernLocaleSwitcher locale="en" onChange={onChange} loading />);
    expect(screen.queryByTestId('locale-switcher-menu')).toBeNull();

    rerender(<ModernLocaleSwitcher locale="en" onChange={onChange} />);
    expect(screen.queryByTestId('locale-switcher-menu')).toBeNull();
    expect(screen.getByTestId('locale-switcher-trigger').getAttribute('aria-expanded')).toBe('false');
  });
});

describe('modern locale switcher -- the compact trigger always carries text', () => {
  it('falls back to the locale code when the label is hidden and the locale has no flag', () => {
    renderWithEngine(
      <ModernLocaleSwitcher
        locale="pt"
        onChange={vi.fn()}
        size="sm"
        locales={[
          { code: 'pt', label: 'Portugues' },
          { code: 'en', label: 'English' },
        ]}
      />,
      'modern',
    );

    const trigger = screen.getByTestId('locale-switcher-trigger');

    // Before: `showLabel` defaulted to false at size sm and `flag` is optional
    // on LocaleDef, so this trigger rendered a bare decorative chevron with no
    // text carrier at all.
    const code = trigger.querySelector("[data-part='trigger-code']");
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe('pt');

    // The new part is not an unstyled orphan: the skin owns its typography.
    expect(MODERN_SKIN).toContain("[data-part='trigger-code']");
  });
});
