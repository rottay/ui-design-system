/**
 * F-20: the request's viewport reaches the first paint, and the server and the
 * browser agree about what that paint was.
 *
 * The provider used to seed its snapshot from `useState` and correct it in a
 * passive effect, so the first committed render was a phone on every device and
 * on every server. `<Modal adaptiveFullscreen>` therefore opened fullscreen on a
 * desktop and snapped out of it a frame later.
 *
 * WHAT THIS FILE ASSERTS, STATED EXPLICITLY. Two things, and not a third:
 *
 *  1. THE PUBLISHED SNAPSHOT. `renderToString` on a machine with no browser
 *     globals at all, then `hydrateRoot` over that exact server markup in a
 *     document. The two must publish the same snapshot, which React reports for
 *     us: a disagreement is an `onRecoverableError` and a thrown-away tree.
 *     This is the leg that a happy-dom document populated after the fact cannot
 *     give, because such a "server" render can read `document` and a real one
 *     cannot -- which is precisely how the defect below hid.
 *
 *  2. THE FIRST COMMITTED RENDER, and no correcting frame after it. The modern
 *     Modal renders its dialog through a Portal, which resolves its container
 *     in an effect, so NO server render of any kind emits the dialog:
 *     `renderToString` of an open Modal yields its inline anchor and nothing
 *     else. There is no server dialog to assert on. The replacement criterion
 *     is the complete SEQUENCE of values `data-adaptive-fullscreen` ever holds,
 *     recorded from before the surface exists: a first paint that had to be
 *     corrected shows up as a second entry in that sequence.
 *
 * WHAT IT DOES NOT ASSERT. Browser layout. No relayout/paint measurement is
 * available to this runner, and none is claimed here; that leg belongs to a
 * Playwright run and is an open obligation, not something this file covers.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

import ModernModal from '@/components/primitives/feedback/modal/engines/modern';

import { ResponsiveProvider } from '..';
import { usePhoneBreakpoint } from '../phone-state';
import { resetResponsiveMediaStore } from '../../../../runtime/media-snapshot';

/** A `matchMedia` that answers for one fixed viewport width. */
function viewportMock(width: number) {
  return vi.fn((query: string) => {
    const min = /\(min-width:\s*(\d+)px\)/.exec(query);
    const max = /\(max-width:\s*(\d+)px\)/.exec(query);
    const matches =
      query.includes('pointer: coarse')
        ? width < 640
        : (min ? width >= Number(min[1]) : true) && (max ? width <= Number(max[1]) : true);
    return {
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    } as unknown as MediaQueryList;
  });
}

function withViewport(width: number, run: () => void): void {
  const original = window.matchMedia;
  window.matchMedia = viewportMock(width) as unknown as typeof window.matchMedia;
  resetResponsiveMediaStore();
  try {
    run();
  } finally {
    window.matchMedia = original;
    resetResponsiveMediaStore();
  }
}

const FULLSCREEN_ATTRIBUTE = 'data-adaptive-fullscreen';

/** The unpatched writers, captured before any drill can intercept them. */
const NATIVE_SET_ATTRIBUTE = Element.prototype.setAttribute;
const NATIVE_DOCUMENT_WRITE: unknown = document.write;
const NATIVE_APPEND_CHILD: unknown = Node.prototype.appendChild;

/**
 * Every call on this runner that can move a node INTO the document or OUT of
 * it, named where the slot is reached for.
 *
 * Insertion is where an arriving carrier is read. Removal is where the pending
 * departure records are read, because a structural call is the only thing that
 * can empty a subtree that has already been detached -- and reading one after
 * that has happened is reading a subtree the evidence has left.
 *
 * The parser writers (`innerHTML`, `outerHTML`, `insertAdjacentHTML`,
 * `document.write`) are structural too, and are patched with the refusals
 * below; they read the pending records first for the same reason.
 */
const STRUCTURAL_SLOTS: readonly (readonly [string, object, string])[] = [
  ['Node.prototype', Node.prototype, 'appendChild'],
  ['Node.prototype', Node.prototype, 'insertBefore'],
  ['Node.prototype', Node.prototype, 'replaceChild'],
  ['Node.prototype', Node.prototype, 'removeChild'],
  ['Element.prototype', Element.prototype, 'append'],
  ['Element.prototype', Element.prototype, 'prepend'],
  ['Element.prototype', Element.prototype, 'replaceChildren'],
  ['Element.prototype', Element.prototype, 'before'],
  ['Element.prototype', Element.prototype, 'after'],
  ['Element.prototype', Element.prototype, 'replaceWith'],
  ['Element.prototype', Element.prototype, 'remove'],
  ['Element.prototype', Element.prototype, 'insertAdjacentElement'],
  ['Document.prototype', Document.prototype, 'append'],
  ['Document.prototype', Document.prototype, 'prepend'],
  ['Document.prototype', Document.prototype, 'replaceChildren'],
  // The two doors a node comes through from ANOTHER document.
  ['Document.prototype', Document.prototype, 'adoptNode'],
  ['Document.prototype', Document.prototype, 'importNode'],
  ['DocumentFragment.prototype', DocumentFragment.prototype, 'append'],
  ['DocumentFragment.prototype', DocumentFragment.prototype, 'prepend'],
  ['DocumentFragment.prototype', DocumentFragment.prototype, 'replaceChildren'],
  ['Range.prototype', Range.prototype, 'insertNode'],
  ['Range.prototype', Range.prototype, 'surroundContents'],
  ['Range.prototype', Range.prototype, 'deleteContents'],
  ['Range.prototype', Range.prototype, 'extractContents'],
];

type Restore = () => void;
/** A prototype slot, which is untyped by nature: the patch only calls through it. */
type AnyFunction = (this: any, ...args: any[]) => any;

/**
 * The object that actually DECLARES `key` for `start`, which is not always the
 * global constructor's prototype: this runner's live `document` does not
 * inherit from `globalThis.Document.prototype` at all. Patching that prototype
 * therefore misses `document.write` AND leaves a shadowing own property behind
 * where the slot was inherited. Patching the declaring owner does neither.
 */
function declaringOwner(start: object | null, key: string): object | null {
  let owner: object | null = start;
  while (owner && !Object.getOwnPropertyDescriptor(owner, key)) {
    owner = Object.getPrototypeOf(owner) as object | null;
  }
  return owner;
}

/**
 * Every value `data-adaptive-fullscreen` is COMMITTED with, in order, from
 * before the Modal renders until `stop()`.
 *
 * The first entry is the value the surface carried on the render that created
 * it -- the first committed render. A second entry is a correcting frame.
 *
 * IT INTERCEPTS THE WRITES; IT DOES NOT RECONSTRUCT THEM. A `MutationObserver`
 * hands over a batch after every write in it has landed, so the history has to
 * be rebuilt from `oldValue` chains and surviving nodes -- and a reconstruction
 * can only speak about nodes that are still there to be asked. A surface
 * committed fullscreen inside a node that the correcting frame REPLACES leaves
 * no attribute record naming its outgoing value, and the added-node scan reads
 * the replacement's subtree, which by delivery time already holds the corrected
 * value: the batch reports `['false']` for a frame that painted `true` first,
 * indistinguishable from a clean desktop render. Intercepting the write on the
 * caller's stack has no such blind spot -- it records the write when React
 * performs it, before the node it targets can be replaced, removed or read
 * back -- and needs no node to survive.
 *
 * ONE WRITER IS NOT THE DOM'S ONLY WRITER, so intercepting `setAttribute` alone
 * would move the blind spot rather than close it. Every path that can put a
 * value on this attribute is therefore either RECORDED or REFUSED BY NAME:
 *
 *  RECORDED, by calling through and then reading the attribute back off the
 *  element the write landed on -- which is correct whether or not the runner
 *  routes one API into another:
 *    `setAttribute` / `removeAttribute`, `setAttributeNS` / `removeAttributeNS`,
 *    `setAttributeNode(NS)` / `removeAttributeNode`, `toggleAttribute`,
 *    `NamedNodeMap.setNamedItem(NS)` / `removeNamedItem(NS)` -- which is also
 *    the path `cloneNode` plants a copied attribute through -- the `Attr.value`
 *    setter (a live write to an already-attached attribute node, invisible to
 *    every element-level API), and `Attr.nodeValue`.
 *    `element.dataset.adaptiveFullscreen = ...` and `delete` on it are recorded
 *    because they lower to `setAttribute` / `removeAttribute` here; the dataset
 *    drill below is what keeps that true rather than assumed.
 *
 *  REFUSED, loudly, at the write: `innerHTML`, `outerHTML`,
 *  `insertAdjacentHTML`, `document.write(ln)`. These plant attributes through
 *  the HTML parser, which no interception on this side can see. The refusal
 *  fires only when the markup NAMES this attribute, so unrelated markup is
 *  untouched, and it throws instead of returning -- a drill that reaches for one
 *  of them goes red with `UNSUPPORTED-WRITER` rather than reporting a history
 *  the recorder never observed. The markup is matched CASE-INSENSITIVELY,
 *  because the parser lowercases ASCII attribute names: `DATA-ADAPTIVE-
 *  FULLSCREEN="true"` plants exactly the carrier a case-sensitive reader would
 *  wave through as unrelated markup. And `document.write` is patched on the
 *  slot the LIVE document declares, not on `globalThis.Document.prototype`,
 *  which this runner's document does not inherit from.
 *
 *  AND EVERY OBSERVED WRITE IS ALSO A WITNESS. Before calling through, each
 *  interception reads what the element ALREADY carried. A value there that this
 *  recorder never recorded for that element was planted by a path it cannot
 *  see, and a later correction would otherwise bury it: the element ends up
 *  written, carrying exactly what that write left, so the end-of-drill check
 *  below has nothing to object to. The witness latches `UNOBSERVED-CARRIER`
 *  instead.
 *
 *  ADJUDICATED OUT OF SCOPE, with the reason:
 *    - Reflected IDL properties (`className`, `id`, `title`, `style`, ...) each
 *      write ONE fixed attribute name, none of which is this one. They cannot
 *      plant the carrier.
 *    - `Attr.textContent` has no setter on this runner's `Attr` (assigning to
 *      it throws), so it is not a writer here; `Attr.nodeValue` is patched even
 *      though assigning to it does not currently reach the owner element, so a
 *      runner that made it live would be recorded rather than missed.
 *    - `DOMParser.parseFromString`, `Range.createContextualFragment`,
 *      `HTMLTemplateElement.innerHTML`, `importNode` and `adoptNode` build or
 *      re-home nodes in another document or fragment. Nothing they touch is a
 *      member of THIS document until something makes it one, and the BIRTH
 *      CHANNEL below covers every carrier that becomes one, whichever of them
 *      built it and whether it was connected elsewhere first: read as it lands
 *      -> the arrival check, corrected in place -> the witness, still carried
 *      at `stop()` -> the per-element check, gone from this document -> the
 *      departure ledger. React DOM parses no markup it was not handed through
 *      `dangerouslySetInnerHTML`, which `innerHTML` refuses.
 *
 * AND IT FAILS CLOSED PER ELEMENT. Every element in the document that carries
 * the attribute when `stop()` runs must be an element this recorder saw
 * written, with the value it is carrying. A global "did we ever see this value"
 * check is not enough: an unrelated element written `false` would mask a
 * carrier that reached `false` through a path nothing observed. The per-element
 * check is the backstop for every writer not enumerated above, present or
 * future -- for as long as the carrier survives to be asked. What happens when
 * it does NOT survive is the birth channel's answer, stated where it is built.
 */
