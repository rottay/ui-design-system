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
import { BADGE_DEFAULTS, VARIANT_COLOR_MAP, SIZE_MAP } from '../Badge.types';
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
 * render paths: a standalone tag-like badge (no children, no count) using
 * inline styles, and the standard antd Badge wrapper for all other cases.
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
    variant = BADGE_DEFAULTS.variant,
    size: sizeProp = BADGE_DEFAULTS.size,
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

  // Build custom style object
  const badgeStyle: React.CSSProperties = {
    cursor: clickable || onClick ? 'pointer' : undefined,
    ...style,
  };

  // Ant Design's 'processing' status adds a ripple animation -- re-purpose it for our pulse prop
  const status = pulse ? 'processing' : undefined;

  // Standalone render path: when there are no children and no count/dot, render
  // as a tag-like inline element instead of wrapping antd Badge around nothing
  if (!children && displayValue === undefined && !dot) {
    const sizeValues = SIZE_MAP[size!] || SIZE_MAP.md;

    const standaloneStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color,
      color: 'var(--ds-badge-text-color, #fff)',
      borderRadius: 'var(--ds-badge-border-radius, 9999px)',
      padding: 'var(--ds-badge-padding, 0 8px)',
      fontSize: sizeValues.fontSize,
      height: sizeValues.height,
      minWidth: sizeValues.minWidth,
      fontWeight: 500,
      border: bordered ? 'var(--ds-badge-border-width, 2px) solid var(--ds-badge-border-color, #fff)' : undefined,
      boxShadow: bordered ? `0 0 0 1px ${color}` : undefined,
      cursor: clickable || onClick ? 'pointer' : undefined,
      transition: 'var(--ds-badge-transition, all 0.2s ease-in-out)',
      ...style,
    };

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <span
          className={className}
          style={standaloneStyle}
          onClick={clickable || onClick ? handleClick : undefined}
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
  // dot rendering, status animation, and positioning automatically
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
        onClick={clickable || onClick ? handleClick : undefined}
        {...(responsive ? responsive.attrs : {})}
      >
        {children}
      </AntBadge>
    </>
  );
}

ClassicBadge.displayName = 'ClassicBadge';
