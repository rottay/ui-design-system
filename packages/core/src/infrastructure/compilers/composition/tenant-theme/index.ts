/**
 * @fileoverview Server-safe TenantThemeConfig v1 validator and compiler.
 *
 * This module has no React, DOM, browser-storage, Node builtin or network
 * dependency. The same synchronous path runs in Node SSR, Edge/middleware and
 * the browser hydration boundary.
 */

import {
  type BrandMotion,
  type BrandTheme,
  type BrandThemeMode,
  type CompiledBrand,
  type TenantAppearance,
} from "@/foundation/contracts/composition/tenants/themes";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { contrastRatio } from "@/foundation/kernel/accessibility/branding-contrast";
import { enforceTextContrast } from "@/foundation/kernel/accessibility/branding-contrast/text-contrast-autocorrect";
import {
  canonicalizeJsonValue as canonicalizeTenantThemeValue,
  compareCodeUnits,
  isCanonicalJsonObject as isPlainObject,
} from "@/foundation/kernel/serialization";
import { sha256Utf8 } from "@/foundation/kernel/cryptography/sha-256";
import { validateRecipeProfileSelection } from "@/foundation/tokens/ts/presentation/recipe-profiles";
import { validateResponsivePostureSelection } from "@/foundation/tokens/ts/presentation/responsive-postures";
import { assertTenantIdentityAllowed } from "@/foundation/tokens/ts/presentation/brand-themes";
import {
  EXPRESSIVE_A11Y_FLOORS,
  EXPRESSIVE_EDGE_WIDTH_CHANNELS,
  STRUCTURAL_WIDTH_CHANNELS,
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
  validateExperienceProfileSelection,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { expandExpressiveProfiles } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type {
  NormalizedTenantThemeAppearance,
  TenantThemeArtifact,
  TenantThemeConfigIdentity,
  TenantThemeConfig,
  TenantThemeContrastAdjustment,
  TenantThemeArtifactModeDelta,
  TenantThemeDocument,
  TenantThemeDocumentValidationResult,
  TenantThemeRootAttributes,
  TenantThemeValidationIssue,
  TenantThemeValidationResult,
  TenantThemeVerticalEnvelope,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  TENANT_THEME_ANATOMY_VARIANTS,
  TENANT_THEME_CHROME_FAMILIES,
  TENANT_THEME_EFFECT_INTENSITY_BOUNDS,
  TENANT_THEME_FONT_PACK_IDS,
  TENANT_THEME_RADIUS_SCALE_BOUNDS,
  TENANT_THEME_REFERENCE_TOKENS,
  TENANT_THEME_SCHEMA_VERSION,
  TENANT_THEME_TYPE_SCALE_BOUNDS,
  TENANT_THEME_V1_COVERAGE,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  isHexColor,
  isValidCssColor,
  normalizeHexColor,
} from "../../kernel/foundation/css/color-math";
import {
  TENANT_THEME_CONFIG_SCHEMA,
  type TenantThemeSchemaNode,
} from "../../kernel/foundation/schemas/tenant-theme";
import { withExpressiveFieldDefaults } from "../../kernel/runtime/appearance";
import { TENANT_THEME_COMPILER_VERSION } from "./version";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";
import type {
  TenantAuthoredPaths,
  ThemePatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  collectPatchAuthoredPaths,
  isTenantAuthoredField,
  resolveTheme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  compileTheme,
  themeModeSelector,
} from "@/infrastructure/compilers/kernel/runtime/brand-theme";
import { migrateV1 } from "./migrate-v1";

export { TENANT_THEME_CONFIG_SCHEMA } from "../../kernel/foundation/schemas/tenant-theme";
export type { TenantThemeSchemaNode } from "../../kernel/foundation/schemas/tenant-theme";
export { TENANT_THEME_COMPILER_VERSION };

function deepFreezeTenantThemeValue<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>))
      deepFreezeTenantThemeValue(child);
    Object.freeze(value);
  }
  return value;
}

/**
 * Code-owned vertical policy registry. Apps resolve the trusted vertical from
 * their tenant directory, then ask this registry for the compilation envelope;
 * neither client payloads nor tenant JSONB can supply or widen this authority.
 */
export const TENANT_THEME_VERTICAL_ENVELOPES = deepFreezeTenantThemeValue({
  /**
   * Rottay's envelope. Its ABSENCE was the bug.
   *
   * `getTenantThemeVerticalEnvelope` fails closed, so a missing key is not an
   * error anyone sees — it silently returns `undefined`. With no `rottay` row,
   * a perfectly legitimate customer tenant (slug `acme`, `verticalKey:
   * 'rottay'`) resolved no envelope and therefore could not compile a theme at
   * all, while bithire and evnto customers could. The roster names three
   * verticals; keying this record on `FirstPartyVerticalId` below means the
   * third one can never again be quietly left out.
   *
   * The ranges are the most conservative of the three on purpose: Rottay is
   * the neutral baseline the other two are read against, so a customer riding
   * it should be able to brand it without being able to restyle it into a
   * different product.
   */
  rottay: {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    verticalKey: "rottay",
    allowedModes: ["simple", "advanced"],
    advanced: {
      chromeFamilies: [...TENANT_THEME_CHROME_FAMILIES],
      allowTokenOverrides: true,
      allowAnatomyVariants: true,
    },
    ranges: {
      densityScale: { min: 0.85, max: 1.15 },
      effectIntensity: { min: 0, max: 0.65 },
      motionIntensity: { min: 0, max: 0.8 },
      motionDurationScale: { min: 0.75, max: 1.35 },
      typeScale: { min: 0.92, max: 1.08 },
      radiusScale: { min: 0.8, max: 1.2 },
    },
  },
  bithire: {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    verticalKey: "bithire",
    allowedModes: ["simple", "advanced"],
    advanced: {
      chromeFamilies: [...TENANT_THEME_CHROME_FAMILIES],
      allowTokenOverrides: true,
      allowAnatomyVariants: true,
    },
    ranges: {
      densityScale: { min: 0.85, max: 1.15 },
      effectIntensity: { min: 0, max: 0.65 },
      motionIntensity: { min: 0, max: 0.8 },
      motionDurationScale: { min: 0.75, max: 1.35 },
      typeScale: { min: 0.92, max: 1.08 },
      radiusScale: { min: 0.8, max: 1.2 },
    },
  },
  evnto: {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    verticalKey: "evnto",
    allowedModes: ["simple", "advanced"],
    advanced: {
      chromeFamilies: [...TENANT_THEME_CHROME_FAMILIES],
      allowTokenOverrides: true,
      allowAnatomyVariants: true,
    },
    ranges: {
      // Capability limits, not defaults. The static Evnto vertical remains the
      // owner of engine, product profile, component anatomy and motion topology.
      densityScale: { min: 0.85, max: 1.15 },
      effectIntensity: { min: 0, max: 0.75 },
      motionIntensity: { min: 0, max: 0.8 },
      motionDurationScale: { min: 0.75, max: 1.35 },
      typeScale: { min: 0.92, max: 1.08 },
      radiusScale: { min: 0.8, max: 1.2 },
    },
  },
  // `Record<FirstPartyVerticalId, ...>`, not `Record<string, ...>`. The open
  // key type is what let this record ship two of the three verticals: with a
  // `string` key nothing states how many rows there must be, so omitting one
  // type-checked exactly like listing it. Keyed on the closed union, a missing
  // vertical is a compile error at this line.
} as const satisfies Readonly<Record<FirstPartyVerticalId, TenantThemeVerticalEnvelope>>);

/**
 * Resolve the envelope of a vertical the type system has already closed.
 *
 * The registry above is `satisfies Readonly<Record<FirstPartyVerticalId,
 * TenantThemeVerticalEnvelope>>`, so for a `FirstPartyVerticalId` the row is
 * PROVEN to exist at compile time. The string-keyed accessor below cannot say
 * that -- it takes untrusted input, so it must fail closed and return
 * `| undefined`. Callers that already hold a first-party id were paying that
 * `undefined` anyway, and were narrowing it with `!` or a cast in each suite.
 * This accessor is a direct index into the satisfies-proven record: the
 * closed-domain invariant is stated once, in the product, where every consumer
 * can see it.
 */
export function getFirstPartyTenantThemeVerticalEnvelope(
  vertical: FirstPartyVerticalId
): TenantThemeVerticalEnvelope {
  return TENANT_THEME_VERTICAL_ENVELOPES[vertical];
}

/**
 * An envelope whose `advanced` policy is present.
 *
 * `advanced` is optional on the contract because a vertical is allowed to admit
 * simple mode only. Every FIRST-PARTY envelope declares it, but that is a
 * runtime fact about the registry's contents, not something the type states --
 * so it gets an assertion rather than a cast.
 */
