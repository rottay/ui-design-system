/**
 * @fileoverview Fold a v1 document's raw `advanced.tokenOverrides` into the
 * `general` fields that own the same Theme leaf, or report why it cannot.
 *
 * All-or-nothing, never silent: every authored entry is reported exactly once,
 * and a value only disappears through a caller-supplied resolution.
 *
 * @module Compilers/Theme/Ingress/Runtime/RawOverrideMigration
 * @category Compilers
 * @package @rottay/design-system
 */

import type { ThemeDecisionId } from "@/contracts/theme/foundation/decisions";
import {
  isTenantThemeDocumentVersioned,
  type TenantThemeDocumentAny,
} from "@/contracts/theme/presentation/document";
import { THEME_CONTROL_CATALOG } from "@/contracts/theme/runtime/catalog";
import type { DeepPartial } from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  TENANT_THEME_OVERRIDE_TOKENS,
  type TenantThemeAdvancedDocument,
  type TenantThemeValidationIssue,
  type TenantVisualFoundation,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { isFirstPartyVerticalId } from "@/foundation/presets/verticals/roster";
import {
  TENANT_THEME_ADVANCED_SCHEMA,
  TENANT_THEME_GENERAL_SCHEMA,
  tenantThemeTokenOverrideIssues,
  validateTenantThemeNode,
} from "@/infrastructure/compilers/kernel/foundation/schemas/tenant-theme";
import {
  OVERRIDE_TOKEN_PATCHES,
  ThemePatchMigrationError,
  documentThemePatch,
} from "../../foundation/document-patch";

type JsonObject = Record<string, unknown>;

const FOUNDATION_PATH = "$.visualFoundation";
const GENERAL_PATH = `${FOUNDATION_PATH}.general`;
const ADVANCED_PATH = `${FOUNDATION_PATH}.advanced`;
const RAW_FIELD = "tokenOverrides";
const RAW_PATH = `${ADVANCED_PATH}.${RAW_FIELD}`;

export const RAW_OVERRIDE_RESOLUTION_ACTIONS = Object.freeze([
  "accept-loss",
  "replace",
] as const);

export type RawOverrideResolutionAction =
  (typeof RAW_OVERRIDE_RESOLUTION_ACTIONS)[number];

/** A caller's decision for one entry the fold cannot carry by itself. */
export interface RawOverrideResolution {
  readonly token: string;
  readonly action: RawOverrideResolutionAction;
  /** `replace` only: a `general` / `advanced.chrome` fragment the caller authored. */
  readonly replacement?: DeepPartial<TenantVisualFoundation>;
  /** Who decided and why; copied into the report. Required, never empty. */
  readonly note: string;
}

export const RAW_OVERRIDE_BLOCKING_OUTCOMES = Object.freeze([
  "unrepresentable",
  "ambiguous",
  "mode-routing",
  "off-allowlist",
  "invalid-value",
  "invalid-resolution",
] as const);

export type RawOverrideBlockingOutcome =
  (typeof RAW_OVERRIDE_BLOCKING_OUTCOMES)[number];

export type RawOverrideOutcome =
  | "folded"
  | "folded-over-general"
  | "resolved"
  | RawOverrideBlockingOutcome;

export interface RawOverrideReportEntry {
  readonly token: string;
  /** The authored value, verbatim. */
  readonly value: unknown;
  readonly outcome: RawOverrideOutcome;
  /** The catalog decision a folded entry now belongs to. */
  readonly decision?: ThemeDecisionId;
  /** The document path a folded entry moved to. */
  readonly to?: string;
  /** `folded-over-general`: the authored `general` value the raw one replaced. */
  readonly replaced?: unknown;
  /** `resolved`: the caller's action and note. */
  readonly action?: RawOverrideResolutionAction;
  readonly note?: string;
  /** `resolved` by `replace`: the document paths the fragment wrote. */
  readonly wrote?: readonly string[];
  /** Why a blocking entry blocks. */
  readonly reason?: string;
}

export interface RawOverrideMigration {
  readonly status: "unchanged" | "migrated" | "blocked";
  /** `migrated`: the new document. `unchanged` / `blocked`: the input itself. */
  readonly document: TenantThemeDocumentAny;
  /** One entry per authored token, sorted by token. */
  readonly report: readonly RawOverrideReportEntry[];
}

