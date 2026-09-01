export interface DialogAttributeValues {
  id?: string;
  dataTestId?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const nativeLabelledBy = new WeakMap<HTMLElement, string | null>();

/** Synchronizes DS base attributes onto a third-party component's real dialog node. */
export function syncDialogAttributes(
  element: HTMLElement | null,
  values: DialogAttributeValues,
): void {
  if (!element) return;
  if (values.id == null) element.removeAttribute('id');
  else element.id = values.id;

  if (values.dataTestId == null) element.removeAttribute('data-testid');
  else element.setAttribute('data-testid', values.dataTestId);

  if (values.ariaLabel == null) element.removeAttribute('aria-label');
  else element.setAttribute('aria-label', values.ariaLabel);

  if (values.ariaLabel != null) {
    const currentLabelledBy = element.getAttribute('aria-labelledby');
    if (currentLabelledBy != null || !nativeLabelledBy.has(element)) {
      nativeLabelledBy.set(element, currentLabelledBy);
    }
    element.removeAttribute('aria-labelledby');
  } else if (nativeLabelledBy.has(element)) {
    const rememberedLabelledBy = nativeLabelledBy.get(element);
    if (rememberedLabelledBy != null) {
      element.setAttribute('aria-labelledby', rememberedLabelledBy);
    }
    nativeLabelledBy.delete(element);
  }

  if (values.ariaDescribedBy == null) element.removeAttribute('aria-describedby');
  else element.setAttribute('aria-describedby', values.ariaDescribedBy);
}
