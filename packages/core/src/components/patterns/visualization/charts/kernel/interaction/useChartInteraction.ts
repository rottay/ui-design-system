'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import type {
  ChartActiveDatum,
  ChartInteraction,
  ChartInteractionMeta,
  ChartInteractionMode,
  ChartInteractionPointerType,
} from './ChartInteraction';

const DATUM_KEY_ATTRIBUTE = 'data-chart-datum-key';
const DATUM_KEY_SELECTOR = `[${DATUM_KEY_ATTRIBUTE}]`;
const TOOLTIP_KEY_ATTRIBUTE = 'data-chart-tooltip-key';
const TOOLTIP_KEY_SELECTOR = `[${TOOLTIP_KEY_ATTRIBUTE}]`;

export type ChartInteractionNavigation = 'horizontal' | 'vertical' | 'grid';

/** Internal normalized datum supplied by a React-owned renderer. */
export interface ChartInteractionItem<TDatum> {
  readonly key: string;
  readonly label: string;
  readonly datum: TDatum;
  /** Visual SVG coordinate, after scale/layout resolution. */
  readonly x: number;
  /** Visual SVG coordinate, after scale/layout resolution. */
  readonly y: number;
  /** Optional visual row used to keep left/right movement in one lane. */
  readonly row?: number;
  /** Optional visual column used to keep up/down movement in one lane. */
  readonly column?: number;
  readonly disabled?: boolean;
}

interface NormalizedInteractionItem<TDatum> extends ChartInteractionItem<TDatum> {
  readonly sourceIndex: number;
}

export interface UseChartInteractionOptions<TDatum> {
  readonly items: readonly ChartInteractionItem<TDatum>[];
  readonly interaction?: ChartInteraction<TDatum>;
  /** Renderer-owned visual topology. Defaults to horizontal. */
  readonly navigation?: ChartInteractionNavigation;
}

export interface ChartInteractionDatumProps {
  readonly [DATUM_KEY_ATTRIBUTE]: string;
  readonly tabIndex?: 0 | -1;
  readonly 'data-active'?: 'true';
  readonly 'data-focused'?: 'true';
  readonly 'data-hovered'?: 'true';
  readonly 'data-pinned'?: 'true';
}

export interface ChartInteractionRootProps {
  readonly 'data-interaction': ChartInteractionMode;
  readonly onFocus?: (event: ReactFocusEvent<Element>) => void;
  readonly onBlur?: (event: ReactFocusEvent<Element>) => void;
  readonly onPointerOver?: (event: ReactPointerEvent<Element>) => void;
  readonly onPointerOut?: (event: ReactPointerEvent<Element>) => void;
  readonly onPointerDown?: (event: ReactPointerEvent<Element>) => void;
  readonly onPointerMove?: (event: ReactPointerEvent<Element>) => void;
  readonly onPointerCancel?: (event: ReactPointerEvent<Element>) => void;
  readonly onClick?: (event: ReactMouseEvent<Element>) => void;
  readonly onKeyDown?: (event: ReactKeyboardEvent<Element>) => void;
}

export interface UseChartInteractionResult<TDatum> {
  readonly mode: ChartInteractionMode;
  readonly activeKey: string | null;
  readonly activeDatum: ChartActiveDatum<TDatum> | null;
  readonly rovingKey: string | null;
  readonly focusKey: string | null;
  readonly hoverKey: string | null;
  readonly pinnedKey: string | null;
  readonly rootProps: ChartInteractionRootProps;
  /** Adds state only; all event handlers remain delegated on `rootProps`. */
  readonly getDatumProps: (key: string) => ChartInteractionDatumProps;
  readonly pinDatum: (key: string, meta?: ChartInteractionMeta) => void;
  readonly reset: (meta?: ChartInteractionMeta) => void;
}

const STATIC_INTERACTION: ChartInteraction<never> = Object.freeze({ mode: 'static' });

const PROGRAMMATIC_DATA_CHANGE: ChartInteractionMeta = Object.freeze({
  input: 'programmatic',
  reason: 'data-change',
});

const PROGRAMMATIC_ESCAPE: ChartInteractionMeta = Object.freeze({
  input: 'programmatic',
  reason: 'escape',
});

