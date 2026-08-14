/**
 * The retained-artifact gate, as a two-phase barrier.
 *
 * Admission proves the exact artifact bytes are mounted at the instant the
 * provider resolves. Retention keeps that proof alive. Between those two acts
 * there is a window, and every drill here lives inside it.
 *
 * PHASE ORDER IS THE SUBJECT. React runs a child's layout effect BEFORE its
 * parent's layout effect, and every passive effect after that. So a watch armed
 * in the provider's own effect is armed after the whole subtree has already
 * mounted, run its layout effects, and had a free hand on the artifact element.
 * An audit taken at arming time cannot see a change that was made and undone
 * inside that window -- it only sees the restored end state and certifies it.
 * The gate must therefore arm BEFORE descendants exist, not after.
 *
 * PERSISTENCE IS THE SECOND SUBJECT. A revocation keyed to the resolved
 * admission object survives only until the next resolve. Applications pass the
 * declaration inline, so the next resolve is the next render -- and a re-resolve
 * re-runs exactly the observation a takeover already defeated: it finds one
 * byte-exact element carrying the right scope attributes and admits it, now
 * pointed at the attacker's node. The revocation has to outlive the admission
 * it revoked.
 */
import React, {
  StrictMode,
  Suspense,
  useInsertionEffect,
  useLayoutEffect,
} from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TenantAppearance, TenantConfig } from '@/foundation/contracts';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import { useTenantContext } from '@/infrastructure/runtime/tenant/composition/react/provider';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  emitTenantThemeArtifactForSsr,
  resetVisualAuthorityDiagnostics,
} from '@/infrastructure/runtime/theming';
import type { TenantThemeArtifactSsrEmissionReceipt } from '@/infrastructure/runtime/theming';
import { DesignSystemProvider } from '..';

/**
 * A server render with no DOM at all.
 *
 * This is not decoration. `renderToString` called with jsdom's document still
 * in scope sends the resolver down its CLIENT branch: it finds the artifact
 * mounted in the test's own document and admits it, so the drill proves the
 * mounted-bytes path a second time and never touches the receipt path it
 * claims to cover. A server has no document, and the only way to reach the
 * branch a real Node request takes is to not have one either.
 */
function withoutDocument<T>(run: () => T): T {
  const owner = globalThis as { document?: Document };
  const descriptor = Object.getOwnPropertyDescriptor(owner, 'document');
  Object.defineProperty(owner, 'document', {
    value: undefined,
    configurable: true,
    writable: true,
  });
  try {
    // Fail loudly rather than silently re-run the client drill: a defineProperty
    // that did not take would make every assertion below meaningless.
    if (typeof document !== 'undefined') {
      throw new Error('the DOM-less server drill could not remove the document global');
    }
    return run();
  } finally {
    if (descriptor) Object.defineProperty(owner, 'document', descriptor);
    else delete owner.document;
  }
}

/**
 * A drill with no harness holding React's clock.
 *
 * `act` is not a neutral observer and RTL's `render` is not the lane an
 * application runs on. `act` flushes PASSIVE effects before it returns, and the
 * sync lane collapses the scheduling that separates a commit from the passive
 * work it queued -- which is exactly the separation a barrier built out of
 * `useSyncExternalStore` alone would fall into. A drill that never leaves that
 * harness cannot fail the way production fails, so these turn the act
 * environment OFF and drive `createRoot` on the DEFAULT lane instead.
 */
async function withoutActEnvironment<T>(run: () => Promise<T>): Promise<T> {
  const owner = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previous = owner.IS_REACT_ACT_ENVIRONMENT;
  owner.IS_REACT_ACT_ENVIRONMENT = false;
  try {
    return await run();
  } finally {
    owner.IS_REACT_ACT_ENVIRONMENT = previous;
  }
}

/** Resolve in the rendering step -- the frame a tamper is racing. */
function nextFrame(): Promise<void> {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => { resolve(); });
  });
}

/** A one-shot signal a commit-phase effect raises and a drill awaits. */
function commitSignal(): { reached: Promise<void>; reach: () => void } {
  let reach!: () => void;
  const reached = new Promise<void>((resolve) => { reach = resolve; });
  return { reached, reach };
}

/** Detach the admitted element and put it straight back. */
function tamperAndRestore(): void {
  const style = document.querySelector<HTMLStyleElement>('.test-tenant-theme-artifact');
  if (!style) return;
  const parent = style.parentNode;
  const next = style.nextSibling;
  style.remove();
  parent?.insertBefore(style, next);
}

