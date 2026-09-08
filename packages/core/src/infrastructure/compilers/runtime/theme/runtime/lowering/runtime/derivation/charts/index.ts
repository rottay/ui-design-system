/**
 * @fileoverview The chart family: the derived series palette and the authored
 * category slots.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/charts
 * @category Compilers
 * @package @rottay/design-system
 */

import { deriveChartSeriesPalette } from "@/foundation/kernel/color/oklch/chart-series";
import { isHexColor } from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { RampSurface } from "@/foundation/kernel/color/oklch/ramp";
import type { FamilyDeriver } from "../../../foundation/contract";
import {
  DARK_DEFAULT_GROUND,
  LIGHT_DEFAULT_GROUND,
} from "../../../foundation/ground";

/**
 * The ten reserved series slots and the ten authored category slots, each
 * assigned under its own literal name.
 *
 * Written as explicit per-slot assignments, not a loop over an interpolated
 * key: the reserved-name gate and the channel-liveness producer both read the
 * KEY of an assignment, and a name assembled behind `${index + 1}` is a name
 * neither of them can resolve -- so a channel the compiler writes at `:root`
 * comes back as an unowned read with no definer.
 */
export function deriveChartChannels(
  bt: BrandTheme,
  surface: RampSurface
): Record<string, string> {
  const vars: Record<string, string> = {};
  const chartSeed = bt.palette?.primaryColor;
  if (chartSeed && isHexColor(chartSeed)) {
    const chartGrounds = [
      bt.palette?.backgroundColor ??
        (surface === "dark" ? DARK_DEFAULT_GROUND : LIGHT_DEFAULT_GROUND),
      ...Object.values(bt.surfaces?.surfaceRoles ?? bt.surfaces?.materials ?? {})
        .map((role) => role?.background)
        .filter((value): value is string => typeof value === "string"),
    ];
    const series = deriveChartSeriesPalette(chartSeed, chartGrounds, surface);
    if (series[0]) vars["--ds-chart-series-1"] = series[0];
    if (series[1]) vars["--ds-chart-series-2"] = series[1];
    if (series[2]) vars["--ds-chart-series-3"] = series[2];
    if (series[3]) vars["--ds-chart-series-4"] = series[3];
    if (series[4]) vars["--ds-chart-series-5"] = series[4];
    if (series[5]) vars["--ds-chart-series-6"] = series[5];
    if (series[6]) vars["--ds-chart-series-7"] = series[6];
    if (series[7]) vars["--ds-chart-series-8"] = series[7];
    if (series[8]) vars["--ds-chart-series-9"] = series[8];
    if (series[9]) vars["--ds-chart-series-10"] = series[9];
  }
  const categories = bt.charts?.categoryColors;
  if (categories) {
    if (categories[0]) vars["--ds-chart-category-1"] = categories[0];
    if (categories[1]) vars["--ds-chart-category-2"] = categories[1];
    if (categories[2]) vars["--ds-chart-category-3"] = categories[2];
    if (categories[3]) vars["--ds-chart-category-4"] = categories[3];
    if (categories[4]) vars["--ds-chart-category-5"] = categories[4];
    if (categories[5]) vars["--ds-chart-category-6"] = categories[5];
    if (categories[6]) vars["--ds-chart-category-7"] = categories[6];
    if (categories[7]) vars["--ds-chart-category-8"] = categories[7];
    if (categories[8]) vars["--ds-chart-category-9"] = categories[8];
    if (categories[9]) vars["--ds-chart-category-10"] = categories[9];
  }
  return vars;
}

/**
 * The series palette derived from the theme's own seed against the grounds it
 * actually paints on, plus the ten category slots a theme may state outright.
 */
export const chartsDeriver: FamilyDeriver = {
  family: "charts",
  rank: "derived",
  consumes: [
    "palette.primaryColor",
    "palette.backgroundColor",
    "surfaces.surfaceRoles",
    "surfaces.materials",
    "charts.categoryColors",
  ],
  produces: ["--ds-chart-series-*", "--ds-chart-category-*"],
  derive: (context) => deriveChartChannels(context.theme, context.surface),
};
