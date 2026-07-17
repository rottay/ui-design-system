'use client';

/**
 * @fileoverview useCrossTabSync Hook - Rottay Design System
 * @description React hook for synchronizing state across browser tabs using
 * the BroadcastChannel API. Enables real-time entity invalidation and update
 * notifications so that when a user modifies data in one tab, all other tabs
 * of the same origin can react (e.g., refetch, update optimistic cache, remove
 * deleted rows).
 *
 * @remarks
 * Features:
 * - Zero dependencies -- uses native BroadcastChannel API
 * - Automatic localStorage fallback for older browsers (Safari < 15.4)
 * - Unique tab ID generated on mount to filter out own messages
 * - Optional entityType filter to scope incoming messages
 * - Typed message protocol (invalidate, update, delete, create)
 * - Cleanup on unmount (channel close / event listener removal)
 * - SSR-safe: no-ops on the server
 *
 * @example Basic invalidation
 * ```tsx
 * function UsersTable() {
 *   const { invalidate, broadcast } = useCrossTabSync({
 *     entityType: 'user',
 *     onMessage: (msg) => {
 *       if (msg.type === 'invalidate' || msg.type === 'delete') {
 *         refetchUsers();
 *       }
 *     },
 *   });
 *
 *   const handleDelete = async (userId: string) => {
 *     await deleteUser(userId);
 *     invalidate('user', userId);
 *   };
 * }
 * ```
 *
 * @example Cross-entity broadcast
 * ```tsx
 * const { broadcast } = useCrossTabSync();
 *
 * broadcast({ type: 'create', entityType: 'tenant', entityId: newTenant.id, payload: newTenant });
 * ```
 *
 * @module System/Hooks/State/CrossTabSync
 * @category System
 * @package @rottay/design-system
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

/** The kind of synchronization event being broadcast. */
export type CrossTabMessageType = 'invalidate' | 'update' | 'delete' | 'create';

/**
 * Message payload exchanged between tabs.
 */
export interface CrossTabMessage<T = unknown> {
  /** What kind of sync event this is. */
  type: CrossTabMessageType;
  /** The entity type this message concerns (e.g. 'user', 'tenant', 'role'). */
  entityType: string;
  /** Optional entity identifier for targeted updates. */
  entityId?: string;
  /** Optional data payload (e.g. the updated entity for 'update' messages). */
  payload?: T;
  /** Tab ID of the sender. Used to filter out own messages. */
  sourceTabId: string;
  /** Unix timestamp (ms) when the message was created. */
  timestamp: number;
}

/**
 * Configuration options for the `useCrossTabSync` hook.
 */
export interface UseCrossTabSyncOptions {
  /**
   * Channel name shared across tabs of the same origin.
   * @default 'rottay-sync'
   */
  channel?: string;
  /**
   * Entity type this hook instance is interested in. When set, only messages
   * whose `entityType` matches will be delivered to `onMessage`. When omitted,
   * all messages are delivered.
   */
  entityType?: string;
  /**
   * Callback invoked when a message is received from another tab.
   * Only called for messages that pass the entityType filter (if set).
   */
  onMessage?: (message: CrossTabMessage) => void;
}

/**
 * Return type of the `useCrossTabSync` hook.
 */
