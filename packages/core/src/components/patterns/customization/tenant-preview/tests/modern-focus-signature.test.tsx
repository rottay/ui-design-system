import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { TenantCreationConfig } from '../../../../../infrastructure/runtime/tenant/runtime/authoring/configuration';
import ModernTenantPreview from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tenant-preview/index.css',
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
    (declaration) =>
      /^outline\s*:/.test(declaration) && /solid/.test(declaration) && !/transparent/.test(declaration),
  );

const focusRulesOf = (rules: Rule[]) =>
  rules
    .filter((rule) => /focus/.test(rule.selector))
    .map((rule): [string, string[]] => [rule.selector, declarations(rule.body)]);

const TABLE_SCROLL_FOCUS =
  ".ds-pattern-tenant-preview.ds-engine-modern [data-part=\"table-scroll\"]:is([data-state~='focus-visible'], :focus-visible)";

const config: TenantCreationConfig = { name: 'Acme', slug: 'acme', primaryColor: '#3b82f6' };

describe('ModernTenantPreview — the sample table region wears the previewed focus signature', () => {
  it('owns one tab stop, the scroll region, inside the previewed scope', () => {
    const { container } = render(<ModernTenantPreview config={config} />);

    const region = screen.getByRole('group', { name: 'Table' });
    expect(region).toHaveAttribute('data-part', 'table-scroll');
    expect(region).toHaveAttribute('tabindex', '0');

    const scope = region.closest('[data-ds-tenant-preview-root]');
    expect(scope).toHaveAttribute('data-part', 'root');
    expect(scope).toHaveClass('ds-pattern-tenant-preview', 'ds-engine-modern');

    const ownStops = Array.from(container.querySelectorAll<HTMLElement>('[tabindex]')).filter(
      (node) => node.closest('.ds-button, .ds-input, .ds-card') === null,
    );
    expect(ownStops).toEqual([region]);
  });

  it('paints the signature, never a solid outline built from width and colour', () => {
    const focusRules = AUTHORED.filter((rule) => /focus/.test(rule.selector));

    expect(focusRules.filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRulesOf(AUTHORED)).toEqual([
      [
        TABLE_SCROLL_FOCUS,
        [
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: var(--ds-focus-ring)',
        ],
      ],
    ]);
  });

  it('keeps a system-colour outline for forced colors, where the signature is dropped', () => {
    expect(focusRulesOf(rulesOf(FORCED))).toEqual([
      [
        TABLE_SCROLL_FOCUS,
        [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
          'box-shadow: none',
        ],
      ],
    ]);
  });
});
