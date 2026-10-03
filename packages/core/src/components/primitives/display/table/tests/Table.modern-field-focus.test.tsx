import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/table/index.css',
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

const focusOf = (part: string) =>
  `.ds-table.ds-table--modern [data-part='${part}']:is([data-state~='focus-visible'], :focus-visible)`;
const FIELD_FOCUS =
  ".ds-table.ds-table--modern [data-part='field'][data-field]:is([data-state~='focus-visible'], :focus-visible)";
const HEADER_FOCUS =
  ".ds-table.ds-table--modern [data-part='header-cell'][data-sortable='true']:is([data-state~='focus-visible'], :focus-visible)";

const SIGNATURE = [
  'outline: var(--ds-focus-ring-width) solid transparent',
  'outline-offset: var(--ds-focus-ring-offset)',
  'box-shadow: var(--ds-focus-ring)',
];
const CARRIER_HOST = [
  'outline: var(--ds-focus-ring-width) solid transparent',
  'outline-offset: calc(-1 * var(--ds-focus-ring-width))',
];
const FORCED_OUTWARD = [
  'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
  'outline-offset: var(--ds-focus-ring-offset)',
  'box-shadow: none',
];
const FORCED_INSET = [
  'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
  'outline-offset: calc(-1 * max(2px, var(--ds-focus-ring-width)))',
];

function selectorsOf(list: string): string[] {
  const selectors: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of list) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      selectors.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  return [...selectors, current.trim()];
}

const bodiesOf = (rules: Rule[], selector: string) =>
  rules
    .filter((rule) => selectorsOf(rule.selector).includes(selector))
    .map((rule) => declarations(rule.body));

describe('Table modern skin — every focus stop wears the tenant focus signature', () => {
  it('paints no solid focus outline and builds no ring from width and colour', () => {
    expect(AUTHORED.filter((rule) => /focus/.test(rule.selector)).filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
  });

  it('paints the signature directly on the unclipped fields, selection controls and expand buttons', () => {
    expect(bodiesOf(AUTHORED, FIELD_FOCUS)).toEqual([SIGNATURE]);
    expect(bodiesOf(AUTHORED, focusOf('selection-control'))).toEqual([SIGNATURE]);
    expect(bodiesOf(AUTHORED, focusOf('expand-button'))).toEqual([SIGNATURE]);
  });

  it('carries the signature of the clipped sortable header and pager on an overlay inset by its reach', () => {
    expect(bodiesOf(AUTHORED, HEADER_FOCUS)).toEqual([CARRIER_HOST]);
    expect(bodiesOf(AUTHORED, `${HEADER_FOCUS}::after`)).toEqual([
      [
        'position: absolute',
        'inset: calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))',
        "content: ''",
        'box-shadow: var(--ds-focus-ring)',
        'pointer-events: none',
      ],
    ]);
    // A sticky or pinned header keeps its own positioning scheme.
    expect(
      bodiesOf(
        AUTHORED,
        ".ds-table.ds-table--modern [data-part='header-cell'][data-sortable='true']:not([data-sticky='true'], [data-fixed])",
      ),
    ).toEqual([['position: relative']]);

    expect(bodiesOf(AUTHORED, focusOf('pagination-button'))).toEqual([['position: relative', ...CARRIER_HOST]]);
    expect(bodiesOf(AUTHORED, `${focusOf('pagination-button')}::after`)).toEqual([
      [
        'position: absolute',
        'inset: calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))',
        "content: ''",
        'border-radius: max(0px, calc(var(--ds-radius-md) - var(--ds-focus-ring-offset) - var(--ds-focus-ring-width)))',
        'box-shadow: var(--ds-focus-ring)',
        'pointer-events: none',
      ],
    ]);
  });

  it('keeps a system-colour outline on every focus stop in forced colors', () => {
    const forced = rulesOf(FORCED);
    for (const selector of [FIELD_FOCUS, focusOf('selection-control'), focusOf('expand-button')]) {
      expect(bodiesOf(forced, selector), selector).toEqual([FORCED_OUTWARD]);
    }
    for (const selector of [HEADER_FOCUS, focusOf('pagination-button')]) {
      expect(bodiesOf(forced, selector), selector).toEqual([FORCED_INSET]);
      expect(bodiesOf(forced, `${selector}::after`), selector).toEqual([['box-shadow: none']]);
    }
  });
});
