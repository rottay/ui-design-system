export interface BrandSelectChrome {
  /** Trigger */
  bg?: string;
  bgHover?: string;
  bgFocus?: string;
  color?: string;
  colorPlaceholder?: string;
  borderColor?: string;
  borderColorHover?: string;
  borderColorFocus?: string;
  /** Dropdown panel */
  dropdownBg?: string;
  dropdownBorderColor?: string;
  dropdownShadow?: string;
  /** Options */
  optionBgHover?: string;
  optionBgSelected?: string;
  optionColor?: string;
  optionColorSelected?: string;
  /**
   * ROTTAY-T2 MASS. The eighteen select channels the rottay extension still
   * declared after the T1 P0 repair, now typed.
   *
   * `border` is NOT `borderColor`. The two are different channels with
   * different readers: `--ds-select-border-color` is the colour channel the
   * C3 keyset already owned, and `--ds-select-border` is the shorthand the
   * rustic-shaped select stylesheet resolves from it. Folding them together
   * would silently drop one of the two readers, so both stay.
   */
  arrowColor?: string;
  bgDisabled?: string;
  border?: string;
  borderFocus?: string;
  borderHover?: string;
  checkColor?: string;
  clearColor?: string;
  clearColorHover?: string;
  colorDisabled?: string;
  /** Panel border shorthand, distinct from `dropdownBorderColor` above. */
  dropdownBorder?: string;
  errorBorder?: string;
  filledBg?: string;
  optionColorDisabled?: string;
  shadowFocus?: string;
  successBorder?: string;
  tagBg?: string;
  tagColor?: string;
  warningBorder?: string;
}

/**
 * ROTTAY-T2 MASS -- twelve control families given a typed owner.
 *
 * Every field below is a public `--ds-*` channel that the rottay artifact
 * extension declared by hand until this tranche. The interfaces are closed:
 * a channel with no field cannot be authored, and a field with no channel
 * cannot exist, because the lowering in
 * `compilers/kernel/foundation/css/chrome-variables` is the single producer
 * for BOTH the static `FlatTheme` and the DB `TenantThemeDocument`
 * transports.
 */
/**
 * Type-ahead field. A combobox that files its own dropdown, empty-state ink
 * and clear affordance; it does not inherit `select` because the two families
 * paint different panels and the extension declared both separately.
 */
export interface BrandAutocompleteChrome {
  /** `--ds-auto-complete-bg` */
  bg?: string;
  /** `--ds-auto-complete-border` */
  border?: string;
  /** `--ds-auto-complete-border-focus` */
  borderFocus?: string;
  /** `--ds-auto-complete-clear-color` */
  clearColor?: string;
  /** `--ds-auto-complete-dropdown-bg` */
  dropdownBg?: string;
  /** `--ds-auto-complete-dropdown-shadow` */
  dropdownShadow?: string;
  /** `--ds-auto-complete-empty-color` */
  emptyColor?: string;
  /** `--ds-auto-complete-error-border` */
  errorBorder?: string;
  /** `--ds-auto-complete-option-bg-hover` */
  optionBgHover?: string;
  /** `--ds-auto-complete-warning-border` */
  warningBorder?: string;
}

/**
 * Binary tick. Owns its box, its checked ground, its focus ring COLOR as a
 * channel independent of the composed ring, and the label ink beside it.
 */
export interface BrandCheckboxChrome {
  /** `--ds-checkbox-bg` */
  bg?: string;
  /** `--ds-checkbox-bg-disabled` */
  bgDisabled?: string;
  /** `--ds-checkbox-border` */
  border?: string;
  /** `--ds-checkbox-border-hover` */
  borderHover?: string;
  /** `--ds-checkbox-checked-bg` */
  checkedBg?: string;
  /** `--ds-checkbox-checked-border` */
  checkedBorder?: string;
  /** `--ds-checkbox-checked-color` */
  checkedColor?: string;
  /** `--ds-checkbox-error-border` */
  errorBorder?: string;
  /** `--ds-checkbox-error-color` */
  errorColor?: string;
  /** `--ds-checkbox-focus-ring` */
  focusRing?: string;
  /** `--ds-checkbox-focus-ring-color` */
  focusRingColor?: string;
  /** `--ds-checkbox-label-color` */
  labelColor?: string;
  /** `--ds-checkbox-label-color-disabled` */
  labelColorDisabled?: string;
}

