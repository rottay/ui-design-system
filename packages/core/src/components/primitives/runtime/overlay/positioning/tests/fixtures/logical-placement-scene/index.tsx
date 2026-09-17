/**
 * @fileoverview Browser-geometry scene for the logical placement vocabulary.
 *
 * This module is NOT rendered by a DOM-runner test. It is bundled by
 * `OverlayPlacement.browser-geometry.integration.test.ts` and loaded in real
 * Chromium, because the facts it exists to measure -- where CSS anchor
 * positioning puts an overlay for `position-area: self-inline-start`, and
 * where a `:dir(rtl)` transform puts a slider readout -- are facts neither
 * happy-dom nor jsdom can produce: they do not lay out, do not resolve
 * logical properties, and return zero rects.
 *
 * The scene renders one direction per navigation (`#rtl` selects Arabic), so
 * the reading direction reaches the page through the i18n authority exactly
 * as it does in an application, on the document element.
 *
 * It measures in-page and parks the result on `data-probe-result`, the
 * `--dump-dom` idiom the cascade probe established: one process, one
 * navigation, no driver package, no port.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { OverlayPortalBoundary } from '@/components/primitives/runtime/overlay/positioning';
import ModernPopover from '@/components/primitives/overlay/popover/engines/modern';
import { Popconfirm as ModernPopconfirm } from '@/components/primitives/overlay/popconfirm/engines/modern';
import ModernSlider from '@/components/primitives/inputs/slider/engines/modern';
import ModernTooltip from '@/components/primitives/display/tooltip/engines/modern';

/** Rect fields the assertions need; a full DOMRect does not serialize. */
interface Edges {
  left: number;
  right: number;
}

/**
 * One NON-UNIFORM-direction tooltip scene: the app locale says one thing and
 * the anchor's own DOM context says the other. Measured once per positioning
 * branch, because the two branches read direction from different places by
 * construction and this is the tree where those two readings disagree.
 */
export interface NonUniformScene {
  /** The anchor's own resolved direction -- the authority for a portalled panel. */
  anchorDirection: string;
  /** Which branch actually ran: `anchor-css` (top layer) or `js` (measured). */
  strategy: string | null;
  anchor: Edges;
  bubble:
    | (Edges & {
        placementAttribute: string | null;
        preferredPlacement: string | null;
        collisionAdjusted: string | null;
      })
    | null;
  /** The arrow's own rect, to prove it sits on the anchor-facing edge. */
  arrow: Edges | null;
}

/**
 * A PORTALLED bubble in a non-uniform tree: its anchor declares one direction
 * and the portal root it lands in has the other. Nothing in its own ancestry
 * carries the anchor's direction, so the `dir` the engine stamps on it is the
 * only authority its logical paint can resolve against.
 */
export interface StampedDirectionScene {
  /** The anchor's own resolved direction -- what the engine stamps. */
  anchorDirection: string;
  /** The direction of the element the portal actually rendered into. */
  portalRootDirection: string;
  /** The attribute the engine wrote on the bubble. */
  stampedDir: string | null;
  /** The direction paint resolved for the bubble; must follow the stamp. */
  bubbleDirection: string;
  strategy: string | null;
  placementAttribute: string | null;
  arrowTracked: string | null;
  anchor: Edges;
  bubble: Edges | null;
  content: Edges | null;
  /** The shortcut chips, which the skin lays at the bubble's inline end. */
  keys: Edges | null;
  arrow: Edges | null;
}

/**
 * An IN-TREE surface (the `anchor-css` branch) whose tree declares one
 * direction and paints another: a locale ISLAND publishes `dir` on its own
 * scope element, and a container inside it sets `direction` in CSS without
 * declaring `dir`. The engine reads the island's `dir`, so the stamp and the
 * ancestry the surface is rendered into disagree, and every placement the
 * engine computed is expressed in the stamp.
 */
