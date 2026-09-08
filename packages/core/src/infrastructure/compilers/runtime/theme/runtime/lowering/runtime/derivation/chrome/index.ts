/**
 * @fileoverview The chrome family: the vertical's explicit component chrome.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  BrandTheme,
  BrandThemeMode,
} from "@/foundation/contracts/composition/tenants/themes";
import type { TenantAuthoredPaths } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { FamilyDeriver } from "../../../foundation/contract";
import { brandThemeToChromeVariables } from "../../../foundation/chrome";

/**
 * The one family at rank `verticalOverride`.
 *
 * Chrome is a vertical stating a concrete component channel outright, so it
 * outranks every derivation below it -- and, since the merge is ranked rather
 * than ordered, it no longer outranks the TENANT floor above it. That
 * inversion was the mechanical reason a tenant's posture moved nothing on a
 * vertical with hand-authored chrome.
 *
 * `--ds-color-bg-input` is emitted here and not with the palette because its
 * value is a chrome statement: the semantic control surface every modern input
 * falls back to. A mode overlay restates it through this same family, so the
 * value is always the one that mode authored.
 */
export const chromeDeriver: FamilyDeriver = {
  family: "chrome",
  rank: "verticalOverride",
  consumes: ["chrome.*"],
  /**
   * Wide on purpose, and temporarily so. Chrome is the TRANSCRIPTION layer --
   * a hand-authored sheet naming a channel per component part -- so its
   * declared output is a group prefix per component family rather than a
   * derivation. The family cuts replace these groups one at a time, and each
   * one that moves out narrows this list.
   */
  produces: [
    "--ds-alert-*",
    "--ds-anchor-*",
    "--ds-autocomplete-*",
    "--ds-avatar-*",
    "--ds-backtop-*",
    "--ds-badge-*",
    "--ds-breadcrumb-*",
    "--ds-button-*",
    "--ds-calendar-*",
    "--ds-card-*",
    "--ds-checkbox-*",
    "--ds-collapse-*",
    "--ds-collection-*",
    "--ds-color-*",
    "--ds-command-*",
    "--ds-compact-*",
    "--ds-control-*",
    "--ds-datepicker-*",
    "--ds-descriptions-*",
    "--ds-detail-*",
    "--ds-divider-*",
    "--ds-drawer-*",
    "--ds-dropdown-*",
    "--ds-empty-*",
    "--ds-filter-*",
    "--ds-floatbutton-*",
    "--ds-focus-*",
    "--ds-form-*",
    "--ds-gradient-*",
    "--ds-icon-*",
    "--ds-image-*",
    "--ds-input-*",
    "--ds-inputnumber-*",
    "--ds-layout-*",
    "--ds-list-*",
    "--ds-listing-*",
    "--ds-live-*",
    "--ds-menu-*",
    "--ds-message-*",
    "--ds-metric-*",
    "--ds-modal-*",
    "--ds-notification-*",
    "--ds-overlay-*",
    "--ds-page-*",
    "--ds-pagination-*",
    "--ds-popover-*",
    "--ds-premium-*",
    "--ds-progress-*",
    "--ds-radio-*",
    "--ds-radius-*",
    "--ds-rate-*",
    "--ds-result-*",
    "--ds-search-*",
    "--ds-segmented-*",
    "--ds-select-*",
    "--ds-shadow-*",
    "--ds-shell-*",
    "--ds-sidebar-*",
    "--ds-signal-*",
    "--ds-skeleton-*",
    "--ds-slider-*",
    "--ds-spinner-*",
    "--ds-statistic-*",
    "--ds-stats-*",
    "--ds-steps-*",
    "--ds-surface-*",
    "--ds-switch-*",
    "--ds-tab-*",
    "--ds-table-*",
    "--ds-tabs-*",
    "--ds-tag-*",
    "--ds-tall-*",
    "--ds-textarea-*",
    "--ds-timeline-*",
    "--ds-timepicker-*",
    "--ds-toggle-*",
    "--ds-toolbar-*",
    "--ds-tooltip-*",
    "--ds-transfer-*",
    "--ds-tree-*",
    "--ds-upload-*",
    "--ds-watermark-*",
    "--ds-workspace-*",
    "--ds-z-*",
  ],
  derive: (context) =>
    deriveChromeChannels(
      context.theme,
      context.mode,
      context.radiusScale,
      context.modePrefix,
      context.tenant?.authoredPaths
    ),
};

export function deriveChromeChannels(
  bt: BrandTheme,
  mode: BrandThemeMode,
  radiusScale: string,
  modePrefix: string,
  tenantAuthoredPaths: TenantAuthoredPaths | undefined
): Record<string, string> {
  const vars: Record<string, string> = {};
  const inputBg = bt.chrome?.controls?.input?.bg;
  if (inputBg) vars["--ds-color-bg-input"] = inputBg;
  Object.assign(
    vars,
    brandThemeToChromeVariables(
      bt,
      mode,
      tenantAuthoredPaths,
      modePrefix,
      radiusScale
    )
  );
  return vars;
}
