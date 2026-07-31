import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { Select } from '../Select';
import { TreeSelect } from '../TreeSelect';
import { Cascader } from '../Cascader';
import { AutoComplete } from '../AutoComplete';
import { Mentions } from '../Mentions';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint B -- the dropdown family skins are real unlayered
// stylesheets, one per engine (plus an agnostic home for the Select compound).
// The screenshot baselines (dropdowns-batch.spec.ts) prove the shipped look is
// identical at rest, in every open popup and in the photographed interaction
// states; they cannot prove the STRUCTURAL contract this migration created:
// that the paint lives in the skins (not inline), that every painting border
// rule clears the P-48 tenant `*` floor at (0,4,0), that the PORTALED popup
// trees (Select modern, TreeSelect rustic, Cascader rustic) are skinned by
// STANDALONE selectors on their popup class rather than root-descendant rules
// (which cannot match a body-mounted portal), that the removed imperative
// hover/focus handlers now live as `:hover`/`:focus` rules carrying the same
// literals, that per-mount keyframes were renamed into the skins, and that the
// DOM carries no inline paint on the migrated parts -- closed or OPEN. This
// mirrors FieldsBatch.real-engines.test.tsx.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const CSS = join(here, '../../../../foundation/tokens/css');
const read = (p: string) => readFileSync(join(CSS, p), 'utf8');

/** Every new skin file this checkpoint added, keyed by a readable label. */
const SKINS: Record<string, string> = {
  'modern/select': read('runtime/engines/modern/skin/select.css'),
  'rustic/select': read('runtime/engines/rustic/skin/select.css'),
  'modern/tree-select': read('runtime/engines/modern/skin/tree-select.css'),
  'rustic/tree-select': read('runtime/engines/rustic/skin/tree-select.css'),
  'modern/cascader': read('runtime/engines/modern/skin/cascader.css'),
  'rustic/cascader': read('runtime/engines/rustic/skin/cascader.css'),
  'modern/autocomplete': read('runtime/engines/modern/skin/autocomplete.css'),
  'rustic/autocomplete': read('runtime/engines/rustic/skin/autocomplete.css'),
  'modern/mentions': read('runtime/engines/modern/skin/mentions.css'),
  'rustic/mentions': read('runtime/engines/rustic/skin/mentions.css'),
  'select-compounds': read('presentation/components/skin/select-compounds.css'),
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

/** The specificity "b" column (classes + attrs + pseudo-classes) for one comma-free selector. */
function bColumn(selector: string): number {
  const classes = (selector.match(/\.[A-Za-z_-][\w-]*/g) || []).length;
  const attrs = (selector.match(/\[[^\]]*\]/g) || []).length;
  const pseudos = (selector.match(/(?<!:):[A-Za-z-]+/g) || []).length;
  const notArgs = (selector.match(/:not\(([^)]*)\)/g) || []).reduce(
    (n, frag) => n + bColumn(frag.slice(5, -1)),
    0,
  );
  return classes + attrs + pseudos + notArgs;
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

