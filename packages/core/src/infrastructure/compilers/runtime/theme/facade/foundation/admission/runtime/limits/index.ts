/**
 * @fileoverview Admission: the value grammar and the payload ceilings.
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

import type { BrandThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { TenantThemeArtifactModeDelta } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { TENANT_THEME_REFERENCE_TOKENS } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { dimensionToPx } from "@/foundation/kernel/geometry/css-length";
import {
  canonicalizeJsonValue,
  compareCodeUnits,
} from "@/foundation/kernel/serialization";
import {
  EXPRESSIVE_A11Y_FLOORS,
  EXPRESSIVE_EDGE_WIDTH_CHANNELS,
  STRUCTURAL_WIDTH_CHANNELS,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { TENANT_THEME_CONFIG_SCHEMA } from "@/infrastructure/compilers/kernel/foundation/schemas/tenant-theme";
import type { ThemeAdmissionIssue } from "../../foundation/issues";

const ALLOWED_VALUE_FUNCTIONS = new Set([
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "oklch",
  "lab",
  "lch",
  "color-mix",
  "light-dark",
  "linear-gradient",
  "radial-gradient",
  "conic-gradient",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "var",
  "calc",
  "min",
  "max",
  "clamp",
  "blur",
  // Both are emitted by the DS's own lowering and were absent from THIS copy of
  // the table while the emitter's copy
  // (`kernel/foundation/css/value-safety`) admitted them. The divergence was
  // unreachable while this check ran on the DB delta alone; running it for
  // every origin made a governed spring easing an "unsafe declaration".
  "saturate",
  /** The CSS easing function, emitted by the governed spring recipes. */
  "linear",
  "drop-shadow",
  "cubic-bezier",
  "translate",
  "translatex",
  "translatey",
  "scale",
  "scalex",
  "scaley",
  "rotate",
  "repeat",
  "minmax",
  "fit-content",
]);

function isBalancedVisualValue(value: string): boolean {
  let quote: string | null = null;
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
      if (depth < 0) return false;
    }
  }
  return quote === null && depth === 0;
}

function countCommasAtDepth(value: string, targetDepth: number): number {
  let depth = 0;
  let quote: string | null = null;
  let count = 0;
  for (const character of value) {
    if (quote) {
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === "(") depth += 1;
    else if (character === ")") depth -= 1;
    else if (character === "," && depth === targetDepth) count += 1;
  }
  return count;
}