export interface InTreeStampedScene {
  /** The `dir` the nearest declaring ancestor carries -- what the engine reads. */
  declaredDir: string | null;
  /** The direction the anchor's own box resolves to, set in CSS below the island. */
  anchorDirection: string;
  /** The attribute the engine wrote on the surface. */
  stampedDir: string | null;
  /** The direction paint resolved for the surface; must follow the stamp. */
  surfaceDirection: string;
  strategy: string | null;
  placementAttribute: string | null;
  anchor: Edges;
  surface: Edges | null;
  body: Edges | null;
  /** The copy inside the body, which `text-align: start` lays at the inline start. */
  ink: Edges | null;
}

export interface PlacementProbeResult {
  dir: string;
  anchor: Edges;
  popover: (Edges & { positionArea: string; placementAttribute: string | null }) | null;
  tooltip: {
    anchor: Edges;
    bubble:
      | (Edges & {
          positionArea: string;
          placementAttribute: string | null;
          collisionAdjusted: string | null;
        })
      | null;
  } | null;
  verticalSlider: { root: Edges; tooltip: (Edges & { placement: string | null }) | null } | null;
  horizontalSlider: { input: Edges; tooltip: Edges | null } | null;
  /** app locale vs a bare `dir` wrapper around the anchor. */
  wrapperDir: { plain: NonUniformScene | null; portal: NonUniformScene | null };
  /** app locale vs a NESTED locale provider that never declares `dir`. */
  nestedLocale: { plain: NonUniformScene | null; portal: NonUniformScene | null };
  /** Popconfirm, same bare `dir` wrapper: the panel carries no arrow and stamps no placement. */
  popconfirmDir: { plain: NonUniformScene | null; portal: NonUniformScene | null };
  /** A portalled, aligned tooltip whose only direction authority is its own stamp. */
  stampedDirection: StampedDirectionScene | null;
  /** An in-tree popover whose stamp contradicts the ancestry it renders into. */
  inTreeStamped: InTreeStampedScene | null;
}

const RTL = typeof window !== 'undefined' && window.location.hash === '#rtl';
/** The reading direction the app locale is NOT, so every scene below is non-uniform. */
const OPPOSITE: 'ltr' | 'rtl' = RTL ? 'ltr' : 'rtl';
const NESTED_LOCALE = RTL ? 'en' : 'ar';

function edges(element: Element): Edges {
  const rect = element.getBoundingClientRect();
  return { left: rect.left, right: rect.right };
}

function NonUniformTooltip({ anchorId }: { anchorId: string }): React.ReactElement {
  return (
    <ModernTooltip content="Readout" placement="left" visible>
      <button type="button" id={anchorId} style={{ width: 80, height: 24 }}>
        anchor
      </button>
    </ModernTooltip>
  );
}

function NonUniformPopconfirm({ anchorId }: { anchorId: string }): React.ReactElement {
  return (
    <ModernPopconfirm title="Remove item?" open placement="left">
      <button type="button" id={anchorId} style={{ width: 80, height: 24 }}>
        anchor
      </button>
    </ModernPopconfirm>
  );
}

