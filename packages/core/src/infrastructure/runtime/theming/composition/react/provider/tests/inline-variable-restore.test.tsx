/**
 * EXACT RESTORE for the inline root style property ThemeProvider writes.
 *
 * WHAT WAS WRONG. A cleanup that tracked every property it wrote in an
 * `appliedVars` array and released with a bare `style.removeProperty(name)`.
 * Blind removal cannot restore: it deletes whatever is inline at that moment,
 * without ever having asked what was inline BEFORE the provider wrote over it.
 * A consumer that declares a channel inline on `<html>` itself — a preview
 * harness, a pre-paint script, a storybook decorator, an app pinning one
 * channel — loses that declaration the first time the provider's inputs
 * change, and gets nothing back.
 *
 * WHAT CHANGED UNDER THIS SUITE. The branding/tokenOverrides/appearance
 * emitters this originally exercised are GONE: ThemeProvider writes no visual
 * CSS variable at all, because a tenant's channels come from a compiled
 * artifact and the provider must never be a second author. The claim/release
 * discipline itself is unchanged and still load-bearing, because ThemeProvider
 * still writes ONE inline root style property — `color-scheme`, claimed
 * whenever the resolved theme is an explicit mode rather than `base`.
 *
 * So the vehicle moved and the property did not. Every case below drives the
 * same three separable guarantees through that surviving writer, and a test
 * that only checked the first would still pass on the broken code:
 *
 * 1. a property that DID exist inline before the provider comes back, with the
 *    same value, the same priority, and in the same serialized declaration;
 * 2. a property that did NOT exist before is genuinely removed — restore must
 *    not become "leave everything behind";
 * 3. the whole inline style attribute round-trips byte-for-byte.
 *
 * (3) is the counterfactual control for (1) and (2) together: it fails if the
 * provider leaks a single declaration, drops a single declaration, or reorders
 * them. It is measured as the exact `style` attribute string, so there is no
 * per-name allowlist that could hide a survivor.
 *
 * The two mechanism-level drills at the bottom claim through
 * `claimRootStyleProperty` directly. They are deliberately NOT routed through
 * the provider: they exercise canonicalization and stacking behaviour that the
 * provider's own single, whitespace-free value cannot reach.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

import { ThemeProvider } from '..';
import {
  claimRootStyleProperty,
  outstandingRootClaims,
} from '@/infrastructure/runtime/foundation/root-attributes';

/**
 * The one inline root style property ThemeProvider still claims.
 *
 * `base` deliberately claims nothing — it means "the vertical's own default
 * mode", and an inline claim would outrank the artifact's own `color-scheme`.
 * So every case here mounts with an explicit mode.
 */
const CLAIMED_PROPERTY = 'color-scheme';

/** The exact bytes of the inline style attribute, or null when absent. */
const inlineStyleAttribute = (): string | null =>
  document.documentElement.getAttribute('style');

