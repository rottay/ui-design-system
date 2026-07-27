/**
 * @fileoverview Theming - Rottay Design System
 * @description Public barrel for runtime theming. Exports the `ThemeProvider`,
 * `ThemeContext`, `useTheme`, and `useThemeContext` so consumers can discover
 * the full theming API from a single import path.
 *
 * @module System/Theming
 * @category System
 * @package @rottay/design-system
 */
export {
  ThemeProvider,
  ThemeContext,
  useThemeContext,
} from '../composition/react/provider';
export type { ThemeProviderProps, VisualAuthority } from '../composition/react/provider';
export type { ThemeConfig, ThemeContextValue } from '../composition/react/provider';

export { useTheme, useThemeContext as useThemeContextAlias } from '../composition/react/provider/theme';

export {
  useTokens,
  useOptionalTokens,
  useColorTokens,
  useSpacingTokens,
  useMotionTokens,
  useTypographyTokens,
  useCardTokens,
  useAccentTokens,
  getEngineTokens,
  ENGINE_TOKENS,
  DEFAULT_PERSONALITY,
} from '../composition/react/tokens';
export type {
  ColorTokens,
  SpacingTokens,
  MotionTokenSlice,
  TypographyTokenSlice,
  CardTokens,
  AccentTokens,
  EngineTokenOverrides,
} from '../composition/react/tokens';

export { SystemCssVariablesBridge } from '../presentation/adapters/react/css-variables-bridge';

export {
  resolveVisualAuthority,
  reportVisualAuthorityConflict,
  resetVisualAuthorityDiagnostics,
  appearanceMatchesArtifact,
} from '../foundation/visual-authority';
export type {
  CompiledArtifactDeclaration,
  ProviderDeclaration,
  RuntimeVisualPayloadCensus,
  VisualAuthorityDeclaration,
  VisualAuthorityInput,
  VisualAuthorityOrigin,
  VisualAuthorityResolution,
} from '../foundation/visual-authority';

export {
  ROTTAY_CASCADE_LAYER_ORDER,
  PERSONALITY_CASCADE_LAYER,
  TENANT_PAINT_IS_UNLAYERED,
} from '../foundation/cascade-layers';