function Scene(): React.ReactElement {
  return (
    <I18nProvider locale={RTL ? 'ar' : 'en'} fallbackLocale="en">
      <div style={{ padding: 240 }}>
        {/* Popover asks for the deprecated physical `left`, which is now an
            alias of inline-start: one request, mirrored paint. */}
        <div id="popover-scene">
          <ModernPopover content="Readout" open placement="left" arrow={false}>
            <button type="button" id="popover-anchor" style={{ width: 80, height: 24 }}>
              anchor
            </button>
          </ModernPopover>
        </div>
        {/* Same request, same alias, through the Tooltip contract: a mirror
            is not a collision. */}
        <div id="tooltip-scene">
          <ModernTooltip content="Readout" placement="left" visible arrow={false}>
            <button type="button" id="tooltip-anchor" style={{ width: 80, height: 24 }}>
              anchor
            </button>
          </ModernTooltip>
        </div>
        <div id="vertical-scene" style={{ height: 240, width: 200 }}>
          <ModernSlider vertical defaultValue={50} tooltip={{ open: true }} />
        </div>
        <div id="horizontal-scene" style={{ width: 240 }}>
          <ModernSlider defaultValue={50} tooltip={{ open: true }} />
        </div>
        {/* NON-UNIFORM DIRECTION, scene 1: a bare `dir` wrapper that
            contradicts the app locale. The anchor-css branch resolves its
            `self-*` position-area against the bubble's own writing mode (this
            wrapper), so the measured branch must resolve the same side against
            the same authority rather than against the locale. */}
        <div id="wrapper-plain" dir={OPPOSITE} style={{ padding: 120 }}>
          <NonUniformTooltip anchorId="wrapper-plain-anchor" />
        </div>
        <OverlayPortalBoundary>
          <div id="wrapper-portal" dir={OPPOSITE} style={{ padding: 120 }}>
            <NonUniformTooltip anchorId="wrapper-portal-anchor" />
          </div>
        </OverlayPortalBoundary>
        {/* Scene 2: a NESTED locale provider. The context direction flips for
            the subtree while nothing in the anchor's ancestry declares `dir`,
            which is the other way the two readings come apart. */}
        <I18nProvider locale={NESTED_LOCALE} fallbackLocale="en">
          <div id="nested-plain" style={{ padding: 120 }}>
            <NonUniformTooltip anchorId="nested-plain-anchor" />
          </div>
        </I18nProvider>
        <OverlayPortalBoundary>
          <I18nProvider locale={NESTED_LOCALE} fallbackLocale="en">
            <div id="nested-portal" style={{ padding: 120 }}>
              <NonUniformTooltip anchorId="nested-portal-anchor" />
            </div>
          </I18nProvider>
        </OverlayPortalBoundary>
        {/* Scene 3: the same bare `dir` wrapper, through the Popconfirm
            contract. Its panel stays in-tree in both branches, so the only
            thing that can make the two disagree is the direction the request
            carries. */}
        <div id="popconfirm-plain" dir={OPPOSITE} style={{ padding: 120 }}>
          <NonUniformPopconfirm anchorId="popconfirm-plain-anchor" />
        </div>
        <OverlayPortalBoundary>
          <div id="popconfirm-portal" dir={OPPOSITE} style={{ padding: 120 }}>
            <NonUniformPopconfirm anchorId="popconfirm-portal-anchor" />
          </div>
        </OverlayPortalBoundary>
        {/* Scene 4: a PORTALLED bubble with an ALIGNED placement and a
            shortcut row, under a `dir` wrapper the document does not share.
            The portal root is a child of <body>, so the bubble inherits the
            app locale's direction from the tree it landed in; only the `dir`
            the engine stamps carries the anchor's. Both the shortcut row's
            inline end and the aligned arrow rule resolve against it. */}
        <OverlayPortalBoundary>
          <div id="stamped-portal" dir="rtl" style={{ padding: 120 }}>
            <ModernTooltip content="Copy rows" shortcut="mod+c" placement="top-end" visible>
              <button type="button" id="stamped-portal-anchor" style={{ width: 80, height: 24 }}>
                anchor
              </button>
            </ModernTooltip>
          </div>
        </OverlayPortalBoundary>
        {/* Scene 5: an IN-TREE surface (the `anchor-css` branch) under a tree
            that DECLARES one direction and PAINTS another: a nested locale
            island publishes `dir="rtl"` on its own scope element, and a
            container inside it sets `direction: ltr` in CSS without declaring
            `dir`. The engine reads the island and stamps `rtl`, and the branch
            renders the surface under a trigger that declares nothing, so the
            stamp is the only authority its logical paint may follow: the
            placement, the arrow offset and `text-align: start` are all
            expressed in it. Inheriting the container's `ltr` instead lays the
            copy on the opposite physical side from everything else. */}
        <I18nProvider locale="ar" fallbackLocale="en" directionScope="element">
          <div id="in-tree-stamped" style={{ padding: 120, direction: 'ltr' }}>
            <ModernPopover
              content={<div style={{ width: 240 }}><span data-probe-ink="true">Copy rows</span></div>}
              open
              placement="top"
            >
              <button type="button" id="in-tree-stamped-anchor" style={{ width: 80, height: 24 }}>
                anchor
              </button>
            </ModernPopover>
          </div>
        </I18nProvider>
      </div>
    </I18nProvider>
  );
}

