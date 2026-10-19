import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/presentation/components/skin/gallery-view/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

interface Rule {
  selector: string;
  declarations: string[];
}

function rulesOf(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim().replace(/\s+/g, ' '),
    declarations: match[2]
      .split(';')
      .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
      .filter(Boolean),
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

const paintsSolidOutline = (rule: Rule) =>
  rule.declarations.some(
    (declaration) => /^outline\s*:/.test(declaration) && /solid/.test(declaration) && !/transparent/.test(declaration),
  );

/** Commas inside `:is()` / `:where()` / `:not()` separate arguments, not selectors. */
function selectorList(prelude: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buf = '';
  for (const ch of prelude) {
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(buf.replace(/\s+/g, ' ').trim());
      buf = '';
    } else buf += ch;
  }
  parts.push(buf.replace(/\s+/g, ' ').trim());
  return parts;
}

/** An own-block class door (`:is([data-part='p'], .block__p)` or `.block__p`) reads back as `[data-part='p']`;
 *  any other drift is left as written. */
function asPartSelector(selector: string, block: string, parts: readonly string[]): string {
  let read = selector;
  for (const part of parts) {
    const token = `[data-part='${part}']`;
    read = read
      .replace(new RegExp(`:is\\(\\[data-part=(['"])${part}\\1\\],\\s*\\.${block}__${part}\\)`, 'g'), token)
      .replace(new RegExp(`\\.${block}__${part}(?![\\w-])`, 'g'), token);
  }
  return read;
}

/** A rule's selector list read through the card's class door, each distinct member once, in source order:
 *  a pair arm folds back onto the part selector it doubles. */
const throughCardDoor = (selector: string) =>
  [...new Set(selectorList(selector).map((member) => asPartSelector(member, 'ds-gallery-card', ['card'])))].join(', ');

const FORCED = forcedColorsBlock(SKIN);
const AUTHORED = rulesOf(SKIN.replace(FORCED, ''));
const focusRules = (rules: Rule[]) => rules.filter((rule) => rule.selector.includes('focus-visible'));

const FOCUS = ".ds-pattern-gallery-view .ds-gallery-card:is([data-state~='focus-visible'], :focus-visible)";

describe('PatternGalleryView — the card wears the tenant focus signature', () => {
  it('carries the signature on an overlay inset by its reach, never a solid outline', () => {
    expect(focusRules(AUTHORED).filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRules(AUTHORED)).toEqual([
      {
        selector: FOCUS,
        declarations: [
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
        ],
      },
      {
        selector: `${FOCUS}::after`,
        declarations: [
          'position: absolute',
          'inset: calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))',
          "content: ''",
          'border-radius: inherit',
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
        ],
      },
    ]);
  });

  it('hosts the overlay on a positioned card', () => {
    const shell = AUTHORED.find(
      (rule) => throughCardDoor(rule.selector) === ".ds-pattern-gallery-view .ds-gallery-card[data-part='card']",
    );
    expect(shell?.declarations).toContain('position: relative');
  });

  it('keeps a system-colour outline in forced colors', () => {
    expect(focusRules(rulesOf(FORCED)).map((rule) => ({ ...rule, selector: throughCardDoor(rule.selector) }))).toEqual([
      {
        selector: ".ds-pattern-gallery-view .ds-gallery-card[data-part='card']:is([data-state~='focus-visible'], :focus-visible)",
        declarations: [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
        ],
      },
      { selector: `${FOCUS}::after`, declarations: ['box-shadow: none'] },
    ]);
  });
});
