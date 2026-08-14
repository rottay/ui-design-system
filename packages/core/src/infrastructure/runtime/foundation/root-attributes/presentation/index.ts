/**
 * @fileoverview Presentation channels: inline style declarations and classes.
 *
 * These are the two channels whose values are not plain attribute strings, so
 * each carries its own CSSOM-shaped encoding on top of the one ownership stack
 * in `../registry`. The family rationale lives on the facade at `../index.ts`.
 *
 * @module Runtime/Foundation/RootAttributes/Presentation
 * @package @rottay/design-system
 */

import { ABSENT, claimChannel, type ReleaseRootAttribute, type ChannelAdapter } from '../registry';

/**
 * A declaration's priority travels INSIDE the channel value, because the stack
 * carries one string per claim and a baseline that drops `!important` is not
 * the value it was handed. CSS parses a trailing `!important` as priority
 * rather than as part of the value, so appending it is unambiguous in both
 * directions: `getPropertyValue` never returns it, and `setProperty` is given
 * it back as the priority argument.
 */
const IMPORTANT_SUFFIX = ' !important';

/**
 * A CSS declaration as CSSOM actually models it: a value plus a priority.
 * Never a byte string to be replayed.
 */
interface StyleDeclaration {
  readonly value: string;
  readonly priority: '' | 'important';
}

/** `!important`, in every spelling CSS accepts: `! IMPORTANT`, `!important `. */
const IMPORTANT_PATTERN = /\s*!\s*important\s*$/i;

/**
 * Splits a channel string into the CSSOM pair.
 *
 * The channel carries ONE string per claim, so priority has to travel inside
 * it -- a baseline that dropped `!important` would not be the declaration it
 * was handed. Parsing is unambiguous in both directions because CSS reads a
 * trailing `!important` as priority rather than as part of the value:
 * `getPropertyValue` never returns it, and `setProperty` takes it back as the
 * priority argument.
 */
function parseStyleDeclaration(declaration: string): StyleDeclaration {
  const important = IMPORTANT_PATTERN.exec(declaration);
  if (!important) return { value: declaration.trim(), priority: '' };
  return { value: declaration.slice(0, important.index).trim(), priority: 'important' };
}

/** The inverse of {@link parseStyleDeclaration}; the canonical channel string. */
function formatStyleDeclaration({ value, priority }: StyleDeclaration): string {
  return priority === 'important' ? `${value}${IMPORTANT_SUFFIX}` : value;
}

/**
 * Claims an inline root style property.
 *
 * Two kinds of channel share this one implementation, and deliberately so:
 *
 * - a CSS property such as `color-scheme`; and
 * - a CSS CUSTOM property such as `--ds-color-primary`, which the runtime
 *   tenant emitters write on `:root`.
 *
 * Inline styles outrank every stylesheet, so a stale rollback here is more
 * damaging than for an attribute: it would silently re-apply a previous
 * theme's scheme over the live one. The converse — a bare `removeProperty` on
 * cleanup — is the same defect `claimRootAttribute` exists to fix: the
 * consumer may have declared that custom property inline itself, and deleting
 * it hands back nothing where a value used to live.
 *
 * WHY AN EMPTY DECLARATION IS REFUSED RATHER THAN WRITTEN. This channel speaks
 * CSSOM, and in CSSOM an empty value is not a value: `setProperty(prop, '')`
 * is specified to behave as `removeProperty(prop)`. A claim of `''` therefore
 * did the one thing the stack exists to prevent -- it DELETED the declaration
 * underneath it -- and then compounded it: the read-back came back ABSENT, so
 * the claim's stored value no longer matched the channel, and `release`
 * classified its own damage as an external takeover and walked away without
 * restoring the baseline. The SSR stamp was gone for the lifetime of the
 * document. A removal is not a thing a claim can OWN, so it is rejected at
 * the boundary, before any mutation. A caller that wants a property gone must not
 * claim the channel at all.
 *
 * The same reasoning covers whitespace: CSSOM trims, so `'   '` and
 * `'  !important'` are empty declarations wearing a disguise, and they are
 * refused by exactly the same rule.
 *
 * Note the asymmetry with `claimRootAttribute`, which is correct and
 * deliberate: `setAttribute(name, '')` produces a real, present, empty
 * attribute, and `data-ds-root=""` is a meaningful artifact selector. An empty
 * ATTRIBUTE is a value; an empty DECLARATION is a deletion.
 */
