/**
 * @fileoverview The `prefers-contrast: more` delta: the compile re-lowered at high posture.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/contrast
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type {
  ThemeCompilationContrastBlock,
  ThemeCompilationModeBlock,
} from "@/foundation/contracts/composition/tenants/themes/compiled";

/** The posture a viewer who asks for more contrast receives. */
export const PREFERRED_CONTRAST_POSTURE = "high" as const;

/** `theme` with its palette moved to the preferred posture. */
export function atPreferredContrast<T extends Partial<FlatTheme>>(theme: T): T {
  if (!theme.palette) return theme;
  return { ...theme, palette: { ...theme.palette, contrastPosture: PREFERRED_CONTRAST_POSTURE } };
}

/** A compile already resting at the preferred posture has nothing to state. */
export function restsAtPreferredContrast(theme: FlatTheme): boolean {
  return theme.palette?.contrastPosture === PREFERRED_CONTRAST_POSTURE;
}

function movedAgainst(
  target: Readonly<Record<string, string>>,
  applied: Readonly<Record<string, string>>,
  state: string
): Record<string, string> {
  for (const key of Object.keys(applied)) {
    if (!(key in target)) {
      throw new Error(
        `contrast posture: the high posture drops ${key} in the ${state} block; a media delta can restate a channel, never remove one`
      );
    }
  }
  const moved: Record<string, string> = {};
  for (const [key, value] of Object.entries(target)) {
    if (applied[key] !== value) moved[key] = value;
  }
  return moved;
}

/**
 * Each delta is measured against what already applies in its state: a mode rule
 * outranks the base delta, so a mode resolves as rest + base delta + mode + its delta.
 */
export function projectContrastBlocks(
  rest: {
    readonly cssVariables: Readonly<Record<string, string>>;
    readonly modeBlocks: readonly ThemeCompilationModeBlock[];
  },
  high: {
    readonly cssVariables: Readonly<Record<string, string>>;
    readonly modeBlocks: readonly ThemeCompilationModeBlock[];
  }
): ThemeCompilationContrastBlock[] {
  const base = movedAgainst(high.cssVariables, rest.cssVariables, "base");
  const blocks: ThemeCompilationContrastBlock[] =
    Object.keys(base).length > 0 ? [{ cssVariables: base }] : [];
  const modes = [
    ...new Set([...rest.modeBlocks, ...high.modeBlocks].map((block) => block.mode)),
  ];
  for (const mode of modes) {
    const restMode = rest.modeBlocks.find((block) => block.mode === mode);
    const highMode = high.modeBlocks.find((block) => block.mode === mode);
    const moved = movedAgainst(
      { ...high.cssVariables, ...highMode?.cssVariables },
      { ...rest.cssVariables, ...base, ...restMode?.cssVariables },
      mode
    );
    if (Object.keys(moved).length > 0) blocks.push({ mode, cssVariables: moved });
  }
  return blocks;
}
