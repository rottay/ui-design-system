/**
 * @fileoverview FAB-17 Chromium fixture -- `position: static` through the
 * PUBLIC hatch, asserted against REAL browser layout.
 *
 * WHY THIS EXISTS SEPARATELY FROM THE UNIT SUITES. The unit suites read the
 * resolved INLINE STYLE and prove the merge contract: which value wins. Neither
 * jsdom nor happy-dom runs a layout engine -- every getBoundingClientRect() is
 * zero and `position` has no geometric effect -- so they cannot answer whether
 * the surface STAYS ANCHORED. That is this fixture's only job, and it must run
 * in Chromium to have any meaning.
 *
 * THE BAR THIS FILE IS HELD TO. Every assertion must be capable of returning
 * FALSE against a reverted engine (one that spreads the caller's style LAST).
 * Three habits enforce it:
 *
 *   1. EVERY SELECTOR TARGETS A MARKER ON THE SURFACE ITSELF. Modal, Popover
 *      and the portalled Dropdown all render OUTSIDE their JSX parent -- Modal
 *      into a portalled native <dialog>, Dropdown into `getPopupContainer`.
 *      Selecting by wrapper descent (`#wrapper [data-part=surface]`) matches
 *      NOTHING for those and would make the whole fixture a silent no-op. Each
 *      marker below is a className passed through the component's OWN public
 *      prop, so it travels into the portal with the surface. A selector that
 *      matches nothing is reported as a FAILED assertion, never skipped.
 *
 *   2. EXPECTATIONS ARE NUMBERS AND ENUMS, NEVER PROSE. Each assertion is a
 *      list of `PredicateResult`s built by `oneOf` / `within` / `between` /
 *      `gte`, which compute `pass` by comparing a measured number against a
 *      declared bound. There is no free-text expectation anywhere: a sentence
 *      in a data structure is true by typography and cannot be evidence.
 *
 *   3. GEOMETRY OVER COMPUTED-STYLE WHEREVER GEOMETRY CAN TELL THEM APART.
 *      Reading `getComputedStyle().position` is real (Chromium computes it, and
 *      a reverted engine reports `static`), but where a displacement exists it
 *      is asserted too. The Modal is the interesting case: `relative` and
 *      `static` place the panel itself IDENTICALLY, so the panel's own rect
 *      cannot discriminate. What discriminates is the CONTAINING BLOCK -- an
 *      absolutely positioned probe inside the panel resolves against the panel
 *      while it is `relative`, and jumps to the full-viewport <dialog> the
 *      moment it goes `static`. That probe is the Modal's geometric predicate.
 *
 * THE SCENE IS OFFSET ON PURPOSE. Every trigger sits far from the document
 * origin. A surface that loses its positioning falls back to flow layout at the
 * portal host's origin, which is then unmistakably far from where it belongs --
 * that displacement is what the geometric predicates measure.
 *
 * CONTROLS, OF TWO KINDS.
 *   NEGATIVE CONTROLS -- Popover (already merged positionStyle last) and the
 *   Dropdown submenu (positioned entirely by the modern skin) must PASS
 *   UNCHANGED under a reverted engine. They are what shows the merge-last
 *   mechanism is responsible for the subjects flipping, rather than the harness
 *   moving everything at once.
 *
 *   POSITIVE CONTROL -- proof THE CONDITION WAS ENGAGED. Every subject
 *   assertion here has the shape "the hostile value did NOT take effect", and
 *   that is exactly the shape that passes vacuously when the hostile value was
 *   never delivered. If `STATIC_HATCH` were emptied, or a component quietly
 *   dropped its `style` prop, every subject would still pass while proving
 *   nothing. So the payload is proved POTENT independently: twin probes,
 *   identical but for the hatch, must compute different `position` values AND
 *   sit at measurably different coordinates. A witness custom property carried
 *   in the same object is then read back off each subject surface, proving the
 *   caller's object reached that specific element. If either fails, the
 *   subjects' passes are known to be vacuous and the run is not evidence.
 */
import React from 'react';

import { Dropdown as ModernDropdown } from '../../../engines/modern';
import ModernPopover from '../../../../popover/engines/modern';
import ModernModal from '../../../../../feedback/modal/engines/modern';
import ModernDrawer from '../../../../../feedback/drawer/engines/modern';

