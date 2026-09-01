// @vitest-environment jsdom

/** `menuitemradio` rows are children-presentational, so no row may contain a
    focusable descendant; per-row settings controls are sibling `menuitem`s. */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import axe from 'axe-core';

import { renderWithEngine } from '@tests/support/engine';
import type { WorkspaceSwitcherProps } from '../contracts';
import ModernWorkspaceSwitcher from '../engines/modern';

function createProps(overrides: Partial<WorkspaceSwitcherProps> = {}): WorkspaceSwitcherProps {
  return {
    workspaces: [
      { id: 'ws-1', name: 'Acme Corp', role: 'Admin', plan: 'pro', unreadCount: 3, online: 12 },
      { id: 'ws-2', name: 'Beta Inc', role: 'Member', plan: 'free' },
      { id: 'ws-3', name: 'Gamma LLC', role: 'Owner', plan: 'enterprise' },
    ],
    activeWorkspaceId: 'ws-1',
    onSwitch: vi.fn(),
    onSettings: vi.fn(),
    ...overrides,
  };
}

/** Opens the panel and waits for the lazily-composed rows to mount. */
async function openPanel(): Promise<void> {
  fireEvent.click(screen.getByTestId('workspace-trigger'));
  await screen.findByTestId('workspace-item-ws-1');
}

const row = (id: string) => screen.getByTestId(`workspace-item-${id}`);
const gear = (id: string) => screen.getByTestId(`workspace-settings-${id}`);

async function violationIds(container: HTMLElement, values: string[]): Promise<string[]> {
  const results = await axe.run(container, { runOnly: { type: 'rule', values } });
  return results.violations.map((v) => v.id);
}

afterEach(() => {
  document.documentElement.dir = '';
});

describe('ModernWorkspaceSwitcher — nested-interactive (P1)', () => {
  it('non-vacuity guard: the PRE-FIX option-with-a-button shape trips the rule', async () => {
    const { container } = render(
      <div role="listbox" aria-label="Workspaces">
        <div role="option" aria-selected="true" id="pre-fix-option">
          Acme Corp
          <button type="button" aria-label="Settings for Acme Corp" />
        </div>
      </div>,
    );

    expect(await violationIds(container, ['nested-interactive'])).toContain(
      'nested-interactive',
    );
  });

  it('the open panel reports NO nested-interactive violation', async () => {
    const { container } = renderWithEngine(
      <ModernWorkspaceSwitcher {...createProps()} />,
      'modern',
    );
    await openPanel();
    await screen.findByTestId('workspace-settings-ws-1');

    expect(await violationIds(container, ['nested-interactive'])).toEqual([]);
  });

  it('keeps the menu composition structurally legal', async () => {
    const { container } = renderWithEngine(
      <ModernWorkspaceSwitcher {...createProps({ onCreate: vi.fn() })} />,
      'modern',
    );
    await openPanel();
    await screen.findByTestId('workspace-settings-ws-1');

    expect(
      await violationIds(container, [
        'aria-required-children',
        'aria-required-parent',
        'aria-required-attr',
        'aria-allowed-attr',
        'aria-valid-attr-value',
      ]),
    ).toEqual([]);
  });

  it('leaves no focusable descendant inside ANY row role', async () => {
    const { container } = renderWithEngine(
      <ModernWorkspaceSwitcher {...createProps()} />,
      'modern',
    );
    await openPanel();
    await screen.findByTestId('workspace-settings-ws-1');

    // `option` is gone outright; `menuitemradio` is children-presentational
    // too, so the same law applies to the role that replaced it.
    const rowRoles = container.querySelectorAll(
      '[role="option"], [role="menuitemradio"], [role="menuitem"]',
    );
    expect(rowRoles.length).toBe(6);
    for (const el of rowRoles) {
      const focusable = el.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]',
      );
      expect(
        focusable.length,
        `${el.getAttribute('role')} must not contain a focusable descendant`,
      ).toBe(0);
    }
  });

  it('makes the gear a SIBLING of its row under a presentational row frame', async () => {
    const { container } = renderWithEngine(
      <ModernWorkspaceSwitcher {...createProps()} />,
      'modern',
    );
    await openPanel();
    await screen.findByTestId('workspace-settings-ws-1');

    expect(row('ws-1').contains(gear('ws-1'))).toBe(false);
    const frame = container.querySelector('[data-part="item-row"]') as HTMLElement;
    expect(frame).toHaveAttribute('role', 'none');
    expect(frame.contains(row('ws-1'))).toBe(true);
    expect(frame.contains(gear('ws-1'))).toBe(true);
  });
});

