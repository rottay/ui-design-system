import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { Transfer } from '../transfer';
import { ColorPicker } from '../color-picker';
import { renderWithEngine } from '@tests/support/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint C -- the pickers/movers family skins are real unlayered
// stylesheets. The screenshot baselines prove the shipped surfaces look
// identical at rest and in the photographed states; they cannot prove the
// STRUCTURAL contract this migration created: paint lives in the skins, every
// painting border rule clears the P-48 tenant floor at (0,4,0), the portal
// panels (DatePicker/time-picker/ColorPicker-rustic) are scoped on their OWN
// self-sufficient, engine-tagged panel class (they are NOT DOM descendants of
// the trigger), the per-mount keyframes were renamed into the skins, and the
// runtime swatch/progress colours ride a custom-property hatch, not inline.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const CSS = join(here, '../../../../foundation/tokens/css');
const read = (p: string) => readFileSync(join(CSS, p), 'utf8');

/** Modern transfer, color-picker, time-picker and date-picker are measured by the family-cut gate and proven in a browser (WO-FAM-03). */
const SKINS: Record<string, string> = {
  'modern/upload': read('runtime/engines/modern/skin/upload/index.css'),
  'rustic/upload': read('runtime/engines/rustic/skin/upload/index.css'),
  'rustic/transfer': read('runtime/engines/rustic/skin/transfer/index.css'),
  'rustic/color-picker': read('runtime/engines/rustic/skin/color-picker/index.css'),
  'rustic/time-picker': read('runtime/engines/rustic/skin/time-picker/index.css'),
  'rustic/date-picker': read('runtime/engines/rustic/skin/date-picker/index.css'),
  'modern/progress': read('runtime/engines/modern/skin/progress/index.css'),
  'rustic/progress': read('runtime/engines/rustic/skin/progress/index.css'),
};
/** Comment-stripped copies -- keyframe/posture pins must not match header prose. */
const NC: Record<string, string> = Object.fromEntries(
  Object.entries(SKINS).map(([k, v]) => [k, v.replace(/\/\*[\s\S]*?\*\//g, '')]),
);

function cssRules(css: string): Array<{ selector: string; body: string }> {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const noAtRules = noComments.replace(/@[\w-]+[^{]*\{(?:[^{}]|\{[^}]*\})*\}/g, '');
  const rules: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noAtRules)) !== null) rules.push({ selector: m[1].trim(), body: m[2].trim() });
  return rules;
}
/**
 * Split a selector LIST on top-level commas only. `:is([data-part="root"],
 * [data-part="dropdown"])` -- the two-door idiom a portaled panel needs so the
 * same chrome paints in the field and inside the panel -- is one selector, not
 * two; splitting inside it invents fragments that belong to no rule.
 */
