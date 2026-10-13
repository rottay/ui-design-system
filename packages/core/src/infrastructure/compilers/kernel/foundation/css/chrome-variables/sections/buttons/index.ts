import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";

function setControlLeadVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.controls) {
    const c = chrome.controls;
    if (c.textarea) {
      const ta = c.textarea;
      if (ta.bg) vars["--ds-textarea-bg"] = ta.bg;
      if (ta.bgDisabled) vars["--ds-textarea-bg-disabled"] = ta.bgDisabled;
      if (ta.filledBg) vars["--ds-textarea-filled-bg"] = ta.filledBg;
      if (ta.border) vars["--ds-textarea-border"] = ta.border;
      if (ta.borderHover)
        vars["--ds-textarea-border-hover"] = ta.borderHover;
      if (ta.borderFocus)
        vars["--ds-textarea-border-focus"] = ta.borderFocus;
      if (ta.shadowFocus)
        vars["--ds-textarea-shadow-focus"] = ta.shadowFocus;
      if (ta.successBorder)
        vars["--ds-textarea-success-border"] = ta.successBorder;
      if (ta.warningBorder)
        vars["--ds-textarea-warning-border"] = ta.warningBorder;
      if (ta.errorBorder)
        vars["--ds-textarea-error-border"] = ta.errorBorder;
      if (ta.color) vars["--ds-textarea-color"] = ta.color;
      if (ta.colorPlaceholder)
        vars["--ds-textarea-color-placeholder"] = ta.colorPlaceholder;
      if (ta.countColor) vars["--ds-textarea-count-color"] = ta.countColor;
    }

    if (c.form) {
      const f = c.form;
      if (f.labelColor) vars["--ds-form-label-color"] = f.labelColor;
      if (f.labelFontWeight != null)
        vars["--ds-form-label-font-weight"] = String(f.labelFontWeight);
      if (f.helpColor) vars["--ds-form-help-color"] = f.helpColor;
      if (f.extraColor) vars["--ds-form-extra-color"] = f.extraColor;
      if (f.requiredColor) vars["--ds-form-required-color"] = f.requiredColor;
      if (f.successColor) vars["--ds-form-success-color"] = f.successColor;
      if (f.warningColor) vars["--ds-form-warning-color"] = f.warningColor;
      if (f.errorColor) vars["--ds-form-error-color"] = f.errorColor;
    }

    if (c.semantic) {
      const semantic = c.semantic;
      if (semantic.ink) vars["--ds-control-ink"] = semantic.ink;
      if (semantic.onBrand) vars["--ds-control-on-brand"] = semantic.onBrand;
      if (semantic.surface) vars["--ds-control-surface"] = semantic.surface;
      if (semantic.brandTint)
        vars["--ds-control-brand-tint"] = semantic.brandTint;
      if (semantic.brandBorder)
        vars["--ds-control-brand-border"] = semantic.brandBorder;
      if (semantic.iconTileBorder)
        vars["--ds-icon-tile-border"] = semantic.iconTileBorder;
    }
  }
}

function setButtonGeometryLeadVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.controls) {
    const c = chrome.controls;
    if (c.buttonGeometry) {
      const geometry = c.buttonGeometry;
      if (geometry.fontFamily)
        vars["--ds-button-font-family"] = geometry.fontFamily;
      if (geometry.fontWeight != null)
        vars["--ds-button-font-weight"] = String(geometry.fontWeight);
      if (geometry.letterSpacing)
        vars["--ds-button-letter-spacing"] = geometry.letterSpacing;
      if (geometry.textTransform)
        vars["--ds-button-text-transform"] = geometry.textTransform;
    }
  }
}

function setButtonGeometryTailVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.controls) {
    const c = chrome.controls;
    if (c.buttonGeometry) {
      const geometry = c.buttonGeometry;
      if (geometry.borderWidth)
        vars["--ds-button-border-width"] = geometry.borderWidth;
      if (geometry.touchTargetMin)
        vars["--ds-button-touch-target-min"] = geometry.touchTargetMin;
      if (geometry.groupGap) vars["--ds-button-group-gap"] = geometry.groupGap;
      if (geometry.groupMobileDirection)
        vars["--ds-button-group-mobile-direction"] =
          geometry.groupMobileDirection;
      if (geometry.groupMobileGap)
        vars["--ds-button-group-mobile-gap"] = geometry.groupMobileGap;
      if (geometry.groupMobileWidth)
        vars["--ds-button-group-mobile-width"] = geometry.groupMobileWidth;
      if (geometry.hoverTransform)
        vars["--ds-button-hover-transform"] = geometry.hoverTransform;
      if (geometry.activeTransform)
        vars["--ds-button-active-transform"] = geometry.activeTransform;
      if (geometry.iconHoverTransform)
        vars["--ds-button-icon-hover-transform"] = geometry.iconHoverTransform;
      if (geometry.iconActiveTransform)
        vars["--ds-button-icon-active-transform"] =
          geometry.iconActiveTransform;
      if (geometry.labelOffsetY)
        vars["--ds-button-label-offset-y"] = geometry.labelOffsetY;
      if (geometry.hoverFilter)
        vars["--ds-button-hover-filter"] = geometry.hoverFilter;
      if (geometry.activeFilter)
        vars["--ds-button-active-filter"] = geometry.activeFilter;
      if (geometry.focusRingOffset)
        vars["--ds-button-focus-ring-offset"] = geometry.focusRingOffset;
      if (geometry.spinnerDuration)
        vars["--ds-button-spinner-duration"] = geometry.spinnerDuration;
      if (geometry.surfaceHighlight)
        vars["--ds-button-surface-highlight"] = geometry.surfaceHighlight;
      if (geometry.surfaceHighlightOpacity)
        vars["--ds-button-surface-highlight-opacity"] =
          geometry.surfaceHighlightOpacity;
      if (geometry.surfaceHighlightHoverOpacity)
        vars["--ds-button-surface-highlight-hover-opacity"] =
          geometry.surfaceHighlightHoverOpacity;
      if (geometry.surfaceHighlightActiveOpacity)
        vars["--ds-button-surface-highlight-active-opacity"] =
          geometry.surfaceHighlightActiveOpacity;
      if (geometry.gradient) vars["--ds-button-gradient"] = geometry.gradient;
      if (geometry.aiTexture)
        vars["--ds-button-ai-texture"] = geometry.aiTexture;
      if (geometry.transitionDuration)
        vars["--ds-button-transition-duration"] = geometry.transitionDuration;
      if (geometry.transitionTiming)
        vars["--ds-button-transition-timing"] = geometry.transitionTiming;
    }
  }
}

function setFieldGeometryVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.controls) {
    const c = chrome.controls;
    if (c.fieldGeometry) {
      const geometry = c.fieldGeometry;
      if (geometry.gap) vars["--ds-input-gap"] = geometry.gap;
      if (geometry.radius) vars["--ds-radius-input"] = geometry.radius;
      if (geometry.fontFamily)
        vars["--ds-input-font-family"] = geometry.fontFamily;
      if (geometry.fontWeight != null)
        vars["--ds-input-font-weight"] = String(geometry.fontWeight);
      if (geometry.letterSpacing)
        vars["--ds-input-letter-spacing"] = geometry.letterSpacing;
      if (geometry.borderWidth)
        vars["--ds-input-border-width"] = geometry.borderWidth;
      if (geometry.borderStyle)
        vars["--ds-input-border-style"] = geometry.borderStyle;
      if (geometry.messageGap)
        vars["--ds-input-message-gap"] = geometry.messageGap;
      if (geometry.groupGap) vars["--ds-input-group-gap"] = geometry.groupGap;
      if (geometry.groupGapSeparated)
        vars["--ds-input-group-gap-separated"] = geometry.groupGapSeparated;
      if (geometry.groupOverlap)
        vars["--ds-input-group-overlap"] = geometry.groupOverlap;
      if (geometry.groupMinItemWidth)
        vars["--ds-input-group-min-item-width"] = geometry.groupMinItemWidth;
      if (geometry.formFieldGap)
        vars["--ds-form-field-gap"] = geometry.formFieldGap;
      if (geometry.horizontalGap)
        vars["--ds-form-field-horizontal-gap"] = geometry.horizontalGap;
      if (geometry.labelOffsetY)
        vars["--ds-form-field-label-offset-y"] = geometry.labelOffsetY;
      if (geometry.requiredGap)
        vars["--ds-form-field-required-gap"] = geometry.requiredGap;
      if (geometry.formFieldDisabledOpacity != null)
        vars["--ds-form-field-disabled-opacity"] = String(
          geometry.formFieldDisabledOpacity
        );
      if (geometry.labelFontSize)
        vars["--ds-input-label-font-size"] = geometry.labelFontSize;
      if (geometry.labelFontWeight != null)
        vars["--ds-input-label-font-weight"] = String(geometry.labelFontWeight);
      if (geometry.labelFontFamily)
        vars["--ds-input-label-font-family"] = geometry.labelFontFamily;
      if (geometry.labelLetterSpacing)
        vars["--ds-input-label-letter-spacing"] = geometry.labelLetterSpacing;
      if (geometry.labelLineHeight)
        vars["--ds-input-label-line-height"] = geometry.labelLineHeight;
      if (geometry.helperFontSize)
        vars["--ds-input-helper-font-size"] = geometry.helperFontSize;
      if (geometry.helperLineHeight)
        vars["--ds-input-helper-line-height"] = geometry.helperLineHeight;
      if (geometry.affixSize)
        vars["--ds-input-affix-size"] = geometry.affixSize;
      if (geometry.affixSizeCompact)
        vars["--ds-input-affix-size-compact"] = geometry.affixSizeCompact;
      if (geometry.affixRadius)
        vars["--ds-input-affix-radius"] = geometry.affixRadius;
      if (geometry.actionSize)
        vars["--ds-input-action-size"] = geometry.actionSize;
      if (geometry.actionRadius)
        vars["--ds-input-action-radius"] = geometry.actionRadius;
      if (geometry.touchTargetMin)
        vars["--ds-input-touch-target-min"] = geometry.touchTargetMin;
      if (geometry.loadingSize)
        vars["--ds-input-loading-size"] = geometry.loadingSize;
      if (geometry.loadingStroke)
        vars["--ds-input-loading-stroke"] = geometry.loadingStroke;
      if (geometry.loadingDuration)
        vars["--ds-input-loading-duration"] = geometry.loadingDuration;
      if (geometry.textareaMinHeight)
        vars["--ds-textarea-min-height"] = geometry.textareaMinHeight;
      if (geometry.textareaMaxHeight)
        vars["--ds-textarea-max-height"] = geometry.textareaMaxHeight;
      if (geometry.textareaPaddingX)
        vars["--ds-textarea-padding-x"] = geometry.textareaPaddingX;
      if (geometry.textareaPaddingY)
        vars["--ds-textarea-padding-y"] = geometry.textareaPaddingY;
      if (geometry.textareaRadius)
        vars["--ds-textarea-radius"] = geometry.textareaRadius;
      if (geometry.textareaResize)
        vars["--ds-textarea-resize"] = geometry.textareaResize;
      if (geometry.transitionDuration)
        vars["--ds-input-transition-duration"] = geometry.transitionDuration;
      if (geometry.transitionTiming)
        vars["--ds-input-transition-timing"] = geometry.transitionTiming;
    }
  }
}

function setSegmentedVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.controls) {
    const c = chrome.controls;
    if (c.segmented) {
      const segmented = c.segmented;
      if (segmented.bg) vars["--ds-segmented-bg"] = segmented.bg;
      if (segmented.border) vars["--ds-segmented-border"] = segmented.border;
      if (segmented.radius) vars["--ds-segmented-radius"] = segmented.radius;
      if (segmented.padding) vars["--ds-segmented-padding"] = segmented.padding;
      if (segmented.gap) vars["--ds-segmented-gap"] = segmented.gap;
      if (segmented.shadow) vars["--ds-segmented-shadow"] = segmented.shadow;
      if (segmented.itemBg) vars["--ds-segmented-item-bg"] = segmented.itemBg;
      if (segmented.itemBgHover)
        vars["--ds-segmented-item-bg-hover"] = segmented.itemBgHover;
      if (segmented.itemBgSelected)
        vars["--ds-segmented-item-bg-selected"] = segmented.itemBgSelected;
      if (segmented.itemColor)
        vars["--ds-segmented-item-color"] = segmented.itemColor;
      if (segmented.itemColorHover)
        vars["--ds-segmented-item-color-hover"] = segmented.itemColorHover;
      if (segmented.itemColorSelected)
        vars["--ds-segmented-item-color-selected"] =
          segmented.itemColorSelected;
      if (segmented.itemRadius)
        vars["--ds-segmented-item-radius"] = segmented.itemRadius;
      if (segmented.itemFontWeight != null)
        vars["--ds-segmented-item-font-weight"] = String(
          segmented.itemFontWeight
        );
      if (segmented.itemFontWeightSelected != null)
        vars["--ds-segmented-item-font-weight-selected"] = String(
          segmented.itemFontWeightSelected
        );
    }
  }
}

function setControlStateVars(
  vars: Record<string, string>,
  chrome: BrandChrome
): void {
  if (chrome.controls) {
    const c = chrome.controls;
    if (c.focusRing) vars["--ds-button-focus-ring"] = c.focusRing;
    if (c.focusRingColor) vars["--ds-focus-ring-color"] = c.focusRingColor;

    if (c.disabled) {
      if (c.disabled.opacity != null)
        vars["--ds-button-disabled-opacity"] = String(c.disabled.opacity);
      if (c.disabled.bg) vars["--ds-button-disabled-bg"] = c.disabled.bg;
      if (c.disabled.text) vars["--ds-button-disabled-color"] = c.disabled.text;
      if (c.disabled.border)
        vars["--ds-button-disabled-border"] = c.disabled.border;
      if (c.disabled.borderColor)
        vars["--ds-button-disabled-border-color"] = c.disabled.borderColor;
      // Input disabled mirrors
      if (c.disabled.bg) vars["--ds-input-bg-disabled"] = c.disabled.bg;
      if (c.disabled.text) vars["--ds-input-color-disabled"] = c.disabled.text;
      if (c.disabled.border)
        vars["--ds-input-border-disabled"] = c.disabled.border;
      if (c.disabled.borderColor)
        vars["--ds-input-border-color-disabled"] = c.disabled.borderColor;
      if (c.disabled.opacity != null)
        vars["--ds-input-disabled-opacity"] = String(c.disabled.opacity);
    }
  }
}

export {
  setControlLeadVars,
  setButtonGeometryLeadVars,
  setButtonGeometryTailVars,
  setFieldGeometryVars,
  setSegmentedVars,
  setControlStateVars,
};
