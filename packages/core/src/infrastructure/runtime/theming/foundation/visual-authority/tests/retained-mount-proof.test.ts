// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  armMountedTenantThemeArtifact,
  auditRetainedTenantThemeArtifact,
  prepareMountedTenantThemeArtifactClaim,
  resetVisualAuthorityDiagnostics,
  retainMountedTenantThemeArtifact,
} from '..';
import type { PreparedTenantThemeArtifactClaim } from '..';

const ARTIFACT = compileTenantThemeConfig(
  hydrateTenantThemeConfig({
    schemaVersion: 1,
    mode: 'simple',
    appearance: {
      palette: { primary: '#2F6B9A', backgroundMode: 'dark' },
      density: 'compact',
      motion: { intensity: 0.4, durationScale: 0.9, ambient: 'off' },
    },
  }, {
    tenantId: 'tenant_themanagement',
    slug: 'themanagement',
    verticalKey: 'bithire',
    rowVersion: 7,
  }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
);

function mountArtifact(artifact: TenantThemeArtifact = ARTIFACT): HTMLStyleElement {
  const style = document.createElement('style');
  style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, artifact.digest);
  style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, artifact.slug);
  style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, artifact.verticalKey);
  style.textContent = artifact.css;
  document.head.appendChild(style);
  return style;
}

/**
 * A `MutationObserver` delivers its records in a microtask. Every drill has to
 * await that queue, or it would assert on a watch that has not yet run and
 * report a green for a revocation that never fired.
 */
async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('retained mount proof', () => {
  let stop: (() => void) | null = null;

  beforeEach(() => {
    document.head.innerHTML = '';
  });

  afterEach(() => {
    stop?.();
    stop = null;
    vi.restoreAllMocks();
  });

  function retain(element: HTMLStyleElement | HTMLLinkElement) {
    const revocations: string[] = [];
    stop = retainMountedTenantThemeArtifact(ARTIFACT, element, (conflict) => {
      revocations.push(conflict);
    });
    return revocations;
  }

  it('stays silent while the admitted element is untouched', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    // Unrelated DOM churn -- the shape of any live application -- must not
    // revoke, or the watch is a denial of service on its own host.
    document.body.appendChild(document.createElement('div'));
    document.head.appendChild(document.createElement('style'));
    document.body.setAttribute('data-tenant', 'themanagement');
    await settle();

    expect(revocations).toEqual([]);
    expect(auditRetainedTenantThemeArtifact(ARTIFACT, style)).toBeNull();
  });

  it('revokes when a client removes the admitted element', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    style.remove();
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/the admitted artifact element was removed from the document/);
  });

  it('revokes when a client rewrites the admitted bytes', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    style.textContent = `${ARTIFACT.css}\n:root{--ds-color-primary:#ff0000}\n`;
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/the admitted artifact bytes were rewritten/);
  });

  it('revokes on a byte rewrite that goes through the text node, not the element', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    // `textContent =` replaces the child; writing `.data` mutates it in place
    // and only ever produces a characterData record.
    (style.firstChild as Text).data = ARTIFACT.css.replace('#', '@');
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/the admitted artifact bytes were rewritten/);
  });

  /**
   * Records arrive after the fact and in a batch, so the DOM the watch can
   * inspect when it wakes up is the state the mutations settled into -- not the
   * state they passed through. These two drills are the whole reason the
   * verdict is taken from the record: both end in a document that audits
   * perfectly clean, and in both the artifact stopped painting for a window
   * the runtime was still vouching for.
   */
  it('revokes a detach that is undone before the records are delivered', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    const parent = style.parentNode;
    const next = style.nextSibling;
    style.remove();
    parent?.insertBefore(style, next);
    await settle();

    expect(auditRetainedTenantThemeArtifact(ARTIFACT, style)).toBeNull();
    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/the admitted artifact element was removed from the document/);
  });

  it('revokes a byte rewrite that is undone before the records are delivered', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    style.textContent = ':root{--ds-color-primary:#ff0000}';
    style.textContent = ARTIFACT.css;
    await settle();

    expect(auditRetainedTenantThemeArtifact(ARTIFACT, style)).toBeNull();
    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/the admitted artifact bytes were rewritten/);
  });

  it('does not revoke when a proof attribute is rewritten to the value it had', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    // Frameworks re-apply attributes they own. A write that changes nothing
    // still produces a record, and must not be read as a scope change.
    style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, ARTIFACT.slug);
    await settle();

    expect(revocations).toEqual([]);
  });

  it('revokes when a second element claims the same tenant scope', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    mountArtifact({ ...ARTIFACT, digest: `sha256-${'0'.repeat(64)}` });
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/expected exactly one mounted artifact element, found 2/);
  });

  it('revokes when a foreign element is relabelled into the tenant scope', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    // No node is added or removed: an element already in the document simply
    // acquires the three artifact attributes.
    const squatter = document.createElement('style');
    squatter.textContent = ARTIFACT.css;
    document.head.appendChild(squatter);
    await settle();
    expect(revocations).toEqual([]);

    squatter.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, ARTIFACT.slug);
    squatter.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, ARTIFACT.verticalKey);
    squatter.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, ARTIFACT.digest);
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/found 2/);
  });

  it('revokes when the admitted element is relabelled out of its own scope', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, `sha256-${'0'.repeat(64)}`);
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/the admitted artifact scope attributes were changed/);
  });

  it('revokes a takeover by a byte-identical impostor node', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    // Every observable property matches, so re-verification alone would pass.
    // The proof was taken on a specific node, and this is not that node.
    style.remove();
    const impostor = mountArtifact();
    await settle();

    expect(impostor.textContent).toBe(ARTIFACT.css);
    expect(revocations).toEqual([
      'the mounted artifact was revoked: the admitted artifact element was replaced after admission',
    ]);
  });

  it('revokes at most once and stops watching after the first revocation', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    style.remove();
    await settle();
    document.head.appendChild(style);
    style.textContent = 'anything';
    style.remove();
    await settle();

    expect(revocations).toHaveLength(1);
  });

  it('revokes immediately when the mount is already gone at watch time', () => {
    const style = mountArtifact();
    style.remove();
    const revocations = retain(style);

    // No microtask: an admission that has already lapsed must never be
    // certified for even one frame.
    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/found 0/);
  });

  it('fails closed when the mount cannot be watched at all', () => {
    const style = mountArtifact();
    const observer = globalThis.MutationObserver;
    try {
      // @ts-expect-error -- deleting a global to model a host without the API.
      delete globalThis.MutationObserver;
      const revocations: string[] = [];
      const release = retainMountedTenantThemeArtifact(
        ARTIFACT,
        style,
        (conflict) => revocations.push(conflict),
      );
      release();
      expect(revocations).toEqual([
        'the mounted artifact cannot be retained: MutationObserver is unavailable',
      ]);
    } finally {
      globalThis.MutationObserver = observer;
    }
  });

  it('stops revoking once the caller releases the watch', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    stop?.();
    stop = null;
    style.remove();
    await settle();

    expect(revocations).toEqual([]);
  });
});