let restoreAttributeInterception: Restore | null = null;

function recordAdaptiveFullscreen(): { stop: () => string[] } {
  const seen: (string | null)[] = [];
  const observed = new Map<Element, string | null>();
  const readBack = Element.prototype.getAttribute;
  let breach: string | null = null;

  const push = (value: string | null): void => {
    if (seen.length === 0 || seen[seen.length - 1] !== value) seen.push(value);
  };
  /** What `element` carries now, recorded on the writer's own stack. */
  const commit = (element: Element | null | undefined): void => {
    if (!element) return;
    const value = readBack.call(element, FULLSCREEN_ATTRIBUTE);
    observed.set(element, value);
    push(value);
  };
  /** What `element` carries BEFORE the write about to run. */
  const carried = (element: Element | null | undefined): string | null =>
    element ? readBack.call(element, FULLSCREEN_ATTRIBUTE) : null;
  /**
   * The value an observed write is about to overwrite must be the value this
   * recorder last recorded for that element. Anything else went by unseen, and
   * the correction would bury it.
   */
  const witness = (element: Element | null | undefined, previous: string | null): void => {
    if (!element || previous === null) return;
    if (observed.get(element) === previous) return;
    breach ??=
      `UNOBSERVED-CARRIER: a surface already carried ${JSON.stringify(previous)} when a writer this recorder does see corrected it; that value was planted by a path it cannot observe`;
  };
  const namesAttribute = (name: unknown): boolean => {
    const lowered = String(name).toLowerCase();
    return lowered === FULLSCREEN_ATTRIBUTE || lowered.endsWith(`:${FULLSCREEN_ATTRIBUTE}`);
  };
  // The parser lowercases ASCII attribute names, so any case plants the carrier.
  const markupNamesAttribute = (markup: unknown): boolean =>
    String(markup).toLowerCase().includes(FULLSCREEN_ATTRIBUTE);
  const refuse = (writer: string): never => {
    throw new Error(
      `UNSUPPORTED-WRITER: ${writer} plants ${FULLSCREEN_ATTRIBUTE} through parsed markup, which this recorder cannot observe; it will not report a commit history it did not see`,
    );
  };

  const undo: Restore[] = [];
  /**
   * Slots already patched, by the owner that declares them: two starts can
   * resolve to one declaration, and wrapping it twice would leave a wrapper
   * behind when the first undo runs.
   */
  const patched = new Map<object, Set<string>>();
  const claim = (owner: object, key: string): boolean => {
    const keys = patched.get(owner) ?? new Set<string>();
    patched.set(owner, keys);
    if (keys.has(key)) return false;
    keys.add(key);
    return true;
  };
  /**
   * Patch where the slot is DECLARED, and restore the shape it was found in:
   * an inherited slot is re-exposed by deleting the own property, never left
   * shadowed by a re-assigned copy of the inherited value.
   */
  const patchMethod = (
    start: object | null | undefined,
    key: string,
    wrap: (original: AnyFunction) => AnyFunction,
  ): void => {
    const owner = declaringOwner((start ?? null) as object | null, key);
    const target = owner as Record<string, AnyFunction> | null;
    if (!target || typeof target[key] !== 'function') return;
    if (!claim(target, key)) return;
    const wasOwn = Object.prototype.hasOwnProperty.call(target, key);
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    const original = target[key];
    Object.defineProperty(target, key, {
      value: wrap(original),
      writable: descriptor?.writable ?? true,
      enumerable: descriptor?.enumerable ?? false,
      configurable: true,
    });
    undo.push(() => {
      if (wasOwn && descriptor) Object.defineProperty(target, key, descriptor);
      else delete target[key];
    });
  };
  const patchSetter = (
    start: object | null | undefined,
    key: string,
    wrap: (original: (value: unknown) => void) => (value: unknown) => void,
  ): void => {
    const owner = declaringOwner(start ?? null, key);
    const descriptor = owner ? Object.getOwnPropertyDescriptor(owner, key) : undefined;
    if (!owner || !descriptor?.set || !descriptor.configurable) return;
    if (!claim(owner, key)) return;
    const original = descriptor.set as (value: unknown) => void;
    Object.defineProperty(owner, key, { ...descriptor, set: wrap(original) });
    undo.push(() => {
      Object.defineProperty(owner, key, descriptor);
    });
  };

  const element = Element.prototype;

  /**
   * THE BIRTH CHANNEL, which is the other end of the same question.
   *
   * The witness sees a value an OBSERVED write buries; the per-element check at
   * `stop()` sees a carrier that SURVIVES. A carrier planted where this recorder
   * cannot look and then DROPPED is neither -- a parser-built node inserted by
   * one commit and replaced by the next is never written again, and is gone from
   * the document before anything can be asked what it held. The history then
   * simply starts mid-stream, and reads exactly like a clean single-commit pass.
   *
   * So a carrier is read AT THE TWO MOMENTS IT CROSSES THE DOCUMENT'S EDGE, on
   * the stack of the call that carries it across -- never by inspecting a
   * subtree afterwards, which is a question about what is still there rather
   * than about what happened.
   *
   * BOTH EDGES ARE JUDGED BY THE SAME THING: membership of the watched
   * document. Not connectivity, and not which structural slot happened to fire
   * -- a move between two documents keeps the carrier connected throughout, and
   * an edge judged by connectivity misses it coming and going. Everything that
   * is not this document is equally foreign, so adoption, importing and a plain
   * `appendChild` of a node that belongs to another document are the same
   * crossing as an insertion from a detached tree, and answer to the same
   * first-value/last-value law:
   *
   *   ARRIVAL. Every call that can put a node into the document reads what the
   *   carriers it brought in are holding, immediately after they land. A value
   *   this recorder did not record for that element got there through a path it
   *   cannot see, and the drill is refused by name -- before the correcting
   *   frame, the removal, or any later cleanup can touch it.
   *
   *   DEPARTURE. Removal records are read WHEN THEY ARE HANDED OVER, and the
   *   undelivered ones are read on the stack of the next structural call, which
   *   is the only thing that can empty an already-detached subtree. The departed
   *   carrier's value is therefore copied out while the subtree still holds it.
   *   A ledger that waited for `stop()` to look would find a removed wrapper
   *   that its own cleanup had already emptied, and report the correcting value
   *   alone as a clean single-commit history.
   *
   * With those two, a carrier's whole life is accounted for, and there is no
   * seventh case:
   *   - already in the document when the drill began -> snapshotted here, and
   *     what it carries IS the first observed value;
   *   - written by any writer below -> recorded there;
   *   - planted unseen and brought in from anywhere -> the arrival check;
   *   - planted unseen and overwritten in place -> the witness;
   *   - planted unseen and still carried at `stop()` -> the per-element check;
   *   - planted unseen and gone from this document, to a detached tree or to
   *     another document -> the departure ledger.
   * A carrier that never enters this document painted nothing here, and is not
   * a case.
   *
   * Neither channel is the reconstruction this recorder exists to avoid: neither
   * ever contributes a value to the history. They ask one question -- was every
   * carrier that crossed the edge one this recorder saw written -- and refuse the
   * drill by name when it was not.
   */
  for (const carrier of Array.from(document.querySelectorAll(`[${FULLSCREEN_ATTRIBUTE}]`))) {
    commit(carrier);
  }

  /**
   * WHICH DOCUMENT, asked as membership rather than as connectivity.
   *
   * "In the document" means THIS document -- the one whose carriers `stop()`
   * can enumerate. Connectivity is a different question with a different
   * answer: a carrier handed from one document to another is connected on both
   * sides of the move, so an edge judged by `isConnected` sees no crossing at
   * either end. A parser-built carrier could then enter this document holding a
   * value nothing here wrote, and leave again, with the arrival check declining
   * it as "already connected" and the departure ledger declining it as "still
   * connected" -- the exact hole both channels exist to close.
   *
   * The root a node hangs from answers it directly, in every runner and for a
   * detached tree as well as a foreign document.
   */
  const watched: Node = document;
  const rootOf = (node: Node): Node => {
    let current: Node = node;
    while (current.parentNode) current = current.parentNode;
    return current;
  };
  const inWatchedDocument = (node: Node | null | undefined): boolean =>
    Boolean(node) && rootOf(node as Node) === watched;

  /** Everything under `node` that carries the attribute, `node` included. */
  const carriersIn = (node: unknown): Element[] => {
    const candidate = node as Node | null;
    // Elements and fragments only: a fragment is what an insertion is handed
    // when the carriers it delivers were built somewhere else.
    if (!candidate || (candidate.nodeType !== 1 && candidate.nodeType !== 11)) return [];
    const root = candidate as Element;
    const own =
      candidate.nodeType === 1 && readBack.call(root, FULLSCREEN_ATTRIBUTE) !== null ? [root] : [];
    return [...own, ...Array.from(root.querySelectorAll(`[${FULLSCREEN_ATTRIBUTE}]`))];
  };
  /** A carrier that ENTERS the document must arrive carrying what we recorded. */
  const arrived = (carrier: Element): void => {
    const value = readBack.call(carrier, FULLSCREEN_ATTRIBUTE);
    if (value === null || observed.get(carrier) === value) return;
    breach ??=
      `UNOBSERVED-CARRIER: a surface entered the document carrying ${JSON.stringify(value)} that this recorder never saw written to it; it was planted by a path it cannot observe`;
  };
  /** And a carrier that LEAVES it must leave carrying what we recorded. */
  const departed = (carrier: Element, value: string | null): void => {
    if (value === null || observed.get(carrier) === value) return;
    breach ??=
      `UNOBSERVED-CARRIER: a surface left the document carrying ${JSON.stringify(value)} that this recorder never saw written to it; it was planted by a path it cannot observe and dropped before anything could name it`;
  };
  /** Read every departure these records name, now, while their subtrees hold it. */
  const settle = (records: readonly MutationRecord[]): void => {
    for (const record of records) {
      for (const node of Array.from(record.removedNodes)) {
        for (const carrier of carriersIn(node)) {
          // Still in THIS document -- moved rather than gone: the per-element
          // check at `stop()` owns it. Anywhere else is a departure, whether it
          // went to a detached tree or straight into another document.
          if (inWatchedDocument(carrier)) continue;
          departed(carrier, readBack.call(carrier, FULLSCREEN_ATTRIBUTE));
        }
      }
    }
  };
  const ledger = new MutationObserver(settle);
  ledger.observe(document, { childList: true, subtree: true });
  undo.push(() => ledger.disconnect());
  /** The records the callback has not been handed yet, read on this stack. */
  const settleNow = (): void => settle(ledger.takeRecords());

  /**
   * Read the pending departures BEFORE the call -- this may be the cleanup that
   * empties an already-detached subtree -- and read the arriving carriers after
   * it, which is when they are in the document to be read.
   *
   * An arrival is a CROSSING INTO THIS DOCUMENT, so a carrier that was already
   * a member of it before the call is not one: this runner lowers
   * `replaceChild` into `insertBefore` plus `removeChild`, and the outgoing
   * subtree is still a member for the first of those. Its account is the
   * departure ledger's, and reporting it here would name the wrong edge for the
   * same carrier. Everywhere else is foreign -- a detached tree, a fragment,
   * another document -- and a carrier coming from any of them is arriving.
   */
  const structural = (args: unknown[], call: () => unknown): unknown => {
    settleNow();
    const arriving = args
      .flatMap(carriersIn)
      .map((carrier) => ({ carrier, wasInside: inWatchedDocument(carrier) }));
    const result = call();
    for (const { carrier, wasInside } of arriving) {
      if (!wasInside && inWatchedDocument(carrier)) arrived(carrier);
    }
    return result;
  };
  for (const [, start, key] of STRUCTURAL_SLOTS) {
    patchMethod(start, key, (original) =>
      function acrossTheEdge(this: unknown, ...args: unknown[]) {
        return structural(args, () => original.apply(this, args));
      },
    );
  }
  // Emptying a subtree names no node, so it leaves no record to read later:
  // the pending ones have to be read before it runs.
  patchSetter(element, 'textContent', (original) =>
    function textContent(this: Element, value: unknown) {
      settleNow();
      original.call(this, value);
    },
  );

  /**
   * Witness what was already there, call through, record what is there now.
   *
   * The witness runs BEFORE the call because these APIs nest: this runner
   * lowers `setAttributeNS` and `setAttributeNode` into `setNamedItem`, whose
   * own interception commits the new value first. A witness that read `observed`
   * after the call would compare the outgoing value against the incoming one and
   * report every nested write as a breach.
   */
  const around = (named: boolean, target: Element, call: () => unknown): unknown => {
    if (named) witness(target, carried(target));
    const result = call();
    if (named) commit(target);
    return result;
  };
  patchMethod(element, 'setAttribute', (original) =>
    function setAttribute(this: Element, name: unknown, value: unknown) {
      return around(namesAttribute(name), this, () => original.call(this, name, value));
    },
  );
  patchMethod(element, 'removeAttribute', (original) =>
    function removeAttribute(this: Element, name: unknown) {
      return around(namesAttribute(name), this, () => original.call(this, name));
    },
  );
  patchMethod(element, 'setAttributeNS', (original) =>
    function setAttributeNS(this: Element, namespace: unknown, name: unknown, value: unknown) {
      return around(namesAttribute(name), this, () => original.call(this, namespace, name, value));
    },
  );
  patchMethod(element, 'removeAttributeNS', (original) =>
    function removeAttributeNS(this: Element, namespace: unknown, name: unknown) {
      return around(namesAttribute(name), this, () => original.call(this, namespace, name));
    },
  );
  patchMethod(element, 'toggleAttribute', (original) =>
    function toggleAttribute(this: Element, name: unknown, force: unknown) {
      return around(namesAttribute(name), this, () => original.call(this, name, force));
    },
  );
  for (const key of ['setAttributeNode', 'setAttributeNodeNS', 'removeAttributeNode']) {
    patchMethod(element, key, (original) =>
      function withAttributeNode(this: Element, node: Attr) {
        return around(Boolean(node) && namesAttribute(node.name), this, () =>
          original.call(this, node),
        );
      },
    );
  }
  patchSetter(element, 'innerHTML', (original) =>
    function innerHTML(this: Element, markup: unknown) {
      settleNow();
      if (markupNamesAttribute(markup)) refuse('Element.innerHTML');
      original.call(this, markup);
    },
  );
  patchSetter(element, 'outerHTML', (original) =>
    function outerHTML(this: Element, markup: unknown) {
      settleNow();
      if (markupNamesAttribute(markup)) refuse('Element.outerHTML');
      original.call(this, markup);
    },
  );
  patchMethod(element, 'insertAdjacentHTML', (original) =>
    function insertAdjacentHTML(this: Element, position: unknown, markup: unknown) {
      settleNow();
      if (markupNamesAttribute(markup)) refuse('Element.insertAdjacentHTML');
      return original.call(this, position, markup);
    },
  );
  // On the slot the LIVE document declares: this runner's document does not
  // inherit from `globalThis.Document.prototype`, so patching that class would
  // leave `document.write` unpatched and shadow an inherited slot for nothing.
  for (const key of ['write', 'writeln']) {
    patchMethod(document, key, (original) =>
      function documentWrite(this: Document, ...markup: unknown[]) {
        if (markup.some(markupNamesAttribute)) refuse(`Document.${key}`);
        return original.apply(this, markup);
      },
    );
  }

  // An attribute node is a writer in its own right: once attached, writing its
  // value changes what the element carries without touching the element.
  for (const key of ['value', 'nodeValue']) {
    patchSetter(Attr.prototype, key, (original) =>
      function attributeValue(this: Attr, value: unknown) {
        const owner = namesAttribute(this.name) ? this.ownerElement : null;
        witness(owner, carried(owner));
        original.call(this, value);
        if (owner) commit(owner);
      },
    );
  }

  // `cloneNode` copies attributes through this map, so a carrier planted by a
  // clone is recorded here and nowhere else.
  const attributes = NamedNodeMap.prototype as unknown as Record<string, AnyFunction>;
  for (const key of ['setNamedItem', 'setNamedItemNS']) {
    patchMethod(attributes, key, (original) =>
      function setNamedItem(this: NamedNodeMap, node: Attr) {
        // The map cannot name its element, but the attribute it is about to
        // replace can -- and it also carries the value being overwritten.
        const replaced = node && namesAttribute(node.name)
          ? this.getNamedItem(FULLSCREEN_ATTRIBUTE)
          : null;
        const replacedOwner = replaced?.ownerElement ?? null;
        witness(replacedOwner, replaced ? replaced.value : null);
        const result = original.call(this, node);
        if (node && namesAttribute(node.name)) commit(node.ownerElement ?? replacedOwner);
        return result;
      },
    );
  }
  patchMethod(attributes, 'removeNamedItem', (original) =>
    function removeNamedItem(this: NamedNodeMap, name: unknown) {
      const removed = namesAttribute(name) ? this.getNamedItem(String(name)) : null;
      const owner = removed?.ownerElement ?? null;
      witness(owner, removed ? removed.value : null);
      const result = original.call(this, name);
      if (owner) commit(owner);
      return result;
    },
  );
  patchMethod(attributes, 'removeNamedItemNS', (original) =>
    function removeNamedItemNS(this: NamedNodeMap, namespace: unknown, name: unknown) {
      const removed = namesAttribute(name)
        ? this.getNamedItemNS(namespace as string | null, String(name))
        : null;
      const owner = removed?.ownerElement ?? null;
      witness(owner, removed ? removed.value : null);
      const result = original.call(this, namespace, name);
      if (owner) commit(owner);
      return result;
    },
  );

  // A patched prototype that outlives a failing assertion would follow the
  // worker into every later file, so the restore is also owned by `afterEach`,
  // and `stop()` restores BEFORE it can throw.
  const restore = (): void => {
    while (undo.length > 0) undo.pop()?.();
    restoreAttributeInterception = null;
  };
  restoreAttributeInterception = restore;
  return {
    stop: () => {
      settleNow();
      restore();
      if (breach) throw new Error(breach);
      for (const carrier of Array.from(document.querySelectorAll(`[${FULLSCREEN_ATTRIBUTE}]`))) {
        const settled = carrier.getAttribute(FULLSCREEN_ATTRIBUTE);
        if (!observed.has(carrier) || observed.get(carrier) !== settled) {
          throw new Error(
            `UNOBSERVED-CARRIER: a surface carries ${String(settled)} that this recorder never saw written to it; it is not observing every commit`,
          );
        }
      }
      if (seen.includes(null)) {
        throw new Error(
          `${FULLSCREEN_ATTRIBUTE} was removed mid-history, which this instrument does not model`,
        );
      }
      return seen as string[];
    },
  };
}

