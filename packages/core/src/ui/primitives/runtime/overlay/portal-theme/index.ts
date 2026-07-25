import type { CSSProperties } from 'react';

export type DsPortalVariableStyle = CSSProperties &
  Partial<Record<`--ds-${string}`, string>>;

/**
 * Snapshots the resolved DS custom-property scope before an overlay is moved
 * into a document-level portal. Only `--ds-*` variables cross the boundary;
 * component paint remains owned by the destination engine skin.
 */
export function readDsPortalVariables(
  anchor: HTMLElement,
): DsPortalVariableStyle {
  const variables: Array<[`--ds-${string}`, string]> = [];
  const collect = (declaration: CSSStyleDeclaration): void => {
    if (typeof declaration.length !== 'number') return;
    for (let index = 0; index < declaration.length; index += 1) {
      const name = declaration.item(index);
      if (!name.startsWith('--ds-')) continue;
      const value = declaration.getPropertyValue(name).trim();
      if (value) variables.push([name as `--ds-${string}`, value]);
    }
  };

  const lineage: HTMLElement[] = [];
  let owner: HTMLElement | null = anchor;
  while (owner) {
    lineage.unshift(owner);
    owner = owner.parentElement;
  }
  for (const element of lineage) collect(element.style);
  collect(window.getComputedStyle(anchor));

  return Object.fromEntries(variables) as DsPortalVariableStyle;
}
