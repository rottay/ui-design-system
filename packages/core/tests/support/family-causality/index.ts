/**
 * @fileoverview Computed-style causality probes for a family cut.
 *
 * A probe compiles the same vertical twice through the productive door
 * (`documentThemeIntent` -> `compileThemeIntent` -> `emitThemeCss`), loads the
 * resolved source stylesheet plus one compiled arm into a real Chromium page,
 * mounts the family's own server markup and reads computed style back. A
 * decision is causal for a family when its arm moves the family's paint and a
 * negative control does not move.
 *
 * @module Tests/Support/family-causality
 */

import { existsSync, readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

import {
  compileThemeIntent,
  documentThemeIntent,
  emitThemeCss,
  firstPartyScope,
  mountTenantTheme,
  staticThemeIntent,
} from '@/entrypoints/server';

const CORE_ROOT = resolve(__dirname, '../../..');
const BASE_ENTRY = resolve(CORE_ROOT, 'src/foundation/tokens/css/facade/entrypoints/base/index.css');

export type ProbeVertical = 'rottay' | 'bithire' | 'evnto';

/** A document v2 decision map, keyed by catalog id. */
export type ProbeDecisions = Readonly<Record<string, unknown>>;

export interface ProbeTarget {
  /** Stable name of the reading. */
  readonly id: string;
  /** Selector inside the mounted markup. */
  readonly selector: string;
  /** Computed property to read, in CSS spelling; `@rect.<key>` reads the element box instead. */
  readonly property: string;
  /** Attributes stamped before reading, e.g. `data-state`. */
  readonly attributes?: Readonly<Record<string, string>>;
  /** Selector of the element that receives `attributes`; the target itself when absent. */
  readonly attributesOn?: string;
  /** Direction of the probe host. */
  readonly dir?: 'ltr' | 'rtl';
}

export interface ProbeEnvironment {
  readonly reducedMotion?: 'reduce' | 'no-preference';
  readonly forcedColors?: 'active' | 'none';
  /** A touch device: `(pointer: coarse)` and `(hover: none)` match. */
  readonly touch?: boolean;
}

export interface ProbeRequest {
  readonly vertical: ProbeVertical;
  readonly markup: string;
  readonly arms: Readonly<Record<string, ProbeDecisions>>;
  readonly targets: readonly ProbeTarget[];
  readonly plan?: 'standard' | 'pro';
  readonly environment?: ProbeEnvironment;
}

export type ProbeReadings = Record<string, Record<string, string>>;

function resolveImports(css: string, baseDir: string): string {
  return css.replace(
    /@import\s+['"](\.[^'"]+)['"]\s*(layer\([^)]+\))?\s*;/g,
    (match, importPath: string, layerDirective: string | undefined) => {
      const fullPath = resolve(baseDir, importPath);
      if (!existsSync(fullPath)) return `/* unresolved: ${match} */`;
      const content = resolveImports(readFileSync(fullPath, 'utf8'), dirname(fullPath));
      if (!layerDirective) return content;
      return `@layer ${layerDirective.slice('layer('.length, -1)} {\n${content}\n}`;
    },
  );
}

let baseCss: string | undefined;

/** The tenant-free stylesheet exactly as the bundle build resolves it, read from source. */
export function resolvedBaseCss(): string {
  baseCss ??= resolveImports(readFileSync(BASE_ENTRY, 'utf8'), dirname(BASE_ENTRY));
  return baseCss;
}

export interface MountedArm {
  readonly rootAttributes: Readonly<Record<string, string>>;
  readonly css: string;
}

/**
 * One arm: the root attributes the server mount projects for the vertical, and
 * the CSS the productive door compiles for the vertical plus the arm's decisions.
 */
export async function mountArm(
  vertical: ProbeVertical,
  decisions: ProbeDecisions,
  plan: 'standard' | 'pro' = 'pro',
): Promise<MountedArm> {
  const intent = documentThemeIntent({
    vertical,
    slug: vertical,
    document: { version: 2, plan, decisions } as never,
  });
  const { compiled } = compileThemeIntent(intent);
  const mounted = await mountTenantTheme(staticThemeIntent(vertical));
  return {
    rootAttributes: mounted.rootAttributes,
    css: emitThemeCss(compiled, firstPartyScope(vertical)),
  };
}