describe('ModernWorkspaceSwitcher — focus custody (P2)', () => {
  it('returns focus to the trigger on POINTER selection', async () => {
    const onSwitch = vi.fn();
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps({ onSwitch })} />, 'modern');
    await openPanel();

    fireEvent.click(row('ws-2'));

    expect(onSwitch).toHaveBeenCalledWith('ws-2');
    // Pointer selection must restore focus to the trigger; an unmounting
    // search field with no handoff would drop focus to <body>.
    expect(document.activeElement).toBe(screen.getByTestId('workspace-trigger'));
    expect(document.activeElement).not.toBe(document.body);
  });

  it('returns focus to the trigger on KEYBOARD selection', async () => {
    const onSwitch = vi.fn();
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps({ onSwitch })} />, 'modern');
    await openPanel();

    fireEvent.keyDown(screen.getByTestId('workspace-search'), { key: 'ArrowDown' });
    fireEvent.keyDown(row('ws-1'), { key: 'Enter' });

    expect(onSwitch).toHaveBeenCalledWith('ws-1');
    expect(document.activeElement).toBe(screen.getByTestId('workspace-trigger'));
  });

  it('returns focus to the trigger on Escape', async () => {
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps()} />, 'modern');
    await openPanel();

    fireEvent.keyDown(screen.getByTestId('workspace-search'), { key: 'Escape' });

    expect(screen.queryByTestId('workspace-item-ws-1')).toBeNull();
    expect(document.activeElement).toBe(screen.getByTestId('workspace-trigger'));
  });

  it('returns focus to the trigger on an OUTSIDE pointer dismissal', async () => {
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps()} />, 'modern');
    await openPanel();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByTestId('workspace-item-ws-1')).toBeNull();
    expect(document.activeElement).toBe(screen.getByTestId('workspace-trigger'));
  });

  it('returns focus to the trigger from CREATE WORKSPACE', async () => {
    const onCreate = vi.fn();
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps({ onCreate })} />, 'modern');
    await openPanel();

    fireEvent.click(await screen.findByTestId('workspace-create'));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('workspace-item-ws-1')).toBeNull();
    expect(document.activeElement).toBe(screen.getByTestId('workspace-trigger'));
  });

  it('restores the pre-open tree exactly on dismissal', async () => {
    const { container } = renderWithEngine(
      <ModernWorkspaceSwitcher {...createProps({ onCreate: vi.fn() })} />,
      'modern',
    );
    const parts = () =>
      Array.from(container.querySelectorAll('[data-part]'))
        .map((el) => el.getAttribute('data-part'))
        .sort();
    const before = parts();
    const beforeCount = container.querySelectorAll('*').length;

    await openPanel();
    expect(parts().length).toBeGreaterThan(before.length);

    fireEvent.keyDown(screen.getByTestId('workspace-search'), { key: 'Escape' });

    expect(parts()).toEqual(before);
    expect(container.querySelectorAll('*').length).toBe(beforeCount);
    expect(container.querySelector('[data-part="panel"]')).toBeNull();
    expect(container.querySelectorAll('[role="menu"], [role="menuitemradio"]').length).toBe(0);
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-open', 'false');
  });
});