/**
 * The witness rides inside the hostile payload itself. No engine reads or sets
 * it, so finding it in a surface's computed style proves the caller's style
 * OBJECT reached that element -- which is the precondition for `position:
 * static` in the same object having been delivered and then overridden.
 */
export const HATCH_WITNESS_PROPERTY = '--fab17-hatch-witness';
export const HATCH_WITNESS_VALUE = 'engaged';

/**
 * The hostile caller payload. `position: static` is what FAB-17 rules on;
 * `animation: none` removes the motion confound (an in-flight enter animation
 * can translate a correctly-anchored surface and read as a false failure).
 * Both travel through the same public, unrestricted CSSProperties hatch.
 */
export const STATIC_HATCH = {
  position: 'static',
  animation: 'none',
  [HATCH_WITNESS_PROPERTY]: HATCH_WITNESS_VALUE,
} as React.CSSProperties;

/** Markers that ride the components' own className props into the portal. */
export const MARK = {
  modal: 'fab17-mark-modal',
  modalProbe: 'fab17-mark-modal-probe',
  drawer: 'fab17-mark-drawer',
  dropdown: 'fab17-mark-dropdown',
  dropdownTrigger: 'fab17-mark-dropdown-trigger',
  popover: 'fab17-mark-popover',
  popoverTrigger: 'fab17-mark-popover-trigger',
  submenuHost: 'fab17-mark-submenu-host',
  submenuTrigger: 'fab17-mark-submenu-trigger',
  potencyHost: 'fab17-mark-potency-host',
  potencyBaseline: 'fab17-mark-potency-baseline',
  potencyHatched: 'fab17-mark-potency-hatched',
} as const;

/** The engine's own trigger-to-surface gap (`SURFACE_GAP` in the modern engine). */
export const DROPDOWN_SURFACE_GAP = 8;

/** Sub-pixel slack for a rect comparison that should be exact. */
const EXACT = 1.5;

/** Geometry of the positive-control host, shared with its predicates. */
const POTENCY_HOST_PADDING = 40;
const POTENCY_SPACER_HEIGHT = 30;

export type PredicateOperator = 'oneOf' | 'within' | 'between' | 'gte';

export interface PredicateResult {
  /** What is being measured, e.g. `surface.left - trigger.left`. */
  readonly measure: string;
  readonly operator: PredicateOperator;
  /** The declared bound: an enum list or a number pair. Never a sentence. */
  readonly bound: readonly (string | number)[];
  readonly actual: string | number;
  readonly pass: boolean;
}

export interface AssertionResult {
  readonly id: string;
  readonly role: 'subject' | 'negative-control' | 'positive-control';
  readonly pass: boolean;
  readonly predicates: readonly PredicateResult[];
  /** Raw numbers behind the predicates, for the report. */
  readonly measurements: Readonly<Record<string, number | string>>;
  /** Present only when the assertion could not be evaluated at all. */
  readonly error?: string;
}

const round = (n: number): number => Math.round(n * 100) / 100;

// -- predicate constructors. Each computes `pass` numerically. ---------------

const oneOf = (
  measure: string,
  actual: string,
  bound: readonly string[],
): PredicateResult => ({
  measure,
  operator: 'oneOf',
  bound,
  actual,
  pass: bound.includes(actual),
});

const within = (
  measure: string,
  actual: number,
  target: number,
  tolerance: number,
): PredicateResult => ({
  measure,
  operator: 'within',
  bound: [round(target), round(tolerance)],
  actual: round(actual),
  pass: Math.abs(actual - target) <= tolerance,
});

const between = (
  measure: string,
  actual: number,
  low: number,
  high: number,
): PredicateResult => ({
  measure,
  operator: 'between',
  bound: [round(low), round(high)],
  actual: round(actual),
  pass: actual >= low && actual <= high,
});

const gte = (measure: string, actual: number, bound: number): PredicateResult => ({
  measure,
  operator: 'gte',
  bound: [round(bound)],
  actual: round(actual),
  pass: actual >= bound,
});

/**
 * A missing element is a FAILED assertion, not a skipped one. `assertion()`
 * catches the throw so one unreachable selector cannot abort the run and hide
 * the rest -- the defect this fixture was rewritten to eliminate.
 */
function need(selector: string): HTMLElement {
  const matches = document.querySelectorAll(selector);
  if (matches.length === 0) {
    throw new Error(`selector matched nothing -> ${selector}`);
  }
  if (matches.length > 1) {
    throw new Error(`selector matched ${matches.length} elements (must be unique) -> ${selector}`);
  }
  return matches[0] as HTMLElement;
}