/** The surface a consumer mounts a family on: the canvas ground and its ink. */
const SURFACE_STYLE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;';

interface ChromiumLike {
  launch(): Promise<{
    newContext(options?: { hasTouch?: boolean; isMobile?: boolean }): Promise<{
      newPage(): Promise<ProbePage>;
    }>;
    close(): Promise<void>;
  }>;
}

interface ProbePage {
  setContent(html: string): Promise<void>;
  addStyleTag(options: { content: string }): Promise<unknown>;
  addScriptTag(options: { content: string }): Promise<unknown>;
  emulateMedia(options: { reducedMotion?: string; forcedColors?: string }): Promise<void>;
  evaluate<R, A>(fn: (arg: A) => R, arg: A): Promise<R>;
  close(): Promise<void>;
}

function resolveChromium(): ChromiumLike {
  const roots = [
    resolve(CORE_ROOT, 'package.json'),
    resolve(CORE_ROOT, '../../package.json'),
    resolve(CORE_ROOT, '../showroom/package.json'),
  ];
  for (const root of roots) {
    for (const specifier of ['playwright', '@playwright/test']) {
      try {
        const module = createRequire(root)(specifier) as { chromium?: ChromiumLike };
        if (module.chromium) return module.chromium;
      } catch {
        // try the next resolution root
      }
    }
  }
  throw new Error('family-causality: no Playwright chromium is resolvable from core, the workspace or showroom');
}

