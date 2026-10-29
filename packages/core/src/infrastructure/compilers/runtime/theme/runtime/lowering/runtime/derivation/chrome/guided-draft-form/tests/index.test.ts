/**
 * GuidedDraftForm heading weights follow real typography derivation while
 * preserving the skin fallback and higher-ranked family statements.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { typographyDeriver } from "../../../typography";
import { guidedDraftFormChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/guided-draft-form/index.css",
  ),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  {
    label: "bithire under a tenant floor",
    theme: firstPartyFixture("bithire"),
    tenant: FIXTURE_TENANT_FACTS,
  },
  {
    label: "minimal under a tenant floor",
    theme: MINIMAL_THEME,
    tenant: FIXTURE_TENANT_FACTS,
  },
];

describeFamilyContract(guidedDraftFormChromeDeriver, FIXTURES);

const TITLE_WEIGHT = "--ds-guided-draft-form-heading-font-weight";
const ROLE_WEIGHT = "--ds-type-section-title-font-weight";
const FALLBACK = "var(--ds-font-weight-semibold, 600)";
const TITLE_CHAIN = "var(--ds-type-section-title-font-weight, var(--ds-font-weight-semibold, 600))";
const WEIGHT_POSTURES = [
  { roleWeights: "light", expected: "500" },
  { roleWeights: "regular", expected: "600" },
  { roleWeights: "strong", expected: "700" },
] as const;
const FONT_SIZES = ["1rem", "2rem"];
const AUTHORED_WEIGHTS = [300, 700];
const OVERRIDE_RANKS = ["verticalOverride", "tenant"] as const;
const PROFILE_STAMPS = ["500", "600", "800"];

/** Resolve only emitted weight references; this is not a CSS engine. */
function resolveWeight(
  value: string | undefined,
  channels: Record<string, string>,
  seen: ReadonlySet<string> = new Set(),
): string {
  if (value === undefined) throw new Error("Missing weight channel");
  const reference = /^var\((--ds-[a-z0-9-]+)(?:,\s*(.*))?\)$/.exec(value);
  if (reference === null) return value;
  const [, channel, fallback] = reference;
  if (channel === undefined) throw new Error("Missing weight reference");
  if (seen.has(channel)) throw new Error(`Cyclic weight reference: ${channel}`);
  return resolveWeight(Reflect.get(channels, channel) ?? fallback, channels, new Set([...seen, channel]));
}

const normalise = (value: string) => value.replace(/\s+/g, " ").trim();