function splitSelectorList(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of selector) {
    if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

/** Functional pseudo-classes whose specificity is the MAX of their arguments. */
const ARG_MAX_PSEUDOS = new Set([':is', ':matches', ':-moz-any', ':-webkit-any', ':has', ':not']);

/**
 * The specificity "b" column (classes + attributes + pseudo-classes) for one
 * comma-free selector, per the CSS selector-specificity rules rather than a
 * token count: `:is()`/`:not()`/`:has()` contribute the MAX of their argument
 * list, `:where()` contributes nothing, and a `::pseudo-element` lives in the
 * "c" column and contributes nothing here.
 */
function bColumn(selector: string): number {
  let total = 0;
  let i = 0;
  while (i < selector.length) {
    const ch = selector[i];
    if (ch === '[') {
      const end = selector.indexOf(']', i);
      total += 1;
      i = end === -1 ? selector.length : end + 1;
      continue;
    }
    if (ch === '.') {
      const klass = /^\.[A-Za-z_-][\w-]*/.exec(selector.slice(i));
      if (klass) {
        total += 1;
        i += klass[0].length;
        continue;
      }
      i += 1;
      continue;
    }
    if (ch === ':') {
      const isElement = selector[i + 1] === ':';
      const head = /^:{1,2}([A-Za-z-]+)/.exec(selector.slice(i));
      if (!head) {
        i += 1;
        continue;
      }
      let j = i + head[0].length;
      let args: string | null = null;
      if (selector[j] === '(') {
        const start = j;
        let depth = 0;
        while (j < selector.length) {
          if (selector[j] === '(') depth += 1;
          else if (selector[j] === ')') {
            depth -= 1;
            if (depth === 0) {
              j += 1;
              break;
            }
          }
          j += 1;
        }
        args = selector.slice(start + 1, j - 1);
      }
      const name = `:${head[1].toLowerCase()}`;
      if (isElement) {
        // pseudo-element: "c" column, contributes nothing to "b".
      } else if (name === ':where') {
        // :where() is specificity-zero by definition.
      } else if (args !== null && ARG_MAX_PSEUDOS.has(name)) {
        const inner = splitSelectorList(args).map(bColumn);
        total += inner.length ? Math.max(...inner) : 0;
      } else {
        total += 1;
      }
      i = j;
      continue;
    }
    i += 1;
  }
  return total;
}

function paintsBorder(body: string): boolean {
  const re = /(?:^|[\s;{])border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?\s*:\s*([^;]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const value = m[1].trim().toLowerCase();
    if (value.startsWith('none') || value.startsWith('0') || value === 'unset' || value === 'inherit') continue;
    if (/^border-(?:radius|width|style|spacing|collapse|image)/.test(value)) continue;
    return true;
  }
  return false;
}

// The floor is only as trustworthy as the model that measures it: a checker
// that splits inside `:not(:is(...))` invents offenders, and one that credits
// `:where()` hides real ones. Both directions are pinned here.
describe('pickers skin specificity model', () => {
  it('splits a selector list on top-level commas only', () => {
    expect(splitSelectorList('.a, .b')).toEqual(['.a', '.b']);
    expect(splitSelectorList("button:not(:is([data-state~='disabled'], :disabled))")).toEqual([
      "button:not(:is([data-state~='disabled'], :disabled))",
    ]);
  });

  it('scores :is()/:not() as the max of their arguments and :where() as zero', () => {
    expect(
      bColumn(
        ".ds-upload.ds-upload--modern[data-part='root'] [data-part='trigger'] button:is([data-state~='pressed'], :active):not(:is([data-state~='disabled'], :disabled))",
      ),
    ).toBe(6);
    expect(bColumn(".a.b:where([data-part='x'], .c)")).toBe(2);
    expect(bColumn('.a:not(.b.c)')).toBe(3);
  });
});

describe.each(Object.keys(SKINS))('pickers skin %s -- structural contract', (label) => {
  const rules = cssRules(SKINS[label]);

  it('parses into a non-trivial set of rules', () => {
    expect(rules.length).toBeGreaterThan(0);
  });

  it('every painting border rule reaches specificity (0,4,0)', () => {
    const offenders: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      for (const part of splitSelectorList(selector)) if (bColumn(part) < 4) offenders.push(part);
    }
    expect(offenders, `below (0,4,0), lose color to the tenant * floor (P-48):\n${offenders.join('\n')}`).toEqual([]);
  });

  it('buys the 4th unit from data-part/data-*/class, never role/aria-label/placeholder', () => {
    const incidental: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      if (/\[(?:role|aria-label|placeholder)\b/.test(selector)) incidental.push(selector);
    }
    expect(incidental).toEqual([]);
  });
});

describe('pickers skins -- portal posture + keyframe + hatch pins', () => {
  it('DatePicker rustic panel is scoped on its own engine-tagged panel class', () => {
    expect(/\.rottay-datepicker-panel--rustic\b/.test(NC['rustic/date-picker'])).toBe(true);
  });

  it('ColorPicker rustic dropdown stays standalone', () => {
    // rustic portals -> a self-sufficient dropdown class scopes its rules.
    expect(/\.rottay-colorpicker__dropdown\b/.test(NC['rustic/color-picker'])).toBe(true);
  });

  it('renames the per-mount keyframes into the skins (ds-date-picker-*/ds-time-picker-*), never the old names', () => {
    expect(/@keyframes\s+ds-date-picker-panel-in\b/.test(NC['rustic/date-picker'])).toBe(true);
    const all = Object.values(NC).join('\n');
    expect(/@keyframes\s+rottay-select-slide-in\b/.test(all)).toBe(false);
    expect(/@keyframes\s+rottay-dp-panel-in\b/.test(all)).toBe(false);
  });

  it('routes the runtime swatch/progress colours through a custom-property hatch', () => {
    expect(/var\(--ds-colorpicker-swatch-color\)/.test(NC['rustic/color-picker'])).toBe(true);
    // Upload composes Progress; the runtime override therefore travels through
    // Progress's canonical hatch instead of duplicating an Upload-only one.
    expect(/var\(--ds-progress-arc-color/.test(NC['modern/progress'])).toBe(true);
    expect(/var\(--ds-progress-arc-color/.test(NC['rustic/progress'])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// The DOM carries the contract, not the paint (in-tree components, both engines).
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function firstPart(container: HTMLElement, part: string): Promise<HTMLElement> {
  await waitFor(() => expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull());
  return container.querySelector<HTMLElement>(`[data-part="${part}"]`)!;
}

describe.each(ENGINES)('pickers DOM carries the contract, not the paint -- %s engine', (engine) => {
  it('Transfer panel + move-button paint nothing inline', async () => {
    const { container } = renderWithEngine(
      <Transfer
        dataSource={[
          { key: 'a', title: 'Alpha' },
          { key: 'b', title: 'Beta' },
        ]}
        targetKeys={['b']}
      />,
      engine,
    );
    const panel = await firstPart(container, 'panel');
    expect(panel.style.background, `${engine} panel background inline`).toBe('');
    expect(panel.style.borderColor, `${engine} panel border-color inline`).toBe('');
    const moveButton = await firstPart(container, 'move-button');
    expect(moveButton.style.background, `${engine} move-button background inline`).toBe('');
    expect(moveButton.style.boxShadow, `${engine} move-button box-shadow inline`).toBe('');
    expect(moveButton.style.transform, `${engine} move-button transform inline`).toBe('');
  });

  it('ColorPicker swatch carries only the custom-property hatch, not an inline background literal', async () => {
    const { container } = renderWithEngine(<ColorPicker value="#ff0000" />, engine);
    const swatch = await firstPart(container, 'swatch');
    expect(swatch.style.background, `${engine} swatch background inline`).toBe('');
    expect(swatch.style.backgroundColor, `${engine} swatch background-color inline`).toBe('');
    expect(swatch.style.getPropertyValue(engine === 'modern' ? '--ds-color-picker-swatch-color' : '--ds-colorpicker-swatch-color')).toBe('#ff0000');
  });
});
