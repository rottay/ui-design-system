/**
 * @fileoverview Card Modern Engine - Rottay Design System
 * @description The stable DOM anatomy of the Modern card. Every visual
 * decision belongs to the Modern Card skin and the `--ds-card-*` channels.
 *
 * **Material Ladder:**
 * - `elevated`: Surface and calibrated depth. Primary card.
 * - `outlined`: Full frame, no default depth. Flat and precise.
 * - `filled`: Inset material with no default frame or depth.
 * - `ghost`: Transparent structural grouping.
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

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { partAttributes, useInteractionState } from '../../../../../../foundation/behavior';
import { defineRecipe } from '@/infrastructure/runtime/foundation/recipes/engine';
import { CARD_RECIPE_DEFINITION } from '@/infrastructure/runtime/foundation/recipes/contracts/families';
import { useRecipeProfileDefaults } from '@/infrastructure/runtime/foundation/recipes/profiles';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';
import type { CardProps, ResolvedCardAdaptation } from '../../contracts';
import { CARD_DEFAULTS, PADDING_MAP } from '../../contracts';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '@/infrastructure/runtime/responsive/runtime/style-properties';

/** The semantic classes the Modern card emits, resolved through the recipe engine. */
export const modernCardRecipe = defineRecipe(CARD_RECIPE_DEFINITION);

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

type LogicalCoverPosition = ResolvedCardAdaptation['coverPosition'];

function toLogicalCoverPosition(position: NonNullable<CardProps['coverPosition']>): LogicalCoverPosition {
  if (position === 'left') return 'start';
  if (position === 'right') return 'end';
  return position;
}

/**
 * Modern engine Card: structure, interaction state and the finite `data-*`
 * contract the skin paints from.
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
    adapt,
    extensions: _extensions,
    engine: _engine,
    // Caller passthrough (id / aria-* / data-*): spread first so the engine's
    // own stamps always land last.
    ...rest
  } = props;

  const cardProfileDefaults = useRecipeProfileDefaults('card');
  const variant =
    variantProp ??
    (typeof cardProfileDefaults.variant === 'string'
      ? (cardProfileDefaults.variant as CardProps['variant'])
      : undefined) ??
    CARD_DEFAULTS.variant;

  // A cover that fails keeps its wrapper so the reserved geometry never
  // collapses; only the dead `img` is dropped and the skin paints the wrapper.
  const [coverFailed, setCoverFailed] = useState(false);
  const coverRef = React.useRef<HTMLImageElement>(null);
  useEffect(() => {
    setCoverFailed(false);
  }, [cover]);

  // A server-rendered cover can fail before hydration attaches `onError`.
  useEffect(() => {
    const img = coverRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth === 0) setCoverFailed(true);
  }, [cover]);

  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const paddingIsResponsive = isResponsiveValue(paddingProp);

  if (paddingIsResponsive) {
    responsiveEntries.push({
      // The visible inset belongs to the body anatomy, not the root; the
      // instance channel crosses that boundary.
      cssProperty: '--ds-card-instance-padding',
      value: paddingProp,
      resolve: (v: string) => PADDING_MAP[v] || PADDING_MAP.md,
    } as ResponsivePropEntry<any>);
  }

  const responsive = generateResponsiveCSS(responsiveEntries);
  const restingPadding = (paddingIsResponsive ? CARD_DEFAULTS.padding : paddingProp) as ResolvedCardAdaptation['padding'];

  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const containerRef = useMemo(() => ({ current: rootElement }), [rootElement]);
  const base = useMemo<ResolvedCardAdaptation>(
    () => ({ coverPosition: toLogicalCoverPosition(coverPosition), padding: restingPadding }),
    [coverPosition, restingPadding],
  );
  const { adaptation, postureAttribute } = useAdaptation(adapt, { base, containerRef });
  const logicalCoverPosition = adaptation.coverPosition;
  const padding = adaptation.padding;

  const unavailable = disabled || loading;
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
  const hasColorVariant = colorVariant && colorVariant !== 'default';
  const cardClassName = modernCardRecipe.resolve(
    {
      variant,
      interactive: isInteractive,
      tone: hasColorVariant ? colorVariant : undefined,
    },
    { root: className }
  ).root;

  /** The DOM contract the Modern Card skin selects on. */
  const skinAttributes = {
    'data-variant': variant,
    'data-radius': radius,
    'data-size': size,
    'data-padding': padding,
    'data-cover-position': cover ? logicalCoverPosition : undefined,
    'data-tone': hasColorVariant ? colorVariant : undefined,
    'data-interactive': isInteractive ? 'true' : undefined,
    // Paints a pointer. Not the same as being operable.
    'data-clickable': clickable || isActionable ? 'true' : undefined,
    // Operable: a tab stop, a button role and a focus ring.
    'data-actionable': isActionable ? 'true' : undefined,
    'data-selectable': selectable ? 'true' : undefined,
    'data-selected': selectable ? (selected ? 'true' : 'false') : undefined,
    'data-loading': loading ? 'true' : undefined,
    'data-has-cover': cover ? 'true' : undefined,
    'data-has-header': title || description || extra ? 'true' : undefined,
    'data-has-actions': actions && actions.length > 0 ? 'true' : undefined,
    'data-bordered': props.bordered === undefined ? undefined : bordered ? 'true' : 'false',
    'data-shadowed': shadowed === undefined ? undefined : shadowed ? 'true' : 'false',
    'data-posture': postureAttribute,
  } as const;

  const resolvedCoverAlt = coverAlt ?? (typeof title === 'string' ? title : '');
  const TitleHeading = `h${titleHeadingLevel}` as keyof React.JSX.IntrinsicElements;

  const coverNode = cover ? (
    <div data-part="cover" data-error={coverFailed ? 'true' : undefined}>
      {!loading && !coverFailed && (
        <img
          ref={coverRef}
          data-part="cover-image"
          src={cover}
          alt={resolvedCoverAlt}
          decoding="async"
          onError={() => setCoverFailed(true)}
        />
      )}
    </div>
  ) : null;

  return (
    <div
      {...rest}
      ref={setRootElement}
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
      style={{ ...style, ...responsive.channels }}
      {...skinAttributes}
      {...responsive.attrs}
      {...partAttributes('root', interaction)}
    >
      {(logicalCoverPosition === 'top' || logicalCoverPosition === 'start') && coverNode}

      {loading ? (
        <div data-part="loading-content">
          <div data-part="loading-overlay">
            <span data-part="spinner" aria-hidden="true" />
          </div>
        </div>
      ) : (
      <div data-part="body">
        {(title || description || extra) && (
          <div
            data-part="header"
            data-divider={divider ? 'true' : undefined}
          >
            <div data-part="header-main">
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

        {children}

        {actions && actions.length > 0 && (
          <div data-part="actions">
            {actions.map((action, index) => (
              <React.Fragment key={index}>{action}</React.Fragment>
            ))}
          </div>
        )}
      </div>
      )}

      {(logicalCoverPosition === 'bottom' || logicalCoverPosition === 'end') && coverNode}
    </div>
  );
}

ModernCard.displayName = 'ModernCard';
