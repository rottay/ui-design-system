/** WO-DER-09 step 2: each first-party preset is a style reference plus its own brand/default data, and the
 *  door recomposes exactly the document it replaced. The pins are the HEAD documents' canonical sha256. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { resolveThemeStyle, THEME_STYLE_CLASS_BY_DECISION } from "@/contracts/theme/runtime/styles";
import { admitDocument } from "@/infrastructure/compilers/runtime/theme/runtime/ingress/runtime/document-v2/presentation/admission";
import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from "@/infrastructure/compilers/runtime/tenant-css/artifact-renderer";
import { VERTICAL_THEME_PRESETS } from "..";

type Decisions = Record<string, unknown>;
type SplitDocument = { version: 3; plan: string; decisions: Decisions; style: { id: string; version: number } };

const canonical = (value: unknown): string =>
  Array.isArray(value)
    ? `[${value.map(canonical).join(",")}]`
    : value && typeof value === "object"
      ? `{${Object.keys(value)
          .sort()
          .map((key) => `${JSON.stringify(key)}:${canonical((value as Decisions)[key])}`)
          .join(",")}}`
      : JSON.stringify(value);
const sha = (value: unknown) => createHash("sha256").update(canonical(value)).digest("hex");

/** The canonical sha256 of each preset's decisions BEFORE the split (HEAD 1053cab42). */
const PRE_SPLIT = {
  bithire: "2a03fdbe9cb1f9179cd2dba0ec518d9396f8414faec6cee19499d7510a0e348a",
  rottay: "2fad076b7bb9ff6937aef6c6f1e4939da268725667cca477e64edbcddefb3ff6",
  evnto: "2fad076b7bb9ff6937aef6c6f1e4939da268725667cca477e64edbcddefb3ff6",
} as const;

/** The rows a vertical deliberately states against its own profile; as style rows they would lose to it. */
const DEPARTURES: Record<keyof typeof PRE_SPLIT, readonly string[]> = {
  bithire: ["shape.radius-scale", "density.mode", "surfaces.elevation-posture"],
  rottay: [],
  evnto: [],
};

const TONE = { bithire: "inverse", rottay: "subtle", evnto: "subtle" } as const;

const VERTICALS = Object.keys(PRE_SPLIT) as (keyof typeof PRE_SPLIT)[];

const split = (vertical: keyof typeof PRE_SPLIT) => VERTICAL_THEME_PRESETS[vertical].document as SplitDocument;
const recomposed = (vertical: keyof typeof PRE_SPLIT): Decisions => ({
  ...(resolveThemeStyle(split(vertical).style).document.decisions as Decisions),
  ...split(vertical).decisions,
});
const admit = (vertical: keyof typeof PRE_SPLIT, document: unknown) =>
  admitDocument({ vertical, document } as never).patch as Decisions & { modes?: Record<string, unknown> };

describe("DER-09 step 2: the first-party presets split into a style reference and brand/default data", () => {
  for (const vertical of VERTICALS) {
    it(`${vertical}: the style reference plus the vertical's own rows recompose the pre-split decisions exactly`, () => {
      expect(split(vertical).version).toBe(3);
      expect(sha(recomposed(vertical))).toBe(PRE_SPLIT[vertical]);
    });

    it(`${vertical}: the door admits the split to the byte-identical patch`, () => {
      const before = admit(vertical, { version: 2, plan: "internal", decisions: recomposed(vertical) });
      expect(sha(admit(vertical, split(vertical)))).toBe(sha(before));
    });

    it(`${vertical}: the compiled artifact, base block and every mode block, is the committed pre-split artifact byte for byte`, () => {
      const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === vertical)!;
      const { compiled, css } = renderFirstPartyArtifact({ spec });
      expect(compiled.modeBlocks.length).toBeGreaterThan(0);
      for (const block of compiled.modeBlocks) expect(css).toContain(`[data-theme='${block.mode}']`);
      const committed = readFileSync(resolve(process.cwd(), `src/foundation/tokens/css/facade/artifacts/${vertical}/index.css`), "utf8");
      expect(sha(css)).toBe(sha(committed));
    });

    it(`${vertical}: its tone travels on its own style reference, and it states no style row but its departures`, () => {
      const own = Object.keys(split(vertical).decisions).filter(
        (row) => THEME_STYLE_CLASS_BY_DECISION[row as keyof typeof THEME_STYLE_CLASS_BY_DECISION] === "style"
      );
      expect(own.sort()).toEqual([...DEPARTURES[vertical]].sort());
      expect(split(vertical).decisions["navigation.sidebar-tone"]).toBeUndefined();
      expect((resolveThemeStyle(split(vertical).style).document.decisions as Decisions)["navigation.sidebar-tone"]).toBe(TONE[vertical]);
    });
  }

  it("bithire's departures are load-bearing: without them its own profile would silently win", () => {
    const withoutDepartures = {
      ...split("bithire"),
      decisions: Object.fromEntries(
        Object.entries(split("bithire").decisions).filter(([row]) => !DEPARTURES.bithire.includes(row))
      ),
    };
    expect(sha(admit("bithire", withoutDepartures))).not.toBe(sha(admit("bithire", split("bithire"))));
  });

  it("rottay and evnto reference ONE style: the reuse is real, not a copy", () => {
    expect(split("rottay").style).toEqual(split("evnto").style);
  });
});
