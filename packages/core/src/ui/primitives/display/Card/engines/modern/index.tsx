/**
 * @fileoverview Card Modern Engine - Rottay Design System
 * @description Token-driven card with precise, calm, premium styling.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses CSS custom property tokens for all visual decisions.
 * No DaisyUI classes. The stable DOM anatomy is rendered here while every
 * visual decision is owned by the Modern Card skin and public design tokens.
 *
 * **Material Ladder:**
 * - `elevated`: Surface and calibrated depth. Primary card.
 * - `outlined`: Full frame, no default depth. Flat and precise.
 * - `filled`: Inset material with no default frame or depth.
 * - `ghost`: Transparent structural grouping.
 *
 * **Hover Behavior:**
 * - Elevated: tokenized lift + depth transition
 * - Outlined: border darkens to secondary
 * - Filled/Ghost: no hover elevation change
 *
 * **Transitions:**
 * - Timing and easing are tenant-tunable through bounded Card channels
 *
 * @example Basic Usage
 * ```tsx
 * import { Card } from '@rottay/design-system';
 *
 * <Card engine="modern" title="Card Title">
 *   <p>Card content</p>
 * </Card>
 * ```
 *
 * @see {@link Card} for the main component
 * @module ModernCard
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback, useId } from 'react';

import { partAttributes, useInteractionState } from '../../../../../../foundation/behavior';
import { defineRecipe } from '@/infrastructure/runtime/foundation/recipes/engine';
import { useRecipeProfileDefaults } from '@/infrastructure/runtime/foundation/recipes/profiles';
import type { CardProps } from '../../contracts';
import { CARD_DEFAULTS, PADDING_MAP } from '../../contracts';

/**
 * DS-S001 recipe: the exact semantic classes the modern Card has always
 * emitted, resolved through the Rottay recipe engine. The always-on `modern`
 * axis sits between `interactive` and `tone` so the historical class order is
 * preserved byte for byte.
 */
export const modernCardRecipe = defineRecipe({
  name: 'card',
  slots: { root: 'ds-card' },
  axes: {
    variant: {
      elevated: { root: 'ds-card--elevated' },
      outlined: { root: 'ds-card--outlined' },
      filled: { root: 'ds-card--filled' },
      ghost: { root: 'ds-card--ghost' },
    },
    interactive: { true: { root: 'ds-card--interactive' } },
    modern: { true: { root: 'ds-card--modern' } },
    tone: {
      primary: { root: 'ds-card--tone-primary' },
      success: { root: 'ds-card--tone-success' },
      warning: { root: 'ds-card--tone-warning' },
      error: { root: 'ds-card--tone-error' },
      info: { root: 'ds-card--tone-info' },
    },
  },
  defaults: { modern: true },
});
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '@/infrastructure/runtime/responsive/runtime/style-properties';

// ============================================================================
// Constants
// ============================================================================


/** Paint belongs to the engine skin; the spinner anatomy is deliberately CSS-only. */
const CardSpinner: React.FC = () => <span data-part="spinner" aria-hidden="true" />;

const NESTED_INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  'details',
  'summary',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="radio"]',
  '[role="switch"]',
].join(', ');

function isNestedInteractiveTarget(target: EventTarget | null, root: HTMLElement): boolean {
  if (target === root || !(target instanceof Element)) return false;
  const interactiveAncestor = target.closest(NESTED_INTERACTIVE_SELECTOR);
  return interactiveAncestor !== null && interactiveAncestor !== root && root.contains(interactiveAncestor);
}

// ============================================================================
// Component
// ============================================================================

/**
 * Modern engine Card component using token-driven inline styles.
 * Premium quality: precise, calm, expensive.
 *
 * @component
 * @param {CardProps} props - Component properties
 * @returns {React.ReactElement} The rendered Modern Card component
 */
