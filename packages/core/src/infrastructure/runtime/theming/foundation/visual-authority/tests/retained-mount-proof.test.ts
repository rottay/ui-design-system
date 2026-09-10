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
  verifyMountedTenantThemeArtifact,
} from '..';
import type { PreparedTenantThemeArtifactClaim } from '..';
import { clearTenantThemeScope, stampTenantThemeScope } from './mount-fixture';

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
  stampTenantThemeScope(artifact);
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
    // The scope drills below move `<html>`, and every suite in this file shares
    // one document: a leaked stamp or a leaked style is a second mount for the
    // next describe.
    document.head.innerHTML = '';
    clearTenantThemeScope();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-density');
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

  /**
   * The scope half of the admission, re-asked.
   *
   * Admission proves two things: these are the artifact's exact bytes, and the
   * document root carries the selector those bytes are nested under. A retained
   * proof that re-asked only the first was strictly weaker than the admission
   * it held open -- stripping `data-ds-root` leaves every byte pristine and
   * stops the whole artifact from painting, and the audit still answered
   * `null`.
   */
  it('revokes when the document root loses the artifact scope', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    document.documentElement.removeAttribute('data-ds-root');
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(
      /the document root no longer carries the admitted artifact scope/,
    );
    expect(auditRetainedTenantThemeArtifact(ARTIFACT, style)).toMatch(
      /the document root does not carry data-ds-root/,
    );
  });

  it('revokes when the root is relabelled into another tenant', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    document.documentElement.setAttribute('data-tenant', 'someone-else');
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(
      /the document root no longer carries the admitted artifact scope/,
    );
  });

  it('revokes a scope removal that is undone before the records are delivered', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    // The document painted unscoped for the whole window in between, which is
    // the same reason a byte rewrite is judged from the record and not from
    // the state it settles into.
    document.documentElement.removeAttribute('data-vertical');
    document.documentElement.setAttribute('data-vertical', ARTIFACT.verticalKey);
    await settle();

    expect(revocations).toHaveLength(1);
  });

  it('does not revoke when a scope attribute is rewritten to the value it had', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    document.documentElement.setAttribute('data-tenant', ARTIFACT.slug);
    await settle();

    expect(revocations).toEqual([]);
  });

  it('does not revoke when an unrelated root attribute changes', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-density', 'compact');
    await settle();

    expect(revocations).toEqual([]);
  });

  it('revokes immediately when the scope is already gone at watch time', () => {
    const style = mountArtifact();
    document.documentElement.removeAttribute('data-ds-root');
    const revocations = retain(style);

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/the document root does not carry data-ds-root/);
  });

  /**
   * A VALID REWRITE IS NOT A LOSS.
   *
   * The root marker is judged by presence -- `:where([data-ds-root])` -- so
   * `""` and `"true"` are the same scope and the artifact never stopped
   * painting. The watch used to compare the record's raw old value against the
   * current one, which treats a presence-only marker like the two
   * value-sensitive ones and revoked, permanently, a document that was in
   * scope for the whole window. Nothing about a re-stamp is tampering.
   */
  it('stays silent when the root marker is rewritten to another valid value', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    document.documentElement.setAttribute('data-ds-root', 'true');
    await settle();

    expect(revocations).toEqual([]);
    expect(auditRetainedTenantThemeArtifact(ARTIFACT, style)).toBeNull();
  });

  it('stays silent when a churned root marker is restored to a valid value', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    // Two writes, both landing on a value the selector matches: the presence
    // the artifact depends on was never absent between them.
    document.documentElement.setAttribute('data-ds-root', 'true');
    document.documentElement.setAttribute('data-ds-root', '');
    await settle();

    expect(revocations).toEqual([]);
  });

  /**
   * The other direction of the same law, so the silence above is not silence
   * about everything. Losing the marker between two valid values is a window
   * in which the document painted unscoped, and the end state hides it.
   */
  it('still revokes a root marker removed between two valid values', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    document.documentElement.removeAttribute('data-ds-root');
    document.documentElement.setAttribute('data-ds-root', 'true');
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/does not carry data-ds-root/);
  });

  it('still revokes a tenant marker corrupted and restored in one batch', async () => {
    const style = mountArtifact();
    const revocations = retain(style);

    document.documentElement.setAttribute('data-tenant', 'someone-else');
    document.documentElement.setAttribute('data-tenant', ARTIFACT.slug);
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/carries data-tenant="someone-else"/);
  });
});

/**
 * A SUPPLIED CONTAINER IS NOT THE SCOPE.
 *
 * `tenantThemeArtifactScopeElement` resolves any search root to its document's
 * root element, because that is where every artifact selector is evaluated. A
 * watch armed on a container therefore has its scope OUTSIDE the subtree it
 * observes: stripping `data-ds-root` from `<html>` stops every rule in the
 * artifact from matching and produced no record this watch could hear. The
 * loss surfaced only if some later commit happened to seal and re-audit the
 * end state -- which is a report, not a gate, and on a tree that never seals
 * it is not even a report.
 *
 * Rejecting the container root at admission was the alternative and was not
 * taken: admission accepts it today, the mount fixture and any host with its
 * own render root rely on it, and the resolver's answer is CORRECT -- the
 * scope really is the document root. The gap was never the root form, only
 * which nodes the observer was attached to. So retention now watches the
 * resolved scope element in its own right whenever the supplied root does not
 * already contain it, and the verdict is continuous rather than deferred.
 *
 * A container that is not IN the document is the one form that is refused, and
 * for the opposite reason: there the resolver's answer would be wrong. The
 * bytes are not in any stylesheet the document consults, so nothing they
 * declare paints -- while the scope half of the proof would be answered by the
 * real `documentElement`, which they are not attached to. That pair certifies
 * a paint that does not exist.
 */