function assertion(
  id: string,
  role: AssertionResult['role'],
  body: () => { predicates: PredicateResult[]; measurements: Record<string, number | string> },
): AssertionResult {
  try {
    const { predicates, measurements } = body();
    return {
      id,
      role,
      pass: predicates.length > 0 && predicates.every((p) => p.pass),
      predicates,
      measurements,
    };
  } catch (error) {
    return {
      id,
      role,
      pass: false,
      predicates: [],
      measurements: {},
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const witnessOf = (el: HTMLElement): string =>
  getComputedStyle(el).getPropertyValue(HATCH_WITNESS_PROPERTY).trim();

/**
 * POSITIVE CONTROL. Proves the payload is potent before any subject is
 * believed. The twins differ only by the spread of STATIC_HATCH, so any
 * measured difference between them is attributable to the payload and nothing
 * else. Both predicates must change if the payload is engaged:
 *   - computed `position` flips absolute -> static, and
 *   - the element MOVES, because the host offsets its content box and a spacer
 *     pushes the in-flow position clear of the absolute origin.
 * A vacuous payload fails this and invalidates every subject in the run.
 */
export function runFab17PayloadPotencyControl(): AssertionResult[] {
  return [
    assertion('positive-control-static-hatch-is-potent', 'positive-control', () => {
      const baseline = need(`.${MARK.potencyBaseline}`);
      const hatched = need(`.${MARK.potencyHatched}`);
      const b = baseline.getBoundingClientRect();
      const h = hatched.getBoundingClientRect();
      const baselinePosition = getComputedStyle(baseline).position;
      const hatchedPosition = getComputedStyle(hatched).position;
      return {
        predicates: [
          oneOf('computedStyle(baseline).position', baselinePosition, ['absolute']),
          oneOf('computedStyle(hatched).position', hatchedPosition, ['static']),
          // POTENCY_HOST_PADDING / POTENCY_SPACER_HEIGHT below set these gaps.
          gte('hatched.left - baseline.left', h.left - b.left, POTENCY_HOST_PADDING - EXACT),
          gte(
            'hatched.top - baseline.top',
            h.top - b.top,
            POTENCY_HOST_PADDING + POTENCY_SPACER_HEIGHT - EXACT,
          ),
          oneOf('computedStyle(hatched)[witness]', witnessOf(hatched), [HATCH_WITNESS_VALUE]),
        ],
        measurements: {
          baselineRect: `${round(b.left)},${round(b.top)}`,
          hatchedRect: `${round(h.left)},${round(h.top)}`,
          deltaLeft: round(h.left - b.left),
          deltaTop: round(h.top - b.top),
        },
      };
    }),
  ];
}

/**
 * The subjects plus the Popover negative control. Every entry MEASURES the live
 * document; every expectation is a number or an enum.
 */
export function runFab17Primary(): AssertionResult[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  return [
    // -- SUBJECT: Modal ----------------------------------------------------
    // `relative` and `static` place the panel itself identically, so the panel
    // rect cannot discriminate -- the CONTAINING BLOCK can. The probe is
    // `position:absolute; top:0; left:0` inside the panel body (which the
    // modern skin leaves unpositioned, verified), so it resolves against the
    // panel while the panel is `relative`. Reverted, the panel goes `static`,
    // the probe's containing block becomes the <dialog> -- `position:fixed;
    // inset:0` -- and it lands at the viewport origin, several hundred px away
    // from a centered panel. The separation guard asserts that distance exists
    // before the probe result is trusted.
    assertion('modal-panel-is-the-containing-block', 'subject', () => {
      const panel = need(`.${MARK.modal}`);
      const probe = need(`.${MARK.modalProbe}`);
      const position = getComputedStyle(panel).position;
      const p = panel.getBoundingClientRect();
      const q = probe.getBoundingClientRect();
      return {
        predicates: [
          oneOf('computedStyle(panel).position', position, ['fixed', 'relative']),
          oneOf('computedStyle(panel)[witness]', witnessOf(panel), [HATCH_WITNESS_VALUE]),
          // Separation guard: without it the probe test is degenerate.
          gte('panel.left (separation from viewport origin)', p.left, 120),
          // Probe sits at the panel's padding-box origin: at or after the panel
          // edge, and within one padding step of it -- never at the viewport
          // origin the <dialog> would give it.
          between('probe.left - panel.left', q.left - p.left, -EXACT, 80),
          between('probe.top - panel.top', q.top - p.top, -EXACT, 120),
        ],
        measurements: {
          panelRect: `${round(p.left)},${round(p.top)},${round(p.width)}x${round(p.height)}`,
          probeOrigin: `${round(q.left)},${round(q.top)}`,
          viewport: `${vw}x${vh}`,
        },
      };
    }),

    // -- SUBJECT: Drawer ---------------------------------------------------
    // The Drawer renders IN-TREE, so losing `fixed` drops it into document
    // flow. The right-placement rect is a viewport-edge span: pinned to the
    // right edge and spanning the full viewport height. Both collapse when it
    // goes static, and both are exact numbers here.
    assertion('drawer-pins-to-viewport-right-edge', 'subject', () => {
      const surface = need(`.${MARK.drawer}`);
      const position = getComputedStyle(surface).position;
      const r = surface.getBoundingClientRect();
      return {
        predicates: [
          oneOf('computedStyle(surface).position', position, ['fixed']),
          oneOf('computedStyle(surface)[witness]', witnessOf(surface), [HATCH_WITNESS_VALUE]),
          within('surface.right', r.right, vw, EXACT),
          within('surface.top', r.top, 0, EXACT),
          within('surface.height', r.height, vh, EXACT),
        ],
        measurements: {
          surfaceRect: `${round(r.left)},${round(r.top)},${round(r.width)}x${round(r.height)}`,
          viewport: `${vw}x${vh}`,
        },
      };
    }),

    // -- SUBJECT: Dropdown -------------------------------------------------
    // The sharpest case: the engine MEASURES coordinates against the trigger
    // and applies them against the position it sets. `bottomLeft` means the
    // surface's left edge aligns with the trigger's left edge and its top edge
    // sits exactly SURFACE_GAP below the trigger's bottom -- two exact numbers,
    // not a containment hand-wave. Detached, the menu lands at the portal
    // host's flow origin instead.
    assertion('dropdown-surface-tracks-its-trigger', 'subject', () => {
      const surface = need(`.${MARK.dropdown}`);
      const trigger = need(`.${MARK.dropdownTrigger}`);
      const position = getComputedStyle(surface).position;
      const visibility = getComputedStyle(surface).visibility;
      const s = surface.getBoundingClientRect();
      const t = trigger.getBoundingClientRect();
      return {
        predicates: [
          oneOf('computedStyle(surface).position', position, ['absolute']),
          oneOf('computedStyle(surface)[witness]', witnessOf(surface), [HATCH_WITNESS_VALUE]),
          // The engine hides the surface until it has measured. A hidden
          // surface must not be read as anchored.
          oneOf('computedStyle(surface).visibility', visibility, ['visible']),
          within('surface.left - trigger.left', s.left - t.left, 0, EXACT),
          within(
            'surface.top - trigger.bottom',
            s.top - t.bottom,
            DROPDOWN_SURFACE_GAP,
            EXACT,
          ),
        ],
        measurements: {
          surfaceRect: `${round(s.left)},${round(s.top)},${round(s.width)}x${round(s.height)}`,
          triggerRect: `${round(t.left)},${round(t.top)},${round(t.width)}x${round(t.height)}`,
          scroll: `${round(window.scrollX)},${round(window.scrollY)}`,
        },
      };
    }),

    // -- NEGATIVE CONTROL: Popover ------------------------------------------
    // Already protected: positionStyle merged last before FAB-17 existed. Must
    // pass identically under a reverted engine. Default placement is `top`, so
    // the surface sits ABOVE the trigger and overlaps it horizontally.
    assertion('popover-surface-stays-anchored-CONTROL', 'negative-control', () => {
      const surface = need(`.${MARK.popover}`);
      const trigger = need(`.${MARK.popoverTrigger}`);
      const position = getComputedStyle(surface).position;
      const s = surface.getBoundingClientRect();
      const t = trigger.getBoundingClientRect();
      const horizontalOverlap =
        Math.min(s.right, t.right) - Math.max(s.left, t.left);
      return {
        predicates: [
          oneOf('computedStyle(surface).position', position, ['fixed', 'absolute']),
          oneOf('computedStyle(surface)[witness]', witnessOf(surface), [HATCH_WITNESS_VALUE]),
          gte('overlap(surface.x, trigger.x)', horizontalOverlap, 1),
          // Anchored above the trigger, within a plausible offset band.
          between('trigger.top - surface.bottom', t.top - s.bottom, -EXACT, 32),
        ],
        measurements: {
          surfaceRect: `${round(s.left)},${round(s.top)},${round(s.width)}x${round(s.height)}`,
          triggerRect: `${round(t.left)},${round(t.top)},${round(t.width)}x${round(t.height)}`,
          horizontalOverlap: round(horizontalOverlap),
        },
      };
    }),
  ];
}

/**
 * NEGATIVE CONTROL: the Dropdown submenu. Split into its own phase because it
 * only exists after a REAL interaction -- `open` on the top-level Dropdown does
 * NOT open it (the modern engine renders the submenu only while the parent
 * item's own `submenuOpen` state is true). A control that never renders reads
 * as coverage while proving nothing, so the first assertion here is that the
 * submenu EXISTS, and the runner records which interaction produced it.
 *
 * Both viewport-covering overlays block that interaction: the modal's native
 * <dialog> sits in the top layer and the Drawer paints a full-viewport
 * backdrop. Both are fully measured by the time this phase begins, so the
 * runner unmounts them through ordinary React state first.
 *
 * @param openedBy - the interaction the runner drove, recorded as evidence that
 *   the control was engaged rather than incidentally present.
 */
export function runFab17SubmenuControl(openedBy: string): AssertionResult[] {
  return [
    // POSTURE PRECONDITION. The modern skin carries
    // `@container rottay-dropdown (max-width: 20rem)`, which deliberately
    // stacks the submenu IN FLOW on a narrow surface. The container is the
    // surface itself. Asserting the hangs-outside contract while the compact
    // posture is active would be asserting the wrong posture -- so the width is
    // checked FIRST and reported as its own failure.
    assertion('submenu-scene-is-in-the-wide-posture-PRECONDITION', 'negative-control', () => {
      const surface = need(`.${MARK.submenuHost}`);
      const width = surface.getBoundingClientRect().width;
      return {
        predicates: [gte('submenuHost.width', width, 320.01)],
        measurements: { surfaceWidth: round(width) },
      };
    }),

    // ENGAGEMENT. Absence here is a failure, never a silent skip.
    assertion('submenu-was-actually-opened-ENGAGEMENT', 'negative-control', () => {
      const host = need(`.${MARK.submenuHost}`);
      const submenus = host.querySelectorAll(`[data-part='submenu']`);
      const parentItem = host.querySelector(`[data-part='item'][aria-haspopup='menu']`);
      const expanded = parentItem?.getAttribute('aria-expanded') ?? 'absent';
      return {
        predicates: [
          within('count([data-part=submenu])', submenus.length, 1, 0),
          oneOf('parentItem[aria-expanded]', expanded, ['true']),
        ],
        measurements: { openedBy },
      };
    }),

    // Positioned entirely by the modern skin (`position:absolute` +
    // `inset-inline-start: calc(100% + 0.48rem)`), and it takes no caller style
    // at all. It must hang to the inline-end of its parent item in both
    // variants. The skin's own numbers are the bound: 0.48rem out and -0.42rem
    // up from the parent item box.
    assertion('dropdown-submenu-hangs-outside-parent-CONTROL', 'negative-control', () => {
      const submenu = need(`.${MARK.submenuHost} [data-part='submenu']`);
      const parentItem = submenu.parentElement as HTMLElement | null;
      if (!parentItem) throw new Error('submenu has no parent item-shell');
      const position = getComputedStyle(submenu).position;
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const sub = submenu.getBoundingClientRect();
      const parent = parentItem.getBoundingClientRect();
      return {
        predicates: [
          oneOf('computedStyle(submenu).position', position, ['absolute']),
          within('submenu.left - parent.right', sub.left - parent.right, 0.48 * rootFontSize, EXACT),
          within('submenu.top - parent.top', sub.top - parent.top, -0.42 * rootFontSize, EXACT),
          gte('submenu.width', sub.width, 1),
        ],
        measurements: {
          submenuRect: `${round(sub.left)},${round(sub.top)},${round(sub.width)}x${round(sub.height)}`,
          parentItemRect: `${round(parent.left)},${round(parent.top)},${round(parent.width)}x${round(parent.height)}`,
          rootFontSize: round(rootFontSize),
        },
      };
    }),
  ];
}

/**
 * The positive control's twin probes. Identical but for the hatch spread, so
 * the measured difference between them is attributable to the payload alone.
 * The host is `position: relative` and PADDED, and a spacer precedes the
 * probes, so the absolute origin (host padding-box corner) and the in-flow
 * position (after the padding and the spacer) are far apart. Without that
 * offset a static block child would land on the absolute origin and the control
 * would be unable to fail.
 */
function PayloadPotencyProbes(): React.ReactElement {
  const probe: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 10,
    height: 10,
    background: 'currentColor',
  };
  return (
    <div
      className={MARK.potencyHost}
      style={{ position: 'relative', padding: POTENCY_HOST_PADDING, width: 260, height: 160 }}
    >
      <div style={{ height: POTENCY_SPACER_HEIGHT }} />
      <div className={MARK.potencyBaseline} style={probe} />
      <div className={MARK.potencyHatched} style={{ ...probe, ...STATIC_HATCH }} />
    </div>
  );
}

/**
 * The scene. Overlays are forced open declaratively; the submenu is the one
 * piece that genuinely requires interaction, which the runner drives in phase 2.
 */
export function Fab17StaticHatchScene(): React.ReactElement {
  // PHASE MODEL. Phase 1 measures the declaratively-open surfaces. Phase 2
  // measures the submenu control, which needs a REAL interaction -- and both
  // viewport-covering overlays block it: the modal's native <dialog> sits in
  // the top layer (still intercepting even after close()), and the Drawer
  // paints a full-viewport backdrop. Both are already measured by the time
  // phase 2 begins, so unmounting them through ordinary React state is
  // deterministic and costs no coverage.
  const [phase, setPhase] = React.useState<1 | 2>(1);
  React.useEffect(() => {
    (window as unknown as Record<string, unknown>).__FAB17_SET_PHASE__ = setPhase;
  }, []);
  const viewportOverlays = phase === 1;

  return (
    <div data-fab17-scene="static-hatch" data-fab17-phase={phase} style={{ padding: 160 }}>
      <PayloadPotencyProbes />

      {viewportOverlays && (
        <ModernModal open title="FAB-17 modal" className={MARK.modal} style={STATIC_HATCH} disableAnimation>
          {/* Containing-block probe. Absolute, pinned to its containing block's
              origin -- the panel while the panel is positioned, the
              full-viewport <dialog> the moment it is not. */}
          <div
            className={MARK.modalProbe}
            style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8 }}
          />
          modal body
        </ModernModal>
      )}

      {viewportOverlays && (
        <ModernDrawer open placement="right" className={MARK.drawer} style={STATIC_HATCH}>
          drawer body
        </ModernDrawer>
      )}

      <div style={{ marginTop: 240 }}>
        <ModernDropdown
          open
          overlayClassName={MARK.dropdown}
          overlayStyle={STATIC_HATCH}
          getPopupContainer={() => document.body}
          menu={{ items: [{ key: 'a', label: 'Item A' }] }}
        >
          <button type="button" className={MARK.dropdownTrigger}>
            dropdown trigger
          </button>
        </ModernDropdown>
      </div>

      <div style={{ marginTop: 240 }}>
        <ModernPopover
          open
          content="control content"
          title="control"
          overlayClassName={MARK.popover}
          overlayStyle={STATIC_HATCH}
        >
          <button type="button" className={MARK.popoverTrigger}>
            popover trigger
          </button>
        </ModernPopover>
      </div>

      {/* Widened past the skin's 20rem container threshold via the dropdown's
          own width TOKEN -- not a positioning style -- so the submenu renders
          in its standard hangs-outside posture rather than the compact in-flow
          one. The precondition assertion above fails loudly if this stops
          holding. */}
      <div style={{ marginTop: 240, ['--ds-dropdown-min-width' as string]: '26rem' } as React.CSSProperties}>
        <ModernDropdown
          open
          overlayClassName={MARK.submenuHost}
          overlayStyle={STATIC_HATCH}
          menu={{
            items: [
              {
                key: 'parent',
                label: 'Parent',
                children: [{ key: 'child', label: 'Child' }],
              },
            ],
          }}
        >
          <button type="button" className={MARK.submenuTrigger}>
            submenu trigger
          </button>
        </ModernDropdown>
      </div>
    </div>
  );
}

export default Fab17StaticHatchScene;
