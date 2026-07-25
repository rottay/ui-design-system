/** Contracts for the reusable, user-owned widget board. */

import type { ReactNode } from "react";
import type { PatternBaseProps } from "../../../../../foundation/contracts/runtime/components/patterns/core";

export type WidgetBoardSize = "sm" | "md" | "lg" | "wide";

export interface WidgetBoardHeader {
  /** Compact semantic role label, usually rendered with the mono tenant face. */
  eyebrow?: ReactNode;
  /** Decorative or semantic DS icon supplied by the consumer. */
  icon?: ReactNode;
  /** Optional explanatory line below the widget title. */
  supporting?: ReactNode;
  /** Status, freshness or action affordance aligned opposite the title. */
  accessory?: ReactNode;
}

/** Product-facing metadata used when a widget is offered in the add catalog. */
export interface WidgetBoardCatalogEntry {
  /** Short, outcome-oriented explanation of why this widget is useful. */
  description?: ReactNode;
  /** Optional semantic icon. Falls back to the widget header icon. */
  icon?: ReactNode;
  /** Optional grouping label such as "Pipeline" or "Intelligence". */
  category?: ReactNode;
  /** Honest miniature signal, metric or content preview. */
  preview?: ReactNode;
  /** Highlights a role-recommended widget without changing its behavior. */
  recommended?: boolean;
}

export interface WidgetBoardItem {
  id: string;
  /** Plain-text label used by edit-mode accessibility controls. */
  accessibleTitle: string;
  title: ReactNode;
  /** Standardized premium header chrome. Omit for fully custom content. */
  header?: WidgetBoardHeader;
  /** Rich metadata for the add-widget catalog. */
  catalog?: WidgetBoardCatalogEntry;
  content: ReactNode;
  size: WidgetBoardSize;
  /** Optional user-owned physical height in CSS pixels. Omit for intrinsic height. */
  height?: number;
  order: number;
  visible: boolean;
}

export interface WidgetBoardLabels {
  /** Optional localized context shown above the board heading. */
  context?: string;
  /** Optional localized board heading. */
  heading?: string;
  customize: string;
  done: string;
  addWidget: string;
  reset: string;
  emptyCatalog: string;
  editHint: string;
  readHint: string;
  move: string;
  resize: string;
  /** Optional localized labels for the independent border resize axes. */
  resizeWidth?: string;
  resizeHeight?: string;
  autoHeight?: string;
  remove: string;
  /** Optional catalog heading and guidance. */
  catalogHeading?: string;
  catalogDescription?: string;
  /** Optional localized recommendation marker. */
  recommended?: string;
  /** Localized names for the four responsive width presets. */
  sizeNames?: Partial<Record<WidgetBoardSize, string>>;
}

export interface WidgetBoardProps extends PatternBaseProps {
  items: WidgetBoardItem[];
  labels: WidgetBoardLabels;
  editable?: boolean;
  defaultEditing?: boolean;
  /** Opens the catalog initially in editable demos, tests, or guided onboarding. */
  defaultCatalogOpen?: boolean;
  narrow?: boolean;
  /** Called after reorder, resize, add, remove or reset. */
  onItemsChange?: (items: WidgetBoardItem[]) => void;
  /** Optional app-owned role default. */
  onReset?: () => WidgetBoardItem[] | void;
  emptyState?: ReactNode;
}
