/**
 * @fileoverview Server-safe TenantThemeConfig v1 validator and compiler.
 *
 * This module has no React, DOM, browser-storage, Node builtin or network
 * dependency. The same synchronous path runs in Node SSR, Edge/middleware and
 * the browser hydration boundary.
 */

import { type TenantAppearance } from "@/foundation/contracts/composition/tenants/themes";
import { contrastRatio } from "@/foundation/kernel/accessibility/branding-contrast";
import { enforceTextContrast } from "@/foundation/kernel/accessibility/branding-contrast/text-contrast-autocorrect";
import type {
  NormalizedTenantThemeAppearance,
  TenantThemeArtifact,
  TenantThemeConfigIdentity,
  TenantThemeConfig,
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
  TENANT_THEME_FONT_PACK_IDS,
  TENANT_THEME_RADIUS_SCALE_BOUNDS,
  TENANT_THEME_REFERENCE_TOKENS,
  TENANT_THEME_SCHEMA_VERSION,
  TENANT_THEME_TYPE_SCALE_BOUNDS,
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
import { appearanceToVariables } from "../../kernel/runtime/appearance";

export { TENANT_THEME_CONFIG_SCHEMA } from "../../kernel/foundation/schemas/tenant-theme";
export type { TenantThemeSchemaNode } from "../../kernel/foundation/schemas/tenant-theme";

export const TENANT_THEME_COMPILER_VERSION = "tenant-theme-compiler@3" as const;

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
} as const satisfies Readonly<Record<string, TenantThemeVerticalEnvelope>>);

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

const SHA256_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
] as const;

const rotateRight = (value: number, bits: number): number =>
  (value >>> bits) | (value << (32 - bits));

/** Portable SHA-256 (UTF-8) used without importing node:crypto. */
export function sha256TenantThemeValue(value: string): string {
  const bytes = Array.from(new TextEncoder().encode(value));
  const bitLengthHigh = Math.floor(bytes.length / 0x20000000);
  const bitLengthLow = (bytes.length << 3) >>> 0;

  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  bytes.push(
    (bitLengthHigh >>> 24) & 0xff,
    (bitLengthHigh >>> 16) & 0xff,
    (bitLengthHigh >>> 8) & 0xff,
    bitLengthHigh & 0xff,
    (bitLengthLow >>> 24) & 0xff,
    (bitLengthLow >>> 16) & 0xff,
    (bitLengthLow >>> 8) & 0xff,
    bitLengthLow & 0xff
  );

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const words = new Uint32Array(64);

  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      const cursor = offset + index * 4;
      words[index] =
        ((bytes[cursor] << 24) |
          (bytes[cursor + 1] << 16) |
          (bytes[cursor + 2] << 8) |
          bytes[cursor + 3]) >>>
        0;
    }
    for (let index = 16; index < 64; index += 1) {
      const s0 =
        rotateRight(words[index - 15], 7) ^
        rotateRight(words[index - 15], 18) ^
        (words[index - 15] >>> 3);
      const s1 =
        rotateRight(words[index - 2], 17) ^
        rotateRight(words[index - 2], 19) ^
        (words[index - 2] >>> 10);
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let index = 0; index < 64; index += 1) {
      const upperSigma1 =
        rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 =
        (h + upperSigma1 + choice + SHA256_CONSTANTS[index] + words[index]) >>>
        0;
      const upperSigma0 =
        rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (upperSigma0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((part) => part.toString(16).padStart(8, "0"))
    .join("");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * UTF-16 code-unit comparator. Canonical digests and emitted variable order
 * must not depend on host locale/ICU data, so every ordering in this module
 * routes through this single comparator.
 */
const compareCodeUnits = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

function normalizeCanonicalValue(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return typeof value === "string" ? value.trim() : value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value))
      throw new TypeError(
        "Canonical tenant theme values must contain finite numbers"
      );
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(normalizeCanonicalValue);
  if (!isPlainObject(value))
    throw new TypeError("Canonical tenant theme values must be JSON objects");

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort(compareCodeUnits)) {
    const child = value[key];
    if (
      child === undefined ||
      typeof child === "function" ||
      typeof child === "symbol" ||
      typeof child === "bigint"
    ) {
      throw new TypeError(
        `Canonical tenant theme value at ${key} is not JSON-serializable`
      );
    }
    result[key] = normalizeCanonicalValue(child);
  }
  return result;
}

/** Stable JSON serialization with recursively sorted keys and normalized edge whitespace. */
export function canonicalizeTenantThemeValue(value: unknown): string {
  return JSON.stringify(normalizeCanonicalValue(value));
}

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
export const TENANT_THEME_DOCUMENT_SCHEMA_DIGEST =
  `sha256-${sha256TenantThemeValue(
    canonicalizeTenantThemeValue(documentSchemaSource)
  )}` as const;

