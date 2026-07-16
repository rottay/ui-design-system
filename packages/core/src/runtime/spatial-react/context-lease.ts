type SpatialLeaseOwner = symbol;
type SpatialLeaseCallback = () => void;

let activeOwner: SpatialLeaseOwner | null = null;
const waiters = new Map<SpatialLeaseOwner, SpatialLeaseCallback>();

/**
 * Admit at most one live spatial context for the current document.
 *
 * Callers that cannot acquire immediately are queued in insertion order. The
 * callback is only a notification: it must call this function again before it
 * mounts a context. Keeping ownership explicit prevents a stale/unmounted
 * waiter from inheriting a lease it can no longer release.
 */
export function acquireSpatialContextLease(
  owner: SpatialLeaseOwner,
  onAvailable: SpatialLeaseCallback,
): boolean {
  if (activeOwner === owner) return true;

  if (activeOwner === null) {
    waiters.delete(owner);
    activeOwner = owner;
    return true;
  }

  waiters.set(owner, onAvailable);
  return false;
}

export function releaseSpatialContextLease(owner: SpatialLeaseOwner): void {
  waiters.delete(owner);
  if (activeOwner !== owner) return;

  activeOwner = null;
  const next = waiters.entries().next();
  if (next.done) return;

  const [nextOwner, notify] = next.value;
  waiters.delete(nextOwner);
  notify();
}

export function getSpatialContextLeaseCount(): 0 | 1 {
  return activeOwner === null ? 0 : 1;
}

/** Test-only module reset; intentionally absent from the public entrypoint. */
export function resetSpatialContextLeaseForTests(): void {
  activeOwner = null;
  waiters.clear();
}
