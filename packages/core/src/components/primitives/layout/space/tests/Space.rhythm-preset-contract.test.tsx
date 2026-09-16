/**
 * @fileoverview The Space focal rhythm contract -- Space's counterpart to
 * Flex/grid/Stack.rhythm-preset-contract.test.tsx.
 *
 * SPACE'S SHAPE DIFFERS FROM ITS SISTERS IN ONE STRUCTURAL WAY: there is no
 * `Space/runtime/responsive/` folder, and `SpaceProps.size` is typed
 * `SpaceSize | LegacySpaceSize | number | [number, number]` -- NOT wrapped in
 * `ResponsiveValue<>` the way every other layout primitive's spacing prop is.
 * Space has no responsive path to test; leg 4 proves that structurally rather
 * than silently skipping the "scalar vs responsive" requirement.
 *
 * WHAT THIS FILE PROVES AND WHAT IT NO LONGER PROVES. After the WO-FAM-07 cut a
 * preset rung carries NO value in the DOM at all: the engine stamps the rung and
 * the Modern skin resolves it from `--ds-space-gap-{sm,md,lg}`. The cascade half
 * of this contract -- that a rung scales with rhythm and a measurement does not,
 * and that Classic/Rustic are untouched -- is therefore measured in a real
 * browser by `Space.causality.integration.test.tsx`, where a computed style is
 * an actual computed style. What stays here is what jsdom can honestly answer:
 * what the engine stamps, what it refuses to inline, and what the read-only
 * engines emit.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernSpace from "../engines/modern";
import { Space as ClassicSpace } from "../engines/classic";
import { Space as RusticSpace } from "../engines/rustic";
import { SPACE_SIZE_MAP, type SpaceProps } from "../contracts";
import { TENANT_THEME_RHYTHM_FACTORS } from "../../../../../foundation/contracts/composition/tenants/themes/tenant-theme";

const HERE = dirname(fileURLToPath(import.meta.url));
const RHYTHM = "--ds-rhythm-effective-scale";

/**
 * The full preset vocabulary the skin's rung rules key on: the legacy spelling
 * `SPACE_SIZE_MAP` declares, plus the canonical `sm|md|lg` spelling the modern
 * engine accepts and stamps verbatim on `data-size`.
 */
const PRESET_SPELLINGS = ["small", "middle", "large", "sm", "md", "lg"] as const;

describe("leg 1 -- a preset rung is a stamp, never a value", () => {
  it("stamps the raw size spelling on data-size for every enumerated preset", () => {
    for (const size of PRESET_SPELLINGS) {
      const { getByRole, unmount } = render(
        <ModernSpace role="group" aria-label="rung" size={size}>
          <span>a</span>
        </ModernSpace>
      );
      expect(getByRole("group"), size).toHaveAttribute("data-size", size);
      unmount();
    }
  });

  it("carries no gap value inline for a rung, in either spelling", () => {
    for (const size of PRESET_SPELLINGS) {
      const { getByRole, unmount } = render(
        <ModernSpace role="group" aria-label="rung" size={size}>
          <span>a</span>
        </ModernSpace>
      );
      expect(getByRole("group").getAttribute("style"), size).toBeNull();
      unmount();
    }
  });
});

describe("leg 2 -- a numeric or [h, v] size is exact geometry and NEVER scales", () => {
  it("stamps a data-size no rung rule can match, for a raw number", () => {
    const { getByRole } = render(
      <ModernSpace role="group" aria-label="numeric" size={16}>
        <span>a</span>
      </ModernSpace>
    );
    const space = getByRole("group");
    expect(space).toHaveAttribute("data-size", "16");
    for (const preset of PRESET_SPELLINGS) {
      expect(space.getAttribute("data-size"), preset).not.toBe(preset);
    }
    expect(space.getAttribute("style")).toContain("--ds-space-gap: 16px");
  });

  it("stamps a joined, still-unmatchable data-size for an [h, v] tuple", () => {
    const { getByRole } = render(
      <ModernSpace role="group" aria-label="tuple" size={[8, 24]}>
        <span>a</span>
      </ModernSpace>
    );
    const space = getByRole("group");
    expect(space).toHaveAttribute("data-size", "8:24");
    // CSS shorthand order is row-gap column-gap: [h, v] -> "24px 8px".
    expect(space.getAttribute("style")).toContain("--ds-space-gap: 24px 8px");
  });

  it("normalizes an unusable measurement to zero rather than emitting it", () => {
    for (const size of [-4, Number.NaN, Number.POSITIVE_INFINITY]) {
      const { getByRole, unmount } = render(
        <ModernSpace role="group" aria-label="unsafe" size={size}>
          <span>a</span>
        </ModernSpace>
      );
      expect(
        getByRole("group").style.getPropertyValue("--ds-space-gap"),
        String(size)
      ).toBe("0px");
      unmount();
    }
  });
});

describe("leg 3 -- direction, wrap, align and split are untouched", () => {
  it("keeps direction/wrap/align projections exactly as before, alongside a preset gap", () => {
    const { getByRole } = render(
      <ModernSpace
        role="group"
        aria-label="full"
        direction="vertical"
        wrap
        align="start"
        size="lg"
        dir="rtl"
        lang="ar"
      >
        <span>أ</span>
      </ModernSpace>
    );
    const space = getByRole("group");
    expect(space).toHaveAttribute("dir", "rtl");
    expect(space).toHaveAttribute("data-direction", "vertical");
    expect(space).toHaveAttribute("data-wrap", "true");
    expect(space).toHaveAttribute("data-align", "start");
    expect(space).toHaveAttribute("data-size", "lg");
  });
});

