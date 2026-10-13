/**
 * Chrome schema node of the controls: button variants and geometry, field
 * geometry, segmented, input and the field families.
 */

import {
  FONT_WEIGHT,
  OPACITY,
  VISUAL,
  enumeration,
  object,
  visualFields,
} from "../../foundation";

const buttonVariant = object(
  visualFields([
    "bg",
    "bgHover",
    "bgActive",
    "color",
    "colorHover",
    "colorActive",
    "text",
    "border",
    "borderHover",
    "borderActive",
    "shadow",
    "shadowHover",
    "shadowActive",
  ])
);

const controlSize = object(
  visualFields([
    "height",
    "paddingX",
    "paddingY",
    "fontSize",
    "lineHeight",
    "iconSize",
    "gap",
    "radius",
  ])
);

const buttonGeometry = object({
  ...visualFields([
    "fontFamily",
    "letterSpacing",
    "textTransform",
    "gap",
    "radius",
    "borderWidth",
    "touchTargetMin",
    "groupGap",
    "groupMobileGap",
    "groupMobileWidth",
    "hoverTransform",
    "activeTransform",
    "iconHoverTransform",
    "iconActiveTransform",
    "labelOffsetY",
    "hoverFilter",
    "activeFilter",
    "focusRingOffset",
    "spinnerDuration",
    "surfaceHighlight",
    "surfaceHighlightOpacity",
    "surfaceHighlightHoverOpacity",
    "surfaceHighlightActiveOpacity",
    "gradient",
    "aiTexture",
    "transitionDuration",
    "transitionTiming",
  ]),
  groupMobileDirection: enumeration("row", "column"),
  fontWeight: FONT_WEIGHT,
  xs: controlSize,
  sm: controlSize,
  md: controlSize,
  lg: controlSize,
  xl: controlSize,
});

const fieldGeometry = object({
  ...visualFields([
    "gap",
    "radius",
    "fontFamily",
    "letterSpacing",
    "borderWidth",
    "borderStyle",
    "messageGap",
    "groupGap",
    "groupGapSeparated",
    "groupOverlap",
    "groupMinItemWidth",
    "formFieldGap",
    "horizontalGap",
    "labelOffsetY",
    "requiredGap",
    "labelFontSize",
    "labelFontFamily",
    "labelLetterSpacing",
    "labelLineHeight",
    "helperFontSize",
    "helperLineHeight",
    "affixSize",
    "affixSizeCompact",
    "affixRadius",
    "actionSize",
    "actionRadius",
    "touchTargetMin",
    "loadingSize",
    "loadingStroke",
    "loadingDuration",
    "textareaMinHeight",
    "textareaMaxHeight",
    "textareaPaddingX",
    "textareaPaddingY",
    "textareaRadius",
    "textareaResize",
    "transitionDuration",
    "transitionTiming",
  ]),
  fontWeight: FONT_WEIGHT,
  labelFontWeight: FONT_WEIGHT,
  formFieldDisabledOpacity: OPACITY,
  xs: controlSize,
  sm: controlSize,
  md: controlSize,
  lg: controlSize,
  xl: controlSize,
});

const segmented = object({
  ...visualFields([
    "bg",
    "border",
    "radius",
    "padding",
    "gap",
    "shadow",
    "itemBg",
    "itemBgHover",
    "itemBgSelected",
    "itemColor",
    "itemColorHover",
    "itemColorSelected",
    "itemRadius",
  ]),
  itemFontWeight: FONT_WEIGHT,
  itemFontWeightSelected: FONT_WEIGHT,
  sm: controlSize,
  md: controlSize,
  lg: controlSize,
});

