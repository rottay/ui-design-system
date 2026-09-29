// Type declarations for the plain-ESM dead-anchor classifier so a Playwright
// spec or any TS consumer imports it with real types (no @ts-expect-error).

import type { SkinRule } from './skin-rule-coverage.lib.mjs';

export type ResolvedName = { name: string; kind: 'prop' | 'state' | 'param' | 'field' | 'local' | 'free' };

export type Condition = {
  kind: 'and' | 'or' | 'ternary' | 'if' | 'early-return' | 'switch' | 'iteration';
  text: string;
  file: string;
  line: number;
  names: ResolvedName[];
  gates: boolean;
};

export type RenderPath = { conditions: Condition[]; end: string };

export type StampSite = {
  file: string;
  part: string;
  via: 'data-part' | 'part' | 'partAttributes' | 'd3-attr' | 'data-part-prop';
  lands: boolean;
  host: string | null;
  line: number;
  paths: RenderPath[];
};

export type Census = {
  root: string;
  files: Map<string, { src: string; gateParts: Set<string> }>;
  global: Map<string, Set<string>>;
  sitesOf(file: string): StampSite[];
};

export type EvidenceCondition = Pick<Condition, 'text' | 'kind' | 'line' | 'names'>;

export type StampEvidence = {
  file: string;
  line: number;
  via: StampSite['via'];
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

export type PositiveControl = { atRest: Set<string>; forwardingHosts: Set<string> };

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