export function claimRootStyleProperty(
  element: HTMLElement,
  property: string,
  value: string,
): ReleaseRootAttribute {
  const apply = (declaration: string): void => {
    const { value: cssValue, priority } = parseStyleDeclaration(declaration);
    element.style.setProperty(property, cssValue, priority);
  };

  return claimChannel(element, `style:${property}`, value, {
    read: () => {
      const current = element.style.getPropertyValue(property);
      if (current === '') return ABSENT;
      return formatStyleDeclaration({
        value: current,
        priority: element.style.getPropertyPriority(property) === 'important' ? 'important' : '',
      });
    },
    write: apply,
    restore: (baseline) => {
      if (baseline === ABSENT) element.style.removeProperty(property);
      else apply(baseline);
    },
    validate: (declaration) => {
      if (parseStyleDeclaration(declaration).value !== '') return null;
      return (
        `claimRootStyleProperty("${property}") refuses the empty declaration ` +
        `${JSON.stringify(declaration)}: CSSOM treats an empty value as ` +
        `removeProperty(), so claiming it would delete a baseline this claim ` +
        `does not own and could not hand back. Claim a real declaration, or do ` +
        `not claim the channel.`
      );
    },
  }).release;
}

/**
 * Per-element coordinator for the lifecycle of the `class` ATTRIBUTE itself.
 *
 * Each class token has its own boolean channel (`present` | `absent`) in the
 * registry, but those channels must not individually decide whether the global
 * `class` attribute exists: that is one shared surface. This coordinator only
 * tracks whether the attribute was already present when the first class claim
 * arrived and how many class claims are still outstanding, so the attribute can
 * be materialized on first claim and removed on last claim without ever
 * removing foreign classes or touching token values.
 *
 * Token recoveries are tracked separately by exact token name/canal. A failed
 * token claim leaves a tombstone in the registry channel; the coordinator keeps
 * the set of names that still need repair so the next claim can restore them
 * before it reuses the coordinator or inspects presence/foreign state.
 */
type PresenceTarget = 'absent' | 'present-empty';
type TokenPresence = 'present' | 'absent';

interface PendingTokenRecovery {
  /** Target value the pending token channel must be repaired to. */
  target: TokenPresence;
  /** Handle of the transient claim created to repair this channel, if any. */
  transientRelease?: ReleaseRootAttribute;
}

interface ClassCoordinator {
  /** Whether the `class` attribute was present before the first claim. */
  baselineHadClassAttribute: boolean;
  /** Claims still outstanding. */
  activeClaims: number;
  /** Pending presence handback when the last release could not verify it. */
  presenceRecovery?: PresenceTarget;
  /** Pending token recoveries by exact class-name canal. */
  pendingTokenRecoveries: Map<string, PendingTokenRecovery>;
}

const classCoordinators = new WeakMap<Element, ClassCoordinator>();

function makeAggregateError(errors: unknown[], message: string): Error {
  const Ctor = (globalThis as Record<string, unknown>).AggregateError as
    | (new (errors: Iterable<unknown>, message?: string) => Error)
    | undefined;
  if (typeof Ctor === 'function') return new Ctor(errors, message);
  const err = new Error(message);
  (err as Error & { cause: unknown }).cause = errors;
  return err;
}

function classAttributeIsAbsent(element: Element): boolean {
  return !element.hasAttribute('class');
}

function classAttributeIsEmpty(element: Element): boolean {
  return element.hasAttribute('class') && element.getAttribute('class') === '';
}

function presenceLabel(element: Element): string {
  if (classAttributeIsAbsent(element)) return 'ABSENT';
  return JSON.stringify(element.getAttribute('class'));
}

function encodeClassToken(present: boolean): TokenPresence {
  return present ? 'present' : 'absent';
}

function classTokenAdapter(element: Element, className: string): ChannelAdapter {
  return {
    read: () => encodeClassToken(element.classList.contains(className)),
    write: (next) => element.classList.toggle(className, next === 'present'),
    restore: (baseline) => element.classList.toggle(className, baseline === 'present'),
  };
}

/**
 * Adapter used only for pending-token repair. It is identical to the normal
 * class token adapter except that restoring an `absent` baseline is a no-op
 * when the `class` attribute does not exist. Some DOM implementations
 * (notably happy-dom) materialize `class=""` when `classList.toggle(token, false)`
 * or `classList.remove(token)` is called on an element with no class attribute;
 * that spurious presence would corrupt the coordinator's recaptured baseline.
 */