function isBlocked(container: HTMLElement): boolean {
  return container.querySelector('[data-testid="resolved-config"]') === null;
}

function compileArtifact(primary: string): TenantThemeArtifact {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig({
      schemaVersion: 1,
      mode: 'simple',
      appearance: {
        palette: { primary, backgroundMode: 'dark' },
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
}

const ARTIFACT = compileArtifact('#2F6B9A');
/** A genuinely different compiled artifact: a real recompile, a new digest. */
const RECOMPILED = compileArtifact('#7A2F9A');

function mountArtifact(artifact: TenantThemeArtifact = ARTIFACT): HTMLStyleElement {
  const style = document.createElement('style');
  style.className = 'test-tenant-theme-artifact';
  style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, artifact.digest);
  style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, artifact.slug);
  style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, artifact.verticalKey);
  style.textContent = artifact.css;
  document.head.appendChild(style);
  return style;
}

function tenantConfig(artifact: TenantThemeArtifact = ARTIFACT): TenantConfig {
  return {
    slug: artifact.slug,
    name: 'The Management',
    vertical: artifact.verticalKey,
    theme: 'dark',
    locale: 'en',
    plan: 'enterprise',
    features: ['feature-a'],
    branding: {
      companyName: 'The Management',
      logo: '/logo.svg',
      logoMark: '/mark.svg',
      favicon: '/favicon.ico',
    },
    appearance: artifact.normalizedAppearance as TenantAppearance,
  } as TenantConfig;
}

function ConfigProbe(): React.ReactElement {
  const { config } = useTenantContext();
  return <output data-testid="resolved-config">{config.slug}</output>;
}

/**
 * The application shape that makes the persistence question real: the
 * declaration is an inline literal, so every render is a fresh admission
 * object. Nothing here is exotic -- it is what a JSX callsite produces.
 */
function Tree({
  artifact = ARTIFACT,
  children = <ConfigProbe />,
  ssrReceipt,
}: {
  artifact?: TenantThemeArtifact;
  children?: React.ReactNode;
  /**
   * What a server hands the provider instead of a DOM. Ignored wherever a
   * document exists, so the same element is the client tree and the server
   * tree -- which is what makes the hydration drills below a fair comparison.
   */
  ssrReceipt?: TenantThemeArtifactSsrEmissionReceipt;
}): React.ReactElement {
  return (
    <DesignSystemProvider
      tenantConfig={tenantConfig(artifact)}
      vertical="bithire"
      forceEngine="modern"
      visualAuthority={{ authority: 'compiled-artifact', artifact, ssrReceipt }}
    >
      {children}
    </DesignSystemProvider>
  );
}

