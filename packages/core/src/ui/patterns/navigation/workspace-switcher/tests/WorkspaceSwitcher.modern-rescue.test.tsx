import React from 'react';
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
