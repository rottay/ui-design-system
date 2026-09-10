import { describe, expect, it } from "vitest";

import {
  THEME_DECISION_IDS,
  type ThemeDecisionId,
} from "@/contracts/theme/foundation/decisions";
import {
  assertTenantThemeDocumentV2,
  type TenantThemeDocumentV2,
} from "@/contracts/theme/presentation/document";
import {
  THEME_CONTROL_CATALOG,
  THEME_CONTROL_GROUPS,
  type ThemeControlGroup,
} from "@/contracts/theme/runtime/catalog";
import { sha256Utf8 } from "@/foundation/kernel/cryptography/sha-256";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import { documentThemeAdmission } from "@/infrastructure/compilers/runtime/theme";

import {
  BITHIRE_IDENTITY_CANDIDATES,
  type BitHireIdentityCandidate,
} from "..";

/**
 * The by-axis difference probe of WO-DER-07.
 *
 * One question per pair and per kit axis: with every other decision held equal,
 * how many compiled channels does this axis alone move between two candidates?
 * Attribution is by CONSTRUCTION -- each arm carries only that axis's decisions
 * -- so a difference can never be a palette effect wearing another axis's name,
 * and the colour arm is measured the same way, which makes the kit's rule-4
 * negative test a measurement rather than a promise.
 *
 * It measures COMPILED CHANNELS, not browser computed style: the Playwright
 * computed-style instrument of kit rule 4 is WO-EVI-05 and does not exist yet.
 */
const COLOR_AXIS: ThemeControlGroup = "color";
const NON_COLOR_AXES = THEME_CONTROL_GROUPS.filter((group) => group !== COLOR_AXIS);
const REQUIRED_DIFFERING_AXES = 4;

function axisDecisionIds(group: ThemeControlGroup): readonly ThemeDecisionId[] {
  return THEME_CONTROL_CATALOG.filter((row) => row.group === group).map((row) => row.id);
}

function documentOf(candidate: BitHireIdentityCandidate): TenantThemeDocumentV2 {
  return assertTenantThemeDocumentV2(candidate.document);
}

function armDocument(
  candidate: BitHireIdentityCandidate,
  group: ThemeControlGroup
): TenantThemeDocumentV2 {
  const authored = documentOf(candidate).decisions;
  const decisions: Record<string, unknown> = {};
  for (const id of axisDecisionIds(group)) {
    const value = authored[id];
    if (value !== undefined) decisions[id] = value;
  }
  return {
    version: 2,
    plan: "pro",
    decisions: decisions as TenantThemeDocumentV2["decisions"],
  };
}

function channelsOf(document: TenantThemeDocumentV2): Readonly<Record<string, string>> {
  return compileTenantThemeDocumentV2({
    document,
    tenantId: "wo-der-07-probe",
    slug: "bithire-axis-probe",
    verticalKey: "bithire",
    rowVersion: 1,
  }).artifact.variables;
}

function movedChannels(
  left: Readonly<Record<string, string>>,
  right: Readonly<Record<string, string>>
): readonly string[] {
  const names = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...names].filter((name) => left[name] !== right[name]).sort();
}

const EMPTY_ARM: TenantThemeDocumentV2 = { version: 2, plan: "pro", decisions: {} };

interface PairDifference {
  readonly left: string;
  readonly right: string;
  readonly byAxis: ReadonlyMap<ThemeControlGroup, readonly string[]>;
  readonly differingNonColorAxes: readonly ThemeControlGroup[];
}

interface AxisProbeReport {
  readonly pairs: readonly PairDifference[];
  /** Kit rule 4: a colour-only difference must move nothing a non-colour axis owns. */
  readonly colorLeaks: readonly string[];
}

