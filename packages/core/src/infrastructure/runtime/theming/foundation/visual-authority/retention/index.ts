/**
 * Retained mount proof for admitted tenant theme artifacts.
 *
 * This module owns the per-document retention ledger, the MutationObserver
 * watches, the prepared claim API, and the diagnostics helpers. It imports from
 * admission only: the proof is one-way, retention -> admission, and admission
 * remains usable without loading any watcher code.
 */

import type { TenantThemeArtifact } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  auditRetainedTenantThemeArtifact,
  MOUNTED_ARTIFACT_SELECTOR,
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  verifyMountedTenantThemeArtifact,
} from "../admission";

/**
 * Name the disqualifying change a single record carries, if it carries one.
 *
 * Records are delivered in a batch, after the fact. Auditing the document at
 * delivery time therefore answers a different question from the one asked: it
 * reports the state the mutations settled into, not whether the admitted
 * element was ever displaced. A detach followed by a re-attach, or a rewrite
 * followed by a restore, settles into a pristine end state and would be
 * certified -- even though the paint diverged from the artifact for the whole
 * window in between.
 *
 * The artifact is immutable by contract: server-compiled bytes, mounted once.
 * So any record that reaches its content or removes it IS the divergence, and
 * is judged from the record itself rather than from what the DOM looks like
 * afterwards.
 */
const ARTIFACT_REMOVED = "the admitted artifact element was removed from the document";

function disqualifyingArtifactMutation(
  record: MutationRecord,
  element: Element,
): string | null {
  if (record.type === "characterData") {
    return element.contains(record.target)
      ? "the admitted artifact bytes were rewritten"
      : null;
  }
  if (record.type === "attributes") {
    if (record.target !== element) return null;
    const attribute = record.attributeName;
    // A same-value write still produces a record. Only a real change moves the
    // element's scope, and the filter already narrows this to the three proof
    // attributes.
    return attribute && record.oldValue !== element.getAttribute(attribute)
      ? "the admitted artifact scope attributes were changed"
      : null;
  }
  if (record.type !== "childList") return null;
  if (record.target === element || element.contains(record.target)) {
    return "the admitted artifact bytes were rewritten";
  }
  return Array.from(record.removedNodes).some(
    (node) => node === element || (node.contains?.(element) ?? false),
  )
    ? ARTIFACT_REMOVED
    : null;
}

function touchesArtifactProof(
  record: MutationRecord,
  element: Element,
): boolean {
  // `attributes` is filtered to the three artifact attributes, so any such
  // record is by construction relevant: it either re-labels the admitted
  // element or promotes some other node into the same tenant scope.
  if (record.type === "attributes") return true;
  if (element === record.target || element.contains(record.target)) return true;
  const carriesArtifact = (node: Node): boolean => {
    if (node.nodeType !== 1) return false;
    const candidate = node as Element;
    return (
      candidate.matches?.(MOUNTED_ARTIFACT_SELECTOR) === true ||
      candidate.querySelector?.(MOUNTED_ARTIFACT_SELECTOR) != null
    );
  };
  return (
    Array.from(record.addedNodes).some(carriesArtifact) ||
    Array.from(record.removedNodes).some(carriesArtifact)
  );
}

/**
 * The same watch, plus the one control a React commit needs.
 *
 * `MutationObserver` delivers its records in a microtask, and a commit does not
 * yield one: the mutation phase, every layout effect and the browser's paint
 * all happen on one task. A watch that can only hear from its own callback
 * therefore learns what a descendant did AFTER the frame that tampering
 * painted. `drain` takes the same verdict on the caller's stack, from the
 * records the observer is already holding, which is the whole difference
 * between a gate and a report.
 */
interface RetainedArtifactWatcher {
  /** Stop watching. */
  readonly release: () => void;
  /** Judge every pending record now, then re-audit the admitted node. */
  readonly drain: () => void;
}

const INERT_ARTIFACT_WATCHER: RetainedArtifactWatcher = Object.freeze({
  release: () => {},
  drain: () => {},
});

