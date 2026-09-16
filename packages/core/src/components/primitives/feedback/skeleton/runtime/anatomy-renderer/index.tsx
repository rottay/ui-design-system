'use client';

/**
 * Renders the component a loading state stands in for, reads its stamped `data-part`
 * anatomy and paints one bone per part, so the skeleton cannot drift from the component.
 */

import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { useOptionalTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { PROVIDER_PAINT_ATTRIBUTE_FILTER } from '@/infrastructure/runtime/dom/runtime/css-color-resolution';
import { resolveSkeletonPersonalityDefaults } from '@/foundation/tokens/ts/runtime/personality';
import type { SkeletonAnimation } from '../../contracts';

/**
 * How a stamped part becomes part of the loading surface.
 *
 * | Role | Loading surface |
 * |------|-----------------|
 * | `frame` | the part's outline; its parts are read inside it |
 * | `pass` | nothing; its parts are read |
 * | `block` | one bone the size of the part |
 * | `line` | one text-height bone across the part |
 * | `round` | one circular bone |
 * | `omit` | nothing, and nothing inside it |
 */
export type SkeletonPartRole = 'frame' | 'pass' | 'block' | 'line' | 'round' | 'omit';

/**
 * The part vocabulary the renderer can draw. A family that stamps a part name
 * missing here fails the family-cut gate until the name is given a role.
 */
export const SKELETON_PART_ROLES: Readonly<Record<string, SkeletonPartRole>> = Object.freeze({
  // ---- tree, list and descriptions anatomy (WO-FAM-06 tree/list/descriptions cut) ----
  // A node row and a descriptions body read their parts; the selection control
  // is a block; a drag affordance and a layout spacer mean nothing with no data.
  node: 'pass',
  rows: 'pass',
  checkbox: 'block',
  'drop-indicator': 'omit',
  'switcher-spacer': 'omit',
  // A list item's meta is the row the loading state stands in for: its wrappers
  // pass through and its two texts are the lines the bones draw.
  meta: 'pass',
  'meta-content': 'pass',
  'meta-avatar': 'round',
  'meta-title': 'line',
  'meta-description': 'line',
  // The item's own wrappers pass through; one action is a control-sized box;
  // the loading grid host is the stand-in itself, so it draws nothing.
  'item-content': 'pass',
  'item-extra': 'pass',
  'item-actions': 'pass',
  'item-action': 'block',
  'loading-grid': 'omit',
  // ---- badge, tag and avatar anatomy (WO-FAM-06 badge/tag/avatar cut) ----
  // A dismiss control is a pill; the avatar silhouette is the mask, measured
  // with its own corner so a rounded square stays square; what fills the
  // silhouette adds nothing over it.
  close: 'round',
  mask: 'block',
  fallback: 'omit',
  'status-dot': 'round',
  surplus: 'round',
  // ---- table anatomy (WO-FAM-06 table cut) ----
  // Containers read their parts; the header title is the only text line; the
  // affordances that mean nothing without data draw nothing.
  table: 'pass',
  'scroll-container': 'pass',
  'header-cell': 'pass',
  'header-content': 'pass',
  'header-title': 'line',
  'sort-indicator': 'omit',
  'resize-handle': 'omit',
  'filter-row': 'pass',
  'filter-cell': 'pass',
  'filter-spacer': 'omit',
  'expand-cell': 'pass',
  'expand-button': 'block',
  'expand-indicator': 'omit',
  'expanded-row': 'omit',
  'selection-cell': 'pass',
  'selection-control': 'block',
  'selection-hit': 'omit',
  'empty-cell': 'omit',
  'virtual-spacer': 'omit',
  pagination: 'pass',
  'pagination-button': 'block',
  root: 'frame',
  surface: 'frame',
  bubble: 'frame',
  group: 'pass',
  body: 'pass',
  header: 'pass',
  'header-main': 'pass',
  footer: 'pass',
  actions: 'pass',
  content: 'pass',
  'content-frame': 'pass',
  field: 'pass',
  row: 'pass',
  option: 'pass',
  extra: 'pass',
  'control-row': 'pass',
  'control-slot': 'pass',
  'label-wrap': 'pass',
  layout: 'pass',
  'message-region': 'pass',
  item: 'pass',
  'error-wrapper': 'pass',
  'error-list': 'pass',
  'strength-meter': 'pass',
  trailing: 'pass',
  'clear-field': 'pass',
  columns: 'pass',
  'extra-footer': 'pass',
  'format-field': 'pass',
  grid: 'pass',
  // A grid cell is a container: its children are drawn, it is not (WO-FAM-07).
  'grid-cell': 'pass',
  'group-options': 'pass',
  'hex-field': 'pass',
  'input-wrapper': 'pass',
  'menu-column': 'pass',
  'nav-group': 'pass',
  operations: 'pass',
  'option-content': 'pass',
  'option-group': 'pass',
  'option-list': 'pass',
  'panel-header': 'pass',
  'panel-item': 'pass',
  'panel-list': 'pass',
  'panel-pagination': 'pass',
  'panel-search-field': 'pass',
  'preset-group': 'pass',
  'preset-row': 'pass',
  presets: 'pass',
  'search-input-wrapper': 'pass',
  'time-column': 'pass',
  'tree-list': 'pass',
  'tree-node-highlight': 'pass',
  'trigger-actions': 'pass',
  'virtual-track': 'pass',
  'virtual-window': 'pass',
  'week-row': 'pass',
  'weekday-row': 'pass',
  'heading-group': 'pass',
  'handle-area': 'pass',
  copy: 'pass',
  menu: 'pass',
  'item-shell': 'pass',
  'trigger-content': 'pass',
  'shortcut-row': 'pass',
  indicators: 'pass',
  stack: 'pass',
  'stack-item': 'pass',
  controls: 'pass',
  'tab-rail': 'pass',
  'tab-list': 'pass',
  'tab-panel': 'pass',
  navigation: 'pass',
  main: 'pass',
  'panel-body': 'pass',
  connector: 'block',
  list: 'pass',
  'pagination-controls': 'pass',
  'pagination-jumper': 'pass',
  'pagination-size-changer': 'pass',
  trigger: 'block',
  control: 'block',
  input: 'block',
  action: 'block',
  cover: 'block',
  'cover-image': 'block',
  img: 'block',
  image: 'block',
  media: 'block',
  box: 'block',
  track: 'block',
  'addon-before': 'block',
  'addon-after': 'block',
  'search-button': 'block',
  slot: 'block',
  'tag-chip': 'block',
  'strength-track': 'block',
  'format-select': 'block',
  'hex-input': 'block',
  'native-color-input': 'block',
  'panel-search': 'block',
  'search-input': 'block',
  tag: 'block',
  textarea: 'block',
  'time-select': 'block',
  'trigger-input': 'block',
  'tab-button': 'block',
  'tab-badge': 'block',
  'overflow-previous': 'block',
  'overflow-next': 'block',
  'overflow-more': 'block',
  crumb: 'block',
  'overflow-trigger': 'block',
  'pagination-nav-button': 'block',
  'pagination-page-button': 'block',
  'quick-jumper': 'block',
  'pagination-size-select': 'block',
  title: 'line',
  description: 'line',
  label: 'line',
  'trigger-label': 'line',
  'trigger-code': 'line',
  text: 'line',
  value: 'line',
  'option-label': 'line',
  'state-label': 'line',
  'helper-text': 'line',
  'error-message': 'line',
  cell: 'line',
  line: 'line',
  count: 'line',
  'error-text': 'line',
  'error-item': 'line',
  'extra-text': 'line',
  'help-text': 'line',
  'label-text': 'line',
  message: 'line',
  'strength-label': 'line',
  'column-label': 'line',
  'display-text': 'line',
  'group-label': 'line',
  'option-description': 'line',
  'pagination-status': 'line',
  'panel-count': 'line',
  'panel-item-label': 'line',
  'panel-title': 'line',
  placeholder: 'line',
  'preset-label': 'line',
  'tag-count': 'line',
  'tag-label': 'line',
  'tree-node-label': 'line',
  'trigger-value': 'line',
  'weekday-header': 'line',
  'action-label': 'line',
  'tab-label': 'line',
  'pagination-range': 'line',
  'pagination-simple-text': 'line',
  ellipsis: 'line',
  subtitle: 'line',
  eyebrow: 'line',
  icon: 'round',
  prefix: 'round',
  suffix: 'round',
  avatar: 'round',
  flag: 'round',
  circle: 'round',
  'affix-prefix': 'round',
  'affix-suffix': 'round',
  'error-icon': 'round',
  'feedback-icon': 'round',
  'tooltip-icon': 'round',
  'visibility-toggle': 'round',
  'arrow-icon': 'round',
  'calendar-icon': 'round',
  chevron: 'round',
  'clock-icon': 'round',
  'option-icon': 'round',
  'panel-item-checkbox': 'round',
  'panel-search-icon': 'round',
  'panel-select-all': 'round',
  'preset-swatch': 'round',
  'search-icon': 'round',
  swatch: 'round',
  'tree-node-toggle': 'round',
  'close-button': 'round',
  'header-icon': 'round',
  spinner: 'omit',
  checkmark: 'omit',
  dot: 'omit',
  thumb: 'omit',
  'state-icon': 'omit',
  'loading-indicator': 'omit',
  'spinner-track': 'omit',
  'spinner-indicator': 'omit',
  'busy-content': 'omit',
  'accessible-label': 'omit',
  'loading-content': 'omit',
  'loading-overlay': 'omit',
  gradient: 'omit',
  overlay: 'omit',
  panel: 'omit',
  'clear-button': 'omit',
  anchor: 'omit',
  backdrop: 'omit',
  handle: 'omit',
  // ---- splitter anatomy (WO-FAM-07 layout cut) ----
  // A resize boundary is an affordance, not content: with no panels to move it
  // means nothing, exactly like the `handle` above.
  gutter: 'omit',
  arrow: 'omit',
  divider: 'omit',
  // ---- divider anatomy (WO-FAM-07 layout cut) ----
  // The two rule segments around a label are hairlines: a skeleton draws no
  // bone for a mark that carries no content.
  'line-before': 'omit',
  'line-after': 'omit',
  submenu: 'omit',
  'selection-indicator': 'omit',
  'submenu-indicator': 'omit',
  'shortcut-chips': 'omit',
  'shortcut-key': 'omit',
  spotlight: 'omit',
  progress: 'omit',
  indicator: 'round',
  'pagination-size-icon': 'round',
  'dot-slot': 'round',
  'status-name': 'omit',
  'caps-lock-hint': 'omit',
  'required-mark': 'omit',
  steppers: 'omit',
  'stepper-button': 'omit',
  'strength-fill': 'omit',
  'strength-segment': 'omit',
  'column-divider': 'omit',
  'double-nav-icon': 'omit',
  dropdown: 'omit',
  empty: 'omit',
  'hex-error': 'omit',
  'label-separator': 'omit',
  'leaf-spacer': 'omit',
  loading: 'omit',
  'loading-label': 'omit',
  'loading-spinner': 'omit',
  'loading-state': 'omit',
  'loading-state-label': 'omit',
  'loading-status': 'omit',
  'native-arrow': 'omit',
  'option-check': 'omit',
  'option-checkbox': 'omit',
  'panel-empty': 'omit',
  'panel-empty-icon': 'omit',
  popup: 'omit',
  separator: 'omit',
  'tag-remove': 'omit',
  'time-separator': 'omit',
  'trigger-loading': 'omit',
});

/** A part the renderer has no role for still shows as its own box. */
const UNKNOWN_PART_ROLE: SkeletonPartRole = 'block';

export function resolvePartRole(part: string): SkeletonPartRole {
  return SKELETON_PART_ROLES[part] ?? UNKNOWN_PART_ROLE;
}

/** One painted bone, positioned against the source layer's box. */
export interface AnatomyBone {
  part: string;
  role: Exclude<SkeletonPartRole, 'pass' | 'omit'>;
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: string;
}

/** One traversal: the bones to paint, and every element whose box produced them. */
interface AnatomyReading {
  bones: AnatomyBone[];
  /** The elements the traversal read, so their size can be watched for drift. */
  measured: Element[];
}

/**
 * Reads the stamped anatomy under `source`, in document order.
 * Elements without a `data-part` are transparent: their parts are still read.
 */
function readAnatomy(source: HTMLElement): AnatomyReading {
  const origin = source.getBoundingClientRect();
  const view = source.ownerDocument.defaultView;
  const bones: AnatomyBone[] = [];
  const measured: Element[] = [];

  const visit = (element: Element) => {
    const part = element.getAttribute('data-part');
    const role = part === null ? 'pass' : resolvePartRole(part);
    if (role === 'omit') return;
    measured.push(element);
    if (part !== null && role !== 'pass') {
      const rect = element.getBoundingClientRect();
      const radius = view?.getComputedStyle(element).borderRadius;
      bones.push({
        part,
        role,
        x: rect.left - origin.left,
        y: rect.top - origin.top,
        width: rect.width,
        height: rect.height,
        radius: radius && radius !== '0px' ? radius : undefined,
      });
      if (role !== 'frame') return;
    }
    for (const child of Array.from(element.children)) visit(child);
  };

  for (const child of Array.from(source.children)) visit(child);
  return { bones, measured };
}

/** The bones of the stamped anatomy under `source`, in document order. */
export function readAnatomyBones(source: HTMLElement): AnatomyBone[] {
  return readAnatomy(source).bones;
}

/**
 * Ancestor attributes whose change re-reads every bone: the paint-owner surface plus `dir`.
 * A stylesheet-only move with no attribute and no box change has no DOM signal, so it is not covered.
 */
export const SKELETON_ANCESTOR_INVALIDATION_ATTRIBUTES: readonly string[] = Object.freeze([
  ...PROVIDER_PAINT_ATTRIBUTE_FILTER,
  'dir',
]);

const sameBones = (left: AnatomyBone[], right: AnatomyBone[]) =>
  left.length === right.length
  && left.every((bone, index) => {
    const other = right[index];
    return bone.part === other.part && bone.role === other.role && bone.x === other.x
      && bone.y === other.y && bone.width === other.width && bone.height === other.height
      && bone.radius === other.radius;
  });

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * React 18 drops an unknown boolean attribute and React 19 drops the empty string,
 * so the presence form is the only `inert` both supported peer majors serialize.
 */
const INERT: Readonly<Record<string, string>> = { inert: 'inert' };
const INTERACTIVE: Readonly<Record<string, string>> = {};

/**
 * Where the skeleton hosts itself. `block` is the wrapper every consumer has
 * today. `table-rows` renders `tr`/`td` placeholder rows for a loading state
 * that must live inside a `tbody`, where a wrapper element is not valid HTML.
 */
export type AnatomySkeletonMode = 'block' | 'table-rows';

/** One cell of a `table-rows` placeholder row. */
export interface AnatomySkeletonCell {
  /** Stamped as `data-kind`, so a control well can paint narrower than a data cell. */
  readonly kind?: string;
  /** A stable React key; the index is used when absent. */
  readonly key?: string;
}

export interface AnatomySkeletonProps {
  /** While true the component is replaced by the skeleton built from its anatomy. @default true */
  loading?: boolean;
  /** The component the loading state stands in for; its `data-part` anatomy shapes the bones. */
  children?: ReactNode;
  /** Overrides the tenant `skeletonStyle`; `false` holds a static surface. */
  animation?: SkeletonAnimation;
  /** Stamps `aria-busy` while loading. `false` when the host already announces
   * its own loading state, so the surface keeps a single announcement. @default true */
  busy?: boolean;
  /** @default 'block' */
  mode?: AnatomySkeletonMode;
  /** `table-rows` only: how many placeholder rows to draw. @default 4 */
  rowCount?: number;
  /** `table-rows` only: one entry per cell of every placeholder row. */
  cells?: readonly AnatomySkeletonCell[];
  className?: string;
  style?: CSSProperties;
}

export const AnatomySkeleton = forwardRef<HTMLDivElement, AnatomySkeletonProps>(
  (
    { loading = true, busy = true, children, animation, mode = 'block', rowCount = 4, cells, className, style },
    ref,
  ) => {
    const tokens = useOptionalTokens();
    const sourceRef = useRef<HTMLDivElement>(null);
    const [bones, setBones] = useState<AnatomyBone[] | null>(null);

    const resolvedAnimation = animation ?? (tokens ? resolveSkeletonPersonalityDefaults(tokens).animation : 'wave');
    const animationStyle = resolvedAnimation === false ? undefined : resolvedAnimation === 'pulse' ? 'pulse' : 'shimmer';

    const geometryRef = useRef<{ resize: ResizeObserver | null; observed: Set<Element> }>({
      resize: null,
      observed: new Set(),
    });

    const measure = useCallback(() => {
      const source = sourceRef.current;
      if (!source) return;
      const { bones: next, measured } = readAnatomy(source);
      const geometry = geometryRef.current;
      if (geometry.resize) {
        const live = new Set<Element>(measured);
        live.add(source);
        for (const element of geometry.observed) {
          if (live.has(element)) continue;
          geometry.resize.unobserve(element);
          geometry.observed.delete(element);
        }
        for (const element of live) {
          if (geometry.observed.has(element)) continue;
          geometry.observed.add(element);
          geometry.resize.observe(element);
        }
      }
      setBones((current) => (current && sameBones(current, next) ? current : next));
    }, []);

    useIsomorphicLayoutEffect(() => {
      if (loading) measure();
    });

    useEffect(() => {
      const source = sourceRef.current;
      if (!loading || !source) return undefined;
      const owner = source.ownerDocument;
      const geometry = geometryRef.current;
      geometry.resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
      const mutation = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(measure);
      // Any attribute can move a part through an attribute selector and any text edit can
      // reflow a line, so the whole source subtree is watched, not `data-part` alone.
      mutation?.observe(source, { childList: true, subtree: true, attributes: true, characterData: true });
      // A provider root, a scoped `dir` or an inherited custom property lands on an ancestor's own
      // attributes, so each ancestor is watched by itself; the document is never watched as a subtree.
      const ancestorWatch = { attributes: true, attributeFilter: [...SKELETON_ANCESTOR_INVALIDATION_ATTRIBUTES] };
      for (let ancestor = source.parentElement; ancestor; ancestor = ancestor.parentElement) {
        mutation?.observe(ancestor, ancestorWatch);
      }
      mutation?.observe(owner.documentElement, ancestorWatch);
      const fonts: FontFaceSet | undefined = owner.fonts;
      let watching = true;
      const remeasure = () => {
        if (watching) measure();
      };
      fonts?.addEventListener?.('loadingdone', remeasure);
      void fonts?.ready?.then(remeasure, () => undefined);
      // Seeds the resize targets: the layout effect above measured before this observer existed.
      measure();
      return () => {
        watching = false;
        fonts?.removeEventListener?.('loadingdone', remeasure);
        geometry.resize?.disconnect();
        geometry.resize = null;
        geometry.observed.clear();
        mutation?.disconnect();
      };
    }, [loading, measure]);

    if (mode === 'table-rows') {
      // A `tbody` admits no wrapper element, so the rows ARE the skeleton. They
      // carry no `aria-busy`: the host that owns the loading state keeps the
      // single one, and every row is hidden so the placeholder count is never
      // announced as data.
      const row = cells ?? [{}];
      return (
        <>
          {Array.from({ length: rowCount }, (_, index) => (
            <tr
              key={index}
              className={['ds-skeleton-anatomy-rows', className].filter(Boolean).join(' ')}
              data-part="skeleton-row"
              data-loading={loading ? 'true' : 'false'}
              data-animation={animationStyle}
              aria-hidden="true"
              style={style}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cell.key ?? cellIndex}
                  data-part="skeleton-cell"
                  {...(cell.kind ? { 'data-kind': cell.kind } : {})}
                >
                  <span data-part="skeleton-bar" data-bone="line" />
                </td>
              ))}
            </tr>
          ))}
        </>
      );
    }

    return (
      <div
        ref={ref}
        data-part="root"
        data-loading={loading ? 'true' : 'false'}
        data-measured={bones ? 'true' : 'false'}
        data-animation={animationStyle}
        aria-busy={(busy && loading) || undefined}
        className={['ds-skeleton-anatomy', className].filter(Boolean).join(' ')}
        style={style}
      >
        <div
          ref={sourceRef}
          data-part="source"
          aria-hidden={loading || undefined}
          {...(loading ? INERT : INTERACTIVE)}
        >
          {children}
        </div>
        {bones && (
          <div data-part="bones" aria-hidden="true">
            {bones.map((bone, index) => (
              <span
                key={`${bone.part}-${index}`}
                data-part="bone"
                data-bone={bone.role}
                data-source-part={bone.part}
                style={{
                  '--ds-skeleton-bone-x': `${bone.x}px`,
                  '--ds-skeleton-bone-y': `${bone.y}px`,
                  '--ds-skeleton-bone-width': `${bone.width}px`,
                  '--ds-skeleton-bone-height': `${bone.height}px`,
                  ...(bone.radius ? { '--ds-skeleton-bone-radius': bone.radius } : {}),
                } as CSSProperties}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

AnatomySkeleton.displayName = 'AnatomySkeleton';

export default AnatomySkeleton;
