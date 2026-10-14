/**
 * Runtime projection of responsive prop values into governed CSS channels.
 *
 * WHAT CHANGED AND WHY. This assembler used to return a stylesheet, and every
 * primitive rendered it through a `<style dangerouslySetInnerHTML>` sink: one
 * injected stylesheet per rendered element, with its own `@media` preludes, no
 * `nonce`, and no place in the layer order. A strict CSP therefore dropped the
 * responsive size of every input, button and select on the page.
 *
 * It now returns CHANNELS. The instance publishes one `--_ds-rsp-*` custom
 * property per declared breakpoint and names those steps in
 * `data-ds-responsive`; the static sheet
 * (`foundation/tokens/css/foundation/responsive/channels`) owns every prelude
 * and assigns the property at the step that armed it. Same cascade, same
 * mobile-first semantics, no per-instance stylesheet.
 *
 * The value authority is unchanged: `isSafeCssValue` is the same door the theme
 * pipeline's emission layer consults, and an inadmissible declaration is
 * omitted whole rather than repaired.
 */

import type { CSSProperties } from 'react';

import {
  RESPONSIVE_BREAKPOINT_ORDER,
  type ResponsiveBreakpointKey,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import {
  RESPONSIVE_CHANNEL_ATTRIBUTE,
  RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE,
  isPriorityResponsiveChannel,
  isResponsiveChannel,
  responsiveChannelToken,
  responsiveChannelVariable,
  type ResponsiveChannel,
} from '@/foundation/contracts/kernel/responsive/channels';
import {
  isResponsiveValue,
  normalizeResponsiveValue,
  scalarOrDefault,
  scalarOrUndefined,
  type ResponsiveValue,
  type ResponsiveValueKey,
} from '@/foundation/contracts/kernel/responsive/values';
import { isSafeCssValue } from '@/infrastructure/compilers/kernel/foundation/css/value-safety';

export { isResponsiveValue, scalarOrDefault, scalarOrUndefined };
export type { ResponsiveValue };

/**
 * The declaration priority flag, which CSS places after the value rather than
 * inside it. It is separated before the value authority judges what remains,
 * so `32px !important` is admitted exactly when `32px` is, and the priority
 * itself is carried by the channel attribute instead of the value.
 */
const PRIORITY_FLAG = /\s*!\s*important$/i;

/**
 * True when a projected value is admissible.
 *
 * The grammar is NOT restated here. A string that cannot terminate a theme
 * declaration cannot terminate one of these either. A resolver may also answer
 * with something that is not a string at all: the collectors' token lookups
 * fail closed, but a prototype-inherited member name resolves to a function,
 * and a function body has no business in CSS text.
 */
function admitsValue(value: unknown): value is string {
  return typeof value === 'string' && isSafeCssValue(value);
}

/** A CSS channel and its breakpoint-aware source value. */
export interface ResponsivePropEntry<T = string> {
  cssProperty: string;
  value: Partial<Record<ResponsiveValueKey, T>>;
  resolve?: (value: T) => string;
}

/** What an instance stamps to drive the governed responsive channels. */
export interface ResponsiveChannelProjection {
  /** Channel attributes naming the steps this instance armed. */
  attrs: Record<string, string>;
  /**
   * One custom property per armed step, carrying that step's value.
   *
   * Named `channels` and not `style` on purpose: nothing in it is a CSS
   * longhand. It is a bag of `--_ds-rsp-*` values the static sheet reads, and
   * the inline-paint census reads a member literally called `style` as an
   * opaque style source -- which this is the opposite of.
   */
  channels: CSSProperties;
}

const EMPTY_PROJECTION: ResponsiveChannelProjection = Object.freeze({
  attrs: Object.freeze({}) as Record<string, string>,
  channels: Object.freeze({}) as CSSProperties,
});

/**
 * Projects responsive prop entries onto the governed channels.
 *
 * An entry is refused whole when its property is outside the channel
 * vocabulary, and its priority is refused when the channel is outside the
 * priority vocabulary: a rule the static sheet does not declare would paint
 * nothing, and silently arming it would be worse than not arming it.
 *
 * Priority is per ENTRY, never per step: a channel that is important at one
 * width and ordinary at another would invert its own mobile-first cascade.
 */
export function generateResponsiveCSS<T = string>(
  entries: readonly ResponsivePropEntry<T>[],
): ResponsiveChannelProjection {
  if (entries.length === 0) return EMPTY_PROJECTION;

  const attrs: Record<string, string> = {};
  const channels: Record<string, string> = {};
  const tokens: string[] = [];
  const priorityTokens: string[] = [];

  for (const entry of entries) {
    if (!isResponsiveChannel(entry.cssProperty)) continue;
    const channel: ResponsiveChannel = entry.cssProperty;

    const normalized = normalizeResponsiveValue(entry.value);
    const resolve = entry.resolve ?? ((value: T) => String(value));

    const declared: Array<[ResponsiveBreakpointKey, string]> = [];
    let priority = false;

    for (const breakpoint of RESPONSIVE_BREAKPOINT_ORDER) {
      const rawValue = normalized[breakpoint];
      if (rawValue === undefined) continue;

      const resolved = resolve(rawValue);
      if (typeof resolved !== 'string') continue;

      const hard = PRIORITY_FLAG.test(resolved);
      const value = hard ? resolved.replace(PRIORITY_FLAG, '') : resolved;
      if (!admitsValue(value)) continue;

      priority = priority || hard;
      declared.push([breakpoint, value]);
    }

    if (declared.length === 0) continue;
    if (priority && !isPriorityResponsiveChannel(channel)) continue;

    for (const [breakpoint, value] of declared) {
      channels[responsiveChannelVariable(channel, breakpoint)] = value;
      (priority ? priorityTokens : tokens).push(
        responsiveChannelToken(channel, breakpoint),
      );
    }
  }

  if (tokens.length > 0) attrs[RESPONSIVE_CHANNEL_ATTRIBUTE] = tokens.join(' ');
  if (priorityTokens.length > 0) {
    attrs[RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE] = priorityTokens.join(' ');
  }

  if (tokens.length === 0 && priorityTokens.length === 0) return EMPTY_PROJECTION;
  return { attrs, channels: channels as CSSProperties };
}