describe('DesignSystemProvider two-phase retained artifact gate', () => {
  beforeEach(() => {
    resetVisualAuthorityDiagnostics();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    resetVisualAuthorityDiagnostics();
    document.querySelectorAll('.test-tenant-theme-artifact').forEach((node) => node.remove());
    const root = document.documentElement;
    for (const attribute of ['data-tenant', 'data-theme', 'data-engine', 'data-density', 'data-vertical']) {
      root.removeAttribute(attribute);
    }
    root.classList.remove('dark');
    root.style.cssText = '';
  });

  /**
   * The child-layout-effect TOCTOU, in its only invisible form.
   *
   * A change that PERSISTS is caught by the audit the watch takes when it arms,
   * so it proves nothing about ordering. A change that is made and undone
   * inside the window is caught only by a watch that was already armed when it
   * happened. The child below detaches the admitted element, observes that the
   * document is unstyled, and puts it straight back -- the end state the late
   * audit inspects is pristine.
   */
  it('sees an artifact detached and restored inside a child layout effect', async () => {
    const witnessed: boolean[] = [];
    function DetachingChild(): React.ReactElement {
      useLayoutEffect(() => {
        const style = document.querySelector<HTMLStyleElement>('.test-tenant-theme-artifact');
        if (!style) return;
        const parent = style.parentNode;
        const next = style.nextSibling;
        style.remove();
        witnessed.push(document.querySelector('.test-tenant-theme-artifact') === null);
        parent?.insertBefore(style, next);
      }, []);
      return <ConfigProbe />;
    }

    mountArtifact();
    render(<Tree><DetachingChild /></Tree>);

    // The drill is only meaningful if the child actually got its window.
    expect(witnessed).toEqual([true]);

    // SYNCHRONOUS, and that is the assertion. `render` returns having flushed
    // React's own work and nothing else: the observer's records are still
    // sitting in a microtask queue this line has not yielded to. A gate that
    // needed `waitFor` here would be a gate that reported the tampering after
    // the frame it painted. The seal drains inside the commit, so the block is
    // already on screen by the time control comes back.
    expect(screen.queryByTestId('resolved-config')).toBeNull();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  it('sees an artifact rewritten and restored inside a child layout effect', () => {
    function RewritingChild(): React.ReactElement {
      useLayoutEffect(() => {
        const style = document.querySelector<HTMLStyleElement>('.test-tenant-theme-artifact');
        if (!style) return;
        style.textContent = ':root{--ds-color-primary:#ff0000}';
        style.textContent = ARTIFACT.css;
      }, []);
      return <ConfigProbe />;
    }

    mountArtifact();
    render(<Tree><RewritingChild /></Tree>);

    expect(screen.queryByTestId('resolved-config')).toBeNull();
  });

  /**
   * The same tamper one phase earlier. A descendant's INSERTION effect runs in
   * the mutation phase, alongside the arm rather than after it, so the ordering
   * that saves the gate here is sibling ordering: the arm is the provider's
   * first child, the tamperer is inside its second. Nothing about the seal
   * changes -- it is still the last thing to run -- but the window it has to
   * cover starts earlier, and a watch armed even one fiber later would miss
   * this entirely.
   */
  it('sees an artifact detached and restored inside a descendant insertion effect', () => {
    const witnessed: boolean[] = [];
    function TamperingChild(): React.ReactElement {
      useInsertionEffect(() => {
        const style = document.querySelector<HTMLStyleElement>('.test-tenant-theme-artifact');
        if (!style) return;
        const parent = style.parentNode;
        const next = style.nextSibling;
        style.remove();
        witnessed.push(document.querySelector('.test-tenant-theme-artifact') === null);
        parent?.insertBefore(style, next);
      }, []);
      return <ConfigProbe />;
    }

    mountArtifact();
    render(<Tree><TamperingChild /></Tree>);

    expect(witnessed).toEqual([true]);
    expect(screen.queryByTestId('resolved-config')).toBeNull();
  });

  /**
   * THE SAME TAMPER, ON THE LANE AN APPLICATION ACTUALLY MOUNTS ON.
   *
   * Every drill above runs inside RTL, which means the sync lane and an `act`
   * that flushes passive effects before it returns. That harness makes one
   * specific failure invisible: `useSyncExternalStore` installs its listener
   * from a PASSIVE effect, and on an initial default-lane commit React flushes
   * passive work in a LATER task -- after the frame this commit produced. A
   * gate whose only reader is that subscription would therefore have the seal
   * record a correct verdict into a store with no listener attached, and the
   * tampered frame would paint with the runtime still vouching for it. Under
   * `act` the passive flush happens first and the drill reports green.
   *
   * So this one owns its clock. The act environment is off, the root is a plain
   * `createRoot`, and nothing here flushes anything.
   *
   * THE DISCRIMINATOR IS THE COMMIT CHECKPOINT, not the frame. The microtask
   * queued from the child's layout effect runs at the end of the commit's own
   * task: after React has flushed the synchronous work the layout phase
   * scheduled, and before any task the scheduler holds -- which is where the
   * passive subscription lives. Blocked there means the provider's own layout
   * check settled it inside the commit. Remove that check and this assertion is
   * the one that goes red; the frame assertion below would still pass, because
   * in this environment the scheduler's task beats the animation frame.
   */
  it('blocks a child layout tamper inside the commit on the default lane, outside act', async () => {
    mountArtifact();
    const container = document.createElement('div');
    document.body.appendChild(container);

    const commit = commitSignal();
    let atCommitCheckpoint: { blocked: boolean; tenantClaimed: boolean } | null = null;
    function TamperingChild(): React.ReactElement {
      useLayoutEffect(() => {
        tamperAndRestore();
        queueMicrotask(() => {
          atCommitCheckpoint = {
            blocked: isBlocked(container),
            tenantClaimed: document.documentElement.hasAttribute('data-tenant'),
          };
          commit.reach();
        });
      }, []);
      return <ConfigProbe />;
    }

    const root = createRoot(container);
    let blockedAtFrame: boolean | null = null;
    try {
      await withoutActEnvironment(async () => {
        root.render(<Tree><TamperingChild /></Tree>);
        await commit.reached;
        await nextFrame();
        blockedAtFrame = isBlocked(container);
      });
    } finally {
      await withoutActEnvironment(async () => { root.unmount(); });
      container.remove();
    }

    expect(atCommitCheckpoint).toEqual({ blocked: true, tenantClaimed: false });
    expect(blockedAtFrame).toBe(true);
  });

  /**
   * THE HONEST EDGE OF THE SEAL, stated as a drill rather than as prose.
   *
   * The seal is the provider's own last child, so it runs in every commit the
   * provider is PART OF -- the mount, its own updates, a StrictMode replay. A
   * descendant that updates its own state commits without re-rendering the
   * provider, and React runs only that subtree's effects: insertion, then
   * layout, then done. The seal is not in that commit and does not re-run. No
   * arrangement of sentinels can change that; a component React did not render
   * has no effect to fire.
   *
   * So this case is covered by the other half of the mechanism, and it is worth
   * being exact about which half. The observer armed at mount is PERSISTENT: it
   * is still watching, and it still judges. Its records are delivered in a
   * microtask, and the store change it raises schedules React's sync lane in
   * another microtask. Both drain at the checkpoint that ends the task -- and
   * the browser's rendering step comes after that checkpoint, not before it.
   * The frame the tampering wanted still never paints.
   *
   * What is NOT true here, and is asserted below so nobody has to guess: the
   * verdict is not settled by the time the update returns. That property
   * belongs to commits the provider is in.
   */
  it('blocks a descendant-only update through the persistent observer, before the frame', async () => {
    let tamper: (() => void) | null = null;
    function LocalUpdater(): React.ReactElement {
      const [tampered, setTampered] = React.useState(false);
      tamper = () => setTampered(true);
      useLayoutEffect(() => {
        if (!tampered) return;
        const style = document.querySelector<HTMLStyleElement>('.test-tenant-theme-artifact');
        if (!style) return;
        const parent = style.parentNode;
        const next = style.nextSibling;
        style.remove();
        parent?.insertBefore(style, next);
      }, [tampered]);
      return <ConfigProbe />;
    }

    mountArtifact();
    const providerCommits: number[] = [];
    function CountingProbe(): React.ReactElement {
      providerCommits.push(1);
      return <LocalUpdater />;
    }
    render(<Tree><CountingProbe /></Tree>);
    expect(screen.getByTestId('resolved-config')).toBeTruthy();
    expect(providerCommits.length).toBe(1);

    // A commit the provider is not part of.
    act(() => { tamper?.(); });
    expect(providerCommits.length).toBe(1);

    // Stated exactly: the seal did not run, so nothing is settled yet.
    expect(screen.queryByTestId('resolved-config')).not.toBeNull();

    // The microtask checkpoint that ends that task. No polling, no timers, no
    // `waitFor`: two deterministic ticks, one for the observer's delivery and
    // one for React's sync lane. Everything here happens before the event loop
    // reaches the rendering step.
    await act(async () => { await Promise.resolve(); });

    expect(screen.queryByTestId('resolved-config')).toBeNull();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  /**
   * The same claim, made against the clock rather than against microtask
   * counting. `requestAnimationFrame` fires in the rendering step, which the
   * event loop reaches only after the microtask checkpoint -- so a verdict that
   * is already in place when the frame callback runs is a verdict that landed
   * before the paint it was racing.
   */
  it('has already blocked a descendant-only tamper when the next frame runs', async () => {
    let tamper: (() => void) | null = null;
    function LocalUpdater(): React.ReactElement {
      const [tampered, setTampered] = React.useState(false);
      tamper = () => setTampered(true);
      useLayoutEffect(() => {
        if (!tampered) return;
        const style = document.querySelector<HTMLStyleElement>('.test-tenant-theme-artifact');
        if (!style) return;
        const parent = style.parentNode;
        const next = style.nextSibling;
        style.remove();
        parent?.insertBefore(style, next);
      }, [tampered]);
      return <ConfigProbe />;
    }

    mountArtifact();
    render(<Tree><LocalUpdater /></Tree>);
    expect(screen.getByTestId('resolved-config')).toBeTruthy();

    // The tampering commit runs to completion first -- detach, restore, task
    // over -- exactly as it would in a browser. Only then is a frame requested.
    act(() => { tamper?.(); });

    let blockedAtFrame: boolean | null = null;
    await act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          blockedAtFrame = screen.queryByTestId('resolved-config') === null;
          resolve();
        });
      });
    });

    expect(blockedAtFrame).toBe(true);
  });

  /**
   * A SUSPENSE REVEAL, WHICH IS THE OTHER SHAPE OF A COMMIT THE PROVIDER MISSES.
   *
   * The provider commits with the fallback on screen, so it is mounted, armed
   * and watching. When the pending work settles, React retries from the
   * boundary DOWNWARD: the revealed subtree renders and runs its effects, and
   * the provider -- and therefore the seal, and therefore the layout check --
   * is not part of that commit at all. This is the same honest limit the
   * descendant-update drill states, reached by the other route, so it is proved
   * the same way and by the same half of the mechanism.
   *
   * The observer armed at mount is persistent and still judging. Its record is
   * delivered at the microtask checkpoint that ends the reveal's task, and the
   * store change it raises schedules React's sync lane one microtask later.
   * Both are done before the event loop reaches its rendering step, which is
   * why the frame callback below finds the tree already blocked -- and why the
   * checkpoint capture, taken one microtask too early, honestly does not.
   */
  it('blocks a Suspense reveal that tampers, through the persistent observer', async () => {
    mountArtifact();
    const container = document.createElement('div');
    document.body.appendChild(container);

    let settled = false;
    let settle!: () => void;
    const pending = new Promise<void>((resolve) => {
      settle = () => { settled = true; resolve(); };
    });
    function Gate({ children }: { children: React.ReactNode }): React.ReactNode {
      if (!settled) throw pending;
      return children;
    }

    const reveal = commitSignal();
    let atRevealCheckpoint: { blocked: boolean } | null = null;
    function TamperingReveal(): React.ReactElement {
      useLayoutEffect(() => {
        tamperAndRestore();
        queueMicrotask(() => {
          atRevealCheckpoint = { blocked: isBlocked(container) };
          reveal.reach();
        });
      }, []);
      return <ConfigProbe />;
    }

    const fallbackCommit = commitSignal();
    let fallbackWitness = 0;
    function FallbackProbe(): React.ReactElement {
      useLayoutEffect(() => {
        fallbackWitness += 1;
        fallbackCommit.reach();
      }, []);
      return <output data-testid="fallback" />;
    }

    const root = createRoot(container);
    let blockedAtFrame: boolean | null = null;
    let fallbackWhilePending: boolean | null = null;
    try {
      await withoutActEnvironment(async () => {
        root.render(
          <Tree>
            <Suspense fallback={<FallbackProbe />}>
              <Gate><TamperingReveal /></Gate>
            </Suspense>
          </Tree>,
        );
        await fallbackCommit.reached;
        expect(fallbackWitness).toBe(1);
        fallbackWhilePending =
          container.querySelector('[data-testid="fallback"]') !== null;
        expect(fallbackWhilePending).toBe(true);

        settle();
        await reveal.reached;
        await nextFrame();
        blockedAtFrame = isBlocked(container);
      });
    } finally {
      await withoutActEnvironment(async () => { root.unmount(); });
      container.remove();
    }

    expect(fallbackWhilePending).toBe(true);
    // Stated exactly, not glossed: the seal was not in that commit, so nothing
    // is settled at the end of it.
    expect(atRevealCheckpoint).toEqual({ blocked: false });
    expect(blockedAtFrame).toBe(true);
  });

  /**
   * The reason the arm is a commit and not a render.
   *
   * React discards renders. A sibling throws, a child suspends, a concurrent
   * pass is superseded -- in every case the work is dropped and NO cleanup ever
   * runs for it, because nothing was committed to clean up. A watch armed
   * during render therefore leaks: an observer nobody will disconnect and a
   * ledger entry keyed to (Document, artifact identity) that will outlive the
   * page. It does not merely leak, it is actively hostile, because the ledger
   * is sticky by design -- the leaked watch keeps judging a document its own
   * tree is no longer part of, and the first legitimate remount of the artifact
   * reads as a takeover of a claim nobody holds.
   *
   * The drill below is that exact sequence, and its final assertion is an
   * ADMISSION: a real, committed, correct mount must still be admitted after an
   * abandoned render was followed by artifact churn.
   */
  it('leaves no watcher behind when a render throws, and does not poison a later commit', async () => {
    class Boundary extends React.Component<
      { children: React.ReactNode },
      { failed: boolean }
    > {
      state = { failed: false };
      static getDerivedStateFromError() { return { failed: true }; }
      render() { return this.state.failed ? null : this.props.children; }
    }
    function Boom(): React.ReactElement {
      throw new Error('render abandoned');
    }

    const style = mountArtifact();
    const abandoned = render(
      <Boundary><Tree><Boom /></Tree></Boundary>,
    );
    // The render was thrown away: nothing of the provider's tree survives.
    expect(screen.queryByTestId('resolved-config')).toBeNull();
    abandoned.unmount();

    // Artifact churn that a leaked watch would read as a takeover, and record
    // against this artifact's identity forever.
    await act(async () => {
      style.remove();
      mountArtifact();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    render(<Tree />);
    expect(screen.getByTestId('resolved-config')).toBeTruthy();
  });

  /**
   * The same law, reached the other way. A suspending child unwinds the
   * provider's subtree to the nearest boundary before any of it commits, so the
   * render that prepared a claim is discarded exactly as the throwing one was.
   */
  it('leaves no watcher behind when a render suspends, and does not poison a later commit', async () => {
    const pending = new Promise<void>(() => {});
    function Suspending(): React.ReactElement {
      throw pending;
    }

    const style = mountArtifact();
    const abandoned = render(
      <Suspense fallback={<output data-testid="fallback" />}>
        <Tree><Suspending /></Tree>
      </Suspense>,
    );
    expect(screen.getByTestId('fallback')).toBeTruthy();
    expect(screen.queryByTestId('resolved-config')).toBeNull();
    abandoned.unmount();

    await act(async () => {
      style.remove();
      mountArtifact();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    render(<Tree />);
    expect(screen.getByTestId('resolved-config')).toBeTruthy();
  });

  /**
   * The counterpart to stickiness: a claim that was committed and then released
   * cleanly holds nothing. Sticky means "a defeat is permanent", not "an
   * identity is burned by having been used once" -- a page that unmounts its
   * provider and mounts it again is the most ordinary thing in the world.
   */
  it('re-admits the same artifact after a clean unmount', async () => {
    mountArtifact();
    const view = render(<Tree />);
    expect(screen.getByTestId('resolved-config')).toBeTruthy();

    view.unmount();
    // The release is deferred by a microtask, so the remount below is proved on
    // fresh evidence rather than by joining the watch it just let go.
    await act(async () => { await Promise.resolve(); });

    render(<Tree />);
    expect(screen.getByTestId('resolved-config')).toBeTruthy();
    expect(document.documentElement.getAttribute('data-tenant')).toBe(ARTIFACT.slug);
  });

  /**
   * A takeover is the case where re-admission is not a re-proof. The swapped-in
   * node satisfies every observation admission can make -- right attributes,
   * exact bytes, unique in scope -- so a resolve that runs after the revocation
   * was dropped admits the attacker's element and the tree comes back.
   */
  it('stays blocked after a takeover even though later renders re-resolve', async () => {
    const style = mountArtifact();
    const view = render(<Tree />);
    expect(screen.getByTestId('resolved-config')).toBeTruthy();

    await act(async () => {
      style.remove();
      mountArtifact();
      await Promise.resolve();
    });
    expect(screen.queryByTestId('resolved-config')).toBeNull();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);

    const byteIdenticalClone = structuredClone(ARTIFACT) as TenantThemeArtifact;
    expect(byteIdenticalClone).not.toBe(ARTIFACT);
    expect(byteIdenticalClone.digest).toBe(ARTIFACT.digest);
    expect(byteIdenticalClone.css).toBe(ARTIFACT.css);
    expect(byteIdenticalClone).toEqual(ARTIFACT);

    view.rerender(<Tree artifact={byteIdenticalClone} />);
    await act(async () => { await Promise.resolve(); });

    expect(screen.queryByTestId('resolved-config')).toBeNull();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  it('stays blocked after a removal even once the same artifact is mounted again', async () => {
    const style = mountArtifact();
    const view = render(<Tree />);
    expect(screen.getByTestId('resolved-config')).toBeTruthy();

    await act(async () => {
      style.remove();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(screen.queryByTestId('resolved-config')).toBeNull());

    await act(async () => { mountArtifact(); });
    view.rerender(<Tree />);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

    expect(screen.queryByTestId('resolved-config')).toBeNull();
  });

  /**
   * Persistence is scoped to the identity that was defeated, not to the
   * document. A recompiled artifact is a different digest and has never been
   * revoked, so it is admitted on its own proof.
   */
  it('admits a recompiled artifact after a different one was revoked', async () => {
    const style = mountArtifact();
    const view = render(<Tree />);
    await act(async () => {
      style.remove();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(screen.queryByTestId('resolved-config')).toBeNull());

    await act(async () => { mountArtifact(RECOMPILED); });
    view.rerender(<Tree artifact={RECOMPILED} />);

    await waitFor(() => expect(screen.queryByTestId('resolved-config')).not.toBeNull());
    expect(document.documentElement.getAttribute('data-tenant')).toBe(RECOMPILED.slug);
  });

  /**
   * Phase one must not cost a commit. A gate that renders a placeholder first
   * and descendants second would make the client's first hydration pass differ
   * from the server's markup, which is a hydration mismatch on every page that
   * ships a compiled artifact. The arm belongs before descendants render, in
   * the same pass -- not in a second pass.
   */
  it('renders descendants in the first commit when the artifact is mounted', () => {
    mountArtifact();
    const commits: number[] = [];
    function CountingChild(): React.ReactElement {
      commits.push(1);
      return <ConfigProbe />;
    }
    render(<Tree><CountingChild /></Tree>);

    expect(screen.getByTestId('resolved-config')).toBeTruthy();
    expect(commits.length).toBe(1);
  });

  /**
   * StrictMode is the default development posture, and it replays every
   * subscription: subscribe, unsubscribe, subscribe, inside one commit.
   * `useSyncExternalStore` owns that subscription, so the gate cannot opt out of
   * the replay -- it can only survive it. A watch released on the way through
   * comes back with its observer disconnected, and the tree then renders
   * admitted and unwatched for as long as it lives, in development only, which
   * is precisely where the drills that protect it run.
   */
  it('keeps watching through a StrictMode subscription replay', async () => {
    const style = mountArtifact();
    render(<StrictMode><Tree /></StrictMode>);
    expect(screen.getByTestId('resolved-config')).toBeTruthy();

    await act(async () => {
      style.remove();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.queryByTestId('resolved-config')).toBeNull();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  /**
   * A server has no DOM, so the mounted-bytes proof the client performs is not
   * merely inconvenient there -- it is unavailable. The declaration alone is
   * self-reporting and proves nothing, so with no receipt the artifact is
   * refused and the tree does not ship.
   *
   * The artifact IS mounted in this test's document, deliberately. It has to
   * be, for the drill to mean anything: a resolver that reached for an ambient
   * document would find it and pass, and this is the assertion that says it
   * does not.
   */
  it('refuses a compiled artifact on a DOM-less server render with no receipt', () => {
    mountArtifact();

    const html = withoutDocument(() => renderToString(<Tree />));

    expect(html).not.toContain('resolved-config');
  });

  /**
   * What a server request CAN prove: that the design system itself produced
   * these exact bytes for this request and handed them to the response writer.
   * The receipt is minted only by the emitter, only from a re-verified digest,
   * and admission additionally requires membership in a module-private
   * registry -- so an object literal shaped like one is refused.
   */
  it('admits a compiled artifact on a DOM-less server render against a minted receipt', () => {
    const emission = emitTenantThemeArtifactForSsr(ARTIFACT);

    const admitted = withoutDocument(
      () => renderToString(<Tree ssrReceipt={emission.receipt} />),
    );
    const forged = withoutDocument(() => renderToString(
      <Tree ssrReceipt={{ ...emission.receipt } as TenantThemeArtifactSsrEmissionReceipt} />,
    ));

    expect(admitted).toContain('resolved-config');
    expect(forged).not.toContain('resolved-config');
  });

  /**
   * The sentinels cost the response nothing, asserted as bytes rather than as
   * intent. Both render null and neither is even created on a request with no
   * DOM, so a receipt-admitted server render is EXACTLY the application's own
   * markup: no wrapper, no marker element, no comment for hydration to
   * reconcile. An equality is the only honest form of this claim -- a
   * `not.toContain` would pass for a sentinel that emitted something the drill
   * had not thought to name.
   */
  it('emits the application markup and nothing else on a receipt-admitted server render', () => {
    const emission = emitTenantThemeArtifactForSsr(ARTIFACT);

    const html = withoutDocument(
      () => renderToString(<Tree ssrReceipt={emission.receipt} />),
    );

    expect(html).toBe(`<output data-testid="resolved-config">${ARTIFACT.slug}</output>`);
  });

  /**
   * Hydration is a commit like any other, and it is the first commit in which
   * application code gets to touch a document the server already styled. So the
   * barrier has to hold there too, on the lane hydration actually runs on --
   * outside `act`, with the passive subscription not yet installed.
   *
   * jsdom and happy-dom cannot prove a paint. What they CAN prove is the
   * ordering that decides one: the capture below is taken at the microtask
   * checkpoint ending the hydration commit's task, and the frame callback after
   * it is the rendering step that would have shown the tampered document.
   */
  it('blocks a hydration layout tamper inside the hydration commit, outside act', async () => {
    const emission = emitTenantThemeArtifactForSsr(ARTIFACT);
    const host = document.createElement('div');
    const commit = commitSignal();
    let atCommitCheckpoint: { blocked: boolean; tenantClaimed: boolean } | null = null;
    function TamperingChild(): React.ReactElement {
      useLayoutEffect(() => {
        tamperAndRestore();
        queueMicrotask(() => {
          atCommitCheckpoint = {
            blocked: isBlocked(host),
            tenantClaimed: document.documentElement.hasAttribute('data-tenant'),
          };
          commit.reach();
        });
      }, []);
      return <ConfigProbe />;
    }

    const html = withoutDocument(() => renderToString(
      <Tree ssrReceipt={emission.receipt}><TamperingChild /></Tree>,
    ));
    expect(html).toContain('resolved-config');

    // This response DID carry the stylesheet, so the client reaches the same
    // verdict the server did and hydration has nothing to reconcile. The tamper
    // is the only thing under test here.
    mountArtifact();
    host.innerHTML = html;
    document.body.appendChild(host);

    const errors: unknown[] = [];
    let blockedAtFrame: boolean | null = null;
    const root = await withoutActEnvironment(async () => {
      const hydrated = hydrateRoot(
        host,
        <Tree ssrReceipt={emission.receipt}><TamperingChild /></Tree>,
        { onRecoverableError: (error) => { errors.push(error); } },
      );
      await commit.reached;
      await nextFrame();
      blockedAtFrame = isBlocked(host);
      return hydrated;
    });
    await withoutActEnvironment(async () => { root.unmount(); });
    host.remove();

    expect(errors).toEqual([]);
    expect(atCommitCheckpoint).toEqual({ blocked: true, tenantClaimed: false });
    expect(blockedAtFrame).toBe(true);
  });

  /**
   * The same claim, made where React can contradict it. A gate whose first
   * client pass differs from the server's markup produces a hydration error and
   * throws the server tree away -- so the client's first pass has to reach the
   * same verdict the server did, by a different route: a receipt there, the
   * mounted bytes here.
   */
  it('hydrates a receipt-admitted server render without a mismatch', async () => {
    const emission = emitTenantThemeArtifactForSsr(ARTIFACT);
    const html = withoutDocument(
      () => renderToString(<Tree ssrReceipt={emission.receipt} />),
    );
    expect(html).toContain('resolved-config');

    // The response carried the stylesheet this time.
    mountArtifact();
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.appendChild(host);

    const errors: unknown[] = [];
    await act(async () => {
      hydrateRoot(host, <Tree ssrReceipt={emission.receipt} />, {
        onRecoverableError: (error) => { errors.push(error); },
      });
    });

    expect(errors).toEqual([]);
    expect(host.querySelector('[data-testid="resolved-config"]')?.textContent)
      .toBe(ARTIFACT.slug);
  });

  /**
   * The honest limit of an SSR receipt, enforced at the only place that can
   * enforce it. A server that emits the artifact and then drops those bytes
   * from its response is lying about its own output, and no check inside that
   * process can contradict it. The containment is that the lie survives exactly
   * one render: the client re-resolves against a real document, finds nothing
   * mounted, and blocks -- in the hydration pass itself, before the browser has
   * painted a single frame of the styled markup the server shipped.
   *
   * React will report a hydration mismatch here, and that is the correct
   * outcome rather than a flaw in the drill: the two passes genuinely disagree,
   * because the response genuinely lied.
   */
  it('blocks during hydration when the emitted artifact bytes never arrived', async () => {
    const mounted: string[] = [];
    function MountFlag(): React.ReactElement {
      useLayoutEffect(() => { mounted.push('live'); }, []);
      return <ConfigProbe />;
    }

    const emission = emitTenantThemeArtifactForSsr(ARTIFACT);
    const html = withoutDocument(() => renderToString(
      <Tree ssrReceipt={emission.receipt}><MountFlag /></Tree>,
    ));
    expect(html).toContain('resolved-config');

    // The response carried the markup but not the stylesheet.
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.appendChild(host);

    await act(async () => {
      hydrateRoot(host, <Tree ssrReceipt={emission.receipt}><MountFlag /></Tree>, {
        onRecoverableError: () => {},
      });
    });

    // Nothing below the provider was ever adopted: the styled markup the server
    // shipped is dead bytes, not a live tree, and no document-level tenant
    // state was ever claimed for it.
    expect(mounted).toEqual([]);
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });
});
