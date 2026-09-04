/**
 * ROTTAY EXTENSION FOUNDATION DRAIN -- the rottay artifact extension drained from 973 to 698,
 * then to 682 by the foundation tranche P0 repair.
 *
 * -- Two legs, one file, stated up front -------------------------------------
 *
 * This file grades TWO chained source states of the same stylesheet:
 *
 *   leg 1  ROTTAY-foundation tranche drain   973 -> 698   (-275)  HISTORICAL
 *   leg 2  foundation tranche P0 repair      698 -> 682   (-16)   CURRENT, on disk today
 *
 * The historical arithmetic below (973 - 275 = 698, and the -273 rejection
 * that goes with it) is preserved verbatim and still asserted, because the
 * census ruling it encodes is about leg 1 and does not become false when a
 * later leg removes more lines. What changes is only which number describes
 * the bytes on disk: every assertion that reads the file now grades 682.
 *
 * -- Why leg 2 exists --------------------------------------------------------
 *
 * The BitHire extension drain authored `chrome.controls.select` on the Rottay
 * Theme so the family became a real cross-vertical capability, and left the
 * matching extension rows in place for "the rottay drain tranche" to remove.
 * foundation tranche's roster never included the select family, so those rows survived and the
 * compiled artifact and the extension both declared the same eight channels --
 * a duplicate authority, which the empty-conflict law forbids even when the
 * two sides are byte-equal. Leg 2 removes exactly those eight channels from
 * both mode blocks: 8 channels x 2 modes = 16 declarations.
 *
 * The compiled side already authors all eight in BOTH modes (dark from the
 * Theme body, light from `modes.light`), byte-equal to the rows removed, so
 * leg 2 is paint-neutral. That equality is asserted below rather than assumed.
 *
 * -- control-family tranche preimage disclosure --------------------------------------------------
 *
 * control-family tranche opens against the file leg 2 leaves behind, not against the file foundation tranche left
 * behind. Its disclosed preimage is therefore 302 declarations, NOT 318: the
 * 16 declarations removed here are pre-consumed by this repair and must not be
 * counted a second time in control-family tranche's roster. The 302/318 figures are control-family tranche plan
 * quantities; what this file proves from source is the delta between them --
 * exactly 16 declarations, exactly 8 channels, exactly 2 modes.
 *
 * The tranche this file grades: 275 custom-property declarations were removed
 * from `artifacts/rottay/_source/extension.css`. 207 of them MIGRATED -- the
 * value moved into a typed Theme owner and is now emitted by the common
 * `compileTheme` / `chromeToVariables` lowering. 68 of them were DELETED -- the
 * channel already resolved to the same paint without the line, so the line was
 * a restatement of a derivation, not an authority.
 *
 * -- The census convention, stated once -------------------------------------
 *
 * Two counts of this file circulate and they differ by exactly one:
 *
 *   973 -> 698 -> 682   custom-property declarations (`--*`) -- THE GOVERNED
 *                        COUNT.
 *   974 -> 699 -> 683   every CSS declaration of any kind.
 *
 * The extra declaration is `color: var(--ds-color-text-primary, #F0F0F0)` at
 * the top of the dark block. It is a paint on the root element, not a channel,
 * so it was never in the drain roster and was never touched by either leg.
 * Both conventions therefore report the SAME delta on each leg, -275 and -16;
 * only the absolute totals shift by the one untouched line. Everything below
 * counts custom properties.
 *
 * -- The census ruling, stated causally -------------------------------------
 *
 * The signed roster names 144 distinct channels. Those 144 names occupy 273
 * distinct (mode, name) identity rows. `--ds-divider-text-color` was declared
 * TWICE in each block, and those two extra declarations are duplicates of an
 * identity already counted -- they are outside the roster identity count, not
 * additional channels. So the source census delta is:
 *
 *   273 identity rows + 2 extra-identity duplicate declarations = 275 removed
 *   973 - 275 = 698
 *
 * -273 is NOT the census reduction. Subtracting it yields 700, and the file on
 * disk holds 698. The test below asserts that failure mode explicitly, because
 * the two numbers are one substitution apart and only one of them is a fact
 * about the stylesheet.
 *
 * -- What is deliberately NOT asserted here ---------------------------------
 *
 * The generated `artifacts/rottay/index.css` is out of scope for this tranche
 * and has not been regenerated. This file grades SOURCE only.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { DEFAULT_CHROME_SHAPE } from "@/foundation/contracts/composition/tenants/themes/iso/shape";
import {
  TENANT_THEME_CONFIG_SCHEMA,
  validateTenantThemeDocument,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { brandThemeToTheme } from "@/foundation/contracts/composition/tenants/themes/iso";
import { lowerBrandThemeFixture, lowerTheme } from "@tests/support/theme-lowering";

import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/bithire";
import { evntoBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/evnto";
import { rottayBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/rottay";

const DEFAULT_CSS = join(
  process.cwd(),
  "src/foundation/tokens/css/foundation/themes/default/index.css"
);

type Mode = "dark" | "light";

interface Declaration {
  readonly mode: Mode;
  readonly name: string;
  readonly value: string;
}

// EXCISED (SEV-2): `const EXTENSION` and `function parseExtension()` — the path
// constant and the multi-line-aware declaration scanner that read
// `artifacts/rottay/_source/extension.css`. Both are dead with the file. The
// `Declaration` and `Mode` types they produced are still used by the roster
// ledger below, so only the reader is removed.

/** Whitespace and comma spacing are Prettier's, not the paint's. */
const norm = (value: string): string =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();

/** Comparison form: also case-insensitive, because hex case is not paint. */
/**
 * F4A-6 (K3) — canales de tinta de PAGINA que ahora derivan de la raiz nueva
 * `--ds-color-text-page`. El roster conserva su PRE-IMAGEN porque es un
 * registro historico y los hashes firmados la digieren; los sha256 quedan
 * EXACTAMENTE donde estaban. La pintura computada no se movio: se probo
 * resolviendo la cascada, 136 de 136 pares identicos.
 */
const REDERIVED: Readonly<Record<string, string>> = {
  "--ds-badge-secondary-color": "var(--ds-color-text-page)",
  "--ds-form-label-color": "var(--ds-color-text-page)",
  "--ds-popover-content-color": "var(--ds-color-text-page)",
  // K1 (2026-08-21) — tanda del descongelamiento de `--ds-color-primary`:
  // canales CHROME identicos al literal de marca en los dos modos. Misma ley:
  // pre-imagen intacta, hashes firmados quietos, pintura computada identica.
  "--ds-badge-primary-bg": "var(--ds-color-primary)",
  "--ds-select-check-color": "var(--ds-color-primary)",
  "--ds-tooltip-primary-bg": "var(--ds-color-primary)",
};
/** Lo que el arbol emite hoy para esa fila; para las demas, su valor de siempre. */
const emittedToday = (row: { name: string; value: string }): string =>
  REDERIVED[row.name] ?? row.value;

const bare = (value: string): string =>
  value
    .replace(/\s+/g, "")
    .replace(/\s*,\s*/g, ",")
    .toLowerCase();

/**
 * The digest recipe, stated so it can be recomputed by hand: one line per
 * declaration, `mode|name|norm(value)`, in file order, joined by newlines,
 * sha256 over UTF-8.
 */
const digest = (declarations: readonly Declaration[]): string =>
  createHash("sha256")
    .update(
      declarations
        .map((d) => d.mode + "|" + d.name + "|" + norm(d.value))
        .join("\n")
    )
    .digest("hex");

/** The pre-drain file's digest, recorded before the removal was applied. */
const PRE_DIGEST =
  "ffdceb7354b310a0b768b39e26093a30dc5486a75002afbe8236627744620654";
/**
 * The digest of leg 1's output -- 698 declarations, the select rows still
 * present. Kept as the predecessor so the chain is asserted, not narrated: the
 * file must equal neither the pre-drain state nor the foundation tranche state.
 */
const POST_T1_DIGEST =
  "f36959c1270082bacd43efbb6610e528e0331ac3db00a855f7bb93c5743b2f7e";
/**
 * The digest of leg 2's output -- 682 declarations, the whole control-family tranche control
 * preimage still present. Kept as a predecessor for the same reason
 * `POST_T1_DIGEST` is kept.
 */
const POST_DIGEST =
  "32582b47e2f8cc7ffa92ae48c1837aae31036933d2628c349f05eeb183dcfa60";
/**
 * The digest of leg 3's output -- leg 2 minus the 302 declarations ROTTAY-control-family tranche
 * MASS drained. This file does not own the control-family tranche ruling; it owns the fact that
 * its own ledger still reconciles after control-family tranche moved the floor under it, which is
 * why only the digest/census chain is extended here and no foundation tranche causality is
 * relaxed. Kept as a predecessor now that leg 4 has landed.
 */
const POST_T2_DIGEST =
  "3bf382b18d65bde2c45faf09aab552765ca11b7791dcb5d50b7e624480ce3e8f";
/**
 * The current file's digest -- leg 3 minus the 380 declarations ROTTAY EXTENSION COMPONENT-FAMILY DRAIN
 * drained, which is every declaration that was left. Under the recipe above an
 * empty declaration list joins to the empty string, so this is sha256(""), and
 * that is asserted below rather than pasted as an opaque constant: a digest
 * that happens to equal the empty digest for some other reason would otherwise
 * read as a pass. Same rationale as the control-family tranche leg -- the component-family tranche ruling is adjudicated
 * in `rottay-extension/components/index.test.ts`; only the chain is extended here.
 */