function activeDatum<TDatum>(
  item: NormalizedInteractionItem<TDatum> | undefined,
): ChartActiveDatum<TDatum> | null {
  if (!item) return null;
  return {
    key: item.key,
    label: item.label,
    datum: item.datum,
  };
}

function compareNumber(left: number, right: number): number {
  return left === right ? 0 : left < right ? -1 : 1;
}

function compareVisualItems<TDatum>(
  left: NormalizedInteractionItem<TDatum>,
  right: NormalizedInteractionItem<TDatum>,
  navigation: ChartInteractionNavigation,
): number {
  let result = 0;

  if (
    navigation === 'grid'
    && left.row !== undefined
    && right.row !== undefined
    && left.column !== undefined
    && right.column !== undefined
  ) {
    result = compareNumber(left.row, right.row)
      || compareNumber(left.column, right.column);
  } else if (navigation === 'vertical') {
    result = compareNumber(left.y, right.y) || compareNumber(left.x, right.x);
  } else if (navigation === 'horizontal') {
    result = compareNumber(left.x, right.x) || compareNumber(left.y, right.y);
  } else {
    result = compareNumber(left.y, right.y) || compareNumber(left.x, right.x);
  }

  return result
    || compareNumber(left.sourceIndex, right.sourceIndex)
    || left.key.localeCompare(right.key);
}

function normalizeItems<TDatum>(
  items: readonly ChartInteractionItem<TDatum>[],
  navigation: ChartInteractionNavigation,
): readonly NormalizedInteractionItem<TDatum>[] {
  const seen = new Set<string>();
  const normalized: NormalizedInteractionItem<TDatum>[] = [];

  items.forEach((item, sourceIndex) => {
    if (seen.has(item.key)) {
      throw new TypeError(`[ChartInteraction] Duplicate opaque datum key: ${item.key}.`);
    }
    seen.add(item.key);

    if (item.disabled || !Number.isFinite(item.x) || !Number.isFinite(item.y)) return;
    normalized.push({ ...item, sourceIndex });
  });

  normalized.sort((left, right) => compareVisualItems(left, right, navigation));
  return normalized;
}

function replacementKey(
  key: string | null,
  previousKeys: readonly string[],
  nextKeys: readonly string[],
): string | null {
  if (nextKeys.length === 0) return null;
  if (key && nextKeys.includes(key)) return key;
  if (!key) return nextKeys[0] ?? null;

  const previousIndex = previousKeys.indexOf(key);
  if (previousIndex < 0) return nextKeys[0] ?? null;
  return nextKeys[Math.min(previousIndex, nextKeys.length - 1)] ?? null;
}

type NavigationDirection = 'left' | 'right' | 'up' | 'down';

function isDirectionCandidate<TDatum>(
  current: NormalizedInteractionItem<TDatum>,
  candidate: NormalizedInteractionItem<TDatum>,
  direction: NavigationDirection,
  navigation: ChartInteractionNavigation,
): boolean {
  if (
    navigation === 'grid'
    && current.row !== undefined
    && candidate.row !== undefined
    && current.column !== undefined
    && candidate.column !== undefined
  ) {
    if (direction === 'left') return candidate.column < current.column;
    if (direction === 'right') return candidate.column > current.column;
    if (direction === 'up') return candidate.row < current.row;
    return candidate.row > current.row;
  }
  if (navigation === 'horizontal') {
    return direction === 'left' || direction === 'up'
      ? candidate.x < current.x
      : candidate.x > current.x;
  }
  if (navigation === 'vertical') {
    return direction === 'left' || direction === 'up'
      ? candidate.y < current.y
      : candidate.y > current.y;
  }

  if (direction === 'left') return candidate.x < current.x;
  if (direction === 'right') return candidate.x > current.x;
  if (direction === 'up') return candidate.y < current.y;
  return candidate.y > current.y;
}