/**
 * The document-scoped layer. Its two properties are the ones a React tree
 * cannot get from a per-call watch: one watch per artifact identity in a
 * document, armed from wherever the first caller happens to be, and a verdict
 * that outlives every admission object that ever pointed at it.
 */
describe('armed artifact watch', () => {
  afterEach(() => {
    resetVisualAuthorityDiagnostics();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('returns one stable handle for one identity in one document', () => {
    const style = mountArtifact();

    const first = armMountedTenantThemeArtifact(ARTIFACT, style);
    const second = armMountedTenantThemeArtifact({ ...ARTIFACT }, style);

    // The admission object is fresh on every resolve; the watch is not. A new
    // handle per call would make every re-render resubscribe, which tears the
    // observer down and back up with the artifact unwatched in between.
    expect(second).toBe(first);
    expect(first.revocation()).toBeNull();
  });

  it('keeps the verdict after every subscriber has released', async () => {
    const style = mountArtifact();
    const handle = armMountedTenantThemeArtifact(ARTIFACT, style);
    const release = handle.subscribe(() => {});

    style.remove();
    await settle();
    expect(handle.revocation()).toMatch(/removed from the document/);

    release();
    // The release is deferred, so re-arming in the same tick would prove only
    // that the ledger had not been touched yet. Let it run: the point is that a
    // watch which FAILED is not dropped even once nothing depends on it, so a
    // re-mount of the same bytes cannot buy a clean verdict by outliving its
    // subscribers.
    await settle();

    mountArtifact();
    expect(armMountedTenantThemeArtifact(ARTIFACT, document.querySelector('style')!).revocation())
      .toMatch(/removed from the document/);
  });

  it('re-arms a clean identity once nothing depends on it any more', async () => {
    const style = mountArtifact();
    const handle = armMountedTenantThemeArtifact(ARTIFACT, style);
    const release = handle.subscribe(() => {});

    release();
    await settle();

    // Nothing failed, so the ledger keeps no opinion: the next mount is proved
    // again on its own evidence rather than inheriting a stale pass.
    const rearmed = armMountedTenantThemeArtifact(ARTIFACT, style);
    expect(rearmed).not.toBe(handle);
    expect(rearmed.revocation()).toBeNull();
  });

  /**
   * The development posture, not an exotic one. React replays subscriptions
   * under StrictMode -- subscribe, unsubscribe, subscribe -- all inside one
   * commit, and `useSyncExternalStore` subscribes through an internal effect, so
   * the runtime never gets to opt out of the replay. A watch that tears itself
   * down the instant its last subscriber leaves comes back dead: the observer is
   * disconnected, the rejoin lands on the same handle, and nothing is watching
   * the artifact for the life of the tree.
   */
  it('keeps watching through a subscribe replay in the same tick', async () => {
    const style = mountArtifact();
    const handle = armMountedTenantThemeArtifact(ARTIFACT, style);

    const first = handle.subscribe(() => {});
    first();
    handle.subscribe(() => {});

    style.remove();
    await settle();

    expect(handle.revocation()).toMatch(/removed from the document/);
  });

  /**
   * Why the release is deferred rather than merely repaired on rejoin. Re-arming
   * re-audits, and an audit reads the settled DOM -- so a change made and undone
   * inside the replay window is certified pristine by a watch that stopped and
   * restarted, and caught by one that never stopped.
   */
  it('sees a change made and undone between an unsubscribe and a resubscribe', async () => {
    const style = mountArtifact();
    const handle = armMountedTenantThemeArtifact(ARTIFACT, style);
    const release = handle.subscribe(() => {});

    release();
    const parent = style.parentNode;
    const next = style.nextSibling;
    style.remove();
    parent?.insertBefore(style, next);
    handle.subscribe(() => {});
    await settle();

    expect(handle.revocation()).toMatch(/removed from the document/);
  });

  /**
   * The same rejoin, after the release actually ran. A host can hide a subtree
   * and show it again much later; re-arming re-audits against the node the
   * admission named, so the watch resumes on evidence rather than on trust.
   */
  it('re-arms and re-audits a released watch when it is rejoined', async () => {
    const style = mountArtifact();
    const handle = armMountedTenantThemeArtifact(ARTIFACT, style);
    const release = handle.subscribe(() => {});

    release();
    await settle();
    handle.subscribe(() => {});

    style.remove();
    await settle();

    expect(handle.revocation()).toMatch(/removed from the document/);
  });

  it('revokes on rejoin when the element was displaced while the watch was down', async () => {
    const style = mountArtifact();
    const handle = armMountedTenantThemeArtifact(ARTIFACT, style);
    const release = handle.subscribe(() => {});

    release();
    await settle();
    style.remove();
    mountArtifact();
    handle.subscribe(() => {});

    // The rejoin audit is bound to the admitted node, so a byte-identical
    // replacement standing in its place is named for what it is.
    expect(handle.revocation()).toMatch(/replaced after admission/);
  });

  it('refuses to revive a watch that was superseded while it was released', async () => {
    const style = mountArtifact();
    const stale = armMountedTenantThemeArtifact(ARTIFACT, style);
    const release = stale.subscribe(() => {});

    release();
    await settle();
    style.remove();
    const successor = armMountedTenantThemeArtifact(ARTIFACT, mountArtifact());
    expect(successor).not.toBe(stale);

    stale.subscribe(() => {});

    // Two live watches on one identity would each hold half the evidence, and
    // neither could order the other. The one that let go stays let go.
    expect(stale.revocation()).toMatch(/superseded while it was released/);
    expect(successor.revocation()).toBeNull();
  });

  it('revokes when a second admission of one identity resolves to another node', () => {
    const style = mountArtifact();
    const handle = armMountedTenantThemeArtifact(ARTIFACT, style);
    handle.subscribe(() => {});

    style.remove();
    const impostor = mountArtifact();
    expect(armMountedTenantThemeArtifact(ARTIFACT, impostor)).toBe(handle);
    expect(handle.revocation()).toMatch(/replaced after admission/);
  });

  it('notifies subscribers exactly once when the identity is revoked', async () => {
    const style = mountArtifact();
    const handle = armMountedTenantThemeArtifact(ARTIFACT, style);
    let notified = 0;
    handle.subscribe(() => { notified += 1; });

    style.remove();
    await settle();
    style.remove();
    await settle();

    expect(notified).toBe(1);
  });

  it('scopes the verdict to the identity that failed', async () => {
    const other = compileTenantThemeConfig(
      hydrateTenantThemeConfig({
        schemaVersion: 1,
        mode: 'simple',
        appearance: {
          palette: { primary: '#7A2F9A', backgroundMode: 'dark' },
          density: 'compact',
          motion: { intensity: 0.4, durationScale: 0.9, ambient: 'off' },
        },
      }, {
        tenantId: 'tenant_themanagement',
        slug: 'themanagement',
        verticalKey: 'bithire',
        rowVersion: 7,
      }),
      { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
    );

    const style = mountArtifact();
    const revoked = armMountedTenantThemeArtifact(ARTIFACT, style);
    revoked.subscribe(() => {});
    style.remove();
    await settle();
    expect(revoked.revocation()).not.toBeNull();

    const fresh = mountArtifact(other);
    expect(armMountedTenantThemeArtifact(other, fresh).revocation()).toBeNull();
  });
});

/**
 * The claim layer: the split between what a render may do and what only a
 * commit may do.
 *
 * Everything above is reachable from render if you are careless, and the ledger
 * is sticky by design -- so a watch armed by a render React later throws away
 * outlives the tree that armed it and keeps judging a document nobody in it is
 * part of. These drills fix the two halves in place: preparing writes nothing,
 * and the verdict a commit is entitled to is available on the commit's own
 * stack rather than a microtask later.
 */
describe('prepared artifact claim', () => {
  afterEach(() => {
    resetVisualAuthorityDiagnostics();
    document.head.innerHTML = '';
  });

  /**
   * Count observers rather than infer them. "Nothing was armed" is a claim
   * about a side effect, and the honest way to test a side effect is to watch
   * for it happening, not to look for its consequences and find none.
   */
  function armings(run: () => void): number {
    const real = globalThis.MutationObserver;
    let constructed = 0;
    class Counting extends real {
      constructor(callback: MutationCallback) {
        super(callback);
        constructed += 1;
      }
    }
    (globalThis as { MutationObserver: typeof MutationObserver }).MutationObserver =
      Counting as unknown as typeof MutationObserver;
    try {
      run();
    } finally {
      (globalThis as { MutationObserver: typeof MutationObserver }).MutationObserver = real;
    }
    return constructed;
  }

  it('arms nothing until the claim is committed', () => {
    const style = mountArtifact();
    let claim!: PreparedTenantThemeArtifactClaim;

    // Preparing is what a render does, and a render must be repeatable at no
    // cost: React invokes it twice under StrictMode and discards it entirely
    // whenever a sibling throws or a child suspends.
    expect(armings(() => {
      claim = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
      expect(claim.revocation()).toBeNull();
      claim.subscribe(() => {});
    })).toBe(0);

    expect(armings(() => { claim.commit(); })).toBe(1);
  });

  it('leaves no watch behind when a prepared claim is never committed', async () => {
    const style = mountArtifact();

    // The discarded render.
    prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);

    // Artifact churn a leaked watch would record as a takeover, permanently.
    style.remove();
    const successor = mountArtifact();
    await settle();

    const committed = prepareMountedTenantThemeArtifactClaim(ARTIFACT, successor);
    expect(committed.revocation()).toBeNull();
    committed.commit();
    expect(committed.revocation()).toBeNull();
  });

  it('is a no-op to seal a claim no commit ever took', () => {
    const style = mountArtifact();
    const claim = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);

    // A seal is a demand for the current verdict, never permission to start
    // watching -- otherwise the abandoned-render leak comes back through the
    // other door.
    expect(armings(() => { claim.seal(); })).toBe(0);
    expect(claim.revocation()).toBeNull();
  });

  /**
   * The whole reason the seal exists. A `MutationObserver` reports in a
   * microtask; a React commit yields none. The drill below never awaits, which
   * is the assertion: the verdict is available on the tamperer's own stack.
   */
  it('reaches the verdict synchronously, before the observer has reported', () => {
    const style = mountArtifact();
    const claim = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
    claim.commit();

    const parent = style.parentNode;
    const next = style.nextSibling;
    style.remove();
    parent?.insertBefore(style, next);

    // Proof that the observer genuinely has not run yet, so the pass below is
    // the seal's doing and not the callback's.
    expect(claim.revocation()).toBeNull();

    claim.seal();
    expect(claim.revocation()).toMatch(/removed from the document/);
  });

  /**
   * The negative control for the drill above, and the reason `drain` reads
   * `takeRecords()` rather than re-auditing and calling it a seal.
   *
   * Same instant, same document, opposite verdict: the tamper has been undone,
   * so the settled DOM holds one byte-exact element with the right scope
   * attributes and certifies a window it never saw. A seal built only on the
   * end state would return null here and the frame would paint.
   */
  it('cannot reach that verdict from the settled DOM alone', () => {
    const style = mountArtifact();
    const claim = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
    claim.commit();

    const parent = style.parentNode;
    const next = style.nextSibling;
    style.remove();
    parent?.insertBefore(style, next);

    expect(auditRetainedTenantThemeArtifact(ARTIFACT, style, document)).toBeNull();

    claim.seal();
    expect(claim.revocation()).toMatch(/removed from the document/);
  });

  it('answers a later claim with the standing verdict, without arming it', async () => {
    const style = mountArtifact();
    const first = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
    first.commit();

    style.remove();
    await settle();
    expect(first.revocation()).toMatch(/removed from the document/);

    const replacement = mountArtifact();
    let second!: PreparedTenantThemeArtifactClaim;
    // Render reads the sticky verdict; render still writes nothing.
    expect(armings(() => {
      second = prepareMountedTenantThemeArtifactClaim(ARTIFACT, replacement);
    })).toBe(0);
    expect(second.revocation()).toMatch(/removed from the document/);
  });

  it('releases exactly the hold its own commit took', async () => {
    const style = mountArtifact();
    const claim = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
    const release = claim.commit();

    release();
    await settle();

    // Nothing failed, so nothing is remembered: the next mount is proved again
    // on its own evidence rather than inheriting a pass or a defeat.
    const next = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
    expect(next.revocation()).toBeNull();
    expect(armings(() => { next.commit(); })).toBe(1);
  });

  /**
   * The seal reaches the verdict; the subscription is how a tree learns of it.
   * Both have to happen in the same turn, or the provider's store check -- the
   * layout effect immediately above the seal's -- would read a snapshot the
   * seal has already invalidated and let the frame through.
   */
  it('notifies its subscribers from the seal, in the same turn', () => {
    const style = mountArtifact();
    const claim = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
    const release = claim.commit();
    let notified = 0;
    const leave = claim.subscribe(() => { notified += 1; });

    style.remove();
    claim.seal();

    expect(notified).toBe(1);
    expect(claim.revocation()).not.toBeNull();
    leave();
    release();
  });

  /**
   * A seal that finds nothing wrong says nothing. The drain is not an audit the
   * gate can fail by running: an untouched artifact stays admitted no matter how
   * many commits pass over it, and every commit of every application that uses
   * this correctly is one of those.
   */
  it('stays silent when a sealed commit found no tampering', () => {
    const style = mountArtifact();
    const claim = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
    const release = claim.commit();

    document.head.appendChild(document.createElement('style'));
    claim.seal();
    claim.seal();

    expect(claim.revocation()).toBeNull();
    release();
  });

  /**
   * Cleanup releases the hold it took and nothing else. A verdict already
   * reached belongs to the document, not to the claim that happened to be
   * holding the identity when it was reached -- so letting go cannot launder it.
   */
  it('cannot clear a verdict by releasing the claim that saw it', async () => {
    const style = mountArtifact();
    const claim = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
    const release = claim.commit();

    style.remove();
    claim.seal();
    expect(claim.revocation()).not.toBeNull();

    release();
    await settle();

    const remounted = mountArtifact();
    expect(armMountedTenantThemeArtifact(ARTIFACT, remounted).revocation())
      .toMatch(/removed from the document/);
  });
});
