/**
 * `useFieldOverlay` adoption census (WO-CAN-05, closes the F-21 adoption half).
 *
 * Every family that owns a panel resolves its stack membership, band, Escape
 * route and (where it dismisses on an outside press) its dismissal through the
 * ONE kernel contract. The finding measured four different overlay strategies
 * across the nine overlay-bearing inputs, eleven private `keydown` listeners
 * and nine private outside-click handlers; this suite pins that down.
 *
 * A family's overlay HOST is not always its Modern engine: Toast's stack lives
 * in its compound container, so the roster names the host per family instead of
 * assuming a path. Adoption is measured at the host.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const PRIMITIVES = resolve(process.cwd(), 'src/components/primitives');

/** The overlay-bearing families named by the work order, keyed to their host. */
const PANEL_HOSTS: Record<string, string> = {
  // the nine inputs with a panel
  'inputs/select': 'inputs/select/engines/modern/index.tsx',
  'inputs/date-picker': 'inputs/date-picker/engines/modern/index.tsx',
  'inputs/time-picker': 'inputs/time-picker/engines/modern/index.tsx',
  'inputs/auto-complete': 'inputs/auto-complete/engines/modern/index.tsx',
  'inputs/cascader': 'inputs/cascader/engines/modern/index.tsx',
  'inputs/mentions': 'inputs/mentions/engines/modern/index.tsx',
  'inputs/tree-select': 'inputs/tree-select/engines/modern/index.tsx',
  'inputs/color-picker': 'inputs/color-picker/engines/modern/index.tsx',
  'inputs/upload': 'inputs/upload/engines/modern/index.tsx',
  // page-blocking surfaces
  'feedback/modal': 'feedback/modal/engines/modern/index.tsx',
  'feedback/drawer': 'feedback/drawer/engines/modern/index.tsx',
  'overlay/sheet': 'overlay/sheet/engines/modern/index.tsx',
  'overlay/alert-dialog': 'overlay/alert-dialog/engines/modern/index.tsx',
  'overlay/confirm-dialog': 'overlay/confirm-dialog/engines/modern/index.tsx',
  // anchored surfaces
  'overlay/popover': 'overlay/popover/engines/modern/index.tsx',
  'overlay/popconfirm': 'overlay/popconfirm/engines/modern/index.tsx',
  'overlay/dropdown': 'overlay/dropdown/engines/modern/index.tsx',
  'overlay/context-menu': 'overlay/context-menu/engines/modern/index.tsx',
  'overlay/hover-card': 'overlay/hover-card/engines/modern/index.tsx',
  'overlay/tour': 'overlay/tour/engines/modern/index.tsx',
  'display/tooltip': 'display/tooltip/engines/modern/index.tsx',
  // transient feedback
  'feedback/notification': 'feedback/notification/engines/modern/index.tsx',
  'feedback/message': 'feedback/message/engines/modern/index.tsx',
  // the stack host is the compound container, not the item-rendering engine
  'feedback/toast': 'feedback/toast/compound/container/index.tsx',
};

const FAMILIES = Object.keys(PANEL_HOSTS);

/**
 * Families that render their panel in the anchor's own DOM subtree
 * (`render: 'inline'`) while still taking the band, the stack and the Escape
 * route from the kernel. This is a CLOSED, reasoned list, not an open escape
 * hatch, and the suite pins it against what the sources actually declare.
 *
 * Both remaining entries are inline BY DESIGN, not by debt, and neither is a
 * panel pinned to a trigger. `skinBlockers` stays in the shape so a future
 * debt entry must name the tests that pin its in-tree contract as law and can
 * leave this list only together with its skin and those tests; it is empty
 * here because no entry is debt. The last debt entry (`inputs/tree-select`)
 * was drained in WO-CAN-05, so this list is now two rows and 22 families sit
 * on the canonical portal path.
 */