describe("leg 4 -- Space has NO responsive path (structural, not a jsdom gap)", () => {
  it("SpaceProps.size is not a ResponsiveValue -- a breakpoint object is not special-cased", () => {
    // Passed as a caller-side type violation on purpose (cast through
    // `unknown`): Space treats anything that is not a number and not an array
    // as a rung SPELLING. A breakpoint object stringifies to "[object
    // Object]", which no rung rule enumerates, so the cascade falls closed to
    // the rung `--ds-space-gap` rests on -- proving Space does not detect or
    // branch on a responsive-shaped value at all.
    const responsiveShaped = { xs: "sm", lg: "xl" } as unknown as SpaceProps["size"];
    const { getByRole } = render(
      <ModernSpace role="group" aria-label="responsive-shaped" size={responsiveShaped}>
        <span>a</span>
      </ModernSpace>
    );
    const space = getByRole("group");
    expect(space).toHaveAttribute("data-size", "[object Object]");
    expect(space.getAttribute("style")).toBeNull();
  });

  it("there is no Space/runtime/responsive collector to opt rhythm into", () => {
    const modernEngineSource = readFileSync(
      resolve(HERE, "../engines/modern/index.tsx"),
      "utf8"
    );
    expect(modernEngineSource).not.toContain("collectSpaceResponsiveEntries");
    expect(modernEngineSource).not.toContain("runtime/responsive");
    expect(modernEngineSource).not.toContain("generateResponsiveCSS");
  });
});

describe("leg 5 -- the tri-stop rhythm law: 0.85 / 1 / 1.2, monotonicity, exact removal", () => {
  it("pins the canonical tri-stop factor table", () => {
    expect(TENANT_THEME_RHYTHM_FACTORS).toEqual({
      tight: 0.85,
      normal: 1,
      airy: 1.2,
    });
  });

  it("the three factors are strictly monotonically increasing", () => {
    const { tight, normal, airy } = TENANT_THEME_RHYTHM_FACTORS;
    expect(tight).toBeLessThan(normal);
    expect(normal).toBeLessThan(airy);
  });

  it("`normal` is the identity factor the rung formula falls back to", () => {
    expect(TENANT_THEME_RHYTHM_FACTORS.normal).toBe(1);
  });
});

describe("leg 6 -- CLASSIC/RUSTIC INVARIANCE (the counterfactual control)", () => {
  it("Classic never renders the space class or a data-size attribute", () => {
    const { container } = render(
      <ClassicSpace size="lg">
        <span>a</span>
      </ClassicSpace>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/(rottay|ds)-space/);
    expect(root.getAttribute("data-size")).toBeNull();
  });

  it("Rustic never renders the space class or a data-size attribute", () => {
    const { container } = render(
      <RusticSpace size="lg">
        <span>a</span>
      </RusticSpace>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/(rottay|ds)-space/);
    expect(root.getAttribute("data-size")).toBeNull();
  });

  it("Classic and Rustic resolve gap ENTIRELY inline -- no external channel to scale", () => {
    // Rustic's own (pre-existing, read-only) code appends a literal "px"
    // suffix unconditionally even though the value is a `var()` token; that
    // quirk predates this work and is reproduced verbatim rather than
    // "corrected" in the expectation.
    const { container } = render(
      <RusticSpace size="lg">
        <span>a</span>
      </RusticSpace>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.gap).toBe(`${SPACE_SIZE_MAP.large}px`);
    expect(root.getAttribute("style") ?? "").not.toContain(RHYTHM);
  });

  it("byte-identical across all THREE rhythm stops: the read-only engines never consume the channel", () => {
    for (const factor of Object.values(TENANT_THEME_RHYTHM_FACTORS)) {
      const wrapperStyle = { "--ds-rhythm-effective-scale": String(factor) } as React.CSSProperties;
      const classicRender = render(
        <div style={wrapperStyle}>
          <ClassicSpace size="lg">
            <span>a</span>
          </ClassicSpace>
        </div>
      );
      const rusticRender = render(
        <div style={wrapperStyle}>
          <RusticSpace size="lg">
            <span>a</span>
          </RusticSpace>
        </div>
      );
      const classicRoot = classicRender.container.firstElementChild
        ?.firstElementChild as HTMLElement;
      const rusticRoot = rusticRender.container.firstElementChild
        ?.firstElementChild as HTMLElement;
      expect(rusticRoot.style.gap, String(factor)).toBe(`${SPACE_SIZE_MAP.large}px`);
      expect(classicRoot.getAttribute("style") ?? "", String(factor)).not.toContain(
        RHYTHM
      );
      classicRender.unmount();
      rusticRender.unmount();
    }
  });

  it("POSITIVE CONTROL: Modern genuinely differs from Classic/Rustic on the same preset", () => {
    const { getByRole: modernQuery, unmount: unmountModern } = render(
      <ModernSpace role="group" aria-label="modern" size="lg">
        <span>a</span>
      </ModernSpace>
    );
    const modernRoot = modernQuery("group");
    expect(modernRoot.className).toContain("ds-space--modern");
    expect(modernRoot).toHaveAttribute("data-size", "lg");
    expect(modernRoot.getAttribute("style")).toBeNull();
    unmountModern();

    const { container } = render(
      <RusticSpace size="lg">
        <span>a</span>
      </RusticSpace>
    );
    const rusticRoot = container.firstElementChild as HTMLElement;
    expect(rusticRoot.getAttribute("style") ?? "").toContain("gap");
    expect(rusticRoot.getAttribute("data-size")).toBeNull();
  });
});
