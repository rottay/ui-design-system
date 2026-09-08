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
  type TenantAppearance,
} from "@/foundation/contracts/composition/tenants/themes";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import {
  canonicalizeJsonValue as canonicalizeTenantThemeValue,
  isCanonicalJsonObject as isPlainObject,
} from "@/foundation/kernel/serialization";
import { sha256Utf8 } from "@/foundation/kernel/cryptography/sha-256";
import { validateRecipeProfileSelection } from "@/foundation/tokens/ts/presentation/recipe-profiles";
import { validateResponsivePostureSelection } from "@/foundation/tokens/ts/presentation/responsive-postures";
import { assertTenantIdentityAllowed } from "@/foundation/tokens/ts/presentation/brand-themes";
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
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
} from "../../kernel/foundation/css/color-math";
import {
  ON_TONE_ROLES,
  type OnToneRole,
} from "../../kernel/foundation/css/color-math/readable-ink";
import {
  TENANT_THEME_CONFIG_SCHEMA,
  type TenantThemeSchemaNode,
} from "../../kernel/foundation/schemas/tenant-theme";
import { withExpressiveFieldDefaults } from "../../kernel/runtime/appearance";
import { TENANT_THEME_COMPILER_VERSION } from "./version";
import { isFirstPartyVerticalId } from "@/foundation/tokens/ts/presentation/brand-themes";
import type { EngineVisualDeclaration } from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import { engineVisualOf } from "../../runtime/theme/facade/presentation/engine-visual";
import type {
  TenantAuthoredPaths,
  ThemeLayerPatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  isTenantAuthoredField,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import { type TenantStatusSeedAuthorship } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { tenantArtifactScope } from "@/infrastructure/compilers/runtime/theme";
// The artifact composer is deliberately NOT on the theme barrel: it is the
// format two internal owners share, not an API a consuming app has any use for.
import { emitTenantArtifactCss } from "@/infrastructure/compilers/runtime/theme/runtime/emission";
import {
  compileThemeIntent,
  documentThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";
// The single admission. This terminal supplies the one transport fact the
// intent cannot carry (the document's declared canvas) and re-dresses the
// door's refusal under its own published error name; it decides nothing.
import {
  DEFAULT_CHART_GROUNDS,
  ThemeAdmissionError,
  chartCategoryIssues,
  isSafeVisualValue,
} from "@/infrastructure/compilers/runtime/theme/facade/foundation/admission";
import {
  getTenantThemeVerticalEnvelope,
  isInsideEnvelopeRange,
} from "@/contracts/theme/runtime/envelopes";

export { TENANT_THEME_CONFIG_SCHEMA } from "../../kernel/foundation/schemas/tenant-theme";
export type { TenantThemeSchemaNode } from "../../kernel/foundation/schemas/tenant-theme";
export { TENANT_THEME_COMPILER_VERSION };

/**
 * The vertical envelope, re-exported from the contracts owner that now holds it.
 *
 * It had to move. The single admission at the compile door has to read it, and
 * the door cannot import this terminal, which imports the door. A policy only
 * one transport could reach is exactly how the DB path grew an envelope law the
 * preview and draft paths did not have (F-13).
 */
export {
  TENANT_THEME_VERTICAL_ENVELOPES,
  assertTenantThemeEnvelopeDeclaresAdvanced,
  getFirstPartyTenantThemeVerticalEnvelope,
  getTenantThemeVerticalEnvelope,
} from "@/contracts/theme/runtime/envelopes";
export type { TenantThemeVerticalEnvelopeWithAdvanced } from "@/contracts/theme/runtime/envelopes";

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
    // The VERDICT is `contracts/theme/runtime/envelopes`'; only the document
    // spelling of the path is this transport's. The compile door asks the same
    // question of the resolved Theme, so a preview and a publish of one
    // document now agree on the answer (F-13).
    if (value !== undefined && !isInsideEnvelopeRange(value, range)) {
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
        !isInsideEnvelopeRange(density, ranges.densityScale)
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
        !isInsideEnvelopeRange(intensity, ranges.effectIntensity)
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
    combinedSelector: tenantArtifactScope(config.verticalKey, config.slug).baseSelector,
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

function renderArtifactCss(
  verticalKey: string,
  slug: string,
  variables: Readonly<Record<string, string>>,
  digest: string,
  options: {
    modeDeltas?: readonly TenantThemeArtifactModeDelta[];
    backgroundMode?: "light" | "dark" | "auto";
  } = {}
): string {
  // The WHOLE artifact format is the emission owner's, not just its
  // declarations and rules: banner, unlayered base rule, mode rules and the
  // `auto` background mode's media-scoped copy of the dark delta. This file
  // supplies the values and the compiler version; it spells no CSS text.
  return emitTenantArtifactCss({
    verticalKey,
    slug,
    compilerVersion: TENANT_THEME_COMPILER_VERSION,
    digest,
    variables,
    modeDeltas: options.modeDeltas,
    backgroundMode: options.backgroundMode,
  });
}

/** Validate and deterministically compile a DB theme into one SSR/hydration artifact. */
/**
 * C2b executable floor: no compiled artifact may carry an expressive edge
 * width beyond the universal a11y cap. Owned by the single admission now, and
 * re-exported here because the a11y-floor contract test binds to this name.
 */
export {
  SIDEBAR_CONTRAST_ATTRIBUTION,
  assertExpressiveEdgeWidthInvariant,
} from "@/infrastructure/compilers/runtime/theme/facade/foundation/admission";

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
    // The door's refusal, re-dressed and NOT re-decided. `ThemeAdmissionError`
    // already carries `{ code, path, message }` issues -- the same triple this
    // compiler's own vocabulary uses -- so the translation is one constructor
    // call with nothing recomputed. A second admission would be a second set of
    // messages to keep in step; this is the same set under the published name a
    // route already catches.
    if (error instanceof ThemeAdmissionError) {
      throw new TenantThemeValidationError(error.issues);
    }
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

import { tenantPostureFloors } from "@/foundation/contracts/composition/tenants/themes/resolved";
import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";

export { tenantPostureFloors };

/**
 * The artifact and the compile it came from.
 *
 * Two projections of ONE lowering, never two compiles: an engine that seeds a
 * third-party library needs the projection on the first frame, and re-running
 * the door to get it would be a second answer to the same question.
 */
export interface TenantThemeCompilation {
  readonly artifact: TenantThemeArtifact;
  readonly engineVisual: EngineVisualDeclaration;
}

export function compileTenantThemeConfig(
  input: unknown,
  options: CompileTenantThemeConfigOptions = {}
): TenantThemeArtifact {
  return compileTenantTheme(input, options).artifact;
}

export function compileTenantTheme(
  input: unknown,
  options: CompileTenantThemeConfigOptions = {}
): TenantThemeCompilation {
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
  // The experience-profile refusal is the door's: `admission/envelope` refuses
  // an unknown id by name for EVERY origin, where this terminal refused it for
  // one and the lowering silently expanded it to nothing everywhere else --
  // deleting twelve of the vertical's channels without a word (F-61). What is
  // left here is the EXPANSION, which is an artifact concern: the normalized
  // appearance the runtime reads must carry the same effective values the CSS
  // was compiled from.
  const requestedExperienceProfile =
    rawNormalizedAppearance.general?.experienceProfile;
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
  // typed ThemeLayerPatch, is resolved over the code-owned vertical Theme, and the
  // resulting variables are flattened (base + authored mode overrides) into the
  // single SSR/hydration artifact map the runtime expects.
  // The typed refusal for an unknown vertical, stated ONCE and before the door.
  // The ingress door refuses the same value with a plain `Error`, which
  // `isoLowering` would retype -- but a caller of this compiler contracts on a
  // named document issue, and the vertical is an identity fact this terminal
  // already owns, not a lowering fact.
  if (!isFirstPartyVerticalId(config.verticalKey)) {
    throw new TenantThemeValidationError([
      {
        code: "invalid_value",
        path: "$.verticalKey",
        message: "No first-party ISO theme is registered for this vertical",
      },
    ]);
  }
  const vertical: FirstPartyVerticalId = config.verticalKey;
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
  // The ISO leg is the only place a persisted row meets the fail-closed
  // ThemeLayerPatch/mergeDeep/compileTheme lowering, and those throw plain Errors
  // (`ThemePatchMigrationError`, `resolveTheme: unknown key ...`). A caller of
  // this compiler contracts on ONE typed rejection, so an untyped throw here
  // would surface to a route as a 500 instead of a named document issue.
  // The engine is the VERTICAL's, never the tenant's: the door reads the same
  // roster row the envelopes are keyed on, so a document cannot contradict what
  // product it is being rendered as.
  const { compiledTheme, variables, modeDeltas } = isoLowering(
    () => {
      // The intent IS this tenant's authorship record: a path can only appear
      // in its patch because the document put it there. `resolveTheme` collects
      // the authored paths, projects the tenant's posture floors and reads the
      // status-seed authorship off the SAME raw patch, in one place, so the
      // lowering receives one envelope instead of four hand-assembled fields.
      //
      // The floors matter because the merge destroys the one fact the resolved
      // Theme can no longer state: WHOSE a value is. The compiler lowers a
      // vertical's own authoring and a tenant's selection at different
      // positions -- the posture preset early, the tenant posture last -- and
      // after a merge it cannot tell them apart.
      //
      // THE ADMISSION IS THE DOOR'S, all five stations of it. This terminal
      // used to be the only place tier, envelope, contrast, chart and limit
      // policy existed, which is exactly why the `preview` and draft origins
      // reached the same channel writers with none of it applied (F-13). What
      // is left here is the ARTIFACT: the delta the door already computed, the
      // digest, the CSS and the scopes.
      const { resolution, compiled, delta } = compileThemeIntent(
        documentThemeIntent({
          vertical,
          slug: config.slug,
          document: documentPatchSource,
        })
      );
      // A tenant-document intent is tenant-authored by the intent contract's
      // own definition, so the door always produced a delta for it. Naming the
      // absence rather than defaulting keeps the terminal from inventing an
      // empty artifact out of a compile that did not measure one.
      if (!delta) {
        throw new Error(
          `compileTenantTheme: the door returned no delta for ${JSON.stringify(
            resolution.intent?.origin ?? "tenant-document"
          )}; an artifact cannot be projected from an unmeasured compile`
        );
      }
      return {
        compiledTheme: compiled,
        variables: delta.variables,
        modeDeltas: delta.modeDeltas,
      };
    },
    config.mode === "advanced" ? "$.visualFoundation" : "$.appearance"
  );
  // The one input the intent cannot carry. `backgroundMode` is v1 transport
  // metadata that deliberately never reaches the `Theme` ("runtime selection
  // metadata, not Theme authority"), so the canvas this document declares is
  // knowable here and nowhere else. The RULE is the door's; this supplies the
  // grounds the door could not derive, and the door has already measured the
  // ones it could.
  const declaredMode =
    normalizedAppearance.general?.palette?.backgroundMode ?? "light";
  const declaredGrounds: string[] = [];
  if (declaredMode === "auto") {
    declaredGrounds.push(DEFAULT_CHART_GROUNDS.light, DEFAULT_CHART_GROUNDS.dark);
    // Dual-seed tenants render their own dark canvas; authored categorical
    // marks must clear it in addition to the deterministic base grounds.
    const darkGround = normalizedAppearance.general?.palette?.dark?.background;
    if (darkGround && isHexColor(darkGround)) declaredGrounds.push(darkGround);
  } else {
    declaredGrounds.push(DEFAULT_CHART_GROUNDS[declaredMode]);
  }
  const declaredChartIssues = chartCategoryIssues(variables, declaredGrounds);
  if (declaredChartIssues.length > 0)
    throw new TenantThemeValidationError(declaredChartIssues);
  const adjustments: readonly TenantThemeContrastAdjustment[] = [];

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
    artifact: {
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
      css: renderArtifactCss(config.verticalKey, config.slug, variables, digest, {
        modeDeltas,
        backgroundMode:
          normalizedAppearance.general?.palette?.backgroundMode ?? "light",
      }),
      scopes,
    },
    engineVisual: engineVisualOf(compiledTheme),
  };
}
