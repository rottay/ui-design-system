/**
 * @fileoverview Fail-closed gate: a Modern keyline is painted by the edge
 * vocabulary, never by a bare width literal.
 *
 * A `border: 1px solid ...` written straight into a skin can never move with a
 * tenant: no border-style decision reaches a literal, so the depth axis is
 * silent on it whatever the theme authors. This gate holds the corpus at the
 * wired state and pins the four categories that are deliberately NOT wired.
 *
 * The three sanctioned exception classes come from the edge grammar's own law
 * in `expressive-profiles/expansion`: state borders keep their own channels so
 * no edge posture can make a state invisible; a forced-colors fallback must
 * paint when the dial says 0px; a drag affordance must survive its gesture.
 *
 * The mutation block at the bottom proves the scanner can go red. A gate that
 * has never been shown to fail is not evidence.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import {
  buildLoweringContext,
  runDerivation,
} from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/pipeline";
import { expressiveDeriver } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/expressive";
import { elevationDeriver } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/elevation";

const PACKAGE_ROOT = resolve(__dirname, "../../..");
const SKIN_ROOT = join(
  PACKAGE_ROOT,
  "src/foundation/tokens/css/runtime/engines/modern/skin"
);

const ROLE = "--ds-edge-hairline-width";
/** The one form this lot writes: the role, with the retired literal as floor. */
const WIRE = `var(${ROLE}, 1px)`;

/* ------------------------------ the scanner ------------------------------ */

type Decl = {
  family: string;
  prop: string;
  value: string;
  selector: string;
  atRules: readonly string[];
};

const BORDER_PROP =
  /^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-width)?$/;

function cssFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) cssFiles(path, out);
    else if (entry.endsWith(".css")) out.push(path);
  }
  return out;
}

/**
 * Every border declaration carrying a width literal of its own, with the
 * selector and at-rule stack that decide whether the literal is sanctioned.
 * Comments are blanked rather than dropped so a prose apostrophe cannot desync
 * the walk.
 */
function borderDeclarations(file: string, family: string): Decl[] {
  const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) =>
    m.replace(/[^\n]/g, " ")
  );
  const found: Decl[] = [];
  const stack: string[] = [];
  let buffer = "";
  let start = 0;

  for (let i = 0; i < css.length; i += 1) {
    const char = css[i];
    if (char === "{" || char === "}") {
      if (char === "{") stack.push(buffer.trim().replace(/\s+/g, " "));
      else stack.pop();
      buffer = "";
      start = i + 1;
      continue;
    }
    if (char !== ";") {
      buffer += char;
      continue;
    }
    const colon = buffer.indexOf(":");
    if (colon > 0) {
      const prop = buffer.slice(0, colon).trim();
      if (BORDER_PROP.test(prop)) {
        const value = css.slice(start + colon + 1, i).trim().replace(/\s+/g, " ");
        // a width of its own = a length token that is not inside a var()
        const outsideVar = value.replace(
          /var\([^()]*(\([^()]*\)[^()]*)*\)/g,
          (m) => " ".repeat(m.length)
        );
        if (/(?<![-\w.])\d*\.?\d+(px|rem|em)\b/.test(outsideVar)) {
          found.push({
            family,
            prop,
            value,
            selector: stack.filter((s) => !s.startsWith("@")).join(" >> "),
            atRules: stack.filter((s) => s.startsWith("@")),
          });
        }
      }
    }
    buffer = "";
    start = i + 1;
  }
  return found;
}

/** A system-color fallback must paint even when the dial retracts the role. */
const isForcedColors = (d: Decl): boolean =>
  d.atRules.some((a) => /forced-colors/.test(a)) ||
  /ButtonText|CanvasText|Highlight|LinkText|GrayText/.test(d.value);

