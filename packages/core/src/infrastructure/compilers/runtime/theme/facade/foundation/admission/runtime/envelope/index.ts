/**
 * @fileoverview Admission: the vertical envelope and the closed domains.
 *
 * The envelope bounds used to be applied by the DB terminal to a DOCUMENT, so
 * `previewThemeIntent` accepted `typography.scale 100`, `radiusScale 9` and
 * `effectIntensity 5` that publish refused, and the lowering silently clamped
 * what it could (F-13). The same bounds are applied here to the RESOLVED theme,
 * restricted to what the tenant itself authored, for every tenant-authored
 * origin.
 *
 * The closed-domain half is F-61: an unknown `experienceProfile` expanded to
 * nothing and deleted twelve channels of the vertical without a word, and a
 * hostile colour reached the channel writers because nothing asked whether it
 * was a colour. Both are refused BY NAME here; neither is dropped, repaired or
 * clamped.
 *
 * @module Compilers/Theme/Facade/Foundation/Admission/Runtime/Envelope
 * @category Compilers
 * @package @rottay/design-system
 */

import type { Theme } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { TenantThemeVerticalEnvelope } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { validateRecipeProfileSelection } from "@/foundation/tokens/ts/presentation/recipe-profiles";
import { validateResponsivePostureSelection } from "@/foundation/tokens/ts/presentation/responsive-postures";
import { validateExperienceProfileSelection } from "@/foundation/tokens/ts/presentation/expressive-profiles";
import {
  TENANT_THEME_ENVELOPE_RANGES,
  isInsideEnvelopeRange,
} from "@/contracts/theme/runtime/envelopes";
import { isValidCssColor } from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import type { ThemeAdmissionIssue } from "../../foundation/issues";

/**
 * The five `Governed<T>` roots, whose authored paths are recorded unwrapped.
 *
 * `collectPatchAuthoredPaths` normalizes `motion.value.intensity` to
 * `motion.intensity`, so a reader that walks the theme by the authored path has
 * to put the `value` hop back or it reads `undefined` and admits everything.
 */
const GOVERNED_ROOTS: readonly string[] = [
  "charts",
  "motion",
  "recipes",
  "expressive",
  "responsive",
];

/** Read a Theme leaf addressed by an authored (BrandTheme-space) keypath. */
export function readThemePath(theme: Theme, path: string): unknown {
  const segments = path.split(".");
  let cursor: unknown = theme;
  for (let index = 0; index < segments.length; index += 1) {
    if (cursor === null || typeof cursor !== "object") return undefined;
    const key = segments[index];
    cursor = (cursor as Record<string, unknown>)[key];
    if (index === 0 && GOVERNED_ROOTS.includes(key)) {
      if (cursor === null || typeof cursor !== "object") return undefined;
      cursor = (cursor as { value?: unknown }).value;
    }
  }
  return cursor;
}

/** Every mode spelling of one base-level keypath, base included. */
function authoredSpellings(path: string): readonly string[] {
  return [path, `modes.light.${path}`, `modes.dark.${path}`];
}

/**
 * Refuse a dial the tenant MOVED outside the vertical's declared range.
 *
 * Moved, not merely carried. The envelope bounds what a tenant DECIDES, and the
 * two transports state a decision differently: a document carries only what the
 * tenant chose, but a `BrandTheme` draft is a whole theme — an editor opens the
 * vertical's own and edits a few leaves, so every value it did not touch is
 * still in the patch. Measuring membership alone would hold the PRODUCT to a
 * CUSTOMER cap: rottay's own `motion.intensity` is 1.0 against a tenant ceiling
 * of 0.8, so opening rottay in the studio would be refused for a value nobody
 * chose.
 *
 * So the comparison is against the vertical's own value, which is the same rule
 * the contrast station already uses on the emission side: a tenant answers for
 * what it changed. A document is unaffected — every dial it carries is one the
 * tenant set — and a draft that really does move a dial out of range is refused
 * exactly as a publish refuses it.
 */
