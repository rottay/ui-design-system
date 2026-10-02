// Type declarations for the plain-ESM dead-anchor classifier so a Playwright
// spec or any TS consumer imports it with real types (no @ts-expect-error).

import type { SkinRule } from './skin-rule-coverage.lib.mjs';

export type ResolvedName = { name: string; kind: 'prop' | 'state' | 'param' | 'field' | 'local' | 'free' };

export type Condition = {
  kind: 'and' | 'or' | 'ternary' | 'if' | 'early-return' | 'switch' | 'iteration' | 'lookup' | 'class-value' | 'tag' | 'mount' | 'unknown';
  text: string;
  file: string;
  line: number;
  names: ResolvedName[];
  gates: boolean;
  /** A class anchor's element-level condition: the element's, not the class's (never gates the class). */
  element?: boolean;
};

export type ClassSet = { present: Set<string>; complete: boolean };

/** A host tag bound to a typed prop (`const Component = as`): its declared intrinsic union and default. */
export type PropTag = { prop: string; values: string[]; def: string; file: string; line: number };

/** An intrinsic element: `tags` it can render as (null when only `tagPrefix` is known), and its opening tag node. */
export type ElementShape = {
  kind: 'el';
  tag: string;
  tags?: string[] | null;
  tagPrefix?: string | null;
  tagProp?: PropTag | null;
  part: string | null;
  classes: ClassSet;
  at?: unknown;
};

export type ChainSibling = (ElementShape & { optional: boolean }) | { kind: 'opaque'; optional: boolean };

/** One level of a stamp's JSX ancestry, host first. */
export type ChainEntry =
  | (ElementShape & { siblings?: ChainSibling[]; file?: string; container?: boolean })
  | { kind: 'component'; tag: string; passed: { names: Set<string>; spread: boolean }; siblings?: ChainSibling[]; file?: string; container?: boolean }
  | { kind: 'prop'; tag: string; prop: string | null; file: string; line: number; passed: { names: Set<string>; spread: boolean }; siblings?: ChainSibling[] }
  | { kind: 'portal'; via: string; siblings?: ChainSibling[] };

/** `hostAttr`: the JSX attribute the path enters its host through (`className`, `data-state`, ...), when known. */
export type RenderPath = { conditions: Condition[]; end: string; chain: ChainEntry[]; hostAt: number | null; hostAttr?: string | null };

export type StampSite = {
  file: string;
  /** A data-part, or `.class` for a class anchor. */
  part: string;
  kind: 'part' | 'class';
  /** A class anchor's producing literal, template prefix, recipe call (`r.resolve`) or pair-table key. */
  match?: string;
  via: 'data-part' | 'part' | 'partAttributes' | 'd3-attr' | 'data-part-prop' | 'className' | 'recipe-slot' | 'class-window';
  /** A class site read as a class-only row's subject (the element's own gates count). */
  full?: boolean;
  lands: boolean;
  host: string | null;
  line: number;
  paths: RenderPath[];
};

export type Census = {
  root: string;
  files: Map<string, { src: string; gateParts: Set<string> }>;
  global: Map<string, Set<string>>;
  srcRoot: string;
  sitesOf(file: string): StampSite[];
};

export type EvidenceCondition = Pick<Condition, 'text' | 'kind' | 'line' | 'names'>;

export type StampEvidence = {
  file: string;
  line: number;
  via: StampSite['via'];
  kind: 'part' | 'class';
  match: string;
  paths: number;
  required: EvidenceCondition[];
  anyOf: EvidenceCondition[][];
};

export type ClassifiedRow = {
  file: string;
  selector: string;
  parts: string[];
  owner?: string;
  class: 'TRUE_DEAD' | 'CONDITIONAL';
  /** A TRUE_DEAD row whose selector the composition can never satisfy, or an orphan class: a skin bug, not a component defect. */
  verdict?: 'dead-rule';
  reason: string;
  conditionNames?: string[];
  evidence?: Array<{ part: string; stamps: StampEvidence[] }>;
};

export type ConditionalPart = {
  owner: string;
  part: string;
  stamps: StampEvidence[];
  rows: number;
  skinFiles: string[];
};

/** `witnesses`: one condition-key set per credited live anchor, each proven on one instance; `atRest` is their union (labels only). */
export type PositiveControl = { atRest: Set<string>; witnesses: Set<string>[]; forwardingHosts: Set<string> };

export type AnchorTree = { parts: string[]; classes: string[]; groups: AnchorTree[][] };

export type DeadSelectorReport = {
  deadAnchors?: Array<{ file: string; selectors: string[] }>;
  unappliableRules?: Array<{ file: string; selector: string }>;
  invalidSelectors?: Array<{ file: string; selector: string }>;
};

export const COMPONENTS_ROOT: string;
export const REPORT_PATH: string;
export function listSources(root?: string): string[];
export function buildCensus(root?: string): Census;
export function anchorParts(selector: string): string[];
export function anchorTree(skeleton: string): AnchorTree;
export function requiredAnchors(tree: AnchorTree): { parts: Set<string>; classes: Set<string> };
export function ownerSites(census: Census, files: string[], part: string): { sites: StampSite[]; unlocatable: string[] };
export const conditionKey: (c: Pick<Condition, 'file' | 'line' | 'text'>) => string;
export const pathGated: (p: RenderPath, control?: Set<string> | PositiveControl) => boolean;
export function resolveOwner(census: Census, skinFile: string, selector: string): { dir: string | null; leading: string | null; reason?: string };
export function ownerFiles(census: Census, dir: string, engine: string): string[];
export function positiveControl(census: Census, liveRows: Array<{ file: string; selector: string }>): PositiveControl;
export function liveRowsOf(report: DeadSelectorReport, rules: Array<Pick<SkinRule, 'engine' | 'file' | 'selector'>>): Array<{ file: string; selector: string }>;
export function classifyRow(census: Census, skinFile: string, selector: string, control?: PositiveControl): ClassifiedRow;
export function classifyReport(
  report: DeadSelectorReport,
  options?: { census?: Census; rules?: Array<Pick<SkinRule, 'engine' | 'file' | 'selector'>> },
): { rows: ClassifiedRow[]; trueDead: ClassifiedRow[]; conditional: ClassifiedRow[]; conditionalParts: ConditionalPart[]; control: PositiveControl };
export function loadReport(path?: string): DeadSelectorReport;
