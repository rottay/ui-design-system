'use client';

/**
 * @fileoverview SystemCssVariablesBridge - Rottay Design System
 * @description Synchronizes JS-resolved personality data into namespaced CSS
 * custom properties scoped to `:root`. A static CSS projection—not this
 * bridge—owns the canonical component aliases.
 *
 * @remarks
 * Injected CSS variables include personality-derived values such as:
 * - `--ds-personality-animation-*` (entrance, stagger, hover lift/scale)
 * - `--ds-personality-accent-*` (bar position, thickness, icon shape)
 * - `--ds-personality-card-*` (elevation, hover behavior)
 * - `--ds-personality-typography-*` (heading weight, letter spacing, label style)
 *
 * Without this bridge, CSS keyframes, pseudo-elements, and non-React styling
 * paths would fall out of sync whenever a product profile or tenant override
 * changes token values at runtime.
 *
 * PRECEDENCE LAW: personality is resolved per product at runtime, so the
 * cascade contract gives it the named `rottay-personality` layer (see
 * `ROTTAY_CASCADE_LAYER_ORDER`). Tenant paint is deliberately UNLAYERED and
 * therefore outranks it -- see `TENANT_PAINT_IS_UNLAYERED`, which records why
 * the layer this file used to name, `rottay-tenants`, was removed: it placed
 * the authority BELOW the channel that is subordinate to it. This bridge writes
 * its `:root` rule INSIDE the personality layer, never as inline styles on
 * `document.documentElement` and never as an unlayered rule.
 *
 * Both exclusions are load-bearing:
 * - Inline styles carry the highest specificity CSS offers and would beat every
 *   tenant declaration, including the scoped `html[data-tenant='x'][data-theme=
 *   'dark']` rules `ThemeProvider` injects for a tenant's `generatedChromeCss`.
 * - An UNLAYERED `:root` rule is not the safe middle ground it looks like.
 *   Unlayered declarations outrank every cascade layer regardless of
 *   specificity, so a bare `:root` here beat the layered tenant artifacts
 *   outright while losing to any artifact that happened to be imported without
 *   a `layer()`. That made the winner depend on how each vertical's entrypoint
 *   was written rather than on the declared order -- the same variable resolved
 *   to personality for one vertical and to the artifact for another.
 *
 * Writing only namespaced inputs into the named layer removes the precedence
 * ambiguity entirely. Static and DB tenant artifacts remain the sole
 * productive tenant painters; the personality CSS projection consumes these
 * values as a subordinate product/vertical data axis.
 *
 * OWNERSHIP LAW: `:root` is document-level, so a document has exactly one
 * personality channel, and `#ds-personality-tokens` is a SINGLETON that several
 * mounted bridges may hold at once. Three clauses follow, and each is pinned by
 * a named drill in `tests/personality-style-ownership.test.tsx`:
 *
 * 1. The bridge writes ONLY into a node it created itself. A node already
 *    sitting at that id is never adopted, never written into and never put
 *    back: it is left byte-, attribute- and position-exact, and the refusal is
 *    announced. Nothing in this codebase emits that id -- there is no SSR pass,
 *    artifact or provider that produces one -- so an incumbent is by definition
 *    unrecognized, and adopting it would mean guessing at a foreign authority's
 *    stylesheet.
 * 2. Holds are EQUAL. One document-scoped claim tracks every active hold's
 *    latest `{key, declarations}`, and the channel is reconciled when a hold
 *    joins, revises what it publishes, or leaves. It repaints only when every
 *    active hold agrees on the exact key; any divergence, from any hold, is
 *    announced and leaves the last agreed state untouched. Privileging the
 *    first holder instead would make the document's personality a function of
 *    mount order and would strand a survivor as a permanent non-writer once
 *    that first holder unmounted.
 * 3. Ownership is re-proved before EVERY mutation -- live registry claim,
 *    unique id, exact element, ownership mark, and the EXACT `CSSStyleSheet`
 *    the claim was taken against, since `.sheet` is an accessor and the object
 *    a write lands in can be replaced while node identity, id and mark all
 *    stay put. A claim that was valid when it was taken is not evidence that
 *    it is valid now, and on a takeover this bridge mutates no node at all.
 *    The write is re-proved once more AFTER its final mutation as well: every
 *    other check guards the mutation that follows it, so the last one would
 *    otherwise be unguarded and a takeover landing there would be recorded as
 *    a completed write.
 *
 * The last hold removes the node this claim created, so tenant switching and
 * test isolation do not leak values across render trees.
 *
 * @see {@link useTokens} - Hook that resolves the merged token graph
 * @see {@link resolvePersonalityBridgeCssVariables} - Maps tokens to
 * namespaced bridge inputs
 * @module System/Providers/CssVariablesBridge
 * @category System
 * @package @rottay/design-system
 */

