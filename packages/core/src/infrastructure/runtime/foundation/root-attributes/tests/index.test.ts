/**
 * Root-attribute ownership contract.
 *
 * THE DEFECT THIS PINS. `data-theme` has three writers in sequence: the server
 * render, the pre-paint script, and the provider effect. The provider cleaned up
 * with a bare `removeAttribute`, deleting a value it never created -- on every
 * dependency change, on unmount, and twice per mount under StrictMode. The
 * document ended up without the stamp the server put there.
 *
 * Each test below is a scenario that used to produce a wrong DOM.
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
  claimRootAttribute,
  claimRootClass,
  claimRootStyleProperty,
  composeRootAttributeReleases,
  outstandingRootClaims,
} from '..';

let root: HTMLElement;

beforeEach(() => {
  root = document.createElement('html');
  document.body.appendChild(root);
});

describe('claimRootAttribute', () => {
  it('restores the SSR stamp instead of deleting it', () => {
    // The exact regression: server renders data-theme="light", provider mounts
    // and resolves "dark", provider unmounts. The attribute must return to the
    // server's value, not vanish.
    root.setAttribute('data-theme', 'light');

    const release = claimRootAttribute(root, 'data-theme', 'dark');
    expect(root.getAttribute('data-theme')).toBe('dark');

    release();
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('removes the attribute when it genuinely did not exist before', () => {
    // The other half: a claim that CREATED the attribute must clean it up, or
    // the provider leaks state across tenant switches.
    const release = claimRootAttribute(root, 'data-engine', 'modern');
    expect(root.getAttribute('data-engine')).toBe('modern');

    release();
    expect(root.hasAttribute('data-engine')).toBe(false);
  });

  it('distinguishes an absent attribute from an empty one', () => {
    // `data-ds-root=""` is meaningful -- the tenant artifact selector matches on
    // it. Restoring "present but empty" as "absent" would break that selector.
    root.setAttribute('data-ds-root', '');

    const release = claimRootAttribute(root, 'data-ds-root', 'claimed');
    release();

    expect(root.hasAttribute('data-ds-root')).toBe(true);
    expect(root.getAttribute('data-ds-root')).toBe('');
  });

  it('DRILL: a stale release does not roll back a later owner', () => {
    // StrictMode double-mount, and the general concurrent case. Releasing the
    // FIRST claim after a SECOND has taken over must be a no-op -- otherwise
    // cleanup of an unmounted provider reverts the live one.
    root.setAttribute('data-theme', 'light');

    const releaseFirst = claimRootAttribute(root, 'data-theme', 'dark');
    const releaseSecond = claimRootAttribute(root, 'data-theme', 'base');

    // Releasing a non-top claim removes it from the stack and touches no DOM.
    releaseFirst();
    expect(root.getAttribute('data-theme')).toBe('base');

    // Releasing the top now unwinds all the way to the SSR baseline, because
    // the first claim is gone from the stack entirely. Identity tracking makes
    // out-of-order release exact; the earlier value-based implementation left a
    // stale intermediate here.
    releaseSecond();
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a double release is idempotent', () => {
    root.setAttribute('data-theme', 'light');
    const release = claimRootAttribute(root, 'data-theme', 'dark');
    const other = claimRootAttribute(root, 'data-theme', 'dark-2');

    release();
    release();

    // The second claim still owns it; the repeated release changed nothing.
    expect(root.getAttribute('data-theme')).toBe('dark-2');
    other();
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: two claims of the SAME value are not confused', () => {
    // The defect identity tracking exists to fix. Value comparison cannot tell
    // these two apart, so releasing A restored the SSR stamp while B was still
    // mounted -- a remount reverted the live theme.
    root.setAttribute('data-theme', 'light');

    const a = claimRootAttribute(root, 'data-theme', 'dark');
    const b = claimRootAttribute(root, 'data-theme', 'dark');

    a();
    expect(root.getAttribute('data-theme')).toBe('dark');

    b();
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: same-value claims released in order also survive', () => {
    // The StrictMode shape: mount, mount, unmount, unmount.
    root.setAttribute('data-theme', 'light');
    const a = claimRootAttribute(root, 'data-theme', 'dark');
    const b = claimRootAttribute(root, 'data-theme', 'dark');

    b();
    expect(root.getAttribute('data-theme')).toBe('dark');
    a();
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('drains the registry once the last claim is released', () => {
    // No retention after cleanup, on any of the three channel families.
    const releases = [
      claimRootAttribute(root, 'data-theme', 'dark'),
      claimRootStyleProperty(root, 'color-scheme', 'dark'),
      claimRootClass(root, 'dark', true),
    ];
    expect(outstandingRootClaims(root)).toBe(3);
    for (const release of releases) release();
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: an external writer defeats the rollback', () => {
    // Something outside the DS (an app effect, a devtool) writes the attribute.
    // The claim must not clobber it on cleanup.
    root.setAttribute('data-theme', 'light');
    const release = claimRootAttribute(root, 'data-theme', 'dark');

    root.setAttribute('data-theme', 'app-owned');
    release();

    expect(root.getAttribute('data-theme')).toBe('app-owned');
  });
});

describe('claimRootStyleProperty', () => {
  it('restores a pre-existing inline value', () => {
    // The pre-paint script writes `style.colorScheme` before React runs.
    root.style.setProperty('color-scheme', 'dark');

    const release = claimRootStyleProperty(root, 'color-scheme', 'light');
    expect(root.style.getPropertyValue('color-scheme')).toBe('light');

    release();
    expect(root.style.getPropertyValue('color-scheme')).toBe('dark');
  });

  it('removes a property it introduced', () => {
    const release = claimRootStyleProperty(root, 'color-scheme', 'light');
    release();
    expect(root.style.getPropertyValue('color-scheme')).toBe('');
  });

  it('DRILL: does not roll back over a later writer', () => {
    root.style.setProperty('color-scheme', 'dark');
    const release = claimRootStyleProperty(root, 'color-scheme', 'light');

    root.style.setProperty('color-scheme', 'only-light');
    release();

    expect(root.style.getPropertyValue('color-scheme')).toBe('only-light');
  });

  it('DRILL: two claims of the SAME value are not confused', () => {
    root.style.setProperty('color-scheme', 'light');
    const a = claimRootStyleProperty(root, 'color-scheme', 'dark');
    const b = claimRootStyleProperty(root, 'color-scheme', 'dark');

    a();
    expect(root.style.getPropertyValue('color-scheme')).toBe('dark');
    b();
    expect(root.style.getPropertyValue('color-scheme')).toBe('light');
  });

  // ── CSSOM empty-declaration hazard ────────────────────────────────
  //
  // THE DEFECT THESE PIN. `setProperty(prop, '')` is specified to behave as
  // `removeProperty(prop)`. A claim of `''` therefore deleted the declaration
  // underneath it, the read-back came back ABSENT so the claim's stored value
  // no longer matched the channel, and `release` classified its own damage as
  // an external takeover and returned WITHOUT restoring the baseline. The SSR
  // stamp was gone for the lifetime of the document. Each drill below produced
  // exactly that outcome before the fix.

  it('DRILL: an empty declaration is refused before it can delete a baseline', () => {
    root.style.setProperty('--ds-color-primary', '#123456');

    expect(() => claimRootStyleProperty(root, '--ds-color-primary', '')).toThrow(
      /refuses the empty declaration/,
    );

    // Refused BEFORE mutating: the baseline is untouched, not restored after
    // the fact.
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#123456');
  });

  it('DRILL: a whitespace-only declaration is refused the same way', () => {
    // CSSOM trims, so "   " is an empty declaration wearing a disguise.
    root.style.setProperty('--ds-color-primary', '#123456');

    expect(() => claimRootStyleProperty(root, '--ds-color-primary', '   ')).toThrow(
      /refuses the empty declaration/,
    );
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#123456');
  });

  it('DRILL: a bare priority with no value is refused', () => {
    // " !important" parses to an EMPTY value at important priority -- still a
    // removal, and the string-suffix check that predated the explicit
    // value+priority split waved it through.
    root.style.setProperty('--ds-color-primary', '#123456');

    expect(() => claimRootStyleProperty(root, '--ds-color-primary', ' !important')).toThrow(
      /refuses the empty declaration/,
    );
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#123456');
  });

  it('DRILL: a refused claim leaves no stack entry behind', () => {
    // The rejection must not half-build a claim: a leftover record would make
    // a LATER release hand the channel down to a value it never held.
    root.style.setProperty('--ds-color-primary', '#123456');

    expect(() => claimRootStyleProperty(root, '--ds-color-primary', '')).toThrow();
    expect(outstandingRootClaims(root)).toBe(0);

    const release = claimRootStyleProperty(root, '--ds-color-primary', '#abcdef');
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#abcdef');
    release();
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#123456');
  });

  it('DRILL: an empty claim cannot strand the claim underneath it', () => {
    // Two-deep: the outer claim used to delete the inner claim's value AND
    // skip the hand-back, so releasing the outer left the channel absent
    // while the inner claim was still mounted.
    root.style.setProperty('--ds-color-primary', '#123456');
    const inner = claimRootStyleProperty(root, '--ds-color-primary', '#aaaaaa');

    expect(() => claimRootStyleProperty(root, '--ds-color-primary', '')).toThrow();

    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#aaaaaa');
    inner();
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#123456');
  });

  it('carries priority as CSSOM value+priority, not as replayed bytes', () => {
    // A baseline that dropped `!important` is not the declaration it was
    // handed: inline `!important` outranks everything, so losing it on
    // restore silently changes the cascade.
    root.style.setProperty('--ds-color-primary', '#123456', 'important');

    const release = claimRootStyleProperty(root, '--ds-color-primary', '#abcdef');
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#abcdef');
    expect(root.style.getPropertyPriority('--ds-color-primary')).toBe('');

    release();
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#123456');
    expect(root.style.getPropertyPriority('--ds-color-primary')).toBe('important');
  });

  it('claims a declaration that is itself important, and hands the priority back', () => {
    root.style.setProperty('--ds-color-primary', '#123456');

    const release = claimRootStyleProperty(root, '--ds-color-primary', '#abcdef !important');
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#abcdef');
    expect(root.style.getPropertyPriority('--ds-color-primary')).toBe('important');

    release();
    expect(root.style.getPropertyValue('--ds-color-primary')).toBe('#123456');
    expect(root.style.getPropertyPriority('--ds-color-primary')).toBe('');
  });
});

describe('claimRootClass', () => {
  it('leaves a server-rendered class alone on release', () => {
    // The server may emit class="dark" itself; a provider that did not add it
    // must not take it away.
    root.classList.add('dark');

    const release = claimRootClass(root, 'dark', true);
    release();

    expect(root.classList.contains('dark')).toBe(true);
  });

  it('removes a class it added', () => {
    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);

    release();
    expect(root.classList.contains('dark')).toBe(false);
  });

  it('restores a class it removed', () => {
    root.classList.add('dark');
    const release = claimRootClass(root, 'dark', false);
    expect(root.classList.contains('dark')).toBe(false);

    release();
    expect(root.classList.contains('dark')).toBe(true);
  });

  it('DRILL: two claims of the SAME presence are not confused', () => {
    const a = claimRootClass(root, 'dark', true);
    const b = claimRootClass(root, 'dark', true);

    a();
    expect(root.classList.contains('dark')).toBe(true);
    b();
    expect(root.classList.contains('dark')).toBe(false);
  });
});

describe('composeRootAttributeReleases', () => {
  it('releases in reverse order so nested claims unwind correctly', () => {
    root.setAttribute('data-theme', 'light');
    const order: string[] = [];

    const release = composeRootAttributeReleases([
      () => order.push('first'),
      () => order.push('second'),
    ]);
    release();

    expect(order).toEqual(['second', 'first']);
  });

  it('restores every claimed surface together', () => {
    root.setAttribute('data-theme', 'light');
    root.style.setProperty('color-scheme', 'light');

    const release = composeRootAttributeReleases([
      claimRootAttribute(root, 'data-theme', 'dark'),
      claimRootClass(root, 'dark', true),
      claimRootStyleProperty(root, 'color-scheme', 'dark'),
    ]);

    expect(root.getAttribute('data-theme')).toBe('dark');
    release();

    expect(root.getAttribute('data-theme')).toBe('light');
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.style.getPropertyValue('color-scheme')).toBe('light');
  });
});
