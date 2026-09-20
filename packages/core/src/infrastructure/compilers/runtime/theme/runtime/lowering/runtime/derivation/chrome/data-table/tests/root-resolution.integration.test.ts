/**
 * The two ladder channels, measured in Chromium at the scope the deriver writes.
 *
 * A produced channel that names a component-scoped alias is not a producer: the
 * declaration lands at `html[data-tenant]`, where the alias does not exist, so
 * it computes to the guaranteed-invalid value and the read site keeps painting
 * from its own fallback. The channel looks wired and moves nothing. This suite
 * reads the channel itself off the scope, not only the paint it feeds, because
 * the paint alone cannot tell a live channel from a live fallback.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { measureArms, type ProbeReadings } from "@tests/support/family-causality";

const ENGINE = readFileSync(
  resolve(
    process.cwd(),
    "src/components/patterns/data/data-table/engines/modern/index.tsx"
  ),
  "utf8"
);

/**
 * The family's anatomy, as the Modern engine stamps it: the root's class pair
 * and `data-part`, the grip and the drop indicator. The two parts are asserted
 * against the engine source below, so the probe cannot measure an anatomy the
 * product does not render.
 */
function root(density?: "compact" | "spacious"): string {
  const legacyLineHeight = density === "compact" ? "1.25" : density === "spacious" ? "1.55" : "1.35";
  return [
    `<div class="ds-pattern-data-table ds-engine-modern" data-part="root"`,
    density ? ` data-density="${density}"` : "",
    `><span data-part="drag-grip"></span>`,
    `<span data-part="drop-indicator"></span>`,
    `<span data-part="data-cell">M</span>`,
    /* The same part, painted by the chain the skin read BEFORE this lot: the
       old name has no producer anywhere, so this twin computes exactly what
       the skin computed at HEAD. Byte-equality is then a measurement of the
       two side by side rather than an argument about the fallback. */
    `<span data-part="data-cell" data-probe="legacy"`,
    ` style="line-height: var(--ds-table-cell-line-height, ${legacyLineHeight})">M</span>`,
    `<span data-part="group-header-count-pill"></span>`,
    `<span data-part="group-header-count-pill" data-probe="legacy"`,
    ` style="border-radius: var(--ds-table-control-radius, var(--ds-radius-full, 9999px))"></span>`,
    `</div>`,
  ].join("");
}

const MARKUP = [
  `<div id="rest">${root()}</div>`,
  `<div id="compact">${root("compact")}</div>`,
  `<div id="spacious">${root("spacious")}</div>`,
].join("");

const GRIP_CHANNEL = "--ds-data-table-drag-grip-size";
const GRIP_COMPACT = `${GRIP_CHANNEL}-compact`;
const GRIP_SPACIOUS = `${GRIP_CHANNEL}-spacious`;
const RADIUS_CHANNEL = "--ds-data-table-drop-indicator-radius";
const CONTROL_RADIUS = "--ds-data-table-control-radius";
const PILL_RADIUS = "--ds-data-table-control-pill-radius";
const LINE_HEIGHT = "--ds-data-table-cell-line-height";

/** The three posture scopes, and the channel suffix each one's rule reads. */
const POSTURES = [
  ["rest", ""],
  ["compact", "-compact"],
  ["spacious", "-spacious"],
] as const;

const cell = (scope: string, legacy = false) =>
  `#${scope} [data-part='data-cell']${legacy ? "[data-probe='legacy']" : ":not([data-probe])"}`;

let readings: ProbeReadings;