export interface RawOverrideFold {
  readonly decision: ThemeDecisionId;
  /** The Theme leaf the raw token and the `general` field both write. */
  readonly leaf: string;
  /** The field path under `visualFoundation.general`. */
  readonly field: readonly string[];
}

function isPlainObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cloneJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneJson);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value).map((key) => [key, cloneJson(value[key])])
  );
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (!isPlainObject(value)) return JSON.stringify(value) ?? "undefined";
  return `{${Object.keys(value)
    .filter((key) => value[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
    .join(",")}}`;
}

function expandMembers(keypath: string): readonly string[] {
  const brace = /^(.*)\{([^}]*)\}(.*)$/u.exec(keypath);
  return brace
    ? brace[2].split(",").map((member) => `${brace[1]}${member.trim()}${brace[3]}`)
    : [keypath];
}

function soleLeaf(
  patch: unknown,
  path: readonly string[] = []
): string | undefined {
  if (!isPlainObject(patch)) {
    return path.length > 0 ? path.join(".") : undefined;
  }
  const entries = Object.entries(patch);
  if (entries.length !== 1) return undefined;
  const [[key, child]] = entries;
  return soleLeaf(child, [...path, key]);
}

const DOCUMENT_GENERAL_PREFIX = "appearance.general.";

const LEAF_OWNERS: ReadonlyMap<string, ThemeDecisionId> = new Map(
  THEME_CONTROL_CATALOG.flatMap((row) =>
    row.keypath.brandTheme === null
      ? []
      : expandMembers(row.keypath.brandTheme).map(
          (leaf) => [leaf, row.id] as const
        )
  )
);

/**
 * A raw value folds only into a decision whose domain admits it verbatim: a
 * colour into a colour set, a number into a scale.
 */
const FOLDS_BY_LEAF: ReadonlyMap<string, RawOverrideFold> = new Map(
  THEME_CONTROL_CATALOG.flatMap((row) => {
    const { document, brandTheme } = row.keypath;
    if (row.domain.kind !== "color-set" && row.domain.kind !== "scale") return [];
    if (document === null || brandTheme === null) return [];
    if (!document.startsWith(DOCUMENT_GENERAL_PREFIX)) return [];
    const leaves = expandMembers(brandTheme);
    const fields = expandMembers(document);
    if (leaves.length !== fields.length) return [];
    return leaves.map((leaf, index) => {
      const fold: RawOverrideFold = Object.freeze({
        decision: row.id,
        leaf,
        field: Object.freeze(
          fields[index].slice(DOCUMENT_GENERAL_PREFIX.length).split(".")
        ),
      });
      return [leaf, fold] as const;
    });
  })
);

const LEAF_BY_TOKEN: ReadonlyMap<string, string | undefined> = new Map<
  string,
  string | undefined
>(
  TENANT_THEME_OVERRIDE_TOKENS.map((token) => [
    token,
    soleLeaf(OVERRIDE_TOKEN_PATCHES.get(token)),
  ])
);

/** Every raw token that IS a catalog decision, and the `general` field it folds into. */
export const RAW_OVERRIDE_FOLDS: ReadonlyMap<string, RawOverrideFold> = new Map<
  string,
  RawOverrideFold
>(
  [...LEAF_BY_TOKEN].flatMap(([token, leaf]) => {
    const fold = leaf === undefined ? undefined : FOLDS_BY_LEAF.get(leaf);
    return fold ? [[token, fold]] : [];
  })
);

const BLOCKING = new Set<RawOverrideOutcome>(RAW_OVERRIDE_BLOCKING_OUTCOMES);

function unrepresentableReason(token: string): string {
  const leaf = LEAF_BY_TOKEN.get(token);
  if (leaf === undefined) {
    return "the v1 lowering collects it into a list, not a Theme leaf of its own; no catalog decision owns it";
  }
  const owner = LEAF_OWNERS.get(leaf);
  if (owner === undefined) {
    return `writes Theme leaf "${leaf}"; no catalog decision owns that leaf`;
  }
  const row = THEME_CONTROL_CATALOG.find((entry) => entry.id === owner);
  return (
    `writes Theme leaf "${leaf}", owned by decision "${owner}" whose ` +
    `${row?.domain.kind ?? "closed"} domain does not admit a raw value`
  );
}

