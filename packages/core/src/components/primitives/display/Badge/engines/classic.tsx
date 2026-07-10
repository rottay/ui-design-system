/**
 * @fileoverview Classic engine for the Badge component, backed by Ant Design.
 * Wraps antd Badge to expose count/dot indicators with processing animation,
 * position offsets, and standalone tag-like rendering for badge-only usage.
 *
 * @example
 * ```tsx
 * <Badge engine="classic" count={5} variant="primary"><Avatar /></Badge>
 * ```
 */

'use client';

import React, { useId } from 'react';
import { Badge as AntBadge } from 'antd';
import type { BadgeProps, BadgeSize } from '../Badge.types';
import { BADGE_DEFAULTS, VARIANT_COLOR_MAP, VARIANT_SOFT_COLOR_MAP, VARIANT_SOFT_TEXT_COLOR_MAP, SIZE_MAP, TONE_TO_BADGE_VARIANT } from '../Badge.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

/**
 * Formats a numeric count value for display with overflow handling.
 * @param count - The count value to format
 * @param max - Maximum value before showing overflow
 * @returns The formatted count or undefined
 */
function formatCount(count: number | string | undefined, max: number): number | string | undefined {
  if (count === undefined) return undefined;
  if (typeof count === 'string') return count;
  return count > max ? max : count;
}

/**
 * Classic (Ant Design) implementation of the Badge component.
 *
 * Maps the unified DS prop interface to antd's Badge API. Handles two distinct
 * render paths: a standalone/labelled tag-like badge (no children, or children
 * with no separate content/count/dot to position -- children is then the
 * tag's own label) using inline styles, and the standard antd Badge wrapper
 * for the remaining case of a real content/count/dot positioned over a real
 * anchor child. antd's own Badge only positions a sup indicator over children;
 * it never paints chrome onto children itself, so a labelled child is routed
 * to the standalone span rather than fought into shape via antd overrides.
 *
 * @param props - Unified BadgeProps from the design system type contract
 * @returns React element rendering either a standalone span or an antd Badge wrapper
 */