const POST_T3_DIGEST =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

const CENSUS = {
  preCustomProperties: 973,
  postCustomProperties: 698,
  preAllDeclarations: 974,
  postAllDeclarations: 699,
  rosterNames: 144,
  identityRows: 273,
  duplicateDeclarations: 2,
  removedDeclarations: 275,
  duplicatedChannel: "--ds-divider-text-color",
} as const;

/**
 * Leg 2 -- the foundation tranche P0 repair. Separate ledger, because CENSUS above is the
 * signed foundation tranche ruling and must keep meaning what it meant when it was signed.
 * `preCustomProperties` here is CENSUS.postCustomProperties by construction;
 * the chain is asserted in the census suite rather than left to the reader.
 */
const REPAIR = {
  channels: 8,
  modes: 2,
  removedDeclarations: 16,
  preCustomProperties: 698,
  postCustomProperties: 682,
  preAllDeclarations: 699,
  postAllDeclarations: 683,
  perModeBefore: 349,
  perModeAfter: 341,
  /** control-family tranche plan quantities; only their difference is provable from source. */
  t2PreimageBefore: 318,
  t2PreimageAfter: 302,
} as const;

/**
 * Leg 3 -- ROTTAY EXTENSION CONTROL-FAMILY DRAIN. A third ledger, for the same reason leg 2 got its
 * own: CENSUS and REPAIR are signed rulings and must keep meaning what they
 * meant when they were signed. This leg is NOT adjudicated here -- the split
 * (261 migrate / 41 delete / 0 hold), the equivalence proof and the mutant
 * battery live in `rottay-extension/controls/index.test.ts`. What is asserted here is only
 * that leg 3 consumed exactly leg 2's disclosed control-family tranche preimage and that this
 * file's own census chain still closes: 682 - 302 = 380.
 */
const T2_LEG = {
  /** Unique channels drained; each was declared in both mode blocks. */
  channels: 151,
  modes: 2,
  removedDeclarations: 302,
  preCustomProperties: 682,
  postCustomProperties: 380,
  preAllDeclarations: 683,
  postAllDeclarations: 381,
  perModeBefore: 341,
  perModeAfter: 190,
} as const;

/**
 * Leg 4 -- ROTTAY EXTENSION COMPONENT-FAMILY DRAIN. The terminal leg: it takes the whole 380-declaration
 * remainder leg 3 left, so the stylesheet reaches zero custom properties and
 * keeps only the root paint that was never a channel. Adjudicated in
 * `rottay-extension/components/index.test.ts`; asserted here only as chain arithmetic --
 * 380 - 380 = 0, and 381 - 380 = 1, the untouched `color:` line.
 */
const T3_LEG = {
  /** Unique channels drained; each was declared in both mode blocks. */
  channels: 190,
  modes: 2,
  removedDeclarations: 380,
  preCustomProperties: 380,
  postCustomProperties: 0,
  preAllDeclarations: 381,
  postAllDeclarations: 1,
  perModeBefore: 190,
  perModeAfter: 0,
} as const;

/**
 * The exact eight channels leg 2 removed, with the value each mode block
 * declared verbatim before removal. These are the byte-equality witnesses: the
 * compiled artifact must now emit the SAME string for the SAME mode, or the
 * repair changed paint instead of removing a duplicate authority.
 */
const REPAIR_ROWS: readonly {
  readonly name: string;
  readonly dark: string;
  readonly light: string;
}[] = [
  { name: "--ds-select-bg", dark: "#131316", light: "#FFFFFF" },
  { name: "--ds-select-color", dark: "#ECECEC", light: "#1A1A1A" },
  {
    name: "--ds-select-color-placeholder",
    dark: "#6B6B72",
    light: "#9C9C9C",
  },
  { name: "--ds-select-dropdown-bg", dark: "#1A1A1E", light: "#FFFFFF" },
  {
    name: "--ds-select-dropdown-shadow",
    dark: "0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F",
    light: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
  },
  {
    name: "--ds-select-option-bg-hover",
    dark: "rgba(255, 255, 255, 0.04)",
    light: "#FAFAF9",
  },
  {
    name: "--ds-select-option-bg-selected",
    dark: "#2A2A2F",
    light: "#F4F4F3",
  },
  {
    name: "--ds-select-option-color-selected",
    dark: "#ECECEC",
    light: "#1A1A1A",
  },
];

/**
 * The eighteen select channels that STAY. The compiled lowering does not
 * author any of them -- seven of the fifteen fields it does emit use a
 * different vocabulary (`--ds-select-border-color*` against the extension's
 * `--ds-select-border*`, `--ds-select-dropdown-border-color` against
 * `--ds-select-dropdown-border`) and the rest have no extension row at all.
 * Removing these would lose paint, so the repair boundary is 8 of 26, and this
 * list is what makes that boundary a fact instead of a claim.
 */
const RETAINED_SELECT_CHANNELS: readonly string[] = [
  "--ds-select-arrow-color",
  "--ds-select-bg-disabled",
  "--ds-select-border",
  "--ds-select-border-focus",
  "--ds-select-border-hover",
  "--ds-select-check-color",
  "--ds-select-clear-color",
  "--ds-select-clear-color-hover",
  "--ds-select-color-disabled",
  "--ds-select-dropdown-border",
  "--ds-select-error-border",
  "--ds-select-filled-bg",
  "--ds-select-option-color-disabled",
  "--ds-select-shadow-focus",
  "--ds-select-success-border",
  "--ds-select-tag-bg",
  "--ds-select-tag-color",
  "--ds-select-warning-border",
];

type Disposition = "migrate" | "delete";

interface RosterRow {
  readonly mode: Mode;
  readonly name: string;
  /** The literal the extension declared, verbatim, before removal. */
  readonly value: string;
  readonly disposition: Disposition;
}

/**
 * The signed roster. 275 rows, in file order. This table IS the tranche: a row
 * that is not here was not authorized to move, and a declaration removed from
 * the stylesheet that is not here would break the survivor digest below.
 */