const input = object({
  ...visualFields([
    "bg",
    "bgHover",
    "bgFocus",
    "bgDisabled",
    "color",
    "colorPlaceholder",
    "colorDisabled",
    "border",
    "borderHover",
    "borderFocus",
    "borderDisabled",
    "shadowRest",
    "shadowHover",
    "shadowFocus",
    "insetShadow",
    "caretColor",
    "selectionBg",
    "selectionColor",
    "successBorder",
    "successBg",
    "successShadowFocus",
    "warningBorder",
    "warningBg",
    "warningShadowFocus",
    "errorBorder",
    "errorBg",
    "errorShadowFocus",
    "errorColor",
    "loadingColor",
  ]),
  disabledOpacity: OPACITY,
  placeholderOpacity: OPACITY,
  filled: object(visualFields(["bg", "bgHover", "bgFocus", "border"])),
  addon: object({
    ...visualFields(["bg", "color", "border", "radius"]),
    fontWeight: FONT_WEIGHT,
  }),
  affix: object(visualFields(["bg", "color", "border", "paddingX"])),
  label: object(visualFields(["color", "requiredColor", "disabledColor"])),
  helper: object({
    ...visualFields(["color", "errorColor"]),
    errorFontWeight: FONT_WEIGHT,
  }),
  clear: object(
    visualFields([
      "color",
      "colorHover",
      "bg",
      "bgHover",
      "border",
      "borderHover",
      "shadowHover",
      "focusRing",
      "activeTransform",
    ])
  ),
  readOnly: object(
    visualFields(["bg", "color", "border", "borderStyle", "cursor"])
  ),
  autofill: object(visualFields(["bg", "color", "caret"])),
  count: object(visualFields(["color", "colorWarning", "colorError"])),
});