function PhoneProbe(): React.ReactElement {
  return <output data-testid="is-phone">{String(usePhoneBreakpoint())}</output>;
}

/**
 * Render the tree the way a real server does: with no browser globals in scope
 * at all, on a module graph loaded in that world.
 *
 * The module registry is reset for the leg, so every `typeof document` guard in
 * the graph evaluates the way it does in a Node process. Restoring the globals
 * afterwards leaves the suite exactly as it found it.
 */
async function renderOnRealServer(ssrViewport?: 'phone' | 'tablet' | 'desktop'): Promise<string> {
  const savedWindow = globalThis.window;
  const savedDocument = globalThis.document;
  const savedMatchMedia = globalThis.matchMedia;
  // @ts-expect-error deliberately simulating a server: there is no window there
  delete globalThis.window;
  // @ts-expect-error ... and no document either
  delete globalThis.document;
  // @ts-expect-error ... and nothing to query media with
  delete globalThis.matchMedia;
  vi.resetModules();
  try {
    expect(typeof document).toBe('undefined');
    const React_ = (await import('react')).default;
    const { renderToString: renderToStringFresh } = await import('react-dom/server');
    const { ResponsiveProvider: Provider } = await import('..');
    const { usePhoneBreakpoint: useIsPhone } = await import('../phone-state');
    const Probe = (): React.ReactElement =>
      React_.createElement('output', { id: 'probe' }, String(useIsPhone()));
    return renderToStringFresh(
      React_.createElement(Provider, {
        ...(ssrViewport ? { ssrViewport } : {}),
        children: React_.createElement(Probe),
      }),
    );
  } finally {
    globalThis.window = savedWindow;
    globalThis.document = savedDocument;
    globalThis.matchMedia = savedMatchMedia;
    vi.resetModules();
  }
}