describe("chrome/data-table channels at the theme root", () => {
  beforeAll(async () => {
    readings = await measureArms({
      vertical: "rottay",
      markup: MARKUP,
      arms: {
        base: {},
        tall: { "shape.control-height": "tall" },
        rounder: { "shape.radius-scale": 1.2 },
      },
      targets: [
        // The channels themselves, read where the deriver's declaration lands.
        { id: "gripChannel", selector: "#rest [data-part='root']", property: GRIP_CHANNEL },
        { id: "radiusChannel", selector: "#rest [data-part='root']", property: RADIUS_CHANNEL },
        // The same two channels one level ABOVE the component root: the theme
        // scope inherits them, which is what makes them producers at all.
        { id: "gripChannelAbove", selector: "#rest", property: GRIP_CHANNEL },
        { id: "radiusChannelAbove", selector: "#rest", property: RADIUS_CHANNEL },
        // The two posture channels, at the same scope: a `[data-density]` rule
        // can only pick a rung that exists where the theme writes it.
        { id: "gripCompactChannelAbove", selector: "#compact", property: GRIP_COMPACT },
        { id: "gripSpaciousChannelAbove", selector: "#spacious", property: GRIP_SPACIOUS },
        { id: "gripCompactChannel", selector: "#compact [data-part='root']", property: GRIP_COMPACT },
        { id: "gripSpaciousChannel", selector: "#spacious [data-part='root']", property: GRIP_SPACIOUS },
        // The alias the produced values must never name.
        { id: "aliasAbove", selector: "#rest", property: "--ds-modern-table-control-size" },
        { id: "aliasOnRoot", selector: "#rest [data-part='root']", property: "--ds-modern-table-control-size" },
        // The paint each channel feeds.
        { id: "gripWidth", selector: "#rest [data-part='drag-grip']", property: "width" },
        { id: "gripHeight", selector: "#rest [data-part='drag-grip']", property: "height" },
        { id: "gripCompact", selector: "#compact [data-part='drag-grip']", property: "width" },
        { id: "gripSpacious", selector: "#spacious [data-part='drag-grip']", property: "width" },
        { id: "dropRadius", selector: "#rest [data-part='drop-indicator']", property: "border-top-left-radius" },
        { id: "dropRadiusCompact", selector: "#compact [data-part='drop-indicator']", property: "border-top-left-radius" },
        { id: "dropRadiusSpacious", selector: "#spacious [data-part='drop-indicator']", property: "border-top-left-radius" },
        // The residual lot's channels, at the scope the deriver writes them,
        // and the paint each one feeds beside the chain it replaced.
        ...POSTURES.flatMap(([scope, suffix]) => [
          { id: `lineChannel_${scope}`, selector: `#${scope}`, property: `${LINE_HEIGHT}${suffix}` },
          { id: `line_${scope}`, selector: cell(scope), property: "line-height" },
          { id: `lineLegacy_${scope}`, selector: cell(scope, true), property: "line-height" },
        ]),
        { id: "controlRadiusChannel", selector: "#rest", property: CONTROL_RADIUS },
        { id: "pillRadiusChannel", selector: "#rest", property: PILL_RADIUS },
        { id: "pill", selector: "#rest [data-part='group-header-count-pill']:not([data-probe])", property: "border-top-left-radius" },
        { id: "pillLegacy", selector: "#rest [data-part='group-header-count-pill'][data-probe='legacy']", property: "border-top-left-radius" },
      ],
    });
  }, 240_000);

  it("probes the anatomy the Modern engine stamps", () => {
    expect(ENGINE).toContain('partAttributes("drag-grip"');
    expect(ENGINE).toContain('data-part="drop-indicator"');
  });

  it("resolves both channels where the deriver writes them", () => {
    /* The regression this suite exists for: naming `--ds-modern-table-*` made
       both channels compute to the empty string here, in every arm. */
    for (const arm of ["base", "tall", "rounder"]) {
      expect(readings[arm]!.aliasAbove, `${arm}: alias above the root`).toBe("");
      expect(readings[arm]!.aliasOnRoot, `${arm}: alias on the root`).not.toBe("");
      expect(readings[arm]!.gripChannelAbove, `${arm}: grip channel`).not.toBe("");
      expect(readings[arm]!.radiusChannelAbove, `${arm}: radius channel`).not.toBe("");
    }
  });

  it("moves the grip with the control-height decision and holds the radius control", () => {
    const { base, tall, rounder } = readings as Record<string, Record<string, string>>;
    expect(tall!.gripChannel).not.toBe(base!.gripChannel);
    expect(rounder!.gripChannel).toBe(base!.gripChannel);
    expect(tall!.gripWidth).not.toBe(base!.gripWidth);
    expect(tall!.gripHeight).not.toBe(base!.gripHeight);
    expect(rounder!.gripWidth).toBe(base!.gripWidth);
    /* The resting paint the skin's own fallback drew before the repair. */
    expect(base!.gripWidth).toBe("24.375px");
    expect(base!.gripHeight).toBe("24.375px");
    expect(tall!.gripWidth).toBe("28.875px");
  });

  it("moves the drop indicator's corner with the radius scale and holds the height control", () => {
    const { base, tall, rounder } = readings as Record<string, Record<string, string>>;
    expect(rounder!.radiusChannel).not.toBe(base!.radiusChannel);
    expect(tall!.radiusChannel).toBe(base!.radiusChannel);
    /* The resting paint the skin's own fallback drew before the repair, and the
       scaled one the produced channel now carries. */
    expect(base!.dropRadius).toBe("8px");
    expect(rounder!.dropRadius).toBe("9.6px");
    expect(tall!.dropRadius).toBe("8px");
  });

  it("paints each density posture from its own produced rung", () => {
    /* The discriminator, and the repair the posture channels exist for. The
       read-site fallback is `calc(var(--ds-modern-table-control-size) -
       0.375rem)`, and the `[data-density]` rules swap that alias for the
       compact/spacious rung -- so a fallback-painted grip measures three widths.
       A single theme-root producer could not: a custom property substitutes its
       `var()`s where it is DECLARED, so one value carried the resting rung to
       all three postures (measured: 24.375px everywhere). One produced channel
       per posture restores the split, now from producers rather than fallbacks. */
    const base = readings.base!;
    expect(base.gripCompactChannelAbove, "compact rung at the theme scope").not.toBe("");
    expect(base.gripSpaciousChannelAbove, "spacious rung at the theme scope").not.toBe("");
    expect(base.gripCompactChannel).toBe(base.gripCompactChannelAbove);
    expect(base.gripSpaciousChannel).toBe(base.gripSpaciousChannelAbove);
    expect(base.gripCompactChannel).not.toBe(base.gripChannel);
    expect(base.gripSpaciousChannel).not.toBe(base.gripChannel);
    /* The three widths the skin drew before this channel had any producer. */
    expect(base.gripCompact).toBe("20.625px");
    expect(base.gripWidth).toBe("24.375px");
    expect(base.gripSpacious).toBe("28.125px");
  });

  it("moves all three postures with the control-height decision", () => {
    /* A posture rung is a producer only if a decision reaches it: `tall` must
       move compact and spacious as it moves the resting one, and the negative
       control must move none of them. */
    const { base, tall, rounder } = readings as Record<string, Record<string, string>>;
    for (const posture of ["gripCompact", "gripWidth", "gripSpacious"] as const) {
      expect(tall![posture], `tall: ${posture}`).not.toBe(base![posture]);
      expect(rounder![posture], `rounder: ${posture}`).toBe(base![posture]);
    }
  });

  it("resolves the residual lot's channels where the deriver writes them", () => {
    /* Same trap as the two ladder channels above: a channel that resolved only
       on the component root would leave every read site painting from its own
       fallback, and the paint would look identical while the decision reached
       nothing. Read above the root, where the theme scope has to carry it. */
    for (const arm of ["base", "tall", "rounder"]) {
      const reading = readings[arm]!;
      for (const [scope] of POSTURES) {
        expect(reading[`lineChannel_${scope}`]!.trim(), `${arm}: ${scope} rung`).not.toBe("");
      }
      expect(reading.controlRadiusChannel.trim(), `${arm}: control radius`).not.toBe("");
      expect(reading.pillRadiusChannel.trim(), `${arm}: pill radius`).not.toBe("");
    }
    expect(readings.base!.lineChannel_rest!.trim()).toBe("1.35");
    expect(readings.base!.lineChannel_compact!.trim()).toBe("1.25");
    expect(readings.base!.lineChannel_spacious!.trim()).toBe("1.55");
  });

  it("paints the cell measure and the count pill exactly as the superseded chain did", () => {
    /* The byte-equality arm, measured rather than argued: each legacy twin is
       the same part painted by the pre-lot chain, whose name still has no
       producer, so it computes what the skin computed at HEAD. */
    for (const arm of ["base", "tall", "rounder"]) {
      const reading = readings[arm]!;
      for (const [scope] of POSTURES) {
        expect(reading[`line_${scope}`], `${arm}: ${scope} line-height`).toBe(
          reading[`lineLegacy_${scope}`]
        );
      }
      expect(reading.pill, `${arm}: pill corner`).toBe(reading.pillLegacy);
    }
    /* And the twins are real paint, not two selectors that matched nothing:
       the pill rests full-round where the box rung rests on the radius
       scale's md step, which is the divergence that made this a split. */
    const base = readings.base!;
    expect(base.pill).toBe("9999px");
    expect(base.dropRadius).toBe("8px");
    for (const [scope] of POSTURES) {
      expect(base[`line_${scope}`], `${scope}: measured`).toMatch(/^[\d.]+px$/);
    }
  });

  it("splits the cell measure across the three density postures", () => {
    /* The reason the channel is three channels: the postures really do paint
       three measures, and a single theme-root rung would carry the resting one
       to all three. */
    const base = readings.base!;
    const measures = POSTURES.map(([scope]) => base[`line_${scope}`]!);
    expect(new Set(measures).size).toBe(POSTURES.length);
  });

  it("holds the drop indicator's corner across every posture", () => {
    /* A resting measurement only: the produced channel resolves at the theme
       root and masks the read site's `--ds-modern-table-control-radius`
       fallback, so this stays green even if the skin grows a `[data-density]`
       restatement of that alias. What it shows is that the one theme-root
       channel reaches all three postures uniformly. The guard against that
       skin drift is the source pin -- `tests/index.test.ts`, "holds the drop
       indicator's corner at one channel, because no posture moves it". */
    for (const arm of ["base", "tall", "rounder"]) {
      const reading = readings[arm]!;
      expect(reading.dropRadiusCompact, `${arm}: compact corner`).toBe(reading.dropRadius);
      expect(reading.dropRadiusSpacious, `${arm}: spacious corner`).toBe(reading.dropRadius);
    }
  });
});