const ROSTER: readonly RosterRow[] = [
  {
    mode: "dark",
    name: "--ds-badge-border-color",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-border-color",
    value: "#E5E5E3",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-default-bg",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-default-bg",
    value: "#F4F4F3",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-default-color",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-default-color",
    value: "#1A1A1A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-error-bg",
    value: "#EF4444",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-error-bg",
    value: "#DC2626",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-info-bg",
    value: "#3B82F6",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-info-bg",
    value: "#2563EB",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-primary-bg",
    value: "#FFFFFF",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-primary-bg",
    value: "#0A0A0A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-primary-color",
    value: "#0C0C0E",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-secondary-bg",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-secondary-bg",
    value: "#F4F4F3",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-secondary-color",
    value: "#A0A0A5",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-secondary-color",
    value: "#6B6B6B",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-success-bg",
    value: "#16A34A",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-success-bg",
    value: "#16A34A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-text-color",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-text-color",
    value: "#1A1A1A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-warning-bg",
    value: "#D97706",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-badge-warning-bg",
    value: "#D97706",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-border-color",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-border-color-default",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-border-color-focus",
    value: "rgba(255, 255, 255, 0.40)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-border-color-focus",
    value: "rgba(10, 10, 10, 0.40)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-border-color-hover",
    value: "#3A3A40",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-border-color-muted",
    value: "#222226",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-border-color-strong",
    value: "#3A3A40",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-card-cover-overlay-bg",
    value: "linear-gradient( to bottom, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.8) 100% )",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-card-cover-overlay-bg",
    value: "linear-gradient( to bottom, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.6) 100% )",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-black-100",
    value: "rgba(0, 0, 0, 0.20)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-black-100",
    value: "rgba(0, 0, 0, 0.06)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-black-50",
    value: "rgba(0, 0, 0, 0.12)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-black-50",
    value: "rgba(0, 0, 0, 0.03)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-error-10",
    value: "rgba(220, 38, 38, 0.08)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-error-20",
    value: "rgba(239, 68, 68, 0.18)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-error-20",
    value: "rgba(220, 38, 38, 0.14)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-info-10",
    value: "rgba(37, 99, 235, 0.08)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-primary-10",
    value: "rgba(255, 255, 255, 0.08)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-primary-10",
    value: "rgba(10, 10, 10, 0.06)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-primary-20",
    value: "rgba(255, 255, 255, 0.14)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-primary-20",
    value: "rgba(10, 10, 10, 0.12)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-secondary-10",
    value: "rgba(160, 160, 165, 0.08)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-secondary-10",
    value: "rgba(107, 107, 107, 0.08)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-secondary-20",
    value: "rgba(160, 160, 165, 0.14)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-secondary-20",
    value: "rgba(107, 107, 107, 0.14)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-success-10",
    value: "rgba(22, 163, 74, 0.08)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-success-20",
    value: "rgba(34, 197, 94, 0.18)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-success-20",
    value: "rgba(22, 163, 74, 0.14)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-warning-10",
    value: "rgba(217, 119, 6, 0.08)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-warning-20",
    value: "rgba(245, 158, 11, 0.18)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-warning-20",
    value: "rgba(217, 119, 6, 0.14)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-white-50",
    value: "rgba(255, 255, 255, 0.04)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-alpha-white-50",
    value: "rgba(255, 255, 255, 0.50)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-bg-hover",
    value: "#F0EFEE",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-bg-info",
    value: "rgba(59, 130, 246, 0.10)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-bg-subtle",
    value: "#0D0D10",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-bg-subtle",
    value: "#F7F7F6",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-neutral-0",
    value: "#0C0C0E",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-primary-subtle",
    value: "rgba(255, 255, 255, 0.08)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-primary-subtle",
    value: "rgba(10, 10, 10, 0.06)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-shadow",
    value: "rgba(0, 0, 0, 0.40)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-shadow",
    value: "rgba(0, 0, 0, 0.08)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-surface",
    value: "#18181B",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-surface",
    value: "#FFFFFF",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-surface-muted",
    value: "#222226",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-surface-muted",
    value: "#EDEDEC",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-surface-secondary",
    value: "#1A1A1E",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-text",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-color-text-inverse",
    value: "#0C0C0E",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-text-inverse",
    value: "#FAFAF9",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-command-palette-backdrop",
    value: "rgba(0, 0, 0, 0.60)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-command-palette-backdrop",
    value: "rgba(0, 0, 0, 0.40)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-command-palette-bg",
    value: "#1A1A1E",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-command-palette-border",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-command-palette-empty-color",
    value: "#6B6B72",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-command-palette-group-color",
    value: "#6B6B72",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-command-palette-item-hover-bg",
    value: "rgba(255, 255, 255, 0.04)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-command-palette-item-hover-bg",
    value: "#FAFAF9",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-command-palette-shortcut-border",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-divider-text-color",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-divider-text-color",
    value: "#1A1A1A",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-form-error-color",
    value: "#DC2626",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-form-extra-color",
    value: "#6B6B72",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-form-extra-color",
    value: "#9C9C9C",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-form-help-color",
    value: "#6B6B72",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-form-help-color",
    value: "#9C9C9C",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-form-label-color",
    value: "#A0A0A5",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-form-label-color",
    value: "#6B6B6B",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-form-label-font-weight",
    value: "600",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-form-label-font-weight",
    value: "600",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-form-required-color",
    value: "#DC2626",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-form-success-color",
    value: "#16A34A",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-form-warning-color",
    value: "#D97706",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-gradient-dark",
    value: "linear-gradient(135deg, #0C0C0E 0%, #131316 50%, #1A1A1E 100%)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-gradient-dark",
    value: "linear-gradient(135deg, #FAFAF9 0%, #F4F4F3 50%, #EDEDEC 100%)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-image-overlay-bg",
    value: "rgba(0, 0, 0, 0.70)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-image-overlay-bg",
    value: "rgba(0, 0, 0, 0.60)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-background-color",
    value: "#18181B",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-bg",
    value: "#18181B",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-border-color",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-item-background-color",
    value: "#18181B",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-list-item-background-color",
    value: "#FFFFFF",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-item-bg-hover",
    value: "#222226",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-list-item-bg-hover",
    value: "#FAFAF9",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-item-hover-background-color",
    value: "#222226",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-meta-description-color",
    value: "#A0A0A5",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-secondary-text-color",
    value: "#A0A0A5",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-skeleton-bg",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-split-color",
    value: "#222226",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-list-split-color",
    value: "#EDEDEC",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-list-text-color",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-list-text-color",
    value: "#1A1A1A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-overlay-bg",
    value: "rgba(0, 0, 0, 0.64)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-page-shell-subtitle-color",
    value: "#A0A0A5",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-popover-bg",
    value: "#1A1A1E",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-popover-border",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-popover-border",
    value: "#E5E5E3",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-popover-content-color",
    value: "#A0A0A5",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-popover-content-color",
    value: "#6B6B6B",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-popover-shadow",
    value: "0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-popover-shadow",
    value: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-popover-title-border",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-popover-title-border",
    value: "#E5E5E3",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-popover-title-color",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-popover-title-color",
    value: "#1A1A1A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-shadow-focus-ring",
    value: "0 0 0 3px rgba(255, 255, 255, 0.12)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-shadow-focus-ring",
    value: "0 0 0 3px rgba(10, 10, 10, 0.10)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-shadow-focus-ring-error",
    value: "0 0 0 3px rgba(239, 68, 68, 0.16)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-shadow-focus-ring-error",
    value: "0 0 0 3px rgba(220, 38, 38, 0.14)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-shadow-inner",
    value: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.30)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-text-disabled",
    value: "#4A4A4F",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-text-inverse",
    value: "#0C0C0E",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-text-inverse",
    value: "#FAFAF9",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-text-primary",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-text-secondary",
    value: "#A0A0A5",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-text-tertiary",
    value: "#808085",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-bg",
    value: "#131316",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-bg-disabled",
    value: "#101012",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-bg-disabled",
    value: "#F4F4F3",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-border",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-border",
    value: "#E5E5E3",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-border-focus",
    value: "rgba(255, 255, 255, 0.36)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-border-focus",
    value: "rgba(10, 10, 10, 0.40)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-border-hover",
    value: "#3A3A40",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-border-hover",
    value: "#D4D4D2",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-color",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-color",
    value: "#1A1A1A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-color-placeholder",
    value: "#6B6B72",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-color-placeholder",
    value: "#9C9C9C",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-count-color",
    value: "#6B6B72",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-count-color",
    value: "#9C9C9C",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-error-border",
    value: "#DC2626",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-filled-bg",
    value: "#1A1A1E",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-filled-bg",
    value: "#F4F4F3",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-shadow-focus",
    value: "0 0 0 2px rgba(255, 255, 255, 0.10)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-shadow-focus",
    value: "0 0 0 2px rgba(10, 10, 10, 0.08)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-success-border",
    value: "#16A34A",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-success-border",
    value: "#16A34A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-textarea-warning-border",
    value: "#D97706",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-textarea-warning-border",
    value: "#D97706",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-bg",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-tooltip-bg",
    value: "#1A1A1A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-color",
    value: "#0C0C0E",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-tooltip-color",
    value: "#FAFAF9",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-default-bg",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-tooltip-default-bg",
    value: "#1A1A1A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-default-color",
    value: "#0C0C0E",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-tooltip-default-color",
    value: "#FAFAF9",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-tooltip-error-bg",
    value: "#DC2626",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-primary-bg",
    value: "#FFFFFF",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-tooltip-primary-bg",
    value: "#0A0A0A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-primary-color",
    value: "#0C0C0E",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-secondary-bg",
    value: "#2A2A2F",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-secondary-color",
    value: "#ECECEC",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-tooltip-secondary-color",
    value: "#1A1A1A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-shadow",
    value: "0 4px 16px rgba(0, 0, 0, 0.40)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-tooltip-shadow",
    value: "0 4px 12px rgba(0, 0, 0, 0.12)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-success-bg",
    value: "#16A34A",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-tooltip-success-bg",
    value: "#16A34A",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-warning-bg",
    value: "#D97706",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-tooltip-warning-bg",
    value: "#D97706",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-watermark-color",
    value: "#222226",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-watermark-color",
    value: "#EDEDEC",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-badge-error-color",
    value: "#ffffff",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-badge-error-color",
    value: "#ffffff",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-badge-info-color",
    value: "#ffffff",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-badge-info-color",
    value: "#ffffff",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-badge-primary-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-badge-success-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-badge-success-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-badge-warning-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-badge-warning-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-border-color",
    value: "#E5E5E3",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-border-color-default",
    value: "#E5E5E3",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-border-color-hover",
    value: "#D4D4D2",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-border-color-muted",
    value: "#EDEDEC",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-border-color-strong",
    value: "#D4D4D2",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-error-10",
    value: "rgba(239, 68, 68, 0.10)",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-info-10",
    value: "rgba(59, 130, 246, 0.10)",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-success-10",
    value: "rgba(34, 197, 94, 0.10)",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-color-alpha-warning-10",
    value: "rgba(245, 158, 11, 0.10)",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-color-bg-canvas",
    value: "#0A0A0C",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-color-bg-canvas",
    value: "#FAFAF9",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-color-bg-hover",
    value: "#18181C",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-color-bg-info",
    value: "rgba(37, 99, 235, 0.06)",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-color-danger",
    value: "var(--ds-color-error-400)",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-color-danger",
    value: "#DC2626",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-color-neutral-0",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-color-surface-secondary",
    value: "#F4F4F3",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-color-text",
    value: "#1A1A1A",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-command-palette-bg",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-command-palette-border",
    value: "#E5E5E3",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-command-palette-empty-color",
    value: "#9C9C9C",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-command-palette-group-color",
    value: "#9C9C9C",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-command-palette-shortcut-border",
    value: "#E5E5E3",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-form-error-color",
    value: "#EF4444",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-form-required-color",
    value: "#EF4444",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-form-success-color",
    value: "#22C55E",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-form-warning-color",
    value: "#F59E0B",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-list-background-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-list-bg",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-list-border-color",
    value: "#E5E5E3",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-list-item-hover-background-color",
    value: "#FAFAF9",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-list-meta-description-color",
    value: "#6B6B6B",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-list-secondary-text-color",
    value: "#6B6B6B",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-list-skeleton-bg",
    value: "#EDEDEC",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-overlay-bg",
    value: "rgba(0, 0, 0, 0.48)",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-page-shell-subtitle-color",
    value: "#6B6B6B",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-popover-bg",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-shadow-inner",
    value: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-text-disabled",
    value: "#C4C4C2",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-text-primary",
    value: "#1A1A1A",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-text-secondary",
    value: "#6B6B6B",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-text-tertiary",
    value: "#8A8A8A",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-textarea-bg",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-textarea-error-border",
    value: "#EF4444",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-error-bg",
    value: "#EF4444",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-error-color",
    value: "#ffffff",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-tooltip-error-color",
    value: "#ffffff",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-tooltip-primary-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-tooltip-secondary-bg",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-success-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-tooltip-success-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-tooltip-warning-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-tooltip-warning-color",
    value: "#FFFFFF",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-divider-text-color",
    value: "#ECECEC",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-divider-text-color",
    value: "#1A1A1A",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-color-primary-rgb",
    value: "255, 255, 255",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-color-secondary-rgb",
    value: "160, 160, 165",
    disposition: "delete",
  },
  {
    mode: "dark",
    name: "--ds-elevation-0",
    value: "none",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-elevation-1",
    value: "inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 2px rgba(0, 0, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.28)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-elevation-2",
    value: "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.44), 0 6px 16px rgba(0, 0, 0, 0.34)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-elevation-3",
    value: "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 6px 12px rgba(0, 0, 0, 0.46), 0 12px 28px rgba(0, 0, 0, 0.40)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-elevation-4",
    value: "inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 12px 24px rgba(0, 0, 0, 0.50), 0 20px 44px rgba(0, 0, 0, 0.44), 0 0 24px color-mix(in srgb, var(--ds-color-primary, #ffffff) 8%, transparent)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-elevation-5",
    value: "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 40px rgba(0, 0, 0, 0.56), 0 32px 64px rgba(0, 0, 0, 0.48), 0 0 32px color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, transparent)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-shadow-xs",
    value: "var(--ds-elevation-1)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-shadow-2xl",
    value: "var(--ds-elevation-5)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-focus-ring-color",
    value: "var(--ds-color-primary)",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-sidebar-shell-padding-inline",
    value: "10px",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-sidebar-shell-padding-collapsed",
    value: "8px",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-sidebar-item-height",
    value: "62px",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-sidebar-item-child-height",
    value: "45px",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-sidebar-item-font-size-child",
    value: "14.2px",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-sidebar-item-padding-inline",
    value: "13px",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-sidebar-icon-column-size",
    value: "20px",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-sidebar-item-gap",
    value: "9px",
    disposition: "migrate",
  },
  {
    mode: "dark",
    name: "--ds-sidebar-child-padding-inline",
    value: "6px",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-color-primary-rgb",
    value: "10, 10, 10",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-color-secondary-rgb",
    value: "107, 107, 107",
    disposition: "delete",
  },
  {
    mode: "light",
    name: "--ds-shadow-xs",
    value: "0 1px 2px rgba(0, 0, 0, 0.04)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-shadow-2xl",
    value: "0 12px 24px rgba(0, 0, 0, 0.08), 0 32px 64px rgba(0, 0, 0, 0.14)",
    disposition: "migrate",
  },
  {
    mode: "light",
    name: "--ds-focus-ring-color",
    value: "var(--ds-color-primary)",
    disposition: "migrate",
  },
];