describe.each(Object.keys(SKINS))('dropdown skin %s -- structural contract', (label) => {
  const rules = cssRules(SKINS[label]);

  it('parses into a non-trivial set of rules (guards a broken read)', () => {
    expect(rules.length).toBeGreaterThan(0);
  });

  it('every painting border rule reaches specificity (0,4,0)', () => {
    const offenders: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      for (const part of selector.split(',')) {
        if (bColumn(part) < 4) offenders.push(part.trim());
      }
    }
    expect(
      offenders,
      `these border rules sit below (0,4,0) and lose their color to the tenant * floor (P-48):\n${offenders.join('\n')}`,
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
// a component. The THREE portaled popup trees must be painted by STANDALONE
// selectors on their popup class; a root-descendant selector cannot reach a
// body-mounted portal. The IN-TREE popups must NOT be reached that way.
// ---------------------------------------------------------------------------
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

  it('TreeSelect modern dropdown is in-tree: reached as a root descendant', () => {
    expect(/\[data-part=["']root["']\][^,{]*\[data-part=["']dropdown["']\]/.test(NC['modern/tree-select'])).toBe(true);
    expect(/\.rottay-treeselect__dropdown/.test(NC['modern/tree-select'])).toBe(false);
  });

  it('Cascader rustic portals: standalone `.rottay-cascader__dropdown`, never root-descendant', () => {
    expect(/\.rottay-cascader__dropdown\[data-part='dropdown'\]/.test(NC['rustic/cascader'])).toBe(true);
    expect(/\[data-part='root'\][^,{]*\[data-part='dropdown'\]/.test(NC['rustic/cascader'])).toBe(false);
  });

  it('Cascader modern dropdown is in-tree: reached as a root descendant, no standalone popup class', () => {
    expect(/\[data-part=["']root["']\][^,{]*\[data-part=["']dropdown["']\]/.test(NC['modern/cascader'])).toBe(true);
    expect(/\.rottay-cascader__dropdown/.test(NC['modern/cascader'])).toBe(false);
  });

  it('AutoComplete + Mentions never portal: the dropdown is always a root descendant, no popup class', () => {
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
        for (const part of selector.split(',')) {
          const p = part.trim();
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
// every part the migration moved, both engines. Portaled popups render under
// document.body, so the open-state probe searches `document`, not the container.
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
    expectNoPaint(container.querySelector('[data-part="trigger"]') as HTMLElement, `treeselect ${engine} trigger`);

    fireEvent.click(container.querySelector('[data-part="trigger"]') as HTMLElement);
    await waitFor(() => expect(document.querySelector('[data-part="dropdown"]')).not.toBeNull());
    expectNoPaint(document.querySelector('[data-part="option"]') as HTMLElement, `treeselect ${engine} option`);
  });

  it('Cascader trigger + open menu option paint nothing inline', async () => {
    const { container } = renderWithEngine(<Cascader options={CASCADER_OPTIONS} onChange={vi.fn()} />, engine);
    await waitFor(() => expect(container.querySelector('[data-part="trigger"]')).not.toBeNull());
    expectNoPaint(container.querySelector('[data-part="trigger"]') as HTMLElement, `cascader ${engine} trigger`);

    fireEvent.click(container.querySelector('[data-part="trigger"]') as HTMLElement);
    await waitFor(() => expect(document.querySelector('[data-part="menu-column"]')).not.toBeNull());
    expectNoPaint(document.querySelector('[data-part="option"]') as HTMLElement, `cascader ${engine} option`);
  });

  it('AutoComplete input + open option paint nothing inline', async () => {
    const { container } = renderWithEngine(<AutoComplete options={AC_OPTIONS} onChange={vi.fn()} />, engine);
    await waitFor(() => expect(container.querySelector('[data-part="input"]')).not.toBeNull());
    const input = container.querySelector('[data-part="input"]') as HTMLElement;
    expectNoPaint(input, `autocomplete ${engine} input`);

    fireEvent.focus(input);
    await waitFor(() => expect(container.querySelector('[data-part="dropdown"]')).not.toBeNull());
    expectNoPaint(container.querySelector('[data-part="option"]') as HTMLElement, `autocomplete ${engine} option`);
  });

  it('Mentions textarea + open option paint nothing inline', async () => {
    const { container } = renderWithEngine(<Mentions options={MENTIONS_OPTIONS} onChange={vi.fn()} />, engine);
    await waitFor(() => expect(container.querySelector('[data-part="textarea"]')).not.toBeNull());
    const textarea = container.querySelector('[data-part="textarea"]') as HTMLTextAreaElement;
    expectNoPaint(textarea, `mentions ${engine} textarea`);

    fireEvent.change(textarea, { target: { value: '@a' } });
    await waitFor(() => expect(container.querySelector('[data-part="dropdown"]')).not.toBeNull());
    expectNoPaint(container.querySelector('[data-part="option"]') as HTMLElement, `mentions ${engine} option`);
  });
});
