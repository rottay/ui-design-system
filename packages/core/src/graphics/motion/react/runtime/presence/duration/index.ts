/**
 * @fileoverview Governed exit windows - Rottay Design System
 *
 * How long a node may stay mounted while its exit visual plays is read from
 * that node's COMPUTED style, never from a JS constant: only the value the
 * active tokens actually resolved to is authoritative, and a fixed constant
 * desyncs the moment a tenant retunes the governing `--ds-motion-*` /
 * `--ds-*-exit-duration` variable.
 *
 * Reduced motion carries no branch here. The motion tokens are zeroed
 * upstream, so the computed duration collapses to 0 and these helpers return
 * their buffer alone, landing the removal immediately.
 *
 * Everything here is a FALLBACK window. The primary completion path stays
 * with each family's own `animationend`/`transitionend` handler, which is the
 * only place that can tell an exit's keyframes apart from an enter's still
 * playing.
 */

/** Buffer absorbing the gap between the declared window and the frame the last tick actually lands on. */
const GOVERNED_BUFFER_MS = 50;

/**
 * Longest time a comma-separated computed CSS time list declares, in ms.
 * An entry carrying no unit declares no time and contributes 0.
 */
const maxDeclaredMs = (raw: string): number =>
  raw.split(',').reduce((max, part) => {
    const t = part.trim();
    const v = t.endsWith('ms') ? parseFloat(t) : t.endsWith('s') ? parseFloat(t) * 1000 : 0;
    return Number.isFinite(v) && v > max ? v : max;
  }, 0);

/**
 * Exit window for a node whose exit visual may arrive on either channel:
 * the longer of the declared animation and transition durations, plus the
 * buffer. Delays are not part of this window - the families on this contract
 * declare none, and counting an enter delay would over-hold the node.
 *
 * Returns the buffer alone when nothing is declared (reduced motion, tests).
 */
export function governedExitMs(el: HTMLElement): number {
  const { animationDuration, transitionDuration } = getComputedStyle(el);
  return (
    Math.max(maxDeclaredMs(animationDuration), maxDeclaredMs(transitionDuration)) +
    GOVERNED_BUFFER_MS
  );
}

/**
 * Window of a transient state cue that clears itself (a bounds flash, a
 * confirmation pulse). A self-clearing cue is an exit in disguise and is
 * governed by the same computed reading; the separate name keeps the call
 * site honest about which role it is timing.
 */
export const governedFlashMs = governedExitMs;

/** The computed channel an exit visual is declared on. A family declares its exit as keyframes or as a transition, not both. */
export type GovernedMotionChannel = 'animation' | 'transition';

export interface ExitFallbackOptions {
  /** Channel the family's exit visual is declared on. */
  channel: GovernedMotionChannel;
  /** Buffer added to the longest declared slot. */
  graceMs: number;
  /** Window applied when there is no element to measure (detached node, no DOM). */
  detachedFallbackMs: number;
}

/** Time a single computed CSS time entry declares, in ms; 0 when it carries no unit. */
const parseCssTime = (value: string | undefined): number => {
  const normalized = value?.trim() ?? '';
  if (normalized.endsWith('ms')) return Number.parseFloat(normalized) || 0;
  if (normalized.endsWith('s')) return (Number.parseFloat(normalized) || 0) * 1000;
  return 0;
};

/**
 * Exit window for a node whose exit is declared on ONE channel with a delay:
 * the longest `duration + delay` pair across the declared slots, plus the
 * grace. Slot lists of unequal length wrap, matching how CSS itself cycles
 * the shorter list.
 *
 * Returns 0 - not the grace - when the channel declares nothing, so a node
 * with no exit visual is released on the same tick.
 */
export function resolveExitFallbackMs(
  el: HTMLElement | null,
  options: ExitFallbackOptions
): number {
  const { channel, graceMs, detachedFallbackMs } = options;
  if (!el || typeof window === 'undefined') return detachedFallbackMs;

  const style = window.getComputedStyle(el);
  const durations = (
    channel === 'animation' ? style.animationDuration : style.transitionDuration
  )
    .split(',')
    .map(parseCssTime);
  const delays = (channel === 'animation' ? style.animationDelay : style.transitionDelay)
    .split(',')
    .map(parseCssTime);

  const slotCount = Math.max(durations.length, delays.length);
  let longest = 0;
  for (let index = 0; index < slotCount; index += 1) {
    longest = Math.max(
      longest,
      durations[index % durations.length] + delays[index % delays.length]
    );
  }

  return longest > 0 ? longest + graceMs : 0;
}
