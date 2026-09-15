'use client';

/**
 * Modern Tabs engine.
 *
 * The engine owns interaction and measurement; the Modern skin owns every
 * static geometry, paint, type and motion channel. Hover, press and focus of
 * every destination and control are decided once by the interaction kernel;
 * the indicator's measured position rides two runtime channels the skin turns
 * into a transform.
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';

import { arrayValueAt } from '@/foundation/kernel/collections';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import {
  resolveNavigationIntent,
  resolveReadingDirectionIsRtl,
} from '@/components/primitives/runtime/collection/roving-focus';
import { defineRecipe } from '@/infrastructure/runtime/foundation/recipes/engine';
import { TABS_RECIPE_DEFINITION } from '@/infrastructure/runtime/foundation/recipes/contracts/families';
import { useRecipeProfileDefaults } from '@/infrastructure/runtime/foundation/recipes/profiles';
import { NavigationBackIcon } from '@/graphics/icons/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/semantic/generated/roles/navigation-forward';
import { NavigationMoreIcon } from '@/graphics/icons/semantic/generated/roles/navigation-more';
import {
  directionFromIndexDelta,
  tabPanelTransitionStyle,
  useDirectionalViewTransition,
} from '@/graphics/motion/react/runtime';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import {
  generateResponsiveCSS,
  isResponsiveValue,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import { revealTabWithinList } from '../../runtime/reveal';
import { Dropdown } from '../../../../facade';
import { VisuallyHidden } from '../../../../foundation';
import type {
  TabItem,
  TabsProps,
  TabsRecipe,
  TabsSize,
  TabsType,
} from '../../contracts';

/**
 * DS-S001 recipe: the modern Tabs root classes. The visual recipe axis
 * (underline/contained/segmented/pills) stays on the `data-recipe` skin
 * contract; DS-R004 may promote it into typed recipe axes later.
 */
export const modernTabsRecipe = defineRecipe(TABS_RECIPE_DEFINITION);

const SIZE_CONFIG: Record<
  TabsSize,
  {
    height: string;
    padding: string;
    fontSize: string;
    iconSize: string;
  }
> = {
  sm: {
    height: 'var(--ds-tabs-sm-height)',
    padding: 'var(--ds-tabs-sm-padding)',
    fontSize: 'var(--ds-tabs-sm-font-size)',
    iconSize: 'var(--ds-tabs-sm-icon-size)',
  },
  md: {
    height: 'var(--ds-tabs-md-height)',
    padding: 'var(--ds-tabs-md-padding)',
    fontSize: 'var(--ds-tabs-md-font-size)',
    iconSize: 'var(--ds-tabs-md-icon-size)',
  },
  lg: {
    height: 'var(--ds-tabs-lg-height)',
    padding: 'var(--ds-tabs-lg-padding)',
    fontSize: 'var(--ds-tabs-lg-font-size)',
    iconSize: 'var(--ds-tabs-lg-icon-size)',
  },
};

interface IndicatorPosition {
  left: number;
  width: number;
}

interface OverflowState {
  overflowing: boolean;
  before: boolean;
  after: boolean;
}

const EMPTY_OVERFLOW: OverflowState = {
  overflowing: false,
  before: false,
  after: false,
};

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null || isResponsiveValue(value)) return undefined;
  return value as T;
}

function canonicalRecipe(type: TabsType | undefined): TabsRecipe {
  if (type === 'line') return 'underline';
  if (type === 'card') return 'contained';
  return type ?? 'underline';
}

function firstSelectableKey(items: TabItem[]): string | undefined {
  return (
    items.find((item) => !item.disabled && !item.loading)?.key ??
    arrayValueAt(items, 0)?.key
  );
}

function inlineOffsetWithin(node: HTMLElement, ancestor: HTMLElement): number {
  let offset = 0;
  let current: HTMLElement | null = node;
  while (current && current !== ancestor) {
    offset += current.offsetLeft;
    current = current.offsetParent as HTMLElement | null;
  }
  if (current === ancestor) return offset;

  const ancestorRect = ancestor.getBoundingClientRect();
  const nodeRect = node.getBoundingClientRect();
  return nodeRect.left - ancestorRect.left + ancestor.scrollLeft;
}