describe('ModernWorkspaceSwitcher — roving menu navigation', () => {
  it('roves real focus with Arrow/Home/End and wraps at both ends', async () => {
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps()} />, 'modern');
    await openPanel();

    fireEvent.keyDown(screen.getByTestId('workspace-search'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(row('ws-1'));

    fireEvent.keyDown(row('ws-1'), { key: 'End' });
    expect(document.activeElement).toBe(row('ws-3'));

    fireEvent.keyDown(row('ws-3'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(row('ws-1'));

    fireEvent.keyDown(row('ws-1'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(row('ws-3'));

    fireEvent.keyDown(row('ws-3'), { key: 'Home' });
    expect(document.activeElement).toBe(row('ws-1'));
  });

  it('keeps the menu to ONE tab stop: exactly one row and one gear are tabbable', async () => {
    const { container } = renderWithEngine(
      <ModernWorkspaceSwitcher {...createProps()} />,
      'modern',
    );
    await openPanel();
    await screen.findByTestId('workspace-settings-ws-1');

    const tabbable = (part: string) =>
      Array.from(container.querySelectorAll(`[data-part="${part}"]`)).filter(
        (el) => el.getAttribute('tabindex') === '0',
      );
    expect(tabbable('item').length).toBe(1);
    expect(tabbable('settings').length).toBe(1);

    fireEvent.keyDown(screen.getByTestId('workspace-search'), { key: 'ArrowDown' });
    fireEvent.keyDown(row('ws-1'), { key: 'ArrowDown' });

    expect(tabbable('item')).toEqual([row('ws-2')]);
    expect(tabbable('settings')).toEqual([gear('ws-2')]);
  });

  it('opens on ArrowDown from the closed trigger', async () => {
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps()} />, 'modern');
    const trigger = screen.getByTestId('workspace-trigger');

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(await screen.findByTestId('workspace-item-ws-1')).toBeInTheDocument();
  });

  it('hands a printable key to the filter as type-ahead', async () => {
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps()} />, 'modern');
    await openPanel();

    fireEvent.keyDown(screen.getByTestId('workspace-search'), { key: 'ArrowDown' });
    fireEvent.keyDown(row('ws-1'), { key: 'B' });

    const search = screen.getByTestId('workspace-search') as HTMLInputElement;
    expect(search.value).toBe('B');
    expect(document.activeElement).toBe(search);
    expect(screen.queryByTestId('workspace-item-ws-1')).toBeNull();
    expect(screen.getByTestId('workspace-item-ws-2')).toBeInTheDocument();
  });
});

describe('ModernWorkspaceSwitcher — settings affordance', () => {
  it('reaches the gear from its row with the inline-end arrow and back', async () => {
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps()} />, 'modern');
    await openPanel();
    await screen.findByTestId('workspace-settings-ws-1');

    fireEvent.keyDown(screen.getByTestId('workspace-search'), { key: 'ArrowDown' });
    fireEvent.keyDown(row('ws-1'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(gear('ws-1'));

    fireEvent.keyDown(gear('ws-1'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(gear('ws-2'));

    fireEvent.keyDown(gear('ws-2'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(row('ws-2'));
  });

  it('mirrors the crossing arrows under RTL', async () => {
    // Scoped `dir` rather than the document's: the provider owns
    // documentElement.dir and rewrites it from the tenant locale on mount.
    renderWithEngine(
      <div dir="rtl">
        <ModernWorkspaceSwitcher {...createProps()} />
      </div>,
      'modern',
    );
    await openPanel();
    await screen.findByTestId('workspace-settings-ws-1');

    fireEvent.keyDown(screen.getByTestId('workspace-search'), { key: 'ArrowDown' });
    fireEvent.keyDown(row('ws-1'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(gear('ws-1'));

    fireEvent.keyDown(gear('ws-1'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(row('ws-1'));
  });

  it('exposes the gear as a real native button that fires onSettings', async () => {
    const onSettings = vi.fn();
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps({ onSettings })} />, 'modern');
    await openPanel();
    const settings = await screen.findByTestId('workspace-settings-ws-2');

    // A native <button> is what makes Enter/Space activate it once focused —
    // jsdom does not synthesise activation behaviour from a key event.
    expect(settings.tagName).toBe('BUTTON');
    expect(settings).toHaveAttribute('role', 'menuitem');
    await act(async () => {
      settings.focus();
    });
    expect(document.activeElement).toBe(settings);

    fireEvent.click(settings);
    expect(onSettings).toHaveBeenCalledWith('ws-2');
    // The gear is not a selection: the panel stays open and onSwitch is untouched.
    expect(screen.getByTestId('workspace-item-ws-2')).toBeInTheDocument();
  });
});