export function envelopeRangeIssues(
  theme: Theme,
  authoredPaths: ReadonlySet<string>,
  envelope: TenantThemeVerticalEnvelope | undefined,
  baseline?: Theme
): ThemeAdmissionIssue[] {
  const ranges = envelope?.ranges;
  if (!ranges) return [];
  const issues: ThemeAdmissionIssue[] = [];
  for (const row of TENANT_THEME_ENVELOPE_RANGES) {
    for (const spelling of authoredSpellings(row.themePath)) {
      if (!authoredPaths.has(spelling)) continue;
      const value = readThemePath(theme, spelling);
      if (baseline !== undefined && readThemePath(baseline, spelling) === value) {
        continue;
      }
      if (isInsideEnvelopeRange(value, ranges[row.range])) continue;
      issues.push({
        code: "invalid_value",
        path: `$.theme.${spelling}`,
        message:
          `Value ${JSON.stringify(value)} exceeds the ${envelope?.verticalKey ?? "vertical"} envelope ` +
          `for ${row.range} (${ranges[row.range]?.min}..${ranges[row.range]?.max})`,
      });
    }
  }
  return issues;
}

/**
 * The three registry-backed selections, refused by name instead of by silence.
 *
 * Each of these validators already existed and already answered
 * `{ ok: false, reason }`; the lowering simply threw the answer away and
 * compiled the baseline identity unmarked. A tenant that mistypes a profile id
 * got twelve of the vertical's channels deleted and no error (F-61).
 */
export function closedDomainIssues(
  theme: Theme,
  authoredPaths: ReadonlySet<string>
): ThemeAdmissionIssue[] {
  const issues: ThemeAdmissionIssue[] = [];

  const experienceAuthored = authoredSpellings("expressive.experienceProfile").some(
    (spelling) => authoredPaths.has(spelling)
  );
  if (experienceAuthored) {
    const validation = validateExperienceProfileSelection(
      theme.expressive?.value?.experienceProfile,
      theme.expressive?.value?.schemaVersion
    );
    if (!validation.ok) {
      issues.push({
        code: "invalid_value",
        path: "$.theme.expressive.experienceProfile",
        message: `Experience profile rejected: ${validation.reason}`,
      });
    }
  }

  const recipeAuthored = authoredSpellings("recipes.profile").some((spelling) =>
    authoredPaths.has(spelling)
  );
  if (recipeAuthored) {
    const validation = validateRecipeProfileSelection(
      theme.recipes?.value?.profile,
      theme.recipes?.value?.schemaVersion
    );
    if (!validation.ok) {
      issues.push({
        code: "invalid_value",
        path: "$.theme.recipes.profile",
        message: `Recipe profile rejected: ${validation.reason}`,
      });
    }
  }

  const postureAuthored = authoredSpellings("responsive.posture").some(
    (spelling) => authoredPaths.has(spelling)
  );
  if (postureAuthored) {
    const validation = validateResponsivePostureSelection(
      theme.responsive?.value?.posture,
      theme.responsive?.value?.schemaVersion
    );
    if (!validation.ok) {
      issues.push({
        code: "invalid_value",
        path: "$.theme.responsive.posture",
        message: `Responsive posture rejected: ${validation.reason}`,
      });
    }
  }

  return issues;
}

/** A palette leaf whose name declares it a colour. */
const PALETTE_COLOR_PATH =
  /^(?:modes\.(?:light|dark)\.)?palette\.[A-Za-z0-9]*Color$/u;

/**
 * Refuse an authored palette seed that is not a colour.
 *
 * `admitCssVariables` admitted `notacolor` because its grammar only asks
 * whether a value can break out of its declaration, not whether it means
 * anything (F-61). The colour domain is asked here, where the value is still
 * attached to the keypath its author wrote, so the refusal can name it.
 */
export function authoredColorIssues(
  theme: Theme,
  authoredPaths: ReadonlySet<string>
): ThemeAdmissionIssue[] {
  const issues: ThemeAdmissionIssue[] = [];
  for (const path of authoredPaths) {
    if (!PALETTE_COLOR_PATH.test(path)) continue;
    const value = readThemePath(theme, path);
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && isValidCssColor(value)) continue;
    issues.push({
      code: "invalid_value",
      path: `$.theme.${path}`,
      message: `Authored value ${JSON.stringify(value)} is not a CSS colour`,
    });
  }
  return issues;
}

/** The whole envelope station, in one call. */
export function envelopeIssues(
  theme: Theme,
  authoredPaths: ReadonlySet<string>,
  envelope: TenantThemeVerticalEnvelope | undefined,
  baseline?: Theme
): ThemeAdmissionIssue[] {
  return [
    ...envelopeRangeIssues(theme, authoredPaths, envelope, baseline),
    ...closedDomainIssues(theme, authoredPaths),
    ...authoredColorIssues(theme, authoredPaths),
  ];
}