/** Keeps the former "Label 4" convenience while making explicit badges first-class. */
function splitLegacyBadge(label: React.ReactNode): {
  label: React.ReactNode;
  badge?: React.ReactNode;
} {
  if (typeof label !== 'string') return { label };
  const match = label.match(/^(.+?)\s+(\d+)$/);
  return match ? { label: match[1], badge: match[2] } : { label };
}

interface TabButtonProps {
  item: TabItem;
  tabsId: string;
  selected: boolean;
  focusable: boolean;
  label: React.ReactNode;
  badge: React.ReactNode;
  tabRef: (node: HTMLButtonElement | null) => void;
  labelRef: (node: HTMLSpanElement | null) => void;
  onActivate: (key: string) => void;
  onFocusKey: (key: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, key: string) => void;
}

function TabButton({
  item,
  tabsId,
  selected,
  focusable,
  label,
  badge,
  tabRef,
  labelRef,
  onActivate,
  onFocusKey,
  onKeyDown,
}: TabButtonProps): React.ReactElement {
  const interaction = useInteractionState({ disabled: Boolean(item.disabled) });
  const unavailable = Boolean(item.disabled || item.loading);
  const hasBadge = badge !== undefined && badge !== null;
  return (
    <button
      ref={tabRef}
      id={`tabs-tab-${tabsId}-${item.key}`}
      role="tab"
      type="button"
      {...partAttributes('tab-button', interaction.state)}
      {...interaction.handlers}
      data-selected={selected}
      data-loading={item.loading || undefined}
      data-has-badge={hasBadge || undefined}
      aria-selected={selected}
      aria-disabled={unavailable || undefined}
      aria-busy={item.loading || undefined}
      aria-controls={`tabs-panel-${tabsId}-${item.key}`}
      tabIndex={focusable ? 0 : -1}
      disabled={item.disabled}
      onClick={() => onActivate(item.key)}
      onFocus={(event) => {
        interaction.handlers.onFocus(event);
        onFocusKey(item.key);
      }}
      onKeyDown={(event) => onKeyDown(event, item.key)}
    >
      {item.icon && (
        <span data-part="icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      {item.loading ? <span data-part="loading-indicator" aria-hidden="true" /> : null}
      <span
        ref={labelRef}
        data-part="tab-label"
        title={typeof label === 'string' ? label : undefined}
      >
        {label}
      </span>
      {hasBadge && (
        <span data-part="tab-badge" aria-label={item.badgeAriaLabel}>
          {badge}
        </span>
      )}
    </button>
  );
}

function OverflowControl({
  part,
  label,
  disabled,
  onClick,
}: {
  part: 'previous' | 'next';
  label: string;
  disabled: boolean;
  onClick: () => void;
}): React.ReactElement {
  const interaction = useInteractionState({ disabled });
  const isPrevious = part === 'previous';
  return (
    <button
      type="button"
      {...partAttributes(isPrevious ? 'overflow-previous' : 'overflow-next', interaction.state)}
      {...interaction.handlers}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {isPrevious ? (
        <NavigationBackIcon decorative size="sm" />
      ) : (
        <NavigationForwardIcon decorative size="sm" />
      )}
    </button>
  );
}

/** The Dropdown clones its disclosure attributes onto this trigger, so every prop reaches the button. */
function OverflowMenuTrigger({
  label,
  ...rest
}: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>): React.ReactElement {
  const interaction = useInteractionState();
  return (
    <button
      type="button"
      {...rest}
      {...partAttributes('overflow-more', interaction.state)}
      {...interaction.handlers}
      aria-label={label}
    >
      <NavigationMoreIcon decorative size="sm" />
    </button>
  );
}

function TabPanel({
  tabsId,
  item,
}: {
  tabsId: string;
  item: TabItem;
}): React.ReactElement {
  const interaction = useInteractionState();
  return (
    <div
      id={`tabs-panel-${tabsId}-${item.key}`}
      role="tabpanel"
      {...partAttributes('tab-panel', interaction.state)}
      {...interaction.handlers}
      data-active-key={item.key}
      aria-labelledby={`tabs-tab-${tabsId}-${item.key}`}
      tabIndex={0}
      style={tabPanelTransitionStyle(tabsId)}
    >
      {item.children}
    </div>
  );
}

export default function ModernTabs(props: TabsProps): React.ReactElement {
  const {
    items,
    activeKey,
    defaultActiveKey,
    type: typeProp,
    size: sizeProp = 'md',
    centered = false,
    overflow = 'auto',
    activationMode = 'automatic',
    indicator = 'tab',
    panelVariant = 'plain',
    accessibilityLabels,
    onChange,
    className = '',
    style,
  } = props;

  // DS-S001: profile defaults apply only where the caller left the axis
  // unset; explicit props always win, then the engine default.
  const tabsProfileDefaults = useRecipeProfileDefaults('tabs');
  const type: TabsType =
    typeProp ??
    (typeof tabsProfileDefaults.recipe === 'string'
      ? (tabsProfileDefaults.recipe as TabsRecipe)
      : undefined) ??
    'line';

  const tabsId = useId().replace(/:/g, '');
  const recipe = canonicalRecipe(type);

  // Chrome copy: an explicit `accessibilityLabels` entry always wins, then the
  // `components.tabs.*` catalogue, then the documented English floor. Without
  // a provider the optional hook is null and the floor answers directly.
  const i18n = useOptionalTranslation('components');
  const chromeLabels = {
    previous:
      accessibilityLabels?.previous ??
      i18n?.tOr('tabs.previous', 'Previous tabs') ??
      'Previous tabs',
    next:
      accessibilityLabels?.next ?? i18n?.tOr('tabs.next', 'Next tabs') ?? 'Next tabs',
    more:
      accessibilityLabels?.more ?? i18n?.tOr('tabs.more', 'More tabs') ?? 'More tabs',
    loading:
      accessibilityLabels?.loading ?? i18n?.tOr('tabs.loading', 'Loading') ?? 'Loading',
  };
  const scalarSize = scalarOrUndefined(sizeProp) ?? 'md';
  const responsiveSize = isResponsiveValue<TabsSize>(sizeProp)
    ? sizeProp
    : undefined;
  const sizeIsResponsive = responsiveSize !== undefined;
  const responsiveEntries: ResponsivePropEntry<TabsSize>[] = [];

  if (responsiveSize) {
    // Writes `--ds-tabs-responsive-*` channels, never `--ds-tabs-current-*`:
    // the skin root owns the current-* chain (0,3,0) and would beat the
    // generated `[data-responsive-id]` rules (0,1,0). Its fallback chain
    // prefers the responsive channels, so both paths share SIZE_CONFIG.
    const addResponsiveSizeChannel = (
      cssProperty: string,
      channel: keyof (typeof SIZE_CONFIG)['md']
    ) => {
      responsiveEntries.push({
        cssProperty,
        value: responsiveSize,
        resolve: (value: TabsSize) => (SIZE_CONFIG[value] ?? SIZE_CONFIG.md)[channel],
      });
    };
    addResponsiveSizeChannel('--ds-tabs-responsive-height', 'height');
    addResponsiveSizeChannel('--ds-tabs-responsive-padding', 'padding');
    addResponsiveSizeChannel('--ds-tabs-responsive-font-size', 'fontSize');
    addResponsiveSizeChannel('--ds-tabs-responsive-icon-size', 'iconSize');
  }

  const responsive = generateResponsiveCSS(responsiveEntries);

  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const labelRefs = useRef<Map<string, HTMLSpanElement | null>>(new Map());
  const [internalActive, setInternalActive] = useState(
    activeKey ?? defaultActiveKey ?? firstSelectableKey(items)
  );
  const [focusedKey, setFocusedKey] = useState(
    activeKey ?? defaultActiveKey ?? firstSelectableKey(items)
  );
  const [indicatorPosition, setIndicatorPosition] = useState<IndicatorPosition | null>(null);
  const [overflowState, setOverflowState] = useState<OverflowState>(EMPTY_OVERFLOW);
  const [writingDirection, setWritingDirection] = useState<'ltr' | 'rtl'>('ltr');

  const requestedKey = activeKey ?? internalActive;
  const currentKey = items.some((item) => item.key === requestedKey)
    ? requestedKey
    : firstSelectableKey(items);
  const activeItem = items.find((item) => item.key === currentKey);
  const enabledItems = useMemo(
    () => items.filter((item) => !item.disabled && !item.loading),
    [items]
  );
  const loadingItems = useMemo(
    () => items.filter((item) => item.loading),
    [items]
  );
  const runPanelTransition = useDirectionalViewTransition();
  const stateMotion = useMotionRecipePresentation('state.change');
  const motionIsFinal = stateMotion.recipe.state === 'final';

  useEffect(() => {
    if (currentKey && items.some((item) => item.key === currentKey)) {
      setFocusedKey(currentKey);
      return;
    }
    const fallback = firstSelectableKey(items);
    setFocusedKey(fallback);
    if (activeKey === undefined) setInternalActive(fallback);
  }, [activeKey, currentKey, items]);

  const handleChange = useCallback(
    (key: string) => {
      const item = items.find((candidate) => candidate.key === key);
      if (!item || item.disabled || item.loading) return;

      const previousKey = activeKey ?? internalActive;
      setFocusedKey(key);
      if (key === previousKey) {
        onChange?.(key);
        return;
      }

      const previousIndex = items.findIndex(
        (candidate) => candidate.key === previousKey
      );
      const nextIndex = items.findIndex((candidate) => candidate.key === key);
      const isRtl = tabListRef.current
        ? resolveReadingDirectionIsRtl(tabListRef.current)
        : false;
      const direction = directionFromIndexDelta(
        isRtl ? nextIndex : previousIndex,
        isRtl ? previousIndex : nextIndex
      );

      runPanelTransition(
        () => {
          flushSync(() => {
            if (activeKey === undefined) setInternalActive(key);
            onChange?.(key);
          });
        },
        { direction }
      );
    },
    [activeKey, internalActive, items, onChange, runPanelTransition]
  );

  const moveFocus = useCallback(
    (key: string, activate: boolean) => {
      setFocusedKey(key);
      if (activate) handleChange(key);
      // The roving-tabindex target already exists in the DOM. Focusing it in
      // the same keyboard turn keeps focus deterministic for assistive tech
      // and for manual activation; deferring to rAF allowed the previous tab
      // to retain DOM focus while state had already moved to the new key.
      tabRefs.current.get(key)?.focus();
    },
    [handleChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, key: string) => {
      if (enabledItems.length === 0) return;

      // Both axes answer so a horizontal tablist still walks on ArrowUp/Down;
      // the horizontal pair follows the reading direction.
      const intent = resolveNavigationIntent(event.key, {
        orientation: 'both',
        rtl: resolveReadingDirectionIsRtl(event.currentTarget),
      });

      // A pointer can land DOM focus on a loading destination that the roving
      // sequence excludes; anchor arrow navigation at its insertion point in
      // the enabled sequence so the keys stay live instead of going dead.
      const enabledIndex = enabledItems.findIndex((item) => item.key === key);
      let forwardIndex: number;
      let backwardIndex: number;
      if (enabledIndex >= 0) {
        forwardIndex = (enabledIndex + 1) % enabledItems.length;
        backwardIndex =
          (enabledIndex - 1 + enabledItems.length) % enabledItems.length;
      } else {
        const allIndex = items.findIndex((item) => item.key === key);
        if (allIndex === -1) return;
        const insertion = items
          .slice(0, allIndex)
          .filter((item) => !item.disabled && !item.loading).length;
        forwardIndex = insertion % enabledItems.length;
        backwardIndex =
          (insertion - 1 + enabledItems.length) % enabledItems.length;
      }
      let nextKey: string | undefined;

      if (intent === 'next') {
        nextKey = arrayValueAt(enabledItems, forwardIndex)?.key;
      } else if (intent === 'previous') {
        nextKey = arrayValueAt(enabledItems, backwardIndex)?.key;
      } else if (intent === 'first') {
        nextKey = arrayValueAt(enabledItems, 0)?.key;
      } else if (intent === 'last') {
        nextKey = arrayValueAt(enabledItems, -1)?.key;
      } else if (
        activationMode === 'manual' &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        handleChange(key);
        return;
      } else {
        return;
      }

      if (!nextKey) return;
      event.preventDefault();
      moveFocus(nextKey, activationMode !== 'manual');
    },
    [activationMode, enabledItems, handleChange, items, moveFocus]
  );

  const refreshOverflow = useCallback(() => {
    const list = tabListRef.current;
    const first = arrayValueAt(items, 0);
    const last = arrayValueAt(items, -1);
    if (!list) {
      setOverflowState(EMPTY_OVERFLOW);
      return;
    }

    const isRtl = resolveReadingDirectionIsRtl(list);
    setWritingDirection((current) =>
      current === (isRtl ? 'rtl' : 'ltr') ? current : isRtl ? 'rtl' : 'ltr'
    );

    if (!first || !last || overflow === 'wrap') {
      setOverflowState(EMPTY_OVERFLOW);
      return;
    }

    const listRect = list.getBoundingClientRect();
    const firstRect = tabRefs.current.get(first.key)?.getBoundingClientRect();
    const lastRect = tabRefs.current.get(last.key)?.getBoundingClientRect();
    const nextState: OverflowState = {
      overflowing: list.scrollWidth - list.clientWidth > 1,
      before: !!firstRect &&
        (isRtl
          ? firstRect.right > listRect.right + 1
          : firstRect.left < listRect.left - 1),
      after: !!lastRect &&
        (isRtl
          ? lastRect.left < listRect.left - 1
          : lastRect.right > listRect.right + 1),
    };
    setOverflowState((previous) =>
      previous.overflowing === nextState.overflowing &&
      previous.before === nextState.before &&
      previous.after === nextState.after
        ? previous
        : nextState
    );
  }, [items, overflow]);

  useLayoutEffect(() => {
    const list = tabListRef.current;
    if (!list) return;

    refreshOverflow();
    const activeTab = currentKey ? tabRefs.current.get(currentKey) : null;
    // Scrollport-local: `scrollIntoView` walks every ancestor and yanked the
    // document even when the tablist did not overflow — see `runtime/reveal`,
    // which resolves the tablist's own direction for the RTL delta.
    if (activeTab) revealTabWithinList(list, activeTab);

    if (recipe !== 'underline' || indicator === 'none' || !currentKey) {
      setIndicatorPosition(null);
      return;
    }

    const measuredNode =
      indicator === 'label' ? labelRefs.current.get(currentKey) : activeTab;
    if (!measuredNode) {
      setIndicatorPosition(null);
      return;
    }

    setIndicatorPosition({
      left: inlineOffsetWithin(measuredNode, list),
      width: measuredNode.offsetWidth || measuredNode.getBoundingClientRect().width,
    });
  }, [currentKey, indicator, items, recipe, refreshOverflow]);

  useEffect(() => {
    const list = tabListRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      refreshOverflow();
      // Geometry can change with NO render at all — a shrinking container, or a
      // preceding label growing when an async count lands, re-clips the active
      // tab while the selection never moved. The layout effect above is keyed on
      // props and cannot see that; only the observer can. Writing `scrollLeft`
      // changes no element's size, so this cannot re-trigger itself.
      const activeTab = currentKey ? tabRefs.current.get(currentKey) : null;
      if (activeTab) revealTabWithinList(list, activeTab);
    });
    observer.observe(list);
    for (const node of tabRefs.current.values()) {
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [currentKey, items, refreshOverflow]);

  const scrollRail = (visualDirection: -1 | 1) => {
    const list = tabListRef.current;
    if (!list) return;
    const isRtl = resolveReadingDirectionIsRtl(list);
    const physicalDirection = isRtl ? -visualDirection : visualDirection;
    list.scrollBy?.({
      left: physicalDirection * list.clientWidth * 0.72,
      behavior: motionIsFinal ? 'auto' : 'smooth',
    });
  };

  const showScrollControls =
    overflowState.overflowing && (overflow === 'auto' || overflow === 'scroll');
  const showOverflowMenu =
    overflowState.overflowing && (overflow === 'auto' || overflow === 'menu');
  const menuItems = items.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    disabled: item.disabled || item.loading,
    onClick: () => handleChange(item.key),
  }));

  // Runtime measurement only: the skin owns the transform that reads these.
  const indicatorStyle = indicatorPosition
    ? ({
        '--ds-tabs-indicator-offset': `${indicatorPosition.left}px`,
        '--ds-tabs-indicator-scale': `${indicatorPosition.width}`,
      } as React.CSSProperties)
    : undefined;

  return (
    <div
      className={modernTabsRecipe.resolve(undefined, { root: className }).root}
      style={{ ...stateMotion.variables, ...style, ...responsive.channels }}
      data-part="root"
      {...stateMotion.attributes}
      {...responsive.attrs}
      data-variant={type ?? 'line'}
      data-recipe={recipe}
      data-size={sizeIsResponsive ? 'responsive' : scalarSize}
      data-centered={centered}
      data-overflow={overflow}
      data-overflowing={overflowState.overflowing || undefined}
      data-before-overflow={overflowState.before || undefined}
      data-after-overflow={overflowState.after || undefined}
      data-indicator={indicator}
      data-panel-variant={panelVariant}
      data-activation-mode={activationMode}
      data-motion-final={motionIsFinal || undefined}
      data-has-icons={items.some((item) => !!item.icon)}
      data-has-loading={loadingItems.length > 0 || undefined}
      data-direction={writingDirection}
      data-active-key={currentKey}
    >

      <div data-part="tab-rail">
        {showScrollControls && (
          <OverflowControl
            part="previous"
            label={chromeLabels.previous}
            disabled={!overflowState.before}
            onClick={() => scrollRail(-1)}
          />
        )}

        <div
          ref={tabListRef}
          role="tablist"
          aria-orientation="horizontal"
          data-tabs-id={tabsId}
          data-part="tab-list"
          onScroll={refreshOverflow}
        >
          {items.map((item) => {
            const legacy = splitLegacyBadge(item.label);
            return (
              <TabButton
                key={item.key}
                item={item}
                tabsId={tabsId}
                selected={item.key === currentKey}
                focusable={(focusedKey ?? currentKey) === item.key}
                label={legacy.label}
                badge={item.badge ?? legacy.badge}
                tabRef={(node) => {
                  tabRefs.current.set(item.key, node);
                }}
                labelRef={(node) => {
                  labelRefs.current.set(item.key, node);
                }}
                onActivate={handleChange}
                onFocusKey={setFocusedKey}
                onKeyDown={handleKeyDown}
              />
            );
          })}

          {indicatorStyle && (
            <span
              data-part="indicator"
              data-visible="true"
              style={indicatorStyle}
              aria-hidden="true"
            />
          )}
        </div>

        {showScrollControls && (
          <OverflowControl
            part="next"
            label={chromeLabels.next}
            disabled={!overflowState.after}
            onClick={() => scrollRail(1)}
          />
        )}
        {showOverflowMenu && (
          <Dropdown
            trigger={['click']}
            placement={writingDirection === 'rtl' ? 'bottomLeft' : 'bottomRight'}
            menu={{ items: menuItems }}
          >
            <OverflowMenuTrigger label={chromeLabels.more} />
          </Dropdown>
        )}
      </div>

      <VisuallyHidden role="status" aria-live="polite">
        {loadingItems.length > 0 ? (
          <>
            {loadingItems.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 ? ', ' : null}
                {item.label}
              </React.Fragment>
            ))}{' '}
            {chromeLabels.loading}
          </>
        ) : null}
      </VisuallyHidden>

      {activeItem && activeItem.children !== undefined && (
        <TabPanel tabsId={tabsId} item={activeItem} />
      )}
    </div>
  );
}