/** Drift sentinel for the fully hydrated compiler envelope. */
export const TENANT_THEME_CONFIG_SCHEMA_DIGEST =
  `sha256-${sha256TenantThemeValue(
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
  const open = value.search(/(?:linear|radial|conic)-gradient\s*\(/i);
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
  if (/[\u0000-\u001f\u007f{};<>\[\]@\\]/.test(value)) return false;
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

  const field = path.slice(path.lastIndexOf(".") + 1).replace(/[\]"']/g, "");
  if (
    enforceAuthoredCaps &&
    /padding/i.test(field) &&
    !respectsDimensionCap(value, limits.maxPaddingPx)
  )
    return false;
  if (
    enforceAuthoredCaps &&
    /radius/i.test(field) &&
    !respectsDimensionCap(value, limits.maxRadiusPx)
  )
    return false;
  if (
    enforceAuthoredCaps &&
    /gap/i.test(field) &&
    !respectsDimensionCap(value, limits.maxGapPx)
  )
    return false;
  if (
    enforceAuthoredCaps &&
    /gridSize/i.test(field) &&
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

export function parseTenantThemeDocument(
  input: unknown
): TenantThemeDocument {
  const result = validateTenantThemeDocument(input);
  if (!result.success) throw new TenantThemeValidationError(result.issues);
  return result.data;
}

export function validateTenantThemeConfig(
  input: unknown
): TenantThemeValidationResult {
  const issues = validateEnvelopeShape(
    input,
    TENANT_THEME_CONFIG_SCHEMA.modes
  );
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
    effectIntensity: { min: 0, max: 1 },
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
  if (config.mode === "simple")
    return normalizedClone({ general: config.appearance });
  return normalizedClone({
    ...(config.visualFoundation.general
      ? { general: config.visualFoundation.general }
      : {}),
    ...(config.visualFoundation.advanced
      ? { advanced: config.visualFoundation.advanced }
      : {}),
  });
}

function buildScopes(
  config: TenantThemeConfig
): TenantThemeArtifact["scopes"] {
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
} as const satisfies Record<
  keyof typeof TENANT_THEME_ANATOMY_VARIANTS,
  string
>;

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

function renderArtifactCss(
  selector: string,
  variables: Readonly<Record<string, string>>,
  digest: string
): string {
  const declarations = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return [
    `/* TenantThemeArtifact v1 | ${TENANT_THEME_COMPILER_VERSION} | ${digest} */`,
    // Keep the runtime tenant overlay unlayered. In the author origin, normal
    // declarations outside a cascade layer outrank every named layer; putting
    // this rule in `@layer tenant` would make the unlayered vertical baseline
    // impossible to override regardless of source order or specificity.
    `${selector} {`,
    declarations,
    "}",
    "",
  ].join("\n");
}

/** Validate and deterministically compile a DB theme into one SSR/hydration artifact. */
export function compileTenantThemeConfig(
  input: unknown,
  options: CompileTenantThemeConfigOptions = {}
): TenantThemeArtifact {
  const config = parseTenantThemeConfig(input);
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

  const normalizedAppearance = normalizeAppearance(config);
  const mergedVariables = sortedVariables(
    appearanceToVariables(normalizedAppearance as TenantAppearance)
  );
  // Contrast autocorrect runs before chart validation so categorical marks
  // are checked against the corrected surfaces the artifact actually emits.
  const { variables: contrastedVariables, adjustments } = enforceTextContrast(
    mergedVariables,
    normalizedAppearance
  );
  const variables = sortedVariables(contrastedVariables);
  const chartCategoryIssues = validateCompiledChartCategories(
    normalizedAppearance,
    variables
  );
  if (chartCategoryIssues.length > 0)
    throw new TenantThemeValidationError(chartCategoryIssues);
  const compiledVariableCount = Object.keys(variables).length;
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
  for (const [key, value] of Object.entries(variables)) {
    if (
      !key.startsWith("--ds-") ||
      !isSafeVisualValue(value, `$.variables[${JSON.stringify(key)}]`, false)
    ) {
      throw new TenantThemeValidationError([
        {
          code: "unsafe_value",
          path: `$.variables[${JSON.stringify(key)}]`,
          message: "Appearance compiler emitted an unsafe variable declaration",
        },
      ]);
    }
  }
  const compiledVariableBytes = new TextEncoder().encode(
    canonicalizeTenantThemeValue(variables)
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
  const verticalEnvelopeDigest = `sha256-${sha256TenantThemeValue(
    canonicalizeTenantThemeValue(verticalEnvelope)
  )}`;
  const digestSource = {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    compilerVersion: TENANT_THEME_COMPILER_VERSION,
    tenantId: config.tenantId,
    slug: config.slug,
    verticalKey: config.verticalKey,
    rowVersion: config.rowVersion,
    normalizedAppearance,
    variables,
    scopes,
    // Empty adjustment lists stay out of the digest source so pre-autocorrect
    // artifacts keep their digests; a non-empty list is a real output change.
    ...(adjustments.length > 0 ? { adjustments } : {}),
    ...(verticalEnvelopeDigest ? { verticalEnvelopeDigest } : {}),
  };
  const digest = `sha256-${sha256TenantThemeValue(
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
    normalizedAppearance,
    variables,
    ...(adjustments.length > 0 ? { adjustments } : {}),
    css: renderArtifactCss(scopes.combinedSelector, variables, digest),
    scopes,
  };
}