describe('retained proof armed on a container', () => {
  let stop: (() => void) | null = null;

  afterEach(() => {
    stop?.();
    stop = null;
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    clearTenantThemeScope();
  });

  function mountInContainer(): { container: HTMLElement; style: HTMLStyleElement } {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const style = document.createElement('style');
    style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, ARTIFACT.digest);
    style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, ARTIFACT.slug);
    style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, ARTIFACT.verticalKey);
    style.textContent = ARTIFACT.css;
    container.appendChild(style);
    stampTenantThemeScope(ARTIFACT);
    return { container, style };
  }

  function retainIn(container: ParentNode, style: HTMLStyleElement): string[] {
    const revocations: string[] = [];
    stop = retainMountedTenantThemeArtifact(
      ARTIFACT,
      style,
      (conflict) => revocations.push(conflict),
      container,
    );
    return revocations;
  }

  it('admits a container root whose scope resolves to the document root', () => {
    const { container, style } = mountInContainer();

    expect(retainIn(container, style)).toEqual([]);
    expect(auditRetainedTenantThemeArtifact(ARTIFACT, style, container)).toBeNull();
  });

  it('revokes an html scope loss it cannot see inside the container', async () => {
    const { container, style } = mountInContainer();
    const revocations = retainIn(container, style);

    // Nothing inside the container moved. The only mutation is on `<html>`,
    // outside the observed subtree -- which is exactly the case that used to
    // pass unheard.
    document.documentElement.removeAttribute('data-ds-root');
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(
      /the document root no longer carries the admitted artifact scope/,
    );
  });

  it('revokes an html tenant relabel from the observer, not from a seal', async () => {
    const { container, style } = mountInContainer();
    const revocations = retainIn(container, style);

    document.documentElement.setAttribute('data-tenant', 'someone-else');
    await settle();

    expect(revocations).toHaveLength(1);
  });

  it('refuses a byte-perfect mount whose container is not in the document', () => {
    const { container, style } = mountInContainer();
    container.remove();

    const mounted = verifyMountedTenantThemeArtifact(ARTIFACT, container);

    expect(mounted.ok).toBe(false);
    expect(mounted.ok === false && mounted.error).toMatch(
      /not attached to the document/,
    );
    // The retained audit and a fresh arming answer the same way: a detached
    // mount is not a weaker proof, it is no proof.
    expect(auditRetainedTenantThemeArtifact(ARTIFACT, style, container)).toMatch(
      /not attached to the document/,
    );
    expect(retainIn(container, style)).toHaveLength(1);
  });

  it('revokes when the container leaves the document after admission', async () => {
    const { container, style } = mountInContainer();
    const revocations = retainIn(container, style);

    // Nothing inside the container moved, and `<html>` still carries the scope.
    // The container cannot hear its own removal -- that record belongs to its
    // parent -- so this is the case that stayed silently admitted.
    container.remove();
    await settle();

    expect(revocations).toHaveLength(1);
    expect(revocations[0]).toMatch(/removed from the document/);
  });

  it('stays silent for container churn and for a valid root re-stamp', async () => {
    const { container, style } = mountInContainer();
    const revocations = retainIn(container, style);

    container.appendChild(document.createElement('div'));
    document.documentElement.setAttribute('data-ds-root', 'true');
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
    clearTenantThemeScope();
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
    clearTenantThemeScope();
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

  /**
   * The reproduced defect, on the path that matters most.
   *
   * The seal is what a React commit consults before the frame paints. A scope
   * that disappears between admission and that seal used to survive it
   * untouched: `revocation()` answered null, the retained audit answered null,
   * and the provider therefore vouched for a live tree in which every rule of
   * the artifact had stopped matching.
   */
  it('reports a scope removed before the seal, on the caller stack', () => {
    const style = mountArtifact();
    const claim = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
    claim.commit();

    document.documentElement.removeAttribute('data-ds-root');

    // The observer has not reported yet: this is the seal's verdict.
    expect(claim.revocation()).toBeNull();

    claim.seal();
    expect(claim.revocation()).toMatch(
      /the document root no longer carries the admitted artifact scope/,
    );
  });

  /**
   * The end-state leg of the same law. A scope stripped BEFORE the watch was
   * armed produces no record this observer can attribute, so the seal's second
   * question -- what IS -- is the only one that can catch it.
   */
  it('reports a scope that was already gone when the claim was armed', () => {
    const style = mountArtifact();
    document.documentElement.removeAttribute('data-vertical');
    const claim = prepareMountedTenantThemeArtifactClaim(ARTIFACT, style);
    claim.commit();

    claim.seal();
    expect(claim.revocation()).toMatch(/the document root carries data-vertical/);
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
