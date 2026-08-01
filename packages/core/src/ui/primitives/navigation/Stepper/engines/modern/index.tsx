/**
 * @fileoverview Stepper Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Stepper component.
 *
 * @remarks
 * The engine stamps anatomy (`data-part` hooks) and step state
 * (`data-status`, `aria-current="step"`); the modern skin
 * (`modern/skin/stepper.css`) owns 100% of layout and paint — INCLUDING the
 * step circle and the connector, which are skin pseudo-elements keyed on
 * `data-part`/`data-status`, never DaisyUI `.step::before/::after` hooks.
 * No DaisyUI classes, no Tailwind utilities, no inline style objects.
 *
 * Contract notes:
 * - The landmark is a wrapping `<nav>` with a localizable accessible name
 *   (`components.stepper.navigation`, English fallback "Progress steps"
 *   until the catalog key lands — K3-B ficha request); the `<ul>` keeps its
 *   natural list semantics (`role="navigation"` on the `<ul>` itself was
 *   both an axe `listitem` and an `aria-allowed-role` violation). A caller
 *   `aria-label` WINS over the fallback name (the Descriptions idiom).
 * - The `BaseComponentProps` passthrough (id / aria-* / data-* /
 *   data-testid) spreads on the `<nav>` (the outermost element) BEFORE the
 *   engine's stamps; the caller-owned `data-part` hook (P-79) replaces the
 *   `<ul>`'s default `'root'` anatomy hook — the skin scope detaches by
 *   contract when a caller claims it.
 * - `size` (sm/md/lg) and `variant` (default/simple/circles) ride
 *   `data-size`/`data-variant` on the root; both were previously accepted
 *   and silently ignored by this engine.
 * - Clickable steps render a real `<button data-part="trigger">` inside the
 *   item — keyboard-reachable by construction.
 * - Status computation deliberately mirrors the Steps family's
 *   `getEffectiveStatus` (bounded per-family duplication, no shared helper
 *   is extracted in this wave — see the K3-B ficha).
 *
 * Phase-B Pass 2 (batch-33):
 * - `subTitle` now renders (`data-part="subtitle"` — rustic parity; the
 *   contract axis and the skin's disabled rule predate this engine path).
 * - `labelPlacement` rides `data-label-placement` on the root (the contract
 *   default is 'horizontal': icon-beside-text; 'vertical' keeps the stacked
 *   geometry Pass 1 shipped).
 * - `progressDot` is implemented on the Stepper signature
 *   (`(dot, info) => ReactNode`): boolean mode rides `data-progress-dot`;
 *   the render-function mode mounts `data-part="dot-slot"` (Steps idiom).
 * - A custom item icon now anchors the indicator cell as a direct item
 *   child (`data-part="icon"`); the skin seats it inside the status circle
 *   frame and suppresses the numeral via `:has()` — status stays expressed
 *   by the circle frame/ring, never by icon hue alone.
 * - `percent` is NOT implementable in this engine: the modern-engine
 *   contract pins `style.cssText === ''` on every part, so no inline data
 *   channel can carry the numeric value (the Menu `--rottay-menu-*`
 *   precedent is closed here); documented as batch-33 debt.
 * - `responsive` is absorbed by the skin's container query (a horizontal
 *   track collapses to the vertical geometry at 420px unconditionally);
 *   the contract's `responsive?: boolean` toggle is noted as drift.
 *
 * @example Basic Usage
 * ```tsx
 * <Stepper
 *   engine="modern"
 *   items={[
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *   ]}
 *   current={0}
 * />
 * ```
 *
 * @example Vertical Layout
 * ```tsx
 * <Stepper
 *   engine="modern"
 *   direction="vertical"
 *   items={steps}
 *   current={current}
 * />
 * ```
 *
 * @see {@link Stepper} for the main component
 * @see {@link StepperProps} for prop documentation
 *
 * @module Stepper/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { StepperProps, StepItem, StepStatus } from '../../contracts';
import { STEPPER_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Computes the status for a step based on its position.
 * Deliberately mirrors the Steps family's status resolution (bounded
 * per-family duplication — no shared helper in this wave).
 * @param index - Step index
 * @param current - Current active step
 * @param itemStatus - Optional explicit status
 * @returns Computed step status
 * @internal
 */
function computeStatus(index: number, current: number, itemStatus?: StepStatus): StepStatus {
  if (itemStatus) return itemStatus;
  if (index < current) return 'finish';
  if (index === current) return 'process';
  return 'wait';
}

/**
 * Renders step elements from an items array.
 * @param items - Array of step items
 * @param current - Current active step
 * @param clickable - Whether steps are clickable
 * @param onChange - Change handler callback
 * @param globalStatus - Global status override
 * @returns Array of step li elements
 * @internal
 */