function classTokenRepairAdapter(element: Element, className: string): ChannelAdapter {
  return {
    read: () => encodeClassToken(element.classList.contains(className)),
    write: (next) => element.classList.toggle(className, next === 'present'),
    restore: (baseline) => {
      if (baseline === 'absent' && !element.hasAttribute('class')) return;
      element.classList.toggle(className, baseline === 'present');
    },
  };
}

/**
 * Materializes `class=""` when the baseline was absent, rolling back to
 * absent on any failure. A throwing `setAttribute` is kept as the primary error
 * so the caller has a retry path.
 */
function addEmptyClassAttributeWithRollback(element: Element, messagePrefix: string): void {
  if (classAttributeIsEmpty(element)) return;

  let primaryError: Error | null = null;
  try {
    element.setAttribute('class', '');
  } catch (error) {
    primaryError = error as Error;
  }

  if (classAttributeIsEmpty(element)) {
    if (primaryError) {
      let rollbackError: Error | null = null;
      try {
        element.removeAttribute('class');
      } catch (error) {
        rollbackError = error as Error;
      }
      if (classAttributeIsAbsent(element)) {
        if (rollbackError) {
          throw makeAggregateError(
            [primaryError, rollbackError],
            `${messagePrefix} failed and rollback failed`,
          );
        }
        throw primaryError;
      }
      const rollbackFailure =
        rollbackError ??
        new Error(`rollback verify failed: expected absent, got ${presenceLabel(element)}`);
      throw makeAggregateError([primaryError, rollbackFailure], `${messagePrefix} failed and rollback failed`);
    }
    return;
  }

  let rollbackError: Error | null = null;
  try {
    element.removeAttribute('class');
  } catch (error) {
    rollbackError = error as Error;
  }

  if (classAttributeIsAbsent(element)) {
    if (primaryError) throw primaryError;
    throw new Error(`${messagePrefix} silent no-op`);
  }

  const primaryFailure = primaryError ?? new Error(`${messagePrefix} silent no-op`);
  const rollbackFailure =
    rollbackError ??
    new Error(`rollback verify failed: expected absent, got ${presenceLabel(element)}`);
  throw makeAggregateError([primaryFailure, rollbackFailure], `${messagePrefix} failed and rollback failed`);
}

/**
 * Removes `class=""` on the last release when the baseline was absent,
 * rolling back to `class=""` if the removal fails before taking. A throwing
 * `removeAttribute` is kept as the primary error so the wrapper can retry.
 */
function removeClassAttributeWithRetry(element: Element, messagePrefix: string): void {
  if (classAttributeIsAbsent(element)) return;

  let primaryError: Error | null = null;
  try {
    element.removeAttribute('class');
  } catch (error) {
    primaryError = error as Error;
  }

  if (classAttributeIsAbsent(element)) {
    if (primaryError) throw primaryError;
    return;
  }

  let rollbackError: Error | null = null;
  try {
    element.setAttribute('class', '');
  } catch (error) {
    rollbackError = error as Error;
  }

  if (classAttributeIsEmpty(element)) {
    if (primaryError) throw primaryError;
    throw new Error(`${messagePrefix} silent no-op`);
  }

  const primaryFailure = primaryError ?? new Error(`${messagePrefix} silent no-op`);
  const rollbackFailure =
    rollbackError ??
    new Error(`rollback verify failed: expected present-empty, got ${presenceLabel(element)}`);
  throw makeAggregateError([primaryFailure, rollbackFailure], `${messagePrefix} failed and rollback failed`);
}

/**
 * Restores absence after a failed claim materialization. If `removeAttribute`
 * mutates and then throws, the postcondition still wins because the caller's
 * primary error is the failed claim, not the cleanup primitive.
 */
function ensureClassAttributeAbsent(element: Element, messagePrefix: string): void {
  if (classAttributeIsAbsent(element)) return;

  let primaryError: Error | null = null;
  try {
    element.removeAttribute('class');
  } catch (error) {
    primaryError = error as Error;
  }

  if (classAttributeIsAbsent(element)) return;

  throw primaryError ?? new Error(`${messagePrefix} silent no-op`);
}

