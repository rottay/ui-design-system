import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import ModernLocaleSwitcher from '../engines/modern';
import { DEFAULT_LOCALES } from '../runtime/default-locales';

const SKIN = (family: string) =>
  readFileSync(join(__dirname, `../../../../../foundation/tokens/css/runtime/engines/modern/skin/${family}/index.css`), 'utf8');
const MODERN_SKIN = SKIN('locale-switcher');
const SELECT_SKIN = SKIN('select');

const listbox = () => document.querySelector<HTMLElement>('[role="listbox"]');

// The trigger keeps DOM focus while the panel is open, so the APG combobox
// wiring (aria-controls + aria-activedescendant) has to live on the trigger:
// on the panel it is inert and the arrowed option is never announced.
describe('modern locale switcher -- virtual focus is announced from the trigger', () => {
  it('points the focused trigger at a real option after ArrowDown', () => {
    renderWithEngine(
      <ModernLocaleSwitcher locale="en" onChange={vi.fn()} locales={DEFAULT_LOCALES} />,
      'modern',
    );

    const trigger = screen.getByRole('combobox', { name: /Language/ });
    expect(trigger).toBe(screen.getByTestId('locale-switcher-trigger'));

    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const panel = screen.getByRole('listbox');
    expect(panel.id).not.toBe('');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);

    const activeId = trigger.getAttribute('aria-activedescendant') ?? '';
    expect(activeId).not.toBe('');

    const activeOption = document.getElementById(activeId);
    expect(activeOption).not.toBeNull();
    expect(activeOption?.getAttribute('role')).toBe('option');
    expect(activeOption?.getAttribute('data-active')).toBe('true');
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
    const ids: string[] = [];
    const optionIds: string[] = [];
    for (const trigger of triggers) {
      fireEvent.click(trigger);
      ids.push(screen.getByRole('listbox').id);
      optionIds.push(...screen.getAllByRole('option').map((option) => option.id));
      fireEvent.keyDown(trigger, { key: 'Escape' });
      expect(listbox()).toBeNull();
    }

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
    expect(optionIds).toHaveLength(DEFAULT_LOCALES.length * 2);
    expect(new Set(optionIds).size).toBe(optionIds.length);
  });
});

