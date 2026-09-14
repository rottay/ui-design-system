'use client';

/**
 * Renders the component a loading state stands in for, reads its stamped `data-part`
 * anatomy and paints one bone per part, so the skeleton cannot drift from the component.
 */

import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { useOptionalTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
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
  root: 'frame',
  surface: 'frame',
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
  trigger: 'block',
  control: 'block',
  input: 'block',
  action: 'block',
  cover: 'block',
  'cover-image': 'block',
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
  panel: 'omit',
  'clear-button': 'omit',
  anchor: 'omit',
  backdrop: 'omit',
  handle: 'omit',
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

/**
 * Reads the stamped anatomy under `source` into bones, in document order.
 * Elements without a `data-part` are transparent: their parts are still read.
 */
export function readAnatomyBones(source: HTMLElement): AnatomyBone[] {
  const origin = source.getBoundingClientRect();
  const view = source.ownerDocument.defaultView;
  const bones: AnatomyBone[] = [];

  const visit = (element: Element) => {
    const part = element.getAttribute('data-part');
    const role = part === null ? 'pass' : resolvePartRole(part);
    if (role === 'omit') return;
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
  return bones;
}

const sameBones = (left: AnatomyBone[], right: AnatomyBone[]) =>
  left.length === right.length
  && left.every((bone, index) => {
    const other = right[index];
    return bone.part === other.part && bone.role === other.role && bone.x === other.x
      && bone.y === other.y && bone.width === other.width && bone.height === other.height
      && bone.radius === other.radius;
  });

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface AnatomySkeletonProps {
  /** While true the component is replaced by the skeleton built from its anatomy. @default true */
  loading?: boolean;
  /** The component the loading state stands in for; its `data-part` anatomy shapes the bones. */
  children: ReactNode;
  /** Overrides the tenant `skeletonStyle`; `false` holds a static surface. */
  animation?: SkeletonAnimation;
  className?: string;
  style?: CSSProperties;
}

export const AnatomySkeleton = forwardRef<HTMLDivElement, AnatomySkeletonProps>(
  ({ loading = true, children, animation, className, style }, ref) => {
    const tokens = useOptionalTokens();
    const sourceRef = useRef<HTMLDivElement>(null);
    const [bones, setBones] = useState<AnatomyBone[] | null>(null);

    const resolvedAnimation = animation ?? (tokens ? resolveSkeletonPersonalityDefaults(tokens).animation : 'wave');
    const animationStyle = resolvedAnimation === false ? undefined : resolvedAnimation === 'pulse' ? 'pulse' : 'shimmer';

    const measure = useCallback(() => {
      const source = sourceRef.current;
      if (!source) return;
      const next = readAnatomyBones(source);
      setBones((current) => (current && sameBones(current, next) ? current : next));
    }, []);

    useIsomorphicLayoutEffect(() => {
      if (loading) measure();
    });

    useEffect(() => {
      const source = sourceRef.current;
      if (!loading || !source) return undefined;
      const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
      resize?.observe(source);
      const mutation = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(measure);
      mutation?.observe(source, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-part'] });
      return () => {
        resize?.disconnect();
        mutation?.disconnect();
      };
    }, [loading, measure]);

    return (
      <div
        ref={ref}
        data-part="root"
        data-loading={loading ? 'true' : 'false'}
        data-measured={bones ? 'true' : 'false'}
        data-animation={animationStyle}
        aria-busy={loading || undefined}
        className={['ds-skeleton-anatomy', className].filter(Boolean).join(' ')}
        style={style}
      >
        <div
          ref={sourceRef}
          data-part="source"
          aria-hidden={loading || undefined}
          inert={loading ? true : undefined}
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