/**
 * Repairs pending token tombstones by taking a transient claim on the same
 * class channel and releasing it. This lets the registry's own repair/drain
 * logic close the tombstone, restore the correct token state and clear its
 * internal `state.recovery`, instead of mutating the DOM directly and leaving
 * the registry out of sync.
 *
 * The transient release handle is stored on the pending entry before it is
 * invoked, and is reused on retry. If the release fails the handle stays bound
 * to the same registry claim so a later repair does not spawn a second claim
 * that would hand control to a zombie stack entry.
 */
function repairPendingTokenRecoveries(element: Element, coordinator: ClassCoordinator): void {
  if (coordinator.pendingTokenRecoveries.size === 0) return;

  const errors: Error[] = [];
  for (const [className, entry] of [...coordinator.pendingTokenRecoveries]) {
    try {
      if (!entry.transientRelease) {
        const claim = claimChannel(
          element,
          `class:${className}`,
          entry.target,
          classTokenRepairAdapter(element, className),
        );
        entry.transientRelease = claim.release;
      }
      entry.transientRelease();
      coordinator.pendingTokenRecoveries.delete(className);
    } catch (error) {
      errors.push(error as Error);
    }
  }

  if (errors.length > 0) {
    throw makeAggregateError(errors, 'pending class token recovery failed');
  }
}

/**
 * Repairs a pending presence target before a new claim reuses the coordinator.
 *
 * The baseline stored in the coordinator is never recaptured: if foreign
 * classes are present, the repair is abandoned and the attribute is preserved.
 * The tombstone is only cleared after a verified repair.
 */
function repairClassPresence(element: Element, coordinator: ClassCoordinator): void {
  const target = coordinator.presenceRecovery;
  if (!target) return;

  if (target === 'absent') {
    if (classAttributeIsAbsent(element)) {
      coordinator.presenceRecovery = undefined;
      return;
    }
    if (classAttributeIsEmpty(element)) {
      removeClassAttributeWithRetry(element, 'class presence repair');
      coordinator.presenceRecovery = undefined;
      return;
    }
    // Foreign classes are present: preserve them and stop trying to remove.
    coordinator.presenceRecovery = undefined;
    return;
  }

  // target === 'present-empty'
  if (classAttributeIsEmpty(element)) {
    coordinator.presenceRecovery = undefined;
    return;
  }
  if (classAttributeIsAbsent(element)) {
    addEmptyClassAttributeWithRollback(element, 'class presence repair');
    coordinator.presenceRecovery = undefined;
    return;
  }
  // Foreign classes already give us a present attribute.
  coordinator.presenceRecovery = undefined;
}

/**
 * Repair failures leave the existing tombstone untouched and must not create a
 * new pending entry. Every other registry failure during a claim or release
 * creates or updates a recovery tombstone for that token canal.
 */
function isRecoveryRepairFailure(error: unknown): boolean {
  return error instanceof Error && /recovery (restore|verify) failed/.test(error.message);
}

/**
 * Claims presence/absence of a class name.
 *
 * The registry channel for this token only speaks `present`/`absent`; it never
 * uses the global `ABSENT` sentinel. That keeps a foreign class added during the
 * claim from changing the token's read-out, which used to make the release try
 * to restore an `ABSENT` baseline that no longer matched the live attribute and
 * left the claim stranded.
 *
 * The coordinator manages the `class` attribute itself: it materializes an empty
 * attribute on the first claim if none existed, and removes it on the last
 * release only when it was absent at the start and is empty at the end. Foreign
 * classes and an initially empty `class=""` are always preserved.
 *
 * Before any new claim all pending token recoveries are repaired. Only after
 * verified repair does the coordinator inspect presence/foreign state and
 * decide whether to materialize. When an exact rollback left no pending work,
 * the coordinator is dropped so the next claim recaptures the live DOM.
 */