import { useInsertionEffect, useRef } from 'react';

import {
  resolvePersonalityBridgeCssVariables,
  resolvePublishedPersonalityCssVariables,
} from '@/foundation/tokens/ts/runtime/personality';
import { changeKeyOfMap } from '@/infrastructure/runtime/foundation/change-key';

import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import {
  buildCascadeLayerOrderStatement,
  buildPersonalityRootRuleText,
} from '@/infrastructure/runtime/theming/foundation/cascade-layers';

/** Singleton style element: one document, one stylesheet, one `:root` rule. */
const PERSONALITY_STYLE_ELEMENT_ID = 'ds-personality-tokens';

/**
 * Used in place of `getElementById` wherever the singleton claim is at stake.
 * `getElementById` answers with the FIRST match and says nothing about a
 * second, so it cannot distinguish "the node" from "one of the nodes" -- and a
 * duplicate id is precisely the state in which writing is unsafe.
 */
const PERSONALITY_STYLE_SELECTOR = `#${PERSONALITY_STYLE_ELEMENT_ID}`;

/**
 * Records which cascade path the bridge actually took, so the behavior is
 * observable in the DOM instead of inferred.
 */
const CASCADE_MODE_ATTRIBUTE = 'data-ds-cascade';

/**
 * Declares who owns the singleton node, because an id is not a title deed: the
 * bridge, a test shim and an unrelated authority all reach for the same one --
 * an SSR pass is deliberately absent from that list, since nothing in this
 * codebase emits the id and an incumbent is therefore always unrecognized.
 * Re-checked before every mutation, not just before teardown, so a
 * node taken over between one repaint and the next is left exactly as found.
 */
const STYLE_OWNER_ATTRIBUTE = 'data-ds-owner';
const STYLE_OWNER = 'ds-personality-bridge';

/**
 * One document's claim on the personality stylesheet.
 *
 * The claimed node is always one this bridge CREATED, so releasing it means
 * removing it and never restoring somebody else's. Concurrent holders are
 * expected -- a preview tree, a portal, a second provider -- so the claim
 * carries the set of them and the LAST one tears down.
 *
 * `agreedKey` is the change key of what is currently published, which is not
 * the same as what any particular hold wants: it is the last state every active
 * hold agreed on, and it is what the channel keeps while they disagree. `null`
 * means nothing has been published yet.
 */
interface PersonalityStyleClaim {
  readonly element: HTMLStyleElement;
  /**
   * The exact `CSSStyleSheet` this claim was taken against, recorded because
   * `.sheet` is an ACCESSOR and the node is not the sheet. A node can keep its
   * id, its element identity and its ownership mark while the object every
   * write actually lands in is replaced underneath -- and a bridge that only
   * ever re-read `.sheet` would follow it there without noticing.
   */
  readonly sheet: CSSStyleSheet;
  readonly holds: Set<ClaimHold>;
  agreedKey: string | null;
}

