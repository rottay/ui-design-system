/**
 * The `page-shell` vocabulary at rest: every wired channel equals the one
 * fallback its skin reads it with, so producing the name cannot move a pixel,
 * and any higher-ranked statement still wins.
 *
 * The shared names the family reads and deliberately does NOT produce, and the
 * shared eyebrow size it stopped reading, are drilled here too, because "we
 * left it unproduced" is only evidence when the reason is executable.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { collectionHeaderChromeDeriver } from "../../collection-header";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { FAMILY_DERIVERS } from "../../..";
import { pageShellChromeDeriver } from "..";
import { deriveTypeRoleChannels } from "../../../typography/roles";
import { deriveTypeWeightChannels, roleWeightOverlay } from "../../../typography/weights";

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
];

describeFamilyContract(pageShellChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css"
  ),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

const normalise = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

/** Every distinct fallback the skin states for `channel`. */
function skinFallbacks(channel: string): string[] {
  const found = new Set<string>();
  for (const match of SKIN.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*,/g)) {
    if (match[1] !== channel) continue;
    const start = (match.index ?? 0) + match[0].length;
    let end = start;
    // Bounded on the file length: an unbalanced value is a broken skin, and a
    // broken skin has to fail this suite rather than spin it forever.
    for (let depth = 1; depth > 0 && end < SKIN.length; end += 1) {
      if (SKIN[end] === "(") depth += 1;
      else if (SKIN[end] === ")") depth -= 1;
    }
    expect(end, `unbalanced var() for ${channel}`).toBeLessThan(SKIN.length);
    found.add(normalise(SKIN.slice(start, end - 1)));
  }
  return [...found];
}

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/page-shell", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = pageShellChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...pageShellChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("names only the family's own namespace", () => {
    // Sub-lot C closed the second spelling: the six panel channels the family
    // used to state as `--ds-page-header-*` had one reader, its own skin, so
    // they moved. The prefix is still READ here, and it still belongs to the
    // cross-owner group `collection-header` and three sibling skins share.
    for (const channel of pageShellChromeDeriver.produces) {
      expect(channel.startsWith("--ds-page-shell-")).toBe(true);
    }
  });

  it("leaves the page-header names collection-header reads through at a second rest", () => {
    const derived = pageShellChromeDeriver.derive(context(), {});
    const sibling = collectionHeaderChromeDeriver.derive(context(), {});

    // One name, two correct rests. The page panel wants the first value; the
    // hero card reads the same name through to the second. A produced rest
    // would silently repaint whichever family it is not.
    const twoRests: [string, string, string][] = [
      ["--ds-page-header-eyebrow-tracking", "0.11em", "0.13em"],
      ["--ds-page-header-title-max-width", "32ch", "35rem"],
    ];
    for (const [channel, here, there] of twoRests) {
      expect(derived[channel]).toBeUndefined();
      expect(skinFallbacks(channel)).toEqual([here]);
      expect(
        Object.values(sibling).some((value) => value === `var(${channel}, ${there})`)
      ).toBe(true);
    }

    // The shared eyebrow size keeps the hero card's rest and is no longer read
    // here: the panel's eyebrow reads its own produced size instead.
    expect(Object.keys(derived)).not.toContain("--ds-page-header-eyebrow-size");
    expect(skinFallbacks("--ds-page-header-eyebrow-size")).toEqual([]);
    expect(Object.values(sibling)).toContain(
      "var(--ds-page-header-eyebrow-size, var(--ds-font-size-xs, 12px))"
    );

    // The supporting measure is no longer a shared read here: nothing ever
    // produced it, so the skin declares its own rest on the subtitle part,
    // and no derived channel may claim a subtitle measure in its place.
    const subtitleRules = [
      ...SKIN.matchAll(/\.ds-pattern-page-shell\.ds-engine-modern \[data-part='subtitle'\] \{([^}]*)\}/g),
    ].map((m) => m[1]!.replace(/\/\*[\s\S]*?\*\//g, ""));
    const measures = subtitleRules.flatMap((body) => body.match(/max-width:[^;]*;/g) ?? []);
    expect(measures).toEqual(["max-width: 72ch;"]);
    expect(Object.keys(derived).filter((channel) => /subtitle/.test(channel))).toEqual([]);
  });

  it("leaves the panel ground to the expressive motif that already authors it", () => {
    // `--ds-page-header-bg` is written by the `contour` motif at `profile`
    // rank. `derived` outranks `profile`, so producing it would retire the
    // motif's page-header treatment without saying so.
    const derived = pageShellChromeDeriver.derive(context(), {});
    expect(derived["--ds-page-header-bg"]).toBeUndefined();

    const motif: FamilyDeriver = {
      family: "stated-profile",
      rank: "profile",
      consumes: ["expressive.*"],
      produces: ["--ds-page-header-bg"],
      derive: () => ({ "--ds-page-header-bg": "motif" }),
    };
    const result = runDerivation(context(), [pageShellChromeDeriver, motif]);
    expect(result.channels["--ds-page-header-bg"]).toBe("motif");
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(pageShellChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: pageShellChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [pageShellChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});

const LABEL_WEIGHT = "var(--ds-type-label-font-weight, var(--ds-font-weight-semibold, 600))";
const LABEL_PARTS = [
  { part: "eyebrow", selector: ".ds-pattern-page-shell.ds-engine-modern [data-part='eyebrow']" },
  { part: "terminal crumb", selector: ".ds-pattern-page-shell.ds-engine-modern [data-part='crumb'][data-interactive='false'][data-last='true']" },
] as const;

/** Source guard only: this reads declarations, not browser computed styles. */
function declaredWeights(selector: string): string[] {
  return Array.from(SKIN.matchAll(/([^{}]+)\{([^{}]*)\}/g)).flatMap((match) => {
    const [, selectors, body] = match;
    if (!selectors?.split(",").some((value) => value.trim() === selector)) return [];
    return Array.from((body ?? "").matchAll(/(?:^|;)\s*font-weight:\s*([^;]+);/g))
      .map((declaration) => normalise(declaration.at(1) ?? ""));
  });
}

/** Real typography producers; no PageShell-specific weight channel is needed. */
function weightChannels(typography: FlatTheme["typography"]): Map<string, string> {
  const theme: FlatTheme = { ...MINIMAL_THEME, typography };
  return new Map(Object.entries({
    ...deriveTypeWeightChannels(theme),
    ...deriveTypeRoleChannels(theme, undefined, {
      numeric: {},
      weights: roleWeightOverlay(theme),
    }),
  }));
}

describe("chrome/page-shell label-weight source contract", () => {
  it.each(LABEL_PARTS)("binds $part to label weight with the exact semibold fallback", ({ selector }) => {
    expect(declaredWeights(selector)).toEqual([LABEL_WEIGHT]);
  });

  const postures = [
    { roleWeights: "light", expected: "500" },
    { roleWeights: "regular", expected: "600" },
    { roleWeights: "strong", expected: "700" },
  ] as const;
  it.each(postures)("produces $roleWeights label weight while preserving reading floors", ({ roleWeights, expected }) => {
    const channels = weightChannels({ roleWeights });
    expect(channels.get("--ds-type-label-font-weight")).toBe(expected);
    expect(channels.get("--ds-font-weight-medium")).toBe("500");
    expect(channels.get("--ds-font-weight-semibold")).toBe("600");
    expect(channels.get("--ds-type-body-font-weight")).toBe("400");
    expect(channels.get("--ds-type-supporting-font-weight")).toBe("400");
    expect(channels.get("--ds-type-caption-font-weight")).toBe("400");
    expect(channels.get("--ds-type-code-font-weight")).toBe("400");
  });

  const authoredWeights = [300, 800] as const;
  it.each(authoredWeights)("preserves authored label weight %i above strong posture and other roles", (fontWeight) => {
    const channels = weightChannels({
      roleWeights: "strong",
      roles: { label: { fontWeight }, pageTitle: { fontWeight: 900 }, sectionTitle: { fontWeight: 400 } },
    });
    expect(channels.get("--ds-type-label-font-weight")).toBe(String(fontWeight));
    expect(channels.get("--ds-type-page-title-font-weight")).toBe("900");
    expect(channels.get("--ds-type-section-title-font-weight")).toBe("400");
    expect(channels.get("--ds-font-weight-semibold")).toBe("600");
  });

  it("keeps ordinary crumbs at medium and supporting/caption reads unchanged", () => {
    expect(declaredWeights(".ds-pattern-page-shell.ds-engine-modern .ds-pattern-page-shell__crumb"))
      .toEqual(["var(--ds-font-weight-medium, 500)"]);
    expect(declaredWeights(".ds-pattern-page-shell.ds-engine-modern [data-part='subtitle']"))
      .toEqual(["var(--ds-type-supporting-font-weight, var(--ds-font-weight-normal, 400))"]);
    expect(declaredWeights(".ds-pattern-page-shell.ds-engine-modern [data-part='caption']"))
      .toEqual(["var(--ds-type-caption-font-weight, var(--ds-font-weight-normal, 400))"]);
  });

  it("retains the resting label weight without adding a family producer", () => {
    expect(weightChannels({}).get("--ds-type-label-font-weight")).toBe("600");
    expect(pageShellChromeDeriver.produces).not.toContain("--ds-type-label-font-weight");
    expect(pageShellChromeDeriver.produces.some((channel) => /weight/.test(channel))).toBe(false);
  });
});

const EYEBROW = ".ds-pattern-page-shell.ds-engine-modern [data-part='eyebrow']";
const EYEBROW_SIZE = "var(--ds-page-shell-eyebrow-size, var(--ds-type-label-font-size))";
const OVERLINE_SIZE = "var(--ds-page-header-eyebrow-size, var(--ds-font-size-xs, 12px))";
const WITHOUT_PAGE_SHELL = FAMILY_DERIVERS.filter((deriver) => deriver !== pageShellChromeDeriver);

/** Source guard only: every declaration of `selector`, in source order. */
function declarations(selector: string): string[] {
  return Array.from(SKIN.matchAll(/([^{}]+)\{([^{}]*)\}/g)).flatMap((match) => {
    const [, selectors, body] = match;
    if (!selectors?.split(",").some((value) => value.trim() === selector)) return [];
    return (body ?? "").split(";").map(normalise).filter((declaration) => declaration !== "");
  });
}

/** Static `var()` substitution over lowered channels; not the browser cascade. */
function resolveVars(value: string, channels: ReadonlyMap<string, string>, depth = 0): string {
  const start = value.indexOf("var(");
  if (start < 0) return normalise(value);
  expect(depth, `var() chain too deep in ${value}`).toBeLessThan(32);
  let end = start + 4;
  for (let level = 1; level > 0 && end < value.length; end += 1) {
    if (value.charAt(end) === "(") level += 1;
    else if (value.charAt(end) === ")") level -= 1;
  }
  const body = value.slice(start + 4, end - 1);
  const comma = body.indexOf(",");
  const name = (comma < 0 ? body : body.slice(0, comma)).trim();
  const replacement = channels.get(name) ?? (comma < 0 ? "" : body.slice(comma + 1));
  return resolveVars(value.slice(0, start) + replacement + value.slice(end), channels, depth + 1);
}

/** The real pipeline's channels for a theme. */
function lowered(theme: FlatTheme, derivers: readonly FamilyDeriver[] = FAMILY_DERIVERS) {
  return new Map(Object.entries(runDerivation(buildLoweringContext({ theme }), derivers).channels));
}

const eyebrowSize = () =>
  declarations(EYEBROW).find((declaration) => declaration.startsWith("font-size:"))?.slice("font-size:".length) ?? "";

const EYEBROW_CONDITIONS = [
  { label: "at rest", typography: {}, size: "calc(0.75rem * 1)" },
  { label: "under a 1.1 type scale", typography: { scale: 1.1 }, size: "calc(0.75rem * 1.1)" },
  { label: "under an authored label size", typography: { roles: { label: { fontSize: "0.8125rem" } } }, size: "0.8125rem" },
] as const;

describe("chrome/page-shell eyebrow size on the label role", () => {
  it("binds the eyebrow size to its own channel and keeps every other declaration exact", () => {
    expect(declarations(EYEBROW)).toEqual([
      "margin-bottom: 4px",
      "color: var(--ds-color-text-muted)",
      "font-family: var(--_ds-page-hierarchy-eyebrow-family, var(--ds-font-family-mono, ui-monospace, monospace))",
      `font-size: ${EYEBROW_SIZE}`,
      `font-weight: ${LABEL_WEIGHT}`,
      "letter-spacing: var(--ds-page-header-eyebrow-tracking, 0.11em)",
      "line-height: 1.25",
      "text-transform: var(--ds-page-header-eyebrow-text-transform, uppercase)",
      "order: 1",
    ]);
  });

  it.each(EYEBROW_CONDITIONS)("resolves the eyebrow $label from the label role chain", ({ typography, size }) => {
    const channels = lowered({ ...MINIMAL_THEME, typography });
    expect(resolveVars(eyebrowSize(), channels)).toBe(size);
    expect(channels.has("--ds-page-header-eyebrow-size")).toBe(false);
  });

  it.each(FIXTURES.slice(0, 4))("rests the $label eyebrow at that theme's own label size", ({ theme }) => {
    const channels = lowered(theme);
    expect(channels.has("--ds-type-label-font-size")).toBe(true);
    expect(resolveVars(eyebrowSize(), channels)).toBe(resolveVars("var(--ds-type-label-font-size)", channels));
  });

  it.each(EYEBROW_CONDITIONS)("reaches no channel outside the family $label", ({ typography }) => {
    const theme: FlatTheme = { ...MINIMAL_THEME, typography };
    const withShell = lowered(theme);
    const withoutShell = lowered(theme, WITHOUT_PAGE_SHELL);
    const moved = Array.from(withShell.entries())
      .filter(([channel, value]) => withoutShell.get(channel) !== value)
      .map(([channel]) => channel);
    expect(moved.sort()).toEqual([...pageShellChromeDeriver.produces].sort());
    expect(moved.every((channel) => channel.startsWith("--ds-page-shell-"))).toBe(true);
    expect(Array.from(withoutShell.keys()).every((channel) => withShell.has(channel))).toBe(true);
  });

  it("keeps collection-header's overline output and reads on its own rest", () => {
    const resolved = EYEBROW_CONDITIONS.map(({ typography }) => {
      const channels = lowered({ ...MINIMAL_THEME, typography });
      expect(channels.get("--ds-collection-header-overline-size")).toBe(OVERLINE_SIZE);
      return resolveVars(OVERLINE_SIZE, channels);
    });
    expect(resolved).toEqual(["12px", "12px", "12px"]);

    const sibling = readFileSync(
      resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/collection-header/index.css"),
      "utf8"
    );
    expect(sibling.split(`var(--ds-collection-header-overline-size, ${OVERLINE_SIZE})`).length - 1).toBe(4);
    expect(sibling).not.toContain("--ds-page-shell-eyebrow");
  });

  it("produces every eyebrow channel the skin reads, at the fallback it reads it with", () => {
    const reads = new Set(
      Array.from(SKIN.matchAll(/var\(\s*(--ds-page-shell-eyebrow[a-z0-9-]*)/g)).map((match) => match.at(1))
    );
    const derived = new Map(Object.entries(pageShellChromeDeriver.derive(context(), {})));
    expect([...reads]).toEqual(["--ds-page-shell-eyebrow-size"]);
    expect(pageShellChromeDeriver.produces).toContain("--ds-page-shell-eyebrow-size");
    expect(skinFallbacks("--ds-page-shell-eyebrow-size")).toEqual([derived.get("--ds-page-shell-eyebrow-size")]);
  });
});
