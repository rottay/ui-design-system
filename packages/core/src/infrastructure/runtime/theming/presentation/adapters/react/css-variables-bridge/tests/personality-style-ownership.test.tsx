/**
 * @fileoverview Personality stylesheet ownership - Rottay Design System
 * @description The bridge writes into a SINGLETON node,
 * `#ds-personality-tokens`, which several mounted bridges may hold at once.
 * Every test here is about that node's ownership rather than its contents: who
 * may write it, who must be left alone, and what the DOM must look like once
 * the last bridge lets go.
 *
 * Three laws are pinned, each against the defect that produced it.
 *
 * ONE CREATOR. The bridge writes only into a node it created itself. Adoption
 * used to be allowed on a reproducibility test -- if reassigning the node's text
 * re-parsed to the rules it carried, the node was taken over, marked, written
 * into, and "restored" on release. That admits any stylesheet whose author used
 * `textContent`, and the restore is itself a mutation of a node the bridge does
 * not own. Nothing in this repository emits that id, so an incumbent is by
 * definition unrecognized and is now left exactly as found.
 *
 * EQUAL HOLDS. The channel repaints only when every active hold agrees on the
 * exact key. The previous law privileged whichever bridge established the
 * claim, which decided a document's personality by mount order in three
 * separate ways: the establisher repainted on drift while a joiner was refused
 * for the same drift; a divergent joiner was not counted as a holder at all, so
 * the establisher's unmount tore the channel down under a bridge still
 * rendering against it; and a joiner that outlived the establisher was left a
 * permanent non-writer whose later changes never reached the DOM.
 *
 * OWNERSHIP RE-PROVED PER MUTATION. Registry claim, unique id, exact element,
 * ownership mark and the exact stylesheet are checked before every write, not
 * once at claim time. The repaint path used to check none of them, so a node
 * taken over after the claim was still written into.
 *
 * That last law has two ends, and each is a drill of its own below because
 * per-mutation PREconditions do not reach either of them.
 *
 * A precondition guards the mutation that follows it, so the final mutation in
 * a write -- the last `setProperty`, or the cascade attribute when there is
 * nothing to set -- has no check after it. A takeover landing during that one
 * was reported as a completed write, and the caller then recorded the key as
 * published; the "already published" shortcut would skip the repair forever
 * after. The writer now proves ownership once more after its last byte, and
 * `agreedKey` advances only on that.
 *
 * The mirror at teardown: the final release proved ownership, deleted the
 * registry entry, and only then removed the node. But the live registry entry
 * is PART of what that proof means, so the removal ran under a claim the
 * document had already stopped naming. The node now goes while the claim is
 * still on record, and the entry is retired afterwards in `finally`.
 *
 * The earlier teardown failures remain pinned below: the first of two bridges
 * unmounting used to remove the sheet the second still relied on, a foreign
 * actor that took the id over was still torn down by our cleanup, and under
 * `StrictMode` the mount/unmount/mount drill left the bridge INERT because a
 * `lastKeyRef` guard treated the second setup as redundant after the first
 * cleanup had already removed the node. That last one is not a corner case:
 * `StrictMode` is the default development posture, so personality simply did
 * not apply in dev.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrictMode, useLayoutEffect } from 'react';
import { render, cleanup } from '@testing-library/react';

import { SystemCssVariablesBridge } from '..';
import { DEFAULT_PERSONALITY } from '@/infrastructure/runtime/personality/foundation/defaults';

const STYLE_ID = 'ds-personality-tokens';
const OWNER_ATTRIBUTE = 'data-ds-owner';
const OWNER = 'ds-personality-bridge';
const CASCADE_ATTRIBUTE = 'data-ds-cascade';

/**
 * The bridge's document-scoped claim registry. Reached directly here for two
 * reasons: a drill has to be able to corrupt it to prove the write path checks
 * it, and every test has to be able to clear it, since wiping `document.head`
 * removes the node a claim describes without telling the claim.
 */
const CLAIM_PROPERTY = Symbol.for('rottay.design-system.personality-style-claim');

function claimRegistry(): Record<symbol, unknown> {
  return document as unknown as Record<symbol, unknown>;
}

type Personality = typeof DEFAULT_PERSONALITY;

let currentTokens = makeTokens(DEFAULT_PERSONALITY);

function makeTokens(personality: Personality) {
  return {
    colors: { primary: '#4f46e5' },
    personality,
    transitions: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  };
}

vi.mock('@/infrastructure/runtime/theming/composition/react/tokens', () => ({
  useTokens: () => currentTokens,
}));

function styleElement(): HTMLStyleElement | null {
  return document.getElementById(STYLE_ID) as HTMLStyleElement | null;
}

/** The declarations the bridge actually published, via the rule it wrote. */
function publishedValue(name: string): string {
  const rule = styleElement()?.sheet?.cssRules[0] as CSSStyleRule | undefined;
  return rule?.style.getPropertyValue(name) ?? '';
}

/** The `:root` rule the bridge published into, or `undefined` if it published none. */
function publishedRule(): CSSStyleRule | undefined {
  return styleElement()?.sheet?.cssRules[0] as CSSStyleRule | undefined;
}

/** Whatever the claim registry currently names, for the drills that read it. */
function liveClaim(): unknown {
  return claimRegistry()[CLAIM_PROPERTY];
}

/**
 * Swaps the object `.sheet` answers with, leaving the node, its id and its
 * ownership mark exactly as they were.
 *
 * This is the takeover node identity cannot detect. `.sheet` is an accessor, so
 * every other leg of the ownership proof still passes while the object a write
 * would land in is somebody else's. Only the identity the claim RECORDED can
 * tell the difference.
 */
function replaceSheet(element: HTMLStyleElement): void {
  const impostor = {} as CSSStyleSheet;
  Object.defineProperty(element, 'sheet', {
    get: () => impostor,
    configurable: true,
  });
}

/**
 * The variable the bridge writes LAST, read back off a clean publish rather
 * than guessed at.
 *
 * The write postcondition is about the FINAL mutation specifically, so a drill
 * aimed at it has to know which mutation that is -- and the sheet is the only
 * authority on the order the bridge actually used. Hard-coding a name here
 * would pin the drill to today's resolver output and quietly stop aiming at the
 * last write the moment a variable was added after it.
 */
