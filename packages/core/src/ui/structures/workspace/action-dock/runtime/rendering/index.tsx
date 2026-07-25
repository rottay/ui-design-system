'use client';

/**
 * @fileoverview ActionDock - floating action bar for mobile.
 *
 * @description
 * A fixed or sticky container for bottom (or top) action buttons on mobile
 * screens. Two composition paths:
 *
 * - Structured `actions`: the dock owns the priority grammar (danger at the
 *   start edge with destructive separation, secondary cluster, growing
 *   primary at the end edge), the narrow-viewport overflow law (secondary
 *   actions collapse into a more-actions menu on phone postures), and the
 *   APG toolbar keyboard model (roving tabindex with direction-aware
 *   ArrowLeft/ArrowRight plus Home/End).
 * - Freeform `children`: the consumer composes Buttons; the dock still
 *   supplies chrome (safe areas, stacking, shrink guard) and arrow-key
 *   focus movement across focusable children, but tab stops remain the
 *   consumer's.
 *
 * Engine-agnostic: composes DS primitives (Box, Flex, Button, Dropdown)
 * which resolve through the engine system themselves. All layout grammar is
 * painted by the component skin keyed on `data-priority` — no inline paint.
 *
 * @module Structures/Workspace/ActionDock
 * @category Structure
 * @package @rottay/design-system
 */

