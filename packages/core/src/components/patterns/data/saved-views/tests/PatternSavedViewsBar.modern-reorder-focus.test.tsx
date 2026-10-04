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

const handleRules = (rules: Rule[]) =>
  rules
    .filter((rule) => rule.selector.includes("[data-part='drag-handle']"))
    .map((rule) => [rule.selector, declarations(rule.body)]);

const HANDLE = ".ds-pattern-saved-views.ds-engine-modern .ds-saved-views__drag-handle[data-part='drag-handle']";
const FOCUSED = `${HANDLE}:is([data-state~='focus-visible'], :focus-visible)`;

describe('ModernSavedViewsBar — the reorder grip wears the tenant focus signature', () => {
  it('renders the grip as a tab stop of its own, outside every composed Button', () => {
    const { container } = render(
      <ModernSavedViewsBar
        views={[
          { id: 'view-1', name: 'All Items', isDefault: true, config: {} },
          { id: 'view-2', name: 'Active Only', config: {} },
        ]}
        activeViewId="view-1"
        onViewSelect={vi.fn()}
        onViewReorder={vi.fn()}
      />,
    );

    const grips = [...container.querySelectorAll<HTMLElement>('[data-part="drag-handle"]')];
    expect(grips).toHaveLength(2);
    for (const grip of grips) {
      expect(grip.tagName).toBe('SPAN');
      expect(grip).toHaveAttribute('role', 'button');
      expect(grip.tabIndex).toBe(0);
      expect(grip).toHaveClass('ds-saved-views__drag-handle');
      expect(grip).not.toHaveClass('ds-button');
      expect(grip.closest('.ds-button')).toBeNull();
    }
  });

  it('paints the signature at full strength under keyboard focus, never a solid outline', () => {
    expect(handleRules(AUTHORED)).toEqual([
      [
        HANDLE,
        [
          'display: inline-flex',
          'flex-shrink: 0',
          'align-items: center',
          'opacity: var(--ds-saved-views-drag-handle-opacity, 0.4)',
          'cursor: grab',
        ],
      ],
      [
        FOCUSED,
        [
          'border-radius: var(--ds-saved-views-focus-ring-radius, var(--ds-radius-sm))',
          'opacity: 1',
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: var(--ds-focus-ring)',
        ],
      ],
    ]);
  });

  it('keeps a system-colour outline in forced colors, legible on the Highlight-filled active pill', () => {
    expect(handleRules(rulesOf(FORCED))).toEqual([
      [
        FOCUSED,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: none',
        ],
      ],
      [
        ".ds-pattern-saved-views.ds-engine-modern .ds-saved-views__pill[data-part='pill'][data-active='true'] .ds-saved-views__drag-handle[data-part='drag-handle']:is([data-state~='focus-visible'], :focus-visible)",
        ['outline-color: HighlightText'],
      ],
    ]);
  });
});