/**
 * One mounted bridge's hold on the claim, and the latest thing it intends to
 * publish.
 *
 * Holds are EQUAL: none is an owner and none is a guest. Privileging the
 * establishing holder -- the previous law -- decided the document's personality
 * by mount order in two directions at once. If the privileged holder's tokens
 * moved it repainted the shared channel and carried the key with it; if a
 * joiner's moved it was refused. And when the privileged holder unmounted, the
 * survivor was left a permanent non-writer, so its later changes never reached
 * the DOM at all.
 *
 * The record is mutable and its OBJECT IDENTITY is the hold, so a bridge
 * revises what it publishes in place rather than re-entering the registry.
 */
/**
 * A hold carries the canonical INPUT its bridge rendered from, never a derived
 * snapshot. Every route that publishes -- mount, update and the republish a
 * departing hold triggers among the survivors -- therefore derives the payload
 * from the same authority (`resolvePublishedPersonalityCssVariables`) at the
 * moment it writes, instead of one route trusting a value another route stored.
 * `key` stays the consensus identity: it is what the holds must agree on, and
 * what the writer re-proves the recomputed payload against before it mutates.
 */
type PublishedPersonalityInput = Parameters<
  typeof resolvePublishedPersonalityCssVariables
>;

interface ClaimHold {
  key: string;
  personality: PublishedPersonalityInput[0];
  transitions: PublishedPersonalityInput[1];
}

/**
 * A REGISTERED symbol on the `Document`, not a module-scoped map: a bundle that
 * evaluates this module twice would get two private registries, each believing
 * it is the only holder. Per-document, and dies with the document.
 */
const CLAIM_PROPERTY = Symbol.for('rottay.design-system.personality-style-claim');

type ClaimHost = Document & { [CLAIM_PROPERTY]?: PersonalityStyleClaim };

/** Announces a refusal, because a silent refusal misleads as much as a silent overwrite. */
function warnRefused(reason: string): void {
  console.warn(
    `[design-system] Personality bridge refused #${PERSONALITY_STYLE_ELEMENT_ID}: ${reason}`,
  );
}

/**
 * Everything that must still be true before this claim may touch the DOM.
 *
 * Re-proved before EVERY mutation rather than once at claim time, because none
 * of it is stable: the registry entry can be replaced, a second node can appear
 * at the id, the node itself can be swapped, and the ownership mark can be
 * stripped -- any of it between one repaint and the next. A claim that was
 * valid when it was taken is not evidence that it is valid now, and the
 * previous implementation checked none of this on the repaint path.
 *
 * A duplicate id fails closed here too, which is why the lookup is a selector
 * rather than `getElementById`: writing into whichever of two same-id nodes the
 * document happens to answer with is not ownership, it is a coin toss.
 */
function claimOwnsNode(doc: Document, claim: PersonalityStyleClaim): boolean {
  const host = doc as ClaimHost;
  if (host[CLAIM_PROPERTY] !== claim) return false;

  const matches = doc.querySelectorAll(PERSONALITY_STYLE_SELECTOR);
  if (matches.length !== 1 || matches[0] !== claim.element) return false;

  return claim.element.getAttribute(STYLE_OWNER_ATTRIBUTE) === STYLE_OWNER;
}

/**
 * The same proof, extended to the stylesheet the write will actually land in.
 *
 * This is the predicate every individual mutation is gated on, because a write
 * is not one event. Emptying the sheet, inserting the layer scaffolding,
 * stamping the cascade attribute and setting sixty-odd properties are dozens of
 * separate mutations, and proving ownership once at the top of that sequence
 * only establishes who owned the node before the FIRST of them. A takeover
 * landing mid-sequence -- which is exactly what a shimmed `insertRule` or a
 * concurrent authority produces -- would then be followed by every remaining
 * mutation, into a node the bridge had already stopped owning.
 *
 * The cost is one id lookup per mutation on a repaint, which happens on a
 * tenant or personality change rather than on a frame.
 */
