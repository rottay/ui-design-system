'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (): (() => void) => () => undefined;
const getClientSnapshot = (): true => true;
const getServerSnapshot = (): false => false;

/** False for SSR and the hydration pass; true only after React is client-owned. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