import { useState, type CSSProperties, type FocusEvent as ReactFocusEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';

import { Box } from '@/ui/primitives/layout/Box';
import { Flex } from '@/ui/primitives/layout/Flex';
import { Button } from '@/ui/primitives/inputs/Button';
import { Dropdown } from '@/ui/primitives/overlay/Dropdown';
import { NavigationMoreIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-more';
import { useResponsive } from '@/infrastructure/runtime/responsive';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

import type { ActionDockAction, ActionDockPriority, ActionDockProps } from '../../contracts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Roving-focus key reserved for the overflow (more-actions) trigger. */
const OVERFLOW_FOCUS_KEY = '__overflow__';

/** Focusable controls participating in the dock's arrow-key model. */
const FOCUSABLE_SELECTOR = 'button:not([disabled]), a[href]';

const ARROW_KEYS = new Set(['ArrowRight', 'ArrowLeft', 'Home', 'End']);

/** Priority → Button variant mapping (the visual priority grammar). */
const PRIORITY_VARIANT: Record<ActionDockPriority, 'primary' | 'secondary' | 'danger'> = {
  primary: 'primary',
  secondary: 'secondary',
  danger: 'danger',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve writing direction from semantic markup before computed CSS (Tabs precedent). */
function elementDirection(element: HTMLElement): 'ltr' | 'rtl' {
  const directionOwner = element.closest<HTMLElement>('[dir]');
  if (directionOwner?.dir === 'rtl') return 'rtl';
  return getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
}

function actionPriority(action: ActionDockAction): ActionDockPriority {
  return action.priority ?? 'secondary';
}

/**
 * Grammar order: danger actions lead (start edge, destructively separated by
 * the skin's auto margin), the secondary cluster follows, and primary
 * actions trail at the end edge. Relative order inside each slot is
 * preserved. DOM order equals visual order so keyboard and screen-reader
 * order match the painted layout.
 */
function orderActions(actions: readonly ActionDockAction[]): ActionDockAction[] {
  const danger = actions.filter((action) => actionPriority(action) === 'danger');
  const secondary = actions.filter((action) => actionPriority(action) === 'secondary');
  const primary = actions.filter((action) => actionPriority(action) === 'primary');
  return [...danger, ...secondary, ...primary];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Action bar for fixed or sticky mobile bottom (or top) actions.
 *
 * Renders structured actions (or freeform children) in a horizontal row with
 * tenant-tokenizable spacing, shadow, stacking, safe-area padding, and
 * virtual-keyboard avoidance.
 */
export function ActionDock({
  children,
  actions,
  overflow = 'menu',
  overflowLabel,
  density,
  position = 'bottom',
  mode = 'fixed',
  id,
  className,
  'data-testid': dataTestId = 'action-dock',
  'aria-label': ariaLabel,
  style,
}: ActionDockProps) {
  const rootClassName = ['rottay-action-dock', className].filter(Boolean).join(' ');
  const { virtualKeyboardInset, isVirtualKeyboardOpen, isPhone } = useResponsive();
  const responsiveStyle = {
    ...style,
    '--ds-virtual-keyboard-inset': `${Math.max(0, virtualKeyboardInset)}px`,
  } as CSSProperties;

  // --- Guarded i18n channel (K4 idiom) --------------------------------------
  //
  // Chrome labels resolve through the `components` catalog when an
  // I18nProvider is mounted; without one — or while a locale JSON lacks the
  // keys — a missing key echoes back the full key, the endsWith guard
  // detects it, and the English literals render, so behavior is
  // byte-identical to the pre-i18n contract. Explicit props always win.
  const i18n = useOptionalTranslation('components');
  const dockLabel = (key: string, fallback: string): string => {
    const translated = i18n?.t(key);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };
  const resolvedOverflowLabel =
    overflowLabel ?? dockLabel('actionDock.overflow.label', 'More actions');
  const resolvedAriaLabel =
    ariaLabel ??
    dockLabel(
      position === 'top' ? 'actionDock.topLabel' : 'actionDock.bottomLabel',
      `${position === 'top' ? 'Top' : 'Bottom'} actions`
    );

  // --- Priority grammar + overflow law -------------------------------------
  //
  // The collapse law is deterministic (posture-driven, not measured): on
  // phone postures with more than two structured actions, every secondary
  // action moves into the more-actions menu. Primary and danger always stay
  // inline — the forward action keeps its thumb reach and a destructive
  // action is never hidden.
  const orderedActions = orderActions(actions ?? []);
  const collapseToMenu = overflow === 'menu' && isPhone && orderedActions.length > 2;
  const inlineActions = collapseToMenu
    ? orderedActions.filter((action) => actionPriority(action) !== 'secondary')
    : orderedActions;
  const overflowActions = collapseToMenu
    ? orderedActions.filter((action) => actionPriority(action) === 'secondary')
    : [];

  // DOM-order render plan: danger..., [overflow trigger], secondary..., primary...
  const renderPlan: Array<ActionDockAction | typeof OVERFLOW_FOCUS_KEY> = [];
  let overflowSeated = false;
  for (const action of inlineActions) {
    if (collapseToMenu && !overflowSeated && actionPriority(action) === 'primary') {
      renderPlan.push(OVERFLOW_FOCUS_KEY);
      overflowSeated = true;
    }
    renderPlan.push(action);
  }
  if (collapseToMenu && !overflowSeated) renderPlan.push(OVERFLOW_FOCUS_KEY);

  // --- APG toolbar keyboard model ------------------------------------------
  //
  // Dock-rendered controls run a roving tabindex: one tab stop enters the
  // dock, direction-aware ArrowLeft/ArrowRight plus Home/End move within it
  // (wrapping, Tabs precedent). Freeform children keep their own tab stops
  // but still receive arrow-key focus movement through the same handler.
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const enabledKeys = renderPlan
    .filter((item) => item === OVERFLOW_FOCUS_KEY || !item.disabled)
    .map((item) => (item === OVERFLOW_FOCUS_KEY ? OVERFLOW_FOCUS_KEY : item.key));
  const activeKey = focusedKey !== null && enabledKeys.includes(focusedKey)
    ? focusedKey
    : enabledKeys[0];

  const handleToolbarKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!ARROW_KEYS.has(event.key)) return;
    const container = event.currentTarget;
    const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) return;

    const isRtl = elementDirection(container) === 'rtl';
    const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const backwardKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
    let nextIndex: number | undefined;

    if (event.key === forwardKey) nextIndex = (currentIndex + 1) % items.length;
    else if (event.key === backwardKey) nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;

    if (nextIndex === undefined || nextIndex === currentIndex) return;
    event.preventDefault();
    items[nextIndex]?.focus();
  };

  const handleActionFocus = (event: ReactFocusEvent<HTMLElement>) => {
    const key = (event.target as HTMLElement).closest<HTMLElement>('[data-action-key]')
      ?.dataset.actionKey;
    if (key) setFocusedKey(key);
  };

  // --- Structured action rendering -----------------------------------------
  const renderAction = (action: ActionDockAction) => {
    const priority = actionPriority(action);
    return (
      <Button
        key={action.key}
        variant={PRIORITY_VARIANT[priority]}
        className="rottay-action-dock__action"
        data-priority={priority}
        data-action-key={action.key}
        tabIndex={action.key === activeKey ? 0 : -1}
        icon={action.icon}
        iconPosition={action.iconPosition}
        disabled={action.disabled}
        pending={action.pending}
        href={action.href}
        aria-label={action['aria-label']}
        data-testid={action['data-testid']}
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    );
  };

  const renderOverflowTrigger = () => (
    <Dropdown
      key={OVERFLOW_FOCUS_KEY}
      trigger={['click']}
      placement={position === 'top' ? 'bottomRight' : 'topRight'}
      menu={{
        items: overflowActions.map((action) => ({
          key: action.key,
          label: action.label,
          icon: action.icon,
          disabled: action.disabled,
          onClick: action.onClick,
        })),
      }}
    >
      <Button
        variant="ghost"
        className="rottay-action-dock__overflow-trigger"
        data-action-key={OVERFLOW_FOCUS_KEY}
        tabIndex={OVERFLOW_FOCUS_KEY === activeKey ? 0 : -1}
        icon={<NavigationMoreIcon decorative />}
        aria-label={resolvedOverflowLabel}
        data-testid={`${dataTestId}-overflow`}
      />
    </Dropdown>
  );

  return (
    <Box
      id={id}
      className={rootClassName}
      style={responsiveStyle}
      data-testid={dataTestId}
      role="toolbar"
      aria-label={resolvedAriaLabel}
      data-part="root"
      data-placement={position}
      data-mode={mode}
      data-density={density}
      data-keyboard-open={isVirtualKeyboardOpen ? 'true' : 'false'}
    >
      <Flex
        className="rottay-action-dock__actions"
        align="center"
        onKeyDown={handleToolbarKeyDown}
        onFocus={handleActionFocus}
      >
        {renderPlan.map((item) => (item === OVERFLOW_FOCUS_KEY ? renderOverflowTrigger() : renderAction(item)))}
        {children}
      </Flex>
    </Box>
  );
}

ActionDock.displayName = 'ActionDock';

export default ActionDock;
