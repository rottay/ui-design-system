'use client';

import { useSyncExternalStore } from 'react';

import type { MotionPointer, MotionPower } from '../../contracts/motion';

const COARSE_POINTER_QUERY = '(pointer: coarse)';

type StoreListener = () => void;

interface NetworkInformationLike {
  readonly effectiveType?: string;
  readonly saveData?: boolean;
  addEventListener?: (type: 'change', listener: EventListener) => void;
  removeEventListener?: (type: 'change', listener: EventListener) => void;
}

interface NavigatorWithConnection extends Navigator {
  readonly connection?: NetworkInformationLike;
}

export interface MotionEnvironmentSnapshot {
  readonly pointer: MotionPointer;
  readonly power: MotionPower;
  readonly visible: boolean;
}

const SERVER_SNAPSHOT: MotionEnvironmentSnapshot = Object.freeze({
  pointer: 'coarse',
  power: 'constrained',
  visible: false,
});

const listenerRefCounts = new Map<StoreListener, number>();
let subscriptionCount = 0;
let pointerQuery: MediaQueryList | null = null;
let pointerQueryFactory: typeof window.matchMedia | null = null;
let connection: NetworkInformationLike | null = null;
let detachSources: (() => void) | null = null;
let snapshot: MotionEnvironmentSnapshot = SERVER_SNAPSHOT;

function getConnection(): NetworkInformationLike | null {
  if (typeof navigator === 'undefined') return null;
  return (navigator as NavigatorWithConnection).connection ?? null;
}

function readPointerQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }

  const currentFactory = window.matchMedia;

  // React can read an external-store snapshot repeatedly (and once per
  // consumer) before the first subscription. Cache that pre-subscribe query so
  // those reads do not allocate throwaway MediaQueryList instances. A changed
  // factory is picked up while detached, which also keeps isolated test/browser
  // realms honest.
  if (
    pointerQuery === null
    || (detachSources === null && pointerQueryFactory !== currentFactory)
  ) {
    pointerQuery = window.matchMedia(COARSE_POINTER_QUERY);
    pointerQueryFactory = currentFactory;
  }

  return pointerQuery;
}

function readClientSnapshot(): MotionEnvironmentSnapshot {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return SERVER_SNAPSHOT;
  }

  const coarse = readPointerQuery()?.matches ?? true;
  const activeConnection = connection ?? getConnection();
  const constrained = Boolean(
    activeConnection?.saveData
      || activeConnection?.effectiveType === 'slow-2g'
      || activeConnection?.effectiveType === '2g',
  );
  const next: MotionEnvironmentSnapshot = {
    pointer: coarse ? 'coarse' : 'fine',
    power: constrained ? 'constrained' : 'normal',
    visible: document.visibilityState === 'visible',
  };

  if (
    snapshot.pointer === next.pointer
    && snapshot.power === next.power
    && snapshot.visible === next.visible
  ) {
    return snapshot;
  }

  snapshot = Object.freeze(next);
  return snapshot;
}

function publish(): void {
  const previous = snapshot;
  const next = readClientSnapshot();
  if (previous === next) return;
  listenerRefCounts.forEach((_count, listener) => listener());
}

function listenToPointer(query: MediaQueryList | null): () => void {
  if (!query) return () => undefined;

  if (
    typeof query.addEventListener === 'function'
    && typeof query.removeEventListener === 'function'
  ) {
    const removeEventListener = query.removeEventListener;
    query.addEventListener('change', publish);
    return () => removeEventListener.call(query, 'change', publish);
  }

  // Safari < 14 exposes only the deprecated MediaQueryList listener pair.
  if (
    typeof query.addListener === 'function'
    && typeof query.removeListener === 'function'
  ) {
    const removeListener = query.removeListener;
    query.addListener(publish);
    return () => removeListener.call(query, publish);
  }

  return () => undefined;
}

function listenToConnection(activeConnection: NetworkInformationLike | null): () => void {
  if (
    !activeConnection
    || typeof activeConnection.addEventListener !== 'function'
    || typeof activeConnection.removeEventListener !== 'function'
  ) {
    return () => undefined;
  }

  const removeEventListener = activeConnection.removeEventListener;
  activeConnection.addEventListener('change', publish);
  return () => removeEventListener.call(activeConnection, 'change', publish);
}

function attach(): void {
  if (detachSources || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  pointerQuery = readPointerQuery();
  connection = getConnection();
  readClientSnapshot();

  const detachPointer = listenToPointer(pointerQuery);
  const detachConnection = listenToConnection(connection);
  document.addEventListener('visibilitychange', publish);

  detachSources = () => {
    detachPointer();
    detachConnection();
    document.removeEventListener('visibilitychange', publish);
    pointerQuery = null;
    pointerQueryFactory = null;
    connection = null;
    detachSources = null;
    snapshot = SERVER_SNAPSHOT;
  };
}

/** One browser listener set fans environment updates out to all motion consumers. */
export function subscribeMotionEnvironment(listener: StoreListener): () => void {
  listenerRefCounts.set(listener, (listenerRefCounts.get(listener) ?? 0) + 1);
  subscriptionCount += 1;
  if (subscriptionCount === 1) attach();

  let subscribed = true;

  return () => {
    if (!subscribed) return;
    subscribed = false;

    const listenerRefCount = listenerRefCounts.get(listener) ?? 0;
    if (listenerRefCount <= 1) listenerRefCounts.delete(listener);
    else listenerRefCounts.set(listener, listenerRefCount - 1);

    subscriptionCount = Math.max(0, subscriptionCount - 1);
    if (subscriptionCount === 0) detachSources?.();
  };
}

export function getMotionEnvironmentSnapshot(): MotionEnvironmentSnapshot {
  return readClientSnapshot();
}

/** Conservative static first paint: no ambient work before capabilities are known. */
export function getMotionEnvironmentServerSnapshot(): MotionEnvironmentSnapshot {
  return SERVER_SNAPSHOT;
}

export function useMotionEnvironment(): MotionEnvironmentSnapshot {
  return useSyncExternalStore(
    subscribeMotionEnvironment,
    getMotionEnvironmentSnapshot,
    getMotionEnvironmentServerSnapshot,
  );
}