export function claimRootClass(
  element: Element,
  className: string,
  present: boolean,
): ReleaseRootAttribute {
  const targetTokenValue = encodeClassToken(present);

  let coordinator = classCoordinators.get(element);
  if (coordinator !== undefined) {
    // Token tombstones are repaired before any new claim, even if other claims
    // are still active, so foreign-state classification never sees a stale
    // filtered token.
    repairPendingTokenRecoveries(element, coordinator);

    if (coordinator.activeClaims === 0) {
      // A presence tombstone whose target is already satisfied by the live DOM
      // is stale (the rollback succeeded). Drop it so the next claim recaptures
      // the live baseline instead of repairing over a foreign writer.
      const target = coordinator.presenceRecovery;
      if (target) {
        const satisfied =
          (target === 'absent' && classAttributeIsAbsent(element)) ||
          (target === 'present-empty' && classAttributeIsEmpty(element));
        if (satisfied && coordinator.pendingTokenRecoveries.size === 0) {
          coordinator.presenceRecovery = undefined;
        } else {
          repairClassPresence(element, coordinator);
        }
      }

      if (
        coordinator.activeClaims === 0 &&
        coordinator.pendingTokenRecoveries.size === 0 &&
        !coordinator.presenceRecovery
      ) {
        classCoordinators.delete(element);
        coordinator = undefined;
      }
    }
  }

  if (coordinator === undefined) {
    coordinator = {
      baselineHadClassAttribute: element.hasAttribute('class'),
      activeClaims: 0,
      pendingTokenRecoveries: new Map(),
    };
    classCoordinators.set(element, coordinator);
  }

  // If the baseline was absent, materialize an empty attribute for this claim.
  if (!coordinator.baselineHadClassAttribute && classAttributeIsAbsent(element)) {
    addEmptyClassAttributeWithRollback(element, 'class attribute materialization');
  }

  const tokenBefore = encodeClassToken(element.classList.contains(className));

  let release: ReleaseRootAttribute;
  try {
    ({ release } = claimChannel(element, `class:${className}`, targetTokenValue, classTokenAdapter(element, className)));
  } catch (error) {
    if (!isRecoveryRepairFailure(error)) {
      coordinator.pendingTokenRecoveries.set(className, { target: tokenBefore });
    }

    if (!coordinator.baselineHadClassAttribute) {
      if (classAttributeIsEmpty(element)) {
        try {
          ensureClassAttributeAbsent(element, 'class attribute dematerialization');
          coordinator.presenceRecovery = undefined;
        } catch (dematerializationError) {
          coordinator.presenceRecovery = 'absent';
          throw makeAggregateError(
            [error, dematerializationError],
            'class claim failed and dematerialization failed',
          );
        }
      } else if (!classAttributeIsAbsent(element)) {
        // A leaked class token or foreign class is present; the next claim will
        // repair the token channel and this coordinator will hand back absence
        // on the last release.
        coordinator.presenceRecovery = 'absent';
      }
    }
    throw error;
  }

  // A successful claim means this token canal is no longer pending repair.
  coordinator.pendingTokenRecoveries.delete(className);
  coordinator.activeClaims += 1;
  coordinator.presenceRecovery = undefined;

  let channelReleased = false;
  let counted = false;
  let finished = false;

  return (): void => {
    if (finished) return;

    if (!channelReleased) {
      try {
        release();
      } catch (error) {
        if (!isRecoveryRepairFailure(error)) {
          coordinator.pendingTokenRecoveries.set(className, { target: targetTokenValue });
        }
        throw error;
      }
      channelReleased = true;
      // A successful channel release closes any tombstone for this token;
      // do not leave a stale entry that a later claim could resurrect.
      coordinator.pendingTokenRecoveries.delete(className);
    }

    if (!counted) {
      coordinator.activeClaims -= 1;
      counted = true;
    }

    if (coordinator.activeClaims !== 0) {
      finished = true;
      return;
    }

    try {
      // If the baseline was a present attribute (even empty) and the last token
      // removal took the attribute with it, restore the empty baseline
      // transactionally before the wrapper finishes.
      if (coordinator.baselineHadClassAttribute && classAttributeIsAbsent(element)) {
        addEmptyClassAttributeWithRollback(element, 'class baseline rematerialization');
      }

      if (!coordinator.baselineHadClassAttribute && classAttributeIsEmpty(element)) {
        removeClassAttributeWithRetry(element, 'class attribute removal');
      }

      if (
        coordinator.activeClaims === 0 &&
        !coordinator.presenceRecovery &&
        coordinator.pendingTokenRecoveries.size === 0
      ) {
        classCoordinators.delete(element);
      }
      finished = true;
    } catch (error) {
      coordinator.presenceRecovery = coordinator.baselineHadClassAttribute
        ? 'present-empty'
        : 'absent';
      throw error;
    }
  };
}