/**
 * Date field. A field-shaped control with an icon, a range separator and a
 * clear affordance the plain input has no term for. Lowers to the
 * `--ds-date-picker-*` family namespace.
 */
export interface BrandDatePickerChrome {
  /** `--ds-date-picker-bg` */
  bg?: string;
  /** `--ds-date-picker-bg-disabled` */
  bgDisabled?: string;
  /** `--ds-date-picker-border` */
  border?: string;
  /** `--ds-date-picker-border-focus` */
  borderFocus?: string;
  /** `--ds-date-picker-border-hover` */
  borderHover?: string;
  /** `--ds-date-picker-clear-color` */
  clearColor?: string;
  /** `--ds-date-picker-color` */
  color?: string;
  /** `--ds-date-picker-error-border` */
  errorBorder?: string;
  /** `--ds-date-picker-icon-color` */
  iconColor?: string;
  /** `--ds-date-picker-separator-color` */
  separatorColor?: string;
  /** `--ds-date-picker-shadow-focus` */
  shadowFocus?: string;
  /** `--ds-date-picker-warning-border` */
  warningBorder?: string;
}

/**
 * Numeric stepper. Shares the field grammar with `input` but owns addon,
 * affix and stepper-control ink of its own. Lowers to `--ds-input-number-*`.
 *
 * There is no `controlBg` field: the extension declared
 * `--ds-input-number-control-bg: transparent` in both modes, which is exactly
 * what the cascade already resolves. Typing a field for it would create an
 * authority for a value nobody is authoring.
 */
export interface BrandInputNumberChrome {
  /** `--ds-input-number-addon-bg` */
  addonBg?: string;
  /** `--ds-input-number-addon-border` */
  addonBorder?: string;
  /** `--ds-input-number-addon-color` */
  addonColor?: string;
  /** `--ds-input-number-affix-color` */
  affixColor?: string;
  /** `--ds-input-number-bg` */
  bg?: string;
  /** `--ds-input-number-bg-disabled` */
  bgDisabled?: string;
  /** `--ds-input-number-border` */
  border?: string;
  /** `--ds-input-number-border-focus` */
  borderFocus?: string;
  /** `--ds-input-number-color` */
  color?: string;
  /** `--ds-input-number-control-color` */
  controlColor?: string;
  /** `--ds-input-number-error-border` */
  errorBorder?: string;
  /** `--ds-input-number-shadow-focus` */
  shadowFocus?: string;
  /** `--ds-input-number-warning-border` */
  warningBorder?: string;
}

/**
 * Single choice. Distinct from `checkbox`: the checked mark is a dot with its
 * own channel, and a radio row carries a description ink a checkbox has no
 * slot for.
 */
export interface BrandRadioChrome {
  /** `--ds-radio-bg` */
  bg?: string;
  /** `--ds-radio-bg-disabled` */
  bgDisabled?: string;
  /** `--ds-radio-border` */
  border?: string;
  /** `--ds-radio-border-hover` */
  borderHover?: string;
  /** `--ds-radio-checked-bg` */
  checkedBg?: string;
  /** `--ds-radio-checked-border` */
  checkedBorder?: string;
  /** `--ds-radio-checked-dot` */
  checkedDot?: string;
  /** `--ds-radio-description-color` */
  descriptionColor?: string;
  /** `--ds-radio-error-border` */
  errorBorder?: string;
  /** `--ds-radio-error-color` */
  errorColor?: string;
  /** `--ds-radio-focus-ring` */
  focusRing?: string;
  /** `--ds-radio-focus-ring-color` */
  focusRingColor?: string;
  /** `--ds-radio-label-color` */
  labelColor?: string;
  /** `--ds-radio-label-color-disabled` */
  labelColorDisabled?: string;
}

/**
 * Star rating. ONE field. `--ds-rate-color-active` and
 * `--ds-rate-color-hover` are not here because both modes declared the same
 * literal the cascade already produces; only the resting ink diverges.
 */
export interface BrandRateChrome {
  /** `--ds-rate-color` */
  color?: string;
}

/**
 * Range control: rail, filled track, handle, and the tick-mark ink.
 */
