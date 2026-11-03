import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernWorkspaceSwitcher from '../engines/modern';


/** P-88: these controls are composed Buttons that keep their own `trigger` part; each is found by its owner class hook. */
const BUTTON_DOORS: Record<string, string> = {
  'create': '.ds-workspace-switcher__create',
  'settings': '.ds-workspace-switcher__settings',
  'trigger': '.ds-workspace-switcher__trigger',
};
const partSelector = (part: string, engine: string) => (engine === 'modern' && BUTTON_DOORS[part]) || `[data-part="${part}"]`;
const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

interface Rule {
  selector: string;
  body: string;
}

function rulesOf(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim().replace(/\s+/g, ' '),
    body: match[2],
  }));
}

function forcedColorsBlock(css: string): string {
  const start = css.indexOf('@media (forced-colors: active)');
  if (start === -1) return '';
  let depth = 0;
  for (let index = css.indexOf('{', start); index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }
  return css.slice(start);
}

const FORCED = forcedColorsBlock(SKIN);
const AUTHORED = rulesOf(SKIN.replace(FORCED, ''));

const declarations = (body: string) =>
  body
    .split(';')
    .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
    .filter(Boolean);

const paintsSolidOutline = (rule: Rule) =>
  declarations(rule.body).some(
    (declaration) => /^outline\s*:/.test(declaration) && /solid/.test(declaration) && !/transparent/.test(declaration),
  );

const paintsFocusIndicator = (rule: Rule) =>
  /(^|[\s;])outline(-[a-z]+)?\s*:/.test(rule.body) || /--ds-(button-)?focus-ring/.test(rule.body);

const BUTTON_PARTS = ['trigger', 'settings', 'create'];

describe('ModernWorkspaceSwitcher — composed controls wear the Button focus signature', () => {
  it('renders the trigger, the row gears and the create control as DS Buttons', async () => {
    const { container } = render(
      <ModernWorkspaceSwitcher
        workspaces={[
          { id: 'ws-1', name: 'Acme Corp', role: 'Admin', plan: 'pro' },
          { id: 'ws-2', name: 'Beta Inc', role: 'Member', plan: 'free' },
        ]}
        activeWorkspaceId="ws-1"
        onSwitch={vi.fn()}
        onSettings={vi.fn()}
        onCreate={vi.fn()}
        showCreateButton
      />,
    );
    // The public Button is lazy: `findBy*` awaits its Suspense boundary.
    fireEvent.click(await screen.findByTestId('workspace-trigger'));
    await screen.findByTestId('workspace-create');

    for (const part of BUTTON_PARTS) {
      const nodes = [...container.querySelectorAll(partSelector(part, 'modern'))];
      expect(nodes.length, part).toBeGreaterThan(0);
      for (const node of nodes) {
        expect(node.tagName).toBe('BUTTON');
        expect(node).toHaveClass('ds-button', 'ds-button--modern');
        expect(node).toHaveAttribute('data-variant');
      }
    }
    // One gear per row; the roving row keeps exactly one of them in the tab order.
    const gears = [...container.querySelectorAll('.ds-workspace-switcher__settings')];
    expect(gears.map((gear) => gear.getAttribute('tabindex'))).toEqual(['0', '-1']);
  });

  it('paints no focus indicator of its own on the composed Buttons', () => {
    for (const part of BUTTON_PARTS) {
      const named = [...AUTHORED, ...rulesOf(FORCED)].filter((rule) =>
        new RegExp(`\\.ds-workspace-switcher__${part}(?![^,]*\\[data-part=)`).test(rule.selector),
      );
      expect(named.length).toBeGreaterThan(0);
      for (const rule of named) {
        expect(paintsFocusIndicator(rule), rule.selector).toBe(false);
      }
    }
  });

  it('carries the row focus signature on an overlay inset by its reach', () => {
    const ITEM_FOCUS =
      ".ds-pattern-workspace-switcher.ds-engine-modern .ds-workspace-switcher__item:is([data-state~='focus-visible'], :focus-visible)";
    const itemRules = AUTHORED.filter((rule) => rule.selector.startsWith(ITEM_FOCUS));
    expect(itemRules.filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(itemRules.map((rule) => [rule.selector, declarations(rule.body)])).toEqual([
      [
        ITEM_FOCUS,
        [
          'position: relative',
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: calc(-1 * var(--ds-focus-ring-width))',
        ],
      ],
      [
        `${ITEM_FOCUS}::after`,
        [
          'position: absolute',
          'inset: calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))',
          "content: ''",
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
        ],
      ],
    ]);
    expect(
      rulesOf(FORCED)
        .filter((rule) => rule.selector.startsWith(ITEM_FOCUS))
        .map((rule) => [rule.selector, declarations(rule.body)]),
    ).toEqual([
      [
        ITEM_FOCUS,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: calc(-1 * max(2px, var(--ds-focus-ring-width)))',
        ],
      ],
      [`${ITEM_FOCUS}::after`, ['box-shadow: none']],
    ]);
  });

  it('still reveals the gear when it takes keyboard focus', () => {
    const reveal = AUTHORED.find(
      (rule) => rule.selector.includes(".ds-workspace-switcher__settings:is([data-state~='focus-visible'], :focus-visible)"),
    );
    expect(reveal && declarations(reveal.body)).toEqual(['opacity: 1']);
  });
});

