"use client";

/**
 * @fileoverview Status icons - checks, alerts, loading indicators
 */

import { CheckIcon as Check } from "@phosphor-icons/react/dist/ssr/Check";
import { CheckCircleIcon as CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { XIcon as X } from "@phosphor-icons/react/dist/ssr/X";
import { XCircleIcon as XCircle } from "@phosphor-icons/react/dist/ssr/XCircle";
import { InfoIcon as Info } from "@phosphor-icons/react/dist/ssr/Info";
import { CircleDashedIcon as CircleDashed } from "@phosphor-icons/react/dist/ssr/CircleDashed";
import { CheckCircleIcon as CheckCircle2 } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { WarningCircleIcon as AlertCircle } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { WarningIcon as AlertTriangle } from "@phosphor-icons/react/dist/ssr/Warning";
import { WarningOctagonIcon as AlertOctagon } from "@phosphor-icons/react/dist/ssr/WarningOctagon";
import { ProhibitIcon as Ban } from "@phosphor-icons/react/dist/ssr/Prohibit";
import { QuestionIcon as HelpCircle } from "@phosphor-icons/react/dist/ssr/Question";
import { CircleNotchIcon as LoaderCircle } from "@phosphor-icons/react/dist/ssr/CircleNotch";
import { WarningCircleIcon as CircleAlert } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { CurrencyCircleDollarIcon as CircleDollarSign } from "@phosphor-icons/react/dist/ssr/CurrencyCircleDollar";
import { MagnifyingGlassMinusIcon as SearchX } from "@phosphor-icons/react/dist/ssr/MagnifyingGlassMinus";
import { ShieldWarningIcon as ShieldAlert } from "@phosphor-icons/react/dist/ssr/ShieldWarning";
import { ShieldSlashIcon as ShieldOff } from "@phosphor-icons/react/dist/ssr/ShieldSlash";
import { ShieldSlashIcon as ShieldX } from "@phosphor-icons/react/dist/ssr/ShieldSlash";
import { DotOutlineIcon as CircleDot } from "@phosphor-icons/react/dist/ssr/DotOutline";
import { createPhosphorCompatibilityIcon } from "../../../runtime/factory/phosphor-compat";

export const CheckIcon = createPhosphorCompatibilityIcon(Check, "CheckIcon");
export const CheckCircleIcon = createPhosphorCompatibilityIcon(
  CheckCircle,
  "CheckCircleIcon"
);
export const CheckCircle2Icon = createPhosphorCompatibilityIcon(
  CheckCircle2,
  "CheckCircle2Icon"
);
export const XIcon = createPhosphorCompatibilityIcon(X, "XIcon");
export const XCircleIcon = createPhosphorCompatibilityIcon(
  XCircle,
  "XCircleIcon"
);
export const AlertCircleIcon = createPhosphorCompatibilityIcon(
  AlertCircle,
  "AlertCircleIcon"
);
export const AlertTriangleIcon = createPhosphorCompatibilityIcon(
  AlertTriangle,
  "AlertTriangleIcon"
);
export const AlertOctagonIcon = createPhosphorCompatibilityIcon(
  AlertOctagon,
  "AlertOctagonIcon"
);
export const InfoIcon = createPhosphorCompatibilityIcon(Info, "InfoIcon");
export const BanIcon = createPhosphorCompatibilityIcon(Ban, "BanIcon");
export const LoaderCircleIcon = createPhosphorCompatibilityIcon(
  LoaderCircle,
  "LoaderCircleIcon"
);
export const CircleAlertIcon = createPhosphorCompatibilityIcon(
  CircleAlert,
  "CircleAlertIcon"
);
export const CircleDollarSignIcon = createPhosphorCompatibilityIcon(
  CircleDollarSign,
  "CircleDollarSignIcon"
);
export const HelpCircleIcon = createPhosphorCompatibilityIcon(
  HelpCircle,
  "HelpCircleIcon"
);
export const SearchXIcon = createPhosphorCompatibilityIcon(
  SearchX,
  "SearchXIcon"
);
export const ShieldAlertIcon = createPhosphorCompatibilityIcon(
  ShieldAlert,
  "ShieldAlertIcon"
);
export const ShieldOffIcon = createPhosphorCompatibilityIcon(
  ShieldOff,
  "ShieldOffIcon"
);
export const ShieldXIcon = createPhosphorCompatibilityIcon(
  ShieldX,
  "ShieldXIcon"
);
export const CircleDashedIcon = createPhosphorCompatibilityIcon(
  CircleDashed,
  "CircleDashedIcon"
);
export const CircleDotIcon = createPhosphorCompatibilityIcon(
  CircleDot,
  "CircleDotIcon"
);
