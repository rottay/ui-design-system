"use client";

/**
 * @fileoverview Layout icons - views, grids, calendars, alignment
 */

import { ListIcon as List } from "@phosphor-icons/react/dist/ssr/List";
import { CalendarIcon as Calendar } from "@phosphor-icons/react/dist/ssr/Calendar";
import { CalendarCheckIcon as CalendarCheck } from "@phosphor-icons/react/dist/ssr/CalendarCheck";
import { CalendarPlusIcon as CalendarPlus } from "@phosphor-icons/react/dist/ssr/CalendarPlus";
import { AlignLeftIcon as AlignLeft } from "@phosphor-icons/react/dist/ssr/AlignLeft";
import { KanbanIcon as Kanban } from "@phosphor-icons/react/dist/ssr/Kanban";
import { LayoutIcon as Layout } from "@phosphor-icons/react/dist/ssr/Layout";
import { GridFourIcon as LayoutGrid } from "@phosphor-icons/react/dist/ssr/GridFour";
import { GridNineIcon as Grid3x3 } from "@phosphor-icons/react/dist/ssr/GridNine";
import { ColumnsIcon as Columns3 } from "@phosphor-icons/react/dist/ssr/Columns";
import { CalendarDotsIcon as CalendarClock } from "@phosphor-icons/react/dist/ssr/CalendarDots";
import { CalendarBlankIcon as CalendarDays } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { TextAlignJustifyIcon as AlignJustify } from "@phosphor-icons/react/dist/ssr/TextAlignJustify";
import { TextAlignCenterIcon as AlignCenter } from "@phosphor-icons/react/dist/ssr/TextAlignCenter";
import { LayoutIcon as LayoutTemplate } from "@phosphor-icons/react/dist/ssr/Layout";
import { createPhosphorCompatibilityIcon } from "../../../runtime/factory/phosphor-compat";

export const ListIcon = createPhosphorCompatibilityIcon(List, "ListIcon");
export const LayoutGridIcon = createPhosphorCompatibilityIcon(
  LayoutGrid,
  "LayoutGridIcon"
);
export const Grid3x3Icon = createPhosphorCompatibilityIcon(
  Grid3x3,
  "Grid3x3Icon"
);
export const Columns3Icon = createPhosphorCompatibilityIcon(
  Columns3,
  "Columns3Icon"
);
export const CalendarIcon = createPhosphorCompatibilityIcon(
  Calendar,
  "CalendarIcon"
);
export const CalendarDaysIcon = createPhosphorCompatibilityIcon(
  CalendarDays,
  "CalendarDaysIcon"
);
export const AlignJustifyIcon = createPhosphorCompatibilityIcon(
  AlignJustify,
  "AlignJustifyIcon"
);
export const AlignCenterIcon = createPhosphorCompatibilityIcon(
  AlignCenter,
  "AlignCenterIcon"
);
export const AlignLeftIcon = createPhosphorCompatibilityIcon(
  AlignLeft,
  "AlignLeftIcon"
);
export const LayoutTemplateIcon = createPhosphorCompatibilityIcon(
  LayoutTemplate,
  "LayoutTemplateIcon"
);
export const CalendarCheckIcon = createPhosphorCompatibilityIcon(
  CalendarCheck,
  "CalendarCheckIcon"
);
export const CalendarClockIcon = createPhosphorCompatibilityIcon(
  CalendarClock,
  "CalendarClockIcon"
);
export const CalendarPlusIcon = createPhosphorCompatibilityIcon(
  CalendarPlus,
  "CalendarPlusIcon"
);
export const KanbanIcon = createPhosphorCompatibilityIcon(Kanban, "KanbanIcon");
export const LayoutIcon = createPhosphorCompatibilityIcon(Layout, "LayoutIcon");
