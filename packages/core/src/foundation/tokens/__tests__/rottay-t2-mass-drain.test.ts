/**
 * ROTTAY-T2 MASS -- the rottay artifact extension drained from 682 to 380 by
 * moving the thirteen form-control families into typed Theme owners.
 *
 * -- What this tranche is ----------------------------------------------------
 *
 * `ROTTAY-T1 MASS` left 682 custom-property declarations in
 * `artifacts/rottay/_source/extension.css`. This tranche removes 302 of them:
 * 151 channels x 2 mode blocks. Every one of the 151 belongs to one of
 * thirteen control families -- autocomplete, checkbox, datePicker, inputNumber,
 * radio, rate, select, slider, switch, timePicker, toggle, transfer, upload --
 * and each channel leaves the stylesheet for exactly one of two reasons:
 *
 *   MIGRATE (261 tuples)  the value moved into a closed typed field under
 *                         `chrome.controls`, and the single shared
 *                         `chromeToVariables` lowering now emits the channel
 *                         for BOTH transports (static BrandTheme and DB
 *                         TenantThemeDocument).
 *   DELETE  ( 41 tuples)  the channel already resolved to the same paint
 *                         without the line. The line restated a derivation
 *                         that `default.css` or a component `:root` block
 *                         already owned, so it was an echo, not an authority.
 *
 * 261 + 41 = 302, and the HOLD bucket is empty: no tuple was deferred.
 *
 * -- The 151 channels, classified by mode -----------------------------------
 *
 * Rottay is a dark-default theme, so the Theme BODY is the dark authority and
 * `modes.light` is the delta. Each channel therefore carries two independent
 * dispositions, one per mode, and the four combinations behave differently:
 *
 *   MM 113  both modes migrate. 106 of them author a divergent light value;
 *           the other 7 paint identically in both modes, so `modes.light`
 *           authors nothing and the body value serves both.
 *   MX  27  dark migrates, light is a delete. The body value would otherwise
 *           BLEED into light, because a body field with no light delta paints
 *           in both modes. `modes.light` therefore restates the exact
 *           floor-resolved light literal. That restatement is anti-bleed
 *           machinery, not an authority claim -- which is why the delete
 *           adjudication below deliberately refuses to read it.
 *   XM   8  dark is a delete, light migrates. The body leaves the field unset
 *           and only `modes.light` authors it, so dark falls through to the
 *           floor exactly as it did before the line existed.
 *   XX   3  both modes delete. These three get no typed field at all:
 *           `--ds-inputnumber-control-bg`, `--ds-rate-color-active`,
 *           `--ds-rate-color-hover`.
 *
 * 113 + 27 + 8 + 3 = 151. Counting typed leaves rather than channels:
 * 113 + 27 + 8 = 148 fields, distributed as autocomplete 10, checkbox 13,
 * datePicker 12, inputNumber 13, radio 14, rate 1, select 18, slider 9,
 * switch 8, timePicker 11, toggle 12, transfer 5, upload 22.
 *
 * -- Why `rate` rides in this tranche ---------------------------------------
 *
 * The family inventory files `rate` under feedback, not under controls, and
 * that classification is not disputed here. `rate` is drained with the twelve
 * control families because a drain tranche is bounded by the STYLESHEET, not
 * by the inventory: all three `--ds-rate-*` declarations are authored inside
 * the same control block of `extension.css` as the other twelve families, and
 * splitting them out would have left a three-declaration remainder that no
 * later tranche was scoped to collect. Two of the three are XX deletes; the
 * single surviving leaf, `rate.color`, is the smallest family in the tranche.
 * The inventory row is unchanged by this file.
 *
 * -- The select family is a superset, not a divergence -----------------------
 *
 * `chrome.controls.select` already existed with 15 fields shared by all three
 * first-party themes. This tranche adds 18 rottay-authored fields to the same
 * closed shape, taking it to 33. BitHire and Evnto keep the identical core 15;
 * rottay is a declared superset, and `mass-c3-bithire-drain` grades that law.
 * `--ds-select-border` is a DISTINCT channel from `--ds-select-border-color`:
 * the first is the shorthand the extension authored, the second is the
 * longhand the pre-existing lowering already emitted. Collapsing them would
 * silently drop paint, so both survive as separate fields.
 *
 * -- The census convention, restated ----------------------------------------
 *
 *   682 -> 380   custom-property declarations (`--*`) -- THE GOVERNED COUNT.
 *   683 -> 381   every CSS declaration of any kind.
 *
 * The extra declaration is `color: var(--ds-color-text-primary, #F0F0F0)` at
 * the top of the dark block. It is a paint on the root element, not a channel;
 * it was never in a roster and is asserted intact below.
 *
 * -- What is deliberately NOT asserted here ---------------------------------
 *
 * The generated `artifacts/rottay/index.css` is out of scope for this tranche
 * and has not been regenerated. This file grades SOURCE only. Pre-existing
 * vertical/generated staleness is not an acceptance signal for T2.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import postcss from "postcss";
import { describe, expect, it } from "vitest";

import { DEFAULT_CHROME_SHAPE } from "@/foundation/contracts/composition/tenants/themes/iso/shape";
import {
  TENANT_THEME_CONFIG_SCHEMA,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  validateTenantThemeDocument,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { compileBrandTheme } from "@/infrastructure/compilers/kernel/runtime/brand-theme";

import { rottayBrandTheme } from "../ts/presentation/brand-themes/rottay";

const DEFAULT_CSS = join(
  process.cwd(),
  "src/foundation/tokens/css/foundation/themes/default.css"
);
const COMPONENTS_DIR = join(
  process.cwd(),
  "src/foundation/tokens/css/presentation/components"
);

type Mode = "dark" | "light";
type Disposition = "migrate" | "delete";

interface Declaration {
  readonly mode: Mode;
  readonly name: string;
  readonly value: string;
}

interface RosterRow extends Declaration {
  readonly disposition: Disposition;
}

// EXCISED (SEV-2): `const EXTENSION` and `function parseExtension()`, the path
// constant and declaration scanner for the deleted extension file. The
// `Declaration` and `Mode` types they produced still carry the roster ledger.

/** Comparison form: whitespace, comma spacing and hex case are not paint. */
const bare = (value: string): string =>
  value
    .replace(/\s+/g, "")
    .replace(/\s*,\s*/g, ",")
    .toLowerCase();

const sha256 = (text: string): string =>
  createHash("sha256").update(text).digest("hex");

/**
 * The partition hash recipes, stated so they can be recomputed by hand:
 *
 *   roster      sorted unique channel names,   one per line, trailing newline
 *   tuple       sorted `name|D|value` rows,    one per line, trailing newline
 *   membership  sorted `name|D` rows,          one per line, trailing newline
 *
 * `D`/`L` is the mode letter. sha256 over UTF-8 in every case.
 *
 * The work order calls the per-side pins the migrate/delete "value" hashes.
 * The recipe behind them is the tuple recipe, not a bare list of values: each
 * value is carried with the identity row it belongs to. That is deliberate --
 * a bare value list is a multiset and would hash the same after two rows swap
 * their literals, which is precisely the mutation the causality block below
 * plants. The names are kept as signed; what they hash is stated here.
 */
const lines = (rows: readonly string[]): string =>
  [...rows].sort().join("\n") + "\n";
const letter = (mode: Mode): string => (mode === "dark" ? "D" : "L");
const rosterHash = (rows: readonly Declaration[]): string =>
  sha256(lines([...new Set(rows.map((row) => row.name))]));
const tupleHash = (rows: readonly Declaration[]): string =>
  sha256(lines(rows.map((r) => `${r.name}|${letter(r.mode)}|${r.value}`)));
const membershipHash = (rows: readonly Declaration[]): string =>
  sha256(lines(rows.map((r) => `${r.name}|${letter(r.mode)}`)));

/**
 * The signed partition. Every hash below was fixed by the work order BEFORE
 * the drain was applied; this file recomputes each one from the roster it
 * carries and from the bytes on disk, so a roster edit and a stylesheet edit
 * are both caught, and neither can be made to agree with the other by hand.
 */
const PINS = {
  t2Roster:
    "b602b4642000b56c86efa88687a2fac576db4ec7c2f8950b69528611f5e0c559",
  t2Tuple: "42abf4e5146c4413272fddbec7f332ff5ac6f1ac298bacdbd8eaec8df5316499",
  migrateMembership:
    "adb26ff7d5f4b35921950358818599a0bd63e3f8fba949c55f47343f54b87cdf",
  deleteMembership:
    "0698db5fd7c2b361dae6bb62d744a090fef11639d7122ce55683414337e6cd5d",
  migrateNames:
    "f51f1ec59b814d92d15fe288198be06d2cc14a12c0cb3db4687571d036c85861",
  deleteNames:
    "b5f29e1383a6f4120826ad3732556e9190523a3dcae2820b2d9d67ade6d46aca",
  migrateSideTuple:
    "0ed87d1f5f63dac469cd425d1c578f885b6997464438808951a1b0c31a8d28fd",
  deleteSideTuple:
    "cbeb67387e2c577110a8a5c15eeb969f75ff9b2d7fbd5773fabb6c6fb8ca088e",
  t3Roster: "ada8106371604ed03435bd477acf4e279d41f8aa3471a166ab26fffd24c04697",
  t3Tuple: "1493c1ce36c3052202347beb2a1bc14feb16b3a666b9332095ac1132f7ee0343",
} as const;

const CENSUS = {
  preCustomProperties: 682,
  postCustomProperties: 380,
  preAllDeclarations: 683,
  postAllDeclarations: 381,
  perModeBefore: 341,
  perModeAfter: 190,
  removedDeclarations: 302,
  removedChannels: 151,
  migrateTuples: 261,
  deleteTuples: 41,
  holdTuples: 0,
  typedLeaves: 148,
} as const;

/**
 * The sha256 of the empty list under the recipes above -- the digest a roster
 * collapses to once nothing is left to hash. It is used below to tell "the
 * remainder was empty when we signed it" apart from "the remainder was drained
 * after we signed it": the T3 pins are provably NOT this value.
 */
const EMPTY_LIST_HASH =
  "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b";

/**
 * What this tranche left behind, as measured here, before `ROTTAY-T3 MASS`
 * took it. The rows themselves now live in `rottay-t3-mass-drain.test.ts`,
 * which re-derives `PINS.t3Roster` and `PINS.t3Tuple` from them; this file
 * keeps only the shape of the handover so the chain arithmetic still closes.
 */