function renderModernSteps(
  items: StepItem[],
  current: number,
  clickable: boolean,
  onChange?: (current: number) => void,
  globalStatus?: StepStatus,
  progressDot?: StepperProps['progressDot']
): React.ReactNode {
  return items.map((item, index) => {
    // Priority: explicit item status > global status (only on current step) > positional computation.
    // This lets consumers override specific steps while inheriting defaults elsewhere.
    const status = item.status || (globalStatus && index === current ? globalStatus : computeStatus(index, current));
    const isClickable = clickable && !item.disabled;

    const text = (
      <>
        <span data-part="label">{item.title}</span>
        {item.subTitle && <span data-part="subtitle">{item.subTitle}</span>}
        {item.description && <span data-part="description">{item.description}</span>}
      </>
    );

    return (
      <li
        key={index}
        data-part="item"
        data-status={status}
        data-disabled={item.disabled || undefined}
        data-clickable={isClickable || undefined}
        aria-current={status === 'process' ? 'step' : undefined}
      >
        {item.icon && !progressDot && <span data-part="icon">{item.icon}</span>}
        {typeof progressDot === 'function' && (
          <span data-part="dot-slot">
            {progressDot(<span data-part="dot" />, {
              index,
              status,
              title: item.title,
              description: item.description,
            })}
          </span>
        )}
        {isClickable ? (
          <button
            type="button"
            data-part="trigger"
            onClick={() => onChange?.(index)}
          >
            {text}
          </button>
        ) : (
          <span data-part="content">{text}</span>
        )}
      </li>
    );
  });
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Modern engine Stepper implementation (token-driven, skin-painted).
 *
 * @param props - {@link StepperProps}
 * @returns Stepper navigation element rendered for the modern skin
 */
export default function ModernStepper(props: StepperProps): React.ReactElement {
  const translation = useOptionalTranslation('components');

  const {
    items,
    current: controlledCurrent,
    defaultCurrent = STEPPER_DEFAULTS.defaultCurrent,
    direction = STEPPER_DEFAULTS.direction,
    size = STEPPER_DEFAULTS.size,
    variant = STEPPER_DEFAULTS.variant,
    status,
    clickable = STEPPER_DEFAULTS.clickable,
    labelPlacement = STEPPER_DEFAULTS.labelPlacement,
    progressDot,
    onChange,
    children,
    className = '',
    style,
    'data-part': dataPart,
    'aria-label': callerAriaLabel,
    engine: _engine,
    // Consumed contract axes that must NOT leak onto the DOM through the
    // rest spread: `initial` (deprecated alias of defaultCurrent),
    // `responsive` (absorbed by the skin's container query — documented
    // drift), `percent` (batch-33 debt, no governed render channel).
    initial: _initial,
    responsive: _responsive,
    percent: _percent,
    // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to
    // the outermost element (the <nav>). It spreads BEFORE the engine's own
    // stamps so the landmark contract always lands last (the Card modern
    // idiom; contracts promise BaseComponentProps pass-through).
    ...rest
  } = props;

  // ============================================================================
  // State Management
  // ============================================================================

  /** Internal state for uncontrolled mode */
  const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);

  /** Use controlled or uncontrolled state */
  const current = controlledCurrent ?? internalCurrent;

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handles step change events.
   * Updates internal state and calls the onChange callback.
   */
  const handleChange = useCallback(
    (step: number) => {
      if (!clickable) return;

      if (controlledCurrent === undefined) {
        setInternalCurrent(step);
      }

      onChange?.(step);
    },
    [clickable, controlledCurrent, onChange]
  );

  // ============================================================================
  // Content Rendering
  // ============================================================================

  /** Process items or children into step content */
  let stepsContent: React.ReactNode = null;

  if (items) {
    // Render from items prop
    stepsContent = renderModernSteps(items, current, clickable, handleChange, status, progressDot);
  } else if (children) {
    // Convert children to items for rendering
    const childItems: StepItem[] = [];

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;

      const displayName = (child.type as any)?.displayName || '';
      if (displayName === 'Stepper.Step') {
        const stepProps = child.props as any;
        childItems.push({
          title: stepProps.title,
          description: stepProps.description,
          subTitle: stepProps.subTitle,
          icon: stepProps.icon,
          status: stepProps.status,
          disabled: stepProps.disabled,
        });
      }
    });

    if (childItems.length > 0) {
      stepsContent = renderModernSteps(childItems, current, clickable, handleChange, status, progressDot);
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  /**
   * Localizable landmark name. `components.stepper.navigation` is requested
   * through the K3-B ficha; until the catalog key lands the provider's
   * missing-key marker (`i18n:missing:<locale>:<key>`) is detected and the
   * documented English fallback applies. Without a provider, the fallback
   * applies directly (the `useOptionalTranslation` standalone contract).
   */
  const translatedLabel = translation?.t('stepper.navigation');
  const navigationLabel =
    translatedLabel && !translatedLabel.startsWith('i18n:missing:')
      ? translatedLabel
      : 'Progress steps';

  return (
    <nav
      {...rest}
      aria-label={callerAriaLabel ?? navigationLabel}
      className={className || undefined}
      style={style}
    >
      <ul
        className="rottay-stepper rottay-stepper--modern"
        data-part={dataPart ?? 'root'}
        data-direction={direction}
        data-size={size}
        data-variant={variant}
        data-label-placement={labelPlacement}
        data-progress-dot={progressDot ? 'true' : undefined}
      >
        {stepsContent}
      </ul>
    </nav>
  );
}

// Set display name for debugging
ModernStepper.displayName = 'ModernStepper';
