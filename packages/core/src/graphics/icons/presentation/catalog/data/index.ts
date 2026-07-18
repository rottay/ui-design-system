"use client";

/**
 * @fileoverview Data icons - charts, search, filters, databases
 */

import { DatabaseIcon as Database } from "@phosphor-icons/react/dist/ssr/Database";
import { SlidersHorizontalIcon as SlidersHorizontal } from "@phosphor-icons/react/dist/ssr/SlidersHorizontal";
import { GlobeIcon as Globe } from "@phosphor-icons/react/dist/ssr/Globe";
import { ChartBarIcon as BarChart3 } from "@phosphor-icons/react/dist/ssr/ChartBar";
import { TrendUpIcon as TrendingUp } from "@phosphor-icons/react/dist/ssr/TrendUp";
import { TrendDownIcon as TrendingDown } from "@phosphor-icons/react/dist/ssr/TrendDown";
import { PulseIcon as Activity } from "@phosphor-icons/react/dist/ssr/Pulse";
import { MagnifyingGlassIcon as Search } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { FunnelIcon as Filter } from "@phosphor-icons/react/dist/ssr/Funnel";
import { FunnelSimpleIcon as ListFilter } from "@phosphor-icons/react/dist/ssr/FunnelSimple";
import { StackIcon as Layers } from "@phosphor-icons/react/dist/ssr/Stack";
import { GlobeHemisphereWestIcon as Globe2 } from "@phosphor-icons/react/dist/ssr/GlobeHemisphereWest";
import { ChartBarIcon as ChartNoAxesColumn } from "@phosphor-icons/react/dist/ssr/ChartBar";
import { ChartLineIcon as LineChart } from "@phosphor-icons/react/dist/ssr/ChartLine";
import { HardDriveIcon as Server } from "@phosphor-icons/react/dist/ssr/HardDrive";
import { createPhosphorCompatibilityIcon } from "../../../runtime/factory/phosphor-compat";

export const BarChart3Icon = createPhosphorCompatibilityIcon(
  BarChart3,
  "BarChart3Icon"
);
export const TrendingUpIcon = createPhosphorCompatibilityIcon(
  TrendingUp,
  "TrendingUpIcon"
);
export const TrendingDownIcon = createPhosphorCompatibilityIcon(
  TrendingDown,
  "TrendingDownIcon"
);
export const ActivityIcon = createPhosphorCompatibilityIcon(
  Activity,
  "ActivityIcon"
);
export const DatabaseIcon = createPhosphorCompatibilityIcon(
  Database,
  "DatabaseIcon"
);
export const SearchIcon = createPhosphorCompatibilityIcon(Search, "SearchIcon");
export const FilterIcon = createPhosphorCompatibilityIcon(Filter, "FilterIcon");
export const SlidersHorizontalIcon = createPhosphorCompatibilityIcon(
  SlidersHorizontal,
  "SlidersHorizontalIcon"
);
export const LayersIcon = createPhosphorCompatibilityIcon(Layers, "LayersIcon");
export const GlobeIcon = createPhosphorCompatibilityIcon(Globe, "GlobeIcon");
export const ChartNoAxesColumnIcon = createPhosphorCompatibilityIcon(
  ChartNoAxesColumn,
  "ChartNoAxesColumnIcon"
);
export const LineChartIcon = createPhosphorCompatibilityIcon(
  LineChart,
  "LineChartIcon"
);
export const ListFilterIcon = createPhosphorCompatibilityIcon(
  ListFilter,
  "ListFilterIcon"
);
export const Globe2Icon = createPhosphorCompatibilityIcon(Globe2, "Globe2Icon");
export const ServerIcon = createPhosphorCompatibilityIcon(Server, "ServerIcon");