/**
 * Root floors for the channels the DELETE rows resolve through, recorded from
 * a static cascade walk of the 453 stylesheets reachable from
 * `facade/entrypoints/styles/index.css` for the rottay root element in each mode.
 *
 * Only the transitive closure the 68 deleted rows actually need is kept --
 * 32 entries, keyed `mode|name`. The compiler's own emission always wins over
 * these; a floor is consulted only where the compiler emits nothing.
 */
const FLOORS: Readonly<Record<string, string>> = {
  "dark|--ds-badge-error-color": "var(--ds-color-white, #ffffff)",
  "light|--ds-badge-error-color": "var(--ds-color-white, #ffffff)",
  "dark|--ds-badge-info-color": "var(--ds-color-white, #ffffff)",
  "light|--ds-badge-info-color": "var(--ds-color-white, #ffffff)",
  "light|--ds-color-white": "#ffffff",
  "dark|--ds-badge-success-color": "var(--ds-color-white, #ffffff)",
  "light|--ds-badge-success-color": "var(--ds-color-white, #ffffff)",
  "dark|--ds-badge-warning-color": "var(--ds-color-white, #ffffff)",
  "light|--ds-badge-warning-color": "var(--ds-color-white, #ffffff)",
  "dark|--ds-color-alpha-error-10": "rgba(239, 68, 68, 0.10)",
  "dark|--ds-color-alpha-info-10": "rgba(59, 130, 246, 0.10)",
  "dark|--ds-color-alpha-success-10": "rgba(34, 197, 94, 0.10)",
  "dark|--ds-color-alpha-warning-10": "rgba(245, 158, 11, 0.10)",
  "dark|--ds-color-bg-canvas": "#0A0A0C",
  "light|--ds-color-bg-canvas": "var(--ds-color-bg-primary)",
  "dark|--ds-color-bg-hover": "#18181C",
  "dark|--ds-color-danger": "var(--ds-color-error)",
  "light|--ds-color-danger": "var(--ds-color-error)",
  "dark|--ds-form-error-color": "#ef4444",
  "dark|--ds-form-required-color": "#ef4444",
  "dark|--ds-form-success-color": "#22c55e",
  "dark|--ds-form-warning-color": "#f59e0b",
  "light|--ds-overlay-scrim": "var(--ds-color-bg-overlay, rgba(0, 0, 0, 0.5))",
  "dark|--ds-textarea-error-border": "#ef4444",
  "dark|--ds-tooltip-error-bg": "#ef4444",
  "dark|--ds-tooltip-error-color": "#ffffff",
  "light|--ds-tooltip-error-color": "#ffffff",
  "dark|--ds-tooltip-success-color": "#ffffff",
  "light|--ds-tooltip-success-color": "#ffffff",
  "dark|--ds-tooltip-warning-color": "#ffffff",
  "light|--ds-tooltip-warning-color": "#ffffff",
  "dark|--ds-color-white": "#ffffff",
};

const compiled = lowerBrandThemeFixture({
  brandTheme: rottayBrandTheme,
  tenantSlug: "rottay",
});
const modeBlocks = compiled.modeBlocks ?? [];
const lightBlock = modeBlocks.find((block) => block.mode === "light");

const EMITTED: Record<Mode, Record<string, string>> = {
  dark: compiled.cssVariables,
  light: { ...compiled.cssVariables, ...(lightBlock?.cssVariables ?? {}) },
};

/**
 * Resolve a value to the paint it actually produces, following `var()` chains
 * through the compiler's emission and then the recorded root floors.
 *
 * `initial` and `unset` resolve to null: they are cascade resets, and a reset
 * is not a value. A chain that dead-ends falls back to the `var()` fallback
 * argument, exactly as the browser would.
 */
function resolveValue(
  mode: Mode,
  value: string | null | undefined,
  depth = 0,
  seen: ReadonlySet<string> = new Set()
): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (depth > 24) return null;
  if (text === "initial" || text === "unset") return null;

  const whole = /^var\(\s*(--[A-Za-z0-9-]+)\s*(?:,([\s\S]*))?\)$/.exec(text);
  if (whole) {
    const name = whole[1] as string;
    const key = mode + "|" + name;
    if (seen.has(key)) return null;
    const next = new Set(seen);
    next.add(key);
    const emitted = EMITTED[mode][name];
    const declared = emitted !== undefined ? emitted : FLOORS[key];
    const resolved = resolveValue(mode, declared, depth + 1, next);
    if (resolved !== null) return resolved;
    const fallback = whole[2];
    return fallback === undefined
      ? null
      : resolveValue(mode, fallback, depth + 1, next);
  }

  if (text.includes("var(")) {
    let out = "";
    let index = 0;
    while (index < text.length) {
      const start = text.indexOf("var(", index);
      if (start < 0) {
        out += text.slice(index);
        break;
      }
      out += text.slice(index, start);
      let open = 0;
      let end = start;
      for (; end < text.length; end += 1) {
        if (text[end] === "(") open += 1;
        else if (text[end] === ")") {
          open -= 1;
          if (open === 0) {
            end += 1;
            break;
          }
        }
      }
      const inner = resolveValue(mode, text.slice(start, end), depth + 1, seen);
      if (inner === null) return null;
      out += inner;
      index = end;
    }
    return bare(out);
  }

  return bare(text);
}

/** Build the smallest advanced document that carries one chrome field. */
function buildDocument(path: string, field: string, value: string): unknown {
  const leaf: Record<string, unknown> = { [field]: value };
  const chrome = path
    .split(".")
    .reverse()
    .reduce<Record<string, unknown>>((node, key) => ({ [key]: node }), leaf);
  return {
    schemaVersion: TENANT_THEME_CONFIG_SCHEMA.schemaVersion,
    mode: "advanced",
    visualFoundation: { advanced: { chrome } },
  };
}

