'use client';

/**
 * @fileoverview AntdConfigProvider - Rottay Design System
 * @description Seeds Ant Design's ConfigProvider from the COMPILED engine
 * projection when the active engine is `classic`. For every other engine this
 * component is a transparent passthrough (renders children only).
 *
 * @remarks
 * - **hashPriority: 'low'** makes antd CSS-in-JS emit `:where()` selectors,
 *   giving them 0 specificity so DS CSS layers always win.
 * - **Seeds** are the classic adapter's projection of the same compile that
 *   produced the mounted artifact. Nothing is read off the live cascade, and
 *   tenant branding fields do not outrank the compiled channels: a second
 *   visual authority above the artifact is the exact defect this bridge exists
 *   to remove.
 * - **The mode** is selected from the compiled mode blocks by the resolved
 *   root mode, not by substring-matching a tenant theme name.
 *
 * @see {@link useEngineContext} - Engine context hook
 * @see {@link useEngineVisualDeclaration} - The compiled projection
 * @module System/Providers/AntdConfig
 * @category System
 * @package @rottay/design-system
 */

import React, { useMemo, type ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { useEngineContext } from '../../../composition/react/provider';
import { useRequiredEngineVisualDeclaration } from '@/infrastructure/runtime/foundation/engine-visual';
import { useThemeContext } from '../../../../theming/composition/react/provider';
import type { ThemeContextValue } from '@/foundation/contracts';
import type {
  EngineSeeds,
  EngineVisualDeclaration,
} from '@/foundation/contracts/composition/tenants/themes/engine-adapter';

export interface AntdConfigProviderProps {
  children: ReactNode;
}

export function AntdConfigProvider({
  children,
}: AntdConfigProviderProps): React.ReactElement {
  const { engine } = useEngineContext();
  if (engine !== 'classic') return <>{children}</>;
  return <ClassicAntdConfig>{children}</ClassicAntdConfig>;
}

/**
 * Split from the passthrough above so the required-declaration hook and the
 * theme context are only read when classic actually renders: a modern or
 * rustic tree must not be able to fail on a projection it never uses.
 */
/**
 * The whole decision, as data: which compiled block answers this mode and which
 * antd algorithm goes with it. Exported so the selection is testable exactly,
 * rather than inferred from tokens antd has already derived.
 */
export function selectAntdTheme(
  declaration: EngineVisualDeclaration,
  resolvedTheme: ThemeContextValue['resolvedTheme'],
): { hashPriority: 'low'; algorithm: typeof antdTheme.darkAlgorithm; token: EngineSeeds } {
  // `base` means "the mode this compile's base block IS", which is exactly what
  // the compiler recorded as `colorScheme`.
  const mode = resolvedTheme === 'base' ? declaration.colorScheme : resolvedTheme;
  // A mode the compile emitted no block for overrides nothing, so the base
  // seeds are its resolved values — the same answer the cascade gives.
  const block = declaration.projection.modes.find((entry) => entry.mode === mode);
  return {
    hashPriority: 'low',
    algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: { ...declaration.projection.seeds, ...(block?.seeds ?? {}) },
  };
}

function ClassicAntdConfig({ children }: AntdConfigProviderProps): React.ReactElement {
  const declaration = useRequiredEngineVisualDeclaration('classic');
  const { resolvedTheme } = useThemeContext();
  const antdThemeConfig = useMemo(
    () => selectAntdTheme(declaration, resolvedTheme),
    [declaration, resolvedTheme],
  );

  return <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>;
}