function watchMountedTenantThemeArtifact(
  artifact: TenantThemeArtifact,
  element: HTMLStyleElement | HTMLLinkElement,
  onRevoked: (conflict: string) => void,
  root: ParentNode | undefined,
): RetainedArtifactWatcher {
  if (!root) {
    onRevoked("no document root is available to retain the mounted artifact");
    return INERT_ARTIFACT_WATCHER;
  }
  if (typeof MutationObserver === "undefined") {
    // An unretainable proof is not a retained proof. Fail closed rather than
    // let the admission stand unwatched for the life of the tree.
    onRevoked(
      "the mounted artifact cannot be retained: MutationObserver is unavailable",
    );
    return INERT_ARTIFACT_WATCHER;
  }

  let revoked = false;
  const revoke = (reason: string): void => {
    if (revoked) return;
    revoked = true;
    observer.disconnect();
    onRevoked(`the mounted artifact was revoked: ${reason}`);
  };

  const judge = (records: readonly MutationRecord[]): void => {
    if (revoked) return;
    for (const record of records) {
      const disqualified = disqualifyingArtifactMutation(record, element);
      if (!disqualified) continue;
      if (disqualified === ARTIFACT_REMOVED) {
        // A removal that leaves another element holding the scope is a
        // takeover, and saying so is worth the one extra look at the DOM.
        const settled = verifyMountedTenantThemeArtifact(artifact, root);
        if (settled.ok && settled.element !== element) {
          revoke("the admitted artifact element was replaced after admission");
          return;
        }
      }
      revoke(disqualified);
      return;
    }
    if (!records.some((record) => touchesArtifactProof(record, element))) return;
    // Changes elsewhere in the document cannot be judged from a record alone --
    // a node appearing in the same tenant scope only breaks uniqueness if it is
    // still there. Those are settled by re-auditing the end state.
    const failure = auditRetainedTenantThemeArtifact(artifact, element, root);
    if (failure) revoke(failure);
  };

  const observer = new MutationObserver(judge);

  observer.observe(root as Node, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [
      TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
      TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
      TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
    ],
  });

  // The DOM can have moved between admission and this call. Audit once now so
  // the watch never starts by certifying a mount that is already gone.
  const initial = auditRetainedTenantThemeArtifact(artifact, element, root);
  if (initial) revoke(initial);

  return {
    release: () => {
      revoked = true;
      observer.disconnect();
    },
    drain: () => {
      if (revoked) return;
      judge(observer.takeRecords());
      if (revoked) return;
      // Records name what was DONE; this names what IS. The two answer
      // different questions and the seal owes the caller both: a displacement
      // that produced no record this watch can attribute -- one that happened
      // between admission and arming, or through a root this observer does not
      // cover -- is still a paint that diverged from the artifact.
      const failure = auditRetainedTenantThemeArtifact(artifact, element, root);
      if (failure) revoke(failure);
    },
  };
}

/**
 * Keep an admitted mount under proof for as long as the declaration is live.
 *
 * `resolveVisualAuthority` proves that the exact artifact bytes are mounted at
 * the moment it runs, and then the tree renders for as long as the application
 * lives. Everything a client can do to that element afterwards -- remove it,
 * rewrite its bytes, relabel its scope attributes, mount a second element into
 * the same tenant scope, or swap the node out from under the admission -- moves
 * the real paint away from the artifact the runtime is still claiming. Each of
 * those revokes here, and the caller must block on revocation exactly as it
 * blocks on a failed admission.
 *
 * SCOPE, stated honestly. This proves that the ADMITTED NODE stays present,
 * unique in its tenant scope, and byte-exact. It does not, and cannot, prove
 * that no other stylesheet in the document paints over it -- any script that
 * can reach the DOM can append `!important` rules the DS never sees, and no
 * runtime check can prevent that. One narrower residual is in the same class:
 * a CSSOM write (`element.sheet.insertRule`) changes the rendered rules without
 * touching the node's text and fires no mutation record, so it is invisible to
 * this watch. Both are properties of the platform, not gaps this function
 * silently ignores.
 */
export function retainMountedTenantThemeArtifact(
  artifact: TenantThemeArtifact,
  element: HTMLStyleElement | HTMLLinkElement,
  onRevoked: (conflict: string) => void,
  root: ParentNode | undefined =
    typeof document === "undefined" ? undefined : document,
): () => void {
  return watchMountedTenantThemeArtifact(artifact, element, onRevoked, root)
    .release;
}

