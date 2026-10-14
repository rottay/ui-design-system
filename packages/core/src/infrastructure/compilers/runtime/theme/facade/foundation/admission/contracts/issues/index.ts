/**
 * @fileoverview The refusal vocabulary of the single admission.
 *
 * One error type for every origin. Before WO-CAT-03 the only admission lived
 * on the DB terminal and spoke `TenantThemeValidationError`; the preview and
 * draft origins reached the channel writers with nothing checked, so there was
 * no refusal to speak. The door refuses in one voice now, and the terminal
 * re-throws the SAME issues under its own published name so a route that
 * contracts on a named document rejection is not touched.
 *
 * @module Compilers/Theme/Facade/Foundation/Admission/Foundation/Issues
 * @category Compilers
 * @package @rottay/design-system
 */

import type { TenantThemeValidationIssue } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";

/**
 * A refusal, keyed on the same `{ code, path, message }` triple the package's
 * one validation vocabulary already uses.
 *
 * Reusing it rather than minting a second issue shape is the point: the
 * terminal hands these straight to `TenantThemeValidationError`, so a message
 * cannot drift between the door that decided and the transport that reports.
 */
export type ThemeAdmissionIssue = TenantThemeValidationIssue;

/**
 * The compile door refused this intent.
 *
 * WHAT IT CARRIES, AND WHY. `measured` is the compilation the EMISSION stations
 * graded before they refused it -- present only when the refusal happened after
 * the lowering ran, absent for the intent-stage stations that refuse before a
 * channel is written.
 *
 * It is on the error rather than on a second return shape because there is
 * exactly one caller for it: an AUTHORING surface, which must tell an author
 * what is wrong with the draft they are typing. Grading "this pair is
 * illegible" requires the pair, and the pair only exists in the compile. A
 * publisher cannot reach it by accident -- it has to catch a named error and
 * read a field called `measured` -- and `compileThemeIntent` still throws, so
 * nothing is published around the admission. The architecture gate censuses who
 * reads it.
 */
export class ThemeAdmissionError<Measured = unknown> extends Error {
  readonly issues: readonly ThemeAdmissionIssue[];
  readonly measured?: Measured;

  constructor(issues: readonly ThemeAdmissionIssue[], measured?: Measured) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "));
    this.name = "ThemeAdmissionError";
    this.issues = issues;
    this.measured = measured;
  }
}

/** Throw when there is anything to refuse, and never for an empty list. */
export function refuse<Measured>(
  issues: readonly ThemeAdmissionIssue[],
  measured?: Measured
): void {
  if (issues.length > 0) throw new ThemeAdmissionError(issues, measured);
}