export type TenantThemeVerticalEnvelopeWithAdvanced =
  TenantThemeVerticalEnvelope & {
    advanced: NonNullable<TenantThemeVerticalEnvelope["advanced"]>;
  };

/**
 * Assert the genuinely-runtime half of the invariant: this envelope declares an
 * `advanced` policy. Shared and exported beside the registry so the check is
 * one declaration rather than a throw re-invented privately per test file, and
 * so the failure names the offending vertical instead of surfacing as a
 * `possibly undefined` at the use site.
 */
export function assertTenantThemeEnvelopeDeclaresAdvanced(
  envelope: TenantThemeVerticalEnvelope
): asserts envelope is TenantThemeVerticalEnvelopeWithAdvanced {
  if (envelope.advanced === undefined) {
    throw new Error(
      `Tenant theme envelope for vertical '${envelope.verticalKey}' declares no advanced policy`
    );
  }
}

/** Resolve a trusted code-owned envelope; unknown verticals fail closed. */
export function getTenantThemeVerticalEnvelope(
  verticalKey: string
): TenantThemeVerticalEnvelope | undefined {
  if (
    !Object.prototype.hasOwnProperty.call(
      TENANT_THEME_VERTICAL_ENVELOPES,
      verticalKey
    )
  )
    return undefined;
  return TENANT_THEME_VERTICAL_ENVELOPES[
    verticalKey as keyof typeof TENANT_THEME_VERTICAL_ENVELOPES
  ];
}

/**
 * Canonical form is owned by `foundation/kernel/serialization`, which both this
 * compiler and the theming runtime consume. The name is kept as the module's
 * published alias; the implementation is the shared one.
 */
export { canonicalizeTenantThemeValue };

/** Published compiler alias for the portable SHA-256 implementation. */
export { sha256Utf8 as sha256TenantThemeValue };

const documentSchemaSource = {
  id: TENANT_THEME_CONFIG_SCHEMA.id,
  schemaVersion: TENANT_THEME_CONFIG_SCHEMA.schemaVersion,
  documents: TENANT_THEME_CONFIG_SCHEMA.documents,
  forbiddenCapabilities: TENANT_THEME_CONFIG_SCHEMA.forbiddenCapabilities,
  overrideTokens: TENANT_THEME_CONFIG_SCHEMA.overrideTokens,
  referenceTokens: TENANT_THEME_CONFIG_SCHEMA.referenceTokens,
  fontPackIds: TENANT_THEME_CONFIG_SCHEMA.fontPackIds,
  limits: TENANT_THEME_CONFIG_SCHEMA.limits,
};

/** Drift sentinel for the JSONB document/editor/DTO/SSR contract. */
export const TENANT_THEME_DOCUMENT_SCHEMA_DIGEST = `sha256-${sha256Utf8(
  canonicalizeTenantThemeValue(documentSchemaSource)
)}` as const;

/** Drift sentinel for the fully hydrated compiler envelope. */
export const TENANT_THEME_CONFIG_SCHEMA_DIGEST = `sha256-${sha256Utf8(
  canonicalizeTenantThemeValue(TENANT_THEME_CONFIG_SCHEMA)
)}` as const;

export class TenantThemeValidationError extends Error {
  readonly issues: readonly TenantThemeValidationIssue[];

  constructor(issues: readonly TenantThemeValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "));
    this.name = "TenantThemeValidationError";
    this.issues = issues;
  }
}

