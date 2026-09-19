/**
 * ViewModeSwitcher — the family's first coverage (WO-FAM-11 sub-lot E).
 *
 * The family shipped with NO test directory, which mattered more here than
 * anywhere else in the cut: its whole design is a claim that it gives its
 * anatomy away to the composed Segmented and keeps nothing, and nothing
 * executable held it to that. These cases hold both halves — what the
 * primitive owes (radiogroup semantics, roving focus, RTL arrows), and the one
 * thing only this family can carry: a disabled mode's REASON, in the
 * accessible name, because a tooltip cannot wrap a radio inside a radiogroup.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { renderWithEngine } from '@tests/support/engine';
import {
  ViewModeSwitcher,
  buildViewModes,
  defaultViewModeIcons,
  defaultViewModeLabels,
} from '..';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/view-mode-switcher/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const MODES = buildViewModes(['table', 'cards', 'kanban']);
const noop = () => {};

describe('ViewModeSwitcher', () => {
  it('renders nothing when the surface offers no view mode', () => {
    const { container } = renderWithEngine(
      <ViewModeSwitcher modes={[]} value="table" onChange={noop} />,
      'modern',
    );
    expect(container.querySelector('.ds-view-mode-switcher')).toBeNull();
  });

  // --- accessibility ---------------------------------------------------------

  it('exposes the control as a named radiogroup with one radio per mode', async () => {
    const { findByRole, getAllByRole, getByRole } = renderWithEngine(
      <ViewModeSwitcher modes={MODES} value="cards" onChange={noop} />,
      'modern',
    );

    expect(await findByRole('radiogroup', { name: 'View mode' })).toBeInTheDocument();
    expect(getAllByRole('radio')).toHaveLength(3);
    expect(getByRole('radio', { name: 'Cards view' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(getByRole('radio', { name: 'Table view' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  /**
   * The reason a disabled mode is unavailable has to reach assistive
   * technology, and it cannot ride a tooltip: a tooltip wrapper cannot sit
   * inside the radiogroup anatomy, and the `title` attribute this family used
   * to carry never fired reliably on a disabled control. So it rides the
   * accessible name, as ONE parametric message rather than concatenated
   * fragments.
   */
  it('carries a disabled mode reason in its accessible name', async () => {
    const modes = buildViewModes(['table', 'calendar'], {
      calendar: { disabled: true, disabledReason: 'no date field configured' },
    });
    const { findByRole } = renderWithEngine(
      <ViewModeSwitcher modes={modes} value="table" onChange={noop} />,
      'modern',
    );

    const calendar = await findByRole('radio', {
      name: 'Calendar view (unavailable: no date field configured)',
    });
    expect(calendar).toHaveAccessibleName(
      'Calendar view (unavailable: no date field configured)',
    );
  });

  it('falls back to the plain mode label when no reason is given', async () => {
    const modes = buildViewModes(['table', 'calendar'], {
      calendar: { disabled: true },
    });
    const { findByRole } = renderWithEngine(
      <ViewModeSwitcher modes={modes} value="table" onChange={noop} />,
      'modern',
    );
    expect(await findByRole('radio', { name: 'Calendar view' })).toBeInTheDocument();
  });

  it('keeps exactly one tab stop, on the active mode', async () => {
    const { findAllByRole, getByRole } = renderWithEngine(
      <ViewModeSwitcher modes={MODES} value="kanban" onChange={noop} />,
      'modern',
    );

    const radios = await findAllByRole('radio');
    expect(radios.filter((radio) => radio.tabIndex === 0)).toHaveLength(1);
    expect(getByRole('radio', { name: 'Kanban view' }).tabIndex).toBe(0);
  });

  it('moves selection AND focus with the arrow keys', async () => {
    const onChange = vi.fn();
    const { findByRole, getByRole } = renderWithEngine(
      <ViewModeSwitcher modes={MODES} value="table" onChange={onChange} />,
      'modern',
    );

    const first = await findByRole('radio', { name: 'Table view' });
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith('cards');
    expect(getByRole('radio', { name: 'Cards view' })).toHaveFocus();
  });

  it('mirrors the arrow contract under an RTL locale', async () => {
    const onChange = vi.fn();
    const { findByRole } = renderWithEngine(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ViewModeSwitcher modes={MODES} value="table" onChange={onChange} />
      </I18nProvider>,
      'modern',
    );

    const first = await findByRole('radio', { name: 'Table view' });
    act(() => first.focus());
    // RTL: ArrowRight walks backwards in DOM order and wraps to the last mode.
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('kanban');
  });

  it('refuses activation of a disabled mode', async () => {
    const onChange = vi.fn();
    const modes = buildViewModes(['table', 'calendar'], {
      calendar: { disabled: true, disabledReason: 'no date field configured' },
    });
    const { findByRole } = renderWithEngine(
      <ViewModeSwitcher modes={modes} value="table" onChange={onChange} />,
      'modern',
    );

    fireEvent.click(
      await findByRole('radio', {
        name: 'Calendar view (unavailable: no date field configured)',
      }),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  // --- the composition, held to its own claim --------------------------------

  it('builds every default mode from a governed icon role and an English floor', () => {
    const modes = buildViewModes(['table', 'cards', 'grid', 'kanban', 'gallery', 'calendar']);
    expect(modes.map((mode) => mode.label)).toEqual(
      Object.values(defaultViewModeLabels),
    );
    for (const mode of modes) {
      expect(mode.icon).toBe(defaultViewModeIcons[mode.key]);
    }
  });

  /**
   * The composition hazard the skin header records: naming the composed
   * control from here overwrote `segmented`'s own root part and once cost that
   * file every selector it had. The prop is retired, so the primitive stamps
   * its own anatomy back.
   */
  it('leaves the composed primitive its own root anatomy', async () => {
    const { container, findByRole } = renderWithEngine(
      <ViewModeSwitcher modes={MODES} value="table" onChange={noop} />,
      'modern',
    );

    const group = await findByRole('radiogroup', { name: 'View mode' });
    expect(container.querySelector("[data-part='switcher']")).toBeNull();
    expect(group).toHaveAttribute('data-part', 'root');
  });

  /**
   * The zero-channel ruling, executable. This family's deriver produces the
   * empty set BECAUSE the skin owns no surface — the day this file grows a
   * paint declaration or a channel read, the ruling is false and the deriver
   * owes a producer in the same change.
   */
  it('owns layout and nothing else: the skin reads no --ds-* channel at all', () => {
    expect(SKIN.match(/var\(\s*--ds-/u)).toBeNull();
    expect(SKIN).not.toMatch(/background|border|box-shadow|border-radius|color\s*:/u);
  });
});