/**
 * The Popconfirm panel belongs to its trigger through `aria-controls`, and its
 * anchor is the trigger WRAPPER, two levels up from the consumer's button.
 */
function popconfirmScene(anchorId: string): NonUniformScene | null {
  const trigger = document.getElementById(anchorId);
  const anchor = trigger?.closest<HTMLElement>('[data-part="trigger"]') ?? null;
  if (!trigger || !anchor) return null;
  const surfaceId = trigger.getAttribute('aria-controls');
  const surface = surfaceId ? document.getElementById(surfaceId) : null;
  return {
    anchorDirection: window.getComputedStyle(anchor).direction,
    strategy: surface?.getAttribute('data-ds-position-strategy') ?? null,
    anchor: edges(anchor),
    bubble: surface
      ? {
          ...edges(surface),
          placementAttribute: surface.getAttribute('data-placement'),
          preferredPlacement: surface.getAttribute('data-preferred-placement'),
          collisionAdjusted: surface.getAttribute('data-collision-adjusted'),
        }
      : null,
    arrow: null,
  };
}

/**
 * The bubble belongs to its anchor through `aria-describedby`, which is the
 * only link that survives the portal: a `js` bubble is a child of <body>, not
 * of the scene it was requested in.
 */
function nonUniformScene(anchorId: string): NonUniformScene | null {
  const trigger = document.getElementById(anchorId);
  const anchor = trigger?.parentElement ?? null;
  if (!trigger || !anchor) return null;
  const bubbleId = trigger.getAttribute('aria-describedby');
  const bubble = bubbleId ? document.getElementById(bubbleId) : null;
  const arrow = bubble?.querySelector('[data-part="arrow"]') ?? null;
  return {
    anchorDirection: window.getComputedStyle(anchor).direction,
    strategy: bubble?.getAttribute('data-ds-position-strategy') ?? null,
    anchor: edges(anchor),
    bubble: bubble
      ? {
          ...edges(bubble),
          placementAttribute: bubble.getAttribute('data-placement'),
          preferredPlacement: bubble.getAttribute('data-preferred-placement'),
          collisionAdjusted: bubble.getAttribute('data-collision-adjusted'),
        }
      : null,
    arrow: arrow ? edges(arrow) : null,
  };
}

/**
 * The stamped-direction scene, read through the same `aria-describedby` link:
 * the bubble is a child of the portal root, not of the wrapper that declared
 * the direction it must paint in.
 */
function stampedDirectionScene(anchorId: string): StampedDirectionScene | null {
  const trigger = document.getElementById(anchorId);
  const anchor = trigger?.parentElement ?? null;
  if (!trigger || !anchor) return null;
  const bubbleId = trigger.getAttribute('aria-describedby');
  const bubble = bubbleId ? document.getElementById(bubbleId) : null;
  const portalRoot = bubble?.parentElement ?? null;
  const content = bubble?.querySelector('[data-part="content"]') ?? null;
  const keys = bubble?.querySelector('[data-part="shortcut-chips"]') ?? null;
  const arrow = bubble?.querySelector('[data-part="arrow"]') ?? null;
  return {
    anchorDirection: window.getComputedStyle(anchor).direction,
    portalRootDirection: portalRoot ? window.getComputedStyle(portalRoot).direction : '',
    stampedDir: bubble?.getAttribute('dir') ?? null,
    bubbleDirection: bubble ? window.getComputedStyle(bubble).direction : '',
    strategy: bubble?.getAttribute('data-ds-position-strategy') ?? null,
    placementAttribute: bubble?.getAttribute('data-placement') ?? null,
    arrowTracked: bubble?.getAttribute('data-arrow-tracked') ?? null,
    anchor: edges(anchor),
    bubble: bubble ? edges(bubble) : null,
    content: content ? edges(content) : null,
    keys: keys ? edges(keys) : null,
    arrow: arrow ? edges(arrow) : null,
  };
}

/**
 * The in-tree scene: the surface is a child of the trigger, so its ancestry is
 * the CSS container, while the `dir` it carries came from the island above it.
 */