function claimOwnsSheet(doc: Document, claim: PersonalityStyleClaim): boolean {
  return claimOwnsNode(doc, claim) && claim.element.sheet === claim.sheet;
}

/**
 * Takes (or joins) this document's claim on the personality stylesheet.
 *
 * A node already sitting at that id is NEVER adopted. Nothing in this codebase
 * emits `#ds-personality-tokens` -- no SSR pass, no artifact, no provider --
 * so an incumbent is by definition something this bridge does not recognize,
 * and writing into it is a guess about a stylesheet somebody else authored. The
 * previous implementation guessed: it proved the node's text re-parsed to its
 * rules and treated that as a title deed, which admits any sheet whose author
 * happened to use `textContent`. It then tried to make the guess reversible by
 * snapshotting and restoring -- but restoring is itself a mutation of a node we
 * do not own, and it can only ever be as exact as the snapshot was lucky.
 * Refusing costs a subordinate data channel; adopting risks somebody else's.
 *
 * @returns The claim this hold joined, or `null` when the channel is not this
 * caller's to write. A refusal is sticky for the caller's lifetime: polling for
 * the incumbent to leave would reintroduce mount-order-dependent winners.
 */
function claimPersonalityStyleElement(
  doc: Document,
  hold: ClaimHold,
): PersonalityStyleClaim | null {
  const host = doc as ClaimHost;
  const matches = doc.querySelectorAll(PERSONALITY_STYLE_SELECTOR);
  const existing = host[CLAIM_PROPERTY];

  if (existing) {
    // The claim no longer describes the world, so it cannot speak for the node.
    if (matches.length !== 1 || matches[0] !== existing.element) {
      warnRefused(
        matches.length > 1
          ? 'more than one node carries that id, so the claim on record ' +
              'cannot say which one it means'
          : 'the claim on record no longer matches the node at that id',
      );
      return null;
    }
    if (existing.element.getAttribute(STYLE_OWNER_ATTRIBUTE) !== STYLE_OWNER) {
      warnRefused('the claimed node no longer carries the bridge ownership mark');
      return null;
    }
    // Joining is entry into a channel that will be written on this hold's
    // behalf, so it is proved against the same sheet identity every write is.
    // A node whose stylesheet was replaced under the claim is not the thing
    // this claim describes, whatever its id and mark still say.
    if (existing.element.sheet !== existing.sheet) {
      warnRefused(
        'the claimed node no longer carries the stylesheet it was claimed ' +
          'against, so there is nothing sound to join',
      );
      return null;
    }

    // A divergent hold is admitted as a HOLD and refused as a PUBLISHER, which
    // is a different thing from the refusal it used to get. Turning it away
    // entirely made it a non-holder, so when the establishing bridge unmounted
    // the channel was torn down under a bridge that was still mounted and still
    // rendering against it. Reconciliation decides what reaches the DOM.
    existing.holds.add(hold);
    return existing;
  }

  if (matches.length > 0) {
    warnRefused(
      matches.length > 1
        ? 'the document already carries more than one node at that id'
        : 'a node already occupies that id with no live claim behind it, and ' +
            'there is no predecessor this bridge is entitled to adopt',
    );
    return null;
  }

  const element = doc.createElement('style');
  element.id = PERSONALITY_STYLE_ELEMENT_ID;
  element.setAttribute(STYLE_OWNER_ATTRIBUTE, STYLE_OWNER);
  doc.head.appendChild(element);

  // A connected `<style>` carries a stylesheet, so this is a fail-closed
  // programming error rather than a state to tolerate. The node is taken back
  // out: leaving an unwritable one behind would occupy the id permanently, and
  // since an occupied id is never adopted, every later bridge in this document
  // would refuse too and personality would be dead for the page's lifetime.
  // Removing a node created one statement ago mutates nothing anyone else owns.
  const sheet = element.sheet;
  if (!sheet) {
    element.remove();
    warnRefused('the node it just created carries no stylesheet to write into');
    return null;
  }

  const claim: PersonalityStyleClaim = {
    element,
    sheet,
    holds: new Set([hold]),
    agreedKey: null,
  };
  host[CLAIM_PROPERTY] = claim;
  return claim;
}

