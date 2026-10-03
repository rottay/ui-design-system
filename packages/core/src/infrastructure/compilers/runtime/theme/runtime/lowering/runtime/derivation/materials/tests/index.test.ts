/**
 * The card material's selected shadow rests at `none`: selection is carried by
 * the border, fill and outline, and the focus signature is keyboard focus only.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { deriveMaterialChannels } from "..";

const MINIMAL: FlatTheme = { id: "minimal", name: "Minimal" };
const DEFAULT_THEME = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/foundation/themes/default/index.css"),
  "utf8"
);

const CARD_TOKENS = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/card/index.css"),
  "utf8"
);

describe("materials/card selected shadow", () => {
  it("rests at none and never reads a focus ring", () => {
    const derived = deriveMaterialChannels(MINIMAL);
    expect(derived["--ds-material-card-shadow-selected"]).toBe("none");
    expect(derived["--ds-material-card-shadow-selected"]).not.toMatch(/focus-ring/);
  });

  it("keeps the card focus ring on the tenant signature", () => {
    expect(deriveMaterialChannels(MINIMAL)["--ds-material-card-focus-ring"]).toBe(
      "var(--ds-focus-ring, var(--ds-shadow-focus-ring))"
    );
  });

  it("hands an authored card focus ring to the Card's own focus channel", () => {
    const derived = deriveMaterialChannels({
      ...MINIMAL,
      surfaces: { materials: { card: { focusRing: "0 0 0 3px #B4232F" } } },
    } as FlatTheme);
    expect(derived["--ds-material-card-focus-ring"]).toBe("0 0 0 3px #B4232F");
    expect(derived["--ds-material-card-shadow-selected"]).toBe("none");
    expect(CARD_TOKENS).toMatch(
      /--ds-card-focus-ring:\s*var\(--ds-material-card-focus-ring, var\(--ds-focus-ring\)\);/
    );
  });

  it("states the same resting value in the static default theme", () => {
    expect(DEFAULT_THEME).toMatch(/--ds-material-card-shadow-selected:\s*none;/);
    expect(DEFAULT_THEME).not.toMatch(/--ds-material-card-shadow-selected:\s*var\(--ds-material-card-focus-ring\)/);
  });

  it("yields to an authored selected shadow", () => {
    const derived = deriveMaterialChannels({
      ...MINIMAL,
      surfaces: { materials: { card: { shadowSelected: "0 4px 16px #0002" } } },
    } as FlatTheme);
    expect(derived["--ds-material-card-shadow-selected"]).toBe("0 4px 16px #0002");
  });
});
