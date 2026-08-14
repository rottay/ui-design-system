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
  claimRootAttributeSet,
  claimRootClass,
  claimRootStyleProperty,
  composeRootAttributeReleases,
  outstandingRootClaims,
} from '..';
import { ABSENT, claimChannel, type Baseline } from '../registry';

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

  it('DRILL: an invalid attribute name is refused before it can build a claim', () => {
    // Empty and otherwise invalid names must throw BEFORE the registry is
    // touched, and the transactional cleanup must leave no outstanding record.
    expect(() => claimRootAttribute(root, '', 'x')).toThrow();
    expect(outstandingRootClaims(root)).toBe(0);

    expect(() => claimRootAttribute(root, 'bad name', 'x')).toThrow();
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: HTML attribute case aliases share one channel (release bottom then top)', () => {
    // In HTML, `data-theme` and `DATA-THEME` are the same attribute. They must
    // resolve to a single channel, not two parallel stacks.
    root.setAttribute('data-theme', 'server');

    const bottom = claimRootAttribute(root, 'data-theme', 'dark');
    const top = claimRootAttribute(root, 'DATA-THEME', 'light');

    expect(root.getAttribute('data-theme')).toBe('light');
    // `outstandingRootClaims` counts records, not channels; two claims on one
    // canonical channel still report 2 until both are released.
    expect(outstandingRootClaims(root)).toBe(2);

    bottom();
    expect(root.getAttribute('data-theme')).toBe('light');

    top();
    expect(root.getAttribute('data-theme')).toBe('server');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: HTML attribute case aliases share one channel (release top then bottom)', () => {
    root.setAttribute('data-theme', 'server');

    const bottom = claimRootAttribute(root, 'data-theme', 'dark');
    const top = claimRootAttribute(root, 'DATA-THEME', 'light');

    top();
    expect(root.getAttribute('data-theme')).toBe('dark');

    bottom();
    expect(root.getAttribute('data-theme')).toBe('server');
    expect(outstandingRootClaims(root)).toBe(0);
  });
});