interface HydrationOutcome {
  readonly recoverableErrors: readonly string[];
  readonly hydratedText: string;
  readonly textSequence: readonly string[];
}

/** Hydrate the EXACT server markup, in a document, and report what React saw. */
async function hydrateServerMarkup(
  serverHtml: string,
  ssrViewport: 'phone' | 'tablet' | 'desktop' | undefined,
  viewportWidth: number,
): Promise<HydrationOutcome> {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = viewportMock(viewportWidth) as unknown as typeof window.matchMedia;
  vi.resetModules();
  const container = document.createElement('div');
  container.innerHTML = serverHtml;
  document.body.appendChild(container);

  const textSequence: string[] = [];
  const probe = container.querySelector('#probe') as Element;
  const record = (): void => {
    const text = probe.textContent ?? '';
    if (textSequence[textSequence.length - 1] !== text) textSequence.push(text);
  };
  record();
  const observer = new MutationObserver(record);
  observer.observe(container, { subtree: true, characterData: true, childList: true });

  try {
    const reactModule = await import('react');
    const React_ = reactModule.default;
    const act = reactModule.act;
    const { hydrateRoot } = await import('react-dom/client');
    const { ResponsiveProvider: Provider } = await import('..');
    const { usePhoneBreakpoint: useIsPhone } = await import('../phone-state');
    const { resetResponsiveMediaStore: reset } = await import(
      '../../../../runtime/media-snapshot'
    );
    reset();

    const recoverableErrors: string[] = [];
    const Probe = (): React.ReactElement =>
      React_.createElement('output', { id: 'probe' }, String(useIsPhone()));
    let root: { unmount: () => void } | undefined;
    act(() => {
      root = hydrateRoot(
        container,
        React_.createElement(Provider, {
          ...(ssrViewport ? { ssrViewport } : {}),
          children: React_.createElement(Probe),
        }),
        { onRecoverableError: (error: unknown) => recoverableErrors.push(String(error)) },
      );
    });
    observer.takeRecords().forEach(record);
    const hydratedText = (container.querySelector('#probe')?.textContent ?? '');
    act(() => {
      root?.unmount();
    });
    reset();
    return { recoverableErrors, hydratedText, textSequence };
  } finally {
    observer.disconnect();
    container.remove();
    window.matchMedia = originalMatchMedia;
    vi.resetModules();
  }
}

afterEach(() => {
  restoreAttributeInterception?.();
  cleanup();
  resetResponsiveMediaStore();
  document.documentElement.removeAttribute('data-ds-viewport');
});

describe('the request viewport reaches the server snapshot', () => {
  it('renders a desktop request as a desktop, not as a phone', () => {
    const html = renderToString(
      <ResponsiveProvider ssrViewport="desktop">
        <PhoneProbe />
      </ResponsiveProvider>,
    );

    expect(html).toContain('>false<');
  });

  it('still renders a request that declared nothing mobile-first', () => {
    const html = renderToString(
      <ResponsiveProvider>
        <PhoneProbe />
      </ResponsiveProvider>,
    );

    // The design system does not invent a viewport it was never told about.
    expect(html).toContain('>true<');
  });

  it('ignores the projected attribute: the hint is a prop, not a document read', () => {
    // `mountTenantTheme` stamps this for CSS. Reading it back here would answer
    // `undefined` on a real server and `desktop` while hydrating, which is a
    // hydration mismatch by construction -- the exact defect this file fences.
    document.documentElement.setAttribute('data-ds-viewport', 'desktop');

    const html = renderToString(
      <ResponsiveProvider>
        <PhoneProbe />
      </ResponsiveProvider>,
    );

    expect(html).toContain('>true<');
  });
});

