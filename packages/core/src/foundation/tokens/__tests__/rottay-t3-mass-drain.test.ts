/**
 * ROTTAY-T3 MASS -- the rottay artifact extension drained from 380 to ZERO by
 * moving the last twenty-six component families into typed Theme owners.
 *
 * -- What this tranche is ----------------------------------------------------
 *
 * `ROTTAY-T1 MASS` left 682 custom-property declarations in
 * `artifacts/rottay/_source/extension.css`; `ROTTAY-T2 MASS` took 302 of them
 * and left 380. This tranche removes the remaining 380: 190 channels x 2 mode
 * blocks. Every single one is a MIGRATE.
 *
 *   MIGRATE (380 tuples)  the value moved into a closed typed field on a new
 *                         TOP-LEVEL chrome family, and the single shared
 *                         `chromeToVariables` lowering now emits the channel
 *                         for BOTH transports (static BrandTheme and DB
 *                         TenantThemeDocument).
 *   DELETE  (  0 tuples)  the delete side of this tranche is EMPTY. No channel
 *                         was adjudicated an echo; nothing was dropped on the
 *                         claim that a floor already owned it. The empty side
 *                         is asserted, and the assertion is drilled: a planted
 *                         delete row fails the coverage law below.
 *   HOLD    (  0 tuples)  nothing was deferred to a later tranche. After this
 *                         file the stylesheet holds no channel at all.
 *
 * -- The twenty-six families -------------------------------------------------
 *
 * The T2 families all hung off `chrome.controls`. These twenty-six are
 * TOP-LEVEL owners on `BrandChrome`, because they are component families in
 * their own right and not form-control anatomy: alert, anchor, avatar,
 * backTop, calendar, collapse, descriptions, drawer, dropdown, empty,
 * floatButton, liveFeed, menu, message, notification, pagination, progress,
 * result, skeleton, spinner, statistic, statsGrid, steps, tag, timeline, tree.
 *
 * Three of them carry a channel prefix that is NOT the camelCase-to-kebab
 * transform of the property name, because the channel names predate the typed
 * owners and renaming a shipped channel is a repaint:
 *
 *   backTop      -> `--ds-backtop-*`
 *   floatButton  -> `--ds-floatbutton-*`
 *   liveFeed     -> `--ds-live-feed-*`
 *   statsGrid    -> `--ds-stats-grid-*`
 *
 * The other twenty-two are the exact inverse transform. The map is keyed
 * field-by-field regardless, so no prefix rule is load-bearing.
 *
 * -- Modes: 190 body leaves, 186 light deltas ---------------------------------
 *
 * Rottay is dark-default, so the Theme BODY is the dark authority and
 * `modes.light` is the delta. All 190 channels migrate in BOTH modes -- the
 * mode classification is MM 190, MX 0, XM 0, XX 0 -- but four of them paint the
 * same literal in both modes, so `modes.light` deliberately does not restate
 * them and the body value serves both:
 *
 *   --ds-floatbutton-badge-color
 *   --ds-pagination-item-bg
 *   --ds-pagination-item-border
 *   --ds-steps-wait-bg
 *
 * 190 body leaves + 182 light leaves is the whole typed shape this tranche
 * adds. There is no third authority.
 *
 * F2.4 PILOTO (2026-08-20): cuatro canales mas se sumaron a esa lista de
 * identicos -- `--ds-spinner-color`, `--ds-menu-focus-ring-color`,
 * `--ds-floatbutton-primary-bg` y `--ds-live-feed-badge-bg` -- al re-cablear
 * el cuerpo a `var(--ds-color-primary)`. El VALOR computado no se movio en
 * ningun modo (`--ds-color-primary` ya valia `#FFFFFF` en el cuerpo y
 * `#0A0A0A` en el bloque claro); cambio la FORMA, de literal a lectura de
 * raiz. La procedencia del drenaje se conserva: el roster sigue nombrando los
 * mismos 190 canales, en los mismos dos modos, con las mismas disposiciones.
 * Por eso `t3Roster` y `t3Membership` no se movieron y solo `t3Tuple` -- que
 * es el unico que digiere el VALOR -- se re-anclo. 186 light leaves -> 182.
 *
 * La misma ley se aplico dos veces mas, y por eso el censo claro siguio
 * bajando sin que se moviera un solo pin firmado:
 *   - F4A-6 (K3): 18 canales de tinta pasaron a `var(--ds-color-text-page)`
 *     en ambos modos. 182 light leaves -> 164; identicos 8 -> 26.
 *   - K1: 14 canales pasaron a `var(--ds-color-primary)` al descongelarse la
 *     raiz. 164 light leaves -> 150; identicos 26 -> 40.
 * En las tres olas el cuerpo y el claro terminan leyendo la MISMA raiz, que
 * ya resolvia al mismo literal en cada modo; el bloque claro deja de tener
 * algo distinto que decir y por eso no lo restata.
 *
 * -- The census convention, restated ------------------------------------------
 *
 *   380 -> 0     custom-property declarations (`--*`) -- THE GOVERNED COUNT.
 *   381 -> 1     every CSS declaration of any kind.
 *
 * The surviving declaration is `color: var(--ds-color-text-primary, #F0F0F0)`
 * at the top of the dark block. It is a paint on the root element, not a
 * channel; it was never in a roster, and it is asserted intact below together
 * with the `@ds-exception` header the surviving rule requires.
 *
 * -- What is deliberately NOT asserted here -----------------------------------
 *
 * The generated `artifacts/rottay/index.css` is out of scope for this tranche
 * and has not been regenerated. This file grades SOURCE only. Pre-existing
 * vertical/generated staleness is not an acceptance signal for T3.
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
const CHROME_VARIABLES_SOURCE = join(
  process.cwd(),
  "src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts"
);

type Mode = "dark" | "light";

interface Declaration {
  readonly mode: Mode;
  readonly name: string;
  readonly value: string;
}

// EXCISED (SEV-2): `const EXTENSION` and `function parseExtension()`, the path
// constant and declaration scanner for the deleted extension file. The
// `Declaration` and `Mode` types they produced still carry the signed roster.

/** Comparison form: whitespace, comma spacing and hex case are not paint. */
const bare = (value: string): string =>
  value
    .replace(/\s+/g, "")
    .replace(/\s*,\s*/g, ",")
    .toLowerCase();

const sha256 = (text: string): string =>
  createHash("sha256").update(text).digest("hex");

/**
 * The partition hash recipes, identical to T1/T2 so the three tranches are
 * comparable by hand:
 *
 *   roster      sorted unique channel names,   one per line, trailing newline
 *   tuple       sorted `name|D|value` rows,    one per line, trailing newline
 *   membership  sorted `name|D` rows,          one per line, trailing newline
 *
 * `D`/`L` is the mode letter. sha256 over UTF-8 in every case. The empty list
 * hashes to the sha256 of a single newline, which is the terminal state this
 * file asserts the stylesheet reached.
 */
const lines = (rows: readonly string[]): string =>
  [...rows].sort().join("\n") + "\n";
const letter = (mode: Mode): string => (mode === "dark" ? "D" : "L");

/**
 * F2.4 PILOTO (2026-08-20) -- canales cuyo CUERPO se re-cablo a una raiz
 * DESPUES de este drenaje.
 *
 * El roster NO se toca: es un registro de PRE-IMAGEN y el bloque
 * "the pre-image is literal" de mas abajo exige que no cargue ni un `var()`.
 * Meter la forma nueva ahi convertiria un registro historico en una expectativa
 * viva y borraria la procedencia del drenaje. Por eso los tres hashes firmados
 * -- `t3Roster`, `t3Tuple`, `t3Membership` -- siguen EXACTAMENTE donde estaban.
 *
 * Lo que cambia es solo lo que el arbol emite HOY, y no cambia la PINTURA:
 * `--ds-color-primary` ya valia `#FFFFFF` en el cuerpo y `#0A0A0A` en el bloque
 * claro, asi que cada canal de aqui resuelve al mismo color que su literal de
 * pre-imagen, en los dos modos. Cambio la FORMA, no el color.
 *
 * Consecuencia buscada: con cuerpo y claro valiendo lo mismo, el delta claro se
 * queda sin nada que decir y estos cuatro entran en la lista de "identicos"
 * (186 -> 182 hojas light).
 */
/**
 * F4A-6 (K3) — segunda tanda de re-derivados: los canales de tinta de PAGINA
 * que ahora cuelgan de la raiz nueva `--ds-color-text-page`. Misma ley que la
 * tanda de F2: el roster conserva su PRE-IMAGEN (#A0A0A5 en el cuerpo oscuro,
 * #6B6B6B en el bloque claro) porque es un registro historico, y los tres
 * hashes firmados quedan EXACTAMENTE donde estaban. La pintura computada no se
 * movio: se probo resolviendo la cascada, 136 de 136 pares identicos.
 */
const REDERIVED: Readonly<Record<string, string>> = {
  "--ds-floatbutton-primary-bg": "var(--ds-color-primary)",
  "--ds-live-feed-badge-bg": "var(--ds-color-primary)",
  "--ds-menu-focus-ring-color": "var(--ds-color-primary)",
  "--ds-spinner-color": "var(--ds-color-primary)",
  "--ds-avatar-default-color": "var(--ds-color-text-page)",
  "--ds-avatar-group-overflow-color": "var(--ds-color-text-page)",
  "--ds-avatar-secondary-color": "var(--ds-color-text-page)",
  "--ds-drawer-body-color": "var(--ds-color-text-page)",
  "--ds-dropdown-item-color": "var(--ds-color-text-page)",
  "--ds-floatbutton-default-color": "var(--ds-color-text-page)",
  "--ds-floatbutton-description-color": "var(--ds-color-text-page)",
  "--ds-live-feed-refresh-color": "var(--ds-color-text-page)",
  "--ds-menu-item-color": "var(--ds-color-text-page)",
  "--ds-pagination-item-color": "var(--ds-color-text-page)",
  "--ds-statistic-prefix-color": "var(--ds-color-text-page)",
  "--ds-statistic-suffix-color": "var(--ds-color-text-page)",
  "--ds-statistic-title-color": "var(--ds-color-text-page)",
  "--ds-stats-grid-label-color": "var(--ds-color-text-page)",
  "--ds-tag-default-color": "var(--ds-color-text-page)",
  "--ds-tag-secondary-color": "var(--ds-color-text-page)",
  "--ds-timeline-content-color": "var(--ds-color-text-page)",
  "--ds-tree-node-color": "var(--ds-color-text-page)",
  // K1 (2026-08-21) — tanda del descongelamiento de `--ds-color-primary`:
  // canales CHROME identicos al literal de marca en los dos modos. Misma ley:
  // pre-imagen intacta, hashes firmados quietos, pintura computada identica.
  "--ds-anchor-ink-color": "var(--ds-color-primary)",
  "--ds-avatar-primary-bg": "var(--ds-color-primary)",
  "--ds-avatar-ring-color": "var(--ds-color-primary)",
  "--ds-backtop-bg": "var(--ds-color-primary)",
  "--ds-pagination-active-bg": "var(--ds-color-primary)",
  "--ds-pagination-item-bg-active": "var(--ds-color-primary)",
  "--ds-progress-fill-primary": "var(--ds-color-primary)",
  "--ds-steps-connector-color-active": "var(--ds-color-primary)",
  "--ds-steps-item-bg-active": "var(--ds-color-primary)",
  "--ds-steps-process-bg": "var(--ds-color-primary)",
  "--ds-steps-process-border": "var(--ds-color-primary)",
  "--ds-tag-primary-bg": "var(--ds-color-primary)",
  "--ds-tag-primary-border": "var(--ds-color-primary)",
  "--ds-timeline-dot-bg": "var(--ds-color-primary)",
};

/** Lo que el arbol emite hoy para esa fila: la re-derivacion si la hay, y si no
 *  el valor de pre-imagen, que sigue siendo el vigente para las otras 186. */
