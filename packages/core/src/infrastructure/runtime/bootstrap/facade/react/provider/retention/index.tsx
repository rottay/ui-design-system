import { useInsertionEffect, useLayoutEffect } from 'react';
import type { PreparedTenantThemeArtifactClaim } from '../../../../../theming';

// Stable identities for the no-artifact case. useSyncExternalStore resubscribes
// whenever the subscribe function changes, so these must not be inline.
export const NO_RETENTION_SUBSCRIPTION = (): (() => void) => () => {};
export const NO_RETENTION_REVOCATION = (): string | null => null;

/**
 * PHASE ONE. Arm the retained-artifact watch, from a commit, before anything
 * below it exists.
 *
 * `useInsertionEffect` is the earliest committed moment React offers: it runs
 * in the mutation phase, ahead of every descendant's insertion effect, every
 * layout effect in the tree, and the paint. Arming here closes the window a
 * descendant would otherwise have to touch the artifact unobserved, rather
 * than narrowing it.
 *
 * It is a COMMITTED moment, which is the other half of the reason. Arming
 * during render looked equivalent and was not: React abandons renders, and an
 * abandoned arm leaves an observer and a permanent ledger entry that no
 * cleanup will ever reach. The claim's `commit` hands back the release for
 * exactly the hold it took, so React's own cleanup contract does the rest.
 *
 * The sentinel renders nothing. It is a position in the tree, and the position
 * is the point.
 */
export function RetainedArtifactArm({
  claim,
}: {
  claim: PreparedTenantThemeArtifactClaim;
}): null {
  useInsertionEffect(() => claim.commit(), [claim]);
  return null;
}

/**
 * PHASE TWO. Settle the verdict after the whole subtree has run, before paint.
 *
 * A `MutationObserver` reports in a microtask, and a React commit yields none:
 * the mutation phase, every layout effect and the browser's paint are one task.
 * So a descendant can detach the artifact in its layout effect, restore it, and
 * have the frame painted from a document the runtime is still vouching for --
 * with the observer's records still sitting in a queue nobody has read.
 *
 * As the LAST child of the provider's own output, this sentinel's layout effect
 * runs after every descendant's and before the provider's own hooks. It drains
 * those records and re-audits the admitted node; the provider's store check --
 * a parent layout effect, running immediately after this one -- sees the new
 * verdict and re-renders synchronously into the block. No frame in between.
 *
 * THE EXACT REACH OF THIS SENTINEL, because an overstated law is worse than a
 * narrow one. It runs in every commit the provider is PART OF: the mount, the
 * provider's own updates, a StrictMode replay. A descendant that updates its
 * own state commits without re-rendering the provider, and React runs only that
 * subtree's effects -- this sentinel is not in that commit and does not fire.
 * Nothing can change that; a component React did not render has no effect to
 * run.
 *
 * That case is not uncovered, it is covered by the other half of the mechanism
 * and one step later. The observer armed at mount is persistent and still
 * judging; its records arrive in a microtask, and the store change that follows
 * schedules React's sync lane in another. Both drain at the checkpoint that
 * ends the task, and the event loop reaches its rendering step only after that
 * checkpoint -- so the tampered frame still never paints. What the seal adds,
 * and adds only here, is that the verdict is settled BEFORE CONTROL RETURNS,
 * with no reliance on that ordering at all.
 */
export function RetainedArtifactSeal({
  claim,
}: {
  claim: PreparedTenantThemeArtifactClaim;
}): null {
  // Deliberately dependency-free: every commit is a fresh opportunity for a
  // descendant to have touched the artifact, so every commit is sealed.
  useLayoutEffect(() => { claim.seal(); });
  return null;
}
