/**
 * @fileoverview Admission: the value grammar and the payload ceilings, on
 * both sides of the compile.
 *
 * ONE grammar, two jurisdictions. `isSafeVisualValue` -- held by the schema
 * owner below since S19-A01, and re-exported here -- has always carried them:
 * the AUTHORED one, with the tenant's radius/padding/gap/shadow/reference
 * ceilings, and the EMITTED one, which drops those ceilings because the
 * compiler produced the value from an authored leaf already checked upstream.
 * They live in one owner because splitting them is what let them disagree.
 *
 * Everything here used to live inside `compileTenantTheme`, which meant the
 * `preview` and `draft` origins emitted channels nobody had measured: a draft
 * could publish `notacolor`, an unbounded shadow or a payload past the
 * artifact cap and see it painted (F-13, F-61). The rules are unchanged; what
 * changed is that the compile door runs them for every tenant-authored origin,
 * and the DB terminal no longer owns a second copy.
 *
 * @module Compilers/Theme/Facade/Foundation/Admission/Runtime/Limits
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type { ThemeLayerPatch } from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  ledgerOwnerOfLeaf,
  type DecisionProvenanceLedger,
} from "@/foundation/contracts/composition/tenants/themes/provenance";
import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { TenantThemeArtifactModeDelta } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  canonicalizeJsonValue,
  compareCodeUnits,
} from "@/foundation/kernel/serialization";
import {
  EXPRESSIVE_A11Y_FLOORS,
  EXPRESSIVE_EDGE_WIDTH_CHANNELS,
  STRUCTURAL_WIDTH_CHANNELS,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";
import {
  TENANT_THEME_CONFIG_SCHEMA,
  isSafeVisualValue,
  type TenantThemeSchemaNode,
} from "@/infrastructure/compilers/kernel/foundation/schemas/tenant-theme";
import type { ThemeAdmissionIssue } from "../../foundation/issues";
import { authoredSelfReference } from "../../foundation/references";

/**
 * The authored/emitted visual-value grammar, re-exported from the schema owner
 * that now holds it.
 *
 * It moved DOWN, not away: the v1 ingress producers sit below this facade and
 * could not read it here, so preview and persisted-intent compiles lowered raw
 * override values with no grammar on them at all (S19-A01). The rule is
 * unchanged and this door keeps naming it.
 */
export { isSafeVisualValue };

/* -------------------------------------------------------------------------- */
/* The AUTHORED side of the same grammar (RT04)                               */
/* -------------------------------------------------------------------------- */

/**
 * The chrome keypaths the publication schema types `visual-value`, read off
 * that schema rather than restated.
 *
 * The chrome subtree is not uniformly CSS: `card.paddingDensity` is the word
 * `normal`, an anatomy is a variant name, a font weight is a number. Only the
 * fields publication measures with this grammar are measured here, so the door
 * and the terminal answer the same question about the same field.
 */
const VISUAL_VALUE_CHROME_LEAVES: ReadonlySet<string> = (() => {
  const leaves = new Set<string>();
  const walk = (node: TenantThemeSchemaNode | undefined, trail: string): void => {
    if (!node) return;
    if (node.type === "object") {
      for (const [key, child] of Object.entries(node.fields)) {
        walk(child, trail === "" ? key : `${trail}.${key}`);
      }
      return;
    }
    if (node.type === "string" && node.format === "visual-value") leaves.add(trail);
  };
  const child = (
    node: TenantThemeSchemaNode | undefined,
    key: string
  ): TenantThemeSchemaNode | undefined =>
    node && node.type === "object" ? node.fields[key] : undefined;
  let node = TENANT_THEME_CONFIG_SCHEMA.documents
    .advanced as unknown as TenantThemeSchemaNode;
  for (const key of ["visualFoundation", "advanced", "chrome"]) {
    node = child(node, key) as TenantThemeSchemaNode;
  }
  walk(node, "");
  return leaves;
})();

/**
 * The authored surface these caps govern: the chrome subtree, at the base
 * level and inside a mode overlay.
 *
 * It is the one subtree all four public transports author verbatim -- v1
 * `visualFoundation.advanced.chrome`, v2 `overrides.chrome` and a draft's own
 * `chrome` all reach the patch unchanged.
 */
function chromeRoots(
  patch: ThemeLayerPatch
): readonly (readonly [unknown, string])[] {
  const roots: (readonly [unknown, string])[] = [[patch.chrome, "chrome"]];
  const modes = patch.modes as Record<string, { chrome?: unknown }> | undefined;
  for (const mode of Object.keys(modes ?? {})) {
    roots.push([modes?.[mode]?.chrome, `modes.${mode}.chrome`]);
  }
  return roots;
}