const emittedToday = (row: Declaration): string =>
  REDERIVED[row.name] ?? row.value;
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
 *
 * `preImage` is the sha256 of the whole stylesheet as T2 left it; `terminal`
 * is the sha256 of the whole stylesheet as this tranche leaves it. Both are
 * whole-file digests, not roster digests.
 */
const PINS = {
  t3Roster: "ada8106371604ed03435bd477acf4e279d41f8aa3471a166ab26fffd24c04697",
  t3Tuple: "1493c1ce36c3052202347beb2a1bc14feb16b3a666b9332095ac1132f7ee0343",
  t3Membership:
    "1bc853af449fff4042d20469cd61b131c31a9e2d4063295f7ee104d92a527891",
  preImage: "f749d3edb2df6c7be8368c73b9c041e8cd3eebf06bb70b0b5ea816d62e9bd84d",
  terminal: "f7e5f52ae5c95e97b0495035e22bbafc9f5b9a96ccaa9c5f315b8ef3a770359a",
  emptyList: "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b",
} as const;

const CENSUS = {
  preCustomProperties: 380,
  postCustomProperties: 0,
  preAllDeclarations: 381,
  postAllDeclarations: 1,
  perModeBefore: 190,
  perModeAfter: 0,
  removedDeclarations: 380,
  removedChannels: 190,
  migrateTuples: 380,
  deleteTuples: 0,
  holdTuples: 0,
  families: 26,
  bodyLeaves: 190,
  lightLeaves: 150,
  identicalChannels: 40,
  gradientValues: 6,
  maxShadowLayers: 2,
} as const;

/**
 * The signed roster. 380 rows in file order -- every custom-property
 * declaration this tranche removed, with the literal it carried. All 380 are
 * MIGRATE, so the disposition is a property of the tranche rather than of the
 * row and is asserted once, below, instead of being repeated 380 times.
 */