/**
 * Drops one hold, then RECONCILES rather than merely stopping.
 *
 * A departure changes what the remaining holds agree on, so it is a publishing
 * event like any other: two holds that disagreed leave one hold that agrees
 * with itself, and that survivor's values have to reach the DOM. Treating
 * release as teardown-only is what left a survivor publishing nothing for the
 * rest of its life.
 *
 * Only the LAST hold removes the node, and only after re-proving the claim
 * still owns it -- including when the takeover is nothing more than the
 * ownership mark being rewritten in place.
 */
function releasePersonalityStyleElement(
  doc: Document,
  claim: PersonalityStyleClaim,
  hold: ClaimHold,
): void {
  const host = doc as ClaimHost;
  if (host[CLAIM_PROPERTY] !== claim) return;
  if (!claim.holds.delete(hold)) return;

  if (claim.holds.size > 0) {
    reconcilePersonalityChannel(doc, claim);
    return;
  }

  // NOTHING separates the proof from the mutation it guards -- not even the
  // registry delete. `claimOwnsSheet` reads the live registry entry as part of
  // what ownership means, so retiring that entry first would leave the removal
  // standing on a proof the document had already stopped agreeing with: a
  // mutation performed under a claim nobody names, which is precisely the
  // ordering every write path here refuses. The removal therefore runs while
  // the claim is still on record, and the entry is retired in `finally` --
  // after the node is gone, on the refusal path, and on a throw out of
  // `remove()` -- so no exit leaves a registry pointing at a released claim.
  //
  // That retirement is CONDITIONAL, and the condition is the other half of the
  // same ordering. `element.remove()` is not guaranteed to be the pristine DOM
  // method: a test shim, an instrumentation layer or a host-patched DOM API can
  // wrap it and run synchronously inside the call. (A MutationObserver is NOT
  // that risk -- its callbacks are delivered as microtasks once the removal has
  // already returned, so they cannot land inside this `try` at all.) Whatever
  // does run there can claim the freshly vacated channel before this `finally`
  // is reached, and the entry on record at that point would be the SUCCESSOR's.
  // Deleting it would retire a claim that was never released -- leaving a live
  // bridge holding a claim the document no longer names, failing every
  // ownership proof it goes on to make and publishing nothing for the rest of
  // its life. A release retires its OWN entry or none.
  //
  // The sheet identity is part of the proof here as it is everywhere else: a
  // node whose stylesheet was replaced under the claim is not the node this
  // claim describes, and removing it would be a mutation to something the
  // bridge cannot show it still owns. The accepted consequence is that such a
  // node stays in the document holding the id, with no live claim behind it --
  // which, since an occupied id is never adopted, refuses personality for the
  // rest of that document's life. Fail-closed and inert beats deleting a node
  // that may belong to someone else.
  try {
    if (!claimOwnsSheet(doc, claim)) return;

    // Only ever a node this claim created: adoption does not exist, so there is
    // no predecessor an earlier release could have restored by mistake.
    claim.element.remove();
  } finally {
    if (host[CLAIM_PROPERTY] === claim) delete host[CLAIM_PROPERTY];
  }
}

/**
 * Publishes what every active hold agrees on, or nothing at all.
 *
 * Agreement is over the exact change key, so "agree" means byte-identical
 * declarations rather than merely compatible ones. While the holds disagree the
 * channel KEEPS ITS LAST AGREED STATE: no hold is privileged, so there is no
 * non-arbitrary winner to promote, and letting whichever one moved most
 * recently repaint would decide a document's personality by render order -- the
 * same accident, arriving later, that the refusal law exists to prevent.
 *
 * Divergence is announced every time it is observed, from whichever side it
 * came. A tree rendering against a tenant the document does not publish is a
 * real defect either way, and the only thing silence changes is whether anyone
 * finds it.
 */