function childPath(path: string, key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(key)}]`;
}

function countValueShape(
  value: unknown,
  depth = 0
): { maxDepth: number; fields: number } {
  if (Array.isArray(value)) {
    return value.reduce<{ maxDepth: number; fields: number }>(
      (result, item) => {
        const child = countValueShape(item, depth + 1);
        return {
          maxDepth: Math.max(result.maxDepth, child.maxDepth),
          fields: result.fields + child.fields,
        };
      },
      { maxDepth: depth, fields: 0 }
    );
  }
  if (!isPlainObject(value)) return { maxDepth: depth, fields: 0 };
  return Object.values(value).reduce<{ maxDepth: number; fields: number }>(
    (result, item) => {
      const child = countValueShape(item, depth + 1);
      return {
        maxDepth: Math.max(result.maxDepth, child.maxDepth),
        fields: result.fields + child.fields,
      };
    },
    { maxDepth: depth, fields: Object.keys(value).length }
  );
}

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

function dimensionToPx(value: number, unit: string): number | null {
  if (unit === "px" || unit === "") return value;
  if (unit === "rem" || unit === "em") return value * 16;
  return null;
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

function isSafeVisualValue(
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
    const allowedReferences = new Set(TENANT_THEME_REFERENCE_TOKENS);
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

function isTenantColor(value: string): boolean {
  return (
    isSafeVisualValue(value, "$.color") &&
    isValidCssColor(value) &&
    !/^(?:var|inherit|currentColor|unset|initial|none)\b/i.test(value)
  );
}

const FONT_PACK_REFERENCE =
  /var\(--ds-font-pack-([a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?)\)/g;

/**
 * Admit only code-owned font-pack variables inside an otherwise ordinary CSS
 * font-family list. Arbitrary `var()` references and fallback arguments stay
 * forbidden, so DB data can choose a loaded pack but cannot name private DS
 * tokens or turn font loading into a tenant-owned asset channel.
 */
function isSafeFontFamily(value: string): boolean {
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

function validateNode(
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
      validateNode(value[key], rule.fields[key], childPath(path, key), issues);
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
    case "visual-value":
      valid = isSafeVisualValue(value, path);
      break;
  }
  if (!valid)
    issues.push({
      code: "unsafe_value",
      path,
      message: `Invalid or unsafe ${rule.format}`,
    });
}

function validateEnvelopeShape(
  input: unknown,
  schemas:
    | typeof TENANT_THEME_CONFIG_SCHEMA.documents
    | typeof TENANT_THEME_CONFIG_SCHEMA.modes
): TenantThemeValidationIssue[] {
  if (!isPlainObject(input))
    return [
      {
        code: "invalid_type",
        path: "$",
        message: "Expected a plain JSON object",
      },
    ];
  if (input.schemaVersion !== TENANT_THEME_SCHEMA_VERSION) {
    return [
      {
        code: "unsupported_schema_version",
        path: "$.schemaVersion",
        message: `Only TenantThemeConfig schema version ${TENANT_THEME_SCHEMA_VERSION} is supported`,
      },
    ];
  }
  if (input.mode !== "simple" && input.mode !== "advanced") {
    return [
      {
        code: "invalid_value",
        path: "$.mode",
        message: "Expected simple or advanced",
      },
    ];
  }

  const limits = TENANT_THEME_CONFIG_SCHEMA.limits;
  const shape = countValueShape(input);
  const issues: TenantThemeValidationIssue[] = [];
  if (shape.maxDepth > limits.maxDepth) {
    issues.push({
      code: "invalid_value",
      path: "$",
      message: `Maximum object depth is ${limits.maxDepth}`,
    });
  }
  if (shape.fields > limits.maxObjectFields) {
    issues.push({
      code: "invalid_value",
      path: "$",
      message: `Maximum field count is ${limits.maxObjectFields}`,
    });
  }
  try {
    const bytes = new TextEncoder().encode(
      canonicalizeTenantThemeValue(input)
    ).byteLength;
    if (bytes > limits.maxDocumentBytes) {
      issues.push({
        code: "invalid_value",
        path: "$",
        message: `Maximum canonical payload is ${limits.maxDocumentBytes} bytes`,
      });
    }
  } catch {
    issues.push({
      code: "invalid_type",
      path: "$",
      message: "Payload must be JSON-serializable",
    });
  }
  // The override-key vocabulary is wider than the per-document budget, so the
  // closed tokenOverrides key schema cannot enforce the entry count by itself.
  const visualFoundation = input.visualFoundation;
  const advancedTier = isPlainObject(visualFoundation)
    ? visualFoundation.advanced
    : undefined;
  const tokenOverrides = isPlainObject(advancedTier)
    ? advancedTier.tokenOverrides
    : undefined;
  if (isPlainObject(tokenOverrides)) {
    const overrideCount = Object.keys(tokenOverrides).length;
    if (overrideCount > limits.maxTokenOverrides) {
      issues.push({
        code: "invalid_value",
        path: "$.visualFoundation.advanced.tokenOverrides",
        message: `Maximum tokenOverrides entries is ${limits.maxTokenOverrides}; received ${overrideCount}`,
      });
    }
  }
  validateNode(input, schemas[input.mode], "$", issues);
  return issues;
}

function normalizedClone<T>(value: T): T {
  return JSON.parse(canonicalizeTenantThemeValue(value)) as T;
}

export function validateTenantThemeDocument(
  input: unknown
): TenantThemeDocumentValidationResult {
  const issues = validateEnvelopeShape(
    input,
    TENANT_THEME_CONFIG_SCHEMA.documents
  );
  return issues.length === 0
    ? { success: true, data: normalizedClone(input as TenantThemeDocument) }
    : { success: false, issues };
}

export function parseTenantThemeDocument(input: unknown): TenantThemeDocument {
  const result = validateTenantThemeDocument(input);
  if (!result.success) throw new TenantThemeValidationError(result.issues);
  return result.data;
}

export function validateTenantThemeConfig(
  input: unknown
): TenantThemeValidationResult {
  const issues = validateEnvelopeShape(input, TENANT_THEME_CONFIG_SCHEMA.modes);
  return issues.length === 0
    ? { success: true, data: normalizedClone(input as TenantThemeConfig) }
    : { success: false, issues };
}

export function parseTenantThemeConfig(input: unknown): TenantThemeConfig {
  const result = validateTenantThemeConfig(input);
  if (!result.success) throw new TenantThemeValidationError(result.issues);
  return result.data;
}

export interface HydrateTenantThemeConfigOptions {
  /** Trusted request/directory identity; any row mismatch fails closed. */
  expectedIdentity?: Partial<TenantThemeConfigIdentity>;
}

/** Build a compiler envelope from validated JSONB plus trusted row columns. */
export function hydrateTenantThemeConfig(
  document: unknown,
  identity: TenantThemeConfigIdentity,
  options: HydrateTenantThemeConfigOptions = {}
): TenantThemeConfig {
  assertTenantIdentityAllowed({
    slug: identity.slug,
    verticalKey: identity.verticalKey,
  });
  const parsedDocument = parseTenantThemeDocument(document);
  const mismatchIssues: TenantThemeValidationIssue[] = [];
  for (const key of [
    "tenantId",
    "slug",
    "verticalKey",
    "rowVersion",
  ] as const) {
    const expected = options.expectedIdentity?.[key];
    if (expected !== undefined && identity[key] !== expected) {
      mismatchIssues.push({
        code: "invalid_value",
        path: `$.${key}`,
        message: `Trusted row identity does not match expected ${key}`,
      });
    }
  }
  if (mismatchIssues.length > 0)
    throw new TenantThemeValidationError(mismatchIssues);
  return parseTenantThemeConfig({ ...parsedDocument, ...identity });
}

/**
 * Apply a code-owned vertical envelope after structural validation.
 *
 * No production vertical manifest ships from this phase; consumers must pass
 * the real manifest once its owner lands it. Advanced compilation therefore
 * fails closed when the envelope is absent.
 */
export function validateTenantThemeAgainstVerticalEnvelope(
  config: TenantThemeConfig,
  envelope: TenantThemeVerticalEnvelope | undefined
): TenantThemeValidationIssue[] {
  if (!envelope) {
    return [
      {
        code: "invalid_value",
        path: "$.verticalKey",
        message: "Tenant theme compilation requires a vertical policy envelope",
      },
    ];
  }
  const issues: TenantThemeValidationIssue[] = [];
  if (!isPlainObject(envelope)) {
    return [
      {
        code: "invalid_type",
        path: "$.verticalEnvelope",
        message: "Expected a code-owned vertical envelope object",
      },
    ];
  }
  const allowedEnvelopeKeys = new Set([
    "schemaVersion",
    "verticalKey",
    "allowedModes",
    "advanced",
    "ranges",
  ]);
  for (const key of Object.keys(envelope)) {
    if (!allowedEnvelopeKeys.has(key)) {
      issues.push({
        code: "unknown_key",
        path: `$.verticalEnvelope.${key}`,
        message: "Unknown vertical envelope field",
      });
    }
  }
  if (envelope.schemaVersion !== TENANT_THEME_SCHEMA_VERSION) {
    issues.push({
      code: "unsupported_schema_version",
      path: "$.verticalEnvelope.schemaVersion",
      message: "Unsupported vertical envelope version",
    });
  }
  if (
    typeof envelope.verticalKey !== "string" ||
    !/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(envelope.verticalKey)
  ) {
    issues.push({
      code: "invalid_value",
      path: "$.verticalEnvelope.verticalKey",
      message: "Invalid vertical envelope key",
    });
  } else if (envelope.verticalKey !== config.verticalKey) {
    issues.push({
      code: "invalid_value",
      path: "$.verticalKey",
      message: "Theme vertical does not match its policy envelope",
    });
  }
  if (
    !Array.isArray(envelope.allowedModes) ||
    envelope.allowedModes.length === 0 ||
    envelope.allowedModes.some(
      (mode) => mode !== "simple" && mode !== "advanced"
    ) ||
    new Set(envelope.allowedModes).size !== envelope.allowedModes.length
  ) {
    issues.push({
      code: "invalid_value",
      path: "$.verticalEnvelope.allowedModes",
      message: "Expected a unique non-empty simple/advanced mode list",
    });
  } else if (!envelope.allowedModes.includes(config.mode)) {
    issues.push({
      code: "invalid_value",
      path: "$.mode",
      message: `Mode ${config.mode} is not enabled by this vertical`,
    });
  }

  const knownChromeFamilies = new Set<string>(TENANT_THEME_CHROME_FAMILIES);
  if (envelope.advanced !== undefined) {
    if (!isPlainObject(envelope.advanced)) {
      issues.push({
        code: "invalid_type",
        path: "$.verticalEnvelope.advanced",
        message: "Expected an Advanced policy object",
      });
    } else {
      for (const key of Object.keys(envelope.advanced)) {
        if (
          key !== "chromeFamilies" &&
          key !== "allowTokenOverrides" &&
          key !== "allowAnatomyVariants"
        ) {
          issues.push({
            code: "unknown_key",
            path: `$.verticalEnvelope.advanced.${key}`,
            message: "Unknown Advanced policy field",
          });
        }
      }
      if (
        !Array.isArray(envelope.advanced.chromeFamilies) ||
        envelope.advanced.chromeFamilies.some(
          (family) =>
            typeof family !== "string" || !knownChromeFamilies.has(family)
        ) ||
        new Set(envelope.advanced.chromeFamilies).size !==
          envelope.advanced.chromeFamilies.length
      ) {
        issues.push({
          code: "invalid_value",
          path: "$.verticalEnvelope.advanced.chromeFamilies",
          message: "Unknown or duplicate chrome family",
        });
      }
      if (typeof envelope.advanced.allowTokenOverrides !== "boolean") {
        issues.push({
          code: "invalid_type",
          path: "$.verticalEnvelope.advanced.allowTokenOverrides",
          message: "Expected a boolean",
        });
      }
      if (
        envelope.advanced.allowAnatomyVariants !== undefined &&
        typeof envelope.advanced.allowAnatomyVariants !== "boolean"
      ) {
        issues.push({
          code: "invalid_type",
          path: "$.verticalEnvelope.advanced.allowAnatomyVariants",
          message: "Expected a boolean",
        });
      }
    }
  }

  const rangeBounds = {
    densityScale: { min: 0.75, max: 1.25 },
    effectIntensity: TENANT_THEME_EFFECT_INTENSITY_BOUNDS,
    motionIntensity: { min: 0, max: 1 },
    motionDurationScale: { min: 0.5, max: 1.5 },
    typeScale: TENANT_THEME_TYPE_SCALE_BOUNDS,
    radiusScale: TENANT_THEME_RADIUS_SCALE_BOUNDS,
  } as const;
  if (envelope.ranges !== undefined) {
    if (!isPlainObject(envelope.ranges)) {
      issues.push({
        code: "invalid_type",
        path: "$.verticalEnvelope.ranges",
        message: "Expected a ranges object",
      });
    } else {
      for (const [key, value] of Object.entries(envelope.ranges)) {
        const global = rangeBounds[key as keyof typeof rangeBounds];
        if (!global) {
          issues.push({
            code: "unknown_key",
            path: `$.verticalEnvelope.ranges.${key}`,
            message: "Unknown range",
          });
          continue;
        }
        if (
          !isPlainObject(value) ||
          Object.keys(value).some(
            (field) => field !== "min" && field !== "max"
          ) ||
          typeof value.min !== "number" ||
          typeof value.max !== "number" ||
          !Number.isFinite(value.min) ||
          !Number.isFinite(value.max) ||
          value.min > value.max ||
          value.min < global.min ||
          value.max > global.max
        ) {
          issues.push({
            code: "invalid_value",
            path: `$.verticalEnvelope.ranges.${key}`,
            message: "Range must be finite, ordered and inside global v1 caps",
          });
        }
      }
    }
  }

  if (issues.length > 0) return issues;

  const general =
    config.mode === "simple"
      ? config.appearance
      : config.visualFoundation.general;
  const ranges = envelope.ranges;
  const rangedValues = [
    ["motion.intensity", general?.motion?.intensity, ranges?.motionIntensity],
    [
      "motion.durationScale",
      general?.motion?.durationScale,
      ranges?.motionDurationScale,
    ],
    ["typography.scale", general?.typography?.scale, ranges?.typeScale],
    ["shape.radiusScale", general?.shape?.radiusScale, ranges?.radiusScale],
    [
      "surfaces.effectIntensity",
      general?.surfaces?.effectIntensity,
      ranges?.effectIntensity,
    ],
  ] as const;
  for (const [field, value, range] of rangedValues) {
    if (
      value !== undefined &&
      range &&
      (value < range.min || value > range.max)
    ) {
      issues.push({
        code: "invalid_value",
        path: `$.appearance.${field}`,
        message: `Value exceeds the ${config.verticalKey} envelope`,
      });
    }
  }

  if (config.mode === "advanced") {
    const advanced = config.visualFoundation.advanced;
    const policy = envelope.advanced;
    if (!policy && advanced) {
      issues.push({
        code: "invalid_value",
        path: "$.visualFoundation.advanced",
        message: "Advanced visual fields are disabled for this vertical",
      });
    } else if (advanced && policy) {
      for (const family of Object.keys(advanced.chrome ?? {}).sort()) {
        if (!policy.chromeFamilies.includes(family as never)) {
          issues.push({
            code: "invalid_value",
            path: `$.visualFoundation.advanced.chrome.${family}`,
            message: "Chrome family is disabled by this vertical",
          });
        }
      }
      if (advanced.tokenOverrides && !policy.allowTokenOverrides) {
        issues.push({
          code: "invalid_value",
          path: "$.visualFoundation.advanced.tokenOverrides",
          message: "Token overrides are disabled by this vertical",
        });
      }
      if (policy.allowAnatomyVariants !== true) {
        for (const family of Object.keys(
          TENANT_THEME_ANATOMY_VARIANTS
        ) as (keyof typeof TENANT_THEME_ANATOMY_VARIANTS)[]) {
          const anatomyVariant = advanced.chrome?.[family]?.anatomy;
          if (anatomyVariant !== undefined && anatomyVariant !== "default") {
            issues.push({
              code: "invalid_value",
              path: `$.visualFoundation.advanced.chrome.${family}.anatomy`,
              message: "Anatomy variants are disabled by this vertical",
            });
          }
        }
      }
      const density = advanced.tokenOverrides?.["--ds-density-scale"];
      if (
        typeof density === "number" &&
        ranges?.densityScale &&
        (density < ranges.densityScale.min || density > ranges.densityScale.max)
      ) {
        issues.push({
          code: "invalid_value",
          path: '$.visualFoundation.advanced.tokenOverrides["--ds-density-scale"]',
          message: "Density exceeds the vertical envelope",
        });
      }
      const intensity = advanced.tokenOverrides?.["--ds-effect-intensity"];
      if (
        typeof intensity === "number" &&
        ranges?.effectIntensity &&
        (intensity < ranges.effectIntensity.min ||
          intensity > ranges.effectIntensity.max)
      ) {
        issues.push({
          code: "invalid_value",
          path: '$.visualFoundation.advanced.tokenOverrides["--ds-effect-intensity"]',
          message: "Effect intensity exceeds the vertical envelope",
        });
      }
    }
  }
  return issues;
}

export interface CompileTenantThemeConfigOptions {
  verticalEnvelope?: TenantThemeVerticalEnvelope;
}

function normalizeAppearance(
  config: TenantThemeConfig
): NormalizedTenantThemeAppearance {
  const normalized: NormalizedTenantThemeAppearance =
    config.mode === "simple"
      ? normalizedClone({ general: config.appearance })
      : normalizedClone({
          ...(config.visualFoundation.general
            ? { general: config.visualFoundation.general }
            : {}),
          ...(config.visualFoundation.advanced
            ? { advanced: config.visualFoundation.advanced }
            : {}),
          ...(config.visualFoundation.recipeProfile
            ? { recipeProfile: config.visualFoundation.recipeProfile }
            : {}),
        });
  const palette = normalized.general?.palette;
  if (!palette) return normalized;
  const backgroundMode = palette.backgroundMode ?? "light";
  const { dark, ...paletteWithoutDark } = palette;
  const canonicalPalette =
    backgroundMode === "auto"
      ? { ...palette, backgroundMode }
      : { ...paletteWithoutDark, backgroundMode };
  return normalizedClone({
    ...normalized,
    general: {
      ...normalized.general,
      palette: canonicalPalette,
    },
  });
}

function buildScopes(config: TenantThemeConfig): TenantThemeArtifact["scopes"] {
  const rootSelector = ":where([data-ds-root])";
  const verticalSelector = `:where([data-ds-root][data-vertical="${config.verticalKey}"])`;
  const tenantSelector = `:where([data-ds-root][data-tenant="${config.slug}"])`;
  return {
    root: { attribute: "data-ds-root", selector: rootSelector },
    vertical: {
      attribute: "data-vertical",
      value: config.verticalKey,
      selector: verticalSelector,
    },
    tenant: {
      attribute: "data-tenant",
      value: config.slug,
      selector: tenantSelector,
    },
    // The effective tenant overlay intentionally keeps its attributes outside
    // :where(). First-party vertical artifacts are unlayered and their state
    // variants reach (0,3,1) through the legacy html[data-tenant] arm plus two
    // pseudo-classes. Requiring both tenant presence and the exact tenant value
    // is semantically redundant but yields (0,4,0), so the validated DB artifact
    // always wins on its own root without !important or insertion-order coupling.
    combinedSelector: `[data-ds-root][data-vertical="${config.verticalKey}"][data-tenant][data-tenant="${config.slug}"]`,
  };
}

/** Server-safe attribute projection for the provider-owned SSR root. */
export function tenantThemeArtifactRootAttributes(
  artifact: Pick<TenantThemeArtifact, "slug" | "verticalKey">
): TenantThemeRootAttributes {
  return {
    "data-ds-root": "",
    "data-vertical": artifact.verticalKey,
    "data-tenant": artifact.slug,
  };
}

const ANATOMY_ATTRIBUTE_BY_FAMILY = {
  cardComponent: "data-anatomy-card",
  table: "data-anatomy-table",
  sidebar: "data-anatomy-sidebar",
  layout: "data-anatomy-layout",
} as const satisfies Record<keyof typeof TENANT_THEME_ANATOMY_VARIANTS, string>;

/**
 * Pure projection of the compiled anatomy selections into `data-anatomy-*`
 * root attributes. Values come from the closed per-family enum only — never
 * from interpolated tenant strings — and `default`/absent emits nothing, so
 * every pre-anatomy document stamps zero additional attributes. The SSR
 * provider spreads this beside `tenantThemeArtifactRootAttributes` on the
 * same root; skins select on the attribute, one level above the scope class.
 */
export function tenantThemeAnatomyAttributes(
  artifact: Pick<TenantThemeArtifact, "normalizedAppearance">
): Record<string, string> {
  const chrome = artifact.normalizedAppearance.advanced?.chrome;
  const attributes: Record<string, string> = {};
  if (!chrome) return attributes;
  for (const family of Object.keys(
    ANATOMY_ATTRIBUTE_BY_FAMILY
  ) as (keyof typeof ANATOMY_ATTRIBUTE_BY_FAMILY)[]) {
    const variant = chrome[family]?.anatomy;
    if (
      typeof variant !== "string" ||
      variant === "default" ||
      !(TENANT_THEME_ANATOMY_VARIANTS[family] as readonly string[]).includes(
        variant
      )
    ) {
      continue;
    }
    attributes[ANATOMY_ATTRIBUTE_BY_FAMILY[family]] = variant;
  }
  return attributes;
}

function sortedVariables(
  variables: Record<string, string>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(variables).sort(([left], [right]) =>
      compareCodeUnits(left, right)
    )
  );
}

const CHART_CATEGORY_TOKEN = /^--ds-chart-category-(?:[1-9]|10)$/;
const CHART_CATEGORY_MIN_CONTRAST = 3;
const DEFAULT_CHART_GROUNDS = {
  light: "#FFFFFF",
  dark: "#0C0C0E",
} as const;
const CHART_SURFACE_TOKENS = [
  "--ds-color-bg-primary",
  "--ds-color-background",
  "--ds-color-bg",
  "--ds-card-bg",
  "--ds-metric-card-bg",
  "--ds-table-bg",
] as const;

/**
 * Guard tenant-authored categorical channels before they become chart marks.
 * Exact duplicates are not a palette, and every supplied mark color must keep
 * the WCAG 2.2 non-text/UI 3:1 floor against the concrete chart surfaces the
 * same artifact emits. `auto` must remain usable before either color-scheme
 * branch is known, so it is checked against both deterministic base grounds.
 * Chart anatomy still supplies labels/patterns; color is never the sole cue.
 */
function validateCompiledChartCategories(
  appearance: NormalizedTenantThemeAppearance,
  variables: Readonly<Record<string, string>>
): TenantThemeValidationIssue[] {
  const categories = Object.entries(variables).filter(([token]) =>
    CHART_CATEGORY_TOKEN.test(token)
  );
  if (categories.length === 0) return [];

  const issues: TenantThemeValidationIssue[] = [];
  const seen = new Map<string, string>();
  for (const [token, value] of categories) {
    const canonical = value.toUpperCase();
    const previous = seen.get(canonical);
    if (previous) {
      issues.push({
        code: "invalid_value",
        path: `$.visualFoundation.advanced.tokenOverrides[${JSON.stringify(
          token
        )}]`,
        message: `Chart category duplicates ${previous}; categorical channels must be unique`,
      });
    } else {
      seen.set(canonical, token);
    }
  }

  const mode = appearance.general?.palette?.backgroundMode ?? "light";
  const grounds = new Set<string>();
  if (mode === "auto") {
    grounds.add(DEFAULT_CHART_GROUNDS.light);
    grounds.add(DEFAULT_CHART_GROUNDS.dark);
    // Dual-seed tenants render their own dark canvas; authored categorical
    // marks must clear it in addition to the deterministic base grounds.
    const darkGround = appearance.general?.palette?.dark?.background;
    if (darkGround && isHexColor(darkGround)) {
      grounds.add(normalizeHexColor(darkGround).toUpperCase());
    }
  } else {
    grounds.add(DEFAULT_CHART_GROUNDS[mode]);
  }
  for (const token of CHART_SURFACE_TOKENS) {
    const value = variables[token];
    if (value && /^#[0-9a-fA-F]{6}$/.test(value))
      grounds.add(value.toUpperCase());
  }

  for (const [token, value] of categories) {
    for (const ground of grounds) {
      const ratio = contrastRatio(value, ground);
      if (ratio + Number.EPSILON < CHART_CATEGORY_MIN_CONTRAST) {
        issues.push({
          code: "invalid_value",
          path: `$.visualFoundation.advanced.tokenOverrides[${JSON.stringify(
            token
          )}]`,
          message: `Chart category contrast ${ratio.toFixed(
            2
          )}:1 on ${ground} is below ${CHART_CATEGORY_MIN_CONTRAST}:1`,
        });
      }
    }
  }

  return issues;
}

function effectiveModeVariables(
  compiled: CompiledBrand,
  mode: BrandThemeMode
): Record<string, string> {
  const block = compiled.modeBlocks?.find(
    (candidate) => candidate.mode === mode
  );
  return { ...compiled.cssVariables, ...block?.cssVariables };
}

/** Resolve simple code-owned var() aliases for contrast measurement only. */
function resolveContrastVariables(
  variables: Readonly<Record<string, string>>,
  mode: BrandThemeMode
): Record<string, string> {
  const foundationConstants: Readonly<Record<string, string>> = {
    "--ds-color-black": "#000000",
    "--ds-color-white": "#ffffff",
  };
  const resolved: Record<string, string> = {};
  const resolving = new Set<string>();
  const resolveValue = (value: string): string => {
    const modePair = /^light-dark\(\s*([^,]+?)\s*,\s*([^,]+?)\s*\)$/i.exec(
      value.trim()
    );
    if (modePair) {
      return resolveValue(mode === "dark" ? modePair[2] : modePair[1]);
    }
    const match = /^var\(\s*(--ds-[a-z0-9-]+)(?:\s*,\s*(.+))?\)$/i.exec(
      value.trim()
    );
    if (!match) return value;
    const [, reference, fallback] = match;
    if (resolving.has(reference))
      return fallback ? resolveValue(fallback) : value;
    const referenced = variables[reference] ?? foundationConstants[reference];
    if (referenced === undefined)
      return fallback ? resolveValue(fallback) : value;
    resolving.add(reference);
    const result = resolveValue(referenced);
    resolving.delete(reference);
    return result;
  };
  for (const [channel, value] of Object.entries(variables)) {
    resolving.add(channel);
    resolved[channel] = resolveValue(value);
    resolving.delete(channel);
  }
  return resolved;
}

function projectModeDeltas(
  compiled: CompiledBrand,
  baseline: CompiledBrand,
  baseDelta: Readonly<Record<string, string>>
): TenantThemeArtifactModeDelta[] {
  const modes = new Set<BrandThemeMode>();
  for (const block of compiled.modeBlocks ?? []) modes.add(block.mode);
  for (const block of baseline.modeBlocks ?? []) modes.add(block.mode);

  const result: TenantThemeArtifactModeDelta[] = [];
  for (const mode of ["light", "dark"] as const) {
    if (!modes.has(mode)) continue;
    const expected = effectiveModeVariables(compiled, mode);
    const withBaseDelta = {
      ...effectiveModeVariables(baseline, mode),
      ...baseDelta,
    };
    const variables: Record<string, string> = {};
    for (const [key, value] of Object.entries(expected)) {
      if (withBaseDelta[key] !== value) variables[key] = value;
    }
    if (Object.keys(variables).length > 0) {
      result.push({ mode, variables: sortedVariables(variables) });
    }
  }
  return result;
}

/**
 * The `chrome.sidebar` leaves that ATTRIBUTE a governed contrast pair.
 *
 * Both governed sidebar pairings -- `--ds-sidebar-text` over `--ds-sidebar-bg`,
 * and `--ds-sidebar-item-color-active` over `--ds-sidebar-item-bg-active` --
 * are reachable by a tenant through `advanced.chrome.sidebar`, but nothing in
 * this guard's authorship feed knew that: the feed listed the four general
 * foreground roles and the raw token overrides only. The measured consequence
 * (M5.2) is that an authored sub-floor sidebar pair is ACCEPTED on all three
 * verticals, because every first-party `--ds-sidebar-item-bg-active` is an
 * alpha or `color-mix` value, so the baseline pair is unverifiable, and with
 * neither side attributed the adjustment reads as code-owned.
 *
 * Only these four channels are added, and only to the adjustment loop's
 * authorship test. The unverifiable loop below is deliberately NOT fed: a
 * tenant that authors an ink over the VERTICAL's alpha ground would otherwise
 * be rejected for a ground it never chose, which is the same misattribution
 * pointing the other way (measured as the WIDE variant in M5.4).
 */
export const SIDEBAR_CONTRAST_ATTRIBUTION: Readonly<Record<string, string>> = {
  "chrome.sidebar.bg": "--ds-sidebar-bg",
  "chrome.sidebar.text": "--ds-sidebar-text",
  "chrome.sidebar.itemBgActive": "--ds-sidebar-item-bg-active",
  "chrome.sidebar.itemColorActive": "--ds-sidebar-item-color-active",
};

/**
 * APCA is an ingestion floor, never a second compiler. Evaluate the final
 * common-compiler result and reject an unsafe tenant-authored change; do not
 * rewrite the Theme or the emitted variables. A pair is tenant-relevant when
 * either its ink or its ground differs from the code-owned vertical baseline.
 */
function validateCompiledThemeContrast(
  compiled: CompiledBrand,
  baseline: CompiledBrand,
  appearance: NormalizedTenantThemeAppearance,
  tenantAuthoredPaths: TenantAuthoredPaths
): TenantThemeValidationIssue[] {
  const issues: TenantThemeValidationIssue[] = [];
  const authoredForegrounds = new Set<string>();
  const foreground = appearance.general?.palette?.foreground;
  const darkForeground = appearance.general?.palette?.dark?.foreground;
  const foregroundChannels = {
    primary: "--ds-color-text-primary",
    secondary: "--ds-color-text-secondary",
    muted: "--ds-color-text-muted",
    disabled: "--ds-color-text-disabled",
  } as const;
  for (const [role, channel] of Object.entries(foregroundChannels)) {
    if (
      foreground?.[role as keyof typeof foreground] !== undefined ||
      darkForeground?.[role as keyof typeof darkForeground] !== undefined
    ) {
      authoredForegrounds.add(channel);
    }
  }
  for (const channel of Object.keys(
    appearance.advanced?.tokenOverrides ?? {}
  )) {
    authoredForegrounds.add(channel);
  }
  for (const mode of ["light", "dark"] as const) {
    const expected = effectiveModeVariables(compiled, mode);
    const original = effectiveModeVariables(baseline, mode);
    const changed = new Set(
      Object.keys(expected).filter((key) => expected[key] !== original[key])
    );
    if (changed.size === 0) continue;
    // Narrow, mode-aware chrome attribution. Kept OUT of `authoredForegrounds`
    // so it reaches the adjustment loop's authorship test and nothing else.
    const authoredChromeChannels = new Set<string>();
    for (const [field, channel] of Object.entries(
      SIDEBAR_CONTRAST_ATTRIBUTION
    )) {
      if (isTenantAuthoredField(tenantAuthoredPaths, field, `modes.${mode}.`)) {
        authoredChromeChannels.add(channel);
      }
    }
    const modeAppearance = normalizedClone({
      ...appearance,
      general: {
        ...appearance.general,
        palette: {
          ...appearance.general?.palette,
          backgroundMode: mode,
        },
      },
    });
    const result = enforceTextContrast(
      resolveContrastVariables(expected, mode),
      modeAppearance
    );
    const baselineResult = enforceTextContrast(
      resolveContrastVariables(original, mode),
      modeAppearance
    );
    for (const adjustment of result.adjustments) {
      const groundChanged =
        !adjustment.pairedWith.startsWith("default:") &&
        changed.has(adjustment.pairedWith);
      if (!changed.has(adjustment.token) && !groundChanged) continue;
      const baselineAdjustment = baselineResult.adjustments.find(
        (candidate) =>
          candidate.token === adjustment.token &&
          candidate.pairedWith === adjustment.pairedWith
      );
      const directAuthorship =
        authoredForegrounds.has(adjustment.token) ||
        authoredChromeChannels.has(adjustment.token);
      // Absence of a baseline adjustment is two different facts, and treating
      // them as one blamed tenants for code-owned pairs. Either the baseline
      // pair was measured and cleared the floor -- so a new adjustment really
      // is a regression this tenant caused -- or the baseline pair could not
      // be measured at all (an alpha ground yields `non-hex-ground`), in which
      // case there is no comparable baseline and the adjustment is only the
      // tenant's when the tenant authored one side of the pair.
      const baselineUnverifiable = baselineResult.unverifiable.some(
        (candidate) =>
          candidate.token === adjustment.token &&
          candidate.pairedWith === adjustment.pairedWith
      );
      const pairAuthorship =
        directAuthorship ||
        authoredForegrounds.has(adjustment.pairedWith) ||
        authoredChromeChannels.has(adjustment.pairedWith);
      const regressed =
        baselineAdjustment !== undefined
          ? Math.abs(adjustment.lcBefore) + Number.EPSILON <
            Math.abs(baselineAdjustment.lcBefore)
          : !baselineUnverifiable || pairAuthorship;
      if (!directAuthorship && !regressed) continue;
      issues.push({
        code: "invalid_value",
        path: "$.visualFoundation",
        message:
          `${mode} ${
            adjustment.token
          } has APCA Lc ${adjustment.lcBefore.toFixed(1)} ` +
          `against ${adjustment.pairedWith}; authored tenant colors must meet the governed floor`,
      });
    }
    for (const unverifiable of result.unverifiable) {
      const groundChanged =
        !unverifiable.pairedWith.startsWith("default:") &&
        changed.has(unverifiable.pairedWith);
      if (!changed.has(unverifiable.token) && !groundChanged) continue;
      const unchangedBaseline = baselineResult.unverifiable.some(
        (candidate) =>
          candidate.token === unverifiable.token &&
          candidate.pairedWith === unverifiable.pairedWith &&
          candidate.value === unverifiable.value
      );
      if (!authoredForegrounds.has(unverifiable.token) && unchangedBaseline) {
        continue;
      }
      issues.push({
        code: "invalid_value",
        path: "$.visualFoundation",
        message:
          `${mode} ${unverifiable.token} cannot be APCA-verified against ` +
          `${unverifiable.pairedWith} (${unverifiable.reason})`,
      });
    }
  }
  return issues;
}

function renderArtifactCss(
  selector: string,
  variables: Readonly<Record<string, string>>,
  digest: string,
  options: {
    modeDeltas?: readonly TenantThemeArtifactModeDelta[];
    backgroundMode?: "light" | "dark" | "auto";
  } = {}
): string {
  const declarations = [
    ...Object.entries(variables).map(([key, value]) => `  ${key}: ${value};`),
  ].join("\n");
  const modeRules = (options.modeDeltas ?? []).map((block) => {
    const modeDeclarations = [
      ...Object.entries(block.variables).map(
        ([key, value]) => `  ${key}: ${value};`
      ),
    ].join("\n");
    const explicitRule = `${themeModeSelector(
      selector,
      block.mode
    )} {\n${modeDeclarations}\n}`;
    if (options.backgroundMode !== "auto" || block.mode !== "dark") {
      return explicitRule;
    }
    const automaticRule = `@media (prefers-color-scheme: dark) {\n${selector}:not([data-theme='light']) {\n${modeDeclarations}\n}\n}`;
    return `${explicitRule}\n${automaticRule}`;
  });
  return [
    `/* TenantThemeArtifact v1 | ${TENANT_THEME_COMPILER_VERSION} | ${digest} */`,
    // Keep the runtime tenant overlay unlayered. In the author origin, normal
    // declarations outside a cascade layer outrank every named layer; putting
    // this rule in `@layer tenant` would make the unlayered vertical baseline
    // impossible to override regardless of source order or specificity.
    `${selector} {`,
    declarations,
    "}",
    ...modeRules,
    "",
  ].join("\n");
}

/** Validate and deterministically compile a DB theme into one SSR/hydration artifact. */
/**
 * C2b executable floor: no compiled artifact may carry an expressive edge
 * width beyond the universal a11y cap. The expansion clamps at emission;
 * this guard is the independent re-assertion on whatever actually reaches
 * the artifact — a second writer or future table typo fails CLOSED here.
 */
export function assertExpressiveEdgeWidthInvariant(
  key: string,
  value: string
): TenantThemeValidationIssue | null {
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

/**
 * Run the ISO lowering (migrate -> resolve -> compile) behind this compiler's
 * single typed rejection.
 *
 * `migrateV1` and `resolveTheme` are fail-closed by design and throw plain
 * `Error`s. That is correct for the contract layer, but it is not the boundary
 * contract here: a persisted row that hits one of those guards is an invalid
 * DOCUMENT, so it must leave as a `TenantThemeValidationError` with a named
 * path like every other rejection this function makes.
 */
function isoLowering<T>(run: () => T, path: string): T {
  try {
    return run();
  } catch (error) {
    if (error instanceof TenantThemeValidationError) throw error;
    throw new TenantThemeValidationError([
      {
        code: "invalid_value",
        path,
        message: `Rejected by the ISO Theme lowering: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    ]);
  }
}

