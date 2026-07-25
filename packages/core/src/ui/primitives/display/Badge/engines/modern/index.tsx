/**
 * Modern Badge / Chip / Pill engine.
 *
 * Behaviour and anatomy are deliberately shared by the three compact-label
 * roles. Product code chooses meaning (`tone`) and anatomy (`kind`); the skin
 * and tenant token channels own every visual decision.
 */

'use client';

import React, { useId } from 'react';

import { partAttributes, useInteractionState } from '@/foundation/behavior';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { StatusLoadingIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-loading';
import {
  generateResponsiveCSS,
  isResponsiveValue,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';

import type { BadgePosition, BadgeProps, BadgeSize } from '../../contracts';
import { BADGE_DEFAULTS, DOT_SIZE_MAP, SIZE_MAP, TONE_TO_BADGE_VARIANT } from '../../contracts';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null || isResponsiveValue(value)) return undefined;
  return value as T;
}

type BadgeCSSProperties = React.CSSProperties & Record<`--ds-badge-${string}`, string | number>;

interface SizeSpec {
  height: string;
  fontSize: string;
  paddingInline: string;
}

const SIZE_SPECS: Record<string, SizeSpec> = {
  xs: {
    height: 'var(--ds-badge-xs-height)',
    fontSize: 'var(--ds-badge-xs-font-size)',
    paddingInline: 'var(--ds-badge-xs-padding-x, 0.375rem)',
  },
  sm: {
    height: 'var(--ds-badge-sm-height)',
    fontSize: 'var(--ds-badge-sm-font-size)',
    paddingInline: 'var(--ds-badge-sm-padding-x, 0.5rem)',
  },
  md: {
    height: 'var(--ds-badge-md-height)',
    fontSize: 'var(--ds-badge-md-font-size)',
    paddingInline: 'var(--ds-badge-md-padding-x, 0.625rem)',
  },
  lg: {
    height: 'var(--ds-badge-lg-height)',
    fontSize: 'var(--ds-badge-lg-font-size)',
    paddingInline: 'var(--ds-badge-lg-padding-x, 0.75rem)',
  },
  xl: {
    height: 'var(--ds-badge-xl-height)',
    fontSize: 'var(--ds-badge-xl-font-size)',
    paddingInline: 'var(--ds-badge-xl-padding-x, 0.875rem)',
  },
};

const STATUS_VARIANT = {
  processing: 'primary',
  default: 'default',
  success: 'success',
  error: 'error',
  warning: 'warning',
} as const;

function formatCount(value: number, max: number): string | number {
  return value > max ? `${max}+` : value;
}

function logicalPositionStyle(
  position: BadgePosition,
  offset: [number, number] | undefined,
): BadgeCSSProperties {
  const [offsetX = 0, offsetY = 0] = offset ?? [];
  const blockStart = position.startsWith('top');
  const blockStyle = blockStart
    ? { insetBlockStart: offsetY }
    : { insetBlockEnd: offsetY };
  const y = blockStart ? '-50%' : '50%';

  if (position.endsWith('start')) {
    return {
      ...blockStyle,
      insetInlineStart: offsetX,
      '--ds-badge-position-transform': `translate(var(--ds-badge-logical-start-offset, -50%), ${y})`,
    };
  }
  if (position.endsWith('end')) {
    return {
      ...blockStyle,
      insetInlineEnd: offsetX,
      '--ds-badge-position-transform': `translate(var(--ds-badge-logical-end-offset, 50%), ${y})`,
    };
  }

  const left = position.endsWith('left');
  return {
    ...blockStyle,
    ...(left ? { left: offsetX } : { right: offsetX }),
    '--ds-badge-position-transform': `translate(${left ? '-50%' : '50%'}, ${y})`,
  };
}