function inTreeStampedScene(anchorId: string): InTreeStampedScene | null {
  const trigger = document.getElementById(anchorId);
  const root = trigger?.closest<HTMLElement>('[data-part="trigger"]') ?? null;
  if (!trigger || !root) return null;
  const surface = root.querySelector('[data-part="surface"]');
  const body = surface?.querySelector('[data-part="body"]') ?? null;
  const ink = surface?.querySelector('[data-probe-ink]') ?? null;
  return {
    declaredDir: root.closest<HTMLElement>('[dir]')?.getAttribute('dir') ?? null,
    anchorDirection: window.getComputedStyle(root).direction,
    stampedDir: surface?.getAttribute('dir') ?? null,
    surfaceDirection: surface ? window.getComputedStyle(surface).direction : '',
    strategy: surface?.getAttribute('data-ds-position-strategy') ?? null,
    placementAttribute: surface?.getAttribute('data-placement') ?? null,
    anchor: edges(root),
    surface: surface ? edges(surface) : null,
    body: body ? edges(body) : null,
    ink: ink ? edges(ink) : null,
  };
}

function probe(): void {
  const anchor = document.getElementById('popover-anchor');
  const surface = document.querySelector('.ds-popover--modern [data-part="surface"]');
  const tooltipAnchor = document.getElementById('tooltip-anchor')?.parentElement ?? null;
  const tooltipBubble = document.querySelector('.ds-tooltip-bubble');
  const verticalScene = document.getElementById('vertical-scene');
  const verticalRoot = verticalScene?.querySelector('[data-part="root"]') ?? verticalScene;
  const verticalTooltip = verticalScene?.querySelector('[data-part="tooltip"]') ?? null;
  const horizontalScene = document.getElementById('horizontal-scene');
  const horizontalInput = horizontalScene?.querySelector('[data-part="native-input"]') ?? null;
  const horizontalTooltip = horizontalScene?.querySelector('[data-part="tooltip"]') ?? null;

  const result: PlacementProbeResult = {
    dir: document.documentElement.dir,
    anchor: anchor ? edges(anchor) : { left: NaN, right: NaN },
    popover: surface
      ? {
          ...edges(surface),
          positionArea: window.getComputedStyle(surface).getPropertyValue('position-area'),
          placementAttribute: surface.getAttribute('data-placement'),
        }
      : null,
    tooltip: tooltipAnchor
      ? {
          anchor: edges(tooltipAnchor),
          bubble: tooltipBubble
            ? {
                ...edges(tooltipBubble),
                positionArea: window.getComputedStyle(tooltipBubble).getPropertyValue('position-area'),
                placementAttribute: tooltipBubble.getAttribute('data-placement'),
                collisionAdjusted: tooltipBubble.getAttribute('data-collision-adjusted'),
              }
            : null,
        }
      : null,
    verticalSlider: verticalRoot
      ? {
          root: edges(verticalRoot),
          tooltip: verticalTooltip
            ? {
                ...edges(verticalTooltip),
                placement: verticalTooltip.getAttribute('data-placement'),
              }
            : null,
        }
      : null,
    horizontalSlider: horizontalInput
      ? {
          input: edges(horizontalInput),
          tooltip: horizontalTooltip ? edges(horizontalTooltip) : null,
        }
      : null,
    wrapperDir: {
      plain: nonUniformScene('wrapper-plain-anchor'),
      portal: nonUniformScene('wrapper-portal-anchor'),
    },
    nestedLocale: {
      plain: nonUniformScene('nested-plain-anchor'),
      portal: nonUniformScene('nested-portal-anchor'),
    },
    popconfirmDir: {
      plain: popconfirmScene('popconfirm-plain-anchor'),
      portal: popconfirmScene('popconfirm-portal-anchor'),
    },
    stampedDirection: stampedDirectionScene('stamped-portal-anchor'),
    inTreeStamped: inTreeStampedScene('in-tree-stamped-anchor'),
  };
  document.documentElement.setAttribute('data-probe-result', JSON.stringify(result));
}

const host = document.getElementById('root');
if (host) {
  createRoot(host).render(<Scene />);
  // Two frames plus a settle tick: the overlay's own first layout can change
  // its size, and the positioning runtime re-measures on the next frame.
  window.setTimeout(probe, 250);
}
