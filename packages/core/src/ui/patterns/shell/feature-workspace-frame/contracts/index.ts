/**
 * @fileoverview Public contract for FeatureWorkspaceFrame.
 *
 * The frame owns only feature-level placement: responsive gutters, the
 * navigation lane, a stable content boundary, and width constraints. Product
 * surfaces keep ownership of their information architecture and paint.
 */

import type { ReactNode } from "react";
import type { PatternBaseProps } from "../../../../../foundation/contracts/runtime/components/patterns/core";

/** Supported feature-workspace width presets. */
export type FeatureWorkspaceFrameWidth = "fluid" | "wide" | "content";

export interface FeatureWorkspaceFrameProps extends PatternBaseProps {
  /** Main feature content. */
  children: ReactNode;
  /** Optional feature-level navigation rendered before the content lane. */
  navigation?: ReactNode;
  /** Accessible label for the workspace region. */
  ariaLabel?: string;
  /**
   * Width policy for the frame. Each preset resolves through overridable DS
   * custom properties, so verticals and tenant themes can tune it without
   * replacing the component.
   * @default 'fluid'
   */
  width?: FeatureWorkspaceFrameWidth;
  /** Keep feature navigation visible below the host application's top chrome. */
  stickyNavigation?: boolean;
}