export default function ModernBadge(props: BadgeProps): React.ReactElement {
  const {
    children,
    kind = BADGE_DEFAULTS.kind,
    content,
    count,
    dot = BADGE_DEFAULTS.dot,
    showZero = BADGE_DEFAULTS.showZero,
    max = BADGE_DEFAULTS.overflowCount,
    overflowCount,
    tone,
    variant: variantProp,
    status,
    text,
    size: sizeProp = BADGE_DEFAULTS.size,
    badgeStyle: badgeStyleProp,
    visible = BADGE_DEFAULTS.visible,
    pulse,
    position = BADGE_DEFAULTS.position,
    offset,
    icon,
    avatar,
    selected = false,
    onSelectedChange,
    removable,
    closable,
    onClose,
    removeLabel,
    clickable,
    onClick,
    disabled = false,
    loading = false,
    loadingText,
    bordered,
    radius,
    truncate = true,
    className = '',
    style,
    engine: _engine,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    // P-79: an explicit caller data-part wins over the default anatomy part
    // ('root' / 'anchor'); the default applies only when the caller passed none.
    'data-part': dataPart,
    ...rootProps
  } = props;

  void _engine;
  const effectiveMax = max ?? overflowCount ?? BADGE_DEFAULTS.overflowCount;
  const statusVariant = status ? STATUS_VARIANT[status] : undefined;
  const variant = tone
    ? TONE_TO_BADGE_VARIANT[tone]
    : variantProp ?? statusVariant ?? BADGE_DEFAULTS.variant;
  const isFamilyLabel = kind !== 'badge';
  const hasOverlayAnchor = Boolean(children) && !isFamilyLabel && (
    content !== undefined || count !== undefined || dot
  );
  const overlayValue = content !== undefined
    ? content
    : count !== undefined
      ? formatCount(count, effectiveMax)
      : undefined;
  const shouldShowOverlay = visible && (
    dot ||
    (content !== undefined && String(content).length > 0) ||
    (count !== undefined && (count > 0 || showZero))
  );
  const badgeStyle = badgeStyleProp ?? (hasOverlayAnchor ? 'solid' : BADGE_DEFAULTS.badgeStyle);
  const isInteractive = Boolean(clickable || onClick || onSelectedChange);
  const isRemovable = removable ?? closable ?? false;
  const isInert = disabled || loading;
  const { state: interaction, handlers: interactionHandlers } = useInteractionState({
    disabled: isInert,
  });

  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);
  if (sizeIsResponsive) {
    responsiveEntries.push(
      {
        cssProperty: '--ds-badge-resolved-height',
        value: sizeProp,
        resolve: (value: BadgeSize) =>
          (SIZE_MAP[value as keyof typeof SIZE_MAP] ?? SIZE_MAP.xl).height,
      } as ResponsivePropEntry<any>,
      {
        cssProperty: '--ds-badge-resolved-font-size',
        value: sizeProp,
        resolve: (value: BadgeSize) =>
          (SIZE_MAP[value as keyof typeof SIZE_MAP] ?? SIZE_MAP.xl).fontSize,
      } as ResponsivePropEntry<any>,
      {
        cssProperty: '--ds-badge-resolved-padding-inline',
        value: sizeProp,
        resolve: (value: BadgeSize) =>
          `var(--ds-badge-${SIZE_SPECS[value] ? value : 'xl'}-padding-x)`,
      } as ResponsivePropEntry<any>,
    );
  }
  const responsive = responsiveEntries.length > 0
    ? generateResponsiveCSS(`badge-${reactId.replace(/:/g, '')}`, responsiveEntries)
    : null;
  const size = scalarOrUndefined(sizeProp) ?? BADGE_DEFAULTS.size;
  const sizeSpec = SIZE_SPECS[size] ?? SIZE_SPECS.xl;
  const baseResolvedStyle: BadgeCSSProperties = {
    '--ds-badge-resolved-height': sizeSpec.height,
    '--ds-badge-resolved-font-size': sizeSpec.fontSize,
    '--ds-badge-resolved-padding-inline': sizeSpec.paddingInline,
  };
  const resolvedStyle: BadgeCSSProperties = {
    ...baseResolvedStyle,
    ...(style as BadgeCSSProperties),
  };

  const responsiveStyleTag = responsive?.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;

  const activate = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isInert) return;
    onClick?.();
    onSelectedChange?.(!selected);
  };

  const remove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!isInert) onClose?.();
  };

  const label = (loading && loadingText ? loadingText : undefined) ?? children ?? content ?? text ?? (
    count !== undefined ? formatCount(count, effectiveMax) : undefined
  );
  const showAccessoryCount = isFamilyLabel && count !== undefined && (
    children !== undefined || content !== undefined || text !== undefined
  );

  const contentAnatomy = (
    <>
      {loading && (
        <span data-part="spinner" aria-hidden="true">
          <StatusLoadingIcon size={12} decorative />
        </span>
      )}
      {avatar && <span data-part="avatar">{avatar}</span>}
      {icon && <span data-part="icon">{icon}</span>}
      {dot && <span data-part="dot" aria-hidden="true" />}
      {label !== undefined && !(!isFamilyLabel && dot && children === undefined && text === undefined) && (
        <span data-part="label">{label}</span>
      )}
      {showAccessoryCount && (
        <span data-part="count">{formatCount(count!, effectiveMax)}</span>
      )}
    </>
  );

  if (!hasOverlayAnchor) {
    if (!visible) return <>{responsiveStyleTag}</>;

    return (
      <>
        {responsiveStyleTag}
        <span
          {...rootProps}
          {...partAttributes(dataPart ?? 'root', interaction)}
          {...responsive?.attrs}
          className={`rottay-badge rottay-badge--modern ${className}`.trim()}
          data-kind={kind}
          data-variant={variant}
          data-badge-style={badgeStyle}
          data-bordered={bordered ? 'true' : undefined}
          data-radius={radius}
          data-size={size}
          data-size-responsive={sizeIsResponsive ? 'true' : undefined}
          data-selected={selected ? 'true' : undefined}
          data-interactive={isInteractive ? 'true' : undefined}
          data-disabled={disabled ? 'true' : undefined}
          data-loading={loading ? 'true' : undefined}
          data-pulse={pulse ? 'true' : undefined}
          data-truncate={truncate ? 'true' : 'false'}
          data-has-avatar={avatar ? 'true' : undefined}
          data-has-icon={icon ? 'true' : undefined}
          data-has-count={showAccessoryCount ? 'true' : undefined}
          data-has-dot={dot ? 'true' : undefined}
          data-dot={dot ? 'true' : undefined}
          data-removable={isRemovable ? 'true' : undefined}
          style={resolvedStyle}
          aria-busy={loading || undefined}
          aria-describedby={ariaDescribedBy}
          aria-label={!isInteractive ? ariaLabel : undefined}
        >
          {isInteractive ? (
            <button
              type="button"
              data-part="trigger"
              data-state={partAttributes('trigger', interaction)['data-state']}
              disabled={isInert}
              aria-disabled={isInert || undefined}
              aria-pressed={onSelectedChange ? selected : undefined}
              aria-label={loading ? loadingText ?? ariaLabel : ariaLabel}
              aria-describedby={ariaDescribedBy}
              onClick={activate}
              {...interactionHandlers}
            >
              {contentAnatomy}
            </button>
          ) : (
            <span data-part="content">{contentAnatomy}</span>
          )}

          {isRemovable && (
            <button
              type="button"
              data-part="close"
              disabled={isInert}
              aria-label={removeLabel}
              onClick={remove}
            >
              <ActionCloseIcon size={12} decorative />
            </button>
          )}
        </span>
      </>
    );
  }

  if (!shouldShowOverlay) {
    return (
      <span {...rootProps} className={className} style={style} data-part={dataPart ?? "anchor"}>
        {children}
      </span>
    );
  }

  const dotSize = DOT_SIZE_MAP[size] ?? DOT_SIZE_MAP.xl;
  const indicatorStyle: BadgeCSSProperties = {
    ...baseResolvedStyle,
    '--ds-badge-indicator-dot-size': dotSize,
    ...logicalPositionStyle(position, offset),
  };
  const indicatorProps = {
    className: 'rottay-badge rottay-badge--modern',
    'data-part': 'root',
    'data-kind': 'badge',
    'data-variant': variant,
    'data-badge-style': badgeStyle,
    'data-bordered': bordered ? 'true' : undefined,
    'data-size': size,
    'data-position': position,
    'data-indicator': 'true',
    'data-has-dot': dot ? 'true' : undefined,
    'data-dot': dot ? 'true' : undefined,
    'data-interactive': isInteractive ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
    'data-loading': loading ? 'true' : undefined,
    'data-pulse': pulse ? 'true' : undefined,
    'data-state': partAttributes('root', interaction)['data-state'],
    style: indicatorStyle,
  } as const;

  return (
    <>
      {responsiveStyleTag}
      <span {...rootProps} className={`rottay-badge-anchor ${className}`.trim()} data-part={dataPart ?? "anchor"} style={style}>
        {isInteractive ? (
          <button
            {...indicatorProps}
            {...interactionHandlers}
            type="button"
            disabled={isInert}
            aria-disabled={isInert || undefined}
            aria-label={loading ? loadingText ?? ariaLabel : ariaLabel}
            onClick={activate}
          >
            {!dot && overlayValue}
          </button>
        ) : (
          <span {...indicatorProps} aria-label={ariaLabel}>
            {!dot && overlayValue}
          </span>
        )}
        {children}
      </span>
    </>
  );
}

ModernBadge.displayName = 'ModernBadge';
