/**
 * The thirteen rewired channels, measured in Chromium at the paint they feed.
 *
 * Each one used to rest on a literal that no decision could reach. Wiring it to
 * a governed root has exactly two obligations, and this suite states both: the
 * resting arm must paint the byte-identical value the literal painted, and the
 * decision behind the root must now move it while a negative control does not.
 */
import { beforeAll, describe, expect, it } from "vitest";

import {
  measureArms,
  type ProbeReadings,
} from "@tests/support/family-causality";

const MOBILE = "ds-pattern-data-table ds-data-table--mobile";

function mobileRoot(id: string, recipe: string): string {
  return [
    `<div id="${id}" class="${MOBILE}" data-part="mobile-root" data-recipe="${recipe}">`,
    `<div class="${MOBILE}" data-part="mobile-bulk-actions"></div>`,
    `<div class="ds-data-table__mobile-card" data-part="mobile-card">`,
    `<div data-part="mobile-card-selection"></div>`,
    `<div data-part="mobile-card-title">Title</div>`,
    `<div data-part="mobile-card-summary-row"></div>`,
    `<div data-part="mobile-card-actions"></div>`,
    `</div>`,
    `<div data-part="mobile-card-custom" data-selected="true"></div>`,
    `<div data-part="record-list-item"></div>`,
    `<div data-part="swipe-actions-bar"></div>`,
    `<div data-part="mobile-pagination"></div>`,
    `</div>`,
  ].join("");
}

const MARKUP = [
  mobileRoot("editorial", "editorial"),
  mobileRoot("ruled", "ruled"),
  `<div id="state" class="${MOBILE}" data-part="mobile-state-panel"></div>`,
  `<div id="desktop" class="ds-pattern-data-table ds-engine-modern" data-part="root">`,
  `<span data-part="drag-grip"></span></div>`,
].join("");

/** id -> [selector, property, the value the literal painted at rest]. */
const RESTING: Record<string, readonly [string, string, string]> = {
  gripOffset: ["#desktop [data-part='drag-grip']", "margin-inline-end", "0px"],
  editorialTitle: [
    "#editorial [data-part='mobile-card-title']",
    "font-size",
    "15px",
  ],
  cardActions: [
    "#editorial [data-part='mobile-card-actions']",
    "padding-top",
    "9.375px",
  ],
  swipeActions: [
    "#editorial [data-part='swipe-actions-bar']",
    "padding-top",
    "9.375px",
  ],
  bulkPaddingBlock: [
    "#editorial [data-part='mobile-bulk-actions']",
    "padding-top",
    "9.375px",
  ],
  bulkPaddingInline: [
    "#editorial [data-part='mobile-bulk-actions']",
    "padding-left",
    "11.25px",
  ],
  paginationBlock: [
    "#editorial [data-part='mobile-pagination']",
    "padding-top",
    "9.375px",
  ],
  paginationInline: [
    "#editorial [data-part='mobile-pagination']",
    "padding-left",
    "11.25px",
  ],
  selectionWidth: [
    "#editorial [data-part='mobile-card-selection']",
    "min-width",
    "33.75px",
  ],
  selectionHeight: [
    "#editorial [data-part='mobile-card-selection']",
    "min-height",
    "33.75px",
  ],
  outlineOffset: [
    "#editorial [data-part='mobile-card-custom']",
    "outline-offset",
    "2px",
  ],
  stateMinHeight: ["#state", "min-height", "120px"],
  statePaddingBlock: ["#state", "padding-top", "30px"],
  statePaddingInline: ["#state", "padding-left", "18.75px"],
  summaryMinHeight: [
    "#editorial [data-part='mobile-card-summary-row']",
    "min-height",
    "30px",
  ],
  summaryPaddingBlock: [
    "#editorial [data-part='mobile-card-summary-row']",
    "padding-top",
    "5.625px",
  ],
  summaryPaddingInline: [
    "#editorial [data-part='mobile-card-summary-row']",
    "padding-left",
    "1.875px",
  ],
  listItemBlock: [
    "#editorial [data-part='record-list-item']",
    "padding-top",
    "5.625px",
  ],
  listItemInline: [
    "#editorial [data-part='record-list-item']",
    "padding-left",
    "1.875px",
  ],
  /* The ruled recipe drives the card's shadow CHANNEL; the generic mobile-card
     rule outranks it on the `box-shadow` property itself, which is this skin's
     own pre-existing order and not what this lot changed. */
  ruledShadow: [
    "#ruled .ds-data-table__mobile-card",
    "--ds-card-shadow",
    "none",
  ],
};

