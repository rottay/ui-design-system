/**
 * @fileoverview The by-axis difference probe for the WO-DER-07 candidates.
 *
 * It answers one question per pair and per kit axis: with every other decision
 * held equal, how many compiled channels does this axis alone move between two
 * candidates? Attribution is by CONSTRUCTION -- each arm is a document carrying
 * only that axis's decisions -- so a difference can never be a palette effect
 * wearing another axis's name, and the colour arm is measured the same way so
 * the negative control is a measurement rather than a promise.
 *
 * It measures COMPILED CHANNELS, not browser computed style: the Playwright
 * computed-style instrument of the kit's rule 4 is WO-EVI-05 and does not exist
 * yet. These are the values that instrument would resolve.
 *
 * @module Foundation/Presets/Candidates/Bithire/Probe
 * @category Types
 * @package @rottay/design-system
 */

import type { ThemeDecisionId } from "@/contracts/theme/foundation/decisions";
import {
  THEME_CONTROL_CATALOG,
  THEME_CONTROL_GROUPS,
  type ThemeControlGroup,
} from "@/contracts/theme/runtime/catalog";
import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";

import {
  BITHIRE_IDENTITY_CANDIDATES,
  type BitHireCandidateId,
  type BitHireIdentityCandidate,
} from "../documents";

/** The kit's own grouping; the probe never invents an axis vocabulary. */
export const COLOR_AXIS: ThemeControlGroup = "color";

export const NON_COLOR_AXES: readonly ThemeControlGroup[] = Object.freeze(
  THEME_CONTROL_GROUPS.filter((group) => group !== COLOR_AXIS)
);

export function axisDecisionIds(
  group: ThemeControlGroup
): readonly ThemeDecisionId[] {
  return THEME_CONTROL_CATALOG.filter((row) => row.group === group).map(
    (row) => row.id
  );
}

function armDocument(
  candidate: BitHireIdentityCandidate,
  group: ThemeControlGroup
): TenantThemeDocumentV2 {
  const decisions: Record<string, unknown> = {};
  for (const id of axisDecisionIds(group)) {
    const value = candidate.document.decisions[id];
    if (value !== undefined) decisions[id] = value;
  }
  return {
    version: 2,
    plan: candidate.document.plan,
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

export interface AxisDifference {
  readonly axis: ThemeControlGroup;
  readonly decisions: readonly ThemeDecisionId[];
  /** Channels this axis alone moves between the two candidates. */
  readonly channels: readonly string[];
}

export interface CandidatePairDifference {
  readonly left: BitHireCandidateId;
  readonly right: BitHireCandidateId;
  readonly axes: readonly AxisDifference[];
  /** Non-colour axes with at least one moved channel. */
  readonly differingNonColorAxes: readonly ThemeControlGroup[];
}

export interface AxisProbeReport {
  readonly pairs: readonly CandidatePairDifference[];
  /**
   * The kit's rule-4 negative test: a colour-only difference must move nothing
   * that any non-colour axis moves. Each entry is a leak, so an empty list is
   * the passing result.
   */
  readonly colorLeaks: readonly {
    readonly left: BitHireCandidateId;
    readonly right: BitHireCandidateId;
    readonly axis: ThemeControlGroup;
    readonly channels: readonly string[];
  }[];
}

function pairs(): readonly (readonly [BitHireIdentityCandidate, BitHireIdentityCandidate])[] {
  const rows = BITHIRE_IDENTITY_CANDIDATES;
  return rows.flatMap((left, index) =>
    rows.slice(index + 1).map((right) => [left, right] as const)
  );
}

export function runBitHireAxisProbe(): AxisProbeReport {
  const baseline = channelsOf(EMPTY_ARM);
  const arm = new Map<string, Readonly<Record<string, string>>>();
  for (const candidate of BITHIRE_IDENTITY_CANDIDATES) {
    for (const group of THEME_CONTROL_GROUPS) {
      arm.set(`${candidate.id}:${group}`, channelsOf(armDocument(candidate, group)));
    }
  }

  const pairDifferences: CandidatePairDifference[] = [];
  const colorLeaks: AxisProbeReport["colorLeaks"][number][] = [];

  for (const [left, right] of pairs()) {
    const axes = THEME_CONTROL_GROUPS.map((axis): AxisDifference => ({
      axis,
      decisions: axisDecisionIds(axis),
      channels: movedChannels(
        arm.get(`${left.id}:${axis}`) ?? {},
        arm.get(`${right.id}:${axis}`) ?? {}
      ),
    }));

    const colorDelta = new Set(
      axes.find((row) => row.axis === COLOR_AXIS)?.channels ?? []
    );
    for (const axis of NON_COLOR_AXES) {
      const reach = new Set([
        ...movedChannels(baseline, arm.get(`${left.id}:${axis}`) ?? {}),
        ...movedChannels(baseline, arm.get(`${right.id}:${axis}`) ?? {}),
      ]);
      const leaked = [...colorDelta].filter((channel) => reach.has(channel)).sort();
      if (leaked.length > 0) {
        colorLeaks.push({ left: left.id, right: right.id, axis, channels: leaked });
      }
    }

    pairDifferences.push({
      left: left.id,
      right: right.id,
      axes,
      differingNonColorAxes: NON_COLOR_AXES.filter(
        (axis) => (axes.find((row) => row.axis === axis)?.channels.length ?? 0) > 0
      ),
    });
  }

  return { pairs: pairDifferences, colorLeaks };
}

/** The probe as a table a reader can paste into a report. */
export function formatAxisProbe(report: AxisProbeReport): string {
  const header = ["pair", ...THEME_CONTROL_GROUPS, "non-colour axes"].join(" | ");
  const rows = report.pairs.map((pair) =>
    [
      `${pair.left} vs ${pair.right}`,
      ...THEME_CONTROL_GROUPS.map(
        (group) =>
          `${pair.axes.find((row) => row.axis === group)?.channels.length ?? 0}`
      ),
      `${pair.differingNonColorAxes.length}/${NON_COLOR_AXES.length}`,
    ].join(" | ")
  );
  return [header, ...rows].join("\n");
}

/** Which channels each non-colour axis moved, for a reader auditing the table. */
export function formatAxisChannels(report: AxisProbeReport, limit = 10): string {
  return report.pairs
    .flatMap((pair) => [
      `${pair.left} vs ${pair.right}`,
      ...NON_COLOR_AXES.map((axis) => {
        const moved = pair.axes.find((row) => row.axis === axis)?.channels ?? [];
        const shown = moved.slice(0, limit).join(", ");
        const rest = moved.length > limit ? ` (+${moved.length - limit} more)` : "";
        return `  ${axis} (${moved.length}): ${shown || "-"}${rest}`;
      }),
    ])
    .join("\n");
}
