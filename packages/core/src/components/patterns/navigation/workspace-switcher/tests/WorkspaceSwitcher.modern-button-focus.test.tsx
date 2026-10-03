import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernWorkspaceSwitcher from '../engines/modern';

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
      const nodes = [...container.querySelectorAll(`[data-part="${part}"]`)];
      expect(nodes.length, part).toBeGreaterThan(0);
      for (const node of nodes) {
        expect(node.tagName).toBe('BUTTON');
        expect(node).toHaveClass('ds-button', 'ds-button--modern');
        expect(node).toHaveAttribute('data-variant');
      }
    }
    // One gear per row; the roving row keeps exactly one of them in the tab order.
    const gears = [...container.querySelectorAll('[data-part="settings"]')];
    expect(gears.map((gear) => gear.getAttribute('tabindex'))).toEqual(['0', '-1']);
  });

  it('paints no focus indicator of its own on the composed Buttons', () => {
    for (const part of BUTTON_PARTS) {
      const named = [...AUTHORED, ...rulesOf(FORCED)].filter((rule) =>
        new RegExp(`\\[data-part='${part}'\\](?![^,]*\\[data-part=)`).test(rule.selector),
      );
      expect(named.length).toBeGreaterThan(0);
      for (const rule of named) {
        expect(paintsFocusIndicator(rule), rule.selector).toBe(false);
      }
    }
  });

  it('carries the row focus signature on an overlay inset by its reach', () => {
    const ITEM_FOCUS =
      ".ds-pattern-workspace-switcher.ds-engine-modern [data-part='item']:is([data-state~='focus-visible'], :focus-visible)";
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
      (rule) => rule.selector.includes("[data-part='settings']:is([data-state~='focus-visible'], :focus-visible)"),
    );
    expect(reveal && declarations(reveal.body)).toEqual(['opacity: 1']);
  });
});
