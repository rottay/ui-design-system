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

import { ABSENT, claimChannel, type ReleaseRootAttribute } from '../registry';

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
 * document. A removal is not a thing a claim can OWN, so it is rejected at the
 * boundary, before any mutation. A caller that wants a property gone must not
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
 * Claims presence/absence of a class name.
 *
 * `classList.remove` on cleanup has the same defect as `removeAttribute`: the
 * server may have emitted `class="dark"` itself, and a provider that did not add
 * it must not take it away. Presence is encoded as a value so it shares the one
 * stack implementation.
 */
export function claimRootClass(
  element: Element,
  className: string,
  present: boolean,
): ReleaseRootAttribute {
  const encode = (flag: boolean) => (flag ? 'present' : 'absent');
  return claimChannel(element, `class:${className}`, encode(present), {
    read: () => encode(element.classList.contains(className)),
    write: (next) => element.classList.toggle(className, next === 'present'),
    restore: (baseline) => {
      // A class channel always has a concrete baseline: it is either there or
      // it is not, so ABSENT is unreachable and treated as "not present".
      element.classList.toggle(className, baseline === 'present');
    },
  }).release;
}