/**
 * A live watch over one artifact identity in one document.
 *
 * The retention above is per-call: one observer and one revoked flag per
 * caller. That is the wrong shape for a React tree, for two reasons.
 *
 * ARMING ORDER. A sentinel component commits the prepared claim from its
 * useInsertionEffect, before descendant insertion/layout effects run; the
 * claim belongs to that subscriber, while the ledger and observer are shared
 * by the Document, and revocation survives an individual admission.
 *
 * REVOCATION LIFETIME. A revocation stored in component state lives exactly as
 * long as the admission object it was keyed to. Applications declare the
 * artifact inline, so that is one render. The next render re-resolves, and a
 * re-resolve is not a re-proof of the thing that failed: it re-runs precisely
 * the observation a takeover already satisfies -- one byte-exact element with
 * the right scope attributes -- and admits the replacement. Node identity is
 * the only evidence separating the admitted element from an identical
 * impostor, and once broken it cannot be rebuilt by observing harder. So the
 * verdict outlives the admission: an identity revoked in a document stays
 * revoked there.
 *
 * A clean release and remount of the same compiled artifact is readmitted; the
 * watch is per-identity, not per-node, and a voluntary teardown leaves no
 * sticky verdict. Only a revocation stays blocked for the life of the document.
 */
export interface RetainedArtifactWatchHandle {
  /** The revocation reason, or null. Safe to read during render. */
  readonly revocation: () => string | null;
  /** Subscribe and retain; the returned function unsubscribes and releases. */
  readonly subscribe: (onRevocationChange: () => void) => () => void;
  /**
   * Settle every pending verdict now, before the caller's frame paints.
   *
   * A no-op on a watch nobody has armed -- a seal is a demand for the current
   * verdict, never permission to start watching.
   */
  readonly seal: () => void;
}

interface RetainedArtifactWatch {
  readonly artifact: TenantThemeArtifact;
  readonly element: HTMLStyleElement | HTMLLinkElement;
  readonly root: ParentNode;
  readonly handle: RetainedArtifactWatchHandle;
  /** The subscriber set IS the reference count; there is no second tally. */
  readonly subscribers: Set<() => void>;
  revoked: string | null;
  watcher: RetainedArtifactWatcher | null;
  releaseScheduled: boolean;
}

const RETENTION_LEDGERS = new WeakMap<
  ParentNode,
  Map<string, RetainedArtifactWatch>
>();

function retainedArtifactIdentity(artifact: TenantThemeArtifact): string {
  return `${artifact.digest}|${artifact.slug}|${artifact.verticalKey}`;
}

/**
 * Arm the retained-artifact watch for this identity, or join the armed one.
 *
 * COMMIT PHASE ONLY. This is a side effect on a document, and idempotence does
 * not make it safe to perform during render: React discards renders, and the
 * ledger entry a discarded render creates is one no cleanup will ever reach.
 * React callers go through `prepareMountedTenantThemeArtifactClaim`, which
 * splits the read from the write. This stays exported for the ledger's own
 * drills and for a non-React host that owns its own commit boundary.
 *
 * Idempotent per (document, artifact identity): at most one watch per identity
 * can exist in a document, and it is exactly the watch the runtime wants alive.
 * The returned handle is stable for the life of the watch, so a caller whose
 * admission object churns every render still subscribes once.
 */
export function armMountedTenantThemeArtifact(
  artifact: TenantThemeArtifact,
  element: HTMLStyleElement | HTMLLinkElement,
  root: ParentNode | undefined =
    typeof document === "undefined" ? undefined : document,
): RetainedArtifactWatchHandle {
  if (!root) {
    const reason = "no document root is available to retain the mounted artifact";
    return {
      revocation: () => reason,
      subscribe: () => () => {},
      seal: () => {},
    };
  }

  const key = retainedArtifactIdentity(artifact);
  let ledger = RETENTION_LEDGERS.get(root);
  if (!ledger) {
    ledger = new Map();
    RETENTION_LEDGERS.set(root, ledger);
  }

  const existing = ledger.get(key);
  if (existing) {
    if (!existing.revoked && existing.element !== element) {
      // Two admissions of one identity resolved to two different nodes. Only a
      // replacement can produce that, and the watch is already the authority on
      // what replacement means.
      revokeRetainedArtifactWatch(
        existing,
        "the mounted artifact was revoked: the admitted artifact element was replaced after admission",
      );
    }
    // Arming is a live claim, so it re-arms a watch the last subscriber let go
    // rather than hand back a handle that is dormant until the next commit.
    joinRetainedArtifactWatch(existing, ledger, key);
    return existing.handle;
  }

  const scope = ledger;
  const watch: RetainedArtifactWatch = {
    artifact,
    element,
    root,
    subscribers: new Set(),
    revoked: null,
    watcher: null,
    releaseScheduled: false,
    handle: {
      revocation: () => watch.revoked,
      seal: () => {
        watch.watcher?.drain();
      },
      subscribe: (onRevocationChange) => {
        joinRetainedArtifactWatch(watch, scope, key);
        watch.subscribers.add(onRevocationChange);
        return () => {
          if (!watch.subscribers.delete(onRevocationChange)) return;
          if (watch.subscribers.size > 0 || watch.revoked) return;
          scheduleRetainedArtifactRelease(watch, scope, key);
        };
      },
    },
  };
  ledger.set(key, watch);
  armRetainedArtifactWatch(watch);

  return watch.handle;
}