/**
 * Whether this leaf is a value the TENANT wrote, and the path it wrote it at.
 *
 * A ledger-bearing transport names every authoring route into chrome, so a
 * chrome leaf it does not attribute to a sanctioned override is not raw
 * authorship: it is what a decision expanded into. `shape.button-style: pill`
 * lowers to a `9999px` control radius, and measuring THAT against the tenant's
 * authored radius ceiling would refuse a Standard decision for the shape of
 * its own derived output -- the exact "an authorized decision may propagate to
 * destinations whose direct editing is restricted" the plan law states. The
 * decision itself was already judged, by domain, envelope and tier.
 *
 * The exemption follows the DERIVATION, never the keypath. A transport with no
 * ledger recorded no derivation, so every leaf it moved is authorship measured
 * at its own keypath: exempting a keypath merely because some decision COULD
 * have derived it let a draft author a `99999px` control radius without ever
 * selecting a button style.
 */
function authoredAt(
  leaf: string,
  ledger: DecisionProvenanceLedger | undefined
): string | null {
  if (!ledger) return `$.${leaf}`;
  const owner = ledgerOwnerOfLeaf(ledger, leaf);
  if (!owner) return null;
  return owner.ref.kind === "sanctioned-override" ? `$.${owner.ref.path}` : null;
}

/**
 * Refuse an authored chrome value that leaves the tenant grammar or closes a
 * reference on its own channel, by path.
 *
 * `moved` is the same set the tier and envelope stations are handed, so an
 * inherited baseline value is never measured against a tenant cap: a
 * `preset-inherited` leaf is not authorship and answers to no authored ceiling.
 */
export function authoredValueIssues(
  patch: ThemeLayerPatch,
  moved: ReadonlySet<string>,
  ledger?: DecisionProvenanceLedger
): ThemeAdmissionIssue[] {
  const issues: ThemeAdmissionIssue[] = [];
  const walk = (value: unknown, leaf: string, field: string): void => {
    if (value === undefined) return;
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      if (typeof value !== "string" || !moved.has(leaf)) return;
      if (!VISUAL_VALUE_CHROME_LEAVES.has(field)) return;
      const path = authoredAt(leaf, ledger);
      if (path === null) return;
      // The reference cycle is asked first: `var(--ds-radius-button)` on the
      // leaf that WRITES `--ds-radius-button` clears every grammar rule and
      // every ceiling, so the general check would admit it and report nothing.
      const cyclic = authoredSelfReference(field, value);
      if (cyclic !== null) {
        issues.push({
          code: "unsafe_value",
          path,
          message: `Reference cycle: var(${cyclic}) resolves to a channel this override writes`,
        });
        return;
      }
      if (isSafeVisualValue(value, path, true)) return;
      issues.push({
        code: "unsafe_value",
        path,
        message: `Invalid or unsafe visual-value ${JSON.stringify(value)}`,
      });
      return;
    }
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      walk(child, `${leaf}.${key}`, field === "" ? key : `${field}.${key}`);
    }
  };
  for (const [root, leaf] of chromeRoots(patch)) walk(root, leaf, "");
  return issues;
}

/**
 * The universal a11y cap on expressive edge widths, evaluated per EMITTED
 * channel because that is the only place the compiled magnitude exists.
 */
export function assertExpressiveEdgeWidthInvariant(
  key: string,
  value: string
): ThemeAdmissionIssue | null {
  // C2c: classification-first (the evasion audit made law). Structural
  // width channels are layout dimensions and sit explicitly outside the
  // cap's jurisdiction; the expressive list covers the edge grammar AND the
  // component floors derived from it; the regex stays as the family
  // catch-all for future edge-role channels.
  if ((STRUCTURAL_WIDTH_CHANNELS as readonly string[]).includes(key)) {
    return null;
  }
  const isExpressive =
    (EXPRESSIVE_EDGE_WIDTH_CHANNELS as readonly string[]).includes(key) ||
    /^--ds-edge-[a-z-]*width$/.test(key);
  if (!isExpressive) return null;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed <= EXPRESSIVE_A11Y_FLOORS.edgeWidthMaxPx) return null;
  return {
    code: "unsafe_value",
    path: `$.variables[${JSON.stringify(key)}]`,
    message: `Expressive edge width ${value} exceeds the universal a11y cap (${EXPRESSIVE_A11Y_FLOORS.edgeWidthMaxPx}px)`,
  };
}