describe('server and hydration publish the same snapshot', () => {
  it('agrees on a desktop request, with no recoverable error', async () => {
    const serverHtml = await renderOnRealServer('desktop');
    expect(serverHtml).toContain('>false<');

    const outcome = await hydrateServerMarkup(serverHtml, 'desktop', 1440);

    expect(outcome.recoverableErrors).toEqual([]);
    expect(outcome.hydratedText).toBe('false');
    expect(outcome.textSequence).toEqual(['false']);
  });

  it('agrees on a request that declared nothing, with no recoverable error', async () => {
    const serverHtml = await renderOnRealServer(undefined);
    expect(serverHtml).toContain('>true<');

    // The document ALSO carries the attribute a mount would have projected. A
    // provider that read it would answer `desktop` here and `phone` on the
    // server above: this is the reproduction, and it must stay green only
    // because the attribute is not an input.
    document.documentElement.setAttribute('data-ds-viewport', 'desktop');
    const outcome = await hydrateServerMarkup(serverHtml, undefined, 390);

    expect(outcome.recoverableErrors).toEqual([]);
    expect(outcome.hydratedText).toBe('true');
  });

  it('agrees on a phone request served to a desktop browser', async () => {
    const serverHtml = await renderOnRealServer('phone');
    expect(serverHtml).toContain('>true<');

    // Hydration must reproduce the SERVER's answer first and correct after,
    // which is a store update rather than a mismatch.
    const outcome = await hydrateServerMarkup(serverHtml, 'phone', 1440);

    expect(outcome.recoverableErrors).toEqual([]);
    expect(outcome.textSequence[0]).toBe('true');
  });
});

describe('adaptiveFullscreen on the first committed render', () => {
  it('renders a desktop request non-fullscreen, with no correcting frame', () => {
    withViewport(1440, () => {
      const recorder = recordAdaptiveFullscreen();
      render(
        <ResponsiveProvider ssrViewport="desktop">
          <ModernModal open onClose={() => {}} title="Desktop">
            body
          </ModernModal>
        </ResponsiveProvider>,
      );

      expect(recorder.stop()).toEqual(['false']);
    });
  });

  it('still renders a phone request fullscreen', () => {
    withViewport(390, () => {
      const recorder = recordAdaptiveFullscreen();
      render(
        <ResponsiveProvider ssrViewport="phone">
          <ModernModal open onClose={() => {}} title="Phone">
            body
          </ModernModal>
        </ResponsiveProvider>,
      );

      expect(recorder.stop()).toEqual(['true']);
    });
  });

  /**
   * THE RECORDER'S OWN NEGATIVE CONTROL, and the reason the two drills above
   * are evidence of anything.
   *
   * A green sequence proves nothing unless the instrument can go red. This
   * plants exactly the history the criterion forbids -- a surface committed
   * fullscreen and corrected out of it before the frame ends -- and requires
   * the recorder to report both values. A recorder that reads each target's
   * CURRENT attribute when the batch is delivered answers `['false']` here,
   * indistinguishable from the desktop drill's pass.
   */
  it('reports a corrected first commit, which is what makes a clean one evidence', () => {
    const CorrectedSurface = (): React.ReactElement => {
      const surface = React.useRef<HTMLDivElement>(null);
      React.useLayoutEffect(() => {
        surface.current?.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
      }, []);
      return <div ref={surface} data-adaptive-fullscreen="true" />;
    };

    const recorder = recordAdaptiveFullscreen();
    render(<CorrectedSurface />);

    expect(recorder.stop()).toEqual(['true', 'false']);
  });

  /**
   * THE SAME CONTROL, WITH THE COMMIT HIDDEN BY REPLACEMENT.
   *
   * The correction above rewrites the attribute on the node that carries it, so
   * the write leaves a record naming the outgoing value. This one changes the
   * surface's ELEMENT TYPE, which makes React drop the fullscreen node and
   * insert a different one in its place. Nothing then names `true`: the removed
   * node carries no attribute record, and the surviving subtree only ever held
   * `false`. A recorder that rebuilds the history from delivered records
   * therefore reports `['false']` -- byte-identical to the desktop drill's
   * pass, for a frame that painted fullscreen first.
   */
  it('reports a first commit hidden by replacing the surface node, not rewriting it', () => {
    const ReplacedSurface = (): React.ReactElement => {
      const [fullscreen, setFullscreen] = React.useState(true);
      React.useLayoutEffect(() => {
        setFullscreen(false);
      }, []);
      return (
        <section>
          {fullscreen ? (
            <span data-adaptive-fullscreen="true" />
          ) : (
            <div data-adaptive-fullscreen="false" />
          )}
        </section>
      );
    };

    const recorder = recordAdaptiveFullscreen();
    render(<ReplacedSurface />);

    expect(recorder.stop()).toEqual(['true', 'false']);
  });
});

/**
 * A surface that committed fullscreen and is corrected a layout effect later,
 * through whichever DOM writer the drill hands it. The value the frame painted
 * first has to appear in the history no matter which API removed it.
 */
function CorrectedThrough({
  correct,
}: {
  correct: (surface: HTMLDivElement) => void;
}): React.ReactElement {
  const surface = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (surface.current) correct(surface.current);
  }, [correct]);
  return <div ref={surface} data-adaptive-fullscreen="true" />;
}

/** Markup that names the attribute, for the writers this recorder refuses. */
const PLANTED_MARKUP = `<span ${FULLSCREEN_ATTRIBUTE}="true"></span>`;
/** The same carrier, spelled the way the parser still lowercases into it. */
const SHOUTED_MARKUP = `<span ${FULLSCREEN_ATTRIBUTE.toUpperCase()}="true"></span>`;