function armRetainedArtifactWatch(watch: RetainedArtifactWatch): void {
  watch.watcher = watchMountedTenantThemeArtifact(
    watch.artifact,
    watch.element,
    (conflict) => revokeRetainedArtifactWatch(watch, conflict),
    watch.root,
  );
  // A synchronous revocation from the arming audit lands before the watcher
  // above is assigned, so reconcile once here rather than leave a live handle
  // on a disconnected observer.
  if (watch.revoked) {
    watch.watcher.release();
    watch.watcher = null;
  }
}

/**
 * Rejoin a watch, re-arming it if the last subscriber had already let it go.
 *
 * StrictMode replays subscriptions (subscribe -> unsubscribe -> resubscribe) and
 * `useSyncExternalStore` subscribes through an internal effect, so the drop to
 * zero subscribers is a normal development posture rather than a teardown. The
 * scheduled release below absorbs that case without ever disconnecting; this
 * covers the rest, where a host rejoins after the release actually ran -- a
 * hidden subtree being shown again, for instance.
 *
 * Re-arming re-audits, and that audit is bound to the node the admission named,
 * so anything that displaced the element while the watch was down is caught
 * here. What stays unobserved is a change made and undone inside the gap -- and
 * for the whole gap no subscriber was attached, which is to say no committed
 * consumer was reading this verdict.
 */
function joinRetainedArtifactWatch(
  watch: RetainedArtifactWatch,
  ledger: Map<string, RetainedArtifactWatch>,
  key: string,
): void {
  watch.releaseScheduled = false;
  if (watch.revoked || watch.watcher) return;
  const current = ledger.get(key);
  if (current && current !== watch) {
    // Another watch already holds this identity in this document. Reviving this
    // one beside it would put two proofs on one identity, and neither took the
    // evidence that would order them.
    revokeRetainedArtifactWatch(
      watch,
      "the mounted artifact was revoked: the retained proof was superseded while it was released",
    );
    return;
  }
  ledger.set(key, watch);
  armRetainedArtifactWatch(watch);
}

/**
 * Release one microtask later, so a resubscribe in the same tick cancels it.
 *
 * Tearing down at the instant the last subscriber leaves is what makes a
 * StrictMode replay fatal: the observer is gone and the rejoin lands on a dead
 * handle. Deferring costs nothing -- the watch is idle either way -- and the
 * cancellation is the whole point.
 */
function scheduleRetainedArtifactRelease(
  watch: RetainedArtifactWatch,
  ledger: Map<string, RetainedArtifactWatch>,
  key: string,
): void {
  if (watch.releaseScheduled) return;
  watch.releaseScheduled = true;
  queueMicrotask(() => {
    if (!watch.releaseScheduled) return;
    watch.releaseScheduled = false;
    if (watch.subscribers.size > 0 || watch.revoked) return;
    // Nothing is depending on this proof any more, and it never failed. Drop it
    // so a later mount arms a fresh watch on its own evidence.
    watch.watcher?.release();
    watch.watcher = null;
    if (ledger.get(key) === watch) ledger.delete(key);
  });
}

function revokeRetainedArtifactWatch(
  watch: RetainedArtifactWatch,
  conflict: string,
): void {
  if (watch.revoked) return;
  watch.revoked = conflict;
  watch.watcher?.release();
  watch.watcher = null;
  for (const notify of Array.from(watch.subscribers)) notify();
}

/**
 * Read this document's verdict on an artifact identity WITHOUT arming it.
 *
 * Render must be able to see a sticky revocation -- that is the whole point of
 * stickiness -- and render must not have side effects. Those are only in
 * tension if reading and arming are the same act, so they are not: this looks
 * the identity up in the ledger and touches nothing.
 */
function peekRetainedArtifactRevocation(
  root: ParentNode,
  artifact: TenantThemeArtifact,
): string | null {
  return (
    RETENTION_LEDGERS.get(root)?.get(retainedArtifactIdentity(artifact))
      ?.revoked ?? null
  );
}