function issueText(issues: readonly TenantThemeValidationIssue[]): string {
  return issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
}

function readAt(
  root: unknown,
  path: readonly string[],
  label: string,
  depth = 0
): unknown {
  if (depth === path.length || root === undefined) return root;
  if (!isPlainObject(root)) {
    throw new ThemePatchMigrationError(
      `unsupported ${[label, ...path.slice(0, depth)].join(".")}; expected an object`
    );
  }
  return readAt(
    Object.entries(root).find(([key]) => key === path[depth])?.[1],
    path,
    label,
    depth + 1
  );
}

/** Writes `value` at `path`; returns false when a non-object stands in the way. */
function writeAt(root: JsonObject, path: readonly string[], value: unknown): boolean {
  let node = root;
  for (const key of path.slice(0, -1)) {
    const child = node[key];
    if (child === undefined) {
      const created: JsonObject = {};
      node[key] = created;
      node = created;
    } else if (isPlainObject(child)) {
      node = child;
    } else {
      return false;
    }
  }
  node[path[path.length - 1]] = value;
  return true;
}

function nested(path: readonly string[], value: unknown): JsonObject {
  const root: JsonObject = {};
  writeAt(root, path, value);
  return root;
}

function leavesOf(
  value: unknown,
  path: readonly string[] = []
): readonly (readonly [readonly string[], unknown])[] {
  if (!isPlainObject(value)) return [[path, value]];
  return Object.keys(value)
    .sort()
    .flatMap((key) => leavesOf(value[key], [...path, key]));
}

function isV1AdvancedDocument(value: unknown): value is TenantThemeAdvancedDocument {
  return (
    isPlainObject(value) &&
    value.schemaVersion === 1 &&
    value.mode === "advanced" &&
    isPlainObject(value.visualFoundation)
  );
}

function lowered(
  vertical: FirstPartyVerticalId,
  visualFoundation: JsonObject
): string {
  const document: unknown = { schemaVersion: 1, mode: "advanced", visualFoundation };
  if (!isV1AdvancedDocument(document)) {
    throw new Error("raw override migration: malformed lowering probe");
  }
  return canonical(documentThemePatch({ vertical, document }));
}

interface FoldGroup {
  readonly fold: RawOverrideFold;
  readonly tokens: readonly string[];
  readonly value: unknown;
}

/**
 * The lowering answers whether a fold is the same paint: the raw tokens and
 * the folded `general` fields must lower to the identical Theme patch.
 */
function sameLowering(
  vertical: FirstPartyVerticalId,
  general: JsonObject | undefined,
  groups: readonly FoldGroup[]
): boolean {
  const sections: JsonObject = {};
  for (const { fold } of groups) {
    const section = fold.field[0];
    if (general?.[section] !== undefined) {
      sections[section] = cloneJson(general[section]);
    }
  }
  const before: JsonObject = {
    general: cloneJson(sections),
    advanced: {
      [RAW_FIELD]: Object.fromEntries(
        groups.flatMap(({ tokens, value }) => tokens.map((token) => [token, value]))
      ),
    },
  };
  for (const { fold, value } of groups) {
    if (!writeAt(sections, fold.field, value)) return false;
  }
  return lowered(vertical, before) === lowered(vertical, { general: sections });
}

type ResolutionVerdict =
  | { readonly ok: true; readonly leaves: readonly (readonly [readonly string[], unknown])[] }
  | { readonly ok: false; readonly reason: string };

