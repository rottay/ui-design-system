'use client';

/**
 * @fileoverview LayoutGroup -- Rottay Design System
 *
 * The scope, not an animation. It supplies the element the kernel reads its
 * `--ds-motion-*` channels from, fans one consumer's `measure()` out to every
 * consumer in the group so siblings moved by the same state change play on one
 * commit, and owns the shared-element key registry that keeps two live
 * `view-transition-name`s from silently disabling a morph.
 */

import React, { useMemo, useRef } from 'react';

import type { LayoutGroupProps } from '../../../contracts';
import { LayoutGroupContext, type LayoutGroupChannel } from '../../../kernel/group';

export function LayoutGroup({ id, children }: LayoutGroupProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const armsRef = useRef(new Set<() => void>());
  const sharedKeysRef = useRef(new Set<string>());

  const channel = useMemo<LayoutGroupChannel>(() => ({
    id,
    root: () => rootRef.current,
    subscribe: (arm) => {
      armsRef.current.add(arm);
      return () => armsRef.current.delete(arm);
    },
    armAll: () => {
      armsRef.current.forEach((arm) => arm());
    },
    claimSharedKey: (key) => {
      if (sharedKeysRef.current.has(key) && process.env.NODE_ENV !== 'production') {
        throw new Error(
          `Shared-element key "${key}" is already live in LayoutGroup "${id}". Two `
          + 'elements declaring one view-transition-name make the browser skip the '
          + 'transition.',
        );
      }
      sharedKeysRef.current.add(key);
      return () => sharedKeysRef.current.delete(key);
    },
  }), [id]);

  return (
    <LayoutGroupContext.Provider value={channel}>
      <div ref={rootRef} data-ds-layout-group={id} style={{ display: 'contents' }}>
        {children}
      </div>
    </LayoutGroupContext.Provider>
  );
}