/**
 * A claim on an admitted mount, prepared during render and owned by a commit.
 *
 * The arm has to happen before any descendant runs, which used to mean it
 * happened during the provider's render -- and a render is not an event that
 * happened. React discards renders: a sibling throws, a child suspends, a
 * concurrent pass is superseded. Each of those leaves an armed observer and a
 * ledger entry that no commit will ever release, and because a revocation is
 * deliberately permanent, one abandoned render can poison an identity for the
 * life of the document. That is a self-inflicted denial of the very artifact
 * the gate exists to protect.
 *
 * So render prepares and commits arm. Preparing is pure -- it captures the
 * artifact, the node the admission named, and the document, and reads the
 * standing verdict -- while `commit` performs the single side effect, from an
 * insertion effect, which React runs during the mutation phase: after the DOM
 * is in place, before every descendant's insertion and layout effect, and
 * before paint. A discarded render never reaches it and so leaves nothing
 * behind; a real commit owns a release that is guaranteed to run.
 *
 * `seal` is the other half of the same clock. Effects and paint share one task,
 * so the observer's microtask has not run when the frame goes out; the last
 * thing in the tree drains it, and the provider's own store check -- a parent's
 * layout effect, after every child's -- turns that verdict into a synchronous
 * re-render before anything is shown.
 */
export interface PreparedTenantThemeArtifactClaim {
  /** The standing verdict for this identity. Safe to read during render. */
  readonly revocation: () => string | null;
  /** Subscribe to verdict changes. Pure: it neither arms nor releases. */
  readonly subscribe: (onRevocationChange: () => void) => () => void;
  /** Arm and join the document watch. Returns the release for THIS claim. */
  readonly commit: () => () => void;
  /** Settle the committed claim's pending verdict before paint. */
  readonly seal: () => void;
}

export function prepareMountedTenantThemeArtifactClaim(
  artifact: TenantThemeArtifact,
  element: HTMLStyleElement | HTMLLinkElement,
  root: ParentNode | undefined =
    typeof document === "undefined" ? undefined : document,
): PreparedTenantThemeArtifactClaim {
  if (!root) {
    const reason = "no document root is available to retain the mounted artifact";
    return {
      revocation: () => reason,
      subscribe: () => () => {},
      commit: () => () => {},
      seal: () => {},
    };
  }

  const scope = root;
  const listeners = new Set<() => void>();
  const notify = (): void => {
    for (const listener of Array.from(listeners)) listener();
  };
  let committed: RetainedArtifactWatchHandle | null = null;

  return {
    revocation: () =>
      committed?.revocation() ?? peekRetainedArtifactRevocation(scope, artifact),
    subscribe: (onRevocationChange) => {
      listeners.add(onRevocationChange);
      return () => {
        listeners.delete(onRevocationChange);
      };
    },
    commit: () => {
      const handle = armMountedTenantThemeArtifact(artifact, element, scope);
      committed = handle;
      const leave = handle.subscribe(notify);
      // Only a claim that got here releases anything. A prepared-and-discarded
      // claim has no cleanup to run because it never took a hold to give back.
      return () => {
        if (committed === handle) committed = null;
        leave();
      };
    },
    seal: () => {
      committed?.seal();
    },
  };
}

let hasReportedConflict = false;

/**
 * Reset the once-per-process conflict report and the ambient document's
 * retention ledger.
 *
 * A revoked identity is deliberately permanent for the life of a document, so
 * a suite that reuses one document needs a way back to a clean slate between
 * cases. Only the ambient document is cleared: a caller that armed a watch on
 * a detached root holds that root itself and its ledger dies with it.
 */
export function resetVisualAuthorityDiagnostics(): void {
  hasReportedConflict = false;
  if (typeof document === "undefined") return;
  const ledger = RETENTION_LEDGERS.get(document);
  if (!ledger) return;
  for (const watch of ledger.values()) {
    watch.watcher?.release();
    watch.watcher = null;
    watch.releaseScheduled = false;
  }
  ledger.clear();
}

export function reportVisualAuthorityConflict(
  conflict: string,
  environment: string | undefined = process.env.NODE_ENV,
): void {
  if (environment === "development") throw new Error(`[design-system] ${conflict}`);
  if (hasReportedConflict) return;
  hasReportedConflict = true;
  console.error(`[design-system] ${conflict}`);
}
