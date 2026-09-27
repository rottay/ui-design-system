import {
  FleetGround,
  probeParam,
  type FleetDensity,
  type FleetLocale,
  type FleetSource,
  type FleetTheme,
  type ProbeSearchParams,
} from "@/components/probes/ground";

import { DaisyRegressionCanvas } from "./canvas";

/**
 * Daisy-regression live evidence probe (2026-07-26).
 *
 * Surfaces the four remediated paths after the Daisy removal from Modern:
 * the three loading branches whose canonical ModernSpinner now re-stamps
 * the contracted `spinner` data-part (caller-wins P-79), and the
 * AlertDialog modern portal/top-layer posture whose contract moved off
 * the dead Daisy class list onto the canonical rottay-* hooks.
 *
 * The tenant ground is the probe-ground kernel (`@/components/probes/ground`):
 * the UNSPREAD registry object for `bithire-static` and the validated,
 * compiled `TenantThemeDocument` for `themanagement-db`. The axes below are
 * the ground's own options -- a hand-built config would block visual-authority
 * resolution, and a blocked resolution photographs a spinner.
 *
 * URL-addressable: ?source=bithire-static|themanagement-db&locale=en|es|ar
 * &density=compact|comfortable|spacious&theme=light|dark
 */

export default async function DaisyRegressionProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  const source: FleetSource = probeParam(params, "source") === "themanagement-db" ? "themanagement-db" : "bithire-static";
  const localeParam = probeParam(params, "locale");
  const locale: FleetLocale = localeParam === "es" || localeParam === "ar" ? localeParam : "en";
  const densityParam = probeParam(params, "density");
  const density: FleetDensity = densityParam === "compact" || densityParam === "spacious" ? densityParam : "comfortable";
  const theme: FleetTheme = probeParam(params, "theme") === "dark" ? "dark" : "light";
  // The dialog is opt-in (`&dialog=1`) so it does not cover the loading
  // cells in their own captures (it portals above everything by design).
  const dialogOpen = probeParam(params, "dialog") === "1";

  return (
    <FleetGround source={source} locale={locale} density={density} theme={theme}>
      <DaisyRegressionCanvas locale={locale} dialogOpen={dialogOpen} />
    </FleetGround>
  );
}
