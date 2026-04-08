'use client';

/**
 * @fileoverview Header action utilities -- shared semantic vocabulary for
 * header / surface action descriptors.
 *
 * @description
 * Pure TypeScript utility module (no React) that defines the action shape
 * shared by the detail-header, edit-header, form-header, and form
 * surface-primitives patterns. Exposes:
 *
 *   - `SharedHeaderActionKind` -- discriminated union of action semantic
 *     kinds (edit, create, delete, save, etc.)
 *   - `SharedHeaderActionDescriptor` -- generic action definition with
 *     label, kind, icon, variant, onClick / href, loading / disabled state
 *   - `inferSharedHeaderActionKind(label)` -- infer the kind from a
 *     human-readable label using English keyword matching
 *   - `resolveSharedHeaderActionIcon(action)` -- resolve a Lucide icon
 *     from the action's kind (or fall back to the explicit `icon`)
 *   - `resolveSharedHeaderActionVariant(action)` -- infer a Button
 *     variant from the action's kind (delete -> error, save/send -> primary)
 *   - `resolveSharedHeaderActionTooltip(action)` -- get the tooltip text
 *     (falls back to label when no explicit tooltip is set)
 *
 * The naming retains the `Shared` prefix for backwards-compatibility with
 * the original app-platform extraction; consumers continue to import the
 * exact same symbol names from `@rottay/design-system`.
 *
 * @module @rottay/design-system/patterns/header-actions
 */

import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  CalendarClock,
  Copy,
  GitCompareArrows,
  PencilLine,
  Plus,
  Power,
  RefreshCw,
  Save,
  Send,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';

export type SharedHeaderActionKind =
  | 'edit'
  | 'create'
  | 'assign'
  | 'open'
  | 'copy'
  | 'clone'
  | 'delete'
  | 'rotate'
  | 'toggle'
  | 'compare'
  | 'send'
  | 'schedule'
  | 'save'
  | 'cancel'
  | 'settings'
  | 'secondary';

export type SharedHeaderActionVariant = 'primary' | 'secondary' | 'ghost' | 'error';

export interface SharedHeaderActionDescriptor {
  label: string;
  kind?: SharedHeaderActionKind;
  icon?: LucideIcon;
  tooltip?: string;
  variant?: SharedHeaderActionVariant;
  onClick?: () => void;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
}

const ACTION_ICON_MAP: Record<Exclude<SharedHeaderActionKind, 'secondary'>, LucideIcon> = {
  edit: PencilLine,
  create: Plus,
  assign: Plus,
  open: ArrowUpRight,
  copy: Copy,
  clone: Copy,
  delete: Trash2,
  rotate: RefreshCw,
  toggle: Power,
  compare: GitCompareArrows,
  send: Send,
  schedule: CalendarClock,
  save: Save,
  cancel: X,
  settings: Settings2,
};

function includesAny(source: string, needles: string[]) {
  return needles.some((needle) => source.includes(needle));
}

export function inferSharedHeaderActionKind(label: string): SharedHeaderActionKind {
  const normalized = label.trim().toLowerCase();

  if (includesAny(normalized, ['delete', 'remove'])) return 'delete';
  if (includesAny(normalized, ['rotate', 'refresh', 'retry'])) return 'rotate';
  if (includesAny(normalized, ['compare'])) return 'compare';
  if (includesAny(normalized, ['schedule'])) return 'schedule';
  if (includesAny(normalized, ['send', 'deliver'])) return 'send';
  if (includesAny(normalized, ['copy', 'duplicate', 'clone'])) {
    return normalized.includes('clone') || normalized.includes('duplicate') ? 'clone' : 'copy';
  }
  if (includesAny(normalized, ['activate', 'deactivate', 'enable', 'disable'])) return 'toggle';
  if (includesAny(normalized, ['create', 'add', 'new'])) return 'create';
  if (includesAny(normalized, ['assign', 'invite'])) return 'assign';
  if (includesAny(normalized, ['view', 'open', 'details'])) return 'open';
  if (includesAny(normalized, ['edit', 'manage'])) return 'edit';
  if (includesAny(normalized, ['save'])) return 'save';
  if (includesAny(normalized, ['cancel', 'close'])) return 'cancel';
  if (includesAny(normalized, ['settings', 'configure'])) return 'settings';

  return 'secondary';
}

export function resolveSharedHeaderActionIcon(
  action: Pick<SharedHeaderActionDescriptor, 'label' | 'kind' | 'icon'>,
) {
  const kind = action.kind ?? inferSharedHeaderActionKind(action.label);
  if (kind !== 'secondary') {
    return ACTION_ICON_MAP[kind];
  }
  return action.icon;
}

export function resolveSharedHeaderActionTooltip(
  action: Pick<SharedHeaderActionDescriptor, 'label' | 'tooltip'>,
) {
  return action.tooltip || action.label;
}

export function resolveSharedHeaderActionVariant(
  action: Pick<SharedHeaderActionDescriptor, 'label' | 'kind' | 'variant'>,
): SharedHeaderActionVariant {
  if (action.variant) {
    return action.variant;
  }

  const kind = action.kind ?? inferSharedHeaderActionKind(action.label);

  switch (kind) {
    case 'delete':
      return 'error';
    case 'send':
    case 'schedule':
    case 'save':
      return 'primary';
    default:
      return 'secondary';
  }
}
