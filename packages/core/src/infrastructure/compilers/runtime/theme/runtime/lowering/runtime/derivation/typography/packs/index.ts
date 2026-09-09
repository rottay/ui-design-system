/**
 * @fileoverview Typography sub-owner: which registered font pack a role is
 * actually wearing.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography/packs
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { FONT_PACK_MANIFEST } from "@/foundation/tokens/css/foundation/typography/font-packs/manifest";
import type { FontPackRole } from "@/foundation/tokens/css/foundation/typography/font-packs/manifest";

/** The first family name in a CSS font stack, unquoted and case-folded. */
function leadFamily(stack: string | undefined): string | undefined {
  if (!stack) return undefined;
  const first = stack.split(",")[0]?.trim();
  if (!first) return undefined;
  return first.replace(/^['"]|['"]$/g, "").toLowerCase();
}

const PACK_BY_LEAD_FAMILY: ReadonlyMap<
  string,
  { readonly id: string; readonly role: FontPackRole }
> = new Map(
  Object.values(FONT_PACK_MANIFEST).flatMap((pack) => {
    const lead = leadFamily(pack.fallbackStack);
    return lead ? [[lead, { id: pack.id, role: pack.role }] as const] : [];
  })
);

/**
 * The pack a role resolved to, published as a channel.
 *
 * A theme names a family; whether that family is a self-hosted pack the bundle
 * actually ships or a system font it merely hopes for is invisible from the
 * emitted stack alone. Stating the resolved pack per role makes the loading
 * decision observable at the same scope as the family it belongs to, and it is
 * derived from the pack registry rather than restated per theme.
 */
export function deriveTypePackChannels(
  bt: BrandTheme
): Record<string, string> {
  const ty = bt.typography;
  if (!ty) return {};
  const vars: Record<string, string> = {};
  const bind = (role: "display" | "heading" | "base" | "mono", stack: string | undefined) => {
    const pack = PACK_BY_LEAD_FAMILY.get(leadFamily(stack) ?? "");
    if (pack) vars[`--ds-font-pack-role-${role}`] = pack.id;
  };
  bind("display", ty.fontFamilyDisplay);
  bind("heading", ty.fontFamilyHeading);
  bind("base", ty.fontFamilyBase);
  bind("mono", ty.fontFamilyMono);
  return vars;
}