describe('claimRootAttributeSet', () => {
  it('DRILL: a valid and an invalid key reconcile atomically', () => {
    // The whole `next` map is canonicalized and validated before any DOM write,
    // so a bad key must leave the set and the element untouched.
    root.setAttribute('data-ok', 'server');

    expect(() => claimRootAttributeSet(root, 'data-', { 'data-ok': '1', '': '2' })).toThrow();
    expect(outstandingRootClaims(root)).toBe(0);
    expect(root.getAttribute('data-ok')).toBe('server');
  });

  it('DRILL: a canonical collision in the set is refused before any change', () => {
    // `DATA-THEME` and `data-theme` canonicalize to the same key in HTML; that
    // is a programming error and must fail without mutating.
    root.setAttribute('data-theme', 'server');

    expect(() =>
      claimRootAttributeSet(root, 'data-', { 'DATA-THEME': 'dark', 'data-theme': 'light' }),
    ).toThrow();
    expect(outstandingRootClaims(root)).toBe(0);
    expect(root.getAttribute('data-theme')).toBe('server');
  });

  it('DRILL: a set and a single claim share the canonical channel', () => {
    root.setAttribute('data-theme', 'server');

    const setClaim = claimRootAttributeSet(root, 'data-', { 'DATA-THEME': 'set' });
    expect(root.getAttribute('data-theme')).toBe('set');

    const single = claimRootAttribute(root, 'data-theme', 'single');
    expect(root.getAttribute('data-theme')).toBe('single');

    single();
    expect(root.getAttribute('data-theme')).toBe('set');

    setClaim.release();
    expect(root.getAttribute('data-theme')).toBe('server');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: uppercase HTML namespace is accepted and canonicalized', () => {
    const setClaim = claimRootAttributeSet(root, 'DATA-', { 'DATA-THEME': 'dark' });
    expect(root.getAttribute('data-theme')).toBe('dark');
    setClaim.release();
    expect(root.hasAttribute('data-theme')).toBe(false);
  });

  it('DRILL: non-HTML namespace preserves attribute case', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svg);
    svg.setAttribute('viewBox', '0 0 1 1');

    const release = claimRootAttribute(svg, 'viewBox', '0 0 2 2');
    expect(svg.getAttribute('viewBox')).toBe('0 0 2 2');

    release();
    expect(svg.getAttribute('viewBox')).toBe('0 0 1 1');
  });

  it('DRILL: an outside-namespace key is refused atomically', () => {
    root.setAttribute('data-ok', 'server');

    expect(() =>
      claimRootAttributeSet(root, 'data-', { 'data-ok': '1', 'x-theme': '2' }),
    ).toThrow(/outside the claimed namespace/);
    expect(outstandingRootClaims(root)).toBe(0);
    expect(root.getAttribute('data-ok')).toBe('server');
    expect(root.hasAttribute('x-theme')).toBe(false);
  });

  it('DRILL: uppercase HTML prefix and name share one channel with single claims (release orders)', () => {
    root.setAttribute('data-theme', 'server');

    const setClaim = claimRootAttributeSet(root, 'DATA-', { 'DATA-THEME': 'set' });
    expect(root.getAttribute('data-theme')).toBe('set');

    const single = claimRootAttribute(root, 'data-theme', 'single');
    expect(root.getAttribute('data-theme')).toBe('single');

    single();
    expect(root.getAttribute('data-theme')).toBe('set');
    setClaim.release();
    expect(root.getAttribute('data-theme')).toBe('server');
    expect(outstandingRootClaims(root)).toBe(0);

    const setClaim2 = claimRootAttributeSet(root, 'DATA-', { 'DATA-THEME': 'set' });
    const single2 = claimRootAttribute(root, 'DATA-THEME', 'single');
    setClaim2.release();
    expect(root.getAttribute('data-theme')).toBe('single');
    single2();
    expect(root.getAttribute('data-theme')).toBe('server');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: SVG keeps upper/lower distinct and prefix case-sensitive', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svg);

    const lower = claimRootAttributeSet(svg, 'data-', { 'data-x': 'lower' });
    const upper = claimRootAttribute(svg, 'DATA-X', 'upper');

    expect(svg.getAttribute('data-x')).toBe('lower');
    expect(svg.getAttribute('DATA-X')).toBe('upper');
    expect(outstandingRootClaims(svg)).toBe(2);

    upper();
    expect(svg.getAttribute('data-x')).toBe('lower');
    expect(svg.getAttribute('DATA-X')).toBeNull();

    lower.release();
    expect(svg.getAttribute('data-x')).toBeNull();
    expect(outstandingRootClaims(svg)).toBe(0);

    expect(() => claimRootAttributeSet(svg, 'DATA-', { 'data-x': 'x' })).toThrow(
      /outside the claimed namespace/,
    );
    expect(svg.hasAttribute('data-x')).toBe(false);
  });

  it('DRILL: null namespace keeps upper/lower distinct and prefix case-sensitive', () => {
    const xmlDoc = document.implementation.createDocument('http://example.com/ns', 'root', null);
    const xmlRoot = xmlDoc.createElementNS(null, 'div');

    const lower = claimRootAttributeSet(xmlRoot, 'data-', { 'data-x': 'lower' });
    const upper = claimRootAttribute(xmlRoot, 'DATA-X', 'upper');

    expect(xmlRoot.getAttribute('data-x')).toBe('lower');
    expect(xmlRoot.getAttribute('DATA-X')).toBe('upper');
    expect(outstandingRootClaims(xmlRoot)).toBe(2);

    upper();
    expect(xmlRoot.getAttribute('data-x')).toBe('lower');
    expect(xmlRoot.getAttribute('DATA-X')).toBeNull();

    lower.release();
    expect(xmlRoot.getAttribute('data-x')).toBeNull();
    expect(outstandingRootClaims(xmlRoot)).toBe(0);

    expect(() => claimRootAttributeSet(xmlRoot, 'DATA-', { 'data-x': 'x' })).toThrow(
      /outside the claimed namespace/,
    );
  });

  it('DRILL: MathML keeps upper/lower distinct and prefix case-sensitive', () => {
    const math = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
    document.body.appendChild(math);

    const lower = claimRootAttributeSet(math, 'data-', { 'data-x': 'lower' });
    const upper = claimRootAttribute(math, 'DATA-X', 'upper');

    expect(math.getAttribute('data-x')).toBe('lower');
    expect(math.getAttribute('DATA-X')).toBe('upper');
    expect(outstandingRootClaims(math)).toBe(2);

    upper();
    expect(math.getAttribute('data-x')).toBe('lower');
    expect(math.getAttribute('DATA-X')).toBeNull();

    lower.release();
    expect(math.getAttribute('data-x')).toBeNull();
    expect(outstandingRootClaims(math)).toBe(0);

    expect(() => claimRootAttributeSet(math, 'DATA-', { 'data-x': 'x' })).toThrow(
      /outside the claimed namespace/,
    );
  });

  it('DRILL: reconcile update/add/release failures roll back atomically', () => {
    root.setAttribute('data-a', 'serverA');
    root.setAttribute('data-b', 'serverB');

    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'A',
      'data-b': 'B',
    });
    expect(root.getAttribute('data-a')).toBe('A');
    expect(root.getAttribute('data-b')).toBe('B');

    const next = { 'data-a': 'A2', 'data-c': 'C' };

    for (let failAt = 1; failAt <= 3; failAt += 1) {
      const origSet = root.setAttribute.bind(root);
      let calls = 0;
      (root as any).setAttribute = (name: string, value: string) => {
        calls += 1;
        if (calls === failAt) {
          origSet(name, value);
          throw new Error('boom');
        }
        return origSet(name, value);
      };

      try {
        expect(() => setClaim.reconcile(next)).toThrow('boom');
        expect(root.getAttribute('data-a')).toBe('A');
        expect(root.getAttribute('data-b')).toBe('B');
        expect(root.hasAttribute('data-c')).toBe(false);
        expect(outstandingRootClaims(root)).toBe(2);
      } finally {
        (root as any).setAttribute = origSet;
      }
    }

    setClaim.reconcile(next);
    expect(root.getAttribute('data-a')).toBe('A2');
    expect(root.getAttribute('data-c')).toBe('C');
    expect(root.getAttribute('data-b')).toBe('serverB');

    setClaim.release();
    expect(root.getAttribute('data-a')).toBe('serverA');
    expect(root.getAttribute('data-b')).toBe('serverB');
    expect(root.hasAttribute('data-c')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: set release baseline-restore failure rolls back and retry succeeds', () => {
    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'A',
      'data-b': 'B',
    });
    expect(root.getAttribute('data-a')).toBe('A');
    expect(root.getAttribute('data-b')).toBe('B');

    const origRemove = root.removeAttribute.bind(root);
    let calls = 0;
    (root as any).removeAttribute = (name: string) => {
      calls += 1;
      if (calls === 2) {
        origRemove(name);
        throw new Error('boom');
      }
      return origRemove(name);
    };

    try {
      expect(() => setClaim.release()).toThrow('boom');
      expect(root.getAttribute('data-a')).toBe('A');
      expect(root.getAttribute('data-b')).toBe('B');
      expect(outstandingRootClaims(root)).toBe(2);
    } finally {
      (root as any).removeAttribute = origRemove;
    }

    setClaim.release();
    expect(root.hasAttribute('data-a')).toBe(false);
    expect(root.hasAttribute('data-b')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: set release hand-down failure rolls back and retry succeeds', () => {
    root.setAttribute('data-a', 'serverA');
    const single = claimRootAttribute(root, 'data-a', 'single');

    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'set',
      'data-b': 'B',
    });
    expect(root.getAttribute('data-a')).toBe('set');

    const origSet = root.setAttribute.bind(root);
    let calls = 0;
    (root as any).setAttribute = (name: string, value: string) => {
      calls += 1;
      if (calls === 1) {
        origSet(name, value);
        throw new Error('hand-down boom');
      }
      return origSet(name, value);
    };

    try {
      expect(() => setClaim.release()).toThrow('hand-down boom');
      expect(root.getAttribute('data-a')).toBe('set');
      expect(root.getAttribute('data-b')).toBe('B');
      expect(outstandingRootClaims(root)).toBe(3);
    } finally {
      (root as any).setAttribute = origSet;
    }

    setClaim.release();
    expect(root.getAttribute('data-a')).toBe('single');
    expect(root.hasAttribute('data-b')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(1);

    single();
    expect(root.getAttribute('data-a')).toBe('serverA');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: failed set.release rollback then reconcile updates every key', () => {
    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'A',
      'data-b': 'B',
    });

    const origRemove = root.removeAttribute.bind(root);
    let calls = 0;
    (root as any).removeAttribute = (name: string) => {
      calls += 1;
      if (calls === 2) {
        origRemove(name);
        throw new Error('release boom');
      }
      return origRemove(name);
    };

    try {
      expect(() => setClaim.release()).toThrow('release boom');
      expect(root.getAttribute('data-a')).toBe('A');
      expect(root.getAttribute('data-b')).toBe('B');
      expect(outstandingRootClaims(root)).toBe(2);
    } finally {
      (root as any).removeAttribute = origRemove;
    }

    setClaim.reconcile({ 'data-a': 'A2', 'data-b': 'B2' });
    expect(root.getAttribute('data-a')).toBe('A2');
    expect(root.getAttribute('data-b')).toBe('B2');
    expect(outstandingRootClaims(root)).toBe(2);

    setClaim.release();
    expect(root.hasAttribute('data-a')).toBe(false);
    expect(root.hasAttribute('data-b')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: added key DOM rollback failure leaves no orphan and drains', () => {
    root.setAttribute('data-a', 'serverA');
    root.setAttribute('data-b', 'serverB');

    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'A',
      'data-b': 'B',
    });

    const origSet = root.setAttribute.bind(root);
    const origRemove = root.removeAttribute.bind(root);
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (value === 'serverB') {
        origSet.call(this, name, value);
        throw new Error('primary boom');
      }
      return origSet.call(this, name, value);
    };
    (root as any).removeAttribute = function (this: Element, name: string) {
      if (name === 'data-c') return undefined;
      return origRemove.call(this, name);
    };

    let caught: unknown;
    try {
      setClaim.reconcile({ 'data-a': 'A2', 'data-c': 'C' });
    } catch (error) {
      caught = error;
    } finally {
      (root as any).setAttribute = origSet;
      (root as any).removeAttribute = origRemove;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    const aggregate = caught as AggregateError;
    expect(aggregate.errors[0].message).toBe('primary boom');
    expect(aggregate.errors.length).toBeGreaterThan(1);

    expect(root.getAttribute('data-a')).toBe('A');
    expect(root.getAttribute('data-b')).toBe('B');
    expect(outstandingRootClaims(root)).toBe(2);

    setClaim.reconcile({ 'data-a': 'A2', 'data-c': 'C' });
    expect(root.getAttribute('data-a')).toBe('A2');
    expect(root.getAttribute('data-c')).toBe('C');
    expect(root.getAttribute('data-b')).toBe('serverB');

    setClaim.release();
    expect(root.getAttribute('data-a')).toBe('serverA');
    expect(root.getAttribute('data-b')).toBe('serverB');
    expect(root.hasAttribute('data-c')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: direct set.release drains recovery-only C after failed C rollback', () => {
    root.setAttribute('data-a', 'serverA');
    root.setAttribute('data-b', 'serverB');
    root.setAttribute('data-c', 'serverC');

    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'A',
      'data-b': 'B',
    });

    const origSet = root.setAttribute.bind(root);
    const origRemove = root.removeAttribute.bind(root);
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (value === 'serverB') {
        origSet.call(this, name, value);
        throw new Error('primary boom');
      }
      if (name === 'data-c' && value === 'serverC') return undefined;
      return origSet.call(this, name, value);
    };
    (root as any).removeAttribute = function (this: Element, name: string) {
      if (name === 'data-c') return undefined;
      return origRemove.call(this, name);
    };

    let caught: unknown;
    try {
      setClaim.reconcile({ 'data-a': 'A2', 'data-c': 'C' });
    } catch (error) {
      caught = error;
    } finally {
      (root as any).setAttribute = origSet;
      (root as any).removeAttribute = origRemove;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect((caught as AggregateError).errors[0].message).toBe('primary boom');
    expect(outstandingRootClaims(root)).toBe(2);

    setClaim.release();
    expect(root.getAttribute('data-a')).toBe('serverA');
    expect(root.getAttribute('data-b')).toBe('serverB');
    expect(root.getAttribute('data-c')).toBe('serverC');
    expect(outstandingRootClaims(root)).toBe(0);

    setClaim.release();
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: new C state deleted before journal rollback leaves exact tombstone', () => {
    root.setAttribute('data-c', 'serverC');

    const setClaim = claimRootAttributeSet(root, 'data-', {});

    const origSet = root.setAttribute.bind(root);
    let restoreCalls = 0;
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (name === 'data-c' && value === 'C') {
        origSet.call(this, name, value);
        throw new Error('primary boom');
      }
      if (name === 'data-c' && value === 'serverC') {
        restoreCalls += 1;
        if (restoreCalls === 2) {
          origSet.call(this, name, 'corrupt');
          throw new Error('rollback boom');
        }
        return origSet.call(this, name, value);
      }
      return origSet.call(this, name, value);
    };

    let caught: unknown;
    try {
      setClaim.reconcile({ 'data-c': 'C' });
    } catch (error) {
      caught = error;
    } finally {
      (root as any).setAttribute = origSet;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    const aggregate = caught as AggregateError;
    expect(aggregate.errors[0].message).toBe('primary boom');
    expect(aggregate.errors.some((e) => (e as Error).message === 'rollback boom')).toBe(true);
    expect(outstandingRootClaims(root)).toBe(0);

    setClaim.release();
    expect(root.getAttribute('data-c')).toBe('serverC');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: reconcile to pre-call map drains recovery-only C', () => {
    root.setAttribute('data-a', 'serverA');
    root.setAttribute('data-b', 'serverB');
    root.setAttribute('data-c', 'serverC');

    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'A',
      'data-b': 'B',
    });

    const origSet = root.setAttribute.bind(root);
    const origRemove = root.removeAttribute.bind(root);
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (value === 'serverB') {
        origSet.call(this, name, value);
        throw new Error('primary boom');
      }
      if (name === 'data-c' && value === 'serverC') return undefined;
      return origSet.call(this, name, value);
    };
    (root as any).removeAttribute = function (this: Element, name: string) {
      if (name === 'data-c') return undefined;
      return origRemove.call(this, name);
    };

    let caught: unknown;
    try {
      setClaim.reconcile({ 'data-a': 'A2', 'data-c': 'C' });
    } catch (error) {
      caught = error;
    } finally {
      (root as any).setAttribute = origSet;
      (root as any).removeAttribute = origRemove;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect(outstandingRootClaims(root)).toBe(2);

    setClaim.reconcile({ 'data-a': 'A', 'data-b': 'B' });
    expect(root.getAttribute('data-a')).toBe('A');
    expect(root.getAttribute('data-b')).toBe('B');
    expect(root.getAttribute('data-c')).toBe('serverC');
    expect(outstandingRootClaims(root)).toBe(2);

    setClaim.release();
    expect(root.getAttribute('data-a')).toBe('serverA');
    expect(root.getAttribute('data-b')).toBe('serverB');
    expect(root.getAttribute('data-c')).toBe('serverC');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: recovery-only C drains then external writer is preserved by single claim', () => {
    root.setAttribute('data-c', 'serverC');

    const setClaim = claimRootAttributeSet(root, 'data-', {});

    const origSet = root.setAttribute.bind(root);
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (name === 'data-c' && value === 'C') {
        origSet.call(this, name, value);
        throw new Error('boom');
      }
      if (name === 'data-c' && value === 'serverC') return undefined;
      return origSet.call(this, name, value);
    };

    let caught: unknown;
    try {
      setClaim.reconcile({ 'data-c': 'C' });
    } catch (error) {
      caught = error;
    } finally {
      (root as any).setAttribute = origSet;
    }

    expect(caught).toBeInstanceOf(AggregateError);

    setClaim.release();
    expect(root.getAttribute('data-c')).toBe('serverC');
    expect(outstandingRootClaims(root)).toBe(0);

    root.setAttribute('data-c', 'external');
    const single = claimRootAttribute(root, 'data-c', 'single');
    expect(root.getAttribute('data-c')).toBe('single');

    single();
    expect(root.getAttribute('data-c')).toBe('external');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: external C survives set rollback failure and set.release repair', () => {
    root.setAttribute('data-c', 'serverC');

    const external = claimRootAttribute(root, 'data-c', 'external');
    const setClaim = claimRootAttributeSet(root, 'data-', {});

    const origSet = root.setAttribute.bind(root);
    let restoreCalls = 0;
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (name === 'data-c' && value === 'C') {
        origSet.call(this, name, value);
        throw new Error('boom');
      }
      if (name === 'data-c' && value === 'external') {
        restoreCalls += 1;
        if (restoreCalls === 2) {
          origSet.call(this, name, 'corrupt');
          throw new Error('rollback boom');
        }
        return origSet.call(this, name, value);
      }
      return origSet.call(this, name, value);
    };

    let caught: unknown;
    try {
      setClaim.reconcile({ 'data-c': 'C' });
    } catch (error) {
      caught = error;
    } finally {
      (root as any).setAttribute = origSet;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect(outstandingRootClaims(root)).toBe(1);

    setClaim.release();
    expect(root.getAttribute('data-c')).toBe('external');
    expect(outstandingRootClaims(root)).toBe(1);

    external();
    expect(root.getAttribute('data-c')).toBe('serverC');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: rollback silent-no-op aggregates the primary and repair drains', () => {
    root.setAttribute('data-a', 'serverA');
    root.setAttribute('data-b', 'serverB');

    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'A',
      'data-b': 'B',
    });

    const origSet = root.setAttribute.bind(root);
    const origRemove = root.removeAttribute.bind(root);
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (value === 'C') {
        origSet.call(this, name, value);
        throw new Error('primary boom');
      }
      if (value === 'A' || value === 'B') return undefined;
      return origSet.call(this, name, value);
    };
    (root as any).removeAttribute = origRemove;

    let caught: unknown;
    try {
      setClaim.reconcile({ 'data-a': 'A2', 'data-c': 'C' });
    } catch (error) {
      caught = error;
    } finally {
      (root as any).setAttribute = origSet;
      (root as any).removeAttribute = origRemove;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    const aggregate = caught as AggregateError;
    expect(aggregate.errors[0].message).toBe('primary boom');
    expect(aggregate.errors.length).toBeGreaterThan(1);

    setClaim.reconcile({ 'data-a': 'A2', 'data-c': 'C' });
    expect(root.getAttribute('data-a')).toBe('A2');
    expect(root.getAttribute('data-c')).toBe('C');
    expect(root.getAttribute('data-b')).toBe('serverB');

    setClaim.release();
    expect(root.getAttribute('data-a')).toBe('serverA');
    expect(root.getAttribute('data-b')).toBe('serverB');
    expect(root.hasAttribute('data-c')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: rollback throw aggregates the primary and rollback errors and repairs', () => {
    root.setAttribute('data-a', 'serverA');
    root.setAttribute('data-b', 'serverB');

    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'A',
      'data-b': 'B',
    });

    const origSet = root.setAttribute.bind(root);
    const origRemove = root.removeAttribute.bind(root);
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (value === 'C') {
        origSet.call(this, name, value);
        throw new Error('primary boom');
      }
      if (value === 'A' || value === 'B') throw new Error('rollback boom');
      return origSet.call(this, name, value);
    };
    (root as any).removeAttribute = origRemove;

    let caught: unknown;
    try {
      setClaim.reconcile({ 'data-a': 'A2', 'data-c': 'C' });
    } catch (error) {
      caught = error;
    } finally {
      (root as any).setAttribute = origSet;
      (root as any).removeAttribute = origRemove;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    const aggregate = caught as AggregateError;
    expect(aggregate.errors[0].message).toBe('primary boom');
    expect(aggregate.errors.some((e) => (e as Error).message === 'rollback boom')).toBe(true);

    setClaim.reconcile({ 'data-a': 'A2', 'data-c': 'C' });
    setClaim.release();
    expect(root.getAttribute('data-a')).toBe('serverA');
    expect(root.getAttribute('data-b')).toBe('serverB');
    expect(root.hasAttribute('data-c')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: failed reconcile preserves overlapped single-claim order and hand-down', () => {
    root.setAttribute('data-a', 'serverA');
    const below = claimRootAttribute(root, 'data-a', 'single');

    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'set',
      'data-b': 'B',
    });

    const origSet = root.setAttribute.bind(root);
    let calls = 0;
    (root as any).setAttribute = (name: string, value: string) => {
      calls += 1;
      if (calls === 1) {
        origSet(name, value);
        throw new Error('boom');
      }
      return origSet(name, value);
    };

    try {
      expect(() => setClaim.reconcile({ 'data-a': 'set2', 'data-c': 'C' })).toThrow('boom');
      expect(root.getAttribute('data-a')).toBe('set');
      expect(root.getAttribute('data-b')).toBe('B');
      expect(root.hasAttribute('data-c')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(3);
    } finally {
      (root as any).setAttribute = origSet;
    }

    setClaim.release();
    expect(root.getAttribute('data-a')).toBe('single');
    expect(root.hasAttribute('data-b')).toBe(false);

    below();
    expect(root.getAttribute('data-a')).toBe('serverA');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: equal reconcile writes nothing and double release is inert', () => {
    root.setAttribute('data-a', 'serverA');
    const setClaim = claimRootAttributeSet(root, 'data-', {
      'data-a': 'A',
      'data-b': 'B',
    });

    const origSet = root.setAttribute.bind(root);
    const origRemove = root.removeAttribute.bind(root);
    let sets = 0;
    let removes = 0;
    (root as any).setAttribute = (name: string, value: string) => {
      sets += 1;
      return origSet(name, value);
    };
    (root as any).removeAttribute = (name: string) => {
      removes += 1;
      return origRemove(name);
    };

    try {
      setClaim.reconcile({ 'data-a': 'A', 'data-b': 'B' });
      expect(sets).toBe(0);
      expect(removes).toBe(0);
    } finally {
      (root as any).setAttribute = origSet;
      (root as any).removeAttribute = origRemove;
    }

    setClaim.release();
    expect(root.getAttribute('data-a')).toBe('serverA');
    expect(root.hasAttribute('data-b')).toBe(false);

    setClaim.release();
    expect(root.getAttribute('data-a')).toBe('serverA');
    expect(outstandingRootClaims(root)).toBe(0);
  });
});

