/**
 * Chrome schema fields of the flat component families, alert through scrim.
 */

import {
  SCRIM_LADDER_STEPS,
  SCRIM_LADDER_STRENGTH_BOUNDS,
} from "@/foundation/contracts/composition/tenants/themes/scrim-ladder";
import {
  number,
  object,
  visualFields,
} from "../../spec";
import type { TenantThemeSchemaNode } from "../../spec";

const chromeFamilyFields: Readonly<Record<string, TenantThemeSchemaNode>> = {
  alert: object(
    visualFields([
      "errorBg",
      "errorBorder",
      "errorColor",
      "errorIcon",
      "infoBg",
      "infoBorder",
      "infoColor",
      "infoIcon",
      "successBg",
      "successBorder",
      "successColor",
      "successIcon",
      "warningBg",
      "warningBorder",
      "warningColor",
      "warningIcon",
    ])
  ),
  anchor: object(visualFields(["inkColor", "linkColor", "linkColorActive"])),
  avatar: object(
    visualFields([
      "borderColor",
      "defaultBg",
      "defaultColor",
      "errorBg",
      "errorColor",
      "gradientBg",
      "gradientColor",
      "groupBorder",
      "groupOverflowBg",
      "groupOverflowColor",
      "primaryBg",
      "primaryColor",
      "ringColor",
      "secondaryBg",
      "secondaryColor",
      "statusBorder",
      "successBg",
      "successColor",
      "warningBg",
      "warningColor",
    ])
  ),
  backTop: object(visualFields(["bg", "color", "shadow"])),
  calendar: object(
    visualFields(["bg", "border", "dayColorOther", "headerColor"])
  ),
  collapse: object(
    visualFields([
      "bg",
      "border",
      "contentBg",
      "headerBg",
      "headerBgHover",
      "headerColor",
    ])
  ),
  descriptions: object(
    visualFields(["bg", "border", "contentColor", "labelColor"])
  ),
  drawer: object(
    visualFields([
      "bg",
      "bodyColor",
      "footerBorder",
      "headerBorder",
      "shadow",
      "titleColor",
    ])
  ),
  dropdown: object(
    visualFields([
      "bg",
      "itemBgActive",
      "itemBgHover",
      "itemColor",
      "itemColorActive",
      "itemColorHover",
      "shadow",
    ])
  ),
  empty: object(visualFields(["descriptionColor", "iconColor"])),
  floatButton: object(
    visualFields([
      "badgeBg",
      "badgeColor",
      "defaultBg",
      "defaultColor",
      "descriptionColor",
      "primaryBg",
      "primaryColor",
    ])
  ),
  liveFeed: object(
    visualFields([
      "badgeBg",
      "badgeColor",
      "bg",
      "border",
      "emptyColor",
      "loadMoreColor",
      "newBg",
      "newBorder",
      "newColor",
      "refreshColor",
      "skeletonBg",
    ])
  ),
  menu: object(
    visualFields([
      "bg",
      "darkBg",
      "darkItemColor",
      "dividerColor",
      "focusRingColor",
      "groupTitleColor",
      "itemBgActive",
      "itemBgHover",
      "itemColor",
      "itemColorActive",
      "itemColorHover",
      "itemDangerColor",
      "itemHoverBg",
      "itemSelectedBg",
      "itemSelectedColor",
      "submenuBg",
    ])
  ),
  message: object(
    visualFields(["bg", "closeColor", "closeColorHover", "shadow"])
  ),
  notification: object(visualFields(["bg", "shadow", "titleColor"])),
  pagination: object(
    visualFields([
      "activeBg",
      "activeColor",
      "itemBg",
      "itemBgActive",
      "itemBgHover",
      "itemBorder",
      "itemColor",
      "itemColorActive",
      "itemColorHover",
    ])
  ),
  progress: object(
    visualFields([
      "bg",
      "fillError",
      "fillPrimary",
      "fillSuccess",
      "fillWarning",
    ])
  ),
  result: object(visualFields(["iconColor", "subtitleColor", "titleColor"])),
  skeleton: object(visualFields(["bg", "highlight", "waveGradient"])),
  spinner: object(visualFields(["color", "track"])),
  statistic: object(
    visualFields(["prefixColor", "suffixColor", "titleColor", "valueColor"])
  ),
  statsGrid: object(
    visualFields([
      "cardBg",
      "cardBorder",
      "cardFilledBg",
      "cardGlassBg",
      "cardGlassBorder",
      "descriptionColor",
      "labelColor",
      "skeletonBg",
      "skeletonWaveGradient",
      "trendNegative",
      "trendNeutral",
      "trendPositive",
      "valueColor",
    ])
  ),
  steps: object(
    visualFields([
      "connectorColor",
      "connectorColorActive",
      "finishBg",
      "finishBorder",
      "itemBg",
      "itemBgActive",
      "itemColor",
      "itemColorActive",
      "processBg",
      "processBorder",
      "waitBg",
      "waitBorder",
    ])
  ),
  tag: object(
    visualFields([
      "border",
      "defaultBg",
      "defaultBorder",
      "defaultColor",
      "errorBg",
      "errorBorder",
      "errorColor",
      "primaryBg",
      "primaryBorder",
      "primaryColor",
      "secondaryBg",
      "secondaryBorder",
      "secondaryColor",
      "successBg",
      "successBorder",
      "successColor",
      "warningBg",
      "warningBorder",
      "warningColor",
    ])
  ),
  timeline: object(
    visualFields(["contentColor", "dotBg", "dotBorder", "lineColor"])
  ),
  tree: object(
    visualFields([
      "nodeBgHover",
      "nodeBgSelected",
      "nodeColor",
      "nodeColorSelected",
    ])
  ),
  scrim: object(
    Object.fromEntries(
      SCRIM_LADDER_STEPS.map((step) => [
        step,
        number(SCRIM_LADDER_STRENGTH_BOUNDS[step]),
      ])
    )
  ),
};

export { chromeFamilyFields };