const T3_REMAINDER = {
  declarations: 380,
  channels: 190,
  perMode: 190,
} as const;

/**
 * The terminal state of the stylesheet after the whole chain. Zero custom
 * properties, one surviving non-custom declaration (the root `color:`).
 */
const TERMINAL = {
  customProperties: 0,
  allDeclarations: 1,
} as const;

/**
 * The signed roster. 302 rows in file order -- every custom-property
 * declaration this tranche removed, with the literal it carried and the
 * disposition it was adjudicated under. This table IS the tranche: a row that
 * is not here was not authorized to move, and a declaration missing from the
 * stylesheet that is not here breaks the survivor hashes below.
 */
const T2_ROSTER: readonly RosterRow[] = [
  { mode: "dark", name: "--ds-checkbox-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-bg-disabled", value: "#101012", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-border", value: "rgba(255, 255, 255, 0.18)", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-border-hover", value: "rgba(255, 255, 255, 0.28)", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-checked-bg", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-checked-border", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-checked-color", value: "#0C0C0E", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-focus-ring", value: "0 0 0 2px rgba(255, 255, 255, 0.20)", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-focus-ring-color", value: "rgba(255, 255, 255, 0.12)", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-error-border", value: "#EF4444", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-error-color", value: "#EF4444", disposition: "delete" },
  { mode: "dark", name: "--ds-checkbox-label-color", value: "#ECECEC", disposition: "migrate" },
  { mode: "dark", name: "--ds-checkbox-label-color-disabled", value: "#4A4A4F", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-bg-disabled", value: "#101012", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-border", value: "rgba(255, 255, 255, 0.18)", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-border-hover", value: "rgba(255, 255, 255, 0.28)", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-checked-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-checked-border", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-checked-dot", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-focus-ring", value: "0 0 0 2px rgba(255, 255, 255, 0.20)", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-focus-ring-color", value: "rgba(255, 255, 255, 0.12)", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-error-border", value: "#EF4444", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-error-color", value: "#EF4444", disposition: "delete" },
  { mode: "dark", name: "--ds-radio-label-color", value: "#ECECEC", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-label-color-disabled", value: "#4A4A4F", disposition: "migrate" },
  { mode: "dark", name: "--ds-radio-description-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-switch-bg", value: "rgba(255, 255, 255, 0.14)", disposition: "migrate" },
  { mode: "dark", name: "--ds-switch-bg-hover", value: "rgba(255, 255, 255, 0.18)", disposition: "migrate" },
  { mode: "dark", name: "--ds-switch-checked-bg", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-switch-checked-bg-hover", value: "#E0E0E0", disposition: "migrate" },
  { mode: "dark", name: "--ds-switch-thumb-bg", value: "#0C0C0E", disposition: "migrate" },
  { mode: "dark", name: "--ds-switch-thumb-shadow", value: "0 1px 2px rgba(0, 0, 0, 0.30)", disposition: "migrate" },
  { mode: "dark", name: "--ds-switch-focus-ring", value: "0 0 0 2px rgba(255, 255, 255, 0.20)", disposition: "migrate" },
  { mode: "dark", name: "--ds-switch-label-color", value: "#ECECEC", disposition: "migrate" },
  { mode: "dark", name: "--ds-slider-track-color", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-slider-track-color-disabled", value: "#4A4A4F", disposition: "migrate" },
  { mode: "dark", name: "--ds-slider-rail-color", value: "rgba(255, 255, 255, 0.10)", disposition: "migrate" },
  { mode: "dark", name: "--ds-slider-handle-bg", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-slider-handle-bg-disabled", value: "#4A4A4F", disposition: "migrate" },
  { mode: "dark", name: "--ds-slider-handle-border", value: "#0C0C0E", disposition: "migrate" },
  { mode: "dark", name: "--ds-slider-handle-shadow", value: "0 1px 3px rgba(0, 0, 0, 0.40)", disposition: "migrate" },
  { mode: "dark", name: "--ds-slider-focus-ring", value: "0 0 0 2px rgba(255, 255, 255, 0.20)", disposition: "migrate" },
  { mode: "dark", name: "--ds-slider-mark-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-bg-disabled", value: "#101012", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-color-disabled", value: "#4A4A4F", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-border-hover", value: "#3A3A40", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-border-focus", value: "rgba(255, 255, 255, 0.36)", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-shadow-focus", value: "0 0 0 2px rgba(255, 255, 255, 0.10)", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-error-border", value: "#EF4444", disposition: "delete" },
  { mode: "dark", name: "--ds-select-warning-border", value: "#D97706", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-success-border", value: "#16A34A", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-filled-bg", value: "#1A1A1E", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-dropdown-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-option-color-disabled", value: "#4A4A4F", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-tag-bg", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-tag-color", value: "#A0A0A5", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-arrow-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-clear-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-clear-color-hover", value: "#A0A0A5", disposition: "migrate" },
  { mode: "dark", name: "--ds-select-check-color", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-bg-disabled", value: "#101012", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-color", value: "#ECECEC", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-border-hover", value: "#3A3A40", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-border-focus", value: "rgba(255, 255, 255, 0.36)", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-shadow-focus", value: "0 0 0 2px rgba(255, 255, 255, 0.10)", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-error-border", value: "#EF4444", disposition: "delete" },
  { mode: "dark", name: "--ds-datepicker-warning-border", value: "#D97706", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-icon-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-clear-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-datepicker-separator-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-bg-disabled", value: "#101012", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-color", value: "#ECECEC", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-border-focus", value: "rgba(255, 255, 255, 0.36)", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-shadow-focus", value: "0 0 0 2px rgba(255, 255, 255, 0.10)", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-error-border", value: "#EF4444", disposition: "delete" },
  { mode: "dark", name: "--ds-inputnumber-warning-border", value: "#D97706", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-control-bg", value: "transparent", disposition: "delete" },
  { mode: "dark", name: "--ds-inputnumber-control-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-addon-bg", value: "#1A1A1E", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-addon-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-addon-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-inputnumber-affix-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-timepicker-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-timepicker-bg-disabled", value: "#101012", disposition: "migrate" },
  { mode: "dark", name: "--ds-timepicker-color", value: "#ECECEC", disposition: "migrate" },
  { mode: "dark", name: "--ds-timepicker-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-timepicker-border-focus", value: "rgba(255, 255, 255, 0.36)", disposition: "migrate" },
  { mode: "dark", name: "--ds-timepicker-shadow-focus", value: "0 0 0 2px rgba(255, 255, 255, 0.10)", disposition: "migrate" },
  { mode: "dark", name: "--ds-timepicker-error-border", value: "#EF4444", disposition: "delete" },
  { mode: "dark", name: "--ds-timepicker-warning-border", value: "#D97706", disposition: "migrate" },
  { mode: "dark", name: "--ds-timepicker-icon-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-timepicker-clear-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-timepicker-separator-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-border", value: "rgba(255, 255, 255, 0.10)", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-border-hover", value: "rgba(255, 255, 255, 0.20)", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-button-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-button-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-button-color", value: "#A0A0A5", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-dragger-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-dragger-bg-hover", value: "#1A1A1E", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-dragger-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-dragger-border-active", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-dragger-icon-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-dragger-text-color", value: "#A0A0A5", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-file-bg", value: "#1A1A1E", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-file-color", value: "#A0A0A5", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-file-remove-color", value: "#EF4444", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-progress-track", value: "#222226", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-progress-bar", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-card-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-card-bg", value: "#1A1A1E", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-error-border", value: "#EF4444", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-preview-overlay", value: "rgba(0, 0, 0, 0.50)", disposition: "migrate" },
  { mode: "dark", name: "--ds-upload-preview-backdrop", value: "rgba(0, 0, 0, 0.70)", disposition: "migrate" },
  { mode: "dark", name: "--ds-autocomplete-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-autocomplete-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-autocomplete-border-focus", value: "rgba(255, 255, 255, 0.36)", disposition: "migrate" },
  { mode: "dark", name: "--ds-autocomplete-error-border", value: "#EF4444", disposition: "delete" },
  { mode: "dark", name: "--ds-autocomplete-warning-border", value: "#D97706", disposition: "migrate" },
  { mode: "dark", name: "--ds-autocomplete-dropdown-bg", value: "#1A1A1E", disposition: "migrate" },
  { mode: "dark", name: "--ds-autocomplete-dropdown-shadow", value: "0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-autocomplete-option-bg-hover", value: "rgba(255, 255, 255, 0.04)", disposition: "migrate" },
  { mode: "dark", name: "--ds-autocomplete-empty-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-autocomplete-clear-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-track-bg", value: "rgba(255, 255, 255, 0.14)", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-track-bg-checked", value: "#FFFFFF", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-dot-bg", value: "#0C0C0E", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-dot-shadow", value: "0 1px 2px rgba(0, 0, 0, 0.30)", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-focus-ring", value: "0 0 0 2px rgba(255, 255, 255, 0.20)", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-success-bg", value: "#22C55E", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-warning-bg", value: "#F59E0B", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-error-bg", value: "#EF4444", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-label-color", value: "#ECECEC", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-description-color", value: "#6B6B72", disposition: "migrate" },
  { mode: "dark", name: "--ds-toggle-error-color", value: "#EF4444", disposition: "delete" },
  { mode: "dark", name: "--ds-toggle-inner-label-color", value: "#0C0C0E", disposition: "migrate" },
  { mode: "dark", name: "--ds-rate-color", value: "#4A4A4F", disposition: "migrate" },
  { mode: "dark", name: "--ds-rate-color-active", value: "#FBBF24", disposition: "delete" },
  { mode: "dark", name: "--ds-rate-color-hover", value: "#FCD34D", disposition: "delete" },
  { mode: "dark", name: "--ds-transfer-bg", value: "#18181B", disposition: "migrate" },
  { mode: "dark", name: "--ds-transfer-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-transfer-header-bg", value: "#131316", disposition: "migrate" },
  { mode: "dark", name: "--ds-transfer-header-border", value: "#2A2A2F", disposition: "migrate" },
  { mode: "dark", name: "--ds-transfer-item-bg-hover", value: "rgba(255, 255, 255, 0.04)", disposition: "migrate" },
  { mode: "light", name: "--ds-checkbox-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-checkbox-bg-disabled", value: "#F4F4F3", disposition: "migrate" },
  { mode: "light", name: "--ds-checkbox-border", value: "#D4D4D2", disposition: "migrate" },
  { mode: "light", name: "--ds-checkbox-border-hover", value: "#A3A3A1", disposition: "migrate" },
  { mode: "light", name: "--ds-checkbox-checked-bg", value: "#0A0A0A", disposition: "migrate" },
  { mode: "light", name: "--ds-checkbox-checked-border", value: "#0A0A0A", disposition: "migrate" },
  { mode: "light", name: "--ds-checkbox-checked-color", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-checkbox-focus-ring", value: "0 0 0 2px rgba(10, 10, 10, 0.12)", disposition: "migrate" },
  { mode: "light", name: "--ds-checkbox-focus-ring-color", value: "rgba(10, 10, 10, 0.08)", disposition: "migrate" },
  { mode: "light", name: "--ds-checkbox-error-border", value: "#DC2626", disposition: "delete" },
  { mode: "light", name: "--ds-checkbox-error-color", value: "#DC2626", disposition: "migrate" },
  { mode: "light", name: "--ds-checkbox-label-color", value: "#1A1A1A", disposition: "migrate" },
  { mode: "light", name: "--ds-checkbox-label-color-disabled", value: "#C4C4C2", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-radio-bg-disabled", value: "#F4F4F3", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-border", value: "#D4D4D2", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-border-hover", value: "#A3A3A1", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-checked-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-radio-checked-border", value: "#0A0A0A", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-checked-dot", value: "#0A0A0A", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-focus-ring", value: "0 0 0 2px rgba(10, 10, 10, 0.12)", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-focus-ring-color", value: "rgba(10, 10, 10, 0.08)", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-error-border", value: "#DC2626", disposition: "delete" },
  { mode: "light", name: "--ds-radio-error-color", value: "#DC2626", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-label-color", value: "#1A1A1A", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-label-color-disabled", value: "#C4C4C2", disposition: "migrate" },
  { mode: "light", name: "--ds-radio-description-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-switch-bg", value: "#D4D4D2", disposition: "migrate" },
  { mode: "light", name: "--ds-switch-bg-hover", value: "#C4C4C2", disposition: "migrate" },
  { mode: "light", name: "--ds-switch-checked-bg", value: "#0A0A0A", disposition: "migrate" },
  { mode: "light", name: "--ds-switch-checked-bg-hover", value: "#2A2A2A", disposition: "migrate" },
  { mode: "light", name: "--ds-switch-thumb-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-switch-thumb-shadow", value: "0 1px 3px rgba(0, 0, 0, 0.10)", disposition: "migrate" },
  { mode: "light", name: "--ds-switch-focus-ring", value: "0 0 0 2px rgba(10, 10, 10, 0.12)", disposition: "migrate" },
  { mode: "light", name: "--ds-switch-label-color", value: "#1A1A1A", disposition: "migrate" },
  { mode: "light", name: "--ds-slider-track-color", value: "#0A0A0A", disposition: "migrate" },
  { mode: "light", name: "--ds-slider-track-color-disabled", value: "#C4C4C2", disposition: "migrate" },
  { mode: "light", name: "--ds-slider-rail-color", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-slider-handle-bg", value: "#FFFFFF", disposition: "migrate" },
  { mode: "light", name: "--ds-slider-handle-bg-disabled", value: "#F4F4F3", disposition: "migrate" },
  { mode: "light", name: "--ds-slider-handle-border", value: "#0A0A0A", disposition: "migrate" },
  { mode: "light", name: "--ds-slider-handle-shadow", value: "0 1px 3px rgba(0, 0, 0, 0.12)", disposition: "migrate" },
  { mode: "light", name: "--ds-slider-focus-ring", value: "0 0 0 2px rgba(10, 10, 10, 0.12)", disposition: "migrate" },
  { mode: "light", name: "--ds-slider-mark-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-select-bg-disabled", value: "#F4F4F3", disposition: "migrate" },
  { mode: "light", name: "--ds-select-color-disabled", value: "#C4C4C2", disposition: "migrate" },
  { mode: "light", name: "--ds-select-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-select-border-hover", value: "#D4D4D2", disposition: "migrate" },
  { mode: "light", name: "--ds-select-border-focus", value: "rgba(10, 10, 10, 0.40)", disposition: "migrate" },
  { mode: "light", name: "--ds-select-shadow-focus", value: "0 0 0 2px rgba(10, 10, 10, 0.08)", disposition: "migrate" },
  { mode: "light", name: "--ds-select-error-border", value: "#DC2626", disposition: "migrate" },
  { mode: "light", name: "--ds-select-warning-border", value: "#D97706", disposition: "migrate" },
  { mode: "light", name: "--ds-select-success-border", value: "#16A34A", disposition: "migrate" },
  { mode: "light", name: "--ds-select-filled-bg", value: "#F4F4F3", disposition: "delete" },
  { mode: "light", name: "--ds-select-dropdown-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-select-option-color-disabled", value: "#C4C4C2", disposition: "migrate" },
  { mode: "light", name: "--ds-select-tag-bg", value: "#F4F4F3", disposition: "delete" },
  { mode: "light", name: "--ds-select-tag-color", value: "#6B6B6B", disposition: "migrate" },
  { mode: "light", name: "--ds-select-arrow-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-select-clear-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-select-clear-color-hover", value: "#6B6B6B", disposition: "migrate" },
  { mode: "light", name: "--ds-select-check-color", value: "#0A0A0A", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-datepicker-bg-disabled", value: "#F4F4F3", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-color", value: "#1A1A1A", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-border-hover", value: "#D4D4D2", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-border-focus", value: "rgba(10, 10, 10, 0.40)", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-shadow-focus", value: "0 0 0 2px rgba(10, 10, 10, 0.08)", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-error-border", value: "#DC2626", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-warning-border", value: "#D97706", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-icon-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-clear-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-datepicker-separator-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-inputnumber-bg-disabled", value: "#F4F4F3", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-color", value: "#1A1A1A", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-border-focus", value: "rgba(10, 10, 10, 0.40)", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-shadow-focus", value: "0 0 0 2px rgba(10, 10, 10, 0.08)", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-error-border", value: "#DC2626", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-warning-border", value: "#D97706", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-control-bg", value: "transparent", disposition: "delete" },
  { mode: "light", name: "--ds-inputnumber-control-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-addon-bg", value: "#F4F4F3", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-addon-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-addon-color", value: "#6B6B6B", disposition: "migrate" },
  { mode: "light", name: "--ds-inputnumber-affix-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-timepicker-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-timepicker-bg-disabled", value: "#F4F4F3", disposition: "migrate" },
  { mode: "light", name: "--ds-timepicker-color", value: "#1A1A1A", disposition: "migrate" },
  { mode: "light", name: "--ds-timepicker-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-timepicker-border-focus", value: "rgba(10, 10, 10, 0.40)", disposition: "migrate" },
  { mode: "light", name: "--ds-timepicker-shadow-focus", value: "0 0 0 2px rgba(10, 10, 10, 0.08)", disposition: "migrate" },
  { mode: "light", name: "--ds-timepicker-error-border", value: "#DC2626", disposition: "migrate" },
  { mode: "light", name: "--ds-timepicker-warning-border", value: "#D97706", disposition: "migrate" },
  { mode: "light", name: "--ds-timepicker-icon-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-timepicker-clear-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-timepicker-separator-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-bg", value: "#FFFFFF", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-border-hover", value: "#D4D4D2", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-button-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-upload-button-border", value: "#E5E5E3", disposition: "delete" },
  { mode: "light", name: "--ds-upload-button-color", value: "#6B6B6B", disposition: "delete" },
  { mode: "light", name: "--ds-upload-dragger-bg", value: "#FAFAF9", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-dragger-bg-hover", value: "#F4F4F3", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-dragger-border", value: "#E5E5E3", disposition: "delete" },
  { mode: "light", name: "--ds-upload-dragger-border-active", value: "#0A0A0A", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-dragger-icon-color", value: "#9C9C9C", disposition: "delete" },
  { mode: "light", name: "--ds-upload-dragger-text-color", value: "#6B6B6B", disposition: "delete" },
  { mode: "light", name: "--ds-upload-file-bg", value: "#FAFAF9", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-file-color", value: "#6B6B6B", disposition: "delete" },
  { mode: "light", name: "--ds-upload-file-remove-color", value: "#DC2626", disposition: "delete" },
  { mode: "light", name: "--ds-upload-progress-track", value: "#EDEDEC", disposition: "delete" },
  { mode: "light", name: "--ds-upload-progress-bar", value: "#0A0A0A", disposition: "delete" },
  { mode: "light", name: "--ds-upload-card-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-card-bg", value: "#FAFAF9", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-error-border", value: "#DC2626", disposition: "delete" },
  { mode: "light", name: "--ds-upload-preview-overlay", value: "rgba(0, 0, 0, 0.40)", disposition: "migrate" },
  { mode: "light", name: "--ds-upload-preview-backdrop", value: "rgba(0, 0, 0, 0.60)", disposition: "migrate" },
  { mode: "light", name: "--ds-autocomplete-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-autocomplete-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-autocomplete-border-focus", value: "rgba(10, 10, 10, 0.40)", disposition: "migrate" },
  { mode: "light", name: "--ds-autocomplete-error-border", value: "#DC2626", disposition: "migrate" },
  { mode: "light", name: "--ds-autocomplete-warning-border", value: "#D97706", disposition: "migrate" },
  { mode: "light", name: "--ds-autocomplete-dropdown-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-autocomplete-dropdown-shadow", value: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)", disposition: "migrate" },
  { mode: "light", name: "--ds-autocomplete-option-bg-hover", value: "#FAFAF9", disposition: "migrate" },
  { mode: "light", name: "--ds-autocomplete-empty-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-autocomplete-clear-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-track-bg", value: "#D4D4D2", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-track-bg-checked", value: "#0A0A0A", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-dot-bg", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-toggle-dot-shadow", value: "0 1px 2px rgba(0, 0, 0, 0.10)", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-focus-ring", value: "0 0 0 2px rgba(10, 10, 10, 0.12)", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-success-bg", value: "#16A34A", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-warning-bg", value: "#D97706", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-error-bg", value: "#DC2626", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-label-color", value: "#1A1A1A", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-description-color", value: "#9C9C9C", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-error-color", value: "#DC2626", disposition: "migrate" },
  { mode: "light", name: "--ds-toggle-inner-label-color", value: "#FFFFFF", disposition: "delete" },
  { mode: "light", name: "--ds-rate-color", value: "#EDEDEC", disposition: "migrate" },
  { mode: "light", name: "--ds-rate-color-active", value: "#FBBF24", disposition: "delete" },
  { mode: "light", name: "--ds-rate-color-hover", value: "#FCD34D", disposition: "delete" },
  { mode: "light", name: "--ds-transfer-bg", value: "#FFFFFF", disposition: "migrate" },
  { mode: "light", name: "--ds-transfer-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-transfer-header-bg", value: "#FAFAF9", disposition: "migrate" },
  { mode: "light", name: "--ds-transfer-header-border", value: "#E5E5E3", disposition: "migrate" },
  { mode: "light", name: "--ds-transfer-item-bg-hover", value: "#FAFAF9", disposition: "migrate" },];

/**
 * The thirteen families, as the lowering sees them: the Theme property name
 * and every typed leaf it owns, paired with the exact CSS channel that leaf
 * lowers to. 148 pairs. The lowering keeps the historical channel spelling
 * (`inputnumber`, `datepicker`, `timepicker`) even though the Theme property
 * is camelCase, because the channel names are the ones the stylesheets and the
 * engines already consume; renaming them would be a paint change disguised as
 * a tidy-up.
 */
const FAMILIES: readonly {
  readonly prop: string;
  readonly fields: readonly (readonly [string, string])[];
}[] = [
  {
    prop: "autocomplete",
    fields: [
      ["bg", "--ds-autocomplete-bg"],
      ["border", "--ds-autocomplete-border"],
      ["borderFocus", "--ds-autocomplete-border-focus"],
      ["clearColor", "--ds-autocomplete-clear-color"],
      ["dropdownBg", "--ds-autocomplete-dropdown-bg"],
      ["dropdownShadow", "--ds-autocomplete-dropdown-shadow"],
      ["emptyColor", "--ds-autocomplete-empty-color"],
      ["errorBorder", "--ds-autocomplete-error-border"],
      ["optionBgHover", "--ds-autocomplete-option-bg-hover"],
      ["warningBorder", "--ds-autocomplete-warning-border"],
    ],
  },
  {
    prop: "checkbox",
    fields: [
      ["bg", "--ds-checkbox-bg"],
      ["bgDisabled", "--ds-checkbox-bg-disabled"],
      ["border", "--ds-checkbox-border"],
      ["borderHover", "--ds-checkbox-border-hover"],
      ["checkedBg", "--ds-checkbox-checked-bg"],
      ["checkedBorder", "--ds-checkbox-checked-border"],
      ["checkedColor", "--ds-checkbox-checked-color"],
      ["errorBorder", "--ds-checkbox-error-border"],
      ["errorColor", "--ds-checkbox-error-color"],
      ["focusRing", "--ds-checkbox-focus-ring"],
      ["focusRingColor", "--ds-checkbox-focus-ring-color"],
      ["labelColor", "--ds-checkbox-label-color"],
      ["labelColorDisabled", "--ds-checkbox-label-color-disabled"],
    ],
  },
  {
    prop: "datePicker",
    fields: [
      ["bg", "--ds-datepicker-bg"],
      ["bgDisabled", "--ds-datepicker-bg-disabled"],
      ["border", "--ds-datepicker-border"],
      ["borderFocus", "--ds-datepicker-border-focus"],
      ["borderHover", "--ds-datepicker-border-hover"],
      ["clearColor", "--ds-datepicker-clear-color"],
      ["color", "--ds-datepicker-color"],
      ["errorBorder", "--ds-datepicker-error-border"],
      ["iconColor", "--ds-datepicker-icon-color"],
      ["separatorColor", "--ds-datepicker-separator-color"],
      ["shadowFocus", "--ds-datepicker-shadow-focus"],
      ["warningBorder", "--ds-datepicker-warning-border"],
    ],
  },
  {
    prop: "inputNumber",
    fields: [
      ["addonBg", "--ds-inputnumber-addon-bg"],
      ["addonBorder", "--ds-inputnumber-addon-border"],
      ["addonColor", "--ds-inputnumber-addon-color"],
      ["affixColor", "--ds-inputnumber-affix-color"],
      ["bg", "--ds-inputnumber-bg"],
      ["bgDisabled", "--ds-inputnumber-bg-disabled"],
      ["border", "--ds-inputnumber-border"],
      ["borderFocus", "--ds-inputnumber-border-focus"],
      ["color", "--ds-inputnumber-color"],
      ["controlColor", "--ds-inputnumber-control-color"],
      ["errorBorder", "--ds-inputnumber-error-border"],
      ["shadowFocus", "--ds-inputnumber-shadow-focus"],
      ["warningBorder", "--ds-inputnumber-warning-border"],
    ],
  },
  {
    prop: "radio",
    fields: [
      ["bg", "--ds-radio-bg"],
      ["bgDisabled", "--ds-radio-bg-disabled"],
      ["border", "--ds-radio-border"],
      ["borderHover", "--ds-radio-border-hover"],
      ["checkedBg", "--ds-radio-checked-bg"],
      ["checkedBorder", "--ds-radio-checked-border"],
      ["checkedDot", "--ds-radio-checked-dot"],
      ["descriptionColor", "--ds-radio-description-color"],
      ["errorBorder", "--ds-radio-error-border"],
      ["errorColor", "--ds-radio-error-color"],
      ["focusRing", "--ds-radio-focus-ring"],
      ["focusRingColor", "--ds-radio-focus-ring-color"],
      ["labelColor", "--ds-radio-label-color"],
      ["labelColorDisabled", "--ds-radio-label-color-disabled"],
    ],
  },
  {
    prop: "rate",
    fields: [
      ["color", "--ds-rate-color"],
    ],
  },
  {
    prop: "slider",
    fields: [
      ["focusRing", "--ds-slider-focus-ring"],
      ["handleBg", "--ds-slider-handle-bg"],
      ["handleBgDisabled", "--ds-slider-handle-bg-disabled"],
      ["handleBorder", "--ds-slider-handle-border"],
      ["handleShadow", "--ds-slider-handle-shadow"],
      ["markColor", "--ds-slider-mark-color"],
      ["railColor", "--ds-slider-rail-color"],
      ["trackColor", "--ds-slider-track-color"],
      ["trackColorDisabled", "--ds-slider-track-color-disabled"],
    ],
  },
  {
    prop: "switch",
    fields: [
      ["bg", "--ds-switch-bg"],
      ["bgHover", "--ds-switch-bg-hover"],
      ["checkedBg", "--ds-switch-checked-bg"],
      ["checkedBgHover", "--ds-switch-checked-bg-hover"],
      ["focusRing", "--ds-switch-focus-ring"],
      ["labelColor", "--ds-switch-label-color"],
      ["thumbBg", "--ds-switch-thumb-bg"],
      ["thumbShadow", "--ds-switch-thumb-shadow"],
    ],
  },
  {
    prop: "timePicker",
    fields: [
      ["bg", "--ds-timepicker-bg"],
      ["bgDisabled", "--ds-timepicker-bg-disabled"],
      ["border", "--ds-timepicker-border"],
      ["borderFocus", "--ds-timepicker-border-focus"],
      ["clearColor", "--ds-timepicker-clear-color"],
      ["color", "--ds-timepicker-color"],
      ["errorBorder", "--ds-timepicker-error-border"],
      ["iconColor", "--ds-timepicker-icon-color"],
      ["separatorColor", "--ds-timepicker-separator-color"],
      ["shadowFocus", "--ds-timepicker-shadow-focus"],
      ["warningBorder", "--ds-timepicker-warning-border"],
    ],
  },
  {
    prop: "toggle",
    fields: [
      ["descriptionColor", "--ds-toggle-description-color"],
      ["dotBg", "--ds-toggle-dot-bg"],
      ["dotShadow", "--ds-toggle-dot-shadow"],
      ["errorBg", "--ds-toggle-error-bg"],
      ["errorColor", "--ds-toggle-error-color"],
      ["focusRing", "--ds-toggle-focus-ring"],
      ["innerLabelColor", "--ds-toggle-inner-label-color"],
      ["labelColor", "--ds-toggle-label-color"],
      ["successBg", "--ds-toggle-success-bg"],
      ["trackBg", "--ds-toggle-track-bg"],
      ["trackBgChecked", "--ds-toggle-track-bg-checked"],
      ["warningBg", "--ds-toggle-warning-bg"],
    ],
  },
  {
    prop: "transfer",
    fields: [
      ["bg", "--ds-transfer-bg"],
      ["border", "--ds-transfer-border"],
      ["headerBg", "--ds-transfer-header-bg"],
      ["headerBorder", "--ds-transfer-header-border"],
      ["itemBgHover", "--ds-transfer-item-bg-hover"],
    ],
  },
  {
    prop: "upload",
    fields: [
      ["bg", "--ds-upload-bg"],
      ["border", "--ds-upload-border"],
      ["borderHover", "--ds-upload-border-hover"],
      ["buttonBg", "--ds-upload-button-bg"],
      ["buttonBorder", "--ds-upload-button-border"],
      ["buttonColor", "--ds-upload-button-color"],
      ["cardBg", "--ds-upload-card-bg"],
      ["cardBorder", "--ds-upload-card-border"],
      ["draggerBg", "--ds-upload-dragger-bg"],
      ["draggerBgHover", "--ds-upload-dragger-bg-hover"],
      ["draggerBorder", "--ds-upload-dragger-border"],
      ["draggerBorderActive", "--ds-upload-dragger-border-active"],
      ["draggerIconColor", "--ds-upload-dragger-icon-color"],
      ["draggerTextColor", "--ds-upload-dragger-text-color"],
      ["errorBorder", "--ds-upload-error-border"],
      ["fileBg", "--ds-upload-file-bg"],
      ["fileColor", "--ds-upload-file-color"],
      ["fileRemoveColor", "--ds-upload-file-remove-color"],
      ["previewBackdrop", "--ds-upload-preview-backdrop"],
      ["previewOverlay", "--ds-upload-preview-overlay"],
      ["progressBar", "--ds-upload-progress-bar"],
      ["progressTrack", "--ds-upload-progress-track"],
    ],
  },
  {
    prop: "select",
    fields: [
      ["arrowColor", "--ds-select-arrow-color"],
      ["bgDisabled", "--ds-select-bg-disabled"],
      ["border", "--ds-select-border"],
      ["borderFocus", "--ds-select-border-focus"],
      ["borderHover", "--ds-select-border-hover"],
      ["checkColor", "--ds-select-check-color"],
      ["clearColor", "--ds-select-clear-color"],
      ["clearColorHover", "--ds-select-clear-color-hover"],
      ["colorDisabled", "--ds-select-color-disabled"],
      ["dropdownBorder", "--ds-select-dropdown-border"],
      ["errorBorder", "--ds-select-error-border"],
      ["filledBg", "--ds-select-filled-bg"],
      ["optionColorDisabled", "--ds-select-option-color-disabled"],
      ["shadowFocus", "--ds-select-shadow-focus"],
      ["successBorder", "--ds-select-success-border"],
      ["tagBg", "--ds-select-tag-bg"],
      ["tagColor", "--ds-select-tag-color"],
      ["warningBorder", "--ds-select-warning-border"],
    ],
  },];

/** The three channels that got no typed field: both modes were deletes. */
const BOTH_DELETE = [
  "--ds-inputnumber-control-bg",
  "--ds-rate-color-active",
  "--ds-rate-color-hover",
] as const;

/**
 * The eight select channels the T1 P0 repair already removed, kept here so the
 * reinsert mutant can prove that leg 2's boundary is still defended after leg
 * 3 drained the other eighteen. These are NOT part of the T2 roster.
 */
const T1_REPAIRED_SELECT = [
  "--ds-select-bg",
  "--ds-select-color",
  "--ds-select-color-placeholder",
  "--ds-select-dropdown-bg",
  "--ds-select-dropdown-shadow",
  "--ds-select-option-bg-hover",
  "--ds-select-option-bg-selected",
  "--ds-select-option-color-selected",
] as const;

// EXCISED (SEV-2): `const live = parseExtension(readFileSync(EXTENSION, ...))`.
// A module-level read of `artifacts/rottay/_source/extension.css`, which SEV-2
// deleted; it would now throw ENOENT at collection and take the suite down.
// Every assertion it fed is named where it was removed. The survivor set it
// measured was ALREADY empty (ROTTAY-T3 drained the last 380 rows), so nothing
// below loses a non-vacuous claim — but the emptiness was measured then and is
// structural now: `scripts/verticals/first-party-single-author-gate/index.mjs` law G2 fails if
// the file or any `_source/` directory reappears.
const migrateRows = T2_ROSTER.filter((row) => row.disposition === "migrate");
const deleteRows = T2_ROSTER.filter((row) => row.disposition === "delete");
const t2Names = [...new Set(T2_ROSTER.map((row) => row.name))].sort();
const t2Keys = new Set(T2_ROSTER.map((row) => `${row.mode}|${row.name}`));

const compiled = compileBrandTheme({
  brandTheme: rottayBrandTheme,
  tenantSlug: "rottay",
});
const modeBlocks = compiled.modeBlocks ?? [];
const lightBlock = modeBlocks.find((block) => block.mode === "light");
const EMITTED: Record<Mode, Record<string, string>> = {
  dark: compiled.cssVariables,
  light: { ...compiled.cssVariables, ...(lightBlock?.cssVariables ?? {}) },
};

/** First `:root` declaration wins, exactly as the cascade reads the file. */
function rootVariables(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  postcss.parse(source).walkRules((rule) => {
    if (!/(^|[\s,]):root\b/.test(rule.selector)) return;
    rule.walkDecls((declaration) => {
      if (!declaration.prop.startsWith("--")) return;
      if (declaration.prop in out) return;
      out[declaration.prop] = declaration.value.trim();
    });
  });
  return out;
}

const DEFAULT_FLOORS = rootVariables(readFileSync(DEFAULT_CSS, "utf8"));
const COMPONENT_FLOORS: Record<string, string> = {};
const COMPONENT_FLOOR_SOURCE: Record<string, string> = {};
for (const file of readdirSync(COMPONENTS_DIR)
  .filter((name) => name.endsWith(".css"))
  .sort()) {
  const vars = rootVariables(readFileSync(join(COMPONENTS_DIR, file), "utf8"));
  for (const [name, value] of Object.entries(vars)) {
    if (name in COMPONENT_FLOORS) continue;
    COMPONENT_FLOORS[name] = value;
    COMPONENT_FLOOR_SOURCE[name] = `components/${file}`;
  }
}

interface Resolution {
  readonly value: string;
  readonly source: string;
}

/**
 * The post-drain cascade, in the order the browser reads it:
 *
 *   1. the surviving extension row (tenant layer, authored CSS)
 *   2. the compiled tenant artifact (tenant layer, `chromeToVariables`)
 *   3. `default.css` `:root`
 *   4. a component `:root` block
 *
 * `skipTenantFor` drops layers 1 and 2 for ONE name and one name only. It is
 * what makes the delete adjudication non-circular: an MX channel is restated
 * in `modes.light` purely to stop the dark body bleeding, so asking "does it
 * still paint?" while reading that restatement would answer itself. Nested
 * `var()` lookups always read the full stack, because the derivation the
 * deleted line echoed is allowed to be a tenant channel.
 */
function lookup(
  mode: Mode,
  name: string,
  skipTenantFor?: string
): Resolution | null {
  if (name !== skipTenantFor) {
    // EXCISED (SEV-2): the "extension" resolution tier. `live` was searched
    // first here, so an extension row would have shadowed the compiled value.
    // With the file gone the compiled artifact is the only tenant author, which
    // is the single-author law this resolver used to have to work around.
    const emitted = EMITTED[mode][name];
    if (emitted !== undefined)
      return { value: emitted, source: "tenant-compiled" };
  }
  const fallback = DEFAULT_FLOORS[name];
  if (fallback !== undefined)
    return { value: fallback, source: "default.css" };
  const component = COMPONENT_FLOORS[name];
  if (component !== undefined)
    return { value: component, source: COMPONENT_FLOOR_SOURCE[name] as string };
  return null;
}

/** Resolve to the paint a browser would produce. `initial`/`unset` are resets. */
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
    const key = `${mode}|${name}`;
    if (seen.has(key)) return null;
    const next = new Set(seen);
    next.add(key);
    const found = lookup(mode, name);
    const resolved = found
      ? resolveValue(mode, found.value, depth + 1, next)
      : null;
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

/**
 * The pre-image this file can still account for: the 302 declarations THIS
 * tranche removed. It was once `roster + survivors read from disk`, but the
 * survivor half reached zero when ROTTAY-T3 drained the remaining 380, and
 * SEV-2 then deleted the file the survivors were read from. Both halves of the
 * old reconstruction are therefore gone as a DISK claim; what remains is the
 * roster this tranche signed, which is the only half T2 ever owned.
 */
const PRE_IMAGE: readonly Declaration[] = [...T2_ROSTER];

const DB_CONTEXT = {
  tenantId: "rottay-t2",
  slug: "rottay-t2",
  verticalKey: "rottay",
  rowVersion: 1,
} as const;
const ENVELOPE = getTenantThemeVerticalEnvelope("rottay");

/** Build the smallest advanced document that carries one chrome field. */
function buildDocument(prop: string, field: string, value: string): unknown {
  return {
    schemaVersion: TENANT_THEME_CONFIG_SCHEMA.schemaVersion,
    mode: "advanced",
    visualFoundation: {
      advanced: { chrome: { controls: { [prop]: { [field]: value } } } },
    },
  };
}

function compileDocument(document: unknown): Record<string, string> {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, DB_CONTEXT),
    { verticalEnvelope: ENVELOPE }
  ).variables;
}

type Controls = Record<string, Record<string, string> | undefined>;

/**
 * Rottay is dark-default, so `modes.light` is the light authority. It is
 * optional in the Theme type because a single-mode brand is legal; for THIS
 * theme its absence would silently turn every light-side assertion below into
 * a vacuous pass, so the accessor fails loudly instead of narrowing with `!`.
 */
function lightControlsOf(theme: typeof rottayBrandTheme): Controls {
  const light = theme.modes.light?.chrome?.controls;
  if (!light) {
    throw new Error(
      "rottay must author modes.light.chrome.controls: the light-side authority is missing"
    );
  }
  return light as unknown as Controls;
}

const bodyControls = rottayBrandTheme.chrome.controls as unknown as Controls;
const lightControls = lightControlsOf(rottayBrandTheme);

describe("ROTTAY-T2 MASS - the signed partition", () => {
  it("carries the roster the work order signed, not a roster that fits", () => {
    expect(T2_ROSTER).toHaveLength(CENSUS.removedDeclarations);
    expect(t2Names).toHaveLength(CENSUS.removedChannels);
    expect(rosterHash(T2_ROSTER)).toBe(PINS.t2Roster);
    expect(tupleHash(T2_ROSTER)).toBe(PINS.t2Tuple);
  });

  it("declares every channel in both modes, so 151 x 2 is a fact not a hope", () => {
    const perMode = { dark: 0, light: 0 };
    const byName = new Map<string, Set<Mode>>();
    for (const row of T2_ROSTER) {
      perMode[row.mode] += 1;
      const modes = byName.get(row.name) ?? new Set<Mode>();
      expect(modes.has(row.mode), `${row.mode} ${row.name} duplicated`).toBe(
        false
      );
      modes.add(row.mode);
      byName.set(row.name, modes);
    }
    expect(perMode).toEqual({ dark: 151, light: 151 });
    const partial = [...byName]
      .filter(([, modes]) => modes.size !== 2)
      .map(([name]) => name);
    expect(partial).toEqual([]);
  });

  it("splits 261 migrate / 41 delete / 0 hold, with the signed membership", () => {
    expect(migrateRows).toHaveLength(CENSUS.migrateTuples);
    expect(deleteRows).toHaveLength(CENSUS.deleteTuples);
    expect(migrateRows.length + deleteRows.length).toBe(
      CENSUS.removedDeclarations
    );
    expect(CENSUS.holdTuples).toBe(0);
    expect(membershipHash(migrateRows)).toBe(PINS.migrateMembership);
    expect(membershipHash(deleteRows)).toBe(PINS.deleteMembership);
    expect(rosterHash(migrateRows)).toBe(PINS.migrateNames);
    expect(rosterHash(deleteRows)).toBe(PINS.deleteNames);
    expect(tupleHash(migrateRows)).toBe(PINS.migrateSideTuple);
    expect(tupleHash(deleteRows)).toBe(PINS.deleteSideTuple);
  });

  it("keeps the two sides disjoint and non-empty", () => {
    const migrateKeys = new Set(
      migrateRows.map((row) => `${row.mode}|${row.name}`)
    );
    const overlap = deleteRows.filter((row) =>
      migrateKeys.has(`${row.mode}|${row.name}`)
    );
    expect(overlap).toEqual([]);
    expect(migrateRows.length).toBeGreaterThan(0);
    expect(deleteRows.length).toBeGreaterThan(0);
  });

  it("classifies the 151 channels 113/27/8/3 by mode, not by family", () => {
    const dispositionOf = (mode: Mode, name: string): Disposition =>
      T2_ROSTER.find((row) => row.mode === mode && row.name === name)
        ?.disposition as Disposition;
    const classes: Record<string, string[]> = { MM: [], MX: [], XM: [], XX: [] };
    for (const name of t2Names) {
      const code =
        (dispositionOf("dark", name) === "migrate" ? "M" : "X") +
        (dispositionOf("light", name) === "migrate" ? "M" : "X");
      (classes[code] as string[]).push(name);
    }
    expect({
      MM: classes.MM?.length,
      MX: classes.MX?.length,
      XM: classes.XM?.length,
      XX: classes.XX?.length,
    }).toEqual({ MM: 113, MX: 27, XM: 8, XX: 3 });
    expect(classes.XX).toEqual([...BOTH_DELETE]);
    // 148 typed leaves = every channel that migrates in at least one mode.
    expect(
      (classes.MM?.length ?? 0) +
        (classes.MX?.length ?? 0) +
        (classes.XM?.length ?? 0)
    ).toBe(CENSUS.typedLeaves);
  });
});

describe("ROTTAY-T2 MASS - the T3 remainder has since been drained", () => {
  /**
   * When this file was written the 380-declaration remainder was still on
   * disk, and these assertions read it there. `ROTTAY-T3 MASS` has since taken
   * all 380, so the remainder is no longer a survivor set this file can weigh:
   * `rottay-t3-mass-drain.test.ts` now carries those 380 rows as ITS signed
   * roster and re-proves the same two hashes from them.
   *
   * What stays here is the half of the claim T2 still owns -- the ARITHMETIC
   * of the chain and the fact that the remainder it measured was real -- plus
   * a disk read that confirms the handover actually happened. The T3 pins are
   * kept verbatim so the two files agree by hash and not by narrative.
   */
  it("hands the 380 rows to the T3 tranche, keeping the signed pins", () => {
    expect(PINS.t3Roster).not.toBe(EMPTY_LIST_HASH);
    expect(PINS.t3Tuple).not.toBe(EMPTY_LIST_HASH);
    expect(T3_REMAINDER.declarations).toBe(CENSUS.postCustomProperties);
    expect(T3_REMAINDER.channels).toBe(190);
    expect(T3_REMAINDER.perMode).toBe(CENSUS.perModeAfter);
    expect(T3_REMAINDER.perMode * 2).toBe(T3_REMAINDER.declarations);
    expect(T3_REMAINDER.channels).toBe(T3_REMAINDER.perMode);
  });

  it("closes the chain: 682 = 302 drained here + 380 drained by T3", () => {
    expect(CENSUS.removedDeclarations + T3_REMAINDER.declarations).toBe(
      CENSUS.preCustomProperties
    );
    expect(CENSUS.removedChannels + T3_REMAINDER.channels).toBe(
      CENSUS.perModeBefore
    );
  });

  // EXCISED (SEV-2): "shares no channel with the T2 roster". It was already
  // vacuous on disk and was kept as the tripwire that would fire first if a T3
  // channel were re-authored into the extension. G2 is the stronger tripwire:
  // the file cannot exist to be re-authored into.

  it("accounts for exactly its own 302, not bytes another tranche owns", () => {
    // Was: "no longer reconstructs the 682 pre-image, because the disk half is
    // gone". The `expect(live).toEqual([])` line is excised with the read; the
    // arithmetic it guarded is untouched and still runs.
    expect(PRE_IMAGE).toHaveLength(CENSUS.removedDeclarations);
    expect(PRE_IMAGE.every((row) => t2Keys.has(`${row.mode}|${row.name}`))).toBe(
      true
    );
  });
});

// EXCISED (SEV-2): describe "ROTTAY-T2 MASS - what the file on disk now says"
// — 5 tests, all of them reading `artifacts/rottay/_source/extension.css`
// (the describe body itself opened with `readFileSync(EXTENSION)`, so it threw
// at collection):
//   * "counts 0 custom properties and 1 declaration of any kind"
//   * "keeps the one non-custom declaration -- the root color -- untouched"
//   * "declares none of the 151 drained channels, in either mode"
//   * "leaves no empty rule behind where a family used to be"
//   * "removed the roster and nothing else"
// The second is the one that mattered: it pinned the file's last surviving
// line as `color: var(--ds-color-text-primary, #F0F0F0)` — the extension
// authoring the document-root ink with a LITERAL fallback. SEV-1 moved that
// authorship into the compiled artifact and made it fail closed on a missing
// channel instead of silently painting #F0F0F0, and the render laws in
// `artifact-renderer/tests/single-author.test.ts` (L1/L4/L6/L7) now prove it.
// The remaining four asserted an empty/clean corpus; law G2 asserts no corpus.

describe("ROTTAY-T2 MASS - the paint did not move", () => {
  /**
   * The whole pre-image is literal: not one of the 682 declarations carried a
   * `var()` chain, and not one referenced a channel this tranche drained. That
   * is what lets the pre-drain paint be read straight off the roster instead
   * of being simulated -- and it is asserted, not assumed, because the proof
   * below is only as honest as this precondition.
   */
  it("has a fully literal pre-image, so the before-paint needs no simulation", () => {
    const chains = PRE_IMAGE.filter((row) => row.value.includes("var("));
    expect(chains).toEqual([]);
    const referencing = PRE_IMAGE.filter((row) =>
      t2Names.some((name) => row.value.includes(name))
    );
    expect(referencing).toEqual([]);
  });

  it.each(
    T2_ROSTER.map((row) => [`${row.mode} ${row.name}`, row] as const)
  )("%s paints exactly what the removed line painted", (_label, row) => {
    const found = lookup(row.mode, row.name);
    expect(found, `${row.mode} ${row.name} resolves to nothing`).not.toBeNull();
    const after = resolveValue(row.mode, (found as Resolution).value);
    expect(after, `${row.mode} ${row.name} dead-ends`).not.toBeNull();
    expect(after).toBe(bare(row.value));
  });

  it("repaints all 682 pre-image tuples, survivors included, with no exception", () => {
    const broken: string[] = [];
    for (const row of PRE_IMAGE) {
      const found = lookup(row.mode, row.name);
      const after = found ? resolveValue(row.mode, found.value) : null;
      if (after !== bare(row.value))
        broken.push(`${row.mode}|${row.name}: ${String(after)}`);
    }
    expect(broken).toEqual([]);
  });

  it("names the layer each drained tuple now paints from", () => {
    const census: Record<string, number> = {};
    for (const row of T2_ROSTER) {
      const found = lookup(row.mode, row.name) as Resolution;
      census[found.source] = (census[found.source] ?? 0) + 1;
    }
    // Nothing falls back to the extension: the family left the stylesheet.
    expect(census.extension).toBeUndefined();
    expect(census["tenant-compiled"]).toBe(CENSUS.migrateTuples + 27);
    expect(
      Object.entries(census)
        .filter(([source]) => source !== "tenant-compiled")
        .reduce((total, [, count]) => total + count, 0)
    ).toBe(41 - 27);
  });
});

describe("ROTTAY-T2 MASS - the 41 deletes were derivations, not paint", () => {
  it.each(deleteRows.map((row) => [`${row.mode} ${row.name}`, row] as const))(
    "%s still resolves to what the line said, without the tenant layer",
    (_label, row) => {
      const floor = lookup(row.mode, row.name, row.name);
      expect(floor, `${row.mode} ${row.name} has no floor`).not.toBeNull();
      const after = resolveValue(row.mode, (floor as Resolution).value);
      expect(after, `${row.mode} ${row.name} dead-ends`).not.toBeNull();
      expect(after).toBe(bare(row.value));
    }
  );

  it("takes 36 floors from default.css and 5 from component roots", () => {
    const census: Record<string, number> = {};
    for (const row of deleteRows) {
      const floor = lookup(row.mode, row.name, row.name) as Resolution;
      census[floor.source] = (census[floor.source] ?? 0) + 1;
    }
    expect(census).toEqual({
      "default.css": 36,
      "components/checkbox.css": 1,
      "components/radio.css": 1,
      "components/select.css": 2,
      "components/toggle.css": 1,
    });
  });

  it("proves the 27 anti-bleed restatements are not what carries the proof", () => {
    // Every MX light delete IS emitted by the tenant layer -- that is the
    // restatement. The adjudication above skipped it and still resolved, so
    // the restatement is machinery, not evidence.
    const restated = deleteRows.filter(
      (row) =>
        row.mode === "light" && EMITTED.light[row.name] !== undefined
    );
    expect(restated).toHaveLength(27);
    for (const row of restated) {
      expect(bare(EMITTED.light[row.name] as string)).toBe(bare(row.value));
    }
  });

  it("leaves the 8 XM dark tuples unset in the body, not repainted", () => {
    const darkDeletes = deleteRows.filter((row) => row.mode === "dark");
    expect(darkDeletes).toHaveLength(11);
    const xm = darkDeletes.filter(
      (row) => !BOTH_DELETE.includes(row.name as (typeof BOTH_DELETE)[number])
    );
    expect(xm).toHaveLength(8);
    for (const row of xm) {
      expect(
        compiled.cssVariables[row.name],
        `${row.name} authored in the dark body`
      ).toBeUndefined();
      expect(lightBlock?.cssVariables[row.name]).toBeDefined();
    }
  });

  it("keeps --ds-upload-dragger-bg-hover a MIGRATE in both modes, causally", () => {
    // The mandatory causal finding. The floor is `var(--ds-color-bg-hover)`,
    // which resolves to #131316 dark and #f0efee light -- neither equals the
    // authored #1A1A1E / #F4F4F3, so neither tuple could be deleted. If this
    // channel is ever re-adjudicated as a delete, this test is the reason it
    // must not be.
    const name = "--ds-upload-dragger-bg-hover";
    const rows = T2_ROSTER.filter((row) => row.name === name);
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.disposition)).toEqual(["migrate", "migrate"]);
    expect(bodyControls.upload?.draggerBgHover).toBe("#1A1A1E");
    expect(lightControls.upload?.draggerBgHover).toBe("#F4F4F3");
    for (const row of rows) {
      const floor = lookup(row.mode, name, name);
      expect(floor?.value).toBe("var(--ds-color-bg-hover)");
      const resolved = resolveValue(row.mode, (floor as Resolution).value);
      expect(resolved).not.toBe(bare(row.value));
    }
    expect(resolveValue("dark", "var(--ds-color-bg-hover)")).toBe("#131316");
    expect(resolveValue("light", "var(--ds-color-bg-hover)")).toBe("#f0efee");
  });
});

describe("ROTTAY-T2 MASS - the typed shape is closed and total", () => {
  it("declares 12 new families plus a grown select, 148 leaves in all", () => {
    expect(FAMILIES).toHaveLength(13);
    const total = FAMILIES.reduce(
      (sum, family) => sum + family.fields.length,
      0
    );
    expect(total).toBe(CENSUS.typedLeaves);
    expect(
      Object.fromEntries(
        FAMILIES.map((family) => [family.prop, family.fields.length])
      )
    ).toEqual({
      autocomplete: 10,
      checkbox: 13,
      datePicker: 12,
      inputNumber: 13,
      radio: 14,
      rate: 1,
      select: 18,
      slider: 9,
      switch: 8,
      timePicker: 11,
      toggle: 12,
      transfer: 5,
      upload: 22,
    });
  });

  it("maps every leaf to a channel the roster actually drained", () => {
    const channels = FAMILIES.flatMap((family) =>
      family.fields.map(([, channel]) => channel)
    );
    expect(new Set(channels).size).toBe(CENSUS.typedLeaves);
    const stray = channels.filter((channel) => !t2Names.includes(channel));
    expect(stray).toEqual([]);
    const uncovered = t2Names.filter((name) => !channels.includes(name));
    expect(uncovered.sort()).toEqual([...BOTH_DELETE].sort());
  });

  it("gives the three both-delete channels no field anywhere", () => {
    for (const channel of BOTH_DELETE) {
      const owner = FAMILIES.find((family) =>
        family.fields.some(([, mapped]) => mapped === channel)
      );
      expect(owner, `${channel} acquired a field`).toBeUndefined();
      expect(EMITTED.dark[channel]).toBeUndefined();
      expect(EMITTED.light[channel]).toBeUndefined();
    }
  });

  it("declares every leaf in the closed default shape, and nothing else", () => {
    const shape = DEFAULT_CHROME_SHAPE.controls as unknown as Controls;
    for (const family of FAMILIES) {
      const declared = shape[family.prop];
      expect(declared, `${family.prop} missing from DEFAULT_CHROME_SHAPE`)
        .toBeDefined();
      const known = new Set(Object.keys(declared as object));
      const undeclared = family.fields
        .map(([field]) => field)
        .filter((field) => !known.has(field));
      expect(undeclared, `${family.prop} undeclared fields`).toEqual([]);
    }
    expect(Object.keys(shape.select as object)).toHaveLength(33);
  });

  it("authors the union of body and light exactly, with no `initial`", () => {
    for (const family of FAMILIES) {
      const union = new Set([
        ...Object.keys(bodyControls[family.prop] ?? {}),
        ...Object.keys(lightControls[family.prop] ?? {}),
      ]);
      // The twelve new families are closed at exactly the leaves this
      // tranche authored. `select` is the one family that pre-existed, so its
      // union is the whole 33-field shape: the core 15 plus the 18 added here.
      const expected =
        family.prop === "select"
          ? Object.keys(
              (DEFAULT_CHROME_SHAPE.controls as unknown as Controls)
                .select as object
            ).sort()
          : family.fields.map(([field]) => field).sort();
      expect([...union].sort(), `${family.prop} union`).toEqual(expected);
      for (const [field] of family.fields) {
        expect(union.has(field), `${family.prop}.${field} unauthored`).toBe(
          true
        );
      }
      for (const source of [bodyControls, lightControls]) {
        for (const value of Object.values(source[family.prop] ?? {})) {
          expect(value).not.toBe("initial");
          expect(value).not.toBe("unset");
        }
      }
    }
  });

  it("keeps --ds-select-border distinct from --ds-select-border-color", () => {
    const select = FAMILIES.find((family) => family.prop === "select");
    const channels = (select?.fields ?? []).map(([, channel]) => channel);
    expect(channels).toContain("--ds-select-border");
    expect(channels).not.toContain("--ds-select-border-color");
    expect(EMITTED.dark["--ds-select-border"]).toBeDefined();
    expect(EMITTED.dark["--ds-select-border-color"]).toBeDefined();
    expect(EMITTED.dark["--ds-select-border"]).not.toBe(
      EMITTED.dark["--ds-select-border-color"]
    );
  });
});

describe("ROTTAY-T2 MASS - one lowering, both transports", () => {
  const PROBE = "#010203";
  const pairs = FAMILIES.flatMap((family) =>
    family.fields.map(
      ([field, channel]) =>
        [`${family.prop}.${field}`, family.prop, field, channel] as const
    )
  );

  it.each(pairs)(
    "%s is lowered by the shared producer in both transports",
    (_label, prop, field, channel) => {
      // DB transport: the field alone must reach the channel. `.variables` is
      // a delta against the code-owned vertical baseline, so the probe value
      // has to differ from the authored one for the delta to exist at all --
      // which is exactly why a missing lowering shows up as an empty delta.
      const document = buildDocument(prop, field, PROBE);
      const validated = validateTenantThemeDocument(document);
      expect(validated.success, `${prop}.${field} rejected`).toBe(true);
      expect(compileDocument(document)[channel]).toBe(PROBE);

      // Static transport: remove the field from both mode authorities and the
      // channel must disappear. If it survives, something else emits it and
      // the field was never the authority.
      const clone = structuredClone(rottayBrandTheme);
      const body = (clone.chrome.controls as unknown as Controls)[prop];
      const light = lightControlsOf(clone)[prop];
      if (body) delete body[field];
      if (light) delete light[field];
      const stripped = compileBrandTheme({
        brandTheme: clone,
        tenantSlug: "rottay",
      });
      const strippedLight = (stripped.modeBlocks ?? []).find(
        (block) => block.mode === "light"
      );
      const effective = {
        ...stripped.cssVariables,
        ...(strippedLight?.cssVariables ?? {}),
      };
      expect(effective[channel]).toBeUndefined();
    }
  );

  // EXCISED (SEV-2): "emits each channel once, and never alongside an extension
  // row" — a compiled-vs-extension collision check over `live`. There is no
  // second author to collide with; G2 keeps it that way.

  it("does not branch on the tenant slug", () => {
    const channels = FAMILIES.flatMap((family) =>
      family.fields.map(([, channel]) => channel)
    );
    for (const slug of ["rottay", "acme-holdings", "zzz"]) {
      const other = compileBrandTheme({
        brandTheme: rottayBrandTheme,
        tenantSlug: slug,
      });
      const otherLight = (other.modeBlocks ?? []).find(
        (block) => block.mode === "light"
      );
      const effective = {
        ...other.cssVariables,
        ...(otherLight?.cssVariables ?? {}),
      };
      for (const channel of channels) {
        expect(effective[channel], `${slug} ${channel}`).toBe(
          EMITTED.light[channel]
        );
      }
    }
  });
});

describe("ROTTAY-T2 MASS - the DB documents of the thirteen families", () => {
  const t2Fields = new Map(
    FAMILIES.map((family) => [
      family.prop,
      new Set(family.fields.map(([field]) => field)),
    ])
  );

  /** Project a mode authority down to the T2 leaves it owns. */
  function project(source: Controls): Record<string, Record<string, string>> {
    const controls: Record<string, Record<string, string>> = {};
    for (const [prop, fields] of t2Fields) {
      const authored = source[prop];
      if (!authored) continue;
      const leaves: Record<string, string> = {};
      for (const [field, value] of Object.entries(authored)) {
        if (fields.has(field)) leaves[field] = value;
      }
      if (Object.keys(leaves).length > 0) controls[prop] = leaves;
    }
    return controls;
  }

  const asDocument = (
    controls: Record<string, Record<string, string>>
  ): unknown => ({
    schemaVersion: TENANT_THEME_CONFIG_SCHEMA.schemaVersion,
    mode: "advanced",
    visualFoundation: { advanced: { chrome: { controls } } },
  });

  const darkControls = project(bodyControls);
  const lightProjected = project(lightControls);

  it("admits all thirteen families as one advanced document", () => {
    for (const controls of [darkControls, lightProjected]) {
      expect(Object.keys(controls).sort()).toEqual(
        FAMILIES.map((family) => family.prop).sort()
      );
      const validated = validateTenantThemeDocument(asDocument(controls));
      expect(validated.success).toBe(true);
    }
    expect(
      Object.values(darkControls).reduce(
        (total, leaves) => total + Object.keys(leaves).length,
        0
      )
    ).toBe(140);
    expect(
      Object.values(lightProjected).reduce(
        (total, leaves) => total + Object.keys(leaves).length,
        0
      )
    ).toBe(141);
  });

  it("compiles the dark document to a ZERO delta -- byte-identical, not merely close", () => {
    // `compileTenantThemeConfig` emits only what differs from the code-owned
    // vertical baseline, and that baseline IS the static rottay BrandTheme.
    // A DB document carrying the same 140 leaves therefore has nothing to
    // override. Zero is the strongest form of byte-identity available here:
    // a single drifting byte would surface as a one-entry delta.
    expect(compileDocument(asDocument(darkControls))).toEqual({});
  });

  it("shows the zero delta is a comparison, not an empty pipeline", () => {
    const mutated = structuredClone(darkControls);
    (mutated.upload as Record<string, string>).draggerBgHover = "#123456";
    const delta = compileDocument(asDocument(mutated));
    expect(delta).toEqual({ "--ds-upload-dragger-bg-hover": "#123456" });
  });

  it("compiles the light document to 141 entries, each byte-equal to the static light artifact", () => {
    const delta = compileDocument(asDocument(lightProjected));
    const names = Object.keys(delta).sort();
    expect(names).toHaveLength(141);
    for (const name of names) {
      expect(t2Names).toContain(name);
      expect(delta[name]).toBe(EMITTED.light[name]);
    }
  });

  it("omits exactly the seven channels whose light paint equals its dark paint", () => {
    const delta = compileDocument(asDocument(lightProjected));
    const channels = FAMILIES.flatMap((family) =>
      family.fields.map(([, channel]) => channel)
    );
    const omitted = channels.filter((channel) => !(channel in delta)).sort();
    const identical = t2Names
      .filter((name) => {
        const dark = T2_ROSTER.find(
          (row) => row.mode === "dark" && row.name === name
        );
        const light = T2_ROSTER.find(
          (row) => row.mode === "light" && row.name === name
        );
        return (
          dark?.disposition === "migrate" &&
          light?.disposition === "migrate" &&
          bare(dark.value) === bare(light?.value ?? "")
        );
      })
      .sort();
    expect(identical).toHaveLength(7);
    expect(omitted).toEqual(identical);
  });
});

describe("ROTTAY-T2 MASS - the select vocabulary opened by exactly eighteen names", () => {
  const selectFields =
    FAMILIES.find((family) => family.prop === "select")?.fields ?? [];

  it("rejects a select field the schema does not declare", () => {
    const validated = validateTenantThemeDocument(
      buildDocument("select", "notAField", "#ffffff")
    );
    expect(validated.success).toBe(false);
    expect(validated.success ? [] : validated.issues.map((i) => i.code)).toEqual(
      ["unknown_key"]
    );
  });

  it("admits each of the eighteen names the extension is now closed against", () => {
    // Before this tranche these eighteen were unknown keys and failed exactly
    // as `notAField` still does; the schema extension is what admits them, and
    // the rejection above is the same mechanism still guarding the boundary.
    expect(selectFields).toHaveLength(18);
    for (const [field] of selectFields) {
      const validated = validateTenantThemeDocument(
        buildDocument("select", field, "#ffffff")
      );
      expect(validated.success, `select.${field} rejected`).toBe(true);
    }
  });

  it("keeps the pre-existing fifteen admissible by key", () => {
    const shape = DEFAULT_CHROME_SHAPE.controls as unknown as Controls;
    const added = new Set(selectFields.map(([field]) => field));
    const core = Object.keys(shape.select as object).filter(
      (field) => !added.has(field)
    );
    expect(core).toHaveLength(15);
    for (const field of core) {
      const validated = validateTenantThemeDocument(
        buildDocument("select", field, "#ffffff")
      );
      expect(validated.success, `select.${field} rejected`).toBe(true);
    }
  });

  it("records which core select fields a DB document may not carry", () => {
    // Not a T2 regression and not fixed here. Seven of the core fifteen are
    // authored as `var()` chains in the STATIC theme, and the DB value guard
    // refuses six of them outright -- `borderColorFocus` is the exception,
    // because its chain targets a channel the guard admits. That asymmetry is
    // recorded, not repaired: it predates this tranche and belongs to the
    // core fifteen, never to the eighteen added here.
    //
    // Every one of the 148 leaves this tranche added is a plain literal, so
    // the DB transport carries the whole tranche without exception -- which is
    // the fact the zero-delta proof above depends on.
    const chained = Object.entries(bodyControls.select ?? {})
      .filter(([, value]) => value.includes("var("))
      .map(([field]) => field)
      .sort();
    expect(chained).toEqual([
      "bgFocus",
      "bgHover",
      "borderColor",
      "borderColorFocus",
      "borderColorHover",
      "dropdownBorderColor",
      "optionColor",
    ]);
    const admitted = chained.filter(
      (field) =>
        validateTenantThemeDocument(
          buildDocument(
            "select",
            field,
            (bodyControls.select as Record<string, string>)[field] as string
          )
        ).success
    );
    expect(admitted).toEqual(["borderColorFocus"]);
    const added = new Set(selectFields.map(([field]) => field));
    expect(chained.filter((field) => added.has(field))).toEqual([]);
    expect(
      T2_ROSTER.filter((row) => row.value.includes("var("))
    ).toEqual([]);
  });
});

describe("ROTTAY-T2 MASS - causality", () => {
  /**
   * Every mutation below preserves the declaration COUNT or the field COUNT,
   * so none of them can be caught by a census alone -- which is exactly why
   * the census is not the whole gate.
   */
  it("a swapped dark/light pair keeps 302 rows and breaks the tuple hash", () => {
    const target = migrateRows.find(
      (row) =>
        row.mode === "dark" &&
        migrateRows.some(
          (other) =>
            other.mode === "light" &&
            other.name === row.name &&
            other.value !== row.value
        )
    ) as RosterRow;
    const partner = migrateRows.find(
      (row) => row.mode === "light" && row.name === target.name
    ) as RosterRow;
    const swapped = T2_ROSTER.map((row) => {
      if (row === target) return { ...row, value: partner.value };
      if (row === partner) return { ...row, value: target.value };
      return row;
    });
    expect(swapped).toHaveLength(CENSUS.removedDeclarations);
    expect(rosterHash(swapped)).toBe(PINS.t2Roster);
    expect(membershipHash(swapped)).toBe(membershipHash(T2_ROSTER));
    expect(tupleHash(swapped)).not.toBe(PINS.t2Tuple);
  });

  // EXCISED (SEV-2): three reinsertion mutants — "a reinserted T2 row is caught
  // even though it restores a byte-equal value", "a reinserted T1-repaired
  // select row is still caught by the same detector", and "a row reinserted in
  // the WRONG block is caught as a mode conflict". All three planted a row into
  // the live extension corpus (`[...live, planted]`). Rewriting them as
  // `[planted]` would keep three greens while deleting what they tested: the
  // reinsertion channel, not the detector. That channel is closed structurally
  // by `scripts/verticals/first-party-single-author-gate/index.mjs` law G2. The roster-hash and
  // duplicate-row mutants below are UNTOUCHED — they mutate T2_ROSTER, not the
  // file. One byte-equality claim did belong to the compiler rather than the
  // corpus, and is preserved here so it is not lost with the drill:
  it("the reinserted-row value the detector used to catch is the compiled byte", () => {
    const row = migrateRows.find(
      (candidate) =>
        candidate.mode === "dark" &&
        EMITTED.dark[candidate.name] !== undefined
    ) as RosterRow;
    expect(bare(row.value)).toBe(bare(EMITTED.dark[row.name] as string));
    // The T1-repaired select channels are still compiled, which is why a
    // reinsertion would have been a restatement rather than a new authority.
    for (const name of T1_REPAIRED_SELECT) {
      expect(EMITTED.dark[name], `${name} not compiled`).toBeDefined();
    }
  });

  it("a duplicated row is caught even though every name is legitimate", () => {
    // Originally planted on a surviving declaration; the survivors are gone,
    // so it is planted on the signed roster instead. The point is unchanged:
    // the roster recipe dedupes through a Set and cannot see a repeat, and the
    // tuple recipe does not, so the two hashes are not redundant with each
    // other -- one of them has to move for a duplicate to be caught at all.
    const first = T2_ROSTER[0] as Declaration;
    const mutated: readonly Declaration[] = [...T2_ROSTER, { ...first }];
    expect(mutated).toHaveLength(CENSUS.removedDeclarations + 1);
    const seen = new Set<string>();
    const duplicates = mutated.filter((row) => {
      const key = `${row.mode}|${row.name}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    expect(duplicates).toHaveLength(1);
    expect(rosterHash(mutated)).toBe(PINS.t2Roster);
    expect(tupleHash(mutated)).not.toBe(PINS.t2Tuple);
  });

  it("moving an anti-bleed light restatement into the dark body changes the paint", () => {
    const row = deleteRows.find(
      (candidate) =>
        candidate.mode === "light" &&
        EMITTED.light[candidate.name] !== undefined &&
        EMITTED.dark[candidate.name] !== undefined
    ) as RosterRow;
    const darkRow = T2_ROSTER.find(
      (candidate) => candidate.mode === "dark" && candidate.name === row.name
    ) as RosterRow;
    // The light restatement and the dark authority are different paints; if
    // the restatement were authored in the body instead of `modes.light`, the
    // dark tuple would repaint and the paint proof above would go red.
    expect(bare(row.value)).not.toBe(bare(darkRow.value));
    expect(bare(EMITTED.dark[row.name] as string)).toBe(bare(darkRow.value));
    expect(bare(EMITTED.light[row.name] as string)).toBe(bare(row.value));
  });

  it("a dropped light delta lets the dark body bleed into light", () => {
    const row = deleteRows.find(
      (candidate) =>
        candidate.mode === "light" &&
        lightControls[
          FAMILIES.find((family) =>
            family.fields.some(([, channel]) => channel === candidate.name)
          )?.prop ?? ""
        ] !== undefined
    ) as RosterRow;
    const family = FAMILIES.find((candidate) =>
      candidate.fields.some(([, channel]) => channel === row.name)
    );
    const field = family?.fields.find(([, channel]) => channel === row.name);
    const clone = structuredClone(rottayBrandTheme);
    const light = lightControlsOf(clone)[family?.prop as string];
    if (light) delete light[field?.[0] as string];
    const bled = compileBrandTheme({ brandTheme: clone, tenantSlug: "rottay" });
    const bledLight = (bled.modeBlocks ?? []).find(
      (block) => block.mode === "light"
    );
    const effective = {
      ...bled.cssVariables,
      ...(bledLight?.cssVariables ?? {}),
    };
    expect(effective[row.name]).toBe(bled.cssVariables[row.name]);
    expect(bare(effective[row.name] as string)).not.toBe(bare(row.value));
  });
});

describe("ROTTAY-T2 MASS - rate is a stylesheet neighbour, not a controls member", () => {
  it("drains rate with the twelve control families and says why", () => {
    // Stated as an assertion so the rationale in the file header cannot drift
    // away from the shape: rate contributes exactly one typed leaf and two
    // both-delete channels, all three authored in the same control block of
    // the extension. The inventory still files rate under feedback; this
    // tranche does not move that row, it only drains the stylesheet.
    const rate = FAMILIES.find((family) => family.prop === "rate");
    expect(rate?.fields).toEqual([["color", "--ds-rate-color"]]);
    const rateChannels = t2Names.filter((name) =>
      name.startsWith("--ds-rate-")
    );
    expect(rateChannels.sort()).toEqual([
      "--ds-rate-color",
      "--ds-rate-color-active",
      "--ds-rate-color-hover",
    ]);
    expect(
      rateChannels.filter((name) =>
        BOTH_DELETE.includes(name as (typeof BOTH_DELETE)[number])
      )
    ).toHaveLength(2);
    // EXCISED (SEV-2): "no rate declaration survives in the stylesheet for a
    // later tranche" read `live` for a `--ds-rate-*` residue. G2 now proves the
    // stronger claim that the stylesheet itself does not survive.
  });
});
