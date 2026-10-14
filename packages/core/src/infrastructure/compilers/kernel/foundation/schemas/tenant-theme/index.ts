/**
 * Serializable schema manifest for TenantThemeConfig v1.
 *
 * Validation is derived from this object. Platform editors and persistence
 * adapters can compare its canonical digest instead of maintaining a second
 * field inventory by hand.
 */

import { dimensionToPx } from "@/foundation/kernel/geometry/css-length";
import { isCanonicalJsonObject as isPlainObject } from "@/foundation/kernel/serialization";
import type { TenantThemeValidationIssue } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { isValidCssColor } from "@/foundation/kernel/color/contrast";
import { ALLOWED_VALUE_FUNCTIONS } from "@/foundation/kernel/css/value-functions";
import {
  TENANT_THEME_NEUTRAL_OVERRIDE_TOKENS,
  TENANT_THEME_OVERRIDE_TOKENS,
  TENANT_THEME_REFERENCE_TOKENS,
  TENANT_THEME_RETIRED_REFERENCE_TOKENS,
  TENANT_THEME_FONT_PACK_IDS,
  TENANT_THEME_SCHEMA_VERSION,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { RECIPE_PROFILES } from "@/foundation/tokens/ts/presentation/recipe-profiles";
import { RESPONSIVE_POSTURE_PROFILES } from "@/foundation/tokens/ts/presentation/responsive-postures";
import {
  EXPRESSIVE_EDGE_PROFILES,
  EXPRESSIVE_ELEVATION_PROFILES,
  EXPRESSIVE_GEOMETRY_PROFILES,
  EXPRESSIVE_MATERIAL_PROFILES,
  EXPRESSIVE_ICON_PROFILES,
  EXPRESSIVE_MOTIF_PROFILES,
  EXPRESSIVE_TYPE_PROFILES,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { chrome } from "./chrome";
import {
  COLOR,
  HEX_COLOR,
  VISUAL,
  enumeration,
  literal,
  number,
  object,
  string,
} from "./spec";
import type { TenantThemeSchemaNode } from "./spec";
import { general } from "./general";

export type { TenantThemeSchemaNode } from "./spec";

/**
 * Governed recipe-profile selection (DS-S001): the schema is a closed enum
 * over the first-party registry, so a customer document can only SELECT a
 * published profile id — never author one.
 */
const recipeProfile = enumeration(
  ...RECIPE_PROFILES.map((profile) => profile.id)
);

/**
 * Pro explicit per-axis expressive overrides (C1b; `icon` opened in C2).
 * Each axis is a closed vocabulary enum — out-of-vocabulary values are
 * rejected, and the governed weight tables in the icon policy are the only
 * thing an icon posture can select (never a supplier, glyph or SVG).
 */
const expressiveProfiles = object({
  type: enumeration(...EXPRESSIVE_TYPE_PROFILES),
  geometry: enumeration(...EXPRESSIVE_GEOMETRY_PROFILES),
  edge: enumeration(...EXPRESSIVE_EDGE_PROFILES),
  material: enumeration(...EXPRESSIVE_MATERIAL_PROFILES),
  elevation: enumeration(...EXPRESSIVE_ELEVATION_PROFILES),
  motif: enumeration(...EXPRESSIVE_MOTIF_PROFILES),
  icon: enumeration(...EXPRESSIVE_ICON_PROFILES),
});

const NEUTRAL_OVERRIDE_TOKENS = new Set<string>(
  TENANT_THEME_NEUTRAL_OVERRIDE_TOKENS
);

/**
 * The VALUE law of every raw override token, one row per token.
 *
 * Exported because it is not the write terminal's private table: the v1
 * producers lower the same `tokenOverrides` object into Theme keypaths, and
 * while this table was held privately they admitted an unregistered font-pack
 * reference and a line height of `99` that publication refused (S19-A01).
 */
export const TENANT_THEME_TOKEN_VALUE_RULES: Readonly<
  Record<string, TenantThemeSchemaNode>
> =
  Object.fromEntries(
    TENANT_THEME_OVERRIDE_TOKENS.map((token) => {
      if (token.startsWith("--ds-chart-category-")) return [token, HEX_COLOR];
      if (NEUTRAL_OVERRIDE_TOKENS.has(token)) return [token, HEX_COLOR];
      if (token.startsWith("--ds-color-") || token.startsWith("--ds-overlay-"))
        return [token, COLOR];
      if (token.startsWith("--ds-font-family-"))
        return [token, string("font-family")];
      if (token.startsWith("--ds-line-height-"))
        return [token, number({ min: 0.5, max: 3 })];
      if (token === "--ds-density-scale")
        return [token, number({ min: 0.75, max: 1.25 })];
      if (token === "--ds-effect-intensity")
        return [token, number({ min: 0, max: 1 })];
      return [token, VISUAL];
    })
  );

/**
 * Governed responsive-posture selection (E2): closed enum over the published
 * first-party registry (`compact` | `balanced` | `expansive`) — a customer
 * document can only SELECT a ladder, never author thresholds or span biases.
 * Absent means `balanced`, whose values ARE the pre-capability constants.
 */
const responsivePosture = enumeration(
  ...RESPONSIVE_POSTURE_PROFILES.map((profile) => profile.id)
);

const advanced = object({
  chrome,
  tokenOverrides: object(TENANT_THEME_TOKEN_VALUE_RULES),
  profiles: expressiveProfiles,
  responsivePosture,
});

const documentFields: Readonly<Record<string, TenantThemeSchemaNode>> = {
  schemaVersion: literal(TENANT_THEME_SCHEMA_VERSION),
};

const identityFields: Readonly<Record<string, TenantThemeSchemaNode>> = {
  tenantId: string("identifier"),
  slug: string("slug"),
  verticalKey: string("slug"),
  rowVersion: number({ integer: true, min: 0 }),
};

function deepFreeze<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>))
      deepFreeze(child);
    if (!Object.isFrozen(value)) Object.freeze(value);
  }
  return value;
}