const T3_ROSTER: readonly Declaration[] = [
  { mode: "dark", name: "--ds-message-close-color", value: "#6B6B72" },
  { mode: "dark", name: "--ds-message-close-color-hover", value: "#ECECEC" },
  { mode: "dark", name: "--ds-avatar-default-bg", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-avatar-default-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-avatar-primary-bg", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-avatar-primary-color", value: "#0C0C0E" },
  { mode: "dark", name: "--ds-avatar-secondary-bg", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-avatar-secondary-color", value: "#A0A0A5" },
  {
    mode: "dark",
    name: "--ds-avatar-success-bg",
    value: "rgba(34, 197, 94, 0.14)",
  },
  { mode: "dark", name: "--ds-avatar-success-color", value: "#22C55E" },
  {
    mode: "dark",
    name: "--ds-avatar-warning-bg",
    value: "rgba(245, 158, 11, 0.14)",
  },
  { mode: "dark", name: "--ds-avatar-warning-color", value: "#F59E0B" },
  {
    mode: "dark",
    name: "--ds-avatar-error-bg",
    value: "rgba(239, 68, 68, 0.14)",
  },
  { mode: "dark", name: "--ds-avatar-error-color", value: "#EF4444" },
  {
    mode: "dark",
    name: "--ds-avatar-gradient-bg",
    value: "linear-gradient(135deg, #ECECEC 0%, #6B6B72 100%)",
  },
  { mode: "dark", name: "--ds-avatar-gradient-color", value: "#0C0C0E" },
  { mode: "dark", name: "--ds-avatar-status-border", value: "#18181B" },
  { mode: "dark", name: "--ds-avatar-ring-color", value: "#FFFFFF" },
  {
    mode: "dark",
    name: "--ds-avatar-border-color",
    value: "rgba(255, 255, 255, 0.05)",
  },
  { mode: "dark", name: "--ds-avatar-group-border", value: "#18181B" },
  { mode: "dark", name: "--ds-avatar-group-overflow-bg", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-avatar-group-overflow-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-tag-border", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-tag-default-bg", value: "#222226" },
  { mode: "dark", name: "--ds-tag-default-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-tag-default-border", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-tag-primary-bg", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-tag-primary-color", value: "#0C0C0E" },
  { mode: "dark", name: "--ds-tag-primary-border", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-tag-secondary-bg", value: "#222226" },
  { mode: "dark", name: "--ds-tag-secondary-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-tag-secondary-border", value: "#2A2A2F" },
  {
    mode: "dark",
    name: "--ds-tag-success-bg",
    value: "rgba(34, 197, 94, 0.12)",
  },
  { mode: "dark", name: "--ds-tag-success-color", value: "#34D399" },
  {
    mode: "dark",
    name: "--ds-tag-success-border",
    value: "rgba(34, 197, 94, 0.22)",
  },
  {
    mode: "dark",
    name: "--ds-tag-warning-bg",
    value: "rgba(245, 158, 11, 0.12)",
  },
  { mode: "dark", name: "--ds-tag-warning-color", value: "#FBBF24" },
  {
    mode: "dark",
    name: "--ds-tag-warning-border",
    value: "rgba(245, 158, 11, 0.22)",
  },
  { mode: "dark", name: "--ds-tag-error-bg", value: "rgba(239, 68, 68, 0.12)" },
  { mode: "dark", name: "--ds-tag-error-color", value: "#F87171" },
  {
    mode: "dark",
    name: "--ds-tag-error-border",
    value: "rgba(239, 68, 68, 0.22)",
  },
  {
    mode: "dark",
    name: "--ds-alert-info-bg",
    value: "rgba(59, 130, 246, 0.10)",
  },
  {
    mode: "dark",
    name: "--ds-alert-info-border",
    value: "rgba(59, 130, 246, 0.22)",
  },
  { mode: "dark", name: "--ds-alert-info-color", value: "#93C5FD" },
  { mode: "dark", name: "--ds-alert-info-icon", value: "#3B82F6" },
  {
    mode: "dark",
    name: "--ds-alert-success-bg",
    value: "rgba(34, 197, 94, 0.10)",
  },
  {
    mode: "dark",
    name: "--ds-alert-success-border",
    value: "rgba(34, 197, 94, 0.22)",
  },
  { mode: "dark", name: "--ds-alert-success-color", value: "#6EE7B7" },
  { mode: "dark", name: "--ds-alert-success-icon", value: "#22C55E" },
  {
    mode: "dark",
    name: "--ds-alert-warning-bg",
    value: "rgba(245, 158, 11, 0.10)",
  },
  {
    mode: "dark",
    name: "--ds-alert-warning-border",
    value: "rgba(245, 158, 11, 0.22)",
  },
  { mode: "dark", name: "--ds-alert-warning-color", value: "#FCD34D" },
  { mode: "dark", name: "--ds-alert-warning-icon", value: "#F59E0B" },
  {
    mode: "dark",
    name: "--ds-alert-error-bg",
    value: "rgba(239, 68, 68, 0.10)",
  },
  {
    mode: "dark",
    name: "--ds-alert-error-border",
    value: "rgba(239, 68, 68, 0.22)",
  },
  { mode: "dark", name: "--ds-alert-error-color", value: "#FCA5A5" },
  { mode: "dark", name: "--ds-alert-error-icon", value: "#EF4444" },
  { mode: "dark", name: "--ds-dropdown-bg", value: "#1A1A1E" },
  {
    mode: "dark",
    name: "--ds-dropdown-shadow",
    value: "0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F",
  },
  { mode: "dark", name: "--ds-dropdown-item-color", value: "#A0A0A5" },
  {
    mode: "dark",
    name: "--ds-dropdown-item-bg-hover",
    value: "rgba(255, 255, 255, 0.04)",
  },
  { mode: "dark", name: "--ds-dropdown-item-color-hover", value: "#ECECEC" },
  { mode: "dark", name: "--ds-dropdown-item-bg-active", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-dropdown-item-color-active", value: "#ECECEC" },
  { mode: "dark", name: "--ds-drawer-bg", value: "#1A1A1E" },
  {
    mode: "dark",
    name: "--ds-drawer-shadow",
    value: "0 16px 48px rgba(0, 0, 0, 0.50)",
  },
  { mode: "dark", name: "--ds-drawer-header-border", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-drawer-footer-border", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-drawer-title-color", value: "#ECECEC" },
  { mode: "dark", name: "--ds-drawer-body-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-notification-bg", value: "#1A1A1E" },
  {
    mode: "dark",
    name: "--ds-notification-shadow",
    value: "0 4px 24px rgba(0, 0, 0, 0.50), 0 0 0 1px #2A2A2F",
  },
  { mode: "dark", name: "--ds-notification-title-color", value: "#ECECEC" },
  { mode: "dark", name: "--ds-message-bg", value: "#1A1A1E" },
  {
    mode: "dark",
    name: "--ds-message-shadow",
    value: "0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F",
  },
  { mode: "dark", name: "--ds-progress-bg", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-progress-fill-primary", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-progress-fill-success", value: "#22C55E" },
  { mode: "dark", name: "--ds-progress-fill-warning", value: "#F59E0B" },
  { mode: "dark", name: "--ds-progress-fill-error", value: "#EF4444" },
  { mode: "dark", name: "--ds-skeleton-bg", value: "#1A1A1E" },
  { mode: "dark", name: "--ds-skeleton-highlight", value: "#2A2A2F" },
  {
    mode: "dark",
    name: "--ds-skeleton-wave-gradient",
    value: "linear-gradient(90deg, #1A1A1E 25%, #2A2A2F 50%, #1A1A1E 75%)",
  },
  { mode: "dark", name: "--ds-spinner-color", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-spinner-track", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-pagination-item-bg", value: "transparent" },
  {
    mode: "dark",
    name: "--ds-pagination-item-bg-hover",
    value: "rgba(255, 255, 255, 0.04)",
  },
  { mode: "dark", name: "--ds-pagination-item-bg-active", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-pagination-item-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-pagination-item-color-hover", value: "#ECECEC" },
  { mode: "dark", name: "--ds-pagination-item-color-active", value: "#0C0C0E" },
  { mode: "dark", name: "--ds-pagination-item-border", value: "transparent" },
  { mode: "dark", name: "--ds-pagination-active-bg", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-pagination-active-color", value: "#0C0C0E" },
  { mode: "dark", name: "--ds-menu-bg", value: "#0C0C0E" },
  {
    mode: "dark",
    name: "--ds-menu-item-bg-hover",
    value: "rgba(255, 255, 255, 0.04)",
  },
  { mode: "dark", name: "--ds-menu-item-bg-active", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-menu-item-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-menu-item-color-hover", value: "#ECECEC" },
  { mode: "dark", name: "--ds-menu-item-color-active", value: "#ECECEC" },
  { mode: "dark", name: "--ds-menu-group-title-color", value: "#6B6B72" },
  { mode: "dark", name: "--ds-menu-divider-color", value: "#2A2A2F" },
  {
    mode: "dark",
    name: "--ds-menu-item-hover-bg",
    value: "rgba(255, 255, 255, 0.04)",
  },
  { mode: "dark", name: "--ds-menu-item-selected-bg", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-menu-item-selected-color", value: "#ECECEC" },
  { mode: "dark", name: "--ds-menu-item-danger-color", value: "#EF4444" },
  { mode: "dark", name: "--ds-menu-submenu-bg", value: "#131316" },
  { mode: "dark", name: "--ds-menu-focus-ring-color", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-menu-dark-bg", value: "#0C0C0E" },
  { mode: "dark", name: "--ds-menu-dark-item-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-steps-connector-color", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-steps-connector-color-active", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-steps-item-bg", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-steps-item-bg-active", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-steps-item-color", value: "#6B6B72" },
  { mode: "dark", name: "--ds-steps-item-color-active", value: "#0C0C0E" },
  { mode: "dark", name: "--ds-steps-finish-bg", value: "#22C55E" },
  { mode: "dark", name: "--ds-steps-finish-border", value: "#22C55E" },
  { mode: "dark", name: "--ds-steps-process-bg", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-steps-process-border", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-steps-wait-bg", value: "transparent" },
  {
    mode: "dark",
    name: "--ds-steps-wait-border",
    value: "rgba(255, 255, 255, 0.14)",
  },
  { mode: "dark", name: "--ds-collapse-bg", value: "#131316" },
  { mode: "dark", name: "--ds-collapse-border", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-collapse-header-bg", value: "#131316" },
  { mode: "dark", name: "--ds-collapse-header-bg-hover", value: "#1A1A1E" },
  { mode: "dark", name: "--ds-collapse-header-color", value: "#ECECEC" },
  { mode: "dark", name: "--ds-collapse-content-bg", value: "#1A1A1E" },
  { mode: "dark", name: "--ds-calendar-bg", value: "#1A1A1E" },
  { mode: "dark", name: "--ds-calendar-border", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-calendar-header-color", value: "#ECECEC" },
  { mode: "dark", name: "--ds-calendar-day-color-other", value: "#4A4A4F" },
  {
    mode: "dark",
    name: "--ds-tree-node-bg-hover",
    value: "rgba(255, 255, 255, 0.04)",
  },
  { mode: "dark", name: "--ds-tree-node-bg-selected", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-tree-node-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-tree-node-color-selected", value: "#ECECEC" },
  { mode: "dark", name: "--ds-timeline-line-color", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-timeline-dot-bg", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-timeline-dot-border", value: "#18181B" },
  { mode: "dark", name: "--ds-timeline-content-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-empty-icon-color", value: "#4A4A4F" },
  { mode: "dark", name: "--ds-empty-description-color", value: "#6B6B72" },
  { mode: "dark", name: "--ds-result-title-color", value: "#ECECEC" },
  { mode: "dark", name: "--ds-result-subtitle-color", value: "#6B6B72" },
  { mode: "dark", name: "--ds-result-icon-color", value: "#0C0C0E" },
  { mode: "dark", name: "--ds-statistic-title-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-statistic-value-color", value: "#ECECEC" },
  { mode: "dark", name: "--ds-statistic-prefix-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-statistic-suffix-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-floatbutton-default-bg", value: "#222226" },
  { mode: "dark", name: "--ds-floatbutton-default-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-floatbutton-primary-bg", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-floatbutton-primary-color", value: "#0C0C0E" },
  { mode: "dark", name: "--ds-floatbutton-badge-bg", value: "#EF4444" },
  { mode: "dark", name: "--ds-floatbutton-badge-color", value: "#ffffff" },
  {
    mode: "dark",
    name: "--ds-floatbutton-description-color",
    value: "#A0A0A5",
  },
  { mode: "dark", name: "--ds-live-feed-bg", value: "#18181B" },
  { mode: "dark", name: "--ds-live-feed-border", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-live-feed-refresh-color", value: "#A0A0A5" },
  {
    mode: "dark",
    name: "--ds-live-feed-new-bg",
    value: "rgba(59, 130, 246, 0.10)",
  },
  {
    mode: "dark",
    name: "--ds-live-feed-new-border",
    value: "rgba(59, 130, 246, 0.22)",
  },
  { mode: "dark", name: "--ds-live-feed-new-color", value: "#3B82F6" },
  { mode: "dark", name: "--ds-live-feed-badge-bg", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-live-feed-badge-color", value: "#0C0C0E" },
  { mode: "dark", name: "--ds-live-feed-empty-color", value: "#6B6B72" },
  { mode: "dark", name: "--ds-live-feed-load-more-color", value: "#ECECEC" },
  { mode: "dark", name: "--ds-live-feed-skeleton-bg", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-stats-grid-card-bg", value: "#18181B" },
  { mode: "dark", name: "--ds-stats-grid-card-border", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-stats-grid-card-filled-bg", value: "#1A1A1E" },
  {
    mode: "dark",
    name: "--ds-stats-grid-card-glass-bg",
    value: "rgba(255, 255, 255, 0.04)",
  },
  { mode: "dark", name: "--ds-stats-grid-card-glass-border", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-stats-grid-label-color", value: "#A0A0A5" },
  { mode: "dark", name: "--ds-stats-grid-value-color", value: "#ECECEC" },
  { mode: "dark", name: "--ds-stats-grid-description-color", value: "#6B6B72" },
  { mode: "dark", name: "--ds-stats-grid-trend-positive", value: "#22C55E" },
  { mode: "dark", name: "--ds-stats-grid-trend-negative", value: "#EF4444" },
  { mode: "dark", name: "--ds-stats-grid-trend-neutral", value: "#6B6B72" },
  { mode: "dark", name: "--ds-stats-grid-skeleton-bg", value: "#2A2A2F" },
  {
    mode: "dark",
    name: "--ds-stats-grid-skeleton-wave-gradient",
    value:
      "linear-gradient( 90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.08) 37%, rgba(255, 255, 255, 0.04) 63% )",
  },
  { mode: "dark", name: "--ds-descriptions-label-color", value: "#6B6B72" },
  { mode: "dark", name: "--ds-descriptions-content-color", value: "#ECECEC" },
  { mode: "dark", name: "--ds-descriptions-border", value: "#2A2A2F" },
  { mode: "dark", name: "--ds-descriptions-bg", value: "#131316" },
  { mode: "dark", name: "--ds-backtop-bg", value: "#FFFFFF" },
  { mode: "dark", name: "--ds-backtop-color", value: "#0C0C0E" },
  {
    mode: "dark",
    name: "--ds-backtop-shadow",
    value: "0 4px 16px rgba(0, 0, 0, 0.30)",
  },
  { mode: "dark", name: "--ds-anchor-link-color", value: "#6B6B72" },
  { mode: "dark", name: "--ds-anchor-link-color-active", value: "#ECECEC" },
  { mode: "dark", name: "--ds-anchor-ink-color", value: "#FFFFFF" },
  { mode: "light", name: "--ds-message-close-color", value: "#9C9C9C" },
  { mode: "light", name: "--ds-message-close-color-hover", value: "#1A1A1A" },
  { mode: "light", name: "--ds-avatar-default-bg", value: "#F4F4F3" },
  { mode: "light", name: "--ds-avatar-default-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-avatar-primary-bg", value: "#0A0A0A" },
  { mode: "light", name: "--ds-avatar-primary-color", value: "#FFFFFF" },
  { mode: "light", name: "--ds-avatar-secondary-bg", value: "#F4F4F3" },
  { mode: "light", name: "--ds-avatar-secondary-color", value: "#6B6B6B" },
  {
    mode: "light",
    name: "--ds-avatar-success-bg",
    value: "rgba(22, 163, 74, 0.10)",
  },
  { mode: "light", name: "--ds-avatar-success-color", value: "#16A34A" },
  {
    mode: "light",
    name: "--ds-avatar-warning-bg",
    value: "rgba(217, 119, 6, 0.10)",
  },
  { mode: "light", name: "--ds-avatar-warning-color", value: "#D97706" },
  {
    mode: "light",
    name: "--ds-avatar-error-bg",
    value: "rgba(220, 38, 38, 0.10)",
  },
  { mode: "light", name: "--ds-avatar-error-color", value: "#DC2626" },
  {
    mode: "light",
    name: "--ds-avatar-gradient-bg",
    value: "linear-gradient(135deg, #1A1A1A 0%, #6B6B6B 100%)",
  },
  { mode: "light", name: "--ds-avatar-gradient-color", value: "#FFFFFF" },
  { mode: "light", name: "--ds-avatar-status-border", value: "#FFFFFF" },
  { mode: "light", name: "--ds-avatar-ring-color", value: "#0A0A0A" },
  {
    mode: "light",
    name: "--ds-avatar-border-color",
    value: "rgba(0, 0, 0, 0.06)",
  },
  { mode: "light", name: "--ds-avatar-group-border", value: "#FFFFFF" },
  { mode: "light", name: "--ds-avatar-group-overflow-bg", value: "#F4F4F3" },
  { mode: "light", name: "--ds-avatar-group-overflow-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-tag-border", value: "#E5E5E3" },
  { mode: "light", name: "--ds-tag-default-bg", value: "#F4F4F3" },
  { mode: "light", name: "--ds-tag-default-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-tag-default-border", value: "#E5E5E3" },
  { mode: "light", name: "--ds-tag-primary-bg", value: "#0A0A0A" },
  { mode: "light", name: "--ds-tag-primary-color", value: "#FFFFFF" },
  { mode: "light", name: "--ds-tag-primary-border", value: "#0A0A0A" },
  { mode: "light", name: "--ds-tag-secondary-bg", value: "#F4F4F3" },
  { mode: "light", name: "--ds-tag-secondary-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-tag-secondary-border", value: "#E5E5E3" },
  {
    mode: "light",
    name: "--ds-tag-success-bg",
    value: "rgba(22, 163, 74, 0.08)",
  },
  { mode: "light", name: "--ds-tag-success-color", value: "#15803D" },
  {
    mode: "light",
    name: "--ds-tag-success-border",
    value: "rgba(22, 163, 74, 0.20)",
  },
  {
    mode: "light",
    name: "--ds-tag-warning-bg",
    value: "rgba(217, 119, 6, 0.08)",
  },
  { mode: "light", name: "--ds-tag-warning-color", value: "#B45309" },
  {
    mode: "light",
    name: "--ds-tag-warning-border",
    value: "rgba(217, 119, 6, 0.20)",
  },
  {
    mode: "light",
    name: "--ds-tag-error-bg",
    value: "rgba(220, 38, 38, 0.08)",
  },
  { mode: "light", name: "--ds-tag-error-color", value: "#B91C1C" },
  {
    mode: "light",
    name: "--ds-tag-error-border",
    value: "rgba(220, 38, 38, 0.20)",
  },
  {
    mode: "light",
    name: "--ds-alert-info-bg",
    value: "rgba(37, 99, 235, 0.06)",
  },
  {
    mode: "light",
    name: "--ds-alert-info-border",
    value: "rgba(37, 99, 235, 0.20)",
  },
  { mode: "light", name: "--ds-alert-info-color", value: "#1D4ED8" },
  { mode: "light", name: "--ds-alert-info-icon", value: "#2563EB" },
  {
    mode: "light",
    name: "--ds-alert-success-bg",
    value: "rgba(22, 163, 74, 0.06)",
  },
  {
    mode: "light",
    name: "--ds-alert-success-border",
    value: "rgba(22, 163, 74, 0.20)",
  },
  { mode: "light", name: "--ds-alert-success-color", value: "#15803D" },
  { mode: "light", name: "--ds-alert-success-icon", value: "#16A34A" },
  {
    mode: "light",
    name: "--ds-alert-warning-bg",
    value: "rgba(217, 119, 6, 0.06)",
  },
  {
    mode: "light",
    name: "--ds-alert-warning-border",
    value: "rgba(217, 119, 6, 0.20)",
  },
  { mode: "light", name: "--ds-alert-warning-color", value: "#B45309" },
  { mode: "light", name: "--ds-alert-warning-icon", value: "#D97706" },
  {
    mode: "light",
    name: "--ds-alert-error-bg",
    value: "rgba(220, 38, 38, 0.06)",
  },
  {
    mode: "light",
    name: "--ds-alert-error-border",
    value: "rgba(220, 38, 38, 0.20)",
  },
  { mode: "light", name: "--ds-alert-error-color", value: "#B91C1C" },
  { mode: "light", name: "--ds-alert-error-icon", value: "#DC2626" },
  { mode: "light", name: "--ds-dropdown-bg", value: "#FFFFFF" },
  {
    mode: "light",
    name: "--ds-dropdown-shadow",
    value: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
  },
  { mode: "light", name: "--ds-dropdown-item-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-dropdown-item-bg-hover", value: "#FAFAF9" },
  { mode: "light", name: "--ds-dropdown-item-color-hover", value: "#1A1A1A" },
  { mode: "light", name: "--ds-dropdown-item-bg-active", value: "#F4F4F3" },
  { mode: "light", name: "--ds-dropdown-item-color-active", value: "#1A1A1A" },
  { mode: "light", name: "--ds-drawer-bg", value: "#FFFFFF" },
  {
    mode: "light",
    name: "--ds-drawer-shadow",
    value: "0 12px 40px rgba(0, 0, 0, 0.12)",
  },
  { mode: "light", name: "--ds-drawer-header-border", value: "#E5E5E3" },
  { mode: "light", name: "--ds-drawer-footer-border", value: "#E5E5E3" },
  { mode: "light", name: "--ds-drawer-title-color", value: "#1A1A1A" },
  { mode: "light", name: "--ds-drawer-body-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-notification-bg", value: "#FFFFFF" },
  {
    mode: "light",
    name: "--ds-notification-shadow",
    value: "0 4px 24px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.04)",
  },
  { mode: "light", name: "--ds-notification-title-color", value: "#1A1A1A" },
  { mode: "light", name: "--ds-message-bg", value: "#FFFFFF" },
  {
    mode: "light",
    name: "--ds-message-shadow",
    value: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
  },
  { mode: "light", name: "--ds-progress-bg", value: "#EDEDEC" },
  { mode: "light", name: "--ds-progress-fill-primary", value: "#0A0A0A" },
  { mode: "light", name: "--ds-progress-fill-success", value: "#16A34A" },
  { mode: "light", name: "--ds-progress-fill-warning", value: "#D97706" },
  { mode: "light", name: "--ds-progress-fill-error", value: "#DC2626" },
  { mode: "light", name: "--ds-skeleton-bg", value: "#EDEDEC" },
  { mode: "light", name: "--ds-skeleton-highlight", value: "#F4F4F3" },
  {
    mode: "light",
    name: "--ds-skeleton-wave-gradient",
    value: "linear-gradient(90deg, #EDEDEC 25%, #F4F4F3 50%, #EDEDEC 75%)",
  },
  { mode: "light", name: "--ds-spinner-color", value: "#0A0A0A" },
  { mode: "light", name: "--ds-spinner-track", value: "#EDEDEC" },
  { mode: "light", name: "--ds-pagination-item-bg", value: "transparent" },
  { mode: "light", name: "--ds-pagination-item-bg-hover", value: "#FAFAF9" },
  { mode: "light", name: "--ds-pagination-item-bg-active", value: "#0A0A0A" },
  { mode: "light", name: "--ds-pagination-item-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-pagination-item-color-hover", value: "#1A1A1A" },
  {
    mode: "light",
    name: "--ds-pagination-item-color-active",
    value: "#FFFFFF",
  },
  { mode: "light", name: "--ds-pagination-item-border", value: "transparent" },
  { mode: "light", name: "--ds-pagination-active-bg", value: "#0A0A0A" },
  { mode: "light", name: "--ds-pagination-active-color", value: "#FFFFFF" },
  { mode: "light", name: "--ds-menu-bg", value: "#FAFAF9" },
  {
    mode: "light",
    name: "--ds-menu-item-bg-hover",
    value: "rgba(0, 0, 0, 0.03)",
  },
  {
    mode: "light",
    name: "--ds-menu-item-bg-active",
    value: "rgba(0, 0, 0, 0.06)",
  },
  { mode: "light", name: "--ds-menu-item-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-menu-item-color-hover", value: "#1A1A1A" },
  { mode: "light", name: "--ds-menu-item-color-active", value: "#1A1A1A" },
  { mode: "light", name: "--ds-menu-group-title-color", value: "#9C9C9C" },
  { mode: "light", name: "--ds-menu-divider-color", value: "#E5E5E3" },
  {
    mode: "light",
    name: "--ds-menu-item-hover-bg",
    value: "rgba(0, 0, 0, 0.03)",
  },
  {
    mode: "light",
    name: "--ds-menu-item-selected-bg",
    value: "rgba(0, 0, 0, 0.06)",
  },
  { mode: "light", name: "--ds-menu-item-selected-color", value: "#1A1A1A" },
  { mode: "light", name: "--ds-menu-item-danger-color", value: "#DC2626" },
  { mode: "light", name: "--ds-menu-submenu-bg", value: "#FFFFFF" },
  { mode: "light", name: "--ds-menu-focus-ring-color", value: "#0A0A0A" },
  { mode: "light", name: "--ds-menu-dark-bg", value: "#0A0A0A" },
  { mode: "light", name: "--ds-menu-dark-item-color", value: "#A3A3A1" },
  { mode: "light", name: "--ds-steps-connector-color", value: "#E5E5E3" },
  {
    mode: "light",
    name: "--ds-steps-connector-color-active",
    value: "#0A0A0A",
  },
  { mode: "light", name: "--ds-steps-item-bg", value: "#EDEDEC" },
  { mode: "light", name: "--ds-steps-item-bg-active", value: "#0A0A0A" },
  { mode: "light", name: "--ds-steps-item-color", value: "#9C9C9C" },
  { mode: "light", name: "--ds-steps-item-color-active", value: "#FFFFFF" },
  { mode: "light", name: "--ds-steps-finish-bg", value: "#16A34A" },
  { mode: "light", name: "--ds-steps-finish-border", value: "#16A34A" },
  { mode: "light", name: "--ds-steps-process-bg", value: "#0A0A0A" },
  { mode: "light", name: "--ds-steps-process-border", value: "#0A0A0A" },
  { mode: "light", name: "--ds-steps-wait-bg", value: "transparent" },
  { mode: "light", name: "--ds-steps-wait-border", value: "#D4D4D2" },
  { mode: "light", name: "--ds-collapse-bg", value: "#FFFFFF" },
  { mode: "light", name: "--ds-collapse-border", value: "#E5E5E3" },
  { mode: "light", name: "--ds-collapse-header-bg", value: "#FFFFFF" },
  { mode: "light", name: "--ds-collapse-header-bg-hover", value: "#FAFAF9" },
  { mode: "light", name: "--ds-collapse-header-color", value: "#1A1A1A" },
  { mode: "light", name: "--ds-collapse-content-bg", value: "#FAFAF9" },
  { mode: "light", name: "--ds-calendar-bg", value: "#FFFFFF" },
  { mode: "light", name: "--ds-calendar-border", value: "#E5E5E3" },
  { mode: "light", name: "--ds-calendar-header-color", value: "#1A1A1A" },
  { mode: "light", name: "--ds-calendar-day-color-other", value: "#C4C4C2" },
  { mode: "light", name: "--ds-tree-node-bg-hover", value: "#FAFAF9" },
  { mode: "light", name: "--ds-tree-node-bg-selected", value: "#F4F4F3" },
  { mode: "light", name: "--ds-tree-node-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-tree-node-color-selected", value: "#1A1A1A" },
  { mode: "light", name: "--ds-timeline-line-color", value: "#E5E5E3" },
  { mode: "light", name: "--ds-timeline-dot-bg", value: "#0A0A0A" },
  { mode: "light", name: "--ds-timeline-dot-border", value: "#FFFFFF" },
  { mode: "light", name: "--ds-timeline-content-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-empty-icon-color", value: "#D4D4D2" },
  { mode: "light", name: "--ds-empty-description-color", value: "#9C9C9C" },
  { mode: "light", name: "--ds-result-title-color", value: "#1A1A1A" },
  { mode: "light", name: "--ds-result-subtitle-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-result-icon-color", value: "#FFFFFF" },
  { mode: "light", name: "--ds-statistic-title-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-statistic-value-color", value: "#1A1A1A" },
  { mode: "light", name: "--ds-statistic-prefix-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-statistic-suffix-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-floatbutton-default-bg", value: "#FFFFFF" },
  { mode: "light", name: "--ds-floatbutton-default-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-floatbutton-primary-bg", value: "#0A0A0A" },
  { mode: "light", name: "--ds-floatbutton-primary-color", value: "#FFFFFF" },
  { mode: "light", name: "--ds-floatbutton-badge-bg", value: "#DC2626" },
  { mode: "light", name: "--ds-floatbutton-badge-color", value: "#ffffff" },
  {
    mode: "light",
    name: "--ds-floatbutton-description-color",
    value: "#6B6B6B",
  },
  { mode: "light", name: "--ds-live-feed-bg", value: "#FFFFFF" },
  { mode: "light", name: "--ds-live-feed-border", value: "#E5E5E3" },
  { mode: "light", name: "--ds-live-feed-refresh-color", value: "#6B6B6B" },
  {
    mode: "light",
    name: "--ds-live-feed-new-bg",
    value: "rgba(37, 99, 235, 0.06)",
  },
  {
    mode: "light",
    name: "--ds-live-feed-new-border",
    value: "rgba(37, 99, 235, 0.20)",
  },
  { mode: "light", name: "--ds-live-feed-new-color", value: "#2563EB" },
  { mode: "light", name: "--ds-live-feed-badge-bg", value: "#0A0A0A" },
  { mode: "light", name: "--ds-live-feed-badge-color", value: "#FFFFFF" },
  { mode: "light", name: "--ds-live-feed-empty-color", value: "#9C9C9C" },
  { mode: "light", name: "--ds-live-feed-load-more-color", value: "#1A1A1A" },
  { mode: "light", name: "--ds-live-feed-skeleton-bg", value: "#EDEDEC" },
  { mode: "light", name: "--ds-stats-grid-card-bg", value: "#FFFFFF" },
  { mode: "light", name: "--ds-stats-grid-card-border", value: "#E5E5E3" },
  { mode: "light", name: "--ds-stats-grid-card-filled-bg", value: "#FAFAF9" },
  {
    mode: "light",
    name: "--ds-stats-grid-card-glass-bg",
    value: "rgba(255, 255, 255, 0.70)",
  },
  {
    mode: "light",
    name: "--ds-stats-grid-card-glass-border",
    value: "#E5E5E3",
  },
  { mode: "light", name: "--ds-stats-grid-label-color", value: "#6B6B6B" },
  { mode: "light", name: "--ds-stats-grid-value-color", value: "#1A1A1A" },
  {
    mode: "light",
    name: "--ds-stats-grid-description-color",
    value: "#9C9C9C",
  },
  { mode: "light", name: "--ds-stats-grid-trend-positive", value: "#16A34A" },
  { mode: "light", name: "--ds-stats-grid-trend-negative", value: "#DC2626" },
  { mode: "light", name: "--ds-stats-grid-trend-neutral", value: "#9C9C9C" },
  { mode: "light", name: "--ds-stats-grid-skeleton-bg", value: "#EDEDEC" },
  {
    mode: "light",
    name: "--ds-stats-grid-skeleton-wave-gradient",
    value:
      "linear-gradient( 90deg, rgba(0, 0, 0, 0.03) 25%, rgba(0, 0, 0, 0.06) 37%, rgba(0, 0, 0, 0.03) 63% )",
  },
  { mode: "light", name: "--ds-descriptions-label-color", value: "#9C9C9C" },
  { mode: "light", name: "--ds-descriptions-content-color", value: "#1A1A1A" },
  { mode: "light", name: "--ds-descriptions-border", value: "#E5E5E3" },
  { mode: "light", name: "--ds-descriptions-bg", value: "#FAFAF9" },
  { mode: "light", name: "--ds-backtop-bg", value: "#0A0A0A" },
  { mode: "light", name: "--ds-backtop-color", value: "#FFFFFF" },
  {
    mode: "light",
    name: "--ds-backtop-shadow",
    value: "0 4px 12px rgba(0, 0, 0, 0.10)",
  },
  { mode: "light", name: "--ds-anchor-link-color", value: "#9C9C9C" },
  { mode: "light", name: "--ds-anchor-link-color-active", value: "#1A1A1A" },
  { mode: "light", name: "--ds-anchor-ink-color", value: "#0A0A0A" },
] as const;

/** The delete side, stated explicitly so the empty set is a claim, not a gap. */
const T3_DELETES: readonly Declaration[] = [] as const;

/**
 * The twenty-six typed owners and the channel each leaf lowers to. This table
 * is the reverse projection of the compiler map: it is written from the
 * CHANNEL side, so a compiler map that renamed, dropped or duplicated a
 * destination cannot satisfy it.
 */
const FAMILIES: ReadonlyArray<{
  readonly prop: string;
  readonly fields: ReadonlyArray<readonly [string, string]>;
}> = [
  {
    prop: "alert",
    fields: [
      ["errorBg", "--ds-alert-error-bg"],
      ["errorBorder", "--ds-alert-error-border"],
      ["errorColor", "--ds-alert-error-color"],
      ["errorIcon", "--ds-alert-error-icon"],
      ["infoBg", "--ds-alert-info-bg"],
      ["infoBorder", "--ds-alert-info-border"],
      ["infoColor", "--ds-alert-info-color"],
      ["infoIcon", "--ds-alert-info-icon"],
      ["successBg", "--ds-alert-success-bg"],
      ["successBorder", "--ds-alert-success-border"],
      ["successColor", "--ds-alert-success-color"],
      ["successIcon", "--ds-alert-success-icon"],
      ["warningBg", "--ds-alert-warning-bg"],
      ["warningBorder", "--ds-alert-warning-border"],
      ["warningColor", "--ds-alert-warning-color"],
      ["warningIcon", "--ds-alert-warning-icon"],
    ],
  },
  {
    prop: "anchor",
    fields: [
      ["inkColor", "--ds-anchor-ink-color"],
      ["linkColor", "--ds-anchor-link-color"],
      ["linkColorActive", "--ds-anchor-link-color-active"],
    ],
  },
  {
    prop: "avatar",
    fields: [
      ["borderColor", "--ds-avatar-border-color"],
      ["defaultBg", "--ds-avatar-default-bg"],
      ["defaultColor", "--ds-avatar-default-color"],
      ["errorBg", "--ds-avatar-error-bg"],
      ["errorColor", "--ds-avatar-error-color"],
      ["gradientBg", "--ds-avatar-gradient-bg"],
      ["gradientColor", "--ds-avatar-gradient-color"],
      ["groupBorder", "--ds-avatar-group-border"],
      ["groupOverflowBg", "--ds-avatar-group-overflow-bg"],
      ["groupOverflowColor", "--ds-avatar-group-overflow-color"],
      ["primaryBg", "--ds-avatar-primary-bg"],
      ["primaryColor", "--ds-avatar-primary-color"],
      ["ringColor", "--ds-avatar-ring-color"],
      ["secondaryBg", "--ds-avatar-secondary-bg"],
      ["secondaryColor", "--ds-avatar-secondary-color"],
      ["statusBorder", "--ds-avatar-status-border"],
      ["successBg", "--ds-avatar-success-bg"],
      ["successColor", "--ds-avatar-success-color"],
      ["warningBg", "--ds-avatar-warning-bg"],
      ["warningColor", "--ds-avatar-warning-color"],
    ],
  },
  {
    prop: "backTop",
    fields: [
      ["bg", "--ds-backtop-bg"],
      ["color", "--ds-backtop-color"],
      ["shadow", "--ds-backtop-shadow"],
    ],
  },
  {
    prop: "calendar",
    fields: [
      ["bg", "--ds-calendar-bg"],
      ["border", "--ds-calendar-border"],
      ["dayColorOther", "--ds-calendar-day-color-other"],
      ["headerColor", "--ds-calendar-header-color"],
    ],
  },
  {
    prop: "collapse",
    fields: [
      ["bg", "--ds-collapse-bg"],
      ["border", "--ds-collapse-border"],
      ["contentBg", "--ds-collapse-content-bg"],
      ["headerBg", "--ds-collapse-header-bg"],
      ["headerBgHover", "--ds-collapse-header-bg-hover"],
      ["headerColor", "--ds-collapse-header-color"],
    ],
  },
  {
    prop: "descriptions",
    fields: [
      ["bg", "--ds-descriptions-bg"],
      ["border", "--ds-descriptions-border"],
      ["contentColor", "--ds-descriptions-content-color"],
      ["labelColor", "--ds-descriptions-label-color"],
    ],
  },
  {
    prop: "drawer",
    fields: [
      ["bg", "--ds-drawer-bg"],
      ["bodyColor", "--ds-drawer-body-color"],
      ["footerBorder", "--ds-drawer-footer-border"],
      ["headerBorder", "--ds-drawer-header-border"],
      ["shadow", "--ds-drawer-shadow"],
      ["titleColor", "--ds-drawer-title-color"],
    ],
  },
  {
    prop: "dropdown",
    fields: [
      ["bg", "--ds-dropdown-bg"],
      ["itemBgActive", "--ds-dropdown-item-bg-active"],
      ["itemBgHover", "--ds-dropdown-item-bg-hover"],
      ["itemColor", "--ds-dropdown-item-color"],
      ["itemColorActive", "--ds-dropdown-item-color-active"],
      ["itemColorHover", "--ds-dropdown-item-color-hover"],
      ["shadow", "--ds-dropdown-shadow"],
    ],
  },
  {
    prop: "empty",
    fields: [
      ["descriptionColor", "--ds-empty-description-color"],
      ["iconColor", "--ds-empty-icon-color"],
    ],
  },
  {
    prop: "floatButton",
    fields: [
      ["badgeBg", "--ds-floatbutton-badge-bg"],
      ["badgeColor", "--ds-floatbutton-badge-color"],
      ["defaultBg", "--ds-floatbutton-default-bg"],
      ["defaultColor", "--ds-floatbutton-default-color"],
      ["descriptionColor", "--ds-floatbutton-description-color"],
      ["primaryBg", "--ds-floatbutton-primary-bg"],
      ["primaryColor", "--ds-floatbutton-primary-color"],
    ],
  },
  {
    prop: "liveFeed",
    fields: [
      ["badgeBg", "--ds-live-feed-badge-bg"],
      ["badgeColor", "--ds-live-feed-badge-color"],
      ["bg", "--ds-live-feed-bg"],
      ["border", "--ds-live-feed-border"],
      ["emptyColor", "--ds-live-feed-empty-color"],
      ["loadMoreColor", "--ds-live-feed-load-more-color"],
      ["newBg", "--ds-live-feed-new-bg"],
      ["newBorder", "--ds-live-feed-new-border"],
      ["newColor", "--ds-live-feed-new-color"],
      ["refreshColor", "--ds-live-feed-refresh-color"],
      ["skeletonBg", "--ds-live-feed-skeleton-bg"],
    ],
  },
  {
    prop: "menu",
    fields: [
      ["bg", "--ds-menu-bg"],
      ["darkBg", "--ds-menu-dark-bg"],
      ["darkItemColor", "--ds-menu-dark-item-color"],
      ["dividerColor", "--ds-menu-divider-color"],
      ["focusRingColor", "--ds-menu-focus-ring-color"],
      ["groupTitleColor", "--ds-menu-group-title-color"],
      ["itemBgActive", "--ds-menu-item-bg-active"],
      ["itemBgHover", "--ds-menu-item-bg-hover"],
      ["itemColor", "--ds-menu-item-color"],
      ["itemColorActive", "--ds-menu-item-color-active"],
      ["itemColorHover", "--ds-menu-item-color-hover"],
      ["itemDangerColor", "--ds-menu-item-danger-color"],
      ["itemHoverBg", "--ds-menu-item-hover-bg"],
      ["itemSelectedBg", "--ds-menu-item-selected-bg"],
      ["itemSelectedColor", "--ds-menu-item-selected-color"],
      ["submenuBg", "--ds-menu-submenu-bg"],
    ],
  },
  {
    prop: "message",
    fields: [
      ["bg", "--ds-message-bg"],
      ["closeColor", "--ds-message-close-color"],
      ["closeColorHover", "--ds-message-close-color-hover"],
      ["shadow", "--ds-message-shadow"],
    ],
  },
  {
    prop: "notification",
    fields: [
      ["bg", "--ds-notification-bg"],
      ["shadow", "--ds-notification-shadow"],
      ["titleColor", "--ds-notification-title-color"],
    ],
  },
  {
    prop: "pagination",
    fields: [
      ["activeBg", "--ds-pagination-active-bg"],
      ["activeColor", "--ds-pagination-active-color"],
      ["itemBg", "--ds-pagination-item-bg"],
      ["itemBgActive", "--ds-pagination-item-bg-active"],
      ["itemBgHover", "--ds-pagination-item-bg-hover"],
      ["itemBorder", "--ds-pagination-item-border"],
      ["itemColor", "--ds-pagination-item-color"],
      ["itemColorActive", "--ds-pagination-item-color-active"],
      ["itemColorHover", "--ds-pagination-item-color-hover"],
    ],
  },
  {
    prop: "progress",
    fields: [
      ["bg", "--ds-progress-bg"],
      ["fillError", "--ds-progress-fill-error"],
      ["fillPrimary", "--ds-progress-fill-primary"],
      ["fillSuccess", "--ds-progress-fill-success"],
      ["fillWarning", "--ds-progress-fill-warning"],
    ],
  },
  {
    prop: "result",
    fields: [
      ["iconColor", "--ds-result-icon-color"],
      ["subtitleColor", "--ds-result-subtitle-color"],
      ["titleColor", "--ds-result-title-color"],
    ],
  },
  {
    prop: "skeleton",
    fields: [
      ["bg", "--ds-skeleton-bg"],
      ["highlight", "--ds-skeleton-highlight"],
      ["waveGradient", "--ds-skeleton-wave-gradient"],
    ],
  },
  {
    prop: "spinner",
    fields: [
      ["color", "--ds-spinner-color"],
      ["track", "--ds-spinner-track"],
    ],
  },
  {
    prop: "statistic",
    fields: [
      ["prefixColor", "--ds-statistic-prefix-color"],
      ["suffixColor", "--ds-statistic-suffix-color"],
      ["titleColor", "--ds-statistic-title-color"],
      ["valueColor", "--ds-statistic-value-color"],
    ],
  },
  {
    prop: "statsGrid",
    fields: [
      ["cardBg", "--ds-stats-grid-card-bg"],
      ["cardBorder", "--ds-stats-grid-card-border"],
      ["cardFilledBg", "--ds-stats-grid-card-filled-bg"],
      ["cardGlassBg", "--ds-stats-grid-card-glass-bg"],
      ["cardGlassBorder", "--ds-stats-grid-card-glass-border"],
      ["descriptionColor", "--ds-stats-grid-description-color"],
      ["labelColor", "--ds-stats-grid-label-color"],
      ["skeletonBg", "--ds-stats-grid-skeleton-bg"],
      ["skeletonWaveGradient", "--ds-stats-grid-skeleton-wave-gradient"],
      ["trendNegative", "--ds-stats-grid-trend-negative"],
      ["trendNeutral", "--ds-stats-grid-trend-neutral"],
      ["trendPositive", "--ds-stats-grid-trend-positive"],
      ["valueColor", "--ds-stats-grid-value-color"],
    ],
  },
  {
    prop: "steps",
    fields: [
      ["connectorColor", "--ds-steps-connector-color"],
      ["connectorColorActive", "--ds-steps-connector-color-active"],
      ["finishBg", "--ds-steps-finish-bg"],
      ["finishBorder", "--ds-steps-finish-border"],
      ["itemBg", "--ds-steps-item-bg"],
      ["itemBgActive", "--ds-steps-item-bg-active"],
      ["itemColor", "--ds-steps-item-color"],
      ["itemColorActive", "--ds-steps-item-color-active"],
      ["processBg", "--ds-steps-process-bg"],
      ["processBorder", "--ds-steps-process-border"],
      ["waitBg", "--ds-steps-wait-bg"],
      ["waitBorder", "--ds-steps-wait-border"],
    ],
  },
  {
    prop: "tag",
    fields: [
      ["border", "--ds-tag-border"],
      ["defaultBg", "--ds-tag-default-bg"],
      ["defaultBorder", "--ds-tag-default-border"],
      ["defaultColor", "--ds-tag-default-color"],
      ["errorBg", "--ds-tag-error-bg"],
      ["errorBorder", "--ds-tag-error-border"],
      ["errorColor", "--ds-tag-error-color"],
      ["primaryBg", "--ds-tag-primary-bg"],
      ["primaryBorder", "--ds-tag-primary-border"],
      ["primaryColor", "--ds-tag-primary-color"],
      ["secondaryBg", "--ds-tag-secondary-bg"],
      ["secondaryBorder", "--ds-tag-secondary-border"],
      ["secondaryColor", "--ds-tag-secondary-color"],
      ["successBg", "--ds-tag-success-bg"],
      ["successBorder", "--ds-tag-success-border"],
      ["successColor", "--ds-tag-success-color"],
      ["warningBg", "--ds-tag-warning-bg"],
      ["warningBorder", "--ds-tag-warning-border"],
      ["warningColor", "--ds-tag-warning-color"],
    ],
  },
  {
    prop: "timeline",
    fields: [
      ["contentColor", "--ds-timeline-content-color"],
      ["dotBg", "--ds-timeline-dot-bg"],
      ["dotBorder", "--ds-timeline-dot-border"],
      ["lineColor", "--ds-timeline-line-color"],
    ],
  },
  {
    prop: "tree",
    fields: [
      ["nodeBgHover", "--ds-tree-node-bg-hover"],
      ["nodeBgSelected", "--ds-tree-node-bg-selected"],
      ["nodeColor", "--ds-tree-node-color"],
      ["nodeColorSelected", "--ds-tree-node-color-selected"],
    ],
  },
] as const;

// EXCISED (SEV-2): `const live = parseExtension(readFileSync(EXTENSION, ...))`
// and `const extensionSource = readFileSync(EXTENSION, "utf8")`. Two
// module-level reads of `artifacts/rottay/_source/extension.css`, deleted by
// SEV-2; they would throw ENOENT at collection. Every assertion they fed is
// named where it was removed.
const t3Names = [...new Set(T3_ROSTER.map((row) => row.name))].sort();
const t3Keys = new Set(T3_ROSTER.map((row) => `${row.mode}|${row.name}`));
const darkRows = T3_ROSTER.filter((row) => row.mode === "dark");
const lightRows = T3_ROSTER.filter((row) => row.mode === "light");

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

const defaultSource = readFileSync(DEFAULT_CSS, "utf8");
const DEFAULT_FLOORS = rootVariables(defaultSource);

/**
 * The dark floor layer. `default.css` carries one rule whose selector list
 * includes `html[data-theme='dark'], html.dark`; thirteen of the 190 drained
 * channels have a declaration there. It is a real collision class -- the same
 * channel is set twice in the loaded document -- so this file measures it
 * rather than assuming it away.
 */
const DARK_FLOORS: Record<string, string> = {};
const DARK_FLOOR_SELECTORS = new Set<string>();
postcss.parse(defaultSource).walkRules((rule) => {
  if (!/html\[data-theme=.dark.\]|html\.dark/.test(rule.selector)) return;
  DARK_FLOOR_SELECTORS.add(rule.selector.replace(/\s+/g, " "));
  rule.walkDecls((declaration) => {
    if (!declaration.prop.startsWith("--")) return;
    if (declaration.prop in DARK_FLOORS) return;
    DARK_FLOORS[declaration.prop] = declaration.value.trim();
  });
});

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
 *   1. the surviving extension row (tenant layer, authored CSS)  -- now empty
 *   2. the compiled tenant artifact (tenant layer, `chromeToVariables`)
 *   3. the `html[data-theme='dark']` floor, for dark only
 *   4. `default.css` `:root`
 *   5. a component `:root` block
 *
 * `skipTenant` drops layers 1 and 2 for ONE name, which is what lets the
 * floor-layer block below ask what the document would paint WITHOUT the tenant
 * artifact -- the question that makes the collision measurable instead of
 * assumed.
 */
function lookup(
  mode: Mode,
  name: string,
  skipTenantFor?: string
): Resolution | null {
  if (name !== skipTenantFor) {
    // EXCISED (SEV-2): the "extension" resolution tier, searched before the
    // compiled value. With the second author gone the compiled artifact is the
    // only tenant author, so this resolver has one fewer layer to arbitrate.
    const emitted = EMITTED[mode][name];
    if (emitted !== undefined)
      return { value: emitted, source: "tenant-compiled" };
  }
  if (mode === "dark") {
    const dark = DARK_FLOORS[name];
    if (dark !== undefined) return { value: dark, source: "default.css#dark" };
  }
  const fallback = DEFAULT_FLOORS[name];
  if (fallback !== undefined) return { value: fallback, source: "default.css" };
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
 * CSS specificity of a simple compound selector, enough for the two selectors
 * this file compares. `:where()` is zero-specificity and `:not()` contributes
 * its argument; neither appears in the floor selectors, and the tenant
 * selector's `:not()` arms each contribute one attribute.
 */
function specificity(selector: string): readonly [number, number, number] {
  const ids = (selector.match(/#[A-Za-z]/g) ?? []).length;
  const attributes = (selector.match(/\[[^\]]*\]/g) ?? []).length;
  const classes = (selector.match(/\.[A-Za-z]/g) ?? []).length;
  const pseudoClasses = (selector.match(/:(?!not\(|where\(|:)[a-z-]+/g) ?? [])
    .length;
  const elements = (selector.match(/(^|[\s>+~,(])([a-z][a-z0-9]*)/g) ?? [])
    .length;
  return [ids, attributes + classes + pseudoClasses, elements];
}

const compare = (
  a: readonly [number, number, number],
  b: readonly [number, number, number]
): number => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/**
 * The selector the compiled rottay artifact paints its dark block under. It is
 * read from the stylesheet this tranche just emptied, so the comparison below
 * is against the real shipped selector rather than a transcription.
 */
const TENANT_DARK_SELECTOR =
  "html[data-tenant='rottay']:not([data-theme='light']):not(.light)";

const DB_CONTEXT = {
  tenantId: "rottay-t3",
  slug: "rottay-t3",
  verticalKey: "rottay",
  rowVersion: 1,
} as const;
const ENVELOPE = getTenantThemeVerticalEnvelope("rottay");

type ChromeFamilies = Record<string, Record<string, string> | undefined>;

const bodyChrome = rottayBrandTheme.chrome as unknown as ChromeFamilies;
const lightChrome = ((
  rottayBrandTheme as unknown as {
    modes?: { light?: { chrome?: ChromeFamilies } };
  }
).modes?.light?.chrome ?? {}) as ChromeFamilies;

/** Build an advanced document that carries a top-level chrome family map. */
const asDocument = (
  chrome: Record<string, Record<string, string>>
): unknown => ({
  schemaVersion: TENANT_THEME_CONFIG_SCHEMA.schemaVersion,
  mode: "advanced",
  visualFoundation: { advanced: { chrome } },
});

function compileDocument(document: unknown): Record<string, string> {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, DB_CONTEXT),
    {
      verticalEnvelope: ENVELOPE,
    }
  ).variables;
}

/** Project one mode authority down to the T3 leaves it owns. */
function project(
  source: ChromeFamilies
): Record<string, Record<string, string>> {
  const chrome: Record<string, Record<string, string>> = {};
  for (const family of FAMILIES) {
    const authored = source[family.prop];
    if (!authored) continue;
    const owned = new Set(family.fields.map(([field]) => field));
    const leaves: Record<string, string> = {};
    for (const [field, value] of Object.entries(authored)) {
      if (owned.has(field)) leaves[field] = value;
    }
    if (Object.keys(leaves).length > 0) chrome[family.prop] = leaves;
  }
  return chrome;
}

const darkDocumentChrome = project(bodyChrome);
const lightDocumentChrome = project(lightChrome);

const PAIRS = FAMILIES.flatMap((family) =>
  family.fields.map(
    ([field, channel]) =>
      [`${family.prop}.${field}`, family.prop, field, channel] as const
  )
);

describe("ROTTAY-T3 MASS - the signed partition", () => {
  it("carries the roster the work order signed, not a roster that fits", () => {
    expect(T3_ROSTER).toHaveLength(CENSUS.removedDeclarations);
    expect(t3Names).toHaveLength(CENSUS.removedChannels);
    expect(rosterHash(T3_ROSTER)).toBe(PINS.t3Roster);
    expect(tupleHash(T3_ROSTER)).toBe(PINS.t3Tuple);
    expect(membershipHash(T3_ROSTER)).toBe(PINS.t3Membership);
  });

  it("is one hundred percent MIGRATE, with an empty delete and hold side", () => {
    expect(T3_ROSTER).toHaveLength(CENSUS.migrateTuples);
    expect(T3_DELETES).toHaveLength(CENSUS.deleteTuples);
    expect(CENSUS.holdTuples).toBe(0);
    // The empty side hashes to the empty-list digest under all three recipes,
    // which is the same digest the drained stylesheet itself now produces.
    expect(rosterHash(T3_DELETES)).toBe(PINS.emptyList);
    expect(tupleHash(T3_DELETES)).toBe(PINS.emptyList);
    expect(membershipHash(T3_DELETES)).toBe(PINS.emptyList);
  });

  it("declares every channel in both modes, so 190 x 2 is a fact not a hope", () => {
    expect(darkRows).toHaveLength(CENSUS.perModeBefore);
    expect(lightRows).toHaveLength(CENSUS.perModeBefore);
    expect([...new Set(darkRows.map((row) => row.name))].sort()).toEqual(
      t3Names
    );
    expect([...new Set(lightRows.map((row) => row.name))].sort()).toEqual(
      t3Names
    );
    expect(t3Keys.size).toBe(CENSUS.removedDeclarations);
  });

  it("covers the roster with the twenty-six typed families, exactly once each", () => {
    expect(FAMILIES).toHaveLength(CENSUS.families);
    const channels = FAMILIES.flatMap((family) =>
      family.fields.map(([, channel]) => channel)
    );
    expect(channels).toHaveLength(CENSUS.bodyLeaves);
    expect([...new Set(channels)]).toHaveLength(CENSUS.bodyLeaves);
    expect([...channels].sort()).toEqual(t3Names);
  });
});

// EXCISED (SEV-2): describe "ROTTAY-T3 MASS - what the file on disk now says"
// — 8 tests, every one of them reading the deleted extension (the describe
// body opened with `postcss.parse(extensionSource)`, so it threw at
// collection):
//   * "counts ZERO custom properties and exactly one declaration"
//   * "matches the terminal digest the work order signed, byte for byte"
//   * "keeps the one non-custom declaration -- the root color -- untouched"
//   * "keeps the @ds-exception header the surviving rule requires"
//   * "leaves no empty rule behind where a family used to be"
//   * "declares none of the 190 drained channels, in either mode"
//   * "hashes as the empty list under every recipe"
//   * "reconstructs the 380-declaration pre-image from roster plus survivors"
//
// Two of these are worth naming exactly, because they are the strongest claims
// SEV-2 retires and they are NOT restated anywhere:
//   1. `sha256(extensionSource) === PINS.terminal` pinned the whole file's
//      terminal bytes. A digest of a file that does not exist has no meaning;
//      the pin is retired with its subject rather than re-pointed at another
//      file, which would be a different claim wearing the same constant.
//   2. The `@ds-exception kind=capability-gap owner=... reachability=shipped
//      retire=...` header assertions governed the ONE surviving rule — the
//      root `color:` line — as a declared, owned, time-boxed exception. That
//      exception is now discharged rather than tracked: SEV-1 moved root-ink
//      authorship into the compiled artifact, where it is emitted through the
//      compiled `--ds-color-text-primary` channel and fails closed when that
//      channel is missing. The render laws in
//      `artifact-renderer/tests/single-author.test.ts` (L1/L2/L4/L6/L7) prove
//      that, and `scripts/verticals/first-party-single-author-gate/index.mjs` law G2 proves no
//      new exception can be authored back onto the tree.
// `PINS.terminal` itself is left in the pin block below, unreferenced, because
// the pin table is a signed historical record of this tranche.

describe("ROTTAY-T3 MASS - the pre-image is literal, so the before-paint is not simulated", () => {
  it("carries no var() reference in any of the 380 values", () => {
    const referencing = T3_ROSTER.filter((row) => row.value.includes("var("));
    expect(referencing).toEqual([]);
  });

  it("carries no cascade reset -- nothing was `initial` or `unset`", () => {
    const resets = T3_ROSTER.filter(
      (row) => row.value === "initial" || row.value === "unset"
    );
    expect(resets).toEqual([]);
  });

  it("keeps the six gradients and bounds every shadow at two layers", () => {
    const gradients = T3_ROSTER.filter((row) => /gradient\(/.test(row.value));
    expect(gradients).toHaveLength(CENSUS.gradientValues);
    const layers = (value: string): number => {
      let depth = 0;
      let count = 1;
      for (const character of value) {
        if (character === "(") depth += 1;
        else if (character === ")") depth -= 1;
        else if (character === "," && depth === 0) count += 1;
      }
      return count;
    };
    for (const row of T3_ROSTER) {
      expect(layers(row.value), row.name).toBeLessThanOrEqual(
        CENSUS.maxShadowLayers
      );
    }
  });
});

describe("ROTTAY-T3 MASS - the paint did not move", () => {
  it("repaints all 380 pre-image tuples through the compiled artifact", () => {
    const drift: string[] = [];
    for (const row of T3_ROSTER) {
      const before = resolveValue(row.mode, row.value);
      const after = resolveValue(row.mode, lookup(row.mode, row.name)?.value);
      if (before === null || after === null || before !== after) {
        drift.push(`${row.mode} ${row.name}: ${before} -> ${after}`);
      }
    }
    expect(drift).toEqual([]);
  });

  it("names the layer every drained tuple now paints from", () => {
    const sources = new Set<string>();
    for (const row of T3_ROSTER) {
      const found = lookup(row.mode, row.name);
      expect(found, `${row.mode} ${row.name}`).not.toBeNull();
      sources.add((found as Resolution).source);
    }
    // One layer, for all 380: the shared lowering. Not a floor, not a leftover
    // extension row -- there are none of either left to read.
    expect([...sources]).toEqual(["tenant-compiled"]);
  });

  // PARTIALLY EXCISED (SEV-2): the `live` overlap half of this test — the
  // compiled-vs-extension collision check — is gone with the corpus. The
  // per-row compiled equality below is the load-bearing half and survives.
  it("emits each channel exactly once, at the compiled value", () => {
    for (const row of T3_ROSTER) {
      expect(EMITTED[row.mode][row.name], `${row.mode} ${row.name}`).toBe(
        emittedToday(row)
      );
    }
  });
});

describe("ROTTAY-T3 MASS - the dark floor layer is a measured collision, not a hope", () => {
  const collided = t3Names.filter((name) => name in DARK_FLOORS).sort();

  it("finds exactly thirteen drained channels with an html.dark floor", () => {
    expect(collided).toEqual([
      "--ds-anchor-ink-color",
      "--ds-anchor-link-color",
      "--ds-anchor-link-color-active",
      "--ds-descriptions-bg",
      "--ds-descriptions-border",
      "--ds-descriptions-content-color",
      "--ds-descriptions-label-color",
      "--ds-menu-dark-bg",
      "--ds-menu-dark-item-color",
      "--ds-menu-item-bg-active",
      "--ds-menu-item-bg-hover",
      "--ds-menu-item-color",
      "--ds-menu-item-color-hover",
    ]);
  });

  it("is outranked by the tenant rule on every arm of the floor selector", () => {
    const tenant = specificity(TENANT_DARK_SELECTOR);
    expect(DARK_FLOOR_SELECTORS.size).toBeGreaterThan(0);
    for (const selector of DARK_FLOOR_SELECTORS) {
      for (const arm of selector.split(",").map((part) => part.trim())) {
        expect(compare(tenant, specificity(arm)), arm).toBeGreaterThan(0);
      }
    }
  });

  it("paints the migrated literal on all thirteen, from the tenant layer", () => {
    for (const name of collided) {
      const row = darkRows.find((candidate) => candidate.name === name);
      expect(row, name).toBeDefined();
      const found = lookup("dark", name);
      expect(found?.source, name).toBe("tenant-compiled");
      expect(resolveValue("dark", found?.value), name).toBe(
        resolveValue("dark", (row as Declaration).value)
      );
    }
  });

  it("proves the dominance is load-bearing, naming which floors would repaint", () => {
    // Skipping the tenant layer for ONE name at a time answers what the
    // document would paint without the migration. ALL THIRTEEN floors resolve
    // to a different colour than the literal the extension authored, so the
    // specificity result above is not decorative: if the compiled artifact
    // stopped emitting these channels, the screen would change on every one of
    // them. The neutral set is empty, and that emptiness is asserted rather
    // than left as an absence.
    const repaints: string[] = [];
    const neutral: string[] = [];
    for (const name of collided) {
      const row = darkRows.find(
        (candidate) => candidate.name === name
      ) as Declaration;
      const floor = lookup("dark", name, name);
      expect(floor?.source, name).toBe("default.css#dark");
      const authored = resolveValue("dark", row.value);
      const withoutTenant = resolveValue("dark", floor?.value);
      (withoutTenant === authored ? neutral : repaints).push(name);
    }
    expect([...repaints].sort()).toEqual(collided);
    expect(neutral).toEqual([]);
    expect(repaints.length + neutral.length).toBe(collided.length);
  });
});

describe("ROTTAY-T3 MASS - the typed shape is closed and total", () => {
  it("declares 190 body leaves and 186 light deltas across 26 families", () => {
    let body = 0;
    let light = 0;
    for (const family of FAMILIES) {
      const authored = bodyChrome[family.prop];
      expect(authored, family.prop).toBeDefined();
      const owned = new Set(family.fields.map(([field]) => field));
      expect(Object.keys(authored as object).sort()).toEqual([...owned].sort());
      body += Object.keys(authored as object).length;
      light += Object.keys(lightChrome[family.prop] ?? {}).length;
    }
    expect(body).toBe(CENSUS.bodyLeaves);
    expect(light).toBe(CENSUS.lightLeaves);
  });

  it("declares every leaf in the closed default shape, and nothing else", () => {
    const shape = DEFAULT_CHROME_SHAPE as unknown as ChromeFamilies;
    for (const family of FAMILIES) {
      const declared = shape[family.prop];
      expect(declared, family.prop).toBeDefined();
      expect(Object.keys(declared as object).sort()).toEqual(
        family.fields.map(([field]) => field).sort()
      );
    }
  });

  it("authors the union of body and light exactly, with no `initial`", () => {
    for (const row of T3_ROSTER) {
      const family = FAMILIES.find((candidate) =>
        candidate.fields.some(([, channel]) => channel === row.name)
      );
      expect(family, row.name).toBeDefined();
      const field = (family as (typeof FAMILIES)[number]).fields.find(
        ([, channel]) => channel === row.name
      )?.[0] as string;
      const prop = (family as (typeof FAMILIES)[number]).prop;
      // Light reads the delta first and falls back to the body PER FIELD, not
      // per family: the four identical channels sit inside families that do
      // author other light deltas, so a family-level fallback would miss them.
      const authored =
        row.mode === "dark"
          ? bodyChrome[prop]?.[field]
          : lightChrome[prop]?.[field] ?? bodyChrome[prop]?.[field];
      expect(authored, `${row.mode} ${row.name}`).toBe(emittedToday(row));
      expect(authored).not.toBe("initial");
    }
  });

  it("omits exactly the forty channels whose light paint equals its dark paint", () => {
    const identical = t3Names
      .filter((name) => {
        const dark = darkRows.find((row) => row.name === name);
        const light = lightRows.find((row) => row.name === name);
        // Con el valor de HOY: la pregunta es si el claro sigue teniendo algo
        // distinto que decir, y eso lo decide la forma vigente, no la historica.
        return (
          bare(dark ? emittedToday(dark) : "") ===
          bare(light ? emittedToday(light) : "")
        );
      })
      .sort();
    // El titulo historico decia "four": esos eran los CUATRO originales.
    // La lista crecio en tres olas de re-cableo, todas de forma y no de
    // pintura -- F2.4 PILOTO +4, F4A-6 (K3) +18, K1 +14 -- hasta los 40 de
    // hoy, y el titulo se re-anclo con ella.
    //
    // F2.4 PILOTO: cuatro se sumaron a los cuatro originales. No cambiaron de
    // pintura -- cambiaron de FORMA: el cuerpo pasa de un literal a
    // `var(--ds-color-primary)`, que ya resolvia a ese mismo literal en cada
    // modo, y con eso el delta claro dejo de tener nada que decir. La ley de
    // este bloque -- "identico en ambos modos => no se restata en light" -- es
    // exactamente la que los admite.
    expect(identical).toEqual([
      "--ds-anchor-ink-color",
      "--ds-avatar-default-color",
      "--ds-avatar-group-overflow-color",
      "--ds-avatar-primary-bg",
      "--ds-avatar-ring-color",
      "--ds-avatar-secondary-color",
      "--ds-backtop-bg",
      "--ds-drawer-body-color",
      "--ds-dropdown-item-color",
      "--ds-floatbutton-badge-color",
      "--ds-floatbutton-default-color",
      "--ds-floatbutton-description-color",
      "--ds-floatbutton-primary-bg",
      "--ds-live-feed-badge-bg",
      "--ds-live-feed-refresh-color",
      "--ds-menu-focus-ring-color",
      "--ds-menu-item-color",
      "--ds-pagination-active-bg",
      "--ds-pagination-item-bg",
      "--ds-pagination-item-bg-active",
      "--ds-pagination-item-border",
      "--ds-pagination-item-color",
      "--ds-progress-fill-primary",
      "--ds-spinner-color",
      "--ds-statistic-prefix-color",
      "--ds-statistic-suffix-color",
      "--ds-statistic-title-color",
      "--ds-stats-grid-label-color",
      "--ds-steps-connector-color-active",
      "--ds-steps-item-bg-active",
      "--ds-steps-process-bg",
      "--ds-steps-process-border",
      "--ds-steps-wait-bg",
      "--ds-tag-default-color",
      "--ds-tag-primary-bg",
      "--ds-tag-primary-border",
      "--ds-tag-secondary-color",
      "--ds-timeline-content-color",
      "--ds-timeline-dot-bg",
      "--ds-tree-node-color",
    ]);
    expect(identical).toHaveLength(CENSUS.identicalChannels);
    for (const name of identical) {
      const family = FAMILIES.find((candidate) =>
        candidate.fields.some(([, channel]) => channel === name)
      ) as (typeof FAMILIES)[number];
      const field = family.fields.find(
        ([, channel]) => channel === name
      )?.[0] as string;
      expect(lightChrome[family.prop]?.[field], name).toBeUndefined();
    }
    expect(CENSUS.bodyLeaves - CENSUS.identicalChannels).toBe(
      CENSUS.lightLeaves
    );
  });

  it("classifies all 190 channels MM, with MX, XM and XX empty", () => {
    let mm = 0;
    let mx = 0;
    let xm = 0;
    let xx = 0;
    for (const name of t3Names) {
      const dark = darkRows.some((row) => row.name === name);
      const light = lightRows.some((row) => row.name === name);
      if (dark && light) mm += 1;
      else if (dark) mx += 1;
      else if (light) xm += 1;
      else xx += 1;
    }
    expect([mm, mx, xm, xx]).toEqual([CENSUS.removedChannels, 0, 0, 0]);
  });
});

describe("ROTTAY-T3 MASS - one lowering, both transports", () => {
  const PROBE = "#010203";

  it.each(PAIRS)(
    "%s is lowered by the shared producer in both transports",
    (_label, prop, field, channel) => {
      // DB transport: the field alone must reach the channel. `.variables` is
      // a delta against the code-owned vertical baseline, so the probe value
      // has to differ from the authored one for the delta to exist at all --
      // which is exactly why a missing lowering shows up as an empty delta.
      const document = asDocument({ [prop]: { [field]: PROBE } });
      const validated = validateTenantThemeDocument(document);
      expect(validated.success, `${prop}.${field} rejected`).toBe(true);
      expect(compileDocument(document)[channel]).toBe(PROBE);

      // Static transport: remove the field from both mode authorities and the
      // channel must disappear. If it survives, something else emits it and
      // the field was never the authority.
      const clone = structuredClone(rottayBrandTheme);
      const body = (clone.chrome as unknown as ChromeFamilies)[prop];
      const light = ((
        clone as unknown as { modes?: { light?: { chrome?: ChromeFamilies } } }
      ).modes?.light?.chrome ?? {})[prop];
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

  it("adds no slug, vertical or product branch to the producer source", () => {
    const source = readFileSync(CHROME_VARIABLES_SOURCE, "utf8");
    const start = source.indexOf("const FLAT_CHROME_FAMILY_VARIABLES");
    expect(start).toBeGreaterThan(-1);
    const region = source.slice(
      source.indexOf("const ALERT_CHROME_VARIABLES"),
      source.indexOf("]", source.indexOf("FLAT_CHROME_FAMILY_VARIABLES = ["))
    );
    for (const forbidden of [
      "rottay",
      "bithire",
      "evnto",
      "tenantSlug",
      "verticalKey",
      "productProfile",
    ]) {
      expect(region.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });
});

describe("ROTTAY-T3 MASS - the DB documents of the twenty-six families", () => {
  it("admits all twenty-six families as one advanced document", () => {
    for (const chrome of [darkDocumentChrome, lightDocumentChrome]) {
      const validated = validateTenantThemeDocument(asDocument(chrome));
      expect(validated.success).toBe(true);
    }
    expect(Object.keys(darkDocumentChrome).sort()).toEqual(
      FAMILIES.map((family) => family.prop).sort()
    );
    expect(
      Object.values(darkDocumentChrome).reduce(
        (total, leaves) => total + Object.keys(leaves).length,
        0
      )
    ).toBe(CENSUS.bodyLeaves);
    expect(
      Object.values(lightDocumentChrome).reduce(
        (total, leaves) => total + Object.keys(leaves).length,
        0
      )
    ).toBe(CENSUS.lightLeaves);
  });

  it("compiles the dark document to a ZERO delta -- byte-identical, not merely close", () => {
    // `compileTenantThemeConfig` emits only what differs from the code-owned
    // vertical baseline, and that baseline IS the static rottay BrandTheme
    // lowered by the same `compileTheme`. A DB document carrying the same 190
    // leaves therefore has nothing to override. Zero is the strongest form of
    // static=DB identity available here: one drifting byte would surface as a
    // one-entry delta.
    expect(compileDocument(asDocument(darkDocumentChrome))).toEqual({});
  });

  it("shows the zero delta is a comparison, not an empty pipeline", () => {
    const mutated = structuredClone(darkDocumentChrome);
    (mutated.alert as Record<string, string>).errorBg = "#123456";
    expect(compileDocument(asDocument(mutated))).toEqual({
      "--ds-alert-error-bg": "#123456",
    });
  });

  it("holds the same zero-delta identity family by family, all twenty-six", () => {
    const drift: string[] = [];
    for (const family of FAMILIES) {
      const chrome = { [family.prop]: darkDocumentChrome[family.prop] ?? {} };
      const delta = compileDocument(asDocument(chrome));
      if (Object.keys(delta).length !== 0) {
        drift.push(`${family.prop}: ${JSON.stringify(delta)}`);
      }
    }
    expect(drift).toEqual([]);
  });

  it("turns a single mutated leaf into exactly one entry, in every family", () => {
    const wrong: string[] = [];
    for (const family of FAMILIES) {
      const [field, channel] = family.fields[0] as readonly [string, string];
      const chrome = {
        [family.prop]: {
          ...(darkDocumentChrome[family.prop] ?? {}),
          [field]: "#010203",
        },
      };
      const delta = compileDocument(asDocument(chrome));
      if (Object.keys(delta).length !== 1 || delta[channel] !== "#010203") {
        wrong.push(`${family.prop}.${field}: ${JSON.stringify(delta)}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it("compiles the light document within the compiled-variable guard", () => {
    const delta = compileDocument(asDocument(lightDocumentChrome));
    const names = Object.keys(delta).sort();
    expect(names).toHaveLength(CENSUS.lightLeaves);
    for (const name of names) {
      expect(t3Names).toContain(name);
      expect(delta[name]).toBe(EMITTED.light[name]);
    }
    expect(names.length).toBeLessThanOrEqual(
      TENANT_THEME_CONFIG_SCHEMA.limits.maxCompiledVariables
    );
  });

  it("rejects a field the schema does not declare on a new family", () => {
    const validated = validateTenantThemeDocument(
      asDocument({ alert: { notAField: "#123456" } })
    );
    expect(validated.success).toBe(false);
    expect(
      (validated as { issues: ReadonlyArray<{ code: string }> }).issues.some(
        (issue) => issue.code === "unknown_key"
      )
    ).toBe(true);
  });

  it("rejects a family the roster does not carry", () => {
    const validated = validateTenantThemeDocument(
      asDocument({ notAFamily: { bg: "#123456" } })
    );
    expect(validated.success).toBe(false);
  });
});

describe("ROTTAY-T3 MASS - the channel map is exact, not prefix matching", () => {
  it("maps each field to one channel and each channel to one field", () => {
    const byChannel = new Map<string, string>();
    for (const family of FAMILIES) {
      for (const [field, channel] of family.fields) {
        expect(byChannel.has(channel), channel).toBe(false);
        byChannel.set(channel, `${family.prop}.${field}`);
      }
    }
    expect(byChannel.size).toBe(CENSUS.bodyLeaves);
  });

  it("keeps the four irregular prefixes exactly as the channels spell them", () => {
    const prefixes: Record<string, string> = {
      backTop: "--ds-backtop-",
      floatButton: "--ds-floatbutton-",
      liveFeed: "--ds-live-feed-",
      statsGrid: "--ds-stats-grid-",
    };
    for (const [prop, prefix] of Object.entries(prefixes)) {
      const family = FAMILIES.find((candidate) => candidate.prop === prop);
      expect(family, prop).toBeDefined();
      for (const [, channel] of (family as (typeof FAMILIES)[number]).fields) {
        expect(channel.startsWith(prefix), channel).toBe(true);
      }
    }
  });

  it("does not admit a longer homonym of a real channel", () => {
    // `--ds-tag-border` is a channel; `--ds-tag-border-width` is not. A prefix
    // or startsWith-based map would answer yes to both.
    const channels = new Set(
      FAMILIES.flatMap((family) => family.fields.map(([, channel]) => channel))
    );
    expect(channels.has("--ds-tag-border")).toBe(true);
    expect(channels.has("--ds-tag-border-width")).toBe(false);
    expect(channels.has("--ds-spinner-color")).toBe(true);
    expect(channels.has("--ds-spinner-color-x")).toBe(false);
    for (const planted of ["--ds-tag-border-width", "--ds-spinner-color-x"]) {
      expect(EMITTED.dark[planted], planted).toBeUndefined();
      expect(EMITTED.light[planted], planted).toBeUndefined();
    }
  });
});

describe("ROTTAY-T3 MASS - causality", () => {
  // EXCISED (SEV-2): "a reinserted row is caught even though it restores a
  // byte-equal value" — it planted a roster row back into the live extension
  // corpus (`[...live, row]`). The corpus is gone; reinsertion is now
  // structurally impossible rather than detected, per
  // `scripts/verticals/first-party-single-author-gate/index.mjs` law G2. The wrong-block and
  // hash-recipe mutants below are UNTOUCHED — they mutate T3_ROSTER.

  it("a row reinserted in the WRONG block is caught as a mode conflict", () => {
    const dark = darkRows.find((row) =>
      lightRows.some(
        (other) => other.name === row.name && other.value !== row.value
      )
    ) as Declaration;
    const misplaced: Declaration = { ...dark, mode: "light" };
    expect(resolveValue("light", misplaced.value)).not.toBe(
      resolveValue(
        "light",
        (lightRows.find((row) => row.name === dark.name) as Declaration).value
      )
    );
  });

  it("a same-count value swap breaks the tuple hash and only the tuple hash", () => {
    const swapped = T3_ROSTER.map((row, index) => {
      if (index === 0)
        return { ...row, value: (T3_ROSTER[1] as Declaration).value };
      if (index === 1)
        return { ...row, value: (T3_ROSTER[0] as Declaration).value };
      return row;
    });
    expect(swapped).toHaveLength(CENSUS.removedDeclarations);
    expect(rosterHash(swapped)).toBe(PINS.t3Roster);
    expect(membershipHash(swapped)).toBe(PINS.t3Membership);
    expect(tupleHash(swapped)).not.toBe(PINS.t3Tuple);
  });

  it("a wrong value in one row breaks the tuple hash", () => {
    const mutated = T3_ROSTER.map((row, index) =>
      index === 0 ? { ...row, value: "#010203" } : row
    );
    expect(rosterHash(mutated)).toBe(PINS.t3Roster);
    expect(tupleHash(mutated)).not.toBe(PINS.t3Tuple);
  });

  it("a dropped row breaks the roster and the membership together", () => {
    const mutated = T3_ROSTER.slice(1);
    expect(mutated).toHaveLength(CENSUS.removedDeclarations - 1);
    expect(membershipHash(mutated)).not.toBe(PINS.t3Membership);
    expect(tupleHash(mutated)).not.toBe(PINS.t3Tuple);
  });

  it("a planted DELETE row fails the coverage law the empty side rests on", () => {
    // The empty delete side is only meaningful if the file would notice a
    // non-empty one. A delete row is, by definition, a channel with no typed
    // field; planting one and asking the coverage law about it must fail.
    const planted: Declaration = {
      mode: "dark",
      name: "--ds-tag-border-width",
      value: "1px",
    };
    const covered = FAMILIES.some((family) =>
      family.fields.some(([, channel]) => channel === planted.name)
    );
    expect(covered).toBe(false);
    expect(EMITTED.dark[planted.name]).toBeUndefined();
    // and a real roster row passes the same law
    const real = T3_ROSTER[0] as Declaration;
    expect(
      FAMILIES.some((family) =>
        family.fields.some(([, channel]) => channel === real.name)
      )
    ).toBe(true);
  });

  it("a dropped light delta lets the dark body bleed into light", () => {
    const divergent = lightRows.find((row) => {
      const dark = darkRows.find((other) => other.name === row.name);
      return dark !== undefined && bare(dark.value) !== bare(row.value);
    }) as Declaration;
    const family = FAMILIES.find((candidate) =>
      candidate.fields.some(([, channel]) => channel === divergent.name)
    ) as (typeof FAMILIES)[number];
    const field = family.fields.find(
      ([, channel]) => channel === divergent.name
    )?.[0] as string;
    const clone = structuredClone(rottayBrandTheme);
    const light = ((
      clone as unknown as { modes?: { light?: { chrome?: ChromeFamilies } } }
    ).modes?.light?.chrome ?? {})[family.prop];
    expect(light?.[field]).toBe(divergent.value);
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
    const darkRow = darkRows.find(
      (row) => row.name === divergent.name
    ) as Declaration;
    expect(effective[divergent.name]).toBe(darkRow.value);
    expect(effective[divergent.name]).not.toBe(divergent.value);
  });
});
