/**
 * @fileoverview Semantic typography defaults and their channel writer.
 *
 * @module Compilers/Theme/Lowering/Foundation/typography
 * @category Compilers
 * @package @rottay/design-system
 */

import { SEMANTIC_TYPOGRAPHY_ROLES } from "@/foundation/contracts/kernel/tokens/typography";
import type {
  SemanticTypographyRoleTokens,
  SemanticTypographyTokens,
} from "@/foundation/contracts/kernel/tokens/typography";
import type { ExpressiveTypeRoleOverlay } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { omitUndefined } from "../shape";

/**
 * `fontSize` is optional here because the `body` role has no builder default:
 * body size is 14px canonical and its single authority is the theme layer
 * (foundation/tokens/css/foundation/themes/default/index.css). A BrandTheme that
 * wants a different body size still authors it via `typography.roles.body`,
 * which outranks this table.
 */
const DEFAULT_SEMANTIC_TYPOGRAPHY: Record<
  (typeof SEMANTIC_TYPOGRAPHY_ROLES)[number],
  Required<Omit<SemanticTypographyRoleTokens, "fontSize">> &
    Pick<SemanticTypographyRoleTokens, "fontSize">
> = {
  display: {
    fontFamily: "var(--ds-font-family-display, var(--ds-font-family-heading))",
    fontSize: "calc(2rem * var(--ds-type-scale, 1))",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "var(--ds-letter-spacing-display, -0.03em)",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  pageTitle: {
    fontFamily: "var(--ds-font-family-heading)",
    fontSize: "calc(1.5rem * var(--ds-type-scale, 1))",
    fontWeight: 700,
    lineHeight: 1.16,
    letterSpacing: "var(--ds-letter-spacing-heading, -0.02em)",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  sectionTitle: {
    fontFamily: "var(--ds-font-family-heading)",
    fontSize: "calc(1.125rem * var(--ds-type-scale, 1))",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "var(--ds-letter-spacing-heading, -0.01em)",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  body: {
    fontFamily: "var(--ds-font-family-base)",
    fontWeight: 400,
    lineHeight: "var(--ds-line-height-body, 1.6)",
    letterSpacing: "var(--ds-letter-spacing-body, 0)",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  supporting: {
    fontFamily: "var(--ds-font-family-base)",
    fontSize: "calc(0.8125rem * var(--ds-type-scale, 1))",
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "var(--ds-letter-spacing-body, 0)",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  label: {
    fontFamily: "var(--ds-font-family-base)",
    fontSize: "calc(0.75rem * var(--ds-type-scale, 1))",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "0.04em",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  caption: {
    fontFamily: "var(--ds-font-family-base)",
    fontSize: "calc(0.6875rem * var(--ds-type-scale, 1))",
    fontWeight: 400,
    lineHeight: 1.35,
    letterSpacing: "0.01em",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  code: {
    fontFamily: "var(--ds-font-family-mono)",
    fontSize: "calc(0.8125rem * var(--ds-type-scale, 1))",
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "var(--ds-letter-spacing-mono, 0)",
    textTransform: "none",
    fontVariantNumeric: "tabular-nums",
  },
  numeric: {
    fontFamily: "var(--ds-font-family-heading)",
    fontSize: "calc(1rem * var(--ds-type-scale, 1))",
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    textTransform: "none",
    fontVariantNumeric: "tabular-nums lining-nums",
  },
};

export function setSemanticTypographyVariables(
  vars: Record<string, string>,
  authored: SemanticTypographyTokens | undefined,
  profileOverlay?: ExpressiveTypeRoleOverlay
): void {
  for (const role of SEMANTIC_TYPOGRAPHY_ROLES) {
    // Single-writer precedence for every `--ds-type-{role}-*` channel:
    // engine defaults < expressive profile overlay < authored roles.
    const overlay = profileOverlay?.[role as keyof ExpressiveTypeRoleOverlay];
    const value = {
      ...DEFAULT_SEMANTIC_TYPOGRAPHY[role],
      ...(overlay?.letterSpacing !== undefined
        ? { letterSpacing: overlay.letterSpacing }
        : {}),
      ...(overlay?.textTransform !== undefined
        ? { textTransform: overlay.textTransform }
        : {}),
      ...(overlay?.fontVariantNumeric !== undefined
        ? { fontVariantNumeric: overlay.fontVariantNumeric }
        : {}),
      ...omitUndefined(authored?.[role]),
    };
    const kebabRole = role.replace(
      /[A-Z]/g,
      (letter) => `-${letter.toLowerCase()}`
    );
    const prefix = `--ds-type-${kebabRole}`;
    vars[`${prefix}-font-family`] = String(value.fontFamily);
    // Emitted only when a default or an authored role supplies one, so a role
    // the theme layer owns is left to the cascade instead of being reasserted
    // per tenant.
    if (value.fontSize !== undefined) {
      vars[`${prefix}-font-size`] = String(value.fontSize);
    }
    vars[`${prefix}-font-weight`] = String(value.fontWeight);
    vars[`${prefix}-line-height`] = String(value.lineHeight);
    vars[`${prefix}-letter-spacing`] = String(value.letterSpacing);
    vars[`${prefix}-text-transform`] = String(value.textTransform);
    vars[`${prefix}-font-variant-numeric`] = String(value.fontVariantNumeric);
    vars[
      prefix
    ] = `var(${prefix}-font-weight) var(${prefix}-font-size)/var(${prefix}-line-height) var(${prefix}-font-family)`;
  }
}