const controls = object({
  buttonGeometry,
  fieldGeometry,
  segmented,
  textarea: object(
    visualFields([
      "bg",
      "bgDisabled",
      "filledBg",
      "border",
      "borderHover",
      "borderFocus",
      "shadowFocus",
      "successBorder",
      "warningBorder",
      "errorBorder",
      "color",
      "colorPlaceholder",
      "countColor",
    ])
  ),
  form: object(
    visualFields([
      "labelColor",
      // `labelFontWeight` is a visual value rather than FONT_WEIGHT because the
      // static BrandFormChrome field lowers a CSS string straight into
      // `--ds-form-label-font-weight`; both transports must admit the same type.
      "labelFontWeight",
      "helpColor",
      "extraColor",
      "requiredColor",
      "successColor",
      "warningColor",
      "errorColor",
    ])
  ),
  buttonPrimary: buttonVariant,
  buttonSecondary: buttonVariant,
  buttonDefault: buttonVariant,
  buttonGhost: buttonVariant,
  buttonText: buttonVariant,
  buttonDashed: buttonVariant,
  buttonLink: buttonVariant,
  buttonSuccess: buttonVariant,
  buttonWarning: buttonVariant,
  buttonError: buttonVariant,
  buttonInfo: buttonVariant,
  buttonAI: buttonVariant,
  disabled: object({
    ...visualFields(["bg", "text", "border", "borderColor"]),
    opacity: OPACITY,
  }),
  focusRing: VISUAL,
  input,
  /**
   * ROTTAY-T2 MASS. The DB transport authors the same closed control
   * vocabulary the static `FlatTheme` transport does, because
   * `chromeToVariables` is the single lowering for both. 13 containers, 163
   * governed leaves: `select` carries 33 (the 15 C3 channels plus the 18
   * ROTTAY-T2 added), and the twelve families below carry 130.
   *
   * Every leaf is a VISUAL field. There are no open maps, no legacy aliases,
   * no slug or product branches: a customer document that names a channel
   * outside this list is rejected before it reaches the compiler.
   */
  select: object(
    visualFields([
      "bg",
      "bgHover",
      "bgFocus",
      "color",
      "colorPlaceholder",
      "borderColor",
      "borderColorHover",
      "borderColorFocus",
      "dropdownBg",
      "dropdownBorderColor",
      "dropdownShadow",
      "optionBgHover",
      "optionBgSelected",
      "optionColor",
      "optionColorSelected",
      "arrowColor",
      "bgDisabled",
      "border",
      "borderFocus",
      "borderHover",
      "checkColor",
      "clearColor",
      "clearColorHover",
      "colorDisabled",
      "dropdownBorder",
      "errorBorder",
      "filledBg",
      "optionColorDisabled",
      "shadowFocus",
      "successBorder",
      "tagBg",
      "tagColor",
      "warningBorder",
    ])
  ),
  autocomplete: object(
    visualFields([
      "bg",
      "border",
      "borderFocus",
      "clearColor",
      "dropdownBg",
      "dropdownShadow",
      "emptyColor",
      "errorBorder",
      "optionBgHover",
      "warningBorder",
    ])
  ),
  checkbox: object(
    visualFields([
      "bg",
      "bgDisabled",
      "border",
      "borderHover",
      "checkedBg",
      "checkedBorder",
      "checkedColor",
      "errorBorder",
      "errorColor",
      "focusRing",
      "focusRingColor",
      "labelColor",
      "labelColorDisabled",
    ])
  ),
  datePicker: object(
    visualFields([
      "bg",
      "bgDisabled",
      "border",
      "borderFocus",
      "borderHover",
      "clearColor",
      "color",
      "errorBorder",
      "iconColor",
      "separatorColor",
      "shadowFocus",
      "warningBorder",
    ])
  ),
  inputNumber: object(
    visualFields([
      "addonBg",
      "addonBorder",
      "addonColor",
      "affixColor",
      "bg",
      "bgDisabled",
      "border",
      "borderFocus",
      "color",
      "controlColor",
      "errorBorder",
      "shadowFocus",
      "warningBorder",
    ])
  ),
  radio: object(
    visualFields([
      "bg",
      "bgDisabled",
      "border",
      "borderHover",
      "checkedBg",
      "checkedBorder",
      "checkedDot",
      "descriptionColor",
      "errorBorder",
      "errorColor",
      "focusRing",
      "focusRingColor",
      "labelColor",
      "labelColorDisabled",
    ])
  ),
  rate: object(
    visualFields([
      "color",
    ])
  ),
  slider: object(
    visualFields([
      "focusRing",
      "handleBg",
      "handleBgDisabled",
      "handleBorder",
      "handleShadow",
      "markColor",
      "railColor",
      "trackColor",
      "trackColorDisabled",
    ])
  ),
  switch: object(
    visualFields([
      "bg",
      "bgHover",
      "checkedBg",
      "checkedBgHover",
      "focusRing",
      "labelColor",
      "thumbBg",
      "thumbShadow",
    ])
  ),
  timePicker: object(
    visualFields([
      "bg",
      "bgDisabled",
      "border",
      "borderFocus",
      "clearColor",
      "color",
      "errorBorder",
      "iconColor",
      "separatorColor",
      "shadowFocus",
      "warningBorder",
    ])
  ),
  toggle: object(
    visualFields([
      "descriptionColor",
      "dotBg",
      "dotShadow",
      "errorBg",
      "errorColor",
      "focusRing",
      "innerLabelColor",
      "labelColor",
      "successBg",
      "trackBg",
      "trackBgChecked",
      "warningBg",
    ])
  ),
  transfer: object(
    visualFields([
      "bg",
      "border",
      "headerBg",
      "headerBorder",
      "itemBgHover",
    ])
  ),
  upload: object(
    visualFields([
      "bg",
      "border",
      "borderHover",
      "buttonBg",
      "buttonBorder",
      "buttonColor",
      "cardBg",
      "cardBorder",
      "draggerBg",
      "draggerBgHover",
      "draggerBorder",
      "draggerBorderActive",
      "draggerIconColor",
      "draggerTextColor",
      "errorBorder",
      "fileBg",
      "fileColor",
      "fileRemoveColor",
      "previewBackdrop",
      "previewOverlay",
      "progressBar",
      "progressTrack",
    ])
  ),
});

export { controls };