export default function ModernCard(props: CardProps): React.ReactElement {
  const {
    children,
    title,
    titleHeadingLevel = 3,
    description,
    cover,
    coverAlt,
    coverPosition = 'top',
    extra,
    actions,
    variant: variantProp,
    colorVariant = CARD_DEFAULTS.colorVariant,
    size = CARD_DEFAULTS.size,
    hoverable = CARD_DEFAULTS.hoverable,
    clickable = CARD_DEFAULTS.clickable,
    loading = CARD_DEFAULTS.loading,
    bordered = CARD_DEFAULTS.bordered,
    shadowed,
    radius = CARD_DEFAULTS.radius,
    padding: paddingProp = CARD_DEFAULTS.padding,
    divider,
    onClick,
    className = '',
    style,
    backgroundColor: _backgroundColor,
    selectable = false,
    selected = false,
    onSelect,
    disabled = false,
    extensions: _extensions,
    engine: _engine,
    // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to the
    // root element. It must spread BEFORE the engine's own stamps so the
    // engine's data-part and skin contract always land last.
    ...rest
  } = props;

  // DS-S001: profile defaults apply only where the caller left the axis
  // unset; explicit props always win, then the engine default.
  const cardProfileDefaults = useRecipeProfileDefaults('card');
  const variant =
    variantProp ??
    (typeof cardProfileDefaults.variant === 'string'
      ? (cardProfileDefaults.variant as CardProps['variant'])
      : undefined) ??
    CARD_DEFAULTS.variant;

  // Responsive padding handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const paddingIsResponsive = isResponsiveValue(paddingProp);

  if (paddingIsResponsive) {
    responsiveEntries.push({
      // The visible inset belongs to the body/loading anatomy, not the root.
      // A scoped custom property lets the generated breakpoint rule cross that
      // boundary without coupling the responsive runtime to Card selectors.
      cssProperty: '--ds-card-instance-padding',
      value: paddingProp,
      resolve: (v: string) => PADDING_MAP[v] || PADDING_MAP.md,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `card-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const padding = paddingIsResponsive ? CARD_DEFAULTS.padding : (paddingProp as string);

  const unavailable = disabled || loading;
  // The triad is decided once, in the behavior core: both skins of this
  // component read the same state, and a focus ring is a keyboard affordance.
  const { state: interaction, handlers: interactionHandlers } = useInteractionState({
    disabled: unavailable,
  });

  const isActionable = Boolean(onClick || (selectable && onSelect));

  const activate = useCallback(() => {
    if (unavailable) return;
    if (selectable) onSelect?.(!selected);
    onClick?.();
  }, [onClick, onSelect, selectable, selected, unavailable]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isNestedInteractiveTarget(event.target, event.currentTarget)) return;
      activate();
    },
    [activate],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isNestedInteractiveTarget(e.target, e.currentTarget)) return;
      if (isActionable && !unavailable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        activate();
      }
    },
    [activate, isActionable, unavailable],
  );

  const isInteractive = hoverable || clickable || isActionable;
  const logicalCoverPosition = coverPosition === 'left'
    ? 'start'
    : coverPosition === 'right'
      ? 'end'
      : coverPosition;
  const hasColorVariant = colorVariant && colorVariant !== 'default';
  const cardClassName = modernCardRecipe.resolve(
    {
      variant,
      interactive: isInteractive,
      tone: hasColorVariant ? colorVariant : undefined,
    },
    { root: className }
  ).root;

  // Paint lives in `foundation/tokens/css/runtime/engines/modern/skin/card.css`, keyed on the
  // `data-*` contract stamped on the root below. Only a caller's own `style` prop
  // stays inline, which is the precedence it has always had.
  const cardStyle: React.CSSProperties | undefined = style;

  /** The DOM contract the modern Card skin selects on. */
  const skinAttributes = {
    'data-variant': variant,
    'data-radius': radius,
    'data-size': size,
    'data-padding': padding,
    'data-cover-position': cover ? logicalCoverPosition : undefined,
    'data-tone': hasColorVariant ? colorVariant : undefined,
    // `hoverable || clickable`, the condition the hover paint was gated on.
    'data-interactive': isInteractive ? 'true' : undefined,
    // Paints a pointer. Not the same as being operable.
    'data-clickable': clickable || isActionable ? 'true' : undefined,
    // Actually operable: takes a tab stop, a button role, and a focus ring.
    'data-actionable': isActionable ? 'true' : undefined,
    'data-selectable': selectable ? 'true' : undefined,
    'data-selected': selectable ? (selected ? 'true' : 'false') : undefined,
    'data-disabled': unavailable ? 'true' : undefined,
    'data-loading': loading ? 'true' : undefined,
    'data-has-cover': cover ? 'true' : undefined,
    'data-has-header': title || description || extra ? 'true' : undefined,
    'data-has-actions': actions && actions.length > 0 ? 'true' : undefined,
    'data-bordered': props.bordered === undefined ? undefined : bordered ? 'true' : 'false',
    'data-shadowed': shadowed === undefined ? undefined : shadowed ? 'true' : 'false',
  } as const;

  const resolvedCoverAlt = coverAlt ?? (typeof title === 'string' ? title : '');
  const TitleHeading = `h${titleHeadingLevel}` as keyof React.JSX.IntrinsicElements;

  // ============================================================================
  // Shared sub-elements
  // ============================================================================

  const responsiveStyleTag = responsive && responsive.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;
  const responsiveAttrs = responsive ? responsive.attrs : {};

  // ============================================================================
  // Loading state
  // ============================================================================

  if (loading) {
    return (
      <>
        {responsiveStyleTag}
        <div
          {...rest}
          style={cardStyle}
          className={cardClassName}
          aria-busy="true"
          aria-disabled="true"
          {...skinAttributes}
          {...responsiveAttrs}
          {...partAttributes('root', interaction)}
        >
          {/* Placeholder cover */}
          {cover && (
            <div data-part="cover" />
          )}
          <div data-part="loading-content" style={{
            position: 'relative',
            minHeight: 'var(--ds-card-skeleton-min-height, 120px)',
          }}>
            {/* Skeleton bars */}
            <div data-part="skeleton" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3, 12px)' }}>
              <div data-part="skeleton-bar" style={{
                height: 'var(--ds-skeleton-bar-height, 12px)',
                width: '60%',
              }} />
              <div data-part="skeleton-bar" style={{
                height: 'var(--ds-skeleton-bar-height, 12px)',
                width: '40%',
              }} />
              <div data-part="skeleton-stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2, 8px)', marginTop: 'var(--ds-spacing-1, 4px)' }}>
                <div data-part="skeleton-bar" style={{
                  height: 'var(--ds-skeleton-bar-height-sm, 10px)',
                  width: '100%',
                }} />
                <div data-part="skeleton-bar" style={{
                  height: 'var(--ds-skeleton-bar-height-sm, 10px)',
                  width: '85%',
                }} />
              </div>
            </div>
            {/* Spinner overlay */}
            <div
              data-part="loading-overlay"
            >
              <CardSpinner />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================================================
  // Default render
  // ============================================================================

  return (
    <>
      {responsiveStyleTag}
      <div
        {...rest}
        className={cardClassName}
        onClick={isActionable ? handleClick : undefined}
        onPointerEnter={interactionHandlers.onPointerEnter}
        onPointerLeave={interactionHandlers.onPointerLeave}
        onPointerDown={(event) => {
          if (!isNestedInteractiveTarget(event.target, event.currentTarget)) {
            interactionHandlers.onPointerDown(event);
          }
        }}
        onPointerUp={interactionHandlers.onPointerUp}
        onFocus={(event) => {
          if (event.target === event.currentTarget) interactionHandlers.onFocus(event);
        }}
        onBlur={(event) => {
          if (event.target === event.currentTarget) interactionHandlers.onBlur(event);
        }}
        onKeyDown={isActionable ? handleKeyDown : undefined}
        tabIndex={isActionable && !unavailable ? 0 : undefined}
        role={isActionable ? 'button' : undefined}
        aria-pressed={isActionable && selectable ? selected : undefined}
        aria-disabled={unavailable || undefined}
        aria-busy={loading || undefined}
        style={cardStyle}
        {...skinAttributes}
        {...responsiveAttrs}
        {...partAttributes('root', interaction)}
      >
        {/* Cover image - top */}
        {cover && (logicalCoverPosition === 'top' || logicalCoverPosition === 'start') && (
          <div data-part="cover">
            <img
              data-part="cover-image"
              src={cover}
              alt={resolvedCoverAlt}
              decoding="async"
            />
          </div>
        )}

        {/* Body */}
        <div data-part="body">
          {/* Header */}
          {(title || description || extra) && (
            <div
              data-part="header"
              data-divider={divider ? 'true' : undefined}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                {title && (
                  <TitleHeading data-part="title">
                    {title}
                  </TitleHeading>
                )}
                {description && (
                  <div data-part="description" data-has-title={title ? 'true' : undefined}>
                    {description}
                  </div>
                )}
              </div>
              {extra && (
                <div data-part="extra">
                  {extra}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          {children}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div data-part="actions" style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'var(--ds-card-actions-justify, flex-end)',
              alignItems: 'center',
              gap: 'var(--ds-card-actions-gap, var(--ds-spacing-2, 8px))',
              marginTop: 'var(--ds-card-actions-margin-top, var(--ds-spacing-4, 16px))',
              paddingTop: 'var(--ds-card-actions-padding-top, var(--ds-spacing-4, 16px))',
            }}>
              {actions.map((action, index) => (
                <React.Fragment key={index}>{action}</React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Cover image - bottom */}
        {cover && (logicalCoverPosition === 'bottom' || logicalCoverPosition === 'end') && (
          <div data-part="cover">
            <img
              data-part="cover-image"
              src={cover}
              alt={resolvedCoverAlt}
              decoding="async"
            />
          </div>
        )}
      </div>
    </>
  );
}

ModernCard.displayName = 'ModernCard';
