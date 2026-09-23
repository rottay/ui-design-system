/**
 * @fileoverview Decrease-only census: loose `keydown` listeners outside the
 * keyboard kernel and the frozen engines.
 *
 * The keyboard owner is `ShortcutProvider`, mounted once by
 * `DesignSystemProvider`. A component that attaches its own `keydown` listener
 * to `document`/`window` bypasses it. Two cohorts are excluded by name, not by
 * omission: the kernel (the three owners that ARE the keyboard routing) and the
 * frozen Classic/Rustic engines, which take no new work. Everything else is
 * pinned file by file and may only shrink.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

const PACKAGE_ROOT = resolve(__dirname, "../../..");
const SRC_ROOT = join(PACKAGE_ROOT, "src");

const KERNEL = [
  "src/components/primitives/runtime/overlay/layer-stack/index.ts",
  "src/infrastructure/runtime/application/commands/runtime/registry/index.ts",
  "src/infrastructure/runtime/application/interaction/shortcuts/index.ts",
] as const;

const FROZEN_ENGINE = /[\\/]engines[\\/](?:classic|rustic)[\\/]/u;

const OWNER_WIDENING =
  "keyboard owner: a bubble-phase Escape subscription that does not force preventDefault and respects defaultPrevented (WO-EVI-02 trail)";

/**
 * The residual. A row leaves when its site subscribes through an owner; a row
 * is never added. The ceiling started at 8 and only moves down.
 */
const CEILING = 4;
const LOOSE_LEDGER: Readonly<Record<string, { reason: string; receiver: string }>> = {
  "src/components/patterns/customization/token-inspector/index.tsx": {
    reason: "one listener mixes the ctrl+shift+T chord with a no-prevent Escape that fires from text fields",
    receiver: OWNER_WIDENING,
  },
  "src/components/patterns/data/widget-board/engines/foundation/index.tsx": {
    reason: "Escape cancels an in-flight drag; not an escape-to-close layer",
    receiver: OWNER_WIDENING,
  },
  "src/components/patterns/visualization/charts/runtime/chart-engine/runtime/interaction/controller/index.ts": {
    reason: "Escape resets hover/pin state and yields to a handled key; not an escape-to-close layer",
    receiver: OWNER_WIDENING,
  },
  "src/components/surfaces/presentation/pages/workspace/collection-workspace/filter-dropdown/index.tsx": {
    reason: "yields to Escape a caller-supplied control already handled (defaultPrevented)",
    receiver: OWNER_WIDENING,
  },
};

/** Drained sites and the owner each now subscribes through. None may return. */
const DRAINED: Readonly<Record<string, string>> = {
  "src/components/patterns/communication/notification-center/engines/modern/index.tsx": "layer-stack onEscape (modal popover)",
  "src/components/patterns/navigation/environment-toggle/engines/modern/index.tsx": "layer-stack onEscape (modal dropdown)",
  "src/components/structures/workspace/export-button/index.tsx": "layer-stack onEscape (modal dropdown)",
  "src/components/structures/workspace/saved-views-menu/index.tsx": "layer-stack onEscape (modal dropdown)",
};

const TEST_OR_SUPPORT =
  /(?:^|[\\/])(?:tests?|__tests__|fixtures|__fixtures__|stories)[\\/]|\.(?:test|spec|stories)\.[cm]?tsx?$|\.d\.ts$/u;

function walk(root: string): string[] {
  if (!existsSync(root)) throw new Error(`census root is absent: ${root}`);
  const out: string[] = [];
  for (const name of readdirSync(root)) {
    const full = join(root, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/u.test(name)) out.push(full);
  }
  return out;
}

/** Number of `<x>.addEventListener('keydown', …)` calls in a source text. */
function countKeydownListeners(fileName: string, text: string): number {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
  let count = 0;
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "addEventListener"
    ) {
      const [first] = node.arguments;
      if (first && (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first)) && first.text === "keydown") {
        count += 1;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return count;
}

type Cohort = "kernel" | "frozen" | "loose";

function cohortOf(path: string): Cohort {
  if ((KERNEL as readonly string[]).includes(path)) return "kernel";
  if (FROZEN_ENGINE.test(path)) return "frozen";
  return "loose";
}

function census() {
  const rows: { path: string; sites: number; cohort: Cohort }[] = [];
  let scanned = 0;
  for (const file of walk(SRC_ROOT)) {
    const path = relative(PACKAGE_ROOT, file).split(sep).join("/");
    if (TEST_OR_SUPPORT.test(path)) continue;
    scanned += 1;
    const sites = countKeydownListeners(path, readFileSync(file, "utf8"));
    if (sites > 0) rows.push({ path, sites, cohort: cohortOf(path) });
  }
  return { rows, scanned };
}

describe("keyboard single owner: loose keydown census", () => {
  const { rows, scanned } = census();
  const loose = rows.filter((r) => r.cohort === "loose");

  it("scans a real corpus and still sees the kernel and the frozen cohort", () => {
    expect(scanned).toBeGreaterThan(1000);
    expect(rows.filter((r) => r.cohort === "kernel").map((r) => r.path).sort()).toEqual([...KERNEL].sort());
    expect(rows.filter((r) => r.cohort === "frozen").length).toBeGreaterThan(0);
  });

  const ledger = Object.keys(LOOSE_LEDGER);

  it("admits no loose keydown listener outside the ledger", () => {
    const added = loose.map((r) => r.path).filter((p) => !ledger.includes(p));
    expect(added, "subscribe through the keyboard owner (useGlobalShortcut) instead of attaching a keydown listener").toEqual([]);
  });

  it("drains the ledger when a site leaves (decrease-only)", () => {
    const present = new Set(loose.map((r) => r.path));
    const drained = ledger.filter((p) => !present.has(p));
    expect(drained, "remove the drained row from LOOSE_LEDGER").toEqual([]);
  });

  it("admits no second listener inside a ledger file", () => {
    expect(loose.filter((r) => r.sites !== 1).map((r) => r.path)).toEqual([]);
  });

  it("never grows past its ceiling", () => {
    expect(ledger.length).toBeLessThanOrEqual(CEILING);
    expect(ledger.filter((p) => p in DRAINED)).toEqual([]);
    expect(Object.values(LOOSE_LEDGER).every((row) => row.reason.length > 0 && row.receiver.length > 0)).toBe(true);
  });

  it("keeps every drained site on its owner", () => {
    const back = loose.map((r) => r.path).filter((p) => p in DRAINED);
    expect(back).toEqual([]);
    for (const path of Object.keys(DRAINED)) {
      expect(readFileSync(join(PACKAGE_ROOT, path), "utf8")).toMatch(/useOverlayLayer\(/u);
    }
  });

  it("counts calls, not text", () => {
    expect(countKeydownListeners("a.ts", "document.addEventListener('keydown', h);")).toBe(1);
    expect(countKeydownListeners("a.ts", "window.addEventListener(`keydown`, h, true);")).toBe(1);
    expect(countKeydownListeners("a.ts", "// document.addEventListener('keydown', h);")).toBe(0);
    expect(countKeydownListeners("a.ts", "document.removeEventListener('keydown', h);")).toBe(0);
    expect(countKeydownListeners("a.ts", "el.addEventListener('keyup', h);")).toBe(0);
    expect(cohortOf("src/components/primitives/feedback/modal/engines/rustic/index.tsx")).toBe("frozen");
    expect(cohortOf("src/components/primitives/feedback/modal/engines/modern/index.tsx")).toBe("loose");
  });
});