export const TENANT_THEME_CONFIG_SCHEMA = deepFreeze({
  id: "rottay.tenant-theme-config",
  schemaVersion: TENANT_THEME_SCHEMA_VERSION,
  documents: Object.freeze({
    simple: object(
      { ...documentFields, mode: literal("simple"), appearance: general },
      ["schemaVersion", "mode", "appearance"]
    ),
    advanced: object(
      {
        ...documentFields,
        mode: literal("advanced"),
        visualFoundation: object({ general, advanced, recipeProfile }),
      },
      ["schemaVersion", "mode", "visualFoundation"]
    ),
  }),
  modes: Object.freeze({
    simple: object(
      {
        ...documentFields,
        ...identityFields,
        mode: literal("simple"),
        appearance: general,
      },
      [
        "schemaVersion",
        "tenantId",
        "slug",
        "verticalKey",
        "rowVersion",
        "mode",
        "appearance",
      ]
    ),
    advanced: object(
      {
        ...documentFields,
        ...identityFields,
        mode: literal("advanced"),
        visualFoundation: object({ general, advanced, recipeProfile }),
      },
      [
        "schemaVersion",
        "tenantId",
        "slug",
        "verticalKey",
        "rowVersion",
        "mode",
        "visualFoundation",
      ]
    ),
  }),
  scopeAttributes: Object.freeze([
    "data-ds-root",
    "data-vertical",
    "data-tenant",
  ]),
  forbiddenCapabilities: Object.freeze([
    "rawCss",
    "selectors",
    "engine",
    "componentPack",
    "topology",
    "permissions",
    "semanticMappings",
    "iconGlyphs",
    "iconContainers",
    "motionRecipes",
    "chartRenderer",
    "chartDataSemantics",
  ]),
  overrideTokens: TENANT_THEME_OVERRIDE_TOKENS,
  referenceTokens: TENANT_THEME_REFERENCE_TOKENS,
  fontPackIds: TENANT_THEME_FONT_PACK_IDS,
  limits: Object.freeze({
    maxDocumentBytes: 65_536,
    maxDepth: 10,
    maxObjectFields: 512,
    // Advanced can legally project broad chrome plus 70 compiler-owned color
    // ramp variables. The adversarial max-byte v2 fixture emits 69,894 bytes:
    // 64 KiB is 4,358 bytes too small; 88 KiB leaves 20,218 bytes of headroom
    // while remaining a hard SSR/hydration ceiling.
    maxCompiledVariables: 512,
    maxCompiledVariableBytes: 90_112,
    // Single authority for the raw tokenOverrides entry cap. The appearance
    // compiler imports this value; a second literal 200 anywhere is a
    // cascade-integrity defect.
    maxTokenOverrides: 200,
    maxStringLength: 512,
    maxFontFamilyLength: 200,
    maxShadowLayers: 4,
    maxGradientStops: 8,
    maxPaddingPx: 128,
    maxRadiusPx: 64,
    maxGapPx: 64,
    maxGridSizePx: 256,
  }),
});