/**
 * E-1 / W-B: the tenant's POSTURE FLOORS, projected out of a migrated patch.
 *
 * EXPORTED so the DB leg and anything that reconstructs it read ONE definition.
 * `provenance-acceptance` case G1 rebuilds this compiler's own inputs to prove
 * the artifact is the direct lowering; a private copy there would be a second
 * authority for the same projection, and the two would drift.
 *
 * E-2 widened it: the floor also lowers the tenant's own font families.
 *
 * NOT the whole patch, and the compiler settled that: a `ThemePatch` makes every
 * nested leaf optional where `Partial<BrandTheme>` keeps it required, so the
 * whole patch does not assign (`appearance.defaultMode`, then
 * `palette.primaryColor` -- a pattern, not a pair), and casting across would be
 * the silent narrowing this programme refuses. Only the paths the floor is READ
 * at cross: `resolveTenantPosture` consults nine keypaths, and these six scalars
 * are the ones that carry across unchanged. `undefined` leaves cost nothing --
 * `mergeBrandThemeFloors` skips them and `resolveTenantPosture` collapses an
 * all-undefined posture to `undefined` -- so no guard is needed.
 *
 * `motion.dial` (F4B-13): `motion` now projects too. It arrives WRAPPED
 * (`Theme.motion: Governed<BrandMotion>`, so a migrated patch is
 * `{motion:{value:{intensity,...}}}`) -- the posture reader
 * (`resolveTenantPosture`, `brand-theme/index.ts:1976`) reads `patch.motion`
 * AS-IS: its expression is `patch.motion ?? profile?.motion`, no `.value`
 * unwrap anywhere, and its only fallback is the expressive profile, not this
 * projection's own floor. That is exactly why this projection must hand it
 * the BARE spec -- if the reader unwrapped on its own, a wrapped floor could
 * pass through undetected; because it does not, the unwrap has to happen
 * HERE. The causal probe's own patch (built leaf-by-leaf by
 * `buildIngressInput` walking `motion.intensity`) never carries the wrapper
 * at all, so `patch.motion?.value ?? patch.motion` has to cover both shapes
 * with one expression. Preaudited (Fable, ACCEPT with binding correction
 * W-B): the fence
 * this projection closes is STRUCTURAL, not behavioural -- no first-party
 * vertical today authors a motion "ladder" that would out-rank the tenant's
 * own floor post-merge (unlike `surfaces.elevation`'s history), so there is
 * no before/after flip to assert. The drill below is a unit test of the
 * projection's SHAPE (both wrapped and unwrapped inputs unwrap the same
 * way, and a mutation that removes the unwrap reddens it), not a claim about
 * any vertical's baseline moving.
 *
 * One keypath deliberately NOT projected:
 *   - `expressive.*` is already expanded into `expressiveExpansion` above and
 *     applied at its own position; routing it again would lower one selection
 *     twice.
 */