describe('claimChannel', () => {
  it('DRILL: a baseline read failure leaves the registry untouched', () => {
    const adapter = {
      read: () => {
        throw new Error('baseline read boom');
      },
      write: () => {},
      restore: () => {},
    };

    expect(() => claimChannel(root, 'test:baseline-read', 'value', adapter)).toThrow(
      'baseline read boom',
    );
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a write that mutates then throws rolls back and leaves no claim', () => {
    let live: Baseline = ABSENT;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        live = next;
        throw new Error('write boom');
      },
      restore: (baseline: Baseline) => {
        live = baseline;
      },
    };

    expect(() => claimChannel(root, 'test:write-rollback', 'value', adapter)).toThrow('write boom');
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a post-write read failure rolls back and leaves no claim', () => {
    let live: Baseline = ABSENT;
    let reads = 0;
    const adapter = {
      read: () => {
        reads += 1;
        if (reads === 3) throw new Error('post-read boom');
        return live;
      },
      write: (next: string) => {
        live = next;
      },
      restore: (baseline: Baseline) => {
        live = baseline;
      },
    };

    expect(() => claimChannel(root, 'test:post-read', 'value', adapter)).toThrow('post-read boom');
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a failed write whose rollback also throws reports both errors', () => {
    const adapter = {
      read: () => 'before',
      write: () => {
        throw new Error('write boom');
      },
      restore: () => {
        throw new Error('rollback boom');
      },
    };

    let caught: unknown;
    try {
      claimChannel(root, 'test:double-error', 'value', adapter);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    const aggregate = caught as AggregateError;
    expect(aggregate.errors.some((e) => (e as Error).message === 'write boom')).toBe(true);
    expect(aggregate.errors.some((e) => (e as Error).message === 'rollback boom')).toBe(true);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a failed update rolls back and can be retried and released', () => {
    let live: Baseline = ABSENT;
    let writes = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        if (writes === 2) {
          throw new Error('update write boom');
        }
        live = next;
      },
      restore: (baseline: Baseline) => {
        live = baseline;
      },
    };

    const claim = claimChannel(root, 'test:update-retry', 'first', adapter);
    expect(live).toBe('first');
    expect(outstandingRootClaims(root)).toBe(1);

    expect(() => claim.update('bad')).toThrow('update write boom');
    expect(live).toBe('first');
    expect(outstandingRootClaims(root)).toBe(1);

    claim.update('second');
    expect(live).toBe('second');

    claim.release();
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a failed post-read update rolls back and can be retried', () => {
    let live: Baseline = ABSENT;
    let reads = 0;
    const adapter = {
      read: () => {
        reads += 1;
        // 1 = baseline, 2 = initial before, 3 = initial post-write,
        // 4 = update before, 5 = update post-write -> fail.
        if (reads === 5) throw new Error('update post-read boom');
        return live;
      },
      write: (next: string) => {
        live = next;
      },
      restore: (baseline: Baseline) => {
        live = baseline;
      },
    };

    const claim = claimChannel(root, 'test:update-post-read', 'first', adapter);
    expect(() => claim.update('bad')).toThrow('update post-read boom');
    expect(live).toBe('first');

    claim.update('second');
    expect(live).toBe('second');
  });

  it('DRILL: an overlay write that mutates then throws rolls back to the lower claim', () => {
    // Causal canary: a failed top claim must restore the live lower claim,
    // not the historical baseline, so the lower owner stays live and can still
    // hand down to baseline on its own release.
    let live: Baseline = 'base';
    let writes = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        live = next;
        if (writes === 2) throw new Error('overlay write boom');
      },
      restore: (baseline: Baseline) => {
        live = baseline;
      },
    };

    const bottom = claimChannel(root, 'test:overlay-write', 'bottom', adapter);
    expect(live).toBe('bottom');
    expect(outstandingRootClaims(root)).toBe(1);

    expect(() => claimChannel(root, 'test:overlay-write', 'top', adapter)).toThrow(
      'overlay write boom',
    );
    expect(live).toBe('bottom');
    expect(outstandingRootClaims(root)).toBe(1);

    bottom.release();
    expect(live).toBe('base');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: an overlay post-write read failure rolls back to the lower claim', () => {
    let live: Baseline = 'base';
    let reads = 0;
    const adapter = {
      read: () => {
        reads += 1;
        // 1 = bottom baseline, 2 = bottom before, 3 = bottom post-write,
        // 4 = top before, 5 = top post-write -> fail.
        if (reads === 5) throw new Error('overlay post-read boom');
        return live;
      },
      write: (next: string) => {
        live = next;
      },
      restore: (baseline: Baseline) => {
        live = baseline;
      },
    };

    const bottom = claimChannel(root, 'test:overlay-postread', 'bottom', adapter);
    expect(live).toBe('bottom');
    expect(outstandingRootClaims(root)).toBe(1);

    expect(() => claimChannel(root, 'test:overlay-postread', 'top', adapter)).toThrow(
      'overlay post-read boom',
    );
    expect(live).toBe('bottom');
    expect(outstandingRootClaims(root)).toBe(1);

    bottom.release();
    expect(live).toBe('base');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: an overlay rollback failure reports both errors and keeps the lower claim', () => {
    let live: Baseline = 'base';
    let reads = 0;
    let restores = 0;
    const adapter = {
      read: () => {
        reads += 1;
        // 1 = bottom baseline, 2 = bottom before, 3 = bottom post-write,
        // 4 = top before, 5 = top post-write -> fail.
        if (reads === 5) throw new Error('overlay post-read boom');
        return live;
      },
      write: (next: string) => {
        live = next;
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) throw new Error('rollback boom');
        live = baseline;
      },
    };

    const bottom = claimChannel(root, 'test:overlay-rollback', 'bottom', adapter);
    expect(live).toBe('bottom');
    expect(outstandingRootClaims(root)).toBe(1);

    let caught: unknown;
    try {
      claimChannel(root, 'test:overlay-rollback', 'top', adapter);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    const aggregate = caught as AggregateError;
    expect(aggregate.errors.some((e) => (e as Error).message === 'overlay post-read boom')).toBe(
      true,
    );
    expect(aggregate.errors.some((e) => (e as Error).message === 'rollback boom')).toBe(true);
    expect(outstandingRootClaims(root)).toBe(1);

    bottom.release();
    // Recovery tombstone repaired the channel to the lower claim before it
    // handed down to baseline.
    expect(live).toBe('base');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: an initial claim rollback failure leaves a repairable tombstone', () => {
    let live: Baseline = 'base';
    let writes = 0;
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        live = next;
        if (writes === 1) throw new Error('initial write boom');
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) throw new Error('rollback boom');
        live = baseline;
      },
    };

    let caught: unknown;
    try {
      claimChannel(root, 'test:initial-rollback', 'top', adapter);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect(outstandingRootClaims(root)).toBe(0);
    expect(live).toBe('top');

    // Adapter repaired: retry restores baseline, claims, and releases cleanly.
    const claim = claimChannel(root, 'test:initial-rollback', 'top', adapter);
    expect(live).toBe('top');
    expect(outstandingRootClaims(root)).toBe(1);

    claim.release();
    expect(live).toBe('base');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: an initial claim rollback failure with an absent baseline is repairable', () => {
    let live: Baseline = ABSENT;
    let writes = 0;
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        live = next;
        if (writes === 1) throw new Error('initial write boom');
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) throw new Error('rollback boom');
        live = baseline;
      },
    };

    let caught: unknown;
    try {
      claimChannel(root, 'test:initial-absent-rollback', 'top', adapter);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect(outstandingRootClaims(root)).toBe(0);
    expect(live).toBe('top');

    const claim = claimChannel(root, 'test:initial-absent-rollback', 'top', adapter);
    expect(live).toBe('top');
    expect(outstandingRootClaims(root)).toBe(1);

    claim.release();
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a recovery verify mismatch keeps the tombstone retryable', () => {
    let live: Baseline = ABSENT;
    let writes = 0;
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        live = next;
        if (writes === 1) throw new Error('initial write boom');
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) throw new Error('rollback boom');
        // First repair attempt: restore succeeds but does not fully take.
        if (restores === 2) live = 'stale';
        else live = baseline;
      },
    };

    let caught: unknown;
    try {
      claimChannel(root, 'test:verify-mismatch', 'top', adapter);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect(outstandingRootClaims(root)).toBe(0);

    // Repair fails verification; tombstone stays, retry is still blocked.
    caught = undefined;
    try {
      claimChannel(root, 'test:verify-mismatch', 'top', adapter);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect((caught as AggregateError).message).toMatch(/recovery verify failed/);
    expect(outstandingRootClaims(root)).toBe(0);

    // Adapter fully repaired: retry succeeds.
    const claim = claimChannel(root, 'test:verify-mismatch', 'top', adapter);
    expect(live).toBe('top');
    expect(outstandingRootClaims(root)).toBe(1);

    claim.release();
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a first claim write failure with silent rollback no-op leaves a recovery tombstone', () => {
    let live: Baseline = 'base';
    let writes = 0;
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        live = next;
        if (writes === 1) throw new Error('write boom');
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) return; // silent no-op rollback
        live = baseline;
      },
    };

    let caught: unknown;
    try {
      claimChannel(root, 'test:silent-rollback', 'top', adapter);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    const aggregate = caught as AggregateError;
    expect(aggregate.errors[0].message).toBe('write boom');
    expect(aggregate.errors[1].message).toMatch(/rollback verify failed/);
    expect(outstandingRootClaims(root)).toBe(0);
    expect(live).toBe('top');

    const claim = claimChannel(root, 'test:silent-rollback', 'top', adapter);
    expect(live).toBe('top');
    expect(outstandingRootClaims(root)).toBe(1);

    claim.release();
    expect(live).toBe('base');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: an update failure with silent rollback no-op leaves a recovery tombstone', () => {
    let live: Baseline = ABSENT;
    let writes = 0;
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        live = next;
        if (writes === 2) throw new Error('update write boom');
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) return; // silent no-op rollback
        live = baseline;
      },
    };

    const claim = claimChannel(root, 'test:update-silent', 'first', adapter);
    expect(live).toBe('first');

    let caught: unknown;
    try {
      claim.update('bad');
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect((caught as AggregateError).errors[0].message).toBe('update write boom');
    expect((caught as AggregateError).errors[1].message).toMatch(/rollback verify failed/);
    expect(outstandingRootClaims(root)).toBe(1);
    expect(live).toBe('bad');

    claim.update('second');
    expect(live).toBe('second');
    expect(outstandingRootClaims(root)).toBe(1);

    claim.release();
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a hand-down failure with silent rollback no-op leaves a recovery tombstone', () => {
    let live: Baseline = 'base';
    let writes = 0;
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        live = next;
        if (writes === 3) throw new Error('hand-down boom');
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) return; // silent no-op rollback
        live = baseline;
      },
    };

    const bottom = claimChannel(root, 'test:handdown-silent', 'bottom', adapter);
    const top = claimChannel(root, 'test:handdown-silent', 'top', adapter);
    expect(live).toBe('top');

    let caught: unknown;
    try {
      top.release();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect((caught as AggregateError).errors[0].message).toBe('hand-down boom');
    expect((caught as AggregateError).errors[1].message).toMatch(/rollback verify failed/);
    expect(outstandingRootClaims(root)).toBe(2);
    expect(live).toBe('bottom');

    top.release();
    expect(live).toBe('bottom');
    expect(outstandingRootClaims(root)).toBe(1);

    bottom.release();
    expect(live).toBe('base');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a baseline release failure with silent rollback no-op leaves a recovery tombstone', () => {
    let live: Baseline = 'base';
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        live = next;
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) {
          live = 'corrupted';
          throw new Error('baseline restore boom');
        }
        if (restores === 2) return; // silent no-op rollback
        live = baseline;
      },
    };

    const claim = claimChannel(root, 'test:baseline-silent', 'top', adapter);
    expect(live).toBe('top');

    let caught: unknown;
    try {
      claim.release();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect((caught as AggregateError).errors[0].message).toBe('baseline restore boom');
    expect((caught as AggregateError).errors[1].message).toMatch(/rollback verify failed/);
    expect(outstandingRootClaims(root)).toBe(1);
    expect(live).toBe('corrupted');

    claim.release();
    expect(live).toBe('base');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a silent rollback no-op with an absent baseline is repairable', () => {
    let live: Baseline = ABSENT;
    let writes = 0;
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        live = next;
        if (writes === 1) throw new Error('write boom');
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) return; // silent no-op
        live = baseline;
      },
    };

    let caught: unknown;
    try {
      claimChannel(root, 'test:absent-silent', 'top', adapter);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect(outstandingRootClaims(root)).toBe(0);
    expect(live).toBe('top');

    const claim = claimChannel(root, 'test:absent-silent', 'top', adapter);
    expect(live).toBe('top');
    expect(outstandingRootClaims(root)).toBe(1);

    claim.release();
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: an update rollback failure keeps the handle repairable and retryable', () => {
    let live: Baseline = ABSENT;
    let writes = 0;
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        live = next;
        if (writes === 2) throw new Error('update write boom');
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) throw new Error('rollback boom');
        live = baseline;
      },
    };

    const claim = claimChannel(root, 'test:update-rollback', 'first', adapter);
    expect(live).toBe('first');

    let caught: unknown;
    try {
      claim.update('bad');
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect(outstandingRootClaims(root)).toBe(1);
    expect(live).toBe('bad');

    // Adapter repaired: retry restores previous value, then completes update.
    claim.update('second');
    expect(live).toBe('second');
    expect(outstandingRootClaims(root)).toBe(1);

    claim.release();
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a release baseline rollback failure keeps the handle repairable', () => {
    let live: Baseline = 'base';
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        live = next;
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) throw new Error('baseline restore boom');
        if (restores === 2) throw new Error('rollback boom');
        live = baseline;
      },
    };

    const claim = claimChannel(root, 'test:release-rollback', 'top', adapter);
    expect(live).toBe('top');

    let caught: unknown;
    try {
      claim.release();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect(outstandingRootClaims(root)).toBe(1);
    expect(live).toBe('top');

    // Adapter repaired: retry restores baseline.
    claim.release();
    expect(live).toBe('base');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a release whose external-read fails keeps the handle retryable', () => {
    let live: Baseline = ABSENT;
    let reads = 0;
    const adapter = {
      read: () => {
        reads += 1;
        // 1 = baseline, 2 = initial before, 3 = initial post-write,
        // 4 = release external-read -> fail.
        if (reads === 4) throw new Error('release read boom');
        return live;
      },
      write: (next: string) => {
        live = next;
      },
      restore: (baseline: Baseline) => {
        live = baseline;
      },
    };

    const claim = claimChannel(root, 'test:rel-read', 'top', adapter);
    expect(() => claim.release()).toThrow('release read boom');
    expect(outstandingRootClaims(root)).toBe(1);
    expect(live).toBe('top');

    claim.release();
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a release whose hand-down fails keeps the handle retryable', () => {
    let live: Baseline = ABSENT;
    let writes = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        writes += 1;
        if (writes === 3) throw new Error('hand-down boom');
        live = next;
      },
      restore: (baseline: Baseline) => {
        live = baseline;
      },
    };

    const bottom = claimChannel(root, 'test:rel-handdown', 'bottom', adapter);
    const top = claimChannel(root, 'test:rel-handdown', 'top', adapter);
    expect(live).toBe('top');

    expect(() => top.release()).toThrow('hand-down boom');
    expect(outstandingRootClaims(root)).toBe(2);
    expect(live).toBe('top');

    top.release();
    expect(live).toBe('bottom');
    expect(outstandingRootClaims(root)).toBe(1);

    bottom.release();
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a release whose baseline restore fails keeps the handle retryable', () => {
    let live: Baseline = ABSENT;
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        live = next;
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores === 1) throw new Error('baseline boom');
        live = baseline;
      },
    };

    const claim = claimChannel(root, 'test:rel-baseline', 'top', adapter);
    expect(() => claim.release()).toThrow('baseline boom');
    expect(outstandingRootClaims(root)).toBe(1);
    expect(live).toBe('top');

    claim.release();
    expect(live).toBe(ABSENT);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: a release whose baseline restore and rollback both fail reports both errors', () => {
    let live: Baseline = ABSENT;
    let restores = 0;
    const adapter = {
      read: () => live,
      write: (next: string) => {
        live = next;
      },
      restore: (baseline: Baseline) => {
        restores += 1;
        if (restores <= 2) throw new Error(`restore ${restores} boom`);
        live = baseline;
      },
    };

    const claim = claimChannel(root, 'test:rel-baseline-agg', 'top', adapter);

    let caught: unknown;
    try {
      claim.release();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    const aggregate = caught as AggregateError;
    expect(aggregate.errors.length).toBe(2);
    expect(outstandingRootClaims(root)).toBe(1);
    expect(live).toBe('top');
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

  it('CANARY: absent baseline, false claim releases to absent class and drains', () => {
    const release = claimRootClass(root, 'dark', false);
    expect(root.hasAttribute('class')).toBe(true);

    release();
    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: absent baseline, true claim releases to absent class and drains', () => {
    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);

    release();
    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: empty class attribute baseline survives a true claim/release', () => {
    root.setAttribute('class', '');

    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);

    release();
    expect(root.hasAttribute('class')).toBe(true);
    expect(root.getAttribute('class')).toBe('');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: host class survives an independent claim/release', () => {
    root.className = 'host';

    const release = claimRootClass(root, 'dark', true);
    expect(root.className).toBe('host dark');

    release();
    expect(root.className).toBe('host');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: host+dark classes survive a removal claim/release', () => {
    root.className = 'host dark';

    const release = claimRootClass(root, 'dark', false);
    expect(root.className).toBe('host');

    release();
    expect(root.className).toBe('host dark');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: two-claim matrix hands down correctly and drains to absent', () => {
    const matrix: [boolean, boolean][] = [
      [true, false],
      [false, true],
      [true, true],
      [false, false],
    ];

    for (const [topPresent, bottomPresent] of matrix) {
      expect(outstandingRootClaims(root)).toBe(0);

      const bottom = claimRootClass(root, 'dark', bottomPresent);
      const top = claimRootClass(root, 'dark', topPresent);
      expect(root.classList.contains('dark')).toBe(topPresent);
      expect(outstandingRootClaims(root)).toBe(2);

      top();
      expect(root.classList.contains('dark')).toBe(bottomPresent);
      expect(outstandingRootClaims(root)).toBe(1);

      bottom();
      expect(root.hasAttribute('class')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(0);
    }
  });

  it('CANARY: absent baseline, true claim, foreign host added, release preserves host and drains', () => {
    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);

    root.classList.add('host');
    release();

    expect(root.className).toBe('host');
    expect(root.hasAttribute('class')).toBe(true);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: two distinct tokens with absent baseline release in both orders and drain', () => {
    const matrix: [boolean, boolean][] = [
      [true, false],
      [false, true],
      [true, true],
      [false, false],
    ];

    for (const [darkPresent, compactPresent] of matrix) {
      expect(outstandingRootClaims(root)).toBe(0);

      const dark = claimRootClass(root, 'dark', darkPresent);
      const compact = claimRootClass(root, 'compact', compactPresent);
      expect(root.classList.contains('dark')).toBe(darkPresent);
      expect(root.classList.contains('compact')).toBe(compactPresent);
      expect(outstandingRootClaims(root)).toBe(2);

      dark();
      expect(root.classList.contains('dark')).toBe(false);
      expect(root.classList.contains('compact')).toBe(compactPresent);
      expect(outstandingRootClaims(root)).toBe(1);

      compact();
      expect(root.hasAttribute('class')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(0);

      const dark2 = claimRootClass(root, 'dark', darkPresent);
      const compact2 = claimRootClass(root, 'compact', compactPresent);

      compact2();
      expect(root.classList.contains('dark')).toBe(darkPresent);
      expect(root.classList.contains('compact')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(1);

      dark2();
      expect(root.hasAttribute('class')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(0);
    }
  });

  it('CANARY: two distinct tokens with empty class baseline keep empty attribute', () => {
    root.setAttribute('class', '');

    const matrix: [boolean, boolean][] = [
      [true, false],
      [false, true],
      [true, true],
      [false, false],
    ];

    for (const [darkPresent, compactPresent] of matrix) {
      const dark = claimRootClass(root, 'dark', darkPresent);
      const compact = claimRootClass(root, 'compact', compactPresent);

      dark();
      compact();

      expect(root.hasAttribute('class')).toBe(true);
      expect(root.getAttribute('class')).toBe('');
      expect(outstandingRootClaims(root)).toBe(0);
    }
  });

  it('CANARY: failed class claim rolls back materialization and drains', () => {
    const origToggle = root.classList.toggle.bind(root.classList);
    (root.classList as any).toggle = (token: string, force?: boolean) => {
      if (token === 'dark' && force === true) {
        throw new Error('claim toggle boom');
      }
      return origToggle(token, force);
    };

    expect(() => claimRootClass(root, 'dark', true)).toThrow('claim toggle boom');
    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);

    (root.classList as any).toggle = origToggle;

    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);
    release();
    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('CANARY: failed class release keeps wrapper retryable and drains', () => {
    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);

    const origToggle = root.classList.toggle.bind(root.classList);
    let removeShouldThrow = false;
    (root.classList as any).toggle = (token: string, force?: boolean) => {
      if (removeShouldThrow && token === 'dark' && force === false) {
        throw new Error('release toggle boom');
      }
      return origToggle(token, force);
    };

    try {
      removeShouldThrow = true;
      expect(() => release()).toThrow('release toggle boom');
      expect(root.classList.contains('dark')).toBe(true);
      expect(outstandingRootClaims(root)).toBe(1);

      removeShouldThrow = false;
      release();
      expect(root.hasAttribute('class')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      (root.classList as any).toggle = origToggle;
    }
  });

  it('DURABLE CANARY 1: setAttribute materializes and throws, first claim errors, retry+release end absent', () => {
    const origSet = root.setAttribute.bind(root);
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (name === 'class' && value === '') {
        origSet.call(this, name, value);
        throw new Error('set boom');
      }
      return origSet.call(this, name, value);
    };

    try {
      expect(() => claimRootClass(root, 'dark', true)).toThrow('set boom');
      expect(root.hasAttribute('class')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      root.setAttribute = origSet;
    }

    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);
    release();
    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 2: setAttribute silent no-op errors and does not publish a claim', () => {
    const origSet = root.setAttribute.bind(root);
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (name === 'class' && value === '') return undefined;
      return origSet.call(this, name, value);
    };

    try {
      expect(() => claimRootClass(root, 'dark', true)).toThrow(/silent no-op/);
      expect(root.hasAttribute('class')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      root.setAttribute = origSet;
    }

    const release = claimRootClass(root, 'dark', true);
    release();
    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 3: claim toggle mutates and rollback no-op leaves tombstone, next claim/release ends absent', () => {
    const origToggle = root.classList.toggle.bind(root.classList);
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === true) {
        origToggle.call(this, token, force);
        throw new Error('mutate toggle boom');
      }
      if (token === 'dark' && force === false) {
        return undefined;
      }
      return origToggle.call(this, token, force);
    };

    try {
      let caught: unknown;
      try {
        claimRootClass(root, 'dark', true);
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(AggregateError);
      expect(root.classList.contains('dark')).toBe(true);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);
    release();
    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 4: last removeAttribute throws before mutating, first release errors, retry removes and finishes', () => {
    const release = claimRootClass(root, 'dark', true);
    const origRemove = root.removeAttribute.bind(root);
    let shouldThrow = true;
    (root as any).removeAttribute = function (this: Element, name: string) {
      if (name === 'class' && shouldThrow) {
        throw new Error('remove boom');
      }
      return origRemove.call(this, name);
    };

    try {
      expect(() => release()).toThrow('remove boom');
      expect(root.getAttribute('class')).toBe('');
      expect(outstandingRootClaims(root)).toBe(0);

      shouldThrow = false;
      release();
      expect(root.hasAttribute('class')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      root.removeAttribute = origRemove;
    }
  });

  it('DURABLE CANARY 5: last removeAttribute mutates and throws, retry observes absence and finishes', () => {
    const release = claimRootClass(root, 'dark', true);
    const origRemove = root.removeAttribute.bind(root);
    (root as any).removeAttribute = function (this: Element, name: string) {
      if (name === 'class') {
        origRemove.call(this, name);
        throw new Error('mutate remove boom');
      }
      return origRemove.call(this, name);
    };

    try {
      expect(() => release()).toThrow('mutate remove boom');
      expect(root.hasAttribute('class')).toBe(false);

      release();
      expect(root.hasAttribute('class')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      root.removeAttribute = origRemove;
    }
  });

  it('DURABLE CANARY 6: last removeAttribute silent no-op does not false-success, retry closes after restore', () => {
    const release = claimRootClass(root, 'dark', true);
    const origRemove = root.removeAttribute.bind(root);
    (root as any).removeAttribute = function (this: Element, name: string) {
      if (name === 'class') return undefined;
      return origRemove.call(this, name);
    };

    try {
      expect(() => release()).toThrow(/silent no-op/);
      expect(root.getAttribute('class')).toBe('');
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      root.removeAttribute = origRemove;
    }

    release();
    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 7: two active tokens and final cleanup failure in both release orders decrement once and retry', () => {
    const origRemove = root.removeAttribute.bind(root);

    for (const order of [
      ['dark', 'compact'],
      ['compact', 'dark'],
    ] as const) {
      const first = claimRootClass(root, order[0], true);
      const second = claimRootClass(root, order[1], true);
      expect(outstandingRootClaims(root)).toBe(2);

      let calls = 0;
      (root as any).removeAttribute = function (this: Element, name: string) {
        if (name === 'class') {
          calls += 1;
          if (calls === 1) throw new Error('final remove boom');
        }
        return origRemove.call(this, name);
      };

      try {
        first();
        expect(outstandingRootClaims(root)).toBe(1);

        expect(() => second()).toThrow('final remove boom');
        expect(root.getAttribute('class')).toBe('');
        expect(outstandingRootClaims(root)).toBe(0);

        second();
        expect(root.hasAttribute('class')).toBe(false);
        expect(outstandingRootClaims(root)).toBe(0);
      } finally {
        root.removeAttribute = origRemove;
      }
    }
  });

  it('DURABLE CANARY 8: after successful close a new claim recaptures absent, empty, and foreign baselines', () => {
    const first = claimRootClass(root, 'dark', true);
    first();
    expect(root.hasAttribute('class')).toBe(false);

    root.setAttribute('class', '');
    const second = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);
    second();
    expect(root.hasAttribute('class')).toBe(true);
    expect(root.getAttribute('class')).toBe('');

    root.className = 'host';
    const third = claimRootClass(root, 'dark', true);
    expect(root.className).toBe('host dark');
    third();
    expect(root.className).toBe('host');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 9: exact rollback then external class="" is preserved by next claim/release', () => {
    const origSet = root.setAttribute.bind(root);
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (name === 'class' && value === '') return undefined;
      return origSet.call(this, name, value);
    };

    try {
      expect(() => claimRootClass(root, 'dark', true)).toThrow(/silent no-op/);
      expect(root.hasAttribute('class')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      root.setAttribute = origSet;
    }

    root.setAttribute('class', '');
    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);
    release();

    expect(root.hasAttribute('class')).toBe(true);
    expect(root.getAttribute('class')).toBe('');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 10: exact rollback then external class="host" is preserved by next claim/release', () => {
    const origSet = root.setAttribute.bind(root);
    (root as any).setAttribute = function (this: Element, name: string, value: string) {
      if (name === 'class' && value === '') return undefined;
      return origSet.call(this, name, value);
    };

    try {
      expect(() => claimRootClass(root, 'dark', true)).toThrow(/silent no-op/);
      expect(root.hasAttribute('class')).toBe(false);
    } finally {
      root.setAttribute = origSet;
    }

    root.className = 'host';
    const release = claimRootClass(root, 'dark', true);
    expect(root.className).toBe('host dark');
    release();

    expect(root.className).toBe('host');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 11: dark mutates + rollback silent no-op, then compact claim/release ends absent', () => {
    const origToggle = root.classList.toggle.bind(root.classList);
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === true) {
        origToggle.call(this, token, force);
        throw new Error('mutate toggle boom');
      }
      if (token === 'dark' && force === false) {
        return undefined;
      }
      return origToggle.call(this, token, force);
    };

    try {
      let caught: unknown;
      try {
        claimRootClass(root, 'dark', true);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(AggregateError);
      expect(root.classList.contains('dark')).toBe(true);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    const release = claimRootClass(root, 'compact', true);
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.classList.contains('compact')).toBe(true);
    release();

    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 12: dark mutates + rollback silent no-op with foreign host, compact release keeps host', () => {
    const origToggle = root.classList.toggle.bind(root.classList);
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === true) {
        origToggle.call(this, token, force);
        throw new Error('mutate toggle boom');
      }
      if (token === 'dark' && force === false) {
        return undefined;
      }
      return origToggle.call(this, token, force);
    };

    try {
      let caught: unknown;
      try {
        claimRootClass(root, 'dark', true);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(AggregateError);
      expect(root.classList.contains('dark')).toBe(true);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    root.className = 'host dark';
    const release = claimRootClass(root, 'compact', true);
    expect(root.className).toBe('host compact');
    release();

    expect(root.className).toBe('host');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 13: pending token repair failure blocks new claims and retries cleanly', () => {
    const origToggle = root.classList.toggle.bind(root.classList);
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === true) {
        origToggle.call(this, token, force);
        throw new Error('mutate toggle boom');
      }
      if (token === 'dark' && force === false) {
        return undefined;
      }
      return origToggle.call(this, token, force);
    };

    try {
      let caught: unknown;
      try {
        claimRootClass(root, 'dark', true);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(AggregateError);
      expect(root.classList.contains('dark')).toBe(true);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    let repairAttempts = 0;
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === false) {
        repairAttempts += 1;
        if (repairAttempts === 1) {
          throw new Error('repair toggle boom');
        }
      }
      return origToggle.call(this, token, force);
    };

    try {
      expect(() => claimRootClass(root, 'compact', true)).toThrow(/pending class token recovery failed/);
      expect(root.classList.contains('dark')).toBe(true);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    const release = claimRootClass(root, 'compact', true);
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.classList.contains('compact')).toBe(true);
    release();

    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 14: present-empty baseline is rematerialized when the last token removal drops the attribute', () => {
    root.setAttribute('class', '');

    const origToggle = root.classList.toggle.bind(root.classList);
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      const result = origToggle.call(this, token, force);
      // Simulate a DOM implementation that removes the attribute when the last
      // token is removed, so the wrapper must rematerialize class="".
      if (force === false && this.length === 0 && root.hasAttribute('class')) {
        root.removeAttribute('class');
      }
      return result;
    };

    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);

    release();

    expect(root.hasAttribute('class')).toBe(true);
    expect(root.getAttribute('class')).toBe('');
    expect(outstandingRootClaims(root)).toBe(0);

    (root.classList as any).toggle = origToggle;
  });

  it('DURABLE CANARY 15: dark double-failure, compact repair/release, external dark, then dark claim/release preserves dark', () => {
    const origToggle = root.classList.toggle.bind(root.classList);

    // First failure: dark toggle mutates and the silent-no-op rollback leaves
    // a recovery tombstone in the registry channel.
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === true) {
        origToggle.call(this, token, force);
        throw new Error('mutate toggle boom');
      }
      if (token === 'dark' && force === false) {
        return undefined;
      }
      return origToggle.call(this, token, force);
    };

    try {
      let caught: unknown;
      try {
        claimRootClass(root, 'dark', true);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(AggregateError);
      expect(root.classList.contains('dark')).toBe(true);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    // Second failure: retrying dark while repair is broken keeps the tombstone.
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === false) {
        throw new Error('repair toggle boom');
      }
      return origToggle.call(this, token, force);
    };

    try {
      expect(() => claimRootClass(root, 'dark', true)).toThrow(/pending class token recovery failed/);
      expect(root.classList.contains('dark')).toBe(true);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    // A different token claim repairs dark through the registry and drains.
    const compact = claimRootClass(root, 'compact', true);
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.classList.contains('compact')).toBe(true);
    compact();
    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);

    // External dark reappears; a new dark claim must preserve it as baseline.
    root.className = 'dark';

    const dark = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);
    dark();
    expect(root.className).toBe('dark');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 16: failed dark release retried, then compact claim/release leaves class absent and dark false', () => {
    const release = claimRootClass(root, 'dark', true);
    expect(root.classList.contains('dark')).toBe(true);

    const origToggle = root.classList.toggle.bind(root.classList);
    let shouldThrow = true;
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (shouldThrow && token === 'dark' && force === false) {
        throw new Error('release toggle boom');
      }
      return origToggle.call(this, token, force);
    };

    try {
      expect(() => release()).toThrow('release toggle boom');
      expect(root.classList.contains('dark')).toBe(true);
      expect(outstandingRootClaims(root)).toBe(1);

      shouldThrow = false;
      release();
      expect(root.hasAttribute('class')).toBe(false);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    const compact = claimRootClass(root, 'compact', true);
    expect(root.classList.contains('dark')).toBe(false);
    compact();
    expect(root.hasAttribute('class')).toBe(false);
    expect(root.classList.contains('dark')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 17: transient repair release fails and retry reuses the same handle, then compact drains', () => {
    const origToggle = root.classList.toggle.bind(root.classList);

    // First failure: dark toggle mutates and the silent-no-op rollback leaves
    // a tombstone with dark still present in the DOM.
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === true) {
        origToggle.call(this, token, force);
        throw new Error('mutate toggle boom');
      }
      if (token === 'dark' && force === false) {
        return undefined;
      }
      return origToggle.call(this, token, force);
    };

    try {
      let caught: unknown;
      try {
        claimRootClass(root, 'dark', true);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(AggregateError);
      expect(root.classList.contains('dark')).toBe(true);
      expect(outstandingRootClaims(root)).toBe(0);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    // Force the transient repair release to fail: allow the first
    // repair-recovery toggle(false) to drain dark, then throw on the release's
    // restore-to-absent toggle(false).
    let darkFalseCalls = 0;
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === false) {
        darkFalseCalls += 1;
        if (darkFalseCalls === 2) {
          throw new Error('transient release toggle boom');
        }
      }
      return origToggle.call(this, token, force);
    };

    try {
      expect(() => claimRootClass(root, 'compact', true)).toThrow(/pending class token recovery failed/);
      expect(root.classList.contains('dark')).toBe(false);
      // The transient claim handle is retained, so the zombie entry stays at
      // outstanding=1 until the retry reuses and releases it.
      expect(outstandingRootClaims(root)).toBe(1);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    // Retry must reuse the stored transient handle, not spawn a second claim.
    const compact = claimRootClass(root, 'compact', true);
    expect(root.classList.contains('compact')).toBe(true);
    compact();
    expect(root.hasAttribute('class')).toBe(false);
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DURABLE CANARY 18: transient repair release fails with foreign host, retry preserves host and drains', () => {
    const origToggle = root.classList.toggle.bind(root.classList);

    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === true) {
        origToggle.call(this, token, force);
        throw new Error('mutate toggle boom');
      }
      if (token === 'dark' && force === false) {
        return undefined;
      }
      return origToggle.call(this, token, force);
    };

    try {
      let caught: unknown;
      try {
        claimRootClass(root, 'dark', true);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(AggregateError);
      expect(root.classList.contains('dark')).toBe(true);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    root.classList.add('host');

    let darkFalseCalls = 0;
    (root.classList as any).toggle = function (
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ) {
      if (token === 'dark' && force === false) {
        darkFalseCalls += 1;
        if (darkFalseCalls === 2) {
          throw new Error('transient release toggle boom');
        }
      }
      return origToggle.call(this, token, force);
    };

    try {
      expect(() => claimRootClass(root, 'compact', true)).toThrow(/pending class token recovery failed/);
      expect(root.classList.contains('dark')).toBe(false);
      expect(root.classList.contains('host')).toBe(true);
      expect(outstandingRootClaims(root)).toBe(1);
    } finally {
      (root.classList as any).toggle = origToggle;
    }

    const compact = claimRootClass(root, 'compact', true);
    expect(root.className).toBe('host compact');
    compact();
    expect(root.className).toBe('host');
    expect(outstandingRootClaims(root)).toBe(0);
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
