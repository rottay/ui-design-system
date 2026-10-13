import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";

function setInputVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.controls) {
    const c = chrome.controls;
    // Input chrome (full)
    if (c.input) {
      const i = c.input;
      if (i.bg) vars["--ds-input-bg"] = i.bg;
      if (i.bgHover) vars["--ds-input-bg-hover"] = i.bgHover;
      if (i.bgFocus) vars["--ds-input-bg-focus"] = i.bgFocus;
      if (i.bgDisabled) vars["--ds-input-bg-disabled"] = i.bgDisabled;
      if (i.color) vars["--ds-input-color"] = i.color;
      if (i.colorPlaceholder)
        vars["--ds-input-color-placeholder"] = i.colorPlaceholder;
      if (i.colorDisabled) vars["--ds-input-color-disabled"] = i.colorDisabled;
      if (i.border) vars["--ds-input-border"] = i.border;
      if (i.borderHover) vars["--ds-input-border-hover"] = i.borderHover;
      if (i.borderFocus) vars["--ds-input-border-focus"] = i.borderFocus;
      if (i.borderDisabled)
        vars["--ds-input-border-disabled"] = i.borderDisabled;
      if (i.borderColor) vars["--ds-input-border-color"] = i.borderColor;
      if (i.borderColorHover)
        vars["--ds-input-border-color-hover"] = i.borderColorHover;
      if (i.borderColorFocus)
        vars["--ds-input-border-color-focus"] = i.borderColorFocus;
      if (i.disabledOpacity != null)
        vars["--ds-input-disabled-opacity"] = String(i.disabledOpacity);
      if (i.shadowRest) vars["--ds-input-shadow-rest"] = i.shadowRest;
      if (i.shadowHover) vars["--ds-input-shadow-hover"] = i.shadowHover;
      if (i.shadowFocus) vars["--ds-input-shadow-focus"] = i.shadowFocus;
      if (i.insetShadow) vars["--ds-input-inset-shadow"] = i.insetShadow;
      if (i.caretColor) vars["--ds-input-caret-color"] = i.caretColor;
      if (i.selectionBg) vars["--ds-input-selection-bg"] = i.selectionBg;
      if (i.selectionColor)
        vars["--ds-input-selection-color"] = i.selectionColor;
      if (i.placeholderOpacity != null)
        vars["--ds-input-placeholder-opacity"] = String(i.placeholderOpacity);
      if (i.filled) {
        if (i.filled.bg) vars["--ds-input-filled-bg"] = i.filled.bg;
        if (i.filled.bgHover)
          vars["--ds-input-filled-bg-hover"] = i.filled.bgHover;
        if (i.filled.bgFocus)
          vars["--ds-input-filled-bg-focus"] = i.filled.bgFocus;
        if (i.filled.border) vars["--ds-input-filled-border"] = i.filled.border;
      }
      if (i.addon) {
        if (i.addon.bg) vars["--ds-input-addon-bg"] = i.addon.bg;
        if (i.addon.color) vars["--ds-input-addon-color"] = i.addon.color;
        if (i.addon.border) vars["--ds-input-addon-border"] = i.addon.border;
        if (i.addon.radius) vars["--ds-input-addon-radius"] = i.addon.radius;
        if (i.addon.fontWeight != null)
          vars["--ds-input-addon-font-weight"] = String(i.addon.fontWeight);
      }
      if (i.affix) {
        if (i.affix.bg) vars["--ds-input-affix-bg"] = i.affix.bg;
        if (i.affix.color) vars["--ds-input-affix-color"] = i.affix.color;
        if (i.affix.border) vars["--ds-input-affix-border"] = i.affix.border;
        if (i.affix.paddingX)
          vars["--ds-input-affix-padding-x"] = i.affix.paddingX;
      }
      if (i.label?.color) vars["--ds-input-label-color"] = i.label.color;
      if (i.label?.requiredColor)
        vars["--ds-input-label-required-color"] = i.label.requiredColor;
      if (i.label?.disabledColor)
        vars["--ds-input-label-color-disabled"] = i.label.disabledColor;
      if (i.helper?.color) vars["--ds-input-helper-color"] = i.helper.color;
      if (i.helper?.errorColor)
        vars["--ds-input-error-message-color"] = i.helper.errorColor;
      if (i.helper?.errorFontWeight != null)
        vars["--ds-input-error-message-font-weight"] = String(
          i.helper.errorFontWeight
        );
      if (i.clear) {
        if (i.clear.color) vars["--ds-input-clear-color"] = i.clear.color;
        if (i.clear.colorHover)
          vars["--ds-input-clear-color-hover"] = i.clear.colorHover;
        if (i.clear.bg) vars["--ds-input-clear-bg"] = i.clear.bg;
        if (i.clear.bgHover)
          vars["--ds-input-clear-bg-hover"] = i.clear.bgHover;
        if (i.clear.border) vars["--ds-input-clear-border"] = i.clear.border;
        if (i.clear.borderHover)
          vars["--ds-input-clear-border-hover"] = i.clear.borderHover;
        if (i.clear.shadowHover)
          vars["--ds-input-action-shadow-hover"] = i.clear.shadowHover;
        if (i.clear.focusRing)
          vars["--ds-input-action-focus-ring"] = i.clear.focusRing;
        if (i.clear.activeTransform)
          vars["--ds-input-action-active-transform"] = i.clear.activeTransform;
      }
      if (i.readOnly) {
        if (i.readOnly.bg) vars["--ds-input-readonly-bg"] = i.readOnly.bg;
        if (i.readOnly.color)
          vars["--ds-input-readonly-color"] = i.readOnly.color;
        if (i.readOnly.border)
          vars["--ds-input-readonly-border"] = i.readOnly.border;
        if (i.readOnly.borderStyle)
          vars["--ds-input-readonly-border-style"] = i.readOnly.borderStyle;
        if (i.readOnly.cursor)
          vars["--ds-input-readonly-cursor"] = i.readOnly.cursor;
      }
      if (i.loadingColor) vars["--ds-input-loading-color"] = i.loadingColor;
      if (i.autofill) {
        if (i.autofill.bg) vars["--ds-input-autofill-bg"] = i.autofill.bg;
        if (i.autofill.color)
          vars["--ds-input-autofill-color"] = i.autofill.color;
        if (i.autofill.caret)
          vars["--ds-input-autofill-caret"] = i.autofill.caret;
      }
      if (i.count) {
        if (i.count.color) vars["--ds-input-count-color"] = i.count.color;
        if (i.count.colorWarning)
          vars["--ds-input-count-color-warning"] = i.count.colorWarning;
        if (i.count.colorError)
          vars["--ds-input-count-color-error"] = i.count.colorError;
      }
      if (i.successBorder) vars["--ds-input-success-border"] = i.successBorder;
      if (i.successBg) vars["--ds-input-success-bg"] = i.successBg;
      if (i.successShadowFocus)
        vars["--ds-input-success-shadow-focus"] = i.successShadowFocus;
      if (i.warningBorder) vars["--ds-input-warning-border"] = i.warningBorder;
      if (i.warningBg) vars["--ds-input-warning-bg"] = i.warningBg;
      if (i.warningShadowFocus)
        vars["--ds-input-warning-shadow-focus"] = i.warningShadowFocus;
      if (i.errorBorder) vars["--ds-input-error-border"] = i.errorBorder;
      if (i.errorBg) vars["--ds-input-error-bg"] = i.errorBg;
      if (i.errorShadowFocus)
        vars["--ds-input-error-shadow-focus"] = i.errorShadowFocus;
      if (i.errorColor) vars["--ds-input-error-color"] = i.errorColor;
    }
  }
}

function setSelectVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.controls) {
    const c = chrome.controls;
    // Select / combobox (trigger + dropdown panel + options)
    if (c.select) {
      const s = c.select;
      if (s.bg) vars["--ds-select-bg"] = s.bg;
      if (s.bgHover) vars["--ds-select-bg-hover"] = s.bgHover;
      if (s.bgFocus) vars["--ds-select-bg-focus"] = s.bgFocus;
      if (s.color) vars["--ds-select-color"] = s.color;
      if (s.colorPlaceholder)
        vars["--ds-select-color-placeholder"] = s.colorPlaceholder;
      if (s.borderColor) vars["--ds-select-border-color"] = s.borderColor;
      if (s.borderColorHover)
        vars["--ds-select-border-color-hover"] = s.borderColorHover;
      if (s.borderColorFocus)
        vars["--ds-select-border-color-focus"] = s.borderColorFocus;
      if (s.dropdownBg) vars["--ds-select-dropdown-bg"] = s.dropdownBg;
      if (s.dropdownBorderColor)
        vars["--ds-select-dropdown-border-color"] = s.dropdownBorderColor;
      if (s.dropdownShadow)
        vars["--ds-select-dropdown-shadow"] = s.dropdownShadow;
      if (s.optionBgHover)
        vars["--ds-select-option-bg-hover"] = s.optionBgHover;
      if (s.optionBgSelected)
        vars["--ds-select-option-bg-selected"] = s.optionBgSelected;
      if (s.optionColor) vars["--ds-select-option-color"] = s.optionColor;
      if (s.optionColorSelected)
        vars["--ds-select-option-color-selected"] = s.optionColorSelected;
      // ROTTAY-T2 MASS. `border` and `borderColor` are different channels
      // with different readers; both are lowered, neither is derived from the
      // other here.
      if (s.arrowColor) vars["--ds-select-arrow-color"] = s.arrowColor;
      if (s.bgDisabled) vars["--ds-select-bg-disabled"] = s.bgDisabled;
      if (s.border) vars["--ds-select-border"] = s.border;
      if (s.borderFocus) vars["--ds-select-border-focus"] = s.borderFocus;
      if (s.borderHover) vars["--ds-select-border-hover"] = s.borderHover;
      if (s.checkColor) vars["--ds-select-check-color"] = s.checkColor;
      if (s.clearColor) vars["--ds-select-clear-color"] = s.clearColor;
      if (s.clearColorHover)
        vars["--ds-select-clear-color-hover"] = s.clearColorHover;
      if (s.colorDisabled) vars["--ds-select-color-disabled"] = s.colorDisabled;
      if (s.dropdownBorder)
        vars["--ds-select-dropdown-border"] = s.dropdownBorder;
      if (s.errorBorder) vars["--ds-select-error-border"] = s.errorBorder;
      if (s.filledBg) vars["--ds-select-filled-bg"] = s.filledBg;
      if (s.optionColorDisabled)
        vars["--ds-select-option-color-disabled"] = s.optionColorDisabled;
      if (s.shadowFocus) vars["--ds-select-shadow-focus"] = s.shadowFocus;
      if (s.successBorder) vars["--ds-select-success-border"] = s.successBorder;
      if (s.tagBg) vars["--ds-select-tag-bg"] = s.tagBg;
      if (s.tagColor) vars["--ds-select-tag-color"] = s.tagColor;
      if (s.warningBorder) vars["--ds-select-warning-border"] = s.warningBorder;
    }
  }
}

function setFieldFamilyVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.controls) {
    const c = chrome.controls;
    // autocomplete
    if (c.autocomplete) {
      const ac = c.autocomplete;
      if (ac.bg) vars["--ds-auto-complete-bg"] = ac.bg;
      if (ac.border) vars["--ds-auto-complete-border"] = ac.border;
      if (ac.borderFocus)
        vars["--ds-auto-complete-border-focus"] = ac.borderFocus;
      if (ac.clearColor) vars["--ds-auto-complete-clear-color"] = ac.clearColor;
      if (ac.dropdownBg) vars["--ds-auto-complete-dropdown-bg"] = ac.dropdownBg;
      if (ac.dropdownShadow)
        vars["--ds-auto-complete-dropdown-shadow"] = ac.dropdownShadow;
      if (ac.emptyColor) vars["--ds-auto-complete-empty-color"] = ac.emptyColor;
      if (ac.errorBorder)
        vars["--ds-auto-complete-error-border"] = ac.errorBorder;
      if (ac.optionBgHover)
        vars["--ds-auto-complete-option-bg-hover"] = ac.optionBgHover;
      if (ac.warningBorder)
        vars["--ds-auto-complete-warning-border"] = ac.warningBorder;
    }

    // checkbox
    if (c.checkbox) {
      const cb = c.checkbox;
      if (cb.bg) vars["--ds-checkbox-bg"] = cb.bg;
      if (cb.bgDisabled) vars["--ds-checkbox-bg-disabled"] = cb.bgDisabled;
      if (cb.border) vars["--ds-checkbox-border"] = cb.border;
      if (cb.borderHover) vars["--ds-checkbox-border-hover"] = cb.borderHover;
      if (cb.checkedBg) vars["--ds-checkbox-checked-bg"] = cb.checkedBg;
      if (cb.checkedBorder)
        vars["--ds-checkbox-checked-border"] = cb.checkedBorder;
      if (cb.checkedColor)
        vars["--ds-checkbox-checked-color"] = cb.checkedColor;
      if (cb.errorBorder) vars["--ds-checkbox-error-border"] = cb.errorBorder;
      if (cb.errorColor) vars["--ds-checkbox-error-color"] = cb.errorColor;
      if (cb.focusRing) vars["--ds-checkbox-focus-ring"] = cb.focusRing;
      if (cb.focusRingColor)
        vars["--ds-checkbox-focus-ring-color"] = cb.focusRingColor;
      if (cb.labelColor) vars["--ds-checkbox-label-color"] = cb.labelColor;
      if (cb.labelColorDisabled)
        vars["--ds-checkbox-label-color-disabled"] = cb.labelColorDisabled;
    }

    // datepicker
    if (c.datePicker) {
      const dp = c.datePicker;
      if (dp.bg) vars["--ds-date-picker-bg"] = dp.bg;
      if (dp.bgDisabled) vars["--ds-date-picker-bg-disabled"] = dp.bgDisabled;
      if (dp.border) vars["--ds-date-picker-border"] = dp.border;
      if (dp.borderFocus) vars["--ds-date-picker-border-focus"] = dp.borderFocus;
      if (dp.borderHover) vars["--ds-date-picker-border-hover"] = dp.borderHover;
      if (dp.clearColor) vars["--ds-date-picker-clear-color"] = dp.clearColor;
      if (dp.color) vars["--ds-date-picker-color"] = dp.color;
      if (dp.errorBorder) vars["--ds-date-picker-error-border"] = dp.errorBorder;
      if (dp.iconColor) vars["--ds-date-picker-icon-color"] = dp.iconColor;
      if (dp.separatorColor)
        vars["--ds-date-picker-separator-color"] = dp.separatorColor;
      if (dp.shadowFocus) vars["--ds-date-picker-shadow-focus"] = dp.shadowFocus;
      if (dp.warningBorder)
        vars["--ds-date-picker-warning-border"] = dp.warningBorder;
    }

    // inputnumber
    if (c.inputNumber) {
      const nu = c.inputNumber;
      if (nu.addonBg) vars["--ds-input-number-addon-bg"] = nu.addonBg;
      if (nu.addonBorder)
        vars["--ds-input-number-addon-border"] = nu.addonBorder;
      if (nu.addonColor) vars["--ds-input-number-addon-color"] = nu.addonColor;
      if (nu.affixColor) vars["--ds-input-number-affix-color"] = nu.affixColor;
      if (nu.bg) vars["--ds-input-number-bg"] = nu.bg;
      if (nu.bgDisabled) vars["--ds-input-number-bg-disabled"] = nu.bgDisabled;
      if (nu.border) vars["--ds-input-number-border"] = nu.border;
      if (nu.borderFocus)
        vars["--ds-input-number-border-focus"] = nu.borderFocus;
      if (nu.color) vars["--ds-input-number-color"] = nu.color;
      if (nu.controlColor)
        vars["--ds-input-number-control-color"] = nu.controlColor;
      if (nu.errorBorder)
        vars["--ds-input-number-error-border"] = nu.errorBorder;
      if (nu.shadowFocus)
        vars["--ds-input-number-shadow-focus"] = nu.shadowFocus;
      if (nu.warningBorder)
        vars["--ds-input-number-warning-border"] = nu.warningBorder;
    }

    // radio
    if (c.radio) {
      const rd = c.radio;
      if (rd.bg) vars["--ds-radio-bg"] = rd.bg;
      if (rd.bgDisabled) vars["--ds-radio-bg-disabled"] = rd.bgDisabled;
      if (rd.border) vars["--ds-radio-border"] = rd.border;
      if (rd.borderHover) vars["--ds-radio-border-hover"] = rd.borderHover;
      if (rd.checkedBg) vars["--ds-radio-checked-bg"] = rd.checkedBg;
      if (rd.checkedBorder)
        vars["--ds-radio-checked-border"] = rd.checkedBorder;
      if (rd.checkedDot) vars["--ds-radio-checked-dot"] = rd.checkedDot;
      if (rd.descriptionColor)
        vars["--ds-radio-description-color"] = rd.descriptionColor;
      if (rd.errorBorder) vars["--ds-radio-error-border"] = rd.errorBorder;
      if (rd.errorColor) vars["--ds-radio-error-color"] = rd.errorColor;
      if (rd.focusRing) vars["--ds-radio-focus-ring"] = rd.focusRing;
      if (rd.focusRingColor)
        vars["--ds-radio-focus-ring-color"] = rd.focusRingColor;
      if (rd.labelColor) vars["--ds-radio-label-color"] = rd.labelColor;
      if (rd.labelColorDisabled)
        vars["--ds-radio-label-color-disabled"] = rd.labelColorDisabled;
    }

    // rate
    if (c.rate) {
      const rt = c.rate;
      if (rt.color) vars["--ds-rate-color"] = rt.color;
    }

    // slider
    if (c.slider) {
      const sl = c.slider;
      if (sl.focusRing) vars["--ds-slider-focus-ring"] = sl.focusRing;
      if (sl.handleBg) vars["--ds-slider-handle-bg"] = sl.handleBg;
      if (sl.handleBgDisabled)
        vars["--ds-slider-handle-bg-disabled"] = sl.handleBgDisabled;
      if (sl.handleBorder) vars["--ds-slider-handle-border"] = sl.handleBorder;
      if (sl.handleShadow) vars["--ds-slider-handle-shadow"] = sl.handleShadow;
      if (sl.markColor) vars["--ds-slider-mark-color"] = sl.markColor;
      if (sl.railColor) vars["--ds-slider-rail-color"] = sl.railColor;
      if (sl.trackColor) vars["--ds-slider-track-color"] = sl.trackColor;
      if (sl.trackColorDisabled)
        vars["--ds-slider-track-color-disabled"] = sl.trackColorDisabled;
    }

    // switch
    if (c.switch) {
      const sw = c.switch;
      if (sw.bg) vars["--ds-switch-bg"] = sw.bg;
      if (sw.bgHover) vars["--ds-switch-bg-hover"] = sw.bgHover;
      if (sw.checkedBg) vars["--ds-switch-checked-bg"] = sw.checkedBg;
      if (sw.checkedBgHover)
        vars["--ds-switch-checked-bg-hover"] = sw.checkedBgHover;
      if (sw.focusRing) vars["--ds-switch-focus-ring"] = sw.focusRing;
      if (sw.thumbBg) vars["--ds-switch-thumb-bg"] = sw.thumbBg;
      if (sw.thumbShadow) vars["--ds-switch-thumb-shadow"] = sw.thumbShadow;
    }

    // timepicker
    if (c.timePicker) {
      const tp = c.timePicker;
      if (tp.bg) vars["--ds-time-picker-bg"] = tp.bg;
      if (tp.bgDisabled) vars["--ds-time-picker-bg-disabled"] = tp.bgDisabled;
      if (tp.border) vars["--ds-time-picker-border"] = tp.border;
      if (tp.borderFocus) vars["--ds-time-picker-border-focus"] = tp.borderFocus;
      if (tp.clearColor) vars["--ds-time-picker-clear-color"] = tp.clearColor;
      if (tp.color) vars["--ds-time-picker-color"] = tp.color;
      if (tp.errorBorder) vars["--ds-time-picker-error-border"] = tp.errorBorder;
      if (tp.iconColor) vars["--ds-time-picker-icon-color"] = tp.iconColor;
      if (tp.separatorColor)
        vars["--ds-time-picker-separator-color"] = tp.separatorColor;
      if (tp.shadowFocus) vars["--ds-time-picker-shadow-focus"] = tp.shadowFocus;
      if (tp.warningBorder)
        vars["--ds-time-picker-warning-border"] = tp.warningBorder;
    }

    // toggle
    if (c.toggle) {
      const tg = c.toggle;
      if (tg.descriptionColor)
        vars["--ds-toggle-description-color"] = tg.descriptionColor;
      if (tg.dotBg) vars["--ds-toggle-dot-bg"] = tg.dotBg;
      if (tg.dotShadow) vars["--ds-toggle-dot-shadow"] = tg.dotShadow;
      if (tg.errorBg) vars["--ds-toggle-error-bg"] = tg.errorBg;
      if (tg.errorColor) vars["--ds-toggle-error-color"] = tg.errorColor;
      if (tg.focusRing) vars["--ds-toggle-focus-ring"] = tg.focusRing;
      if (tg.innerLabelColor)
        vars["--ds-toggle-inner-label-color"] = tg.innerLabelColor;
      if (tg.labelColor) vars["--ds-toggle-label-color"] = tg.labelColor;
      if (tg.successBg) vars["--ds-toggle-success-bg"] = tg.successBg;
      if (tg.trackBg) vars["--ds-toggle-track-bg"] = tg.trackBg;
      if (tg.trackBgChecked)
        vars["--ds-toggle-track-bg-checked"] = tg.trackBgChecked;
      if (tg.warningBg) vars["--ds-toggle-warning-bg"] = tg.warningBg;
    }

    // transfer
    if (c.transfer) {
      const tf = c.transfer;
      if (tf.bg) vars["--ds-transfer-bg"] = tf.bg;
      if (tf.border) vars["--ds-transfer-border"] = tf.border;
      if (tf.headerBg) vars["--ds-transfer-header-bg"] = tf.headerBg;
      if (tf.headerBorder)
        vars["--ds-transfer-header-border"] = tf.headerBorder;
      if (tf.itemBgHover) vars["--ds-transfer-item-bg-hover"] = tf.itemBgHover;
    }

    // upload
    if (c.upload) {
      const up = c.upload;
      if (up.bg) vars["--ds-upload-bg"] = up.bg;
      if (up.border) vars["--ds-upload-border"] = up.border;
      if (up.borderHover) vars["--ds-upload-border-hover"] = up.borderHover;
      if (up.buttonBg) vars["--ds-upload-button-bg"] = up.buttonBg;
      if (up.buttonBorder) vars["--ds-upload-button-border"] = up.buttonBorder;
      if (up.buttonColor) vars["--ds-upload-button-color"] = up.buttonColor;
      if (up.cardBg) vars["--ds-upload-card-bg"] = up.cardBg;
      if (up.cardBorder) vars["--ds-upload-card-border"] = up.cardBorder;
      if (up.draggerBg) vars["--ds-upload-dragger-bg"] = up.draggerBg;
      if (up.draggerBgHover)
        vars["--ds-upload-dragger-bg-hover"] = up.draggerBgHover;
      if (up.draggerBorder)
        vars["--ds-upload-dragger-border"] = up.draggerBorder;
      if (up.draggerBorderActive)
        vars["--ds-upload-dragger-border-active"] = up.draggerBorderActive;
      if (up.draggerIconColor)
        vars["--ds-upload-dragger-icon-color"] = up.draggerIconColor;
      if (up.draggerTextColor)
        vars["--ds-upload-dragger-text-color"] = up.draggerTextColor;
      if (up.errorBorder) vars["--ds-upload-error-border"] = up.errorBorder;
      if (up.fileBg) vars["--ds-upload-file-bg"] = up.fileBg;
      if (up.fileColor) vars["--ds-upload-file-color"] = up.fileColor;
      if (up.fileRemoveColor)
        vars["--ds-upload-file-remove-color"] = up.fileRemoveColor;
      if (up.previewBackdrop)
        vars["--ds-upload-preview-backdrop"] = up.previewBackdrop;
      if (up.previewOverlay)
        vars["--ds-upload-preview-overlay"] = up.previewOverlay;
      if (up.progressBar) vars["--ds-upload-progress-bar"] = up.progressBar;
      if (up.progressTrack)
        vars["--ds-upload-progress-track"] = up.progressTrack;
    }
  }
}

export {
  setInputVars,
  setSelectVars,
  setFieldFamilyVars,
};