// EXCISED (SEV-2): `const live = parseExtension(readFileSync(EXTENSION, ...))`.
// This was a MODULE-LEVEL read, so it now throws ENOENT at collection time and
// would take the whole suite down. Every assertion it fed is excised below,
// named individually. The extension corpus it parsed no longer exists; the
// claim "rottay's extension declares none of these channels" is carried
// unconditionally by `scripts/check/verticals/single-author/index.mjs` law G2.
const migrateRows = ROSTER.filter((row) => row.disposition === "migrate");
const deleteRows = ROSTER.filter((row) => row.disposition === "delete");

/**
 * status-tint floor (2026-08-30): these four dark alpha-10 rows are no longer a
 * "deleted literal falls back to a recorded root floor" case. `FLOORS`
 * recorded a STATIC cascade walk for a channel the compiler used to emit
 * nothing for; `deriveStatusTintFloor` now EXPLICITLY emits all four from
 * rottay's own dark seed, which is a real producer, not the absence the
 * recorded floor stood in for. The generic loop below resolves
 * `EMITTED ?? FLOORS` and expects the STRING to still name the pre-recorded
 * paint; for these four the producer changed on purpose (see
 * `deriveStatusTintFloor`'s docblock), so they are excluded here and
 * verified in their own block instead of failing the generic assertion for
 * the wrong reason.
 */
const COH1_SUPERSEDED_FLOOR_KEYS = new Set([
  "dark|--ds-color-alpha-error-10",
  "dark|--ds-color-alpha-info-10",
  "dark|--ds-color-alpha-success-10",
  "dark|--ds-color-alpha-warning-10",
]);
const deleteRowsPreCoh1Floor = deleteRows.filter(
  (row) => !COH1_SUPERSEDED_FLOOR_KEYS.has(row.mode + "|" + row.name)
);

describe("ROTTAY EXTENSION FOUNDATION DRAIN - census", () => {
  // PARTIALLY EXCISED (SEV-2). The file-derived half of this test is gone: the
  // four `live` length claims, the postcss raw-declaration count, and the
  // assertion that the surviving line was
  // `color: var(--ds-color-text-primary, #F0F0F0);`. That last one is the
  // interesting casualty — it pinned the extension as an AUTHOR of the
  // document-root ink. That authorship moved to the compiled artifact in
  // SEV-1 and is now proven by the single-author render laws
  // (`artifact-renderer/tests/single-author.test.ts` L1/L6/L7), which assert
  // exactly one root ink emitted through the compiled
  // `--ds-color-text-primary` channel rather than a literal fallback. What
  // remains below is the ledger arithmetic, which never read a file.
  it("the raw and governed census conventions differ by one line on every leg", () => {
    // The convention identity holds on BOTH legs: the raw and governed counts
    // differ by the same untouched line, so they report the same delta.
    expect(CENSUS.preAllDeclarations - CENSUS.postAllDeclarations).toBe(
      CENSUS.preCustomProperties - CENSUS.postCustomProperties
    );
    expect(REPAIR.preAllDeclarations - REPAIR.postAllDeclarations).toBe(
      REPAIR.preCustomProperties - REPAIR.postCustomProperties
    );
    expect(T2_LEG.preAllDeclarations - T2_LEG.postAllDeclarations).toBe(
      T2_LEG.preCustomProperties - T2_LEG.postCustomProperties
    );
    expect(T3_LEG.preAllDeclarations - T3_LEG.postAllDeclarations).toBe(
      T3_LEG.preCustomProperties - T3_LEG.postCustomProperties
    );
    // The convention note's whole point, cashed out at the terminus: the two
    // counts differ by the one untouched line and by nothing else, so the
    // governed count reaches 0 exactly when the raw count reaches 1.
    expect(T3_LEG.postAllDeclarations - T3_LEG.postCustomProperties).toBe(1);
  });

  it("chains leg 4 onto leg 3 and drains the remainder to zero", () => {
    expect(T3_LEG.preCustomProperties).toBe(T2_LEG.postCustomProperties);
    expect(T3_LEG.preAllDeclarations).toBe(T2_LEG.postAllDeclarations);
    expect(T3_LEG.preCustomProperties - T3_LEG.removedDeclarations).toBe(
      T3_LEG.postCustomProperties
    );
    // 190 channels in 2 modes, derived rather than asserted flat.
    expect(T3_LEG.channels * T3_LEG.modes).toBe(T3_LEG.removedDeclarations);
    // Leg 3 left a remainder and named its size; leg 4 must take all of it --
    // no more (there is nothing else to take) and no less (a survivor would be
    // an authority nobody owns, which is the condition the chain exists to
    // rule out).
    expect(T3_LEG.removedDeclarations).toBe(T2_LEG.postCustomProperties);
    expect(T3_LEG.postCustomProperties).toBe(0);
    // The whole chain reconciles from the pre-drain total in one line.
    expect(
      CENSUS.preCustomProperties -
        CENSUS.removedDeclarations -
        REPAIR.removedDeclarations -
        T2_LEG.removedDeclarations -
        T3_LEG.removedDeclarations
    ).toBe(0);
  });

  it("chains leg 3 onto leg 2 and consumes exactly the disclosed control-family tranche preimage", () => {
    expect(T2_LEG.preCustomProperties).toBe(REPAIR.postCustomProperties);
    expect(T2_LEG.preAllDeclarations).toBe(REPAIR.postAllDeclarations);
    expect(T2_LEG.preCustomProperties - T2_LEG.removedDeclarations).toBe(
      T2_LEG.postCustomProperties
    );
    // The removal is 151 channels in 2 modes, derived rather than asserted flat.
    expect(T2_LEG.channels * T2_LEG.modes).toBe(T2_LEG.removedDeclarations);
    // Leg 2 disclosed how big the control-family tranche preimage would be once it had taken its
    // sixteen rows out of it. Leg 3 must consume exactly that number -- no more
    // (it would be reaching past its tranche) and no less (it would be leaving
    // a remainder nobody owns).
    expect(T2_LEG.removedDeclarations).toBe(REPAIR.t2PreimageAfter);
    expect(T2_LEG.removedDeclarations).not.toBe(REPAIR.t2PreimageBefore);
  });

  it("chains leg 2 onto leg 1 instead of restating a bare total", () => {
    // Leg 2 starts exactly where leg 1 ended -- not from a fresh count.
    expect(REPAIR.preCustomProperties).toBe(CENSUS.postCustomProperties);
    expect(REPAIR.preAllDeclarations).toBe(CENSUS.postAllDeclarations);
    expect(REPAIR.preCustomProperties - REPAIR.removedDeclarations).toBe(
      REPAIR.postCustomProperties
    );
    // ...and the removal is 8 channels in 2 modes, derived, not asserted flat.
    expect(REPAIR.channels * REPAIR.modes).toBe(REPAIR.removedDeclarations);
    expect(REPAIR_ROWS).toHaveLength(REPAIR.channels);

    // The control-family tranche disclosure: its preimage shrinks by exactly what leg 2 consumed.
    expect(REPAIR.t2PreimageBefore - REPAIR.removedDeclarations).toBe(
      REPAIR.t2PreimageAfter
    );
    // The double-count that disclosure exists to prevent, stated as a falsehood.
    expect(REPAIR.t2PreimageAfter).not.toBe(REPAIR.t2PreimageBefore);
  });

  it("derives -275 from 144 names, not from a bare number", () => {
    const names = new Set(ROSTER.map((row) => row.name));
    expect(names.size).toBe(CENSUS.rosterNames);

    const identities = new Set(ROSTER.map((row) => row.mode + "|" + row.name));
    expect(identities.size).toBe(CENSUS.identityRows);

    expect(ROSTER).toHaveLength(CENSUS.removedDeclarations);
    expect(CENSUS.identityRows + CENSUS.duplicateDeclarations).toBe(
      CENSUS.removedDeclarations
    );
  });

  it("names the two extra declarations instead of leaving them a remainder", () => {
    const multiplicity = new Map<string, number>();
    for (const row of ROSTER) {
      const key = row.mode + "|" + row.name;
      multiplicity.set(key, (multiplicity.get(key) ?? 0) + 1);
    }
    const repeated = [...multiplicity.entries()]
      .filter(([, count]) => count > 1)
      .sort(([a], [b]) => a.localeCompare(b));
    expect(repeated).toEqual([
      ["dark|" + CENSUS.duplicatedChannel, 2],
      ["light|" + CENSUS.duplicatedChannel, 2],
    ]);
  });

  it("rejects -273 as the census reduction", () => {
    expect(CENSUS.preCustomProperties - CENSUS.removedDeclarations).toBe(
      CENSUS.postCustomProperties
    );
    // The substitution the ruling forbids, asserted as a falsehood.
    expect(CENSUS.preCustomProperties - CENSUS.identityRows).not.toBe(
      CENSUS.postCustomProperties
    );
    expect(CENSUS.preCustomProperties - CENSUS.identityRows).toBe(700);
  });
});