describe('the recorder observes every writer, or refuses the drill by name', () => {
  it('records a correction written with setAttributeNS', () => {
    const recorder = recordAdaptiveFullscreen();
    render(
      <CorrectedThrough
        correct={(surface) => surface.setAttributeNS(null, FULLSCREEN_ATTRIBUTE, 'false')}
      />,
    );

    expect(recorder.stop()).toEqual(['true', 'false']);
  });

  it('records a correction attached as an attribute node', () => {
    const recorder = recordAdaptiveFullscreen();
    render(
      <CorrectedThrough
        correct={(surface) => {
          const node = document.createAttribute(FULLSCREEN_ATTRIBUTE);
          node.value = 'false';
          surface.setAttributeNode(node);
        }}
      />,
    );

    expect(recorder.stop()).toEqual(['true', 'false']);
  });

  /**
   * The element is never touched here: the correction is written straight onto
   * the attribute node the surface already carries. No element-level writer
   * runs at all, which is exactly why this one needs its own interception.
   */
  it('records a correction written through the attribute node itself', () => {
    const recorder = recordAdaptiveFullscreen();
    render(
      <CorrectedThrough
        correct={(surface) => {
          const node = surface.getAttributeNode(FULLSCREEN_ATTRIBUTE);
          if (node) node.value = 'false';
        }}
      />,
    );

    expect(recorder.stop()).toEqual(['true', 'false']);
  });

  /**
   * `dataset` is the property-assignment path onto this attribute. It lowers to
   * `setAttribute` on this runner rather than being patched itself -- and this
   * drill is what keeps that a measured fact instead of an assumption.
   */
  it('records a correction assigned through dataset', () => {
    const recorder = recordAdaptiveFullscreen();
    render(
      <CorrectedThrough
        correct={(surface) => {
          surface.dataset.adaptiveFullscreen = 'false';
        }}
      />,
    );

    expect(recorder.stop()).toEqual(['true', 'false']);
  });

  /**
   * `toggleAttribute` plants the EMPTY string, which is a value a surface can
   * be seen carrying and therefore a value the history has to name. A recorder
   * that only watched `setAttribute` with a value would report `['false']`.
   */
  it('records the empty value toggleAttribute plants, then the correction over it', () => {
    const ToggledSurface = (): React.ReactElement => {
      const surface = React.useRef<HTMLDivElement>(null);
      React.useLayoutEffect(() => {
        surface.current?.toggleAttribute(FULLSCREEN_ATTRIBUTE);
        surface.current?.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
      }, []);
      return <div ref={surface} />;
    };

    const recorder = recordAdaptiveFullscreen();
    render(<ToggledSurface />);

    expect(recorder.stop()).toEqual(['', 'false']);
  });

  /**
   * A removal leaves NO carrier in the document, so the per-element backstop
   * cannot catch it: an unobserved `removeAttributeNode` would report the clean
   * `['true']` of a surface that ended up carrying nothing. Observing it is what
   * turns the drill red.
   */
  it('sees a removal through removeAttributeNode rather than reporting a clean history', () => {
    const recorder = recordAdaptiveFullscreen();
    render(
      <CorrectedThrough
        correct={(surface) => {
          const node = surface.getAttributeNode(FULLSCREEN_ATTRIBUTE);
          if (node) surface.removeAttributeNode(node);
        }}
      />,
    );

    expect(() => recorder.stop()).toThrow(/removed mid-history/);
  });

  /**
   * A clone carries the attribute without anything writing it: no element-level
   * writer runs, and the source it was copied from need never be in the
   * document. The copy goes through the attribute map, which is where this is
   * recorded.
   */
  it('records a carrier planted by cloning a node, not by writing one', () => {
    const source = document.createElement('div');
    NATIVE_SET_ATTRIBUTE.call(source, FULLSCREEN_ATTRIBUTE, 'true');

    const recorder = recordAdaptiveFullscreen();
    const clone = source.cloneNode(true) as Element;
    document.body.appendChild(clone);
    try {
      expect(recorder.stop()).toEqual(['true']);
    } finally {
      clone.remove();
    }
  });

  /**
   * THE MASKING CASE. The value the unobserved carrier settles on is a value
   * the recorder DID see -- written by a different element. A global "have we
   * ever seen this value" check passes here and certifies a history it never
   * observed; only a per-element check can refuse it.
   *
   * The native writer captured before the patch is exactly what an
   * unenumerated writer looks like from the recorder's side.
   */
  it('refuses a carrier it never saw written, even when another element wrote the same value', () => {
    const recorder = recordAdaptiveFullscreen();
    render(<div data-adaptive-fullscreen="false" />);

    const unobserved = document.createElement('div');
    document.body.appendChild(unobserved);
    NATIVE_SET_ATTRIBUTE.call(unobserved, FULLSCREEN_ATTRIBUTE, 'false');
    try {
      expect(() => recorder.stop()).toThrow(/UNOBSERVED-CARRIER/);
    } finally {
      unobserved.remove();
    }
  });

  it('refuses innerHTML that names the attribute, and leaves other markup alone', () => {
    const recorder = recordAdaptiveFullscreen();
    const host = document.createElement('div');
    document.body.appendChild(host);
    try {
      expect(() => {
        host.innerHTML = PLANTED_MARKUP;
      }).toThrow(/UNSUPPORTED-WRITER/);
      expect(host.children.length).toBe(0);

      host.innerHTML = '<span>body</span>';
      expect(host.children.length).toBe(1);
    } finally {
      // Detached first: a refusal that did not fire leaves a carrier behind, and
      // the drill that reports it must not also poison every drill after it.
      host.remove();
      recorder.stop();
    }
  });

  it('refuses outerHTML that names the attribute', () => {
    const recorder = recordAdaptiveFullscreen();
    const parent = document.createElement('div');
    const host = document.createElement('div');
    parent.appendChild(host);
    document.body.appendChild(parent);
    try {
      expect(() => {
        host.outerHTML = PLANTED_MARKUP;
      }).toThrow(/UNSUPPORTED-WRITER/);
      expect(parent.querySelectorAll(`[${FULLSCREEN_ATTRIBUTE}]`).length).toBe(0);
    } finally {
      // Detached first: a refusal that did not fire leaves a carrier behind, and
      // the drill that reports it must not also poison every drill after it.
      parent.remove();
      recorder.stop();
    }
  });

  it('refuses insertAdjacentHTML that names the attribute', () => {
    const recorder = recordAdaptiveFullscreen();
    const host = document.createElement('div');
    document.body.appendChild(host);
    try {
      expect(() => host.insertAdjacentHTML('beforeend', PLANTED_MARKUP)).toThrow(
        /UNSUPPORTED-WRITER/,
      );
      expect(host.children.length).toBe(0);

      host.insertAdjacentHTML('beforeend', '<span>body</span>');
      expect(host.children.length).toBe(1);
    } finally {
      // Detached first: a refusal that did not fire leaves a carrier behind, and
      // the drill that reports it must not also poison every drill after it.
      host.remove();
      recorder.stop();
    }
  });

  /**
   * THE UPPERCASE PARSER PATH. HTML attribute names are ASCII case-insensitive:
   * the parser lowercases `DATA-ADAPTIVE-FULLSCREEN` into exactly this carrier.
   * A refusal that matched the markup case-sensitively read that as unrelated
   * markup, let the parser plant `true` where nothing could see it, and reported
   * the correcting `false` as the clean single-commit history of a desktop pass.
   */
  it('refuses parsed markup that names the attribute in upper case', () => {
    const recorder = recordAdaptiveFullscreen();
    const host = document.createElement('div');
    document.body.appendChild(host);
    try {
      expect(() => {
        host.innerHTML = SHOUTED_MARKUP;
      }).toThrow(/UNSUPPORTED-WRITER/);
      expect(() => host.insertAdjacentHTML('beforeend', SHOUTED_MARKUP)).toThrow(
        /UNSUPPORTED-WRITER/,
      );
      expect(host.querySelectorAll(`[${FULLSCREEN_ATTRIBUTE}]`).length).toBe(0);
    } finally {
      // Detached first: a refusal that did not fire leaves a carrier behind, and
      // the drill that reports it must not also poison every drill after it.
      host.remove();
      recorder.stop();
    }
  });

  /**
   * THE `document.write` PATH. This runner's live `document` does not inherit
   * from `globalThis.Document.prototype`, so a refusal installed there is not
   * the function `document.write` resolves to: the markup reaches the parser and
   * plants the carrier with nothing watching.
   *
   * The identity check is what reports that BEFORE the markup is handed over.
   * An unrefused `document.write` reopens the document and takes the rest of the
   * suite's DOM with it, so this drill must not be the thing that discovers the
   * patch missed.
   */
  it('refuses document.write on the slot the live document actually resolves to', () => {
    const parserWriters = (['write', 'writeln'] as const).filter(
      (key) => typeof (document as unknown as Record<string, unknown>)[key] === 'function',
    );
    // `writeln` is absent on this runner; if a runner update adds it, it is
    // patched and drilled here without this file changing.
    expect(parserWriters).toContain('write');

    const recorder = recordAdaptiveFullscreen();
    try {
      expect(document.write).not.toBe(NATIVE_DOCUMENT_WRITE);
      for (const key of parserWriters) {
        expect(() => (document as unknown as Record<string, (markup: string) => void>)[key](
          PLANTED_MARKUP,
        )).toThrow(/UNSUPPORTED-WRITER/);
      }
      expect(document.querySelectorAll(`[${FULLSCREEN_ATTRIBUTE}]`).length).toBe(0);
    } finally {
      recorder.stop();
    }
  });

  /**
   * THE INTERMEDIATE NOBODY ELSE CAN SEE, and the witness's own drill.
   *
   * The surface here is accounted for twice over: the recorder saw it written,
   * saw it carry `false`, and finds it still carrying `false` at the end. Its
   * arrival is unremarkable and it never leaves. Between those two observed
   * writes a value goes by that nothing on this side wrote -- and the second
   * write buries it. No end-of-drill reading of the document can object,
   * because the document ends up exactly as an honest single-commit pass would
   * leave it. Only reading what the element carried BEFORE the correcting write
   * can tell that a value went past unseen.
   *
   * The native writer captured before the patch is what any unenumerated path
   * looks like from the recorder's side.
   */
  it('refuses an intermediate it never saw, even when an observed write corrects it', () => {
    const recorder = recordAdaptiveFullscreen();
    const surface = document.createElement('div');
    surface.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
    document.body.appendChild(surface);
    NATIVE_SET_ATTRIBUTE.call(surface, FULLSCREEN_ATTRIBUTE, 'true');
    surface.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
    try {
      expect(() => recorder.stop()).toThrow(/UNOBSERVED-CARRIER/);
    } finally {
      surface.remove();
    }
  });

  /**
   * THE PARSER-BUILT CARRIER THAT IS REPLACED, NOT CORRECTED -- the case the
   * witness and the per-element check both miss by construction.
   *
   * The first commit's layout effect inserts a carrier the HTML parser built:
   * `createContextualFragment` does not go through `Element.innerHTML` on this
   * runner, so the refusals never fire and no interception ever sees the value
   * land. The second commit changes the surface's element type, so React drops
   * that whole subtree and inserts its own `false` carrier instead. The planted
   * `true` is therefore never overwritten -- nothing for the witness -- and is
   * gone from the document by `stop()` -- nothing for the per-element check.
   * The recorder's own history starts mid-stream and reports `['false']`, byte
   * for byte the desktop drill's pass, for a frame that painted fullscreen.
   *
   * The arrival check is what turns that into a refusal, and it fires at the
   * `appendChild` that puts the parsed carrier in the document -- one commit
   * before the replacement that would have buried it.
   */
  it('refuses a parser-built carrier that is replaced across two commits, not corrected', () => {
    const ParsedThenReplaced = (): React.ReactElement => {
      const [replaced, setReplaced] = React.useState(false);
      const host = React.useRef<HTMLElement>(null);
      React.useLayoutEffect(() => {
        if (replaced || !host.current) return;
        const range = document.createRange();
        range.selectNodeContents(document.body);
        host.current.appendChild(range.createContextualFragment(PLANTED_MARKUP));
        setReplaced(true);
      }, [replaced]);
      return (
        <section>
          {replaced ? <div data-adaptive-fullscreen="false" /> : <article ref={host} />}
        </section>
      );
    };

    const recorder = recordAdaptiveFullscreen();
    render(<ParsedThenReplaced />);

    expect(() => recorder.stop()).toThrow(/UNOBSERVED-CARRIER: a surface entered the document/);
  });

  /**
   * THE SAME CARRIER, WITH THE EVIDENCE ERASED BEFORE `stop()` COULD READ IT.
   *
   * A ledger that inspects removed subtrees at the END of the drill can only
   * speak about subtrees that are still intact then. Clearing the wrapper the
   * correcting commit removed erases the carrier it was supposed to name -- the
   * removal record still points at the wrapper, but the wrapper is empty by the
   * time anything asks -- and the drill goes back to reporting `['false']` for a
   * frame that painted fullscreen first.
   *
   * Reading each carrier as it CROSSES the edge has nothing to erase: the
   * arrival check already refused this drill at the `appendChild`, before the
   * replacement and long before the cleanup.
   */
  it('refuses a parser-built carrier whose subtree is cleared before stop() could read it', () => {
    const recorder = recordAdaptiveFullscreen();
    const host = document.createElement('section');
    document.body.appendChild(host);
    const outgoing = document.createElement('article');
    host.appendChild(outgoing);

    const range = document.createRange();
    range.selectNodeContents(document.body);
    outgoing.appendChild(range.createContextualFragment(PLANTED_MARKUP));

    const replacement = document.createElement('div');
    replacement.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
    host.replaceChild(replacement, outgoing);
    // The cleanup that leaves the ledger nothing to inspect.
    outgoing.replaceChildren();

    try {
      expect(() => recorder.stop()).toThrow(/UNOBSERVED-CARRIER: a surface entered the document/);
    } finally {
      host.remove();
    }
  });

  /**
   * THE CARRIER THAT ARRIVED CLEAN AND WAS PLANTED AFTERWARDS, which is the
   * departure ledger's own case and nothing else's.
   *
   * The element enters the document carrying nothing, so its arrival is
   * unremarkable. An unenumerated writer then plants the value while it is in
   * the document -- there is no observed write for the witness to compare
   * against -- and the correcting frame removes it, so there is no carrier left
   * for the per-element check to ask. Only reading the removal itself refuses
   * this.
   *
   * The native writer captured before the patch is what any unenumerated path
   * looks like from the recorder's side.
   */
  it('refuses a carrier planted after it arrived and gone before stop() could ask', () => {
    const recorder = recordAdaptiveFullscreen();
    const host = document.createElement('section');
    document.body.appendChild(host);
    const surface = document.createElement('div');
    host.appendChild(surface);
    NATIVE_SET_ATTRIBUTE.call(surface, FULLSCREEN_ATTRIBUTE, 'true');
    surface.remove();

    try {
      expect(() => recorder.stop()).toThrow(/UNOBSERVED-CARRIER: a surface left the document/);
    } finally {
      host.remove();
    }
  });

  /**
   * AND THE SAME DEPARTURE, ERASED BEFORE `stop()`, which is what forces the
   * ledger to read its records EAGERLY rather than at the end.
   *
   * Nothing here ever enters the document carrying a value, so the arrival
   * check has nothing to say; the whole answer is in the removal record. The
   * wrapper that leaves holds the carrier when it is removed and is empty a
   * statement later. A ledger that reads its records on the next structural
   * call copies the value out in between; one that waits for `stop()` finds an
   * empty wrapper and reports the corrected value as a clean history.
   */
  it('reads a departure before the cleanup that would have erased it', () => {
    const recorder = recordAdaptiveFullscreen();
    const host = document.createElement('section');
    document.body.appendChild(host);
    const outgoing = document.createElement('article');
    host.appendChild(outgoing);
    const surface = document.createElement('div');
    outgoing.appendChild(surface);
    NATIVE_SET_ATTRIBUTE.call(surface, FULLSCREEN_ATTRIBUTE, 'true');

    const replacement = document.createElement('div');
    replacement.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
    host.replaceChild(replacement, outgoing);
    outgoing.replaceChildren();

    try {
      expect(() => recorder.stop()).toThrow(/UNOBSERVED-CARRIER: a surface left the document/);
    } finally {
      host.remove();
    }
  });

  /**
   * THE CARRIER THAT IS NEVER DISCONNECTED AT EITHER EDGE, which is what forces
   * both judgments to ask about MEMBERSHIP of this document rather than about
   * connectivity.
   *
   * The parser builds this carrier inside another document, where it is already
   * connected. The first commit's layout effect hands it to this one -- it
   * paints here, holding a value nothing here wrote -- and the second commit's
   * effect hands it back, where it stays connected. It is connected at every
   * instant of its life, so an arrival check that asks `!wasConnected` declines
   * it on the way in, and a departure ledger that skips `isConnected` carriers
   * declines the removal record naming it on the way out. Between them the
   * `true` frame vanishes and the drill reports `['false']` -- a fullscreen
   * first paint read as a clean desktop pass, with both channels installed and
   * neither one speaking.
   *
   * Membership answers both: the crossing IN is an arrival because the carrier
   * was not a member before the call and is one after it, whatever it was
   * connected to in between.
   */
  it('refuses a carrier that crosses in from another document without ever disconnecting', () => {
    const elsewhere = new DOMParser().parseFromString(PLANTED_MARKUP, 'text/html');
    const carrier = elsewhere.body.firstElementChild as Element;
    // The premise: it is connected where it was built, before it comes here.
    expect(carrier.isConnected).toBe(true);

    const CrossesTwoDocuments = (): React.ReactElement => {
      const [handedBack, setHandedBack] = React.useState(false);
      const host = React.useRef<HTMLElement>(null);
      React.useLayoutEffect(() => {
        if (handedBack || !host.current) return;
        host.current.appendChild(carrier);
        setHandedBack(true);
      }, [handedBack]);
      React.useLayoutEffect(() => {
        if (!handedBack) return;
        elsewhere.body.appendChild(carrier);
      }, [handedBack]);
      return (
        <section>
          <article ref={host} />
          {handedBack ? <div data-adaptive-fullscreen="false" /> : null}
        </section>
      );
    };

    const recorder = recordAdaptiveFullscreen();
    render(<CrossesTwoDocuments />);
    // It left this document without ever losing a connection.
    expect(carrier.isConnected).toBe(true);
    expect(document.contains(carrier)).toBe(false);

    expect(() => recorder.stop()).toThrow(/UNOBSERVED-CARRIER: a surface entered the document/);
  });

  /**
   * AND THE SAME CROSSING AT THE OTHER EDGE, which the arrival check cannot
   * speak for.
   *
   * This surface arrives empty, so its arrival is unremarkable and nothing is
   * latched. An unenumerated writer plants the value while it is a member of
   * this document -- it paints fullscreen -- and then it is handed to another
   * document, still connected, and a corrected surface takes its place. The
   * per-element check at `stop()` cannot ask it anything: it is no longer in
   * the tree `stop()` can enumerate. Only the removal record, read as a
   * departure because the carrier is no longer a MEMBER here, still holds the
   * value it left with.
   */
  it('refuses a carrier that leaves for another document without ever disconnecting', () => {
    const elsewhere = new DOMParser().parseFromString('<span></span>', 'text/html');
    const recorder = recordAdaptiveFullscreen();
    const surface = document.createElement('div');
    document.body.appendChild(surface);
    NATIVE_SET_ATTRIBUTE.call(surface, FULLSCREEN_ATTRIBUTE, 'true');
    elsewhere.body.appendChild(surface);
    expect(surface.isConnected).toBe(true);

    const replacement = document.createElement('div');
    replacement.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
    document.body.appendChild(replacement);

    try {
      expect(() => recorder.stop()).toThrow(/UNOBSERVED-CARRIER: a surface left the document/);
    } finally {
      replacement.remove();
    }
  });

  /**
   * AND THE ADOPTION DOOR, which changes which document owns a node without
   * putting it anywhere.
   *
   * `adoptNode` is the one call that re-homes a carrier outright, and it is
   * intercepted like every other door a foreign node comes through. But it
   * places nothing: an adopted node is parentless, paints nothing, and is not a
   * member of anything. A membership judged by OWNERSHIP would refuse the drill
   * right here, at a call that changed no document's contents. The crossing is
   * the insertion that follows, and that is where the refusal belongs.
   */
  it('lets an adoption pass and refuses the insertion that makes the carrier a member', () => {
    const elsewhere = new DOMParser().parseFromString(PLANTED_MARKUP, 'text/html');

    const throughTheDoor = recordAdaptiveFullscreen();
    const adopted = document.adoptNode(elsewhere.body.firstElementChild as Element);
    expect(adopted.ownerDocument).toBe(document);
    expect(adopted.isConnected).toBe(false);
    expect(throughTheDoor.stop()).toEqual([]);

    const recorder = recordAdaptiveFullscreen();
    document.body.appendChild(adopted);
    try {
      expect(() => recorder.stop()).toThrow(/UNOBSERVED-CARRIER: a surface entered the document/);
    } finally {
      adopted.remove();
    }
  });

  /**
   * AND THE IMPORTING DOOR, which is the same crossing without a refusal.
   *
   * `importNode` does not move the foreign carrier; it copies it into this
   * document, and this runner copies the attributes through the map the
   * recorder already watches. So the imported carrier's value IS observed, its
   * arrival is unremarkable, and the honest fullscreen-then-corrected sequence
   * is reported rather than refused. A channel that refused every carrier
   * coming from another document would report a breach here and be wrong: the
   * question is never where a carrier came from, it is whether this recorder
   * saw the value it carries written.
   */
  it('records an imported carrier, whose value crossed through a writer it does see', () => {
    const elsewhere = new DOMParser().parseFromString(PLANTED_MARKUP, 'text/html');
    const recorder = recordAdaptiveFullscreen();
    const host = document.createElement('section');
    document.body.appendChild(host);
    const imported = document.importNode(elsewhere.body.firstElementChild as Element, true);
    host.appendChild(imported);

    const corrected = document.createElement('div');
    corrected.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
    host.replaceChild(corrected, imported);

    try {
      expect(recorder.stop()).toEqual(['true', 'false']);
    } finally {
      host.remove();
    }
  });

  /**
   * AND WHAT THE DOCUMENT ALREADY CARRIED WHEN THE DRILL STARTED.
   *
   * A carrier that the server rendered, or that any parser planted before the
   * recorder existed, never had a write for anything to observe: the recorder
   * opens on a document that is already mid-history. If the correcting frame
   * then REPLACES that node, the value it held leaves with it and the sequence
   * begins at the correction -- a fullscreen first paint reported as a clean
   * desktop one, with no writer to blame.
   *
   * So the drill snapshot IS the first observed value. `replaceChild` is the
   * DOM operation a replacing commit performs, and the pre-existing carrier is
   * planted with the native writer because nothing was watching yet.
   */
  it('records what the document already carried before anything replaced it', () => {
    const host = document.createElement('section');
    const served = document.createElement('span');
    NATIVE_SET_ATTRIBUTE.call(served, FULLSCREEN_ATTRIBUTE, 'true');
    host.appendChild(served);
    document.body.appendChild(host);

    const recorder = recordAdaptiveFullscreen();
    const corrected = document.createElement('div');
    corrected.setAttribute(FULLSCREEN_ATTRIBUTE, 'false');
    host.replaceChild(corrected, served);
    try {
      expect(recorder.stop()).toEqual(['true', 'false']);
    } finally {
      host.remove();
    }
  });

  /**
   * A patched prototype that survived a drill would follow the worker into
   * every later file in the run. `stop()` restores before it can throw, so even
   * a red drill leaves the DOM as it found it.
   *
   * AND IT RESTORES THE SHAPE, not just the value. A slot the recorder found
   * INHERITED must be inherited again afterwards: re-assigning the original
   * value onto the object the patch was aimed at leaves a new own property
   * shadowing the prototype that declares it, which no identity check on the
   * value would ever notice. `Attr.prototype.nodeValue` (declared on
   * `Node.prototype`) and `document.write` (declared on a prototype
   * `globalThis.Document` is not on) are the two live inherited slots here.
   */
  it('leaves every slot it patched exactly as it found it, own or inherited', () => {
    /** Every slot the recorder reaches for, named where it reaches for it. */
    const slots: readonly (readonly [string, object, string])[] = [
      ['Element.prototype', Element.prototype, 'setAttribute'],
      ['Element.prototype', Element.prototype, 'removeAttribute'],
      ['Element.prototype', Element.prototype, 'setAttributeNS'],
      ['Element.prototype', Element.prototype, 'removeAttributeNS'],
      ['Element.prototype', Element.prototype, 'setAttributeNode'],
      ['Element.prototype', Element.prototype, 'setAttributeNodeNS'],
      ['Element.prototype', Element.prototype, 'removeAttributeNode'],
      ['Element.prototype', Element.prototype, 'toggleAttribute'],
      ['Element.prototype', Element.prototype, 'insertAdjacentHTML'],
      ['Element.prototype', Element.prototype, 'innerHTML'],
      ['Element.prototype', Element.prototype, 'outerHTML'],
      ['Attr.prototype', Attr.prototype, 'value'],
      ['Attr.prototype', Attr.prototype, 'nodeValue'],
      ['NamedNodeMap.prototype', NamedNodeMap.prototype, 'setNamedItem'],
      ['NamedNodeMap.prototype', NamedNodeMap.prototype, 'setNamedItemNS'],
      ['NamedNodeMap.prototype', NamedNodeMap.prototype, 'removeNamedItem'],
      ['NamedNodeMap.prototype', NamedNodeMap.prototype, 'removeNamedItemNS'],
      ['document', document, 'write'],
      ['document', document, 'writeln'],
      ['Document.prototype', Document.prototype, 'write'],
      ['Document.prototype', Document.prototype, 'writeln'],
      ['Element.prototype', Element.prototype, 'textContent'],
      // Every slot the birth channel reaches for, from the one table it
      // installs them from: a slot added there is drilled here without this
      // list being edited again.
      ...STRUCTURAL_SLOTS,
    ];
    /** The objects a patch could leave a shadow on. */
    const surfaces: readonly (readonly [string, object])[] = [
      ['Element.prototype', Element.prototype],
      ['Attr.prototype', Attr.prototype],
      ['Node.prototype', Node.prototype],
      ['NamedNodeMap.prototype', NamedNodeMap.prototype],
      ['Document.prototype', Document.prototype],
      ['DocumentFragment.prototype', DocumentFragment.prototype],
      ['Range.prototype', Range.prototype],
      ['document', document],
    ];

    /** Own-ness where the recorder reaches, plus the declaring slot itself. */
    const shapeOf = ([, start, key]: readonly [string, object, string]) => {
      const owner = declaringOwner(start, key);
      const descriptor = owner ? Object.getOwnPropertyDescriptor(owner, key) : undefined;
      return {
        own: Object.prototype.hasOwnProperty.call(start, key),
        owner,
        get: descriptor?.get,
        set: descriptor?.set,
        value: descriptor?.value,
        writable: descriptor?.writable,
        enumerable: descriptor?.enumerable,
        configurable: descriptor?.configurable,
      };
    };
    const ownNames = ([, owner]: readonly [string, object]): string[] =>
      Object.getOwnPropertyNames(owner).sort();

    // The two inherited slots this runner actually has: restoring by
    // re-assignment would turn either of these into an own property.
    expect(shapeOf(['Attr.prototype', Attr.prototype, 'nodeValue']).own).toBe(false);
    expect(shapeOf(['document', document, 'write']).own).toBe(false);

    const before = slots.map(shapeOf);
    const beforeNames = surfaces.map(ownNames);

    const recorder = recordAdaptiveFullscreen();
    expect(Element.prototype.setAttribute).not.toBe(NATIVE_SET_ATTRIBUTE);
    expect(document.write).not.toBe(NATIVE_DOCUMENT_WRITE);
    expect(Node.prototype.appendChild).not.toBe(NATIVE_APPEND_CHILD);
    // Every structural slot is actually installed, not silently skipped for a
    // name this runner spells differently.
    for (const [where, start, key] of STRUCTURAL_SLOTS) {
      const owner = declaringOwner(start, key);
      expect({ where: `${where}.${key}`, patched: owner !== null }).toEqual({
        where: `${where}.${key}`,
        patched: true,
      });
      expect({
        where: `${where}.${key}`,
        wrapped:
          (owner as Record<string, unknown>)[key] !==
          before[slots.findIndex((slot) => slot[1] === start && slot[2] === key)].value,
      }).toEqual({ where: `${where}.${key}`, wrapped: true });
    }
    expect(shapeOf(['Element.prototype', Element.prototype, 'innerHTML']).set).not.toBe(
      before[9].set,
    );
    expect(shapeOf(['Attr.prototype', Attr.prototype, 'value']).set).not.toBe(before[11].set);
    expect(NamedNodeMap.prototype.setNamedItem).not.toBe(before[13].value);

    recorder.stop();

    slots.forEach((slot, index) => {
      const where = `${slot[0]}.${slot[2]}`;
      const was = before[index];
      const now = shapeOf(slot);
      expect({ where, own: now.own }).toEqual({ where, own: was.own });
      expect({ where, declared: now.owner === was.owner }).toEqual({ where, declared: true });
      expect({ where, same: now.get === was.get }).toEqual({ where, same: true });
      expect({ where, same: now.set === was.set }).toEqual({ where, same: true });
      expect({ where, same: now.value === was.value }).toEqual({ where, same: true });
      expect({ where, writable: now.writable }).toEqual({ where, writable: was.writable });
      expect({ where, enumerable: now.enumerable }).toEqual({ where, enumerable: was.enumerable });
      expect({ where, configurable: now.configurable }).toEqual({
        where,
        configurable: was.configurable,
      });
    });

    surfaces.forEach((surface, index) => {
      expect({ where: surface[0], names: ownNames(surface) }).toEqual({
        where: surface[0],
        names: beforeNames[index],
      });
    });
  });
});