export default function ClassicBadge(props: BadgeProps): React.ReactElement {
  const {
    children,
    content,
    count,
    dot = BADGE_DEFAULTS.dot,
    showZero = BADGE_DEFAULTS.showZero,
    max = BADGE_DEFAULTS.overflowCount,
    tone,
    variant: variantProp = BADGE_DEFAULTS.variant,
    size: sizeProp = BADGE_DEFAULTS.size,
    badgeStyle: badgeStyleProp,
    pulse,
    position = BADGE_DEFAULTS.position,
    icon,
    closable,
    onClose,
    clickable,
    onClick,
    bordered,
    className,
    style,
  } = props;

  // tone (semantic) takes precedence over the deprecated variant prop; VARIANT_COLOR_MAP
  // and its soft-style siblings below are keyed by the same internal color-token name either way.
  const variant = tone ? TONE_TO_BADGE_VARIANT[tone] : variantProp;

  // Responsive size handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'min-width',
      value: sizeProp,
      resolve: (v: BadgeSize) => `${(SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).minWidth} !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'height',
      value: sizeProp,
      resolve: (v: BadgeSize) => `${(SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).height} !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: BadgeSize) => `${(SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).fontSize} !important`,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementIdVal = needsResponsiveCSS ? `badge-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementIdVal, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? BADGE_DEFAULTS.size;

  // `content` (string/ReactNode) takes precedence over numeric `count`
  const displayValue = content !== undefined ? content : count;

  // Resolve variant to a concrete colour value via the shared colour map
  const color = VARIANT_COLOR_MAP[variant!] || VARIANT_COLOR_MAP.default;

  // Resolved badgeStyle for the standalone/labelled-tag path below -- soft by
  // default (BADGE_DEFAULTS.badgeStyle). The AntBadge indicator path further
  // down never reads this: it always renders its own solid sup/dot chrome.
  const resolvedBadgeStyle = badgeStyleProp ?? BADGE_DEFAULTS.badgeStyle;
  let standaloneBg: string;
  let standaloneColor: string;
  switch (resolvedBadgeStyle) {
    case 'outline':
    case 'ghost':
      standaloneBg = 'transparent';
      standaloneColor = color;
      break;
    case 'soft':
      standaloneBg = VARIANT_SOFT_COLOR_MAP[variant!] || VARIANT_SOFT_COLOR_MAP.default;
      standaloneColor = VARIANT_SOFT_TEXT_COLOR_MAP[variant!] || VARIANT_SOFT_TEXT_COLOR_MAP.default;
      break;
    case 'solid':
    default:
      standaloneBg = color;
      standaloneColor = 'var(--ds-badge-text-color, #fff)';
      break;
  }

  // Ant Design only exposes two size tokens; collapse our 5-tier scale into them
  const antSize = size === 'sm' || size === 'xs' ? 'small' : 'default';

  /**
   * Position offset mapping for badge placement.
   * Ant Design uses [x, y] offset from default position.
   */
  const offsetMap: Record<string, [number, number]> = {
    'top-right': [0, 0],
    'top-left': [-100, 0],
    'bottom-right': [0, 100],
    'bottom-left': [-100, 100],
  };
  const offset = offsetMap[position!] || [0, 0];

  /**
   * Handles badge click events with propagation control.
   * @param e - Mouse event
   */
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  // Single source for the click affordance -- cursor and onClick below both
  // read this. Unlike the modern/rustic engines, classic has no
  // --ds-badge-hover-transform treatment at all (see the two comments
  // below for why), so this only ever gates cursor/onClick here.
  const isInteractive = Boolean(clickable || onClick);

  // Build custom style object
  const badgeStyle: React.CSSProperties = {
    cursor: isInteractive ? 'pointer' : undefined,
    ...style,
  };

  // Ant Design's 'processing' status adds a ripple animation -- re-purpose it for our pulse prop
  const status = pulse ? 'processing' : undefined;

  // Standalone / labelled-children render path: entered whenever there is no
  // separate content/count/dot to position, regardless of children -- either
  // there are no children (a bare tag) or children exist with nothing to
  // position over them (children is then the tag's own label). AntBadge is
  // only reached when it has an actual value or dot to render, with or
  // without a wrapped anchor child.
  if (displayValue === undefined && !dot) {
    const sizeValues = SIZE_MAP[size!] || SIZE_MAP.md;

    const standaloneStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: standaloneBg,
      color: standaloneColor,
      borderRadius: 'var(--ds-badge-border-radius, 9999px)',
      padding: 'var(--ds-badge-padding, 0 8px)',
      fontSize: sizeValues.fontSize,
      height: sizeValues.height,
      minWidth: sizeValues.minWidth,
      maxWidth: '100%',
      fontWeight: 500,
      border: resolvedBadgeStyle === 'outline'
        ? `1px solid ${color}`
        : (bordered ? 'var(--ds-badge-border-width, 2px) solid var(--ds-badge-border-color, #fff)' : undefined),
      boxShadow: bordered ? `0 0 0 1px ${color}` : undefined,
      cursor: isInteractive ? 'pointer' : undefined,
      transition: 'var(--ds-badge-transition, all 0.2s ease-in-out)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      ...style,
    };

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        {/*
          No --ds-badge-hover-transform treatment on this span: unlike the
          modern/rustic skin files, there is no classic-engine skin location
          in this fix's fence to hold an unlayered rule (tokens/css/engines/
          classic/ has only theme.css, no skin/ directory), and this file
          owns no CSS to add one to. A plain span with no rule reading it is
          exactly the orphan channel P-43 exists to prevent, so it stays
          unwired rather than wired to nothing.
        */}
        <span
          className={className}
          style={standaloneStyle}
          onClick={isInteractive ? handleClick : undefined}
          {...(responsive ? responsive.attrs : {})}
        >
          {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
          {props.children}
          {closable && (
            <span
              style={{ marginLeft: 4, cursor: 'pointer', opacity: 0.7 }}
              onClick={(e) => { e.stopPropagation(); onClose?.(); }}
              aria-label="Close badge"
            >
              x
            </span>
          )}
        </span>
      </>
    );
  }

  // Standard path: delegate to antd Badge which handles count overflow,
  // dot rendering, status animation, and positioning automatically. AntBadge
  // renders its own internal indicator DOM (ant-badge-count / ant-badge-dot)
  // that this file does not own the JSX of. A rule could in principle target
  // those antd class names directly, but they are antd's own global names,
  // not scoped to this design system's badges -- an unlayered rule on them
  // would reach every AntBadge the host application renders, including ones
  // this system does not own. That blast radius, not just DOM ownership, is
  // why this path stays unwired: any hover chrome on this indicator comes
  // from antd's own styling, not from this component.
  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      <AntBadge
        count={typeof displayValue === 'string' ? displayValue : formatCount(displayValue as number, max!)}
        dot={dot}
        color={color}
        size={antSize}
        showZero={showZero}
        overflowCount={max}
        offset={offset}
        status={status}
        className={className}
        style={badgeStyle}
        onClick={isInteractive ? handleClick : undefined}
        {...(responsive ? responsive.attrs : {})}
      >
        {children}
      </AntBadge>
    </>
  );
}

ClassicBadge.displayName = 'ClassicBadge';
