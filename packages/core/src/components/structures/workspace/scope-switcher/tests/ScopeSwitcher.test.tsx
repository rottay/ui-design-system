/**
 * ScopeSwitcher — the family's first coverage (WO-FAM-11 sub-lot E).
 *
 * The family shipped with NO test directory at all, so the gate's
 * `a11yAssertions` arm had nothing to count and the composition law S22 was a
 * claim in a comment. What is asserted here is what the composition BUYS: the
 * radiogroup semantics, the roving tab stop, the RTL-mirrored arrows and the
 * group label all come from the certified primitive, and the family's own
 * contribution — the count badge inside the option label, and the section vs
 * inline frame — reads through number plus tint rather than tint alone.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { renderWithEngine } from '@tests/support/engine';
import { ScopeSwitcher, type ScopeDefinition } from '..';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/scope-switcher/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const SCOPES: ScopeDefinition[] = [
  { key: 'all', label: 'All', count: 128 },
  { key: 'active', label: 'Active', count: 12 },
  { key: 'archived', label: 'Archived' },
];

const noop = () => {};

describe('ScopeSwitcher', () => {
  it('renders nothing when there is no scope to switch between', () => {
    const { container } = renderWithEngine(
      <ScopeSwitcher scopes={[]} activeScope="all" onScopeChange={noop} />,
      'modern',
    );
    expect(container.querySelector('.ds-scope-switcher')).toBeNull();
  });

  // --- accessibility: everything the composition was bought for -------------

  it('exposes the strip as a named radiogroup with one radio per scope', async () => {
    const { findByRole, getAllByRole, getByRole } = renderWithEngine(
      <ScopeSwitcher scopes={SCOPES} activeScope="active" onScopeChange={noop} />,
      'modern',
    );

    expect(await findByRole('radiogroup', { name: 'Scope' })).toBeInTheDocument();
    expect(getAllByRole('radio')).toHaveLength(3);
    expect(getByRole('radio', { name: /Active/ })).toHaveAttribute('aria-checked', 'true');
    expect(getByRole('radio', { name: /Archived/ })).toHaveAttribute('aria-checked', 'false');
  });

  it('keeps exactly one tab stop, on the selected scope (roving tabindex)', async () => {
    const { findAllByRole, getByRole } = renderWithEngine(
      <ScopeSwitcher scopes={SCOPES} activeScope="archived" onScopeChange={noop} />,
      'modern',
    );

    const radios = await findAllByRole('radio');
    expect(radios.filter((radio) => radio.tabIndex === 0)).toHaveLength(1);
    expect(getByRole('radio', { name: /Archived/ }).tabIndex).toBe(0);
  });

  it('moves selection AND focus with the arrow keys', async () => {
    const onScopeChange = vi.fn();
    const { findByRole, getByRole } = renderWithEngine(
      <ScopeSwitcher scopes={SCOPES} activeScope="all" onScopeChange={onScopeChange} />,
      'modern',
    );

    const first = await findByRole('radio', { name: /All/ });
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowRight' });

    expect(onScopeChange).toHaveBeenCalledWith('active');
    expect(getByRole('radio', { name: /Active/ })).toHaveFocus();
  });

  it('mirrors the arrow contract under an RTL locale', async () => {
    const onScopeChange = vi.fn();
    const { findByRole } = renderWithEngine(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ScopeSwitcher scopes={SCOPES} activeScope="all" onScopeChange={onScopeChange} />
      </I18nProvider>,
      'modern',
    );

    const first = await findByRole('radio', { name: /All/ });
    act(() => first.focus());
    // RTL: ArrowRight walks backwards in DOM order and wraps to the last scope.
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(onScopeChange).toHaveBeenLastCalledWith('archived');
  });

  it('reports a scope change on click, and stays silent on the active one', async () => {
    const onScopeChange = vi.fn();
    const { findByRole, getByRole } = renderWithEngine(
      <ScopeSwitcher scopes={SCOPES} activeScope="all" onScopeChange={onScopeChange} />,
      'modern',
    );

    fireEvent.click(await findByRole('radio', { name: /Archived/ }));
    expect(onScopeChange).toHaveBeenCalledWith('archived');

    onScopeChange.mockClear();
    // A radiogroup has no "off" state, so re-activating the checked scope is
    // not a change and the only honest report is silence.
    fireEvent.click(getByRole('radio', { name: /All/ }));
    expect(onScopeChange).not.toHaveBeenCalled();
  });

  // --- the family's own contribution ----------------------------------------

  it('carries the count inside the option label, so it reads as number plus tint', async () => {
    const { container, findByRole, getByRole } = renderWithEngine(
      <ScopeSwitcher scopes={SCOPES} activeScope="active" onScopeChange={noop} />,
      'modern',
    );

    await findByRole('radiogroup', { name: 'Scope' });
    expect(container.querySelectorAll("[data-part='count-badge']")).toHaveLength(2);
    expect(getByRole('radio', { name: /All/ })).toHaveTextContent('128');
    // The active tint is a SECOND channel on a badge that already carries the
    // number; the scope with no count renders no badge at all.
    expect(
      container.querySelector("[data-part='count-badge'][data-active='true']"),
    ).toHaveTextContent('12');
    expect(
      getByRole('radio', { name: /Archived/ }).querySelector("[data-part='count-badge']"),
    ).toBeNull();
  });

  it('stamps the section/inline frame the skin keys on', async () => {
    const section = renderWithEngine(
      <ScopeSwitcher scopes={SCOPES} activeScope="all" onScopeChange={noop} />,
      'modern',
    );
    await section.findByRole('radiogroup', { name: 'Scope' });
    expect(section.container.querySelector('.ds-scope-switcher')).toHaveAttribute(
      'data-inline',
      'false',
    );

    const inline = renderWithEngine(
      <ScopeSwitcher
        scopes={SCOPES}
        activeScope="all"
        onScopeChange={noop}
        variant="inline"
      />,
      'modern',
    );
    await inline.findAllByRole('radiogroup', { name: 'Scope' });
    expect(inline.container.querySelector('.ds-scope-switcher')).toHaveAttribute(
      'data-inline',
      'true',
    );
  });

  /**
   * The composition hazard the skin header records: naming the composed
   * control from here overwrote `segmented`'s own root part. The prop is
   * retired, so the primitive stamps its own anatomy and this family stamps
   * only parts it paints.
   */
  it('leaves the composed primitive its own root anatomy', async () => {
    const { container, findByRole } = renderWithEngine(
      <ScopeSwitcher scopes={SCOPES} activeScope="all" onScopeChange={noop} />,
      'modern',
    );

    const group = await findByRole('radiogroup', { name: 'Scope' });
    expect(container.querySelector("[data-part='switcher']")).toBeNull();
    expect(group).toHaveAttribute('data-part', 'root');
  });

  // --- the cascade the cut created ------------------------------------------

  /**
   * Every family channel the skin reads is produced by
   * `derivation/chrome/scope-switcher`. Asserted here as the SHAPE of the
   * read — a chained fallback to the value the family had before the cut — so
   * the file cannot quietly go back to reading a root token directly.
   */
  it('reads its own namespace with a chained fallback, never a bare root token', () => {
    for (const channel of [
      '--ds-scope-switcher-padding-block',
      '--ds-scope-switcher-padding-inline',
      '--ds-scope-switcher-background',
      '--ds-scope-switcher-border',
      '--ds-scope-switcher-count-bg',
      '--ds-scope-switcher-count-color',
      '--ds-scope-switcher-count-bg-active',
      '--ds-scope-switcher-count-color-active',
      '--ds-scope-switcher-motion-duration',
    ]) {
      expect(new RegExp(`var\\(\\s*${channel}\\s*,`, 'u').test(SKIN)).toBe(true);
    }
  });

  it('keeps the strip flat: no elevation channel joins the wrapper', () => {
    expect(SKIN).not.toMatch(/box-shadow/u);
    expect(SKIN).not.toMatch(/--ds-elevation-/u);
  });
});
