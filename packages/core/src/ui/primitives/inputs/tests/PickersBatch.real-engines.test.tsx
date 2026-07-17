import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { Transfer } from '../Transfer';
import { ColorPicker } from '../ColorPicker';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint C -- the pickers/movers family skins are real unlayered
// stylesheets. The screenshot baselines prove the shipped surfaces look
// identical at rest and in the photographed states; they cannot prove the
// STRUCTURAL contract this migration created: paint lives in the skins, every
// painting border rule clears the P-48 tenant floor at (0,4,0), the portal
// panels (DatePicker/TimePicker/ColorPicker-rustic) are scoped on their OWN
// self-sufficient, engine-tagged panel class (they are NOT DOM descendants of
// the trigger), the per-mount keyframes were renamed into the skins, and the
// runtime swatch/progress colours ride a custom-property hatch, not inline.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const CSS = join(here, '../../../../foundation/tokens/css');
const read = (p: string) => readFileSync(join(CSS, p), 'utf8');

const SKINS: Record<string, string> = {
  'modern/upload': read('engines/modern/skin/upload.css'),
  'rustic/upload': read('engines/rustic/skin/upload.css'),
  'modern/transfer': read('engines/modern/skin/transfer.css'),
  'rustic/transfer': read('engines/rustic/skin/transfer.css'),
  'modern/color-picker': read('engines/modern/skin/color-picker.css'),
  'rustic/color-picker': read('engines/rustic/skin/color-picker.css'),
  'modern/time-picker': read('engines/modern/skin/time-picker.css'),
  'rustic/time-picker': read('engines/rustic/skin/time-picker.css'),
  'modern/date-picker': read('engines/modern/skin/date-picker.css'),
  'rustic/date-picker': read('engines/rustic/skin/date-picker.css'),
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
function bColumn(selector: string): number {
  const classes = (selector.match(/\.[A-Za-z_-][\w-]*/g) || []).length;
  const attrs = (selector.match(/\[[^\]]*\]/g) || []).length;
  const pseudos = (selector.match(/(?<!:):[A-Za-z-]+/g) || []).length;
  const notArgs = (selector.match(/:not\(([^)]*)\)/g) || []).reduce((n, frag) => n + bColumn(frag.slice(5, -1)), 0);
  return classes + attrs + pseudos + notArgs;
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

describe.each(Object.keys(SKINS))('pickers skin %s -- structural contract', (label) => {
  const rules = cssRules(SKINS[label]);

  it('parses into a non-trivial set of rules', () => {
    expect(rules.length).toBeGreaterThan(0);
  });

  it('every painting border rule reaches specificity (0,4,0)', () => {
    const offenders: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      for (const part of selector.split(',')) if (bColumn(part) < 4) offenders.push(part.trim());
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
  it('DatePicker/TimePicker panels are scoped on their own engine-tagged panel class (standalone, not under a trigger root)', () => {
    expect(/\.rottay-datepicker-panel--modern[^,{]*\[data-part='panel'\]/.test(NC['modern/date-picker'])).toBe(true);
    expect(/\.rottay-datepicker-panel--rustic\b/.test(NC['rustic/date-picker'])).toBe(true);
    expect(/\.rottay-timepicker__panel\b/.test(NC['modern/time-picker'])).toBe(true);
  });

  it('ColorPicker preserves the portal asymmetry: rustic dropdown standalone, modern in-tree', () => {
    // rustic portals -> a self-sufficient dropdown class scopes its rules.
    expect(/\.rottay-colorpicker__dropdown\b/.test(NC['rustic/color-picker'])).toBe(true);
    // modern is in-tree -> its dropdown rules hang off the component root, never a portaled dropdown class.
    expect(/\.rottay-colorpicker__dropdown\b/.test(NC['modern/color-picker'])).toBe(false);
  });

  it('renames the per-mount keyframes into the skins (ds-date-picker-*/ds-time-picker-*), never the old names', () => {
    expect(/@keyframes\s+ds-date-picker-slide-in\b/.test(NC['modern/date-picker'])).toBe(true);
    expect(/@keyframes\s+ds-date-picker-panel-in\b/.test(NC['rustic/date-picker'])).toBe(true);
    expect(/@keyframes\s+ds-time-picker-slide-in\b/.test(NC['modern/time-picker'])).toBe(true);
    const all = Object.values(NC).join('\n');
    expect(/@keyframes\s+rottay-select-slide-in\b/.test(all)).toBe(false);
    expect(/@keyframes\s+rottay-dp-panel-in\b/.test(all)).toBe(false);
  });

  it('routes the runtime swatch/progress colours through a custom-property hatch', () => {
    expect(/var\(--ds-colorpicker-swatch-color\)/.test(NC['modern/color-picker'])).toBe(true);
    expect(/var\(--ds-colorpicker-swatch-color\)/.test(NC['rustic/color-picker'])).toBe(true);
    expect(/var\(--ds-upload-progress-fill\)/.test(NC['modern/upload'])).toBe(true);
    expect(/var\(--ds-upload-progress-fill\)/.test(NC['rustic/upload'])).toBe(true);
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
    expect(swatch.style.getPropertyValue('--ds-colorpicker-swatch-color')).toBe('#ff0000');
  });
});