function isSameLane<TDatum>(
  current: NormalizedInteractionItem<TDatum>,
  candidate: NormalizedInteractionItem<TDatum>,
  direction: NavigationDirection,
  navigation: ChartInteractionNavigation,
): boolean {
  if (navigation === 'horizontal') {
    return current.row !== undefined && candidate.row === current.row;
  }
  if (navigation === 'vertical') {
    return current.column !== undefined && candidate.column === current.column;
  }
  if (direction === 'left' || direction === 'right') {
    return current.row !== undefined && candidate.row === current.row;
  }
  return current.column !== undefined && candidate.column === current.column;
}

function directionalDistances<TDatum>(
  current: NormalizedInteractionItem<TDatum>,
  candidate: NormalizedInteractionItem<TDatum>,
  direction: NavigationDirection,
  navigation: ChartInteractionNavigation,
): readonly [number, number] {
  if (
    navigation === 'grid'
    && current.row !== undefined
    && candidate.row !== undefined
    && current.column !== undefined
    && candidate.column !== undefined
  ) {
    if (direction === 'left' || direction === 'right') {
      return [
        Math.abs(candidate.column - current.column),
        Math.abs(candidate.y - current.y),
      ];
    }
    return [
      Math.abs(candidate.row - current.row),
      Math.abs(candidate.x - current.x),
    ];
  }
  if (navigation === 'horizontal') {
    return [Math.abs(candidate.x - current.x), Math.abs(candidate.y - current.y)];
  }
  if (navigation === 'vertical') {
    return [Math.abs(candidate.y - current.y), Math.abs(candidate.x - current.x)];
  }
  if (direction === 'left' || direction === 'right') {
    return [Math.abs(candidate.x - current.x), Math.abs(candidate.y - current.y)];
  }
  return [Math.abs(candidate.y - current.y), Math.abs(candidate.x - current.x)];
}

function directionalKey<TDatum>(
  currentKey: string,
  direction: NavigationDirection,
  items: readonly NormalizedInteractionItem<TDatum>[],
  navigation: ChartInteractionNavigation,
): string | null {
  const current = items.find((item) => item.key === currentKey);
  if (!current) return null;

  const candidates = items.filter(
    (candidate) => candidate.key !== current.key
      && isDirectionCandidate(current, candidate, direction, navigation),
  );
  if (candidates.length === 0) return null;

  const sameLaneCandidates = candidates.filter((candidate) =>
    isSameLane(current, candidate, direction, navigation));
  const pool = sameLaneCandidates.length > 0 ? sameLaneCandidates : candidates;

  pool.sort((left, right) => {
    const [leftPrimary, leftSecondary] = directionalDistances(
      current,
      left,
      direction,
      navigation,
    );
    const [rightPrimary, rightSecondary] = directionalDistances(
      current,
      right,
      direction,
      navigation,
    );
    return compareNumber(leftPrimary, rightPrimary)
      || compareNumber(leftSecondary, rightSecondary)
      || compareVisualItems(left, right, navigation);
  });

  return pool[0]?.key ?? null;
}

function pointerType(value: string): ChartInteractionPointerType {
  if (value === 'touch' || value === 'pen') return value;
  return 'mouse';
}

function datumKeyFromTarget(target: EventTarget | null, root: Element): string | null {
  if (!(target instanceof Element)) return null;
  const datum = target.closest(DATUM_KEY_SELECTOR);
  if (!datum || !root.contains(datum)) return null;
  return datum.getAttribute(DATUM_KEY_ATTRIBUTE);
}

function tooltipKeyFromTarget(target: EventTarget | null, root: Element): string | null {
  if (!(target instanceof Element)) return null;
  const tooltip = target.closest(TOOLTIP_KEY_SELECTOR);
  if (!tooltip || !root.contains(tooltip)) return null;
  return tooltip.getAttribute(TOOLTIP_KEY_ATTRIBUTE);
}

function relatedTargetHasKey(
  relatedTarget: EventTarget | null,
  root: Element,
  key: string,
): boolean {
  return datumKeyFromTarget(relatedTarget, root) === key
    || tooltipKeyFromTarget(relatedTarget, root) === key;
}