/** States keep their own channels, by the edge grammar's own law. */
const isStateBorder = (d: Decl): boolean =>
  /:focus|focus-visible|data-focus|\[data-selected|\[data-invalid|\[data-error|\[aria-invalid|--error|--invalid|--selected|\[data-active=['"]?true|\[data-checked|\[aria-selected=['"]?true|\[data-current/.test(
    d.selector
  ) || /focus|invalid|-error|selected|active-border/i.test(d.value);

/** A grip or drop indicator must stay visible for the length of the gesture. */
const isAffordance = (d: Decl): boolean =>
  /drag|drop-indicator|resize|grip|handle|dnd|placeholder/i.test(
    `${d.selector} ${d.value}`
  );

/** A transparent reserve is paired with a state border; retracting it shifts. */
const isTransparentReserve = (d: Decl): boolean =>
  /\btransparent\b/.test(d.value) && !/color-mix/.test(d.value);

type Category =
  | "keyline"
  | "forced-colors"
  | "state-border"
  | "affordance"
  | "transparent-reserve";

const categorize = (d: Decl): Category =>
  isForcedColors(d)
    ? "forced-colors"
    : isStateBorder(d)
      ? "state-border"
      : isAffordance(d)
        ? "affordance"
        : isTransparentReserve(d)
          ? "transparent-reserve"
          : "keyline";

const ALL_DECLS: readonly Decl[] = cssFiles(SKIN_ROOT).flatMap((file) =>
  borderDeclarations(file, file.slice(SKIN_ROOT.length + 1).split("/")[0])
);
/** Only the 1px pool: the widths an edge role can rest byte-equal against. */
const ONE_PX = ALL_DECLS.filter((d) => {
  const outside = d.value.replace(
    /var\([^()]*(\([^()]*\)[^()]*)*\)/g,
    (m) => " ".repeat(m.length)
  );
  return (outside.match(/(?<![-\w.])\d*\.?\d+(px|rem|em)\b/g) ?? []).join("+") === "1px";
});

/* ------------------------- the families this lot wired ------------------- */

const WIRED_FAMILIES = [
  "approval-inbox", "approval-workflow", "badge", "calendar", "carousel",
  "cockpit-header", "column-settings", "command-palette", "context-menu",
  "data-table", "descriptions", "detail-panel", "environment-toggle",
  "file-manager", "filter-builder", "filter-panel", "form", "form-builder",
  "image", "invoice-template", "kbd", "list-toolbar", "live-feed",
  "locale-switcher", "moderation-gallery", "notification-center",
  "operational-ledger", "pattern-calendar-view", "pattern-kanban-board",
  "pattern-map-view", "popconfirm", "pricing-table", "qrcode", "result",
  "saved-views", "select", "shift-matrix", "statistic", "stats-grid",
  "step-wizard", "table", "tag", "tenant-preview", "upload", "widget-board",
  "workbench-header", "workspace-switcher",
] as const;

describe("modern skin edge vocabulary", () => {
  it("finds the corpus it is supposed to be measuring", () => {
    // A source-derived roster silently shrinks to nothing instead of failing,
    // so every population this gate reasons over carries a floor. The wire
    // count is the load-bearing one: the literals it replaced now sit inside a
    // var() and are invisible to the width scan by construction.
    expect(cssFiles(SKIN_ROOT).length).toBeGreaterThanOrEqual(124);
    expect(ALL_DECLS.length).toBeGreaterThanOrEqual(110);
    expect(ONE_PX.length).toBeGreaterThanOrEqual(80);
    expect(WIRED_FAMILIES.length).toBe(47);

    const wires = cssFiles(SKIN_ROOT).reduce(
      (n, f) => n + (readFileSync(f, "utf8").split(WIRE).length - 1),
      0
    );
    expect(wires).toBeGreaterThanOrEqual(174);
  });

  it("leaves NO keyline painted by a bare width literal, corpus-wide", () => {
    const stragglers = ONE_PX.filter((d) => categorize(d) === "keyline").map(
      (d) => `${d.family}: ${d.prop}: ${d.value}`
    );
    expect(stragglers).toEqual([]);
  });

  it("keeps the residual pool inside the four sanctioned classes", () => {
    const tally: Record<string, number> = {};
    for (const d of ONE_PX) {
      const c = categorize(d);
      tally[c] = (tally[c] ?? 0) + 1;
    }
    expect(tally.keyline ?? 0).toBe(0);
    // decrease-only: a class may shrink as a family earns a real channel, but
    // a new bare literal in any class has to be argued, not absorbed.
    expect(tally["forced-colors"]).toBeLessThanOrEqual(52);
    expect(tally["state-border"]).toBeLessThanOrEqual(16);
    expect(tally["transparent-reserve"]).toBeLessThanOrEqual(11);
    expect(tally.affordance).toBeLessThanOrEqual(8);
  });

  describe.each(WIRED_FAMILIES)("%s", (family) => {
    it("paints its keylines through the edge role", () => {
      const declarations = ONE_PX.filter((d) => d.family === family);
      expect(
        declarations.filter((d) => categorize(d) === "keyline"),
        `${family} still paints a bare keyline literal`
      ).toEqual([]);

      const css = cssFiles(join(SKIN_ROOT, family))
        .map((f) => readFileSync(f, "utf8"))
        .join("\n");
      expect(css, `${family} does not read ${ROLE}`).toContain(WIRE);
    });
  });
});

/* --------------------------- the causality arm --------------------------- */

const MINIMAL: FlatTheme = { id: "minimal", name: "Minimal" };

/** The width the role lands on the root for one authored border posture. */
function roleWidth(theme: FlatTheme): string | undefined {
  const { channels } = runDerivation(buildLoweringContext({ theme }), [
    expressiveDeriver,
    elevationDeriver,
  ]);
  return channels[ROLE];
}

const posture = (borderStyle: "none" | "hairline" | "strong"): FlatTheme => ({
  ...MINIMAL,
  surfaces: { borderStyle },
});

describe("modern skin edge vocabulary: depth causality", () => {
  it("CAUSALITY: a border posture moves the width every wired keyline paints", () => {
    expect(roleWidth(posture("none"))).toBe("0px");
    expect(roleWidth(posture("hairline"))).toBe("1px");
    expect(roleWidth(posture("strong"))).toBe("1px");
    expect(roleWidth(posture("none"))).not.toBe(roleWidth(posture("strong")));
  });

  it("rests byte-identical to the retired literal in every vertical", () => {
    // The claim the whole lot has to earn: with no posture authored, the role
    // resolves to the SAME 1px the literals stated -- in each first-party
    // vertical, not just the default theme. `--ds-edge-standard-width` would
    // fail this: bithire rests it at 1.5px.
    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      expect(roleWidth(firstPartyFixture(vertical)), vertical).toBe("1px");
    }
    // A theme with no expressive profile states no role, so the foundation
    // default is what paints -- and it is the same 1px.
    expect(roleWidth(MINIMAL)).toBeUndefined();
    expect(
      readFileSync(
        join(PACKAGE_ROOT, "src/foundation/tokens/css/foundation/themes/default/index.css"),
        "utf8"
      )
    ).toContain(`${ROLE}: 1px;`);
  });

  it("keeps the retired literal as the floor for a render with no artifact", () => {
    // Every wire carries `, 1px`, so a skin loaded without a compiled artifact
    // paints exactly what it painted before the lot.
    const bare = cssFiles(SKIN_ROOT)
      .flatMap((file) => {
        const css = readFileSync(file, "utf8");
        return [...css.matchAll(/var\(--ds-edge-hairline-width(?:,\s*([^)]*))?\)/g)].map(
          (m) => ({ file, fallback: m[1]?.trim() })
        );
      })
      .filter((m) => m.fallback !== undefined && m.fallback !== "1px");
    expect(bare).toEqual([]);
  });
});

/* ------------------------------ mutation drill --------------------------- */

describe("modern skin edge vocabulary: the gate can go red", () => {
  const scan = (css: string): Category[] => {
    const file = join(SKIN_ROOT, "__mutation__.css");
    const decls = ((): Decl[] => {
      // reuse the real walker against an in-memory body
      const original = readFileSync;
      void original;
      return borderDeclarationsFrom(css, "__mutation__");
    })();
    void file;
    return decls.map(categorize);
  };

  function borderDeclarationsFrom(css: string, family: string): Decl[] {
    const { writeFileSync, rmSync, mkdtempSync } = require("node:fs") as typeof import("node:fs");
    const { tmpdir } = require("node:os") as typeof import("node:os");
    const dir = mkdtempSync(join(tmpdir(), "edge-mutation-"));
    const path = join(dir, "index.css");
    writeFileSync(path, css);
    try {
      return borderDeclarations(path, family);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it("flags a newly introduced bare keyline literal", () => {
    expect(scan(".x[data-part='panel'] { border: 1px solid var(--ds-color-border); }")).toEqual([
      "keyline",
    ]);
  });

  it("does NOT flag the wired form", () => {
    expect(
      scan(
        ".x[data-part='panel'] { border: var(--ds-edge-hairline-width, 1px) solid var(--ds-color-border); }"
      )
    ).toEqual([]);
  });

  it("holds each sanctioned class to its own reason", () => {
    expect(
      scan("@media (forced-colors: active) { .x { border: 1px solid ButtonText; } }")
    ).toEqual(["forced-colors"]);
    expect(scan(".x:focus-visible { border: 1px solid var(--ds-color-primary); }")).toEqual([
      "state-border",
    ]);
    expect(scan(".x[data-part='drag-grip'] { border: 1px solid var(--ds-color-border); }")).toEqual(
      ["affordance"]
    );
    expect(scan(".x[data-part='cell'] { border: 1px solid transparent; }")).toEqual([
      "transparent-reserve",
    ]);
  });

  it("sees through a comment carrying an apostrophe", () => {
    // A prose apostrophe must not desync the walk and swallow the next rule.
    expect(
      scan("/* the panel's frame */ .x[data-part='panel'] { border: 1px solid var(--ds-color-border); }")
    ).toEqual(["keyline"]);
  });
});