function lastPublishedName(): string {
  const probe = render(<SystemCssVariablesBridge />);
  const declaration = publishedRule()?.style;
  const name = declaration?.item((declaration?.length ?? 0) - 1) ?? '';
  probe.unmount();
  resetDom();
  expect(name).not.toBe('');
  return name;
}

/**
 * Returns the document to a state with no personality channel in it -- BOTH
 * halves of that, because they can come apart. Wiping `document.head` removes
 * the node a claim describes without telling the claim, so a registry entry
 * left behind would have the next test joining a claim whose element is gone.
 */
function resetDom() {
  document.head.innerHTML = '';
  document.documentElement.removeAttribute('style');
  delete claimRegistry()[CLAIM_PROPERTY];
}

describe('personality stylesheet ownership', () => {
  beforeEach(() => {
    currentTokens = makeTokens(DEFAULT_PERSONALITY);
    resetDom();
  });

  afterEach(() => {
    cleanup();
    resetDom();
  });

  describe('StrictMode', () => {
    /* `StrictMode` is the default development posture, so the bridge has to be
       exact under it -- and the failure it once produced was silent and
       development-only, which is where every human looks at the product.

       What these drills do NOT claim is that React replays this bridge's setup.
       The claim lifecycle is a `useInsertionEffect`, and insertion effects are
       not double-invoked under `StrictMode` the way passive and layout effects
       are. So what is pinned here is the OUTCOME under the development default
       -- one node, published values, clean teardown -- not a replay React does
       not perform. Idempotency of setup after its own cleanup is a real
       property of the bridge, and it is proved directly by the explicit remount
       drill below rather than inferred from a mode. */
    it('applies personality under the development default', () => {
      render(
        <StrictMode>
          <SystemCssVariablesBridge />
        </StrictMode>,
      );

      expect(styleElement()).not.toBeNull();
      expect(publishedValue('--ds-personality-animation-entrance')).toBe(
        DEFAULT_PERSONALITY.animation.entrance,
      );
    });

    it('leaves exactly one stylesheet behind', () => {
      render(
        <StrictMode>
          <SystemCssVariablesBridge />
        </StrictMode>,
      );

      expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
    });

    it('removes it on unmount all the same', () => {
      const { unmount } = render(
        <StrictMode>
          <SystemCssVariablesBridge />
        </StrictMode>,
      );

      unmount();

      expect(styleElement()).toBeNull();
    });
  });

  describe('remount', () => {
    /* Setup has to be idempotent after its OWN cleanup, and that is a property
       of the bridge rather than of any React development mode -- so it is
       proved with a real teardown followed by a real fresh mount instead of
       being read off `StrictMode`. The first release removes the node and
       retires the claim; the second mount has to build both again rather than
       treat the channel as already established. A `lastKeyRef` guard once
       treated that second setup as redundant and left the bridge INERT -- no
       node, no values -- and nothing observable about the first mount could
       have shown it. */
    it('rebuilds the channel after a full unmount', () => {
      const first = render(<SystemCssVariablesBridge />);
      const firstElement = styleElement();
      expect(firstElement).not.toBeNull();

      first.unmount();
      expect(styleElement()).toBeNull();
      expect(liveClaim()).toBeUndefined();

      render(<SystemCssVariablesBridge />);

      const second = styleElement();
      expect(second).not.toBeNull();
      // A fresh node, not the first one put back: the claim never adopts, so a
      // remount is a creation and the identity is the evidence of it.
      expect(second).not.toBe(firstElement);
      expect(publishedValue('--ds-personality-animation-entrance')).toBe(
        DEFAULT_PERSONALITY.animation.entrance,
      );
      expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
    });
  });

  describe('concurrent holders', () => {
    /* Two bridges in one document is not a misconfiguration to punish: a
       preview tree, a portal, or a second provider mounted beside the first
       all produce it. `:root` is a document-level selector, so the document
       has exactly one personality channel and the holders necessarily share
       the node -- which is precisely why the LAST one has to be the one that
       tears it down. */
    it('keeps the stylesheet alive while another bridge still holds it', () => {
      const first = render(<SystemCssVariablesBridge />);
      render(<SystemCssVariablesBridge />);

      first.unmount();

      expect(styleElement()).not.toBeNull();
      expect(publishedValue('--ds-personality-animation-entrance')).toBe(
        DEFAULT_PERSONALITY.animation.entrance,
      );
    });

    it('removes it once the last holder lets go', () => {
      const first = render(<SystemCssVariablesBridge />);
      const second = render(<SystemCssVariablesBridge />);

      first.unmount();
      second.unmount();

      expect(styleElement()).toBeNull();
    });

    it('does not stack one stylesheet per holder', () => {
      render(<SystemCssVariablesBridge />);
      render(<SystemCssVariablesBridge />);

      expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
    });
  });

  describe('unrecognized predecessor', () => {
    /* Nothing in this repository emits `#ds-personality-tokens` -- no SSR pass,
       no artifact, no provider -- so a node already sitting there is by
       definition something the bridge does not recognize, and writing into it
       is a guess about a stylesheet somebody else authored.

       The bridge used to guess. It proved the node's text re-parsed to the
       rules it carried and treated that as a title deed, which admits any sheet
       whose author happened to use `textContent`; then it tried to make the
       guess reversible by snapshotting and restoring, which is itself a
       mutation of a node we do not own and can only ever be as exact as the
       snapshot was lucky. Refusing costs a subordinate data channel. Adopting
       risks somebody else's. */

    /** A node already sitting at the bridge's id, with its own text, attributes and anchor. */
    function mountPredecessor() {
      const before = document.createElement('meta');
      before.setAttribute('name', 'before');
      const after = document.createElement('meta');
      after.setAttribute('name', 'after');
      const predecessor = document.createElement('style');
      predecessor.id = STYLE_ID;
      predecessor.setAttribute('media', 'all');
      predecessor.setAttribute('data-legacy', 'ssr');
      predecessor.textContent = ':root { --ds-legacy-marker: 1; }';

      document.head.append(before, predecessor, after);
      return { before, predecessor, after };
    }

    it('neither adopts it nor mounts a second sheet beside it', () => {
      const { predecessor } = mountPredecessor();

      render(<SystemCssVariablesBridge />);

      expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
      expect(styleElement()).toBe(predecessor);
    });

    it('publishes nothing rather than into a node it did not create', () => {
      mountPredecessor();

      render(<SystemCssVariablesBridge />);

      expect(publishedValue('--ds-personality-animation-entrance')).toBe('');
    });

    it('never marks a node it refused', () => {
      const { predecessor } = mountPredecessor();

      render(<SystemCssVariablesBridge />);

      expect(predecessor.hasAttribute(OWNER_ATTRIBUTE)).toBe(false);
      expect(predecessor.hasAttribute(CASCADE_ATTRIBUTE)).toBe(false);
    });

    it('announces the refusal instead of losing personality in silence', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        mountPredecessor();

        render(<SystemCssVariablesBridge />);

        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('no predecessor this bridge is entitled to adopt'),
        );
      } finally {
        warn.mockRestore();
      }
    });

    it('leaves the node byte, attribute and position exact across the whole lifetime', () => {
      const { before, predecessor, after } = mountPredecessor();
      const { unmount } = render(<SystemCssVariablesBridge />);

      unmount();

      // The same node, not a reconstruction: whoever put it there may still
      // hold a reference to it.
      expect(document.getElementById(STYLE_ID)).toBe(predecessor);
      expect(predecessor.textContent).toBe(':root { --ds-legacy-marker: 1; }');
      expect(predecessor.getAttributeNames().sort()).toEqual([
        'data-legacy',
        'id',
        'media',
      ]);
      expect(predecessor.getAttribute('media')).toBe('all');
      expect(predecessor.previousSibling).toBe(before);
      expect(predecessor.nextSibling).toBe(after);
    });

    /* A duplicate id is the state in which writing is least safe and easiest to
       miss: `getElementById` answers with the FIRST match and says nothing about
       a second, so a bridge that asked it would write into whichever node the
       document happened to name. The lookup is a selector for exactly this. */
    it('refuses a document carrying more than one node at that id', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const first = document.createElement('style');
        first.id = STYLE_ID;
        const second = document.createElement('style');
        second.id = STYLE_ID;
        document.head.append(first, second);

        render(<SystemCssVariablesBridge />);

        expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(2);
        expect(first.hasAttribute(OWNER_ATTRIBUTE)).toBe(false);
        expect(second.hasAttribute(OWNER_ATTRIBUTE)).toBe(false);
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('more than one node at that id'),
        );
      } finally {
        warn.mockRestore();
      }
    });
  });

  describe('predecessor rules', () => {
    /* These fixtures are the reason adoption was retired rather than repaired,
       kept as drills because each one is a way the old reproducibility check
       said yes to a node it could not put back.

       A stylesheet's rules and its text are two different things, and the
       bridge used to conflate them: it snapshotted `textContent`, wiped the
       sheet with `deleteRule` to write its own rule, and restored the text.
       That round-trips a text-authored sheet and PERMANENTLY DESTROYS a
       CSSOM-authored one -- rules inserted through `insertRule` leave no text
       behind, so there is nothing for the restore to re-parse. A null sheet
       reads as "no rules to lose" and got adopted on those grounds. An empty
       node re-parsed to nothing and got adopted too.

       None of them are adopted now, and what each drill pins is that the node
       comes out the far side of a mount/unmount cycle exactly as it went in. */

    /** A predecessor whose rules exist only in the CSSOM, with no text at all. */
    function mountCssomPredecessor() {
      const predecessor = document.createElement('style');
      predecessor.id = STYLE_ID;
      document.head.appendChild(predecessor);
      predecessor.sheet?.insertRule(':root { --ds-cssom-only: 1; }', 0);
      return predecessor;
    }

    function ruleTexts(element: HTMLStyleElement): string[] {
      return Array.from(element.sheet?.cssRules ?? [], (rule) => rule.cssText);
    }

    it('refuses a predecessor whose rules exist only in the CSSOM', () => {
      const predecessor = mountCssomPredecessor();

      render(<SystemCssVariablesBridge />);

      expect(ruleTexts(predecessor)).toEqual([':root { --ds-cssom-only: 1; }']);
      expect(predecessor.hasAttribute(OWNER_ATTRIBUTE)).toBe(false);
      expect(predecessor.hasAttribute('data-ds-cascade')).toBe(false);
      expect(publishedValue('--ds-personality-animation-entrance')).toBe('');
    });

    it('still has those rules after the refusing bridge unmounts', () => {
      const predecessor = mountCssomPredecessor();
      const { unmount } = render(<SystemCssVariablesBridge />);

      unmount();

      expect(document.getElementById(STYLE_ID)).toBe(predecessor);
      expect(ruleTexts(predecessor)).toEqual([':root { --ds-cssom-only: 1; }']);
    });

    it('refuses a predecessor whose text does not account for every rule', () => {
      // Text-authored AND CSSOM-extended: restoring the text would put the
      // first rule back and silently drop the second.
      const predecessor = document.createElement('style');
      predecessor.id = STYLE_ID;
      predecessor.textContent = ':root { --ds-authored: 1; }';
      document.head.appendChild(predecessor);
      predecessor.sheet?.insertRule(':root { --ds-appended: 2; }', 1);

      render(<SystemCssVariablesBridge />);

      expect(ruleTexts(predecessor)).toEqual([
        ':root { --ds-authored: 1; }',
        ':root { --ds-appended: 2; }',
      ]);
      expect(predecessor.hasAttribute(OWNER_ATTRIBUTE)).toBe(false);
      expect(publishedValue('--ds-personality-animation-entrance')).toBe('');
    });

    /* The one case the old restore actually handled -- text-authored, so
       reassigning the text re-parses it -- and it is refused all the same. That
       a round trip HAPPENS to be lossless for this fixture is not a licence to
       take the node: the bridge cannot tell this shape apart from the two above
       without inspecting a stylesheet it has no authority over. */
    it('does not round-trip even the text-backed predecessor it could restore', () => {
      const predecessor = document.createElement('style');
      predecessor.id = STYLE_ID;
      predecessor.textContent = ':root { --ds-legacy-marker: 1; }';
      document.head.appendChild(predecessor);

      const { unmount } = render(<SystemCssVariablesBridge />);
      expect(publishedValue('--ds-personality-animation-entrance')).toBe('');
      expect(predecessor.hasAttribute(OWNER_ATTRIBUTE)).toBe(false);

      unmount();

      expect(document.getElementById(STYLE_ID)).toBe(predecessor);
      expect(ruleTexts(predecessor)).toEqual([':root { --ds-legacy-marker: 1; }']);
    });

    /**
     * A connected `<style>` whose stylesheet does not exist.
     *
     * Real producers: a `type` a browser does not recognize as CSS, a shim
     * standing in for the node, an implementation that has not attached a sheet
     * yet. `happy-dom` honors none of those -- it parses the text regardless --
     * so the fixture states the condition directly. The subject of the drill is
     * the null sheet, not the route to it.
     */
    function mountSheetlessPredecessor(): HTMLStyleElement {
      const predecessor = document.createElement('style');
      predecessor.id = STYLE_ID;
      predecessor.textContent = ':root { --ds-shimmed: 1; }';
      document.head.appendChild(predecessor);
      Object.defineProperty(predecessor, 'sheet', {
        get: () => null,
        configurable: true,
      });
      return predecessor;
    }

    /** Lifts the shim: the node's real stylesheet appears, as it would in life. */
    function materializeSheet(element: HTMLStyleElement): void {
      delete (element as unknown as { sheet?: unknown }).sheet;
    }

    /* A null sheet reads as "no rules to lose", which is how a node the bridge
       can never write into was adopted anyway: marked as owned, then published
       to in silence -- `writePersonalityDeclarations` returned at the same null
       check -- so personality was simply absent with nothing said.

       It is refused now for the ordinary reason, not a special one: something
       occupies the id and there is no predecessor this bridge may adopt. The
       null sheet never has to be reasoned about at all, which is the point. */
    it('refuses a predecessor that carries no stylesheet at all', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const predecessor = mountSheetlessPredecessor();
        expect(predecessor.sheet).toBeNull();

        render(<SystemCssVariablesBridge />);

        expect(predecessor.hasAttribute(OWNER_ATTRIBUTE)).toBe(false);
        expect(predecessor.hasAttribute(CASCADE_ATTRIBUTE)).toBe(false);
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('no predecessor this bridge is entitled to adopt'),
        );
      } finally {
        warn.mockRestore();
      }
    });

    /* And the reason refusing is not merely tidier than adopting: the snapshot
       an adoption takes records ZERO rules, because zero is all a null sheet can
       report. Let the sheet appear before the last holder leaves and the restore
       replays that record over live rules -- the CSSOM destruction this suite
       already pins, reached through a door the reproducibility check never
       looked at. */
    it('leaves its rules intact once the sheet materializes after the refusal', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const predecessor = mountSheetlessPredecessor();
        const { unmount } = render(<SystemCssVariablesBridge />);

        materializeSheet(predecessor);
        expect(ruleTexts(predecessor)).toEqual([':root { --ds-shimmed: 1; }']);

        unmount();

        expect(document.getElementById(STYLE_ID)).toBe(predecessor);
        expect(ruleTexts(predecessor)).toEqual([':root { --ds-shimmed: 1; }']);
      } finally {
        warn.mockRestore();
      }
    });

    it('leaves an empty predecessor empty rather than filling it in', () => {
      // Nothing to lose here, which is exactly why this node used to be
      // adopted -- and then the restore had to clear the bridge's own rule
      // explicitly, because assigning empty text re-parses nothing. An empty
      // sheet is still somebody's sheet; the id being free is what makes a node
      // the bridge's, and this id is not free.
      const predecessor = document.createElement('style');
      predecessor.id = STYLE_ID;
      document.head.appendChild(predecessor);
      const { unmount } = render(<SystemCssVariablesBridge />);
      expect(predecessor.hasAttribute(OWNER_ATTRIBUTE)).toBe(false);

      unmount();

      expect(document.getElementById(STYLE_ID)).toBe(predecessor);
      expect(ruleTexts(predecessor)).toEqual([]);
    });
  });

  describe('divergent claim', () => {
    /* An id is not a title deed. If someone else has already declared
       ownership of this node, writing into it would make two authorities
       disagree about one sheet -- and our cleanup would then delete theirs.
       Refusing is the only honest option; personality is a subordinate data
       channel, so losing it is strictly better than corrupting a node we do
       not own. */
    it('refuses a node that declares a different owner', () => {
      const foreign = document.createElement('style');
      foreign.id = STYLE_ID;
      foreign.setAttribute(OWNER_ATTRIBUTE, 'some-other-authority');
      foreign.textContent = ':root { --foreign: 1; }';
      document.head.appendChild(foreign);

      render(<SystemCssVariablesBridge />);

      expect(foreign.textContent).toBe(':root { --foreign: 1; }');
      expect(foreign.getAttribute(OWNER_ATTRIBUTE)).toBe('some-other-authority');
      expect(foreign.hasAttribute('data-ds-cascade')).toBe(false);
      expect(publishedValue('--ds-personality-animation-entrance')).toBe('');
    });

    it('leaves that node in place on unmount too', () => {
      const foreign = document.createElement('style');
      foreign.id = STYLE_ID;
      foreign.setAttribute(OWNER_ATTRIBUTE, 'some-other-authority');
      document.head.appendChild(foreign);

      const { unmount } = render(<SystemCssVariablesBridge />);
      unmount();

      expect(document.getElementById(STYLE_ID)).toBe(foreign);
    });

    /* Two holds publishing the SAME declarations share the channel happily;
       that is what the hold set is for. Two publishing DIFFERENT ones cannot
       both be right: `:root` is document-level, so the document has one
       personality channel and the showroom states the matching law for the
       axis above it -- exactly ONE tenant can own a DOM. Letting either one
       overwrite makes the winner a mount-order accident, which is the same
       silent-wrong-tenant failure the change key was fixed for. The channel
       keeps the last state they all agreed on, and the collision is stated. */
    it('refuses a second holder publishing different declarations', () => {
      render(<SystemCssVariablesBridge />);

      currentTokens = makeTokens({
        ...DEFAULT_PERSONALITY,
        animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.75 },
      });
      render(<SystemCssVariablesBridge />);

      expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(
        String(DEFAULT_PERSONALITY.animation.hoverScale),
      );
    });

    it('announces that refusal instead of failing silently', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(<SystemCssVariablesBridge />);
        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.75 },
        });
        render(<SystemCssVariablesBridge />);

        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('[design-system]'),
        );
      } finally {
        warn.mockRestore();
      }
    });

    it('does not let a divergent holder tear the channel down', () => {
      render(<SystemCssVariablesBridge />);

      currentTokens = makeTokens({
        ...DEFAULT_PERSONALITY,
        animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.75 },
      });
      const divergent = render(<SystemCssVariablesBridge />);
      divergent.unmount();

      expect(styleElement()).not.toBeNull();
      expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(
        String(DEFAULT_PERSONALITY.animation.hoverScale),
      );
    });

    it('still joins a second holder publishing identical declarations', () => {
      const first = render(<SystemCssVariablesBridge />);
      render(<SystemCssVariablesBridge />);

      first.unmount();

      expect(styleElement()).not.toBeNull();
    });

    /* A divergent bridge is refused as a PUBLISHER and admitted as a HOLDER,
       which is the distinction the previous law collapsed. Turning it away
       entirely made it a non-holder, so when the establishing bridge unmounted
       the channel was torn down under a bridge that was still mounted and still
       rendering against it -- and the survivor then had no channel at all. */
    it('counts a divergent bridge as a holder, so the channel outlives the first', () => {
      const first = render(<SystemCssVariablesBridge />);

      currentTokens = makeTokens({
        ...DEFAULT_PERSONALITY,
        animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.75 },
      });
      render(<SystemCssVariablesBridge />);

      first.unmount();

      expect(styleElement()).not.toBeNull();
    });

    /* Divergence can also appear AFTER the claim: two bridges that agreed at
       mount stop agreeing when one of their token graphs changes. A hold that
       starts publishing on its own would win the channel by being the one whose
       props happened to move -- the same mount-order accident, arriving later.

       This drill and the one after it are the SAME drill from the two ends, and
       their bodies are deliberately identical. Under the previous law they were
       not: a joiner that drifted was refused, while the establisher that
       drifted repainted the shared channel and carried the key with it, in
       silence. Whichever bridge mounted first therefore decided the document's
       personality. The assertions below are the proof that end no longer
       matters. */
    it('withholds a joiner whose declarations drift apart after it joined', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(<SystemCssVariablesBridge />);
        const joiner = render(<SystemCssVariablesBridge />);
        expect(warn).not.toHaveBeenCalled();

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        joiner.rerender(<SystemCssVariablesBridge />);

        // The last state every hold agreed on, kept rather than replaced.
        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(
          String(DEFAULT_PERSONALITY.animation.hoverScale),
        );
        // Not published AND not silent: a tree rendering against a tenant the
        // document does not carry is the failure this announces.
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('the mounted bridges publish different declarations'),
        );
      } finally {
        warn.mockRestore();
      }
    });

    it('withholds the establishing bridge on exactly the same terms', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const establisher = render(<SystemCssVariablesBridge />);
        render(<SystemCssVariablesBridge />);
        expect(warn).not.toHaveBeenCalled();

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        establisher.rerender(<SystemCssVariablesBridge />);

        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(
          String(DEFAULT_PERSONALITY.animation.hoverScale),
        );
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('the mounted bridges publish different declarations'),
        );
      } finally {
        warn.mockRestore();
      }
    });

    /* Withholding is not freezing. The channel keeps the last agreed state
       while the holds disagree, and the moment they agree again -- on anything,
       including a key that was never published before -- that agreement is what
       reaches the DOM. Without this, a single transient disagreement would
       strand the document on stale values for good. */
    it('repaints as soon as every hold agrees again', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const first = render(<SystemCssVariablesBridge />);
        const second = render(<SystemCssVariablesBridge />);

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        second.rerender(<SystemCssVariablesBridge />);
        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(
          String(DEFAULT_PERSONALITY.animation.hoverScale),
        );

        first.rerender(<SystemCssVariablesBridge />);

        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe('1.9');
      } finally {
        warn.mockRestore();
      }
    });

    /* A departure is a publishing event, not just teardown: two holds that
       disagreed leave one hold that agrees with itself. Treating release as
       teardown-only is what left a survivor publishing nothing for the rest of
       its life -- its later changes reached the registry and never the DOM. */
    it('lets the survivor publish once the hold it disagreed with leaves', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const leaving = render(<SystemCssVariablesBridge />);
        const survivor = render(<SystemCssVariablesBridge />);

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        survivor.rerender(<SystemCssVariablesBridge />);
        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(
          String(DEFAULT_PERSONALITY.animation.hoverScale),
        );

        leaving.unmount();

        expect(styleElement()).not.toBeNull();
        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe('1.9');
      } finally {
        warn.mockRestore();
      }
    });

    /* And the survivor keeps publishing afterwards, which is the half that
       actually killed the previous law: being stranded is not a state you
       observe at the moment of the unmount, it is every change that comes
       after it. */
    it('keeps the survivor writing on its next change too', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const leaving = render(<SystemCssVariablesBridge />);
        const survivor = render(<SystemCssVariablesBridge />);
        leaving.unmount();

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.6 },
        });
        survivor.rerender(<SystemCssVariablesBridge />);

        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe('1.6');
      } finally {
        warn.mockRestore();
      }
    });

    /* Every write effect is replayed in development, and with a second hold
       attached that is a write while the hold set is larger than one -- which
       is why the announcement is conditioned on the holds actually DISAGREEING
       rather than on the size of the set. Warning on the replay would put a
       collision notice in every dev console that mounts two bridges. */
    it('stays quiet with two identical holders under StrictMode', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(
          <StrictMode>
            <SystemCssVariablesBridge />
            <SystemCssVariablesBridge />
          </StrictMode>,
        );

        expect(warn).not.toHaveBeenCalled();
        expect(publishedValue('--ds-personality-animation-entrance')).toBe(
          DEFAULT_PERSONALITY.animation.entrance,
        );
      } finally {
        warn.mockRestore();
      }
    });

    it('says nothing when the only hold in the document moves', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const only = render(<SystemCssVariablesBridge />);

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        only.rerender(<SystemCssVariablesBridge />);

        // A tenant switch under a single bridge is the ordinary case, not a
        // collision. A warning here would be noise, and noise is how a real
        // announcement stops being read.
        expect(warn).not.toHaveBeenCalled();
        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe('1.9');
      } finally {
        warn.mockRestore();
      }
    });
  });

  describe('foreign takeover after the claim', () => {
    it('does not remove a node that replaced the one it claimed', () => {
      const { unmount } = render(<SystemCssVariablesBridge />);
      const claimed = styleElement();
      expect(claimed).not.toBeNull();

      // Someone else takes the id over mid-flight.
      claimed?.remove();
      const usurper = document.createElement('style');
      usurper.id = STYLE_ID;
      usurper.textContent = ':root { --usurper: 1; }';
      document.head.appendChild(usurper);

      unmount();

      expect(document.getElementById(STYLE_ID)).toBe(usurper);
      expect(usurper.textContent).toBe(':root { --usurper: 1; }');
    });

    it('does not remove its own node once the ownership mark is gone', () => {
      const { unmount } = render(<SystemCssVariablesBridge />);
      const claimed = styleElement();

      // The mark is the handshake. Without it, this node is somebody else's.
      claimed?.setAttribute(OWNER_ATTRIBUTE, 'some-other-authority');

      unmount();

      expect(document.getElementById(STYLE_ID)).toBe(claimed);
    });

    /* Removal is the loud half of the takeover law and the easy half to pin.
       The quiet half is the REPAINT: a claim taken at mount is not evidence of
       anything at the next token change, and the previous implementation
       checked none of this on that path -- it went straight to writing. Each
       drill below moves one leg of the proof out from under the claim and then
       forces a repaint. */

    it('writes nothing into a node that took the id over before a repaint', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const { rerender } = render(<SystemCssVariablesBridge />);
        const published = publishedRule() as CSSStyleRule;

        styleElement()?.remove();
        const usurper = document.createElement('style');
        usurper.id = STYLE_ID;
        usurper.textContent = ':root { --usurper: 1; }';
        document.head.appendChild(usurper);

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        rerender(<SystemCssVariablesBridge />);

        expect(usurper.textContent).toBe(':root { --usurper: 1; }');
        expect(usurper.hasAttribute(OWNER_ATTRIBUTE)).toBe(false);
        expect(usurper.hasAttribute(CASCADE_ATTRIBUTE)).toBe(false);
        // Not into the detached node it used to own, either.
        expect(
          published.style.getPropertyValue('--ds-personality-animation-hover-scale'),
        ).toBe(String(DEFAULT_PERSONALITY.animation.hoverScale));
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('no longer the node it owns'),
        );
      } finally {
        warn.mockRestore();
      }
    });

    it('writes nothing once the ownership mark is rewritten in place', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const { rerender } = render(<SystemCssVariablesBridge />);
        const claimed = styleElement() as HTMLStyleElement;

        // The subtlest takeover there is: same node, same id, same sheet.
        claimed.setAttribute(OWNER_ATTRIBUTE, 'some-other-authority');

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        rerender(<SystemCssVariablesBridge />);

        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(
          String(DEFAULT_PERSONALITY.animation.hoverScale),
        );
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('no longer the node it owns'),
        );
      } finally {
        warn.mockRestore();
      }
    });

    it('writes nothing once a second node appears at the id', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const { rerender } = render(<SystemCssVariablesBridge />);
        const duplicate = document.createElement('style');
        duplicate.id = STYLE_ID;
        document.head.appendChild(duplicate);

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        rerender(<SystemCssVariablesBridge />);

        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(
          String(DEFAULT_PERSONALITY.animation.hoverScale),
        );
        expect(duplicate.sheet?.cssRules).toHaveLength(0);
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('no longer the node it owns'),
        );
      } finally {
        warn.mockRestore();
      }
    });

    /* Sheet identity is the leg of the proof that node identity cannot stand
       in for. `.sheet` is an ACCESSOR, so the object every write actually lands
       in can be replaced while the id, the element and the ownership mark all
       stay exactly as they were -- and a bridge that only ever re-read `.sheet`
       would follow it there without noticing. The claim records the object. */

    it('writes nothing once the stylesheet is replaced under the claim', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const { rerender } = render(<SystemCssVariablesBridge />);
        const claimed = styleElement() as HTMLStyleElement;
        // Captured while it is still reachable: the shim hides the real one.
        const published = publishedRule() as CSSStyleRule;
        replaceSheet(claimed);

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        rerender(<SystemCssVariablesBridge />);

        expect(
          published.style.getPropertyValue('--ds-personality-animation-hover-scale'),
        ).toBe(String(DEFAULT_PERSONALITY.animation.hoverScale));
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('a different stylesheet than the one it was claimed against'),
        );
      } finally {
        warn.mockRestore();
      }
    });

    /* The registry entry is the FIRST leg of the ownership proof and the only
       one that leaves no trace on the element: node, id, ownership mark and
       stylesheet are all untouched here, and the single thing that moved is
       which claim the DOCUMENT names. A bridge that re-proved only what it can
       observe on the element would write straight through this and repaint a
       channel a successor had already taken over. */
    it('writes nothing once the registry names a different claim', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const { rerender } = render(<SystemCssVariablesBridge />);
        const settled = String(DEFAULT_PERSONALITY.animation.hoverScale);
        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(settled);

        claimRegistry()[CLAIM_PROPERTY] = { successor: true };

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        rerender(<SystemCssVariablesBridge />);

        // The sheet keeps the last state published under an intact claim.
        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(settled);
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('no longer the node it owns'),
        );
      } finally {
        warn.mockRestore();
      }
    });

    /* Joining is entry into a channel that will be written on the joiner's
       behalf, so it is proved against the same sheet identity every write is.
       A node whose stylesheet was replaced under the claim is not the thing the
       claim describes, whatever its id and mark still say. */
    it('refuses to join a claim whose stylesheet was replaced under it', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(<SystemCssVariablesBridge />);
        const claimed = styleElement() as HTMLStyleElement;
        replaceSheet(claimed);

        const joiner = render(<SystemCssVariablesBridge />);

        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('nothing sound to join'),
        );

        // Refused outright, so it never became a holder -- and a non-holder's
        // departure cannot tear the channel down on its way out.
        joiner.unmount();
        expect(document.getElementById(STYLE_ID)).toBe(claimed);
      } finally {
        warn.mockRestore();
      }
    });

    it('leaves the node in place when the final release finds a replaced sheet', () => {
      const { unmount } = render(<SystemCssVariablesBridge />);
      const claimed = styleElement() as HTMLStyleElement;
      replaceSheet(claimed);

      unmount();

      // Fail-closed and inert: the node stays, holding an id no later bridge
      // will adopt, rather than being deleted on a proof that no longer holds.
      expect(document.getElementById(STYLE_ID)).toBe(claimed);
      // The claim is retired all the same. It describes nothing now, and
      // leaving it on record would have the next bridge join a fiction.
      expect(liveClaim()).toBeUndefined();
    });
  });

  describe('takeover during the final mutation', () => {
    /* Every mutation in a write is preceded by an ownership proof, which leaves
       exactly one gap: a precondition guards the mutation that FOLLOWS it, so
       the last mutation in the sequence has nothing after it. A takeover
       landing there was reported as a completed write.

       That is not a cosmetic miscount. The caller records the key as published,
       and the "already published" shortcut then skips the repair -- for good.
       The sheet keeps a state no hold ever asked for and the bridge believes it
       is current. The postcondition is what makes `agreedKey` mean "this key is
       intact in the sheet" rather than "this key was attempted". */

    /**
     * Strips the ownership mark from inside the bridge's LAST `setProperty`,
     * which is the one moment no precondition can see. One-shot: the drill is
     * about the repair that follows, and a shim that fired on every pass would
     * make the repair impossible rather than merely unnecessary.
     *
     * @returns How many complete write passes reached the final declaration.
     */
    function takeOverDuringFinalWrite(name: string): { passes: () => number } {
      let passes = 0;
      const real = CSSStyleDeclaration.prototype.setProperty;
      vi.spyOn(CSSStyleDeclaration.prototype, 'setProperty').mockImplementation(
        function (
          this: CSSStyleDeclaration,
          property: string,
          value: string | null,
          priority?: string,
        ) {
          real.call(this, property, value, priority);
          if (property !== name) return;
          passes += 1;
          if (passes === 1) {
            styleElement()?.setAttribute(OWNER_ATTRIBUTE, 'some-other-authority');
          }
        },
      );
      return { passes: () => passes };
    }

    it('does not record a write a takeover interrupted at its last byte', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const finalName = lastPublishedName();
        const write = takeOverDuringFinalWrite(finalName);

        render(<SystemCssVariablesBridge />);
        expect(write.passes()).toBe(1);

        // Ownership handed back, and a second bridge joins publishing exactly
        // the key the interrupted write was carrying. If that write had been
        // recorded, reconciliation would take the "already published" shortcut
        // and the sheet would keep the state the takeover left behind.
        styleElement()?.setAttribute(OWNER_ATTRIBUTE, OWNER);
        render(<SystemCssVariablesBridge />);

        expect(write.passes()).toBe(2);
        expect(publishedValue('--ds-personality-animation-entrance')).toBe(
          DEFAULT_PERSONALITY.animation.entrance,
        );
      } finally {
        vi.restoreAllMocks();
        warn.mockRestore();
      }
    });

    /* A takeover landing EARLIER in the sequence -- here, inside the cascade
       attribute write -- is caught by the next precondition rather than by the
       postcondition, and this pins the other half of the same law: an abandoned
       write must also leave `agreedKey` unset, so the repair stays available.
       Keeping the old key would false-green it, since reconciliation would then
       take the "already published" shortcut over a sheet holding a partial
       state.
       ---
       The postcondition's other leg -- a takeover during the cascade attribute
       when there are NO declarations to set, making that attribute the final
       mutation -- is not reachable through this component: the resolver always
       yields a non-empty map, so the last `setProperty` is always the last
       mutation. That leg is covered by construction in the writer, not by a
       drill here, and this test does not claim otherwise. */
    it('repaints a key it abandoned rather than trusting a record it never made', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const { rerender } = render(<SystemCssVariablesBridge />);
        const claimed = styleElement() as HTMLStyleElement;
        const settled = String(DEFAULT_PERSONALITY.animation.hoverScale);
        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(settled);

        // Takes the node over from inside the cascade attribute write, early
        // enough that the NEXT precondition is what abandons the repaint.
        const setAttribute = vi
          .spyOn(claimed, 'setAttribute')
          .mockImplementation(function (this: HTMLStyleElement, name: string, value: string) {
            Element.prototype.setAttribute.call(this, name, value);
            if (name === CASCADE_ATTRIBUTE) {
              Element.prototype.setAttribute.call(
                this,
                OWNER_ATTRIBUTE,
                'some-other-authority',
              );
            }
          });

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        rerender(<SystemCssVariablesBridge />);
        setAttribute.mockRestore();

        // The sheet is emptied before the declarations go in, so an abandoned
        // write leaves it holding NEITHER key -- a state no hold asked for.
        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe('');

        // Ownership handed back, and the hold settles BACK on the key that was
        // last successfully published. This is the moment the record matters:
        // had the abandoned write left `agreedKey` still naming that key, the
        // "already published" shortcut would skip the repaint and the wreckage
        // above would stand for the rest of the document's life.
        claimed.setAttribute(OWNER_ATTRIBUTE, OWNER);
        currentTokens = makeTokens(DEFAULT_PERSONALITY);
        rerender(<SystemCssVariablesBridge />);

        expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(settled);
      } finally {
        warn.mockRestore();
      }
    });
  });

  describe('release ordering', () => {
    /* The final release used to prove ownership, delete the registry entry, and
       only then remove the node. But the live registry entry is PART of what
       that proof means -- `claimOwnsNode` reads it first -- so by the time the
       node was removed, the document no longer named the claim doing the
       removing. Re-asked at that instant, the proof would have answered no.

       This is the same law as the write postcondition, seen at teardown: a
       mutation is owned only if the claim holds at the moment it happens, not
       at some moment before it. The node goes while the claim is on record, and
       the entry is retired afterwards in `finally` so no exit path -- refusal,
       success, or a throw out of `remove()` -- leaves the registry naming a
       claim that has been let go. */

    it('removes the node while the registry still names the live claim', () => {
      const { unmount } = render(<SystemCssVariablesBridge />);
      const element = styleElement() as HTMLStyleElement;
      const claim = liveClaim();
      expect(claim).toBeDefined();

      let registryAtRemoval: unknown = 'remove() never ran';
      const remove = vi
        .spyOn(element, 'remove')
        .mockImplementation(function (this: HTMLStyleElement) {
          registryAtRemoval = liveClaim();
          Element.prototype.remove.call(this);
        });

      try {
        unmount();
      } finally {
        remove.mockRestore();
      }

      expect(registryAtRemoval).toBe(claim);
      expect(styleElement()).toBeNull();
    });

    it('retires the claim once the node is gone', () => {
      const { unmount } = render(<SystemCssVariablesBridge />);
      expect(liveClaim()).toBeDefined();

      unmount();

      expect(liveClaim()).toBeUndefined();
    });

    /* Retirement is CONDITIONAL, and this is the case that makes it so.
       `element.remove()` is not guaranteed to be the pristine DOM method: a
       test shim, an instrumentation layer or a host-patched DOM API can wrap it
       and run synchronously inside the call -- which is exactly what the spy
       below is standing in for. A MutationObserver is NOT that risk, and this
       drill does not claim it is: observer callbacks are delivered as
       microtasks once the removal has already returned, so they cannot land
       inside the `try` at all.

       Whatever does run there can claim the freshly vacated channel before the
       `finally` is reached. An unconditional `delete` would then retire the
       SUCCESSOR's entry -- a claim nobody released -- leaving a live bridge
       holding a claim the document no longer names, failing every ownership
       proof it goes on to make and publishing nothing for the rest of its life.
       A release retires its own entry or none. */
    it('leaves a successor claim taken during its own removal on record', () => {
      const { unmount } = render(<SystemCssVariablesBridge />);
      const element = styleElement() as HTMLStyleElement;
      const successor = { successor: true };

      const remove = vi
        .spyOn(element, 'remove')
        .mockImplementation(function (this: HTMLStyleElement) {
          Element.prototype.remove.call(this);
          claimRegistry()[CLAIM_PROPERTY] = successor;
        });

      try {
        unmount();
      } finally {
        remove.mockRestore();
      }

      expect(styleElement()).toBeNull();
      expect(liveClaim()).toBe(successor);
    });

    it('retires the claim on the refusal path too', () => {
      const { unmount } = render(<SystemCssVariablesBridge />);
      const claimed = styleElement() as HTMLStyleElement;
      claimed.setAttribute(OWNER_ATTRIBUTE, 'some-other-authority');

      unmount();

      expect(document.getElementById(STYLE_ID)).toBe(claimed);
      expect(liveClaim()).toBeUndefined();
    });
  });

  describe('pre-layout timing', () => {
    /* Under `useEffect` the order was inverted outright: descendants measured
       first and the variables that decide spacing, elevation and motion arrived
       afterwards, so a measured value could describe a frame that was never
       painted.

       What `useInsertionEffect` guarantees is the ordering against LAYOUT
       effects -- insertion effects for a commit run before any layout effect of
       that commit fires -- and that is exactly the guarantee this needs. It is
       NOT a promise to run before the commit's DOM mutations, and nothing in
       the bridge depends on one. The measurer is mounted BEFORE the bridge so
       tree order cannot be what makes this pass. */
    it('publishes before any layout effect in the same commit runs', () => {
      let seenAtLayout: string | null = null;

      function Measurer(): null {
        useLayoutEffect(() => {
          seenAtLayout = publishedValue('--ds-personality-animation-entrance');
        }, []);
        return null;
      }

      render(
        <>
          <Measurer />
          <SystemCssVariablesBridge />
        </>,
      );

      expect(seenAtLayout).toBe(DEFAULT_PERSONALITY.animation.entrance);
    });
  });

  describe('change detection', () => {
    /* The effect guard folded five scalars -- `colors.primary`, which the
       resolver never reads, plus four of the ~28 personality fields it does.
       Any tenant whose personality differed only in an unfolded field (hover
       scale, stagger, chart line style, letter spacing, ...) kept the previous
       tenant's variables painted, which is the exact leak this bridge exists
       to prevent. The guard now folds the resolved variable map itself, so it
       is exact by construction rather than by an inventory somebody has to
       keep up to date. */
    it('repaints when a personality field outside the old key changes', () => {
      const { rerender } = render(<SystemCssVariablesBridge />);
      expect(publishedValue('--ds-personality-animation-hover-scale')).toBe(
        String(DEFAULT_PERSONALITY.animation.hoverScale),
      );

      currentTokens = makeTokens({
        ...DEFAULT_PERSONALITY,
        animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.25 },
      });
      rerender(<SystemCssVariablesBridge />);

      expect(publishedValue('--ds-personality-animation-hover-scale')).toBe('1.25');
    });

    it('holds one claim across a repaint instead of churning the node', () => {
      const { rerender } = render(<SystemCssVariablesBridge />);
      const claimed = styleElement();

      currentTokens = makeTokens({
        ...DEFAULT_PERSONALITY,
        animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.25 },
      });
      rerender(<SystemCssVariablesBridge />);

      expect(styleElement()).toBe(claimed);
    });

    /* Checking the sheet once at claim time does not cover the life of the
       node: a repaint happens later, and by then something else may have
       detached the head's contents. `cssRules` of nothing throws, and a throw
       in a passive effect unmounts the tree -- an application taken down by a
       subordinate token channel. The node is stated as unwritable instead. */
    it('says so instead of throwing when the claimed node loses its sheet', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const { rerender } = render(<SystemCssVariablesBridge />);
        const claimed = styleElement();
        expect(claimed).not.toBeNull();
        Object.defineProperty(claimed as HTMLStyleElement, 'sheet', {
          get: () => null,
          configurable: true,
        });

        currentTokens = makeTokens({
          ...DEFAULT_PERSONALITY,
          animation: { ...DEFAULT_PERSONALITY.animation, hoverScale: 1.9 },
        });
        expect(() => rerender(<SystemCssVariablesBridge />)).not.toThrow();

        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('no longer carries a stylesheet'),
        );
      } finally {
        warn.mockRestore();
      }
    });
  });
});