function focusDatum(root: Element, key: string): void {
  const candidates = root.querySelectorAll(DATUM_KEY_SELECTOR);
  for (const candidate of candidates) {
    if (candidate.getAttribute(DATUM_KEY_ATTRIBUTE) !== key) continue;
    const focus = (candidate as Element & { focus?: () => void }).focus;
    if (typeof focus === 'function') focus.call(candidate);
    return;
  }
}

interface PointerCoordinateEvent {
  readonly target: EventTarget | null;
  readonly currentTarget: Element;
  readonly clientX: number;
  readonly clientY: number;
}

function pointerDatumKey<TDatum>(
  event: PointerCoordinateEvent,
  items: readonly NormalizedInteractionItem<TDatum>[],
  navigation: ChartInteractionNavigation,
): string | null {
  const targetKey = datumKeyFromTarget(event.target, event.currentTarget);
  if (!(event.target instanceof Element)) return targetKey;
  if (event.target.getAttribute('data-part') !== 'interaction-target') return targetKey;

  const svg = event.target instanceof SVGElement
    ? event.target.ownerSVGElement
    : event.target.closest('svg');
  const viewBox = svg?.getAttribute('viewBox')
    ?.trim()
    .split(/\s+/u)
    .map(Number);
  const rect = svg?.getBoundingClientRect();
  if (!svg || !rect || rect.width <= 0 || rect.height <= 0 || viewBox?.length !== 4) {
    return targetKey;
  }
  const [viewX, viewY, viewWidth, viewHeight] = viewBox;
  if (
    !Number.isFinite(viewX)
    || !Number.isFinite(viewY)
    || !Number.isFinite(viewWidth)
    || !Number.isFinite(viewHeight)
    || viewWidth === undefined
    || viewHeight === undefined
  ) {
    return targetKey;
  }

  const x = (viewX ?? 0) + ((event.clientX - rect.left) / rect.width) * viewWidth;
  const y = (viewY ?? 0) + ((event.clientY - rect.top) / rect.height) * viewHeight;
  let nearest: NormalizedInteractionItem<TDatum> | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const item of items) {
    const distance = navigation === 'horizontal'
      ? Math.abs(item.x - x)
      : navigation === 'vertical'
        ? Math.abs(item.y - y)
        : ((item.x - x) ** 2) + ((item.y - y) ** 2);
    if (distance >= nearestDistance) continue;
    nearest = item;
    nearestDistance = distance;
  }

  return nearest?.key ?? targetKey;
}

/**
 * Shared renderer interaction state machine.
 *
 * It attaches one delegated handler set to the SVG root. Marks receive only
 * state/data attributes and one roving tab index, avoiding per-datum handler
 * closures while keeping actual DOM focus on the active semantic mark.
 */