/** Measure every target under every arm, one fresh page per arm. */
export async function measureArms(request: ProbeRequest): Promise<ProbeReadings> {
  const browser = await resolveChromium().launch();
  const readings: ProbeReadings = {};
  try {
    const environment = request.environment ?? {};
    const context = await browser.newContext(
      environment.touch ? { hasTouch: true, isMobile: true } : {},
    );
    const base = resolvedBaseCss();
    for (const [label, decisions] of Object.entries(request.arms)) {
      const page = await context.newPage();
      await page.emulateMedia({
        reducedMotion: environment.reducedMotion ?? 'no-preference',
        forcedColors: environment.forcedColors ?? 'none',
      });
      await page.setContent('<!doctype html><html><head></head><body></body></html>');
      const arm = await mountArm(request.vertical, decisions, request.plan);
      await page.addStyleTag({ content: base });
      await page.addStyleTag({ content: arm.css });
      readings[label] = await page.evaluate(
        ({ markup, targets, rootAttributes, surface }) => {
          for (const [name, value] of Object.entries(rootAttributes)) {
            document.documentElement.setAttribute(name, value);
          }
          const values: Record<string, string> = {};
          for (const target of targets) {
            const host = document.createElement('div');
            host.setAttribute('style', surface);
            host.setAttribute('dir', target.dir ?? 'ltr');
            host.innerHTML = markup;
            document.body.append(host);
            const element = host.querySelector(target.selector);
            if (!element) {
              values[target.id] = `<no match: ${target.selector}>`;
            } else {
              const stamped = target.attributesOn ? host.querySelector(target.attributesOn) ?? element : element;
              for (const [name, value] of Object.entries(target.attributes ?? {})) {
                stamped.setAttribute(name, value);
              }
              values[target.id] = target.property.startsWith('@rect.')
                ? String(Math.round(element.getBoundingClientRect()[target.property.slice(6) as 'left']))
                : getComputedStyle(element).getPropertyValue(target.property);
            }
            host.remove();
          }
          return values;
        },
        { markup: request.markup, targets: request.targets, rootAttributes: arm.rootAttributes, surface: SURFACE_STYLE },
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return readings;
}

/**
 * One offending node, identified by the key that survives a re-render.
 *
 * `target` is axe's own CSS path to the node. It is the most stable identity
 * this harness can capture: `html` changes with any attribute or text edit, and
 * the failure summary changes with every colour move, while the path only
 * changes when the MARKUP changes -- and the markup of a causality suite is a
 * fixed string in the suite itself. Its failure mode is the mirror of that: two
 * nodes that swap positions in the same container swap identities, and an
 * inserted sibling shifts every `:nth-child` after it. Both are edits to the
 * suite's own markup, which is exactly when a debt pin SHOULD be re-measured.
 */
export interface AxeFindingNode {
  /** axe's CSS path, joined when the node is inside a shadow/iframe chain. */
  readonly target: string;
  /** The ink and ground axe measured, when the rule reports them. */
  readonly foreground?: string;
  readonly background?: string;
  readonly ratio?: number;
}

export interface AxeFinding {
  readonly id: string;
  readonly impact: string | null;
  readonly nodes: number;
  /** Every offending node, in axe's order; the identity a debt pin compares. */
  readonly targets: readonly AxeFindingNode[];
  /** The first offending node's markup and axe's own summary of it. */
  readonly sample?: string;
}

export interface AxeRequest {
  readonly vertical: ProbeVertical;
  readonly markup: string;
  readonly decisions?: ProbeDecisions;
  readonly dir?: 'ltr' | 'rtl';
  /** Overrides the mount's declared mode, to audit the vertical's other mode. */
  readonly theme?: 'light' | 'dark';
}

/** axe-core over the family's markup, painted by the source stylesheet and one compiled arm. */
export async function auditAxe(request: AxeRequest): Promise<AxeFinding[]> {
  const axeSource = readFileSync(createRequire(resolve(CORE_ROOT, 'package.json')).resolve('axe-core'), 'utf8');
  const browser = await resolveChromium().launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const arm = await mountArm(request.vertical, request.decisions ?? {});
    await page.setContent('<!doctype html><html lang="en"><head><title>probe</title></head><body></body></html>');
    await page.addStyleTag({ content: resolvedBaseCss() });
    await page.addStyleTag({ content: arm.css });
    await page.addScriptTag({ content: axeSource });
    const findings = await page.evaluate(
      async ({ markup, rootAttributes, surface, dir }) => {
        for (const [name, value] of Object.entries(rootAttributes)) {
          document.documentElement.setAttribute(name, value);
        }
        const main = document.createElement('main');
        main.setAttribute('style', surface);
        main.setAttribute('dir', dir);
        main.innerHTML = markup;
        document.body.append(main);
        type CheckResult = { data?: { fgColor?: string; bgColor?: string; contrastRatio?: number } };
        type ViolationNode = {
          html: string;
          failureSummary?: string;
          target?: unknown[];
          any?: CheckResult[];
          all?: CheckResult[];
          none?: CheckResult[];
        };
        type Violation = { id: string; impact: string | null; nodes: ViolationNode[] };
        const runner = (window as unknown as { axe: { run(node: Element): Promise<{ violations: Violation[] }> } }).axe;
        const result = await runner.run(main);
        const pathOf = (node: ViolationNode): string =>
          (node.target ?? [])
            .map((entry) => (Array.isArray(entry) ? entry.join(' ') : String(entry)))
            .join(' >>> ');
        const dataOf = (node: ViolationNode) =>
          [...(node.any ?? []), ...(node.all ?? []), ...(node.none ?? [])]
            .map((check) => check.data)
            .find((data) => data?.fgColor !== undefined || data?.bgColor !== undefined);
        return result.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.length,
          targets: violation.nodes.map((node) => {
            const data = dataOf(node);
            return {
              target: pathOf(node),
              ...(data?.fgColor === undefined ? {} : { foreground: data.fgColor }),
              ...(data?.bgColor === undefined ? {} : { background: data.bgColor }),
              ...(data?.contrastRatio === undefined ? {} : { ratio: data.contrastRatio }),
            };
          }),
          sample: `${violation.nodes[0]?.html ?? ''} :: ${violation.nodes[0]?.failureSummary ?? ''}`,
        }));
      },
      {
        markup: request.markup,
        rootAttributes: request.theme ? { ...arm.rootAttributes, 'data-theme': request.theme } : arm.rootAttributes,
        surface: SURFACE_STYLE,
        dir: request.dir ?? 'ltr',
      },
    );
    await page.close();
    return findings;
  } finally {
    await browser.close();
  }
}

