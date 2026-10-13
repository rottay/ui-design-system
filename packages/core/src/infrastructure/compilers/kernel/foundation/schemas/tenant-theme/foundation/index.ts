/**
 * The node grammar of the TenantThemeConfig v1 schema: the node type, its
 * constructors and the value atoms every schema member builds from.
 */

import { TENANT_THEME_ANATOMY_VARIANTS } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";

export type TenantThemeSchemaNode =
  | {
      type: "object";
      fields: Readonly<Record<string, TenantThemeSchemaNode>>;
      required?: readonly string[];
    }
  | { type: "literal"; value: string | number }
  | { type: "enum"; values: readonly (string | number)[] }
  | {
      type: "string";
      format:
        | "identifier"
        | "slug"
        | "color"
        | "hex-color"
        | "font-family"
        | "visual-value";
    }
  | { type: "number"; integer?: boolean; min?: number; max?: number };

const literal = (value: string | number): TenantThemeSchemaNode => ({
  type: "literal",
  value,
});
const enumeration = (
  ...values: Array<string | number>
): TenantThemeSchemaNode => ({ type: "enum", values });
const string = (
  format: Extract<TenantThemeSchemaNode, { type: "string" }>["format"]
): TenantThemeSchemaNode => ({
  type: "string",
  format,
});
const number = (
  options: Omit<Extract<TenantThemeSchemaNode, { type: "number" }>, "type"> = {}
): TenantThemeSchemaNode => ({
  type: "number",
  ...options,
});
const object = (
  fields: Readonly<Record<string, TenantThemeSchemaNode>>,
  required: readonly string[] = []
): TenantThemeSchemaNode => ({
  type: "object",
  fields,
  ...(required.length > 0 ? { required } : {}),
});

const visualFields = (
  fields: readonly string[]
): Readonly<Record<string, TenantThemeSchemaNode>> =>
  Object.fromEntries(fields.map((field) => [field, string("visual-value")]));

const COLOR = string("color");
const HEX_COLOR = string("hex-color");
const VISUAL = string("visual-value");
const FONT_WEIGHT = number({ min: 1, max: 1000 });
const OPACITY = number({ min: 0, max: 1 });

const anatomy = (
  family: keyof typeof TENANT_THEME_ANATOMY_VARIANTS
): TenantThemeSchemaNode =>
  enumeration(...TENANT_THEME_ANATOMY_VARIANTS[family]);

export {
  COLOR,
  FONT_WEIGHT,
  HEX_COLOR,
  OPACITY,
  VISUAL,
  anatomy,
  enumeration,
  literal,
  number,
  object,
  string,
  visualFields,
};
