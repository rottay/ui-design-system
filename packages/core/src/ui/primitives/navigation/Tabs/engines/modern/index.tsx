'use client';

/**
 * Modern Tabs engine.
 *
 * The engine owns interaction and measurement; the Modern skin owns every
 * static geometry, paint, type and motion channel. This keeps Tabs responsive,
 * accessible and completely re-skinnable through BrandTabsChrome.
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
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import { defineRecipe } from '@/infrastructure/runtime/foundation/recipes/engine';
import { TABS_RECIPE_DEFINITION } from '@/infrastructure/runtime/foundation/recipes/contracts/families';
import { useRecipeProfileDefaults } from '@/infrastructure/runtime/foundation/recipes/profiles';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import { NavigationMoreIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-more';
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
import { Dropdown } from '../../../../facade';
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
    height: 'var(--ds-tabs-sm-height, 32px)',
    padding: 'var(--ds-tabs-sm-padding, 0 var(--ds-spacing-3, 12px))',
    fontSize: 'var(--ds-tabs-sm-font-size, var(--ds-font-size-xs, 12px))',
    iconSize: 'var(--ds-tabs-sm-icon-size, 14px)',
  },
  md: {
    height: 'var(--ds-tabs-md-height, 36px)',
    padding: 'var(--ds-tabs-md-padding, 0 var(--ds-spacing-4, 16px))',
    fontSize: 'var(--ds-tabs-md-font-size, var(--ds-font-size-sm, 14px))',
    iconSize: 'var(--ds-tabs-md-icon-size, 16px)',
  },
  lg: {
    height: 'var(--ds-tabs-lg-height, 40px)',
    padding: 'var(--ds-tabs-lg-padding, 0 var(--ds-spacing-4, 16px))',
    fontSize: 'var(--ds-tabs-lg-font-size, var(--ds-font-size-base, 15px))',
    iconSize: 'var(--ds-tabs-lg-icon-size, 18px)',
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

/** Resolve writing direction from semantic markup before computed CSS. */
function elementDirection(element: HTMLElement): 'ltr' | 'rtl' {
  const directionOwner = element.closest<HTMLElement>('[dir]');
  if (directionOwner?.dir === 'rtl') return 'rtl';
  return getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
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
    addResponsiveSizeChannel('--ds-tabs-current-height', 'height');
    addResponsiveSizeChannel('--ds-tabs-current-padding', 'padding');
    addResponsiveSizeChannel('--ds-tabs-current-font-size', 'fontSize');
    addResponsiveSizeChannel('--ds-tabs-current-icon-size', 'iconSize');
  }

  const responsiveElementId = sizeIsResponsive ? `tabs-${tabsId}` : '';
  const responsive = sizeIsResponsive
    ? generateResponsiveCSS(responsiveElementId, responsiveEntries)
    : null;

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
        ? elementDirection(tabListRef.current) === 'rtl'
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
      const enabledIndex = enabledItems.findIndex((item) => item.key === key);
      if (enabledIndex === -1 || enabledItems.length === 0) return;

      const isRtl = elementDirection(event.currentTarget) === 'rtl';
      const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
      const backwardKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
      let nextKey: string | undefined;

      if (event.key === forwardKey || event.key === 'ArrowDown') {
        nextKey = arrayValueAt(enabledItems, (enabledIndex + 1) % enabledItems.length)?.key;
      } else if (event.key === backwardKey || event.key === 'ArrowUp') {
        nextKey = arrayValueAt(
          enabledItems,
          (enabledIndex - 1 + enabledItems.length) % enabledItems.length
        )?.key;
      } else if (event.key === 'Home') {
        nextKey = arrayValueAt(enabledItems, 0)?.key;
      } else if (event.key === 'End') {
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
    [activationMode, enabledItems, handleChange, moveFocus]
  );

  const refreshOverflow = useCallback(() => {
    const list = tabListRef.current;
    const first = arrayValueAt(items, 0);
    const last = arrayValueAt(items, -1);
    if (!list) {
      setOverflowState(EMPTY_OVERFLOW);
      return;
    }

    const isRtl = elementDirection(list) === 'rtl';
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
    activeTab?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });

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
    const observer = new ResizeObserver(refreshOverflow);
    observer.observe(list);
    for (const node of tabRefs.current.values()) {
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [items, refreshOverflow]);

  const scrollRail = (visualDirection: -1 | 1) => {
    const list = tabListRef.current;
    if (!list) return;
    const isRtl = elementDirection(list) === 'rtl';
    const physicalDirection = isRtl ? -visualDirection : visualDirection;
    list.scrollBy?.({
      left: physicalDirection * list.clientWidth * 0.72,
      behavior: motionIsFinal ? 'auto' : 'smooth',
    });
  };

  const renderOverflowControl = (
    part: 'previous' | 'next',
    disabled: boolean
  ): React.ReactElement => {
    const isPrevious = part === 'previous';
    return (
      <button
        type="button"
        data-part={isPrevious ? 'overflow-previous' : 'overflow-next'}
        aria-label={isPrevious ? chromeLabels.previous : chromeLabels.next}
        disabled={disabled}
        onClick={() => scrollRail(isPrevious ? -1 : 1)}
      >
        {isPrevious ? (
          <NavigationBackIcon decorative size="sm" />
        ) : (
          <NavigationForwardIcon decorative size="sm" />
        )}
      </button>
    );
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

  const indicatorStyle: React.CSSProperties | undefined = indicatorPosition
    ? {
        transform: `translateX(${indicatorPosition.left}px) scaleX(${indicatorPosition.width})`,
      }
    : undefined;

  return (
    <div
      className={modernTabsRecipe.resolve(undefined, { root: className }).root}
      style={{ ...stateMotion.variables, ...style }}
      data-part="root"
      {...stateMotion.attributes}
      {...(responsive?.attrs ?? {})}
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
      {responsive?.css && <style dangerouslySetInnerHTML={{ __html: responsive.css }} />}

      <div data-part="tab-rail">
        {showScrollControls && renderOverflowControl('previous', !overflowState.before)}

        <div
          ref={tabListRef}
          role="tablist"
          aria-orientation="horizontal"
          data-tabs-id={tabsId}
          data-part="tab-list"
          onScroll={refreshOverflow}
        >
          {items.map((item) => {
            const selected = item.key === currentKey;
            const unavailable = Boolean(item.disabled || item.loading);
            const legacy = splitLegacyBadge(item.label);
            const badge = item.badge ?? legacy.badge;
            return (
              <button
                key={item.key}
                ref={(node) => {
                  tabRefs.current.set(item.key, node);
                }}
                id={`tabs-tab-${tabsId}-${item.key}`}
                role="tab"
                type="button"
                data-part="tab-button"
                data-selected={selected}
                data-disabled={item.disabled || undefined}
                data-loading={item.loading || undefined}
                data-has-badge={
                  (badge !== undefined && badge !== null) || undefined
                }
                aria-selected={selected}
                aria-disabled={unavailable || undefined}
                aria-busy={item.loading || undefined}
                aria-controls={`tabs-panel-${tabsId}-${item.key}`}
                tabIndex={(focusedKey ?? currentKey) === item.key ? 0 : -1}
                disabled={item.disabled}
                onClick={() => handleChange(item.key)}
                onFocus={() => setFocusedKey(item.key)}
                onKeyDown={(event) => handleKeyDown(event, item.key)}
              >
                {item.icon && (
                  <span data-part="icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.loading ? (
                  <span data-part="loading-indicator" aria-hidden="true" />
                ) : null}
                <span
                  ref={(node) => {
                    labelRefs.current.set(item.key, node);
                  }}
                  data-part="tab-label"
                >
                  {legacy.label}
                </span>
                {badge !== undefined && badge !== null && (
                  <span
                    data-part="tab-badge"
                    aria-label={item.badgeAriaLabel}
                  >
                    {badge}
                  </span>
                )}
              </button>
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

        {showScrollControls && renderOverflowControl('next', !overflowState.after)}
        {showOverflowMenu && (
          <Dropdown
            trigger={['click']}
            placement={writingDirection === 'rtl' ? 'bottomLeft' : 'bottomRight'}
            menu={{ items: menuItems }}
          >
            <button
              type="button"
              data-part="overflow-more"
              aria-label={chromeLabels.more}
            >
              <NavigationMoreIcon decorative size="sm" />
            </button>
          </Dropdown>
        )}
      </div>

      <span data-part="loading-status" role="status" aria-live="polite">
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
      </span>

      {activeItem && activeItem.children !== undefined && (
        <div
          id={`tabs-panel-${tabsId}-${activeItem.key}`}
          role="tabpanel"
          data-part="tab-panel"
          data-active-key={activeItem.key}
          aria-labelledby={`tabs-tab-${tabsId}-${activeItem.key}`}
          tabIndex={0}
          style={tabPanelTransitionStyle(tabsId)}
        >
          {activeItem.children}
        </div>
      )}
    </div>
  );
}