describe('ModernWorkspaceSwitcher — the row control rides the Button primitive', () => {
  const ROW = ".ds-pattern-workspace-switcher.ds-engine-modern[data-part='root'] .ds-button.ds-workspace-switcher__item";

  const openMenu = async (onSwitch = vi.fn()) => {
    const view = render(
      <ModernWorkspaceSwitcher
        workspaces={[
          { id: 'ws-1', name: 'Acme Corp', role: 'Admin', plan: 'pro', unreadCount: 3 },
          { id: 'ws-2', name: 'Beta Inc', role: 'Member', plan: 'free' },
        ]}
        activeWorkspaceId="ws-1"
        onSwitch={onSwitch}
        onSettings={vi.fn()}
      />,
    );
    fireEvent.click(await screen.findByTestId('workspace-trigger'));
    await screen.findByTestId('workspace-settings-ws-1');
    return { ...view, onSwitch };
  };

  it('renders each row as a non-submitting DS Button that keeps the menu semantics', async () => {
    const { container } = await openMenu();
    const rows = [...container.querySelectorAll('.ds-workspace-switcher__item')];

    expect(rows.length).toBe(2);
    for (const row of rows) {
      expect(row.tagName).toBe('BUTTON');
      expect(row).toHaveClass('ds-button', 'ds-button--modern');
      expect(row).toHaveAttribute('type', 'button');
      expect(row).toHaveAttribute('role', 'menuitemradio');
      for (const part of ['avatar-frame', 'item-copy', 'item-controls']) {
        expect(row.querySelector(partSelector(part, 'modern')), part).not.toBeNull();
      }
    }
    expect(rows.map((row) => row.getAttribute('aria-checked'))).toEqual(['true', 'false']);
    expect(rows.map((row) => row.getAttribute('tabindex'))).toEqual(['0', '-1']);
  });

  it.each(['click', 'Enter', ' '])('switches exactly once on %s', async (drive) => {
    const { onSwitch } = await openMenu();
    const row = screen.getByTestId('workspace-item-ws-2');

    if (drive === 'click') fireEvent.click(row);
    else fireEvent.keyDown(row, { key: drive });

    expect(onSwitch).toHaveBeenCalledTimes(1);
    expect(onSwitch).toHaveBeenCalledWith('ws-2');
  });

  it('withdraws the Button chrome in the skin and leaves the focus signature to the row', () => {
    const chrome = AUTHORED.filter((rule) => rule.selector === ROW);
    expect(chrome.length).toBe(1);
    const declared = declarations(chrome[0].body);

    for (const channel of ['hover-transform', 'hover-filter', 'active-transform', 'active-filter']) {
      expect(declared).toContain(`--ds-button-${channel}: none`);
    }
    for (const property of ['background', 'border', 'border-radius', 'box-shadow', 'color', 'font', 'padding-inline', 'transition']) {
      expect(declared, property).toContain(`${property}: unset`);
    }
    for (const reset of ['box-sizing: inherit', 'border-style: inherit', 'border-width: 0']) {
      expect(declared, reset).toContain(reset);
    }
    expect(paintsFocusIndicator(chrome[0])).toBe(false);

    const wrappers = AUTHORED.find((rule) => rule.selector.startsWith(`${ROW} > [data-part='content']`));
    expect(wrappers && declarations(wrappers.body)).toContain('display: contents');
  });
});

