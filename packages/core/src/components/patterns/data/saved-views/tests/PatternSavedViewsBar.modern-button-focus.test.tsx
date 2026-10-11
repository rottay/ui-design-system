import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSavedViewsBar from '../engines/modern';


/** P-88: these controls are composed Buttons that keep their own `trigger` part; each is found by its owner class hook. */
const BUTTON_DOORS: Record<string, string> = {
  'create-button': '.ds-saved-views__create-button',
  'menu-trigger': '.ds-saved-views__menu-trigger',
  'pill-select': '.ds-saved-views__pill-select',
};
const partSelector = (part: string, engine: string) => (engine === 'modern' && BUTTON_DOORS[part]) || `[data-part="${part}"]`;
const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css',
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

const BUTTON_PARTS = ['pill-select', 'menu-trigger', 'create-button'];

describe('ModernSavedViewsBar — composed controls wear the Button focus signature', () => {
  it('renders the pill, its menu trigger and the create control as tab-reachable DS Buttons', () => {
    const { container } = render(
      <ModernSavedViewsBar
        views={[
          { id: 'view-1', name: 'All Items', isDefault: true, config: {} },
          { id: 'view-2', name: 'Active Only', config: {} },
        ]}
        activeViewId="view-1"
        onViewSelect={vi.fn()}
        onViewRename={vi.fn()}
        onViewCreate={vi.fn()}
        allowRename
        allowCreate
      />,
    );

    for (const part of BUTTON_PARTS) {
      const nodes = [...container.querySelectorAll(partSelector(part, 'modern'))];
      expect(nodes.length, part).toBeGreaterThan(0);
      for (const node of nodes) {
        expect(node.tagName).toBe('BUTTON');
        expect(node).toHaveClass('ds-button', 'ds-button--modern');
        expect(node).toHaveAttribute('data-variant');
        expect(node).not.toHaveAttribute('tabindex', '-1');
      }
    }
  });

  it('paints no focus indicator of its own on the composed Buttons', () => {
    for (const part of BUTTON_PARTS) {
      const named = [...AUTHORED, ...rulesOf(FORCED)].filter((rule) =>
        rule.selector.includes(`.ds-saved-views__${part}`),
      );
      expect(named.length).toBeGreaterThan(0);
      for (const rule of named) {
        expect(paintsFocusIndicator(rule), rule.selector).toBe(false);
      }
    }
  });

  it('keeps the pill focus corner on its tenant channel so the signature follows it', () => {
    const pillFocus = AUTHORED.filter(
      (rule) => rule.selector.includes('.ds-saved-views__pill-select') && /focus-visible/.test(rule.selector),
    );
    expect(pillFocus.map((rule) => declarations(rule.body))).toEqual([
      ['border-radius: var(--ds-saved-views-focus-ring-radius, var(--ds-radius-sm))'],
    ]);
  });
});

describe('ModernSavedViewsBar — the rename and create fields wear the Input focus signature', () => {
  const FIELD_PARTS = ['rename-input', 'create-input'];
  // P-88 (owner ruling 2026-10-06): the Input className lands on the field wrapper, not on the shell that carries
  // the caller part, so the skin keys each control as the wrapper's direct child shell.
  const FIELD_ANCHORS: Record<string, string> = {
    'rename-input': ".ds-saved-views__input[data-part='field'] > .ds-input-shell",
    'create-input': ".ds-saved-views__create-input[data-part='field'] > .ds-input-shell",
  };

  it('renders both fields as the unstyled DS Input, stamped by its own engine', () => {
    const props = {
      views: [
        { id: 'view-1', name: 'All Items', isDefault: true, config: {} },
        { id: 'view-2', name: 'Active Only', config: {} },
      ],
      activeViewId: 'view-1',
      onViewSelect: vi.fn(),
      onViewRename: vi.fn(),
      onViewCreate: vi.fn(),
      allowRename: true,
      allowCreate: true,
    };

    const renaming = render(<ModernSavedViewsBar {...props} />);
    act(() => {
      fireEvent.click(screen.getByLabelText('Active Only options'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Rename'));
    });
    const rename = screen.getByLabelText('Rename');
    renaming.unmount();

    render(<ModernSavedViewsBar {...props} />);
    act(() => {
      fireEvent.click(screen.getByTestId('create-view-button'));
    });
    const create = screen.getByTestId('new-view-input');

    for (const [field, part] of [
      [rename, 'rename-input'],
      [create, 'create-input'],
    ] as const) {
      expect(field.tagName).toBe('INPUT');
      expect(field).toHaveClass('ds-input-shell', 'ds-input-shell--modern');
      expect(field).toHaveAttribute('data-variant', 'unstyled');
      // P-88: the primitive keeps its own root part; the caller part never lands,
      // and the field is reached through its class anchor.
      expect(field).toHaveAttribute('data-part', 'root');
      expect(field).not.toHaveAttribute('data-part', part);
      expect(field.matches(FIELD_ANCHORS[part])).toBe(true);
    }
    // The Input skin selects this stamp; the field took focus on mount.
    expect(create).toHaveFocus();
    expect(create.getAttribute('data-state')).toContain('focused');
  });

  it('states no focus rule, outline or shadow of its own on the composed Input', () => {
    for (const part of FIELD_PARTS) {
      const named = [...AUTHORED, ...rulesOf(FORCED)].filter((rule) =>
        rule.selector.includes(FIELD_ANCHORS[part]),
      );
      expect(named.length).toBeGreaterThan(0);
      for (const rule of named) {
        expect(rule.selector, rule.selector).not.toMatch(/focus/);
        expect(paintsFocusIndicator(rule), rule.selector).toBe(false);
        expect(paintsSolidOutline(rule), rule.selector).toBe(false);
        // A reset here would outrank the Input focus rule and void its channel.
        expect(
          declarations(rule.body).filter((declaration) => /^box-shadow\s*:/.test(declaration)),
          rule.selector,
        ).toEqual([]);
      }
    }
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(SKIN).not.toContain('--ds-input-focus-ring');
  });
});