/** Declarations in a scoped skin rule, without evaluating CSS. */
function skinRule(selector: string): string {
  const matches = [...SKIN.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((match) => match.at(1)?.split(",").some((part) => part.trim() === selector));
  expect(matches).toHaveLength(1);
  const declarations = matches.at(0)?.at(2);
  if (declarations === undefined) throw new Error(`Missing rule: ${selector}`);
  return normalise(declarations);
}

describe("chrome/guided-draft-form heading role weight", () => {
  it.each(WEIGHT_POSTURES)("follows $roleWeights independently of section-title font-size", ({ roleWeights, expected }) => {
    for (const fontSize of FONT_SIZES) {
      const ctx = buildLoweringContext({
        theme: { ...MINIMAL_THEME, typography: { roleWeights, roles: { sectionTitle: { fontSize } } } },
      });
      const { channels } = runDerivation(ctx, [typographyDeriver, guidedDraftFormChromeDeriver]);
      expect(Reflect.get(channels, "--ds-type-section-title-font-size")).toBe(fontSize);
      expect(resolveWeight(Reflect.get(channels, TITLE_WEIGHT), channels)).toBe(expected);
      expect(resolveWeight(Reflect.get(channels, "--ds-type-body-font-weight"), channels)).toBe("400");
      expect(resolveWeight(Reflect.get(channels, "--ds-type-caption-font-weight"), channels)).toBe("400");
      expect(guidedDraftFormChromeDeriver.derive(ctx, {})).toEqual({ "--ds-guided-draft-form-heading-font-weight": TITLE_CHAIN });
    }
  });

  it.each(WEIGHT_POSTURES)("follows authored section-title weight above $roleWeights and label weight", ({ roleWeights }) => {
    for (const fontWeight of AUTHORED_WEIGHTS) {
      const ctx = buildLoweringContext({
        theme: {
          ...MINIMAL_THEME,
          typography: { roleWeights, roles: { sectionTitle: { fontWeight }, label: { fontWeight: 800 } } },
        },
      });
      const { channels } = runDerivation(ctx, [typographyDeriver, guidedDraftFormChromeDeriver]);
      expect(Reflect.get(channels, "--ds-type-label-font-weight")).toBe("800");
      expect(Reflect.get(channels, ROLE_WEIGHT)).toBe(String(fontWeight));
      expect(resolveWeight(Reflect.get(channels, TITLE_WEIGHT), channels)).toBe(String(fontWeight));
    }
  });

  it("uses semibold only when the section-title role channel is absent", () => {
    const ctx = buildLoweringContext({ theme: MINIMAL_THEME });
    const { channels } = runDerivation(ctx, [guidedDraftFormChromeDeriver]);
    const heading = Reflect.get(channels, TITLE_WEIGHT);
    expect(Reflect.has(channels, ROLE_WEIGHT)).toBe(false);
    expect(resolveWeight(heading, channels)).toBe("600");
    expect(resolveWeight(heading, { ...channels, "--ds-font-weight-semibold": "650" })).toBe("650");
    expect(resolveWeight(heading, {
      ...channels,
      "--ds-type-section-title-font-weight": "300",
      "--ds-font-weight-semibold": "900",
    })).toBe("300");
  });

  it.each(FIXTURES)("preserves the single output and metadata for $label", ({ theme, tenant }) => {
    const ctx = buildLoweringContext({ theme, tenant });
    const family = guidedDraftFormChromeDeriver.derive(ctx, {});
    expect(family).toEqual({ "--ds-guided-draft-form-heading-font-weight": TITLE_CHAIN });
    expect(guidedDraftFormChromeDeriver.family).toBe("guided-draft-form");
    expect(guidedDraftFormChromeDeriver.rank).toBe("derived");
    expect(guidedDraftFormChromeDeriver.scopes).toBeUndefined();
    expect(guidedDraftFormChromeDeriver.produces).toEqual([TITLE_WEIGHT]);
    expect(guidedDraftFormChromeDeriver.consumes).toEqual([
      "palette.*", "typography.roles", "typography.roleWeights", "typography.scale", "spacing.rhythm", "density",
    ]);
  });

  it("keeps the skin fallback and element-scoped heading/nav reads", () => {
    const title = skinRule(".ds-surface.ds-guided-draft-form .ds-guided-draft-form__title-copy .ds-guided-draft-form__title");
    const section = skinRule(".ds-surface.ds-guided-draft-form .ds-guided-draft-form__section-card-title");
    const nav = skinRule(".ds-surface.ds-guided-draft-form .ds-guided-draft-form__section-nav-label");
    const root = skinRule(".ds-surface.ds-guided-draft-form[data-part='root']");
    const elementRead = `var(${TITLE_WEIGHT}, ${FALLBACK})`;
    expect(title).toContain(`${ROLE_WEIGHT}: ${elementRead};`);
    expect(section).toContain(`${ROLE_WEIGHT}: ${elementRead};`);
    expect(nav).toContain(`font-weight: ${elementRead};`);
    expect(root).not.toContain(ROLE_WEIGHT);
    expect(root).not.toContain(TITLE_WEIGHT);
  });

  it.each(WEIGHT_POSTURES)("resolves the root before inheriting it into title elements for $roleWeights", ({ roleWeights, expected }) => {
    const ctx = buildLoweringContext({ theme: { ...MINIMAL_THEME, typography: { roleWeights } } });
    const { channels } = runDerivation(ctx, [typographyDeriver, guidedDraftFormChromeDeriver]);
    const inheritedFamily = resolveWeight(Reflect.get(channels, TITLE_WEIGHT), channels);
    const child = { ...channels, "--ds-guided-draft-form-heading-font-weight": inheritedFamily, "--ds-type-section-title-font-weight": `var(${TITLE_WEIGHT}, ${FALLBACK})` };
    expect(resolveWeight(Reflect.get(child, ROLE_WEIGHT), child)).toBe(expected);
    expect(resolveWeight(`var(${TITLE_WEIGHT}, ${FALLBACK})`, child)).toBe(expected);
  });

  it.each(PROFILE_STAMPS)("preserves an explicitly authored personality root stamp %s above theme role weights", (stamp) => {
    for (const { roleWeights } of WEIGHT_POSTURES) {
      const ctx = buildLoweringContext({ theme: { ...MINIMAL_THEME, typography: { roleWeights } } });
      const { channels } = runDerivation(ctx, [typographyDeriver, guidedDraftFormChromeDeriver]);
      const root = { ...channels, "--ds-guided-draft-form-heading-font-weight": stamp };
      const inheritedFamily = resolveWeight(Reflect.get(root, TITLE_WEIGHT), root);
      const child = { ...root, "--ds-guided-draft-form-heading-font-weight": inheritedFamily, "--ds-type-section-title-font-weight": `var(${TITLE_WEIGHT}, ${FALLBACK})` };
      expect(resolveWeight(Reflect.get(child, ROLE_WEIGHT), child)).toBe(stamp);
    }
  });

  it.each(OVERRIDE_RANKS)("yields the family channel to %s in either derivation order", (rank) => {
    const ctx = buildLoweringContext({ theme: MINIMAL_THEME });
    const stated: FamilyDeriver = {
      family: `stated-${rank}`,
      rank,
      consumes: ["chrome.*"],
      produces: guidedDraftFormChromeDeriver.produces,
      derive: () => ({ "--ds-guided-draft-form-heading-font-weight": "321" }),
    };
    const orders = [[guidedDraftFormChromeDeriver, stated], [stated, guidedDraftFormChromeDeriver]];
    for (const derivers of orders) {
      const { channels, provenance } = runDerivation(ctx, derivers);
      expect(Reflect.get(channels, TITLE_WEIGHT)).toBe("321");
      expect(provenance.get(TITLE_WEIGHT)).toEqual({ family: stated.family, rank });
    }
  });
});