describe('ModernWorkspaceSwitcher — arrow keys move real focus to the addressed Button', () => {
  const THREE = [
    { id: 'ws-1', name: 'Acme Corp', role: 'Admin', plan: 'pro' },
    { id: 'ws-2', name: 'Beta Inc', role: 'Member', plan: 'free' },
    { id: 'ws-3', name: 'Gamma LLC', role: 'Owner', plan: 'enterprise' },
  ];
  const row = (id: string) => screen.getByTestId(`workspace-item-${id}`);
  const gear = (id: string) => screen.getByTestId(`workspace-settings-${id}`);
  const search = () => screen.getByTestId('workspace-search');
  const rowFrame = (id: string) => row(id).closest('[data-part="item-row"]');

  const openThree = async ({ withSettings = true } = {}) => {
    const view = render(
      <ModernWorkspaceSwitcher
        workspaces={THREE}
        activeWorkspaceId="ws-1"
        onSwitch={vi.fn()}
        {...(withSettings ? { onSettings: vi.fn() } : {})}
      />,
    );
    // The trigger and the gears are the lazy public Button: await both boundaries.
    fireEvent.click(await screen.findByTestId('workspace-trigger'));
    await screen.findByTestId('workspace-item-ws-3');
    if (withSettings) await screen.findByTestId('workspace-settings-ws-3');
    return view;
  };

  it('lands on the first, middle and last row and wraps past both ends', async () => {
    await openThree();

    fireEvent.keyDown(search(), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(row('ws-3'));

    fireEvent.keyDown(row('ws-3'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(row('ws-1'));

    fireEvent.keyDown(row('ws-1'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(row('ws-2'));
    expect(['ws-1', 'ws-2', 'ws-3'].map((id) => row(id).getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);

    fireEvent.keyDown(row('ws-2'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(row('ws-1'));

    fireEvent.keyDown(row('ws-1'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(row('ws-3'));
  });

  it('roves the gear column with wrap and Home/End, then crosses back to the same row', async () => {
    await openThree();

    fireEvent.keyDown(search(), { key: 'ArrowDown' });
    fireEvent.keyDown(row('ws-1'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(gear('ws-1'));

    fireEvent.keyDown(gear('ws-1'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(gear('ws-3'));

    fireEvent.keyDown(gear('ws-3'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(gear('ws-1'));

    fireEvent.keyDown(gear('ws-1'), { key: 'End' });
    expect(document.activeElement).toBe(gear('ws-3'));

    fireEvent.keyDown(gear('ws-3'), { key: 'Home' });
    expect(document.activeElement).toBe(gear('ws-1'));

    fireEvent.keyDown(gear('ws-1'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(gear('ws-2'));
    expect(['ws-1', 'ws-2', 'ws-3'].map((id) => gear(id).getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);

    fireEvent.keyDown(gear('ws-2'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(row('ws-2'));
  });

  it('crosses from the last row to its own gear and back', async () => {
    await openThree();

    fireEvent.keyDown(search(), { key: 'ArrowDown' });
    fireEvent.keyDown(row('ws-1'), { key: 'End' });
    expect(document.activeElement).toBe(row('ws-3'));

    fireEvent.keyDown(row('ws-3'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(gear('ws-3'));

    fireEvent.keyDown(gear('ws-3'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(row('ws-3'));
  });

  it('keeps focus on the only row of a one-row filtered column', async () => {
    await openThree();

    // Type-ahead from a row: only "Gamma LLC" contains a "g".
    fireEvent.keyDown(search(), { key: 'ArrowDown' });
    fireEvent.keyDown(row('ws-1'), { key: 'G' });
    expect(screen.queryByTestId('workspace-item-ws-1')).toBeNull();
    expect(screen.queryByTestId('workspace-item-ws-2')).toBeNull();

    fireEvent.keyDown(search(), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(row('ws-3'));

    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
      fireEvent.keyDown(row('ws-3'), { key });
      expect(document.activeElement, key).toBe(row('ws-3'));
    }

    fireEvent.keyDown(row('ws-3'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(gear('ws-3'));
    fireEvent.keyDown(gear('ws-3'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(gear('ws-3'));
  });

  it('leaves focus and the roving row untouched when the gear column is empty', async () => {
    const { container } = await openThree({ withSettings: false });
    expect(container.querySelectorAll('.ds-workspace-switcher__settings').length).toBe(0);

    fireEvent.keyDown(search(), { key: 'ArrowDown' });
    fireEvent.keyDown(row('ws-1'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(row('ws-2'));

    fireEvent.keyDown(row('ws-2'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(row('ws-2'));
    expect(['ws-1', 'ws-2', 'ws-3'].map((id) => row(id).getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    expect(rowFrame('ws-2')).toHaveAttribute('data-focused', 'true');
  });
});
