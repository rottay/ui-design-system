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
 *
 * Adopting the kernel is NOT the same as rendering through `FieldOverlayPanel`.
 * The 24 hosts sit behind four measured doors -- 12 family-authored panels
 * through `FieldOverlayPanel`, 6 through the kernel's own `Portal`, 4 in-tree
 * fixed-positioned by unchanged design (drawer, popconfirm, context-menu,
 * hover-card) and 2 declared `render: 'inline'` -- and this suite pins the
 * door of every family, so no family can change posture silently.
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
 * was drained in WO-CAN-05, so this list is now two rows and the other 22
 * families declare no inline render at all. Where each of those 22 does cross
 * (or deliberately does not cross) a portal boundary is a separate, measured
 * question, answered by {@link OVERLAY_DOORS}.
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

/**
 * The door each family's panel actually leaves through, measured from source.
 *
 * - `field-overlay-panel` -- the family authors its own panel and wraps it in
 *   `<FieldOverlayPanel>`, which is the only component that portals a
 *   family-authored panel.
 * - `kernel-portal` -- the family renders its own subtree through the kernel's
 *   `<Portal>` directly (page-blocking surfaces and the FAB-17
 *   instance-channel families). Same portal root, different entry point.
 * - `in-tree-fixed` -- the panel never crosses a portal boundary: it stays in
 *   the trigger's own subtree and is fixed-positioned, either by its own shell
 *   (drawer) or by the kernel's measured `positionStyle`. Unchanged design,
 *   not F-21 debt: none of these four is a clipped dropdown.
 * - `inline` -- the two {@link INLINE_RENDERERS}.
 */
type OverlayDoor = 'field-overlay-panel' | 'kernel-portal' | 'in-tree-fixed' | 'inline';

const OVERLAY_DOORS: Record<string, OverlayDoor> = {
  'inputs/select': 'field-overlay-panel',
  'inputs/date-picker': 'field-overlay-panel',
  'inputs/time-picker': 'field-overlay-panel',
  'inputs/auto-complete': 'field-overlay-panel',
  'inputs/cascader': 'field-overlay-panel',
  'inputs/mentions': 'field-overlay-panel',
  'inputs/tree-select': 'field-overlay-panel',
  'inputs/color-picker': 'field-overlay-panel',
  'inputs/upload': 'inline',
  'feedback/modal': 'kernel-portal',
  'feedback/drawer': 'in-tree-fixed',
  'overlay/sheet': 'kernel-portal',
  'overlay/alert-dialog': 'field-overlay-panel',
  'overlay/confirm-dialog': 'field-overlay-panel',
  'overlay/popover': 'kernel-portal',
  'overlay/popconfirm': 'in-tree-fixed',
  'overlay/dropdown': 'kernel-portal',
  'overlay/context-menu': 'in-tree-fixed',
  'overlay/hover-card': 'in-tree-fixed',
  'overlay/tour': 'kernel-portal',
  'display/tooltip': 'kernel-portal',
  'feedback/notification': 'field-overlay-panel',
  'feedback/message': 'inline',
  'feedback/toast': 'field-overlay-panel',
};

/** How many families each door is expected to carry. */
const DOOR_CENSUS: Record<OverlayDoor, number> = {
  'field-overlay-panel': 12,
  'kernel-portal': 6,
  'in-tree-fixed': 4,
  inline: 2,
};

/** `<Portal` must not be satisfied by `<PortalScope`, which is not a door. */
const RENDERS_PANEL = /<FieldOverlayPanel[\s/>]/;
const RENDERS_PORTAL = /<Portal[\s/>]/;
const RENDERS_INLINE = /render:\s*'inline'/;

/** Fixed-positioned either by its own shell or by the kernel's measurement. */
const FIXED_POSITION = /position:\s*'fixed'|overlay\.positionStyle/;

/** The traits a source must show -- and must NOT show -- for each door. */
const DOOR_TRAITS: Record<OverlayDoor, { panel: boolean; portal: boolean; inline: boolean }> = {
  'field-overlay-panel': { panel: true, portal: false, inline: false },
  'kernel-portal': { panel: false, portal: true, inline: false },
  'in-tree-fixed': { panel: false, portal: false, inline: false },
  inline: { panel: false, portal: false, inline: true },
};

/** The door a source actually shows, or `ambiguous` for an impossible mix. */
function measureDoor(source: string): OverlayDoor | 'ambiguous' {
  const traits = {
    panel: RENDERS_PANEL.test(source),
    portal: RENDERS_PORTAL.test(source),
    inline: RENDERS_INLINE.test(source),
  };
  const doors = Object.keys(DOOR_TRAITS) as OverlayDoor[];
  return (
    doors.find(
      (door) =>
        DOOR_TRAITS[door].panel === traits.panel &&
        DOOR_TRAITS[door].portal === traits.portal &&
        DOOR_TRAITS[door].inline === traits.inline,
    ) ?? 'ambiguous'
  );
}

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

  it('declares no inline render outside the closed list', () => {
    // This measures the ABSENCE of `render: 'inline'`, not the portal door;
    // the door of each of these 22 families is pinned separately below.
    const rest = FAMILIES.filter((family) => !(family in INLINE_RENDERERS));
    expect(rest.length).toBe(22);
    for (const family of rest) {
      expect(host(family), family).not.toMatch(RENDERS_INLINE);
    }
  });

  it('names a door for every family and only for named families', () => {
    expect(Object.keys(OVERLAY_DOORS).sort()).toEqual([...FAMILIES].sort());
    expect(
      FAMILIES.filter((family) => OVERLAY_DOORS[family] === 'inline').sort(),
    ).toEqual(Object.keys(INLINE_RENDERERS).sort());
  });

  it.each(FAMILIES)('%s leaves through the door it declares', (family) => {
    const source = host(family);
    const measured = {
      panel: RENDERS_PANEL.test(source),
      portal: RENDERS_PORTAL.test(source),
      inline: RENDERS_INLINE.test(source),
    };
    expect(measured, `${family} changed its overlay posture`).toEqual(
      DOOR_TRAITS[OVERLAY_DOORS[family]],
    );
  });

  it('crosses a portal boundary in exactly 18 of the 24 families', () => {
    // Counted from what the sources show, so the census cannot drift away
    // from the tree while the roster above still claims a number.
    const census = FAMILIES.reduce<Record<string, number>>((tally, family) => {
      const door = measureDoor(host(family));
      tally[door] = (tally[door] ?? 0) + 1;
      return tally;
    }, {});
    expect(census).toEqual(DOOR_CENSUS);
    expect(census['field-overlay-panel'] + census['kernel-portal']).toBe(18);
  });

  it('keeps the four in-tree families fixed-positioned rather than flowed', () => {
    const inTree = FAMILIES.filter((family) => measureDoor(host(family)) === 'in-tree-fixed');
    expect(inTree).toEqual([
      'feedback/drawer',
      'overlay/popconfirm',
      'overlay/context-menu',
      'overlay/hover-card',
    ]);
    for (const family of inTree) {
      expect(host(family), `${family} must stay fixed-positioned in tree`).toMatch(
        FIXED_POSITION,
      );
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
    // A door probe must not be satisfied by a lookalike tag.
    expect('<PortalScope snapshot={s}>').not.toMatch(RENDERS_PORTAL);
    expect('<Portal container={host}>').toMatch(RENDERS_PORTAL);
    expect('<FieldOverlayPanel overlay={o}>').toMatch(RENDERS_PANEL);
    expect('<FieldOverlayPanelProps>').not.toMatch(RENDERS_PANEL);
  });
});
