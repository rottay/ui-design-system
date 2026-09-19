/**
 * The governed vocabulary of responsive CSS channels.
 *
 * A responsive prop declares a value PER BREAKPOINT. The value belongs to the
 * instance, the breakpoint belongs to the cascade, and a per-instance
 * `<style>` element was the old way to hold both — one injected stylesheet per
 * rendered component, unreachable under a strict CSP and invisible to the
 * layer order. The channel form splits them: the instance publishes its values
 * as custom properties and names the steps it declared, while ONE static sheet
 * (`foundation/tokens/css/foundation/responsive/channels`) owns every `@media`
 * prelude and assigns the property at the step it belongs to.
 *
 * A channel is therefore a triple — a governed CSS property, a breakpoint, and
 * the custom property carrying the value — and this module is the only place
 * the three names are spelled.
 */

import {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  type ResponsiveBreakpointKey,
} from '../breakpoints';

/**
 * Standard CSS properties a responsive prop may drive.
 *
 * Closed on purpose: the projection refuses a property outside this list, so a
 * component cannot reach the cascade through a name the static sheet never
 * declares and then silently paint nothing.
 */
export const RESPONSIVE_STANDARD_CHANNELS = [
  'align-items',
  'display',
  'flex-direction',
  'flex-wrap',
  'font-size',
  'gap',
  'height',
  'justify-content',
  'letter-spacing',
  'line-height',
  'margin',
  'margin-block',
  'margin-block-end',
  'margin-block-start',
  'margin-bottom',
  'margin-inline',
  'margin-inline-end',
  'margin-inline-start',
  'margin-left',
  'margin-right',
  'margin-top',
  'max-height',
  'max-width',
  'min-height',
  'min-width',
  'overflow',
  'overflow-x',
  'overflow-y',
  'padding',
  'padding-block',
  'padding-block-end',
  'padding-block-start',
  'padding-bottom',
  'padding-inline',
  'padding-inline-end',
  'padding-inline-start',
  'padding-left',
  'padding-right',
  'padding-top',
  'width',
] as const;

/**
 * Per-instance custom properties a responsive prop may drive.
 *
 * Every name here is an instance-resolved channel a single component owns and
 * its own skin reads; none is a tenant channel, so the static sheet can assign
 * them without contesting compiled tenant paint.
 */
export const RESPONSIVE_CUSTOM_CHANNELS = [
  '--_ds-button-resolved-radius',
  '--_ds-input-responsive-height',
  '--_ds-stack-divider-gap-block',
  '--_ds-stack-divider-gap-inline',
  '--_ds-stack-gap-current',
  '--ds-alert-responsive-padding',
  '--ds-badge-resolved-font-size',
  '--ds-badge-resolved-height',
  '--ds-badge-resolved-padding-inline',
  '--ds-button-resolved-height',
  '--ds-button-resolved-icon-size',
  '--ds-button-resolved-padding-y',
  '--ds-card-instance-padding',
  '--ds-input-responsive-gap',
  '--ds-input-responsive-radius',
  '--ds-select-trigger-responsive-font-size',
  '--ds-select-trigger-responsive-height',
  '--ds-select-trigger-responsive-line-height',
  '--ds-select-trigger-responsive-padding-x',
  '--ds-tabs-responsive-font-size',
  '--ds-tabs-responsive-height',
  '--ds-tabs-responsive-icon-size',
  '--ds-tabs-responsive-padding',
  '--ds-textarea-responsive-radius',
  // The shell geometry the app-shell `geometry.*` props stamp (WO-FAM-11 B):
  // responsive values reach these channels through the same prop path.
  '--ds-shell-collapse-transition',
  '--ds-shell-header-block-size',
  '--ds-shell-sidebar-collapsed-width',
  '--ds-shell-sidebar-header-block-size',
  '--ds-shell-sidebar-width',
] as const;

/**
 * The channels an instance may declare with `!important`.
 *
 * Closed and small on purpose. Every member is a measured case of a frozen
 * classic engine or the shared text-area having to outrank antd's own
 * unlayered stylesheet; a component that needs priority on a seventh property
 * adds it here, in front of a reviewer, rather than doubling the static sheet
 * for every property in case one day it might.
 */
export const RESPONSIVE_PRIORITY_CHANNELS = [
  'font-size',
  'height',
  'line-height',
  'min-width',
  'padding',
  'padding-inline-end',
] as const;

export type ResponsiveStandardChannel = (typeof RESPONSIVE_STANDARD_CHANNELS)[number];
export type ResponsiveCustomChannel = (typeof RESPONSIVE_CUSTOM_CHANNELS)[number];
export type ResponsiveChannel = ResponsiveStandardChannel | ResponsiveCustomChannel;

/** Every governed channel, standard properties first. */
export const RESPONSIVE_CHANNELS: readonly ResponsiveChannel[] = [
  ...RESPONSIVE_STANDARD_CHANNELS,
  ...RESPONSIVE_CUSTOM_CHANNELS,
];

const CHANNEL_SET: ReadonlySet<string> = new Set(RESPONSIVE_CHANNELS);
const STANDARD_SET: ReadonlySet<string> = new Set(RESPONSIVE_STANDARD_CHANNELS);
const PRIORITY_SET: ReadonlySet<string> = new Set(RESPONSIVE_PRIORITY_CHANNELS);

/** The attribute carrying the steps an instance declared. */
export const RESPONSIVE_CHANNEL_ATTRIBUTE = 'data-ds-responsive';

/**
 * The attribute carrying the steps an instance declared with priority.
 *
 * Kept separate rather than folded into the value grammar: `!important` is a
 * cascade decision, and a component that needs to outrank an unlayered
 * third-party stylesheet must say so once, for the whole declaration, instead
 * of smuggling the flag through a value the safety authority then has to strip.
 */
export const RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE = 'data-ds-responsive-hard';

/** True when `property` is a channel the static sheet declares. */
export function isResponsiveChannel(property: string): property is ResponsiveChannel {
  return CHANNEL_SET.has(property);
}

/** True when `channel` is a standard property, not an instance custom property. */
export function isStandardResponsiveChannel(channel: string): boolean {
  return STANDARD_SET.has(channel);
}

/** True when `channel` may carry a priority declaration. */
export function isPriorityResponsiveChannel(channel: string): boolean {
  return PRIORITY_SET.has(channel);
}

/** The channel's identifier inside attribute tokens and custom property names. */
export function responsiveChannelSlug(channel: ResponsiveChannel): string {
  return channel.startsWith('--') ? channel.slice(2) : channel;
}

/** The custom property an instance publishes one breakpoint's value on. */
export function responsiveChannelVariable(
  channel: ResponsiveChannel,
  breakpoint: ResponsiveBreakpointKey,
): string {
  return `--_ds-rsp-${responsiveChannelSlug(channel)}-${breakpoint}`;
}

/** The attribute token that arms one channel at one breakpoint. */
export function responsiveChannelToken(
  channel: ResponsiveChannel,
  breakpoint: ResponsiveBreakpointKey,
): string {
  return `${responsiveChannelSlug(channel)}@${breakpoint}`;
}

export { RESPONSIVE_BREAKPOINT_ORDER };
export type { ResponsiveBreakpointKey };