function runAxisProbe(): AxisProbeReport {
  const baseline = channelsOf(EMPTY_ARM);
  const arms = new Map<string, Readonly<Record<string, string>>>();
  for (const candidate of BITHIRE_IDENTITY_CANDIDATES) {
    for (const group of THEME_CONTROL_GROUPS) {
      arms.set(`${candidate.id}:${group}`, channelsOf(armDocument(candidate, group)));
    }
  }

  const pairs: PairDifference[] = [];
  const colorLeaks: string[] = [];

  BITHIRE_IDENTITY_CANDIDATES.forEach((left, index) => {
    for (const right of BITHIRE_IDENTITY_CANDIDATES.slice(index + 1)) {
      const byAxis = new Map<ThemeControlGroup, readonly string[]>(
        THEME_CONTROL_GROUPS.map((axis) => [
          axis,
          movedChannels(arms.get(`${left.id}:${axis}`) ?? {}, arms.get(`${right.id}:${axis}`) ?? {}),
        ])
      );

      const colorDelta = new Set(byAxis.get(COLOR_AXIS) ?? []);
      for (const axis of NON_COLOR_AXES) {
        const reach = new Set([
          ...movedChannels(baseline, arms.get(`${left.id}:${axis}`) ?? {}),
          ...movedChannels(baseline, arms.get(`${right.id}:${axis}`) ?? {}),
        ]);
        for (const channel of colorDelta) {
          if (reach.has(channel)) colorLeaks.push(`${left.id}/${right.id} ${axis} ${channel}`);
        }
      }

      pairs.push({
        left: left.id,
        right: right.id,
        byAxis,
        differingNonColorAxes: NON_COLOR_AXES.filter(
          (axis) => (byAxis.get(axis)?.length ?? 0) > 0
        ),
      });
    }
  });

  return { pairs, colorLeaks };
}

function table(report: AxisProbeReport): string {
  const header = ["pair", ...THEME_CONTROL_GROUPS, "non-colour axes"].join(" | ");
  const rows = report.pairs.map((pair) =>
    [
      `${pair.left} vs ${pair.right}`,
      ...THEME_CONTROL_GROUPS.map((group) => `${pair.byAxis.get(group)?.length ?? 0}`),
      `${pair.differingNonColorAxes.length}/${NON_COLOR_AXES.length}`,
    ].join(" | ")
  );
  return [header, ...rows].join("\n");
}

function channelDetail(report: AxisProbeReport, limit = 10): string {
  return report.pairs
    .flatMap((pair) => [
      `${pair.left} vs ${pair.right}`,
      ...NON_COLOR_AXES.map((axis) => {
        const moved = pair.byAxis.get(axis) ?? [];
        const shown = moved.slice(0, limit).join(", ");
        const rest = moved.length > limit ? ` (+${moved.length - limit} more)` : "";
        return `  ${axis} (${moved.length}): ${shown || "-"}${rest}`;
      }),
    ])
    .join("\n");
}

describe("WO-DER-07 BitHire identity candidates", () => {
  it("states every decision of the kit, with no raw channel and no override", () => {
    expect(BITHIRE_IDENTITY_CANDIDATES).toHaveLength(3);
    for (const candidate of BITHIRE_IDENTITY_CANDIDATES) {
      const document = documentOf(candidate);
      expect(Object.keys(document.decisions).sort()).toEqual([...THEME_DECISION_IDS].sort());
      expect(JSON.stringify(document)).not.toContain("--ds-");
      expect(document.overrides).toBeUndefined();
    }
  });

  it("passes admission as a pro document and compiles through the one door", () => {
    for (const candidate of BITHIRE_IDENTITY_CANDIDATES) {
      const document = documentOf(candidate);
      const { admission, intent } = documentThemeAdmission({
        vertical: "bithire",
        slug: candidate.slug,
        document,
      });
      expect(admission.version).toBe(2);
      expect(intent.entitlement?.plan).toBe("pro");
      expect(admission.decisions).toHaveLength(THEME_DECISION_IDS.length);

      const { artifact } = compileTenantThemeDocumentV2({
        document,
        tenantId: `wo-der-07-${candidate.id}`,
        slug: candidate.slug,
        verticalKey: "bithire",
        rowVersion: 1,
      });
      expect(artifact.slug).toBe(candidate.slug);
      expect(Object.keys(artifact.variables).length).toBeGreaterThan(0);

      console.log(
        `${candidate.id} digest=sha256-${sha256Utf8(JSON.stringify(document))} ` +
          `channels=${Object.keys(artifact.variables).length} ` +
          `unlit=${admission.unlit.map((row) => row.id).join(",") || "none"}`
      );
    }
  });

  it("differs on at least four non-colour axes for every pair", () => {
    const report = runAxisProbe();
    console.log(`${table(report)}\n${channelDetail(report)}`);
    for (const pair of report.pairs) {
      expect(
        pair.differingNonColorAxes.length,
        `${pair.left} vs ${pair.right}: ${pair.differingNonColorAxes.join(",")}`
      ).toBeGreaterThanOrEqual(REQUIRED_DIFFERING_AXES);
    }
  });

  it("moves nothing a non-colour axis owns when only the palette changes", () => {
    expect(runAxisProbe().colorLeaks).toEqual([]);
  });
});