export interface BrandSliderChrome {
  /** `--ds-slider-focus-ring` */
  focusRing?: string;
  /** `--ds-slider-handle-bg` */
  handleBg?: string;
  /** `--ds-slider-handle-bg-disabled` */
  handleBgDisabled?: string;
  /** `--ds-slider-handle-border` */
  handleBorder?: string;
  /** `--ds-slider-handle-shadow` */
  handleShadow?: string;
  /** `--ds-slider-mark-color` */
  markColor?: string;
  /** `--ds-slider-rail-color` */
  railColor?: string;
  /** `--ds-slider-track-color` */
  trackColor?: string;
  /** `--ds-slider-track-color-disabled` */
  trackColorDisabled?: string;
}

/**
 * iOS-style switch. Separate family from `toggle`: this one paints a track and
 * a thumb, `toggle` paints a track and a dot plus semantic status grounds.
 */
export interface BrandSwitchChrome {
  /** `--ds-switch-bg` */
  bg?: string;
  /** `--ds-switch-bg-hover` */
  bgHover?: string;
  /** `--ds-switch-checked-bg` */
  checkedBg?: string;
  /** `--ds-switch-checked-bg-hover` */
  checkedBgHover?: string;
  /** `--ds-switch-focus-ring` */
  focusRing?: string;
  /** `--ds-switch-thumb-bg` */
  thumbBg?: string;
  /** `--ds-switch-thumb-shadow` */
  thumbShadow?: string;
}

/**
 * Time field. Same shape as `datePicker`, different family, own channels.
 * Lowers to the `--ds-time-picker-*` family namespace.
 */
export interface BrandTimePickerChrome {
  /** `--ds-time-picker-bg` */
  bg?: string;
  /** `--ds-time-picker-bg-disabled` */
  bgDisabled?: string;
  /** `--ds-time-picker-border` */
  border?: string;
  /** `--ds-time-picker-border-focus` */
  borderFocus?: string;
  /** `--ds-time-picker-clear-color` */
  clearColor?: string;
  /** `--ds-time-picker-color` */
  color?: string;
  /** `--ds-time-picker-error-border` */
  errorBorder?: string;
  /** `--ds-time-picker-icon-color` */
  iconColor?: string;
  /** `--ds-time-picker-separator-color` */
  separatorColor?: string;
  /** `--ds-time-picker-shadow-focus` */
  shadowFocus?: string;
  /** `--ds-time-picker-warning-border` */
  warningBorder?: string;
}

/**
 * Labelled toggle row. Owns semantic status grounds (`successBg`,
 * `warningBg`, `errorBg`) and the inner label ink that rides on the track --
 * neither of which the plain `switch` has a term for.
 */
export interface BrandToggleChrome {
  /** `--ds-toggle-description-color` */
  descriptionColor?: string;
  /** `--ds-toggle-dot-bg` */
  dotBg?: string;
  /** `--ds-toggle-dot-shadow` */
  dotShadow?: string;
  /** `--ds-toggle-error-bg` */
  errorBg?: string;
  /** `--ds-toggle-error-color` */
  errorColor?: string;
  /** `--ds-toggle-focus-ring` */
  focusRing?: string;
  /** `--ds-toggle-inner-label-color` */
  innerLabelColor?: string;
  /** `--ds-toggle-label-color` */
  labelColor?: string;
  /** `--ds-toggle-success-bg` */
  successBg?: string;
  /** `--ds-toggle-track-bg` */
  trackBg?: string;
  /** `--ds-toggle-track-bg-checked` */
  trackBgChecked?: string;
  /** `--ds-toggle-warning-bg` */
  warningBg?: string;
}

/**
 * Dual-list transfer. Two panels with a header each; five channels total.
 */
export interface BrandTransferChrome {
  /** `--ds-transfer-bg` */
  bg?: string;
  /** `--ds-transfer-border` */
  border?: string;
  /** `--ds-transfer-header-bg` */
  headerBg?: string;
  /** `--ds-transfer-header-border` */
  headerBorder?: string;
  /** `--ds-transfer-item-bg-hover` */
  itemBgHover?: string;
}

/**
 * File upload. The widest family in this tranche: a dropzone (dragger), a
 * trigger button, a file list, card previews, a progress meter and a preview
 * overlay, each with its own channels.
 */
