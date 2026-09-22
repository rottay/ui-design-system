'use client';

/**
 * @fileoverview Layout animation kernel -- the group channel
 *
 * The context `LayoutGroup` publishes and every kernel arm consumes. It carries
 * no animation: it supplies the element the channels are read from, the arming
 * fan-out that puts sibling reflows on one commit, and the shared-key registry
 * two live `view-transition-name`s would otherwise silently disable.
 */

import { createContext, useContext } from 'react';

export interface LayoutGroupChannel {
  /** Group id; scopes every shared-element key registered through it. */
  id: string;
  /** The element the kernel reads its channels from, when the group has mounted one. */
  root: () => HTMLElement | null;
  /** Registers a consumer's snapshot callback; returns the unsubscribe. */
  subscribe: (arm: () => void) => () => void;
  /** Snapshots every consumer in the group, so siblings play on one commit. */
  armAll: () => void;
  /** Claims a shared-element key for as long as the caller is mounted. */
  claimSharedKey: (key: string) => () => void;
}

export const LayoutGroupContext = createContext<LayoutGroupChannel | null>(null);

/** The enclosing group, or `null` when a consumer is used standalone. */
export function useLayoutGroup(): LayoutGroupChannel | null {
  return useContext(LayoutGroupContext);
}