function reconcilePersonalityChannel(
  doc: Document,
  claim: PersonalityStyleClaim,
): void {
  const holds = Array.from(claim.holds);
  if (holds.length === 0) return;

  const intent = holds[0];
  if (holds.some((candidate) => candidate.key !== intent.key)) {
    warnRefused(
      'the mounted bridges publish different declarations, so the channel ' +
        'keeps the last state they all agreed on',
    );
    return;
  }

  // Already published. Re-writing identical declarations would churn the sheet
  // on every mount and release, and would repaint on a development replay that
  // changed nothing.
  if (claim.agreedKey === intent.key) return;

  if (!claimOwnsNode(doc, claim)) {
    warnRefused('the node it claimed is no longer the node it owns');
    return;
  }

  if (claim.element.sheet !== claim.sheet) {
    // A `<style>` this bridge created and appended carries the sheet it was
    // claimed against, so reaching here means that sheet went away or was
    // replaced underneath -- the node detached, or stood in for by something
    // that only looks like it. Personality is inert either way; the difference
    // a warning makes is whether anyone finds out.
    warnRefused(
      claim.element.sheet
        ? 'the claimed node now carries a different stylesheet than the one ' +
            'it was claimed against'
        : 'the claimed node no longer carries a stylesheet to write into',
    );
    return;
  }

  // `agreedKey` advances only on a COMPLETED write, and an abandoned one
  // INVALIDATES it rather than leaving it where it was. A write cut short by a
  // takeover leaves the sheet holding a partial state that matches no hold's
  // intent, including the state `agreedKey` still names. Keeping the old value
  // would false-green the repair: were the holds to settle back on that same
  // key, the "already published" shortcut would skip the write and the partial
  // state would stand. `null` says what is true -- nothing published here is
  // known to be intact -- so the next reconciliation repaints whatever the
  // holds agree on.
  if (writePersonalityDeclarations(doc, claim, intent)) {
    claim.agreedKey = intent.key;
    return;
  }
  claim.agreedKey = null;
}

/**
 * Inserts the empty `:root` rule the bridge writes into, preferring the
 * personality cascade layer and degrading to an unlayered rule.
 *
 * The layer order statement is emitted first so the layer position is pinned
 * even when this stylesheet is evaluated before the DS entrypoint; re-declaring
 * an already registered name does not move it.
 *
 * Every engine that supports cascade layers (Baseline since March 2022) takes
 * the layered path. The fallback exists for CSSOM implementations that cannot
 * parse `@layer` at all -- notably the `happy-dom` test environment, whose
 * `insertRule` throws on any `@layer` text. Falling back to the previous
 * unlayered rule keeps personality applying there rather than silently
 * emitting nothing.
 *
 * Every insert and delete is gated on `stillOwned`, including the fallback's:
 * the layered attempt runs FIRST, so by the time the fallback empties the sheet
 * the bridge has already mutated it once and a takeover may have landed in
 * between.
 *
 * @param stillOwned - Re-proves ownership immediately before each mutation.
 * @returns The rule to write declarations into, or `null` if neither path
 * worked or ownership was lost partway through.
 */
function insertPersonalityRootRule(
  sheet: CSSStyleSheet,
  stillOwned: () => boolean,
): CSSStyleRule | null {
  try {
    if (!stillOwned()) return null;
    sheet.insertRule(buildCascadeLayerOrderStatement(), 0);
    if (!stillOwned()) return null;
    sheet.insertRule(buildPersonalityRootRuleText(), 1);
    const layerBlock = sheet.cssRules[1] as CSSGroupingRule | undefined;
    const layeredRoot = layerBlock?.cssRules?.[0] as CSSStyleRule | undefined;
    if (layeredRoot?.style) return layeredRoot;
  } catch {
    // CSSOM cannot parse `@layer`; fall through to the unlayered rule.
  }

  while (sheet.cssRules.length > 0) {
    if (!stillOwned()) return null;
    sheet.deleteRule(0);
  }
  if (!stillOwned()) return null;
  sheet.insertRule(':root {}', 0);
  return (sheet.cssRules[0] as CSSStyleRule | undefined) ?? null;
}