export function useChartInteraction<TDatum>({
  items,
  interaction: interactionInput,
  navigation = 'horizontal',
}: UseChartInteractionOptions<TDatum>): UseChartInteractionResult<TDatum> {
  const interaction = interactionInput
    ?? (STATIC_INTERACTION as ChartInteraction<TDatum>);
  const mode = interaction.mode ?? 'static';
  const interactive = mode !== 'static';
  const normalizedItems = useMemo(
    () => normalizeItems(items, navigation),
    [items, navigation],
  );
  const visualKeys = useMemo(
    () => normalizedItems.map((item) => item.key),
    [normalizedItems],
  );
  const itemByKey = useMemo(
    () => new Map(normalizedItems.map((item) => [item.key, item] as const)),
    [normalizedItems],
  );
  const initialKey = interaction.defaultActiveKey
    && itemByKey.has(interaction.defaultActiveKey)
    ? interaction.defaultActiveKey
    : visualKeys[0] ?? null;
  const [rovingKeyState, setRovingKeyState] = useState<string | null>(initialKey);
  const [uncontrolledActiveKey, setUncontrolledActiveKey] = useState<string | null>(
    interaction.defaultActiveKey && itemByKey.has(interaction.defaultActiveKey)
      ? interaction.defaultActiveKey
      : null,
  );
  const [focusKeyState, setFocusKeyState] = useState<string | null>(null);
  const [hoverKeyState, setHoverKeyState] = useState<string | null>(null);
  const [pinnedKeyState, setPinnedKeyState] = useState<string | null>(null);
  const previousVisualKeysRef = useRef<readonly string[]>(visualKeys);
  const rootElementRef = useRef<Element | null>(null);
  const pointerActivationRef = useRef<{
    readonly key: string;
    readonly pointerType: ChartInteractionPointerType;
    readonly pointerId: number;
    readonly clientX: number;
    readonly clientY: number;
  } | null>(null);
  const lastKeyboardActionRef = useRef<{
    readonly key: string;
    readonly timestamp: number;
  } | null>(null);

  const controlled = interactive && interaction.activeKey !== undefined;
  const controlledActiveKey = controlled && interaction.activeKey !== null
    && itemByKey.has(interaction.activeKey)
    ? interaction.activeKey
    : null;
  const rovingKey = interactive
    ? replacementKey(rovingKeyState, previousVisualKeysRef.current, visualKeys)
    : null;
  const reconciledUncontrolledActiveKey = uncontrolledActiveKey === null
    ? null
    : replacementKey(
      uncontrolledActiveKey,
      previousVisualKeysRef.current,
      visualKeys,
    );
  const activeKey = interactive
    ? controlled
      ? controlledActiveKey
      : reconciledUncontrolledActiveKey
    : null;
  const focusKey = focusKeyState && itemByKey.has(focusKeyState) ? focusKeyState : null;
  const hoverKey = hoverKeyState && itemByKey.has(hoverKeyState) ? hoverKeyState : null;
  const pinnedKey = pinnedKeyState && itemByKey.has(pinnedKeyState) ? pinnedKeyState : null;

  const itemByKeyRef = useRef(itemByKey);
  const activeKeyRef = useRef(activeKey);
  const controlledRef = useRef(controlled);
  const onActiveChangeRef = useRef(interactive ? interaction.onActiveChange : undefined);
  const focusKeyRef = useRef(focusKey);
  const hoverKeyRef = useRef(hoverKey);
  const pinnedKeyRef = useRef(pinnedKey);

  itemByKeyRef.current = itemByKey;
  activeKeyRef.current = activeKey;
  controlledRef.current = controlled;
  onActiveChangeRef.current = interactive ? interaction.onActiveChange : undefined;
  focusKeyRef.current = focusKey;
  hoverKeyRef.current = hoverKey;
  pinnedKeyRef.current = pinnedKey;

  useEffect(() => {
    if (rovingKeyState !== rovingKey) setRovingKeyState(rovingKey);
    if (!controlled && uncontrolledActiveKey !== reconciledUncontrolledActiveKey) {
      setUncontrolledActiveKey(reconciledUncontrolledActiveKey);
      if (uncontrolledActiveKey !== null) {
        onActiveChangeRef.current?.(
          activeDatum(
            reconciledUncontrolledActiveKey
              ? itemByKey.get(reconciledUncontrolledActiveKey)
              : undefined,
          ),
          PROGRAMMATIC_DATA_CHANGE,
        );
      }
    }
    if (focusKeyState !== focusKey) setFocusKeyState(focusKey);
    if (hoverKeyState !== hoverKey) setHoverKeyState(hoverKey);
    if (pinnedKeyState !== pinnedKey) setPinnedKeyState(pinnedKey);
    previousVisualKeysRef.current = visualKeys;
  }, [
    controlled,
    focusKey,
    focusKeyState,
    hoverKey,
    hoverKeyState,
    itemByKey,
    pinnedKey,
    pinnedKeyState,
    reconciledUncontrolledActiveKey,
    rovingKey,
    rovingKeyState,
    uncontrolledActiveKey,
    visualKeys,
  ]);

  const commitActive = useCallback((key: string | null, meta: ChartInteractionMeta) => {
    const nextKey = key && itemByKeyRef.current.has(key) ? key : null;
    if (activeKeyRef.current === nextKey) return;

    if (!controlledRef.current) {
      activeKeyRef.current = nextKey;
      setUncontrolledActiveKey(nextKey);
    }
    onActiveChangeRef.current?.(
      activeDatum(nextKey ? itemByKeyRef.current.get(nextKey) : undefined),
      meta,
    );
  }, []);

  const updateRovingKey = useCallback((key: string | null) => {
    const nextKey = key && itemByKeyRef.current.has(key) ? key : null;
    setRovingKeyState(nextKey);
  }, []);

  const updateFocusKey = useCallback((key: string | null) => {
    focusKeyRef.current = key;
    setFocusKeyState(key);
  }, []);

  const updateHoverKey = useCallback((key: string | null) => {
    hoverKeyRef.current = key;
    setHoverKeyState(key);
  }, []);

  const updatePinnedKey = useCallback((key: string | null) => {
    pinnedKeyRef.current = key;
    setPinnedKeyState(key);
  }, []);

  const reset = useCallback((meta: ChartInteractionMeta = PROGRAMMATIC_ESCAPE) => {
    pointerActivationRef.current = null;
    lastKeyboardActionRef.current = null;
    updateHoverKey(null);
    updatePinnedKey(null);
    commitActive(null, meta);
  }, [commitActive, updateHoverKey, updatePinnedKey]);

  useEffect(() => {
    if (!interactive || activeKey === null || typeof document === 'undefined') return;
    const handleDocumentEscape = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.key !== 'Escape') return;
      event.preventDefault();
      reset({ input: 'keyboard', reason: 'escape' });
    };
    document.addEventListener('keydown', handleDocumentEscape);
    return () => document.removeEventListener('keydown', handleDocumentEscape);
  }, [activeKey, interactive, reset]);

  useEffect(() => {
    if (!interactive || pinnedKey === null || typeof document === 'undefined') return;
    const handleOutsidePointerDown = (event: PointerEvent): void => {
      const root = rootElementRef.current;
      if (!root || (event.target instanceof Node && root.contains(event.target))) return;
      reset({
        input: 'pointer',
        pointerType: pointerType(event.pointerType),
        reason: 'escape',
      });
    };
    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [interactive, pinnedKey, reset]);

  const pinDatum = useCallback((key: string, meta: ChartInteractionMeta = {
    input: 'programmatic',
    reason: 'pin',
  }) => {
    if (!itemByKeyRef.current.has(key)) return;
    updatePinnedKey(key);
    updateRovingKey(key);
    commitActive(key, meta);
  }, [commitActive, updatePinnedKey, updateRovingKey]);

  const handleFocus = useCallback((event: ReactFocusEvent<Element>) => {
    rootElementRef.current = event.currentTarget;
    const key = datumKeyFromTarget(event.target, event.currentTarget);
    if (!key || !itemByKeyRef.current.has(key)) return;
    updateHoverKey(null);
    updateFocusKey(key);
    updateRovingKey(key);
    if (!pinnedKeyRef.current) {
      commitActive(key, { input: 'keyboard', reason: 'focus' });
    }
  }, [commitActive, updateFocusKey, updateHoverKey, updateRovingKey]);

  const handleBlur = useCallback((event: ReactFocusEvent<Element>) => {
    if (
      event.relatedTarget instanceof Node
      && event.currentTarget.contains(event.relatedTarget)
    ) return;

    pointerActivationRef.current = null;
    updateFocusKey(null);
    updatePinnedKey(null);
    commitActive(hoverKeyRef.current, { input: 'keyboard', reason: 'focus' });
  }, [commitActive, updateFocusKey, updatePinnedKey]);

  const handlePointerOver = useCallback((event: ReactPointerEvent<Element>) => {
    rootElementRef.current = event.currentTarget;
    const resolvedPointerType = pointerType(event.pointerType);
    if (resolvedPointerType === 'touch') return;
    const key = pointerDatumKey(event, normalizedItems, navigation);
    if (!key || !itemByKeyRef.current.has(key)) return;
    updateHoverKey(key);
    if (!pinnedKeyRef.current) {
      commitActive(key, {
        input: 'pointer',
        pointerType: resolvedPointerType,
        reason: 'hover',
      });
    }
  }, [commitActive, navigation, normalizedItems, updateHoverKey]);

  const handlePointerOut = useCallback((event: ReactPointerEvent<Element>) => {
    const resolvedPointerType = pointerType(event.pointerType);
    if (resolvedPointerType === 'touch') return;
    const key = datumKeyFromTarget(event.target, event.currentTarget)
      ?? tooltipKeyFromTarget(event.target, event.currentTarget);
    if (!key || relatedTargetHasKey(event.relatedTarget, event.currentTarget, key)) return;
    if (hoverKeyRef.current !== key) return;
    updateHoverKey(null);
    commitActive(pinnedKeyRef.current ?? focusKeyRef.current, {
      input: 'pointer',
      pointerType: resolvedPointerType,
      reason: 'hover',
    });
  }, [commitActive, updateHoverKey]);

  const handlePointerCancel = useCallback(() => {
    pointerActivationRef.current = null;
  }, []);

  const handlePointerDown = useCallback((event: ReactPointerEvent<Element>) => {
    rootElementRef.current = event.currentTarget;
    if (event.button !== 0) {
      pointerActivationRef.current = null;
      return;
    }
    const key = pointerDatumKey(event, normalizedItems, navigation);
    const resolvedPointerType = pointerType(event.pointerType);
    if (!key || !itemByKeyRef.current.has(key)) {
      pointerActivationRef.current = null;
      if (resolvedPointerType === 'touch' || resolvedPointerType === 'pen') {
        reset({
          input: 'pointer',
          pointerType: resolvedPointerType,
          reason: 'escape',
        });
      }
      return;
    }
    pointerActivationRef.current = {
      key,
      pointerType: resolvedPointerType,
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    };
    updateRovingKey(key);

    if (resolvedPointerType === 'touch' || resolvedPointerType === 'pen') {
      // Confirmation is deferred to click. A scroll/pan emits movement or
      // pointercancel and must never leave a phantom pinned datum behind.
      return;
    }

    updateHoverKey(key);
    if (!pinnedKeyRef.current) {
      commitActive(key, {
        input: 'pointer',
        pointerType: resolvedPointerType,
        reason: 'hover',
      });
    }
  }, [
    commitActive,
    navigation,
    normalizedItems,
    reset,
    updateHoverKey,
    updateRovingKey,
  ]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<Element>) => {
    const activation = pointerActivationRef.current;
    if (!activation || activation.pointerId !== event.pointerId) return;
    if (
      Math.abs(event.clientX - activation.clientX) > 8
      || Math.abs(event.clientY - activation.clientY) > 8
    ) {
      pointerActivationRef.current = null;
    }
  }, []);

  const handleClick = useCallback((event: ReactMouseEvent<Element>) => {
    rootElementRef.current = event.currentTarget;
    const key = pointerDatumKey(event, normalizedItems, navigation);
    const activation = pointerActivationRef.current;
    pointerActivationRef.current = null;
    if (!key) return;
    const item = itemByKeyRef.current.get(key);
    if (!item) return;

    const pointerActivation = activation?.key === key ? activation : null;
    const synthesizedActivation = !pointerActivation && event.detail === 0;
    if (!pointerActivation && !synthesizedActivation) return;
    if (synthesizedActivation) {
      const lastKeyboardAction = lastKeyboardActionRef.current;
      lastKeyboardActionRef.current = null;
      if (
        lastKeyboardAction?.key === key
        && Date.now() - lastKeyboardAction.timestamp < 500
      ) return;
    } else {
      lastKeyboardActionRef.current = null;
    }

    if (interaction.mode === 'explore') {
      if (!pointerActivation) return;
      const meta: ChartInteractionMeta = {
        input: 'pointer',
        pointerType: pointerActivation.pointerType,
        reason: 'pin',
      };
      updateHoverKey(null);
      updatePinnedKey(key);
      updateRovingKey(key);
      commitActive(key, meta);
      focusDatum(event.currentTarget, key);
      return;
    }

    if (interaction.mode !== 'select' && interaction.mode !== 'drill') return;
    const meta: ChartInteractionMeta = pointerActivation
      ? {
          input: 'pointer',
          pointerType: pointerActivation.pointerType,
          reason: 'action',
        }
      : { input: 'keyboard', reason: 'action' };
    updateHoverKey(null);
    updatePinnedKey(key);
    updateRovingKey(key);
    commitActive(key, meta);
    if (pointerActivation) focusDatum(event.currentTarget, key);
    interaction.onAction(activeDatum(item) as ChartActiveDatum<TDatum>, meta);
  }, [
    commitActive,
    interaction,
    navigation,
    normalizedItems,
    updateHoverKey,
    updatePinnedKey,
    updateRovingKey,
  ]);

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<Element>) => {
    rootElementRef.current = event.currentTarget;
    const currentKey = datumKeyFromTarget(event.target, event.currentTarget)
      ?? focusKeyRef.current
      ?? visualKeys[0]
      ?? null;
    if (!currentKey) return;

    let nextKey: string | null = null;
    if (event.key === 'Home') nextKey = visualKeys[0] ?? null;
    else if (event.key === 'End') nextKey = visualKeys.slice(-1).pop() ?? null;
    else if (event.key === 'ArrowLeft') {
      nextKey = directionalKey(currentKey, 'left', normalizedItems, navigation);
    } else if (event.key === 'ArrowRight') {
      nextKey = directionalKey(currentKey, 'right', normalizedItems, navigation);
    } else if (event.key === 'ArrowUp') {
      nextKey = directionalKey(currentKey, 'up', normalizedItems, navigation);
    } else if (event.key === 'ArrowDown') {
      nextKey = directionalKey(currentKey, 'down', normalizedItems, navigation);
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (interaction.mode !== 'select' && interaction.mode !== 'drill') return;
      event.preventDefault();
      const item = itemByKeyRef.current.get(currentKey);
      if (!item) return;
      lastKeyboardActionRef.current = { key: currentKey, timestamp: Date.now() };
      updatePinnedKey(null);
      updateHoverKey(null);
      commitActive(currentKey, { input: 'keyboard', reason: 'action' });
      interaction.onAction(activeDatum(item) as ChartActiveDatum<TDatum>, {
        input: 'keyboard',
        reason: 'action',
      });
      return;
    } else if (event.key === 'Escape') {
      event.preventDefault();
      reset({ input: 'keyboard', reason: 'escape' });
      return;
    } else {
      return;
    }

    event.preventDefault();
    if (!nextKey || nextKey === currentKey) return;
    updatePinnedKey(null);
    updateHoverKey(null);
    updateFocusKey(nextKey);
    updateRovingKey(nextKey);
    commitActive(nextKey, { input: 'keyboard', reason: 'focus' });
    focusDatum(event.currentTarget, nextKey);
  }, [
    commitActive,
    interaction,
    mode,
    navigation,
    normalizedItems,
    reset,
    updateFocusKey,
    updateHoverKey,
    updatePinnedKey,
    updateRovingKey,
    visualKeys,
  ]);

  const rootProps = useMemo<ChartInteractionRootProps>(() => {
    if (!interactive) return { 'data-interaction': 'static' };
    return {
      'data-interaction': mode,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onPointerOver: handlePointerOver,
      onPointerOut: handlePointerOut,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerCancel: handlePointerCancel,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    };
  }, [
    handleBlur,
    handleFocus,
    handleKeyDown,
    handleClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerCancel,
    handlePointerOut,
    handlePointerOver,
    interactive,
    mode,
  ]);

  const getDatumProps = useCallback((key: string): ChartInteractionDatumProps => ({
    [DATUM_KEY_ATTRIBUTE]: key,
    tabIndex: interactive && itemByKey.has(key)
      ? key === rovingKey ? 0 : -1
      : undefined,
    'data-active': key === activeKey ? 'true' : undefined,
    'data-focused': key === focusKey ? 'true' : undefined,
    'data-hovered': key === hoverKey ? 'true' : undefined,
    'data-pinned': key === pinnedKey ? 'true' : undefined,
  }), [activeKey, focusKey, hoverKey, interactive, itemByKey, pinnedKey, rovingKey]);

  return {
    mode,
    activeKey,
    activeDatum: activeDatum(activeKey ? itemByKey.get(activeKey) : undefined),
    rovingKey,
    focusKey,
    hoverKey,
    pinnedKey,
    rootProps,
    getDatumProps,
    pinDatum,
    reset,
  };
}