/**
 * The axe scopes a family cut must hold: each vertical in its declared mode,
 * plus bithire in both modes (the owner's Modern x bithire scope).
 */
export const AXE_SCOPES: ReadonlyArray<{ vertical: ProbeVertical; theme: 'light' | 'dark' }> = [
  { vertical: 'rottay', theme: 'dark' },
  { vertical: 'bithire', theme: 'light' },
  { vertical: 'bithire', theme: 'dark' },
  { vertical: 'evnto', theme: 'light' },
];

/** The findings axe classifies as serious or critical. */
export function seriousFindings(findings: readonly AxeFinding[]): AxeFinding[] {
  return findings.filter((finding) => finding.impact === 'serious' || finding.impact === 'critical');
}

/** One scope's accepted debt: every failing rule, and WHICH nodes fail it. */
export type AxeDebt = Readonly<Record<string, readonly string[]>>;

/**
 * The shape a debt pin compares: rule id -> the sorted identities of its nodes.
 *
 * A count is not an identity. A pin that only counts stays green when one known
 * bad node is repaired and a different, previously good node starts failing the
 * same rule -- the substitution the EVI-02 audit proved this harness allowed.
 * Comparing the SET makes all four moves red: a new node, a repaired node (debt
 * improving is still a change that must be re-adjudicated), a same-count swap,
 * and a finding of any other rule, which arrives as a key the pin does not have.
 *
 * A clean scope is `{}`, so a scope that goes dirty fails against its own pin
 * without needing an entry.
 */
export function axeDebt(findings: readonly AxeFinding[]): AxeDebt {
  const debt: Record<string, string[]> = {};
  for (const finding of findings) {
    debt[finding.id] = [...finding.targets.map((node) => node.target)].sort();
  }
  return debt;
}

export interface DecisionArm {
  /** The document v2 value the arm states for the decision. */
  readonly value: unknown;
  /** Reading ids the decision must move. */
  readonly moves: readonly string[];
  /** A reading id the decision must leave untouched. */
  readonly holds: string;
  /** Verticals in which the family reads the decision; a vertical's own chrome may outrank it elsewhere. */
  readonly in: readonly ProbeVertical[];
}

export interface CausalitySpec {
  readonly family: string;
  readonly markup: string;
  readonly targets: readonly ProbeTarget[];
  readonly decisions: Readonly<Record<string, DecisionArm>>;
}

export const FIRST_PARTY_VERTICALS: readonly ProbeVertical[] = ['rottay', 'bithire', 'evnto'];

/** One case per decision: its arm moves what it claims and holds its control, per vertical. */
export function describeCausality(spec: CausalitySpec): void {
  const readings: Partial<Record<ProbeVertical, ProbeReadings>> = {};
  describe(`${spec.family} causality`, () => {
    beforeAll(async () => {
      const arms = Object.fromEntries([
        ['base', {}],
        ...Object.entries(spec.decisions).map(([id, arm]) => [id, { [id]: arm.value }]),
      ]);
      const verticals = new Set(Object.values(spec.decisions).flatMap((arm) => arm.in));
      for (const vertical of verticals) {
        readings[vertical] = await measureArms({ vertical, markup: spec.markup, arms, targets: spec.targets });
      }
    }, 240_000);

    for (const [decision, arm] of Object.entries(spec.decisions)) {
      it(`${decision} moves ${arm.moves.join(', ')} and holds ${arm.holds}`, () => {
        for (const vertical of arm.in) {
          const base = readings[vertical]!.base!;
          const moved = readings[vertical]![decision]!;
          for (const id of arm.moves) {
            expect(base[id], `${vertical}: ${id} has a reading`).not.toMatch(/^<no match/);
            expect(moved[id], `${vertical}: ${id}`).not.toBe(base[id]);
          }
          expect(moved[arm.holds], `${vertical}: control ${arm.holds}`).toBe(base[arm.holds]);
        }
      });
    }
  });
}