const FONT_PACK_REFERENCE =
  /var\(--ds-font-pack-([a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?)\)/g;

/**
 * Admit only code-owned font-pack variables inside an otherwise ordinary CSS
 * font-family list. Arbitrary `var()` references and fallback arguments stay
 * forbidden, so DB data can choose a loaded pack but cannot name private DS
 * tokens or turn font loading into a tenant-owned asset channel.
 *
 * Both doors that admit a tenant font read it: the write validator and the
 * ingress migration. Held privately by the first, the second admitted what the
 * first refused.
 */
export function isSafeFontFamily(value: string): boolean {
  const limits = TENANT_THEME_CONFIG_SCHEMA.limits;
  if (
    value.length === 0 ||
    value.length > limits.maxFontFamilyLength ||
    value !== value.trim()
  )
    return false;
  const references = value.match(FONT_PACK_REFERENCE) ?? [];
  const allVarFunctions = value.match(/var\s*\(/gi) ?? [];
  if (references.length !== allVarFunctions.length) return false;
  const allowedPacks = new Set<string>(TENANT_THEME_FONT_PACK_IDS);
  for (const reference of references) {
    const packId = /^var\(--ds-font-pack-(.+)\)$/.exec(reference)?.[1];
    if (!packId || !allowedPacks.has(packId)) return false;
  }
  const withoutFontPacks = value.replace(FONT_PACK_REFERENCE, "FontPack");
  return /^[\p{L}\p{N}\s'",._-]+$/u.test(withoutFontPacks);
}

export const TENANT_THEME_GENERAL_SCHEMA = general;
export const TENANT_THEME_ADVANCED_SCHEMA = advanced;

/* -------------------------------------------------------------------------- */
/* The value grammar every door reads (S19-A01)                               */
/* -------------------------------------------------------------------------- */

/**
 * The grammar and the node validator live BELOW the doors that read them.
 *
 * They used to sit in the admission facade and in the write terminal, which
 * are both above the v1 ingress: a preview and a persisted-intent compile
 * therefore lowered `tokenOverrides` with no value law at all, and a tenant
 * could paint a reference or a magnitude that publication refused by name.
 * Here the schema owner that STATES each token's rule is also the owner that
 * evaluates it, so the three routes cannot answer differently.
 */

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

const RETIRED_REFERENCES: ReadonlySet<string> = new Set(
  TENANT_THEME_RETIRED_REFERENCE_TOKENS
);

/** The first retired channel an authored value cites with `var()`, or null. */
export function retiredVisualReference(value: string): string | null {
  for (const match of value.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
    if (RETIRED_REFERENCES.has(match[1])) return match[1];
  }
  return null;
}

/** The refusal an authored value citing a retired channel receives. */
export function retiredReferenceMessage(channel: string): string {
  return `Retired reference: var(${channel}) is no longer a tenant-referenceable channel; the compiler emits no value for it`;
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

function childPath(path: string, key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(key)}]`;
}

function isTenantColor(value: string): boolean {
  return (
    isSafeVisualValue(value, "$.color") &&
    isValidCssColor(value) &&
    !/^(?:var|inherit|currentColor|unset|initial|none)\b/i.test(value)
  );
}

/**
 * Judge one value against one schema node, reporting issues by path.
 *
 * The write terminal validates whole documents with it; the v1 ingress
 * validates the token-override leaves it is about to lower. Same rule, same
 * code, same message, so a refusal can be compared across routes rather than
 * merely observed on one.
 */
export function validateTenantThemeNode(
  value: unknown,
  rule: TenantThemeSchemaNode,
  path: string,
  issues: TenantThemeValidationIssue[]
): void {
  if (rule.type === "object") {
    if (!isPlainObject(value)) {
      issues.push({
        code: "invalid_type",
        path,
        message: "Expected an object",
      });
      return;
    }
    for (const required of rule.required ?? []) {
      if (!Object.prototype.hasOwnProperty.call(value, required)) {
        issues.push({
          code: "invalid_type",
          path: childPath(path, required),
          message: "Required field is missing",
        });
      }
    }
    for (const key of Object.keys(value).sort()) {
      if (!Object.prototype.hasOwnProperty.call(rule.fields, key)) {
        issues.push({
          code: "unknown_key",
          path: childPath(path, key),
          message: "Field is not part of TenantThemeConfig v1",
        });
        continue;
      }
      validateTenantThemeNode(
        value[key],
        rule.fields[key],
        childPath(path, key),
        issues
      );
    }
    return;
  }

  if (rule.type === "literal") {
    if (value !== rule.value)
      issues.push({
        code: "invalid_value",
        path,
        message: `Expected literal ${JSON.stringify(rule.value)}`,
      });
    return;
  }

  if (rule.type === "enum") {
    if (!rule.values.includes(value as string | number)) {
      issues.push({
        code: "invalid_value",
        path,
        message: `Expected one of ${rule.values.join(", ")}`,
      });
    }
    return;
  }

  if (rule.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      issues.push({
        code: "invalid_type",
        path,
        message: "Expected a finite number",
      });
      return;
    }
    if (rule.integer && !Number.isSafeInteger(value)) {
      issues.push({
        code: "invalid_value",
        path,
        message: "Expected a safe integer",
      });
    } else if (
      (rule.min !== undefined && value < rule.min) ||
      (rule.max !== undefined && value > rule.max)
    ) {
      issues.push({
        code: "invalid_value",
        path,
        message: `Number must be between ${rule.min ?? "-∞"} and ${
          rule.max ?? "∞"
        }`,
      });
    }
    return;
  }

  if (typeof value !== "string") {
    issues.push({ code: "invalid_type", path, message: "Expected a string" });
    return;
  }

  let valid = false;
  switch (rule.format) {
    case "identifier":
      valid = /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value);
      break;
    case "slug":
      valid = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(value);
      break;
    case "color":
      valid = isTenantColor(value);
      break;
    case "hex-color":
      valid = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
      break;
    case "font-family":
      valid = isSafeFontFamily(value);
      break;
    case "visual-value": {
      const retired = retiredVisualReference(value);
      if (retired !== null) {
        issues.push({
          code: "unsafe_value",
          path,
          message: retiredReferenceMessage(retired),
        });
        return;
      }
      valid = isSafeVisualValue(value, path);
      break;
    }
  }
  if (!valid)
    issues.push({
      code: "unsafe_value",
      path,
      message: `Invalid or unsafe ${rule.format}`,
    });
}

/**
 * The raw override values a transport is about to admit, judged by the same
 * table publication judges them with, at the path publication names.
 *
 * A token with no row is not silently admitted here: it has no keypath either,
 * and the caller that owns the key grammar refuses it by name before asking
 * this owner about its value.
 */
export function tenantThemeTokenOverrideIssues(
  overrides: Readonly<Record<string, unknown>>,
  path: string
): TenantThemeValidationIssue[] {
  const issues: TenantThemeValidationIssue[] = [];
  for (const key of Object.keys(overrides).sort()) {
    const rule = TENANT_THEME_TOKEN_VALUE_RULES[key];
    if (rule) validateTenantThemeNode(overrides[key], rule, childPath(path, key), issues);
  }
  return issues;
}