function judgeResolution(
  resolutions: readonly RawOverrideResolution[]
): ResolutionVerdict {
  if (resolutions.length !== 1) {
    return {
      ok: false,
      reason: `${resolutions.length} resolutions name this token; exactly one may`,
    };
  }
  const [resolution] = resolutions;
  const action: unknown = resolution.action;
  const note: unknown = resolution.note;
  const replacement: unknown = resolution.replacement;
  if (typeof note !== "string" || note.trim() === "") {
    return { ok: false, reason: "a resolution carries a non-empty note" };
  }
  if (action === "accept-loss") {
    return replacement === undefined
      ? { ok: true, leaves: [] }
      : { ok: false, reason: "accept-loss carries no replacement" };
  }
  if (action !== "replace") {
    return {
      ok: false,
      reason: `unknown action ${JSON.stringify(action)}; expected ${RAW_OVERRIDE_RESOLUTION_ACTIONS.join(" | ")}`,
    };
  }
  if (!isPlainObject(replacement)) {
    return { ok: false, reason: "replace carries a replacement object" };
  }
  for (const key of Object.keys(replacement)) {
    if (key !== "general" && key !== "advanced") {
      return {
        ok: false,
        reason: `replacement.${key} is outside general and advanced.chrome`,
      };
    }
  }
  const advanced = replacement.advanced;
  if (advanced !== undefined) {
    if (!isPlainObject(advanced)) {
      return { ok: false, reason: "replacement.advanced is not an object" };
    }
    for (const key of Object.keys(advanced)) {
      if (key !== "chrome") {
        return {
          ok: false,
          reason: `replacement.advanced.${key} is outside general and advanced.chrome`,
        };
      }
    }
  }
  const issues: TenantThemeValidationIssue[] = [];
  if (replacement.general !== undefined) {
    validateTenantThemeNode(
      replacement.general,
      TENANT_THEME_GENERAL_SCHEMA,
      GENERAL_PATH,
      issues
    );
  }
  if (advanced !== undefined) {
    validateTenantThemeNode(
      advanced,
      TENANT_THEME_ADVANCED_SCHEMA,
      ADVANCED_PATH,
      issues
    );
  }
  if (issues.length > 0) return { ok: false, reason: issueText(issues) };
  const leaves = leavesOf(replacement).filter(([, value]) => value !== undefined);
  return leaves.length > 0
    ? { ok: true, leaves }
    : { ok: false, reason: "replace writes nothing; use accept-loss to drop a value" };
}

function unchanged(document: TenantThemeDocumentAny): RawOverrideMigration {
  return { status: "unchanged", document, report: [] };
}

/**
 * Rewrites a v1 document into a v1 document without `advanced.tokenOverrides`.
 *
 * `unchanged` for a document that does not carry the field (any version);
 * `migrated` only when every entry folds or is resolved; `blocked` otherwise,
 * with the input returned untouched and every entry reported. Pure and
 * idempotent: its own output is `unchanged`.
 *
 * @throws ThemePatchMigrationError for an off-roster vertical, a malformed
 * container on the path it reads, or a `general` section the v1 door refuses.
 */