describe('modern locale switcher -- loading is non-operable and announced', () => {
  it('replaces the trigger with its anatomy skeleton, announces busy, and exposes no control', () => {
    const onChange = vi.fn();
    const { container } = renderWithEngine(
      <ModernLocaleSwitcher locale="en" onChange={onChange} locales={DEFAULT_LOCALES} loading />,
      'modern',
    );

    const root = container.querySelector("[data-part='root']");
    expect(root?.getAttribute('aria-busy')).toBe('true');

    const skeleton = root?.querySelector('.ds-skeleton-anatomy');
    expect(skeleton).toBeTruthy();
    const source = skeleton?.querySelector("[data-part='source']");
    expect(source?.getAttribute('aria-hidden')).toBe('true');
    expect(source?.hasAttribute('inert')).toBe(true);
    expect(source?.contains(screen.getByTestId('locale-switcher-trigger'))).toBe(true);
    expect(skeleton?.querySelector("[data-part='bone'][data-source-part='trigger']")).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();

    fireEvent.keyDown(root as HTMLElement, { key: 'ArrowDown' });
    expect(listbox()).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('collapses an already-open panel when loading starts', () => {
    const onChange = vi.fn();
    const { rerender } = renderWithEngine(
      <ModernLocaleSwitcher locale="en" onChange={onChange} locales={DEFAULT_LOCALES} />,
      'modern',
    );

    fireEvent.click(screen.getByTestId('locale-switcher-trigger'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    rerender(
      <ModernLocaleSwitcher locale="en" onChange={onChange} locales={DEFAULT_LOCALES} loading />,
    );

    expect(listbox()).toBeNull();
    expect(screen.getByTestId('locale-switcher-trigger').closest("[data-part='source'][inert]")).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
  });
});

describe('modern locale switcher -- coarse-pointer touch floor', () => {
  it('floors the trigger and the option rows through Select, and the frame floor yields to it', () => {
    const coarseBlock = SELECT_SKIN.slice(SELECT_SKIN.indexOf('@media (pointer: coarse)'));
    expect(SELECT_SKIN.indexOf('@media (pointer: coarse)')).toBeGreaterThan(-1);
    expect(coarseBlock).toMatch(/\[data-part='trigger'\] \{\s*min-block-size: max\(/);
    expect(coarseBlock).toMatch(/\[data-part='option'\] \{\s*min-block-size: max\(/);
    expect(coarseBlock).toContain('var(--ds-touch-target-min)');
    // The pattern's own block-size floor sits in :where(), so it never outranks Select's coarse floor.
    const floors = MODERN_SKIN.split('}').filter((rule) => /min-block-size/.test(rule));
    expect(floors.length).toBeGreaterThan(0);
    for (const rule of floors) expect(rule).toMatch(/:where\(/);
  });

  it('does not resurrect the menu when loading clears', () => {
    const onChange = vi.fn();
    const { rerender } = renderWithEngine(<ModernLocaleSwitcher locale="en" onChange={onChange} />, 'modern');

    fireEvent.click(screen.getByTestId('locale-switcher-trigger'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    rerender(<ModernLocaleSwitcher locale="en" onChange={onChange} loading />);
    expect(listbox()).toBeNull();

    rerender(<ModernLocaleSwitcher locale="en" onChange={onChange} />);
    expect(listbox()).toBeNull();
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
    const code = trigger.querySelector("[data-part='code']");
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe('pt');
    // A BCP-47 tag is not text in that language.
    expect(code?.hasAttribute('lang')).toBe(false);

    // The part is not an unstyled orphan: the skin owns its typography.
    expect(MODERN_SKIN).toContain("[data-part='code']");
  });
});

describe('modern locale switcher -- each row is named by its autoglottonym in its own language', () => {
  it('gives every option the autoglottonym as its name, and its label element lang=code dir=auto', () => {
    renderWithEngine(<ModernLocaleSwitcher locale="en" onChange={vi.fn()} locales={DEFAULT_LOCALES} />, 'modern');
    fireEvent.click(screen.getByRole('combobox', { name: /Language/ }));

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(DEFAULT_LOCALES.length);
    DEFAULT_LOCALES.forEach((def, index) => {
      const option = options[index]!;
      expect(screen.getByRole('option', { name: def.label })).toBe(option);
      const label = option.querySelector("[data-part='autoglottonym']");
      expect(label).toHaveAttribute('lang', def.code);
      expect(label).toHaveAttribute('dir', 'auto');
      expect(option.hasAttribute('lang') || option.hasAttribute('dir')).toBe(false);
      expect(option.querySelector("[data-part='flag']")).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('reaches a locale by typing its autoglottonym', () => {
    renderWithEngine(<ModernLocaleSwitcher locale="en" onChange={vi.fn()} locales={DEFAULT_LOCALES} />, 'modern');
    const trigger = screen.getByRole('combobox', { name: /Language/ });
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'f' });
    expect(document.getElementById(trigger.getAttribute('aria-activedescendant')!)).toHaveAccessibleName('Français');
    fireEvent.keyDown(trigger, { key: '\u0627' });
    expect(document.getElementById(trigger.getAttribute('aria-activedescendant')!)).toHaveAccessibleName(
      '\u0627\u0644\u0639\u0631\u0628\u064A\u0629',
    );
  });

  it('does not call onChange when the current locale is chosen again', () => {
    const onChange = vi.fn();
    renderWithEngine(<ModernLocaleSwitcher locale="en" onChange={onChange} locales={DEFAULT_LOCALES} />, 'modern');
    const trigger = screen.getByRole('combobox', { name: /Language/ });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'English' }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('pt');
  });
});