export function tenantPostureFloors(patch: ThemePatch): Partial<BrandTheme> {
  const ty = patch.typography;
  const su = patch.surfaces;
  const mo = patch.motion;
  return {
    typography: {
      typePairing: ty?.typePairing,
      scale: ty?.scale,
      /* E-2: the floor's second half reads these two; schema v1 rejects
       * mono/letterSpacing/lineHeight, so those come only via the static arm. */
      fontFamilyBase: ty?.fontFamilyBase,
      fontFamilyHeading: ty?.fontFamilyHeading,
    },
    surfaces: {
      buttonStyle: su?.buttonStyle,
      radiusScale: su?.radiusScale,
      density: su?.density,
      elevation: su?.elevation,
    },
    motion: (mo?.value ?? mo) as BrandMotion | undefined,
  };
}

export function compileTenantThemeConfig(
  input: unknown,
  options: CompileTenantThemeConfigOptions = {}
): TenantThemeArtifact {
  const config = parseTenantThemeConfig(input);
  assertTenantIdentityAllowed({
    slug: config.slug,
    verticalKey: config.verticalKey,
  });
  // Simple v1 documents remain source-compatible: their trusted vertical
  // resolves the code-owned vertical default even when the caller omits the
  // envelope option. Advanced mode keeps its existing explicit-policy gate.
  const verticalEnvelope =
    options.verticalEnvelope ??
    (config.mode === "simple"
      ? getTenantThemeVerticalEnvelope(config.verticalKey)
      : undefined);
  const envelopeIssues = validateTenantThemeAgainstVerticalEnvelope(
    config,
    verticalEnvelope
  );
  if (envelopeIssues.length > 0)
    throw new TenantThemeValidationError(envelopeIssues);
  if (!verticalEnvelope) {
    throw new TenantThemeValidationError([
      {
        code: "invalid_value",
        path: "$.verticalKey",
        message: "No code-owned vertical theme envelope is registered",
      },
    ]);
  }

  const rawNormalizedAppearance = normalizeAppearance(config);

  // C1b: governed expressive selection. The experience id is revalidated
  // fail-closed (the schema already closes the enum; a row written before a
  // profile retirement must still never paint), and the profile's FIELD
  // defaults are applied to the normalized appearance BEFORE compilation,
  // clamped into the vertical envelope — so the artifact's own
  // normalizedAppearance (the shape MotionProvider and useTokens consume)
  // carries the same effective values the CSS was compiled from.
  const requestedExperienceProfile =
    rawNormalizedAppearance.general?.experienceProfile;
  const experienceProfileValidation = validateExperienceProfileSelection(
    requestedExperienceProfile
  );
  if (
    requestedExperienceProfile !== undefined &&
    !experienceProfileValidation.ok
  ) {
    throw new TenantThemeValidationError([
      {
        code: "invalid_value",
        path:
          config.mode === "advanced"
            ? "$.visualFoundation.general.experienceProfile"
            : "$.appearance.experienceProfile",
        message: `Experience profile rejected: ${experienceProfileValidation.reason}`,
      },
    ]);
  }
  const expressiveAxes = resolveExpressiveAxes(
    requestedExperienceProfile,
    sanitizeExpressiveOverrides(rawNormalizedAppearance.advanced?.profiles)
  );
  const expressiveExpansion = expandExpressiveProfiles(expressiveAxes);
  const effectiveGeneral = withExpressiveFieldDefaults(
    rawNormalizedAppearance.general,
    expressiveExpansion.fieldDefaults,
    verticalEnvelope.ranges
  );
  const normalizedAppearance =
    effectiveGeneral === rawNormalizedAppearance.general
      ? rawNormalizedAppearance
      : normalizedClone({
          ...rawNormalizedAppearance,
          general: effectiveGeneral,
        });

  // The shared runtime/static Appearance compiler owns APCA autocorrection so
  // artifact, provider and generated-CSS paths cannot drift.
  // ISO T0: the DB path must resolve through the same total Theme and single
  // compileTheme lowering as the static path. The v1 document migrates to a
  // typed ThemePatch, is resolved over the code-owned vertical Theme, and the
  // resulting variables are flattened (base + authored mode overrides) into the
  // single SSR/hydration artifact map the runtime expects.
  const baseTheme =
    FIRST_PARTY_THEMES[config.verticalKey as FirstPartyVerticalId];
  if (!baseTheme) {
    throw new TenantThemeValidationError([
      {
        code: "invalid_value",
        path: "$.verticalKey",
        message: "No first-party ISO theme is registered for this vertical",
      },
    ]);
  }
  // The expansion above reached `normalizedAppearance` -- the shape
  // MotionProvider and useTokens read -- but the CSS is lowered from the
  // DOCUMENT below, and the document never learned the profile's field
  // defaults. The result was a split-brain the acid test caught: a document
  // selecting `management-editorial` normalized to radiusScale 1.15 and
  // typePairing editorial in JS while its CSS kept bithire's 1.25 and grotesk,
  // because a field the vertical baseline already authors is only overridden by
  // a field the PATCH carries. Expanding the document general the same way
  // makes one selection produce one result on both planes.
  //
  // Computed from the document general rather than reusing `effectiveGeneral`:
  // `normalizeAppearance` drops the authored `dark` palette for any non-`auto`
  // background mode, and feeding that back into the patch would silently
  // retire a tenant's dark authorship. `withExpressiveFieldDefaults` returns
  // its input by identity when there is nothing to add, so a document without
  // a profile compiles to exactly the same bytes as before.
  const documentGeneral =
    config.mode === "simple"
      ? config.appearance
      : config.visualFoundation.general;
  const effectiveDocumentGeneral = withExpressiveFieldDefaults(
    documentGeneral,
    expressiveExpansion.fieldDefaults,
    verticalEnvelope.ranges
  );
  const documentPatchSource = {
    schemaVersion: config.schemaVersion,
    mode: config.mode,
    ...(config.mode === "simple"
      ? { appearance: effectiveDocumentGeneral }
      : {
          visualFoundation: {
            ...config.visualFoundation,
            ...(effectiveDocumentGeneral
              ? { general: effectiveDocumentGeneral }
              : {}),
          },
        }),
  } as unknown as TenantThemeDocument;
  const defaultMode = baseTheme.appearance.defaultMode;
  if (!defaultMode) {
    throw new TenantThemeValidationError([
      {
        code: "invalid_value",
        path: "$.verticalKey",
        message: "The first-party Theme has no canonical default mode",
      },
    ]);
  }
  // The ISO leg is the only place a persisted row meets the fail-closed
  // ThemePatch/mergeDeep/compileTheme lowering, and those throw plain Errors
  // (`ThemePatchMigrationError`, `resolveTheme: unknown key ...`). A caller of
  // this compiler contracts on ONE typed rejection, so an untyped throw here
  // would surface to a route as a 500 instead of a named document issue.
  const { compiledTheme, tenantAuthoredPaths } = isoLowering(
    () => {
      const envelope = migrateV1(documentPatchSource, defaultMode);
      const resolved = resolveTheme(baseTheme, envelope.patch);
      // The patch IS this tenant's authorship record: a path can only appear
      // in it because the document put it there. Collected AFTER `migrateV1`
      // so the paths are already in the canonical Theme spelling the compiler
      // consults, and passed ONLY to this leg -- `baseCompiled` below is the
      // code-owned vertical and has no tenant, so it stays provenance-free and
      // keeps producing the exact baseline the delta subtracts against.
      const authoredPaths = collectPatchAuthoredPaths(envelope.patch);
      const tenantFloors = tenantPostureFloors(envelope.patch);
      return {
        compiledTheme: compileTheme(resolved, {
          tenantSlug: config.slug,
          tenantAuthoredPaths: authoredPaths,
          /* E-1: THE TENANT'S FLOORS, handed over as well as its authorship.
           *
           * `resolved` already carries this patch -- that is what `resolveTheme`
           * above did -- so this is NOT a second application of the values. It
           * is the one thing the merge destroys: WHOSE floor they are. The
           * compiler lowers a vertical's own authoring and a tenant's selection
           * at different positions (the posture preset early, `tenantPosture`
           * last), and after a merge it can no longer tell them apart. Measured
           * before this line existed: rottay authors all six
           * `surfaces.elevations` levels, its authored ladder overwrote the
           * posture preset, and `surfaces.elevation` lowered ZERO variables
           * through this door on both non-identity stops while the static arm
           * -- which hands its patch over -- moved three. This is the second
           * half of the symmetry B-2 opened: that packet gave the tenant leg
           * its AUTHORSHIP, this one gives it its FLOORS, through the same door
           * and from the same envelope.
           *
           * W-B -- THE CROSS-SPACE HANDOFF IS AN OMISSION, NOT AN ASSERTION.
           * What travels is BrandTheme-space, projected out of a `ThemePatch`
           * by `tenantPostureFloors` (its docblock carries the reasoning; this
           * is the caller's summary, not a second copy).
           *
           * THERE IS NO RUNTIME GUARD HERE, and an earlier draft of this
           * comment claimed one -- it described a peel-and-check design that
           * was abandoned when the projection replaced it. What actually keeps
           * Theme-space fields out is three things, none of which throws:
           *   1. OMISSION -- the projection reads six named posture keypaths
           *      and nothing else, so a field like `appearance` is never read
           *      and cannot cross. Silently, by construction.
           *   2. THE TYPE SYSTEM -- the whole patch does not assign to
           *      `Partial<BrandTheme>` (`appearance.defaultMode`, then
           *      `palette.primaryColor`: a pattern, not a pair), which is what
           *      forced the projection instead of a cast.
           *   3. CONSTRUCTION -- `migrateV1` never emits `appearance` at all;
           *      it states as law that `backgroundMode` is runtime selection
           *      metadata that "never reaches ThemePatch.appearance.defaultMode"
           *      (migrate-v1/index.ts:400-402).
           * A guard would defend a case the projection cannot express and the
           * migrator does not produce; the honest record is that nothing stops
           * a bad field here because nothing can deliver one.
           *
           * THE FENCE is the 9-field x 3-vertical sweep re-measured with this
           * line in place: only the two rottay elevation rows may move, and
           * every other row must read exactly as it did before. */
          tenantPatch: tenantFloors,
        }),
        tenantAuthoredPaths: authoredPaths,
      };
    },
    config.mode === "advanced" ? "$.visualFoundation" : "$.appearance"
  );
  // ISO T0: the DB artifact is a single-mode tenant overlay. The resolved
  // Theme's default-mode variables are the binding, but the SSR/hydration
  // artifact only needs to carry the delta against the code-owned vertical
  // baseline. The baseline CSS is loaded separately; the overlay overrides only
  // what the tenant actually changed, keeping the artifact within its guard.
  const baseCompiled = compileTheme(baseTheme, { tenantSlug: config.slug });
  const contrastIssues = validateCompiledThemeContrast(
    compiledTheme,
    baseCompiled,
    normalizedAppearance,
    tenantAuthoredPaths
  );
  if (contrastIssues.length > 0) {
    throw new TenantThemeValidationError(contrastIssues);
  }
  const contrastedVariables: Record<string, string> = {};
  for (const [key, value] of Object.entries(compiledTheme.cssVariables)) {
    if (baseCompiled.cssVariables[key] !== value) {
      contrastedVariables[key] = value;
    }
  }
  const adjustments: readonly TenantThemeContrastAdjustment[] = [];
  const variables = sortedVariables(contrastedVariables);
  const modeDeltas = projectModeDeltas(compiledTheme, baseCompiled, variables);
  const chartCategoryIssues = validateCompiledChartCategories(
    normalizedAppearance,
    variables
  );
  if (chartCategoryIssues.length > 0)
    throw new TenantThemeValidationError(chartCategoryIssues);
  const compiledVariableCount =
    Object.keys(variables).length +
    modeDeltas.reduce(
      (total, block) => total + Object.keys(block.variables).length,
      0
    );
  if (
    compiledVariableCount >
    TENANT_THEME_CONFIG_SCHEMA.limits.maxCompiledVariables
  ) {
    throw new TenantThemeValidationError([
      {
        code: "invalid_value",
        path: "$.visualFoundation",
        message: `Compiled variable count exceeds ${TENANT_THEME_CONFIG_SCHEMA.limits.maxCompiledVariables}`,
      },
    ]);
  }
  const projectedVariableMaps = [
    variables,
    ...modeDeltas.map((block) => block.variables),
  ];
  for (const [key, value] of projectedVariableMaps.flatMap((map) =>
    Object.entries(map)
  )) {
    // The recipe channel is not authored CSS: it is a compiler-generated,
    // quoted identifier that has already passed the closed registry above.
    // Keep the general visual-value parser hostile to `@`/arbitrary strings
    // and admit only this exact validated declaration.
    // ISO T0: profile channels are emitted by compileTheme after it already
    // validated the selection fail-closed; re-running the general visual-value
    // parser on the quoted identifier would be tautological.
    const isValidatedProfileChannel =
      key === "--ds-recipe-profile" || key === "--ds-experience-profile";
    const edgeIssue = assertExpressiveEdgeWidthInvariant(key, value);
    if (edgeIssue) throw new TenantThemeValidationError([edgeIssue]);
    if (
      !key.startsWith("--ds-") ||
      (!isValidatedProfileChannel &&
        !isSafeVisualValue(value, `$.variables[${JSON.stringify(key)}]`, false))
    ) {
      throw new TenantThemeValidationError([
        {
          code: "unsafe_value",
          path: `$.variables[${JSON.stringify(key)}]`,
          message: `Appearance compiler emitted an unsafe variable declaration: ${JSON.stringify(
            value
          )}`,
        },
      ]);
    }
  }
  const compiledVariableBytes = new TextEncoder().encode(
    canonicalizeTenantThemeValue({ variables, modeDeltas })
  ).byteLength;
  if (
    compiledVariableBytes >
    TENANT_THEME_CONFIG_SCHEMA.limits.maxCompiledVariableBytes
  ) {
    throw new TenantThemeValidationError([
      {
        code: "invalid_value",
        path: "$.visualFoundation",
        message: `Compiled variable payload exceeds ${TENANT_THEME_CONFIG_SCHEMA.limits.maxCompiledVariableBytes} bytes`,
      },
    ]);
  }

  const scopes = buildScopes(config);
  const verticalEnvelopeDigest = `sha256-${sha256Utf8(
    canonicalizeTenantThemeValue(verticalEnvelope)
  )}`;
  const digestSource = {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    compilerVersion: TENANT_THEME_COMPILER_VERSION,
    // Coverage is provenance, not decoration: the runtime resolver suppresses
    // exactly these channels, so a coverage change must move the digest.
    coverage: TENANT_THEME_V1_COVERAGE,
    tenantId: config.tenantId,
    slug: config.slug,
    verticalKey: config.verticalKey,
    rowVersion: config.rowVersion,
    normalizedAppearance,
    variables,
    ...(modeDeltas.length > 0 ? { modeDeltas } : {}),
    scopes,
    // Empty adjustment lists stay out of the digest source so pre-autocorrect
    // artifacts keep their digests; a non-empty list is a real output change.
    ...(adjustments.length > 0 ? { adjustments } : {}),
    ...(verticalEnvelopeDigest ? { verticalEnvelopeDigest } : {}),
  };
  const digest = `sha256-${sha256Utf8(
    canonicalizeTenantThemeValue(digestSource)
  )}`;

  return {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    tenantId: config.tenantId,
    slug: config.slug,
    verticalKey: config.verticalKey,
    rowVersion: config.rowVersion,
    compilerVersion: TENANT_THEME_COMPILER_VERSION,
    verticalEnvelopeDigest,
    digest,
    coverage: TENANT_THEME_V1_COVERAGE,
    normalizedAppearance,
    variables,
    ...(modeDeltas.length > 0 ? { modeDeltas } : {}),
    ...(adjustments.length > 0 ? { adjustments } : {}),
    css: renderArtifactCss(scopes.combinedSelector, variables, digest, {
      modeDeltas,
      backgroundMode:
        normalizedAppearance.general?.palette?.backgroundMode ?? "light",
    }),
    scopes,
  };
}
