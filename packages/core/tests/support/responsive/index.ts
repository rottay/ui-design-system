/**
 * @fileoverview What a rendered responsive prop declares.
 *
 * A responsive prop no longer renders a `<style>` element per instance. The
 * instance publishes one `--_ds-rsp-*` custom property per declared breakpoint
 * and names those steps in `data-ds-responsive` / `data-ds-responsive-hard`;
 * ONE static sheet (`foundation/tokens/css/foundation/responsive/channels`)
 * owns every `@media` prelude and assigns the property at the step that armed
 * it.
 *
 * A suite that wants to know what an element declares therefore has to put the
 * two halves back together, which is what this does. The text it returns is the
 * stylesheet the static sheet WILL apply to that element -- the same
 * declarations, the same mobile-first order, the same preludes -- so a suite
 * measures the projection rather than the transport.
 */

import {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  type ResponsiveBreakpointKey,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import {
  RESPONSIVE_CHANNEL_ATTRIBUTE,
  RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE,
} from '@/foundation/contracts/kernel/responsive/channels';

/** The element carrying responsive channels, or `null` when none does. */
export function responsiveChannelElement(container: ParentNode): HTMLElement | null {
  return container.querySelector(
    `[${RESPONSIVE_CHANNEL_ATTRIBUTE}], [${RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE}]`,
  ) as HTMLElement | null;
}

interface Declaration {
  readonly step: ResponsiveBreakpointKey;
  readonly property: string;
  readonly value: string;
}

function declarationsOf(element: HTMLElement): Declaration[] {
  const out: Declaration[] = [];
  for (const [attribute, priority] of [
    [RESPONSIVE_CHANNEL_ATTRIBUTE, false],
    [RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE, true],
  ] as const) {
    for (const token of (element.getAttribute(attribute) ?? '').split(' ').filter(Boolean)) {
      const [slug, step] = token.split('@') as [string, ResponsiveBreakpointKey];
      const property = /^_?ds-/.test(slug) ? `--${slug}` : slug;
      const value = element.style.getPropertyValue(`--_ds-rsp-${slug}-${step}`);
      out.push({ step, property, value: priority ? `${value} !important` : value });
    }
  }
  return out;
}

/**
 * The stylesheet the static sheet will apply to the container's responsive
 * element. Empty when the container declares no responsive channel at all.
 */
export function responsiveCss(container: ParentNode, selector = '[data-ds-responsive]'): string {
  const element = responsiveChannelElement(container);
  if (element === null) return '';

  const declarations = declarationsOf(element);
  let css = '';

  for (const step of RESPONSIVE_BREAKPOINT_ORDER) {
    const at = declarations.filter((declaration) => declaration.step === step);
    if (at.length === 0) continue;
    const indent = step === 'xs' ? '  ' : '    ';
    const body = at
      .map((declaration) => `${indent}${declaration.property}: ${declaration.value};`)
      .join('\n');
    css +=
      step === 'xs'
        ? `${selector} {\n${body}\n}\n`
        : `@media (min-width: ${RESPONSIVE_BREAKPOINTS[step]}px) {\n  ${selector} {\n${body}\n  }\n}\n`;
  }

  return css;
}

/** Every `channel@step` token the container's responsive element armed. */
export function responsiveTokens(container: ParentNode): string[] {
  const element = responsiveChannelElement(container);
  if (element === null) return [];
  return [RESPONSIVE_CHANNEL_ATTRIBUTE, RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE]
    .flatMap((attribute) => (element.getAttribute(attribute) ?? '').split(' '))
    .filter(Boolean);
}