export function foldRawTokenOverrides(input: {
  vertical: FirstPartyVerticalId;
  document: TenantThemeDocumentAny;
  resolutions?: readonly RawOverrideResolution[];
}): RawOverrideMigration {
  if (!isFirstPartyVerticalId(input.vertical)) {
    throw new ThemePatchMigrationError(
      `${String(input.vertical)} is not a first-party vertical`
    );
  }
  const source: unknown = input.document;
  if (isTenantThemeDocumentVersioned(source) || !isV1AdvancedDocument(source)) {
    return unchanged(input.document);
  }
  const advanced = readAt(source, ["visualFoundation", "advanced"], "$");
  if (advanced === undefined) return unchanged(input.document);
  if (!isPlainObject(advanced)) {
    throw new ThemePatchMigrationError(
      `unsupported ${ADVANCED_PATH}; expected an object`
    );
  }
  const raw = advanced[RAW_FIELD];
  if (raw === undefined) return unchanged(input.document);
  if (!isPlainObject(raw)) {
    throw new ThemePatchMigrationError(`unsupported ${RAW_PATH}; expected an object`);
  }
  const rawValues = new Map<string, unknown>(Object.entries(raw));
  const general = readAt(source, ["visualFoundation", "general"], "$");
  if (general !== undefined && !isPlainObject(general)) {
    throw new ThemePatchMigrationError(
      `unsupported ${GENERAL_PATH}; expected an object`
    );
  }

  const resolutionsByToken = new Map<string, RawOverrideResolution[]>();
  for (const resolution of input.resolutions ?? []) {
    const named = resolutionsByToken.get(resolution.token);
    if (named) named.push(resolution);
    else resolutionsByToken.set(resolution.token, [resolution]);
  }

  const working = cloneJson(source);
  if (!isV1AdvancedDocument(working)) {
    throw new Error("raw override migration: the clone lost the document shape");
  }
  const workingFoundation: JsonObject = { ...working.visualFoundation };
  const workingGeneral: JsonObject = isPlainObject(workingFoundation.general)
    ? workingFoundation.general
    : {};

  const entries = new Map<string, RawOverrideReportEntry>();
  const candidates = new Map<string, { fold: RawOverrideFold; tokens: string[] }>();
  const replacements: {
    token: string;
    resolution: RawOverrideResolution;
    leaves: readonly (readonly [readonly string[], unknown])[];
  }[] = [];

  for (const token of [...rawValues.keys()].sort()) {
    const value = cloneJson(rawValues.get(token));
    const block = (
      outcome: RawOverrideBlockingOutcome,
      reason: string
    ): void => {
      entries.set(token, { token, value, outcome, reason });
    };
    const named = resolutionsByToken.get(token);
    if (named) {
      const verdict = judgeResolution(named);
      if (!verdict.ok) {
        block("invalid-resolution", verdict.reason);
        continue;
      }
      const [resolution] = named;
      if (resolution.action === "replace") {
        replacements.push({ token, resolution, leaves: verdict.leaves });
      }
      entries.set(token, {
        token,
        value,
        outcome: "resolved",
        action: resolution.action,
        note: resolution.note,
      });
      continue;
    }
    if (!LEAF_BY_TOKEN.has(token)) {
      block("off-allowlist", "not one of the tokens the v1 contract ever admitted");
      continue;
    }
    const issues = tenantThemeTokenOverrideIssues(Object.fromEntries([[token, rawValues.get(token)]]), RAW_PATH);
    if (issues.length > 0) {
      block("invalid-value", issueText(issues));
      continue;
    }
    const fold = RAW_OVERRIDE_FOLDS.get(token);
    if (!fold) {
      block("unrepresentable", unrepresentableReason(token));
      continue;
    }
    const group = candidates.get(fold.leaf);
    if (group) group.tokens.push(token);
    else candidates.set(fold.leaf, { fold, tokens: [token] });
  }

  const groups: FoldGroup[] = [];
  for (const { fold, tokens } of candidates.values()) {
    const to = `${GENERAL_PATH}.${fold.field.join(".")}`;
    const distinct = new Set(tokens.map((token) => canonical(rawValues.get(token))));
    if (distinct.size > 1) {
      for (const token of tokens) {
        entries.set(token, {
          token,
          value: cloneJson(rawValues.get(token)),
          outcome: "ambiguous",
          decision: fold.decision,
          to,
          reason:
            `${tokens.join(", ")} all write Theme leaf "${fold.leaf}" and disagree; ` +
            "stored key order does not say which one painted",
        });
      }
      continue;
    }
    const value = rawValues.get(tokens[0]);
    const issues: TenantThemeValidationIssue[] = [];
    validateTenantThemeNode(
      nested(fold.field, value),
      TENANT_THEME_GENERAL_SCHEMA,
      GENERAL_PATH,
      issues
    );
    if (issues.length > 0) {
      for (const token of tokens) {
        entries.set(token, {
          token,
          value,
          outcome: "unrepresentable",
          decision: fold.decision,
          to,
          reason: `the raw token admits this value and ${issueText(issues)}`,
        });
      }
      continue;
    }
    readAt(general, fold.field, GENERAL_PATH);
    groups.push({ fold, tokens, value });
  }

  const differs = (subset: readonly FoldGroup[]): boolean =>
    subset.length > 0 && !sameLowering(input.vertical, general, subset);
  const together = differs(groups);
  const routedAlone = together
    ? groups.filter((group) => differs([group]))
    : [];
  const sound = groups.filter((group) => !routedAlone.includes(group));
  const entangled = together && differs(sound);
  for (const group of groups) {
    const { fold, tokens, value } = group;
    const to = `${GENERAL_PATH}.${fold.field.join(".")}`;
    const alone = routedAlone.includes(group);
    if (alone || entangled) {
      for (const token of tokens) {
        entries.set(token, {
          token,
          value,
          outcome: "mode-routing",
          decision: fold.decision,
          to,
          reason: alone
            ? `on ${input.vertical} this document's ${to} does not lower to ` +
              `Theme leaf "${fold.leaf}", which is where the raw token paints`
            : "folded together with the other entries the lowering answers a different patch",
        });
      }
      continue;
    }
    const authored = readAt(general, fold.field, GENERAL_PATH);
    const over = authored !== undefined && canonical(authored) !== canonical(value);
    writeAt(workingGeneral, fold.field, value);
    workingFoundation.general = workingGeneral;
    for (const token of tokens) {
      entries.set(token, {
        token,
        value,
        outcome: over ? "folded-over-general" : "folded",
        decision: fold.decision,
        to,
        ...(over ? { replaced: cloneJson(authored) } : {}),
      });
    }
  }

  for (const { token, resolution, leaves } of replacements) {
    const wrote: string[] = [];
    const conflicts: string[] = [];
    for (const [path, value] of leaves) {
      const at = `${FOUNDATION_PATH}.${path.join(".")}`;
      let authored: unknown;
      try {
        authored = readAt(workingFoundation, path, FOUNDATION_PATH);
      } catch (error) {
        if (!(error instanceof ThemePatchMigrationError)) throw error;
        conflicts.push(`${at} crosses a value that is not an object`);
        continue;
      }
      if (authored !== undefined && canonical(authored) !== canonical(value)) {
        conflicts.push(`${at} already carries ${canonical(authored)}`);
        continue;
      }
      if (!writeAt(workingFoundation, path, cloneJson(value))) {
        conflicts.push(`${at} crosses a value that is not an object`);
        continue;
      }
      wrote.push(at);
    }
    entries.set(
      token,
      conflicts.length > 0
        ? {
            token,
            value: cloneJson(rawValues.get(token)),
            outcome: "invalid-resolution",
            reason: `the replacement would overwrite an authored value: ${conflicts.join("; ")}`,
          }
        : {
            token,
            value: cloneJson(rawValues.get(token)),
            outcome: "resolved",
            action: resolution.action,
            note: resolution.note,
            wrote,
          }
    );
  }

  const folded = groups.filter(({ tokens }) => {
    const outcome = entries.get(tokens[0])?.outcome;
    return outcome === "folded" || outcome === "folded-over-general";
  });
  const rewritten = replacements.flatMap(({ leaves }) =>
    leaves.filter(([path]) => path[0] === "general")
  );
  if (folded.length > 0 && rewritten.length > 0) {
    const resolved = cloneJson(general ?? {});
    if (!isPlainObject(resolved)) {
      throw new Error("raw override migration: the clone lost the general block");
    }
    for (const [path, value] of rewritten) {
      writeAt(resolved, path.slice(1), cloneJson(value));
    }
    if (!sameLowering(input.vertical, resolved, folded)) {
      for (const { fold, tokens, value } of folded) {
        for (const token of tokens) {
          entries.set(token, {
            token,
            value,
            outcome: "mode-routing",
            decision: fold.decision,
            to: `${GENERAL_PATH}.${fold.field.join(".")}`,
            reason:
              "a replacement in this run changes where the folded entries lower; " +
              "with it the lowering answers a different patch",
          });
        }
      }
    }
  }

  const report = [...entries.values()].sort((left, right) =>
    left.token < right.token ? -1 : left.token > right.token ? 1 : 0
  );
  if (report.some((entry) => BLOCKING.has(entry.outcome))) {
    return { status: "blocked", document: input.document, report };
  }

  const workingAdvanced = workingFoundation.advanced;
  if (isPlainObject(workingAdvanced)) {
    const kept = Object.fromEntries(
      Object.entries(workingAdvanced).filter(([key]) => key !== RAW_FIELD)
    );
    if (Object.keys(kept).length > 0) workingFoundation.advanced = kept;
    else delete workingFoundation.advanced;
  }
  const migrated: unknown = { ...working, visualFoundation: workingFoundation };
  if (!isV1AdvancedDocument(migrated)) {
    throw new Error("raw override migration: the fold lost the document shape");
  }
  return { status: "migrated", document: migrated, report };
}