// EXCISED (SEV-2): describe "ROTTAY EXTENSION FOUNDATION DRAIN - drain" — 4 tests, all reading the
// deleted extension through `live`:
//   * "declares none of the 144 drained channels"
//   * "leaves a symmetric residue, because every dark-only channel was drained"
//   * "removed the roster and nothing else" (the POST_T3 digest identity)
//   * "earns the terminal digest instead of inheriting it from an empty read"
// The last one is worth naming precisely: it existed because sha256 of an empty
// declaration list is what a SILENTLY BROKEN PARSER also produces, so it proved
// the empty read was a fact about the stylesheet rather than about the reader.
// That distinction dies with the file and cannot be restated here — an absent
// file has no parse to defend. It is replaced by a strictly stronger structural
// claim in `scripts/check/verticals/single-author/index.mjs` law G2, which fails if
// any `extension.css` or `_source/` directory reappears anywhere under the
// authored token CSS tree. The digest CONSTANTS and the roster ledger survive
// above and below; only the assertions that read bytes off disk are gone.

describe("ROTTAY EXTENSION FOUNDATION DRAIN - the common lowering preserves every migrated paint", () => {
  it.each(migrateRows.map((row) => [row.mode + " " + row.name, row] as const))(
    "%s",
    (_label, row) => {
      const emitted = EMITTED[row.mode][row.name];
      expect(
        emitted,
        row.mode + " " + row.name + " is not emitted at all"
      ).toBeDefined();
      expect(resolveValue(row.mode, emitted)).toBe(
        resolveValue(row.mode, emittedToday(row))
      );
    }
  );

  it("moved 207 declarations, not a rounded number of them", () => {
    expect(migrateRows).toHaveLength(207);
  });
});

/**
 * foundation tranche authority: a migrated name must lower identically through BOTH transports
 * — the static `BrandTheme` path and the ISO `Theme` path. They are only one
 * lowering if `brandThemeToTheme` carries every field the migration writes.
 *
 * This caught a real bridge loss: `DEFAULT_SHADOWS_SHAPE` enumerated only
 * sm/md/lg/xl, so the five channels G1 moved into `surfaces.shadows`
 * (xs, xxl, inner, focusRing, focusRingError) were dropped on the Theme path
 * while the BrandTheme path emitted them. `mergeDefaultShape` walks
 * `Object.keys(defaults)`, so a shape narrower than the declared union is
 * silently lossy rather than a compile error.
 *
 * Scope note: this grades the names ROTTAY-foundation tranche migrated. Eight
 * `--ds-type-*-font-size` channels and ~54 typography-role values are also
 * lost on this bridge; they predate this tranche, are identical for all three
 * verticals, and are reported separately rather than absorbed here.
 */
describe("ROTTAY EXTENSION FOUNDATION DRAIN - both transports lower migrated names identically", () => {
  /**
   * A migrated row may land in the base block or in the light overlay, so both
   * transports are flattened the same way `EMITTED` is before comparison.
   * Comparing base-only would silently skip every light-mode migration.
   */
  function flatten(result: {
    cssVariables: Record<string, string>;
    modeBlocks?: ReadonlyArray<{ mode: string; cssVariables: Record<string, string> }>;
  }): Record<Mode, Record<string, string | undefined>> {
    const light = (result.modeBlocks ?? []).find((b) => b.mode === "light");
    return {
      dark: result.cssVariables,
      light: { ...result.cssVariables, ...(light?.cssVariables ?? {}) },
    };
  }

  const viaBrandTheme = flatten(compiled);
  const viaTheme = flatten(
    lowerTheme(brandThemeToTheme(rottayBrandTheme)) as never
  );

  it.each(
    migrateRows.map((row) => [`${row.mode} ${row.name}`, row] as const)
  )("%s", (_label, row) => {
    const a = viaBrandTheme[row.mode][row.name];
    const b = viaTheme[row.mode][row.name];
    expect(a, `${row.mode} ${row.name} via BrandTheme`).toBeDefined();
    expect(b, `${row.mode} ${row.name} via ISO Theme`).toBe(a);
  });

  it("grades every migrated row, not a sample", () => {
    expect(migrateRows).toHaveLength(207);
  });

  /**
   * The five G1 shadow channels are the exact fields the bridge used to drop.
   * Pinning them by name keeps the regression addressable if the shape is ever
   * narrowed back to sm/md/lg/xl.
   */
  it("carries the five shadow fields the bridge used to drop", () => {
    for (const name of [
      "--ds-shadow-xs",
      "--ds-shadow-2xl",
      "--ds-shadow-inner",
      "--ds-shadow-focus-ring",
      "--ds-shadow-focus-ring-error",
    ]) {
      expect(viaBrandTheme.dark[name], `${name} via BrandTheme`).toBeTruthy();
      expect(viaTheme.dark[name], `${name} via ISO Theme`).toBe(
        viaBrandTheme.dark[name]
      );
    }
  });

  /**
   * Widening the shape must not have changed what BitHire or Evnto lower.
   * Neither authors these fields, so both transports must agree on absence.
   */
  it.each(["bithire", "evnto"] as const)(
    "%s is unaffected by the widened shadow shape",
    (slug) => {
      const brandTheme = slug === "bithire" ? bithireBrandTheme : evntoBrandTheme;
      const a = lowerBrandThemeFixture({ brandTheme, tenantSlug: slug })
        .cssVariables as Record<string, string | undefined>;
      const b = lowerTheme(brandThemeToTheme(brandTheme))
        .cssVariables as Record<string, string | undefined>;
      for (const name of [
        "--ds-shadow-xs",
        "--ds-shadow-2xl",
        "--ds-shadow-inner",
        "--ds-shadow-focus-ring",
        "--ds-shadow-focus-ring-error",
      ]) {
        expect(a[name] ?? null, `${slug} ${name} via BrandTheme`).toBe(null);
        expect(b[name] ?? null, `${slug} ${name} via ISO Theme`).toBe(null);
      }
    }
  );
});

describe("ROTTAY EXTENSION FOUNDATION DRAIN - the deleted channels were derivations, not paint", () => {
  it.each(
    deleteRowsPreCoh1Floor.map((row) => [row.mode + " " + row.name, row] as const)
  )("%s still resolves to what the line said", (_label, row) => {
    const key = row.mode + "|" + row.name;
    const post = EMITTED[row.mode][row.name] ?? FLOORS[key];
    const after = resolveValue(row.mode, post);
    const before = resolveValue(row.mode, row.value);
    expect(before, "the removed literal must itself resolve").not.toBeNull();
    expect(after, key + " resolves to nothing after removal").not.toBeNull();
    expect(after).toBe(before);
  });

  it("deleted 68 declarations", () => {
    expect(deleteRows).toHaveLength(68);
  });
});

/**
 * status-tint floor (2026-08-30) — the four dark alpha-10 rows this lot superseded.
 *
 * `deriveStatusTintFloor` now emits all four from rottay's OWN dark seed
 * (`--ds-color-{error,info,success,warning}`) rather than leaving them to
 * fall through to the recorded `FLOORS` snapshot of `default.css`'s foundation
 * default. Two resolve to the byte-identical rgba the recorded floor already
 * gave (rottay's dark success/warning seeds happen to equal the foundation
 * literal); error/info additionally correct the resolved colour to rottay's
 * own dark seed instead of the generic foundation red/blue -- a minimal,
 * intended delta, not a regression.
 */