function countGradientStops(value: string): number {
  const open = value.search(
    /(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i
  );
  if (open < 0) return 0;
  const bodyStart = value.indexOf("(", open) + 1;
  let depth = 1;
  let quote: string | null = null;
  let current = "";
  const args: string[] = [];
  for (let index = bodyStart; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      current += character;
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      current += character;
    } else if (character === "(") {
      depth += 1;
      current += character;
    } else if (character === ")") {
      depth -= 1;
      if (depth === 0) {
        args.push(current.trim());
        break;
      }
      current += character;
    } else if (character === "," && depth === 1) {
      args.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (args.length === 0) return 0;
  const first = args[0].toLowerCase();
  const hasPreamble =
    /^(?:to\s|[-+]?\d+(?:\.\d+)?(?:deg|rad|turn)|circle\b|ellipse\b|at\s|from\s|in\s)/.test(
      first
    );
  return Math.max(0, args.length - (hasPreamble ? 1 : 0));
}

function respectsDimensionCap(value: string, capPx: number): boolean {
  if (value.includes("var(")) return true;
  if (/\b(?:calc|min|max|clamp)\s*\(/i.test(value)) return false;
  const dimensions = [...value.matchAll(/(-?\d+(?:\.\d+)?)(px|rem|em|%)?/gi)];
  if (dimensions.length === 0) return false;
  return dimensions.every((match) => {
    const numeric = Number(match[1]);
    const unit = match[2] ?? "";
    if (numeric < 0) return false;
    if (unit === "%") return numeric <= 100;
    const converted = dimensionToPx(numeric, unit);
    return converted !== null && converted <= capPx;
  });
}

/**
 * The nine G4 sidebar geometry channels are the only capped keypaths whose
 * mode overlay may author the CSS-wide keyword `initial`. Rottay's light mode
 * has no root-level floor for them, so the overlay has to *reset* the channel
 * instead of repainting it; `initial` carries no magnitude, so a dimension cap
 * has nothing to bound and the `dimensions.length === 0` early return in
 * `respectsDimensionCap` would otherwise reject the reset. The allowlist is
 * deliberately field- and path-scoped: every other capped field keeps
 * rejecting `initial`.
 */
const SIDEBAR_GEOMETRY_RESET_FIELDS: ReadonlySet<string> = new Set([
  "shellPaddingInline",
  "shellPaddingCollapsed",
  "itemHeight",
  "itemChildHeight",
  "itemFontSizeChild",
  "itemPaddingInline",
  "iconColumnSize",
  "itemGap",
  "childPaddingInline",
]);

function admitsSidebarGeometryReset(path: string, field: string): boolean {
  return (
    SIDEBAR_GEOMETRY_RESET_FIELDS.has(field) &&
    /(?:^|\.)sidebar\.[^.]+$/.test(path)
  );
}

/**
 * True when a value cannot terminate its declaration, open a comment, fetch,
 * or exceed an authored cap.
 *
 * `enforceAuthoredCaps` separates an AUTHORED leaf (a document field, where the
 * tenant's own caps apply) from an EMITTED channel (what the compiler produced
 * from one, where the grammar still applies but the authored caps were already
 * enforced upstream).
 */
export function isSafeVisualValue(
  value: string,
  path: string,
  enforceAuthoredCaps = true
): boolean {
  const limits = TENANT_THEME_CONFIG_SCHEMA.limits;
  if (
    value.length === 0 ||
    value.length > limits.maxStringLength ||
    value !== value.trim()
  )
    return false;
  const field = path.slice(path.lastIndexOf(".") + 1).replace(/[\]"']/g, "");
  // `initial` is a cascade reset, not a paint: it blanks the channel instead of
  // giving it a value. Only the nine G4 sidebar geometry mode resets may author
  // it, so no other authored keypath can silently erase a governed channel.
  const isSidebarGeometryReset =
    value === "initial" && admitsSidebarGeometryReset(path, field);
  if (enforceAuthoredCaps && value === "initial" && !isSidebarGeometryReset)
    return false;
  const forbiddenCharacters = enforceAuthoredCaps
    ? /[\u0000-\u001f\u007f{};<>\[\]@\\]/
    : /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f{};<>\[\]@\\]/;
  if (forbiddenCharacters.test(value)) return false;
  if (
    /\/\*|\*\/|!\s*important|expression\s*\(|url\s*\(|javascript\s*:|data\s*:|-moz-binding/i.test(
      value
    )
  )
    return false;
  if (!isBalancedVisualValue(value)) return false;

  const functionNames = [...value.matchAll(/([a-z][a-z0-9-]*)\s*\(/gi)].map(
    (match) => match[1].toLowerCase()
  );
  if (functionNames.some((name) => !ALLOWED_VALUE_FUNCTIONS.has(name)))
    return false;

  const varCount = functionNames.filter((name) => name === "var").length;
  const varReferences = [...value.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)];
  if (varReferences.length !== varCount) return false;
  if (enforceAuthoredCaps) {
    const allowedReferences = new Set<string>(TENANT_THEME_REFERENCE_TOKENS);
    if (varReferences.some((match) => !allowedReferences.has(match[1])))
      return false;
  } else if (varReferences.some((match) => !match[1].startsWith("--ds-"))) {
    return false;
  }

  const lowerPath = path.toLowerCase();
  if (
    enforceAuthoredCaps &&
    (lowerPath.includes("shadow") || lowerPath.includes("ring"))
  ) {
    if (countCommasAtDepth(value, 0) + 1 > limits.maxShadowLayers) return false;
    const shadowDimensions = [
      ...value.matchAll(/(-?\d+(?:\.\d+)?)(px|rem|em)/gi),
    ];
    if (
      shadowDimensions.some((match) => {
        const converted = dimensionToPx(
          Math.abs(Number(match[1])),
          match[2].toLowerCase()
        );
        return converted === null || converted > 128;
      })
    )
      return false;
  }
  if (enforceAuthoredCaps && /gradient\s*\(/i.test(value)) {
    if (countGradientStops(value) > limits.maxGradientStops) return false;
  }

  if (
    enforceAuthoredCaps &&
    /padding/i.test(field) &&
    !isSidebarGeometryReset &&
    !respectsDimensionCap(value, limits.maxPaddingPx)
  )
    return false;
  if (
    enforceAuthoredCaps &&
    /radius/i.test(field) &&
    !isSidebarGeometryReset &&
    !respectsDimensionCap(value, limits.maxRadiusPx)
  )
    return false;
  if (
    enforceAuthoredCaps &&
    /gap/i.test(field) &&
    !isSidebarGeometryReset &&
    !respectsDimensionCap(value, limits.maxGapPx)
  )
    return false;
  if (
    enforceAuthoredCaps &&
    /gridSize/i.test(field) &&
    !isSidebarGeometryReset &&
    !respectsDimensionCap(value, limits.maxGridSizePx)
  )
    return false;

  return true;
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
  mode: BrandThemeMode
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

  const modes = new Set<BrandThemeMode>();
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
    // The profile channels are not authored CSS: they are compiler-generated,
    // quoted identifiers that already passed their closed registry. Keep the
    // general visual-value parser hostile to arbitrary strings and admit only
    // these exact validated declarations.
    const isValidatedProfileChannel =
      key === "--ds-recipe-profile" || key === "--ds-experience-profile";
    const edgeIssue = assertExpressiveEdgeWidthInvariant(key, value);
    if (edgeIssue) {
      issues.push(edgeIssue);
      continue;
    }
    if (
      !key.startsWith("--ds-") ||
      (!isValidatedProfileChannel &&
        !isSafeVisualValue(value, `$.variables[${JSON.stringify(key)}]`, false))
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