/** Channel maps serialize in code-unit order so a digest is stable. */
export function sortedThemeVariables(
  variables: Readonly<Record<string, string>>
): Record<string, string> {
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(variables).sort(compareCodeUnits)) {
    sorted[key] = variables[key];
  }
  return sorted;
}

function effectiveModeVariables(
  compiled: ThemeCompilation,
  mode: FlatThemeMode
): Record<string, string> {
  const block = compiled.modeBlocks?.find(
    (candidate) => candidate.mode === mode
  );
  return { ...compiled.cssVariables, ...block?.cssVariables };
}

/**
 * What this compile CHANGED against the vertical's own compile.
 *
 * One projector, two readers: the admission below measures the tenant's own
 * emission against the ceilings, and the DB terminal writes exactly these
 * bytes into its artifact. A second delta would be a second answer to "what
 * did this tenant move".
 */
export function themeChannelDelta(
  compiled: ThemeCompilation,
  baseline: ThemeCompilation
): {
  variables: Record<string, string>;
  modeDeltas: readonly TenantThemeArtifactModeDelta[];
} {
  const base: Record<string, string> = {};
  for (const [key, value] of Object.entries(compiled.cssVariables)) {
    if (baseline.cssVariables[key] !== value) base[key] = value;
  }
  const variables = sortedThemeVariables(base);

  const modes = new Set<FlatThemeMode>();
  for (const block of compiled.modeBlocks ?? []) modes.add(block.mode);
  for (const block of baseline.modeBlocks ?? []) modes.add(block.mode);

  const modeDeltas: TenantThemeArtifactModeDelta[] = [];
  for (const mode of ["light", "dark"] as const) {
    if (!modes.has(mode)) continue;
    const expected = effectiveModeVariables(compiled, mode);
    const withBaseDelta = {
      ...effectiveModeVariables(baseline, mode),
      ...variables,
    };
    const moved: Record<string, string> = {};
    for (const [key, value] of Object.entries(expected)) {
      if (withBaseDelta[key] !== value) moved[key] = value;
    }
    if (Object.keys(moved).length > 0) {
      modeDeltas.push({ mode, variables: sortedThemeVariables(moved) });
    }
  }
  return { variables, modeDeltas };
}

/** What the admission and the artifact both call a tenant's own emission. */
export interface ThemeChannelDelta {
  readonly variables: Readonly<Record<string, string>>;
  readonly modeDeltas: readonly TenantThemeArtifactModeDelta[];
}

/**
 * Refuse an emission that breaks the value grammar or blows a payload ceiling.
 *
 * Measured over the DELTA rather than the whole compile on purpose: the
 * vertical's own baseline is code-owned and already shipped, so measuring it
 * here would report the product against a tenant cap.
 */
export function limitIssues(delta: ThemeChannelDelta): ThemeAdmissionIssue[] {
  const issues: ThemeAdmissionIssue[] = [];
  const limits = TENANT_THEME_CONFIG_SCHEMA.limits;

  const compiledVariableCount =
    Object.keys(delta.variables).length +
    delta.modeDeltas.reduce(
      (total, block) => total + Object.keys(block.variables).length,
      0
    );
  if (compiledVariableCount > limits.maxCompiledVariables) {
    issues.push({
      code: "invalid_value",
      path: "$.visualFoundation",
      message: `Compiled variable count exceeds ${limits.maxCompiledVariables}`,
    });
  }

  const projectedVariableMaps = [
    delta.variables,
    ...delta.modeDeltas.map((block) => block.variables),
  ];
  for (const [key, value] of projectedVariableMaps.flatMap((map) =>
    Object.entries(map)
  )) {
    const edgeIssue = assertExpressiveEdgeWidthInvariant(key, value);
    if (edgeIssue) {
      issues.push(edgeIssue);
      continue;
    }
    if (
      !key.startsWith("--ds-") ||
      !isSafeVisualValue(value, `$.variables[${JSON.stringify(key)}]`, false)
    ) {
      issues.push({
        code: "unsafe_value",
        path: `$.variables[${JSON.stringify(key)}]`,
        message: `Appearance compiler emitted an unsafe variable declaration: ${JSON.stringify(
          value
        )}`,
      });
    }
  }

  const compiledVariableBytes = new TextEncoder().encode(
    canonicalizeJsonValue({
      variables: delta.variables,
      modeDeltas: delta.modeDeltas,
    })
  ).byteLength;
  if (compiledVariableBytes > limits.maxCompiledVariableBytes) {
    issues.push({
      code: "invalid_value",
      path: "$.visualFoundation",
      message: `Compiled variable payload exceeds ${limits.maxCompiledVariableBytes} bytes`,
    });
  }
  return issues;
}
