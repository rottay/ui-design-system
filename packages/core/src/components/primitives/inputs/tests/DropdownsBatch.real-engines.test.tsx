import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { Select } from '../select';
import { TreeSelect } from '../tree-select';
import { Cascader } from '../cascader';
import { AutoComplete } from '../auto-complete';
import { Mentions } from '../mentions';
import { renderWithEngine } from '@tests/support/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint B -- the dropdown family skins are real unlayered
// stylesheets, one per engine (plus an agnostic home for the Select compound).
// The screenshot baselines (dropdowns-batch.spec.ts) prove the shipped look is
// identical at rest, in every open popup and in the photographed interaction
// states; they cannot prove the STRUCTURAL contract this migration created:
// that the paint lives in the skins (not inline), that every painting border
// rule clears the P-48 tenant `*` floor at (0,4,0), that every PORTALED popup
// tree is skinned by STANDALONE selectors on its own panel/popup scope rather
// than root-descendant rules (which cannot match a body-mounted portal), that
// the removed imperative hover/focus handlers now live as `:hover`/`:focus`
// rules carrying the same literals, that per-mount keyframes were renamed into
// the skins, and that the DOM carries no inline paint on the migrated parts --
// closed or OPEN. This mirrors FieldsBatch.real-engines.test.tsx.
//
// WO-CAN-05 moved the five Modern panels onto the overlay kernel, so the
// posture table this file pins is now (identical to the one
// DropdownsBatch.contract.test.tsx asserts on the DOM):
//
//   Select        modern kernel-portals, rustic in-tree
//   TreeSelect    both portal, by two DIFFERENT doors
//   Cascader      both portal, by two DIFFERENT doors
//   AutoComplete  modern kernel-portals, rustic in-tree
//   Mentions      modern kernel-portals, rustic in-tree
//
// A Modern panel is no longer a descendant of the field root, so its skin
// addresses it through the standalone `.ds-<family>-panel` scope class the
// engine stamps, and every painted part inside it still reaches (0,4,0) as
// two root classes + the panel class (or the panel's own `[data-part]`) plus
// the part's `[data-part]`.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const CSS = join(here, '../../../../foundation/tokens/css');
const read = (p: string) => readFileSync(join(CSS, p), 'utf8');

/** Every new skin file this checkpoint added, keyed by a readable label. */
const SKINS: Record<string, string> = {
  'modern/select': read('runtime/engines/modern/skin/select/index.css'),
  'rustic/select': read('runtime/engines/rustic/skin/select/index.css'),
  'modern/tree-select': read('runtime/engines/modern/skin/tree-select/index.css'),
  'rustic/tree-select': read('runtime/engines/rustic/skin/tree-select/index.css'),
  'modern/cascader': read('runtime/engines/modern/skin/cascader/index.css'),
  'rustic/cascader': read('runtime/engines/rustic/skin/cascader/index.css'),
  'modern/autocomplete': read('runtime/engines/modern/skin/autocomplete/index.css'),
  'rustic/autocomplete': read('runtime/engines/rustic/skin/autocomplete/index.css'),
  'modern/mentions': read('runtime/engines/modern/skin/mentions/index.css'),
  'rustic/mentions': read('runtime/engines/rustic/skin/mentions/index.css'),
  'select-compounds': read('presentation/components/skin/select-compounds/index.css'),
};

/** Strip comments and `@keyframes` blocks, then return every `{selector, body}` rule. */
function cssRules(css: string): Array<{ selector: string; body: string }> {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const noAtRules = noComments.replace(/@[\w-]+[^{]*\{(?:[^{}]|\{[^}]*\})*\}/g, '');
  const rules: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noAtRules)) !== null) {
    rules.push({ selector: m[1].trim(), body: m[2].trim() });
  }
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