describe("status-tint floor — the four superseded dark alpha-10 rows now derive from rottay's own seed", () => {
  const EXPECTED_FORMULA: Record<string, string> = {
    "--ds-color-alpha-error-10":
      "color-mix(in srgb, var(--ds-color-error) 10%, transparent)",
    "--ds-color-alpha-info-10":
      "color-mix(in srgb, var(--ds-color-info) 10%, transparent)",
    "--ds-color-alpha-success-10":
      "color-mix(in srgb, var(--ds-color-success) 10%, transparent)",
    "--ds-color-alpha-warning-10":
      "color-mix(in srgb, var(--ds-color-warning) 10%, transparent)",
  };

  it.each([...COH1_SUPERSEDED_FLOOR_KEYS])(
    "%s is now the floor's own formula, referencing rottay's dark seed",
    (key) => {
      const [mode, name] = key.split("|");
      expect(EMITTED[mode as Mode][name]).toBe(EXPECTED_FORMULA[name]);
    }
  );

  // Parse the recorded pre-status-tint floor floor and rottay's own dark seed to prove
  // the numeric claim from source, not from a copied hex: success/warning
  // resolve to the SAME rgba (their dark seed happens to equal the
  // foundation literal); error/info resolve to a DIFFERENT rgba (rottay's
  // own dark seed corrects the generic foundation default).
  const hexToRgbTriplet = (hex: string): string => {
    const clean = hex.replace("#", "");
    const r = Number.parseInt(clean.slice(0, 2), 16);
    const g = Number.parseInt(clean.slice(2, 4), 16);
    const b = Number.parseInt(clean.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };

  it("success/warning: rottay's own dark seed happens to equal the foundation default (cero-delta byte)", () => {
    expect(hexToRgbTriplet(EMITTED.dark["--ds-color-success"])).toBe("34, 197, 94");
    expect(FLOORS["dark|--ds-color-alpha-success-10"]).toBe("rgba(34, 197, 94, 0.10)");
    expect(hexToRgbTriplet(EMITTED.dark["--ds-color-warning"])).toBe("245, 158, 11");
    expect(FLOORS["dark|--ds-color-alpha-warning-10"]).toBe("rgba(245, 158, 11, 0.10)");
  });

  it("error/info: rottay's own dark seed differs from the foundation default (intended minimal delta)", () => {
    expect(hexToRgbTriplet(EMITTED.dark["--ds-color-error"])).not.toBe("239, 68, 68");
    expect(FLOORS["dark|--ds-color-alpha-error-10"]).toBe("rgba(239, 68, 68, 0.10)");
    expect(hexToRgbTriplet(EMITTED.dark["--ds-color-info"])).not.toBe("59, 130, 246");
    expect(FLOORS["dark|--ds-color-alpha-info-10"]).toBe("rgba(59, 130, 246, 0.10)");
  });
});

describe("ROTTAY EXTENSION FOUNDATION DRAIN - mode authority", () => {
  /**
   * Rottay's default mode is dark, so the theme BODY is the dark authority and
   * `modes.light` is the delta. `compileModeBlocks` throws if a theme authors
   * an overlay for its own default mode, so there is no dark overlay to
   * inspect -- the base block IS dark.
   */
  it("compiles a light overlay and no dark overlay", () => {
    expect(modeBlocks.map((block) => block.mode)).toEqual(["light"]);
    expect(compiled.colorScheme).toBe("dark");
  });

  it("authors every dark-only migrated channel in the theme body", () => {
    const darkOnly = migrateRows.filter(
      (row) =>
        row.mode === "dark" &&
        !migrateRows.some(
          (other) => other.mode === "light" && other.name === row.name
        )
    );
    expect(darkOnly.length).toBeGreaterThan(0);
    for (const row of darkOnly) {
      expect(compiled.cssVariables[row.name]).toBeDefined();
    }
  });

  it("resets the nine sidebar geometry channels in light, not repaints them", () => {
    const nine = [
    "--ds-sidebar-shell-padding-inline",
    "--ds-sidebar-shell-padding-collapsed",
    "--ds-sidebar-item-height",
    "--ds-sidebar-item-child-height",
    "--ds-sidebar-item-font-size-child",
    "--ds-sidebar-item-padding-inline",
    "--ds-sidebar-icon-column-size",
    "--ds-sidebar-item-gap",
    "--ds-sidebar-child-padding-inline",
    ];
    for (const name of nine) {
      expect(compiled.cssVariables[name]).toBeDefined();
      expect(lightBlock?.cssVariables[name]).toBe("initial");
    }
  });

  it("authors the focus ring once, at the base, for both modes", () => {
    expect(compiled.cssVariables["--ds-focus-ring-color"]).toBe(
      "var(--ds-color-primary)"
    );
    expect(lightBlock?.cssVariables["--ds-focus-ring-color"]).toBeUndefined();
  });
});

describe("ROTTAY EXTENSION FOUNDATION DRAIN - one lowering, both transports", () => {
  const DB_MIRROR: ReadonlyArray<{
    readonly family: string;
    readonly path: string;
    readonly fields: readonly string[];
  }> = [
    {
      family: "sidebar",
      path: "sidebar",
      fields: [
        "shellPaddingInline",
        "shellPaddingCollapsed",
        "itemHeight",
        "itemChildHeight",
        "itemFontSizeChild",
        "itemPaddingInline",
        "iconColumnSize",
        "itemGap",
        "childPaddingInline",
      ],
    },
    {
      family: "controls.textarea",
      path: "controls.textarea",
      fields: [
        "bg",
        "bgDisabled",
        "filledBg",
        "border",
        "borderHover",
        "borderFocus",
        "shadowFocus",
        "successBorder",
        "warningBorder",
        "errorBorder",
        "color",
        "colorPlaceholder",
        "countColor",
      ],
    },
    {
      family: "controls.form",
      path: "controls.form",
      fields: [
        "labelColor",
        "labelFontWeight",
        "helpColor",
        "extraColor",
        "requiredColor",
        "successColor",
        "warningColor",
        "errorColor",
      ],
    },
    {
      family: "layout",
      path: "layout",
      fields: [
        "dividerTextColor",
      ],
    },
    {
      family: "badge",
      path: "badge",
      fields: [
        "borderColor",
        "textColor",
      ],
    },
    {
      family: "search.commandPalette",
      path: "search.commandPalette",
      fields: [
        "backdrop",
        "bg",
        "border",
        "emptyColor",
        "groupColor",
        "itemHoverBg",
        "shortcutBorder",
      ],
    },
    {
      family: "tooltip",
      path: "tooltip",
      fields: [
        "bg",
        "color",
        "shadow",
        "defaultBg",
        "defaultColor",
        "primaryBg",
        "primaryColor",
        "secondaryBg",
        "secondaryColor",
        "successBg",
        "warningBg",
        "errorBg",
      ],
    },
    {
      family: "popover",
      path: "popover",
      fields: [
        "bg",
        "border",
        "contentColor",
        "shadow",
        "titleBorder",
      ],
    },
  ];

  const shapeAt = (path: string): Record<string, unknown> =>
    path
      .split(".")
      .reduce<
        Record<string, unknown>
      >((node, key) => (node[key] ?? {}) as Record<string, unknown>, DEFAULT_CHROME_SHAPE as unknown as Record<string, unknown>);

  it.each(DB_MIRROR.map((entry) => [entry.family, entry] as const))(
    "%s: the DB mirror admits exactly the fields the static shape declares",
    (_label, entry) => {
      const shape = shapeAt(entry.path);
      for (const field of entry.fields) {
        expect(
          Object.prototype.hasOwnProperty.call(shape, field),
          entry.path + "." + field + " missing from DEFAULT_CHROME_SHAPE"
        ).toBe(true);
      }
    }
  );

  it.each(DB_MIRROR.map((entry) => [entry.family, entry] as const))(
    "%s: a DB document may author those fields",
    (_label, entry) => {
      for (const field of entry.fields) {
        const result = validateTenantThemeDocument(
          buildDocument(entry.path, field, "12px")
        );
        expect(
          result.success,
          entry.path + "." + field + " rejected by the DB schema"
        ).toBe(true);
      }
    }
  );

  it("scopes the mirror to the seven DB-governed families and no further", () => {
    const families = new Set(DB_MIRROR.map((entry) => entry.path.split(".")[0]));
    expect([...families].sort()).toEqual([
      "badge",
      "controls",
      "layout",
      "popover",
      "search",
      "sidebar",
      "tooltip",
    ]);
  });
});

describe("ROTTAY EXTENSION FOUNDATION DRAIN - initial is a nine-field exception, not a policy", () => {
  const NINE: readonly string[] = [
    "shellPaddingInline",
    "shellPaddingCollapsed",
    "itemHeight",
    "itemChildHeight",
    "itemFontSizeChild",
    "itemPaddingInline",
    "iconColumnSize",
    "itemGap",
    "childPaddingInline",
  ];

  it.each(NINE)("sidebar.%s may author initial", (field) => {
    const result = validateTenantThemeDocument(
      buildDocument("sidebar", field, "initial")
    );
    expect(result.success).toBe(true);
  });

  /**
   * The negatives matter more than the positives. `initial` blanks a channel
   * instead of painting it, so a global admission would let any DB row silently
   * erase a governed channel. `sidebar.headerHeight` is the sharpest case: same
   * family, same geometry shape, not one of the nine.
   */
  const REJECTED: ReadonlyArray<readonly [string, string]> = [
    ["sidebar", "headerHeight"],
    ["sidebar", "width"],
    ["sidebar", "collapsedWidth"],
    ["sidebar", "bg"],
    ["sidebar", "itemPadding"],
    ["sidebar", "iconSize"],
    ["layout", "headerHeight"],
    ["layout", "bg"],
    ["badge", "textColor"],
    ["popover", "bg"],
    ["tooltip", "bg"],
    ["controls.textarea", "bg"],
    ["controls.form", "labelColor"],
    ["search.commandPalette", "bg"],
  ];

  it.each(
    REJECTED.map(([path, field]) => [path + "." + field, path, field] as const)
  )("%s may not author initial", (_label, path, field) => {
    const result = validateTenantThemeDocument(
      buildDocument(path, field, "initial")
    );
    expect(result.success).toBe(false);
    const issues = result.success ? [] : result.issues;
    expect(issues.some((issue) => issue.code === "unsafe_value")).toBe(true);
  });

  it("still admits an ordinary value on the same nine fields", () => {
    for (const field of NINE) {
      const result = validateTenantThemeDocument(
        buildDocument("sidebar", field, "48px")
      );
      expect(result.success).toBe(true);
    }
  });
});

describe("ROTTAY EXTENSION FOUNDATION DRAIN - why the drain had to author dark at the root", () => {
  /**
   * `foundation/themes/default/index.css` carries a dark block that redeclares 72
   * channels. 30 of the 493 channels the rottay extension used to declare
   * collide with it, 17 of them inside this roster.
   *
   * That block is LAYERED and the tenant artifact is UNLAYERED, so the artifact
   * won every one of those collisions before the drain. The compiler's emission
   * is likewise unlayered and likewise wins -- which is why the migrated values
   * had to be authored into the theme body rather than left to default.css. If
   * they had simply been dropped, these 17 would have silently fallen back to
   * the DS dark block instead of keeping rottay's paint.
   */
  const COLLIDING: readonly string[] = [
    "--ds-color-bg-canvas",
    "--ds-color-bg-hover",
    "--ds-color-neutral-0",
    "--ds-color-surface",
    "--ds-color-surface-muted",
    "--ds-color-text-inverse",
    "--ds-focus-ring-color",
    "--ds-list-background-color",
    "--ds-list-border-color",
    "--ds-list-item-background-color",
    "--ds-list-item-hover-background-color",
    "--ds-list-secondary-text-color",
    "--ds-list-text-color",
    "--ds-text-primary",
    "--ds-text-secondary",
    "--ds-textarea-count-color",
    "--ds-watermark-color",
  ];

  it("the DS dark block and the roster genuinely overlap", () => {
    const css = readFileSync(DEFAULT_CSS, "utf8");
    const darkNames = new Set<string>();
    const rule = /([^{}]*)\{([^{}]*)\}/g;
    let match: RegExpExecArray | null;
    while ((match = rule.exec(css)) !== null) {
      const selector = (match[1] ?? "").trim();
      if (
        !/\.dark|\[data-theme=.?dark|prefers-color-scheme:\s*dark/.test(selector)
      )
        continue;
      for (const declaration of (match[2] ?? "").matchAll(
        /(--[A-Za-z0-9-]+)\s*:/g
      )) {
        darkNames.add(declaration[1] as string);
      }
    }
    expect(darkNames.size).toBe(72);
    const rosterNames = new Set(ROSTER.map((row) => row.name));
    const overlap = [...rosterNames].filter((name) => darkNames.has(name));
    expect(overlap.sort()).toEqual([...COLLIDING].sort());
  });

  /**
   * The two dispositions answer the collision differently, and the difference
   * is the whole point of splitting the roster in two:
   *
   *   migrate -> the compiler must emit the channel in that mode. Its emission
   *              is unlayered and beats the DS dark block, so rottay's paint
   *              survives.
   *   delete  -> the compiler deliberately emits nothing, because the floor --
   *              which for these rows IS the DS dark block -- already resolves
   *              to the value the extension was restating. The equality itself
   *              is graded row by row in the derivation suite above.
   *
   * Eight of the seventeen are mixed: migrate in one mode, delete in the other.
   * Keying on (mode, name) rather than on the name is what keeps that honest.
   */
  it("answers each collision by disposition, not with one blanket claim", () => {
    const colliding = new Set(COLLIDING);
    const rows = ROSTER.filter((row) => colliding.has(row.name));
    expect(rows.length).toBeGreaterThan(COLLIDING.length);

    for (const row of rows) {
      const emitted = EMITTED[row.mode][row.name] !== undefined;
      if (row.disposition === "migrate") {
        expect(
          emitted,
          row.mode + " " + row.name + " collides with the DS dark block and nothing emits it"
        ).toBe(true);
      } else {
        expect(
          emitted || FLOORS[row.mode + "|" + row.name] !== undefined,
          row.mode + " " + row.name + " was deleted with neither an emission nor a floor"
        ).toBe(true);
      }
    }
  });
});

describe("ROTTAY EXTENSION FOUNDATION DRAIN - the derivations are common, not rottay-shaped", () => {
  /**
   * The `-rgb` channels were deleted from the rottay extension because the
   * lowering derives them. A derivation that only fired for rottay would be a
   * slug branch; these fire for every first-party theme, from each theme's own
   * palette.
   */
  it.each([
    ["rottay", rottayBrandTheme],
    ["bithire", bithireBrandTheme],
    ["evnto", evntoBrandTheme],
  ] as const)("%s derives its own primary/secondary rgb", (slug, theme) => {
    const vars = lowerBrandThemeFixture({
      brandTheme: theme,
      tenantSlug: slug,
    }).cssVariables;
    expect(vars["--ds-color-primary-rgb"]).toMatch(/^\d+, \d+, \d+$/);
    expect(vars["--ds-color-secondary-rgb"]).toMatch(/^\d+, \d+, \d+$/);
  });

  it("gives the three themes three different derivations", () => {
    const themes = [
      ["rottay", rottayBrandTheme],
      ["bithire", bithireBrandTheme],
      ["evnto", evntoBrandTheme],
    ] as const;
    const derived = themes.map(
      ([slug, theme]) =>
        lowerBrandThemeFixture({ brandTheme: theme, tenantSlug: slug }).cssVariables[
          "--ds-color-primary-rgb"
        ]
    );
    expect(new Set(derived).size).toBe(3);
  });
});

/**
 * Leg 2 -- the foundation tranche P0 repair. Everything here grades the eight select channels
 * removed from both mode blocks, and the eighteen that stay.
 */
// EXCISED (SEV-2): describe "SELECT-FAMILY REPAIR - the extension no longer restates a
// compiled channel" — 4 tests. Every one of them parsed the deleted
// `artifacts/rottay/_source/extension.css` through `live` to prove the
// extension had stopped RESTATING a channel the compiled artifact already
// authored. That was the bounded form of the single-author law: the extension
// was allowed to exist provided it did not collide. SEV-1 removed the second
// author from the renderer and SEV-2 deleted its file, so non-collision is now
// structural rather than measured — there is no second author left to collide.
// `scripts/check/verticals/single-author/index.mjs` law G2 keeps it that way.

/**
 * Causality. Every mutation below preserves the declaration COUNT, so none of
 * them can be caught by the census alone -- which is exactly why the census is
 * not the whole gate.
 */
describe("SELECT-FAMILY REPAIR - causality", () => {
  // EXCISED (SEV-2): "a reinserted select row is caught even though it restores
  // a byte-equal value" and "a reinserted row in the WRONG block is caught as a
  // light-mode conflict". Both spread the live extension corpus (`[...live,
  // planted]`) to prove the overlap detector fired when a drained row was put
  // BACK INTO THE EXTENSION. There is no extension to put a row back into, and
  // rewriting them as `[planted]` would keep a green while deleting the claim:
  // the carrier they were drilling is what SEV-2 removed. The reinsertion
  // channel itself is closed structurally by
  // `scripts/check/verticals/single-author/index.mjs` law G2 rather than detected
  // after the fact. The same-count digest drill below is UNTOUCHED — it mutates
  // REPAIR_ROWS, not the file.

  /** Same-count swap: dark and light literals exchanged. */
  it("swapping a channel's dark and light values keeps the count and breaks the digest", () => {
    const divergent = REPAIR_ROWS.filter((row) => bare(row.dark) !== bare(row.light));
    expect(divergent).toHaveLength(REPAIR.channels);

    for (const row of divergent) {
      // The compiled side must not be indifferent to which mode it is in.
      expect(bare(EMITTED.dark[row.name] as string)).not.toBe(bare(row.light));
      expect(bare(EMITTED.light[row.name] as string)).not.toBe(bare(row.dark));
    }

    // The whitespace-vs-paint drill was planted on the surviving declarations.
    // Leg 4 drained them, and an empty carrier cannot separate the two cases:
    // every mutation of nothing digests to sha256(""), so the drill would pass
    // for the wrong reason. It is planted on the eight rows this repair
    // removed instead -- real pre-image bytes, which is what it always graded.
    const carrier: readonly Declaration[] = REPAIR_ROWS.flatMap((row) => [
      { mode: "dark" as Mode, name: row.name, value: row.dark },
      { mode: "light" as Mode, name: row.name, value: row.light },
    ]);
    expect(carrier).toHaveLength(REPAIR.removedDeclarations);

    const swapped = carrier.map((declaration, index) =>
      index === 0
        ? { ...declaration, value: declaration.value + " " }
        : declaration
    );
    expect(swapped).toHaveLength(carrier.length);
    // Whitespace alone is Prettier, not paint, so the digest must NOT move.
    expect(digest(swapped)).toBe(digest(carrier));

    const repainted = carrier.map((declaration, index) =>
      index === 0 ? { ...declaration, value: "#000001" } : declaration
    );
    expect(repainted).toHaveLength(carrier.length);
    expect(digest(repainted)).not.toBe(digest(carrier));

    // A genuine dark/light swap keeps the count and still breaks the digest --
    // the case this test is named for, which a value-multiset digest would
    // have missed and this identity-carrying one does not.
    const first = REPAIR_ROWS[0] as (typeof REPAIR_ROWS)[number];
    const modeSwapped = carrier.map((declaration) =>
      declaration.name === first.name
        ? {
            ...declaration,
            value: declaration.mode === "dark" ? first.light : first.dark,
          }
        : declaration
    );
    expect(modeSwapped).toHaveLength(carrier.length);
    expect(digest(modeSwapped)).not.toBe(digest(carrier));
  });

  /** The removal is not a rename: no near-miss vocabulary crept in. */
  it("did not rename the eight channels into the compiler's vocabulary", () => {
    for (const alias of [
      "--ds-select-border-color",
      "--ds-select-border-color-hover",
      "--ds-select-border-color-focus",
      "--ds-select-dropdown-border-color",
      "--ds-select-option-color",
      "--ds-select-bg-hover",
      "--ds-select-bg-focus",
    ]) {
      // PARTIALLY EXCISED (SEV-2): the `live.some(...)` half asserted the alias
      // was absent from the extension. G2 now makes that unconditional. The
      // compiler-side half is the load-bearing one and survives: the channel
      // must still be emitted by the compiled artifact, which is what proves
      // the removal was a REMOVAL and not a rename into compiler vocabulary.
      expect(EMITTED.dark[alias], `${alias} dark`).toBeDefined();
    }
  });
});
