import { useEffect } from 'react';

type InertElement = HTMLElement & { inert?: boolean };

type InertSnapshot = {
  count: number;
  ariaHidden: string | null;
  inert: boolean;
};

const inertRegistry = new Map<HTMLElement, InertSnapshot>();

function shouldSkipElement(element: HTMLElement): boolean {
  return (
    element.id === 'rottay-portal-root' ||
    element.getAttribute('data-rottay-portal') === 'true'
  );
}

function retainInert(element: HTMLElement) {
  const existing = inertRegistry.get(element);
  if (existing) {
    existing.count += 1;
    return;
  }

  const inertElement = element as InertElement;
  inertRegistry.set(element, {
    count: 1,
    ariaHidden: element.getAttribute('aria-hidden'),
    inert: Boolean(inertElement.inert),
  });

  element.setAttribute('aria-hidden', 'true');
  inertElement.inert = true;
}

function releaseInert(element: HTMLElement) {
  const existing = inertRegistry.get(element);
  if (!existing) return;

  existing.count -= 1;
  if (existing.count > 0) return;

  const inertElement = element as InertElement;
  if (existing.ariaHidden === null) {
    element.removeAttribute('aria-hidden');
  } else {
    element.setAttribute('aria-hidden', existing.ariaHidden);
  }
  inertElement.inert = existing.inert;
  inertRegistry.delete(element);
}

export function useModalInertSiblings(open: boolean) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const elements = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && !shouldSkipElement(element)
    );

    elements.forEach(retainInert);

    return () => {
      elements.forEach(releaseInert);
    };
  }, [open]);
}