/**
 * Replaces the claimed sheet's contents with the given declarations.
 *
 * The sheet comes off the CLAIM rather than off the element: the claim recorded
 * one particular sheet object, `.sheet` is an accessor, and re-reading it is a
 * second question that may get a different answer.
 *
 * A repaint is not one mutation but dozens, so ownership is re-proved before
 * each of them and the write ABANDONS at the first one that fails. Any of them
 * can be the point where an authority takes the node over -- the CSSOM calls
 * are ordinary DOM APIs a shim or an extension can wrap -- and a sequence
 * checked only at its start would keep going after that, writing into a node
 * this bridge no longer owns.
 *
 * Values are written through CSSOM `setProperty` on a stylesheet rule -- never
 * through text interpolation -- matching how ThemeProvider applies
 * branding/appearance vars. A value never passes through a CSS text parser, so
 * a malformed token value cannot break out of its declaration. Only the static
 * layer/selector scaffolding is inserted as text.
 *
 * @returns Whether the write ran to completion under an unbroken claim.
 * `false` means the sheet holds a state that matches no hold's intent, which
 * the caller must not record as published.
 */
function writePersonalityDeclarations(
  doc: Document,
  claim: PersonalityStyleClaim,
  hold: ClaimHold,
): boolean {
  const { element, sheet } = claim;
  const stillOwned = () => claimOwnsSheet(doc, claim);

  /* Derive the payload HERE, from the canonical authority, on every route --
   * including the republish a departing hold triggers among survivors, where no
   * bridge is rendering and there is no fresh value to hand in. */
  const published = resolvePublishedPersonalityCssVariables(
    hold.personality,
    hold.transitions,
  );

  /* Integrity guard, key <-> map: the consensus was reached on `hold.key`, so
   * the recomputed payload must fold to exactly that key. If it does not, the
   * input drifted from what every hold agreed to publish, and writing it would
   * put a snapshot on the channel that nobody consented to. Fail closed and let
   * the caller clear `agreedKey`. */
  const recomputed: Record<string, string> = {};
  for (const [name, value] of Object.entries(published)) {
    if (value === undefined) continue;
    recomputed[name] = String(value);
  }
  if (changeKeyOfMap(recomputed) !== hold.key) {
    warnRefused(
      'the recomputed personality payload no longer folds to the key the ' +
        'holds agreed on, so the channel keeps its previous state',
    );
    return false;
  }

  while (sheet.cssRules.length > 0) {
    if (!stillOwned()) return false;
    sheet.deleteRule(0);
  }

  const rule = insertPersonalityRootRule(sheet, stillOwned);
  if (!stillOwned()) return false;

  element.setAttribute(
    CASCADE_MODE_ATTRIBUTE,
    sheet.cssRules.length > 1 ? 'layered' : 'unlayered',
  );
  if (!rule) return false;

  for (const [name, value] of Object.entries(published)) {
    if (value === undefined) continue;
    if (!stillOwned()) return false;
    rule.style.setProperty(name, String(value));
  }

  // The POSTcondition, which the per-mutation preconditions cannot stand in
  // for. Each of those proves ownership before the mutation that FOLLOWS it, so
  // the last mutation in the sequence -- the final `setProperty`, or the
  // cascade attribute when there is nothing to set -- is the one no check comes
  // after. A takeover landing during it would be reported as a completed write
  // and the caller would advance `agreedKey` to a key the sheet does not hold,
  // which is the false green this whole return value exists to prevent: once
  // `agreedKey` names it, the "already published" shortcut skips the repair.
  // A write counts as owned only if the claim still holds after its last byte.
  return stillOwned();
}