describe('ThemeProvider · the inline root property is claimed, not overwritten', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.documentElement.removeAttribute('style');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.documentElement.removeAttribute('style');
    vi.restoreAllMocks();
  });

  it('hands a PREEXISTING inline value back byte-identically on unmount', () => {
    // The consumer's own declaration, deliberately the OPPOSITE mode from the
    // one the provider will claim, so "it looks restored" cannot be an
    // accident of both sides agreeing.
    document.documentElement.style.setProperty(CLAIMED_PROPERTY, 'light');
    const before = inlineStyleAttribute();
    expect(before).toBe('color-scheme: light;');

    const view = render(
      <ThemeProvider skipCssLoading theme="dark">
        <div />
      </ThemeProvider>
    );

    // The provider really did take the channel — otherwise the restore below
    // would be proving nothing.
    expect(
      document.documentElement.style.getPropertyValue(CLAIMED_PROPERTY)
    ).toBe('dark');

    view.unmount();

    expect(
      document.documentElement.style.getPropertyValue(CLAIMED_PROPERTY)
    ).toBe('light');
    expect(inlineStyleAttribute()).toBe(before);
  });

  it('REMOVES a property that had no inline value before', () => {
    // Nothing inline at all: the channel the provider claims must be gone
    // afterwards, and the attribute must not survive as an empty shell.
    const view = render(
      <ThemeProvider skipCssLoading theme="dark">
        <div />
      </ThemeProvider>
    );

    expect(
      document.documentElement.style.getPropertyValue(CLAIMED_PROPERTY)
    ).toBe('dark');

    view.unmount();

    expect(
      document.documentElement.style.getPropertyValue(CLAIMED_PROPERTY)
    ).toBe('');
    expect(inlineStyleAttribute()).toBeNull();
  });

  it('round-trips the ENTIRE inline style attribute across mount and unmount', () => {
    // A mixed baseline: the channel the provider will claim, one it will not,
    // and one carrying `!important` — a priority a `setProperty(name, value)`
    // restore would silently drop.
    const root = document.documentElement;
    root.style.setProperty(CLAIMED_PROPERTY, 'light');
    root.style.setProperty('--ds-app-owned', 'untouched');
    root.style.setProperty('--ds-font-family-base', 'Consumer Serif', 'important');
    const before = inlineStyleAttribute();

    const view = render(
      <ThemeProvider skipCssLoading theme="dark">
        <div />
      </ThemeProvider>
    );

    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('dark');
    // The provider no longer writes font families, token overrides or
    // appearance variables at all, so a channel it never claimed keeps the
    // consumer's value AND its priority for the whole mount — not just after
    // the release.
    expect(root.style.getPropertyValue('--ds-font-family-base')).toBe('Consumer Serif');
    expect(root.style.getPropertyPriority('--ds-font-family-base')).toBe('important');

    view.unmount();

    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('light');
    expect(root.style.getPropertyValue('--ds-font-family-base')).toBe('Consumer Serif');
    expect(root.style.getPropertyPriority('--ds-font-family-base')).toBe('important');
    expect(root.style.getPropertyValue('--ds-app-owned')).toBe('untouched');
    expect(inlineStyleAttribute()).toBe(before);
  });

  it('survives a mid-life change of the claimed value without losing the baseline', () => {
    // The theme effect re-runs on every theme change, releasing then
    // reclaiming. A restore mechanism that only worked on unmount would pass
    // the cases above and still destroy the baseline here, because React runs
    // the cleanup between the two values.
    const root = document.documentElement;
    root.style.setProperty(CLAIMED_PROPERTY, 'light');
    const before = inlineStyleAttribute();

    const view = render(
      <ThemeProvider skipCssLoading theme="dark">
        <div />
      </ThemeProvider>
    );
    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('dark');

    view.rerender(
      <ThemeProvider skipCssLoading theme="light">
        <div />
      </ThemeProvider>
    );
    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('light');

    // And a transition to `base`, which claims NOTHING, must release the
    // previous claim rather than leave it lingering — that is the leak a
    // release-per-claim prevents.
    view.rerender(
      <ThemeProvider skipCssLoading theme="base">
        <div />
      </ThemeProvider>
    );
    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('light');
    expect(inlineStyleAttribute()).toBe(before);

    view.unmount();
    expect(inlineStyleAttribute()).toBe(before);
  });

  it('leaves no outstanding claim behind, so the registry drains', () => {
    const root = document.documentElement;
    root.style.setProperty(CLAIMED_PROPERTY, 'light');

    const view = render(
      <ThemeProvider skipCssLoading theme="dark">
        <div />
      </ThemeProvider>
    );
    expect(outstandingRootClaims(root)).toBeGreaterThan(0);

    view.unmount();
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: survives React.StrictMode double-invocation without corrupting the baseline', () => {
    // StrictMode mounts, cleans up, and mounts again before the tree is
    // considered settled. A restore mechanism keyed on VALUE (the bug the
    // module header describes: "SSR = light; A claims dark; B claims dark;
    // release(A)") would see the second mount's claim as indistinguishable
    // from the first's and let its cleanup roll back a channel the second
    // mount still owns. This proves the identity-keyed stack survives that.
    //
    // `color-scheme` makes the drill STRICTER than it was: the two mounts
    // claim the identical string `dark`, which is exactly the collision a
    // value-keyed stack cannot tell apart.
    const root = document.documentElement;
    root.style.setProperty(CLAIMED_PROPERTY, 'light');
    const before = inlineStyleAttribute();

    // StrictMode's double-invocation is a development-mode React behavior;
    // prove it actually fired for THIS render instead of assuming the
    // harness reproduces it, so a future harness change that silently
    // stopped double-invoking could not turn this into a vacuous
    // single-mount test that happens to pass for an unrelated reason.
    let mounts = 0;
    function MountCounter(): null {
      React.useEffect(() => {
        mounts += 1;
      }, []);
      return null;
    }

    const view = render(
      <React.StrictMode>
        <ThemeProvider skipCssLoading theme="dark">
          <MountCounter />
        </ThemeProvider>
      </React.StrictMode>
    );

    expect(
      mounts,
      'the harness did not double-invoke under StrictMode; this drill would be vacuous'
    ).toBeGreaterThanOrEqual(2);

    // The double mount -> cleanup -> mount must still converge on the
    // correct claimed value, not a corrupted intermediate from the first
    // mount's cleanup racing the second mount's claim.
    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('dark');

    view.unmount();

    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('light');
    expect(inlineStyleAttribute()).toBe(before);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a genuine remount (unmount, then a fresh render) restores exactly, twice', () => {
    // `view.rerender(...)` (exercised above) keeps the SAME component
    // instance and only changes props; it never runs the mount effect's
    // cleanup against a truly gone tree. A real remount discards every
    // closure, ref, and claim token the first mount captured and creates
    // brand new ones, which is the scenario the claim stack's per-mount
    // identity tokens have to survive twice in a row, not just once.
    const root = document.documentElement;
    root.style.setProperty(CLAIMED_PROPERTY, 'light');
    const before = inlineStyleAttribute();

    const first = render(
      <ThemeProvider skipCssLoading theme="dark">
        <div />
      </ThemeProvider>
    );
    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('dark');

    first.unmount();
    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('light');
    expect(inlineStyleAttribute()).toBe(before);
    expect(outstandingRootClaims(root)).toBe(0);

    // A FRESH mount on the same DOM (`document.documentElement` is process-
    // wide; there is nothing to re-point at), not a rerender of the first.
    const second = render(
      <ThemeProvider skipCssLoading theme="dark">
        <div />
      </ThemeProvider>
    );
    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('dark');

    second.unmount();
    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('light');
    expect(inlineStyleAttribute()).toBe(before);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL (Defect A): canonicalizes a claimed value after write, so release hands back exactly what the CSSOM holds', () => {
    // Mechanism-level drill on `claimChannel` itself (via the public
    // `claimRootStyleProperty`), not through ThemeProvider: the provider's own
    // claimed value is the literal `light`/`dark`, with no whitespace and no
    // priority, so it cannot exercise the canonicalization this defect is
    // about. This claims directly, the same way `claimRootStyleProperty`'s
    // other callers do.
    //
    // The claimed value below has leading, trailing, AND internal
    // whitespace, plus an `!important` priority folded into the string per
    // `IMPORTANT_SUFFIX`. happy-dom's own `CSSStyleDeclaration.setProperty`
    // trims leading/trailing whitespace before storing a custom property
    // (`CSSStyleDeclarationPropertyManager`'s default case: `value.trim()`),
    // so the live CSSOM value is NOT byte-identical to the raw string this
    // test hands to `claimRootStyleProperty`. That is a real canonicalization
    // this test environment performs, not a simulated one. (happy-dom does
    // NOT collapse the INTERNAL run of spaces the way a real browser's CSS
    // tokenizer would -- that narrower claim is jsdom/happy-dom-limited and
    // would need confirming against a real browser separately; it is not
    // what this drill's pass/fail depends on. The leading/trailing trim
    // alone is enough to desynchronize a raw stored value from the live one.)
    const root = document.documentElement;
    const property = '--ds-canon-drill';
    expect(root.style.getPropertyValue(property)).toBe('');

    // Claim A: the covered/bottom claim. Clean value, no whitespace, so its
    // own claim-time canonicalization is a no-op -- it exists purely to be
    // the thing B's release must hand the channel back to.
    const releaseA = claimRootStyleProperty(root, property, 'Provider Sans');
    expect(root.style.getPropertyValue(property)).toBe('Provider Sans');

    // Claim B: covers A. Leading/trailing/internal whitespace + !important.
    const releaseB = claimRootStyleProperty(
      root,
      property,
      '   Consumer   Serif   !important'
    );
    expect(root.style.getPropertyValue(property)).toBe('Consumer   Serif');
    expect(root.style.getPropertyPriority(property)).toBe('important');

    // Releasing B must hand the channel back to A underneath it. The bug:
    // B's release() asks "did an external writer take over?" by comparing a
    // FRESH `adapter.read()` against B's STORED value. Pre-fix, that stored
    // value is the raw claim-time argument
    // ('   Consumer   Serif   !important'); the fresh read is the canonical
    // live form ('Consumer   Serif !important', single space before the
    // priority marker, leading/trailing trimmed). Those differ, so the
    // unfixed code concludes a stranger wrote over this channel and drains
    // WITHOUT restoring A -- B's value (or whatever is live) leaks forever
    // and A's claim is silently discarded from the stack. Post-fix, B's
    // stored value was re-read and canonicalized immediately after its own
    // claim-time write, so this comparison is canonical-vs-canonical, finds
    // no stranger, and correctly hands the channel down to A.
    releaseB();

    expect(root.style.getPropertyValue(property)).toBe('Provider Sans');
    expect(root.style.getPropertyPriority(property)).toBe('');

    releaseA();
    expect(root.style.getPropertyValue(property)).toBe('');
    expect(inlineStyleAttribute()).toBeNull();
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a blind removeProperty cleanup would fail this suite', () => {
    // The counterfactual, executed rather than described. This is exactly what
    // the provider used to do — track names, then delete them — and it proves
    // the assertions above are load-bearing rather than vacuously true of any
    // cleanup at all.
    const root = document.documentElement;
    root.style.setProperty(CLAIMED_PROPERTY, 'light');
    const before = inlineStyleAttribute();

    const applied: string[] = [];
    for (const [name, value] of Object.entries({
      [CLAIMED_PROPERTY]: 'dark',
      '--ds-color-alpha-primary-10': 'rgba(255, 0, 0, 0.10)',
    })) {
      root.style.setProperty(name, value);
      applied.push(name);
    }
    for (const name of applied) root.style.removeProperty(name);

    expect(root.style.getPropertyValue(CLAIMED_PROPERTY)).toBe('');
    expect(inlineStyleAttribute()).not.toBe(before);
  });
});
