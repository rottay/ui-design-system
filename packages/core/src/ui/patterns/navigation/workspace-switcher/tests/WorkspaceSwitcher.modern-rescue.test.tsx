import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import type { WorkspaceSwitcherProps } from '../contracts';
import ModernWorkspaceSwitcher from '../engines/modern';

function createProps(overrides: Partial<WorkspaceSwitcherProps> = {}): WorkspaceSwitcherProps {
  return {
    workspaces: [
      { id: 'ws-1', name: 'Acme Corp', role: 'Admin', plan: 'pro' },
      { id: 'ws-2', name: 'Beta Inc', role: 'Member', plan: 'free' },
    ],
    activeWorkspaceId: 'ws-1',
    onSwitch: vi.fn(),
    ...overrides,
  };
}

describe('ModernWorkspaceSwitcher — APG virtual focus', () => {
  it('carries aria-activedescendant on the element that actually holds DOM focus', () => {
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps()} />, 'modern');
    fireEvent.click(screen.getByTestId('workspace-trigger'));

    const combobox = screen.getByTestId('workspace-search') as HTMLInputElement;
    // The search field is the combobox and takes focus when the panel opens,
    // so the attribute is honoured rather than inert on an unfocused panel.
    expect(combobox).toHaveAttribute('role', 'combobox');
    expect(document.activeElement).toBe(combobox);

    fireEvent.keyDown(combobox, { key: 'ArrowDown' });

    const active = combobox.getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();
    expect(document.getElementById(active as string)).toBe(
      screen.getByTestId('workspace-item-ws-1'),
    );

    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(
      document.getElementById(combobox.getAttribute('aria-activedescendant') as string),
    ).toBe(screen.getByTestId('workspace-item-ws-2'));
  });

  it('never leaves aria-activedescendant on the unfocused panel', () => {
    const { container } = renderWithEngine(
      <ModernWorkspaceSwitcher {...createProps()} />,
      'modern',
    );
    fireEvent.click(screen.getByTestId('workspace-trigger'));

    const panel = container.querySelector('[data-part="panel"]') as HTMLElement;
    expect(panel).not.toHaveAttribute('aria-activedescendant');
    // Only option/group children are legal inside a listbox, so the role sits
    // on the option list, not on the panel that also holds search/create/user.
    expect(panel).not.toHaveAttribute('role');

    const list = container.querySelector('[data-part="list"]') as HTMLElement;
    expect(list).toHaveAttribute('role', 'listbox');
    expect(list.querySelectorAll('[role="option"]').length).toBe(2);
  });

  it('scopes option and listbox ids per instance so two switchers cannot collide', () => {
    const { container } = renderWithEngine(
      <div>
        <ModernWorkspaceSwitcher {...createProps()} />
        <ModernWorkspaceSwitcher {...createProps()} />
      </div>,
      'modern',
    );

    const triggers = screen.getAllByTestId('workspace-trigger');
    fireEvent.click(triggers[0]);
    fireEvent.click(triggers[1]);

    const optionIds = Array.from(container.querySelectorAll('[role="option"]')).map(
      (el) => el.id,
    );
    expect(optionIds.length).toBe(4);
    expect(new Set(optionIds).size).toBe(4);

    const listIds = Array.from(container.querySelectorAll('[role="listbox"]')).map(
      (el) => el.id,
    );
    expect(new Set(listIds).size).toBe(2);
  });

  it('drops the filter when the panel is dismissed so the next open is not empty', () => {
    renderWithEngine(<ModernWorkspaceSwitcher {...createProps()} />, 'modern');
    const trigger = screen.getByTestId('workspace-trigger');

    fireEvent.click(trigger);
    fireEvent.change(screen.getByTestId('workspace-search'), {
      target: { value: 'Beta' },
    });
    expect(screen.queryByTestId('workspace-item-ws-1')).toBeNull();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    fireEvent.click(trigger);

    expect((screen.getByTestId('workspace-search') as HTMLInputElement).value).toBe('');
    expect(screen.getByTestId('workspace-item-ws-1')).toBeInTheDocument();
  });

  it('drops the listbox role when the filter leaves no options', () => {
    const { container } = renderWithEngine(
      <ModernWorkspaceSwitcher {...createProps()} />,
      'modern',
    );
    fireEvent.click(screen.getByTestId('workspace-trigger'));
    fireEvent.change(screen.getByTestId('workspace-search'), {
      target: { value: 'zzzz' },
    });

    const list = container.querySelector('[data-part="list"]') as HTMLElement;
    expect(list).not.toHaveAttribute('role');
    expect(screen.getByTestId('workspace-search')).not.toHaveAttribute('aria-controls');
  });
});

describe('ModernWorkspaceSwitcher — narrow posture', () => {
  // Vitest runs with cwd=packages/core; import.meta.url is not a file: URL
  // under the vite transform pipeline.
  const MODERN_SKIN_PATH = resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher.css',
  );

  function narrowBlock(): string {
    const skin = readFileSync(MODERN_SKIN_PATH, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const start = skin.indexOf('@media (max-width: 30rem)');
    expect(start).toBeGreaterThan(-1);
    // The block is one nesting level deep, so the second '}' closes it.
    const open = skin.indexOf('{', start);
    const inner = skin.indexOf('}', open);
    return skin.slice(open, skin.indexOf('}', inner + 1) + 1);
  }

  it('re-anchors the sidebar panel below the trigger instead of off-screen', () => {
    // Before: `sidebar` (the DEFAULT position) anchored the panel at
    // `inset-inline-start: 100%` of the rail with no narrow override, so on a
    // phone the 18rem panel started past the rail and rendered off the
    // viewport — create/settings became unreachable. The viewport-bounded
    // `inline-size` only shrank it; it never brought it back on-screen.
    const block = narrowBlock();

    expect(block).toContain("[data-position='sidebar'] [data-part='panel']");
    expect(block).toContain('inset-block-start: 100%');
    expect(block).toContain('inset-inline-start: 0');
    // The inline-end offset that pushed it off-screen is explicitly cleared.
    expect(block).toContain('margin-inline-start: 0');
    // The below-trigger gap is the topbar posture's own channel, not a literal.
    expect(block).toContain('margin-block-start: var(--ds-workspace-switcher-panel-gap-block, 4px)');
  });

  it('states the narrow posture at or above the wide sidebar rule so it wins', () => {
    const skin = readFileSync(MODERN_SKIN_PATH, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const wide = skin.indexOf(
      "[data-part='root'][data-position='sidebar'] [data-part='panel']",
    );
    const narrow = skin.indexOf('@media (max-width: 30rem)');
    // Equal specificity (0,5,0): the override only lands if it is declared
    // after the wide rule it replaces.
    expect(narrow).toBeGreaterThan(wide);
  });
});
