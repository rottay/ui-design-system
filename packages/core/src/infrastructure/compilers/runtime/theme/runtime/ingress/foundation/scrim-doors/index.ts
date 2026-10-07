/**
 * @fileoverview The scrim-door census: every authored value that paints a scrim outside the ladder, named.
 *
 * @module Compilers/Theme/Ingress/Foundation/ScrimDoors
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  TenantThemeChrome,
  TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";

export type ScrimDoor =
  | "modal-overlay-bg"
  | "modal-overlay-backdrop"
  | "overlay-ladder-colour"
  | "chromatic-overlay-veil";

export interface ScrimDoorFinding {
  readonly door: ScrimDoor;
  readonly path: string;
  readonly value: string;
  readonly message: string;
}

const LADDER_TOKENS = [
  ["--ds-overlay-light", "light"],
  ["--ds-overlay-medium", "medium"],
  ["--ds-overlay-heavy", "heavy"],
] as const;

const BACKDROP_ADMITTED =
  /^(none|var\(--ds-glass-backdrop-filter\)|blur\(\s*(\d+(\.\d+)?)px\s*\))$/;
const BACKDROP_BLUR_CAP_PX = 24;

const REPORTED =
  "reported, not refused, until the stored-row census of owner decision Q4 (2026-10-06) reads 0";

function backdropAdmitted(value: string): boolean {
  const match = BACKDROP_ADMITTED.exec(value.trim());
  if (!match) return false;
  return match[2] === undefined || Number(match[2]) <= BACKDROP_BLUR_CAP_PX;
}

/** Neutral when every channel is equal; a value the parser cannot read is not neutral. */
function isNeutralColour(value: string): boolean {
  const text = value.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text);
  if (hex) {
    const digits = hex[1];
    const wide = digits.length <= 4 ? [...digits].map((d) => d + d).join("") : digits;
    return wide.slice(0, 2) === wide.slice(2, 4) && wide.slice(2, 4) === wide.slice(4, 6);
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(text);
  if (rgb) return Number(rgb[1]) === Number(rgb[2]) && Number(rgb[2]) === Number(rgb[3]);
  return false;
}

function chromeFindings(
  chrome: TenantThemeChrome | undefined,
  prefix: string
): ScrimDoorFinding[] {
  const findings: ScrimDoorFinding[] = [];
  const modal = chrome?.modal;
  if (typeof modal?.overlayBg === "string") {
    findings.push({
      door: "modal-overlay-bg",
      path: `${prefix}.modal.overlayBg`,
      value: modal.overlayBg,
      message: `${prefix}.modal.overlayBg authors the Modal scrim colour; a tenant edits the ladder strength only (overrides.chrome.scrim.medium); ${REPORTED}`,
    });
  }
  if (typeof modal?.overlayBackdrop === "string" && !backdropAdmitted(modal.overlayBackdrop)) {
    findings.push({
      door: "modal-overlay-backdrop",
      path: `${prefix}.modal.overlayBackdrop`,
      value: modal.overlayBackdrop,
      message: `${prefix}.modal.overlayBackdrop is not none | blur(0-${BACKDROP_BLUR_CAP_PX}px); a backdrop filter other than a blur tints the scrim; ${REPORTED}`,
    });
  }
  return findings;
}

/** A v1 row: its advanced chrome and its raw token overrides. */
export function censusScrimDoorsV1(document: TenantThemeDocument): ScrimDoorFinding[] {
  if (document.mode !== "advanced") return [];
  const advanced = document.visualFoundation?.advanced;
  const findings = chromeFindings(advanced?.chrome, "visualFoundation.advanced.chrome");
  const overrides = (advanced?.tokenOverrides ?? {}) as Record<string, unknown>;
  const prefix = "visualFoundation.advanced.tokenOverrides";
  for (const [token, step] of LADDER_TOKENS) {
    const value = overrides[token];
    if (value === undefined) continue;
    findings.push({
      door: "overlay-ladder-colour",
      path: `${prefix}["${token}"]`,
      value: String(value),
      message: `${prefix}["${token}"] authors a ladder colour; a tenant edits the ladder strength only (overrides.chrome.scrim.${step}); ${REPORTED}`,
    });
  }
  const veil = overrides["--ds-color-bg-overlay"];
  if (veil !== undefined && !isNeutralColour(String(veil))) {
    findings.push({
      door: "chromatic-overlay-veil",
      path: `${prefix}["--ds-color-bg-overlay"]`,
      value: String(veil),
      message: `${prefix}["--ds-color-bg-overlay"] is not a neutral veil; a chromatic veil tints the scrims that still read it; ${REPORTED}`,
    });
  }
  return findings;
}

/** A decision document: only its sanctioned chrome overrides can reach a scrim. */
export function censusScrimDoorsV2(chrome: TenantThemeChrome | undefined): ScrimDoorFinding[] {
  return chromeFindings(chrome, "overrides.chrome");
}