/**
 * Renders nothing visually. Takes a hold on the document's personality channel
 * before the commit reaches layout, keeps that hold's intent up to date, and
 * drops it on unmount. What actually reaches the `:root` rule is whatever every
 * active hold agrees on -- see {@link reconcilePersonalityChannel}.
 */
export function SystemCssVariablesBridge(): null {
  const tokens = useTokens();

  // Resolved during render so the change key is the SERIALIZATION OF WHAT GETS
  // WRITTEN, not a hand-picked sample of the inputs: a sampled key both re-ran
  // for input changes with no output and skipped tenants differing only in an
  // unsampled field, leaving the PREVIOUS tenant's variables painted. Keying on
  // the output is exact by construction rather than by an inventory somebody
  // keeps in sync. It also surfaces an unprojected channel -- a fail-closed
  // programming error -- during render rather than one effect later.
  const declarations: Record<string, string> = {};
  for (const [name, value] of Object.entries(
    resolvePersonalityBridgeCssVariables(tokens),
  )) {
    declarations[name] = String(value);
  }
  const declarationsKey = changeKeyOfMap(declarations);

  const holdRef = useRef<{
    claim: PersonalityStyleClaim;
    hold: ClaimHold;
  } | null>(null);

  // INSERTION effects, not passive ones. What React guarantees is the ordering
  // against LAYOUT effects -- insertion effects for a commit run before any
  // layout effect fires -- which is the guarantee this needs: the personality
  // sheet is in place before anything in the tree measures. It is NOT a promise
  // to run before the commit's DOM mutations, and nothing here depends on one.
  // With `useEffect` the order was inverted outright: descendants measured
  // first and the variables that decide spacing, elevation and motion arrived
  // afterwards, so a measured value could describe a frame that was never
  // painted.
  //
  // The lifecycle is legal here rather than merely convenient. What
  // `useInsertionEffect` forbids is updating state and reading refs that are
  // not attached yet; this component renders `null`, sets no state and holds no
  // DOM ref, so both are absent by construction and no render-phase side effect
  // has to be invented to get pre-layout timing. Cleanup is supported as usual,
  // which is what keeps release exact.
  //
  // Claim and release are bound to the MOUNT, not to the token values: one hold
  // per mounted bridge, taken once and dropped once, and idempotent after its
  // own cleanup. The mount-time key is deliberately the one this effect closes
  // over, so a hold enters the registry already stating what it publishes and a
  // reconciliation triggered by ANOTHER bridge never reads a blank intent.
  useInsertionEffect(() => {
    const hold: ClaimHold = {
      key: declarationsKey,
      personality: tokens.personality,
      transitions: tokens.transitions,
    };
    const claim = claimPersonalityStyleElement(document, hold);
    holdRef.current = claim ? { claim, hold } : null;
    if (claim) reconcilePersonalityChannel(document, claim);

    return () => {
      holdRef.current = null;
      if (claim) releasePersonalityStyleElement(document, claim, hold);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInsertionEffect(() => {
    const held = holdRef.current;
    if (!held) return;

    // Revise this hold in place, then let reconciliation decide. Drift is
    // symmetric by construction now: this is the only path any bridge has to
    // the channel, so a hold that moves off the agreed key is announced and
    // withheld whether or not it was the one that created the node. The
    // previous asymmetry -- establisher repaints and carries the key, joiner is
    // refused -- made the published result depend on which bridge mounted
    // first.
    held.hold.key = declarationsKey;
    held.hold.personality = tokens.personality;
    held.hold.transitions = tokens.transitions;
    reconcilePersonalityChannel(document, held.claim);
    // `declarations` is absent by design: a fresh object each render, whose
    // identity is `declarationsKey`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [declarationsKey]);

  return null;
}
