/**
 * @fileoverview The two responsive stylesheets, projected from their governed
 * vocabularies.
 *
 * WHY THIS LIVES UNDER `tests/`. `channels/index.css` and `visibility/index.css`
 * are authored, shipped stylesheets; these builders are how the suites next door
 * prove each file IS its vocabulary's projection and nothing else. They are text
 * generators no runtime calls, so shipping them inside the contract would put
 * kilobytes of test apparatus into every consumer's `primitives/responsive`
 * graph for no runtime benefit.
 *
 * The VOCABULARY is still single-sourced: every name below is read from
 * `foundation/contracts/kernel/responsive/{breakpoints,channels,visibility}`.
 * Only the text assembly lives here.
 */

import {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  RESPONSIVE_DEVICE_ALIASES,
  type ResponsiveBreakpointKey,
  type ResponsiveDeviceAlias,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import {
  RESPONSIVE_CHANNELS,
  RESPONSIVE_CHANNEL_ATTRIBUTE,
  RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE,
  RESPONSIVE_PRIORITY_CHANNELS,
  responsiveChannelToken,
  responsiveChannelVariable,
  type ResponsiveChannel,
} from '@/foundation/contracts/kernel/responsive/channels';
import {
  RESPONSIVE_HIDE_ATTRIBUTE,
  RESPONSIVE_SHOW_ATTRIBUTE,
  responsiveVisibilityQuery,
  type ResponsiveVisibilityBound,
  type ResponsiveVisibilityConstraints,
} from '@/foundation/contracts/kernel/responsive/visibility';

const CHANNEL_SHEET_HEADER = `/**
 * Responsive Channels - Rottay Design System
 *
 * GENERATED SHAPE, AUTHORED FILE. Every rule below is
 * \`buildResponsiveChannelSheet()\` in
 * \`foundation/tokens/css/foundation/responsive/tests/projection\`, and
 * \`../channel-contract.test.ts\` compares the two byte for byte.
 *
 * WHY IT EXISTS. A responsive prop used to render its own
 * \`<style dangerouslySetInnerHTML>\` per instance: one stylesheet per rendered
 * Box, Card, Button or Text, carrying its own \`@media\` preludes, blocked by a
 * strict CSP, and outside every layer the cascade orders. Here the instance
 * publishes only VALUES -- one \`--_ds-rsp-*\` custom property per declared
 * breakpoint -- and names the steps it declared in \`data-ds-responsive\`. This
 * sheet owns the preludes, so the whole mechanism is six media blocks in the
 * last design-system layer instead of one element per component.
 *
 * WHY A TOKEN PER STEP. A step an instance did not declare must leave the skin
 * alone. An attribute token armed only for declared steps does exactly that;
 * a chained \`var()\` fallback would instead force a value at every width.
 *
 * WHY A SECOND ATTRIBUTE. \`data-ds-responsive-hard\` is the same assignment
 * with \`!important\`, for instances that must outrank an unlayered
 * third-party stylesheet (the frozen classic engines and antd).
 */`;

/** THE channel sheet, derived from the channel vocabulary. */
export function buildResponsiveChannelSheet(): string {
  const rule = (
    channel: ResponsiveChannel,
    step: ResponsiveBreakpointKey,
    hard: boolean,
    indent: string,
  ): string => {
    const attribute = hard
      ? RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE
      : RESPONSIVE_CHANNEL_ATTRIBUTE;
    const priority = hard ? ' !important' : '';
    return (
      `${indent}[${attribute}~="${responsiveChannelToken(channel, step)}"] {\n` +
      `${indent}  ${channel}: var(${responsiveChannelVariable(channel, step)})${priority};\n` +
      `${indent}}`
    );
  };

  const block = (step: ResponsiveBreakpointKey, indent: string): string => {
    const rules: string[] = [];
    for (const channel of RESPONSIVE_CHANNELS) rules.push(rule(channel, step, false, indent));
    for (const channel of RESPONSIVE_PRIORITY_CHANNELS) rules.push(rule(channel, step, true, indent));
    return rules.join('\n\n');
  };

  const sections: string[] = [CHANNEL_SHEET_HEADER, block('xs', '')];

  for (const step of RESPONSIVE_BREAKPOINT_ORDER) {
    if (step === 'xs') continue;
    sections.push(`@media (min-width: ${RESPONSIVE_BREAKPOINTS[step]}px) {\n${block(step, '  ')}\n}`);
  }

  return `${sections.join('\n\n')}\n`;
}

const VISIBILITY_SHEET_HEADER = `/**
 * Responsive Visibility - Rottay Design System
 *
 * GENERATED SHAPE, AUTHORED FILE. Every rule below is
 * \`buildResponsiveVisibilitySheet()\` in
 * \`foundation/tokens/css/foundation/responsive/tests/projection\`, and
 * \`../visibility-contract.test.ts\` compares the two byte for byte.
 *
 * WHY IT EXISTS. \`Show\`, \`Hide\` and \`ResponsiveSlot\` used to render a
 * \`<style dangerouslySetInnerHTML>\` per instance, each with a \`useId\`-scoped
 * class. The boundary set is CLOSED -- six lower bounds, six upper bounds and
 * three device bands -- so it is one static sheet and one attribute per
 * instance, which a strict CSP cannot drop and the layer order can rank.
 *
 * BOTH MODES ARE BOX-TRANSPARENT WHILE VISIBLE (\`display: contents\`): a
 * boundary never inserts an anonymous block of its own into the parent's
 * layout. The hide rule keeps its pinned \`!important\`: hiding must beat any
 * display the children carry.
 */`;

/** Every token the static visibility sheet must declare, in sheet order. */
export function responsiveVisibilityTokens(): readonly string[] {
  const tokens: string[] = [];
  for (const step of RESPONSIVE_BREAKPOINT_ORDER) tokens.push(`from:${step}`);
  for (const step of RESPONSIVE_BREAKPOINT_ORDER) tokens.push(`below:${step}`);
  for (const alias of RESPONSIVE_DEVICE_ALIASES) tokens.push(`on:${alias}`);
  return tokens;
}

function constraintsForToken(token: string): ResponsiveVisibilityConstraints {
  const [kind, value] = token.split(':') as [string, ResponsiveVisibilityBound];
  if (kind === 'on') return { on: value as ResponsiveDeviceAlias };
  if (kind === 'from') return { from: value };
  return { below: value };
}

/** THE visibility sheet, derived from the boundary vocabulary. */
export function buildResponsiveVisibilitySheet(): string {
  const lines: string[] = [VISIBILITY_SHEET_HEADER, ''];

  lines.push(`[${RESPONSIVE_SHOW_ATTRIBUTE}] {`, '  display: none;', '}', '');
  lines.push(`[${RESPONSIVE_HIDE_ATTRIBUTE}] {`, '  display: contents;', '}', '');

  for (const token of responsiveVisibilityTokens()) {
    const query = responsiveVisibilityQuery(constraintsForToken(token));
    const show = `[${RESPONSIVE_SHOW_ATTRIBUTE}="${token}"]`;
    const hide = `[${RESPONSIVE_HIDE_ATTRIBUTE}="${token}"]`;

    // `below:xs` is an upper bound of 0px: it matches no width, so the two
    // default rules above already are its whole behaviour.
    if (query === null || query === 'not all') continue;

    lines.push(
      `@media ${query} {`,
      `  ${show} {`,
      '    display: contents;',
      '  }',
      '',
      `  ${hide} {`,
      '    display: none !important;',
      '  }',
      '}',
      '',
    );
  }

  return `${lines.join('\n').replace(/\n+$/, '')}\n`;
}