/** True if the declaration block sets a border COLOR (paints), not a `none`/`0` reset. */
function paintsBorder(body: string): boolean {
  const re =
    /(?:^|[\s;{])border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?\s*:\s*([^;]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const value = m[1].trim().toLowerCase();
    if (value.startsWith('none') || value.startsWith('0') || value === 'unset' || value === 'inherit')
      continue;
    if (/^border-(?:radius|width|style|spacing|collapse|image)/.test(value)) continue;
    return true;
  }
  return false;
}

/** True when a declaration block paints the target rather than sizing/positioning it. */
function paintsSurface(body: string): boolean {
  return /(?:^|;)\s*(?:background(?:-color|-image)?|border(?:-[\w-]+)?|box-shadow|color|opacity|filter|outline(?:-[\w-]+)?)\s*:/i.test(
    body,
  );
}

// The floor above is only as trustworthy as the model that measures it: a
// checker that miscounts `:is()` invents offenders, and one that credits
// `:where()` hides real ones. Both directions are pinned here.
describe('dropdown skin specificity model', () => {
  it('splits a selector list on top-level commas only', () => {
    expect(splitSelectorList('.a, .b')).toEqual(['.a', '.b']);
    expect(
      splitSelectorList('.x:is([data-part="root"], [data-part="dropdown"]) [data-part="trigger"]'),
    ).toEqual(['.x:is([data-part="root"], [data-part="dropdown"]) [data-part="trigger"]']);
    expect(splitSelectorList('.x:is(.a, .b), .y')).toEqual(['.x:is(.a, .b)', '.y']);
  });

  it('scores :is()/:not()/:has() as the max of their arguments and :where() as zero', () => {
    expect(bColumn('.a.b[data-part="x"]')).toBe(3);
    // The two-door idiom keeps the floor: 2 classes + :is(...) + the part.
    expect(
      bColumn('.a.b:is([data-part="root"], [data-part="dropdown"]) [data-part="trigger"]'),
    ).toBe(4);
    expect(bColumn(':is(.a.b.c, .d)')).toBe(3);
    expect(bColumn(':where(.a.b.c)')).toBe(0);
    expect(bColumn(':not(.a[data-x])')).toBe(2);
    expect(bColumn('[data-part="x"]::placeholder')).toBe(1);
    expect(bColumn('[data-part="x"]:focus-visible')).toBe(2);
  });

  it('still refuses a selector that only reaches the floor through :where()', () => {
    // :where() is specificity-zero, so it can never buy the 4th unit.
    expect(bColumn('.a.b[data-part="x"]:where([data-open="true"])')).toBeLessThan(4);
  });
});

describe.each(Object.keys(SKINS))('dropdown skin %s -- structural contract', (label) => {
  const rules = cssRules(SKINS[label]);

  it('parses into a non-trivial set of rules (guards a broken read)', () => {
    expect(rules.length).toBeGreaterThan(0);
  });

  it('every painting border rule reaches specificity (0,4,0)', () => {
    const offenders: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      for (const part of splitSelectorList(selector)) {
        if (bColumn(part) < 4) offenders.push(part);
      }
    }
    expect(
      offenders,
      `these border rules sit below (0,4,0) and lose their color to the tenant * floor (P-48).\nA portaled Modern panel reaches the floor the same way an in-tree part does: the two root classes + the standalone \`.ds-<family>-panel\` scope class (or the panel's own \`[data-part]\`) + the painted part's \`[data-part]\`.\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('buys the 4th unit from data-part/data-*, never role/aria-label/placeholder', () => {
    const incidental: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      if (/\[(?:role|aria-label|placeholder)\b/.test(selector)) incidental.push(selector);
    }
    expect(incidental, `border specificity must not depend on an incidental attribute:\n${incidental.join('\n')}`).toEqual([]);
  });
});

/** Comment-stripped copies -- keyframe/negative pins must not match prose in the header. */
const NC: Record<string, string> = Object.fromEntries(
  Object.entries(SKINS).map(([k, v]) => [k, v.replace(/\/\*[\s\S]*?\*\//g, '')]),
);

// ---------------------------------------------------------------------------
// Portal posture is a per-engine, per-component parameter, not symmetric within
// a component. Every portaled popup tree must be painted by STANDALONE
// selectors on its own panel/popup scope; a root-descendant selector cannot
// reach a body-mounted portal. The IN-TREE popups must NOT be reached that way.
// ---------------------------------------------------------------------------

/** A root-descendant dropdown rule -- the shape an in-tree popup needs and a
 *  portaled one can never match. Quote-agnostic: the skins use both. */
const ROOT_DESCENDANT_DROPDOWN =
  /\[data-part=["']root["']\][^,{]*\[data-part=["']dropdown["']\]/;

/** The standalone scope class each kernel-portaled Modern panel carries. */
const MODERN_PANEL_SCOPE: Record<string, RegExp> = {
  'modern/tree-select': /\.ds-tree-select\.ds-tree-select--modern\.ds-tree-select-panel/,
  'modern/cascader': /\.ds-cascader\.ds-cascader--modern\.ds-cascader-panel/,
  'modern/autocomplete': /\.ds-autocomplete\.ds-autocomplete--modern\.ds-autocomplete-panel/,
  'modern/mentions': /\.ds-mentions\.ds-mentions--modern\.ds-mentions-panel/,
};

describe('dropdown skins -- portal posture selector pins', () => {
  it('Select modern portals its custom dropdown: standalone `.ds-select-shell__dropdown`, never root-descendant', () => {
    expect(/\.ds-select-shell__dropdown\[data-part='dropdown'\]/.test(NC['modern/select'])).toBe(true);
    expect(/\[data-part='root'\][^,{]*\[data-part='dropdown'\]/.test(NC['modern/select'])).toBe(false);
  });

  it('Select rustic dropdown is in-tree: reached as a root descendant, no standalone popup class', () => {
    expect(/\[data-part='root'\][^,{]*\[data-part='dropdown'\]/.test(NC['rustic/select'])).toBe(true);
    expect(/\.ds-select-shell__dropdown/.test(NC['rustic/select'])).toBe(false);
  });

  it('TreeSelect rustic portals (mirror of Select): standalone `.rottay-treeselect__dropdown`, never root-descendant', () => {
    expect(/\.rottay-treeselect__dropdown\[data-part='dropdown'\]/.test(NC['rustic/tree-select'])).toBe(true);
    expect(/\[data-part='root'\][^,{]*\[data-part='dropdown'\]/.test(NC['rustic/tree-select'])).toBe(false);
  });

  it('TreeSelect modern kernel-portals (WO-CAN-05): standalone `.ds-tree-select-panel` scope, never root-descendant', () => {
    expect(MODERN_PANEL_SCOPE['modern/tree-select'].test(NC['modern/tree-select'])).toBe(true);
    expect(
      /\.ds-tree-select\.ds-tree-select--modern\.ds-tree-select-panel\[data-part="dropdown"\]/.test(
        NC['modern/tree-select'],
      ),
    ).toBe(true);
    expect(ROOT_DESCENDANT_DROPDOWN.test(NC['modern/tree-select'])).toBe(false);
    // Rustic's self-portal class stays out of the Modern skin: two doors, two
    // anatomies.
    expect(/\.rottay-treeselect__dropdown/.test(NC['modern/tree-select'])).toBe(false);
  });

  it('Cascader rustic portals: standalone `.rottay-cascader__dropdown`, never root-descendant', () => {
    expect(/\.rottay-cascader__dropdown\[data-part='dropdown'\]/.test(NC['rustic/cascader'])).toBe(true);
    expect(/\[data-part='root'\][^,{]*\[data-part='dropdown'\]/.test(NC['rustic/cascader'])).toBe(false);
  });

  it('Cascader modern kernel-portals: standalone `.ds-cascader-panel` scope, never root-descendant, trigger chrome addresses both doors', () => {
    expect(MODERN_PANEL_SCOPE['modern/cascader'].test(NC['modern/cascader'])).toBe(true);
    expect(
      /\.ds-cascader\.ds-cascader--modern\.ds-cascader-panel\[data-part="dropdown"\]/.test(
        NC['modern/cascader'],
      ),
    ).toBe(true);
    expect(ROOT_DESCENDANT_DROPDOWN.test(NC['modern/cascader'])).toBe(false);
    expect(/\.rottay-cascader__dropdown/.test(NC['modern/cascader'])).toBe(false);
    // Cascader renders its trigger chrome BOTH in the field and inside the
    // portaled panel, so the shared rules select both doors in one `:is()`
    // rather than duplicating the block.
    expect(
      /:is\(\[data-part="root"\],\s*\[data-part="dropdown"\]\)/.test(NC['modern/cascader']),
    ).toBe(true);
  });

  it('AutoComplete + Mentions modern kernel-portal, rustic stays in-tree', () => {
    for (const label of ['modern/autocomplete', 'modern/mentions']) {
      expect(MODERN_PANEL_SCOPE[label].test(NC[label]), `${label} panel scope`).toBe(true);
      expect(ROOT_DESCENDANT_DROPDOWN.test(NC[label]), `${label} root-descendant`).toBe(false);
    }
    for (const label of ['rustic/autocomplete', 'rustic/mentions']) {
      expect(ROOT_DESCENDANT_DROPDOWN.test(NC[label]), `${label} root-descendant`).toBe(true);
    }
    // Neither family adopted a rustic-style `__dropdown`/`__popup` popup class
    // in either engine: the Modern door is the panel scope class, the Rustic
    // popup is still the field's own descendant.
    for (const label of ['modern/autocomplete', 'rustic/autocomplete', 'modern/mentions', 'rustic/mentions']) {
      expect(/__dropdown|__popup/.test(NC[label]), label).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// The field-filters-panel suppression rule owns the Select CONTAINER's channels
// (decision 5). This checkpoint's Select rules paint the TRIGGER and DROPDOWN
// parts, never the container: no rule may target the root element itself.
// ---------------------------------------------------------------------------
describe('dropdown skins -- Select container is left to the field-filters-panel', () => {
  for (const label of ['modern/select', 'rustic/select']) {
    it(`${label}: no rule paints a bare container -- every selector's target is a non-root data-part`, () => {
      const offenders: string[] = [];
      for (const { selector, body } of cssRules(SKINS[label])) {
        for (const part of splitSelectorList(selector)) {
          const p = part;
          // the RIGHTMOST compound is the painted target; the container is the
          // root part -- a target ending at [data-part='root'] paints the box
          // the FFP owns.
          if (/\[data-part='root'\]\s*$/.test(p) && paintsSurface(body)) offenders.push(p);
          // a bare `.rottay-select`/`.ds-select` with no data-part anywhere is
          // also the container.
          if (
            /\.(?:rottay|ds)-select[\w-]*/.test(p) &&
            !/\[data-part/.test(p) &&
            paintsSurface(body)
          ) {
            offenders.push(p);
          }
        }
      }
      expect(offenders, `these paint the Select container, which the FFP suppression owns:\n${offenders.join('\n')}`).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// The deleted imperative focus/hover handlers reappear as CSS carrying the SAME
// hardcoded literals, byte-exact (decision 3). These rustic engines wrote a
// `#1677ff` family focus ring / hover accent imperatively; the migration must
// have transcribed them verbatim rather than tokenising (a later job).
// ---------------------------------------------------------------------------
describe('dropdown skins -- interaction literal pins', () => {
  it('TreeSelect rustic search focus ring: the #1677ff border + the two rgba glow layers, on :focus', () => {
    expect(/\[data-part='search-input'\]:focus\s*\{[^}]*#1677ff/.test(NC['rustic/tree-select'])).toBe(true);
    expect(/rgba\(22,\s*119,\s*255,\s*0\.15\)/.test(NC['rustic/tree-select'])).toBe(true);
    expect(/rgba\(22,\s*119,\s*255,\s*0\.08\)/.test(NC['rustic/tree-select'])).toBe(true);
  });

  it('Cascader rustic search focus ring carries #1677ff verbatim; hover/selected accents ride their tokens', () => {
    expect(/\[data-part='search-input'\]:focus\s*\{[^}]*#1677ff/.test(NC['rustic/cascader'])).toBe(true);
    // The option hover accent was tokenised to --ds-cascader-item-bg-hover; the
    // #1677ff family survives as the primary fallback on the selected border.
    expect(/:hover[^{]*\{[^}]*var\(--ds-cascader-item-bg-hover\)/.test(NC['rustic/cascader'])).toBe(true);
    expect(
      /\[data-selected='true'\]\s*\{[^}]*var\(--ds-color-primary,\s*#1677ff\)/.test(
        NC['rustic/cascader'],
      ),
    ).toBe(true);
  });

  it('Select rustic option focus keys the primary accent (tokenised #1677ff family) on the removed React-state hover (data-active)', () => {
    // The former #1677ff literal was tokenised to --ds-color-primary-100 with
    // the same-family rgba fallback; the data-active rule must still carry it.
    expect(
      /\[data-active='true'\][^{]*\{[^}]*var\(--ds-color-primary-100,\s*rgba\(22,\s*119,\s*255,\s*0\.15\)\)/.test(
        NC['rustic/select'],
      ),
    ).toBe(true);
  });

  it('keyframes were renamed into the skins (ds-*-*), never the old rottay-select-* / rottay-*select-*', () => {
    expect(/@keyframes\s+ds-select-appear/.test(NC['modern/select'])).toBe(true);
    expect(/@keyframes\s+ds-select-(?:spin|dropdown-in|check-in)/.test(NC['rustic/select'])).toBe(true);
    expect(/@keyframes\s+ds-tree-select-slide-in/.test(NC['modern/tree-select'])).toBe(true);
    expect(/@keyframes\s+ds-cascader-(?:slide-in|panel-in)/.test(NC['modern/cascader'])).toBe(true);
    const all = Object.values(NC).join('\n');
    expect(/@keyframes\s+rottay-/.test(all)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// The DOM carries the data-part contract, not the paint -- closed AND open, on
// every part the migration moved, both engines. A popup that left the field
// subtree is never found by walking the container: it is resolved the way a
// consumer resolves it, through the trigger's `aria-controls` and the kernel's
// own portal root and layer stamp.
// ---------------------------------------------------------------------------
const ENGINES = ['modern', 'rustic'] as const;

function expectNoPaint(el: HTMLElement, label: string) {
  expect(el.style.background, `${label}: background inline`).toBe('');
  expect(el.style.backgroundColor, `${label}: background-color inline`).toBe('');
  expect(el.style.border, `${label}: border inline`).toBe('');
  expect(el.style.borderColor, `${label}: border-color inline`).toBe('');
  expect(el.style.borderLeft, `${label}: border-left inline`).toBe('');
  expect(el.style.borderRadius, `${label}: border-radius inline`).toBe('');
  expect(el.style.color, `${label}: color inline`).toBe('');
  expect(el.style.boxShadow, `${label}: box-shadow inline`).toBe('');
  expect(el.style.outline, `${label}: outline inline`).toBe('');
}

/** Where a family's open panel lives, per engine. Two portal doors, plus in-tree. */
type PanelDoor = 'kernel-portal' | 'self-portal' | 'in-tree';

/**
 * The per-family, per-engine posture WO-CAN-05 left behind -- the same table
 * DropdownsBatch.contract.test.tsx pins on the DOM. Modern panels cross the
 * overlay kernel's boundary; Rustic either portals itself
 * (`createPortal(document.body)`, no kernel ancestor, no layer stamp) or keeps
 * the popup inside the field.
 */
const PANEL_DOOR: Record<string, Record<(typeof ENGINES)[number], PanelDoor>> = {
  'tree-select': { modern: 'kernel-portal', rustic: 'self-portal' },
  cascader: { modern: 'kernel-portal', rustic: 'self-portal' },
  'auto-complete': { modern: 'kernel-portal', rustic: 'in-tree' },
  mentions: { modern: 'kernel-portal', rustic: 'in-tree' },
};

/** The overlay kernel's shared portal root -- the only door a Modern panel uses. */
const KERNEL_PORTAL_ROOT = '[data-rottay-portal]';

/**
 * Resolve the OPEN panel through its public door and prove the door on the way:
 * a kernel-portaled panel is reached from the trigger's `aria-controls`, sits
 * outside the render container, inside the kernel portal root and carries the
 * layer stamp; a self-portaled panel is outside the container with neither;
 * an in-tree panel is still a descendant of the field.
 */
async function resolveOpenPanel(
  container: HTMLElement,
  owner: HTMLElement,
  door: PanelDoor,
): Promise<HTMLElement> {
  await waitFor(() => {
    expect(document.querySelectorAll('[data-part="dropdown"]').length).toBeGreaterThan(0);
  });

  if (door === 'kernel-portal') {
    const panelId = owner.getAttribute('aria-controls');
    expect(panelId, 'the trigger must still own its panel through aria-controls').toBeTruthy();
    const panel = document.getElementById(panelId as string);
    expect(panel, `no panel with id ${panelId}`).not.toBeNull();
    const resolved = panel as HTMLElement;
    expect(resolved.getAttribute('data-part')).toBe('dropdown');
    expect(container.contains(resolved)).toBe(false);
    expect(resolved.closest(KERNEL_PORTAL_ROOT)).not.toBeNull();
    expect(resolved.getAttribute('data-overlay-layer')).toMatch(/^ds-overlay-/);
    expect(resolved.getAttribute('data-overlay-kind')).toBe('dropdown');
    return resolved;
  }

  const panel = document.querySelector('[data-part="dropdown"]') as HTMLElement;
  if (door === 'self-portal') {
    expect(container.contains(panel)).toBe(false);
    expect(panel.closest(KERNEL_PORTAL_ROOT)).toBeNull();
    expect(panel.getAttribute('data-overlay-layer')).toBeNull();
  } else {
    expect(container.contains(panel)).toBe(true);
  }
  return panel;
}

const SELECT_OPTIONS = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
];
const TREE_DATA = [
  { value: 'engineering', title: 'Engineering', children: [{ value: 'frontend', title: 'Frontend' }] },
  { value: 'design', title: 'Design' },
];
const CASCADER_OPTIONS = [
  { value: 'us', label: 'United States', children: [{ value: 'us-ca', label: 'California' }] },
  { value: 'ca', label: 'Canada' },
];
const AC_OPTIONS = [
  { value: 'React', label: 'React' },
  { value: 'Vue', label: 'Vue' },
];
const MENTIONS_OPTIONS = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'grace', label: 'Grace Hopper' },
];

describe.each(ENGINES)('dropdown DOM carries the contract, not the paint -- %s engine', (engine) => {
  it('Select trigger + open option paint nothing inline', async () => {
    const { container } = renderWithEngine(
      <Select options={SELECT_OPTIONS} multiple defaultValue={['design']} maxTagCount={1} onChange={vi.fn()} />,
      engine,
    );
    await waitFor(() => expect(container.querySelector('[data-part="trigger"]')).not.toBeNull());
    expectNoPaint(container.querySelector('[data-part="trigger"]') as HTMLElement, `select ${engine} trigger`);
    expectNoPaint(container.querySelector('[data-part="tag"]') as HTMLElement, `select ${engine} tag`);

    fireEvent.click(container.querySelector('[data-part="trigger"]') as HTMLElement);
    await waitFor(() => expect(document.querySelector('[data-part="dropdown"]')).not.toBeNull());
    const option = document.querySelector('[data-part="option"]') as HTMLElement;
    expectNoPaint(option, `select ${engine} option`);
  });

  it('TreeSelect trigger + open tree node paint nothing inline', async () => {
    const { container } = renderWithEngine(<TreeSelect treeData={TREE_DATA} onChange={vi.fn()} />, engine);
    await waitFor(() => expect(container.querySelector('[data-part="trigger"]')).not.toBeNull());
    const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
    expectNoPaint(trigger, `treeselect ${engine} trigger`);

    fireEvent.click(trigger);
    const panel = await resolveOpenPanel(container, trigger, PANEL_DOOR['tree-select'][engine]);
    expectNoPaint(panel, `treeselect ${engine} panel`);
    expect(panel.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
    expectNoPaint(panel.querySelector('[data-part="option"]') as HTMLElement, `treeselect ${engine} option`);
  });

  it('Cascader trigger + open menu option paint nothing inline', async () => {
    const { container } = renderWithEngine(<Cascader options={CASCADER_OPTIONS} onChange={vi.fn()} />, engine);
    await waitFor(() => expect(container.querySelector('[data-part="trigger"]')).not.toBeNull());
    const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
    expectNoPaint(trigger, `cascader ${engine} trigger`);

    fireEvent.click(trigger);
    const panel = await resolveOpenPanel(container, trigger, PANEL_DOOR.cascader[engine]);
    expectNoPaint(panel, `cascader ${engine} panel`);
    await waitFor(() => expect(panel.querySelector('[data-part="menu-column"]')).not.toBeNull());
    expectNoPaint(panel.querySelector('[data-part="option"]') as HTMLElement, `cascader ${engine} option`);
  });

  it('AutoComplete input + open option paint nothing inline', async () => {
    const { container } = renderWithEngine(<AutoComplete options={AC_OPTIONS} onChange={vi.fn()} />, engine);
    await waitFor(() => expect(container.querySelector('[data-part="input"]')).not.toBeNull());
    const input = container.querySelector('[data-part="input"]') as HTMLElement;
    expectNoPaint(input, `autocomplete ${engine} input`);

    // The combobox opens on focus in both engines; only Modern's listbox left
    // the field subtree.
    fireEvent.focus(input);
    const panel = await resolveOpenPanel(container, input, PANEL_DOOR['auto-complete'][engine]);
    expectNoPaint(panel, `autocomplete ${engine} panel`);
    expect(panel.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
    expectNoPaint(panel.querySelector('[data-part="option"]') as HTMLElement, `autocomplete ${engine} option`);
  });

  it('Mentions textarea + open option paint nothing inline', async () => {
    const { container } = renderWithEngine(<Mentions options={MENTIONS_OPTIONS} onChange={vi.fn()} />, engine);
    await waitFor(() => expect(container.querySelector('[data-part="textarea"]')).not.toBeNull());
    const textarea = container.querySelector('[data-part="textarea"]') as HTMLTextAreaElement;
    expectNoPaint(textarea, `mentions ${engine} textarea`);

    // Mentions only opens on an active `@mention` session, never on focus.
    fireEvent.change(textarea, { target: { value: '@a' } });
    const panel = await resolveOpenPanel(container, textarea, PANEL_DOOR.mentions[engine]);
    expectNoPaint(panel, `mentions ${engine} panel`);
    expect(panel.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
    expectNoPaint(panel.querySelector('[data-part="option"]') as HTMLElement, `mentions ${engine} option`);
  });
});
