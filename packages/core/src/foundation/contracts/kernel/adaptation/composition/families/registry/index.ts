/**
 * @fileoverview The layout-sensitive families: every family whose layout
 * depends on space, and therefore must accept `adapt` and stamp
 * `data-posture`.
 *
 * `LAYOUT_SENSITIVE_FAMILIES` is an array literal on purpose: the `adapt-slot`
 * gate reads it with the TypeScript AST, so a computed row would be invisible
 * to the gate. `cut` names the family-cut work order that owns adoption.
 *
 * @module Contracts/Kernel/Adaptation/Families/Registry
 * @category Types
 * @package @rottay/design-system
 */

export interface LayoutSensitiveFamily {
  readonly family: string;
  /** The family's single source owner, package-relative. */
  readonly owner: string;
  readonly layoutSensitive: true;
  readonly cut: string;
}

export const LAYOUT_SENSITIVE_FAMILIES = Object.freeze([
  {
    family: 'data-table',
    owner: 'src/components/patterns/data/data-table',
    layoutSensitive: true,
    cut: 'WO-FAM-08',
  },
  {
    family: 'card',
    owner: 'src/components/primitives/display/card',
    layoutSensitive: true,
    cut: 'WO-FAM-06',
  },
  {
    family: 'grid',
    owner: 'src/components/primitives/layout/grid',
    layoutSensitive: true,
    cut: 'WO-FAM-07',
  },
  {
    family: 'form',
    owner: 'src/components/primitives/inputs/form',
    layoutSensitive: true,
    cut: 'WO-FAM-02',
  },
  {
    family: 'app-shell',
    owner: 'src/components/structures/shell/app-shell',
    layoutSensitive: true,
    cut: 'WO-FAM-11',
  },
  {
    family: 'modal',
    owner: 'src/components/primitives/feedback/modal',
    layoutSensitive: true,
    cut: 'WO-FAM-04',
  },
  {
    family: 'drawer',
    owner: 'src/components/primitives/feedback/drawer',
    layoutSensitive: true,
    cut: 'WO-FAM-04',
  },
  {
    family: 'sheet',
    owner: 'src/components/primitives/overlay/sheet',
    layoutSensitive: true,
    cut: 'WO-FAM-04',
  },
  {
    family: 'charts',
    owner: 'src/components/patterns/visualization/charts',
    layoutSensitive: true,
    cut: 'WO-FAM-09',
  },
  {
    family: 'sidebar-surface',
    owner: 'src/components/structures/shell/navigation/sidebar-surface',
    layoutSensitive: true,
    cut: 'WO-FAM-05',
  },
] as const satisfies readonly LayoutSensitiveFamily[]);

export type LayoutSensitiveFamilyId = (typeof LAYOUT_SENSITIVE_FAMILIES)[number]['family'];
