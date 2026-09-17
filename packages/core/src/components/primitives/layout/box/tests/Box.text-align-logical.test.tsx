/**
 * The public alignment vocabulary is logical (WO-INV-01 L7).
 *
 * `textAlign` used to be an unconstrained `CSSProperties['textAlign']`, so a
 * Box could be asked for a PHYSICAL edge that the reading direction cannot
 * honour: under RTL `left` pins the text while every logical property in the
 * same box mirrors. The prop now takes `start | center | end | justify`, and
 * the two physical spellings survive as deprecated aliases normalized ONCE at
 * the Modern engine's style boundary -- the same grammar
 * `normalizeOverlayPlacement` uses, so the package deprecates physical
 * vocabulary one way rather than one way per family.
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernBox from "../engines/modern";
import { BOX_TEXT_ALIGN_ALIASES, normalizeBoxTextAlign } from "../contracts";

describe("Box logical text alignment", () => {
  it("declares exactly the two deprecated spellings, and nothing else", () => {
    // The table IS the deprecation surface: a logical name mapping to itself
    // would make the migration look bigger than it is, and a third entry would
    // be a physical vocabulary nobody adjudicated.
    expect(Object.keys(BOX_TEXT_ALIGN_ALIASES).sort()).toEqual(["left", "right"]);
    expect(BOX_TEXT_ALIGN_ALIASES).toEqual({ left: "start", right: "end" });
  });

  it("normalizes the aliases and leaves the logical vocabulary untouched", () => {
    expect(normalizeBoxTextAlign("left")).toBe("start");
    expect(normalizeBoxTextAlign("right")).toBe("end");
    for (const logical of ["start", "center", "end", "justify"] as const) {
      expect(normalizeBoxTextAlign(logical)).toBe(logical);
      // Idempotent, so applying it at a second boundary can never re-map.
      expect(normalizeBoxTextAlign(normalizeBoxTextAlign(logical))).toBe(logical);
    }
  });

  it("emits the logical value for a deprecated alias", () => {
    const { getByRole } = render(
      <ModernBox role="region" aria-label="Aliased" textAlign="left" />
    );

    expect(getByRole("region").style.textAlign).toBe("start");
  });

  it("emits the mirrored logical value for the trailing alias", () => {
    const { getByRole } = render(
      <ModernBox role="region" aria-label="Aliased end" textAlign="right" />
    );

    expect(getByRole("region").style.textAlign).toBe("end");
  });

  it("passes the logical vocabulary through unchanged", () => {
    for (const logical of ["start", "center", "end", "justify"] as const) {
      const { getByRole, unmount } = render(
        <ModernBox role="region" aria-label={`Logical ${logical}`} textAlign={logical} />
      );

      expect(getByRole("region").style.textAlign).toBe(logical);
      unmount();
    }
  });

  it("emits no alignment at all when the prop is absent", () => {
    const { getByRole } = render(<ModernBox role="region" aria-label="Unset" />);

    expect(getByRole("region").style.textAlign).toBe("");
  });
});
