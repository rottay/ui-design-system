import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const CSS_ROOT = join(__dirname, '../../../../../foundation/tokens/css');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const SKIN = strip(readFileSync(join(CSS_ROOT, 'runtime/engines/modern/skin/button/index.css'), 'utf8'));

interface Rule {
  selector: string;
  body: string;
}

const rulesOf = (css: string): Rule[] =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: (match[1] as string).trim().replace(/\s+/g, ' '),
    body: match[2] as string,
  }));

const declarations = (body: string): [string, string][] =>
  body
    .split(';')
    .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .map((declaration) => {
      const colon = declaration.indexOf(':');
      return [declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()];
    });

const RULES = rulesOf(SKIN);
const ROOT = '.ds-button.ds-button--modern';

describe('the Button focus offset is a bare root alias of the signature offset', () => {
  const OFFSET = '--ds-button-focus-ring-offset';

  function sheets(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        return /(^|\/)(facade\/artifacts|engines\/(classic|rustic))$/.test(relative(CSS_ROOT, path)) ? [] : sheets(path);
      }
      return path.endsWith('.css') ? [path] : [];
    });
  }

  it('is declared once, at the root, so every scope that states the signature restates it', () => {
    const declared = sheets(CSS_ROOT).flatMap((path) => {
      const css = strip(readFileSync(path, 'utf8'));
      return [...css.matchAll(new RegExp(`(^|[;{\\s])${OFFSET}\\s*:\\s*([^;}]+)`, 'g'))].map((match) => [
        relative(CSS_ROOT, path),
        (match[2] as string).trim(),
      ]);
    });
    expect(declared).toEqual([['presentation/components/button/index.css', 'var(--ds-focus-ring-offset, 2px)']]);
  });

  it('is the offset both focus arms read, in normal and in forced colors', () => {
    const FOCUS = `${ROOT}[data-variant]:is( [data-state~='focus-visible'], :focus-visible )`;
    const arms = RULES.filter((rule) => rule.selector === FOCUS).map((rule) => declarations(rule.body));
    expect(arms).toEqual([
      [
        ['outline', 'var(--ds-button-border-width-focus) solid transparent'],
        ['outline-offset', `var(${OFFSET})`],
        ['box-shadow', 'var(--ds-button-focus-ring)'],
      ],
      [
        ['outline', 'var(--ds-button-border-width-focus) solid Highlight'],
        ['outline-offset', `var(${OFFSET})`],
      ],
    ]);
  });
});