/** The readings each decision is wired to move. */
const RHYTHM_MOVES = [
  "cardActions",
  "swipeActions",
  "bulkPaddingBlock",
  "bulkPaddingInline",
  "paginationBlock",
  "paginationInline",
  "summaryPaddingBlock",
  "summaryPaddingInline",
  "listItemBlock",
  "listItemInline",
] as const;

const DENSITY_MOVES = [
  "selectionWidth",
  "selectionHeight",
  "stateMinHeight",
  "statePaddingBlock",
  "statePaddingInline",
  "summaryMinHeight",
] as const;

const TYPE_MOVES = ["editorialTitle"] as const;

let readings: ProbeReadings;

describe("chrome/data-table rewired channels", () => {
  beforeAll(async () => {
    readings = await measureArms({
      vertical: "rottay",
      markup: MARKUP,
      arms: {
        base: {},
        airy: { "spacing.rhythm": "airy" },
        spacious: { "density.mode": "spacious" },
        bigType: { "typography.scale": 1.08 },
      },
      targets: [
        ...Object.entries(RESTING).map(([id, [selector, property]]) => ({
          id,
          selector,
          property,
        })),
        /* The shadow channel and the root it rests on, read where the ruled
           card paints: a `none` box-shadow cannot tell a live channel from a
           live fallback. */
        {
          id: "ruledShadowChannel",
          selector: "#ruled .ds-data-table__mobile-card",
          property: "--ds-data-table-ruled-mobile-shadow",
        },
        {
          id: "elevationZero",
          selector: "#ruled .ds-data-table__mobile-card",
          property: "--ds-elevation-0",
        },
      ],
    });
  }, 240_000);

  it("paints the byte-identical resting value every literal painted", () => {
    const base = readings.base!;
    for (const [id, [, , resting]] of Object.entries(RESTING)) {
      expect(base[id], id).toBe(resting);
    }
  });

  it("moves the rhythm-scaled paddings with the layout-rhythm decision only", () => {
    /* The negative control is density, not the type scale: the type scale moves
       the root font size, so it moves every rem-valued reading in this suite and
       can never discriminate. */
    const { base, airy, spacious } = readings as Record<
      string,
      Record<string, string>
    >;
    for (const id of RHYTHM_MOVES) {
      expect(airy![id], `airy: ${id}`).not.toBe(base![id]);
      expect(spacious![id], `spacious: ${id}`).toBe(base![id]);
    }
  });

  it("moves the spacing rungs with the density decision only", () => {
    const { base, spacious, airy } = readings as Record<
      string,
      Record<string, string>
    >;
    for (const id of DENSITY_MOVES) {
      expect(spacious![id], `spacious: ${id}`).not.toBe(base![id]);
      expect(airy![id], `airy: ${id}`).toBe(base![id]);
    }
  });

  it("moves the editorial mobile title along the type ramp, not only with the root rem", () => {
    /* The discriminator this wire needs: a `1rem` literal ALREADY moved under a
       type-scale arm, because the dial scales the root font size the rem
       resolves against -- 15px -> 16.2px. Reading the ramp's `lg` rung applies
       the dial a second time, at the rung, which is what "the type decision
       reaches this channel" means. A not-equal assertion cannot tell the two
       apart, so the moved value is pinned exactly. */
    const { base, bigType, spacious } = readings as Record<
      string,
      Record<string, string>
    >;
    for (const id of TYPE_MOVES) {
      expect(base![id], `base: ${id}`).toBe("15px");
      expect(bigType![id], `bigType: ${id}`).toBe("17.496px");
      expect(spacious![id], `spacious: ${id}`).toBe(base![id]);
    }
  });

  it("holds the two channels whose roots are constant by construction", () => {
    /* The grip's margin rests on `--ds-spacing-0`, literal zero, and the ruled
       card's shadow on `--ds-elevation-0`, `none`. Both are wired, and the
       channel reading proves it: the read site resolves the produced chain, not
       its own fallback. Neither root has anything for an arm to move. */
    for (const arm of ["base", "airy", "spacious", "bigType"]) {
      const reading = readings[arm]!;
      expect(reading.gripOffset, `${arm}: grip offset`).toBe("0px");
      expect(reading.ruledShadowChannel.trim(), `${arm}: shadow channel`).toBe(
        "none"
      );
      expect(reading.elevationZero.trim(), `${arm}: elevation 0`).toBe("none");
    }
  });
});
