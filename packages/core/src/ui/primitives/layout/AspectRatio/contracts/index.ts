/**
 * @fileoverview AspectRatio Types - Rottay Design System
 * @description Type definitions for the AspectRatio component.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants for the
 * AspectRatio component. These types are shared across all engine implementations.
 *
 * @module AspectRatioTypes
 * @category Layout
 * @package @rottay/design-system
 */

import type {
  BaseComponentProps,
  EngineAwareProps,
} from "../../../../../foundation/contracts";
import type { AriaRole, ReactNode } from "react";

export type AspectRatioPreset =
  | "1/1"
  | "4/3"
  | "16/9"
  | "21/9"
  | "3/2"
  | "2/3"
  | "9/16";

export interface AspectRatioProps extends BaseComponentProps, EngineAwareProps {
  /** Aspect ratio as a number (width / height). Default is 16/9. */
  ratio?: number;
  /** Children content to render inside the aspect ratio container */
  children?: ReactNode;
  /** Max width of the container */
  maxWidth?: string | number;
  /** Optional semantic role forwarded to the root media frame. */
  role?: AriaRole;
  /** BCP 47 language metadata for localized descendants. */
  lang?: string;
  /** Logical reading direction inherited by descendants. */
  dir?: "ltr" | "rtl" | "auto";
}

export const RATIO_PRESETS: Record<AspectRatioPreset, number> = {
  "1/1": 1,
  "4/3": 4 / 3,
  "16/9": 16 / 9,
  "21/9": 21 / 9,
  "3/2": 3 / 2,
  "2/3": 2 / 3,
  "9/16": 9 / 16,
};

export const ASPECT_RATIO_DEFAULTS = {
  ratio: 16 / 9,
};