const INLINE_RENDERERS: Record<string, { reason: string; skinBlockers: readonly string[] }> = {
  'inputs/upload': {
    reason: 'the preview scrim is a full-viewport child of the field, by design',
    skinBlockers: [],
  },
  'feedback/message': {
    reason: 'the stack is skin-placed in-tree and owns its own --ds-z-message tier',
    skinBlockers: [],
  },
};

const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

const PRIVATE_DISMISS_LISTENER =
  /document\s*\.\s*addEventListener\(\s*['"](?:keydown|mousedown|pointerdown)['"]/g;

function host(family: string): string {
  const path = resolve(PRIMITIVES, PANEL_HOSTS[family]);
  expect(existsSync(path), `${family} host ${PANEL_HOSTS[family]} exists`).toBe(true);
  return stripComments(readFileSync(path, 'utf8'));
}

describe('useFieldOverlay adoption', () => {
  it('covers every named panel family', () => {
    expect(FAMILIES).toHaveLength(24);
  });

  it.each(FAMILIES)('%s resolves its overlay through the kernel', (family) => {
    const source = host(family);
    expect(source).toMatch(/runtime\/overlay\/field-overlay/);
    expect(source).toMatch(/useFieldOverlay\(\{/);
  });

  it.each(FAMILIES)('%s keeps no private document dismiss listener', (family) => {
    expect(
      host(family).match(PRIVATE_DISMISS_LISTENER) ?? [],
      `${family} must route Escape and outside-press dismissal through the kernel`,
    ).toEqual([]);
  });

  it.each(FAMILIES)('%s declares a kernel overlay kind', (family) => {
    expect(host(family)).toMatch(
      /kind:\s*['"](?:modal|drawer|sheet|popover|dropdown|hover|tooltip|toast)['"]/,
    );
  });

  it.each(FAMILIES)('%s opens no private portal or scroll-lock route', (family) => {
    const source = host(family);
    // `createPortal` and the body scroll lock belong to the kernel alone; a
    // family that reaches for either has built a second overlay world.
    expect(source).not.toMatch(/\bcreatePortal\b/);
    expect(source).not.toMatch(/document\s*\.\s*body\s*\.\s*style\s*\.\s*overflow/);
  });

  it('renders inline in exactly the families that declare it, and nowhere else', () => {
    const declared = Object.keys(INLINE_RENDERERS).sort();
    const measured = FAMILIES.filter((family) => /render:\s*'inline'/.test(host(family))).sort();
    expect(measured).toEqual(declared);

    // Every named blocker must be a real file, so an exception cannot outlive
    // the reason recorded for it.
    for (const [family, { reason, skinBlockers }] of Object.entries(INLINE_RENDERERS)) {
      expect(reason.length, `${family} states why it is inline`).toBeGreaterThan(0);
      for (const blocker of skinBlockers) {
        expect(existsSync(resolve(PRIMITIVES, blocker)), blocker).toBe(true);
      }
    }
  });

  it('keeps every other family on the canonical portal path', () => {
    const portaled = FAMILIES.filter((family) => !(family in INLINE_RENDERERS));
    expect(portaled.length).toBe(22);
    for (const family of portaled) {
      expect(host(family), family).not.toMatch(/render:\s*'inline'/);
    }
  });

  it('leaves no family without a host', () => {
    expect(Object.values(PANEL_HOSTS).filter((path) => !path)).toEqual([]);
    for (const path of Object.values(PANEL_HOSTS)) {
      expect(existsSync(resolve(PRIMITIVES, path)), path).toBe(true);
    }
  });

  it('detects a family that drops the contract', () => {
    const planted = "const x = 1;\ndocument.addEventListener('keydown', h);";
    expect(stripComments(planted).match(PRIVATE_DISMISS_LISTENER)).toHaveLength(1);
    expect(stripComments("// document.addEventListener('keydown', h)")).not.toContain(
      'addEventListener',
    );
    expect("import { createPortal } from 'react-dom';").toMatch(/\bcreatePortal\b/);
  });
});