export interface UseCrossTabSyncReturn {
  /**
   * Send a sync message to all other tabs on the same channel.
   * The `sourceTabId` and `timestamp` fields are added automatically.
   */
  broadcast: (message: Omit<CrossTabMessage, 'sourceTabId' | 'timestamp'>) => void;
  /**
   * Shorthand for broadcasting an `invalidate` message for a given entity type
   * and optional entity ID. Useful after mutations.
   */
  invalidate: (entityType: string, entityId?: string) => void;
  /** Whether BroadcastChannel (or the localStorage fallback) is available. */
  isSupported: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CHANNEL = 'rottay-sync';
const STORAGE_KEY_PREFIX = 'ds-cross-tab-';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate a unique tab identifier. Prefers crypto.randomUUID when available,
 * falls back to Math.random-based ID.
 */
function generateTabId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: 16 hex characters from Math.random
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

/**
 * Detect whether BroadcastChannel is available in the current environment.
 */
function hasBroadcastChannel(): boolean {
  return typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined';
}

/**
 * Detect whether localStorage + storage events are available (fallback path).
 */
function hasLocalStorageFallback(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__ds_cross_tab_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * React hook for cross-tab state synchronization.
 *
 * Uses the BroadcastChannel API to send and receive typed messages between
 * tabs of the same origin. For browsers that do not support BroadcastChannel
 * (Safari < 15.4), falls back to localStorage write + `storage` event
 * listening with the same message format.
 *
 * Messages from the current tab are automatically filtered out. When an
 * `entityType` filter is provided, only matching messages reach `onMessage`.
 *
 * @param options - Hook configuration
 * @returns Broadcast function, invalidation shorthand, and support flag
 *
 * @example
 * ```tsx
 * function RoleEditor({ roleId }: { roleId: string }) {
 *   const { invalidate } = useCrossTabSync({
 *     entityType: 'role',
 *     onMessage: (msg) => {
 *       if (msg.entityId === roleId) {
 *         // Another tab changed this role -- reload
 *         router.refresh();
 *       }
 *     },
 *   });
 *
 *   const handleSave = async (data: RoleData) => {
 *     await saveRole(roleId, data);
 *     invalidate('role', roleId);
 *   };
 * }
 * ```
 */
export function useCrossTabSync(
  options: UseCrossTabSyncOptions = {}
): UseCrossTabSyncReturn {
  const {
    channel: channelName = DEFAULT_CHANNEL,
    entityType: filterEntityType,
    onMessage,
  } = options;

  // Stable refs so the callback and filter can change without re-creating
  // the channel / listener.
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const filterEntityTypeRef = useRef(filterEntityType);
  filterEntityTypeRef.current = filterEntityType;

  const channelNameRef = useRef(channelName);
  channelNameRef.current = channelName;

  // Generate a stable tab ID for the lifetime of this component instance.
  const tabIdRef = useRef<string>('');
  if (tabIdRef.current === '') {
    tabIdRef.current = generateTabId();
  }

  // Track support status
  const [isSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return hasBroadcastChannel() || hasLocalStorageFallback();
  });

  // Refs for cleanup
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // -------------------------------------------------------------------------
  // Internal: process an incoming message
  // -------------------------------------------------------------------------
  const handleIncoming = useCallback((message: CrossTabMessage) => {
    // Ignore own messages
    if (message.sourceTabId === tabIdRef.current) return;

    // Apply entity type filter if configured
    const filter = filterEntityTypeRef.current;
    if (filter && message.entityType !== filter) return;

    // Deliver to consumer
    onMessageRef.current?.(message);
  }, []);

  // -------------------------------------------------------------------------
  // Setup: create BroadcastChannel or localStorage listener
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storageKey = STORAGE_KEY_PREFIX + channelName;

    // --- BroadcastChannel path ---
    if (hasBroadcastChannel()) {
      const bc = new BroadcastChannel(channelName);

      bc.onmessage = (event: MessageEvent) => {
        try {
          const data = event.data as CrossTabMessage;
          if (data && typeof data.type === 'string' && typeof data.entityType === 'string') {
            handleIncoming(data);
          }
        } catch {
          // Malformed message -- ignore
        }
      };

      broadcastChannelRef.current = bc;

      return () => {
        bc.close();
        broadcastChannelRef.current = null;
      };
    }

    // --- localStorage fallback path ---
    if (hasLocalStorageFallback()) {
      const storageHandler = (event: StorageEvent) => {
        if (event.key !== storageKey || !event.newValue) return;

        try {
          const data = JSON.parse(event.newValue) as CrossTabMessage;
          if (data && typeof data.type === 'string' && typeof data.entityType === 'string') {
            handleIncoming(data);
          }
        } catch {
          // Malformed JSON -- ignore
        }
      };

      window.addEventListener('storage', storageHandler);

      return () => {
        window.removeEventListener('storage', storageHandler);
      };
    }

    return undefined;
  }, [channelName, handleIncoming]);

  // -------------------------------------------------------------------------
  // broadcast(): send a message to other tabs
  // -------------------------------------------------------------------------
  const broadcast = useCallback(
    (message: Omit<CrossTabMessage, 'sourceTabId' | 'timestamp'>) => {
      if (typeof window === 'undefined') return;

      const fullMessage: CrossTabMessage = {
        ...message,
        sourceTabId: tabIdRef.current,
        timestamp: Date.now(),
      };

      // --- BroadcastChannel path ---
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(fullMessage);
        } catch {
          // Channel may be closed -- ignore
        }
        return;
      }

      // --- localStorage fallback path ---
      const storageKey = STORAGE_KEY_PREFIX + channelNameRef.current;
      try {
        // Write the message to localStorage. The `storage` event only fires in
        // *other* tabs when the value changes, which is exactly what we want.
        // We append the timestamp to ensure the value always changes (even for
        // consecutive identical messages).
        window.localStorage.setItem(storageKey, JSON.stringify(fullMessage));
        // Clean up immediately -- we only need the event, not persistence.
        // Use setTimeout to ensure the storage event has propagated.
        setTimeout(() => {
          try {
            window.localStorage.removeItem(storageKey);
          } catch {
            // Ignore cleanup errors
          }
        }, 100);
      } catch {
        // Storage unavailable -- silently ignore
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  // invalidate(): convenience shorthand
  // -------------------------------------------------------------------------
  const invalidate = useCallback(
    (entityType: string, entityId?: string) => {
      broadcast({ type: 'invalidate', entityType, entityId });
    },
    [broadcast]
  );

  return {
    broadcast,
    invalidate,
    isSupported,
  };
}
