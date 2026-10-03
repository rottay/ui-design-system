import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSavedViewsBar from '../engines/modern';

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
      const nodes = [...container.querySelectorAll(`[data-part="${part}"]`)];
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
    // A family outline tied the Button ring rule and drew a solid contour over
    // the `underline` and `glow` signatures.
    for (const part of BUTTON_PARTS) {
      const named = [...AUTHORED, ...rulesOf(FORCED)].filter((rule) =>
        rule.selector.includes(`[data-part='${part}']`),
      );
      expect(named.length).toBeGreaterThan(0);
      for (const rule of named) {
        expect(paintsFocusIndicator(rule), rule.selector).toBe(false);
      }
    }
  });

  it('keeps the pill focus corner on its tenant channel so the signature follows it', () => {
    const pillFocus = AUTHORED.filter(
      (rule) => rule.selector.includes("[data-part='pill-select']") && /focus-visible/.test(rule.selector),
    );
    expect(pillFocus.map((rule) => declarations(rule.body))).toEqual([
      ['border-radius: var(--ds-saved-views-focus-ring-radius, var(--ds-radius-sm))'],
    ]);
  });
});