export interface BrandUploadChrome {
  /** `--ds-upload-bg` */
  bg?: string;
  /** `--ds-upload-border` */
  border?: string;
  /** `--ds-upload-border-hover` */
  borderHover?: string;
  /** `--ds-upload-button-bg` */
  buttonBg?: string;
  /** `--ds-upload-button-border` */
  buttonBorder?: string;
  /** `--ds-upload-button-color` */
  buttonColor?: string;
  /** `--ds-upload-card-bg` */
  cardBg?: string;
  /** `--ds-upload-card-border` */
  cardBorder?: string;
  /** `--ds-upload-dragger-bg` */
  draggerBg?: string;
  /** `--ds-upload-dragger-bg-hover` */
  draggerBgHover?: string;
  /** `--ds-upload-dragger-border` */
  draggerBorder?: string;
  /** `--ds-upload-dragger-border-active` */
  draggerBorderActive?: string;
  /** `--ds-upload-dragger-icon-color` */
  draggerIconColor?: string;
  /** `--ds-upload-dragger-text-color` */
  draggerTextColor?: string;
  /** `--ds-upload-error-border` */
  errorBorder?: string;
  /** `--ds-upload-file-bg` */
  fileBg?: string;
  /** `--ds-upload-file-color` */
  fileColor?: string;
  /** `--ds-upload-file-remove-color` */
  fileRemoveColor?: string;
  /** `--ds-upload-preview-backdrop` */
  previewBackdrop?: string;
  /** `--ds-upload-preview-overlay` */
  previewOverlay?: string;
  /** `--ds-upload-progress-bar` */
  progressBar?: string;
  /** `--ds-upload-progress-track` */
  progressTrack?: string;
}

export interface BrandInputChrome {
  bg?: string;
  bgHover?: string;
  bgFocus?: string;
  bgDisabled?: string;
  color?: string;
  colorPlaceholder?: string;
  colorDisabled?: string;
  border?: string;
  borderHover?: string;
  borderFocus?: string;
  borderDisabled?: string;
  /**
   * Border COLOR channel, upstream of the shorthand `border*` fields above.
   * `input.css` resolves `--ds-input-border` from `--ds-input-border-color`, so
   * a brand that only paints the colour authors these and leaves the shorthand
   * to the base layer. `borderColorDisabled` already flows from
   * `controls.disabled.borderColor` and is not restated here.
   */
  borderColor?: string;
  borderColorHover?: string;
  borderColorFocus?: string;
  disabledOpacity?: number;
  shadowRest?: string;
  shadowHover?: string;
  shadowFocus?: string;
  insetShadow?: string;
  caretColor?: string;
  selectionBg?: string;
  selectionColor?: string;
  placeholderOpacity?: number;
  /** Filled variant */
  filled?: { bg?: string; bgHover?: string; bgFocus?: string; border?: string };
  /** Addon (prefix/suffix) */
  addon?: {
    bg?: string;
    color?: string;
    border?: string;
    radius?: string;
    fontWeight?: string | number;
  };
  /** Inline prefix/suffix treatment inside the field shell. */
  affix?: { bg?: string; color?: string; border?: string; paddingX?: string };
  /** Label */
  label?: { color?: string; requiredColor?: string; disabledColor?: string };
  /** Helper and validation message text */
  helper?: {
    color?: string;
    errorColor?: string;
    errorFontWeight?: string | number;
  };
  /** Clear button */
  clear?: {
    color?: string;
    colorHover?: string;
    bg?: string;
    bgHover?: string;
    border?: string;
    borderHover?: string;
    shadowHover?: string;
    focusRing?: string;
    activeTransform?: string;
  };
  readOnly?: {
    bg?: string;
    color?: string;
    border?: string;
    borderStyle?: string;
    cursor?: string;
  };
  loadingColor?: string;
  autofill?: { bg?: string; color?: string; caret?: string };
  count?: { color?: string; colorWarning?: string; colorError?: string };
  /** Validation states */
  successBorder?: string;
  successBg?: string;
  successShadowFocus?: string;
  warningBorder?: string;
  warningBg?: string;
  warningShadowFocus?: string;
  errorBorder?: string;
  errorBg?: string;
  errorShadowFocus?: string;
  errorColor?: string;
}
