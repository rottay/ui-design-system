/**
 * The density type identities, as compile-time assertions. This file is compiled by the
 * density-identity sentinel under its own tsconfig; each line is an error if its identity breaks.
 */
import type {
  ActionDockProps,
  DensityPosture,
  MarkdownViewProps,
  PopoverProps,
  TooltipProps,
  VerticalManifest,
} from '@rottay/design-system';
import type { DensityMode } from '@rottay/design-system/server';

/** Mutual, not structural-assignability, equality: `any`, unions and optionality all count. */
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

export const verticalManifestDensity: Equals<VerticalManifest['density'], DensityPosture> = true;
export const tooltipDensity: Equals<TooltipProps['density'], DensityPosture | undefined> = true;
export const popoverDensity: Equals<PopoverProps['density'], DensityPosture | undefined> = true;
export const actionDockDensity: Equals<ActionDockProps['density'], DensityPosture | undefined> = true;
export const markdownViewDensity: Equals<MarkdownViewProps['density'], Exclude<DensityPosture, 'spacious'> | undefined> = true;
export const densityPostureLiterals: Equals<DensityPosture, 'compact' | 'comfortable' | 'spacious'> = true;
export const densityModeLiterals: Equals<DensityMode, 'compact' | 'normal' | 'spacious'> = true;
